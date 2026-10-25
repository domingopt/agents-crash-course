import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { content } from '../content';
import { Icon } from './Icon';

export function GlossaryDrawer({
  openId,
  isOpen,
  onClose,
}: {
  openId?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [q, setQ] = useState('');
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    lastFocus.current = document.activeElement;
    setQ('');
    const t = setTimeout(() => {
      closeRef.current?.focus();
      if (openId) document.getElementById(`g-${openId}`)?.scrollIntoView({ block: 'center' });
    }, 50);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      (lastFocus.current as HTMLElement | null)?.focus?.();
    };
  }, [isOpen, openId, onClose]);

  const items = [...content.glossary]
    .sort((a, b) => a.term.localeCompare(b.term))
    .filter((g) => !q || (g.term + ' ' + g.def + ' ' + (g.aka ?? []).join(' ')).toLowerCase().includes(q.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <m.aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="glossary-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
          >
            <header>
              <h2 id="glossary-title">Glossary</h2>
              <button ref={closeRef} type="button" className="header-btn" onClick={onClose} aria-label="Close glossary">
                <Icon name="close" size={18} />
              </button>
            </header>
            <div className="drawer-body">
              <label htmlFor="gloss-search" className="sr-only">
                Search the glossary
              </label>
              <input
                id="gloss-search"
                type="search"
                placeholder="Search terms…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <dl>
                {items.map((g) => (
                  <div key={g.id} id={`g-${g.id}`} className={`gloss-item${g.id === openId && !q ? ' highlight' : ''}`}>
                    <dt>{g.term}</dt>
                    <dd>{g.def}</dd>
                  </div>
                ))}
                {items.length === 0 && <p className="muted">No terms match “{q}”.</p>}
              </dl>
            </div>
          </m.aside>
        </>
      )}
    </AnimatePresence>
  );
}
