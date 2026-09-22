import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Mic, MicOff, Search, Video, VideoOff, Volume2 } from 'lucide-react';
import { WordBar, ShapeLegend } from '../components/WordBar';
import { WordCard } from '../components/WordCard';
import { MouthShape } from '../components/Mouth';
import { Sparky, type SparkyMood } from '../components/Sparky';
import { Hear } from '../components/Controls';
import { CONFUSABLES } from '../shared/letters';
import { VISEME_TIP, type Viseme } from '../shared/sounds';
import { LEVELS, WORD_BANK, buildWord, type Level, type Word } from '../shared/words';
import { canListen, heardTarget, listenOnce, speak } from '../shared/speech';
import { completeStep, logTry, useProgress, STEPS, type Step } from '../shared/progress';
import { StepRail } from './StepRail';
import { celebrate } from './CoinToast';
import { go } from './App';

const STEP_LABEL: Record<Step, string> = { see: 'See it', hear: 'Hear it', tap: 'Tap the sounds', say: 'Say it' };
const RAIL = STEPS.map((id) => ({ id, label: STEP_LABEL[id] }));

function award(word: string, step: Step) {
  const coins = completeStep(word, step);
  celebrate(coins, step === 'say' ? 'for trying out loud' : 'for building');
}

/* ---------- Word picker ---------- */

