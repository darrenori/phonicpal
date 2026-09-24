/**
 * The word helper.
 *
 * Upside's word bank is hand-checked, and it is 36 words long. A child who types
 * "crocodile" gets a guessed breakdown and no meaning. This endpoint fills that gap: it
 * asks an LLM for one word's chunks, parts, meaning, example and rhyming family, checks
 * the answer looks like the word it was asked about, and hands it back.
 *
 * What it will not do, by construction:
 *  - It never sees a child. The only input it accepts is a single English word.
 *  - It takes no free text, so there is no prompt for a visitor to steer.
 *  - It returns data, not speech. Nothing it says is read to a child as Sparky.
 *
 * The API key stays here, in the server environment, and never reaches the browser.
 * With no key set the endpoint answers 503 and the app carries on without it.
 */

const BASE_URL = 'https://soclaas-api.comp.nus.edu.sg/v1';
const MODEL = process.env.SOCLAAS_MODEL || 'qwen3.6:35b';
const TIMEOUT_MS = 20_000;
const MAX_WORD = 24;

/** A short stop list. The app is for young children, and a typed word is read aloud. */
const BLOCKED = new Set([
  'fuck', 'fucking', 'shit', 'bitch', 'cunt', 'dick', 'cock', 'pussy', 'slut', 'whore', 'nigger', 'nigga', 'faggot',
  'rape', 'porn', 'sex', 'penis', 'vagina', 'boobs', 'tits', 'wanker', 'bastard', 'arsehole', 'asshole',
]);

const SYSTEM = [
  'You break single English words down for a reading app used by children aged 5 to 12 with dyslexia in Singapore.',
  'Answer with one JSON object and nothing else. No markdown, no commentary.',
  'Keys: syllables (array of strings that join to spell the word exactly), parts (array of meaning parts, or [] when the word has none),',
  'meaning (under 14 words, using only words a 7-year-old knows), sentence (under 10 words, containing the word, about everyday life),',
  'hook (under 14 words, a memory tip for the tricky bit), rhymes (up to 4 real English words that rhyme with it).',
  'Use British spelling. Never explain your answer.',
].join(' ');

/** Reasoning models may print their thinking; drop it before parsing. */
function stripThinking(text) {
  return String(text ?? '')
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, '')
    .replace(/^[\s\S]*?<\/think>/i, '')
    .trim();
}

function firstJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

const words = (value, max) =>
  Array.isArray(value)
    ? value
        .filter((v) => typeof v === 'string')
        .map((v) => v.toLowerCase().replace(/[^a-z]/g, ''))
        .filter(Boolean)
        .slice(0, max)
    : [];

const line = (value, max) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '');

/** Keeps only what is checkable: chunks must spell the word, parts must come from it. */
function clean(word, raw) {
  const syllables = words(raw?.syllables, 6);
  const parts = words(raw?.parts, 4);
  return {
    word,
    syllables: syllables.join('') === word ? syllables : [],
    parts: parts.length > 1 && parts.join('').length <= word.length + 4 ? parts : [],
    meaning: line(raw?.meaning, 120),
    sentence: line(raw?.sentence, 120),
    hook: line(raw?.hook, 120),
    rhymes: words(raw?.rhymes, 4).filter((r) => r !== word),
  };
}

export default async function handler(req, res) {
  // Every copy of Upside is a static site on a different host, and the answer is about a
  // word, not a person, so any origin may ask.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Use POST.' });
    return;
  }

  const key = (process.env.SOCLAAS_API_KEY || '').trim();
  if (!key) {
    res.status(503).json({ error: 'The word helper is not configured.' });
    return;
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body || {};
  const word = String(body.word || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
    .slice(0, MAX_WORD);
  if (word.length < 2) {
    res.status(400).json({ error: 'Send one English word.' });
    return;
  }
  if (BLOCKED.has(word)) {
    res.status(422).json({ error: 'That is not a word for this app.' });
    return;
  }

  try {
    const upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        max_tokens: 400,
        reasoning_effort: 'none',
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `The word is "${word}".` },
        ],
      }),
    });

    if (!upstream.ok) {
      // Never pass the upstream body through: it can carry details this app should not relay.
      res.status(502).json({ error: `The word helper could not answer (${upstream.status}).` });
      return;
    }

    const data = await upstream.json();
    const parsed = firstJson(stripThinking(data?.choices?.[0]?.message?.content ?? ''));
    if (!parsed) {
      res.status(502).json({ error: 'The word helper sent something unreadable.' });
      return;
    }
    res.status(200).json(clean(word, parsed));
  } catch (error) {
    const timeout = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    res.status(timeout ? 504 : 502).json({ error: timeout ? 'The word helper took too long.' : 'The word helper is unavailable.' });
  }
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
