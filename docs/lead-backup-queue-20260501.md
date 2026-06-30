# Lead backup queue - 2026-05-01

Status: Klargjort lokalt. Ikke live-verificeret, ikke pushet og ikke deployed.

## Formål

`gratis-mini-tjek` og `kontakt` bruger stadig FormSubmit som hovedflow. Lead backup queue er et første-parts sikkerhedsnet, så JavaScript-brugere også kan gemmes i Cloudflare D1, hvis `LEADS_DB` eller `ORDERS_DB` er konfigureret.

Backup-kaldet er ikke-blokerende. Hvis `/api/leads` fejler, mangler database eller afviser requesten, fortsætter FormSubmit-flowet stadig.

Endpointet kan også læses internt med token via `GET /api/leads`, så en CRM/sync senere kan hente nye leads uden at bygge en synlig UI først.

## Implementering

- Endpoint: `functions/api/leads.js`
- Write: `POST /api/leads`
- Read/sync: `GET /api/leads?limit=50`
- Formular-kobling: `src/layouts/Layout.astro`
- Formular-attributter:
  - `src/pages/gratis-mini-tjek.astro`
  - `src/pages/kontakt.astro`
- Schema-reference: `sql/leads_queue.sql`

## Sikkerhedsgrænser

- Accepterer kun kendte SiteDokAI origins/referers.
- Honeypot-felter giver `200` uden lagring.
- Kræver gyldigt navn og email.
- Normaliserer website URL før lagring.
- Deduplicerer på lead-type, email, website og source page.
- Returnerer kun JSON-status, ikke persondata.
- `GET /api/leads` kræver `LEADS_SYNC_TOKEN` eller `ORDERS_SYNC_TOKEN`.

## Drift

Endpointet bruger `LEADS_DB`, hvis det findes. Hvis ikke, bruger det `ORDERS_DB`. Det betyder, at eksisterende `sitedokai-orders` D1 kan bruges som midlertidig lead queue med en separat `leads` tabel.

Hvis man vil holde leads og betalte ordrer helt adskilt, opret en separat D1 binding:

```toml
[[env.production.d1_databases]]
binding = "LEADS_DB"
database_name = "sitedokai-leads"
database_id = "..."
```

## Verificeret lokalt

- `node --check functions/api/leads.js`
- Mock-DB smoke:
  - gyldigt lead -> `200` og `stored: true`
  - honeypot -> `200` og `stored: false`
  - ugyldig email -> `400`
  - manglende DB -> `503`
  - ugyldig origin -> `403`
  - token-gated `GET /api/leads` -> `200`
  - forkert token -> `401`
  - manglende token-konfiguration -> `500`

## Ikke udført

- Ingen live FormSubmit-submit.
- Ingen live D1 write.
- Ingen Cloudflare binding-oprettelse.
- Ingen deploy.
