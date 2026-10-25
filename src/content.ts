// All copy lives in /content. Only site-wide data is bundled here; each module imports its own file
// so it's loaded with that module.
// as JSON so it can be edited without touching components.
import site from '../content/site.json';
import modules from '../content/modules.json';
import glossary from '../content/glossary.json';

export type ModuleMeta = (typeof modules)[number];
export type GlossaryEntry = { id: string; term: string; def: string; aka?: string[] };
export type Platform = (typeof import('../content/platforms.json'))['platforms'][number] & { warning?: string };
export type UseCase = (typeof import('../content/usecases.json'))['items'][number] & { template?: string; weekTask?: string };

export const content = {
  site,
  modules,
  glossary: glossary as GlossaryEntry[],
};

/**
 * The learner's name. Kept out of the public repo: set VITE_LEARNER_NAME in .env.local
 * (or as the LEARNER_NAME repository variable for the GitHub Pages build), or fill in site.json.
 */
export const learnerName: string = (import.meta.env.VITE_LEARNER_NAME as string | undefined)?.trim() || site.learnerName || '';

/** Replace {name} placeholders with the learner's name ("me" when no name is set). */
export function personalise(text: string, name = learnerName): string {
  return text.replace(/\{name\}/g, name || 'me');
}
