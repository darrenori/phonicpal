/**
 * The word helper, from the app's side.
 *
 * The hand-checked bank is 36 words. When a child types a word outside it, Upside can ask
 * a server-side helper (`/api/ai`) for that word's chunks, parts, meaning, example and
 * rhymes, and fold the answer into the graph so the lenses and the map still work.
 *
 * Three rules hold this in place:
 *  - Only a word is ever sent. No name, no progress, no camera, no device data.
 *  - Anything it returns is labelled as machine-made, and never replaces a checked entry.
 *  - If the helper is missing, slow or wrong, the app behaves exactly as it did before.
 *
 * Answers are cached on the device, so a word is only ever asked about once.
 */

import { load, save } from './storage';
import { GRAPH, addRhymes, addWord } from './graph';
import { buildWord, type Word } from './words';

export interface WordHelp {
  word: string;
  syllables: string[];
  parts: string[];
  meaning: string;
  sentence: string;
  hook: string;
  rhymes: string[];
}

/**
 * The helper runs as its own small service, so every copy of Upside can reach it: the
 * Vercel site, the GitHub Pages copy, the Render copy and the single-file artifact.
 * Point VITE_AI_ENDPOINT somewhere else to use another one, or at nothing to turn it off.
 */
const ENDPOINT = (import.meta.env.VITE_AI_ENDPOINT as string | undefined) ?? 'https://upside-helper.vercel.app/api/ai';
const TIMEOUT_MS = 12_000;

interface Cache {
  words: Record<string, WordHelp>;
  v: 1;
}

let cache: Cache = typeof window !== 'undefined' ? load<Cache>('ai-words', { words: {}, v: 1 }) : { words: {}, v: 1 };
/** Set once the helper has failed, so a hosting with no helper is asked only once. */
let unavailable = false;
const pending = new Map<string, Promise<WordHelp | null>>();

export function cachedHelp(word: string): WordHelp | null {
  return cache.words[word] ?? null;
}

export function helperOffered(): boolean {
  return Boolean(ENDPOINT) && !unavailable;
}

/** Asks the helper about one word. Returns null whenever anything at all goes wrong. */
export async function askAboutWord(word: string): Promise<WordHelp | null> {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (clean.length < 2) return null;
  const known = cache.words[clean];
  if (known) return known;
  if (unavailable) return null;
  const inflight = pending.get(clean);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: clean }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) {
        // 404 or 503 means this copy of Upside has no helper behind it; stop asking.
        if (response.status === 404 || response.status === 503) unavailable = true;
        return null;
      }
      const help = (await response.json()) as WordHelp;
      if (!help || help.word !== clean) return null;
      cache = { ...cache, words: { ...cache.words, [clean]: help } };
      save('ai-words', cache);
      return help;
    } catch {
      unavailable = true;
      return null;
    } finally {
      pending.delete(clean);
    }
  })();

  pending.set(clean, request);
  return request;
}

/**
 * Folds a helper's answer into a word: better chunks, a meaning, an example and the
 * rhyming family. The word keeps `guessed`, so the app goes on saying out loud that this
 * breakdown was not checked by a person.
 */
export function applyHelp(word: Word, help: WordHelp): Word {
  const next: Word = { ...word };
  // Chunks are only taken when they spell the word back exactly, and each chunk is then
  // sounded out by Upside's own splitter rather than by the helper.
  if (help.syllables.length > 1 && help.syllables.join('') === word.word) {
    next.syllables = help.syllables.map((text) => {
      const chunk = buildWord(text);
      return chunk ? { text, say: text, sounds: chunk.syllables.flatMap((s) => s.sounds) } : { text, say: text, sounds: [] };
    });
  }
  if (help.meaning) next.meaning = help.meaning;
  if (help.sentence) next.sentence = help.sentence;
  addWord(GRAPH, next);
  if (help.rhymes.length) addRhymes(next.word, help.rhymes);
  return next;
}
