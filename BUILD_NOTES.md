# SiteDokAI — build og vedligehold

sitedokai.com er Troels Østbjergs personlige rådgivningssite for AI adoption og
enablement i mellemstore virksomheder. Den tidligere AI-tidslinje er pensioneret;
dens dynamiske månedsroute ligger bevaret under `_archive/`, og gamle offentlige
adresser får permanente HTTP-viderestillinger.

## Stack og source of truth

- Astro 7, statisk output
- Tailwind CSS 4 via den officielle Vite-plugin
- npm og `package-lock.json` er den kanoniske package manager og låsefil
- Google App Engine i projektet `sitedok` serverer produktion via en lille Node-server
- Serveren leverer 308-redirects, HTTP-sikkerhedsheaders og en per-side CSP,
  hvis hashes beregnes fra den præcise build-HTML ved opstart
- App Engine er låst til `europe-west`, TLS 1.2 og højst én F1-instans
- Intet login, ingen database, ingen analytics og ingen kontaktformular

Kildekoden ligger på `main` i `troelsostbjerg-cloud/sitedokai`. GitHub Pages-
branchen `gh-pages` bevares midlertidigt som rollback, men er ikke længere den
kanoniske produktionsplatform.

## Kør lokalt

```bash
npm ci
npm run dev
npm run build
npm test
npm audit --omit=dev
```

Preview af et færdigt build:

```bash
npm run preview
```

## Deploy med QA-gate

```bash
npm run deploy
```

Standardkommandoen laver en ny staging-version uden at flytte trafik. Scriptet
bruger den aktive Google Cloud-konto og:

1. bygger `dist/`
2. kører Node-serverens integrationstests
3. kører produktions-audit af npm-afhængigheder
4. deployer en navngivet App Engine-version til projektet `sitedok`
5. verificerer den versionsspecifikke URL, som sender `X-Robots-Tag: noindex`

Når den eksakte version har bestået selvstændig QA, promoveres samme immutable
version — der bygges ikke et nyt artifact mellem QA og produktion:

```bash
npm run deploy:production -- qa-ÅÅÅÅMMDD-TTMMSS
```

Et budget på 50 DKK pr. måned er afgrænset til projektet med varsler ved 50,
90 og 100 procent. Budgettet er et varsel, ikke et automatisk forbrugsstop.

Kildeændringer skal committes og pushes til `main` separat. Brug altid
path-scoped staging i en dirty worktree; brug ikke `git add -A` på kildebranchen.

## Aktive sider

- `/` — positionering, samarbejdsformer, metode, arbejdseksempel og FAQ
- `/om/` — Troels, arbejdsform og faglige grænser
- `/kontakt/` — direkte mail og LinkedIn
- `/privacy/` — privatliv, hosting og lokalt hostede skrifttyper
- `/sitemap.xml` og `/llms.txt` — crawl- og AI-læsbar profil
- `/404.html` — brugerdefineret fejlside

Gamle routes vedligeholdes ét sted i `src/config/redirects.mjs`. Astro bruger
dem til statisk output, og `server.mjs` returnerer ægte 308-svar i produktion.

## Indhold og design

- Dansk, konkret og varmt
- Primær målgruppe: mellemstore virksomheder
- Kerne: AI adoption og enablement tæt på reelle arbejdsgange
- Farver og typografi: `tailwind.config.mjs`
- Lokale WOFF2-skrifttyper og OFL-licenser: `public/fonts/newsreader/` og
  `public/fonts/outfit/`
- Globale komponentstile: `src/styles/global.css`
- Fælles metadata og schema: `src/layouts/Layout.astro`
- Server, redirects og per-side hash-baseret CSP: `server.mjs` og
  `src/config/redirects.mjs`
- Socialt delingsbillede: `public/og-image.png`

Arbejdseksemplet skal forblive anonymiseret. Der må ikke tilføjes
virksomhedsnavn, interne medarbejderoplysninger eller effekter/ROI, som ikke er
dokumenteret.

## Release-check

Før deploy:

```bash
npm ci
npm run build
npm test
npm audit --omit=dev
git diff --check
```

Kontrollér derefter desktop og mobil i en browser: navigation, mobilmenu, FAQ,
mailto, LinkedIn, overflow, konsollog, metadata og de fire aktive sider.
