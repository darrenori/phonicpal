import { useEffect, useMemo, useRef } from 'react';
import { X } from 'lucide-react';
import { GRAPH, neighbours, wordId, wordsAt, type GraphNode } from '../shared/graph';
import { SHAKY, mastery, seen } from '../shared/learner';
import { speak } from '../shared/speech';
import type { Word } from '../shared/words';

const HUB_ORDER: Record<GraphNode['kind'], number> = { word: 0, sound: 1, rime: 2, part: 3, topic: 4 };
const R_HUB = 132;
const R_LEAF = 238;
const MAX_HUBS = 9;
const MAX_SOUNDS = 5;

interface Placed {
  node: GraphNode;
  x: number;
  y: number;
  /** How sure the model is that this child knows it: only meaningful for sounds. */
  known: number;
  met: boolean;
}

function layout(word: Word): { hubs: Placed[]; leaves: Array<Placed & { through: string }> } {
  const centre = wordId(word.word);
  const all = neighbours(centre)
    .map((id) => GRAPH.nodes.get(id))
    .filter((n): n is GraphNode => Boolean(n));
  // Sounds are the crowd, so keep the shakiest few and leave room for the other links.
  const sounds = all
    .filter((n) => n.kind === 'sound')
    .sort((a, b) => mastery(a.id) - mastery(b.id))
    .slice(0, MAX_SOUNDS);
  const hubs = [...sounds, ...all.filter((n) => n.kind !== 'sound')]
    .sort((a, b) => HUB_ORDER[a.kind] - HUB_ORDER[b.kind] || a.label.localeCompare(b.label))
    .slice(0, MAX_HUBS);

  const taken = new Set<string>([word.word]);
  const placedHubs: Placed[] = [];
  const leaves: Array<Placed & { through: string }> = [];

  hubs.forEach((node, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * (i + 0.5)) / hubs.length;
    placedHubs.push({
      node,
      x: Math.cos(angle) * R_HUB,
      y: Math.sin(angle) * R_HUB,
      known: mastery(node.id),
      met: seen(node.id) > 0,
    });

    const cousins = wordsAt(node.id, centre).filter((w) => !taken.has(w)).slice(0, 2);
    cousins.forEach((cousin, j) => {
      taken.add(cousin);
      const spread = cousins.length === 1 ? 0 : (j - (cousins.length - 1) / 2) * 0.42;
      const a = angle + spread;
      // Stagger the second cousin further out, so two labels never touch.
      const r = R_LEAF + (j % 2) * 30;
      leaves.push({
        node: GRAPH.nodes.get(wordId(cousin)) ?? { id: wordId(cousin), kind: 'word', label: cousin },
        x: Math.cos(a) * r,
        y: Math.sin(a) * r,
        known: mastery(wordId(cousin)),
        met: seen(wordId(cousin)) > 0,
        through: node.label,
      });
    });
  });

  return { hubs: placedHubs, leaves };
}

/** Only sounds and words carry a belief; a rime family or a topic is just a link. */
function band(p: Placed): string {
  if (p.node.kind !== 'sound' && p.node.kind !== 'word') return '';
  if (!p.met) return 'is-new';
  return p.known >= 0.8 ? 'is-known' : p.known >= SHAKY ? 'is-getting' : 'is-shaky';
}

/**
 * The word map.
 *
 * A word is drawn as what it is joined to: its letter-sounds, its rhyming family, its
 * word parts and its meaning, with the words those lead on to. Children with dyslexia
 * are often stronger at seeing a whole shape at once than at working through a list in
 * order, and maps of how ideas connect help readers who struggle with text (Dexter &
 * Hughes, 2011). The map is also honest about the model: a sound the child has met is
 * filled in as far as Upside believes they know it.
 */
export function WordMap({ open, word, onClose, onWord }: { open: boolean; word: Word; onClose: () => void; onWord: (w: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { hubs, leaves } = useMemo(() => layout(word), [word]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  const travel = (w: string) => {
    onWord(w);
    onClose();
  };

  return (
    <dialog ref={ref} className="dialog map" aria-labelledby="map-title" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="dialog-inner">
        <div className="drawer-head">
          <h2 id="map-title">The map around “{word.word}”</h2>
          <button type="button" className="cube cube--sm" onClick={onClose} aria-label="Close the map">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <svg className="map-svg" viewBox="-300 -300 600 600" aria-hidden="true">
          {hubs.map((hub) => (
            <line key={`e-${hub.node.id}`} x1={0} y1={0} x2={hub.x} y2={hub.y} className={`map-line map-line--${hub.node.kind}`} />
          ))}
          {leaves.map((leaf) => {
            const hub = hubs.find((h) => h.node.label === leaf.through);
            return hub ? <line key={`l-${leaf.node.id}`} x1={hub.x} y1={hub.y} x2={leaf.x} y2={leaf.y} className="map-line map-line--leaf" /> : null;
          })}

          {leaves.map((leaf) => (
            <g key={leaf.node.id} className={`map-node map-node--word ${band(leaf)}`} transform={`translate(${leaf.x} ${leaf.y})`} onClick={() => travel(leaf.node.label)}>
              <rect x={-Math.max(30, leaf.node.label.length * 6.4)} y={-17} width={Math.max(60, leaf.node.label.length * 12.8)} height={34} rx={8} />
              <text y={6}>{leaf.node.label}</text>
            </g>
          ))}

          {hubs.map((hub) => (
            <g key={hub.node.id} className={`map-node map-node--${hub.node.kind} ${band(hub)}`} transform={`translate(${hub.x} ${hub.y})`} onClick={() => speak(`${hub.node.label}. ${hub.node.hint ?? ''}`, { rate: 0.75 })}>
              {hub.node.kind === 'sound' ? (
                <rect x={-21} y={-21} width={42} height={42} rx={6} />
              ) : hub.node.kind === 'topic' ? (
                <circle r={26} />
              ) : (
                <rect x={-Math.max(26, hub.node.label.length * 6)} y={-19} width={Math.max(52, hub.node.label.length * 12)} height={38} rx={19} />
              )}
              <text y={6}>{hub.node.label}</text>
            </g>
          ))}

          <g className="map-node map-node--centre" onClick={() => speak(word.word, { rate: 0.7 })}>
            <rect x={-Math.max(46, word.word.length * 8)} y={-26} width={Math.max(92, word.word.length * 16)} height={52} rx={10} />
            <text y={8}>{word.word}</text>
          </g>
        </svg>

        <ul className="map-key" aria-hidden="true">
          <li className="is-new">Not met yet</li>
          <li className="is-shaky">Still shaky</li>
          <li className="is-getting">Getting there</li>
          <li className="is-known">Known</li>
        </ul>

        <div className="map-list">
          <h3 className="field-label">Everything “{word.word}” is joined to</h3>
          <ul>
            {hubs.map((hub) => {
              const cousins = wordsAt(hub.node.id, wordId(word.word)).slice(0, 4);
              return (
                <li key={hub.node.id}>
                  <button type="button" className="tile" onClick={() => speak(`${hub.node.label}. ${hub.node.hint ?? ''}`, { rate: 0.75 })}>
                    {hub.node.label}
                  </button>
                  <span className="map-list-hint">{hub.node.hint}</span>
                  <span className="map-list-words">
                    {cousins.map((c) => (
                      <button key={c} type="button" className="rod rod--sm rod--surface" onClick={() => travel(c)}>
                        <span className="rod-label">{c}</span>
                      </button>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </dialog>
  );
}
