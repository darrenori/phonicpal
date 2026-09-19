import { useEffect, useRef, useState } from 'react';
import { HeartHandshake, X } from 'lucide-react';
import { Sparky } from '../components/Sparky';
import { Hear } from '../components/Controls';
import { moodWatch, useMoodWatch, type WatchState } from '../ml/moodWatch';
import { updateSettings, useSettings } from '../shared/settings';
import { LiveView, ReadingBars, UpsetMeter, childWord } from './SparkyCam';

const STATUS: Record<WatchState, string> = {
  off: 'Sparky Helps is off.',
  starting: 'Waking Sparky up…',
  watching: 'Sparky Helps is on.',
  blocked: 'The camera is blocked. A grown-up can allow it in this browser’s site settings, then try again.',
  unsupported: 'This device or browser can’t share its camera with Sparky Helps.',
  preview: 'Sparky Helps can’t use the camera inside this preview. Open the full Upside app at upside-reads.vercel.app/app/ to use it live.',
  error: 'Sparky Helps couldn’t start. Check the connection and try again.',
};

const ABOUT =
  'When Sparky Helps is on, Sparky watches the camera for signs that you feel upset or stuck, like a frown. Then Sparky offers a break, a breathing game or an easier word. You can always say no thanks.';

export function SparkyHelpsPanel({ open, onClose, onPreview }: { open: boolean; onClose: () => void; onPreview: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const settings = useSettings();
  const watch = useMoodWatch();
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setAgreed(false);
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open]);

  const on = settings.sparkyHelps;
  const failed = watch.state === 'blocked' || watch.state === 'unsupported' || watch.state === 'preview' || watch.state === 'error';
  const live = on && (watch.state === 'starting' || watch.state === 'watching');

  const turnOn = () => {
    updateSettings({ sparkyHelps: true });
    moodWatch.start();
  };
  const turnOff = () => {
    updateSettings({ sparkyHelps: false });
    moodWatch.stop();
  };

  return (
    <dialog ref={ref} className="dialog helps" aria-labelledby="helps-title" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="dialog-inner">
        <div className="drawer-head">
          <h2 id="helps-title">
            Sparky Helps <Hear text={ABOUT} label="Hear what Sparky Helps does" />
          </h2>
          <button type="button" className="cube cube--sm" onClick={onClose} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {!live && (
          <div className="helps-intro">
            <Sparky mood="okay" size="4.5rem" />
            <p>{ABOUT}</p>
          </div>
        )}

        {live ? (
          <section className="helps-live" aria-label="Sparky Helps, live">
            <p className="helps-status" role="status">
              <span className={`helps-dot ${watch.state === 'watching' ? 'is-on' : ''}`} aria-hidden="true" />
              {watch.state === 'watching'
                ? watch.face
                  ? 'Sparky Helps is on and can see you.'
                  : 'Sparky Helps is on. Move into view of the camera.'
                : STATUS[watch.state]}
            </p>

            <div className="helps-watch">
              <figure className="helps-cam">
                <LiveView />
                <figcaption>
                  Sparky sees: <strong>{childWord(watch)}</strong>
                </figcaption>
              </figure>
              <div className="helps-readout">
                <h3 className="field-label">What the model reads, live</h3>
                <ReadingBars />
              </div>
            </div>

            {watch.state === 'watching' && (
              <div className="helps-meter-wrap">
                <span className="field-label">How upset Sparky thinks you look</span>
                <UpsetMeter upset={watch.upset} showMark />
                <p className="step-note">
                  When the red reaches the marked cell and stays there for 3 seconds, Sparky comes to check on you. Try it: make a grumpy face.
                </p>
              </div>
            )}

            <div className="step-actions">
              <button type="button" className="rod rod--surface rod--sm" onClick={onPreview}>
                <span className="rod-label">See what Sparky does</span>
              </button>
              <button type="button" className="rod rod--ghost rod--sm" onClick={turnOff}>
                <span className="rod-label">Turn off Sparky Helps</span>
              </button>
            </div>
          </section>
        ) : (
          <section className="helps-consent" aria-label="Turn on Sparky Helps">
            {failed && (
              <p className="notice" role="alert">
                {STATUS[watch.state]}
              </p>
            )}
            <div className="helps-grownups">
              <h3>For grown-ups</h3>
              <ul className="brick-list">
                <li>Sparky Helps uses this device’s camera, live. A small model reads the picture inside this browser several times a second.</li>
                <li>The camera picture stays on screen in a corner while Sparky Helps is on, so the child always knows it’s on.</li>
                <li>No pictures or video are saved or sent anywhere. Feelings aren’t recorded or shown to teachers.</li>
                <li>Faces don’t always show how a child feels, so Sparky only offers help. The child decides.</li>
              </ul>
            </div>
            <label className="helps-agree">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I’m a grown-up, and I’m happy for Sparky Helps to use this device’s camera.</span>
            </label>
            <div className="step-actions">
              <button type="button" className="rod rod--leaf" disabled={!agreed} onClick={turnOn}>
                <span className="rod-label">{failed ? 'Try again' : 'Turn on the camera'}</span>
                <span className="rod-unit">
                  <HeartHandshake size={20} aria-hidden="true" />
                </span>
              </button>
              {failed && on && (
                <button type="button" className="rod rod--ghost" onClick={turnOff}>
                  <span className="rod-label">Keep it off</span>
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </dialog>
  );
}

/** The header control: shows whether Sparky Helps is on, and opens its panel. */
export function SparkyHelpsButton({ onOpen }: { onOpen: () => void }) {
  const settings = useSettings();
  const watch = useMoodWatch();
  const live = settings.sparkyHelps && watch.state === 'watching';
  return (
    <button type="button" className="app-feel app-helps" onClick={onOpen} aria-label={live ? 'Sparky Helps is on. Open its settings.' : 'Sparky Helps. Open its settings.'}>
      <span className="app-helps-icon">
        <HeartHandshake size={20} strokeWidth={2.2} aria-hidden="true" />
        <span className={`helps-dot ${live ? 'is-on' : ''}`} aria-hidden="true" />
      </span>
      <span>Sparky Helps</span>
    </button>
  );
}
