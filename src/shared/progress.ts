import { useSyncExternalStore } from 'react';
import { load, save, clear } from './storage';

export type Feeling = 'happy' | 'okay' | 'stuck' | 'tired';
export type Step = 'see' | 'hear' | 'tap' | 'say';
export const STEPS: Step[] = ['see', 'hear', 'tap', 'say'];

export type ItemKind = 'snack' | 'toy' | 'hat' | 'neck' | 'face';

export interface ShopItem {
  id: string;
  name: string;
  kind: ItemKind;
  cost: number;
  joy: number;
  blurb: string;
}

export const SHOP: ShopItem[] = [
  { id: 'mango', name: 'Mango slice', kind: 'snack', cost: 5, joy: 8, blurb: 'Sweet and juicy.' },
  { id: 'curry-puff', name: 'Curry puff', kind: 'snack', cost: 8, joy: 12, blurb: 'Sparky’s favourite.' },
  { id: 'kaya-toast', name: 'Kaya toast', kind: 'snack', cost: 10, joy: 15, blurb: 'Breakfast of dragons.' },
  { id: 'ball', name: 'Bouncy ball', kind: 'toy', cost: 12, joy: 10, blurb: 'Lives on Sparky’s shelf.' },
  { id: 'kite', name: 'Kite', kind: 'toy', cost: 18, joy: 12, blurb: 'For windy days at Marina Barrage.' },
  { id: 'scarf', name: 'Striped scarf', kind: 'neck', cost: 15, joy: 6, blurb: 'Cosy and bright.' },
  { id: 'bowtie', name: 'Bow tie', kind: 'neck', cost: 15, joy: 6, blurb: 'Very smart.' },
  { id: 'glasses', name: 'Reading glasses', kind: 'face', cost: 20, joy: 8, blurb: 'For book-loving dragons.' },
  { id: 'cap', name: 'Explorer cap', kind: 'hat', cost: 25, joy: 8, blurb: 'Ready for adventure.' },
  { id: 'crown', name: 'Crown', kind: 'hat', cost: 30, joy: 10, blurb: 'For trying really hard.' },
];

export interface DayLog {
  minutes: number;
  words: string[];
  steps: number;
  scans: number;
  sums: number;
  tries: number;
}

export interface Progress {
  name: string;
  coins: number;
  happiness: number;
  owned: string[];
  wearing: Partial<Record<'hat' | 'neck' | 'face', string>>;
  days: Record<string, DayLog>;
  wordSteps: Record<string, Partial<Record<Step, string>>>;
  feelings: Array<{ at: string; feeling: Feeling }>;
  /** Stickers earned, by id. Once earned, a sticker is never lost. */
  badges: string[];
  rewarded: { day: string; keys: string[] };
}

const DEFAULT: Progress = {
  name: '',
  coins: 20,
  happiness: 70,
  owned: [],
  wearing: {},
  days: {},
  wordSteps: {},
  feelings: [],
  badges: [],
  rewarded: { day: '', keys: [] },
};

