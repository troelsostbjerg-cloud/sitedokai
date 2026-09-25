// Samler lab/univers/src/ til:
//   lab/univers/index.html      selvstændig side (three.js fra jsDelivr, skrifttyper fra Google Fonts)
//   src/pages/univers.astro     sitets side på sitedokai.com/univers/ (genereret)
//   src/univers/app.js          ES-modul, som Astro/Vite bundter med three.js fra npm (genereret)
//   src/univers/univers.css     stilark med lokale skrifttyper fra public/fonts/ (genereret)
//
//   node lab/univers/build.mjs                 byg alt
//   node lab/univers/build.mjs --check         fejl, hvis de genererede filer ikke matcher kilden
//   node lab/univers/build.mjs <fragment.html> skriv også et artifact-fragment uden <html>/<head>/<body>
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const src = join(here, 'src');
const read = (f) => readFileSync(join(src, f), 'utf8');
const args = process.argv.slice(2);
const check = args.includes('--check');
const fragmentPath = args.find((a) => !a.startsWith('--'));

const GENERATED = 'GENERERET af lab/univers/build.mjs. Ret i lab/univers/src/ og kør `node lab/univers/build.mjs`.';
const js = readdirSync(src)
  .filter((f) => /^\d\d-.*\.js$/.test(f))
  .sort()
  .map((f) => `// ---- ${f} ----\n${read(f)}`)
  .join('\n');
const css = read('style.css');
const page = read('page.html');
const block = page.match(/<!-- artifact:start -->\n([\s\S]*?)<!-- artifact:end -->/);
if (!block) throw new Error('Mangler artifact-markører i page.html');

// ---------- Selvstændig side og artifact-fragment ----------
const standalone = page
  .replace(/\n[ \t]*<!--site:credit-->/, '')
  .replace('/*STYLE*/', () => css)
  .replace('/*SCRIPT*/', () => js);

// ---------- sitedokai.com/univers/ ----------
const FONT_FACES = `/* Lokale skrifttyper (SIL Open Font License, se OFL.txt i hver mappe under public/fonts). */
@font-face { font-family: "Bodoni Moda"; font-style: normal; font-weight: 400 900; font-display: swap; src: url("/fonts/bodoni-moda/bodoni-moda-latin-wght-normal.woff2") format("woff2"); }
@font-face { font-family: "Bodoni Moda"; font-style: italic; font-weight: 400 900; font-display: swap; src: url("/fonts/bodoni-moda/bodoni-moda-latin-wght-italic.woff2") format("woff2"); }
@font-face { font-family: "Atkinson Hyperlegible Next"; font-style: normal; font-weight: 200 800; font-display: swap; src: url("/fonts/atkinson-hyperlegible-next/atkinson-hyperlegible-next-latin-wght-normal.woff2") format("woff2"); }
@font-face { font-family: "Martian Mono"; font-style: normal; font-weight: 100 800; font-display: swap; src: url("/fonts/martian-mono/martian-mono-latin-wght-normal.woff2") format("woff2"); }
`;
const siteCss = `/* ${GENERATED} */\n${FONT_FACES}\n${css}`;
const siteJs = `// ${GENERATED}\n${js}`;

const markup = block[1]
  .replace(/<title>[\s\S]*?<\/title>\n/, '')
  .replace(/<link rel="preconnect"[^>]*>\n/g, '')
  .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\n/, '')
  .replace(/<style>\n\/\*STYLE\*\/\n<\/style>\n/, '')
  .replace(/<script type="importmap">[\s\S]*?<\/script>\n/, '')
  .replace(/<script type="module">\n\/\*SCRIPT\*\/\n<\/script>\n/, '')
  .replace('<!--site:credit-->', '<p class="intro-credit">Et lab fra <a href="/">SiteDokAI</a> · Troels Østbjerg</p>')
  .replace('<script>\n/* Viser en fejl', '<script is:inline>\n/* Viser en fejl')
  .replace(/^/gm, '    ')
  .replace(/^\s+$/gm, '');
for (const needle of ['googleapis', 'jsdelivr', '/*STYLE*/', '/*SCRIPT*/', 'importmap']) {
  if (markup.includes(needle)) throw new Error(`Site-markup indeholder stadig "${needle}"`);
}
const DESCRIPTION = 'En interaktiv 3D-rejse fra sollyset på Jorden til kanten af det synlige univers. Med stjernernes liv og død, uendeligheden og det, en superintelligens kunne nå inden for kendt fysik. Et lab fra SiteDokAI.';
const astro = `---
// ${GENERATED}
import '../univers/univers.css';

const url = 'https://sitedokai.com/univers/';
const title = 'Rejsen gennem universet | SiteDokAI';
const description = ${JSON.stringify(DESCRIPTION)};
const image = 'https://sitedokai.com/og-univers.jpg';
---

<!doctype html>
<html lang="da">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="description" content={description} />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#03050b" />
    <meta name="author" content="Troels Østbjerg" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="SiteDokAI" />
    <meta property="og:locale" content="da_DK" />
    <meta property="og:title" content="Rejsen gennem universet" />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={url} />
    <meta property="og:image" content={image} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Jorden set fra rummet med nordlys og titlen Rejsen gennem universet" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Rejsen gennem universet" />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
    <link rel="canonical" href={url} />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=20260905" />
    <link rel="preload" href="/fonts/bodoni-moda/bodoni-moda-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/atkinson-hyperlegible-next/atkinson-hyperlegible-next-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
    <title>{title}</title>
  </head>
  <body data-site="sitedokai">
${markup.trimEnd()}
    <script>
      import '../univers/app.js';
    </script>
  </body>
</html>
`;

// ---------- Skriv eller kontrollér ----------
const outputs = [
  [join(here, 'index.html'), standalone],
  [join(root, 'src', 'pages', 'univers.astro'), astro],
  [join(root, 'src', 'univers', 'app.js'), siteJs],
  [join(root, 'src', 'univers', 'univers.css'), siteCss],
];
let stale = 0;
for (const [file, content] of outputs) {
  const rel = relative(root, file);
  if (check) {
    const current = existsSync(file) ? readFileSync(file, 'utf8') : null;
    if (current !== content) { stale++; console.error(`Forældet: ${rel}`); }
    continue;
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
  console.log(`${rel}: ${(content.length / 1024).toFixed(0)} KB`);
}
if (check) {
  if (stale) { console.error('Kør: node lab/univers/build.mjs'); process.exit(1); }
  console.log('Genererede filer er opdaterede.');
}
if (fragmentPath && !check) {
  const m = standalone.match(/<!-- artifact:start -->\n([\s\S]*?)<!-- artifact:end -->/);
  writeFileSync(fragmentPath, m[1]);
  console.log(`fragment: ${fragmentPath}`);
}
