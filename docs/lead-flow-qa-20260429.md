# Lead/checkout-flow QA - 2026-04-29

Ejer: Spor 2 - Lead/checkout-flow QA  
Scope: `gratis-mini-tjek`, `kontakt`, `tak`, checkout functions og relevante API/fallback paths i `website/astro-site`.

## Kort status

Overordnet status: **OK til fortsat staging/QA, med flere hardening-punkter rettet lokalt efter denne QA.**

Det vigtigste virker i kode og build:

- `Gratis mini-tjek` og `Kontakt` bruger HTTPS FormSubmit AJAX til `info@sitedokai.com`, har honeypot og mailto-fallback.
- `Hjemmeside-tjek` har betalt checkout-formular, poster til `https://sitedokai-checkout.pages.dev/api/checkout`, kræver GDPR-checkbox og har manuel mailfallback.
- `/api/checkout` validerer centrale felter, opretter Stripe Customer + Checkout Session, skriver `checkout_started` i D1 ordre-inbox og sender kunden videre til Stripe med `303`.
- `/api/stripe/webhook` kræver Stripe-signatur, reconciler session via Stripe API, opdaterer D1 og forsøger CRM-sync uden at blokere webhook-svaret.
- `/orders`, `/api/orders/summary` og `/api/orders/export` har auth/token-gates.
- Astro build og JS syntax checks passerede.

Der er dog stadig konkrete risici, især live betaling/FormSubmit delivery, første-parts lead-backup og den hårdkodede produktions-checkout-URL.

## Opdatering efter integration

Efter QA'en blev skrevet, er disse små rettelser gennemført lokalt:

- Stripe webhook-signatur parser nu flere `v1`-signaturer og afviser events uden for et 5-minutters timestamp-vindue.
- Checkout-formularen har fået server-side honeypot (`website_extra`), så bots ikke opretter Stripe-sessioner.
- `/api/checkout` parser `referer` mere defensivt, så en ugyldig header ikke bryder flowet før pæn fejlvisning.
- Stripe phone collection er slået fra for at holde checkout mere lavfriktions.
- `gratis-mini-tjek` og `kontakt` har fået `noscript`-fallback med direkte mail-link.
- `/tak`-copy er gjort mere robust, så direkte besøg uden verificeret betaling ikke lyder som en bekræftet ordre.

## Opdatering 2026-05-01 - optimeringsflow

Denne runde strammede lead- og checkout-flowet yderligere uden at sende formularer, oprette Stripe-sessioner, pushe eller deploye:

- `gratis-mini-tjek` og `kontakt` bruger nu normal FormSubmit `action` som no-JS fallback og `data-ajax-action` til AJAX-endpointet. Det betyder, at JavaScript-brugere beholder inline success/error, mens no-JS ikke lander på et råt AJAX-svar.
- Ny noindex-side: `/tak-for-henvendelsen`, så gratis mini-tjek og kontakt har en rolig, branded tak-side via `_next`.
- `Hjemmeside-tjek` linker nu til `/eksempel`, og sitemap inkluderer `/eksempel`, så en tøvende kunde kan se et konkret eksempel før checkout.
- `/api/checkout` afviser requests med kendt, men ikke-godkendt `Origin` eller `Referer`, så produktionscheckout kun kan startes fra SiteDokAIs egne sider i normale browserflows.
- Sekundære service-/blogflader er rettet, så de igen peger mod primær CTA: `Få gratis mini-tjek`.
- Om-sidens primære CTA er rettet til `Få gratis mini-tjek`.
- `public/sitemap.xml` er genskabt og inkluderer både `/eksempel` og `/use-cases`, så buildet igen kopierer en aktiv sitemap til `dist/sitemap.xml`.
- Forsidens meta-description og den lange blog-title for `Visuelt løft` er kortet ned, så snippets ikke bliver unødigt tunge.
- `/tak`-sidens meta-description er kortet ned efter ny statisk check.
- `/room/*` og `/mockups/*` er tilføjet som lokale safety-blocks i Pages Functions routing, så næste godkendte deploy kan returnere `404` + `no-store` for gamle client-room/mockup paths.
- `robots.txt` disallow'er nu også `/room/` og `/mockups/`, så crawl-signalet matcher blokeringen.
- `public/_headers` er tilføjet med lavrisiko sikkerhedsheaders for Cloudflare Pages.
- `/api/leads` er klargjort som første-parts backup for gratis lead/kontakt, og formularerne kalder endpointet ikke-blokerende før FormSubmit-hovedflowet.
- `GET /api/leads` er klargjort som token-beskyttet intern lead-eksport til senere CRM/sync.
- Lead backup er dokumenteret i `docs/lead-backup-queue-20260501.md` og schema-reference ligger i `sql/leads_queue.sql`.

