import { useMemo, useRef, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, Download, ExternalLink, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ReadingLayer } from '../components/ReadingTools';
import { href } from '../shared/routes';
import { readProgress, STEPS, today, type Feeling } from '../shared/progress';
import { buildWord } from '../shared/words';
import { LENS_LABEL, SHAKY, bestLens, skillRows, suggest } from '../shared/learner';
import { dayDates, PHONOGRAMS, SAMPLE_CLASS, SAMPLE_LEARNERS, type Learner, type Mastery } from './sampleData';
import { DayRods, FeelingsBar, SupportChips, WordsSecured, FEELING_LABEL } from './parts';
import './dashboard.css';

type SortKey = 'name' | 'minutes' | 'words' | 'streak';

function total(l: Learner, days = 14) {
  return l.minutes.slice(-days).reduce((a, b) => a + b, 0);
}

/** The learner on this device, built from real on-device progress. */
function deviceLearner(): Learner | null {
  const p = readProgress();
  const dates = dayDates(14).map((d) => today(d));
  const minutes = dates.map((k) => Math.round(p.days[k]?.minutes ?? 0));
  const words = Object.keys(p.wordSteps);
  if (!words.length && !minutes.some(Boolean) && !p.feelings.length) return null;
  const secured = words.filter((w) => STEPS.every((s) => p.wordSteps[w]?.[s]));
  const since = new Date();
  since.setDate(since.getDate() - 13);
  const feelings: Record<Feeling, number> = { happy: 0, okay: 0, stuck: 0, tired: 0 };
  p.feelings.filter((f) => new Date(f.at) >= since).forEach((f) => (feelings[f.feeling] += 1));
  const graphemes = (list: string[]) => new Set(list.flatMap((w) => buildWord(w)?.syllables.flatMap((s) => s.sounds.map((u) => u.grapheme)) ?? []));
  const secureG = graphemes(secured);
  const seenG = graphemes(words);
  let streak = 0;
  for (let i = dates.length - 1; i >= 0 && (p.days[dates[i]]?.steps ?? 0) + minutes[i] > 0; i--) streak++;
  const lastKey = Object.keys(p.days).sort().at(-1);
  return {
    id: 'device',
    name: p.name || 'This device',
    level: '—',
    minutes,
    wordsPractised: words.length,
    wordsSecured: secured.length,
    sayTries: Object.values(p.days).reduce((n, d) => n + d.tries, 0),
    support: [],
    feelings,
    streak,
    lastActive: lastKey === today() ? 'Today' : lastKey ?? '—',
    phonograms: PHONOGRAMS.map((g) => ({ g, status: (secureG.has(g) ? 'secure' : seenG.has(g) ? 'practising' : 'new') as Mastery })),
    live: true,
  };
}

function toCsv(rows: Learner[]): string {
  const head = ['Learner', 'Level', 'Minutes (14 days)', 'Words practised', 'Words secured', 'Tries out loud', 'Needs support', 'Happy', 'Okay', 'Stuck', 'Tired', 'Streak (days)', 'Last active', 'Sample data'];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = rows.map((l) =>
    [l.name, l.level, total(l), l.wordsPractised, l.wordsSecured, l.sayTries, l.support.join('; '), l.feelings.happy, l.feelings.okay, l.feelings.stuck, l.feelings.tired, l.streak, l.lastActive, l.live ? 'no' : 'yes']
      .map(esc)
      .join(','),
  );
  return [head.map(esc).join(','), ...lines].join('\r\n');
}

/**
 * What the model believes, for the grown-up who has to answer for it.
 *
 * Everything Upside decides about a child comes from three things: a probability per
 * letter-sound, a record of which lens their successes followed, and the word it would
 * pick next. All three are shown here in full, with the reason attached, so a teacher can
 * disagree with it. This section only appears for the learner on this device, because
 * that is the only real model: the rest of the class is sample data.
 */
function ModelPanel() {
  const rows = skillRows();
  const lens = bestLens();
  const next = suggest();
  if (!rows.length) return null;
  return (
    <section aria-labelledby="d-model">
      <h3 id="d-model">What the model believes</h3>
      <ul className="model-rows">
        {rows.slice(0, 8).map((row) => (
          <li key={row.id} className="model-row">
            <span className="model-sound">{row.label}</span>
            <span className="model-bar">
              <span className={`model-fill ${row.p < SHAKY ? 'is-shaky' : row.p >= 0.8 ? 'is-known' : ''}`} style={{ width: `${Math.round(row.p * 100)}%` }} />
            </span>
            <span className="model-num num">{Math.round(row.p * 100)}%</span>
            <span className="muted">{row.seen} {row.seen === 1 ? 'try' : 'tries'}</span>
          </li>
        ))}
      </ul>
      <p className="muted">
        Each number is the model's confidence that this child knows that letter-sound, updated from tries out loud and card reviews. It starts at 20% and
        is deliberately slow to claim knowledge.
      </p>
      {lens && (
        <p className="detail-focus">
          <strong>Most of their successes follow the {LENS_LABEL[lens.lens].toLowerCase()} view.</strong> Upside suggests it and nothing more: a child is
          not a learning style, and this is only a record of what has worked so far.
        </p>
      )}
      {next && (
        <p className="detail-focus">
          <strong>Next word Upside would pick:</strong> “{next.word}”, because {next.why}
        </p>
      )}
    </section>
  );
}

