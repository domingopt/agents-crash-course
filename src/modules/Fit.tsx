import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { ModuleShell } from '../components/ModuleShell';
import { rich } from '../components/Rich';
import { TellMore } from '../components/TellMore';
import { Icon } from '../components/Icon';
import { useStored } from '../lib/useStored';
import fitData from '../../content/fit.json';

const f = fitData;
type Placements = Record<string, string>;

export default function Fit() {
  const [placed, setPlaced] = useStored<Placements>('sorter', {});
  const [last, setLast] = useState<string | null>(null);
  const [hoverBin, setHoverBin] = useState<string | null>(null);
  const remaining = f.tasks.filter((t) => !placed[t.id]);
  const current = remaining[0];
  const correct = f.tasks.filter((t) => placed[t.id] === t.answer).length;
  const lastTask = f.tasks.find((t) => t.id === last);

  const place = (taskId: string, bin: string) => {
    setPlaced((p) => ({ ...p, [taskId]: bin }));
    setLast(taskId);
    setHoverBin(null);
  };

  // Hit-test against the piles' rectangles (elementFromPoint would find the dragged card itself).
  const binAt = (x: number, y: number) => {
    const bins = Array.from(document.querySelectorAll<HTMLElement>('[data-bin]'));
    const hit = bins.find((el) => {
      const r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
    return hit?.dataset.bin ?? null;
  };

  return (
    <ModuleShell id="fit" lede={f.intro} saves={f.saves}>
      <section className="section" aria-labelledby="sort-title">
        <div className="timeline-head">
          <h2 id="sort-title">Sort the tasks</h2>
          <p className="mono muted" aria-live="polite">
            {f.tasks.length - remaining.length} of {f.tasks.length} sorted
          </p>
        </div>

        <div className="sorter-deck">
          <AnimatePresence mode="popLayout">
            {current ? (
              <m.div
                key={current.id}
                className="sort-card"
                drag
                dragSnapToOrigin
                dragElastic={0.6}
                whileDrag={{ scale: 1.04, rotate: -2, zIndex: 20, boxShadow: '0 20px 40px rgba(0,0,0,.18)' }}
                onDrag={(_, info) => setHoverBin(binAt(info.point.x - window.scrollX, info.point.y - window.scrollY))}
                onDragEnd={(_, info) => {
                  const bin = binAt(info.point.x - window.scrollX, info.point.y - window.scrollY);
                  if (bin) place(current.id, bin);
                  else setHoverBin(null);
                }}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <span className="mono muted">Task {f.tasks.length - remaining.length + 1}</span>
                <p className="sort-text">{current.text}</p>
                <p className="mono muted drag-hint">Drag to a pile, or choose:</p>
                <div className="sort-actions" role="group" aria-label={`Where does "${current.text}" go?`}>
                  {f.bins.map((b) => (
                    <button key={b.id} type="button" className={`btn btn-small bin-btn bin-${b.colour}`} onClick={() => place(current.id, b.id)}>
                      {b.label}
                    </button>
                  ))}
                </div>
              </m.div>
            ) : (
              <m.div key="done" className="card sort-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3>All sorted: {correct} of {f.tasks.length} matched our suggestion</h3>
                <p>{f.summary}</p>
                <button
                  type="button"
                  className="btn btn-ghost btn-small"
                  onClick={() => {
                    setPlaced({});
                    setLast(null);
                  }}
                >
                  Start again
                </button>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <div aria-live="polite">
          {lastTask && (
            <m.div
              key={lastTask.id}
              className={`feedback ${placed[lastTask.id] === lastTask.answer ? 'good' : 'differ'}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <strong>
                {placed[lastTask.id] === lastTask.answer
                  ? 'Spot on. '
                  : `We'd put this in "${f.bins.find((b) => b.id === lastTask.answer)!.label}". `}
              </strong>
              {rich(lastTask.why)}
            </m.div>
          )}
        </div>

        <div className="bins">
          {f.bins.map((b) => {
            const items = f.tasks.filter((t) => placed[t.id] === b.id);
            return (
              <div key={b.id} data-bin={b.id} className={`bin bin-${b.colour}${hoverBin === b.id ? ' over' : ''}`}>
                <div className="bin-head">
                  <span className={`light light-${b.colour}`} aria-hidden="true" />
                  <div>
                    <h3>{b.label}</h3>
                    <span className="mono muted">{b.hint}</span>
                  </div>
                </div>
                <ul>
                  {items.map((t) => {
                    const ok = t.answer === b.id;
                    return (
                      <li key={t.id} className={ok ? 'ok' : 'moved'}>
                        <button type="button" className="bin-item" onClick={() => setLast(t.id)}>
                          <Icon name={ok ? 'check' : 'info'} size={16} />
                          <span>{t.text}</span>
                          <span className="sr-only">{ok ? '(matches our suggestion)' : '(we suggest a different pile; select to see why)'}</span>
                        </button>
                      </li>
                    );
                  })}
                  {items.length === 0 && <li className="bin-empty muted">Drop tasks here</li>}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        {f.more.map((m) => (
          <TellMore key={m.title} title={m.title} body={m.body} />
        ))}
      </section>
    </ModuleShell>
  );
}
