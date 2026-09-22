import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Volume2, X } from 'lucide-react';
import { Sparky } from '../components/Sparky';
import { speak, stopSpeaking } from '../shared/speech';

interface Stop {
  /** The thing on screen this stop is about. Left out for the welcome and the goodbye. */
  target?: string;
  title: string;
  body: string;
}

const STOPS: Stop[] = [
  {
    title: 'Hi! I’m Sparky.',
    body: 'I help you read. Let me show you around. I will read everything out loud, so you can just look and listen.',
  },
  {
    target: '.picker',
    title: 'Pick a word',
    body: 'Choose your school level, then tap a word. Every word has a picture, so you know what it means.',
  },
  {
    target: '.stage-bar',
    title: 'Your word, in blocks',
    body: 'Tall letters stand up. Small letters sit on the line. Hanging letters drop below it. Tap the word to hear it, and tap it again to split it into parts.',
  },
  {
    target: '.rail',
    title: 'Four steps for every word',
    body: 'See it. Hear it. Tap the sounds. Then say it out loud. You can go back to any step whenever you like.',
  },
  {
    target: '.stage-keep',
    title: 'Keep the words you want',
    body: 'Tap Keep this word and it goes into My words. Finished words are kept for you too.',
  },
  {
    target: '.app-nav',
    title: 'The other rooms',
    body: 'Snap and scan reads your homework with the camera. Maths turns sums into blocks. My words brings your kept words back. Sparky is your dragon.',
  },
  {
    target: '.coin-count',
    title: 'Coins for trying',
    body: 'Every try earns coins, even when the word is hard. Mistakes never take coins away. Spend them on snacks and hats for me.',
  },
  {
    target: '.app-tools',
    title: 'Make the page comfy',
    body: 'Reading tools change the letters, the spacing and the colour of the page. Try a coloured overlay or the reading ruler.',
  },
  {
    title: 'That’s everything!',
    body: 'Have fun building words. If you want this tour again, it is inside Reading tools.',
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 14;

/**
 * The first-run tour. It lifts one real part of the app out of the dimmed page at a time,
 * and Sparky reads each stop out loud, because a child who needs Upside may not read the
 * instructions. It can be skipped at any point and replayed from Reading tools.
 */
export function Tour({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const [spot, setSpot] = useState<Rect | null>(null);
  const [card, setCard] = useState<Rect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const stop = STOPS[i];
  const last = i === STOPS.length - 1;

  // Sparky reads each stop, and stops talking when the tour moves on or closes.
  useEffect(() => {
    speak(`${stop.title} ${stop.body}`);
    return stopSpeaking;
  }, [i, stop.body, stop.title]);

  useEffect(() => {
    const target = stop.target ? document.querySelector(stop.target) : null;
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    cardRef.current?.focus();

    // On a phone the card sits along the bottom, so nudge the page until the highlight clears it.
    const nudge = window.setTimeout(() => {
      const box = target?.getBoundingClientRect();
      const size = cardRef.current?.getBoundingClientRect();
      if (!box || !size || window.innerWidth >= 700) return;
      const free = window.innerHeight - size.height - PAD * 2;
      if (box.bottom > free && box.height < free) window.scrollBy({ top: box.bottom - free, behavior: 'smooth' });
    }, 450);

    // Follow the target every frame: the page may still be scrolling, or settling after a tap.
    let frame = 0;
    const track = () => {
      const box = target?.getBoundingClientRect();
      setSpot(box ? { top: box.top - 6, left: box.left - 6, width: box.width + 12, height: box.height + 12 } : null);
      const size = cardRef.current?.getBoundingClientRect();
      if (size) setCard(place(box, size.width, size.height));
      frame = requestAnimationFrame(track);
    };
    track();
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(nudge);
    };
  }, [i, stop.target]);

  const move = (to: number) => {
    stopSpeaking();
    if (to >= STOPS.length) onClose();
    else setI(Math.max(0, to));
  };

  return (
    <div
      className="tour"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      {spot ? <div className="tour-spot" style={spot} /> : <div className="tour-scrim" />}
      <div
        ref={cardRef}
        className="tour-card"
        tabIndex={-1}
        style={card ? { top: card.top, left: card.left } : undefined}
      >
        <div className="tour-head">
          <Sparky crop="head" mood={last ? 'cheer' : 'happy'} size="3.2rem" idle={false} />
          <div>
            <p className="tour-count">
              Step {i + 1} of {STOPS.length}
            </p>
            <h2 id="tour-title">{stop.title}</h2>
          </div>
          <button type="button" className="cube cube--sm" onClick={onClose} aria-label="Skip the tour">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="tour-body">{stop.body}</p>
        <div className="tour-actions">
          <button type="button" className="cube cube--sm" onClick={() => speak(`${stop.title} ${stop.body}`)} aria-label="Hear this again">
            <Volume2 size={18} aria-hidden="true" />
          </button>
          {i > 0 && (
            <button type="button" className="rod rod--ghost rod--sm" onClick={() => move(i - 1)}>
              <span className="rod-unit">
                <ArrowLeft size={16} aria-hidden="true" />
              </span>
              <span className="rod-label">Back</span>
            </button>
          )}
          <button type="button" className={`rod rod--sm tour-next ${last ? 'rod--leaf' : ''}`} onClick={() => move(i + 1)}>
            <span className="rod-label">{last ? 'Start practising' : 'Next'}</span>
            <span className="rod-unit">
              <ArrowRight size={16} aria-hidden="true" />
            </span>
          </button>
          {!last && (
            <button type="button" className="tour-skip" onClick={onClose}>
              Skip
            </button>
          )}
        </div>
        <div className="tour-dots" aria-hidden="true">
          {STOPS.map((s, n) => (
            <span key={s.title} className={n === i ? 'is-on' : ''} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Puts the card under the highlighted thing, or over it when there is no room below. */
function place(box: DOMRect | undefined, width: number, height: number): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
  if (!box || vw < 700) {
    // Small screens, and stops with no target, get a steady spot instead of a moving one.
    return { top: box && box.top > vh / 2 ? PAD : vh - height - PAD, left: clamp((vw - width) / 2, PAD, vw - width - PAD), width, height };
  }
  const middle = clamp(box.top + box.height / 2 - height / 2, PAD, Math.max(PAD, vh - height - PAD));
  const centred = clamp(box.left + box.width / 2 - width / 2, PAD, Math.max(PAD, vw - width - PAD));
  // Under the highlight, then over it, then beside it: a tall column leaves room only at its side.
  if (box.bottom + PAD + height < vh - PAD) return { top: box.bottom + PAD, left: centred, width, height };
  if (box.top - PAD - height > PAD) return { top: box.top - height - PAD, left: centred, width, height };
  if (box.right + PAD + width < vw - PAD) return { top: middle, left: box.right + PAD, width, height };
  if (box.left - PAD - width > PAD) return { top: middle, left: box.left - width - PAD, width, height };
  return { top: vh - height - PAD, left: centred, width, height };
}
