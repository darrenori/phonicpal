import './logo.css';

/**
 * The Upside mark: one bowl shared by a p and a d. The cobalt stem rises above the shelf
 * (d), the vermilion stem hangs below it (p). Turn the mark upside down and it is the same
 * shape: the letter flip dyslexic readers know, drawn as a friend instead of a mistake.
 */
export function LogoMark({ size = '2.3rem', title }: { size?: string; title?: string }) {
  return (
    <svg
      className="logo-mark"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <rect x="2" y="31.5" width="44" height="2" rx="1" fill="var(--ink)" />
      <g className="logo-glyph">
        <circle cx="24" cy="24" r="6" fill="none" stroke="var(--lemon)" strokeWidth="5" />
        <rect x="27.5" y="5" width="5" height="27.5" rx="2.5" fill="var(--cobalt)" />
        <rect x="15.5" y="15.5" width="5" height="27.5" rx="2.5" fill="var(--vermilion)" />
      </g>
    </svg>
  );
}

/** The wordmark: "upside" with its p and d in their block colours. */
function Wordmark() {
  return (
    <span className="logo-word" aria-hidden="true">
      u<span className="logo-p">p</span>si<span className="logo-d">d</span>e
    </span>
  );
}

export function Logo({ suffix, href }: { suffix?: string; href?: string }) {
  const label = `Upside${suffix ? ` ${suffix}` : ''}`;
  const content = (
    <>
      <LogoMark />
      <Wordmark />
      {suffix && (
        <span className="logo-suffix" aria-hidden="true">
          {suffix}
        </span>
      )}
    </>
  );
  return href ? (
    <a className="logo" href={href} aria-label={`${label}, home`}>
      {content}
    </a>
  ) : (
    <span className="logo" role="img" aria-label={label}>
      {content}
    </span>
  );
}
