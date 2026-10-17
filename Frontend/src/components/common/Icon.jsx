const P = (d) => <path d={d} />

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" />{P('M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2')}{P('M2 13h20')}</>,
  search: <><circle cx="11" cy="11" r="7" />{P('m21 21-4.3-4.3')}</>,
  user: <>{P('M20 21v-1a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v1')}<circle cx="12" cy="7" r="4" /></>,
  users: <>{P('M17 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1')}<circle cx="9.5" cy="7" r="4" />{P('M22 21v-1a4 4 0 0 0-3-3.85')}{P('M16 3.15a4 4 0 0 1 0 7.7')}</>,
  file: <>{P('M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z')}{P('M14 2v6h6')}{P('M8 13h8M8 17h6')}</>,
  building: <><rect x="4" y="2" width="16" height="20" rx="2" />{P('M9 22v-4h6v4')}{P('M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01')}</>,
  plus: P('M12 5v14M5 12h14'),
  logout: <>{P('M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4')}{P('m16 17 5-5-5-5')}{P('M21 12H9')}</>,
  menu: P('M4 6h16M4 12h16M4 18h16'),
  x: P('M18 6 6 18M6 6l12 12'),
  pin: <>{P('M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z')}<circle cx="12" cy="10" r="3" /></>,
  clock: <><circle cx="12" cy="12" r="10" />{P('M12 6v6l4 2')}</>,
  rupee: P('M6 3h12M6 8h12M6 13l8.5 8M6 13h3M9 13c6.667 0 6.667-10 0-10'),
  cap: <>{P('M22 10 12 5 2 10l10 5z')}{P('M6 12v5c3 3 9 3 12 0v-5')}</>,
  check: P('M20 6 9 17l-5-5'),
  chevR: P('m9 18 6-6-6-6'),
  chevL: P('m15 18-6-6 6-6'),
  chevD: P('m6 9 6 6 6-6'),
  arrowR: P('M5 12h14M12 5l7 7-7 7'),
  arrowL: P('M19 12H5M12 19l-7-7 7-7'),
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" />{P('m22 7-10 6L2 7')}</>,
  shield: P('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'),
  trend: <>{P('M22 7 13.5 15.5l-5-5L2 17')}{P('M16 7h6v6')}</>,
  eye: <>{P('M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z')}<circle cx="12" cy="12" r="3" /></>,
  eyeOff: <>{P('M17.94 17.94A10.1 10.1 0 0 1 12 19c-6.4 0-10-7-10-7a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.1 9.1 0 0 1 12 4c6.4 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22')}</>,
  upload: <>{P('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4')}{P('m17 8-5-5-5 5')}{P('M12 3v12')}</>,
  trash: <>{P('M3 6h18')}{P('M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6')}{P('M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2')}</>,
  edit: <>{P('M12 20h9')}{P('M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z')}</>,
  globe: <><circle cx="12" cy="12" r="10" />{P('M2 12h20')}{P('M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z')}</>,
  home: P('M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z'),
  filter: P('M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6'),
  send: <>{P('m22 2-7 20-4-9-9-4z')}{P('M22 2 11 13')}</>,
  award: <><circle cx="12" cy="8" r="6" />{P('M15.5 13.9 17 22l-5-3-5 3 1.5-8.1')}</>,
  xCircle: <><circle cx="12" cy="12" r="10" />{P('m15 9-6 6M9 9l6 6')}</>,
  layers: <>{P('m12 2 10 5-10 5L2 7z')}{P('m2 17 10 5 10-5')}{P('m2 12 10 5 10-5')}</>,
  laptop: <><rect x="3" y="4" width="18" height="12" rx="2" />{P('M2 20h20')}</>,
  star: P('m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.3-6.2 3.3L7 14.2 2 9.3l6.9-1z'),
  bookmark: P('m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z'),
  ban: <><circle cx="12" cy="12" r="10" />{P('m4.9 4.9 14.2 14.2')}</>,
  zap: P('M13 2 3 14h9l-1 8 10-12h-9z'),
  external: <>{P('M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6')}{P('M15 3h6v6')}{P('M10 14 21 3')}</>,
}

/** Small inline SVG icon set (stroke icons, no extra dependency). */
export function hasIcon(name) {
  return Object.prototype.hasOwnProperty.call(ICONS, name)
}

export default function Icon({ name, size = 18, className = '', strokeWidth = 2 }) {
  if (!hasIcon(name)) return null
  return (
    <svg
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  )
}