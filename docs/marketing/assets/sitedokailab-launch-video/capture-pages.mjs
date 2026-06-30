import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = __dirname;
const baseUrl = process.env.SITEDOK_VIDEO_BASE_URL || 'http://127.0.0.1:4322';
const chromePath =
  process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const port = Number(process.env.SITEDOK_VIDEO_CDP_PORT || 9347);
const profileDir = path.join(os.tmpdir(), `sitedok-video-chrome-${Date.now()}`);

if (!existsSync(chromePath)) {
  throw new Error(`Chrome not found at ${chromePath}. Set CHROME_BIN to override.`);
}

await mkdir(outDir, { recursive: true });

const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profileDir}`,
    '--window-size=1440,900',
    '--hide-scrollbars',
    '--disable-gpu',
    '--disable-background-networking',
    '--no-first-run',
    'about:blank',
  ],
  { stdio: ['ignore', 'pipe', 'pipe'] },
);

chrome.stderr.on('data', () => {});
chrome.stdout.on('data', () => {});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} from ${url}`);
  }
  return response.json();
}

async function waitForCdp() {
  const started = Date.now();
  while (Date.now() - started < 10000) {
    try {
      const tabs = await fetchJson(`http://127.0.0.1:${port}/json`);
      const page = tabs.find((target) => target.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(150);
  }
  throw new Error('Timed out waiting for Chrome DevTools Protocol.');
}

function createClient(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const eventWaiters = new Map();

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result || {});
      return;
    }
    const waiters = eventWaiters.get(message.method);
    if (waiters?.length) {
      waiters.shift()(message.params || {});
    }
  });

  const opened = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  return {
    opened,
    send(method, params = {}) {
      const id = nextId++;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
    },
    waitFor(method, timeout = 7000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeout);
        const wrapped = (params) => {
          clearTimeout(timer);
          resolve(params);
        };
        const waiters = eventWaiters.get(method) || [];
        waiters.push(wrapped);
        eventWaiters.set(method, waiters);
      });
    },
    close() {
      ws.close();
    },
  };
}

async function main() {
  const client = createClient(await waitForCdp());
  await client.opened;
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  async function navigate(route) {
    const load = client.waitFor('Page.loadEventFired').catch(() => undefined);
    await client.send('Page.navigate', { url: `${baseUrl}${route}` });
    await load;
    await client.send('Runtime.evaluate', {
      expression:
        "document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true",
      awaitPromise: true,
    });
    await sleep(450);
  }

  await navigate('/hire');
  await client.send('Runtime.evaluate', {
    expression: "localStorage.setItem('cookie-choice', 'accepted')",
  });

  const shots = [
    { name: 'capture-hire-top.png', route: '/hire', scroll: 'window.scrollTo(0, 0)' },
    {
      name: 'capture-hire-contact.png',
      route: '/hire',
      scroll:
        "document.querySelector('main > section:last-of-type')?.scrollIntoView({ block: 'start' })",
    },
    { name: 'capture-home.png', route: '/', scroll: 'window.scrollTo(0, 0)' },
    { name: 'capture-cases.png', route: '/cases', scroll: 'window.scrollTo(0, 0)' },
    { name: 'capture-submit.png', route: '/submit', scroll: 'window.scrollTo(0, 0)' },
  ];

  for (const shot of shots) {
    await navigate(shot.route);
    await client.send('Runtime.evaluate', { expression: shot.scroll });
    await sleep(500);
    const screenshot = await client.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
    });
    await writeFile(path.join(outDir, shot.name), Buffer.from(screenshot.data, 'base64'));
    console.log(`wrote ${shot.name}`);
  }

  client.close();
}

try {
  await main();
} finally {
  chrome.kill('SIGTERM');
  await rm(profileDir, { recursive: true, force: true });
}
