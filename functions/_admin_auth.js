const COOKIE_NAME = "sitedok_orders_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  const normalized = String(hex || "");
  const bytes = new Uint8Array(normalized.length / 2);
  for (let index = 0; index < normalized.length; index += 2) {
    bytes[index / 2] = parseInt(normalized.slice(index, index + 2), 16);
  }
  return bytes;
}

function toBase64Url(value) {
  return btoa(value).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value) {
  const normalized = String(value || "")
    .replaceAll("-", "+")
    .replaceAll("_", "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return atob(`${normalized}${padding}`);
}

function parseCookies(header) {
  const cookies = {};
  for (const part of String(header || "").split(";")) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }
    cookies[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim();
  }
  return cookies;
}

async function hmacSignature(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message),
  );

  return bytesToHex(new Uint8Array(signature));
}

function timingSafeEqual(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

export function getConfiguredAdminUser(env) {
  return String(env?.ORDERS_DASHBOARD_USER || "Troels").trim() || "Troels";
}

export function hasAdminAuthConfigured(env) {
  return Boolean(env?.ORDERS_DASHBOARD_PASSWORD && env?.ORDERS_SESSION_SECRET);
}

export async function verifyDashboardPassword(env, password) {
  if (!hasAdminAuthConfigured(env)) {
    return false;
  }
  return timingSafeEqual(
    String(password || ""),
    String(env.ORDERS_DASHBOARD_PASSWORD),
  );
}

export async function createSessionCookie(env, username = "Troels") {
  const payload = {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = await hmacSignature(env.ORDERS_SESSION_SECRET, encoded);
  return `${COOKIE_NAME}=${encoded}.${signature}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function createLogoutCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function readAuthenticatedUser(request, env) {
  if (!hasAdminAuthConfigured(env)) {
    return null;
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  const raw = cookies[COOKIE_NAME];
  if (!raw || !raw.includes(".")) {
    return null;
  }

  const [encoded, signature] = raw.split(".", 2);
  const expected = await hmacSignature(env.ORDERS_SESSION_SECRET, encoded);
  if (!timingSafeEqual(signature, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encoded));
    if (!payload?.exp || Number(payload.exp) < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload.username || getConfiguredAdminUser(env);
  } catch {
    return null;
  }
}
