import { useEffect, useState } from 'react';
import { load, save } from './storage';

// useState that persists to localStorage and syncs between components on the same page.
const EVENT = 'agents-course:stored';

export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback));

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key: string };
      if (detail.key === key) setValue(load(key, fallback));
    };
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = (next: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      save(key, resolved);
      queueMicrotask(() => window.dispatchEvent(new CustomEvent(EVENT, { detail: { key } })));
      return resolved;
    });
  };

  return [value, update] as const;
}
