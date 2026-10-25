import { useMemo, useState } from 'react';
import { m } from 'framer-motion';
import { ModuleShell } from '../components/ModuleShell';
import { rich } from '../components/Rich';
import { round1, useProfile, weeklyHours, type Profile } from '../lib/profile';
import weekData from '../../content/week.json';

const w = weekData;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const START = 6; // 06:00
const END = 24; // midnight
const SPAN = END - START;

type Seg = { taskId: string; label: string; colour: string; start: number; hours: number; saving: number };

// Spread the selected tasks across evening and weekend slots, in order.
function layout(p: Profile): Seg[][] {
  const rows: Seg[][] = DAYS.map(() => []);
  const weekendHours = w.weekendOptions.find((o) => o.id === p.weekend)?.hours ?? 0;
  type Slot = { day: number; start: number; cap: number };
  const slots: Slot[] = [];
  const eveningOrder = [0, 1, 2, 3, 6, 4, 5]; // Mon–Thu, then Sun, Fri, Sat evenings
  eveningOrder.slice(0, p.evenings).forEach((d) => slots.push({ day: d, start: 19.5, cap: 3 }));
  if (weekendHours > 0) {
    const sat = Math.min(weekendHours, 5);
    slots.push({ day: 5, start: 9, cap: sat });
    if (weekendHours > sat) slots.push({ day: 6, start: 10, cap: weekendHours - sat });
  }
  if (slots.length === 0) slots.push({ day: 6, start: 10, cap: 4 });
  slots.sort((a, b) => a.day - b.day || a.start - b.start);
  // Spread the work evenly: shrink every slot when there's more room than work.
  const capacity = slots.reduce((n, s) => n + s.cap, 0);
  const scale = Math.min(1, weeklyHours(p).before / capacity);
  slots.forEach((s) => (s.cap = Math.max(0.5, s.cap * scale)));

  let si = 0;
  let used = 0;
  for (const t of weeklyHours(p).selected) {
    let remaining = t.hours;
    while (remaining > 0.01) {
      const slot = slots[Math.min(si, slots.length - 1)];
      const isLast = si >= slots.length - 1;
      const room = isLast ? Math.max(END - (slot.start + used), 0.25) : slot.cap - used;
      const take = Math.min(remaining, room);
      rows[slot.day].push({
        taskId: t.id,
        label: t.label,
        colour: t.colour,
        start: slot.start + used,
        hours: take,
        saving: t.saving,
      });
      used += take;
      remaining -= take;
      if (!isLast && used >= slot.cap - 0.01) {
        si++;
        used = 0;
      } else if (isLast && remaining > 0.01) {
        break; // ran out of week; the overflow note covers it
      }
    }
  }
  return rows;
}

