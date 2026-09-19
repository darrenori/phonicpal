import { useEffect, useRef, useState } from 'react';
import { HeartHandshake, X } from 'lucide-react';
import { Sparky } from '../components/Sparky';
import { Hear } from '../components/Controls';
import { moodWatch, useMoodWatch, type WatchState } from '../ml/moodWatch';
import { updateSettings, useSettings } from '../shared/settings';

const STATUS: Record<WatchState, string> = {
  off: 'Sparky Helps is off.',
  starting: 'Waking Sparky up…',
  watching: 'Sparky Helps is on.',
  blocked: 'The camera is blocked. A grown-up can allow it in this browser’s site settings, then try again.',
  unsupported: 'This device or browser can’t share its camera with Sparky Helps.',
  preview: 'This preview can’t use the camera. Sparky Helps works in the full Upside app at upside-reads.vercel.app/app/.',
  error: 'Sparky Helps couldn’t start. Check the connection and try again.',
};

const ABOUT =
  'When Sparky Helps is on, Sparky watches for signs that you feel upset or stuck, like a frown. Then Sparky offers a break, a breathing game or an easier word. You can always say no thanks.';

/** A small mirrored preview of what the camera sees, so nothing is hidden from the child. */
function Preview() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = moodWatch.mediaStream;
  }, []);
  return <video ref={ref} className="helps-preview" autoPlay muted playsInline aria-label="What the camera sees" />;
}

export function SparkyHelpsPanel({ open, onClose, onPreview }: { open: boolean; onClose: () => void; onPreview: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const settings = useSettings();
  const watch = useMoodWatch();
  const [agreed, setAgreed] = useState(false);
  const [preview, setPreview] = useState(false);

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
  const units = Math.round(watch.upset * 10);

  const turnOn = () => {
    updateSettings({ sparkyHelps: true });
    moodWatch.start();
  };
  const turnOff = () => {
    setPreview(false);
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

        <div className="helps-intro">
          <Sparky mood={watch.state === 'watching' ? 'happy' : 'okay'} size="4.5rem" />
          <p>{ABOUT}</p>
        </div>

        {on && !failed ? (
          <section className="helps-live" aria-label="Sparky Helps status">
            <p className="helps-status" role="status">
              <span className={`helps-dot ${watch.state === 'watching' ? 'is-on' : ''}`} aria-hidden="true" />
              {watch.state === 'watching' ? (watch.face ? 'Sparky Helps is on and can see you.' : 'Sparky Helps is on. Move into view of the camera.') : STATUS[watch.state]}
            </p>
            {watch.state === 'watching' && (
              <div className="helps-meter-wrap">
                <span className="field-label">How upset Sparky thinks you look</span>
                <div className="meter meter--upset" role="meter" aria-valuemin={0} aria-valuemax={10} aria-valuenow={units} aria-label="How upset Sparky thinks you look">
                  {Array.from({ length: 10 }, (_, i) => (
                    <span key={i} className={i < units ? 'is-on' : ''} />
                  ))}
                </div>
                <p className="step-note">Try it: make a grumpy face for a few seconds, and Sparky will come to check on you.</p>
              </div>
            )}
            {watch.state === 'watching' && preview && <Preview />}
            <div className="step-actions">
              {watch.state === 'watching' && (
                <button type="button" className="rod rod--surface rod--sm" aria-pressed={preview} onClick={() => setPreview((p) => !p)}>
                  <span className="rod-label">{preview ? 'Hide the camera' : 'Show the camera'}</span>
                </button>
              )}
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
                <li>A small model checks the camera picture inside this browser, about once a second.</li>
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
                <span className="rod-label">{failed ? 'Try again' : 'Turn on Sparky Helps'}</span>
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
