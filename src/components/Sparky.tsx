import { useId } from 'react';
import './sparky.css';

export type SparkyMood = 'happy' | 'cheer' | 'calm' | 'sleepy' | 'stuck' | 'think' | 'okay';

interface SparkyProps {
  mood?: SparkyMood;
  hat?: string;
  neck?: string;
  face?: string;
  /** "head" crops to the face, for small check-in buttons and badges. */
  crop?: 'full' | 'head';
  size?: string;
  idle?: boolean;
  title?: string;
  className?: string;
}

function Eyes({ mood }: { mood: SparkyMood }) {
  if (mood === 'cheer') {
    return (
      <g className="sp-line" strokeWidth="4">
        <path d="M73 76 Q82 64 91 76" />
        <path d="M109 76 Q118 64 127 76" />
      </g>
    );
  }
  if (mood === 'calm' || mood === 'sleepy') {
    return (
      <g className="sp-line" strokeWidth="4">
        <path d={mood === 'calm' ? 'M73 72 Q82 80 91 72' : 'M73 75 L91 75'} />
        <path d={mood === 'calm' ? 'M109 72 Q118 80 127 72' : 'M109 75 L127 75'} />
      </g>
    );
  }
  const look = mood === 'think' ? -4 : 1;
  return (
    <g className="sp-eyes">
      <ellipse cx="82" cy="73" rx="9.5" ry="10.5" fill="#fff" />
      <ellipse cx="118" cy="73" rx="9.5" ry="10.5" fill="#fff" />
      <circle cx={83} cy={74 + look} r="5.8" fill="#17213a" />
      <circle cx={119} cy={74 + look} r="5.8" fill="#17213a" />
      <circle cx={85.2} cy={71.5 + look} r="1.9" fill="#fff" />
      <circle cx={121.2} cy={71.5 + look} r="1.9" fill="#fff" />
      {mood === 'stuck' && (
        <g className="sp-line" strokeWidth="3.2">
          <path d="M72 58 L90 62" />
          <path d="M128 58 L110 62" />
        </g>
      )}
    </g>
  );
}

function Mouth({ mood }: { mood: SparkyMood }) {
  switch (mood) {
    case 'cheer':
      return (
        <g>
          <path d="M87 102 Q100 122 113 102 Z" fill="#7a2233" />
          <path d="M93 110 Q100 118 107 110 Q100 106 93 110 Z" fill="#f09aa7" />
        </g>
      );
    case 'stuck':
      return <path className="sp-line" strokeWidth="3.2" d="M87 107 Q93 102 100 107 Q107 112 113 107" />;
    case 'sleepy':
    case 'think':
      return <ellipse cx="100" cy="107" rx="4.5" ry="5" fill="#7a2233" />;
    case 'okay':
      return <path className="sp-line" strokeWidth="3.2" d="M90 106 L110 106" />;
    default:
      return <path className="sp-line" strokeWidth="3.4" d="M88 103 Q100 113 112 103" />;
  }
}

