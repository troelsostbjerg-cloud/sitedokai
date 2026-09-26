#!/usr/bin/env node
// Optager "Rejsen gennem universet" som video, ét billede ad gangen.
//
// En browser uden GPU tegner kun 3-10 billeder i sekundet, så en almindelig
// skærmoptagelse hakker. Scriptet fryser i stedet sidens ur (Playwright clock),
// flytter tiden præcis 1/fps sekund frem, tegner ét billede og tager et
// skærmbillede. CSS-overgange følger samme ur. Videoen bliver flydende og ens fra
// gang til gang, uanset hvor langsom maskinen er.
//
// Kræver Node 22+, Playwright med Chromium og ffmpeg med libx264 (se lab/univers/VIDEO.md).
//
//   node lab/univers/tools/capture.mjs --list       vis storyboardet
//   node lab/univers/tools/capture.mjs --preview    hurtig prøve i 960x540 og 15 fps
//   node lab/univers/tools/capture.mjs              1920x1080, 30 fps → lab/univers/video/univers.mp4
//
// Valg:
//   --size BxH    1920x1080 (standard), 3840x2160 eller 1080x1920 (lodret, sitets mobil-layout)
//   --fps N       billeder i sekundet (standard 30)
//   --ui MODE     full = som på sitet (standard), clean = uden panel og topbar, none = kun 3D
//   --shots a,b   kun disse shots (id fra --list), i storyboardets rækkefølge
//   --out STI     .mp4-fil, eller en mappe der ender på / for at gemme PNG-billeder
//   --date ISO    tidspunktet siden skal tro, det er. Styrer planeter, dag og nat. Standard: i dag kl. 08:00 UTC,
//                så Europa ligger i morgensol og Amerikas byer lyser på natsiden i åbningen
//   --url URL     optag en kørende side i stedet for at starte server.mjs
//   --gpu         brug maskinens GPU i stedet for SwiftShader (hurtigere på en maskine med skærmkort)
//   --crf N       x264-kvalitet, lavere er bedre (standard 16)
//   --preview     960x540 og 15 fps
//
// Ud over videoen skrives <navn>.srt (titel på hvert trin) og <navn>.shots.json
// (tidskoder, kapitel, titel og brødtekst til klip, speak eller undertekster).
import { spawn, spawnSync, execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..', '..');
const children = []; // server og ffmpeg, som stoppes, hvis optagelsen fejler
process.on('SIGINT', () => fail('afbrudt'));
process.on('unhandledRejection', (e) => fail(e && e.stack ? e.stack : String(e)));

// ---------- Storyboard ----------
// go: [kapitel, trin] som i window.__univers.go (0-baseret). Kaldes LEAD sekunder før
// shottet starter, så overtoningen mellem to verdener er sort præcis på klippet.
// cues: [sekunder efter shottets start, kode]. Koden kører i siden med adgang til
// u (window.__univers), W (verdenerne), go, speed (tidsfaktor), click (knap efter tekst)
// og slider (sæt en skyder). speed nulstilles til 1 ved hvert nyt shot.
const LEAD = 0.45;
const SHOTS = [
  { id: 'intro', sec: 7, note: 'Titelskærm. Jorden og Solen, som de står på optagedatoen.' },
  { id: 'sol-kraft', sec: 6, go: [0, 0], note: 'Solen og Jorden. Solen omdanner 4 mio. tons stof til energi i sekundet.' },
  { id: 'sol-foton', sec: 10, go: [0, 1], note: 'Snit gennem Solen. En foton er 170.000 år om at slippe ud.' },
  { id: 'sol-energi', sec: 7, go: [0, 2], note: 'Energistrømmen fra Solen til Jorden.' },
  { id: 'sol-drivhus', sec: 7, go: [0, 3], note: 'Drivhuseffekt, magnetfelt og nordlys.' },
  { id: 'planeter-nu', sec: 7, go: [1, 0], cues: [[1.2, "slider('#timeRate', 62)"]], note: 'Planeterne, som de står i dag. Tiden sættes op til ca. 40 døgn i sekundet.' },
  { id: 'planeter-tyngde', sec: 6, go: [1, 1], note: 'Rumtiden krummer om Solen.' },
  { id: 'planeter-spiral', sec: 7, go: [1, 2], note: 'Planeterne tegner spiraler gennem galaksen.' },
  { id: 'tomhed-skala', sec: 7, go: [2, 0], note: 'Solsystemet i ægte skala. Planeterne forsvinder.' },
  { id: 'tomhed-lys', sec: 9, go: [2, 1], cues: [[0, 'speed(2.5)']], note: 'En lysstråle forlader Solen (× 500, her yderligere × 2,5).' },
  { id: 'tomhed-atom', sec: 10, go: [2, 2], cues: [[1.6, 'W.atom.setZoom(4.6, 7)']], note: 'Et brintatom. Zoom 40.000 gange ind til kernen.' },
  { id: 'stjerner-foedsel', sec: 10, go: [3, 0], note: 'En gassky falder sammen, og en stjerne tænder.' },
  { id: 'stjerner-doed', sec: 23.5, go: [3, 2], cues: [[-LEAD, 'W.stars.setMass(30)'], [0, 'speed(2)'], [9.2, 'speed(1)']], note: 'En stjerne på 30 solmasser: superkæmpe, løgskaller, kernekollaps, supernova og sort hul. De rolige faser kører dobbelt hurtigt.' },
  { id: 'stjerner-stoev', sec: 6, go: [3, 3], note: 'Grundstofferne i din krop blev skabt i stjerner.' },
  {
    id: 'dybde', sec: 36, go: [4, 0],
    cues: Array.from({ length: 10 }, (_, i) => [3.2 + i * 3, `go(4, ${i + 1})`]),
    note: 'Én logaritmisk zoom fra Jorden til det observerbare univers: 10⁷ til 10²⁷ meter i 11 stop.',
  },
  { id: 'uendelig-kant', sec: 7, go: [5, 1], note: 'Uden kant og uden centrum. Hver boble er en observatørs horisont.' },
  { id: 'uendelig-zoom', sec: 9, go: [5, 2], note: 'Uendelig zoom ud. Den nærmeste kopi af dig er 10^(10^28) m væk.' },
  { id: 'asi-kardashev', sec: 5, go: [6, 0], note: 'Kardashev-skalaen. Menneskeheden er type 0,73.' },
  { id: 'asi-dyson', sec: 11, go: [6, 1], cues: [[0, 'speed(1.6)']], note: 'En Dyson-sværm vokser eksponentielt rundt om Solen.' },
  { id: 'asi-hjerne', sec: 6, go: [6, 2], note: 'Matrjosjka-hjernen: computere drevet af hele Solens energi.' },
  { id: 'asi-sonder', sec: 10, go: [6, 3], cues: [[0, 'speed(1.7)']], note: 'Selvkopierende sonder breder sig gennem Mælkevejen.' },
  { id: 'asi-raekkevidde', sec: 6, go: [6, 4], note: 'Lyset bestemmer tempoet. 94 % af galakserne kan aldrig nås.' },
  { id: 'hjem', sec: 15, go: [7, 0], cues: [[13.8, 'fadeOut(1)']], note: 'Den blå prik. Jorden trækker sig tilbage til 0,12 pixel. Toner ud til sort.' },
];

// UI-varianter. clean skjuler panel, topbar og skala-skinne, men beholder navne på
// kloderne og målerne (HUD). none viser kun 3D-scenen.
const UI_CSS = `
.cap-fade { position: fixed; inset: 0; z-index: 99; background: #000; opacity: 0; pointer-events: none; }
body.cap-clean .topbar, body.cap-clean #panel, body.cap-clean #rail, body.cap-clean #backBtn, body.cap-clean #infoCard,
body.cap-none .topbar, body.cap-none #panel, body.cap-none #rail, body.cap-none #backBtn, body.cap-none #infoCard,
body.cap-none #labels, body.cap-none #hud, body.cap-none #intro { visibility: hidden !important; }
`;

// ---------- Valg ----------
const opt = { size: '1920x1080', fps: '30', ui: 'full', out: null, date: null, url: null, crf: '16', shots: null, gpu: false, list: false, preview: false, help: false };
const FLAGS = new Set(['gpu', 'list', 'preview', 'help']);
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const k = argv[i].replace(/^--/, '');
  if (!(k in opt) || !argv[i].startsWith('--')) fail(`Ukendt valg: ${argv[i]} (se --help)`);
  if (FLAGS.has(k)) opt[k] = true;
  else if (i + 1 < argv.length) opt[k] = argv[++i];
  else fail(`--${k} mangler en værdi`);
}
if (opt.help) {
  const lines = readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1);
  console.log(lines.slice(0, lines.findIndex((l) => !l.startsWith('//'))).map((l) => l.slice(3)).join('\n'));
  process.exit(0);
}
if (opt.preview) {
  if (!argv.includes('--size')) opt.size = '960x540';
  if (!argv.includes('--fps')) opt.fps = '15';
}
const fps = Number(opt.fps);
const crf = Number(opt.crf);
const [outW, outH] = opt.size.split('x').map(Number);
if (!(fps > 0 && fps <= 120)) fail('--fps skal være mellem 1 og 120');
if (!(outW > 0 && outH > 0) || outW % 2 || outH % 2) fail('--size skal være BxH med lige tal, fx 1920x1080');
if (!['full', 'clean', 'none'].includes(opt.ui)) fail('--ui skal være full, clean eller none');

