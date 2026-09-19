export type Op = '+' | '−' | '×' | '÷';

export const OP_INFO: Record<Op | '=', { word: string; meaning: string; say: string }> = {
  '+': { word: 'plus', meaning: 'add, put together', say: 'Plus. It means add, or put together.' },
  '−': { word: 'minus', meaning: 'take away', say: 'Minus. It means take away.' },
  '×': { word: 'times', meaning: 'groups of', say: 'Times. It means groups of.' },
  '÷': { word: 'divided by', meaning: 'share equally', say: 'Divided by. It means share equally.' },
  '=': { word: 'equals', meaning: 'is the same as', say: 'Equals. It means is the same as.' },
};

export type Model = 'part-whole' | 'take-away' | 'compare' | 'groups' | 'share';

export interface Clue {
  phrase: string;
  hint: string;
}

export interface Problem {
  id: string;
  level: 'P1–P2' | 'P2–P3';
  text: string;
  clues: Clue[];
  model: Model;
  a: number;
  b: number;
  op: Op;
  answer: number;
  item: string;
  items: string;
  labels: { a: string; b: string; answer: string };
  solution: string;
}

export const PROBLEMS: Problem[] = [
  {
    id: 'buns',
    level: 'P1–P2',
    text: 'Mei has 5 kaya buns. Her brother gives her 3 more. How many kaya buns does Mei have now?',
    clues: [{ phrase: 'gives her 3 more', hint: 'More are joining, so we add.' }],
    model: 'part-whole',
    a: 5,
    b: 3,
    op: '+',
    answer: 8,
    item: 'bun',
    items: 'kaya buns',
    labels: { a: 'Mei had', b: 'Brother gave', answer: 'Now' },
    solution: 'Five plus three equals eight. Mei has eight kaya buns now.',
  },
  {
    id: 'mynahs',
    level: 'P1–P2',
    text: 'There are 12 mynah birds on a tree. 4 fly away. How many birds are left?',
    clues: [{ phrase: 'fly away', hint: 'Some are leaving, so we take away.' }],
    model: 'take-away',
    a: 12,
    b: 4,
    op: '−',
    answer: 8,
    item: 'bird',
    items: 'birds',
    labels: { a: 'On the tree', b: 'Flew away', answer: 'Left' },
    solution: 'Twelve minus four equals eight. There are eight birds left.',
  },
  {
    id: 'canteen',
    level: 'P1–P2',
    text: 'There are 14 children in the canteen. 6 are eating noodles. The rest are eating rice. How many are eating rice?',
    clues: [{ phrase: 'The rest', hint: 'We know the whole and one part. Take the part away to find the other part.' }],
    model: 'part-whole',
    a: 14,
    b: 6,
    op: '−',
    answer: 8,
    item: 'child',
    items: 'children',
    labels: { a: 'All children', b: 'Noodles', answer: 'Rice' },
    solution: 'Fourteen minus six equals eight. Eight children are eating rice.',
  },
  {
    id: 'marbles',
    level: 'P1–P2',
    text: 'Ben has 9 marbles. Wei Ling has 4 more marbles than Ben. How many marbles does Wei Ling have?',
    clues: [{ phrase: '4 more marbles than Ben', hint: 'Wei Ling’s bar is longer than Ben’s by 4.' }],
    model: 'compare',
    a: 9,
    b: 4,
    op: '+',
    answer: 13,
    item: 'marble',
    items: 'marbles',
    labels: { a: 'Ben', b: 'More', answer: 'Wei Ling' },
    solution: 'Nine plus four equals thirteen. Wei Ling has thirteen marbles.',
  },
  {
    id: 'cars',
    level: 'P2–P3',
    text: 'Arjun has 4 boxes. Each box has 3 toy cars. How many toy cars are there altogether?',
    clues: [
      { phrase: 'Each box has 3', hint: 'Every group is the same size.' },
      { phrase: 'altogether', hint: 'We want the total of all the groups.' },
    ],
    model: 'groups',
    a: 4,
    b: 3,
    op: '×',
    answer: 12,
    item: 'car',
    items: 'toy cars',
    labels: { a: 'Boxes', b: 'In each box', answer: 'Altogether' },
    solution: 'Four times three equals twelve. There are twelve toy cars altogether.',
  },
  {
    id: 'sweets',
    level: 'P2–P3',
    text: 'Siti shares 15 sweets equally among 3 friends. How many sweets does each friend get?',
    clues: [{ phrase: 'shares 15 sweets equally', hint: 'Equal sharing means we divide.' }],
    model: 'share',
    a: 15,
    b: 3,
    op: '÷',
    answer: 5,
    item: 'sweet',
    items: 'sweets',
    labels: { a: 'Sweets', b: 'Friends', answer: 'Each gets' },
    solution: 'Fifteen divided by three equals five. Each friend gets five sweets.',
  },
];

