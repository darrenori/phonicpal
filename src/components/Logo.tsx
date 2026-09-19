import './logo.css';

/** The kit in miniature: a rod, a cube, and a drop block on one shelf. */
export function LogoMark({ size = '1.9rem' }: { size?: string }) {
  return (
    <svg className="logo-mark" viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <rect x="3" y="4" width="10" height="24" rx="2.5" fill="var(--cobalt)" />
      <rect x="15" y="14" width="10" height="14" rx="2.5" fill="var(--lemon)" />
      <rect x="27" y="14" width="10" height="22" rx="2.5" fill="var(--vermilion)" />
      <rect x="1" y="28" width="38" height="2.4" rx="1.2" fill="var(--ink)" />
    </svg>
  );
}

export function Logo({ suffix, href }: { suffix?: string; href?: string }) {
  const content = (
    <>
      <LogoMark />
      <span className="logo-word">PhonicPal</span>
      {suffix && <span className="logo-suffix">{suffix}</span>}
    </>
  );
  return href ? (
    <a className="logo" href={href} aria-label={`PhonicPal${suffix ? ` ${suffix}` : ''}, home`}>
      {content}
    </a>
  ) : (
    <span className="logo">{content}</span>
  );
}
