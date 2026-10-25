import { useState } from 'react';
import { Icon } from './Icon';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers without async clipboard permission.
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyBlock({ label, text }: { label: string; text: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  return (
    <div className="copy-block">
      <div className="copy-head">
        <span className="mono muted">{label}</span>
        <button
          type="button"
          className="btn btn-primary btn-small"
          onClick={async () => {
            setState((await copyText(text)) ? 'copied' : 'failed');
            setTimeout(() => setState('idle'), 2200);
          }}
        >
          <Icon name={state === 'copied' ? 'check' : 'copy'} size={16} />
          {state === 'copied' ? 'Copied' : state === 'failed' ? 'Select and copy' : 'Copy'}
        </button>
      </div>
      <pre tabIndex={0} aria-label={label}>
        {text}
      </pre>
      <span className="sr-only" aria-live="polite">
        {state === 'copied' ? 'Copied to clipboard' : ''}
      </span>
    </div>
  );
}
