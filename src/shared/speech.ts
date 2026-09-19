/**
 * Text-to-speech and speech-recognition helpers. Everything degrades quietly:
 * a browser without speech support still renders every word visually.
 */

import { readSettings } from './settings';

let cachedVoice: SpeechSynthesisVoice | null | undefined;

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = window.speechSynthesis?.getVoices() ?? [];
  if (!voices.length) return null;
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const preferred =
    english.find((v) => /en-(sg|gb)/i.test(v.lang) && /natural|neural|google/i.test(v.name)) ??
    english.find((v) => /natural|neural|google/i.test(v.name)) ??
    english.find((v) => /en-(sg|gb)/i.test(v.lang)) ??
    english[0] ??
    null;
  cachedVoice = preferred;
  return preferred;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoice = undefined;
  });
}

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

export interface SpeakOptions {
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export function speak(text: string, options: SpeakOptions = {}): void {
  if (!canSpeak) {
    options.onEnd?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? 'en-GB';
  utterance.rate = options.rate ?? readSettings().speechRate;
  utterance.pitch = 1.05;
  utterance.onstart = () => options.onStart?.();
  utterance.onend = () => options.onEnd?.();
  utterance.onerror = () => options.onEnd?.();
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  if (canSpeak) window.speechSynthesis.cancel();
}

/* ---------- Speech recognition (for the "Say it" step) ---------- */

interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<RecognitionAlternative>>;
}
interface Recognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const canListen = recognitionCtor() !== null;

export type ListenResult =
  | { kind: 'heard'; transcripts: string[] }
  | { kind: 'silence' }
  | { kind: 'blocked' }
  | { kind: 'unsupported' };

/** Listens once and resolves with what the browser heard. */
export function listenOnce(timeoutMs = 6000): { result: Promise<ListenResult>; cancel: () => void } {
  const Ctor = recognitionCtor();
  if (!Ctor) return { result: Promise.resolve({ kind: 'unsupported' }), cancel: () => {} };
  const rec = new Ctor();
  rec.lang = 'en-GB';
  rec.interimResults = false;
  rec.maxAlternatives = 5;
  let settled = false;
  let timer = 0;
  const result = new Promise<ListenResult>((resolve) => {
    const finish = (value: ListenResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(value);
    };
    rec.onresult = (event) => {
      const transcripts: string[] = [];
      const first = event.results[0];
      for (let i = 0; i < (first?.length ?? 0); i++) transcripts.push(first[i].transcript);
      finish({ kind: 'heard', transcripts });
    };
    rec.onerror = (event) => {
      finish(event.error === 'not-allowed' || event.error === 'service-not-allowed' ? { kind: 'blocked' } : { kind: 'silence' });
    };
    rec.onend = () => finish({ kind: 'silence' });
    timer = window.setTimeout(() => {
      rec.abort();
      finish({ kind: 'silence' });
    }, timeoutMs);
    try {
      rec.start();
    } catch {
      finish({ kind: 'unsupported' });
    }
  });
  return {
    result,
    cancel: () => {
      if (!settled) rec.abort();
    },
  };
}

function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

/** Generous match: children's speech is often heard as a near neighbour. */
export function heardTarget(transcripts: string[], target: string): boolean {
  const goal = target.toLowerCase();
  return transcripts.some((t) =>
    t
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .some((w) => w === goal || distance(w, goal) <= Math.max(1, Math.floor(goal.length / 5))),
  );
}
