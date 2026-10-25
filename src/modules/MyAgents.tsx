import { useEffect, useRef, useState } from 'react';
import { content, type Platform } from '../content';
import { Icon } from '../components/Icon';
import { CopyBlock } from '../components/CopyBlock';
import { blankDraft, buildPack, newId, packAsText, scheduleText, useAgents, type AgentDraft } from '../lib/agents';
import { downloadText, slug } from '../lib/files';
import { href } from '../lib/route';
import platformsData from '../../content/platforms.json';
import builderData from '../../content/builder.json';

const PLATFORMS = platformsData.platforms as Platform[];
const platformName = (id: string) => PLATFORMS.find((p) => p.id === id)?.name ?? 'No platform yet';

function whenText(a: AgentDraft) {
  if (a.trigger.type === 'schedule') return `Runs ${scheduleText(a.trigger)}`;
  if (a.trigger.type === 'event') return `Runs when ${a.trigger.eventDesc || 'something arrives'}`;
  return 'Runs when you ask';
}

function PackPrint({ a }: { a: AgentDraft }) {
  const p = buildPack(a);
  return (
    <article className="print-pack">
      <h2>
        {a.name}: {p.platformName} setup pack
      </h2>
      {p.warnings.map((w) => (
        <p key={w}>
          <strong>Note:</strong> {w}
        </p>
      ))}
      <h3>Setup checklist</h3>
      <ol>
        {p.checklist.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ol>
      <h3>Instructions</h3>
      <pre>{p.instructions}</pre>
      <h3>Test prompt</h3>
      <pre>{p.test}</pre>
      <h3>What good looks like</h3>
      <ul>
        {p.goodLooksLike.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>
      <h3>Review, tweak and switch off</h3>
      <ul>
        {p.review.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </article>
  );
}

export default function MyAgents() {
  const [agents, setAgents] = useAgents();
  const [open, setOpen] = useState<string | null>(null);
  const [printIds, setPrintIds] = useState<string[] | null>(null);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `My agents · ${content.site.courseShort}`;
  }, []);

  useEffect(() => {
    if (!printIds) return;
    const t = setTimeout(() => {
      window.print();
      setPrintIds(null);
    }, 100);
    return () => clearTimeout(t);
  }, [printIds]);

  const duplicate = (a: AgentDraft) => {
    const now = new Date().toISOString();
    setAgents((list) => [{ ...a, id: newId(), name: `${a.name} (copy)`, createdAt: now, updatedAt: now }, ...list]);
    setMsg(`Duplicated "${a.name}".`);
  };
  const del = (a: AgentDraft) => {
    if (window.confirm(`Delete "${a.name}" from My agents? This only removes it from this site, not from your AI platform.`)) {
      setAgents((list) => list.filter((x) => x.id !== a.id));
      setMsg(`Deleted "${a.name}".`);
    }
  };
  const exportAll = () => {
    downloadText(
      `my-agents-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ kind: 'agents-course-export', version: 1, exportedAt: new Date().toISOString(), agents }, null, 2),
      'application/json',
    );
  };
  const importFile = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      const list: unknown[] = Array.isArray(data) ? data : data?.agents;
      if (!Array.isArray(list)) throw new Error('No agents found');
      const base = blankDraft();
      const clean = list
        .filter((x): x is Partial<AgentDraft> => !!x && typeof x === 'object' && typeof (x as AgentDraft).name === 'string')
        .map((x) => ({
          ...base,
          ...x,
          id: typeof x.id === 'string' ? x.id : newId(),
          trigger: { ...base.trigger, ...(x.trigger ?? {}) },
          business: { ...base.business, ...(x.business ?? {}) },
          tools: Array.isArray(x.tools) ? x.tools : base.tools,
          guardrails: Array.isArray(x.guardrails) ? x.guardrails : base.guardrails,
        }));
      if (!clean.length) throw new Error('No agents found');
      setAgents((cur) => {
        const ids = new Set(clean.map((c) => c.id));
        return [...clean, ...cur.filter((c) => !ids.has(c.id))];
      });
      setMsg(`Imported ${clean.length} agent${clean.length === 1 ? '' : 's'}.`);
    } catch {
      setMsg("Sorry, that file couldn't be read. Make sure it's a file exported from My agents.");
    }
  };

  const toPrint = printIds ? agents.filter((a) => printIds.includes(a.id)) : [];

  return (
    <div className="wrap">
      <header className="module-hero">
        <div className="eyebrow mono">
          <span>Your library</span>
        </div>
        <h1>My agents</h1>
        <p className="lede">
          Every agent you've built, saved on this device. Edit, duplicate, export a backup or print a setup pack whenever
          you're ready.
        </p>
      </header>

      <div className="btn-row no-print library-actions">
        <a className="btn btn-primary" href={href('builder')}>
          <Icon name="plus" size={18} /> Build a new agent
        </a>
        <button type="button" className="btn btn-ghost btn-small" onClick={exportAll} disabled={!agents.length}>
          <Icon name="download" size={16} /> Export all
        </button>
        <button type="button" className="btn btn-ghost btn-small" onClick={() => fileRef.current?.click()}>
          <Icon name="upload" size={16} /> Import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importFile(f);
            e.target.value = '';
          }}
        />
        <button type="button" className="btn btn-ghost btn-small" onClick={() => setPrintIds(agents.map((a) => a.id))} disabled={!agents.length}>
          <Icon name="print" size={16} /> Print all
        </button>
      </div>
      <p className="muted small no-print">
        Saved only in this browser. Export a backup now and then. Clearing your browser data will remove them.
      </p>
      <p role="status" className="status-msg">
        {msg}
      </p>

      {agents.length === 0 ? (
        <div className="card empty no-print">
          <h2>No agents yet</h2>
          <p>Start with one of the ready-made templates. Each takes under 15 minutes to launch.</p>
          <div className="btn-row">
            {builderData.templates.map((t) => (
              <a key={t.id} className="btn btn-ghost btn-small" href={`#/builder?template=${t.id}`}>
                {t.name}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <ul className="agent-list no-print">
          {agents.map((a) => (
            <li key={a.id} className="ticket horizontal agent-item">
              <div className="ticket-main">
                <h2 className="h3">{a.name || 'Untitled agent'}</h2>
                <p className="muted">{a.goal}</p>
                <div className="usecase-tags">
                  <span className="chip chip-teal">{platformName(a.platform)}</span>
                  <span className="chip">{whenText(a)}</span>
                </div>
                {open === a.id && (
                  <div className="agent-open">
                    <CopyBlock label="Agent instructions" text={buildPack(a).instructions} />
                    <p>
                      <a href={`#/builder?edit=${a.id}`}>Open the full pack in the builder →</a>
                    </p>
                  </div>
                )}
              </div>
              <div className="ticket-stub">
                <span className="mono muted">Updated {new Date(a.updatedAt).toLocaleDateString('en-GB')}</span>
                <div className="agent-actions">
                  <button type="button" className="btn btn-ghost btn-small" aria-expanded={open === a.id} onClick={() => setOpen(open === a.id ? null : a.id)}>
                    {open === a.id ? 'Hide' : 'Instructions'}
                  </button>
                  <a className="btn btn-ghost btn-small" href={`#/builder?edit=${a.id}`}>
                    <Icon name="edit" size={16} /> Edit
                  </a>
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => duplicate(a)}>
                    <Icon name="duplicate" size={16} /> Duplicate
                  </button>
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => downloadText(`${slug(a.name)}-pack.txt`, packAsText(a))}>
                    <Icon name="download" size={16} /> Download
                  </button>
                  <button type="button" className="btn btn-ghost btn-small" onClick={() => setPrintIds([a.id])}>
                    <Icon name="print" size={16} /> Print
                  </button>
                  <button type="button" className="btn btn-ghost btn-small danger" onClick={() => del(a)}>
                    <Icon name="trash" size={16} /> Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="print-only">
        {toPrint.map((a) => (
          <PackPrint key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
}
