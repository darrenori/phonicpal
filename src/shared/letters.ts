/**
 * Letter-shape classification: the heart of PhonicPal's "see the word" step.
 * Every lowercase letter is a block whose height tells its shape:
 * tall letters rise above the x-height, hanging letters drop below the line,
 * and cube letters sit exactly on it.
 */

export type LetterShape = 'tall' | 'hang' | 'cube' | 'gap' | 'mark';

const TALL = new Set('bdfhklt'.split(''));
const HANG = new Set('gjpqy'.split(''));

/** Letters that are commonly mirrored or swapped by dyslexic readers. */
export const CONFUSABLES: Record<string, string> = {
  b: 'Bat before ball: draw the stick first, then the round tummy on the right.',
  d: 'Drum before stick: draw the round drum first, then the tall stick on the right.',
  p: 'p hangs down: the stick drops below the line, tummy on the right.',
  q: 'q hangs down too: tummy on the left, then the stick drops below the line.',
};

export function letterShape(ch: string): LetterShape {
  if (ch === ' ') return 'gap';
  if (/[A-Z0-9]/.test(ch)) return 'tall';
  const lower = ch.toLowerCase();
  if (TALL.has(lower)) return 'tall';
  if (HANG.has(lower)) return 'hang';
  if (/[a-z]/.test(lower)) return 'cube';
  return 'mark';
}

export const SHAPE_LABEL: Record<Exclude<LetterShape, 'gap' | 'mark'>, string> = {
  tall: 'Tall letter',
  hang: 'Hanging letter',
  cube: 'Small letter',
};

export function isConfusable(ch: string): boolean {
  return ch in CONFUSABLES;
}
