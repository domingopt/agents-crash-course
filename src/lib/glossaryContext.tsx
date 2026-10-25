import { createContext, useContext } from 'react';

export type GlossaryApi = { open: (id?: string) => void };
export const GlossaryContext = createContext<GlossaryApi>({ open: () => {} });
export const useGlossary = () => useContext(GlossaryContext);
