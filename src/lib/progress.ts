import { useStored } from './useStored';

export function useProgress() {
  const [done, setDone] = useStored<string[]>('progress', []);
  const markDone = (id: string) => setDone((d) => (d.includes(id) ? d : [...d, id]));
  const reset = () => setDone([]);
  return { done, markDone, reset };
}
