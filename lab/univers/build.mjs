// Samler src/ til én selvstændig HTML-fil (index.html).
// Med et ekstra argument skrives også artifact-fragmentet (uden <html>/<head>/<body>).
//   node lab/univers/build.mjs [sti/til/fragment.html]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, 'src');
const read = (f) => readFileSync(join(src, f), 'utf8');

const js = readdirSync(src)
  .filter((f) => /^\d\d-.*\.js$/.test(f))
  .sort()
  .map((f) => `// ---- ${f} ----\n${read(f)}`)
  .join('\n');
const html = read('page.html')
  .replace('/*STYLE*/', () => read('style.css'))
  .replace('/*SCRIPT*/', () => js);

writeFileSync(join(here, 'index.html'), html);
console.log(`index.html: ${(html.length / 1024).toFixed(0)} KB`);

if (process.argv[2]) {
  const m = html.match(/<!-- artifact:start -->\n([\s\S]*?)<!-- artifact:end -->/);
  if (!m) throw new Error('Mangler artifact-markører i page.html');
  writeFileSync(process.argv[2], m[1]);
  console.log(`fragment: ${process.argv[2]}`);
}
