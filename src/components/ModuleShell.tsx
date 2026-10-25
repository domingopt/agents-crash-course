import { useEffect, type ReactNode } from 'react';
import { content } from '../content';
import { go, href } from '../lib/route';
import { useProgress } from '../lib/progress';
import { rich } from './Rich';
import { Icon } from './Icon';

export function ModuleShell({
  id,
  lede,
  saves,
  children,
}: {
  id: string;
  lede: string;
  saves?: string;
  children: ReactNode;
}) {
  const idx = content.modules.findIndex((m) => m.id === id);
  const mod = content.modules[idx];
  const prev = content.modules[idx - 1];
  const next = content.modules[idx + 1];
  const { done, markDone } = useProgress();
  const isDone = done.includes(id);

  useEffect(() => {
    document.title = `${mod.title} · ${content.site.courseShort}`;
  }, [mod.title]);

  return (
    <div className="wrap">
      <header className="module-hero">
        <div className="eyebrow mono">
          <span>Module {mod.code}</span>
          <span aria-hidden="true">·</span>
          <span>About {mod.minutes} min</span>
          {isDone && (
            <span className="chip chip-teal">
              <Icon name="check" size={14} /> Completed
            </span>
          )}
        </div>
        <h1>{mod.title}</h1>
        <p className="lede">{rich(lede)}</p>
        {saves && (
          <div className="saves">
            <span className="mono">What's in it for you</span>
            <p>{rich(saves)}</p>
          </div>
        )}
      </header>

      {children}

      <nav className="module-footer" aria-label="Module navigation">
        {prev ? (
          <a className="btn btn-ghost" href={href(prev.id)}>
            <Icon name="arrowLeft" size={18} /> {prev.short}
          </a>
        ) : (
          <a className="btn btn-ghost" href={href('home')}>
            <Icon name="arrowLeft" size={18} /> Course home
          </a>
        )}
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            markDone(id);
            go(next ? next.id : 'home');
            window.scrollTo({ top: 0 });
          }}
        >
          {isDone ? 'Continue' : 'Mark complete'}
          {next ? ` · next: ${next.short}` : ' · back to home'}
          <Icon name="arrowRight" size={18} />
        </button>
      </nav>
    </div>
  );
}
