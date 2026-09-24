# The Upside Learning Model

How Upside decides what a child sees, what it believes about them, and what it refuses to
do. Written to be argued with: every claim below is either checkable in the code or cited,
and the places where the evidence is thin or against us are marked as such.

Last revised 25 September 2026.

---

## 1. The problem this model is for

A child with dyslexia in Singapore gets, at best, a weekly specialist session. About 3.5%
of Primary 3 pupils were reported as having dyslexia in 2016–2019 data, within the
international range of 3–10%; screening happens at Primary 1 through the Early Literacy
Indicator, with support through the Learning Support Programme (MOE, 2021). The hours that
decide whether reading sticks are the other hours — at home, at night, with a parent who is
not a reading specialist.

Upside is for those hours. It is not a curriculum, a diagnosis, or a replacement for a
therapist. It is the practice partner in between.

Two design consequences follow, and they run through everything below:

1. **Nobody is supervising.** Instruction has to explain itself out loud, be impossible to
   fail at, and stop when the child has had enough.
2. **Nothing can be assumed.** The child may not read the instructions, may not remember
   yesterday, and may have been told all week that they are the slow one.

---

## 2. What the evidence actually supports

### It supports teaching the code explicitly

Skilled word reading runs on orthographic mapping: connecting the sounds in a spoken word
to the letters that spell it, so the word is recognised at sight rather than sounded out
each time. Phonemic awareness plus grapheme–phoneme knowledge is what makes that mapping
possible (Ehri). Recent work adds that orthographic knowledge itself is a deficit in
dyslexia as large as the phonological one, and it is now part of the Delphi consensus
definition — so teaching must go past single letter-sounds to the spelling patterns
themselves.

### It supports word parts

Morphological instruction helps exactly the children Upside is for: across 17 studies of
children with literacy difficulties, an overall effect of **d ≈ 0.33**, with phonological
awareness 0.49, morphological awareness 0.40, vocabulary 0.40, comprehension 0.24 and
spelling 0.20 (Goodwin & Ahn, 2010).

### It supports spacing and retrieval

Of ten common study techniques, distributed practice and practice testing come out on top
(Hattie & Donoghue, 2021, replicating Dunlosky et al., 2013); retrieval practice against
re-reading gives g ≈ 0.50 (Rowland, 2014). With children who have language difficulties,
repeated spaced retrieval improves recall of both word form and meaning, and generalises.

### It supports flexibility with sounds

English spellings keep more than one job. "Set for variability" — the willingness to try
another pronunciation and check it against a word you know — is a strong predictor of word
reading and a candidate treatment target (Steacy et al., 2023). Children who struggle are
the least likely to try it unprompted.

### It supports showing the same thing more than one way