function LearnerDetail({ learner, onClose }: { learner: Learner; onClose: () => void }) {
  const dates = dayDates(14);
  const max = Math.max(10, ...learner.minutes);
  const counts = learner.phonograms.reduce(
    (acc, p) => ({ ...acc, [p.status]: acc[p.status] + 1 }),
    { secure: 0, practising: 0, new: 0 } as Record<Mastery, number>,
  );
  const focus = learner.phonograms.filter((p) => p.status === 'practising').slice(0, 3).map((p) => p.g);
  return (
    <div className="detail">
      <div className="detail-head">
        <div>
          <h2>{learner.name}</h2>
          <p className="muted">
            {learner.live ? 'Live progress from this device' : `${learner.level} · sample learner`} · last active {learner.lastActive.toLowerCase()}
          </p>
        </div>
        <button type="button" className="cube cube--sm" onClick={onClose} aria-label="Close learner details">
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <section aria-labelledby="d-minutes">
        <h3 id="d-minutes">Practice, last 14 days</h3>
        <div className="detail-rods" role="img" aria-label={learner.minutes.map((m, i) => `${dates[i].toLocaleDateString('en-SG', { day: 'numeric', month: 'short' })}: ${m} minutes`).join(', ')}>
          {learner.minutes.map((m, i) => (
            <div key={i} className="detail-rod">
              <span className="detail-rod-val num">{m || ''}</span>
              <span className="detail-rod-bar" style={{ height: `${Math.max(2, (m / max) * 100)}%` }} />
              <span className="detail-rod-day">{dates[i].toLocaleDateString('en-SG', { weekday: 'narrow' })}</span>
            </div>
          ))}
        </div>
        <p className="muted">
          {total(learner)} minutes in total · {learner.streak}-day streak · {learner.sayTries} tries out loud
        </p>
      </section>

      <section aria-labelledby="d-sounds">
        <h3 id="d-sounds">Sounds</h3>
        <ul className="phono">
          {learner.phonograms.map((p) => (
            <li key={p.g} className={`phono-box phono-box--${p.status}`} title={`${p.g}: ${p.status}`}>
              {p.g}
            </li>
          ))}
        </ul>
        <p className="phono-legend">
          <span>
            <i className="phono-key phono-box--secure" aria-hidden="true" /> Secure {counts.secure}
          </span>
          <span>
            <i className="phono-key phono-box--practising" aria-hidden="true" /> Practising {counts.practising}
          </span>
          <span>
            <i className="phono-key phono-box--new" aria-hidden="true" /> Not yet {counts.new}
          </span>
        </p>
        {focus.length > 0 && (
          <p className="detail-focus">
            <strong>Suggested next focus:</strong> {focus.join(', ')}
            {learner.support.length ? `, and ${learner.support.join(', ')}` : ''}.
          </p>
        )}
      </section>

      {learner.live && <ModelPanel />}

      <section aria-labelledby="d-feel">
        <h3 id="d-feel">How they said they felt</h3>
        <FeelingsBar feelings={learner.feelings} showLabels />
        {learner.feelings.stuck >= 3 && <p className="detail-flag">Several “stuck” check-ins. A short, encouraging conversation may help.</p>}
      </section>
    </div>
  );
}

