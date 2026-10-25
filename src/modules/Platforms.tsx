import { useMemo, useState } from 'react';
import { m } from 'framer-motion';
import { type Platform } from '../content';
import { ModuleShell } from '../components/ModuleShell';
import { TellMore } from '../components/TellMore';
import { Icon } from '../components/Icon';
import { useStored } from '../lib/useStored';
import { round1, useProfile, weeklyHours } from '../lib/profile';
import { href } from '../lib/route';
import platformsData from '../../content/platforms.json';

const P = platformsData;
const ALL = P.platforms as Platform[];
type Answers = Record<string, string>;
type Ranked = { p: Platform; score: number; plus: string[]; minus: string[] };

function rank(answers: Answers, includeAlt: boolean): Ranked[] {
  const list = ALL.filter((p) => includeAlt || p.tier === 'main');
  return list
    .map((p) => {
      let score = 0;
      const plus: string[] = [];
      const minus: string[] = [];
      for (const q of P.filter.questions) {
        const opt = q.options.find((o) => o.id === answers[q.id]);
        if (!opt) continue;
        const sc = (opt.scores as Record<string, number>)[p.id] ?? 0;
        const why = (opt.reasons as Record<string, string>)[p.id];
        score += sc;
        if (why) (sc > 0 ? plus : minus).push(why);
      }
      return { p, score, plus, minus };
    })
    .sort((a, b) => b.score - a.score);
}

function Dots({ n, of = 5, label }: { n: number; of?: number; label: string }) {
  return (
    <span className="dots" role="img" aria-label={`${label}: ${n} out of ${of}`}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} className={`dot${i < n ? ' on' : ''}`} />
      ))}
    </span>
  );
}

function ConnectCell({ v, note }: { v: string; note: string }) {
  const label = (P.connectValues as Record<string, string>)[v];
  return (
    <span className={`conn conn-${v}`} title={note || undefined}>
      <span className="conn-badge">{v === 'yes' ? '✓' : v === 'no' ? '✕' : v === 'partial' ? '◐' : '?'}</span> {label}
      {note && <span className="conn-note">{note}</span>}
    </span>
  );
}

