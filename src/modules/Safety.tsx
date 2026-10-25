import { useState } from 'react';
import { m, useReducedMotion } from 'framer-motion';
import { ModuleShell } from '../components/ModuleShell';
import { rich } from '../components/Rich';
import { TellMore } from '../components/TellMore';
import { Icon } from '../components/Icon';
import { useStored } from '../lib/useStored';
import safetyData from '../../content/safety.json';

const s = safetyData;
const LIGHT_LABEL: Record<string, string> = { green: 'Green', amber: 'Amber', red: 'Red' };

function Separation() {
  const reduce = useReducedMotion();
  return (
    <div className="separation" role="img" aria-label="Diagram: your NHS world (work laptop, NHS email, NHS Copilot, patient data) is kept completely separate from your business world (personal phone or laptop, business email, your own AI subscription, client data). Nothing crosses between them.">
      <div className="world world-nhs" aria-hidden="true">
        <span className="mono">NHS world</span>
        <ul>
          <li>Work laptop and phone</li>
          <li>NHS email and Microsoft account</li>
          <li>NHS Copilot</li>
          <li>Patient and NHS data</li>
        </ul>
      </div>
      <div className="wall" aria-hidden="true">
        {!reduce && (
          <m.span
            className="bounce-dot"
            animate={{ x: [-28, -4, -28] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <span className="wall-label mono">No crossing</span>
      </div>
      <div className="world world-biz" aria-hidden="true">
        <span className="mono">Business world</span>
        <ul>
          <li>Personal phone or laptop</li>
          <li>Business email</li>
          <li>Your own AI subscription</li>
          <li>Client data (handled carefully)</li>
        </ul>
      </div>
    </div>
  );
}

function TrafficLight() {
  const [on, setOn] = useState('amber');
  const light = s.traffic.lights.find((l) => l.id === on)!;
  return (
    <div className="traffic">
      <div className="traffic-pole" role="group" aria-label="Traffic light: choose a colour">
        {s.traffic.lights.map((l) => (
          <button
            key={l.id}
            type="button"
            className={`lamp lamp-${l.id}${on === l.id ? ' on' : ''}`}
            aria-pressed={on === l.id}
            onClick={() => setOn(l.id)}
          >
            <span className="sr-only">{l.label}</span>
          </button>
        ))}
      </div>
      <m.div key={on} className={`traffic-card card tc-${on}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} aria-live="polite">
        <h3>{light.label}</h3>
        <p>{light.body}</p>
        <div className="usecase-tags">
          {light.examples.map((e) => (
            <span key={e} className="chip">
              {e}
            </span>
          ))}
        </div>
      </m.div>
      <ul className="traffic-list" aria-label="All three lights">
        {s.traffic.lights.map((l) => (
          <li key={l.id}>
            <span className={`light light-${l.id === 'amber' ? 'amber' : l.id}`} aria-hidden="true" />
            <span>
              <strong>{l.label}.</strong> {l.body}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Quiz() {
  const [ans, setAns] = useState<Record<number, string>>({});
  return (
    <ol className="quiz">
      {s.quiz.map((q, i) => {
        const a = ans[i];
        return (
          <li key={i} className="card">
            <p>{q.q}</p>
            <div className="btn-row" role="group" aria-label="Choose a light">
              {['green', 'amber', 'red'].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`btn btn-small quiz-btn qb-${c}`}
                  aria-pressed={a === c}
                  onClick={() => setAns((x) => ({ ...x, [i]: c }))}
                >
                  <span className={`light light-${c}`} aria-hidden="true" /> {LIGHT_LABEL[c]}
                </button>
              ))}
            </div>
            <div aria-live="polite">
              {a && (
                <p className={`feedback ${a === q.a ? 'good' : 'differ'}`}>
                  <strong>{a === q.a ? 'Yes. ' : `It's ${LIGHT_LABEL[q.a].toLowerCase()}. `}</strong>
                  {q.why}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function Safety() {
  const [checked, setChecked] = useStored<string[]>('privacy-checklist', []);
  return (
    <ModuleShell id="safety" lede={s.intro} saves={s.saves}>
      <section className="section" aria-labelledby="nhs-title">
        <div className="nhs-card">
          <p className="mono">Most important</p>
          <h2 id="nhs-title">{s.nhs.title}</h2>
          <Separation />
          <ul className="nhs-points">
            {s.nhs.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <TellMore title="Why this matters" body={s.nhs.why} />
        </div>
      </section>

      <section className="section" aria-labelledby="topics-title">
        <h2 id="topics-title">The other four habits</h2>
        <div className="grid grid-2">
          {s.topics.map((t) => (
            <article key={t.id} className="card topic">
              <div className="topic-head">
                <span className="topic-icon">
                  <Icon name={t.icon} size={22} />
                </span>
                <div>
                  <h3>{t.title}</h3>
                  <p className="coral topic-sum">{t.summary}</p>
                </div>
              </div>
              <ul>
                {t.points.map((p) => (
                  <li key={p}>{rich(p)}</li>
                ))}
              </ul>
              <TellMore body={t.more} />
              <p className="links">
                {t.links.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.label} <span className="sr-only">(opens in a new tab)</span>↗
                  </a>
                ))}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="traffic-title">
        <h2 id="traffic-title">{s.traffic.title}</h2>
        <p>{s.traffic.intro}</p>
        <TrafficLight />
      </section>

      <section className="section" aria-labelledby="quiz-title">
        <h2 id="quiz-title">{s.quizIntro}</h2>
        <Quiz />
      </section>

      <section className="section" aria-labelledby="priv-title">
        <h2 id="priv-title">{s.privacyChecklist.title}</h2>
        <p className="muted">Tick these off when you set up. Your ticks are saved on this device.</p>
        <ul className="choice-grid" style={{ listStyle: 'none', padding: 0 }}>
          {s.privacyChecklist.items.map((item) => (
            <li key={item} style={{ margin: 0 }}>
              <label className="choice">
                <input
                  type="checkbox"
                  checked={checked.includes(item)}
                  onChange={() => setChecked((c) => (c.includes(item) ? c.filter((x) => x !== item) : [...c, item]))}
                />
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="disclaimer">
          <Icon name="info" size={16} /> {s.disclaimer}
        </p>
      </section>
    </ModuleShell>
  );
}
