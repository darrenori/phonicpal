import type { CSSProperties, ReactNode } from 'react';
import { OP_INFO, type Op, type Problem, type SumToken } from '../shared/math';
import { speak } from '../shared/speech';
import './wordbar.css';
import './mathblocks.css';

type Cell = 'unit' | 'drop' | 'ghost' | 'answer';

interface Segment {
  cells: number;
  kind: Cell;
  label?: ReactNode;
}

function Bar({ segments, whole, n, gapped = false }: { segments: Segment[]; whole?: ReactNode; n: number; gapped?: boolean }) {
  return (
    <div className="bm-bar" style={{ '--n': n } as CSSProperties}>
      {whole !== undefined && (
        <div className="bm-whole">
          <span className="bm-whole-label">{whole}</span>
          <span className="brace brace--top" aria-hidden="true" />
        </div>
      )}
      <div className={`bm-row ${gapped ? 'bm-row--gapped' : ''}`}>
        {segments.map((seg, i) => (
          <div key={i} className={`bm-seg bm-seg--${seg.kind}`}>
            <div className="bm-cells">
              {Array.from({ length: seg.cells }, (_, c) => (
                <span key={c} className={`bm-cell bm-cell--${seg.kind}`} style={{ '--c': c } as CSSProperties} />
              ))}
            </div>
            {seg.label !== undefined && (
              <>
                <span className="brace brace--bottom" aria-hidden="true" />
                <span className="bm-seg-label">{seg.label}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Unknown({ shown, value }: { shown: boolean; value: number }) {
  return shown ? <strong className="bm-answer num">{value}</strong> : <span className="bm-unknown">?</span>;
}

/** Pictorial step: the Singapore bar model for a word problem. */
export function BarModel({ problem, revealed }: { problem: Problem; revealed: boolean }) {
  const p = problem;
  const ans = <Unknown shown={revealed} value={p.answer} />;
  const describe = `Bar model. ${p.labels.a}: ${p.a}. ${p.labels.b}: ${p.b}. ${p.labels.answer}: ${revealed ? p.answer : 'unknown'}.`;
  let body: ReactNode;
  switch (p.model) {
    case 'part-whole':
      body =
        p.op === '+' ? (
          <Bar
            n={p.answer}
            whole={<>{p.labels.answer} {ans}</>}
            segments={[
              { cells: p.a, kind: 'unit', label: `${p.labels.a} ${p.a}` },
              { cells: p.b, kind: 'unit', label: `${p.labels.b} ${p.b}` },
            ]}
          />
        ) : (
          <Bar
            n={p.a}
            whole={`${p.labels.a} ${p.a}`}
            segments={[
              { cells: p.b, kind: 'unit', label: `${p.labels.b} ${p.b}` },
              { cells: p.answer, kind: revealed ? 'answer' : 'ghost', label: <>{p.labels.answer} {ans}</> },
            ]}
          />
        );
      break;
    case 'take-away':
      body = (
        <Bar
          n={p.a}
          whole={`${p.labels.a} ${p.a}`}
          segments={[
            { cells: p.answer, kind: revealed ? 'answer' : 'unit', label: <>{p.labels.answer} {ans}</> },
            { cells: p.b, kind: 'drop', label: `${p.labels.b} ${p.b}` },
          ]}
        />
      );
      break;
    case 'compare':
      body = (
        <div className="bm-stack">
          <div className="bm-named">
            <span className="bm-name">{p.labels.a}</span>
            <Bar n={p.answer} segments={[{ cells: p.a, kind: 'unit', label: String(p.a) }]} />
          </div>
          <div className="bm-named">
            <span className="bm-name">{p.labels.answer}</span>
            <Bar
              n={p.answer}
              whole={ans}
              segments={[
                { cells: p.a, kind: revealed ? 'answer' : 'unit' },
                { cells: p.b, kind: revealed ? 'answer' : 'ghost', label: `${p.b} more` },
              ]}
            />
          </div>
        </div>
      );
      break;
    case 'groups':
      body = (
        <Bar
          n={p.answer}
          gapped
          whole={<>{p.labels.answer} {ans}</>}
          segments={Array.from({ length: p.a }, (_, i) => ({ cells: p.b, kind: (revealed ? 'answer' : 'unit') as Cell, label: i === 0 ? `${p.b} in each` : String(p.b) }))}
        />
      );
      break;
    case 'share':
      body = (
        <Bar
          n={p.a}
          gapped
          whole={`${p.labels.a} ${p.a}`}
          segments={Array.from({ length: p.b }, (_, i) => ({
            cells: p.answer,
            kind: (i === 0 ? (revealed ? 'answer' : 'ghost') : 'unit') as Cell,
            label: i === 0 ? <>{p.labels.answer} {ans}</> : undefined,
          }))}
        />
      );
      break;
  }
  return (
    <figure className="bm" aria-label={describe}>
      {body}
    </figure>
  );
}

/** Concrete step: counters you can count, grouped the way the story groups them. */
export function Counters({ problem, revealed }: { problem: Problem; revealed: boolean }) {
  const p = problem;
  const groups: Array<{ count: number; kind: Cell; label: string }> =
    p.model === 'groups'
      ? Array.from({ length: p.a }, (_, i) => ({ count: p.b, kind: 'unit', label: `Box ${i + 1}` }))
      : p.model === 'share'
        ? revealed
          ? Array.from({ length: p.b }, (_, i) => ({ count: p.answer, kind: 'unit', label: `Friend ${i + 1}` }))
          : [{ count: p.a, kind: 'unit', label: p.labels.a }]
        : p.model === 'take-away'
          ? [
              { count: p.answer, kind: revealed ? 'answer' : 'unit', label: p.labels.answer },
              { count: p.b, kind: 'drop', label: p.labels.b },
            ]
          : p.op === '−'
            ? [
                { count: p.b, kind: 'unit', label: p.labels.b },
                { count: p.answer, kind: revealed ? 'answer' : 'ghost', label: p.labels.answer },
              ]
            : [
                { count: p.a, kind: 'unit', label: p.labels.a },
                { count: p.b, kind: 'unit', label: p.labels.b },
              ];
  return (
    <div className="ct" role="img" aria-label={`Counters: ${groups.map((g) => `${g.label} ${g.count}`).join(', ')}`}>
      {groups.map((g, i) => (
        <div key={i} className="ct-group">
          <div className="ct-discs">
            {Array.from({ length: g.count }, (_, c) => (
              <span key={c} className={`ct-disc ct-disc--${g.kind}`} style={{ '--c': c } as CSSProperties} />
            ))}
          </div>
          <span className="ct-label">{g.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Abstract step: the number sentence, with operators you can tap to hear. */
export function NumberSentence({ tokens, revealed = true, size = 'md' }: { tokens: SumToken[]; revealed?: boolean; size?: 'md' | 'lg' }) {
  const lastNum = tokens.length - 1;
  return (
    <div className={`ns ns--${size}`}>
      {tokens.map((t, i) => {
        if (t.kind === 'num') {
          const isAnswer = i === lastNum && tokens[i - 1]?.kind === 'eq';
          if (isAnswer && !revealed) return <span key={i} className="ns-tile ns-tile--ghost" aria-label="unknown">?</span>;
          return (
            <span key={i} className={`ns-tile ${isAnswer ? 'ns-tile--answer' : 'ns-tile--num'} num`}>
              {t.value}
            </span>
          );
        }
        if (t.kind === 'op' || t.kind === 'eq') {
          const sym: Op | '=' = t.kind === 'op' ? t.op : '=';
          return (
            <button key={i} type="button" className="ns-tile ns-tile--op" onClick={() => speak(OP_INFO[sym].say)} aria-label={`${OP_INFO[sym].word}: ${OP_INFO[sym].meaning}. Tap to hear.`}>
              {sym}
            </button>
          );
        }
        return (
          <span key={i} className="ns-tile ns-tile--ghost" aria-label="unknown">
            ?
          </span>
        );
      })}
    </div>
  );
}

export function OperatorKey() {
  const ops: Array<Op | '='> = ['+', '−', '×', '÷', '='];
  return (
    <div className="opkey" role="list">
      {ops.map((op) => (
        <button key={op} type="button" role="listitem" className="opkey-item" onClick={() => speak(OP_INFO[op].say)}>
          <span className="ns-tile ns-tile--op" aria-hidden="true">
            {op}
          </span>
          <span className="opkey-text">
            <strong>{OP_INFO[op].word}</strong>
            <span>{OP_INFO[op].meaning}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
