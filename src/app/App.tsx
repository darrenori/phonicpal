import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, Calculator, Camera, Layers, Type, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ReadingLayer, ReadingTools } from '../components/ReadingTools';
import { Sparky } from '../components/Sparky';
import { href } from '../shared/routes';
import { startPracticeClock, useProgress } from '../shared/progress';
import { readSettings, updateSettings } from '../shared/settings';
import { moodWatch } from '../ml/moodWatch';
import { stopSpeaking } from '../shared/speech';
import { CoinToast } from './CoinToast';
import { FeelingsDialog } from './Feelings';
import { SparkyHelpsButton, SparkyHelpsPanel } from './SparkyHelps';
import { SparkyCam } from './SparkyCam';
import { WordsScreen } from './WordsScreen';
import { CardsScreen } from './CardsScreen';
import { Tour } from './Tour';
import { ScanScreen } from './ScanScreen';
import { MathsScreen } from './MathsScreen';
import { SparkyScreen } from './SparkyScreen';
import './app.css';

export type Tab = 'words' | 'scan' | 'maths' | 'cards' | 'sparky';
const TABS: Tab[] = ['words', 'scan', 'maths', 'cards', 'sparky'];

/** A link to #helps (or #/app/helps in the artifact) opens the Sparky Helps panel. */
function wantsHelps(): boolean {
  return /^#\/?(app\/)?helps$/.test(window.location.hash);
}

