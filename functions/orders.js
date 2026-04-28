import {
  ORDER_STATUS,
  ORDER_STATUS_META,
  ensureOrdersDb,
  formatOrderDate,
  getOrderById,
  getOrderCounts,
  htmlEscape,
  listOrders,
  markOrderApproved,
  reconcileRecentOrders,
  reconcileStripeSession,
  toneClassForStatus,
} from "./_orders.js";
import {
  createLogoutCookie,
  createSessionCookie,
  getConfiguredAdminUser,
  hasAdminAuthConfigured,
  readAuthenticatedUser,
  verifyDashboardPassword,
} from "./_admin_auth.js";

function redirectResponse(location, headers = {}) {
  return new Response(null, {
    status: 303,
    headers: {
      location,
      ...headers,
    },
  });
}

function renderLoginPage(errorMessage = "", env) {
  const message = errorMessage
    ? `<p class="orders-login-error">${htmlEscape(errorMessage)}</p>`
    : `<p class="orders-login-copy">Log ind på ordre-inboxen for at gennemgå nye bestillinger, før de sendes videre i produktion.</p>`;

  const configHint = hasAdminAuthConfigured(env)
    ? ""
    : `<p class="orders-login-hint">ORDERS_DASHBOARD_PASSWORD og ORDERS_SESSION_SECRET mangler stadig i Cloudflare-projektet.</p>`;

  return new Response(
    `<!doctype html>
<html lang="da">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Ordre-inbox · SiteDok</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=bricolage-grotesque:400,600,700,800&family=inter:400,500,600,700" rel="stylesheet">
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f7fb;
        --panel: rgba(255, 255, 255, 0.96);
        --ink: #0f172a;
        --muted: #5f6b7d;
        --accent: #f59e0b;
        --cyan: #0ea5e9;
        --border: rgba(15, 23, 42, 0.08);
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Inter, system-ui, sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(245, 158, 11, 0.15), transparent 22rem),
          radial-gradient(circle at right 20%, rgba(14, 165, 233, 0.12), transparent 22rem),
          linear-gradient(180deg, #eef4fb 0%, #f8fbff 100%);
      }
      .orders-login-shell {
        width: min(100%, 460px);
        padding: 34px;
        border-radius: 28px;
        background: var(--panel);
        border: 1px solid var(--border);
        box-shadow: 0 32px 80px rgba(15, 23, 42, 0.12);
      }
      .eyebrow {
        color: var(--cyan);
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.72rem;
        font-weight: 800;
      }
      h1 {
        margin: 12px 0;
        font-family: "Bricolage Grotesque", Inter, system-ui, sans-serif;
        font-size: clamp(2.2rem, 5vw, 3rem);
        line-height: 0.95;
      }
      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.7;
      }
      .orders-login-error {
        margin-top: 18px;
        color: #b91c1c;
        font-weight: 700;
      }
      .orders-login-hint {
        margin-top: 18px;
        color: #92400e;
        font-size: 0.92rem;
      }
      form {
        display: grid;
        gap: 12px;
        margin-top: 24px;
      }
      label {
        font-size: 0.92rem;
        font-weight: 700;
      }
      input {
        width: 100%;
        padding: 14px 16px;
        border-radius: 16px;
        border: 1px solid rgba(15, 23, 42, 0.12);
        background: #fff;
        font-size: 1rem;
      }
      button {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        border: 0;
        border-radius: 999px;
        padding: 14px 18px;
        background: var(--accent);
        color: #111827;
        font-size: 1rem;
        font-weight: 800;
        cursor: pointer;
      }
      .orders-login-note {
        margin-top: 18px;
        font-size: 0.92rem;
      }
    </style>
  </head>
  <body>
    <main class="orders-login-shell">
      <div class="eyebrow">SiteDok</div>
      <h1>Ordre-inbox</h1>
      ${message}
      ${configHint}
      <form method="post" action="/orders">
        <input type="hidden" name="action" value="login">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required>
        <button type="submit">Åbn ordre-inbox</button>
      </form>
      <p class="orders-login-note">Den her side er lavet til hurtig gennemgang af nye Stripe-ordrer på både Mac og telefon.</p>
    </main>
  </body>
</html>`,
    {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "private, no-store, max-age=0",
      },
    },
  );
}

