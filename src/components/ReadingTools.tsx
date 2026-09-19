import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { RotateCcw } from 'lucide-react';
import {
  resetSettings,
  updateSettings,
  useSettings,
  type Overlay,
  type ReadingFont,
  type Spacing,
  type TextSize,
  type Theme,
} from '../shared/settings';
import { speak } from '../shared/speech';
import { Switch } from './Controls';
import './readingtools.css';

const FONTS: Array<{ id: ReadingFont; name: string; family: string }> = [
  { id: 'lexend', name: 'Lexend', family: "'Lexend', sans-serif" },
  { id: 'opendyslexic', name: 'OpenDyslexic', family: "'OpenDyslexic', sans-serif" },
  { id: 'atkinson', name: 'Atkinson', family: "'Atkinson Hyperlegible', sans-serif" },
];
const SIZES: Array<{ id: TextSize; name: string }> = [
  { id: 's', name: 'Small' },
  { id: 'm', name: 'Medium' },
  { id: 'l', name: 'Large' },
  { id: 'xl', name: 'Huge' },
];
const SPACING: Array<{ id: Spacing; name: string }> = [
  { id: 'normal', name: 'Snug' },
  { id: 'wide', name: 'Roomy' },
  { id: 'wider', name: 'Extra roomy' },
];
const OVERLAYS: Array<{ id: Overlay; name: string; color: string }> = [
  { id: 'none', name: 'No tint', color: 'transparent' },
  { id: 'blue', name: 'Blue', color: '#9cc3ff' },
  { id: 'yellow', name: 'Yellow', color: '#ffe27a' },
  { id: 'rose', name: 'Rose', color: '#ffb3c4' },
  { id: 'green', name: 'Green', color: '#9fe0b0' },
  { id: 'peach', name: 'Peach', color: '#ffc49c' },
];
const THEMES: Array<{ id: Theme; name: string }> = [
  { id: 'auto', name: 'Match device' },
  { id: 'day', name: 'Day' },
  { id: 'night', name: 'Night' },
  { id: 'contrast', name: 'High contrast' },
];
const RATES = [
  { rate: 0.65, name: 'Slow' },
  { rate: 0.8, name: 'Steady' },
  { rate: 1, name: 'Quick' },
];

export function ReadingTools({ compact = false }: { compact?: boolean }) {
  const s = useSettings();
  return (
    <div className={`rt ${compact ? 'rt--compact' : ''}`}>
      <p className="rt-preview" aria-live="polite">
        The butterfly lands on a flower.
      </p>

      <fieldset className="rt-group">
        <legend>Letters</legend>
        <div className="tiles" role="radiogroup" aria-label="Reading font">
          {FONTS.map((f) => (
            <button key={f.id} type="button" role="radio" aria-checked={s.font === f.id} className="tile" style={{ fontFamily: f.family }} onClick={() => updateSettings({ font: f.id })}>
              {f.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="rt-group">
        <legend>Size</legend>
        <div className="tiles" role="radiogroup" aria-label="Text size">
          {SIZES.map((z) => (
            <button key={z.id} type="button" role="radio" aria-checked={s.size === z.id} className="tile" onClick={() => updateSettings({ size: z.id })}>
              {z.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="rt-group">
        <legend>Space between letters</legend>
        <div className="tiles" role="radiogroup" aria-label="Letter spacing">
          {SPACING.map((z) => (
            <button key={z.id} type="button" role="radio" aria-checked={s.spacing === z.id} className="tile" onClick={() => updateSettings({ spacing: z.id })}>
              {z.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="rt-group">
        <legend>Colour overlay</legend>
        <div className="rt-swatches" role="radiogroup" aria-label="Colour overlay">
          {OVERLAYS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={s.overlay === o.id}
              className={`rt-swatch ${o.id === 'none' ? 'rt-swatch--none' : ''}`}
              style={{ background: o.color }}
              onClick={() => updateSettings({ overlay: o.id })}
              aria-label={o.name}
              title={o.name}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="rt-group">
        <legend>Page colours</legend>
        <div className="tiles" role="radiogroup" aria-label="Page colours">
          {THEMES.map((t) => (
            <button key={t.id} type="button" role="radio" aria-checked={s.theme === t.id} className="tile" onClick={() => updateSettings({ theme: t.id })}>
              {t.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="rt-group">
        <legend>Voice speed</legend>
        <div className="tiles" role="radiogroup" aria-label="Voice speed">
          {RATES.map((r) => (
            <button
              key={r.rate}
              type="button"
              role="radio"
              aria-checked={Math.abs(s.speechRate - r.rate) < 0.01}
              className="tile"
              onClick={() => {
                updateSettings({ speechRate: r.rate });
                speak('The butterfly lands on a flower.', { rate: r.rate });
              }}
            >
              {r.name}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="rt-group rt-switches">
        <Switch id="rt-ruler" checked={s.ruler} onChange={(v) => updateSettings({ ruler: v })}>
          Reading ruler
        </Switch>
        <Switch id="rt-bd" checked={s.bdHelper} onChange={(v) => updateSettings({ bdHelper: v })}>
          b d p q helper
        </Switch>
        <Switch id="rt-calm" checked={s.calmMotion} onChange={(v) => updateSettings({ calmMotion: v })}>
          Calm motion
        </Switch>
      </div>

      <button type="button" className="rod rod--ghost rod--sm rt-reset" onClick={resetSettings}>
        <span className="rod-label">
          <RotateCcw size={16} aria-hidden="true" /> Back to the start settings
        </span>
      </button>
    </div>
  );
}

/** The tint overlay and the reading ruler, drawn above everything. */
export function ReadingLayer() {
  const s = useSettings();
  const [y, setY] = useState(-1000);
  const raf = useRef(0);
  useEffect(() => {
    if (!s.ruler) return;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => setY(e.clientY));
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', move);
      cancelAnimationFrame(raf.current);
    };
  }, [s.ruler]);
  return (
    <>
      {s.overlay !== 'none' && <div className="reading-overlay" aria-hidden="true" />}
      {s.ruler && (
        <div className="reading-ruler" aria-hidden="true" style={{ '--ruler-y': `${y < 0 ? window.innerHeight / 2 : y}px` } as CSSProperties}>
          <div className="reading-ruler-top" />
          <div className="reading-ruler-band" />
          <div className="reading-ruler-bottom" />
        </div>
      )}
    </>
  );
}
