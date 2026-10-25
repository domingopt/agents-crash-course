import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { type UseCase } from '../content';
import { ModuleShell } from '../components/ModuleShell';
import { Icon } from '../components/Icon';
import { useProfile } from '../lib/profile';
import usecasesData from '../../content/usecases.json';

const u = usecasesData;
const CONNECT_LABELS: Record<string, string> = {
  email: 'Email',
  calendar: 'Calendar',
  web: 'Web search',
  files: 'Documents',
  sheet: 'Spreadsheet',
  canva: 'Canva',
};

function Difficulty({ level }: { level: number }) {
  const text = u.difficulty[String(level) as '1' | '2' | '3'];
  return (
    <span className="difficulty" title={text}>
      <span aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`dot${i <= level ? ' on' : ''}`} />
        ))}
      </span>
      <span className="sr-only">Difficulty: {text}</span>
      <span className="mono muted" aria-hidden="true">
        {text.split(':')[0]}
      </span>
    </span>
  );
}

export function UseCaseCard({ item, forYou }: { item: UseCase; forYou?: boolean }) {
  const cat = u.categories.find((c) => c.id === item.category)!;
  return (
    <m.article layout className="ticket usecase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="ticket-main">
        <div className="usecase-tags">
          <span className={`chip ${item.category === 'travel' ? 'chip-teal' : item.category === 'network' ? 'chip-coral' : 'chip-sun'}`}>
            {cat.label}
          </span>
          {forYou && <span className="chip">Matches your week</span>}
          {item.template && <span className="chip chip-green">Template ready</span>}
        </div>
        <h3>{item.title}</h3>
        <dl className="usecase-flow">
          <div>
            <dt className="mono">Starts when</dt>
            <dd>{item.trigger}</dd>
          </div>
          <div>
            <dt className="mono">Agent does</dt>
            <dd>
              <ul>
                {item.does.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt className="mono">You approve</dt>
            <dd>{item.approve}</dd>
          </div>
        </dl>
        <p className="connects">
          <span className="mono muted">Uses: </span>
          {item.connects.map((c) => CONNECT_LABELS[c] ?? c).join(' · ')}
        </p>
      </div>
      <div className="ticket-stub">
        <div>
          <span className="mono muted">Time saved (est.)</span>
          <strong className="saved">{item.saved}</strong>
          <Difficulty level={item.difficulty} />
        </div>
        <a className="btn btn-primary btn-small" href={`#/builder?usecase=${item.id}`}>
          Build this <Icon name="arrowRight" size={16} />
        </a>
      </div>
    </m.article>
  );
}

export default function Gallery() {
  const [cat, setCat] = useState('all');
  const [profile] = useProfile();
  const items = (u.items as UseCase[]).filter((i) => cat === 'all' || i.category === cat);
  const mine = (i: UseCase) => profile.tasks.includes((i as UseCase & { weekTask: string }).weekTask);
  const sorted = [...items].sort((a, b) => Number(mine(b)) - Number(mine(a)));

  return (
    <ModuleShell id="gallery" lede={u.intro} saves={u.saves}>
      <section className="section" aria-labelledby="gal-title">
        <h2 id="gal-title" className="sr-only">
          Agent ideas
        </h2>
        <div className="filter-tabs" role="group" aria-label="Filter ideas">
          {[{ id: 'all', label: 'All ideas' }, ...u.categories].map((c) => (
            <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <p className="mono muted illustrative">
          {u.timeNote} {profile.answered && 'Ideas matching the tasks you picked in module 01 come first.'}
        </p>
        <div className="grid grid-2 usecase-grid">
          <AnimatePresence mode="popLayout">
            {sorted.map((i) => (
              <UseCaseCard key={i.id} item={i} forYou={profile.answered && mine(i)} />
            ))}
          </AnimatePresence>
        </div>
      </section>
    </ModuleShell>
  );
}
