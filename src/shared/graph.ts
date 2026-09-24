/**
 * The word graph.
 *
 * English is not a queue of words to get through, and a child who reads badly is not
 * missing "the next word" — they are missing links. Upside holds every word as a node
 * joined to the parts it shares with other words: its letter-sounds, its rime family,
 * its word parts and its meaning. The same graph feeds the map a child can explore,
 * the lenses that show one word six ways, and the choice of what to practise next.
 *
 * Nothing here is generated. Letter-sounds and syllables come from the hand-checked
 * word bank; word parts come from the table below; rime families are derived from the
 * spelling. Words a child types can be added to the graph at runtime (see `addWord`).
 */

import { WORD_BANK, type Word } from './words';

export type NodeKind = 'word' | 'sound' | 'rime' | 'part' | 'topic';

export interface GraphNode {
  id: string;
  kind: NodeKind;
  /** What the child sees on the node. */
  label: string;
  /** A plain-words explanation, read aloud on request. */
  hint?: string;
}

export type EdgeKind = 'sound' | 'rime' | 'part' | 'topic';

export interface GraphEdge {
  from: string;
  to: string;
  kind: EdgeKind;
}

export const EDGE_LABEL: Record<EdgeKind, string> = {
  sound: 'shares a sound',
  rime: 'rhymes with',
  part: 'shares a word part',
  topic: 'means something similar',
};

/**
 * Word parts for the bank, checked by hand. Morphology is worth teaching directly:
 * instruction in word parts helps children with literacy difficulties across reading,
 * spelling and vocabulary (Goodwin & Ahn, 2010, Annals of Dyslexia, d ≈ 0.33).
 * A word with no useful parts is left out rather than split for the sake of it.
 */
const PARTS: Record<string, string[]> = {
  jumping: ['jump', 'ing'],
  butterfly: ['butter', 'fly'],
  sandwich: ['sand', 'wich'],
  beautiful: ['beauty', 'ful'],
  important: ['im', 'port', 'ant'],
  imagination: ['imagine', 'ation'],
  responsible: ['response', 'ible'],
  environment: ['environ', 'ment'],
  experiment: ['ex', 'peri', 'ment'],
  photograph: ['photo', 'graph'],
  temperature: ['temper', 'ature'],
  disappear: ['dis', 'appear'],
  adventure: ['adventure'],
  together: ['to', 'gether'],
  yesterday: ['yester', 'day'],
  library: ['libr', 'ary'],
  computer: ['compute', 'er'],
  rocket: ['rock', 'et'],
  garden: ['gard', 'en'],
  pencil: ['pen', 'cil'],
  umbrella: ['umbrella'],
  elephant: ['elephant'],
  dinosaur: ['dino', 'saur'],
  happy: ['happy'],
  window: ['wind', 'ow'],
  basket: ['bask', 'et'],
  rabbit: ['rabbit'],
  dragon: ['dragon'],
};

/** What a word part means, in words a child already has. Only the parts worth teaching. */
export const PART_MEANING: Record<string, string> = {
  ing: 'doing it right now',
  ful: 'full of it',
  ment: 'the thing that happens',
  dis: 'the opposite',
  im: 'not, or into',
  ex: 'out of',
  photo: 'light, or a picture',
  graph: 'writing or drawing',
  dino: 'terrible, in an old language',
  saur: 'lizard',
  ation: 'the act of doing it',
  ible: 'able to be',
  ant: 'a person or thing that does it',
  ary: 'a place for it',
  er: 'a thing or person that does it',
  day: 'one day',
  fly: 'to fly',
  butter: 'butter',
  sand: 'sand',
};

const VOWELS = 'aeiouy';

/**
 * Rhyming families, so a child can read a new word by analogy with one they know
 * ("if I can read cat, I can read mat"). Dyslexic readers do not fall into using
 * analogies on their own the way other readers do (Hanley, Reynolds & Thornton, 1997),
 * so the family has to be shown, not assumed. These are reading families, not the
 * practice bank: they join the graph as words a child can travel to.
 */
const RIME_FAMILY: Record<string, string[]> = {
  at: ['cat', 'hat', 'mat', 'bat', 'sat'],
  un: ['sun', 'fun', 'run', 'bun'],
  ish: ['fish', 'dish', 'wish'],
  og: ['frog', 'dog', 'log', 'jog'],
  uck: ['duck', 'luck', 'truck', 'stuck'],
  ip: ['ship', 'chip', 'lip', 'drip'],
  ed: ['bed', 'red', 'fed', 'sled'],
  am: ['jam', 'ham', 'ram', 'clam'],
  it: ['sit', 'hit', 'fit', 'kit'],
  en: ['hen', 'ten', 'pen', 'den'],
  et: ['net', 'jet', 'wet', 'pet'],
  on: ['on', 'con'],
  ing: ['sing', 'ring', 'king', 'wing'],
  ay: ['day', 'play', 'stay', 'way'],
  ow: ['snow', 'slow', 'grow'],
  ear: ['hear', 'near', 'year'],
  ant: ['ant', 'plant', 'grant'],
  ent: ['sent', 'tent', 'went'],
  ure: ['sure', 'cure', 'pure'],
  ich: ['rich', 'which'],
  il: ['until'],
  aur: ['centaur'],
  aph: ['graph'],
  ion: ['action', 'station'],
  ul: ['useful', 'helpful'],
  ur: ['fur', 'blur'],
};

