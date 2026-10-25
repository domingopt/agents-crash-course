import { useId, useState, type ReactNode } from 'react';
import type { GlossaryEntry } from '../content';
import { useGlossary } from '../lib/glossaryContext';

// An underlined glossary term: hover or focus shows a quick definition,
// tap or click opens the full glossary drawer at that entry.
export function Term({ entry, children }: { entry: GlossaryEntry; children: ReactNode }) {
  const [show, setShow] = useState(false);
  const tipId = useId();
  const { open } = useGlossary();
  return (
    <button
      type="button"
      className="term"
      aria-describedby={show ? tipId : undefined}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      onClick={() => {
        setShow(false);
        open(entry.id);
      }}
    >
      {children}
      {show && (
        <span role="tooltip" id={tipId} className="term-tip">
          <strong>{entry.term}:</strong> {entry.def}
        </span>
      )}
    </button>
  );
}
