import { Component, lazy as reactLazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { LazyMotion, MotionConfig } from 'framer-motion';
import { content } from './content';
import { useRoute } from './lib/route';
import { GlossaryContext } from './lib/glossaryContext';
import { Header } from './components/Header';
import { GlossaryDrawer } from './components/GlossaryDrawer';
import { Home } from './modules/Home';

// After a redeploy, an open tab may ask for an old module file that no longer exists.
// Reload once to pick up the new version instead of showing a blank page.
const RELOAD_KEY = 'agents-course:chunk-reload';
function lazy<T extends React.ComponentType<object>>(load: () => Promise<{ default: T }>) {
  return reactLazy(() =>
    load()
      .then((mod) => {
        try {
          sessionStorage.removeItem(RELOAD_KEY);
        } catch {
          /* ignore */
        }
        return mod;
      })
      .catch((err) => {
        let reloaded = false;
        try {
          reloaded = sessionStorage.getItem(RELOAD_KEY) === '1';
          if (!reloaded) sessionStorage.setItem(RELOAD_KEY, '1');
        } catch {
          /* ignore */
        }
        if (!reloaded) window.location.reload();
        throw err;
      }),
  );
}

class PageErrorBoundary extends Component<{ children: ReactNode; route: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(prev: { route: string }) {
    if (prev.route !== this.props.route && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="wrap" style={{ padding: '48px 16px' }}>
        <h1>This page didn't load</h1>
        <p>The site has probably just been updated. Reloading usually fixes it, and your progress and saved agents are kept.</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Reload the page
        </button>
      </div>
    );
  }
}

const loadFeatures = () => import('./lib/motionFeatures').then((r) => r.default);

const pages: Record<string, React.LazyExoticComponent<() => React.JSX.Element>> = {
  week: lazy(() => import('./modules/Week')),
  agent: lazy(() => import('./modules/WhatIsAgent')),
  anatomy: lazy(() => import('./modules/Anatomy')),
  fit: lazy(() => import('./modules/Fit')),
  gallery: lazy(() => import('./modules/Gallery')),
  safety: lazy(() => import('./modules/Safety')),
  platforms: lazy(() => import('./modules/Platforms')),
  builder: lazy(() => import('./modules/Builder')),
  plan: lazy(() => import('./modules/Plan')),
  'my-agents': lazy(() => import('./modules/MyAgents')),
  'cheat-sheet': lazy(() => import('./modules/CheatSheet')),
  facilitator: lazy(() => import('./modules/Facilitator')),
};

export function App() {
  const route = useRoute();
  const [gloss, setGloss] = useState<{ open: boolean; id?: string }>({ open: false });
  const openGlossary = useCallback((id?: string) => setGloss({ open: true, id }), []);
  const closeGlossary = useCallback(() => setGloss({ open: false }), []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (route === 'home') document.title = content.site.courseTitle;
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [route]);

  const Page = pages[route];

  return (
    <LazyMotion features={loadFeatures} strict>
    <MotionConfig reducedMotion="user">
      <GlossaryContext.Provider value={{ open: openGlossary }}>
        <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
          Skip to content
        </a>
        <Header route={route} onGlossary={() => openGlossary()} />
        <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
          <PageErrorBoundary route={route}>
            <Suspense fallback={<div className="wrap" style={{ padding: '48px 16px' }}>Loading…</div>}>
              {Page ? <Page /> : <Home />}
            </Suspense>
          </PageErrorBoundary>
        </main>
        <footer className="site-footer">
          <div className="wrap">
            <p>{content.site.footerNote}</p>
            <p>
              Facts and prices last checked {content.site.lastChecked}. Not legal or financial advice.{' '}
              <a href="#/cheat-sheet">Cheat sheet</a> · <a href="#/facilitator">Facilitator notes</a>
            </p>
          </div>
        </footer>
        <GlossaryDrawer isOpen={gloss.open} openId={gloss.id} onClose={closeGlossary} />
      </GlossaryContext.Provider>
    </MotionConfig>
    </LazyMotion>
  );
}
