import type { CSSProperties } from 'react';
import { Volume2 } from 'lucide-react';
import { letterShape, isConfusable, SHAPE_LABEL } from '../shared/letters';
import type { Word } from '../shared/words';
import './wordbar.css';

interface WordBarProps {
  word: Word;
  /** Parts pull apart into syllables, each with its own brace. */
  split?: boolean;
  /** Glyph size: any CSS length. */
  size?: string;
  activePart?: number | null;
  onPart?: (index: number) => void;
  onWhole?: () => void;
  /** Show the whole-word brace above the bar. */
  showWhole?: boolean;
  /** Blocks drop onto the shelf when the word changes. */
  build?: boolean;
  className?: string;
}

export function WordBar({
  word,
  split = false,
  size = '3.2rem',
  activePart = null,
  onPart,
  onWhole,
  showWhole = true,
  build = false,
  className = '',
}: WordBarProps) {
  let index = 0;
  const label = word.syllables.map((s) => s.text).join(' · ');

  return (
    <div
      className={`wb ${split ? 'wb--split' : ''} ${build ? 'wb--build' : ''} ${className}`}
      style={{ '--g': size } as CSSProperties}
      data-word={word.word}
    >
      {showWhole &&
        (onWhole ? (
          <button type="button" className="wb-whole" onClick={onWhole} aria-label={`Hear the whole word: ${word.word}`}>
            <span className="wb-whole-label">
              <Volume2 aria-hidden="true" size="1em" strokeWidth={2.4} />
              {word.word}
            </span>
            <span className="brace brace--top" aria-hidden="true" />
          </button>
        ) : (
          <div className="wb-whole" aria-hidden="true">
            <span className="wb-whole-label">{word.word}</span>
            <span className="brace brace--top" />
          </div>
        ))}

      <div className="wb-row" role={onPart ? 'group' : 'img'} aria-label={onPart ? `Syllables of ${word.word}` : `${word.word}, built from letter blocks: ${label}`}>
        {word.syllables.map((syl, p) => {
          const blocks = syl.text.split('').map((ch) => {
            const shape = letterShape(ch);
            const i = index++;
            return (
              <span
                key={i}
                className={`blk blk--${shape}`}
                data-confusable={isConfusable(ch) ? ch : undefined}
                style={{ '--i': i } as CSSProperties}
                title={shape === 'tall' || shape === 'cube' || shape === 'hang' ? SHAPE_LABEL[shape] : undefined}
              >
                <span className="blk-glyph">{ch}</span>
              </span>
            );
          });
          const content = (
            <>
              <span className="wb-blocks">{blocks}</span>
              <span className="brace brace--bottom" aria-hidden="true" />
              <span className="wb-part-label">{syl.text}</span>
            </>
          );
          return onPart ? (
            <button
              key={p}
              type="button"
              className="wb-part"
              aria-pressed={activePart === p}
              aria-label={`Hear part ${p + 1}: ${syl.text}`}
              onClick={() => onPart(p)}
            >
              {content}
            </button>
          ) : (
            <span key={p} className="wb-part" data-active={activePart === p || undefined}>
              {content}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function ShapeLegend({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`legend ${compact ? 'legend--compact' : ''}`} aria-label="Letter shapes">
      <li>
        <span className="swatch swatch--tall" aria-hidden="true" /> Tall letters reach up
      </li>
      <li>
        <span className="swatch swatch--cube" aria-hidden="true" /> Small letters sit on the line
      </li>
      <li>
        <span className="swatch swatch--hang" aria-hidden="true" /> Hanging letters drop below
      </li>
    </ul>
  );
}
