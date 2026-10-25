import { useEffect, useState } from 'react';

// Hash routing (#/module-id) works on any static host, including GitHub Pages sub-paths.
function current(): string {
  const h = window.location.hash.replace(/^#\/?/, '');
  return h.split('?')[0] || 'home';
}

export function useRoute(): string {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    const onHash = () => {
      setRoute(current());
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

export function href(route: string): string {
  return route === 'home' ? '#/' : `#/${route}`;
}

export function go(route: string): void {
  window.location.hash = href(route);
}

/** Read a query parameter from the hash, e.g. #/builder?usecase=enquiry */
export function hashParam(name: string): string | null {
  const q = window.location.hash.split('?')[1];
  return q ? new URLSearchParams(q).get(name) : null;
}