export default function Platforms() {
  const [answers, setAnswers] = useStored<Answers>('platform-answers', {});
  const [chosen, setChosen] = useStored<string>('chosen-platform', '');
  const [showAlt, setShowAlt] = useState(false);
  const [profile] = useProfile();
  const answered = Object.keys(answers).length;
  const ranked = useMemo(() => rank(answers, showAlt), [answers, showAlt]);
  const top = answered >= 2 ? ranked.slice(0, 3).filter((r) => r.score > 0 || ranked.indexOf(r) === 0) : [];
  const topIds = top.map((r) => r.p.id);
  const cols = ALL.filter((p) => showAlt || p.tier === 'main');
  const saved = weeklyHours(profile).saved;
  const monthlyValue = saved * 4.33 * profile.hourly;

  return (
    <ModuleShell id="platforms" lede={P.intro} saves={P.saves}>
      <p className="checked-stamp">
        <span className="stamp mono">Last checked {P.lastChecked}</span>
        <span className="muted">{P.methodNote}</span>
      </p>

      <section className="section" aria-labelledby="filter-title">
        <h2 id="filter-title">
          <Icon name="filter" size={22} /> Find your fit
        </h2>
        <p>{P.filter.intro}</p>
        <div className="filter-qs">
          {P.filter.questions.map((q, qi) => (
            <fieldset key={q.id} className="field plain">
              <legend>
                <span className="mono muted">{qi + 1}/5 </span>
                {q.q}
              </legend>
              <div className="pill-row">
                {q.options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className="pill"
                    aria-pressed={answers[q.id] === o.id}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        {answers.email === 'unsure' && (
          <div className="notice">
            <h3>{P.emailHelp.title}</h3>
            <ul>
              {P.emailHelp.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p>
              <strong>{P.emailHelp.advice}</strong>
            </p>
          </div>
        )}

        <div aria-live="polite">
          {answered < 2 ? (
            <p className="muted">Answer at least two questions to see your best fits.</p>
          ) : (
            <div className="fits">
              <h3>Good fits for you, with the trade-offs</h3>
              <p className="muted">There's no single winner. Read the trade-offs and pick what you can live with.</p>
              <div className="grid grid-3">
                {top.map((r, i) => (
                  <m.article
                    key={r.p.id}
                    className={`card fit-card${chosen === r.p.id ? ' chosen' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <p className="mono muted">{i === 0 ? 'Strongest match' : 'Also worth a look'}</p>
                    <h4>
                      {r.p.name} <span className="muted plan">{r.p.plan}</span>
                    </h4>
                    <p className="price">{r.p.cost.label}</p>
                    {r.plus.length > 0 && (
                      <>
                        <p className="mono fit-label good">Why it fits</p>
                        <ul className="plus">
                          {r.plus.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <p className="mono fit-label warn">Trade-offs</p>
                    <ul className="minus">
                      {[...r.minus, ...r.p.cons.slice(0, 2)].slice(0, 4).map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                    {r.p.warning && <p className="mini-warn">{r.p.warning}</p>}
                    <button
                      type="button"
                      className={`btn btn-small ${chosen === r.p.id ? 'btn-primary' : 'btn-ghost'}`}
                      aria-pressed={chosen === r.p.id}
                      onClick={() => setChosen(chosen === r.p.id ? '' : r.p.id)}
                    >
                      {chosen === r.p.id ? (
                        <>
                          <Icon name="check" size={16} /> My choice
                        </>
                      ) : (
                        'Choose this one'
                      )}
                    </button>
                  </m.article>
                ))}
              </div>
              {chosen && (
                <p style={{ marginTop: 12 }}>
                  Saved. The Agent Builder will make packs for <strong>{ALL.find((p) => p.id === chosen)?.name}</strong>{' '}
                  (you can change this there). <a href={href('builder')}>Go to the Agent Builder →</a>
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="matrix-title">
        <div className="timeline-head">
          <h2 id="matrix-title">Side by side</h2>
          <label className="toggle">
            <input type="checkbox" checked={showAlt} onChange={(e) => setShowAlt(e.target.checked)} />
            <span>Include technical alternatives (Make, n8n)</span>
          </label>
        </div>
        <p className="mono muted">{P.fxNote}</p>
        <div className="table-scroll matrix-wrap" tabIndex={0} role="region" aria-labelledby="matrix-title">
          <table className="matrix">
            <thead>
              <tr>
                <th scope="col">Criteria</th>
                {cols.map((p) => (
                  <th scope="col" key={p.id} className={topIds.includes(p.id) ? 'hl' : ''}>
                    <span className="th-name">{p.name}</span>
                    <span className="th-plan">{p.plan}</span>
                    {topIds.includes(p.id) && <span className="chip chip-teal">Good fit</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Monthly cost" cols={cols} topIds={topIds} cell={(p) => (
                <>
                  <strong>{p.cost.label}</strong>
                  <span className="cell-note">{p.cost.free}</span>
                </>
              )} />
              <Row label="Setup effort" cols={cols} topIds={topIds} cell={(p) => (
                <>
                  <Dots n={p.setup} label="Setup effort" />
                  <span className="cell-note">{p.setupText}</span>
                </>
              )} />
              <Row label="Ongoing effort" cols={cols} topIds={topIds} cell={(p) => (
                <>
                  <Dots n={p.ongoing} label="Ongoing effort" />
                  <span className="cell-note">{p.ongoingText}</span>
                </>
              )} />
              {Object.entries(P.connectLabels).map(([k, label]) => (
                <Row key={k} label={`Connects: ${label}`} cols={cols} topIds={topIds} cell={(p) => {
                  const c = (p.connects as Record<string, { v: string; note: string }>)[k];
                  return <ConnectCell v={c.v} note={c.note} />;
                }} />
              ))}
              <Row label="Runs in the background" cols={cols} topIds={topIds} cell={(p) => (
                <>
                  <Dots n={p.background.rating} label="Background reliability" />
                  <span className="cell-note">{p.background.text}</span>
                </>
              )} />
              <Row label="Data protection" cols={cols} topIds={topIds} cell={(p) => <span className="cell-note">{p.data}</span>} />
              <Row label="Lock-in" cols={cols} topIds={topIds} cell={(p) => (
                <>
                  <strong>{p.lockin.level}</strong>
                  <span className="cell-note">{p.lockin.text}</span>
                </>
              )} />
              <Row label="Good first choice if…" cols={cols} topIds={topIds} cell={(p) => <span className="cell-note">…{p.goodIf}</span>} />
            </tbody>
          </table>
        </div>
        <p className="mono muted" style={{ marginTop: 8 }}>
          Scroll sideways to see every option. “Unconfirmed” means we couldn't verify it. Check before relying on it.
        </p>
        <div className="notice" style={{ marginTop: 16 }}>
          <p>
            <strong>About WhatsApp. </strong>
            {P.whatsappNote}
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="detail-title">
        <h2 id="detail-title">Each option, honestly</h2>
        <div className="grid grid-2">
          {cols.map((p) => (
            <article key={p.id} className={`card platform-card${chosen === p.id ? ' chosen' : ''}`}>
              <div className="pc-head">
                <div>
                  <p className="mono muted">{p.kind}</p>
                  <h3>
                    {p.name} <span className="muted plan">{p.plan}</span>
                  </h3>
                </div>
                <span className="price-tag">{p.cost.label}</span>
              </div>
              <p>{p.oneLiner}</p>
              {p.warning && <p className="mini-warn">{p.warning}</p>}
              <div className="pros-cons">
                <div>
                  <p className="mono fit-label good">Upsides</p>
                  <ul className="plus">
                    {p.pros.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mono fit-label warn">Downsides</p>
                  <ul className="minus">
                    {p.cons.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <p>
                <strong>Good first choice if </strong>
                {p.goodIf}
              </p>
              <TellMore title="Price details and sources" body={`${p.cost.note} Sources: ${p.sources.map((s) => s.label).join('; ')}. See the footnotes below for links.`} />
              <button
                type="button"
                className={`btn btn-small ${chosen === p.id ? 'btn-primary' : 'btn-ghost'}`}
                aria-pressed={chosen === p.id}
                onClick={() => setChosen(chosen === p.id ? '' : p.id)}
              >
                {chosen === p.id ? 'My choice ✓' : 'Choose this one'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="cb-title">
        <h2 id="cb-title">Is it worth the money?</h2>
        <p>
          Using your module 01 answers, agents could save you about <strong>{round1(saved)} hours a week</strong>. At £
          {profile.hourly} an hour, that's worth roughly <strong>£{Math.round(monthlyValue)} a month</strong>. Here's how each
          option compares. Change your answers in <a href={href('week')}>module 01</a>.
        </p>
        <div className="table-scroll" tabIndex={0} role="region" aria-labelledby="cb-title">
          <table className="cb-table">
            <caption className="sr-only">Cost compared with estimated value of time saved</caption>
            <thead>
              <tr>
                <th scope="col">Option</th>
                <th scope="col">Cost / month</th>
                <th scope="col">Hours a month to break even</th>
                <th scope="col">Estimated value vs cost</th>
              </tr>
            </thead>
            <tbody>
              {cols.map((p) => {
                const cost = p.cost.high;
                const breakEven = profile.hourly > 0 ? cost / profile.hourly : Infinity;
                const ratio = cost > 0 ? monthlyValue / cost : Infinity;
                return (
                  <tr key={p.id}>
                    <th scope="row">{p.name}</th>
                    <td>{p.cost.low === p.cost.high ? `£${p.cost.high}` : `£${p.cost.low}–${p.cost.high}`}</td>
                    <td>{cost === 0 ? 'Free tier' : `${round1(breakEven)} hrs`}</td>
                    <td>
                      <div className="cb-bar" aria-hidden="true">
                        <span style={{ width: `${Math.min(100, (Math.min(ratio, 10) / 10) * 100)}%` }} />
                      </div>
                      <span className="cell-note">
                        {ratio === Infinity ? 'No cost at the free tier' : `About ${Math.round(ratio * 10) / 10}× its cost (at top price)`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <TellMore
          title="Cheaper alternatives and combinations"
          body="You don't have to pick only one. A common, low-cost combination is a free AI assistant plan for occasional drafting plus Zapier's or Make's free tier for one simple automation. Or start with one paid assistant (Claude or ChatGPT) for a month, cancel if it isn't earning its keep, and keep your instructions to use elsewhere. Monthly plans let you try before committing to a year."
        />
      </section>

      <section className="section" aria-labelledby="src-title">
        <h2 id="src-title">Sources and footnotes</h2>
        <p className="muted">{P.alternativesNote}</p>
        <ol className="sources">
          {ALL.flatMap((p) => p.sources.map((s) => ({ ...s, p: p.name }))).map((s, i) => (
            <li key={i}>
              <span className="mono muted">{s.p}: </span>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            </li>
          ))}
        </ol>
        <p className="muted">
          Facts last checked {P.lastChecked}. Prices change; always confirm at checkout.
        </p>
      </section>
    </ModuleShell>
  );
}

function Row({
  label,
  cols,
  topIds,
  cell,
}: {
  label: string;
  cols: Platform[];
  topIds: string[];
  cell: (p: Platform) => React.ReactNode;
}) {
  return (
    <tr>
      <th scope="row">{label}</th>
      {cols.map((p) => (
        <td key={p.id} className={topIds.includes(p.id) ? 'hl' : ''}>
          {cell(p)}
        </td>
      ))}
    </tr>
  );
}
