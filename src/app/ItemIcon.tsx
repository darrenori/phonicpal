/** Shop items drawn in the kit's flat, hard-edged grammar. */
export function ItemIcon({ id, size = '2.6rem' }: { id: string; size?: string }) {
  const common = { viewBox: '0 0 48 48', width: size, height: size, 'aria-hidden': true as const };
  switch (id) {
    case 'mango':
      return (
        <svg {...common}>
          <path d="M10 30 C8 16 22 8 34 12 C44 16 42 32 30 38 C20 42 12 38 10 30 Z" fill="#f5a524" />
          <path d="M14 30 C14 20 24 14 32 16" fill="none" stroke="#ffd166" strokeWidth="3" strokeLinecap="round" />
          <path d="M33 11 C35 6 40 5 42 6 C41 10 37 12 33 11 Z" fill="#2e9b5b" />
        </svg>
      );
    case 'curry-puff':
      return (
        <svg {...common}>
          <path d="M6 32 A18 18 0 0 1 42 32 Z" fill="#e8a33c" />
          <path d="M8 32 Q12 27 16 32 Q20 27 24 32 Q28 27 32 32 Q36 27 40 32" fill="none" stroke="#b86f16" strokeWidth="3" strokeLinecap="round" />
          <rect x="6" y="31" width="36" height="5" rx="2.5" fill="#c9821f" />
        </svg>
      );
    case 'kaya-toast':
      return (
        <svg {...common}>
          <rect x="6" y="12" width="36" height="12" rx="4" fill="#e3a857" />
          <rect x="8" y="22" width="32" height="5" fill="#7bb661" />
          <rect x="8" y="26" width="32" height="4" fill="#fff4d6" />
          <rect x="6" y="29" width="36" height="10" rx="4" fill="#e3a857" />
        </svg>
      );
    case 'ball':
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="17" fill="#d43d27" />
          <path d="M7 24 H41" stroke="#f5c518" strokeWidth="6" />
          <circle cx="24" cy="24" r="17" fill="none" stroke="#a82c19" strokeWidth="2" />
        </svg>
      );
    case 'kite':
      return (
        <svg {...common}>
          <path d="M24 4 L38 20 L24 36 L10 20 Z" fill="#2449d8" />
          <path d="M24 4 L24 36 M10 20 H38" stroke="#f5c518" strokeWidth="2.5" />
          <path d="M24 36 Q20 40 24 42 Q28 44 24 47" fill="none" stroke="#17213a" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'scarf':
      return (
        <svg {...common}>
          <rect x="6" y="12" width="36" height="12" rx="6" fill="#d43d27" />
          <path d="M14 12 V24 M22 12 V24 M30 12 V24" stroke="#f5c518" strokeWidth="3.5" />
          <rect x="28" y="20" width="10" height="22" rx="4" fill="#d43d27" />
          <path d="M28 30 H38 M28 37 H38" stroke="#f5c518" strokeWidth="3" />
        </svg>
      );
    case 'bowtie':
      return (
        <svg {...common}>
          <path d="M24 24 L6 13 L6 35 Z M24 24 L42 13 L42 35 Z" fill="#2449d8" strokeLinejoin="round" />
          <rect x="19" y="19" width="10" height="10" rx="2.5" fill="#1a36a8" />
        </svg>
      );
    case 'glasses':
      return (
        <svg {...common}>
          <g fill="rgba(156,195,255,0.35)" stroke="#17213a" strokeWidth="3.2">
            <circle cx="14" cy="26" r="9" />
            <circle cx="34" cy="26" r="9" />
          </g>
          <path d="M23 25 Q24 22 25 25" fill="none" stroke="#17213a" strokeWidth="3" />
        </svg>
      );
    case 'cap':
      return (
        <svg {...common}>
          <path d="M8 30 Q24 2 40 30 Z" fill="#2449d8" />
          <path d="M4 30 Q24 25 46 32 Q44 36 36 35 Q24 33 6 35 Z" fill="#1a36a8" />
          <circle cx="24" cy="12" r="3" fill="#f5c518" />
        </svg>
      );
    case 'crown':
      return (
        <svg {...common}>
          <path d="M6 36 L8 12 L17 22 L24 8 L31 22 L40 12 L42 36 Z" fill="#f5c518" stroke="#c29b00" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="24" cy="26" r="3.5" fill="#2449d8" />
          <circle cx="14" cy="29" r="2.5" fill="#d43d27" />
          <circle cx="34" cy="29" r="2.5" fill="#d43d27" />
        </svg>
      );
    default:
      return <svg {...common} />;
  }
}