Multiple external representations do three jobs: they complement each other, one constrains
the interpretation of another, and together they build an understanding neither gives alone
(Ainsworth's DeFT framework). Maps of how ideas connect help readers who struggle: graphic
organisers show moderate-to-large gains for students with learning disabilities (Dexter &
Hughes, 2011), and concept mapping raises achievement by about 0.42 SD when the learner
builds the map (Nesbit & Adesope, 2006).

### It does not support some things this product could have been built on

- **Learning styles.** Matching teaching to a child's stated style has no support: the
  meshing hypothesis fails when tested (Pashler et al., 2008; Kirschner, 2017). Upside
  therefore offers several ways into a word, but never asks a child what kind of learner
  they are, and never locks a view.
- **Branded Orton-Gillingham programmes.** A meta-analysis of OG interventions for students
  with or at risk of word-level reading disabilities found **no statistically significant
  effect** on foundational skills (ES = 0.22, p = .40) or on vocabulary and comprehension
  (ES = 0.14, p = .57) (Stevens et al., 2021). What survives is the *content* — explicit,
  systematic work on sounds, spellings and word parts — not the brand.
- **Reading by analogy, unaided.** Beginning readers can read "peak" from "beak" (Goswami),
  but dyslexic readers make significantly less use of orthographic analogies than younger
  reading-age-matched children (Hanley, Reynolds & Thornton, 1997). So the family has to be
  *shown*, not assumed to be noticed.
- **The strengths story, as fact.** There is evidence of a global visual-spatial advantage
  on specific tasks (von Károlyi et al., 2003) and a serious hypothesis that dyslexia is a
  specialisation in explorative search (Taylor & Vestergaard, 2022). There are also
  meta-analyses of visual-spatial *deficits*. Upside is built so that exploration is
  possible and rewarded, because that is good for motivation either way — but nothing in
  the teaching depends on the strengths claim being true.

---

## 3. The model, in five layers

### Layer 1 — The content graph (`src/shared/graph.ts`)

English is held as a graph, not a queue. Nodes:

| Node | Example | Where it comes from |
| --- | --- | --- |
| Word | `butterfly` | the hand-checked bank, a word the child typed, or a rhyming cousin |
| Letter-sound | `sh` says "sh" | the bank's checked sound breakdowns |
| Rime family | `-at` | derived from spelling, plus a hand-listed family of cousins |
| Word part | `ing`, `photo` | a hand-checked table, with meanings in plain words |
| Topic | Animals | the bank's own topics |

Edges say *why* two things are near each other: shares a sound, rhymes with, shares a word
part, means something similar. Everything the child can do — the map, the lenses, the next
word — is a walk on this graph.

Why a graph: a child who cannot read "butterfly" is not missing the next item on a list.
They are missing a link — to "but", which they can read, or to the `-y` ending they have
seen, or to a picture of the thing. A queue has one way in. A graph has as many as the word
has parts.

### Layer 2 — Six lenses (`src/app/Lenses.tsx`)

The same word, shown six ways: **sounds**, **chunks**, **word parts**, **shape**,
**picture**, **family**. Each is a different external representation with a different job:
sounds carry the code, chunks carry the rhythm, parts carry meaning, shape carries the
visual signature dyslexic readers confuse, picture carries the referent, family carries the
analogy.

The child chooses. Upside records which lens their successes follow and will suggest it —
and that is all it does with it. This is a record of results, not a style.

### Layer 3 — The learner model (`src/shared/learner.ts`)

One number per letter-sound: the probability the child knows it, updated with Bayesian
knowledge tracing (Corbett & Anderson, 1995) with deliberately cautious parameters — prior
0.20, learn 0.14, guess 0.25, slip 0.10. Evidence comes only from real attempts: saying a
word out loud, and card reviews. Tapping to hear a sound is exposure, not evidence, and does
not move the number.

The model is crude on purpose. When a word is read wrong, every sound in it takes the same
small hit, because the app genuinely does not know which sound failed. It is better to be
vague and honest than precise and wrong.

### Layer 4 — What to practise next (`suggest()`)

Priority, in order:

1. **Cards that are due.** The deck's three boxes bring a kept word back after 1, 3 or 7
   days; "not yet" returns it the same day. Spacing and retrieval, which is where the
   biggest effects are.
2. **One shaky sound, in a familiar frame.** A word whose other sounds the child has already
   met. Stretch by one link, not five.
3. **The unmet sound that unlocks the most words**, measured as reach in the graph.

Every suggestion carries its reason in words, shown to the child ("because 'sh' is still
shaky, and the rest of this word uses sounds you have already met") and to the teacher.

### Layer 5 — Teaching moves

- **Flex it** (`src/shared/flex.ts`). When a try misses, the app names the move: a letter's
  other sound, each with a word the child knows, then try again. Set for variability, taught
  as a habit rather than hoped for.
- **Meaning with every word.** A picture and a plain-words definition sit with the sounds,
  because decoding a word and knowing it are different skills.
- **Coins for tries, never for correctness.** Nothing is taken away, ever — including
  stickers and kept words.
- **Sparky Helps.** When the optional camera helper sees a sustained upset face, the child
  is offered a break or an easier word. It offers; the child decides.

---

## 4. The AI layer, and its fence

One service, `helper/api/ai.js`, deployed apart from the site. It takes **one English word**
and returns chunks, word parts, a meaning, an example sentence, a memory hook and rhymes,
so that a word outside the 36-word bank still has a meaning and a family.

What it may do:

- Answer about a word.
- Have its answer folded into the graph, so the lenses and the map keep working.

What it may not do, by construction rather than by policy:

- **See a child.** The request body is a single word. No name, no progress, no camera, no
  device data, ever.
- **Take free text.** There is no prompt field, so there is nothing for a visitor to steer.
- **Speak as Sparky.** It returns data. Nothing it writes is read to a child as the
  companion's voice, and everything it writes is labelled machine-made and unchecked.
- **Overrule a person.** Chunks are accepted only if they spell the word back exactly, and
  Upside sounds them out with its own splitter. A hand-checked entry always wins.
- **Be required.** With no API key set the service answers 503, the app stops asking, and
  everything else works exactly as before.

The key lives in the service's environment and never reaches a browser.

---

## 5. What the child sees, and what the grown-up sees

**The child:** six ways into a word, a map they can travel, a reason for the next word, a
deck of their own words, a daily goal, a streak, stickers, and a dragon. No scores, no
ranking, no red marks.

**The grown-up:** in the educator view, for the learner on that device, the model in full —
every letter-sound with the model's confidence and how many tries it rests on, the lens
their successes follow, and the next word with its reason. A model a teacher cannot inspect
is a model they cannot overrule, and they should always be able to overrule it.

**Nobody:** feelings check-ins and Sparky Helps readings are never shown to teachers, and
never leave the device.

---

## 6. The pilot: private K2 classrooms first

**Why K2, and why private.** Preschool is where early literacy screening already happens —
the Dyslexia Association of Singapore screens K1 and K2 children for early literacy
difficulties, a year or more before any formal diagnosis is possible. A private preschool
can also say yes on its own: one principal's decision, not a ministry process. That is the
fastest honest route to finding out whether this works.

**Shape.** Eight weeks. One class at a time. Ten minutes a day, three days a week, on the
school's own tablets. A grown-up present, because that is the real deployment.

**What we would measure.**

| Measure | Why |
| --- | --- |
| Letter-sounds known, before and after | The thing the model claims to teach |
| Words read from a short list, before and after | Whether it transfers off the screen |
| Days the child came back on their own | The only engagement number that matters |
| Tries out loud per session | Confidence, not correctness |
| Teacher's judgement of who it helped and who it did not | The check on everything above |

**What we would not do.** No control group at this size; no claims of efficacy from a single
class; no child-level data leaving the device; no collection of feelings data for research.

---

## 7. What would show this model is wrong

- Children use one lens and never change, and the lens record predicts nothing.
- The suggested "next word" is no better than the next word in the list.
- The map is opened once out of curiosity and never again.
- Teachers look at the model panel and disagree with it more often than they agree.
- Words kept in the deck are not read better a week later than words that were not.

Each of these is measurable in the pilot, and each would change the product rather than the
pitch.

---

## 8. References

- Ainsworth, S. (2006). DeFT: A conceptual framework for considering learning with multiple representations. *Learning and Instruction*, 16(3).
- Corbett, A. T., & Anderson, J. R. (1995). Knowledge tracing: Modeling the acquisition of procedural knowledge. *User Modeling and User-Adapted Interaction*, 4.
- Dexter, D. D., & Hughes, C. A. (2011). Graphic organizers and students with learning disabilities: A meta-analysis. *Learning Disability Quarterly*, 34(1).
- Dunlosky, J., et al. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest*, 14(1).
- Ehri, L. C. (2014/2017). Orthographic mapping in the acquisition of sight word reading, spelling memory, and vocabulary learning.
- Goodwin, A. P., & Ahn, S. (2010). A meta-analysis of morphological interventions: Effects on literacy achievement of children with literacy difficulties. *Annals of Dyslexia*, 60.
- Goswami, U. (1991). Learning about spelling sequences: The role of onsets and rimes in analogies in reading. *Child Development*, 62.
- Hanley, J. R., Reynolds, C. J., & Thornton, A. (1997). Orthographic analogies and developmental dyslexia. *British Journal of Psychology*, 88.
- Hattie, J., & Donoghue, G. (2021). A meta-analysis of ten learning techniques. *Frontiers in Education*, 6.
- Kirschner, P. A. (2017). Stop propagating the learning styles myth. *Computers & Education*, 106.
- Ministry of Education, Singapore (2021). Parliamentary reply on dyslexia: prevalence, Early Literacy Indicator, Learning Support Programme.
- Nesbit, J. C., & Adesope, O. O. (2006). Learning with concept and knowledge maps: A meta-analysis. *Review of Educational Research*, 76(3).
- Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. *Psychological Science in the Public Interest*, 9(3).
- Rowland, C. A. (2014). The effect of testing versus restudy on retention: A meta-analytic review of the testing effect. *Psychological Bulletin*, 140(6).
- Steacy, L. M., et al. (2023). Set for variability as a critical predictor of word reading. *Reading Research Quarterly*, 58(2).
- Stevens, E. A., Austin, C., Moore, C., Scammacca, N., Boucher, A. N., & Vaughn, S. (2021). Examining the effects of Orton-Gillingham reading interventions. *Exceptional Children*, 87(4).
- Taylor, H., & Vestergaard, M. D. (2022). Developmental dyslexia: Disorder or specialization in exploration? *Frontiers in Psychology*, 13.
- von Károlyi, C., Winner, E., Gray, W., & Sherman, G. F. (2003). Dyslexia linked to talent: Global visual-spatial ability. *Brain and Language*, 85(3).
