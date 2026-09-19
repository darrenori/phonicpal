import '../shared/boot';
import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Landing } from '../landing/Landing';
import { App } from '../app/App';
import { Dashboard } from '../educators/Dashboard';

type Surface = 'home' | 'app' | 'educators';

// The single-file build serves all three surfaces from one page, routed by hash.
// Unknown hashes (the landing page's section anchors) stay on the landing page.
function surface(): Surface {
  const h = window.location.hash;
  if (h.startsWith('#/app')) return 'app';
  if (h.startsWith('#/educators')) return 'educators';
  return 'home';
}

function Root() {
  const [current, setCurrent] = useState<Surface>(surface);
  useEffect(() => {
    const onHash = () => {
      const next = surface();
      setCurrent((prev) => {
        if (prev !== next) window.scrollTo({ top: 0 });
        return next;
      });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    document.title = current === 'app' ? 'PhonicPal Practice' : current === 'educators' ? 'PhonicPal for Educators' : 'PhonicPal';
  }, [current]);
  if (current === 'app') return <App />;
  if (current === 'educators') return <Dashboard />;
  return <Landing />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