let shots = SHOTS;
if (opt.shots) {
  const want = opt.shots.split(',').map((s) => s.trim()).filter(Boolean);
  for (const id of want) if (!SHOTS.some((s) => s.id === id)) fail(`Ukendt shot: ${id} (se --list)`);
  shots = SHOTS.filter((s) => want.includes(s.id));
}
const timeline = [];
{
  let t = 0;
  for (const s of shots) { timeline.push({ ...s, start: t, end: t + s.sec }); t += s.sec; }
}
const total = timeline.length ? timeline.at(-1).end : 0;

if (opt.list) {
  for (const s of timeline) console.log(`${tc(s.start)}  ${s.id.padEnd(18)} ${String(s.sec).padStart(4)} s  ${s.note || ''}`);
  console.log(`${tc(total)}  i alt ${(total / 60).toFixed(1)} min · ${Math.round(total * fps)} billeder ved ${fps} fps`);
  process.exit(0);
}

// Layoutet følger sitet: vandret video bruger et 1920 px bredt vindue (desktop), lodret
// et 540 px bredt (mobil). Opløsningen kommer fra deviceScaleFactor.
const portrait = outH > outW;
const vw = portrait ? 540 : 1920;
const dsf = outW / vw;
const vh = Math.round(outH / dsf);

