import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { ModuleShell } from '../components/ModuleShell';
import { rich } from '../components/Rich';
import { TellMore } from '../components/TellMore';
import { Icon } from '../components/Icon';
import anatomyData from '../../content/anatomy.json';

const an = anatomyData;
// Grid placement around the centre (desktop): 3 x 3 grid with the model in the middle.
const AREAS = ['a', 'b', 'c', 'd', 'e', 'f'];

export default function Anatomy() {
  const [sel, setSel] = useState<string>(an.parts[0].id);
  const [seen, setSeen] = useState<string[]>([an.parts[0].id]);
  const part = an.parts.find((p) => p.id === sel)!;

  const choose = (id: string) => {
    setSel(id);
    setSeen((s) => (s.includes(id) ? s : [...s, id]));
  };

  return (
    <ModuleShell id="anatomy" lede={an.intro} saves={an.saves}>
      <section className="section" aria-labelledby="anat-title">
        <h2 id="anat-title" className="sr-only">
          Agent anatomy
        </h2>
        <p className="mono muted">
          Explored {seen.length} of {an.parts.length}
        </p>
        <div className="anatomy">
          <div className="anatomy-diagram">
            <svg className="anatomy-lines" viewBox="0 0 300 300" preserveAspectRatio="none" aria-hidden="true">
              {[
                [50, 40],
                [150, 20],
                [250, 40],
                [50, 260],
                [150, 280],
                [250, 260],
              ].map(([x, y], i) => (
                <line
                  key={i}
                  x1="150"
                  y1="150"
                  x2={x}
                  y2={y}
                  className={an.parts[i].id === sel ? 'line-active' : ''}
                  stroke="var(--line-strong)"
                  strokeWidth="1.5"
                  strokeDasharray="4 5"
                />
              ))}
            </svg>
            <div className="anatomy-centre">
              <strong>{an.centre.title}</strong>
            </div>
            {an.parts.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className={`anatomy-part area-${AREAS[i]}${sel === p.id ? ' active' : ''}${seen.includes(p.id) ? ' seen' : ''}`}
                aria-pressed={sel === p.id}
                onClick={() => choose(p.id)}
              >
                <Icon name={p.icon} size={22} />
                <span>
                  <strong>{p.name}</strong>
                  <span className="mono">{p.metaphor}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="anatomy-panel" aria-live="polite">
            <AnimatePresence mode="wait">
              <m.article
                key={part.id}
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="mono coral">{part.metaphor}</p>
                <h3 className="big">{part.name}</h3>
                <p>{rich(part.plain)}</p>
                <div className="example-box">
                  <span className="mono muted">Travel example</span>
                  <p>{part.travel}</p>
                </div>
                <p>
                  <strong>Tip: </strong>
                  {part.tip}
                </p>
                <TellMore body={part.more} />
              </m.article>
            </AnimatePresence>
          </div>
        </div>
        <TellMore title={`What about ${an.centre.title.replace(/^The /, 'the ')}?`} body={an.centre.body} />
      </section>
    </ModuleShell>
  );
}
