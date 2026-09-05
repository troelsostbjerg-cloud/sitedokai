import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { request as httpRequest } from 'node:http';
import { after, before, test } from 'node:test';
import { createSiteServer } from '../server.mjs';

let baseUrl;
let server;

before(async () => {
  server = createSiteServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  server.close();
  await once(server, 'close');
});

test('serves the homepage with real security headers', async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  const csp = response.headers.get('content-security-policy');
  assert.match(csp, /sha256-/);
  assert.doesNotMatch(csp, /unsafe-inline/);
  assert.match(csp, /form-action 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /(?:^|; )font-src 'self'(?:;|$)/);
  assert.doesNotMatch(csp, /fonts\.(?:bunny\.net|googleapis\.com|gstatic\.com)/);
  const styleDirective = csp.split('; ').find((directive) => directive.startsWith('style-src '));
  assert.ok(styleDirective);
  assert.doesNotMatch(styleDirective, /https?:/);
  assert.equal(response.headers.get('strict-transport-security'), 'max-age=86400');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');

  const html = await response.text();
  assert.match(html, /AI skal kunne mærkes/);
  assert.doesNotMatch(html, /http-equiv="content-security-policy"/i);
  assert.doesNotMatch(html, /https:\/\/fonts\.(?:bunny\.net|googleapis\.com|gstatic\.com)/i);
  assert.match(html, /href="\/fonts\/outfit\/outfit-latin-400-normal\.woff2"/);
  assert.match(html, /href="\/fonts\/newsreader\/newsreader-latin-500-normal\.woff2"/);

  const inlineBlocks = [
    ...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi),
    ...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi),
  ].map((match) => match[1]);
  assert.ok(inlineBlocks.length > 0);
  for (const block of inlineBlocks) {
    const hash = createHash('sha256').update(block).digest('base64');
    assert.ok(csp.includes(`'sha256-${hash}'`));
  }
});

test('serves every self-hosted font as WOFF2', async () => {
  for (const family of ['newsreader', 'outfit']) {
    for (const weight of [400, 500, 600, 700]) {
      const pathname = `/fonts/${family}/${family}-latin-${weight}-normal.woff2`;
      const response = await fetch(`${baseUrl}${pathname}`, { method: 'HEAD' });
      assert.equal(response.status, 200, pathname);
      assert.equal(response.headers.get('content-type'), 'font/woff2', pathname);
      assert.ok(Number(response.headers.get('content-length')) > 10_000, pathname);
    }
  }
});

test('hashes every inline script and style on every active HTML page', async () => {
  for (const pathname of ['/', '/om/', '/kontakt/', '/privacy/', '/findes-ikke']) {
    const response = await fetch(`${baseUrl}${pathname}`);
    const csp = response.headers.get('content-security-policy');
    const html = await response.text();
    const blocks = [
      ...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi),
      ...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi),
    ].map((match) => match[1]);
    assert.ok(blocks.length > 0, `Expected inline content on ${pathname}`);
    for (const block of blocks) {
      const hash = createHash('sha256').update(block).digest('base64');
      assert.ok(csp.includes(`'sha256-${hash}'`), `Missing CSP hash on ${pathname}`);
    }
  }
});

test('returns permanent redirects for legacy and normalized routes', async () => {
  const legacy = await fetch(`${baseUrl}/about?fra=test`, { redirect: 'manual' });
  assert.equal(legacy.status, 308);
  assert.equal(legacy.headers.get('location'), '/om/?fra=test');

  const timeline = await fetch(`${baseUrl}/maaned/2025-01/`, { redirect: 'manual' });
  assert.equal(timeline.status, 308);
  assert.equal(timeline.headers.get('location'), '/');

  const wildcardTimeline = await fetch(`${baseUrl}/maaned/2031-09/?fra=arkiv`, { redirect: 'manual' });
  assert.equal(wildcardTimeline.status, 308);
  assert.equal(wildcardTimeline.headers.get('location'), '/?fra=arkiv');

  const active = await fetch(`${baseUrl}/kontakt`, { redirect: 'manual' });
  assert.equal(active.status, 308);
  assert.equal(active.headers.get('location'), '/kontakt/');
});

test('redirects www to the canonical host', async () => {
  const address = server.address();
  const result = await new Promise((resolveResult, reject) => {
    const request = httpRequest({
      host: '127.0.0.1',
      port: address.port,
      path: '/om/?kilde=www',
      headers: { Host: 'www.sitedokai.com' },
    }, resolveResult);
    request.on('error', reject);
    request.end();
  });
  assert.equal(result.statusCode, 308);
  assert.equal(result.headers.location, 'https://sitedokai.com/om/?kilde=www');
  result.resume();
});

test('supports HEAD, caching and a real 404 status', async () => {
  const image = await fetch(`${baseUrl}/og-image.png`, { method: 'HEAD' });
  assert.equal(image.status, 200);
  assert.equal(image.headers.get('content-type'), 'image/png');
  assert.ok(Number(image.headers.get('content-length')) > 0);

  const first = await fetch(`${baseUrl}/`);
  const cached = await fetch(`${baseUrl}/`, {
    headers: { 'If-None-Match': first.headers.get('etag') },
  });
  assert.equal(cached.status, 304);

  const missing = await fetch(`${baseUrl}/findes-ikke`);
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /Siden findes ikke/);
});