const today = new Date();
const date = opt.date ? new Date(opt.date) : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 8, 0));
if (Number.isNaN(+date)) fail(`Ugyldig --date: ${opt.date}`);

const toFrames = opt.out ? opt.out.endsWith('/') : false;
const outPath = resolve(opt.out || join(root, 'lab/univers/video/univers.mp4'));
const base = toFrames ? join(outPath, 'univers') : outPath.replace(/\.mp4$/i, '');

// ---------- Værktøjer ----------
const { chromium } = await loadPlaywright();
const ffmpeg = toFrames ? null : findFfmpeg();

let server = null;
let url = opt.url;
if (!url) {
  const html = join(root, 'dist/univers/index.html');
  const app = join(root, 'src/univers/app.js');
  if (!existsSync(html) || statSync(app).mtimeMs > statSync(html).mtimeMs) {
    console.log('Bygger sitet (npm run build) …');
    const b = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
    if (b.status !== 0) fail('npm run build fejlede');
  }
  const port = await freePort();
  server = spawn(process.execPath, ['server.mjs'], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'ignore', 'inherit'] });
  children.push(server);
  url = `http://127.0.0.1:${port}/univers/`;
  await waitForServer(url);
}

console.log(`Optager ${timeline.length} shots · ${tc(total)} · ${outW}x${outH} @ ${fps} fps · ui=${opt.ui} · ${date.toISOString()}`);
console.log(`Side: ${url}`);