Verificeret:

- `npm run build` bygger 19 sider.
- `node --check` passerer for checkout, webhook, ordre-core, ordre-side, confirm, export, summary, admin-auth, notify og middleware.
- Lokal smoke: ugyldig checkout-origin returnerer `403`; kendt SiteDokAI-origin går videre til normal miljøvalidering uden Stripe-kald.
- Lokal runtime-check på dev-serveren returnerede `200` for de vigtigste public routes.
- Statisk public dist-check: 0 issues for public pages, meta, canonical, alt, noindex/sitemap relation og sitemap coverage.
- Middleware-smoke bekræftede at `/room/*` og `/mockups/*` blokeres lokalt uden at blokere `/api/checkout`.
- Build kopierer `dist/_headers` og `dist/_routes.json`.
- Read-only live-sitemap check viser at live stadig mangler `/eksempel` og `/use-cases`; lokal sitemap er klar, men kræver deploy før den er live.
- Lokal dev-server route-smoke returnerede `200` for alle centrale public routes, og intern linkcheck fandt 0 manglende interne links.
- Browser preview viste `/tak-for-henvendelsen` korrekt, bekræftede `/use-cases` uden betalt first-step CTA og bekræftede form `action`/`data-ajax-action`/`_next` på `gratis-mini-tjek` og `kontakt`.
- `/api/leads` mock-smoke: gyldigt lead returnerede `200/stored:true`, honeypot `200/stored:false`, ugyldig email `400`, manglende DB `503` og ugyldig origin `403`.
- `/api/leads` intern eksport-smoke: korrekt token returnerede `200`, forkert token `401`, og manglende token-konfiguration `500`.

Efter rettelserne passerede:

- `node --check functions/api/checkout.js`
- `node --check functions/api/stripe/webhook.js`
- Signatur-smoke: frisk multi-`v1` test returnerede `200`, gammel timestamp returnerede `401`.
- `npm run build`: 19 sider bygget.

## Gennemgåede paths

Public lead/order pages:

- `src/pages/gratis-mini-tjek.astro`
- `src/pages/kontakt.astro`
- `src/pages/hjemmeside-tjek.astro`
- `src/pages/tak.astro`
- `src/layouts/Layout.astro`

Cloudflare Pages functions:

- `functions/api/checkout.js`
- `functions/api/stripe/webhook.js`
- `functions/_orders.js`
- `functions/orders.js`
- `functions/api/orders/summary.js`
- `functions/api/orders/confirm.js`
- `functions/api/orders/export.js`
- `functions/_admin_auth.js`
- `functions/_notify.js`
- `functions/_middleware.js`

Config/data:

- `wrangler.toml`
- `sql/orders_inbox.sql`

## Kommandoer kørt

- `git status --short --branch`
- `rg --files`
- `rg -n "data-ajax-email-form|formsubmit|fetch\\(" src functions -S`
- `rg -n "checkoutAction|/api/checkout|/api/stripe/webhook|/api/orders|formsubmit|mailto:|/tak|session_id|data-ajax-email-form" -S src functions public`
- `npm run build`
- `node --check functions/api/checkout.js`
- `node --check functions/api/stripe/webhook.js`
- `node --check functions/_orders.js`
- `node --check functions/orders.js`
- `node --check functions/api/orders/confirm.js`
- `rg -n "formsubmit|sitedokai-checkout|/tak\\?session_id|data-ajax-email-form|mailto:info@sitedokai.com|/api/checkout" dist/gratis-mini-tjek dist/kontakt dist/hjemmeside-tjek dist/tak -S`
- `git status --short`