/** The rime of a chunk: its first vowel letter to the end, as spelled ("cat" gives "at"). */
export function rimeOf(text: string): string | null {
  const clean = text.toLowerCase().replace(/[^a-z]/g, '');
  for (let i = 0; i < clean.length; i++) {
    if (VOWELS.includes(clean[i])) {
      const rime = clean.slice(i);
      // A single letter is not a family worth joining ("happy" and "fly" are not neighbours).
      return rime.length >= 2 ? rime : null;
    }
  }
  return null;
}

export const wordId = (word: string) => `w:${word}`;
export const soundId = (grapheme: string, say: string) => `s:${grapheme}~${say}`;
export const rimeId = (rime: string) => `r:${rime}`;
export const partId = (part: string) => `p:${part}`;
export const topicId = (topic: string) => `t:${topic}`;

export interface Graph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  /** Node id to the ids it is joined to. */
  links: Map<string, Set<string>>;
}

function empty(): Graph {
  return { nodes: new Map(), edges: [], links: new Map() };
}

function addNode(g: Graph, node: GraphNode) {
  if (!g.nodes.has(node.id)) g.nodes.set(node.id, node);
  if (!g.links.has(node.id)) g.links.set(node.id, new Set());
}

function addEdge(g: Graph, from: string, to: string, kind: EdgeKind) {
  if (from === to) return;
  if (g.links.get(from)?.has(to)) return;
  g.edges.push({ from, to, kind });
  g.links.get(from)?.add(to);
  g.links.get(to)?.add(from);
}

/** Joins one word to its sounds, its rime family, its word parts and its topic. */
export function addWord(g: Graph, word: Word): void {
  const id = wordId(word.word);
  addNode(g, { id, kind: 'word', label: word.word, hint: word.meaning });

  for (const syllable of word.syllables) {
    for (const sound of syllable.sounds) {
      const sid = soundId(sound.grapheme, sound.say);
      addNode(g, { id: sid, kind: 'sound', label: sound.grapheme, hint: `says “${sound.say}”, as in ${sound.key}` });
      addEdge(g, id, sid, 'sound');
    }
  }

  const last = word.syllables[word.syllables.length - 1];
  const rime = rimeOf(last?.text ?? word.word);
  if (rime) {
    const rid = rimeId(rime);
    addNode(g, { id: rid, kind: 'rime', label: `-${rime}`, hint: `words that end with “${rime}” and rhyme` });
    addEdge(g, id, rid, 'rime');
  }

  const parts = PARTS[word.word];
  if (parts && parts.length > 1) {
    for (const part of parts) {
      const pid = partId(part);
      addNode(g, { id: pid, kind: 'part', label: part, hint: PART_MEANING[part] ? `“${part}” means ${PART_MEANING[part]}` : `the word part “${part}”` });
      addEdge(g, id, pid, 'part');
    }
  }

  if (word.topic) {
    const tid = topicId(word.topic);
    addNode(g, { id: tid, kind: 'topic', label: word.topic, hint: `words about ${word.topic.toLowerCase()}` });
    addEdge(g, id, tid, 'topic');
  }
}

/** The graph over the checked word bank. Words a child types are added on top of it. */
export const GRAPH: Graph = (() => {
  const g = empty();
  for (const word of WORD_BANK) addWord(g, word);
  // Rhyming cousins: word nodes joined to their family, so analogies have somewhere to go.
  for (const [rime, family] of Object.entries(RIME_FAMILY)) {
    const rid = rimeId(rime);
    addNode(g, { id: rid, kind: 'rime', label: `-${rime}`, hint: `words that end with “${rime}” and rhyme` });
    for (const cousin of family) {
      const id = wordId(cousin);
      addNode(g, { id, kind: 'word', label: cousin });
      addEdge(g, id, rid, 'rime');
    }
  }
  return g;
})();

export function node(id: string): GraphNode | undefined {
  return GRAPH.nodes.get(id);
}

export function neighbours(id: string): string[] {
  return [...(GRAPH.links.get(id) ?? [])];
}

/** The words joined to a node, nearest use first. */
export function wordsAt(id: string, except?: string): string[] {
  return neighbours(id)
    .filter((n) => n.startsWith('w:') && n !== except)
    .map((n) => n.slice(2));
}

/** Every word in the bank that shares this kind of link with the given word. */
export function relatives(word: string, kind: EdgeKind, limit = 6): Array<{ through: GraphNode; words: string[] }> {
  const id = wordId(word);
  const out: Array<{ through: GraphNode; words: string[] }> = [];
  for (const nid of neighbours(id)) {
    const n = GRAPH.nodes.get(nid);
    if (!n) continue;
    const matches = kind === 'sound' ? n.kind === 'sound' : kind === 'rime' ? n.kind === 'rime' : kind === 'part' ? n.kind === 'part' : n.kind === 'topic';
    if (!matches) continue;
    const words = wordsAt(nid, id).slice(0, limit);
    if (words.length) out.push({ through: n, words });
  }
  return out;
}

/** The letter-sound nodes a word is built from, in reading order. */
export function soundsOf(word: Word): GraphNode[] {
  const seen = new Set<string>();
  const out: GraphNode[] = [];
  for (const syllable of word.syllables) {
    for (const sound of syllable.sounds) {
      const id = soundId(sound.grapheme, sound.say);
      if (seen.has(id)) continue;
      seen.add(id);
      const n = GRAPH.nodes.get(id) ?? { id, kind: 'sound' as const, label: sound.grapheme, hint: `says “${sound.say}”, as in ${sound.key}` };
      out.push(n);
    }
  }
  return out;
}

export function partsOf(word: string): string[] {
  const parts = PARTS[word];
  return parts && parts.length > 1 ? parts : [];
}

/** How many words in the bank are built from this node. Rare sounds are worth less practice. */
export function reach(id: string): number {
  return wordsAt(id).length;
}
