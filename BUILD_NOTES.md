# AI-tidslinjen — build & vedligehold

sitedokai.com er en dansk tidslinje over udviklingen i kunstig intelligens.
Tidligere var domænet et konsulent-site (SitedokAI); det er nu lagt om.

## Stack

- Astro 5 (statisk) + Tailwind CSS 3
- Hostes på **GitHub Pages** (domæne sitedokai.com)
- Helt statisk: intet login, ingen backend, ingen database

## Kør lokalt

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # bygger til ./dist
```

## Deploy (gør siden live)

```bash
npm run deploy   # bygger og lægger siden live på sitedokai.com
```

GitHub Pages serverer fra branchen **`gh-pages`** (det færdige build i roden).
`npm run deploy` bygger `dist/` og publicerer det dertil — live efter 1-2 minutter.
Husk også at committe dine ændringer i `src/` til `main`, så kilden er gemt:

```bash
git add -A && git commit -m "Tilføj ny måned" && git push
```

## Sådan tilføjer du en ny måned (det vigtigste)

Alt indhold ligger ét sted: **`src/data/timeline.ts`**.

1. Åbn filen og find `months`-arrayet.
2. Kopiér det nederste måned-objekt og indsæt det i bunden.
3. Ret felterne:
   - `id`: `"ÅÅÅÅ-MM"` (bliver URL'en `/maaned/ÅÅÅÅ-MM`)
   - `year`, `month`, `monthLabel`
   - `headline`: én linje der fanger måneden
   - `summary`: 2-3 sætninger
   - `highlights`: 3-7 punkter med `category`, `title`, `detail` (+ valgfri `date`, `source`)
4. Gyldige `category`-værdier: `model`, `produkt`, `forskning`, `erhverv`, `politik`, `kultur`.
5. Commit + push. Forside, tidslinje, detaljeside og sitemap opdateres automatisk.

## Sådan opdaterer du "Denne uge i AI"

Ret `thisWeek`-objektet nederst i `src/data/timeline.ts` (`weekLabel`,
`dateRange`, `intro`, `items`). Vises på forsiden og i "Mit overblik".

## Sider

- `/` — hero, "Denne uge i AI" og tidslinjen (nyeste øverst)
- `/maaned/[id]` — detaljeside pr. måned (genereres fra data)
- `/om` — baggrund og metode
- `/privacy` — privatlivspolitik
- `/sitemap.xml` — genereres dynamisk fra månederne

## Design

- Mørkt tema. Farver i `tailwind.config.mjs`, basis-styles i `src/styles/global.css`.
- Kategori-farver skal matche mellem `tailwind.config.mjs` (`cat.*`) og
  `CATEGORIES` i `src/data/timeline.ts`.