function WordPicker({ current, onPick }: { current: Word; onPick: (w: Word) => void }) {
  const progress = useProgress();
  const [level, setLevel] = useState<Level>(current.guessed ? 'P3–P4' : current.level);
  const [typed, setTyped] = useState('');
  const words = WORD_BANK.filter((w) => w.level === level);

  return (
    <aside className="picker" aria-label="Choose a word">
      <div className="picker-head">
        <h2>Choose a word</h2>
        <Hear text="Choose a word to build. Pick your level first." />
      </div>
      <div className="tiles picker-levels" role="radiogroup" aria-label="Level">
        {LEVELS.map((l) => (
          <button key={l} type="button" role="radio" aria-checked={level === l} className="tile" onClick={() => setLevel(l)}>
            {l}
          </button>
        ))}
      </div>
      <ul className="picker-words">
        {words.map((w) => {
          const steps = progress.wordSteps[w.word] ?? {};
          return (
            <li key={w.word}>
              <button type="button" className="picker-word" aria-pressed={current.word === w.word} onClick={() => onPick(w)}>
                <span className="picker-pic" aria-hidden="true">
                  {w.picture}
                </span>
                <span>{w.word}</span>
                <span className="picker-dots" aria-label={`${STEPS.filter((s) => steps[s]).length} of 4 steps done`}>
                  {STEPS.map((s) => (
                    <span key={s} className={steps[s] ? 'is-on' : ''} />
                  ))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <form
        className="picker-type"
        onSubmit={(e) => {
          e.preventDefault();
          const built = buildWord(typed);
          if (built) {
            onPick(built);
            setTyped('');
          }
        }}
      >
        <label htmlFor="type-word" className="field-label">
          Or type your own word
        </label>
        <div className="picker-type-row">
          <input id="type-word" className="input" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="e.g. crocodile" autoComplete="off" spellCheck={false} maxLength={20} />
          <button type="submit" className="cube cube--lg cube--cobalt" aria-label="Build this word" disabled={!typed.trim()}>
            <Search size={20} aria-hidden="true" />
          </button>
        </div>
      </form>
    </aside>
  );
}

/* ---------- Mouth panel with optional mirror ---------- */

function MouthPanel({ viseme, grapheme, speaking }: { viseme: Viseme; grapheme?: string; speaking: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mirror, setMirror] = useState<'off' | 'on' | 'blocked' | 'none'>('off');

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  useEffect(() => stop, []);

  const toggle = async () => {
    if (mirror === 'on') {
      stop();
      setMirror('off');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMirror('none');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      setMirror('on');
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      });
    } catch {
      setMirror('blocked');
    }
  };

  return (
    <section className="mouth-panel" aria-label="Mouth guide">
      <div className="mouth-panel-views">
        <div className="mouth-panel-view">
          <MouthShape viseme={viseme} speaking={speaking} label={`Mouth shape for ${grapheme ?? 'this sound'}`} />
          <span className="mouth-panel-caption">Sparky’s mouth</span>
        </div>
        {mirror === 'on' && (
          <div className="mouth-panel-view">
            <video ref={videoRef} className="mirror" autoPlay muted playsInline aria-label="Your camera mirror" />
            <span className="mouth-panel-caption">Your mirror</span>
          </div>
        )}
      </div>
      <p className="mouth-tip">
        {grapheme && <strong className="mouth-tip-sound">{grapheme}</strong>}
        {VISEME_TIP[viseme]}
      </p>
      <div className="mouth-panel-actions">
        <Hear text={VISEME_TIP[viseme]} label="Hear the mouth tip" />
        <button type="button" className="rod rod--surface rod--sm" onClick={toggle} aria-pressed={mirror === 'on'}>
          <span className="rod-label">
            {mirror === 'on' ? <VideoOff size={16} aria-hidden="true" /> : <Video size={16} aria-hidden="true" />}
            {mirror === 'on' ? 'Turn off mirror' : 'Use a mirror'}
          </span>
        </button>
      </div>
      <p className="mouth-privacy">
        {mirror === 'blocked'
          ? 'The camera is blocked. A grown-up can allow it in the browser settings, or use a real mirror.'
          : mirror === 'none'
            ? 'This browser has no camera mirror. A real mirror works just as well.'
            : 'The mirror stays on this device. Nothing is recorded.'}
      </p>
    </section>
  );
}

/* ---------- Steps ---------- */

function SeeStep({ word, onDone }: { word: Word; onDone: () => void }) {
  const tricky = Array.from(new Set(word.word.split('').filter((c) => c in CONFUSABLES)));
  const tall = word.word.split('').filter((c) => 'bdfhklt'.includes(c)).length;
  const hang = word.word.split('').filter((c) => 'gjpqy'.includes(c)).length;
  const prompt = `Look at the shape of ${word.word}. It has ${tall} tall ${tall === 1 ? 'letter' : 'letters'} and ${hang} hanging ${hang === 1 ? 'letter' : 'letters'}.`;
  return (
    <div className="step">
      <p className="step-prompt">
        {prompt} <Hear text={prompt} />
      </p>
      <ShapeLegend />
      <WordCard word={word} />
      {tricky.length > 0 && (
        <div className="tricky">
          <strong>Tricky {tricky.length === 1 ? 'letter' : 'letters'}</strong>
          {tricky.map((c) => (
            <p key={c}>
              <span className="tricky-letter">{c}</span> {CONFUSABLES[c]} <Hear text={`${c}. ${CONFUSABLES[c]}`} />
            </p>
          ))}
        </div>
      )}
      <button type="button" className="rod" onClick={onDone}>
        <span className="rod-label">I can see it</span>
        <span className="rod-unit">
          <ArrowRight size={20} aria-hidden="true" />
        </span>
      </button>
    </div>
  );
}

function SayStep({ word, onDone, setMood }: { word: Word; onDone: () => void; setMood: (m: SparkyMood) => void }) {
  const [state, setState] = useState<'ready' | 'listening' | 'heard' | 'close' | 'quiet' | 'blocked'>('ready');
  const cancelRef = useRef<() => void>(() => {});
  useEffect(() => () => cancelRef.current(), []);

  const finish = (heard: boolean) => {
    logTry();
    setMood(heard ? 'cheer' : 'happy');
    onDone();
  };

  const listen = async () => {
    setState('listening');
    setMood('think');
    const { result, cancel } = listenOnce();
    cancelRef.current = cancel;
    const r = await result;
    if (r.kind === 'heard') {
      const ok = heardTarget(r.transcripts, word.word);
      setState(ok ? 'heard' : 'close');
      if (ok) speak(`Yes! ${word.word}!`);
      finish(ok);
    } else if (r.kind === 'blocked') {
      setState('blocked');
      setMood('happy');
    } else {
      setState('quiet');
      setMood('happy');
    }
  };

  const message = {
    ready: `Now you say it. Look at Sparky’s mouth, then say “${word.word}” out loud.`,
    listening: 'Listening… say the word now.',
    heard: `You said “${word.word}”! Sparky heard you.`,
    close: 'Great try! Listen to the word once more, then have another go whenever you like.',
    quiet: 'I didn’t hear anything that time. Move a little closer and try again.',
    blocked: 'The microphone is off. Say it out loud to Sparky, then tap “I said it”.',
  }[state];

  return (
    <div className="step">
      <p className="step-prompt" aria-live="polite">
        {message} <Hear text={message} />
      </p>
      <div className="step-actions">
        <button type="button" className="rod rod--surface" onClick={() => speak(word.word, { rate: 0.6 })}>
          <span className="rod-label">
            <Volume2 size={18} aria-hidden="true" /> Hear it slowly
          </span>
        </button>
        {canListen && state !== 'blocked' && (
          <button type="button" className="rod rod--leaf" onClick={listen} disabled={state === 'listening'}>
            <span className="rod-label">{state === 'listening' ? 'Listening…' : state === 'ready' ? 'Say it' : 'Say it again'}</span>
            <span className="rod-unit">{state === 'listening' ? <MicOff size={20} aria-hidden="true" /> : <Mic size={20} aria-hidden="true" />}</span>
          </button>
        )}
        {(!canListen || state === 'blocked' || state === 'quiet') && (
          <button type="button" className="rod rod--leaf" onClick={() => finish(false)}>
            <span className="rod-label">I said it</span>
            <span className="rod-unit">
              <ArrowRight size={20} aria-hidden="true" />
            </span>
          </button>
        )}
      </div>
      {!canListen && <p className="step-note">This browser can’t listen, so Sparky trusts you. Say it out loud!</p>}
    </div>
  );
}

/* ---------- Screen ---------- */

export function WordsScreen({ initialWord }: { initialWord?: string }) {
  const progress = useProgress();
  const [word, setWord] = useState<Word>(() => (initialWord && buildWord(initialWord)) || WORD_BANK.find((w) => w.word === 'butterfly')!);
  const [step, setStep] = useState<Step>('see');
  const [wholeSplit, setWholeSplit] = useState(false);
  const [heardParts, setHeardParts] = useState<Set<number>>(new Set());
  const [tapped, setTapped] = useState<Set<string>>(new Set());
  const [activePart, setActivePart] = useState<number | null>(null);
  const [mouth, setMouth] = useState<{ viseme: Viseme; grapheme?: string }>({ viseme: 'smile' });
  const [speaking, setSpeaking] = useState(false);
  const [mood, setMood] = useState<SparkyMood>('happy');
  const [buildKey, setBuildKey] = useState(0);

  useEffect(() => {
    if (initialWord) {
      const w = buildWord(initialWord);
      if (w) pick(w);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWord]);

  const done = progress.wordSteps[word.word] ?? {};
  const allDone = STEPS.every((s) => done[s]);

  function pick(w: Word) {
    setWord(w);
    setStep('see');
    setHeardParts(new Set());
    setWholeSplit(false);
    setTapped(new Set());
    setActivePart(null);
    setMood('happy');
    setBuildKey((k) => k + 1);
    setMouth({ viseme: w.syllables[0]?.sounds[0]?.viseme ?? 'smile', grapheme: w.syllables[0]?.sounds[0]?.grapheme });
  }

  const say = (text: string, rate?: number) =>
    speak(text, { rate, onStart: () => setSpeaking(true), onEnd: () => setSpeaking(false) });

  const hearPart = (i: number) => {
    setActivePart(i);
    const syl = word.syllables[i];
    const first = syl.sounds[0];
    setMouth({ viseme: first?.viseme ?? 'open', grapheme: first?.grapheme });
    say(syl.say, 0.7);
    const next = new Set(heardParts).add(i);
    setHeardParts(next);
    if (step === 'hear' && next.size === word.syllables.length && !done.hear) award(word.word, 'hear');
  };

  const tapSound = (key: string, sound: Word['syllables'][number]['sounds'][number]) => {
    setMouth({ viseme: sound.viseme, grapheme: sound.grapheme });
    say(`${sound.say}. As in ${sound.key}.`, 0.75);
    const next = new Set(tapped).add(key);
    setTapped(next);
    const total = word.syllables.reduce((n, s) => n + s.sounds.length, 0);
    if (next.size === total && !done.tap) award(word.word, 'tap');
  };

  const nextStep = (from: Step) => {
    const i = STEPS.indexOf(from);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  };

  const split = step !== 'see' || wholeSplit;
  // Size the blocks to the stage (a size container): longer words get smaller blocks, never below 1.5rem.
  const n = (word.word.length * 0.72 + 1.2).toFixed(2);
  const glyph = `clamp(1.5rem, calc((100cqi - clamp(2rem, 8vw, 7rem)) / ${n}), 5.2rem)`;
  const nextWord = useMemo(() => {
    const pool = WORD_BANK.filter((w) => w.level === word.level && !(progress.wordSteps[w.word] && STEPS.every((s) => progress.wordSteps[w.word]?.[s])) && w.word !== word.word);
    return pool[0] ?? WORD_BANK[(WORD_BANK.indexOf(word) + 1) % WORD_BANK.length];
  }, [word, progress.wordSteps]);

  return (
    <div className="words">
      <WordPicker current={word} onPick={pick} />

      <section className="workspace" aria-labelledby="workspace-title">
        <h1 id="workspace-title" className="visually-hidden">
          Build the word {word.word}
        </h1>
        <StepRail steps={RAIL} current={step} done={done} onSelect={setStep} label="Steps for this word" />

        <div className="stage mat">
          <div className="stage-bar">
            <WordBar
              key={`${word.word}-${buildKey}`}
              word={word}
              split={split}
              build
              size={glyph}
              activePart={activePart}
              onPart={split ? hearPart : undefined}
              onWhole={() => {
                // Tapping the whole splits it into parts, or joins them back, while the child is looking.
                if (step === 'see') setWholeSplit((s) => !s);
                setActivePart(null);
                say(word.word, 0.7);
                if (step === 'see' && !done.see) award(word.word, 'see');
              }}
            />
          </div>
          {word.guessed && <p className="stage-note">Upside guessed these chunks. Check tricky words with your teacher.</p>}
          <Sparky className="stage-sparky" mood={allDone ? 'cheer' : mood} size="clamp(4.5rem, 10vw, 7rem)" hat={progress.wearing.hat} neck={progress.wearing.neck} face={progress.wearing.face} />
        </div>

        <div className="step-panel">
          {step === 'see' && (
            <SeeStep
              word={word}
              onDone={() => {
                if (!done.see) award(word.word, 'see');
                nextStep('see');
              }}
            />
          )}

          {step === 'hear' && (
            <div className="step">
              <p className="step-prompt">
                Tap each part of the word to hear it. Then tap the green word on top to hear it all together.{' '}
                <Hear text="Tap each part of the word to hear it. Then tap the green word on top to hear it all together." />
              </p>
              <div className="heard-count" aria-live="polite">
                {word.syllables.map((s, i) => (
                  <span key={i} className={`heard-chip ${heardParts.has(i) ? 'is-on' : ''}`}>
                    {s.text}
                  </span>
                ))}
              </div>
              {word.sentence && (
                <p className="sentence">
                  {word.sentence.split(new RegExp(`(${word.word})`, 'i')).map((part, i) =>
                    part.toLowerCase() === word.word ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>,
                  )}{' '}
                  <Hear text={word.sentence} label="Hear the sentence" />
                </p>
              )}
              {heardParts.size === word.syllables.length && (
                <button type="button" className="rod" onClick={() => nextStep('hear')}>
                  <span className="rod-label">Next: tap the sounds</span>
                  <span className="rod-unit">
                    <ArrowRight size={20} aria-hidden="true" />
                  </span>
                </button>
              )}
            </div>
          )}

          {step === 'tap' && (
            <div className="step step--split">
              <div>
                <p className="step-prompt">
                  Every box holds one sound. Tap the boxes one by one. <Hear text="Every box holds one sound. Tap the boxes one by one." />
                </p>
                <div className="soundboxes">
                  {word.syllables.map((syl, si) => (
                    <div key={si} className="sb-group" role="group" aria-label={`Sounds in ${syl.text}`}>
                      {syl.sounds.map((sound, ui) => {
                        const key = `${si}-${ui}`;
                        const on = tapped.has(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            className={`sb ${on ? 'is-on' : ''} ${mouth.grapheme === sound.grapheme && on ? 'is-current' : ''}`}
                            onClick={() => tapSound(key, sound)}
                            aria-label={on ? `${sound.grapheme}, as in ${sound.key}` : `Sound box ${ui + 1} of ${syl.text}`}
                          >
                            <span className="sb-sound">{on ? sound.grapheme : ''}</span>
                            <span className="sb-key">{on ? sound.key : ''}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {done.tap && (
                  <button type="button" className="rod" onClick={() => nextStep('tap')}>
                    <span className="rod-label">Next: say it</span>
                    <span className="rod-unit">
                      <ArrowRight size={20} aria-hidden="true" />
                    </span>
                  </button>
                )}
              </div>
              <MouthPanel viseme={mouth.viseme} grapheme={mouth.grapheme} speaking={speaking} />
            </div>
          )}

          {step === 'say' && (
            <div className="step step--split">
              {done.say ? (
                <div className="built">
                  <h2>You built “{word.word}”!</h2>
                  <p>All four steps are done, Sparky is proud of you.</p>
                  <div className="step-actions">
                    <button type="button" className="rod" onClick={() => go('words', nextWord.word)}>
                      <span className="rod-label">Build “{nextWord.word}” next</span>
                      <span className="rod-unit">
                        <ArrowRight size={20} aria-hidden="true" />
                      </span>
                    </button>
                    <button type="button" className="rod rod--ghost" onClick={() => setStep('see')}>
                      <span className="rod-label">Practise this word again</span>
                    </button>
                  </div>
                </div>
              ) : (
                <SayStep word={word} setMood={setMood} onDone={() => award(word.word, 'say')} />
              )}
              <MouthPanel viseme={mouth.viseme} grapheme={mouth.grapheme} speaking={speaking} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
