import { reconcileStripeSession } from "../../_orders.js";

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store, max-age=0",
    },
  });
}

async function readSessionId(request) {
  if (request.method === "POST") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData();
      return String(form.get("session_id") || "").trim();
    }
  }

  return String(new URL(request.url).searchParams.get("session_id") || "").trim();
}

async function handleConfirm(context) {
  const sessionId = await readSessionId(context.request);
  if (!sessionId) {
    return jsonResponse(400, { ok: false, error: "session_id mangler" });
  }

  try {
    const order = await reconcileStripeSession(context.env, sessionId);
    return jsonResponse(200, {
      ok: true,
      order_id: order?.id || null,
      status: order?.status || null,
    });
  } catch (error) {
    return jsonResponse(502, {
      ok: false,
      error: error instanceof Error ? error.message : "Ukendt fejl ved ordre-sync.",
    });
  }
}

export async function onRequestGet(context) {
  return handleConfirm(context);
}

export async function onRequestPost(context) {
  return handleConfirm(context);
}
