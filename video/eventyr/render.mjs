// Renders scene.html frame by frame in headless Chromium and pipes the frames to ffmpeg.
//
//   node render.mjs                         -> eventyr.mp4 (1920x1080, 30 fps, 5 s)
//   node render.mjs --stills 0,1.5,3,4.9    -> stills/t-<time>.png for quick review
//   node render.mjs --fps 60 --w 1280 --h 720 --out preview.mp4
//
// Needs Playwright (global install is fine) and an ffmpeg binary (FFMPEG env var or on PATH).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch {
  ({ chromium } = require(path.join(process.env.NODE_PATH || '/opt/node22/lib/node_modules', 'playwright')));
}

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => {
  if (a.startsWith('--')) acc.push([a.slice(2), all[i + 1] && !all[i + 1].startsWith('--') ? all[i + 1] : true]);
  return acc;
}, []));
const W = +(args.w || 1920), H = +(args.h || 1080), FPS = +(args.fps || 30);
const OUT = path.resolve(here, args.out || 'eventyr.mp4');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(here, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(here) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/scene.html?capture=1&w=${W}&h=${H}`;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
page.on('pageerror', (e) => console.log('[page error]', e.message));
await page.goto(url);
await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });

const grab = async (t) => {
  const b64 = await page.evaluate((tt) => { window.renderAt(tt); return document.querySelector('canvas').toDataURL('image/png').split(',')[1]; }, t);
  return Buffer.from(b64, 'base64');
};

if (args.stills) {
  const dir = path.join(here, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const t of String(args.stills).split(',').map(Number)) {
    const t0 = Date.now();
    fs.writeFileSync(path.join(dir, `t-${t.toFixed(2)}.png`), await grab(t));
    console.log(`still t=${t} (${Date.now() - t0} ms)`);
  }
} else {
  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.round(duration * FPS);
  const ff = spawn(FFMPEG, [
    '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error('ffmpeg exit ' + c)))));
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const buf = await grab(i / FPS);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % 10 === 0) console.log(`frame ${i + 1}/${frames}  ${((Date.now() - t0) / (i + 1)).toFixed(0)} ms/frame`);
  }
  ff.stdin.end();
  await done;
  console.log('wrote', OUT);
}

await browser.close();
server.close();