export default function Week() {
  const [profile, setProfile] = useProfile();
  const [after, setAfter] = useState(false);
  const rows = useMemo(() => layout(profile), [profile]);
  const hours = weeklyHours(profile);
  const monthlyValue = Math.round(hours.saved * 4.33 * profile.hourly);

  const toggleTask = (id: string) =>
    setProfile((p) => ({
      ...p,
      answered: true,
      tasks: p.tasks.includes(id) ? p.tasks.filter((t) => t !== id) : [...p.tasks, id],
    }));

  return (
    <ModuleShell id="week" lede={w.intro}>
      <section className="section" aria-labelledby="warmup-title">
        <h2 id="warmup-title">Quick warm-up</h2>
        <div className="grid grid-2">
          <div>
            <div className="field">
              <label htmlFor="evenings">{w.eveningsQuestion}</label>
              <div className="range-row">
                <input
                  id="evenings"
                  type="range"
                  min={0}
                  max={7}
                  value={profile.evenings}
                  onChange={(e) => setProfile((p) => ({ ...p, answered: true, evenings: Number(e.target.value) }))}
                />
                <output htmlFor="evenings" className="range-out">
                  {profile.evenings}
                </output>
              </div>
            </div>
            <fieldset className="field plain">
              <legend>{w.weekendQuestion}</legend>
              <div className="choice-grid cols-2">
                {w.weekendOptions.map((o) => (
                  <label key={o.id} className="choice">
                    <input
                      type="radio"
                      name="weekend"
                      checked={profile.weekend === o.id}
                      onChange={() => setProfile((p) => ({ ...p, answered: true, weekend: o.id }))}
                    />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <fieldset className="field plain">
            <legend>{w.tasksQuestion}</legend>
            <div className="choice-grid">
              {w.tasks.map((t) => (
                <label key={t.id} className="choice">
                  <input type="checkbox" checked={profile.tasks.includes(t.id)} onChange={() => toggleTask(t.id)} />
                  <span>
                    <span className={`swatch sw-${t.colour}`} aria-hidden="true" /> {t.label}
                    <span className="choice-desc">About {t.hours} hrs a week (illustrative)</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <section className="section" aria-labelledby="timeline-title">
        <div className="timeline-head">
          <h2 id="timeline-title">Your week, {after ? 'with agents' : 'as it is now'}</h2>
          <div className="seg-toggle" role="group" aria-label="Show week">
            <button type="button" aria-pressed={!after} onClick={() => setAfter(false)}>
              Now
            </button>
            <button type="button" aria-pressed={after} onClick={() => setAfter(true)}>
              With agents
            </button>
          </div>
        </div>
        <p className="mono muted illustrative">{w.illustrativeNote}</p>

        <div className="timeline" role="img" aria-label={timelineSummary(profile, after, hours)}>
          <div className="tl-axis" aria-hidden="true">
            {[6, 9, 12, 15, 18, 21, 24].map((h) => (
              <span key={h} style={{ left: `${((h - START) / SPAN) * 100}%` }}>
                {h === 24 ? '00' : String(h).padStart(2, '0')}
              </span>
            ))}
          </div>
          {DAYS.map((d, di) => (
            <div className="tl-row" key={d}>
              <span className="tl-day mono">{d}</span>
              <div className="tl-track">
                {di < 5 && (
                  <div
                    className="tl-block tl-nhs"
                    style={{ left: `${((8 - START) / SPAN) * 100}%`, width: `${(9.5 / SPAN) * 100}%` }}
                  >
                    <span>NHS</span>
                  </div>
                )}
                {rows[di].map((s, i) => {
                  const kept = after ? s.hours * (1 - s.saving) : s.hours;
                  const freed = s.hours - kept;
                  return (
                    <div
                      key={s.taskId + i}
                      className="tl-seg"
                      style={{ left: `${((s.start - START) / SPAN) * 100}%`, width: `${(s.hours / SPAN) * 100}%` }}
                      title={s.label}
                    >
                      <m.div
                        className={`tl-kept sw-${s.colour}`}
                        animate={{ width: `${(kept / s.hours) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeInOut', delay: i * 0.05 + di * 0.04 }}
                      />
                      <m.div
                        className="tl-freed"
                        animate={{ width: `${(freed / s.hours) * 100}%`, opacity: after ? 1 : 0 }}
                        transition={{ duration: 0.8, ease: 'easeInOut', delay: i * 0.05 + di * 0.04 }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <ul className="legend" aria-label="Key">
          <li>
            <span className="swatch tl-nhs" aria-hidden="true" /> NHS work (illustrative)
          </li>
          <li>
            <span className="swatch sw-coral" aria-hidden="true" />
            <span className="swatch sw-teal" aria-hidden="true" />
            <span className="swatch sw-sun" aria-hidden="true" /> Business tasks
          </li>
          <li>
            <span className="swatch tl-freed" aria-hidden="true" /> Time back: the agent does the first draft
          </li>
        </ul>

        <div className="stat-row" aria-live="polite">
          <div className="stat">
            <span className="mono muted">Business time now</span>
            <strong>{round1(hours.before)} hrs/week</strong>
          </div>
          <div className="stat">
            <span className="mono muted">With agents (est.)</span>
            <strong>{round1(hours.after)} hrs/week</strong>
          </div>
          <div className="stat highlight">
            <span className="mono">Time back (est.)</span>
            <strong>≈ {round1(hours.saved)} hrs/week</strong>
          </div>
          <div className="stat">
            <span className="mono muted">Worth roughly</span>
            <strong>£{monthlyValue}/month</strong>
          </div>
        </div>
        <div className="field" style={{ maxWidth: 420, marginTop: 16 }}>
          <label htmlFor="hourly">Value of an hour of your time (£)</label>
          <span className="hint">{w.hourlyValueNote}</span>
          <input
            id="hourly"
            type="number"
            min={0}
            max={500}
            inputMode="numeric"
            value={profile.hourly}
            onChange={(e) => setProfile((p) => ({ ...p, hourly: Math.max(0, Number(e.target.value) || 0) }))}
          />
        </div>
        {!after && (
          <button type="button" className="btn btn-coral" onClick={() => setAfter(true)}>
            Show me the week with agents
          </button>
        )}
      </section>

      <section className="section" aria-labelledby="how-title">
        <h2 id="how-title">Where the time comes back from</h2>
        <div className="grid grid-2">
          {hours.selected.map((t) => (
            <div className="card how-card" key={t.id}>
              <span className={`swatch sw-${t.colour}`} aria-hidden="true" />
              <div>
                <h3>{t.label}</h3>
                <p>{t.how}</p>
                <p className="mono muted">
                  ≈ {round1(t.hours * t.saving)} of {t.hours} hrs back
                </p>
              </div>
            </div>
          ))}
        </div>
        {hours.selected.length === 0 && <p className="muted">Pick some tasks above to see where agents could help.</p>}
        <div className="notice teal" style={{ marginTop: 20 }}>
          <p>{rich(w.afterMessage)}</p>
        </div>
      </section>
    </ModuleShell>
  );
}

function timelineSummary(p: Profile, after: boolean, h: ReturnType<typeof weeklyHours>) {
  return `Illustrative week: NHS work Monday to Friday, business tasks on ${p.evenings} evenings and at weekends, about ${round1(
    h.before,
  )} hours a week. ${after ? `With agents, about ${round1(h.saved)} hours a week come back.` : ''}`;
}
