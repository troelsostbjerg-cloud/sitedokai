import { readAuthenticatedUser } from "../../_admin_auth.js";
import { ensureOrdersDb, getOrderCounts } from "../../_orders.js";

export async function onRequestGet(context) {
  const user = await readAuthenticatedUser(context.request, context.env);
  if (!user) {
    return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
      status: 401,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "private, no-store, max-age=0",
      },
    });
  }

  const counts = await getOrderCounts(ensureOrdersDb(context.env));
  return new Response(JSON.stringify({ ok: true, ...counts }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "private, no-store, max-age=0",
    },
  });
}
