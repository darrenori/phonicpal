/**
 * Flexing a sound.
 *
 * English letters keep more than one job. A child who decodes "wasp" to rhyme with
 * "clasp" has done the phonics correctly and still not reached the word; what gets them
 * there is the willingness to try the other sound and check whether the result is a word
 * they know. That skill — set for variability — predicts word reading strongly, and
 * children with dyslexia are the ones least likely to try it unprompted
 * (Steacy et al., 2023, Reading Research Quarterly).
 *
 * So Upside teaches it as a move with a name: flex the sound, then check the meaning.
 */

import type { Word } from './words';

export interface FlexOption {
  /** How this spelling can sound. */
  say: string;
  /** A word the child already knows that uses it. */
  key: string;
}

export const FLEX: Record<string, FlexOption[]> = {
  a: [
    { say: 'a', key: 'apple' },
    { say: 'ay', key: 'cake' },
    { say: 'ar', key: 'car' },
    { say: 'uh', key: 'about' },
  ],
  e: [
    { say: 'e', key: 'egg' },
    { say: 'ee', key: 'me' },
    { say: 'uh', key: 'the' },
  ],
  i: [
    { say: 'i', key: 'insect' },
    { say: 'eye', key: 'ice' },
  ],
  o: [
    { say: 'o', key: 'octopus' },
    { say: 'oh', key: 'go' },
    { say: 'uh', key: 'today' },
  ],
  u: [
    { say: 'u', key: 'umbrella' },
    { say: 'yoo', key: 'music' },
    { say: 'uu', key: 'put' },
  ],
  y: [
    { say: 'y', key: 'yes' },
    { say: 'ee', key: 'happy' },
    { say: 'eye', key: 'fly' },
  ],
  ea: [
    { say: 'ee', key: 'sea' },
    { say: 'e', key: 'bread' },
  ],
  oo: [
    { say: 'oo', key: 'moon' },
    { say: 'uu', key: 'book' },
  ],
  ow: [
    { say: 'ow', key: 'cow' },
    { say: 'oh', key: 'snow' },
  ],
  ou: [
    { say: 'ow', key: 'out' },
    { say: 'oo', key: 'you' },
  ],
  ie: [
    { say: 'ee', key: 'chief' },
    { say: 'eye', key: 'pie' },
  ],
  c: [
    { say: 'kuh', key: 'cat' },
    { say: 'sss', key: 'city' },
  ],
  g: [
    { say: 'guh', key: 'goat' },
    { say: 'juh', key: 'giraffe' },
  ],
  s: [
    { say: 'sss', key: 'sun' },
    { say: 'zzz', key: 'is' },
  ],
  ch: [
    { say: 'ch', key: 'chip' },
    { say: 'kuh', key: 'school' },
  ],
  th: [
    { say: 'th', key: 'thin' },
    { say: 'the buzzy th', key: 'this' },
  ],
};

export interface Flexible {
  grapheme: string;
  options: FlexOption[];
}

/** The spellings in this word that could sound another way, in reading order. */
export function flexesFor(word: Word): Flexible[] {
  const seen = new Set<string>();
  const out: Flexible[] = [];
  for (const sound of word.syllables.flatMap((s) => s.sounds)) {
    const options = FLEX[sound.grapheme];
    if (!options || options.length < 2 || seen.has(sound.grapheme)) continue;
    seen.add(sound.grapheme);
    out.push({ grapheme: sound.grapheme, options });
  }
  return out;
}
