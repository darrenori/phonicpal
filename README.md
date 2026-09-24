# Upside

A dyslexia-first practice companion for children aged 5 to 12 (K2 to P6). Words become
blocks that children can **see**, **hear**, **tap** and **say**, between specialist sessions,
at home or in school. It is built to support SpED teachers and therapists, not to replace them.

How Upside decides what to show, and what it refuses to do, is written up in
[LEARNING-MODEL.md](LEARNING-MODEL.md), with the evidence behind each choice.

This repository holds three surfaces that share one design system:

| Surface | Path | What it is |
| --- | --- | --- |
| Landing | `/` | The B2B page for schools and SpED providers, with a live word-building demo |
| Learner app | `/app/` | Words, Snap & scan, Maths, My words, Sparky's den, feelings check-in, reading tools |
| Educator view | `/educators/` | Class overview, learner detail, the learner model in full, and CSV export. **The class data is sample data.** |
| Word helper | `helper/` | One endpoint that breaks a single word down, deployed on its own. Optional. |

## What the learner app does

- **Words.** 36 hand-checked words from K2 to P6. Each word is practised in four steps:
  1. See the letter shapes (tall, small and hanging blocks on a shelf line), with a b/d/p/q helper.
  2. Hear the syllables.
  3. Tap the sound boxes to get the sound, its keyword and the mouth shape.
  4. Say the word, using browser speech recognition where it's available and an optional camera mirror.

  Children can also type any word, and it gets a best-guess breakdown. Every word in the bank
  carries a picture and a meaning in plain words, shown on a card during See it, so decoding and
  understanding arrive together.
- **Six ways into a word.** Sounds, chunks, word parts, shape, picture and family (the
  rhyming cousins). The child picks; Upside records which view their successes follow and
  suggests it, without ever locking one in.
- **The word map.** The word at the centre, joined to its letter-sounds, rhyming family,
  word parts and topic, with the words those lead to. Tap a link to travel. Sounds are
  coloured by how confident the model is that the child knows them.
- **Flex it.** When a try misses, the spellings in that word that have another sound, each
  with a word the child already knows.
- **First-run tour.** On a first visit Sparky lifts one real part of the screen out of the dimmed
  page at a time and reads each stop aloud. It can be skipped, and replayed from Reading tools.
- **Snap & scan.** Photograph homework. The picture is read inside the browser with
  Tesseract.js and turned into word bars or a number sentence. Every word the reader is sure of
  is outlined on the photo itself; tapping an outline says that word and offers to practise it.
- **My words.** The child's own deck. A word joins it when they keep it, and finished words are
  kept for them. Review shows the word, then the picture and meaning on the back of the card.
  Three Leitner boxes bring a word back in one, three or seven days; "not yet" returns it today.
- **Maths.** Singapore-style story sums shown three ways: counters (concrete), a bar model
  (pictorial) and the number sentence (abstract). Operators are read aloud when tapped.
- **Sparky.** A companion dragon, drawn by hand in SVG. Coins are earned for effort (once per
  activity per day), never taken away, and spent on snacks, toys and outfits. A daily goal of
  three words pays a bonus, a streak counts days in a row, and eight stickers mark the habits
  that matter. Stickers are never taken away either.
- **Feelings check-in.** Happy, okay, stuck or tired. "Stuck" leads into a breathing
  exercise with Sparky.
- **Reading tools.** Lexend, OpenDyslexic or Atkinson Hyperlegible; text size; letter and
  line spacing; coloured overlays; a reading ruler; day, night and high-contrast themes;
  voice speed; calm motion.

- **Sparky Helps (optional).** A live camera helper that a grown-up must switch on. A small face-expression model (`@vladmandic/face-api`, with models bundled from `src/ml/models`) reads the live camera picture inside the browser several times a second. While it is on, a corner tile shows the camera picture, a frame that follows the face, and what Sparky sees. The settings panel shows every expression reading live. When a child looks upset for about three seconds, Sparky offers the feelings check-in, then stays quiet for four minutes. Link to `app/#helps` to open the panel directly. The single-file artifact loads the same models from jsDelivr and falls back to a note when its host blocks the camera.

Progress is stored on the device (`localStorage`). There is no backend. The camera
mirror and microphone are opt-in and never record.

## What the model believes

`src/shared/graph.ts` holds the word graph: words joined to their letter-sounds, rime
families, word parts and topics. `src/shared/learner.ts` holds one probability per
letter-sound, updated by Bayesian knowledge tracing from real attempts only (saying a word
out loud, and card reviews), plus a record of which lens the child's successes follow. It
picks the next word — one shaky sound in a frame of sounds already met — and hands back the
reason in words. The educator view prints all of it for the learner on that device.

None of it leaves the device.

## The word helper (optional)

`helper/` is a separate one-endpoint service: give it a single English word and it returns
chunks, word parts, a meaning, an example sentence, a memory hook and rhymes, so that a word
a child types still has a meaning and a family. It runs apart from the site so every copy
can reach it, and it is off unless a key is set:

```bash
cd helper
vercel env add SOCLAAS_API_KEY production
vercel deploy --prod
```

Only a word is ever sent — never anything about a child. Answers are cached on the device,
labelled as machine-made and unchecked, and never replace a hand-checked entry. With no key
the endpoint answers 503 and the app carries on exactly as before. Point the app somewhere
else with `VITE_AI_ENDPOINT`, or set it empty to switch the helper off.

## Develop

```bash
npm install
```

```bash
npm run dev
```

The dev server serves `/`, `/app/` and `/educators/`.

## Build

```bash
npm run build
```

This writes a static multi-page site to `dist/` with a relative base, so the same build
serves from a domain root (Vercel, Render) or a sub-path (GitHub Pages).

```bash
npm run build:artifact
```

This writes one self-contained HTML page with hash routing to
`dist-artifact/upside.html`, for hosts that take a single file.

## Deploy

Live at https://upside-reads.vercel.app, https://darrenori.github.io/upside/ and https://upside-reads.onrender.com.

- **Vercel:** `vercel.json` (framework: Vite, output: `dist`).
- **GitHub Pages:** `.github/workflows/pages.yml` builds and deploys on every push to `main`.
- **Render:** `render.yaml` (a static site that publishes `dist`).

## Design

The visual system is the **Manipulatives Mat**, taken from Singapore Maths bar models,
base-ten rods and the sound boxes used in structured-literacy teaching. Every colour
means one thing:

- **cobalt** is a rod: tall letters and actions
- **lemon** is a unit cube: small letters and quantities
- **vermilion** drops below the line: hanging letters, and parts taken away
- **leaf** is the whole: whole words, answers and Sparky

Tokens live in `src/shared/tokens.css`, and product context is in `PRODUCT.md`.

## Reacting to Sparky Helps

Sparky Helps tells the rest of the site when a child looks upset. You can react in two ways:

- **Inside the app**, register an action:

  ```ts
  import { moodWatch } from './src/ml/moodWatch';
  const stop = moodWatch.onHelp(({ upset, at }) => { /* offer help */ });
  ```  

- **Anywhere on the page**, listen for the DOM event:

  ```ts
  window.addEventListener('upside:sparky-helps', (e) => console.log(e.detail.upset));
  ```  

Actions should offer help, never decide for the child. Faces don't always show how someone feels.
