/**
 * Sparky Helps: live, on-device expression watching.
 *
 * A tiny face detector and a facial-expression model read the live camera picture
 * inside the browser several times a second. Nothing is recorded, saved, or sent:
 * frames stay in the video element and only smoothed readings survive each check.
 * When a child looks upset for a sustained moment, every registered help action
 * runs and the page receives an `upside:sparky-helps` event, so any part of the
 * site can respond. Faces don't always show feelings, so actions should offer
 * help, never decide for the child.
 */

import { useSyncExternalStore } from 'react';
import { pickBackend } from './backend';
import type { FaceApi } from './faceModels';

export type WatchState = 'off' | 'starting' | 'watching' | 'blocked' | 'unsupported' | 'preview' | 'error';

export type Expression = 'happy' | 'neutral' | 'surprised' | 'sad' | 'angry' | 'fearful' | 'disgusted';
export const EXPRESSIONS: Expression[] = ['happy', 'neutral', 'surprised', 'sad', 'angry', 'fearful', 'disgusted'];
/** The expressions that add up to "upset". */
export const UPSET_EXPRESSIONS: Expression[] = ['sad', 'angry', 'fearful', 'disgusted'];

export type Readings = Record<Expression, number>;

/** Where the face sits in the camera picture, as fractions of its width and height. */
export interface FaceBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MoodSnapshot {
  state: WatchState;
  /** A face was found in the latest check. */
  face: boolean;
  /** Smoothed upset score from 0 (calm) to 1 (clearly upset). */
  upset: number;
  /** Smoothed reading for each expression, from 0 to 1. Null until a face has been seen. */
  readings: Readings | null;
  /** The strongest expression while a face is in view. */
  top: Expression | null;
  /** The face in the latest check. */
  box: FaceBox | null;
  /** Width over height of the camera picture. */
  aspect: number;
}

export interface HelpEvent {
  /** The smoothed upset score when help was offered. */
  upset: number;
  at: Date;
}

type HelpAction = (event: HelpEvent) => void;

/** How upset a face must look, after smoothing, before help is considered. */
export const UPSET_THRESHOLD = 0.5;
/** How long the look must last, so a passing frown never triggers help. */
const SUSTAIN_MS = 3000;
/** Quiet time after help is offered, so Sparky never nags. */
const COOLDOWN_MS = 4 * 60_000;
/** Pause between checks. Each check takes a few tens of milliseconds on top. */
const INTERVAL_MS = 120;
/** How quickly the upset score follows the face; slow enough to ignore a blink or a sneeze. */
const UPSET_EASE_MS = 1000;
/** How quickly the live expression readings follow the face; fast enough to feel live. */
const READING_EASE_MS = 300;

const IDLE: MoodSnapshot = { state: 'off', face: false, upset: 0, readings: null, top: null, box: null, aspect: 4 / 3 };

/** The single-file artifact can't bundle the model, so it loads the same package from a CDN. */
const IS_ARTIFACT = import.meta.env.VITE_TARGET === 'artifact';
const CDN = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(script);
  });
}

async function loadFromCdn(): Promise<FaceApi> {
  const global = window as unknown as { faceapi?: FaceApi };
  if (!global.faceapi) await loadScript(`${CDN}dist/face-api.js`);
  const faceapi = global.faceapi;
  if (!faceapi) throw new Error('face-api did not start');
  await pickBackend(faceapi.tf);
  await Promise.all([faceapi.nets.tinyFaceDetector.loadFromUri(`${CDN}model`), faceapi.nets.faceExpressionNet.loadFromUri(`${CDN}model`)]);
  return faceapi;
}

let faceApiPromise: Promise<FaceApi> | null = null;

function loadModels(): Promise<FaceApi> {
  faceApiPromise ??= IS_ARTIFACT ? loadFromCdn() : import('./faceModels').then((m) => m.loadFaceApi());
  faceApiPromise.catch(() => {
    faceApiPromise = null;
  });
  return faceApiPromise;
}

/** The share of a step to move toward a new reading, for readings `dt` milliseconds apart. */
function ease(dt: number, over: number): number {
  return 1 - Math.exp(-dt / over);
}

interface Detection {
  detection: { box: { x: number; y: number; width: number; height: number } };
  expressions: Readings;
}

class MoodWatch {
  private snapshot: MoodSnapshot = IDLE;
  private listeners = new Set<() => void>();
  private actions = new Set<HelpAction>();
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private timer = 0;
  private aboveSince: number | null = null;
  private lastHelp = -Infinity;
  private lastRead = 0;
  private runId = 0;

