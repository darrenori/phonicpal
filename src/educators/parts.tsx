import type { Feeling } from '../shared/progress';
import type { Learner } from './sampleData';

/** Minutes per day as tiny unit columns. Each column is scaled to the busiest day in view. */
export function DayRods({ minutes, max, label }: { minutes: number[]; max: number; label: string }) {
  return (
    <span className="dayrods" role="img" aria-label={label}>
      {minutes.map((m, i) => (
        <span key={i} className={m === 0 ? 'is-zero' : ''} style={{ height: `${m === 0 ? 3 : Math.max(18, (m / max) * 100)}%` }} />
      ))}
    </span>
  );
}

export const FEELING_LABEL: Record<Feeling, string> = { happy: 'Happy', okay: 'Okay', stuck: 'Stuck', tired: 'Tired' };
const ORDER: Feeling[] = ['happy', 'okay', 'stuck', 'tired'];

/** Check-ins as one part-whole bar; each part carries its count, so colour never works alone. */
export function FeelingsBar({ feelings, showLabels = false }: { feelings: Record<Feeling, number>; showLabels?: boolean }) {
  const total = ORDER.reduce((n, f) => n + feelings[f], 0);
  if (!total) return <span className="muted">No check-ins yet</span>;
  return (
    <span className="feelbar-wrap">
      <span className="feelbar" role="img" aria-label={ORDER.map((f) => `${FEELING_LABEL[f]} ${feelings[f]}`).join(', ')}>
        {ORDER.filter((f) => feelings[f] > 0).map((f) => (
          <span key={f} className={`feelbar-part feelbar-part--${f}`} style={{ flexGrow: feelings[f] }} title={`${FEELING_LABEL[f]}: ${feelings[f]}`}>
            {feelings[f] >= 2 ? feelings[f] : ''}
          </span>
        ))}
      </span>
      {showLabels && (
        <span className="feelbar-legend">
          {ORDER.map((f) => (
            <span key={f}>
              <i className={`feelbar-key feelbar-part--${f}`} aria-hidden="true" /> {FEELING_LABEL[f]} {feelings[f]}
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

export function WordsSecured({ l }: { l: Learner }) {
  const pct = l.wordsPractised ? (l.wordsSecured / l.wordsPractised) * 100 : 0;
  return (
    <span className="secured" aria-label={`${l.wordsSecured} of ${l.wordsPractised} words secured`}>
      <span className="secured-bar" aria-hidden="true">
        <span style={{ width: `${pct}%` }} />
      </span>
      <span className="num">
        {l.wordsSecured}
        <span className="muted">/{l.wordsPractised}</span>
      </span>
    </span>
  );
}

export function SupportChips({ items }: { items: string[] }) {
  if (!items.length) return <span className="muted">None flagged</span>;
  return (
    <span className="chips">
      {items.map((s) => (
        <span key={s} className="chip">
          {s}
        </span>
      ))}
    </span>
  );
}
