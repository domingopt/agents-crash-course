import { useEffect, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { ModuleShell } from '../components/ModuleShell';
import { rich } from '../components/Rich';
import { TellMore } from '../components/TellMore';
import { Icon } from '../components/Icon';
import agentData from '../../content/agent.json';

const a = agentData;

function Flow({ steps, kind }: { steps: string[]; kind: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={`flow flow-${kind}`} aria-hidden="true">
      {steps.map((s, i) => (
        <div className="flow-step" key={s}>
          <m.div
            className="flow-node"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.25 }}
          >
            {s}
          </m.div>
          {i < steps.length - 1 && (
            <div className="flow-link">
              {!reduce && (
                <m.span
                  className="flow-dot"
                  animate={{ left: ['0%', '100%'] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
                />
              )}
            </div>
          )}
        </div>
      ))}
      {kind === 'agent' && <div className="flow-loop mono">↻ loops until done</div>}
    </div>
  );
}

function AgentLoop() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();
  const n = a.loop.length;
  const cur = a.loop[step];

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (step >= n - 1) setPlaying(false);
      else setStep((s) => s + 1);
    }, 4200);
    return () => clearTimeout(t);
  }, [playing, step, n]);

  // Nodes placed on a circle; "check" and "repeat" sit on the loop back to "tool".
  const R = 120;
  const cx = 160;
  const cy = 150;
  const pos = a.loop.map((_, i) => {
    const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) };
  });

  return (
    <div className="loop">
      <div className="loop-goal card">
        <span className="mono muted">The goal</span>
        <p>{a.loopGoal}</p>
      </div>
      <div className="loop-body">
        <svg viewBox="0 0 320 300" className="loop-svg" role="img" aria-label={`Agent loop diagram, step ${step + 1} of ${n}: ${cur.label}`}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="5 6" />
          {/* the "repeat" arc back from check to tool */}
          <path
            d={`M ${pos[3].x} ${pos[3].y} Q ${cx} ${cy} ${pos[2].x} ${pos[2].y}`}
            fill="none"
            stroke={step === 4 ? 'var(--coral)' : 'var(--line-strong)'}
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <m.circle
            r="9"
            fill="var(--sun)"
            stroke="var(--ink)"
            strokeWidth="1.5"
            animate={{ cx: pos[step].x, cy: pos[step].y }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 80, damping: 14 }}
          />
          {a.loop.map((s, i) => {
            const active = i === step;
            const p = pos[i];
            return (
              <g key={s.id} onClick={() => setStep(i)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={active ? 26 : 22}
                  fill={active ? 'var(--coral-bg)' : i < step ? 'var(--teal-soft)' : 'var(--card)'}
                  stroke={active ? 'var(--coral-bg)' : 'var(--line-strong)'}
                  strokeWidth="2"
                />
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontFamily="var(--font-mono)"
                  fill={active ? '#fff' : 'var(--ink)'}
                  fontWeight="600"
                >
                  {i + 1}
                </text>
                <text
                  x={p.x}
                  y={p.y + (p.y > cy ? 44 : -34)}
                  textAnchor="middle"
                  fontSize="12.5"
                  fill="var(--ink)"
                  fontWeight={active ? 700 : 500}
                >
                  {s.label}
                </text>
              </g>
            );
          })}
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="13" fill="var(--ink-2)" fontFamily="var(--font-display)">
            The agent loop
          </text>
        </svg>

        <div className="loop-panel" aria-live="polite">
          <AnimatePresence mode="wait">
            <m.div
              key={cur.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <p className="mono coral">
                Step {step + 1} of {n}
              </p>
              <h3>{cur.title}</h3>
              <p>{rich(cur.body)}</p>
              <div className="loop-detail">
                <span className="mono muted">In our Crete example</span>
                <p>{cur.detail}</p>
              </div>
            </m.div>
          </AnimatePresence>
          <div className="btn-row">
            <button type="button" className="btn btn-ghost btn-small" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <Icon name="arrowLeft" size={16} /> Back
            </button>
            <button
              type="button"
              className="btn btn-primary btn-small"
              onClick={() => setStep((s) => (s + 1) % n)}
            >
              {step === n - 1 ? 'Start again' : 'Next'} <Icon name="arrowRight" size={16} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-small"
              aria-pressed={playing}
              onClick={() => {
                if (!playing && step === n - 1) setStep(0);
                setPlaying((p) => !p);
              }}
            >
              <Icon name={playing ? 'pause' : 'play'} size={16} /> {playing ? 'Pause' : 'Autoplay'}
            </button>
          </div>
        </div>
      </div>
      {step === n - 1 && (
        <m.div className="notice teal" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p>{a.loopTakeaway}</p>
        </m.div>
      )}
    </div>
  );
}

export default function WhatIsAgent() {
  const [active, setActive] = useState(0);
  const item = a.progression[active];
  return (
    <ModuleShell id="agent" lede={a.intro} saves={a.saves}>
      <section className="section" aria-labelledby="three-title">
        <h2 id="three-title">One job, three ways</h2>
        <div className="steps-tabs" role="tablist" aria-label="Chatbot, automation, agent">
          {a.progression.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              id={`tab-${p.id}`}
              aria-selected={active === i}
              aria-controls={`panel-${p.id}`}
              className="steps-tab"
              onClick={() => setActive(i)}
            >
              <span className="mono">{i + 1}</span> {p.name}
              {i < a.progression.length - 1 && <Icon name="arrowRight" size={16} />}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <m.div
            key={item.id}
            role="tabpanel"
            id={`panel-${item.id}`}
            aria-labelledby={`tab-${item.id}`}
            className="ticket horizontal"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="ticket-main">
              <h3 className="big">{item.name}</h3>
              <p className="coral analogy">{item.analogy}</p>
              <p>{item.what}</p>
              <Flow steps={item.flow} kind={item.id} />
              <p className="example">
                <span className="mono muted">Example · </span>
                {item.example}
              </p>
            </div>
            <div className="ticket-stub">
              <dl className="mini-facts">
                <div>
                  <dt className="mono">Who decides the steps</dt>
                  <dd>{item.decides}</dd>
                </div>
                <div>
                  <dt className="mono">Variety</dt>
                  <dd>{item.variety}</dd>
                </div>
                <div>
                  <dt className="mono">Takes action</dt>
                  <dd>{item.acts}</dd>
                </div>
                <div>
                  <dt className="mono">Effort</dt>
                  <dd>{item.effort}</dd>
                </div>
              </dl>
            </div>
          </m.div>
        </AnimatePresence>
        <div className="btn-row" style={{ marginTop: 14 }}>
          {active < a.progression.length - 1 && (
            <button type="button" className="btn btn-coral" onClick={() => setActive(active + 1)}>
              Next: {a.progression[active + 1].name} <Icon name="arrowRight" size={18} />
            </button>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="loop-title">
        <h2 id="loop-title">Inside an agent: the loop</h2>
        <p>{a.loopIntro}</p>
        <AgentLoop />
      </section>

      <section className="section">
        {a.more.map((m) => (
          <TellMore key={m.title} title={m.title} body={m.body} />
        ))}
      </section>
    </ModuleShell>
  );
}
