const legacyRoutes = {
  '/about': '/om/',
  '/privacy-policy': '/privacy/',
  '/privatlivspolitik': '/privacy/',
  '/contact': '/kontakt/',
  '/cases': '/#arbejdseksempel',
  '/hire': '/kontakt/',
  '/hire-troels': '/kontakt/',
  '/troels': '/om/',
  '/method': '/#metode',
  '/submit': '/kontakt/',
  '/priser': '/#ydelser',
  '/pricing': '/#ydelser',
  '/gratis-mini-tjek': '/#ydelser',
  '/gratis-rapport': '/#ydelser',
  '/hjemmeside-tjek': '/',
  '/hjemmeside-fix': '/',
  '/manual-work-audit': '/#ydelser',
  '/ai-readiness': '/#ydelser',
  '/ai-klar': '/#ydelser',
  '/ai-workflow-sprint': '/#ydelser',
  '/ai-operations-partner': '/#ydelser',
  '/visuelt-loeft': '/',
  '/eksempel': '/#arbejdseksempel',
  '/use-cases': '/#arbejdseksempel',
  '/workflow-examples': '/#arbejdseksempel',
  '/studio': '/',
  '/blog': '/',
};

const timelineRedirects = Object.fromEntries(
  [
    '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
    '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
    '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06',
    '2026-07',
  ].map((month) => [`/maaned/${month}`, '/']),
);

export const siteRedirects = Object.freeze({ ...legacyRoutes, ...timelineRedirects });

export function redirectTargetForPath(pathname) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return siteRedirects[normalizedPath]
    ?? (/^\/maaned\/\d{4}-\d{2}$/.test(normalizedPath) ? '/' : undefined);
}
