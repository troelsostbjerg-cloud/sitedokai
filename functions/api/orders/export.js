import { ensureOrdersDb } from "../../_orders.js";

const DEFAULT_LIMIT = 50;
const EXPORTABLE_STATUSES = ["paid_pending_review", "approved_for_production"];

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
    request.headers.get("x-orders-sync-token")
    || request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
    || "",
  ).trim();
}

export async function onRequestGet(context) {
  const expectedToken = String(context.env.ORDERS_SYNC_TOKEN || "").trim();
  if (!expectedToken) {
    return jsonResponse(500, { ok: false, error: "ORDERS_SYNC_TOKEN mangler." });
  }

  const providedToken = readSyncToken(context.request);
  if (!providedToken || providedToken !== expectedToken) {
    return jsonResponse(401, { ok: false, error: "unauthorized" });
  }

  const limit = Math.max(
    1,
    Math.min(
      Number(new URL(context.request.url).searchParams.get("limit") || DEFAULT_LIMIT),
      200,
    ),
  );

  const placeholders = EXPORTABLE_STATUSES.map(() => "?").join(", ");
  const result = await ensureOrdersDb(context.env).prepare(
    `SELECT
      id,
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
      approved_at,
      approved_by,
      updated_at
    FROM orders
    WHERE status IN (${placeholders})
    ORDER BY COALESCE(paid_at, updated_at, checkout_created_at) DESC
    LIMIT ?`
  )
    .bind(...EXPORTABLE_STATUSES, limit)
    .all();

  return jsonResponse(200, {
    ok: true,
    orders: result.results || [],
  });
}
