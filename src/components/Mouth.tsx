import { useId } from 'react';
import type { Viseme } from '../shared/sounds';
import './mouth.css';

interface Shape {
  rx: number; // mouth opening half-width
  ry: number; // mouth opening half-height
  lip: number; // lip thickness
  topTeeth: boolean;
  bottomTeeth: boolean;
  tongue: 'low' | 'tip-up' | 'between' | 'back' | 'none';
  bite?: boolean; // top teeth resting on the bottom lip
  smile?: number; // corner lift
}

const SHAPES: Record<Viseme, Shape> = {
  lips: { rx: 30, ry: 1.2, lip: 9, topTeeth: false, bottomTeeth: false, tongue: 'none' },
  bite: { rx: 28, ry: 7, lip: 7, topTeeth: true, bottomTeeth: false, tongue: 'none', bite: true },
  tongue: { rx: 28, ry: 10, lip: 7, topTeeth: true, bottomTeeth: true, tongue: 'between' },
  round: { rx: 13, ry: 13, lip: 9, topTeeth: false, bottomTeeth: false, tongue: 'low' },
  smile: { rx: 36, ry: 7, lip: 6, topTeeth: true, bottomTeeth: true, tongue: 'none', smile: 6 },
  open: { rx: 26, ry: 21, lip: 7, topTeeth: true, bottomTeeth: false, tongue: 'low' },
  tap: { rx: 25, ry: 12, lip: 7, topTeeth: true, bottomTeeth: true, tongue: 'tip-up' },
  back: { rx: 24, ry: 14, lip: 7, topTeeth: true, bottomTeeth: true, tongue: 'back' },
  hiss: { rx: 30, ry: 5, lip: 6, topTeeth: true, bottomTeeth: true, tongue: 'none', smile: 3 },
  push: { rx: 17, ry: 11, lip: 10, topTeeth: true, bottomTeeth: true, tongue: 'none' },
  curl: { rx: 19, ry: 12, lip: 8, topTeeth: true, bottomTeeth: false, tongue: 'back' },
};

export function MouthShape({ viseme, speaking = false, label }: { viseme: Viseme; speaking?: boolean; label?: string }) {
  const s = SHAPES[viseme];
  const cx = 80;
  const cy = 52;
  const lift = s.smile ?? 0;
  // Outer lip outline as a smooth closed path, corners lifted for a smile.
  const outer = `M ${cx - s.rx - s.lip} ${cy - lift}
    Q ${cx} ${cy - s.ry - s.lip * 1.6} ${cx + s.rx + s.lip} ${cy - lift}
    Q ${cx} ${cy + s.ry + s.lip * 1.7} ${cx - s.rx - s.lip} ${cy - lift} Z`;
  const inner = `M ${cx - s.rx} ${cy - lift * 0.6}
    Q ${cx} ${cy - s.ry * 2} ${cx + s.rx} ${cy - lift * 0.6}
    Q ${cx} ${cy + s.ry * 2} ${cx - s.rx} ${cy - lift * 0.6} Z`;
  const clipId = `mouth-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg className={`mouth ${speaking ? 'mouth--speaking' : ''}`} viewBox="0 0 160 104" role="img" aria-label={label ?? `Mouth shape: ${viseme}`}>
      <rect x="4" y="4" width="152" height="96" rx="18" className="mouth-skin" />
      <path d={outer} className="mouth-lip" />
      <clipPath id={clipId}>
        <path d={inner} />
      </clipPath>
      <path d={inner} className="mouth-inside" />
      <g clipPath={`url(#${clipId})`}>
        {s.topTeeth && <rect x={cx - 26} y={cy - s.ry - 6} width="52" height={Math.max(8, s.ry * 0.7 + 6)} rx="3" className="mouth-teeth" />}
        {s.bottomTeeth && <rect x={cx - 22} y={cy + s.ry * 0.45} width="44" height="16" rx="3" className="mouth-teeth" />}
        {s.tongue === 'low' && <ellipse cx={cx} cy={cy + s.ry * 0.95} rx={s.rx * 0.75} ry={s.ry * 0.55} className="mouth-tongue" />}
        {s.tongue === 'tip-up' && <path d={`M ${cx - 16} ${cy + 16} Q ${cx} ${cy - s.ry - 2} ${cx + 16} ${cy + 16} Z`} className="mouth-tongue" />}
        {s.tongue === 'back' && <ellipse cx={cx} cy={cy + s.ry * 0.8} rx={s.rx * 0.9} ry={s.ry * 0.7} className="mouth-tongue mouth-tongue--back" />}
      </g>
      {s.tongue === 'between' && <ellipse cx={cx} cy={cy + 1} rx="15" ry="6.5" className="mouth-tongue" />}
      {s.bite && <rect x={cx - 24} y={cy - 2} width="48" height="8" rx="3" className="mouth-teeth" />}
    </svg>
  );
}
