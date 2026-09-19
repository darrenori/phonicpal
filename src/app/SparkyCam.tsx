import { useEffect, useRef } from 'react';
import { Maximize2, Minimize2, Settings2 } from 'lucide-react';
import { Sparky, type SparkyMood } from '../components/Sparky';
import { EXPRESSIONS, UPSET_EXPRESSIONS, UPSET_THRESHOLD, moodWatch, useMoodWatch, type Expression, type MoodSnapshot } from '../ml/moodWatch';
import { updateSettings, useSettings } from '../shared/settings';

/** Words a young reader knows, for what Sparky sees. */
const CHILD_WORD: Record<Expression, string> = {
  happy: 'Happy',
  neutral: 'Calm',
  surprised: 'Surprised',
  sad: 'Sad',
  angry: 'Angry',
  fearful: 'Worried',
  disgusted: 'Upset',
};

/** The model's own labels, for grown-ups reading the live bars. */
const MODEL_WORD: Record<Expression, string> = {
  happy: 'Happy',
  neutral: 'Neutral',
  surprised: 'Surprised',
  sad: 'Sad',
  angry: 'Angry',
  fearful: 'Fearful',
  disgusted: 'Disgusted',
};

/** Sparky mirrors happy faces and stays calm and kind for upset ones. */
const SPARKY_FACE: Record<Expression, SparkyMood> = {
  happy: 'happy',
  neutral: 'okay',
  surprised: 'think',
  sad: 'calm',
  angry: 'calm',
  fearful: 'calm',
  disgusted: 'calm',
};

type Tone = 'calm' | 'watch' | 'upset';

export function toneOf(upset: number): Tone {
  return upset >= UPSET_THRESHOLD ? 'upset' : upset >= UPSET_THRESHOLD / 2 ? 'watch' : 'calm';
}

export function childWord(watch: MoodSnapshot): string {
  if (watch.state === 'starting') return 'Waking up…';
  if (!watch.face || !watch.top) return 'Can’t see you';
  return CHILD_WORD[watch.top];
}

/**
 * The live camera picture, mirrored like a mirror, with a frame that follows the face.
 * The frame takes the colour of the upset score: leaf when calm, lemon when unsure, vermilion when upset.
 */
export function LiveView({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const watch = useMoodWatch();
  const stream = moodWatch.mediaStream;

  useEffect(() => {
    const video = ref.current;
    if (video && video.srcObject !== stream) video.srcObject = stream;
  }, [stream, watch.state]);

  const box = watch.face ? watch.box : null;
  return (
    <div className={`live-view ${className}`} style={{ aspectRatio: String(watch.aspect) }}>
      <div className="live-mirror">
        <video ref={ref} autoPlay muted playsInline aria-label="What the camera sees, live" />
        {box && (
          <span
            className={`live-frame live-frame--${toneOf(watch.upset)}`}
            style={{ left: `${box.x * 100}%`, top: `${box.y * 100}%`, width: `${box.w * 100}%`, height: `${box.h * 100}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      {watch.state === 'starting' && <span className="live-wait">Waking Sparky up…</span>}
      <span className="live-tag" aria-hidden="true">
        <span className="helps-dot is-on" /> Live
      </span>
    </div>
  );
}

/** Upset score as a row of cells, shared by the tile and the panel. */
export function UpsetMeter({ cells = 10, upset, showMark = false }: { cells?: number; upset: number; showMark?: boolean }) {
  const on = Math.round(upset * cells);
  // The first cell past the point where Sparky starts counting, when the grid lines up with it.
  const mark = showMark ? Math.round(UPSET_THRESHOLD * cells) : -1;
  return (
    <div
      className="meter meter--upset"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={cells}
      aria-valuenow={on}
      aria-label="How upset Sparky thinks you look"
    >
      {Array.from({ length: cells }, (_, i) => (
        <span key={i} className={`${i < on ? 'is-on' : ''} ${i === mark ? 'is-mark' : ''}`} />
      ))}
    </div>
  );
}

/** Every expression the model reads, live, for grown-ups who want to see how Sparky decides. */
export function ReadingBars() {
  const watch = useMoodWatch();
  const readings = watch.face ? watch.readings : null;
  return (
    <dl className="read-bars" aria-label="What the model reads right now">
      {EXPRESSIONS.map((e) => {
        const v = readings?.[e] ?? 0;
        return (
          <div key={e} className={`read-bar ${UPSET_EXPRESSIONS.includes(e) ? 'read-bar--upset' : ''} ${watch.face && watch.top === e ? 'is-top' : ''}`}>
            <dt>{MODEL_WORD[e]}</dt>
            <dd>
              <span className="read-track">
                <span className="read-fill" style={{ width: `${Math.round(v * 100)}%` }} />
              </span>
              <span className="read-num num">{Math.round(v * 100)}</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

/**
 * The corner tile shown whenever Sparky Helps is on: the live camera, what Sparky sees,
 * and how upset Sparky thinks the child looks. The child always knows the camera is on.
 */
export function SparkyCam({ onOpenSettings }: { onOpenSettings: () => void }) {
  const settings = useSettings();
  const watch = useMoodWatch();
  if (!settings.sparkyHelps || (watch.state !== 'starting' && watch.state !== 'watching')) return null;

  const small = settings.sparkyCamSmall;
  const tone = toneOf(watch.upset);
  const face = watch.face && watch.top ? SPARKY_FACE[watch.top] : 'think';
  return (
    <aside className={`cam cam--${tone} ${small ? 'cam--small' : ''}`} aria-label="Sparky Helps camera">
      {!small && <LiveView className="cam-view" />}
      <div className="cam-side">
        <div className="cam-top">
          <span className="cam-live">
            {small && <span className="helps-dot is-on" aria-hidden="true" />}
            <span className="cam-live-text">Sparky Helps</span>
          </span>
          <button
            type="button"
            className="cam-btn"
            onClick={() => updateSettings({ sparkyCamSmall: !small })}
            aria-label={small ? 'Show the camera picture' : 'Hide the camera picture'}
          >
            {small ? <Maximize2 size={16} aria-hidden="true" /> : <Minimize2 size={16} aria-hidden="true" />}
          </button>
          <button type="button" className="cam-btn" onClick={onOpenSettings} aria-label="Sparky Helps settings">
            <Settings2 size={16} aria-hidden="true" />
          </button>
        </div>
        <p className="cam-mood">
          <Sparky crop="head" mood={face} size="2rem" idle={false} />
          <span>
            <span className="visually-hidden">Sparky sees: </span>
            {childWord(watch)}
          </span>
        </p>
        {watch.state === 'watching' && <UpsetMeter cells={5} upset={watch.upset} />}
      </div>
    </aside>
  );
}
