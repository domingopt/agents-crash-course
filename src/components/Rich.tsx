import { Fragment, type ReactNode } from 'react';
import { content, personalise } from '../content';
import { Term } from './Term';

// Lightweight inline markup used in the content files:
//   **bold**            -> <strong>
//   [[term]]            -> glossary term (matched by term or alias)
//   [[label|glossaryId]] -> glossary term with custom label
const TOKEN = /(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g;

function findTerm(key: string) {
  const k = key.toLowerCase();
  return content.glossary.find(
    (g) => g.id === k || g.term.toLowerCase() === k || g.aka?.some((a) => a.toLowerCase() === k),
  );
}

export function rich(text: string): ReactNode {
  const parts = personalise(text).split(TOKEN);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('[[') && part.endsWith(']]')) {
      const inner = part.slice(2, -2);
      const [label, id] = inner.split('|');
      const entry = findTerm(id ?? label);
      return entry ? (
        <Term key={i} entry={entry}>
          {label}
        </Term>
      ) : (
        <Fragment key={i}>{label}</Fragment>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function Rich({ text, as: Tag = 'p' }: { text: string; as?: 'p' | 'span' | 'li' | 'div' }) {
  return <Tag>{rich(text)}</Tag>;
}