export function Sparky({
  mood = 'happy',
  hat,
  neck,
  face,
  crop = 'full',
  size = '12rem',
  idle = true,
  title,
  className = '',
}: SparkyProps) {
  const bellyId = `sp-belly-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const armsUp = mood === 'cheer';
  const viewBox = crop === 'head' ? '38 14 124 116' : '0 0 200 200';
  return (
    <svg
      className={`sparky ${idle ? 'sparky--idle' : ''} sparky--${mood} ${className}`}
      viewBox={viewBox}
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g className="sp-bob">
        {crop === 'full' && (
          <>
            {/* tail */}
            <path d="M136 168 C168 172 186 152 178 126" fill="none" stroke="#2e9b5b" strokeWidth="15" strokeLinecap="round" />
            <path d="M170 128 L180 108 L190 128 L180 134 Z" fill="#f5c518" strokeLinejoin="round" />
            {/* wings */}
            <path d="M64 120 C40 110 28 90 36 74 C46 90 58 98 74 102 Z" fill="#1f7a45" />
            <path d="M136 120 C160 110 172 90 164 74 C154 90 142 98 126 102 Z" fill="#1f7a45" />
            {/* feet */}
            <ellipse cx="80" cy="185" rx="15" ry="8.5" fill="#1f7a45" />
            <ellipse cx="120" cy="185" rx="15" ry="8.5" fill="#1f7a45" />
            {/* body and segmented belly */}
            <ellipse cx="100" cy="143" rx="46" ry="44" fill="#2e9b5b" />
            <clipPath id={bellyId}>
              <ellipse cx="100" cy="151" rx="28" ry="30" />
            </clipPath>
            <ellipse cx="100" cy="151" rx="28" ry="30" fill="#f7e08a" />
            <g clipPath={`url(#${bellyId})`} stroke="#dcbd4e" strokeWidth="2.5">
              <path d="M70 138 H130" />
              <path d="M70 151 H130" />
              <path d="M70 164 H130" />
            </g>
            {/* arms */}
            {armsUp ? (
              <>
                <ellipse cx="56" cy="112" rx="9" ry="16" transform="rotate(-28 56 112)" fill="#2e9b5b" />
                <ellipse cx="144" cy="112" rx="9" ry="16" transform="rotate(28 144 112)" fill="#2e9b5b" />
              </>
            ) : (
              <>
                <ellipse cx="60" cy="146" rx="9" ry="15" transform="rotate(18 60 146)" fill="#268a50" />
                <ellipse cx="140" cy="146" rx="9" ry="15" transform="rotate(-18 140 146)" fill="#268a50" />
              </>
            )}
            {/* neck items */}
            {neck === 'scarf' && (
              <g>
                <rect x="62" y="110" width="76" height="15" rx="7.5" fill="#d43d27" />
                <path d="M74 110 V125 M90 110 V125 M106 110 V125 M122 110 V125" stroke="#f5c518" strokeWidth="4" />
                <rect x="112" y="118" width="14" height="30" rx="5" fill="#d43d27" />
                <path d="M112 132 H126 M112 142 H126" stroke="#f5c518" strokeWidth="3.5" />
              </g>
            )}
            {neck === 'bowtie' && (
              <g>
                <path d="M100 119 L80 108 L80 132 Z M100 119 L120 108 L120 132 Z" fill="#2449d8" strokeLinejoin="round" />
                <rect x="94" y="113" width="12" height="12" rx="3" fill="#1a36a8" />
              </g>
            )}
          </>
        )}
        {/* horns */}
        <path d="M66 50 L72 22 L88 42 Z" fill="#f5c518" stroke="#f5c518" strokeWidth="5" strokeLinejoin="round" />
        <path d="M134 50 L128 22 L112 42 Z" fill="#f5c518" stroke="#f5c518" strokeWidth="5" strokeLinejoin="round" />
        {/* head */}
        <circle cx="100" cy="78" r="43" fill="#2e9b5b" />
        <ellipse cx="100" cy="96" rx="25" ry="16" fill="#52b77a" />
        <ellipse cx="92" cy="91" rx="2.6" ry="2" fill="#17213a" />
        <ellipse cx="108" cy="91" rx="2.6" ry="2" fill="#17213a" />
        <ellipse cx="66" cy="90" rx="7" ry="4.5" fill="#f29ba8" opacity="0.85" />
        <ellipse cx="134" cy="90" rx="7" ry="4.5" fill="#f29ba8" opacity="0.85" />
        <Eyes mood={mood} />
        <Mouth mood={mood} />
        {face === 'glasses' && (
          <g fill="rgba(255,255,255,0.18)" stroke="#17213a" strokeWidth="3.4">
            <circle cx="82" cy="73" r="14" />
            <circle cx="118" cy="73" r="14" />
            <path d="M96 72 Q100 68 104 72" fill="none" />
          </g>
        )}
        {hat === 'crown' && (
          <g>
            <path d="M70 46 L74 20 L88 34 L100 14 L112 34 L126 20 L130 46 Z" fill="#f5c518" stroke="#c29b00" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="100" cy="36" r="4" fill="#2449d8" />
            <circle cx="82" cy="40" r="3" fill="#d43d27" />
            <circle cx="118" cy="40" r="3" fill="#d43d27" />
          </g>
        )}
        {hat === 'cap' && (
          <g>
            <path d="M58 56 Q100 4 142 56 Z" fill="#2449d8" />
            <path d="M52 57 Q100 46 160 60 Q156 66 140 64 Q100 58 56 63 Z" fill="#1a36a8" />
            <circle cx="100" cy="24" r="4.5" fill="#f5c518" />
          </g>
        )}
        {mood === 'sleepy' && (
          <g fill="#6b7389" fontFamily="Lexend, sans-serif" fontWeight="700">
            <text x="140" y="44" fontSize="16">z</text>
            <text x="152" y="30" fontSize="12">z</text>
          </g>
        )}
      </g>
    </svg>
  );
}