Resultat:

- `npm run build` passerede og byggede 18 sider.
- Alle `node --check` checks passerede uden syntax-fejl.
- Ingen live betaling, ingen Stripe charge, ingen FormSubmit-send, ingen deploy/push/GitHub-kommentarer.

## Fund

### 1. Lead-formularer er funktionelle, men no-JS fallback er svag

Status: **Reduceret risiko efter rettelse**

`gratis-mini-tjek` og `kontakt` poster til `https://formsubmit.co/ajax/info@sitedokai.com` og bliver håndteret af den inline AJAX-handler i `Layout.astro`. Det er fint, når JavaScript virker: URL normaliseres, knappen disables under submit, success/error vises inline, og der findes direkte mail-link som fallback.

Risikoen er, at selve `action` peger på FormSubmits AJAX-endpoint. Hvis JavaScript ikke loader, fejler, blokeres eller brugeren submitter på en atypisk browser, kan browseren navigere til et JSON/API-svar i stedet for en pæn tak-/fallback-oplevelse.

Gennemført delvist:

- Begge lead forms har nu `noscript`-fallback med direkte mail-link.

Større mulig senere rettelse:

- Skift progressive enhancement-model, så `action` er en normal FormSubmit URL med `_next`, og lad JavaScript stadig sende AJAX med `Accept: application/json`.

### 2. Betalt checkout-flow er godt koblet, men starter live produktionscheckout fra statisk side

Status: **Reduceret risiko efter rettelse**

`hjemmeside-tjek` har `checkoutAction = 'https://sitedokai-checkout.pages.dev/api/checkout'` og `siteOrigin = 'https://sitedokai.com'`. Det gør live-flowet konkret og enkelt, men betyder også at enhver renderet kopi af siden kan starte checkout-sessioner på produktions-checkout-projektet, hvis formularen indsendes.

Det er ikke det samme som en betaling, men det kan skabe Stripe Customers, Checkout Sessions og `checkout_started`-rækker før kunden betaler.

Gennemført:

- Checkout-formularen har nu honeypot-felt, og `/api/checkout` afviser udfyldt honeypot før Stripe-kald.
- `referer` parsing er gjort defensiv.

Stadig relevant:

- Gør det eksplicit i docs eller kodekommentar, at denne side bruger produktions-checkout.
- Overvej en miljøstyret checkout URL ved preview/lokal QA, eller en server-side origin check/rate limit.

### 3. Webhook-signatur bør hærdes

Status: **Rettet lokalt**

`functions/api/stripe/webhook.js` kræver `STRIPE_WEBHOOK_SECRET` og afviser requests uden gyldig signatur. Det er godt.

Rettelse:

- Parser alle `v1` værdier.
- Afviser events hvor `t` ligger mere end 5 minutter fra lokal tid.
- Accepterer hvis en af `v1`-signaturerne matcher.
- Smoke-test bekræftede `200` for frisk signatur og `401` for gammel timestamp.

### 4. Checkout kan få lidt unødvendig friktion

Status: **Reduceret risiko efter rettelse**

Checkout-formularen indsamler firmanavn, kontaktperson, email, website, noter og GDPR. Derefter sætter `/api/checkout`:

- `billing_address_collection = required`
- `phone_number_collection[enabled] = "false"`

Billing address er stadig slået til for faktura/kvittering, men telefonfeltet er nu fjernet fra Stripe checkout for at holde flowet lavfriktions.

Rettelse:

- Phone collection er sat til `false`, så kunden ikke bliver mødt af et ekstra telefonfelt i Stripe checkout.

### 5. `/tak` er brugbar, men bekræfter ikke synligt sessionen

Status: **Reduceret risiko efter rettelse**

Stripe success URL bygges som `${publicOrigin}/tak?session_id={CHECKOUT_SESSION_ID}`. Tak-siden er noindex og har god supportfallback.

Men siden viser samme "Dit Hjemmeside-tjek er bestilt" uanset om der findes `session_id`. Backend-reconciliation afhænger primært af webhook og sekundært af `/orders`/`reconcileRecentOrders` eller `/api/orders/confirm`.

