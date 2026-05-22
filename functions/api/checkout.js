import { ensureOrdersDb, insertCheckoutStarted } from "../_orders.js";

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const WEBSITE_CHECK_AMOUNT_ORE = 249500;
const DEFAULT_PRODUCT_NAME = "SiteDok AI Audit + Client Room";
const DEFAULT_PRODUCT_DESCRIPTION = "AI Audit med Client Room, AI-synlighed, konkurrenter, kilder og Executive PDF";
const ALLOWED_PUBLIC_ORIGINS = new Set([
  "https://sitedokai.com",
  "https://www.sitedokai.com",
  "https://sitedokai-preview.pages.dev",
  "https://sitedokai-checkout.pages.dev",
]);

function htmlEscape(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeText(value, maxLength = 500) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeMultilineText(value, maxLength = 2000) {
  return String(value || "").trim().replace(/\r\n/g, "\n").slice(0, maxLength);
}

function normalizeWebsite(value) {
  const raw = normalizeText(value, 500);
  if (!raw) {
    return "";
  }
  const candidate = raw.includes("://") ? raw : `https://${raw}`;
  try {
    const url = new URL(candidate);
    return url.toString();
  } catch {
    return "";
  }
}

function normalizeReturnPath(value, fallbackPath) {
  const candidate = String(value || "").trim();
  if (!candidate.startsWith("/")) {
    return fallbackPath;
  }
  if (candidate.startsWith("//")) {
    return fallbackPath;
  }
  return candidate;
}

function normalizePublicOrigin(value) {
  const candidate = String(value || "").trim();
  if (!candidate) {
    return "";
  }

  try {
    const url = new URL(candidate);
    return ALLOWED_PUBLIC_ORIGINS.has(url.origin) ? url.origin : "";
  } catch {
    return "";
  }
}

function isAllowedRequestSource(value) {
  const candidate = String(value || "").trim();
  if (!candidate) {
    return true;
  }
  return Boolean(normalizePublicOrigin(candidate));
}

function fallbackPathFromReferer(referer) {
  if (!referer) {
    return "/kontakt";
  }

  try {
    return normalizeReturnPath(new URL(referer).pathname, "/kontakt");
  } catch {
    return "/kontakt";
  }
}

function renderErrorPage({ title, message, backHref }) {
  const safeTitle = htmlEscape(title);
  const safeMessage = htmlEscape(message);
  const safeBackHref = htmlEscape(backHref || "/kontakt");

  return `<!doctype html>
<html lang="da">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>${safeTitle}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #fbf7ef;
        --panel: rgba(255, 253, 248, 0.96);
        --ink: #202622;
        --muted: #66706a;
        --border: rgba(32, 38, 34, 0.10);
        --accent: #6f8a72;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Outfit, system-ui, sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(223, 232, 220, 0.55), transparent 22rem),
          radial-gradient(circle at right 20%, rgba(111, 138, 114, 0.14), transparent 24rem),
          linear-gradient(180deg, #fbf7ef 0%, #f7f2e8 100%);
      }
      main {
        width: min(100%, 520px);
        padding: 32px;
        border-radius: 28px;
        background: var(--panel);
        border: 1px solid var(--border);
        box-shadow: 0 32px 80px rgba(32, 38, 34, 0.10);
      }
      .eyebrow {
        color: #526b55;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        font-size: 0.72rem;
        font-weight: 800;
      }
      h1 {
        margin: 14px 0 12px;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(2rem, 4vw, 2.8rem);
        line-height: 0.98;
      }
      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.7;
      }
      a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-top: 24px;
        padding: 14px 20px;
        border-radius: 14px;
        background: var(--accent);
        color: #ffffff;
        font-weight: 800;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="eyebrow">Checkout</div>
      <h1>${safeTitle}</h1>
      <p>${safeMessage}</p>
      <a href="${safeBackHref}">Tilbage til bestillingen</a>
    </main>
  </body>
</html>`;
}

function errorResponse(status, title, message, backHref) {
  return new Response(
    renderErrorPage({ title, message, backHref }),
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "private, no-store, max-age=0",
      },
    },
  );
}

