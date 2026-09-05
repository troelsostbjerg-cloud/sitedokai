import type { APIRoute } from 'astro';

const BASE = 'https://sitedokai.com';
const LAST_MODIFIED = '2026-09-05';

export const GET: APIRoute = () => {
  const pages = [
    { path: '/', priority: '1.0' },
    { path: '/om/', priority: '0.8' },
    { path: '/kontakt/', priority: '0.8' },
    { path: '/privacy/', priority: '0.3' },
  ];

  const urls = pages
    .map(
      ({ path, priority }) =>
        `  <url><loc>${BASE}${path}</loc><lastmod>${LAST_MODIFIED}</lastmod><priority>${priority}</priority></url>`,
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    { headers: { 'content-type': 'application/xml; charset=utf-8' } },
  );
};
