const ALLOWED_PUBLIC_ORIGINS = new Set([
  "https://sitedokai.com",
  "https://www.sitedokai.com",
  "https://sitedokai-preview.pages.dev",
  "https://sitedokai-checkout.pages.dev",
  "http://127.0.0.1:4321",
  "http://localhost:4321",
]);

const REQUIRED_FIELDS = [
  "name",
  "email",
  "company",
  "role_title",
  "workflow_title",
  "workflow_description",
  "workflow_pain",
  "frequency",
  "people_involved",
  "tools_involved",
  "better_version",
  "permission_to_publish",
];

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store, max-age=0",
    },
  });
}

function normalizeText(value, maxLength = 500) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeMultiline(value, maxLength = 4000) {
  return String(value || "").trim().replace(/\r\n/g, "\n").slice(0, maxLength);
}

function normalizeEmail(value) {
  return normalizeText(value, 320).toLowerCase();
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeUrl(value) {
  const raw = normalizeText(value, 700);
  if (!raw) return "";

  const candidate = raw.includes("://") ? raw : `https://${raw}`;
  try {
    return new URL(candidate).toString();
  } catch {
    return "";
  }
}

function normalizePath(value) {
  const candidate = normalizeText(value, 220);
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/";
  }
  return candidate;
}

function normalizeOrigin(value) {
  const candidate = normalizeText(value, 320);
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

  if (origin) return Boolean(normalizeOrigin(origin));
  if (referer) return Boolean(normalizeOrigin(referer));
  return true;
}

function readSyncToken(request) {
  return String(
    request.headers.get("x-workflow-sync-token")
    || request.headers.get("x-leads-sync-token")
    || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
    || "",
  ).trim();
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

function hasHoneypot(payload) {
  return Boolean(normalizeText(payload.website_extra) || normalizeText(payload._honey));
}

function getDb(env) {
  return env?.WORKFLOW_SUBMISSIONS_DB || env?.LEADS_DB || env?.ORDERS_DB || null;
}

async function ensureSchema(db) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS workflow_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'new',
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      role_title TEXT NOT NULL,
      website TEXT,
      linkedin TEXT,
      workflow_title TEXT NOT NULL,
      workflow_description TEXT NOT NULL,
      workflow_pain TEXT NOT NULL,
      frequency TEXT NOT NULL,
      people_involved TEXT NOT NULL,
      tools_involved TEXT NOT NULL,
      better_version TEXT NOT NULL,
      already_tried TEXT,
      ai_involved TEXT,
      avoid_mentions TEXT,
      permission_to_publish TEXT NOT NULL,
      source_page TEXT,
      public_origin TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`
  ).run();

  await db.prepare(
    "CREATE INDEX IF NOT EXISTS idx_workflow_submissions_status_updated ON workflow_submissions(status, updated_at)"
  ).run();
}

function buildRecord(payload, request) {
  const url = new URL(request.url);
  const publicOrigin = normalizeOrigin(payload.public_origin)
    || normalizeOrigin(request.headers.get("origin"))
    || normalizeOrigin(request.headers.get("referer"))
    || url.origin;

  return {
    submission_id: crypto.randomUUID(),
    status: "new",
    name: normalizeText(payload.name, 180),
    email: normalizeEmail(payload.email),
    company: normalizeText(payload.company, 220),
    role_title: normalizeText(payload.role_title, 180),
    website: normalizeUrl(payload.website) || null,
    linkedin: normalizeUrl(payload.linkedin) || null,
    workflow_title: normalizeText(payload.workflow_title, 220),
    workflow_description: normalizeMultiline(payload.workflow_description, 5000),
    workflow_pain: normalizeMultiline(payload.workflow_pain, 3000),
    frequency: normalizeText(payload.frequency, 80),
    people_involved: normalizeText(payload.people_involved, 800),
    tools_involved: normalizeText(payload.tools_involved, 800),
    better_version: normalizeMultiline(payload.better_version, 3000),
    already_tried: normalizeMultiline(payload.already_tried, 2500) || null,
    ai_involved: normalizeMultiline(payload.ai_involved, 2500) || null,
    avoid_mentions: normalizeMultiline(payload.avoid_mentions, 2500) || null,
    permission_to_publish: normalizeText(payload.permission_to_publish, 160),
    source_page: normalizePath(payload.source_page || url.pathname),
    public_origin: publicOrigin,
    user_agent: normalizeText(request.headers.get("user-agent"), 300) || null,
  };
}

function validateRecord(record) {
  const missing = REQUIRED_FIELDS.filter((field) => !record[field]);
  if (missing.length) {
    return { ok: false, error: "missing_required_fields", missing };
  }
  if (!isEmail(record.email)) {
    return { ok: false, error: "invalid_email" };
  }
  return { ok: true };
}

async function insertSubmission(db, record) {
  const timestamp = new Date().toISOString();

  await db.prepare(
    `INSERT INTO workflow_submissions (
      submission_id,
      status,
      name,
      email,
      company,
      role_title,
      website,
      linkedin,
      workflow_title,
      workflow_description,
      workflow_pain,
      frequency,
      people_involved,
      tools_involved,
      better_version,
      already_tried,
      ai_involved,
      avoid_mentions,
      permission_to_publish,
      source_page,
      public_origin,
      user_agent,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      record.submission_id,
      record.status,
      record.name,
      record.email,
      record.company,
      record.role_title,
      record.website,
      record.linkedin,
      record.workflow_title,
      record.workflow_description,
      record.workflow_pain,
      record.frequency,
      record.people_involved,
      record.tools_involved,
      record.better_version,
      record.already_tried,
      record.ai_involved,
      record.avoid_mentions,
      record.permission_to_publish,
      record.source_page,
      record.public_origin,
      record.user_agent,
      timestamp,
      timestamp,
    )
    .run();

  return {
    submission_id: record.submission_id,
    created_at: timestamp,
  };
}

