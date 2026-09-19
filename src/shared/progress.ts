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
  return reward(`${word}:${step}`, step === 'say' ? 3 : 1) + (all ? reward(`${word}:all`, 5) : 0);
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
