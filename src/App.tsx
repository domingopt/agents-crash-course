import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { LazyMotion, MotionConfig } from 'framer-motion';
import { content } from './content';
import { useRoute } from './lib/route';
import { GlossaryContext } from './lib/glossaryContext';
import { Header } from './components/Header';
import { GlossaryDrawer } from './components/GlossaryDrawer';
import { Home } from './modules/Home';

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
          <Suspense fallback={<div className="wrap" style={{ padding: '48px 16px' }}>Loading…</div>}>
            {Page ? <Page /> : <Home />}
          </Suspense>
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
