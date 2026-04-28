const PUSHOVER_API_URL = "https://api.pushover.net/1/messages.json";

function normalizeText(value) {
  return String(value || "").trim();
}

export function isPushoverConfigured(env) {
  return Boolean(
    normalizeText(env?.PUSHOVER_API_TOKEN)
    && normalizeText(env?.PUSHOVER_USER_KEY),
  );
}

export async function sendPushoverNotification(env, {
  title,
  message,
  url,
  urlTitle,
  priority = 0,
  sound,
} = {}) {
  if (!isPushoverConfigured(env)) {
    return { ok: false, skipped: true, reason: "missing_config" };
  }

  const body = new URLSearchParams({
    token: normalizeText(env.PUSHOVER_API_TOKEN),
    user: normalizeText(env.PUSHOVER_USER_KEY),
    title: normalizeText(title || "SiteDok"),
    message: normalizeText(message),
    priority: String(priority),
  });

  if (normalizeText(url)) {
    body.set("url", normalizeText(url));
  }
  if (normalizeText(urlTitle)) {
    body.set("url_title", normalizeText(urlTitle));
  }
  if (normalizeText(sound)) {
    body.set("sound", normalizeText(sound));
  }

  const response = await fetch(PUSHOVER_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Pushover-fejl (${response.status}): ${detail || response.statusText}`,
    );
  }

  return { ok: true };
}
