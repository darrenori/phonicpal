import { useMemo, useState } from 'react';
import { CalendarCheck, Calculator, Camera, Flame, Hand, Mic, Sparkles, Star, Trophy } from 'lucide-react';
import { Sparky, type SparkyMood } from '../components/Sparky';
import { Hear } from '../components/Controls';
import {
  BADGES,
  DAILY_GOAL,
  buy,
  pet,
  resetProgress,
  setName,
  SHOP,
  streak,
  today,
  toggleWear,
  useProgress,
  wordsToday,
  type ShopItem,
} from '../shared/progress';
import { speak } from '../shared/speech';
import { ItemIcon } from './ItemIcon';

function week(): Array<{ key: string; label: string }> {
  const out: Array<{ key: string; label: string }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ key: today(d), label: i === 0 ? 'Today' : d.toLocaleDateString('en-SG', { weekday: 'short' }) });
  }
  return out;
}

const STICKER_ICON: Record<string, typeof Star> = {
  'first-word': Star,
  'five-words': Sparkles,
  'twenty-words': Trophy,
  'brave-voice': Mic,
  'homework-helper': Camera,
  'sum-solver': Calculator,
  'three-days': Flame,
  'whole-week': CalendarCheck,
};

export function SparkyScreen() {
  const p = useProgress();
  const [mood, setMood] = useState<SparkyMood>('happy');
  const [message, setMessage] = useState('');
  const [nameDraft, setNameDraft] = useState(p.name);
  const week7 = useMemo(week, []);
  const units = Math.round(p.happiness / 10);
  const toys = SHOP.filter((i) => i.kind === 'toy' && p.owned.includes(i.id));

  const flash = (m: SparkyMood, text: string) => {
    setMood(m);
    setMessage(text);
    speak(text);
    window.setTimeout(() => setMood('happy'), 1600);
  };

  const onBuy = (item: ShopItem) => {
    const result = buy(item);
    if (result === 'fed') flash('cheer', `Yum! Sparky loved the ${item.name.toLowerCase()}.`);
    else if (result === 'bought') flash('cheer', `${item.name}! Sparky says thank you.`);
    else if (result === 'short') setMessage(`Save up ${item.cost - p.coins} more coins for the ${item.name.toLowerCase()}. Building words earns coins.`);
  };

  const built = wordsToday(p);
  const days = streak(p);
  const weekMinutes = week7.reduce((n, d) => n + (p.days[d.key]?.minutes ?? 0), 0);
  const weekWords = new Set(week7.flatMap((d) => p.days[d.key]?.words ?? [])).size;
  const weekTries = week7.reduce((n, d) => n + (p.days[d.key]?.tries ?? 0), 0);
  const maxMinutes = Math.max(15, ...week7.map((d) => p.days[d.key]?.minutes ?? 0));

  return (
    <div className="den">
      <section className="den-hero mat" aria-labelledby="den-title">
        <div className="den-sparky">
          <Sparky mood={mood} size="clamp(10rem, 28vw, 15rem)" hat={p.wearing.hat} neck={p.wearing.neck} face={p.wearing.face} title="Sparky the dragon" />
          <div className="den-shelf" aria-label="Sparky’s toy shelf">
            {toys.length ? toys.map((t) => <ItemIcon key={t.id} id={t.id} size="2.4rem" />) : <span className="den-shelf-empty">Toys you buy live here</span>}
          </div>
        </div>
        <div className="den-info">
          <h1 id="den-title">{p.name ? `Hi ${p.name}! I’m Sparky.` : 'Hi! I’m Sparky.'}</h1>
          <p className="den-lead">
            Every word you build and every try you make earns coins. Trying counts, even when it’s tricky.{' '}
            <Hear text="Every word you build and every try you make earns coins. Trying counts, even when it's tricky." />
          </p>
          <div className="den-meter">
            <span className="field-label">Sparky’s happiness</span>
            <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p.happiness} aria-label="Sparky’s happiness">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className={i < units ? 'is-on' : ''} />
              ))}
            </div>
          </div>
          <div className="step-actions">
            <button
              type="button"
              className="rod rod--leaf"
              onClick={() => {
                pet();
                flash('cheer', 'Hee hee! That tickles.');
              }}
            >
              <span className="rod-label">Give Sparky a pat</span>
              <span className="rod-unit">
                <Hand size={20} aria-hidden="true" />
              </span>
            </button>
          </div>
          <p className="den-message" aria-live="polite">
            {message}
          </p>
          {!p.name && (
            <form
              className="field den-name"
              onSubmit={(e) => {
                e.preventDefault();
                if (nameDraft.trim()) {
                  setName(nameDraft.trim());
                  speak(`Nice to meet you, ${nameDraft.trim()}!`);
                }
              }}
            >
              <label htmlFor="den-name">What should Sparky call you?</label>
              <div className="picker-type-row">
                <input id="den-name" className="input" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={24} autoComplete="given-name" placeholder="Your name" />
                <button type="submit" className="rod rod--sm">
                  <span className="rod-label">Save</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="shop" aria-labelledby="shop-title">
        <div className="shop-head">
          <h2 id="shop-title" className="section-title">
            Sparky’s shop
          </h2>
          <span className="shop-coins">
            <span className="coin-disc" aria-hidden="true" /> <strong className="num">{p.coins}</strong> coins to spend
          </span>
        </div>
        <ul className="shop-grid">
          {SHOP.map((item) => {
            const owned = item.kind !== 'snack' && p.owned.includes(item.id);
            const wearable = item.kind === 'hat' || item.kind === 'neck' || item.kind === 'face';
            const wearing = wearable && p.wearing[item.kind as 'hat' | 'neck' | 'face'] === item.id;
            const short = !owned && p.coins < item.cost;
            return (
              <li key={item.id} className={`shop-slot ${owned ? 'is-owned' : 'ghost'}`}>
                <ItemIcon id={item.id} />
                <div className="shop-slot-text">
                  <strong>{item.name}</strong>
                  <span>{item.blurb}</span>
                </div>
                {owned ? (
                  wearable ? (
                    <button type="button" className={`tile ${wearing ? '' : ''}`} aria-pressed={wearing} onClick={() => toggleWear(item)}>
                      {wearing ? 'Wearing' : 'Wear it'}
                    </button>
                  ) : (
                    <span className="shop-owned">On the shelf</span>
                  )
                ) : (
                  <button type="button" className={`rod rod--sm ${short ? 'rod--ghost' : 'rod--lemon'}`} onClick={() => onBuy(item)} aria-label={`${item.kind === 'snack' ? 'Feed' : 'Buy'} ${item.name} for ${item.cost} coins`}>
                    <span className="rod-label">
                      <span className="coin-disc coin-disc--sm" aria-hidden="true" />
                      <span className="num">{item.cost}</span>
                    </span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="quest panel" aria-labelledby="quest-title">
        <h2 id="quest-title" className="section-title">
          Today
        </h2>
        <div className="quest-row">
          <div className="quest-cubes" role="meter" aria-valuemin={0} aria-valuemax={DAILY_GOAL} aria-valuenow={Math.min(built, DAILY_GOAL)} aria-label={`${built} of ${DAILY_GOAL} words built today`}>
            {Array.from({ length: DAILY_GOAL }, (_, i) => (
              <span key={i} className={i < built ? 'is-on' : ''} />
            ))}
          </div>
          <p className="quest-text">
            {built >= DAILY_GOAL ? (
              <>
                <strong>Goal done!</strong> {built} {built === 1 ? 'word' : 'words'} built today. Five bonus coins are yours.
              </>
            ) : (
              <>
                <strong>
                  {built} of {DAILY_GOAL}
                </strong>{' '}
                words built today. Finish {DAILY_GOAL - built} more for five bonus coins.
              </>
            )}
          </p>
        </div>
        <p className="quest-streak">
          <Flame size={20} aria-hidden="true" />
          {days > 0 ? (
            <>
              <strong className="num">{days}</strong> {days === 1 ? 'day' : 'days'} of practice in a row
            </>
          ) : (
            <>Practise today to start a streak</>
          )}
        </p>
      </section>

      <section className="stickers panel" aria-labelledby="stickers-title">
        <h2 id="stickers-title" className="section-title">
          Stickers
        </h2>
        <ul className="sticker-grid">
          {BADGES.map((badge) => {
            const Icon = STICKER_ICON[badge.id] ?? Star;
            const earned = p.badges.includes(badge.id);
            return (
              <li key={badge.id} className={`sticker ${earned ? 'is-on' : 'ghost'}`}>
                <span className="sticker-face" aria-hidden="true">
                  <Icon size={24} strokeWidth={2.2} />
                </span>
                <strong>{badge.name}</strong>
                <span className="sticker-blurb">{earned ? badge.blurb : `Not yet: ${badge.blurb.toLowerCase()}`}</span>
              </li>
            );
          })}
        </ul>
        <p className="step-note">Every sticker is worth five coins. Stickers are never taken away.</p>
      </section>

      <section className="my-week panel" aria-labelledby="week-title">
        <h2 id="week-title" className="section-title">
          My week
        </h2>
        <div className="week-facts">
          <p>
            <strong className="num">{Math.round(weekMinutes)}</strong> minutes of practice
          </p>
          <p>
            <strong className="num">{weekWords}</strong> {weekWords === 1 ? 'word' : 'words'} built
          </p>
          <p>
            <strong className="num">{weekTries}</strong> brave {weekTries === 1 ? 'try' : 'tries'} out loud
          </p>
        </div>
        <div className="week-rods" role="img" aria-label={`Practice minutes: ${week7.map((d) => `${d.label} ${Math.round(p.days[d.key]?.minutes ?? 0)}`).join(', ')}`}>
          {week7.map((d) => {
            const m = p.days[d.key]?.minutes ?? 0;
            const cubes = Math.ceil(m / 5);
            const slots = Math.ceil(maxMinutes / 5);
            return (
              <div key={d.key} className="week-col">
                <div className="week-stack">
                  {Array.from({ length: slots }, (_, i) => (
                    <span key={i} className={i < cubes ? 'is-on' : ''} />
                  ))}
                </div>
                <span className="week-day">{d.label}</span>
              </div>
            );
          })}
        </div>
        <p className="step-note">Each cube is five minutes of practice.</p>
        <details className="grownups">
          <summary>For grown-ups</summary>
          <p>Progress is saved on this device only. Clearing it starts Sparky fresh with 20 coins.</p>
          <button
            type="button"
            className="rod rod--sm rod--ghost"
            onClick={() => {
              if (window.confirm('Clear all progress on this device? This cannot be undone.')) resetProgress();
            }}
          >
            <span className="rod-label">Clear progress on this device</span>
          </button>
        </details>
      </section>
    </div>
  );
}