const browser = await chromium.launch({
  args: opt.gpu ? ['--ignore-gpu-blocklist'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({
  viewport: { width: vw, height: vh },
  deviceScaleFactor: dsf,
  bypassCSP: true,
  locale: 'da-DK',
  timezoneId: 'Europe/Copenhagen',
  colorScheme: 'dark',
  reducedMotion: 'no-preference',
});
await context.clock.install({ time: date });
await context.clock.pauseAt(date);
await context.addInitScript(pageHelpers, { seed: 1977 });
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
page.on('pageerror', (e) => console.error(`[side] ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') console.error(`[side] ${m.text()}`); });

await page.goto(url, { waitUntil: 'load' });
await waitFor(() => page.evaluate(() => !!window.__universeReady || !!document.querySelector('.loading-err')), 60000, 'siden blev ikke klar');
const err = await page.evaluate(() => document.querySelector('.loading-err')?.textContent);
if (err) fail(`Siden kunne ikke starte: ${err}`);
await page.evaluate(() => document.fonts.ready.then(() => true));
await page.evaluate(() => { window.__univers.fps().frames = -Infinity; }); // ingen automatisk nedskalering
await page.addStyleTag({ content: UI_CSS });
if (opt.ui !== 'full') await page.evaluate((m) => document.body.classList.add('cap-' + m, 'collapsed'), opt.ui);

// ---------- Tidslinje ----------
const cues = [];
for (const s of timeline) {
  const list = [[-LEAD, 'speed(1)']];
  if (s.go) list.push([-LEAD, `go(${s.go[0]}, ${s.go[1]})`]);
  for (const c of s.cues || []) list.push(c);
  list.sort((a, b) => a[0] - b[0]);
  // Første shot starter ikke før 0, så videoen åbner med sidens egen indtoning.
  for (const [dt, code] of list) cues.push({ t: s === timeline[0] ? Math.max(0, s.start + dt) : s.start + dt, code, shot: s });
}
cues.sort((a, b) => a.t - b.t);

// Starter optagelsen et andet sted end ved introen, lukkes introen først.
if (timeline.length && timeline[0].id !== 'intro') {
  await page.evaluate(() => window.__cap.start());
  await advance(Math.round(1.2 * fps));
}

const sink = toFrames ? frameSink(outPath) : videoSink(ffmpeg, outPath);
const titles = [];
if (timeline[0]?.id === 'intro') titles.push({ t: 0, title: 'Rejsen gennem universet', chapter: '', lead: await page.evaluate(() => document.querySelector('.intro-sub')?.textContent || '') });

const totalFrames = Math.round(total * fps);
const firstFrame = Math.min(0, Math.floor((cues[0]?.t ?? 0) * fps));
let ci = 0;
let lastMs = 0;
const t0 = Date.now();
let lastLog = 0;
for (let f = firstFrame; f < totalFrames; f++) {
  const v = f / fps;
  while (ci < cues.length && cues[ci].t <= v + 1e-6) {
    const c = cues[ci++];
    const got = await page.evaluate((code) => window.__cap.run(code), c.code);
    for (const g of got) titles.push({ t: Math.max(c.shot.start, c.t), ...g });
  }
  const ms = Math.round((f - firstFrame + 1) * 1000 / fps);
  await page.clock.runFor(ms - lastMs);
  lastMs = ms;
  await page.evaluate(() => window.__cap.frame());
  if (f < 0) continue;
  // Tabsfri PNG med hurtig komprimering. Det er lige så hurtigt som JPEG.
  const png = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true, clip: { x: 0, y: 0, width: vw, height: vh, scale: dsf } });
  await sink.write(Buffer.from(png.data, 'base64'));
  const now = Date.now();
  if (now - lastLog > 5000 || f === totalFrames - 1) {
    lastLog = now;
    const done = f + 1;
    const per = (now - t0) / 1000 / (done - firstFrame);
    const shot = timeline.find((s) => v >= s.start && v < s.end) || timeline.at(-1);
    console.log(`${tc(v)} / ${tc(total)}  ${shot.id.padEnd(18)} ${per.toFixed(2)} s/billede · ca. ${Math.ceil(((totalFrames - done) * per) / 60)} min tilbage`);
  }
}
await sink.close();
await browser.close();
if (server) server.kill();

// ---------- Undertekster og tidskoder ----------
titles.sort((a, b) => a.t - b.t);
const entries = titles.map((x, i) => ({ ...x, end: Math.min(titles[i + 1]?.t ?? total, total) })).filter((x) => x.end - x.t > 0.2);
writeFileSync(`${base}.srt`, entries.map((x, i) => `${i + 1}\n${srtTime(x.t)} --> ${srtTime(x.end)}\n${x.title}\n`).join('\n'));
writeFileSync(`${base}.shots.json`, JSON.stringify({
  size: `${outW}x${outH}`, fps, ui: opt.ui, date: date.toISOString(), duration: total,
  shots: timeline.map((s) => ({ id: s.id, start: s.start, end: s.end, note: s.note })),
  titles: entries.map((x) => ({ start: +x.t.toFixed(3), end: +x.end.toFixed(3), chapter: x.chapter, title: x.title, lead: x.lead })),
}, null, 2) + '\n');
const took = (Date.now() - t0) / 60000;
console.log(`Færdig på ${took.toFixed(1)} min: ${toFrames ? outPath + '/' : outPath}`);
console.log(`Titler: ${base}.srt · tidskoder: ${base}.shots.json`);

// ============================================================

// Kører i siden før dens egne scripts, men efter Playwrights ur.
function pageHelpers({ seed }) {
  // Samme tilfældige tal hver gang (stjernefelter, partikler).
  let s = seed >>> 0;
  Math.random = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // requestAnimationFrame køres kun, når optageren beder om et billede.
  let queue = [];
  let id = 0;
  window.requestAnimationFrame = (cb) => { queue.push([++id, cb]); return id; };
  window.cancelAnimationFrame = (n) => { queue = queue.filter(([k]) => k !== n); };
  const started = new WeakMap();
  const log = [];
  const strip = (html) => String(html ?? '')
    .replace(/<sup>(.*?)<\/sup>/g, (_, x) => '^' + (x.length > 1 ? `(${x})` : x))
    .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const helpers = {
    go(ch, b) {
      const u = window.__univers;
      if (document.body.classList.contains('intro-on')) document.getElementById('startBtn').click();
      u.go(ch, b);
      const C = u.CHAPTERS[ch], B = C.beats[b];
      const val = (x) => (typeof x === 'function' ? x() : x);
      log.push({ ch, b, chapter: C.name, title: strip(val(B.title)), lead: strip(val(B.lead)) });
    },
    speed(k) { window.__univers.setTimeScale(k); },
    click(text) {
      const els = [...document.querySelectorAll('button, a')];
      const el = els.find((e) => e.textContent.trim() === text) || els.find((e) => e.textContent.includes(text));
      if (!el) throw new Error('Fandt ingen knap med teksten: ' + text);
      el.click();
    },
    slider(sel, value) {
      const el = document.querySelector(sel);
      if (!el) throw new Error('Fandt ingen skyder: ' + sel);
      el.value = String(value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    fadeOut(sec) {
      const d = document.createElement('div');
      d.className = 'cap-fade';
      document.body.appendChild(d);
      d.style.transition = `opacity ${sec}s ease`;
      d.getBoundingClientRect();
      d.style.opacity = '1';
    },
  };
  window.__cap = {
    start() { document.getElementById('startBtn').click(); },
    run(code) {
      const u = window.__univers;
      new Function('u', 'W', 'go', 'speed', 'click', 'slider', 'fadeOut', code)(u, u.W, helpers.go, helpers.speed, helpers.click, helpers.slider, helpers.fadeOut);
      return log.splice(0);
    },
    // Ét billede: kør ventende animationsrammer og stil CSS-overgange efter sidens ur.
    frame() {
      const now = performance.now();
      const run = queue;
      queue = [];
      for (const [, cb] of run) {
        try { cb(now); } catch (e) { console.error(e && e.stack ? e.stack : e); }
      }
      for (const a of document.getAnimations()) {
        if (!started.has(a)) { started.set(a, now); a.pause(); }
        a.currentTime = now - started.get(a);
      }
    },
  };
}

function tc(sec) {
  const m = Math.floor(sec / 60), s = sec - m * 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
}
function srtTime(sec) {
  const ms = Math.round(sec * 1000);
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
}
function fail(msg) {
  for (const c of children) { try { c.kill('SIGKILL'); } catch { /* allerede stoppet */ } }
  console.error(`capture: ${msg}`);
  process.exit(1);
}
async function loadPlaywright() {
  for (const name of ['playwright', 'playwright-core', '@playwright/test']) {
    try { const m = await import(name); if (m.chromium || m.default?.chromium) return m.chromium ? m : m.default; } catch { /* prøv næste */ }
  }
  try {
    const g = execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    for (const name of ['playwright', 'playwright-core']) {
      const p = join(g, name, 'index.mjs');
      if (existsSync(p)) { const m = await import(pathToFileURL(p).href); return m.chromium ? m : m.default; }
    }
  } catch { /* ingen global installation */ }
  fail('Playwright mangler. Installér det med: npm i --no-save playwright && npx playwright install chromium');
}
function findFfmpeg() {
  const candidates = [process.env.FFMPEG, 'ffmpeg'].filter(Boolean);
  const py = spawnSync('python3', ['-c', 'import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())'], { encoding: 'utf8' });
  if (py.status === 0 && py.stdout.trim()) candidates.push(py.stdout.trim());
  for (const c of candidates) {
    const r = spawnSync(c, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
    if (r.status === 0 && r.stdout.includes('libx264')) return c;
  }
  fail('Fandt ingen ffmpeg med libx264. Installér den (brew install ffmpeg · apt-get install ffmpeg · pip install imageio-ffmpeg), sæt FFMPEG=/sti/til/ffmpeg, eller gem PNG-billeder med --out mappe/');
}
function videoSink(bin, file) {
  mkdirSync(dirname(file), { recursive: true });
  const ff = spawn(bin, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  children.push(ff);
  const closed = new Promise((res) => ff.on('close', res));
  return {
    write: (buf) => (ff.stdin.write(buf) ? Promise.resolve() : new Promise((res) => ff.stdin.once('drain', res))),
    close: async () => { ff.stdin.end(); const code = await closed; if (code !== 0) fail(`ffmpeg stoppede med kode ${code}`); },
  };
}
function frameSink(dir) {
  mkdirSync(dir, { recursive: true });
  let n = 0;
  return {
    write: async (buf) => writeFileSync(join(dir, `${String(n++).padStart(5, '0')}.png`), buf),
    close: async () => console.log(`Lav video: ffmpeg -framerate ${fps} -i ${join(dir, '%05d.png')} -c:v libx264 -preset slow -crf ${crf} -pix_fmt yuv420p univers.mp4`),
  };
}
async function advance(frames) {
  for (let i = 0; i < frames; i++) {
    await page.clock.runFor(Math.round(1000 / fps));
    await page.evaluate(() => window.__cap.frame());
  }
}
async function waitFor(fn, ms, what) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    if (await fn()) return;
    await new Promise((r) => setTimeout(r, 200));
  }
  fail(`Timeout: ${what}`);
}
async function waitForServer(u) {
  await waitFor(async () => { try { return (await fetch(u)).ok; } catch { return false; } }, 20000, `serveren svarede ikke på ${u}`);
}
function freePort() {
  return new Promise((res, rej) => {
    const s = createServer();
    s.once('error', rej);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)); });
  });
}
