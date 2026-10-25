// Small inline icon set (stroke icons, currentColor) so there are no external requests.
const paths: Record<string, string> = {
  clipboard: 'M9 4h6v3H9zM7 5H5v16h14V5h-2M8 11h8M8 15h6',
  plug: 'M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0zM12 17v5',
  book: 'M4 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4zM20 4h-6M20 4v15h-6',
  notebook: 'M6 3h12v18H6zM9 3v18M12 8h4M12 12h4',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
  person: 'M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c1-4 4-6 8-6s7 2 8 6',
  megaphone: 'M3 10v4h4l7 4V6L7 10zM18 9a4 4 0 0 1 0 6',
  scales: 'M12 3v18M5 21h14M6 7h12M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
  book2: 'M4 5h16v14H4z',
  close: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12l5 5 9-10',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5M11 6l-6 6 6 6',
  play: 'M7 5l12 7-12 7z',
  pause: 'M8 5v14M16 5v14',
  print: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z',
  download: 'M12 3v12M7 10l5 5 5-5M4 20h16',
  upload: 'M12 21V9M7 14l5-5 5 5M4 4h16',
  edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  duplicate: 'M8 8h12v12H8zM4 16V4h12',
  plus: 'M12 5v14M5 12h14',
  sparkle: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
  plane: 'M2 13l8-2 4-8 2 1-2 7 6-1 2-3h2l-1 5 1 5h-2l-2-3-6-1 2 7-2 1-4-8-8-2z',
  info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.5',
  warn: 'M12 3l10 18H2zM12 10v5M12 18v.5',
  bag: 'M5 8h14l-1 13H6zM9 8V5a3 3 0 0 1 6 0v3',
  filter: 'M3 5h18l-7 8v6l-4 2v-8z',
};

export function Icon({ name, size = 20, label }: { name: string; size?: number; label?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      style={{ flex: 'none' }}
    >
      <path d={paths[name] ?? paths.info} />
    </svg>
  );
}
