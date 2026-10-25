import { useEffect } from 'react';
import { content } from '../content';
import { Icon } from '../components/Icon';
import { BrandMark } from '../components/Header';
import planData from '../../content/plan.json';

const cs = planData.cheatSheet;

export default function CheatSheet() {
  useEffect(() => {
    document.title = `Cheat sheet · ${content.site.courseShort}`;
  }, []);
  return (
    <div className="wrap">
      <div className="btn-row no-print" style={{ margin: '24px 0' }}>
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          <Icon name="print" size={18} /> Print or save as PDF
        </button>
      </div>
      <article className="cheatsheet">
        <header className="cs-head">
          <BrandMark />
          <div>
            <p className="mono">{content.site.courseTitle}</p>
            <h1>{cs.title}</h1>
          </div>
        </header>
        <div className="cs-grid">
          {cs.sections.map((s) => (
            <section key={s.heading} className="cs-box">
              <h2>{s.heading}</h2>
              <ul>
                {s.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <p className="cs-foot mono">
          Not legal advice · Facts checked {content.site.lastChecked} · Your agents live under "My agents" on the course site
        </p>
      </article>
    </div>
  );
}