export function Dashboard() {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'minutes', dir: -1 });
  const [level, setLevel] = useState<'All' | 'P2' | 'P3'>('All');
  const [supportOnly, setSupportOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Learner | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const device = useMemo(deviceLearner, []);

  const all = useMemo(() => (device ? [device, ...SAMPLE_LEARNERS] : SAMPLE_LEARNERS), [device]);
  const rows = useMemo(() => {
    const filtered = all.filter(
      (l) =>
        (level === 'All' || l.level === level || l.live) &&
        (!supportOnly || l.support.length > 0 || l.feelings.stuck >= 3) &&
        l.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
    const value = (l: Learner) => (sort.key === 'name' ? l.name : sort.key === 'minutes' ? total(l) : sort.key === 'words' ? l.wordsSecured : l.streak);
    return [...filtered].sort((a, b) => {
      if (a.live) return -1;
      if (b.live) return 1;
      const va = value(a);
      const vb = value(b);
      return (typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number)) * sort.dir;
    });
  }, [all, level, supportOnly, query, sort]);

  const sample = SAMPLE_LEARNERS;
  const activeWeek = sample.filter((l) => l.minutes.slice(-7).some(Boolean)).length;
  const classDaily = dayDates(14).map((_, i) => sample.reduce((n, l) => n + l.minutes[i], 0));
  const classMax = Math.max(...classDaily);
  const secured = sample.reduce((n, l) => n + l.wordsSecured, 0);
  const practised = sample.reduce((n, l) => n + l.wordsPractised, 0);
  const feelings = sample.reduce(
    (acc, l) => ({ happy: acc.happy + l.feelings.happy, okay: acc.okay + l.feelings.okay, stuck: acc.stuck + l.feelings.stuck, tired: acc.tired + l.feelings.tired }),
    { happy: 0, okay: 0, stuck: 0, tired: 0 } as Record<Feeling, number>,
  );
  const dates = dayDates(14);
  const maxRow = Math.max(...all.flatMap((l) => l.minutes));

  const open = (l: Learner) => {
    setSelected(l);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const exportCsv = () => {
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upside-${SAMPLE_CLASS.name.toLowerCase().replace(/\s+/g, '-')}-${today()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const sortButton = (key: SortKey, label: string) => {
    const on = sort.key === key;
    return (
      <button
        type="button"
        className={`sort ${on ? 'is-on' : ''}`}
        onClick={() => setSort(on ? { key, dir: sort.dir === 1 ? -1 : 1 } : { key, dir: key === 'name' ? 1 : -1 })}
        aria-label={`Sort by ${label}${on ? (sort.dir === 1 ? ', ascending' : ', descending') : ''}`}
      >
        {label}
        {on && (sort.dir === 1 ? <ArrowUpNarrowWide size={14} aria-hidden="true" /> : <ArrowDownWideNarrow size={14} aria-hidden="true" />)}
      </button>
    );
  };

  return (
    <div className="edu">
      <a className="skip-link" href="#main">
        Skip to class overview
      </a>
      <header className="edu-bar">
        <div className="edu-bar-inner">
          <Logo href={href('home', 'educators')} suffix="Educators" />
          <div className="edu-bar-class">
            <strong>{SAMPLE_CLASS.name}</strong>
            <span>
              {SAMPLE_CLASS.school} · {SAMPLE_CLASS.teacher}
            </span>
          </div>
          <div className="edu-bar-actions">
            <button type="button" className="rod rod--sm rod--lemon" onClick={exportCsv}>
              <span className="rod-label">Export CSV</span>
              <span className="rod-unit">
                <Download size={16} aria-hidden="true" />
              </span>
            </button>
            <a className="rod rod--sm rod--ghost edu-ghost" href={href('app', 'educators')}>
              <span className="rod-label">
                Learner app <ExternalLink size={14} aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </header>

      <main id="main" className="edu-main">
        <p className="sample-note">
          <span className="sample-badge">Sample data</span> Every name and number in this class is invented to show how the view works.
          {device ? ' The first row is real progress from the learner app on this device.' : ' Practise in the learner app on this device and your own row appears here.'}
        </p>

        <section className="summary" aria-label="Class summary, last 14 days">
          <div className="summary-item">
            <h2>Practised this week</h2>
            <div className="unit-row" role="img" aria-label={`${activeWeek} of ${sample.length} learners practised this week`}>
              {sample.map((l, i) => (
                <span key={l.id} className={i < activeWeek ? 'is-on' : ''} />
              ))}
            </div>
            <p>
              <strong className="num">{activeWeek}</strong> of {sample.length} learners
            </p>
          </div>
          <div className="summary-item summary-item--wide">
            <h2>Class minutes per day</h2>
            <div className="class-rods" role="img" aria-label={classDaily.map((m, i) => `${dates[i].toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric' })}: ${m} minutes`).join(', ')}>
              {classDaily.map((m, i) => (
                <div key={i} className="class-rod">
                  <span className="class-rod-bar" style={{ height: `${Math.max(3, (m / classMax) * 100)}%` }} />
                  <span className="class-rod-day">{dates[i].toLocaleDateString('en-SG', { weekday: 'narrow' })}</span>
                </div>
              ))}
            </div>
            <p>
              <strong className="num">{classDaily.reduce((a, b) => a + b, 0)}</strong> minutes in 14 days
            </p>
          </div>
          <div className="summary-item">
            <h2>Words secured</h2>
            <span className="secured secured--lg" aria-hidden="true">
              <span className="secured-bar">
                <span style={{ width: `${(secured / practised) * 100}%` }} />
              </span>
            </span>
            <p>
              <strong className="num">{secured}</strong> of {practised} practised words, through all four steps
            </p>
          </div>
          <div className="summary-item">
            <h2>Check-ins</h2>
            <FeelingsBar feelings={feelings} />
            <p>
              <strong className="num">{Object.values(feelings).reduce((a, b) => a + b, 0)}</strong> in the children’s own words
            </p>
          </div>
        </section>

        <section className="roster" aria-labelledby="roster-title">
          <div className="roster-head">
            <h2 id="roster-title">Learners</h2>
            <div className="roster-filters">
              <div className="tiles" role="radiogroup" aria-label="Level">
                {(['All', 'P2', 'P3'] as const).map((l) => (
                  <button key={l} type="button" role="radio" aria-checked={level === l} className="tile" onClick={() => setLevel(l)}>
                    {l}
                  </button>
                ))}
              </div>
              <button type="button" className="tile" aria-pressed={supportOnly} onClick={() => setSupportOnly((v) => !v)}>
                Needs support
              </button>
              <label htmlFor="roster-search" className="visually-hidden">
                Find a learner
              </label>
              <input id="roster-search" className="input roster-search" placeholder="Find a learner" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          <div className="table-scroll">
            <table className="ltable">
              <thead>
                <tr>
                  <th scope="col">{sortButton('name', 'Learner')}</th>
                  <th scope="col" className="col-wide">Last 14 days</th>
                  <th scope="col" className="num-col col-wide">
                    {sortButton('minutes', 'Minutes')}
                  </th>
                  <th scope="col">{sortButton('words', 'Words secured')}</th>
                  <th scope="col">Needs support</th>
                  <th scope="col" className="col-wide">Check-ins</th>
                  <th scope="col" className="num-col col-wide">
                    {sortButton('streak', 'Streak')}
                  </th>
                  <th scope="col" className="col-wide">Last active</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id} className={l.live ? 'is-live' : ''}>
                    <th scope="row">
                      <button type="button" className="learner-btn" onClick={() => open(l)}>
                        <span className="learner-name">{l.name}</span>
                        <span className="learner-meta">{l.live ? 'Live on this device' : l.level}</span>
                      </button>
                    </th>
                    <td className="col-wide">
                      <DayRods minutes={l.minutes} max={maxRow} label={`Minutes per day, last 14 days: ${l.minutes.join(', ')}`} />
                    </td>
                    <td className="num-col num col-wide">{total(l)}</td>
                    <td>
                      <WordsSecured l={l} />
                    </td>
                    <td>
                      <SupportChips items={l.support} />
                    </td>
                    <td className="col-wide">
                      <FeelingsBar feelings={l.feelings} />
                    </td>
                    <td className="num-col num col-wide">{l.streak ? `${l.streak} d` : '—'}</td>
                    <td className="muted col-wide">{l.lastActive}</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={8} className="empty-row">
                      No learners match these filters. Try “All” levels or clear the search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="muted table-hint">Select a learner’s name to see their sounds and check-ins.</p>
        </section>

        <section className="framework" aria-labelledby="framework-title">
          <h2 id="framework-title">What this view measures, and what it doesn’t</h2>
          <div className="framework-grid">
            <div>
              <h3>Effort and habit</h3>
              <p>Minutes of active practice, the days a child returns on their own, and tries out loud. Tries are counted as effort, never scored.</p>
            </div>
            <div>
              <h3>Learning</h3>
              <p>Words secured through all four steps (see, hear, tap, say), and which sounds are secure, being practised, or not yet met.</p>
            </div>
            <div>
              <h3>Confidence</h3>
              <p>{Object.values(FEELING_LABEL).join(', ')}: how children describe their own feelings. Several “stuck” check-ins flag a learner for a kind conversation.</p>
            </div>
            <div>
              <h3>Never collected</h3>
              <p>Camera images, voice recordings, and keystrokes. The mirror and microphone work on the child’s device and nothing is saved.</p>
            </div>
          </div>
        </section>
      </main>

      <dialog ref={dialogRef} className="drawer edu-drawer" aria-label={selected ? `${selected.name}, details` : 'Learner details'} onClick={(e) => e.target === dialogRef.current && close()} onClose={() => setSelected(null)}>
        <div className="drawer-inner">{selected && <LearnerDetail learner={selected} onClose={close} />}</div>
      </dialog>
      <ReadingLayer />
    </div>
  );
}
