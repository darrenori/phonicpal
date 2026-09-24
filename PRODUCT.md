# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + TypeScript, built to static files (user-confirmed). Multi-page build:
a marketing landing page, the learner app, and an educator dashboard. Deploy targets:
Vercel, GitHub Pages, Render (static site) and a Claude artifact, from the public repo
`darrenori/upside`. Hosts use the `upside-reads` slug, because `upside` was taken on Vercel and Render.
The artifact build doesn't bundle the Sparky Helps model. It loads the model from jsDelivr, and shows a note pointing to the full app when the host blocks the camera.

## Users

- **Learners (primary users):** children aged 5–12 (K2 to Primary 6) diagnosed with, or
  showing early indicators of, dyslexia. They use the app independently, during free
  time or at home, when a specialist is not beside them.
- **Buyers and supervisors:** primary schools, enrichment centres, and SpED
  (special education) providers who license the platform and want to see that practice
  is happening and helping.
- **Specialist educators:** SpED teachers and therapists whose formal sessions the
  product supports. It does not replace them.

## Product Purpose

The deck calls this the SpED care gap: specialists give high-impact care, but children
have no continuous, tailored practice tool between sessions. Upside fills that gap with
a safe, relaxing, enjoyable space where children practise literacy (and early numeracy)
independently, without academic pressure, judgement, or anxiety.

Success means measurably better academic confidence, daily study habits, and overall
quality of life.

## Positioning

"Supporting, not replacing, specialist educators." A dyslexia-first companion built
around explicit, systematic work on sounds, spellings and word parts, with low-stress
gamification: immediate positive feedback, failure-free exploration, and a companion pet
the child cares for.

Say structured literacy, not Orton-Gillingham. A meta-analysis of OG interventions for
students with or at risk of word-level reading disabilities found no statistically
significant effect (Stevens et al., 2021), so the claim to make is about the content —
letter-sounds, spelling patterns, word parts, spaced retrieval — not the brand.

## Operating Context

- Children practise alone on a tablet or laptop, at home or in school free time.
- Homework pages: children photograph a word or a sum, and the app breaks it down.
- Schools and SpED centres run structured pilots and need evaluation metrics
  (quantitative and qualitative) for learning efficacy and confidence growth.
- Singapore primary-school context: K2 and P1–P6 level names, SpED terminology,
  Singapore-style concrete, pictorial, abstract maths.

## Capabilities and Constraints

Confirmed from the prototype (`../app.html`):
- Word studio: a letter-shape outline (ascender, descender, neutral), syllable and sound
  breakdown, text-to-speech, and a mouth-articulation guide.
- Snap & Scan: capture a word or a maths question from homework and see it visually.
- Maths decoder: operators read aloud, and word problems turned into shape blocks.
- Sparky the companion pet: coins earned by practising buy care items.
- Emotion support: the child checks in (happy, okay, stuck, tired), and \
- Reading settings: dyslexia-friendly font and soft colour themes.

Added since, and confirmed by the founders:
- Meaning with every word: a picture and a plain-words definition, so decoding and
  understanding are taught together.
- A first-run tour, read aloud, because the children Upside is for are the least likely
  to read written instructions.
- Word outlines on a scanned photo, so a child can tap the word on the page in front of them.
- My words: the child's own deck, reviewed on a three-box schedule, kept on the device.
- A daily goal, a practice streak and stickers. Nothing earned is ever taken away.
- The word graph, six lenses onto one word, the word map, and "flex it" for when a
  decoded word is not a real one. See `LEARNING-MODEL.md`.
- A learner model on the device: one probability per letter-sound, the lens a child's
  successes follow, and the next word with its reason. Shown in full to educators.
- An optional word helper (`helper/`) that looks up one word at a time. It never sees a
  child, and the app works without it.

Constraints:
- No backend yet. Progress is stored on the device, and the educator view uses sample
  data.
- Webcam and microphone features must be opt-in and stay on the device.
- Undecided: pricing, licensing terms, contact channel, real pilot partners.

## Go to market

Phase 1 is a beta in **private K2 preschools**. A private preschool can say yes on its own,
which avoids a ministry process for a prototype, and K2 is where early literacy screening
already happens — DAS screens K1 and K2 children a year or more before any formal diagnosis
is possible, and MOE screens at Primary 1 through the Early Literacy Indicator. Eight weeks,
one class at a time, measured on letter-sounds known and words read. Phase 2 moves to
dyslexia associations and specialised learning centres alongside Primary 1–2 support.

## Brand Commitments

- Product name: **Upside** (renamed from PhonicPal on 2026-09-19). The name carries the b/d/p/q flip dyslexic readers know: turn a p upside down and it becomes a d. It also frames dyslexia by its strengths. The name was chosen to be memorable and decodable for young readers.
- Logo: one bowl shared by a hanging p (vermilion) and a standing d (cobalt) on the shelf line. It reads the same upside down.
- Companion: **Sparky**, a friendly dragon, drawn by hand in SVG. No generated artwork is used
  anywhere in the product.
- Founders: Theodora Lee (learning design) and Darren Ong Yan En (product and engineering), both
  Temasek Polytechnic to NUS. Named on the landing page, so every claim there stays checkable.
- Voice: warm, calm, and encouraging. Never punitive. Mistakes are "tries", not
  failures.

## Evidence on Hand

- Pitch deck: `../Empowering Young Learners with Dyslexia.pdf` (7 slides: SpED care gap,
  mission, learner profile, B2B depth-first strategy, three-phase roadmap, advisory
  questions).
- Roadmap: Phase 1 now (prototype refinement, expert consultation, and a beta in private
  K2 preschools). Phase 2 is pilots with dyslexia associations and learning centres.
  Phase 3 is B2B adoption through school licences and education grants.
- Not on hand, so never fabricate: customers, testimonials, efficacy statistics, pricing,
  partner logos, or pilot results.

## Product Principles

1. Confidence before correctness: every interaction leaves the child feeling capable.
2. Multi-sensory by default: see it, hear it, say it, touch it.
3. Calm over stimulation: low cognitive load, a clear next step, no clutter.
4. The child is in control: they choose the pace, the settings, and when to take a break.
5. Support the specialist: make practice visible to educators without surveilling the
   child.

## Accessibility & Inclusion

- Dyslexia-first reading: a choice of reading font (including OpenDyslexic), adjustable
  size and spacing, and colour overlays or tinted backgrounds that reduce glare.
- Audio for every instruction and every word. Navigation must work without reading.
- Large touch targets for young children on tablets. Keyboard access and visible focus.
- Respect reduced-motion preferences. Keep animation gentle and purposeful.
- WCAG 2.2 AA contrast in every theme.