/* ---------- Typed or scanned sums ---------- */

export type SumToken = { kind: 'num'; value: number } | { kind: 'op'; op: Op } | { kind: 'eq' } | { kind: 'unknown' };

const OP_ALIASES: Record<string, Op> = {
  '+': '+',
  '-': '−',
  '−': '−',
  '–': '−',
  x: '×',
  X: '×',
  '×': '×',
  '*': '×',
  '/': '÷',
  '÷': '÷',
  ':': '÷',
};

export interface ParsedSum {
  tokens: SumToken[];
  result: number | null;
  spoken: string;
}

export function looksLikeSum(text: string): boolean {
  return /\d\s*[+\-−–x×*/÷:]\s*\d/i.test(text);
}

export function parseSum(text: string): ParsedSum | null {
  const matches = text.match(/\d+(?:\.\d+)?|[+\-−–xX×*/÷:=?]/g);
  if (!matches) return null;
  const tokens: SumToken[] = matches.map((m) => {
    if (/^\d/.test(m)) return { kind: 'num', value: Number(m) };
    if (m === '=') return { kind: 'eq' };
    if (m === '?') return { kind: 'unknown' };
    return { kind: 'op', op: OP_ALIASES[m] };
  });

  // Evaluate the left side of the first "=" with × and ÷ before + and −.
  const eqIndex = tokens.findIndex((t) => t.kind === 'eq');
  const left = eqIndex === -1 ? tokens : tokens.slice(0, eqIndex);
  const nums: number[] = [];
  const ops: Op[] = [];
  let expectNum = true;
  for (const t of left) {
    if (expectNum && t.kind === 'num') {
      nums.push(t.value);
      expectNum = false;
    } else if (!expectNum && t.kind === 'op') {
      ops.push(t.op);
      expectNum = true;
    } else {
      return null;
    }
  }
  if (nums.length < 2 || nums.length !== ops.length + 1) return null;

  const stackNums = [nums[0]];
  const stackOps: Op[] = [];
  ops.forEach((op, i) => {
    const n = nums[i + 1];
    if (op === '×') stackNums.push(stackNums.pop()! * n);
    else if (op === '÷') stackNums.push(n === 0 ? NaN : stackNums.pop()! / n);
    else {
      stackOps.push(op);
      stackNums.push(n);
    }
  });
  let result = stackNums[0];
  stackOps.forEach((op, i) => {
    result = op === '+' ? result + stackNums[i + 1] : result - stackNums[i + 1];
  });
  const finalResult = Number.isFinite(result) ? Math.round(result * 100) / 100 : null;

  const leftTokens = left;
  const spokenParts = leftTokens.map((t) => (t.kind === 'num' ? String(t.value) : t.kind === 'op' ? OP_INFO[t.op].word : ''));
  const spoken = `${spokenParts.join(' ')} equals ${finalResult ?? 'a number we cannot share evenly'}`;

  return {
    tokens: [...leftTokens, { kind: 'eq' }, finalResult === null ? { kind: 'unknown' } : { kind: 'num', value: finalResult }],
    result: finalResult,
    spoken,
  };
}

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

export function numberWord(n: number): string {
  return ONES[n] ?? String(n);
}
