/**
 * Sound units (graphemes) and the mouth shape that makes each one.
 * `say` is a text-to-speech friendly approximation of the sound;
 * `key` is the keyword a specialist would pair with it ("b as in bat").
 */

export type Viseme =
  | 'lips' // b, p, m: lips pressed together
  | 'bite' // f, v: top teeth rest on the bottom lip
  | 'tongue' // th: tongue tip peeks between the teeth
  | 'round' // o, oo, w: lips make a small circle
  | 'smile' // ee, e, i: wide smile
  | 'open' // a, ar, u: jaw drops open
  | 'tap' // t, d, n, l: tongue taps behind the top teeth
  | 'back' // k, g, ng: back of the tongue lifts
  | 'hiss' // s, z: teeth close together
  | 'push' // sh, ch, j: lips push forward
  | 'curl'; // r, er, ir, ur: tongue pulls back, lips a little round

export interface SoundInfo {
  say: string;
  key: string;
  viseme: Viseme;
}

export const SOUNDS: Record<string, SoundInfo> = {
  // consonants
  b: { say: 'buh', key: 'bat', viseme: 'lips' },
  c: { say: 'kuh', key: 'cat', viseme: 'back' },
  d: { say: 'duh', key: 'dog', viseme: 'tap' },
  f: { say: 'fff', key: 'fan', viseme: 'bite' },
  g: { say: 'guh', key: 'goat', viseme: 'back' },
  h: { say: 'huh', key: 'hat', viseme: 'open' },
  j: { say: 'juh', key: 'jam', viseme: 'push' },
  k: { say: 'kuh', key: 'kite', viseme: 'back' },
  l: { say: 'lll', key: 'leg', viseme: 'tap' },
  m: { say: 'mmm', key: 'map', viseme: 'lips' },
  n: { say: 'nnn', key: 'net', viseme: 'tap' },
  p: { say: 'puh', key: 'pig', viseme: 'lips' },
  r: { say: 'rrr', key: 'red', viseme: 'curl' },
  s: { say: 'sss', key: 'sun', viseme: 'hiss' },
  t: { say: 'tuh', key: 'top', viseme: 'tap' },
  v: { say: 'vvv', key: 'van', viseme: 'bite' },
  w: { say: 'wuh', key: 'web', viseme: 'round' },
  x: { say: 'ks', key: 'box', viseme: 'hiss' },
  y: { say: 'yuh', key: 'yes', viseme: 'smile' },
  z: { say: 'zzz', key: 'zip', viseme: 'hiss' },
  qu: { say: 'kwuh', key: 'queen', viseme: 'round' },
  // digraphs
  sh: { say: 'shh', key: 'ship', viseme: 'push' },
  ch: { say: 'chuh', key: 'chip', viseme: 'push' },
  tch: { say: 'chuh', key: 'match', viseme: 'push' },
  th: { say: 'thh', key: 'thumb', viseme: 'tongue' },
  ph: { say: 'fff', key: 'phone', viseme: 'bite' },
  wh: { say: 'wuh', key: 'whale', viseme: 'round' },
  ck: { say: 'kuh', key: 'duck', viseme: 'back' },
  ng: { say: 'ng', key: 'ring', viseme: 'back' },
  dge: { say: 'juh', key: 'badge', viseme: 'push' },
  // short vowels
  a: { say: 'a', key: 'apple', viseme: 'open' },
  e: { say: 'eh', key: 'egg', viseme: 'smile' },
  i: { say: 'ih', key: 'insect', viseme: 'smile' },
  o: { say: 'oh', key: 'octopus', viseme: 'round' },
  u: { say: 'uh', key: 'umbrella', viseme: 'open' },
  // vowel teams and r-controlled vowels
  ai: { say: 'ay', key: 'rain', viseme: 'smile' },
  ay: { say: 'ay', key: 'day', viseme: 'smile' },
  ee: { say: 'ee', key: 'tree', viseme: 'smile' },
  ea: { say: 'ee', key: 'sea', viseme: 'smile' },
  igh: { say: 'eye', key: 'night', viseme: 'open' },
  oa: { say: 'oh', key: 'boat', viseme: 'round' },
  ow: { say: 'oh', key: 'snow', viseme: 'round' },
  ou: { say: 'ow', key: 'out', viseme: 'round' },
  oo: { say: 'oo', key: 'moon', viseme: 'round' },
  oi: { say: 'oy', key: 'coin', viseme: 'round' },
  oy: { say: 'oy', key: 'toy', viseme: 'round' },
  au: { say: 'or', key: 'dinosaur', viseme: 'round' },
  aw: { say: 'or', key: 'saw', viseme: 'round' },
  ar: { say: 'ar', key: 'car', viseme: 'open' },
  er: { say: 'er', key: 'her', viseme: 'curl' },
  ir: { say: 'er', key: 'bird', viseme: 'curl' },
  ur: { say: 'er', key: 'fur', viseme: 'curl' },
  or: { say: 'or', key: 'fork', viseme: 'round' },
  // endings
  le: { say: 'ul', key: 'table', viseme: 'tap' },
  tion: { say: 'shun', key: 'station', viseme: 'push' },
  ture: { say: 'cher', key: 'picture', viseme: 'push' },
};

/** Viseme guidance, written for a child to follow in a mirror. */
export const VISEME_TIP: Record<Viseme, string> = {
  lips: 'Press your lips together, then pop them open.',
  bite: 'Rest your top teeth on your bottom lip and blow.',
  tongue: 'Let your tongue peek out between your teeth.',
  round: 'Make your lips into a small, round circle.',
  smile: 'Smile wide so your cheeks go up.',
  open: 'Drop your jaw and open your mouth wide.',
  tap: 'Tap the tip of your tongue just behind your top teeth.',
  back: 'Lift the back of your tongue, like a little cough.',
  hiss: 'Close your teeth and let the air hiss out.',
  push: 'Push your lips forward, like a kiss.',
  curl: 'Pull your tongue back and round your lips a little.',
};

// Longest graphemes first so "tion" wins over "t".
const GRAPHEMES = Object.keys(SOUNDS)
  .filter((g) => g.length > 1)
  .sort((a, b) => b.length - a.length);

/**
 * Splits a syllable into sound units by longest match.
 * `isLast` enables word-final patterns such as a trailing "le".
 */
export function splitSounds(syllable: string, isLast = false): string[] {
  const units: string[] = [];
  const s = syllable.toLowerCase();
  let i = 0;
  while (i < s.length) {
    const rest = s.slice(i);
    const match = GRAPHEMES.find((g) => {
      if (!rest.startsWith(g)) return false;
      if (g === 'le') return isLast && rest === 'le' && i > 0;
      return true;
    });
    if (match) {
      units.push(match);
      i += match.length;
    } else {
      units.push(s[i]);
      i += 1;
    }
  }
  return units;
}

/** Looks up a sound, treating y as a vowel when it ends a syllable after a consonant. */
export function soundFor(unit: string, context?: { final?: boolean; wordFinal?: boolean }): SoundInfo {
  if (unit === 'y' && context?.final) {
    return context.wordFinal
      ? { say: 'ee', key: 'happy', viseme: 'smile' }
      : { say: 'eye', key: 'fly', viseme: 'open' };
  }
  if (unit === 'e' && context?.wordFinal) {
    return { say: 'silent e', key: 'cake', viseme: 'smile' };
  }
  return SOUNDS[unit] ?? { say: unit, key: unit, viseme: 'open' };
}