async function stripeRequest(path, secretKey, body) {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${secretKey}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = await response.json();
  if (!response.ok) {
    const detail = payload?.error?.message || `Stripe API-fejl (${response.status})`;
    throw new Error(detail);
  }

  return payload;
}

function buildCustomerPayload(form) {
  const params = new URLSearchParams();
  params.set("name", form.companyName);
  params.set("email", form.email);
  params.set("metadata[company_name]", form.companyName);
  params.set("metadata[contact_name]", form.contactName);
  params.set("metadata[email]", form.email);
  params.set("metadata[website]", form.website);
  params.set("metadata[notes]", form.notes);
  params.set("metadata[source_page]", form.sourcePage);
  params.set("metadata[product]", "ai_audit_client_room");
  return params;
}

function buildCheckoutPayload({ customerId, publicOrigin, form, env }) {
  const params = new URLSearchParams();
  const successUrl = `${publicOrigin}/tak?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${publicOrigin}${form.returnPath}`;
  const noteForMetadata = form.notes.slice(0, 500);
  const websiteForInvoice = form.website.slice(0, 140);
  const contactForInvoice = form.contactName.slice(0, 140);

  params.set("mode", "payment");
  params.set("locale", "da");
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);
  params.set("customer", customerId);
  params.set("customer_update[address]", "auto");
  params.set("payment_method_types[0]", "card");
  params.set("billing_address_collection", "required");
  params.set("phone_number_collection[enabled]", "false");
  params.set("invoice_creation[enabled]", "true");
  params.set("metadata[company_name]", form.companyName);
  params.set("metadata[contact_name]", form.contactName);
  params.set("metadata[email]", form.email);
  params.set("metadata[website]", form.website);
  params.set("metadata[notes]", noteForMetadata);
  params.set("metadata[source_page]", form.sourcePage);
  params.set("metadata[product]", "ai_audit_client_room");
  params.set("metadata[product_label]", DEFAULT_PRODUCT_NAME);
  params.set("payment_intent_data[metadata][company_name]", form.companyName);
  params.set("payment_intent_data[metadata][contact_name]", form.contactName);
  params.set("payment_intent_data[metadata][email]", form.email);
  params.set("payment_intent_data[metadata][website]", form.website);
  params.set("payment_intent_data[metadata][notes]", noteForMetadata);
  params.set("payment_intent_data[metadata][source_page]", form.sourcePage);
  params.set("invoice_creation[invoice_data][metadata][company_name]", form.companyName);
  params.set("invoice_creation[invoice_data][metadata][contact_name]", form.contactName);
  params.set("invoice_creation[invoice_data][metadata][email]", form.email);
  params.set("invoice_creation[invoice_data][metadata][website]", form.website);
  params.set("invoice_creation[invoice_data][metadata][notes]", noteForMetadata);
  params.set("invoice_creation[invoice_data][metadata][source_page]", form.sourcePage);
  params.set("invoice_creation[invoice_data][custom_fields][0][name]", "Website");
  params.set("invoice_creation[invoice_data][custom_fields][0][value]", websiteForInvoice);
  params.set("invoice_creation[invoice_data][custom_fields][1][name]", "Kontakt");
  params.set("invoice_creation[invoice_data][custom_fields][1][value]", contactForInvoice);

  const websiteCheckPriceId = env.STRIPE_AUDIT_PRICE_ID || env.STRIPE_WEBSITE_CHECK_PRICE_ID;
  if (websiteCheckPriceId) {
    params.set("line_items[0][price]", websiteCheckPriceId);
  } else {
    params.set("line_items[0][price_data][currency]", "dkk");
    params.set("line_items[0][price_data][unit_amount]", String(WEBSITE_CHECK_AMOUNT_ORE));
    params.set("line_items[0][price_data][product_data][name]", DEFAULT_PRODUCT_NAME);
    params.set("line_items[0][price_data][product_data][description]", DEFAULT_PRODUCT_DESCRIPTION);
  }
  params.set("line_items[0][quantity]", "1");
  return params;
}

