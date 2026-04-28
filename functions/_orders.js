import { sendPushoverNotification } from "./_notify.js";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

export const ORDER_STATUS = {
  CHECKOUT_STARTED: "checkout_started",
  PAID_PENDING_REVIEW: "paid_pending_review",
  APPROVED_FOR_PRODUCTION: "approved_for_production",
};

export const ORDER_STATUS_META = {
  [ORDER_STATUS.CHECKOUT_STARTED]: {
    label: "Checkout startet",
    tone: "neutral",
    description: "Formularen er modtaget. Vi afventer stadig betalt checkout eller Stripe-sync.",
  },
  [ORDER_STATUS.PAID_PENDING_REVIEW]: {
    label: "Klar til review",
    tone: "accent",
    description: "Betalingen er bekræftet. Gennemgå ordren og godkend den til produktion.",
  },
  [ORDER_STATUS.APPROVED_FOR_PRODUCTION]: {
    label: "Godkendt til produktion",
    tone: "success",
    description: "Ordren er godkendt og ligger klar til næste produktionsled.",
  },
};

function toIsoDateTime(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

export function nowIso() {
  return new Date().toISOString();
}

export function htmlEscape(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function ensureOrdersDb(env) {
  if (!env?.ORDERS_DB) {
    throw new Error("ORDERS_DB binding mangler på Cloudflare-projektet.");
  }
  return env.ORDERS_DB;
}

export async function stripeRequest(path, secretKey, { method = "GET", body } = {}) {
  const headers = {
    authorization: `Bearer ${secretKey}`,
  };

  if (body) {
    headers["content-type"] = "application/x-www-form-urlencoded";
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method,
    headers,
    body,
  });

  const payload = await response.json();
  if (!response.ok) {
    const detail = payload?.error?.message || `Stripe API-fejl (${response.status})`;
    throw new Error(detail);
  }
  return payload;
}

function normalizeText(value, fallback = "") {
  return String(value || fallback).trim();
}

function truncateText(value, maxLength = 180) {
  const text = normalizeText(value);
  if (!text || text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

function buildOrdersDashboardUrl(env, orderId = null) {
  const base = normalizeText(
    env?.ORDERS_DASHBOARD_URL,
    "https://sitedokai-checkout.pages.dev/orders",
  );
  if (!orderId) {
    return base;
  }
  return `${base}${base.includes("?") ? "&" : "?"}id=${encodeURIComponent(String(orderId))}`;
}

function extractPublicOrigin(successUrl) {
  try {
    return new URL(String(successUrl || "")).origin;
  } catch {
    return null;
  }
}

function buildSessionRecordPayload(session, fallback = {}) {
  const invoice = session?.invoice && typeof session.invoice === "object" ? session.invoice : null;
  const metadata = session?.metadata || {};
  const customerDetails = session?.customer_details || {};
  const status = session?.payment_status === "paid"
    ? ORDER_STATUS.PAID_PENDING_REVIEW
    : ORDER_STATUS.CHECKOUT_STARTED;
  const paidAt = session?.payment_status === "paid"
    ? nowIso()
    : null;
  const amountDkk = Number.isFinite(session?.amount_total)
    ? Math.round(Number(session.amount_total) / 100)
    : (fallback.amount_dkk || 2495);
  const checkoutCreatedAt = session?.created
    ? toIsoDateTime(Number(session.created) * 1000)
    : (fallback.checkout_created_at || nowIso());

  return {
    checkout_session_id: normalizeText(session?.id, fallback.checkout_session_id),
    status,
    company_name: normalizeText(metadata.company_name, fallback.company_name),
    contact_name: normalizeText(metadata.contact_name || customerDetails.name, fallback.contact_name),
    email: normalizeText(metadata.email || customerDetails.email, fallback.email).toLowerCase(),
    phone: normalizeText(customerDetails.phone, fallback.phone) || null,
    website: normalizeText(metadata.website, fallback.website),
    notes: normalizeText(metadata.notes, fallback.notes) || null,
    source_page: normalizeText(metadata.source_page, fallback.source_page) || null,
    public_origin: normalizeText(
      fallback.public_origin || extractPublicOrigin(session?.success_url),
    ) || null,
    checkout_url: normalizeText(session?.url, fallback.checkout_url) || null,
    stripe_customer_id: normalizeText(session?.customer, fallback.stripe_customer_id) || null,
    stripe_payment_intent: normalizeText(session?.payment_intent, fallback.stripe_payment_intent) || null,
    stripe_invoice_id: normalizeText(invoice?.id || session?.invoice, fallback.stripe_invoice_id) || null,
    stripe_invoice_number: normalizeText(invoice?.number, fallback.stripe_invoice_number) || null,
    stripe_invoice_hosted_url: normalizeText(invoice?.hosted_invoice_url, fallback.stripe_invoice_hosted_url) || null,
    stripe_invoice_pdf_url: normalizeText(invoice?.invoice_pdf, fallback.stripe_invoice_pdf_url) || null,
    amount_dkk: amountDkk,
    currency: normalizeText(session?.currency, fallback.currency || "dkk").toLowerCase(),
    checkout_created_at: checkoutCreatedAt,
    paid_at: paidAt || fallback.paid_at || null,
    last_reconciled_at: nowIso(),
  };
}

export async function upsertOrderFromSession(db, session, fallback = {}) {
  const record = buildSessionRecordPayload(session, fallback);
  const timestamp = nowIso();

  await db.prepare(
    `INSERT INTO orders (
      checkout_session_id,
      status,
      company_name,
      contact_name,
      email,
      phone,
      website,
      notes,
      source_page,
      public_origin,
      checkout_url,
      stripe_customer_id,
      stripe_payment_intent,
      stripe_invoice_id,
      stripe_invoice_number,
      stripe_invoice_hosted_url,
      stripe_invoice_pdf_url,
      amount_dkk,
      currency,
      checkout_created_at,
      paid_at,
      last_reconciled_at,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(checkout_session_id) DO UPDATE SET
      status = excluded.status,
      company_name = COALESCE(NULLIF(excluded.company_name, ''), orders.company_name),
      contact_name = COALESCE(NULLIF(excluded.contact_name, ''), orders.contact_name),
      email = COALESCE(NULLIF(excluded.email, ''), orders.email),
      phone = COALESCE(NULLIF(excluded.phone, ''), orders.phone),
      website = COALESCE(NULLIF(excluded.website, ''), orders.website),
      notes = COALESCE(excluded.notes, orders.notes),
      source_page = COALESCE(excluded.source_page, orders.source_page),
      public_origin = COALESCE(excluded.public_origin, orders.public_origin),
      checkout_url = COALESCE(excluded.checkout_url, orders.checkout_url),
      stripe_customer_id = COALESCE(excluded.stripe_customer_id, orders.stripe_customer_id),
      stripe_payment_intent = COALESCE(excluded.stripe_payment_intent, orders.stripe_payment_intent),
      stripe_invoice_id = COALESCE(excluded.stripe_invoice_id, orders.stripe_invoice_id),
      stripe_invoice_number = COALESCE(excluded.stripe_invoice_number, orders.stripe_invoice_number),
      stripe_invoice_hosted_url = COALESCE(excluded.stripe_invoice_hosted_url, orders.stripe_invoice_hosted_url),
      stripe_invoice_pdf_url = COALESCE(excluded.stripe_invoice_pdf_url, orders.stripe_invoice_pdf_url),
      amount_dkk = COALESCE(excluded.amount_dkk, orders.amount_dkk),
      currency = COALESCE(excluded.currency, orders.currency),
      checkout_created_at = COALESCE(excluded.checkout_created_at, orders.checkout_created_at),
      paid_at = COALESCE(excluded.paid_at, orders.paid_at),
      last_reconciled_at = excluded.last_reconciled_at,
      updated_at = excluded.updated_at`
  )
    .bind(
      record.checkout_session_id,
      record.status,
      record.company_name,
      record.contact_name,
      record.email,
      record.phone,
      record.website,
      record.notes,
      record.source_page,
      record.public_origin,
      record.checkout_url,
      record.stripe_customer_id,
      record.stripe_payment_intent,
      record.stripe_invoice_id,
      record.stripe_invoice_number,
      record.stripe_invoice_hosted_url,
      record.stripe_invoice_pdf_url,
      record.amount_dkk,
      record.currency,
      record.checkout_created_at,
      record.paid_at,
      record.last_reconciled_at,
      timestamp,
      timestamp,
    )
    .run();

  return getOrderBySessionId(db, record.checkout_session_id);
}

async function notifyPaidOrder(env, order, previousOrder) {
  if (!order || order.status !== ORDER_STATUS.PAID_PENDING_REVIEW) {
    return;
  }
  if (previousOrder?.status === ORDER_STATUS.PAID_PENDING_REVIEW) {
    return;
  }

  const company = normalizeText(order.company_name, "Ny kunde");
  const amount = Number(order.amount_dkk || 0);
  const target = normalizeText(order.website || order.email, "Ingen website angivet");
  const notes = truncateText(order.notes, 140);
  const messageLines = [
    `${company} har betalt ${amount} DKK.`,
    target,
  ];
  if (notes) {
    messageLines.push(`Note: ${notes}`);
  }

  await sendPushoverNotification(env, {
    title: "Ny betalt ordre",
    message: messageLines.join("\n"),
    url: buildOrdersDashboardUrl(env, order.id),
    urlTitle: "Åbn ordre",
    priority: 0,
  });
}

export async function insertCheckoutStarted(db, payload) {
  const timestamp = nowIso();
  const record = {
    checkout_session_id: payload.checkout_session_id,
    status: ORDER_STATUS.CHECKOUT_STARTED,
    company_name: payload.company_name,
    contact_name: payload.contact_name,
    email: payload.email.toLowerCase(),
    phone: payload.phone || null,
    website: payload.website,
    notes: payload.notes || null,
    source_page: payload.source_page || null,
    public_origin: payload.public_origin || null,
    checkout_url: payload.checkout_url || null,
    stripe_customer_id: payload.stripe_customer_id || null,
    stripe_payment_intent: null,
    stripe_invoice_id: null,
    stripe_invoice_number: null,
    stripe_invoice_hosted_url: null,
    stripe_invoice_pdf_url: null,
    amount_dkk: payload.amount_dkk || 2495,
    currency: payload.currency || "dkk",
    checkout_created_at: payload.checkout_created_at || timestamp,
    paid_at: null,
    last_reconciled_at: null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  await db.prepare(
    `INSERT INTO orders (
      checkout_session_id,
      status,
      company_name,
      contact_name,
      email,
      phone,
      website,
      notes,
      source_page,
      public_origin,
      checkout_url,
      stripe_customer_id,
      stripe_payment_intent,
      stripe_invoice_id,
      stripe_invoice_number,
      stripe_invoice_hosted_url,
      stripe_invoice_pdf_url,
      amount_dkk,
      currency,
      checkout_created_at,
      paid_at,
      last_reconciled_at,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      record.checkout_session_id,
      record.status,
      record.company_name,
      record.contact_name,
      record.email,
      record.phone,
      record.website,
      record.notes,
      record.source_page,
      record.public_origin,
      record.checkout_url,
      record.stripe_customer_id,
      record.stripe_payment_intent,
      record.stripe_invoice_id,
      record.stripe_invoice_number,
      record.stripe_invoice_hosted_url,
      record.stripe_invoice_pdf_url,
      record.amount_dkk,
      record.currency,
      record.checkout_created_at,
      record.paid_at,
      record.last_reconciled_at,
      record.created_at,
      record.updated_at,
    )
    .run();

  return getOrderBySessionId(db, record.checkout_session_id);
}

export async function getOrderBySessionId(db, sessionId) {
  if (!sessionId) {
    return null;
  }
  return db.prepare("SELECT * FROM orders WHERE checkout_session_id = ? LIMIT 1")
    .bind(sessionId)
    .first();
}

export async function getOrderById(db, orderId) {
  return db.prepare("SELECT * FROM orders WHERE id = ? LIMIT 1")
    .bind(orderId)
    .first();
}

export async function listOrders(db, limit = 100) {
  const result = await db.prepare(
    `SELECT * FROM orders
     ORDER BY
       CASE status
         WHEN 'paid_pending_review' THEN 0
         WHEN 'checkout_started' THEN 1
         WHEN 'approved_for_production' THEN 2
         ELSE 3
       END,
       COALESCE(paid_at, checkout_created_at, created_at) DESC
     LIMIT ?`
  )
    .bind(limit)
    .all();

  return result.results || [];
}

export async function getOrderCounts(db) {
  const counts = {
    checkout_started: 0,
    paid_pending_review: 0,
    approved_for_production: 0,
    total: 0,
  };

  const result = await db.prepare(
    "SELECT status, COUNT(*) as count FROM orders GROUP BY status"
  ).all();

  for (const row of result.results || []) {
    counts[row.status] = Number(row.count || 0);
    counts.total += Number(row.count || 0);
  }

  return counts;
}

export async function listOrdersForReconcile(db, limit = 12) {
  const result = await db.prepare(
    `SELECT * FROM orders
     WHERE status = ?
     ORDER BY checkout_created_at DESC
     LIMIT ?`
  )
    .bind(ORDER_STATUS.CHECKOUT_STARTED, limit)
    .all();

  return result.results || [];
}

export async function markOrderApproved(db, orderId, approvedBy = "Troels") {
  const timestamp = nowIso();
  await db.prepare(
    `UPDATE orders
     SET status = ?, approved_at = ?, approved_by = ?, updated_at = ?
     WHERE id = ?`
  )
    .bind(
      ORDER_STATUS.APPROVED_FOR_PRODUCTION,
      timestamp,
      approvedBy,
      timestamp,
      orderId,
    )
    .run();

  return getOrderById(db, orderId);
}

export async function reconcileStripeSession(env, sessionId, fallback = {}) {
  const db = ensureOrdersDb(env);
  if (!env?.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY mangler i Cloudflare Pages.");
  }
  const previousOrder = await getOrderBySessionId(db, sessionId);

  const session = await stripeRequest(
    `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=invoice`,
    env.STRIPE_SECRET_KEY,
  );

  const order = await upsertOrderFromSession(db, session, fallback);
  try {
    await notifyPaidOrder(env, order, previousOrder);
  } catch {
    // Notifikationer må aldrig blokere ordre-sync.
  }
  return order;
}

export async function reconcileRecentOrders(env, limit = 10) {
  const db = ensureOrdersDb(env);
  const candidates = await listOrdersForReconcile(db, limit);
  const reconciled = [];

  for (const candidate of candidates) {
    try {
      const order = await reconcileStripeSession(env, candidate.checkout_session_id, candidate);
      reconciled.push(order);
    } catch {
      // Hvis Stripe midlertidigt fejler, lader vi blot ordren blive stående som checkout_started.
    }
  }

  return reconciled;
}

export function formatOrderDate(value) {
  const date = new Date(value || "");
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function toneClassForStatus(status) {
  const tone = ORDER_STATUS_META[status]?.tone || "neutral";
  if (tone === "accent") {
    return "is-accent";
  }
  if (tone === "success") {
    return "is-success";
  }
  return "is-neutral";
}
