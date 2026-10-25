import { m } from 'framer-motion';
import { ModuleShell } from '../components/ModuleShell';
import { Icon } from '../components/Icon';
import { useStored } from '../lib/useStored';
import { href } from '../lib/route';
import planData from '../../content/plan.json';

const pl = planData;

export default function Plan() {
  const [ticks, setTicks] = useStored<string[]>('plan-ticks', []);
  const toggle = (k: string) => setTicks((t) => (t.includes(k) ? t.filter((x) => x !== k) : [...t, k]));
  return (
    <ModuleShell id="plan" lede={pl.intro} saves={pl.saves}>
      <section className="section" aria-labelledby="weeks-title">
        <h2 id="weeks-title">Your month, week by week</h2>
        <ol className="itinerary">
          {pl.weeks.map((w, i) => (
            <m.li
              key={w.week}
              className="itin-stop"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="itin-marker" aria-hidden="true">
                {i + 1}
              </div>
              <div className="card">
                <p className="mono coral">
                  {w.week} · {w.time}
                </p>
                <h3>{w.title}</h3>
                <ul className="tick-list">
                  {w.tasks.map((t) => {
                    const k = `${i}:${t}`;
                    return (
                      <li key={k}>
                        <label className="tick">
                          <input type="checkbox" checked={ticks.includes(k)} onChange={() => toggle(k)} />
                          <span>{t}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </m.li>
          ))}
        </ol>
        <div className="notice teal">
          <p>{pl.day30}</p>
        </div>
      </section>
      <section className="section" aria-labelledby="cs-title">
        <h2 id="cs-title">Your one-page cheat sheet</h2>
        <p>Print it and keep it by your laptop, or save it as a PDF on your phone.</p>
        <div className="btn-row">
          <a className="btn btn-coral" href={href('cheat-sheet')}>
            <Icon name="print" size={18} /> Open the cheat sheet
          </a>
          <a className="btn btn-ghost" href={href('builder')}>
            Build your first agent
          </a>
        </div>
      </section>
    </ModuleShell>
  );
}