  getSnapshot = (): MoodSnapshot => this.snapshot;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Registers something to do when a child looks upset. Returns an unregister function. */
  onHelp(action: HelpAction): () => void {
    this.actions.add(action);
    return () => this.actions.delete(action);
  }

  /** The live camera stream, for on-screen views while watching. */
  get mediaStream(): MediaStream | null {
    return this.stream;
  }

  private set(patch: Partial<MoodSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((l) => l());
  }

  async start(): Promise<void> {
    if (this.snapshot.state === 'starting' || this.snapshot.state === 'watching') return;
    if (!navigator.mediaDevices?.getUserMedia) {
      this.set({ state: IS_ARTIFACT ? 'preview' : 'unsupported' });
      return;
    }
    const run = ++this.runId;
    this.set({ ...IDLE, state: 'starting' });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      if (run !== this.runId) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      this.stream = stream;
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await video.play();
      this.video = video;
      this.set({ aspect: video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 4 / 3 });
    } catch (error) {
      if (run !== this.runId) return;
      this.releaseCamera();
      const name = (error as DOMException)?.name;
      // An embedded preview may not be allowed the camera at all; point to the full app instead.
      if (IS_ARTIFACT) this.set({ state: 'preview' });
      else this.set({ state: name === 'NotAllowedError' || name === 'SecurityError' ? 'blocked' : 'unsupported' });
      return;
    }
    try {
      const faceapi = await loadModels();
      if (run !== this.runId) return;
      this.aboveSince = null;
      this.lastRead = 0;
      this.set({ state: 'watching' });
      this.loop(faceapi, run);
    } catch {
      if (run !== this.runId) return;
      this.releaseCamera();
      this.set({ state: IS_ARTIFACT ? 'preview' : 'error' });
    }
  }

  stop(): void {
    this.runId++;
    window.clearTimeout(this.timer);
    this.releaseCamera();
    this.aboveSince = null;
    this.set(IDLE);
  }

  private releaseCamera() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.video) this.video.srcObject = null;
    this.video = null;
  }

  private loop(faceapi: FaceApi, run: number) {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });
    const tick = async () => {
      const video = this.video;
      if (run !== this.runId || !video) return;
      // Skip checks while the page is hidden; the camera stays paused on our side.
      if (document.visibilityState === 'visible' && video.readyState >= 2) {
        try {
          const result = (await faceapi.detectSingleFace(video, options).withFaceExpressions()) as Detection | undefined;
          if (run !== this.runId) return;
          this.read(result, video.videoWidth, video.videoHeight);
        } catch {
          // A single failed frame is skipped; the next check tries again.
        }
      }
      this.timer = window.setTimeout(tick, INTERVAL_MS);
    };
    tick();
  }

  private read(result: Detection | undefined, width: number, height: number) {
    const now = Date.now();
    const dt = this.lastRead ? Math.min(now - this.lastRead, 2000) : INTERVAL_MS;
    this.lastRead = now;

    const seen = result?.expressions;
    // No face: let the score drift back down rather than holding a stale reading.
    const raw = seen ? Math.min(1, UPSET_EXPRESSIONS.reduce((sum, e) => sum + seen[e], 0)) : 0;
    const upset = this.snapshot.upset + (raw - this.snapshot.upset) * ease(dt, UPSET_EASE_MS);

    let readings = this.snapshot.readings;
    if (seen) {
      const k = ease(dt, READING_EASE_MS);
      const before = readings;
      readings = Object.fromEntries(EXPRESSIONS.map((e) => [e, before ? before[e] + (seen[e] - before[e]) * k : seen[e]])) as Readings;
    }
    const top = seen && readings ? EXPRESSIONS.reduce((best, e) => (readings[e] > readings[best] ? e : best)) : null;
    const b = result?.detection.box;
    const box = b && width && height ? { x: b.x / width, y: b.y / height, w: b.width / width, h: b.height / height } : null;
    this.set({ face: Boolean(seen), upset, readings, top, box });

    if (!seen || upset < UPSET_THRESHOLD) {
      this.aboveSince = null;
      return;
    }
    this.aboveSince ??= now;
    if (now - this.aboveSince >= SUSTAIN_MS && now - this.lastHelp >= COOLDOWN_MS) {
      this.lastHelp = now;
      this.aboveSince = null;
      const event: HelpEvent = { upset, at: new Date(now) };
      this.actions.forEach((action) => action(event));
      window.dispatchEvent(new CustomEvent<HelpEvent>('upside:sparky-helps', { detail: event }));
    }
  }
}

export const moodWatch = new MoodWatch();

export function useMoodWatch(): MoodSnapshot {
  return useSyncExternalStore(moodWatch.subscribe, moodWatch.getSnapshot, moodWatch.getSnapshot);
}
