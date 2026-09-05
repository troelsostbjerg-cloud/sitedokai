import { createHash } from 'node:crypto';
import { createReadStream, readFileSync, readdirSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { redirectTargetForPath } from './src/config/redirects.mjs';

const ROOT_DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_DIST_DIR = resolve(ROOT_DIR, 'dist');
const CANONICAL_HOST = 'sitedokai.com';
const TRAILING_SLASH_ROUTES = new Set(['/om', '/kontakt', '/privacy']);

const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

const BASE_HEADERS = Object.freeze({
  'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=86400',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
});

function redirectLocation(target, search) {
  if (!search) return target;
  const hashIndex = target.indexOf('#');
  if (hashIndex === -1) return `${target}${search}`;
  return `${target.slice(0, hashIndex)}${search}${target.slice(hashIndex)}`;
}

function headersFor(request) {
  const hostname = (request.headers.host ?? '').split(':')[0].toLowerCase();
  return hostname === CANONICAL_HOST || hostname === `www.${CANONICAL_HOST}`
    ? { ...BASE_HEADERS }
    : { ...BASE_HEADERS, 'X-Robots-Tag': 'noindex, nofollow' };
}

function sendRedirect(request, response, location) {
  response.writeHead(308, {
    ...headersFor(request),
    'Cache-Control': 'public, max-age=3600',
    Location: location,
  });
  response.end();
}

function sendPlain(request, response, statusCode, message, method = 'GET') {
  const body = Buffer.from(`${message}\n`, 'utf8');
  response.writeHead(statusCode, {
    ...headersFor(request),
    'Cache-Control': 'no-store',
    'Content-Length': body.length,
    'Content-Type': 'text/plain; charset=utf-8',
  });
  if (method === 'HEAD') response.end();
  else response.end(body);
}

function sha256Source(content) {
  return `'sha256-${createHash('sha256').update(content).digest('base64')}'`;
}

function cspForHtml(html) {
  const scriptHashes = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => sha256Source(match[1]));
  const styleHashes = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((match) => sha256Source(match[1]));
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data:",
    "object-src 'none'",
    `script-src 'self' ${scriptHashes.join(' ')}`.trim(),
    `style-src 'self' ${styleHashes.join(' ')}`.trim(),
    'upgrade-insecure-requests',
  ].join('; ');
}

function precomputeHtmlCsp(distDir) {
  const cspByFile = new Map();
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const filePath = resolve(directory, entry.name);
      if (entry.isDirectory()) visit(filePath);
      else if (entry.isFile() && extname(entry.name).toLowerCase() === '.html') {
        cspByFile.set(filePath, cspForHtml(readFileSync(filePath, 'utf8')));
      }
    }
  };
  visit(distDir);
  return cspByFile;
}

function cacheControlFor(filePath) {
  if (filePath.includes(`${sep}_astro${sep}`)) {
    return 'public, max-age=31536000, immutable';
  }
  if (extname(filePath) === '.html') {
    return 'public, max-age=0, must-revalidate';
  }
  return 'public, max-age=3600';
}

async function serveFile(request, response, filePath, cspByFile, statusCode = 200) {
  const fileStats = await stat(filePath);
  if (!fileStats.isFile()) throw new Error('Not a file');

  const method = request.method ?? 'GET';
  const extension = extname(filePath).toLowerCase();
  const etag = `W/"${fileStats.size.toString(16)}-${Math.round(fileStats.mtimeMs).toString(16)}"`;
  const headers = {
    ...headersFor(request),
    'Cache-Control': cacheControlFor(filePath),
    'Content-Length': fileStats.size,
    'Content-Type': MIME_TYPES.get(extension) ?? 'application/octet-stream',
    ETag: etag,
    'Last-Modified': fileStats.mtime.toUTCString(),
  };

  if (extension === '.html') {
    const csp = cspByFile.get(filePath);
    if (!csp) throw new Error(`Missing precomputed CSP for ${filePath}`);
    headers['Content-Security-Policy'] = csp;
  }

  if (request.headers['if-none-match'] === etag && statusCode === 200) {
    delete headers['Content-Length'];
    response.writeHead(304, headers);
    response.end();
    return;
  }

  response.writeHead(statusCode, headers);
  if (method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
}

function resolvePublicFile(distDir, pathname) {
  const relativePath = pathname === '/'
    ? 'index.html'
    : pathname.endsWith('/')
      ? `${pathname.slice(1)}index.html`
      : pathname.slice(1);
  const filePath = resolve(distDir, relativePath);
  const distPrefix = `${resolve(distDir)}${sep}`;
  return filePath.startsWith(distPrefix) ? filePath : null;
}

export function createSiteServer({ distDir = DEFAULT_DIST_DIR } = {}) {
  const cspByFile = precomputeHtmlCsp(distDir);
  return createServer(async (request, response) => {
    const method = request.method ?? 'GET';
    if (method !== 'GET' && method !== 'HEAD') {
      response.setHeader('Allow', 'GET, HEAD');
      sendPlain(request, response, 405, 'Method not allowed', method);
      return;
    }

    let url;
    try {
      url = new URL(request.url ?? '/', `http://${request.headers.host ?? CANONICAL_HOST}`);
      url.pathname = decodeURIComponent(url.pathname);
    } catch {
      sendPlain(request, response, 400, 'Bad request', method);
      return;
    }

    if (url.hostname.toLowerCase() === `www.${CANONICAL_HOST}`) {
      sendRedirect(request, response, `https://${CANONICAL_HOST}${url.pathname}${url.search}`);
      return;
    }

    const normalizedPath = url.pathname.length > 1
      ? url.pathname.replace(/\/+$/, '')
      : url.pathname;
    const legacyTarget = redirectTargetForPath(normalizedPath);
    if (legacyTarget) {
      sendRedirect(request, response, redirectLocation(legacyTarget, url.search));
      return;
    }

    if (TRAILING_SLASH_ROUTES.has(normalizedPath) && url.pathname === normalizedPath) {
      sendRedirect(request, response, `${normalizedPath}/${url.search}`);
      return;
    }

    if (url.pathname === '/index.html') {
      sendRedirect(request, response, `/${url.search}`);
      return;
    }

    const filePath = resolvePublicFile(distDir, url.pathname);
    if (filePath) {
      try {
        await serveFile(request, response, filePath, cspByFile);
        return;
      } catch (error) {
        if (error?.code !== 'ENOENT' && error?.code !== 'ENOTDIR' && error?.message !== 'Not a file') {
          console.error(error);
          sendPlain(request, response, 500, 'Internal server error', method);
          return;
        }
      }
    }

    try {
      await serveFile(request, response, resolve(distDir, '404.html'), cspByFile, 404);
    } catch (error) {
      console.error(error);
      sendPlain(request, response, 404, 'Not found', method);
    }
  });
}

const executedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (executedDirectly) {
  const port = Number.parseInt(process.env.PORT ?? '8080', 10);
  const server = createSiteServer();
  server.listen(port, '0.0.0.0', () => {
    console.log(`SiteDokAI listening on port ${port}`);
  });
}