function renderOrderLinks(order) {
  const links = [];
  if (order.stripe_invoice_hosted_url) {
    links.push(`<a href="${htmlEscape(order.stripe_invoice_hosted_url)}" target="_blank" rel="noreferrer">Åbn faktura</a>`);
  }
  if (order.stripe_invoice_pdf_url) {
    links.push(`<a href="${htmlEscape(order.stripe_invoice_pdf_url)}" target="_blank" rel="noreferrer">Hent PDF</a>`);
  }
  return links.length
    ? `<div class="order-link-row">${links.join("")}</div>`
    : "";
}

function renderOrderCards(orders, selectedId) {
  if (!orders.length) {
    return `<div class="order-empty">Ingen ordrer endnu. Når checkout bliver oprettet, lander de her med det samme.</div>`;
  }

  return orders.map((order) => {
    const meta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META[ORDER_STATUS.CHECKOUT_STARTED];
    const excerpt = order.notes
      ? htmlEscape(order.notes.length > 120 ? `${order.notes.slice(0, 117)}…` : order.notes)
      : "Ingen ekstra noter fra kunden.";
    const isSelected = Number(order.id) === Number(selectedId);
    const amount = `${htmlEscape(order.amount_dkk)} DKK`;

    return `<a class="order-card ${isSelected ? "is-selected" : ""}" href="/orders?id=${order.id}">
      <div class="order-card-head">
        <div>
          <div class="order-card-company">${htmlEscape(order.company_name)}</div>
          <div class="order-card-contact">${htmlEscape(order.contact_name)} · ${htmlEscape(order.email)}</div>
        </div>
        <span class="order-pill ${toneClassForStatus(order.status)}">${htmlEscape(meta.label)}</span>
      </div>
      <div class="order-card-meta">
        <span>${amount}</span>
        <span>${htmlEscape(order.website)}</span>
      </div>
      <p class="order-card-notes">${excerpt}</p>
    </a>`;
  }).join("");
}

function renderSelectedOrder(order, authUser) {
  if (!order) {
    return `<section class="order-detail-shell">
      <div class="order-detail-empty">
        <h2>Vælg en ordre</h2>
        <p>Klik på en ordre i venstre side for at gennemgå kundedata, noter og betaling.</p>
      </div>
    </section>`;
  }

  const meta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META[ORDER_STATUS.CHECKOUT_STARTED];
  const approveButton = order.status === ORDER_STATUS.PAID_PENDING_REVIEW
    ? `<form method="post" action="/orders" class="order-action-form">
        <input type="hidden" name="action" value="approve">
        <input type="hidden" name="order_id" value="${order.id}">
        <button type="submit" class="button-primary">OK — Godkend til produktion</button>
      </form>`
    : "";
  const reconcileButton = order.status === ORDER_STATUS.CHECKOUT_STARTED
    ? `<form method="post" action="/orders" class="order-action-form">
        <input type="hidden" name="action" value="reconcile">
        <input type="hidden" name="order_id" value="${order.id}">
        <button type="submit" class="button-secondary">Tjek Stripe igen</button>
      </form>`
    : "";
  const notes = order.notes
    ? `<div class="detail-card"><div class="detail-label">Kundens noter</div><div class="detail-notes">${htmlEscape(order.notes)}</div></div>`
    : `<div class="detail-card"><div class="detail-label">Kundens noter</div><div class="detail-notes is-muted">Kunden skrev ingen ekstra noter.</div></div>`;
  const approved = order.approved_at
    ? `${htmlEscape(formatOrderDate(order.approved_at))} · ${htmlEscape(order.approved_by || authUser)}`
    : "";

  return `<section class="order-detail-shell">
    <div class="order-detail-header">
      <div>
        <div class="detail-overline">Ordre #${order.id}</div>
        <h2>${htmlEscape(order.company_name)}</h2>
        <p>${htmlEscape(meta.description)}</p>
      </div>
      <span class="order-pill ${toneClassForStatus(order.status)}">${htmlEscape(meta.label)}</span>
    </div>

    <div class="order-detail-grid">
      <div class="detail-card">
        <div class="detail-label">Kontaktperson</div>
        <div class="detail-value">${htmlEscape(order.contact_name)}</div>
        <div class="detail-inline-value">${htmlEscape(order.email)}</div>
      </div>
      <div class="detail-card">
        <div class="detail-label">Website</div>
        <div class="detail-value"><a href="${htmlEscape(order.website)}" target="_blank" rel="noreferrer">${htmlEscape(order.website)}</a></div>
        <div class="detail-inline-value">${htmlEscape(order.amount_dkk)} DKK</div>
      </div>
      <div class="detail-card">
        <div class="detail-label">Checkout startet</div>
        <div class="detail-value">${htmlEscape(formatOrderDate(order.checkout_created_at))}</div>
        <div class="detail-inline-value">${htmlEscape(order.source_page || "website_checkout")}</div>
      </div>
      <div class="detail-card">
        <div class="detail-label">Betalt</div>
        <div class="detail-value">${order.paid_at ? htmlEscape(formatOrderDate(order.paid_at)) : "Afventer"}</div>
        <div class="detail-inline-value">${htmlEscape(order.stripe_payment_intent || order.checkout_session_id)}</div>
      </div>
    </div>

    ${notes}

    <div class="detail-card">
      <div class="detail-label">Stripe-data</div>
      <div class="detail-stack">
        <div><strong>Session:</strong> ${htmlEscape(order.checkout_session_id)}</div>
        <div><strong>Kunde:</strong> ${htmlEscape(order.stripe_customer_id || "—")}</div>
        <div><strong>Faktura:</strong> ${htmlEscape(order.stripe_invoice_number || order.stripe_invoice_id || "—")}</div>
        ${approved ? `<div><strong>Godkendt:</strong> ${approved}</div>` : ""}
      </div>
      ${renderOrderLinks(order)}
    </div>

    <div class="order-actions">
      ${approveButton}
      ${reconcileButton}
    </div>
  </section>`;
}

