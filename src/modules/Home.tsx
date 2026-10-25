import { m } from 'framer-motion';
import { content, learnerName } from '../content';
import { href } from '../lib/route';
import { useProgress } from '../lib/progress';
import { Icon } from '../components/Icon';

export function Home() {
  const { site, modules } = content;
  const { done } = useProgress();
  const next = modules.find((m) => !done.includes(m.id)) ?? modules[0];
  const total = modules.reduce((n, m) => n + m.minutes, 0);
  const started = done.length > 0;

  return (
    <div className="wrap">
      <section className="home-hero" aria-labelledby="home-title">
        <m.div
          className="pass"
          initial={{ opacity: 0, y: 16, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="pass-main">
            <p className="mono pass-label">Boarding pass · crash course</p>
            <h1 id="home-title">{site.courseTitle}</h1>
            <p className="pass-tagline">{site.tagline}</p>
            <dl className="pass-fields">
              <div>
                <dt className="mono">Passenger</dt>
                <dd>{learnerName || 'You'}</dd>
              </div>
              <div>
                <dt className="mono">From</dt>
                <dd>Squeezed evenings</dd>
              </div>
              <div>
                <dt className="mono">To</dt>
                <dd>Time back</dd>
              </div>
              <div>
                <dt className="mono">Journey</dt>
                <dd>
                  {modules.length} stops · ~{total} min
                </dd>
              </div>
            </dl>
          </div>
          <div className="pass-stub">
            <p className="mono">Progress</p>
            <p className="pass-big">
              {done.length}/{modules.length}
            </p>
            <a className="btn btn-coral" href={href(next.id)}>
              {started ? 'Continue' : 'Start the course'} <Icon name="arrowRight" size={18} />
            </a>
          </div>
        </m.div>
      </section>

      <section className="section" aria-labelledby="how-title">
        <h2 id="how-title">How this works</h2>
        <div className="grid grid-3">
          <div className="card">
            <p className="mono muted">01 · Learn</p>
            <p>Short modules of 5–10 minutes. Each one answers: what does this save me, and how much time?</p>
          </div>
          <div className="card">
            <p className="mono muted">02 · Decide</p>
            <p>Compare the realistic platforms honestly, including costs and downsides, and pick what suits you.</p>
          </div>
          <div className="card">
            <p className="mono muted">03 · Build</p>
            <p>Use the Agent Builder to create ready-to-paste setup packs. They're saved on this device for whenever you're ready.</p>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 16 }}>
          Dotted underlined words like <span className="term" style={{ cursor: 'default' }}>agent</span> have a quick
          definition: hover, or tap to open the glossary.
        </p>
      </section>

      <section className="section" aria-labelledby="route-title">
        <h2 id="route-title">Your route</h2>
        <ol className="route">
          {modules.map((mod, i) => {
            const isDone = done.includes(mod.id);
            return (
              <m.li
                key={mod.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <a href={href(mod.id)} className={`route-stop${isDone ? ' done' : ''}`}>
                  <span className="route-dot" aria-hidden="true">
                    {isDone ? <Icon name="check" size={16} /> : mod.code}
                  </span>
                  <span className="route-text">
                    <strong>{mod.title}</strong>
                    <span className="muted">{mod.summary}</span>
                  </span>
                  <span className="mono muted route-min">{mod.minutes} min</span>
                  {isDone && <span className="sr-only">(completed)</span>}
                </a>
              </m.li>
            );
          })}
        </ol>
      </section>

      <section className="section" aria-labelledby="back-title">
        <h2 id="back-title">Coming back later?</h2>
        <div className="btn-row">
          <a className="btn btn-primary" href={href('builder')}>
            <Icon name="sparkle" size={18} /> Build an agent
          </a>
          <a className="btn btn-ghost" href={href('my-agents')}>
            <Icon name="bag" size={18} /> My agents
          </a>
          <a className="btn btn-ghost" href={href('platforms')}>
            Compare platforms
          </a>
          <a className="btn btn-ghost" href={href('cheat-sheet')}>
            <Icon name="print" size={18} /> Cheat sheet
          </a>
        </div>
      </section>
    </div>
  );
}
