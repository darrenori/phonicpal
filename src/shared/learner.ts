/**
 * The learner model.
 *
 * Upside keeps one small, honest belief about a child: for every letter-sound they have
 * met, how likely it is they know it. The belief moves with Bayesian knowledge tracing
 * (Corbett & Anderson, 1995), the same maths tutoring systems have used for thirty years,
 * because it is interpretable: four numbers, and every update can be explained out loud.
 *
 * It also records which lens — which way of showing a word — the child was using when a
 * word stuck. That is a record of what worked, not a learning style: matching teaching to
 * a child's stated style has no evidence behind it (Pashler et al., 2008), so the model
 * only ever reports what the child's own results show, and never locks a lens.
 *
 * Everything here stays on the device. None of it is sent anywhere, including to the
 * optional AI helper, which only ever sees a word.
 */

import { load, save } from './storage';
import { WORD_BANK, buildWord, type Word } from './words';
import { GRAPH, addWord, reach, soundId, soundsOf, wordId } from './graph';
import { readProgress, STEPS } from './progress';

/** The six ways Upside can show one word. A child may use any of them, in any order. */
export type Lens = 'sounds' | 'chunks' | 'parts' | 'shape' | 'picture' | 'family';
export const LENSES: Lens[] = ['sounds', 'chunks', 'parts', 'shape', 'picture', 'family'];

export const LENS_LABEL: Record<Lens, string> = {
  sounds: 'Sounds',
  chunks: 'Chunks',
  parts: 'Word parts',
  shape: 'Shape',
  picture: 'Picture',
  family: 'Family',
};

export const LENS_BLURB: Record<Lens, string> = {
  sounds: 'One box for every sound in the word.',
  chunks: 'The word split into beats you can say.',
  parts: 'The meaning parts the word is built from.',
  shape: 'Tall, small and hanging letters on the line.',
  picture: 'What the word means, in a picture.',
  family: 'Words that rhyme with it, side by side.',
};

/** Bayesian knowledge tracing. Cautious start, slow learn, generous guess: it under-claims. */
const BKT = { init: 0.2, learn: 0.14, guess: 0.25, slip: 0.1 };
/** Below this, Upside treats a sound as still shaky. */
export const SHAKY = 0.6;
/** A lens needs this many uses before its record means anything. */
const LENS_MIN = 4;

interface Skill {
  /** Probability the child knows this letter-sound. */
  p: number;
  seen: number;
  right: number;
}

interface LensStat {
  used: number;
  right: number;
}

interface LearnerState {
  skills: Record<string, Skill>;
  lenses: Record<string, LensStat>;
  /** The lens the child was last looking through, so a result can be credited to it. */
  lastLens: Lens | null;
  v: 1;
}

const DEFAULT: LearnerState = { skills: {}, lenses: {}, lastLens: null, v: 1 };

let state: LearnerState = typeof window !== 'undefined' ? load<LearnerState>('learner', DEFAULT) : DEFAULT;
const listeners = new Set<() => void>();

function commit(next: LearnerState) {
  state = next;
  save('learner', state);
  listeners.forEach((l) => l());
}

export function readLearner(): LearnerState {
  return state;
}

