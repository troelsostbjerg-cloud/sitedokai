const ALLOWED_PUBLIC_ORIGINS = new Set([
  "https://sitedokai.com",
  "https://www.sitedokai.com",
  "https://sitedokai-preview.pages.dev",
  "https://sitedokai-checkout.pages.dev",
  "http://127.0.0.1:4321",
  "http://localhost:4321",
]);

const ALLOWED_LEAD_TYPES = new Set([
  "workflow",
  "contact",
  "manual-work-audit",
  "ai-workflow-sprint",
  "ai-operations-partner",
  "gratis-mini-tjek",
  "kontakt",
  "hjemmeside-tjek",
  "hjemmeside-fix",
  "visuelt-loeft",
]);

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store, max-age=0",
    },
  });
}

function readSyncToken(request) {
  return String(
    request.headers.get("x-leads-sync-token")
    || request.headers.get("x-orders-sync-token")
    || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
    || "",
  ).trim();
}

function normalizeText(value, maxLength = 500) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeMultiline(value, maxLength = 2000) {
  return String(value || "").trim().replace(/\r\n/g, "\n").slice(0, maxLength);
}

function normalizeEmail(value) {
  return normalizeText(value, 320).toLowerCase();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeWebsite(value) {
  const raw = normalizeText(value, 500);
  if (!raw) return "";

  const candidate = raw.includes("://") ? raw : `https://${raw}`;
  try {
    return new URL(candidate).toString();
  } catch {
    return "";
  }
}

function normalizeLeadType(value) {
  const candidate = normalizeText(value, 80);
  return ALLOWED_LEAD_TYPES.has(candidate) ? candidate : "contact";
}

function normalizePath(value) {
  const candidate = normalizeText(value, 200);
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/";
  }
  return candidate;
}

function normalizeOrigin(value) {
  const candidate = normalizeText(value, 300);
  if (!candidate) return "";

  try {
    const url = new URL(candidate);
    return ALLOWED_PUBLIC_ORIGINS.has(url.origin) ? url.origin : "";
  } catch {
    return "";
  }
}

function isAllowedRequestSource(request) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  if (origin) {
    return Boolean(normalizeOrigin(origin));
  }
  if (referer) {
    return Boolean(normalizeOrigin(referer));
  }
  return true;
}

function hasHoneypot(payload) {
  return Boolean(
    normalizeText(payload._honey)
    || normalizeText(payload.website_extra)
    || normalizeText(payload.company_website),
  );
}

async function readPayload(request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}

async function sha256Hex(value) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getLeadsDb(env) {
  return env?.LEADS_DB || env?.ORDERS_DB || null;
}

async function ensureLeadsSchema(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dedupe_key TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'new',
      lead_type TEXT NOT NULL,
      interest TEXT,
      name TEXT NOT NULL,
      company_name TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      website TEXT,
      industry TEXT,
      message TEXT,
      source_page TEXT,
      public_origin TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  ).run();

  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_leads_status_updated ON leads(status, updated_at)"
  ).run();
}

function buildLeadRecord(payload, request) {
  const url = new URL(request.url);
  const email = normalizeEmail(payload.email);
  const leadType = normalizeLeadType(payload.lead_type || payload.interest);
  const website = normalizeWebsite(payload.website);
  const messageParts = [
    ["Workflow", payload.workflow],
    ["Frequency", payload.frequency],
    ["Tools", payload.current_tools],
    ["People involved", payload.involved_people],
    ["What goes wrong today", payload.current_failure],
    ["Good output", payload.desired_output],
    ["Notes", payload.notes || payload.message],
  ]
    .map(([label, value]) => {
      const normalized = normalizeMultiline(value, 1200);
      return normalized ? `${label}: ${normalized}` : "";
    })
    .filter(Boolean);
  const message = normalizeMultiline(messageParts.join("\n\n"), 3000);
  const sourcePage = normalizePath(payload.source_page || url.pathname);
  const publicOrigin = normalizeOrigin(payload.public_origin)
    || normalizeOrigin(request.headers.get("origin"))
    || normalizeOrigin(request.headers.get("referer"))
    || url.origin;

  return {
    lead_type: leadType,
    interest: normalizeText(payload.interest || leadType, 160),
    name: normalizeText(payload.name, 180),
    company_name: normalizeText(payload.company || payload.company_name, 180) || null,
    email,
    phone: normalizeText(payload.phone, 80) || null,
    website: website || null,
    industry: normalizeText(payload.branche || payload.industry, 180) || null,
    message: message || null,
    source_page: sourcePage,
    public_origin: publicOrigin,
    user_agent: normalizeText(request.headers.get("user-agent"), 300) || null,
  };
}