function readForm(formData, fallbackPath) {
  return {
    companyName: normalizeText(formData.get("company_name"), 120),
    contactName: normalizeText(formData.get("name"), 120),
    email: normalizeText(formData.get("email"), 160).toLowerCase(),
    phone: normalizeText(formData.get("phone"), 40),
    website: normalizeWebsite(formData.get("website")),
    notes: normalizeMultilineText(formData.get("message"), 500),
    sourcePage: normalizeText(formData.get("source_page"), 80) || "website_checkout",
    returnPath: normalizeReturnPath(formData.get("return_path"), fallbackPath),
    siteOrigin: normalizePublicOrigin(formData.get("site_origin")),
    acceptedTerms: formData.has("gdpr"),
    botField: normalizeText(formData.get("website_extra"), 200),
  };
}

export async function onRequestPost(context) {
  const requestOrigin = new URL(context.request.url).origin;
  const referer = context.request.headers.get("referer");
  const fallbackPath = fallbackPathFromReferer(referer);
  const formData = await context.request.formData();
  const form = readForm(formData, fallbackPath);
  const publicOrigin = form.siteOrigin || requestOrigin;
  const backHref = `${publicOrigin}${form.returnPath}`;

  if (!isAllowedRequestSource(context.request.headers.get("origin")) || !isAllowedRequestSource(referer)) {
    return errorResponse(
      403,
      "Bestillingen kunne ikke startes",
      "Checkout kan kun startes fra SiteDokAIs egne sider. Prøv igen fra sitedokai.com, eller skriv direkte til info@sitedokai.com.",
      backHref,
    );
  }

  if (form.botField) {
    return errorResponse(
      400,
      "Bestillingen kunne ikke startes",
      "Prøv igen, eller skriv direkte til info@sitedokai.com, så hjælper vi manuelt.",
      backHref,
    );
  }

  if (!context.env.STRIPE_SECRET_KEY) {
    return errorResponse(
      500,
      "Checkout er ikke klar endnu",
      "Stripe-nøglen mangler i website-miljøet. Tilføj STRIPE_SECRET_KEY i Cloudflare Pages, og prøv igen.",
      backHref,
    );
  }

  try {
    ensureOrdersDb(context.env);
  } catch (error) {
    return errorResponse(
      500,
      "Ordre-inbox er ikke klar endnu",
      error instanceof Error
        ? error.message
        : "Vi kunne ikke forbinde checkout til ordre-inboxen.",
      backHref,
    );
  }

  if (!form.companyName || !form.contactName || !form.email || !form.website) {
    return errorResponse(
      400,
      "Der mangler oplysninger",
      "Udfyld firmanavn, kontaktperson, email og website, før vi kan sende dig videre til betaling.",
      backHref,
    );
  }

  if (!form.acceptedTerms) {
    return errorResponse(
      400,
      "Samtykke mangler",
      "Du skal acceptere, at vi bruger oplysningerne til at håndtere ordren, før checkout kan starte.",
      backHref,
    );
  }

  try {
    const customer = await stripeRequest(
      "/customers",
      context.env.STRIPE_SECRET_KEY,
      buildCustomerPayload(form),
    );

    const session = await stripeRequest(
      "/checkout/sessions",
      context.env.STRIPE_SECRET_KEY,
      buildCheckoutPayload({
        customerId: customer.id,
        publicOrigin,
        form,
        env: context.env,
      }),
    );

    if (!session?.url) {
      throw new Error("Stripe returnerede ikke en checkout-URL.");
    }

    await insertCheckoutStarted(context.env.ORDERS_DB, {
      checkout_session_id: session.id,
      company_name: form.companyName,
      contact_name: form.contactName,
      email: form.email,
      phone: form.phone,
      website: form.website,
      notes: form.notes,
      source_page: form.sourcePage,
      public_origin: publicOrigin,
      checkout_url: session.url,
      stripe_customer_id: customer.id,
      amount_dkk: Math.round(WEBSITE_CHECK_AMOUNT_ORE / 100),
      currency: "dkk",
      checkout_created_at: session.created
        ? new Date(Number(session.created) * 1000).toISOString()
        : new Date().toISOString(),
    });

    return Response.redirect(session.url, 303);
  } catch (error) {
    return errorResponse(
      502,
      "Stripe kunne ikke starte checkout",
      error instanceof Error
        ? error.message
        : "Ukendt fejl ved oprettelse af checkout-session.",
      backHref,
    );
  }
}
