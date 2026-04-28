import { reconcileStripeSession } from "../../_orders.js";

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256(secret, value) {
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
    new TextEncoder().encode(value),
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

async function verifyStripeSignature(secret, rawPayload, signatureHeader) {
  if (!signatureHeader) {
    return false;
  }

  const parts = Object.fromEntries(
    signatureHeader
      .split(",")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const [key, value] = chunk.split("=", 2);
        return [key, value];
      }),
  );

  if (!parts.t || !parts.v1) {
    return false;
  }

  const signedPayload = `${parts.t}.${rawPayload}`;
  const expected = await hmacSha256(secret, signedPayload);
  return timingSafeEqual(expected, parts.v1);
}

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store, max-age=0",
    },
  });
}

function readCrmSyncConfig(env) {
  const baseUrl = String(env.SITEDOK_CRM_BASE_URL || "").trim().replace(/\/$/, "");
  const token = String(env.CRM_SYNC_TOKEN || env.ORDERS_SYNC_TOKEN || "").trim();
  if (!baseUrl || !token) {
    return null;
  }
  return {
    url: `${baseUrl}/crm/webhooks/orders-sync`,
    token,
  };
}

async function pushOrderIntoLocalCrm(env, order) {
  const config = readCrmSyncConfig(env);
  if (!config || !order?.checkout_session_id) {
    return { attempted: false };
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-orders-sync-token": config.token,
    },
    body: JSON.stringify({ order }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `CRM sync fejlede (${response.status})`);
  }

  const payload = await response.json().catch(() => ({}));
  return {
    attempted: true,
    ok: true,
    duplicate: Boolean(payload?.duplicate),
    order_id: payload?.order_id || null,
  };
}

export async function onRequestPost(context) {
  if (!context.env.STRIPE_WEBHOOK_SECRET) {
    return jsonResponse(500, { ok: false, error: "STRIPE_WEBHOOK_SECRET mangler." });
  }

  const rawPayload = await context.request.text();
  const signatureHeader = context.request.headers.get("stripe-signature");
  const isValid = await verifyStripeSignature(
    context.env.STRIPE_WEBHOOK_SECRET,
    rawPayload,
    signatureHeader,
  );

  if (!isValid) {
    return jsonResponse(401, { ok: false, error: "Ugyldig Stripe-signatur." });
  }

  let event;
  try {
    event = JSON.parse(rawPayload);
  } catch {
    return jsonResponse(400, { ok: false, error: "Webhook payload var ikke gyldig JSON." });
  }

  if (event?.type !== "checkout.session.completed") {
    return jsonResponse(200, { ok: true, ignored: true, event_type: event?.type || null });
  }

  const sessionId = event?.data?.object?.id;
  if (!sessionId) {
    return jsonResponse(400, { ok: false, error: "checkout.session.completed manglede session id." });
  }

  try {
    const order = await reconcileStripeSession(context.env, sessionId);
    let crmSync = { attempted: false };
    try {
      crmSync = await pushOrderIntoLocalCrm(context.env, order);
    } catch (error) {
      crmSync = {
        attempted: true,
        ok: false,
        error: error instanceof Error ? error.message : "CRM sync fejlede.",
      };
    }

    return jsonResponse(200, {
      ok: true,
      order_id: order?.id || null,
      status: order?.status || null,
      session_id: sessionId,
      crm_sync: crmSync,
    });
  } catch (error) {
    return jsonResponse(502, {
      ok: false,
      error: error instanceof Error ? error.message : "Kunne ikke synce Stripe-session.",
    });
  }
}