export function today(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

let state: Progress = typeof window !== 'undefined' ? load('progress', DEFAULT) : DEFAULT;
const listeners = new Set<() => void>();

function commit(next: Progress) {
  state = next;
  save('progress', state);
  listeners.forEach((l) => l());
}

function dayLog(p: Progress): DayLog {
  return p.days[today()] ?? { minutes: 0, words: [], steps: 0, scans: 0, sums: 0, tries: 0 };
}

function withDay(p: Progress, patch: (d: DayLog) => DayLog): Progress {
  return { ...p, days: { ...p.days, [today()]: patch(dayLog(p)) } };
}

/** Gives coins once per key per day, so repeating a step never farms coins. Returns coins given. */
export function reward(key: string, coins: number): number {
  const day = today();
  const rewarded = state.rewarded.day === day ? state.rewarded : { day, keys: [] };
  if (rewarded.keys.includes(key)) return 0;
  commit({ ...state, coins: state.coins + coins, rewarded: { day, keys: [...rewarded.keys, key] } });
  return coins;
}

/** Words to build in a day. Small enough to finish on a school night. */
export const DAILY_GOAL = 3;

function busy(day?: DayLog): boolean {
  return Boolean(day && (day.steps > 0 || day.scans > 0 || day.sums > 0 || day.tries > 0 || day.words.length > 0));
}

/** Days of practice in a row. Today doesn't break the streak until it ends. */
export function streak(p: Progress = state): number {
  const day = new Date();
  if (!busy(p.days[today(day)])) day.setDate(day.getDate() - 1);
  let count = 0;
  while (busy(p.days[today(day)])) {
    count++;
    day.setDate(day.getDate() - 1);
  }
  return count;
}

export function wordsToday(p: Progress = state): number {
  return p.days[today()]?.words.length ?? 0;
}

function finishedWords(p: Progress): number {
  return Object.values(p.wordSteps).filter((steps) => STEPS.every((s) => steps[s])).length;
}

function totalOf(p: Progress, key: 'tries' | 'scans' | 'sums'): number {
  return Object.values(p.days).reduce((n, d) => n + d[key], 0);
}

export interface Badge {
  id: string;
  name: string;
  blurb: string;
  earned: (p: Progress) => boolean;
}

/** Stickers for the things Upside wants children to keep doing: turning up, and trying out loud. */
export const BADGES: Badge[] = [
  { id: 'first-word', name: 'First word', blurb: 'Finish all four steps for a word.', earned: (p) => finishedWords(p) >= 1 },
  { id: 'five-words', name: 'Five words', blurb: 'Finish five words.', earned: (p) => finishedWords(p) >= 5 },
  { id: 'twenty-words', name: 'Twenty words', blurb: 'Finish twenty words.', earned: (p) => finishedWords(p) >= 20 },
  { id: 'brave-voice', name: 'Brave voice', blurb: 'Say ten words out loud.', earned: (p) => totalOf(p, 'tries') >= 10 },
  { id: 'homework-helper', name: 'Homework helper', blurb: 'Scan five pages.', earned: (p) => totalOf(p, 'scans') >= 5 },
  { id: 'sum-solver', name: 'Sum solver', blurb: 'Work out ten sums.', earned: (p) => totalOf(p, 'sums') >= 10 },
  { id: 'three-days', name: 'Three days', blurb: 'Practise three days in a row.', earned: (p) => streak(p) >= 3 },
  { id: 'whole-week', name: 'A whole week', blurb: 'Practise seven days in a row.', earned: (p) => streak(p) >= 7 },
];

/** Hands over any newly earned stickers, with five coins each, so the caller can cheer. */
export function claimBadges(): Badge[] {
  const fresh = BADGES.filter((b) => !state.badges.includes(b.id) && b.earned(state));
  if (!fresh.length) return [];
  commit({ ...state, coins: state.coins + fresh.length * 5, badges: [...state.badges, ...fresh.map((b) => b.id)] });
  return fresh;
}

export function completeStep(word: string, step: Step): number {
  const steps = { ...state.wordSteps[word], [step]: today() };
  let next = { ...state, wordSteps: { ...state.wordSteps, [word]: steps } };
  next = withDay(next, (d) => ({
    ...d,
    steps: d.steps + 1,
    words: d.words.includes(word) ? d.words : [...d.words, word],
  }));
  commit(next);
  const all = STEPS.every((s) => steps[s]);
  const coins = reward(`${word}:${step}`, step === 'say' ? 3 : 1) + (all ? reward(`${word}:all`, 5) : 0);
  // Reaching the day's goal pays a bonus, once a day.
  const goal = wordsToday() >= DAILY_GOAL ? reward(`goal:${today()}`, 5) : 0;
  return coins + goal;
}

export function logTry(): void {
  commit(withDay(state, (d) => ({ ...d, tries: d.tries + 1 })));
}

export function logScan(): number {
  commit(withDay(state, (d) => ({ ...d, scans: d.scans + 1 })));
  return reward(`scan:${dayLog(state).scans}`, 3);
}

export function logSum(id: string): number {
  commit(withDay(state, (d) => ({ ...d, sums: d.sums + 1 })));
  return reward(`sum:${id}`, 3);
}

export function addMinutes(minutes: number): void {
  commit(withDay(state, (d) => ({ ...d, minutes: Math.round((d.minutes + minutes) * 10) / 10 })));
}

export function logFeeling(feeling: Feeling): number {
  commit({ ...state, feelings: [...state.feelings.slice(-199), { at: new Date().toISOString(), feeling }] });
  return reward(`feeling:${feeling}`, 2);
}

export function setName(name: string): void {
  commit({ ...state, name: name.slice(0, 24) });
}

export type BuyResult = 'bought' | 'fed' | 'short' | 'owned';

export function buy(item: ShopItem): BuyResult {
  if (item.kind !== 'snack' && state.owned.includes(item.id)) return 'owned';
  if (state.coins < item.cost) return 'short';
  const happiness = Math.min(100, state.happiness + item.joy);
  if (item.kind === 'snack') {
    commit({ ...state, coins: state.coins - item.cost, happiness });
    return 'fed';
  }
  const wearing = item.kind === 'toy' ? state.wearing : { ...state.wearing, [item.kind]: item.id };
  commit({ ...state, coins: state.coins - item.cost, happiness, owned: [...state.owned, item.id], wearing });
  return 'bought';
}

export function toggleWear(item: ShopItem): void {
  if (item.kind === 'snack' || item.kind === 'toy' || !state.owned.includes(item.id)) return;
  const slot = item.kind;
  const wearing = { ...state.wearing };
  if (wearing[slot] === item.id) delete wearing[slot];
  else wearing[slot] = item.id;
  commit({ ...state, wearing });
}

export function pet(): void {
  commit({ ...state, happiness: Math.min(100, state.happiness + 1) });
}

export function resetProgress(): void {
  clear('progress');
  commit(DEFAULT);
}

export function readProgress(): Progress {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, readProgress, readProgress);
}

/** Starts a practice-time counter that only runs while the child is active on a visible page. */
export function startPracticeClock(): () => void {
  let lastActive = Date.now();
  const mark = () => {
    lastActive = Date.now();
  };
  const events = ['pointerdown', 'keydown', 'touchstart'] as const;
  events.forEach((e) => window.addEventListener(e, mark, { passive: true }));
  const timer = window.setInterval(() => {
    if (document.visibilityState === 'visible' && Date.now() - lastActive < 90_000) addMinutes(0.5);
  }, 30_000);
  return () => {
    window.clearInterval(timer);
    events.forEach((e) => window.removeEventListener(e, mark));
  };
}