Rettelse:

- Copyen siger nu tydeligere "Hvis betalingen er gennemført..." og "Når betalingen er registreret...".

Mulig senere rettelse:

- Overvej et lille client-side kald til checkout-domainets confirm endpoint, hvis `session_id` findes, men kun hvis CORS/hosting er bevidst løst.

### 6. Gratis leads lander kun i mailflow, ikke i første-parts ordre/lead-inbox

Status: **Reduceret risiko efter lokal klargøring**

Gratis mini-tjek og kontakt bruger FormSubmit direkte. Det er godt nok som lavfriktions start, men der er ingen D1/CRM backup på website-siden. Hvis FormSubmit, maillevering eller inbox-routing fejler, er der ikke en lokal lead-kopi.

Gennemført:

- Behold FormSubmit for nu.
- Tilføj `/api/leads` som første-parts backup, der kan skrive til `LEADS_DB` eller `ORDERS_DB`.
- Kobl `gratis-mini-tjek` og `kontakt` på backup-endpointet ikke-blokerende, så FormSubmit stadig er hovedflow.
- Tilføj token-beskyttet `GET /api/leads`, så leads senere kan eksporteres til CRM/sync.

Stadig relevant:

- Live D1-write er ikke testet uden deploy/Cloudflare-godkendelse.
- Der mangler stadig en intern lead-inbox UI, hvis Troels vil bruge lead queue aktivt i daglig drift.

### 7. `referer` parsing i `/api/checkout` kan gøres mere defensiv

Status: **Rettet lokalt**

`fallbackPath` brugte tidligere `new URL(referer).pathname`, hvis `referer` fandtes. En ugyldig eller manipuleret header kunne give en uventet exception før den pæne error response.

Rettelse:

- `referer` parsing er nu wrapped i `try/catch` og falder tilbage til `/kontakt`.

## Positive observationer

- Betalt checkout har en god "før betaling" ordre-inbox-model: `checkout_started` gemmes før redirect til Stripe.
- Webhook reconciler med Stripe API ud fra session ID i stedet for blindt at stole på webhook-payload metadata.
- CRM-sync er non-blocking i webhook: fejl rapporteres i JSON, men Stripe får stadig et 200-svar hvis order reconciliation lykkes.
- Export endpoint kræver `ORDERS_SYNC_TOKEN` og eksporterer kun betalte/godkendte ordrer.
- Admin dashboard kræver password + session secret og bruger HttpOnly/Secure/SameSite cookie.
- Manual fallback er synlig på både lead-, kontakt-, checkout- og tak-side.
- Build bekræfter at de relevante routes genereres.

## Blokere / ikke verificeret

- Ingen live betaling testet. Det ville kræve eksplicit godkendelse og er uden for guardrails.
- Ingen FormSubmit-submit testet, fordi det ville sende eksternt til `info@sitedokai.com`.
- Ingen live Stripe API-call, webhook event eller Cloudflare secret-verifikation udført.
- Ingen GitHub-kommentar, deploy, push eller publish udført.
- Arbejdstræet havde parallelle ændringer i andre filer undervejs, bl.a. `src/pages/kontakt.astro`, `src/components/Footer.astro`, `src/components/Header.astro`, `src/components/site/HeroSection.astro`, `src/components/site/MiniCheckPreview.astro` og `src/components/site/TrustProofStrip.astro`. Jeg har ikke rørt eller reverted dem.

## Anbefalet mini-fix rækkefølge

1. Beslut om den hårdkodede produktions-checkout-URL skal miljøstyres for preview/lokal QA.
2. Tilføj rate limit/origin policy på checkout, hvis spam bliver et reelt problem.
3. Overvej første-parts backup for gratis leads, hvis Gratis mini-tjek bliver hovedmotoren.
4. Overvej confirm-flow på `/tak`, hvis checkout-domain og CORS skal kobles tættere.
5. Test live betaling og FormSubmit delivery manuelt, når Troels eksplicit godkender det.

Min vurdering: **flowet er mere driftssikkert efter hardening-passet. De resterende punkter handler især om live-verifikation, miljøstyring og en eventuel første-parts backup for gratis leads.**