export function subscribeLearner(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** One step of knowledge tracing: what the evidence says, then what practice adds. */
function trace(p: number, correct: boolean): number {
  const { learn, guess, slip } = BKT;
  const posterior = correct ? (p * (1 - slip)) / (p * (1 - slip) + (1 - p) * guess) : (p * slip) / (p * slip + (1 - p) * (1 - guess));
  return Math.min(0.99, posterior + (1 - posterior) * learn);
}

export function mastery(skillId: string): number {
  return state.skills[skillId]?.p ?? BKT.init;
}

export function seen(skillId: string): number {
  return state.skills[skillId]?.seen ?? 0;
}

/** Records that the child was shown the word through this lens. */
export function useLens(lens: Lens): void {
  const stat = state.lenses[lens] ?? { used: 0, right: 0 };
  commit({ ...state, lastLens: lens, lenses: { ...state.lenses, [lens]: { ...stat, used: stat.used + 1 } } });
}

/**
 * Records a real attempt at a word: saying it out loud, or a card review. Every
 * letter-sound in the word gets the same evidence, which is crude but honest — the
 * model never claims to know which sound let the child down.
 */
export function recordWord(word: Word, correct: boolean): void {
  const skills = { ...state.skills };
  const bump = (id: string) => {
    const skill = skills[id] ?? { p: BKT.init, seen: 0, right: 0 };
    skills[id] = { p: trace(skill.p, correct), seen: skill.seen + 1, right: skill.right + (correct ? 1 : 0) };
  };
  for (const sound of word.syllables.flatMap((s) => s.sounds)) bump(soundId(sound.grapheme, sound.say));
  bump(wordId(word.word));

  const lenses = { ...state.lenses };
  if (state.lastLens && correct) {
    const stat = lenses[state.lastLens] ?? { used: 0, right: 0 };
    lenses[state.lastLens] = { ...stat, right: stat.right + 1 };
  }
  commit({ ...state, skills, lenses });
}

/** The lens this child's own results favour, once there is enough of a record to say. */
export function bestLens(): { lens: Lens; rate: number } | null {
  const scored = LENSES.map((lens) => {
    const stat = state.lenses[lens] ?? { used: 0, right: 0 };
    // Smoothed, so four lucky tries can't crown a lens.
    return { lens, used: stat.used, rate: (stat.right + 1) / (stat.used + 2) };
  }).filter((l) => l.used >= LENS_MIN);
  if (!scored.length) return null;
  const top = scored.sort((a, b) => b.rate - a.rate)[0];
  return { lens: top.lens, rate: top.rate };
}

export interface SkillRow {
  id: string;
  label: string;
  hint?: string;
  p: number;
  seen: number;
}

/** Every letter-sound the child has met, shakiest first. Used by the educator view. */
export function skillRows(): SkillRow[] {
  return Object.entries(state.skills)
    .filter(([id]) => id.startsWith('s:'))
    .map(([id, skill]) => {
      const n = GRAPH.nodes.get(id);
      return { id, label: n?.label ?? id.slice(2), hint: n?.hint, p: skill.p, seen: skill.seen };
    })
    .sort((a, b) => a.p - b.p || b.seen - a.seen);
}

export interface Suggestion {
  word: string;
  /** Why this word, in words a child or a teacher can check. */
  why: string;
}

function finished(word: string): boolean {
  const steps = readProgress().wordSteps[word];
  return Boolean(steps && STEPS.every((s) => steps[s]));
}

/**
 * What to practise next.
 *
 * One shaky sound at a time, in a word whose other sounds the child has already met:
 * the next word should stretch by one link, not five. Where nothing is shaky yet, it
 * picks the unmet sound that unlocks the most other words.
 */
export function suggest(current?: string, level?: Word['level']): Suggestion | null {
  const pool = WORD_BANK.filter((w) => w.word !== current && (!level || w.level === level));
  if (!pool.length) return null;

  let best: { word: Word; score: number; why: string } | null = null;
  for (const word of pool) {
    const sounds = soundsOf(word);
    const shaky = sounds.filter((s) => seen(s.id) > 0 && mastery(s.id) < SHAKY);
    const unmet = sounds.filter((s) => seen(s.id) === 0);
    // One thing to work on, and not a pile of new things alongside it.
    let score = 0;
    let why = '';
    if (shaky.length === 1 && unmet.length <= 1) {
      score = 100 + reach(shaky[0].id) - sounds.length;
      why = `“${shaky[0].label}” is still shaky, and the rest of this word uses sounds you have already met.`;
    } else if (shaky.length === 0 && unmet.length === 1) {
      score = 60 + reach(unmet[0].id) - sounds.length;
      why = `“${unmet[0].label}” is new, and it turns up in ${reach(unmet[0].id)} other words.`;
    } else if (shaky.length > 1) {
      score = 30 - shaky.length;
      why = `it practises ${shaky.length} sounds that are still shaky.`;
    } else {
      score = 20 - unmet.length;
      why = 'it is close to the words you have been building.';
    }
    if (finished(word.word)) score -= 40;
    if (!best || score > best.score) best = { word, score, why };
  }
  return best ? { word: best.word.word, why: best.why } : null;
}

/** Adds a word a child typed to the graph, so the map and the model can use it. */
export function learnNewWord(raw: string): Word | null {
  const word = buildWord(raw);
  if (word) addWord(GRAPH, word);
  return word;
}

export function resetLearner(): void {
  commit(DEFAULT);
}
