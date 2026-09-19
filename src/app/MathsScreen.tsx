import { useState } from 'react';
import { ArrowRight, Eye, Volume2 } from 'lucide-react';
import { BarModel, Counters, NumberSentence, OperatorKey } from '../components/MathBlocks';
import { Hear } from '../components/Controls';
import { PROBLEMS, parseSum, type Problem, type SumToken } from '../shared/math';
import { speak } from '../shared/speech';
import { logSum } from '../shared/progress';
import { StepRail } from './StepRail';
import { celebrate } from './CoinToast';

type MStep = 'read' | 'clue' | 'draw' | 'solve';
const RAIL = [
  { id: 'read' as const, label: 'Read it' },
  { id: 'clue' as const, label: 'Find the clue' },
  { id: 'draw' as const, label: 'Draw it' },
  { id: 'solve' as const, label: 'Solve it' },
];
const ORDER: MStep[] = ['read', 'clue', 'draw', 'solve'];

const TITLES: Record<string, string> = {
  buns: 'Kaya buns',
  mynahs: 'Mynah birds',
  canteen: 'Canteen lunch',
  marbles: 'Marbles',
  cars: 'Toy cars',
  sweets: 'Sharing sweets',
};

function ProblemText({ problem, showClues }: { problem: Problem; showClues: boolean }) {
  if (!showClues) return <>{problem.text}</>;
  const phrases = problem.clues.map((c) => c.phrase);
  const pattern = new RegExp(`(${phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  return (
    <>
      {problem.text.split(pattern).map((part, i) =>
        phrases.includes(part) ? (
          <mark key={i} className="clue">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function sentenceFor(p: Problem): SumToken[] {
  return [
    { kind: 'num', value: p.a },
    { kind: 'op', op: p.op },
    { kind: 'num', value: p.b },
    { kind: 'eq' },
    { kind: 'num', value: p.answer },
  ];
}

export function MathsScreen() {
  const [problem, setProblem] = useState<Problem>(PROBLEMS[0]);
  const [step, setStep] = useState<MStep>('read');
  const [revealed, setRevealed] = useState(false);
  const [own, setOwn] = useState('');
  const [ownError, setOwnError] = useState('');
  const [ownSum, setOwnSum] = useState<ReturnType<typeof parseSum>>(null);

  const reached = ORDER.indexOf(step);
  const done = Object.fromEntries(ORDER.map((s, i) => [s, i < reached || (s === 'solve' && revealed)])) as Record<MStep, boolean>;

  const choose = (p: Problem) => {
    setProblem(p);
    setStep('read');
    setRevealed(false);
  };
  const next = () => setStep(ORDER[Math.min(ORDER.length - 1, reached + 1)]);
  const intro = 'Pick a story sum. We will read it, find the clue, draw it with blocks, then solve it.';

  return (
    <div className="maths">
      <header className="screen-head">
        <h1>Maths helper</h1>
        <p>
          {intro} <Hear text={intro} />
        </p>
      </header>

      <section className="maths-key" aria-labelledby="opkey-title">
        <h2 id="opkey-title" className="section-title">
          What do the symbols mean?
        </h2>
        <OperatorKey />
      </section>

      <div className="maths-grid">
        <aside className="picker" aria-label="Story sums">
          <div className="picker-head">
            <h2>Story sums</h2>
          </div>
          <ul className="picker-words">
            {PROBLEMS.map((p) => (
              <li key={p.id}>
                <button type="button" className="picker-word" aria-pressed={problem.id === p.id} onClick={() => choose(p)}>
                  <span>{TITLES[p.id]}</span>
                  <span className="picker-level">{p.level}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="workspace" aria-label={`Story sum: ${TITLES[problem.id]}`}>
          <StepRail steps={RAIL} current={step} done={done} onSelect={setStep} label="Steps for this sum" />
          <div className="stage mat maths-stage">
            <p className="story">
              <ProblemText problem={problem} showClues={reached >= 1} />{' '}
              <Hear text={problem.text} label="Hear the story sum" size="md" tone="lemon" />
            </p>

            {reached >= 1 && (
              <ul className="clues">
                {problem.clues.map((c) => (
                  <li key={c.phrase}>
                    <strong>“{c.phrase}”</strong> {c.hint} <Hear text={`${c.phrase}. ${c.hint}`} />
                  </li>
                ))}
              </ul>
            )}

            {reached >= 2 && (
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
            )}

            {reached >= 3 && (
              <div className="cpa-layer">
                <h3>Write it</h3>
                <NumberSentence tokens={sentenceFor(problem)} revealed={revealed} size="lg" />
              </div>
            )}
          </div>

          <div className="step-actions">
            {step !== 'solve' ? (
              <button type="button" className="rod" onClick={next}>
                <span className="rod-label">{step === 'read' ? 'Find the clue' : step === 'clue' ? 'Draw it with blocks' : 'Write the sum'}</span>
                <span className="rod-unit">
                  <ArrowRight size={20} aria-hidden="true" />
                </span>
              </button>
            ) : !revealed ? (
              <button
                type="button"
                className="rod rod--leaf"
                onClick={() => {
                  setRevealed(true);
                  speak(problem.solution);
                  celebrate(logSum(problem.id), 'for solving');
                }}
              >
                <span className="rod-label">Show the answer</span>
                <span className="rod-unit">
                  <Eye size={20} aria-hidden="true" />
                </span>
              </button>
            ) : (
              <button type="button" className="rod rod--surface" onClick={() => speak(problem.solution)}>
                <span className="rod-label">
                  <Volume2 size={18} aria-hidden="true" /> Hear the answer again
                </span>
              </button>
            )}
          </div>
        </section>
      </div>

      <section className="own-sum panel" aria-labelledby="own-title">
        <h2 id="own-title" className="section-title">
          Make your own sum
        </h2>
        <form
          className="picker-type-row"
          onSubmit={(e) => {
            e.preventDefault();
            const parsed = parseSum(own);
            setOwnSum(parsed);
            setOwnError(parsed ? '' : 'Try a sum with numbers and a symbol, like 7 + 6 or 12 ÷ 3.');
            if (parsed) speak(parsed.spoken);
          }}
        >
          <label htmlFor="own-sum" className="visually-hidden">
            Type a sum
          </label>
          <input id="own-sum" className="input" value={own} onChange={(e) => setOwn(e.target.value)} placeholder="Type a sum, like 7 + 6" inputMode="text" autoComplete="off" />
          <button type="submit" className="cube cube--lg cube--lemon" aria-label="Show my sum in blocks" disabled={!own.trim()}>
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </form>
        {ownError && (
          <p className="field-error" role="alert">
            {ownError}
          </p>
        )}
        {ownSum && (
          <div className="own-result">
            <NumberSentence tokens={ownSum.tokens} size="lg" />
            <button type="button" className="rod rod--sm rod--surface" onClick={() => speak(ownSum.spoken)}>
              <span className="rod-label">
                <Volume2 size={16} aria-hidden="true" /> Hear it
              </span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