async function listSubmissions(db, limit = 50) {
  const result = await db.prepare(
    `SELECT
      submission_id,
      status,
      name,
      email,
      company,
      role_title,
      website,
      linkedin,
      workflow_title,
      workflow_description,
      workflow_pain,
      frequency,
      people_involved,
      tools_involved,
      better_version,
      already_tried,
      ai_involved,
      avoid_mentions,
      permission_to_publish,
      source_page,
      public_origin,
      created_at,
      updated_at
    FROM workflow_submissions
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
  const expectedToken = String(
    context.env.WORKFLOW_SUBMISSIONS_SYNC_TOKEN
    || context.env.LEADS_SYNC_TOKEN
    || "",
  ).trim();

  if (!expectedToken) {
    return jsonResponse(500, { ok: false, error: "WORKFLOW_SUBMISSIONS_SYNC_TOKEN_missing" });
  }

  const providedToken = readSyncToken(context.request);
  if (!providedToken || providedToken !== expectedToken) {
    return jsonResponse(401, { ok: false, error: "unauthorized" });
  }

  const db = getDb(context.env);
  if (!db) {
    return jsonResponse(503, { ok: false, error: "WORKFLOW_SUBMISSIONS_DB_or_LEADS_DB_missing" });
  }

  const limit = Math.max(
    1,
    Math.min(Number(new URL(context.request.url).searchParams.get("limit") || 50), 200),
  );

  await ensureSchema(db);
  const submissions = await listSubmissions(db, limit);

  return jsonResponse(200, {
    ok: true,
    submissions,
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

  const record = buildRecord(payload, context.request);
  const validation = validateRecord(record);
  if (!validation.ok) {
    return jsonResponse(400, validation);
  }

  const db = getDb(context.env);
  if (!db) {
    return jsonResponse(503, { ok: false, error: "WORKFLOW_SUBMISSIONS_DB_or_LEADS_DB_missing" });
  }

  await ensureSchema(db);
  const result = await insertSubmission(db, record);

  return jsonResponse(200, {
    ok: true,
    stored: true,
    submission_id: result.submission_id,
    created_at: result.created_at,
  });
}
