import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { type Platform } from '../content';
import { ModuleShell } from '../components/ModuleShell';
import { CopyBlock } from '../components/CopyBlock';
import { TellMore } from '../components/TellMore';
import { rich } from '../components/Rich';
import { Icon } from '../components/Icon';
import { useStored } from '../lib/useStored';
import { load } from '../lib/storage';
import { hashParam, href } from '../lib/route';
import {
  blankDraft,
  buildPack,
  defaultBusiness,
  fromTemplate,
  fromUseCase,
  packAsText,
  useAgents,
  type AgentDraft,
  type Business,
} from '../lib/agents';
import { downloadText, slug } from '../lib/files';
import usecasesData from '../../content/usecases.json';
import platformsData from '../../content/platforms.json';
import builderData from '../../content/builder.json';

const B = builderData;
const PLATFORMS = platformsData.platforms as Platform[];

export default function Builder() {
  const [agents, setAgents] = useAgents();
  const [business, setBusiness] = useStored<Business>('business', defaultBusiness());
  const [chosen] = useStored<string>('chosen-platform', '');
  const [draft, setDraft] = useStored<AgentDraft | null>('builder-draft', null);
  const [step, setStep] = useStored<number>('builder-step', 0);
  const [toast, setToast] = useState('');
  const topRef = useRef<HTMLDivElement>(null);

  // Deep links: #/builder?usecase=…, ?template=…, ?edit=…
  useEffect(() => {
    const uc = hashParam('usecase');
    const tpl = hashParam('template');
    const edit = hashParam('edit');
    if (edit) {
      const a = load<AgentDraft[]>('agents', []).find((x) => x.id === edit);
      if (a) {
        setDraft({ ...a });
        setStep(1);
      }
    } else if (tpl) {
      setDraft(fromTemplate(tpl, chosen, business));
      setStep(1);
    } else if (uc) {
      setDraft(fromUseCase(uc, chosen, business));
      setStep(1);
    }
    if (uc || tpl || edit) history.replaceState(null, '', href('builder'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const d = draft;
  const update = (patch: Partial<AgentDraft>) => setDraft((x) => (x ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x));
  const go = (n: number) => {
    setStep(n);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const start = (nd: AgentDraft) => {
    setDraft({ ...nd, business: { ...business } });
    go(1);
  };
  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2400);
  };
  const saveAgent = () => {
    if (!d) return;
    const exists = agents.some((a) => a.id === d.id);
    setAgents((list) => (exists ? list.map((a) => (a.id === d.id ? d : a)) : [d, ...list]));
    flash(exists ? 'Agent updated in My agents' : 'Saved to My agents');
  };

  const canNext = (() => {
    if (!d) return false;
    if (step === 1) return d.name.trim().length > 0 && d.goal.trim().length > 0;
    if (step === 6) return !!d.platform;
    return true;
  })();

  return (
    <ModuleShell id="builder" lede={B.intro}>
      <div ref={topRef} style={{ scrollMarginTop: 120 }} />
      <p className="privacy-line">
        <Icon name="shield" size={16} /> {B.privacyNote}
      </p>

      {d && step > 0 && (
        <nav className="wizard-steps" aria-label="Builder steps">
          <ol>
            {B.steps.map((label, i) => (
              <li key={label}>
                <button
                  type="button"
                  aria-current={step === i ? 'step' : undefined}
                  className={i < step ? 'past' : ''}
                  onClick={() => go(i)}
                  disabled={i > 1 && (!d.name || !d.goal)}
                >
                  <span className="mono">{i + 1}</span> <span className="ws-label">{label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <AnimatePresence mode="wait">
        <m.section
          key={step + (d ? d.id : 'none')}
          className="wizard-panel"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          aria-labelledby="step-title"
        >
          {(step === 0 || !d) && <StepStart draft={d} onStart={start} onContinue={() => go(1)} chosen={chosen} business={business} />}
          {d && step === 1 && <StepGoal d={d} update={update} />}
          {d && step === 2 && <StepTools d={d} update={update} />}
          {d && step === 3 && <StepWhen d={d} update={update} />}
          {d && step === 4 && <StepRules d={d} update={update} />}
          {d && step === 5 && (
            <StepDetails
              d={d}
              update={(patch) => {
                update(patch);
                if (patch.business) setBusiness(patch.business);
              }}
            />
          )}
          {d && step === 6 && <StepPlatform d={d} update={update} />}
          {d && step === 7 && (
            <StepPack
              d={d}
              onSave={saveAgent}
              saved={agents.some((a) => a.id === d.id && a.updatedAt === d.updatedAt)}
              onDownload={() => downloadText(`${slug(d.name)}-${d.platform}-pack.txt`, packAsText(d))}
              onNew={() => {
                setDraft(null);
                go(0);
              }}
            />
          )}
        </m.section>
      </AnimatePresence>

      {d && step > 0 && step < 7 && (
        <div className="wizard-nav">
          <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)}>
            <Icon name="arrowLeft" size={18} /> Back
          </button>
          <button type="button" className="btn btn-primary" disabled={!canNext} onClick={() => go(step + 1)}>
            {step === 6 ? 'Make my pack' : 'Next'} <Icon name="arrowRight" size={18} />
          </button>
        </div>
      )}
      {d && step === 1 && !canNext && <p className="muted center">Give your agent a name and a goal to continue.</p>}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </ModuleShell>
  );
}

/* ---------------- Steps ---------------- */

function StepStart({
  draft,
  onStart,
  onContinue,
  chosen,
  business,
}: {
  draft: AgentDraft | null;
  onStart: (d: AgentDraft) => void;
  onContinue: () => void;
  chosen: string;
  business: Business;
}) {
  const [uc, setUc] = useState('');
  return (
    <div>
      <h2 id="step-title">Start with a template, an idea or a blank page</h2>
      {draft && (
        <div className="notice teal" style={{ marginBottom: 20 }}>
          <p>
            You have an unfinished agent: <strong>{draft.name || 'Untitled'}</strong>.{' '}
            <button type="button" className="btn btn-primary btn-small" onClick={onContinue}>
              Carry on
            </button>
          </p>
        </div>
      )}
      <h3>Ready-made templates</h3>
      <p className="muted">Tuned for your business, ready to launch in under 15 minutes each.</p>
      <div className="grid grid-3">
        {B.templates.map((t) => (
          <article key={t.id} className="ticket template-ticket">
            <div className="ticket-main">
              <span className="chip">{t.category}</span>
              <h4>{t.name}</h4>
              <p>{t.blurb}</p>
            </div>
            <div className="ticket-stub">
              <span className="mono muted">~{t.minutes} min setup</span>
              <button type="button" className="btn btn-coral btn-small" onClick={() => onStart(fromTemplate(t.id, chosen, business))}>
                Use this
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <h3>From the ideas gallery</h3>
          <div className="field">
            <label htmlFor="uc-pick">Pick an idea</label>
            <select id="uc-pick" value={uc} onChange={(e) => setUc(e.target.value)}>
              <option value="">Choose…</option>
              {usecasesData.categories.map((c) => (
                <optgroup key={c.id} label={c.label}>
                  {usecasesData.items
                    .filter((i) => i.category === c.id)
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.title}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
          <button type="button" className="btn btn-primary btn-small" disabled={!uc} onClick={() => onStart(fromUseCase(uc, chosen, business))}>
            Start from this idea
          </button>
        </div>
        <div className="card">
          <h3>Blank page</h3>
          <p>Got your own idea? Start from scratch. Sensible safety rules are switched on for you.</p>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => onStart(blankDraft(chosen))}>
            <Icon name="plus" size={16} /> Start blank
          </button>
        </div>
      </div>
    </div>
  );
}

type StepProps = { d: AgentDraft; update: (p: Partial<AgentDraft>) => void };

function StepGoal({ d, update }: StepProps) {
  return (
    <div>
      <h2 id="step-title">What's the job?</h2>
      <div className="field">
        <label htmlFor="a-name">Give your agent a name</label>
        <span className="hint">Something you'll recognise, e.g. "Enquiry helper" or "Monday briefing".</span>
        <input id="a-name" type="text" value={d.name} onChange={(e) => update({ name: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="a-goal">Describe the goal in a sentence or two</label>
        <span className="hint">Imagine briefing a new assistant: what should they achieve?</span>
        <textarea id="a-goal" value={d.goal} onChange={(e) => update({ goal: e.target.value })} />
      </div>
      <fieldset className="field plain">
        <legend>Who is the output for?</legend>
        <div className="choice-grid cols-2">
          {B.audiences.map((a) => (
            <label key={a.id} className="choice">
              <input type="radio" name="aud" checked={d.audience === a.id} onChange={() => update({ audience: a.id })} />
              <span>
                <strong>{a.label}</strong>
                <span className="choice-desc">{a.desc}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="field">
        <label htmlFor="a-steps">Steps it should follow (optional)</label>
        <span className="hint">Number them if you can. Templates fill this in for you.</span>
        <textarea id="a-steps" rows={6} value={d.steps} onChange={(e) => update({ steps: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="a-out">What should it hand back? (optional)</label>
        <span className="hint">e.g. "A draft email and a 3-bullet summary for me."</span>
        <textarea id="a-out" rows={3} value={d.output} onChange={(e) => update({ output: e.target.value })} />
      </div>
      <TellMore title="Tips for a good goal" body="Be specific about what 'good' looks like: how long, what format, what to include and what to leave out. If you have an example of a great reply you've written before, paste it into the steps as 'Here's an example of my style'." />
    </div>
  );
}

function StepTools({ d, update }: StepProps) {
  const toggle = (id: string) => {
    let tools = d.tools.includes(id) ? d.tools.filter((t) => t !== id) : [...d.tools, id];
    if (id !== 'paste' && tools.includes(id)) tools = tools.filter((t) => t !== 'paste');
    if (id === 'paste' && tools.includes('paste')) tools = ['paste'];
    if (tools.length === 0) tools = ['paste'];
    update({ tools });
  };
  return (
    <div>
      <h2 id="step-title">What can it use?</h2>
      <p>{rich("Give it the fewest [[connections|connector]] that get the job done. Starting with \"I'll paste things in\" is perfectly fine.")}</p>
      <div className="choice-grid cols-2">
        {B.tools.map((t) => (
          <label key={t.id} className="choice">
            <input type="checkbox" checked={d.tools.includes(t.id)} onChange={() => toggle(t.id)} />
            <span>
              <strong>{t.label}</strong>
              <span className="choice-desc">{t.desc}</span>
            </span>
          </label>
        ))}
      </div>
      {d.tools.includes('files') && (
        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="a-know">Which documents will you give it? (optional)</label>
          <span className="hint">General documents only. Never client passports, health or payment details.</span>
          <textarea id="a-know" rows={3} value={d.knowledge} onChange={(e) => update({ knowledge: e.target.value })} />
        </div>
      )}
    </div>
  );
}

function StepWhen({ d, update }: StepProps) {
  const t = d.trigger;
  const set = (patch: Partial<AgentDraft['trigger']>) => update({ trigger: { ...t, ...patch } });
  return (
    <div>
      <h2 id="step-title">When should it run?</h2>
      <p className="muted">Tip: start with "When I ask" for a week, then switch to a schedule once you trust it.</p>
      <div className="choice-grid cols-3">
        {B.triggers.map((x) => (
          <label key={x.id} className="choice">
            <input type="radio" name="trig" checked={t.type === x.id} onChange={() => set({ type: x.id })} />
            <span>
              <strong>{x.label}</strong>
              <span className="choice-desc">{x.desc}</span>
            </span>
          </label>
        ))}
      </div>
      {t.type === 'schedule' && (
        <div className="grid grid-3" style={{ marginTop: 16 }}>
          <div className="field">
            <label htmlFor="t-freq">How often</label>
            <select id="t-freq" value={t.frequency} onChange={(e) => set({ frequency: e.target.value })}>
              {B.frequencies.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          {t.frequency === 'weekly' && (
            <div className="field">
              <label htmlFor="t-day">Which day</label>
              <select id="t-day" value={t.day} onChange={(e) => set({ day: e.target.value })}>
                {B.days.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label htmlFor="t-time">What time</label>
            <input id="t-time" type="time" value={t.time} onChange={(e) => set({ time: e.target.value })} />
          </div>
        </div>
      )}
      {t.type === 'event' && (
        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="t-event">What should set it off?</label>
          <span className="hint">e.g. "a new email with 'enquiry' in the subject". Not every platform can do this; your pack will say.</span>
          <input id="t-event" type="text" value={t.eventDesc} onChange={(e) => set({ eventDesc: e.target.value })} />
        </div>
      )}
    </div>
  );
}

function StepRules({ d, update }: StepProps) {
  const toggle = (id: string) =>
    update({ guardrails: d.guardrails.includes(id) ? d.guardrails.filter((g) => g !== id) : [...d.guardrails, id] });
  const risky = (d.audience === 'clients' || d.audience === 'public') && !d.guardrails.includes('draftonly');
  return (
    <div>
      <h2 id="step-title">Set the ground rules</h2>
      <p>{rich('These become [[guardrails|guardrail]] in the instructions. The most important ones are already ticked.')}</p>
      <div className="choice-grid cols-2">
        {B.guardrails.map((g) => (
          <label key={g.id} className="choice">
            <input type="checkbox" checked={d.guardrails.includes(g.id)} onChange={() => toggle(g.id)} />
            <span>{g.label}</span>
          </label>
        ))}
      </div>
      {risky && (
        <p className="mini-warn" role="alert">
          This agent's output goes to clients or the public. We strongly suggest keeping "Always ask me before anything is sent" on.
        </p>
      )}
      <div className="field" style={{ marginTop: 16 }}>
        <label htmlFor="a-rules">Any other rules? (one per line)</label>
        <span className="hint">e.g. "Always mention that I'm ABTA-protected through my host agency" or "Never recommend cruises to first-timers."</span>
        <textarea id="a-rules" rows={4} value={d.customRules} onChange={(e) => update({ customRules: e.target.value })} />
      </div>
    </div>
  );
}

function StepDetails({ d, update }: StepProps) {
  const b = d.business;
  const setB = (patch: Partial<Business>) => update({ business: { ...b, ...patch } });
  return (
    <div>
      <h2 id="step-title">Tone and your business details</h2>
      <p className="muted">These are remembered for your next agent too. Leave anything blank you're not sure of yet.</p>
      <fieldset className="field plain">
        <legend>How should it sound?</legend>
        <div className="choice-grid cols-3">
          {B.tones.map((t) => (
            <label key={t.id} className="choice">
              <input type="radio" name="tone" checked={d.tone === t.id} onChange={() => update({ tone: t.id })} />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="b-owner">Your name</label>
          <input id="b-owner" type="text" value={b.ownerName} onChange={(e) => setB({ ownerName: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="b-agency">Agency or trading name</label>
          <input id="b-agency" type="text" value={b.agencyName} onChange={(e) => setB({ agencyName: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="b-host">Host agency (if any)</label>
          <input id="b-host" type="text" value={b.hostAgency} onChange={(e) => setB({ hostAgency: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="b-nm">Network marketing company (if relevant)</label>
          <input id="b-nm" type="text" value={b.networkCompany} onChange={(e) => setB({ networkCompany: e.target.value })} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="b-spec">Your specialisms</label>
        <input id="b-spec" type="text" value={b.specialisms} onChange={(e) => setB({ specialisms: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="b-sign">Sign-off</label>
        <textarea id="b-sign" rows={3} value={b.signOff} onChange={(e) => setB({ signOff: e.target.value })} />
      </div>
    </div>
  );
}

function StepPlatform({ d, update }: StepProps) {
  return (
    <div>
      <h2 id="step-title">Which platform is this for?</h2>
      <p>
        Not sure? <a href={href('platforms')}>Compare the platforms</a> first. Your instructions work on any of them, so you
        can switch later.
      </p>
      <div className="choice-grid cols-2">
        {PLATFORMS.map((p) => (
          <label key={p.id} className="choice">
            <input type="radio" name="plat" checked={d.platform === p.id} onChange={() => update({ platform: p.id })} />
            <span>
              <strong>
                {p.name} <span className="muted">· {p.plan}</span>
              </strong>
              <span className="choice-desc">
                {p.cost.label}. {p.tier === 'alternative' ? 'More technical. ' : ''}
                {p.id === 'copilot' ? 'No schedules on personal plans.' : ''}
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function StepPack({
  d,
  onSave,
  saved,
  onDownload,
  onNew,
}: {
  d: AgentDraft;
  onSave: () => void;
  saved: boolean;
  onDownload: () => void;
  onNew: () => void;
}) {
  const pack = buildPack(d);
  return (
    <div className="pack">
      <div className="pack-head">
        <div>
          <p className="mono coral">Your setup pack · {pack.platformName}</p>
          <h2 id="step-title">{d.name}</h2>
        </div>
        <div className="btn-row no-print">
          <button type="button" className="btn btn-primary" onClick={onSave}>
            <Icon name={saved ? 'check' : 'bag'} size={18} /> {saved ? 'Saved' : 'Save to My agents'}
          </button>
          <button type="button" className="btn btn-ghost btn-small" onClick={onDownload}>
            <Icon name="download" size={16} /> Download
          </button>
          <button type="button" className="btn btn-ghost btn-small" onClick={() => window.print()}>
            <Icon name="print" size={16} /> Print
          </button>
        </div>
      </div>

      {pack.warnings.length > 0 && (
        <div className="notice">
          {pack.warnings.map((w) => (
            <p key={w}>
              <Icon name="warn" size={16} /> {w}
            </p>
          ))}
        </div>
      )}

      <h3>1. Set it up</h3>
      <ol className="checklist">
        {pack.checklist.map((c, i) => (
          <li key={i}>
            <span>{c}</span>
          </li>
        ))}
      </ol>

      <h3>2. The instructions to paste</h3>
      <CopyBlock label="Agent instructions" text={pack.instructions} />

      <h3 style={{ marginTop: 24 }}>3. Test it</h3>
      <CopyBlock label="Test prompt" text={pack.test} />
      <div className="card good-looks">
        <p className="mono muted">What good looks like</p>
        <ul className="plus">
          {pack.goodLooksLike.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </div>

      <h3 style={{ marginTop: 24 }}>4. Review, tweak and switch off</h3>
      <ul>
        {pack.review.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p className="muted">{pack.help}</p>

      <div className="btn-row no-print" style={{ marginTop: 24 }}>
        <button type="button" className="btn btn-primary" onClick={onSave}>
          {saved ? 'Saved ✓' : 'Save to My agents'}
        </button>
        <a className="btn btn-ghost" href={href('my-agents')}>
          Go to My agents
        </a>
        <button type="button" className="btn btn-ghost" onClick={onNew}>
          <Icon name="plus" size={16} /> Build another
        </button>
      </div>
    </div>
  );
}
