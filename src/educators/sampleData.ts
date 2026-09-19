/**
 * Synthetic class data for the educator dashboard demo. Every name and number
 * here is invented and generated from a fixed seed; the UI labels it as sample
 * data everywhere it appears.
 */

import type { Feeling } from '../shared/progress';

export type Mastery = 'secure' | 'practising' | 'new';

export interface Learner {
  id: string;
  name: string;
  level: string;
  minutes: number[]; // last 14 days, oldest first
  wordsPractised: number;
  wordsSecured: number;
  sayTries: number;
  support: string[];
  feelings: Record<Feeling, number>; // last 14 days
  streak: number;
  lastActive: string;
  phonograms: Array<{ g: string; status: Mastery }>;
  live?: boolean;
}

export const PHONOGRAMS = [
  'b', 'd', 'p', 'q', 'sh', 'ch', 'th', 'ck', 'ng', 'wh',
  'ai', 'ay', 'ee', 'ea', 'oa', 'ow', 'oo', 'igh',
  'ar', 'er', 'ir', 'ur', 'or', 'le', 'tion', 'ture',
];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES = ['Aisyah', 'Ethan', 'Kai Xuan', 'Priya', 'Darius', 'Hui Min', 'Arif', 'Chloe', 'Ravi', 'Wen Jie', 'Nurul', 'Lucas'];
const LEVELS = ['P2', 'P2', 'P2', 'P3', 'P2', 'P3', 'P2', 'P3', 'P2', 'P3', 'P2', 'P3'];
const SUPPORT = ['b / d reversal', 'th sound', 'vowel teams', 'er · ir · ur', 'silent e', 'blends (bl, st)', 'multi-syllable words', 'short vowels'];
const LAST = ['Today', 'Today', 'Yesterday', 'Today', '9 days ago', 'Today', 'Yesterday', 'Today', 'Today', '8 days ago', 'Today', 'Yesterday'];
// Two learners have gone quiet, so the view has someone to notice.
const QUIET_FROM: Record<number, number> = { 4: 5, 9: 6 };

const rand = mulberry32(20260919);

export const SAMPLE_CLASS = { name: 'P2 Kindness', school: 'Sample Primary School', teacher: 'Ms Tan (SpED)' };

export const SAMPLE_LEARNERS: Learner[] = NAMES.map((name, i) => {
  const engagement = 0.35 + rand() * 0.65;
  const minutes = Array.from({ length: 14 }, (_, d) => {
    const weekend = d % 7 === 5 || d % 7 === 6;
    const base = weekend ? 6 : 14;
    const active = rand() < engagement || d === (QUIET_FROM[i] ?? 99) - 1;
    if (d >= (QUIET_FROM[i] ?? 14)) return 0;
    return active ? Math.round(base * (0.5 + rand())) : 0;
  });
  const practised = Math.round(8 + engagement * 34 + rand() * 6);
  const secured = Math.round(practised * (0.35 + rand() * 0.4));
  const supportCount = 1 + Math.floor(rand() * 2);
  const support = Array.from(new Set(Array.from({ length: supportCount }, () => SUPPORT[Math.floor(rand() * SUPPORT.length)])));
  const checkins = Math.round(4 + engagement * 10);
  const stuck = Math.floor(rand() * 3 + (engagement < 0.55 ? 2 : 0));
  const tired = Math.floor(rand() * 2);
  const happy = Math.max(0, Math.round((checkins - stuck - tired) * (0.5 + rand() * 0.4)));
  const okay = Math.max(0, checkins - stuck - tired - happy);
  let streak = 0;
  for (let d = 13; d >= 0 && minutes[d] > 0; d--) streak++;
  const phonograms = PHONOGRAMS.map((g) => {
    const r = rand() + engagement * 0.35;
    const status: Mastery = r > 0.95 ? 'secure' : r > 0.55 ? 'practising' : 'new';
    return { g, status };
  });
  return {
    id: `s${i + 1}`,
    name,
    level: LEVELS[i],
    minutes,
    wordsPractised: practised,
    wordsSecured: secured,
    sayTries: Math.round(practised * (1.2 + rand())),
    support,
    feelings: { happy, okay, stuck, tired },
    streak,
    lastActive: LAST[i],
    phonograms,
  };
});

export function dayLabels(count = 14, end = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (count - 1 - i));
    return d.toLocaleDateString('en-SG', { weekday: 'narrow' });
  });
}

export function dayDates(count = 14, end = new Date()): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (count - 1 - i));
    return d;
  });
}
