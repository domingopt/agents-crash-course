import { useStored } from './useStored';
import weekData from '../../content/week.json';

export type Profile = {
  evenings: number;
  weekend: string;
  tasks: string[];
  hourly: number;
  answered: boolean;
};

const w = weekData;
export const defaultProfile: Profile = {
  evenings: w.defaultEvenings,
  weekend: w.defaultWeekend,
  tasks: w.defaultTasks,
  hourly: w.hourlyValueDefault,
  answered: false,
};

export function useProfile() {
  return useStored<Profile>('profile', defaultProfile);
}

export function weeklyHours(p: Profile) {
  const selected = w.tasks.filter((t) => p.tasks.includes(t.id));
  const before = selected.reduce((n, t) => n + t.hours, 0);
  const saved = selected.reduce((n, t) => n + t.hours * t.saving, 0);
  return { before, saved, after: before - saved, selected };
}

export const round1 = (n: number) => Math.round(n * 2) / 2; // nearest half hour