async function upsertLead(db, record) {
  const timestamp = new Date().toISOString();
  const dedupeKey = await sha256Hex([
    record.lead_type,
    record.email,
    record.website || "",
    record.source_page,
  ].join("|"));

  await db.prepare(
    `INSERT INTO leads (
      dedupe_key,
      status,
      lead_type,
      interest,
      name,
      company_name,
      email,
      phone,
      website,
      industry,
      message,
      source_page,
      public_origin,
      user_agent,
      created_at,
      updated_at
    ) VALUES (?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(dedupe_key) DO UPDATE SET
      interest = COALESCE(NULLIF(excluded.interest, ''), leads.interest),
      name = COALESCE(NULLIF(excluded.name, ''), leads.name),
      company_name = COALESCE(excluded.company_name, leads.company_name),
      phone = COALESCE(excluded.phone, leads.phone),
      industry = COALESCE(excluded.industry, leads.industry),
      message = COALESCE(excluded.message, leads.message),
      public_origin = COALESCE(excluded.public_origin, leads.public_origin),
      user_agent = COALESCE(excluded.user_agent, leads.user_agent),
      updated_at = excluded.updated_at`
  )
    .bind(
      dedupeKey,
      record.lead_type,
      record.interest,
      record.name,
      record.company_name,
      record.email,
      record.phone,
      record.website,
      record.industry,
      record.message,
      record.source_page,
      record.public_origin,
      record.user_agent,
      timestamp,
      timestamp,
    )
    .run();

  return { dedupe_key: dedupeKey, updated_at: timestamp };
}

async function listLeads(db, limit = 50) {
  const result = await db.prepare(
    `SELECT
      id,
      status,
      lead_type,
      interest,
      name,
      company_name,
      email,
      phone,
      website,
      industry,
      message,
      source_page,
      public_origin,
      created_at,
      updated_at
    FROM leads
    ORDER BY updated_at DESC
    LIMIT ?`
  )
    .bind(limit)
    .all();

  return result.results || [];
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "cache-control": "private, no-store, max-age=0",
    },
  });
}

export async function onRequestGet(context) {
  const expectedToken = String(context.env.LEADS_SYNC_TOKEN || context.env.ORDERS_SYNC_TOKEN || "").trim();
  if (!expectedToken) {
    return jsonResponse(500, { ok: false, error: "LEADS_SYNC_TOKEN_or_ORDERS_SYNC_TOKEN_missing" });
  }

  const providedToken = readSyncToken(context.request);
  if (!providedToken || providedToken !== expectedToken) {
    return jsonResponse(401, { ok: false, error: "unauthorized" });
  }

  const db = getLeadsDb(context.env);
  if (!db) {
    return jsonResponse(503, { ok: false, error: "LEADS_DB_or_ORDERS_DB_missing" });
  }

  const limit = Math.max(
    1,
    Math.min(
      Number(new URL(context.request.url).searchParams.get("limit") || 50),
      200,
    ),
  );

  await ensureLeadsSchema(db);
  const leads = await listLeads(db, limit);

  return jsonResponse(200, {
    ok: true,
    leads,
  });
}

export async function onRequestPost(context) {
  if (!isAllowedRequestSource(context.request)) {
    return jsonResponse(403, { ok: false, error: "forbidden_origin" });
  }

  const payload = await readPayload(context.request);
  if (hasHoneypot(payload)) {
    return jsonResponse(200, { ok: true, stored: false });
  }

  const record = buildLeadRecord(payload, context.request);
  if (!record.name || !record.email || !isEmail(record.email)) {
    return jsonResponse(400, { ok: false, error: "invalid_lead" });
  }

  const db = getLeadsDb(context.env);
  if (!db) {
    return jsonResponse(503, { ok: false, error: "LEADS_DB_or_ORDERS_DB_missing" });
  }

  await ensureLeadsSchema(db);
  const result = await upsertLead(db, record);

  return jsonResponse(200, {
    ok: true,
    stored: true,
    lead_type: record.lead_type,
    updated_at: result.updated_at,
  });
}
