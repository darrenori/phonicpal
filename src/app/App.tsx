import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, Calculator, Camera, Type, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import { ReadingLayer, ReadingTools } from '../components/ReadingTools';
import { Sparky } from '../components/Sparky';
import { href } from '../shared/routes';
import { startPracticeClock, useProgress } from '../shared/progress';
import { stopSpeaking } from '../shared/speech';
import { CoinToast } from './CoinToast';
import { FeelingsDialog } from './Feelings';
import { WordsScreen } from './WordsScreen';
import { ScanScreen } from './ScanScreen';
import { MathsScreen } from './MathsScreen';
import { SparkyScreen } from './SparkyScreen';
import './app.css';

export type Tab = 'words' | 'scan' | 'maths' | 'sparky';
const TABS: Tab[] = ['words', 'scan', 'maths', 'sparky'];

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
    case 'sparky':
      return <Sparky crop="head" size={`${size + 6}px`} idle={false} />;
  }
}

const TAB_LABEL: Record<Tab, string> = {
  words: 'Words',
  scan: 'Snap & scan',
  maths: 'Maths',
  sparky: 'Sparky',
};

export function App() {
  const [route, setRoute] = useState(readRoute);
  const [feelingsOpen, setFeelingsOpen] = useState(false);
  const toolsRef = useRef<HTMLDialogElement>(null);
  const progress = useProgress();

  useEffect(() => {
    const onHash = () => {
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
        {route.tab === 'sparky' && <SparkyScreen />}
      </main>

      <FeelingsDialog open={feelingsOpen} onClose={() => setFeelingsOpen(false)} />

      <dialog ref={toolsRef} className="drawer" aria-labelledby="tools-title" onClick={(e) => e.target === toolsRef.current && closeTools()}>
        <div className="drawer-inner">
          <div className="drawer-head">
            <h2 id="tools-title">Reading tools</h2>
            <button type="button" className="cube cube--sm" onClick={closeTools} aria-label="Close reading tools">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <ReadingTools />
        </div>
      </dialog>

      <ReadingLayer />
    </div>
  );
}
