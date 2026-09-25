# Rejsen gennem universet

En interaktiv 3D-rejse i 8 kapitler: fra sollyset på Jorden til kanten af det
synlige univers og videre ud i det uendelige. Undervejs kommer tomheden,
stjernernes liv og død, og det en superintelligens kunne nå inden for kendt fysik.

Kilden i `lab/univers/src/` bruges to steder:

- `lab/univers/index.html`: en selvstændig fil (three.js fra jsDelivr og
  skrifttyper fra Google Fonts), som også bruges til Claude-artifact'en.
- **sitedokai.com/univers/**: `build.mjs` genererer `src/pages/univers.astro`,
  `src/univers/app.js` og `src/univers/univers.css`. Astro/Vite bundter three.js
  fra npm, og skrifttyperne ligger i `public/fonts/`, så siden overholder sitets
  CSP (kun `'self'` og hashes, ingen style-attributter).

`lab/` er udeladt i `.gcloudignore`. App Engine bygger kun ud fra de genererede
filer i `src/` og `public/`, så kør altid `node lab/univers/build.mjs` og commit
resultatet efter ændringer. `npm test` fejler, hvis de genererede filer er
forældede.

## Åbn den

`index.html` er én selvstændig fil. Åbn den i en browser med internetforbindelse.
Den henter three.js 0.186.1 fra jsDelivr og skrifttyper fra Google Fonts.

## Kapitler

1. **Solen varmer Jorden**: snit gennem Solen, fotonens 170.000 år lange vej ud, energistrømmen til Jorden, drivhuseffekt og nordlys.
2. **Solsystemet**: planeternes positioner i dag (JPL-baneelementer), tidsskyder, rumtidsgitter og planeternes spiraler gennem galaksen.
3. **Tomheden**: solsystemet i ægte skala, en lysstråle i realtid og et brintatom, man kan zoome 40.000 gange ind i.
4. **Stjernernes liv og død**: stjernedannelse, masse-skyder, røde kæmper, planetariske tåger, supernovaer, neutronstjerner, sorte huller og grundstoffernes oprindelse.
5. **Dybden**: én logaritmisk zoom fra 10⁷ til 10²⁷ meter i 11 stop.
6. **Uendeligheden**: horisonten, andre observatørers horisonter, en uendelig zoom og tidens ende (10¹⁰⁰ år).
7. **ASI derude**: Kardashev-skalaen, Dyson-sværm, Matrjosjka-hjerne, selvkopierende sonder og det nåbare univers, hver med en spekulationsmåler.
8. **Den blå prik**: Voyager 1's billede fra 1990.

## Struktur

```
lab/univers/
  index.html          genereret, selvstændig side (commit den efter hver ændring)
  build.mjs           samler src/ til index.html
  src/page.html       markup og pladsholdere
  src/style.css       design (ét bevidst mørkt tema)
  src/00-…90-*.js     kode; samles i filnavnsorden til ét ES-modul
  src/12-land-data.js verdenskort (Natural Earth 1:50m, public domain), genereret
  tools/make-land.mjs genererer 12-land-data.js
```

Byg efter ændringer (skriver både den selvstændige fil og sitets filer):

```bash
node lab/univers/build.mjs
npm run build && npm test
```

Med et ekstra argument skrives også et fragment uden `<html>`/`<head>`/`<body>`
til publicering som Claude-artifact:

```bash
node lab/univers/build.mjs /tmp/univers-fragment.html
```

## Data og kilder

- Planetpositioner: NASA/JPL, *Approximate Positions of the Planets* (Keplerske elementer, 1800–2050).
- Jordens rotation og Månens position: standardformler (GMST, Astronomical Almanac lav præcision), beregnet for tidspunktet, siden åbnes.
- Kyster: Natural Earth 1:50m via `world-atlas` (public domain).
- Solens energi: 592 EJ globalt energiforbrug i 2024 (Energy Institute, Statistical Review 2025).
- Fotonens diffusionstid: ca. 170.000 år (Mitalas & Sills 1992, NASA).
- Voyager 1 når ét lysdøgn fra Jorden 18. november 2026 (NASA/JPL).
- Andromeda: ca. 50 % chance for sammenstød inden for 10 mia. år (Sawala m.fl., *Nature Astronomy* 2025).
- 94 % af de synlige galakser kan aldrig nås (kosmisk begivenhedshorisont, ca. 18 mia. lysår).
- Nærmeste kopi af dig i et uendeligt univers: ca. 10^(10^28) m (Max Tegmark, *Scientific American* 2003).
- Dyson-sværm fra Merkur på få årtier: Armstrong & Sandberg, *Eternity in six hours* (2013).
- Dyson-kandidater: Project Hephaistos II (*MNRAS* 2024).

Størrelser og afstande er ikke i skala i kapitel 1, 2 og 4. Det står i teksten
de steder, hvor det betyder noget. Kapitel 3 og 5 er i ægte skala.
