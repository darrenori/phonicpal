import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Blocks, LayoutDashboard, Mic, ShieldCheck, Volume2 } from 'lucide-react';
import { Logo } from '../components/Logo';
import { WordBar, ShapeLegend } from '../components/WordBar';
import { Sparky, type SparkyMood } from '../components/Sparky';
import { MouthShape } from '../components/Mouth';
import { BarModel, Counters, NumberSentence } from '../components/MathBlocks';
import { ReadingLayer, ReadingTools } from '../components/ReadingTools';
import { StepRail } from '../app/StepRail';
import { MiniClass } from '../educators/MiniClass';
import { buildWord, WORD_BANK, type Word } from '../shared/words';
import { PROBLEMS } from '../shared/math';
import { speak } from '../shared/speech';
import { href } from '../shared/routes';
import type { Step } from '../shared/progress';
import '../app/app.css';
import './landing.css';

const APP = href('app', 'home');
const EDU = href('educators', 'home');

function heroSize(word: Word): string {
  const n = word.word.length * 0.72 + 1.2;
  return `clamp(1.5rem, calc((min(100vw, 78rem) - 4.5rem) / ${n.toFixed(2)}), 6rem)`;
}

/* ---------- Hero ---------- */

function Hero() {
  const [word, setWord] = useState<Word>(() => WORD_BANK.find((w) => w.word === 'butterfly')!);
  const [split, setSplit] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [build, setBuild] = useState(0);
  const [mood, setMood] = useState<SparkyMood>('happy');

  // Build the word, then split it into its parts, the way a bar model splits a whole.
  useEffect(() => {
    setSplit(false);
    const t = window.setTimeout(() => setSplit(true), 1300);
    return () => window.clearTimeout(t);
  }, [build]);

  const show = (w: Word) => {
    setWord(w);
    setActive(null);
    setBuild((b) => b + 1);
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-top wrap">
        <div className="hero-copy">
          <h1 id="hero-title">Every word, built block by block.</h1>
          <p className="hero-lead">
            PhonicPal is a practice companion for children aged 5 to 12 with dyslexia. Words become blocks they can see, hear, tap and say, between specialist
            sessions, at home or in school.
          </p>
        </div>
        <div className="hero-actions">
          <a className="rod" href={APP}>
            <span className="rod-label">Try the learner app</span>
            <span className="rod-unit">
              <ArrowRight size={20} aria-hidden="true" />
            </span>
          </a>
          <a className="rod rod--ghost" href={EDU}>
            <span className="rod-label">See the educator view</span>
          </a>
        </div>
      </div>

      <div className="wrap">
        <div className="hero-stage mat">
          <div className="hero-bar">
            <WordBar
              key={`${word.word}-${build}`}
              word={word}
              split={split}
              build
              size={heroSize(word)}
              activePart={active}
              onPart={(i) => {
                setSplit(true);
                setActive(i);
                speak(word.syllables[i].say, { rate: 0.7 });
              }}
              onWhole={() => {
                // Tapping the whole splits it into parts, or joins the parts back up.
                setSplit((s) => !s);
                setActive(null);
                setMood('cheer');
                window.setTimeout(() => setMood('happy'), 1400);
                speak(word.word, { rate: 0.7 });
              }}
            />
            <Sparky className="hero-sparky" mood={mood} size="clamp(4.5rem, 11vw, 9rem)" title="Sparky the dragon" />
          </div>

          <div className="hero-controls">
            <form
              className="hero-type"
              onSubmit={(e) => {
                e.preventDefault();
                const w = buildWord(typed);
                if (w) {
                  show(w);
                  setTyped('');
                }
              }}
            >
              <label htmlFor="hero-word" className="visually-hidden">
                Type any word to build it
              </label>
              <input
                id="hero-word"
                className="input"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Type any word, like crocodile"
                autoComplete="off"
                spellCheck={false}
                maxLength={16}
              />
              <button type="submit" className="rod rod--ink" disabled={!typed.trim()}>
                <span className="rod-label">Build it</span>
                <span className="rod-unit">
                  <Blocks size={18} aria-hidden="true" />
                </span>
              </button>
            </form>
            <div className="hero-try">
              <span>or try</span>
              {['elephant', 'dinosaur', 'rabbit', 'jumping'].map((w) => (
                <button key={w} type="button" className="tile" onClick={() => show(buildWord(w)!)} aria-pressed={word.word === w}>
                  {w}
                </button>
              ))}
            </div>
            <ShapeLegend compact />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- The gap ---------- */

function Gap() {
  const [filled, setFilled] = useState(true);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <section className="surface-band" aria-labelledby="gap-title">
      <div className="wrap gap">
        <h2 id="gap-title" className="gap-title">
          Specialists give children high-impact care. Between sessions, practice goes quiet.
        </h2>
        <div className="gap-body">
          <p>
            SpED teachers and therapists do essential work. But children lack continuous, tailored practice during free time, or whenever direct specialist
            support isn’t available. PhonicPal bridges the gap between formal sessions and home practice.
          </p>
          <p>
            Our mission is a safe, relaxing space where children practise literacy on their own, without academic pressure, judgement or anxiety. Learning
            should build self-confidence and fit into a child’s everyday life.
          </p>
        </div>
        <figure className="week-model">
          <figcaption>
            <span>An example week with one specialist session</span>
            <button type="button" className="tile" aria-pressed={filled} onClick={() => setFilled((f) => !f)}>
              {filled ? 'Hide PhonicPal practice' : 'Add PhonicPal practice'}
            </button>
          </figcaption>
          <div className="week-whole" aria-hidden="true">
            <span>One week</span>
            <span className="brace brace--top" />
          </div>
          <div className="week-bar" role="img" aria-label={`Monday: specialist session. Tuesday to Sunday: ${filled ? 'short practice with PhonicPal' : 'no structured practice'}.`}>
            {days.map((d, i) => (
              <div key={d} className="week-cell-wrap">
                <span className={`week-cell ${i === 0 ? 'is-session' : filled ? 'is-practice' : 'is-empty'}`} style={{ animationDelay: `${i * 60}ms` }}>
                  {i === 0 ? 'Session' : filled ? 'Practice' : ''}
                </span>
                <span className="week-cell-day">{d}</span>
              </div>
            ))}
          </div>
        </figure>
      </div>
    </section>
  );
}

/* ---------- Four steps ---------- */

const STEP_COPY: Record<Step, { title: string; body: string }> = {
  see: {
    title: 'See the shape',
    body: 'Letters become blocks whose height shows their shape. Tall letters reach up and hanging letters drop below the line. Tricky b, d, p and q get a helper for which side their round tummy faces.',
  },
  hear: {
    title: 'Hear the parts',
    body: 'The word splits into syllables the way a bar model splits a whole into parts. Children tap each part to hear it slowly, then join them back into the word.',
  },
  tap: {
    title: 'Tap the sounds',
    body: 'Each syllable breaks into sound boxes. Every tap plays the sound with a keyword, like “b as in bat”, and shows the mouth shape that makes it.',
  },
  say: {
    title: 'Say it out loud',
    body: 'Children say the word to Sparky, with an optional camera mirror for mouth shapes. Every try earns coins, so a near miss is still a win.',
  },
};

function Steps() {
  const word = useMemo(() => WORD_BANK.find((w) => w.word === 'rabbit')!, []);
  const [step, setStep] = useState<Step>('see');
  const [active, setActive] = useState<number | null>(null);
  const [sound, setSound] = useState(word.syllables[0].sounds[0]);
  const rail = (['see', 'hear', 'tap', 'say'] as Step[]).map((id) => ({ id, label: STEP_COPY[id].title }));

  return (
    <section className="steps-section" id="how" aria-labelledby="steps-title">
      <div className="wrap">
        <div className="section-intro">
          <h2 id="steps-title">Four steps, one word at a time.</h2>
          <p>
            Structured, multi-sensory practice in the spirit of the Orton-Gillingham approach. Every word is seen, heard, tapped and said, so it’s learned
            through more than one sense.
          </p>
        </div>
        <StepRail steps={rail} current={step} done={{}} onSelect={setStep} label="The four steps" />
        <div className="steps-demo">
          <div className="steps-copy">
            <h3>{STEP_COPY[step].title}</h3>
            <p>{STEP_COPY[step].body}</p>
          </div>
          <div className="stage mat steps-stage">
            {step !== 'tap' && step !== 'say' && (
              <WordBar
                word={word}
                split={step === 'hear'}
                size="clamp(2.2rem, 7vw, 5rem)"
                activePart={active}
                onPart={
                  step === 'hear'
                    ? (i) => {
                        setActive(i);
                        speak(word.syllables[i].say, { rate: 0.7 });
                      }
                    : undefined
                }
                onWhole={() => speak(word.word, { rate: 0.7 })}
              />
            )}
            {step === 'tap' && (
              <div className="steps-tap">
                <div className="soundboxes">
                  {word.syllables.map((syl, si) => (
                    <div key={si} className="sb-group">
                      {syl.sounds.map((s, ui) => (
                        <button
                          key={ui}
                          type="button"
                          className={`sb is-on ${sound === s ? 'is-current' : ''}`}
                          onClick={() => {
                            setSound(s);
                            speak(`${s.say}. As in ${s.key}.`, { rate: 0.75 });
                          }}
                          aria-label={`${s.grapheme}, as in ${s.key}`}
                        >
                          <span className="sb-sound">{s.grapheme}</span>
                          <span className="sb-key">{s.key}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                <MouthShape viseme={sound.viseme} label={`Mouth shape for ${sound.grapheme}`} />
              </div>
            )}
            {step === 'say' && (
              <div className="steps-say">
                <MouthShape viseme="curl" label="Mouth shape for r at the start of rabbit" />
                <div className="steps-say-copy">
                  <button type="button" className="rod rod--leaf" onClick={() => speak('rabbit', { rate: 0.6 })}>
                    <span className="rod-label">Hear “rabbit”</span>
                    <span className="rod-unit">
                      <Volume2 size={20} aria-hidden="true" />
                    </span>
                  </button>
                  <p>
                    <Mic size={16} aria-hidden="true" /> In the app, the microphone listens once and generously. Sound and camera stay on the device.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Maths ---------- */

function Maths() {
  const problem = PROBLEMS.find((p) => p.id === 'mynahs')!;
  const [revealed, setRevealed] = useState(false);
  return (
    <section className="band band--deep" id="maths" aria-labelledby="maths-title">
      <div className="wrap maths-section">
        <div className="section-intro">
          <h2 id="maths-title">Story sums, drawn as bar models.</h2>
          <p>
            Word problems are hard when reading is hard. PhonicPal reads the story aloud, highlights the clue words, then shows the sum three ways: counters to
            count, a Singapore-style bar model to draw, and the number sentence to write.
          </p>
        </div>
        <div className="maths-demo">
          <p className="story">
            There are 12 mynah birds on a tree. 4 <mark>fly away</mark>. How many birds are left?
          </p>
          <div className="cpa">
            <div className="cpa-layer">
              <h3>Count it</h3>
              <Counters problem={problem} revealed={revealed} />
            </div>
            <div className="cpa-layer">
              <h3>Draw it</h3>
              <BarModel problem={problem} revealed={revealed} />
            </div>
          </div>
          <div className="cpa-layer">
            <h3>Write it</h3>
            <div className="maths-answer">
              <NumberSentence
                tokens={[
                  { kind: 'num', value: 12 },
                  { kind: 'op', op: '−' },
                  { kind: 'num', value: 4 },
                  { kind: 'eq' },
                  { kind: 'num', value: 8 },
                ]}
                revealed={revealed}
                size="lg"
              />
              <button
                type="button"
                className="rod rod--lemon"
                onClick={() => {
                  setRevealed((r) => !r);
                  if (!revealed) speak(problem.solution);
                }}
              >
                <span className="rod-label">{revealed ? 'Hide the answer' : 'Show the answer'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Sparky ---------- */

const FEEL_REPLY: Record<string, string> = {
  happy: 'Yay! Let’s keep building.',
  okay: 'Okay is fine. One block at a time.',
  stuck: 'Let’s breathe together first. Then an easier word.',
  tired: 'Rest is important. Sparky will wait.',
};

function SparkySection() {
  const [feel, setFeel] = useState<string | null>(null);
  const moods: Array<[string, SparkyMood]> = [
    ['happy', 'happy'],
    ['okay', 'okay'],
    ['stuck', 'stuck'],
    ['tired', 'sleepy'],
  ];
  return (
    <section className="surface-band" aria-labelledby="sparky-title">
      <div className="wrap sparky-section">
        <div className="sparky-figure">
          <Sparky mood={feel === 'stuck' ? 'calm' : feel === 'tired' ? 'sleepy' : 'cheer'} hat="crown" neck="scarf" size="clamp(11rem, 26vw, 17rem)" title="Sparky wearing a crown and scarf" />
        </div>
        <div className="sparky-copy">
          <h2 id="sparky-title">Tries earn coins. Mistakes never cost any.</h2>
          <p>
            Sparky is a friendly dragon who cheers for effort. Children earn coins for building words, trying out loud and checking in, then spend them on
            curry puffs, kites and crowns. Nothing is ever taken away.
          </p>
          <div className="feel-demo">
            <p className="feel-demo-q">How are you feeling?</p>
            <div className="feel-demo-row">
              {moods.map(([id, mood]) => (
                <button key={id} type="button" className="feel-demo-btn" aria-pressed={feel === id} onClick={() => setFeel(id)}>
                  <Sparky crop="head" mood={mood} size="3.2rem" idle={false} />
                  <span>{id[0].toUpperCase() + id.slice(1)}</span>
                </button>
              ))}
            </div>
            <p className="feel-demo-a" aria-live="polite">
              {feel ? `Sparky: “${FEEL_REPLY[feel]}”` : 'Check-ins are the child’s own words, and they help educators notice who needs support.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Reading tools ---------- */

function Tools() {
  return (
    <section className="tools-section" id="tools" aria-labelledby="tools-title">
      <div className="wrap tools-grid">
        <div className="section-intro">
          <h2 id="tools-title">Make the page fit the reader.</h2>
          <p>
            Every child reads differently. Choose OpenDyslexic or Atkinson Hyperlegible letters, add space between letters and lines, lay a coloured overlay
            over the screen, or follow along with a reading ruler.
          </p>
          <p className="tools-note">These controls change this page right now. Try the rose overlay or the reading ruler.</p>
        </div>
        <div className="panel tools-panel">
          <ReadingTools compact />
        </div>
      </div>
    </section>
  );
}

/* ---------- Schools ---------- */

function Schools() {
  return (
    <section className="schools" id="schools" aria-labelledby="schools-title">
      <div className="wrap">
        <div className="section-intro">
          <h2 id="schools-title">For schools and SpED providers.</h2>
          <p>
            Supporting specialist educators, not replacing them. See who practised, which sounds need support, and how children say they feel, without
            watching over a child’s shoulder.
          </p>
        </div>
        <div className="schools-grid">
          <div className="schools-preview">
            <MiniClass />
            <a className="rod" href={EDU}>
              <span className="rod-label">Open the educator demo</span>
              <span className="rod-unit">
                <LayoutDashboard size={20} aria-hidden="true" />
              </span>
            </a>
          </div>
          <div className="schools-points">
            <div>
              <h3>What a pilot will measure</h3>
              <ul className="brick-list">
                <li>Practice minutes, and the days children come back on their own</li>
                <li>Words secured through all four steps, and the sounds that need support</li>
                <li>Brave tries out loud, counted as effort rather than scored</li>
                <li>Feelings check-ins over time, as a signal of confidence</li>
              </ul>
            </div>
            <div>
              <h3>
                <ShieldCheck size={20} aria-hidden="true" /> Private by design
              </h3>
              <ul className="brick-list">
                <li>The camera mirror and microphone are opt-in and never record</li>
                <li>Homework photos are read inside the browser, never uploaded</li>
                <li>No ads, no chat, and no public leaderboards</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Roadmap ---------- */

const PHASES = [
  { name: 'Phase 1', when: 'Now', title: 'Prototype', body: 'Prototype refinement, accessibility tuning and ongoing consultations with experts.', now: true },
  { name: 'Phase 2', when: 'Next', title: 'Pilots', body: 'Structured pilots with dyslexia associations and specialised learning centres.' },
  { name: 'Phase 3', when: 'Later', title: 'Adoption', body: 'Institutional licences for schools, supported by education grant frameworks.' },
];

function Roadmap() {
  return (
    <section className="roadmap" id="roadmap" aria-labelledby="roadmap-title">
      <div className="wrap">
        <div className="section-intro">
          <h2 id="roadmap-title">Depth first, then breadth.</h2>
          <p>
            We’re focusing on one underserved need and doing it well. Later, the same accessible, multi-sensory engine can grow to support ADHD and early
            literacy.
          </p>
        </div>
        <div className="road">
          <div className="road-whole">
            <span>From prototype to every classroom that needs it</span>
            <span className="brace brace--top" aria-hidden="true" />
          </div>
          <ol className="road-parts">
            {PHASES.map((p) => (
              <li key={p.name} className={`road-part ${p.now ? 'is-now' : ''}`}>
                <div className="road-block">
                  <strong>{p.name}</strong>
                  <span>{p.when}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ---------- Close ---------- */

function Close() {
  return (
    <section className="band band--leaf" aria-labelledby="close-title">
      <div className="wrap close">
        <Sparky className="close-sparky" mood="cheer" hat="cap" size="clamp(9rem, 18vw, 14rem)" />
        <h2 id="close-title">Built with specialists, for the hours in between.</h2>
        <p>PhonicPal is a Phase 1 prototype. We’re preparing structured pilots with dyslexia associations and specialised learning centres.</p>
        <div className="step-actions">
          <a className="rod rod--surface" href={APP}>
            <span className="rod-label">Try the learner app</span>
            <span className="rod-unit">
              <ArrowRight size={20} aria-hidden="true" />
            </span>
          </a>
          <a className="rod rod--ghost" href={EDU}>
            <span className="rod-label">Open the educator demo</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function Landing() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-bar">
        <div className="wrap site-bar-inner">
          <Logo href={href('home', 'home')} />
          <nav aria-label="Sections" className="site-nav">
            <a href="#how">How it works</a>
            <a href="#maths">Maths</a>
            <a href="#tools">Reading tools</a>
            <a href="#schools">For schools</a>
            <a href="#roadmap">Roadmap</a>
          </nav>
          <a className="rod rod--sm" href={APP}>
            <span className="rod-label">Try the app</span>
            <span className="rod-unit">
              <ArrowRight size={16} aria-hidden="true" />
            </span>
          </a>
        </div>
      </header>
      <main id="main">
        <Hero />
        <Gap />
        <Steps />
        <Maths />
        <SparkySection />
        <Tools />
        <Schools />
        <Roadmap />
        <Close />
      </main>
      <footer className="site-foot">
        <div className="wrap site-foot-inner">
          <Logo />
          <p>Supporting, not replacing, specialist educators.</p>
          <nav aria-label="Footer" className="site-foot-links">
            <a href={APP}>Learner app</a>
            <a href={EDU}>Educator demo</a>
            <a href="#tools">Reading tools</a>
          </nav>
          <p className="site-foot-small">© 2026 PhonicPal · Phase 1 prototype for K2 to P6 learners</p>
        </div>
      </footer>
      <ReadingLayer />
    </>
  );
}
