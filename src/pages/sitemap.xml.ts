import type { APIRoute } from 'astro';
import { months } from '../data/timeline';

const BASE = 'https://sitedokai.com';

export const GET: APIRoute = () => {
  const staticPaths = ['/', '/om', '/privacy'];
  const monthPaths = months.map((m) => `/maaned/${m.id}`);
  const all = [...staticPaths, ...monthPaths];

  const urls = all
    .map(
      (p) =>
        `  <url><loc>${BASE}${p}</loc><changefreq>${
          p === '/' ? 'weekly' : 'monthly'
        }</changefreq></url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
