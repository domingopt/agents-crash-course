import { content } from '../content';
import { href } from '../lib/route';
import { useProgress } from '../lib/progress';
import { Icon } from './Icon';

export function BrandMark() {
  // A little boarding-pass mark: ticket with a perforation and a route dot.
  return (
    <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="2" y="7" width="28" height="18" rx="4" fill="var(--coral-bg)" />
      <line x1="21" y1="9" x2="21" y2="23" stroke="var(--paper)" strokeWidth="1.6" strokeDasharray="2 2" />
      <path d="M7 19c2-5 6-6 10-6" stroke="var(--paper)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="17" cy="13" r="1.8" fill="var(--sun)" />
    </svg>
  );
}

export function Header({ route, onGlossary }: { route: string; onGlossary: () => void }) {
  const { done } = useProgress();
  return (
    <header className="site-header">
      <div className="wrap">
        <div className="bar">
          <a className="brand" href={href('home')}>
            <BrandMark />
            <span>{content.site.courseTitle}</span>
          </a>
          <a className="header-btn" href={href('my-agents')} aria-current={route === 'my-agents' ? 'page' : undefined}>
            <Icon name="bag" size={18} />
            <span className="label-long">My agents</span>
            <span className="sr-only">My agents</span>
          </a>
          <button type="button" className="header-btn" onClick={onGlossary}>
            <Icon name="book" size={18} />
            <span className="label-long">Glossary</span>
            <span className="sr-only">Open glossary</span>
          </button>
        </div>
        <nav className="progress" aria-label="Course modules">
          {content.modules.map((m) => {
            const isDone = done.includes(m.id);
            return (
              <a
                key={m.id}
                href={href(m.id)}
                className={`stub${isDone ? ' done' : ''}`}
                aria-current={route === m.id ? 'page' : undefined}
                title={m.title}
              >
                <span aria-hidden="true">{isDone ? '✓' : m.code}</span>
                <span className="stub-title" aria-hidden="true">{m.short}</span>
                <span className="sr-only">
                  Module {m.code}: {m.title}
                  {isDone ? ' (completed)' : ''}
                </span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