function readRoute(): { tab: Tab; word?: string } {
  // Artifact builds route as #/app/words; the static site uses #words.
  const raw = window.location.hash.replace(/^#\/?(app\/?)?/, '');
  const [tab, word] = raw.split('/');
  return TABS.includes(tab as Tab) ? { tab: tab as Tab, word: word ? decodeURIComponent(word) : undefined } : { tab: 'words' };
}

export function go(tab: Tab, word?: string): void {
  const prefix = window.location.hash.startsWith('#/app') ? '#/app/' : '#';
  window.location.hash = `${prefix}${tab}${word ? `/${encodeURIComponent(word)}` : ''}`;
}

function NavIcon({ tab, size = 26 }: { tab: Tab; size?: number }) {
  switch (tab) {
    case 'words':
      return <BookOpen size={size} strokeWidth={2.2} aria-hidden="true" />;
    case 'scan':
      return <Camera size={size} strokeWidth={2.2} aria-hidden="true" />;
    case 'maths':
      return <Calculator size={size} strokeWidth={2.2} aria-hidden="true" />;
    case 'cards':
      return <Layers size={size} strokeWidth={2.2} aria-hidden="true" />;
    case 'sparky':
      return <Sparky crop="head" size={`${size + 6}px`} idle={false} />;
  }
}

const TAB_LABEL: Record<Tab, string> = {
  words: 'Words',
  scan: 'Snap & scan',
  maths: 'Maths',
  cards: 'My words',
  sparky: 'Sparky',
};

export function App() {
  const [route, setRoute] = useState(readRoute);
  const [feelingsOpen, setFeelingsOpen] = useState(false);
  const [feelingsNudge, setFeelingsNudge] = useState(false);
  const [helpsOpen, setHelpsOpen] = useState(wantsHelps);
  const [tour, setTour] = useState(false);
  const toolsRef = useRef<HTMLDialogElement>(null);
  const progress = useProgress();

  useEffect(() => {
    const onHash = () => {
      if (wantsHelps()) setHelpsOpen(true);
      stopSpeaking();
      setRoute(readRoute());
      document.getElementById('main')?.focus({ preventScroll: true });
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    const stop = startPracticeClock();
    return () => {
      window.removeEventListener('hashchange', onHash);
      stop();
    };
  }, []);

  // Sparky Helps: when the camera helper sees a child looking upset, Sparky offers the check-in.
  // Other parts of the site can react too, through moodWatch.onHelp or the upside:sparky-helps event.
  const offerHelp = useCallback(() => {
    setHelpsOpen(false);
    setFeelingsNudge(true);
    setFeelingsOpen(true);
  }, []);
  useEffect(() => {
    const off = moodWatch.onHelp(offerHelp);
    if (readSettings().sparkyHelps) moodWatch.start();
    return () => {
      off();
      moodWatch.stop();
    };
  }, [offerHelp]);

  // First visit: Sparky shows the child around, once the page has settled.
  useEffect(() => {
    if (readSettings().tourDone || wantsHelps()) return;
    const t = window.setTimeout(() => setTour(true), 700);
    return () => window.clearTimeout(t);
  }, []);
  const endTour = useCallback(() => {
    updateSettings({ tourDone: true });
    setTour(false);
  }, []);

  const openTools = useCallback(() => toolsRef.current?.showModal(), []);
  const closeTools = useCallback(() => toolsRef.current?.close(), []);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to practice
      </a>
      <header className="app-bar">
        <Logo href={href('home', 'app')} />
        <div className="app-bar-actions">
          <SparkyHelpsButton onOpen={() => setHelpsOpen(true)} />
          <button type="button" className="app-feel" onClick={() => setFeelingsOpen(true)}>
            <Sparky crop="head" size="2rem" idle={false} mood="okay" />
            <span>How I feel</span>
          </button>
          <button
            type="button"
            className="coin-count"
            onClick={() => go('sparky')}
            aria-label={`${progress.coins} coins. Open Sparky’s shop.`}
          >
            <span className="coin-stack" aria-hidden="true">
              <span className="coin-disc" />
              <span className="coin-disc" />
              <span className="coin-disc" />
            </span>
            <strong className="num">{progress.coins}</strong>
          </button>
          <button type="button" className="app-feel app-tools" onClick={openTools}>
            <Type size={20} strokeWidth={2.4} aria-hidden="true" />
            <span>Reading tools</span>
          </button>
        </div>
        <CoinToast />
      </header>

      <nav className="app-nav" aria-label="Practice areas">
        {TABS.map((tab) => (
          <a
            key={tab}
            href={`${window.location.hash.startsWith('#/app') ? '#/app/' : '#'}${tab}`}
            className="app-nav-item"
            aria-current={route.tab === tab ? 'page' : undefined}
          >
            <span className="app-nav-icon">
              <NavIcon tab={tab} />
            </span>
            <span className="app-nav-label">{TAB_LABEL[tab]}</span>
          </a>
        ))}
      </nav>

      <main id="main" className="app-main" tabIndex={-1}>
        {route.tab === 'words' && <WordsScreen initialWord={route.word} />}
        {route.tab === 'scan' && <ScanScreen />}
        {route.tab === 'maths' && <MathsScreen />}
        {route.tab === 'cards' && <CardsScreen />}
        {route.tab === 'sparky' && <SparkyScreen />}
      </main>

      <FeelingsDialog
        open={feelingsOpen}
        nudge={feelingsNudge}
        onClose={() => {
          setFeelingsOpen(false);
          setFeelingsNudge(false);
        }}
      />
      <SparkyHelpsPanel
        open={helpsOpen}
        onClose={() => setHelpsOpen(false)}
        onPreview={() => {
          setHelpsOpen(false);
          offerHelp();
        }}
      />

      <dialog ref={toolsRef} className="drawer" aria-labelledby="tools-title" onClick={(e) => e.target === toolsRef.current && closeTools()}>
        <div className="drawer-inner">
          <div className="drawer-head">
            <h2 id="tools-title">Reading tools</h2>
            <button type="button" className="cube cube--sm" onClick={closeTools} aria-label="Close reading tools">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <ReadingTools />
          <button
            type="button"
            className="rod rod--surface rod--sm"
            onClick={() => {
              closeTools();
              setTour(true);
            }}
          >
            <span className="rod-label">Show me around again</span>
          </button>
        </div>
      </dialog>

      {tour && <Tour onClose={endTour} />}
      <SparkyCam onOpenSettings={() => setHelpsOpen(true)} />
      <ReadingLayer />
    </div>
  );
}
