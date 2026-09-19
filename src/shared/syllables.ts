/**
 * Heuristic syllable splitter for words that are not in the curated word bank
 * (for example, words read from a homework photo). It follows the rules a
 * structured-literacy teacher uses: VC/CV, V/CV, consonant-le, and keeping
 * digraphs and vowel teams together. It is good enough to show chunks, and
 * the curated bank overrides it for every word we have checked by hand.
 */

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
const VOWEL_TEAMS = new Set([
  'ai', 'ay', 'ea', 'ee', 'ei', 'ey', 'ie', 'oa', 'oe', 'oi', 'oo', 'ou', 'ow', 'oy', 'au', 'aw', 'ue', 'ui', 'ew',
]);
const DIGRAPHS = new Set(['sh', 'ch', 'th', 'ph', 'wh', 'ck', 'ng', 'qu']);
const BLENDS = new Set([
  'bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sc', 'sk', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr', 'tw',
]);

function isVowelAt(word: string, i: number): boolean {
  const ch = word[i];
  if (VOWELS.has(ch)) return true;
  // y is a vowel unless it starts the word or follows a vowel
  return ch === 'y' && i > 0 && !VOWELS.has(word[i - 1]);
}

export function syllabify(raw: string): string[] {
  const word = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return word ? [word] : [];

  // Find vowel nuclei, merging vowel teams, and treating a final silent e as part of the last syllable.
  const nuclei: Array<[number, number]> = [];
  for (let i = 0; i < word.length; i++) {
    if (!isVowelAt(word, i)) continue;
    let end = i + 1;
    while (end < word.length && isVowelAt(word, end) && VOWEL_TEAMS.has(word.slice(end - 1, end + 1))) end++;
    const isSilentE =
      word[i] === 'e' && end === word.length && nuclei.length > 0 && !(word.endsWith('le') && !VOWELS.has(word[i - 2]));
    if (!isSilentE) nuclei.push([i, end]);
    i = end - 1;
  }

  // Consonant-le makes its own syllable: ta-ble, lit-tle.
  const consonantLe = word.length > 3 && word.endsWith('le') && !VOWELS.has(word[word.length - 3]);
  if (consonantLe) nuclei.push([word.length - 1, word.length]);

  if (nuclei.length <= 1) return [word];

  const cuts: number[] = [];
  for (let n = 0; n < nuclei.length - 1; n++) {
    const from = nuclei[n][1];
    const to = nuclei[n + 1][0];
    const cluster = word.slice(from, to);
    let cut: number;
    if (consonantLe && n === nuclei.length - 2) {
      cut = word.length - 3; // before the consonant in "-ble"
    } else if (cluster.length === 0) {
      cut = from; // two separate vowels: di-et
    } else if (cluster.length === 1) {
      cut = cluster === 'x' ? to : from; // open syllable V/CV, but x stays: ex-it
    } else if (cluster.length === 2) {
      if (cluster === 'ck') cut = to;
      else if (DIGRAPHS.has(cluster) || BLENDS.has(cluster)) cut = from;
      else cut = from + 1; // VC/CV: rab-bit
    } else {
      const tail2 = cluster.slice(-2);
      cut = DIGRAPHS.has(tail2) || BLENDS.has(tail2) ? to - 2 : from + 1;
    }
    if (cut > (cuts.at(-1) ?? 0) && cut < word.length) cuts.push(cut);
  }

  const parts: string[] = [];
  let start = 0;
  for (const cut of cuts) {
    parts.push(word.slice(start, cut));
    start = cut;
  }
  parts.push(word.slice(start));
  return parts.filter(Boolean);
}
