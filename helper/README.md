# Upside word helper

One endpoint, `POST /api/ai`, that takes a single English word and returns its chunks,
word parts, meaning, an example sentence, a memory hook and a few rhymes. It exists so
that a word a child types, which is not in Upside's hand-checked bank of 36, still has a
meaning and a rhyming family to explore.

It is deployed on its own so that every copy of Upside can reach it: the Vercel site, the
GitHub Pages copy, the Render copy and the single-file artifact.

## What goes in and out

```
POST /api/ai
{ "word": "crocodile" }

200
{ "word": "crocodile", "syllables": ["croc","o","dile"], "parts": [],
  "meaning": "A big reptile with strong jaws that lives in rivers.",
  "sentence": "The crocodile floated in the river.",
  "hook": "Croc like rock, then o, then dile.",
  "rhymes": ["mile","smile","file"] }
```

Rules the endpoint enforces:

- A word only. No free text, so there is no prompt for anyone to steer.
- Letters only, 24 characters, and a stop list of words a children's app should not read out.
- Chunks are returned only when they spell the word back exactly.
- No child data is accepted, logged or forwarded. The app never sends any.

## Running it

It calls NUS SoC's OpenAI-compatible gateway, SoCLaaS, with a key held in the server
environment. With no key, it answers `503` and Upside carries on without it.

```bash
vercel env add SOCLAAS_API_KEY production
vercel deploy --prod
```

Optional: `SOCLAAS_MODEL` (defaults to `qwen3.6:35b`).
