import { useEffect } from 'react';
import notes from '../../content/facilitator.md?raw';
import { content } from '../content';
import { Markdown } from '../components/Markdown';
import { Icon } from '../components/Icon';
import { useProgress } from '../lib/progress';
import { remove } from '../lib/storage';

export default function Facilitator() {
  const { reset } = useProgress();
  useEffect(() => {
    document.title = `Facilitator notes · ${content.site.courseShort}`;
  }, []);
  return (
    <div className="wrap narrow facilitator">
      <div className="btn-row no-print" style={{ margin: '24px 0' }}>
        <button type="button" className="btn btn-primary btn-small" onClick={() => window.print()}>
          <Icon name="print" size={16} /> Print notes
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => {
            if (window.confirm('Reset progress, answers, platform choice and business details on this device? Saved agents in My agents are kept.')) {
              reset();
              ['sorter', 'platform-answers', 'chosen-platform', 'business', 'profile', 'plan-ticks', 'privacy-checklist', 'builder-draft', 'builder-step'].forEach(remove);
              window.location.hash = '#/';
              window.location.reload();
            }
          }}
        >
          Reset progress for a fresh run-through
        </button>
      </div>
      <Markdown source={notes} />
    </div>
  );
}
