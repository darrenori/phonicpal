import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Sparky, type SparkyMood } from '../components/Sparky';
import { Hear } from '../components/Controls';
import { logFeeling, type Feeling } from '../shared/progress';
import { speak } from '../shared/speech';
import { celebrate } from './CoinToast';
import { go } from './App';

const FEELINGS: Array<{ id: Feeling; label: string; mood: SparkyMood }> = [
  { id: 'happy', label: 'Happy', mood: 'happy' },
  { id: 'okay', label: 'Okay', mood: 'okay' },
  { id: 'stuck', label: 'Stuck', mood: 'stuck' },
  { id: 'tired', label: 'Tired', mood: 'sleepy' },
];

const REPLY: Record<Feeling, string> = {
  happy: 'Yay! Sparky feels happy too. Let’s keep building.',
  okay: 'Okay is fine. We can take it one block at a time.',
  stuck: 'Being stuck is part of learning. Let’s breathe together first.',
  tired: 'Rest is important. Sparky will wait for you.',
};

/** Breathe in while the rod fills, out while it empties. Three rounds. */
function Breathing({ onDone }: { onDone: () => void }) {
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    speak(phase === 'in' ? 'Breathe in' : 'Breathe out', { rate: 0.7 });
    const t = window.setTimeout(() => {
      if (phase === 'in') setPhase('out');
      else if (round < 3) {
        setRound(round + 1);
        setPhase('in');
      } else doneRef.current();
    }, 4200);
    return () => window.clearTimeout(t);
  }, [phase, round]);
  return (
    <div className="breathe">
      <Sparky mood="calm" size="7rem" />
      <p className="breathe-word" aria-live="polite">
        {phase === 'in' ? 'Breathe in…' : 'Breathe out…'}
      </p>
      <div className={`breathe-rod breathe-rod--${phase}`} aria-hidden="true">
        <span />
      </div>
      <p className="step-note">Round {round} of 3</p>
    </div>
  );
}

export function FeelingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [breathing, setBreathing] = useState<'no' | 'now' | 'done'>('no');

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setFeeling(null);
      setBreathing('no');
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open]);

  const choose = (f: Feeling) => {
    setFeeling(f);
    if (f !== 'stuck') speak(REPLY[f]);
    celebrate(logFeeling(f), 'for checking in');
    if (f === 'stuck') setBreathing('now');
  };

  const title = 'How are you feeling?';
  return (
    <dialog ref={ref} className="dialog feelings" aria-labelledby="feel-title" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="dialog-inner">
        <div className="drawer-head">
          <h2 id="feel-title">
            {title} <Hear text={title} />
          </h2>
          <button type="button" className="cube cube--sm" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {!feeling && (
          <div className="feel-grid">
            {FEELINGS.map((f) => (
              <button key={f.id} type="button" className="feel" onClick={() => choose(f.id)}>
                <Sparky crop="head" mood={f.mood} size="4.5rem" idle={false} />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        )}

        {feeling && breathing === 'now' && <Breathing onDone={() => setBreathing('done')} />}

        {feeling && breathing !== 'now' && (
          <div className="feel-reply">
            <Sparky mood={feeling === 'tired' ? 'sleepy' : feeling === 'stuck' ? 'calm' : 'cheer'} size="7rem" />
            <p>{feeling === 'stuck' ? 'Well done. Your brain is ready again. Would you like an easier word, or a short break?' : REPLY[feeling]}</p>
            <div className="step-actions">
              {feeling === 'stuck' && (
                <button
                  type="button"
                  className="rod"
                  onClick={() => {
                    onClose();
                    go('words', 'cat');
                  }}
                >
                  <span className="rod-label">Try an easier word</span>
                </button>
              )}
              <button type="button" className={`rod ${feeling === 'stuck' ? 'rod--ghost' : 'rod--leaf'}`} onClick={onClose}>
                <span className="rod-label">{feeling === 'tired' ? 'I’ll come back later' : feeling === 'stuck' ? 'Take a short break' : 'Back to practice'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