function renderOrdersPage({ orders, counts, selectedOrder, authUser }) {
  return new Response(
    `<!doctype html>
<html lang="da">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Ordre-inbox · SiteDok</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=bricolage-grotesque:400,600,700,800&family=inter:400,500,600,700" rel="stylesheet">
    <style>
      :root {
        color-scheme: light;
        --bg: #f4f7fb;
        --ink: #0f172a;
        --muted: #5f6b7d;
        --panel: rgba(255, 255, 255, 0.95);
        --panel-strong: rgba(255, 255, 255, 0.98);
        --border: rgba(15, 23, 42, 0.08);
        --accent: #f59e0b;
        --cyan: #0ea5e9;
        --success: #16a34a;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, system-ui, sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(245, 158, 11, 0.14), transparent 24rem),
          radial-gradient(circle at right 10%, rgba(14, 165, 233, 0.12), transparent 24rem),
          linear-gradient(180deg, #eef4fb 0%, #f8fbff 100%);
      }
      a { color: inherit; }
      .shell {
        max-width: 1440px;
        margin: 0 auto;
        padding: 28px;
      }
      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 22px;
      }
      .eyebrow {
        color: var(--cyan);
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 0.72rem;
        font-weight: 800;
      }
      h1 {
        margin: 10px 0 8px;
        font-family: "Bricolage Grotesque", Inter, system-ui, sans-serif;
        font-size: clamp(2.2rem, 4vw, 3.4rem);
        line-height: 0.95;
      }
      .topbar p {
        margin: 0;
        color: var(--muted);
        max-width: 48rem;
        line-height: 1.7;
      }
      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .ghost-button, .button-primary, .button-secondary {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 999px;
        padding: 12px 16px;
        font-weight: 800;
        text-decoration: none;
        cursor: pointer;
      }
      .ghost-button {
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid var(--border);
      }
      .button-primary {
        border: 0;
        background: var(--accent);
        color: #111827;
      }
      .button-secondary {
        border: 1px solid rgba(15, 23, 42, 0.12);
        background: white;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 18px;
      }
      .stat-card {
        padding: 18px;
        border-radius: 20px;
        background: var(--panel);
        border: 1px solid var(--border);
        box-shadow: 0 18px 48px rgba(15, 23, 42, 0.07);
      }
      .stat-label {
        font-size: 0.78rem;
        font-weight: 800;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }
      .stat-value {
        display: block;
        margin-top: 10px;
        font-family: "Bricolage Grotesque", Inter, system-ui, sans-serif;
        font-size: 2rem;
      }
      .grid {
        display: grid;
        grid-template-columns: minmax(340px, 420px) minmax(0, 1fr);
        gap: 18px;
      }
      .panel {
        min-height: 70vh;
        border-radius: 26px;
        background: var(--panel);
        border: 1px solid var(--border);
        box-shadow: 0 24px 64px rgba(15, 23, 42, 0.08);
      }
      .orders-list-shell {
        padding: 16px;
      }
      .orders-list-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }
      .orders-list-head h2 {
        margin: 0;
        font-size: 1rem;
      }
      .orders-list {
        display: grid;
        gap: 12px;
      }
      .order-card, .order-empty {
        display: block;
        padding: 16px;
        border-radius: 20px;
        text-decoration: none;
        background: rgba(255, 255, 255, 0.84);
        border: 1px solid rgba(15, 23, 42, 0.08);
      }
      .order-card.is-selected {
        border-color: rgba(14, 165, 233, 0.4);
        box-shadow: 0 18px 44px rgba(14, 165, 233, 0.12);
      }
      .order-card-head, .order-card-meta {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }
      .order-card-company {
        font-weight: 800;
      }
      .order-card-contact, .order-card-meta, .order-card-notes, .order-empty {
        color: var(--muted);
        font-size: 0.92rem;
        line-height: 1.6;
      }
      .order-card-meta {
        margin-top: 10px;
        flex-direction: column;
        gap: 4px;
      }
      .order-card-notes {
        margin: 12px 0 0;
      }
      .order-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 7px 10px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        white-space: nowrap;
      }
      .order-pill.is-neutral {
        background: rgba(15, 23, 42, 0.06);
        color: #334155;
      }
      .order-pill.is-accent {
        background: rgba(245, 158, 11, 0.16);
        color: #9a3412;
      }
      .order-pill.is-success {
        background: rgba(22, 163, 74, 0.14);
        color: #166534;
      }
      .order-detail-shell {
        padding: 24px;
      }
      .order-detail-empty {
        display: grid;
        place-items: center;
        min-height: 50vh;
        text-align: center;
      }
      .order-detail-empty h2 {
        font-family: "Bricolage Grotesque", Inter, system-ui, sans-serif;
        margin-bottom: 10px;
      }
      .order-detail-header {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        margin-bottom: 18px;
      }
      .detail-overline {
        color: var(--cyan);
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-size: 0.72rem;
        font-weight: 800;
      }
      .order-detail-header h2 {
        margin: 10px 0 8px;
        font-family: "Bricolage Grotesque", Inter, system-ui, sans-serif;
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        line-height: 0.96;
      }
      .order-detail-header p {
        margin: 0;
        color: var(--muted);
        line-height: 1.7;
      }
      .order-detail-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 14px;
      }
      .detail-card {
        padding: 18px;
        border-radius: 22px;
        background: var(--panel-strong);
        border: 1px solid rgba(15, 23, 42, 0.08);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
      }
      .detail-label {
        font-size: 0.78rem;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-weight: 800;
      }
      .detail-value {
        margin-top: 10px;
        font-weight: 800;
        font-size: 1rem;
        word-break: break-word;
      }
      .detail-value a {
        color: var(--ink);
      }
      .detail-inline-value {
        margin-top: 8px;
        color: var(--muted);
        font-size: 0.92rem;
      }
      .detail-notes {
        margin-top: 12px;
        line-height: 1.7;
        white-space: pre-wrap;
      }
      .detail-notes.is-muted {
        color: var(--muted);
      }
      .detail-stack {
        display: grid;
        gap: 8px;
        margin-top: 12px;
        color: var(--muted);
      }
      .order-link-row {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 14px;
      }
      .order-link-row a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        padding: 10px 14px;
        text-decoration: none;
        background: rgba(15, 23, 42, 0.06);
        font-weight: 700;
      }
      .order-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
      }
      .order-action-form { margin: 0; }
      .notify-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        padding: 14px 16px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(14, 165, 233, 0.18);
        color: var(--muted);
      }
      .notify-banner strong {
        color: var(--ink);
      }
      @media (max-width: 1024px) {
        .grid, .stats, .order-detail-grid {
          grid-template-columns: 1fr;
        }
        .order-detail-header, .topbar, .orders-list-head, .order-card-head {
          flex-direction: column;
          align-items: flex-start;
        }
        .shell {
          padding: 18px;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <div class="topbar">
        <div>
          <div class="eyebrow">SiteDok · Drift</div>
          <h1>Ordre-inbox</h1>
          <p>Nye bestillinger bliver fanget allerede når checkout oprettes, og betalte ordrer lander her til review før du sender dem videre i produktion.</p>
        </div>
        <div class="topbar-actions">
          <button type="button" id="enableNotifications" class="ghost-button">Aktivér notifikationer</button>
          <form method="post" action="/orders">
            <input type="hidden" name="action" value="logout">
            <button type="submit" class="ghost-button">Log ud</button>
          </form>
        </div>
      </div>

      <div class="notify-banner">
        <div><strong>${counts.paid_pending_review}</strong> ordre(r) venter på dit OK lige nu.</div>
        <div>Logget ind som ${htmlEscape(authUser)}</div>
      </div>

      <section class="stats">
        <article class="stat-card">
          <div class="stat-label">Klar til review</div>
          <span class="stat-value">${counts.paid_pending_review}</span>
        </article>
        <article class="stat-card">
          <div class="stat-label">Checkout startet</div>
          <span class="stat-value">${counts.checkout_started}</span>
        </article>
        <article class="stat-card">
          <div class="stat-label">Godkendt til produktion</div>
          <span class="stat-value">${counts.approved_for_production}</span>
        </article>
      </section>

      <section class="grid">
        <div class="panel orders-list-shell">
          <div class="orders-list-head">
            <h2>Alle ordrer</h2>
            <span class="order-pill is-neutral">${counts.total} i alt</span>
          </div>
          <div class="orders-list">${renderOrderCards(orders, selectedOrder?.id)}</div>
        </div>
        <div class="panel">${renderSelectedOrder(selectedOrder, authUser)}</div>
      </section>
    </main>
    <script>
      (() => {
        const notificationButton = document.getElementById("enableNotifications");
        let previousPending = ${counts.paid_pending_review};
        const summaryUrl = "/api/orders/summary";

        function syncDocumentTitle(count) {
          document.title = count > 0
            ? "(" + count + ") Ordre-inbox · SiteDok"
            : "Ordre-inbox · SiteDok";
        }

        syncDocumentTitle(previousPending);

        if (notificationButton) {
          notificationButton.addEventListener("click", async () => {
            if (!("Notification" in window)) {
              return;
            }
            await Notification.requestPermission();
          });
        }

        async function poll() {
          try {
            const response = await fetch(summaryUrl, { credentials: "same-origin" });
            if (!response.ok) {
              throw new Error("summary failed");
            }
            const data = await response.json();
            const nextPending = Number(data.paid_pending_review || 0);
            syncDocumentTitle(nextPending);

            if (nextPending > previousPending && "Notification" in window && Notification.permission === "granted") {
              new Notification("Ny SiteDok-ordre", {
                body: "Der er landet en betalt ordre klar til review i ordre-inboxen.",
              });
            }

            previousPending = nextPending;
          } catch {
            // Polling skal ikke bryde siden, hvis summary-endpointet fejler kortvarigt.
          }

          window.setTimeout(poll, 20000);
        }

        window.setTimeout(poll, 20000);
      })();
    </script>
  </body>
</html>`,
    {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "private, no-store, max-age=0",
      },
    },
  );
}

