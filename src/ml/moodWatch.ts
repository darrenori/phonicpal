/**
 * Sparky Helps: on-device expression watching.
 *
 * A tiny face detector and a facial-expression model run inside the browser a
 * little over once a second. Nothing is recorded, saved, or sent: frames stay
 * in the video element and only a smoothed "upset" score survives each check.
 * When a child looks upset for a sustained moment, every registered help action
 * runs and the page receives an `upside:sparky-helps` event, so any part of the
 * site can respond. Faces don't always show feelings, so actions should offer
 * help, never decide for the child.
 */

import { useSyncExternalStore } from 'react';
import type { FaceApi } from './faceModels';

export type WatchState = 'off' | 'starting' | 'watching' | 'blocked' | 'unsupported' | 'preview' | 'error';

export interface MoodSnapshot {
  state: WatchState;
  /** A face was found in the latest check. */
  face: boolean;
  /** Smoothed upset score from 0 (calm) to 1 (clearly upset). */
  upset: number;
}

export interface HelpEvent {
  /** The smoothed upset score when help was offered. */
  upset: number;
  at: Date;
}

type HelpAction = (event: HelpEvent) => void;

/** How upset a face must look, after smoothing, before help is considered. */
const THRESHOLD = 0.5;
/** How long the look must last, so a passing frown never triggers help. */
const SUSTAIN_MS = 3000;
/** Quiet time after help is offered, so Sparky never nags. */
const COOLDOWN_MS = 4 * 60_000;
/** Time between checks. */
const INTERVAL_MS = 700;
/** Weight of each new reading in the running average. */
const SMOOTHING = 0.4;

/** The single-file artifact preview has no camera access, so the model is left out of it. */
const PREVIEW_ONLY = import.meta.env.VITE_TARGET === 'artifact';

let faceApiPromise: Promise<FaceApi> | null = null;

function loadModels(): Promise<FaceApi> {
  faceApiPromise ??= import('./faceModels').then((m) => m.loadFaceApi());
  faceApiPromise.catch(() => {
    faceApiPromise = null;
  });
  return faceApiPromise;
}

class MoodWatch {
  private snapshot: MoodSnapshot = { state: 'off', face: false, upset: 0 };
  private listeners = new Set<() => void>();
  private actions = new Set<HelpAction>();
  private stream: MediaStream | null = null;
  private video: HTMLVideoElement | null = null;
  private timer = 0;
  private aboveSince: number | null = null;
  private lastHelp = -Infinity;
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

  /** The live camera stream, for an on-screen preview while watching. */
  get mediaStream(): MediaStream | null {
    return this.stream;
  }

  private set(patch: Partial<MoodSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((l) => l());
  }

  async start(): Promise<void> {
    if (this.snapshot.state === 'starting' || this.snapshot.state === 'watching') return;
    if (PREVIEW_ONLY) {
      this.set({ state: 'preview' });
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      this.set({ state: 'unsupported' });
      return;
    }
    const run = ++this.runId;
    this.set({ state: 'starting', face: false, upset: 0 });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
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
    } catch (error) {
      if (run !== this.runId) return;
      const name = (error as DOMException)?.name;
      this.set({ state: name === 'NotAllowedError' || name === 'SecurityError' ? 'blocked' : 'unsupported' });
      return;
    }
    try {
      const faceapi = PREVIEW_ONLY ? null : await loadModels();
      if (!faceapi) return;
      if (run !== this.runId) return;
      this.aboveSince = null;
      this.set({ state: 'watching' });
      this.loop(faceapi, run);
    } catch {
      if (run !== this.runId) return;
      this.releaseCamera();
      this.set({ state: 'error' });
    }
  }

  stop(): void {
    this.runId++;
    window.clearTimeout(this.timer);
    this.releaseCamera();
    this.aboveSince = null;
    this.set({ state: 'off', face: false, upset: 0 });
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
      if (run !== this.runId || !this.video) return;
      // Skip checks while the page is hidden; the camera stays paused on our side.
      if (document.visibilityState === 'visible' && this.video.readyState >= 2) {
        try {
          const result = await faceapi.detectSingleFace(this.video, options).withFaceExpressions();
          if (run !== this.runId) return;
          this.read(result?.expressions);
        } catch {
          // A single failed frame is skipped; the next check tries again.
        }
      }
      this.timer = window.setTimeout(tick, INTERVAL_MS);
    };
    tick();
  }

  private read(expressions: { angry: number; sad: number; fearful: number; disgusted: number } | undefined) {
    const now = Date.now();
    // No face: let the score drift back down rather than holding a stale reading.
    const raw = expressions ? Math.min(1, expressions.angry + expressions.sad + expressions.fearful + expressions.disgusted) : 0;
    const upset = this.snapshot.upset * (1 - SMOOTHING) + raw * SMOOTHING;
    this.set({ face: Boolean(expressions), upset });

    if (!expressions || upset < THRESHOLD) {
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