async function handlePost(context) {
  const form = await context.request.formData();
  const action = String(form.get("action") || "").trim();
  const user = await readAuthenticatedUser(context.request, context.env);

  if (action === "login") {
    const password = String(form.get("password") || "");
    const isValid = await verifyDashboardPassword(context.env, password);
    if (!isValid) {
      return renderLoginPage("Forkert password.", context.env);
    }

    const username = getConfiguredAdminUser(context.env);
    return redirectResponse("/orders", {
      "set-cookie": await createSessionCookie(context.env, username),
    });
  }

  if (action === "logout") {
    return redirectResponse("/orders", {
      "set-cookie": createLogoutCookie(),
    });
  }

  if (!user) {
    return renderLoginPage("Log ind igen for at fortsætte.", context.env);
  }

  const db = ensureOrdersDb(context.env);
  const orderId = Number(form.get("order_id") || 0);
  const order = orderId ? await getOrderById(db, orderId) : null;

  if (!order) {
    return redirectResponse("/orders");
  }

  if (action === "approve") {
    await markOrderApproved(db, order.id, user);
    return redirectResponse(`/orders?id=${order.id}`);
  }

  if (action === "reconcile") {
    await reconcileStripeSession(context.env, order.checkout_session_id, order);
    return redirectResponse(`/orders?id=${order.id}`);
  }

  return redirectResponse(`/orders?id=${order.id}`);
}

async function handleGet(context) {
  if (!hasAdminAuthConfigured(context.env)) {
    return renderLoginPage("", context.env);
  }

  const user = await readAuthenticatedUser(context.request, context.env);
  if (!user) {
    return renderLoginPage("", context.env);
  }

  await reconcileRecentOrders(context.env, 10);

  const db = ensureOrdersDb(context.env);
  const orders = await listOrders(db, 100);
  const counts = await getOrderCounts(db);
  const selectedId = Number(new URL(context.request.url).searchParams.get("id") || 0);
  const selectedOrder = orders.find((order) => Number(order.id) === selectedId) || orders[0] || null;

  return renderOrdersPage({
    orders,
    counts,
    selectedOrder,
    authUser: user,
  });
}

export async function onRequestGet(context) {
  return handleGet(context);
}

export async function onRequestPost(context) {
  return handlePost(context);
}
