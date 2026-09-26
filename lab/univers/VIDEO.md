# Video af Rejsen gennem universet

Brief til den, der skal lave en video af simulationen (menneske eller agent som Codex).

**Rejsen gennem universet** er en interaktiv 3D-rejse i 8 kapitler, bygget med three.js.
Den går fra sollyset på Jorden til kanten af det synlige univers og videre ud i det
uendelige. Kapitlerne er beskrevet i [README.md](README.md). Koden ligger på branchen
`claude/3d-universe-simulation-8swhh9`. Den er endnu ikke flettet ind i `main` og er ikke
live på sitedokai.com endnu.

## Kort sagt

Optag ikke skærmen. En browser uden GPU tegner kun 3-10 billeder i sekundet, så en
almindelig skærmoptagelse hakker. Brug `tools/capture.mjs`. Scriptet fryser sidens ur,
flytter tiden præcis 1/30 sekund frem, tegner ét billede og tager et skærmbillede. Så
bliver videoen flydende på enhver maskine og ens hver gang.

```bash
git checkout claude/3d-universe-simulation-8swhh9
npm ci
npm i --no-save playwright && npx playwright install --with-deps chromium
# ffmpeg med libx264: apt-get install -y ffmpeg · brew install ffmpeg · pip install imageio-ffmpeg

node lab/univers/tools/capture.mjs --list      # storyboardet med tidskoder
node lab/univers/tools/capture.mjs --preview   # hurtig prøve: 960x540, 15 fps
node lab/univers/tools/capture.mjs             # 1920x1080, 30 fps (ca. 3:50)
```

Scriptet bygger sitet (`npm run build`), hvis `dist/` mangler, og starter selv
`server.mjs` på en ledig port. Alt kører lokalt uden internet, når `npm ci` og Playwright
er installeret.

Resultatet lander i `lab/univers/video/`, som git ignorerer:

- `univers.mp4`: H.264, yuv420p, uden lyd.
- `univers.srt`: titlen på hvert trin med tidskoder.
- `univers.shots.json`: shots, tidskoder, kapitler, titler og brødtekst. Brug teksterne
  til speak, titler eller undertekster. De er faktatjekkede, så find ikke på nye tal.

## Tid

Uden GPU tager hvert billede ca. 0,8 sekunder i 1920x1080 på 4 CPU-kerner (målt med
SwiftShader). Hele storyboardet er 6.825 billeder, altså ca. 90 minutter. `--preview` tager
ca. 15 minutter. På en maskine med skærmkort går det meget hurtigere med `--gpu`.

Er der en tidsgrænse, så optag i bidder med `--shots` og sæt dem sammen med ffmpeg
(concat), eller brug `--fps 24` eller `--size 1280x720`.

## Valg

| Valg | Betydning |
| --- | --- |
| `--size 1920x1080` | Standard. `3840x2160` giver 4K. `1080x1920` giver lodret video med sitets mobil-layout (Reels, Shorts, TikTok). |
| `--fps 30` | Billeder i sekundet. `60` er blødere og tager dobbelt så lang tid. |
| `--ui full` | Som på sitet, med tekstpanel og menu. `clean` skjuler panel og menu, men beholder navne og målere. `none` viser kun 3D-scenen. |
| `--shots a,b,c` | Kun disse shots, i storyboardets rækkefølge. |
| `--out sti` | En `.mp4`-fil, eller en mappe der ender på `/` for at gemme PNG-billeder. |
| `--date ISO` | Tidspunktet, siden skal tro, det er. Det styrer planeternes positioner og dag og nat på Jorden. Standard er i dag kl. 08:00 UTC, så Europa ligger i morgensol i åbningen. |
| `--gpu` | Brug maskinens GPU i stedet for SwiftShader. |
| `--url` | Optag en side, der allerede kører, fx `lab/univers/index.html` via en lokal server. |

## Storyboard

Output fra `--list`. Shots og tider står i `SHOTS` øverst i `tools/capture.mjs`. Ret dem
der, hvis rytmen skal ændres.

| Start | Shot | Sek. | Indhold |
| --- | --- | --- | --- |
| 00:00 | `intro` | 7 | Titelskærm. Jorden og Solen, som de står på optagedatoen. |
| 00:07 | `sol-kraft` | 6 | Solen og Jorden. Solen omdanner 4 mio. tons stof til energi i sekundet. |
| 00:13 | `sol-foton` | 10 | Snit gennem Solen. En foton er 170.000 år om at slippe ud. |
| 00:23 | `sol-energi` | 7 | Energistrømmen fra Solen til Jorden. |
| 00:30 | `sol-drivhus` | 7 | Drivhuseffekt, magnetfelt og nordlys. |
| 00:37 | `planeter-nu` | 7 | Planeterne, som de står i dag. Tiden sættes op til ca. 40 døgn i sekundet. |
| 00:44 | `planeter-tyngde` | 6 | Rumtiden krummer om Solen. |
| 00:50 | `planeter-spiral` | 7 | Planeterne tegner spiraler gennem galaksen. |
| 00:57 | `tomhed-skala` | 7 | Solsystemet i ægte skala. Planeterne forsvinder. |
| 01:04 | `tomhed-lys` | 9 | En lysstråle forlader Solen (× 500, her yderligere × 2,5). |
| 01:13 | `tomhed-atom` | 10 | Et brintatom. Zoom 40.000 gange ind til kernen. |
| 01:23 | `stjerner-foedsel` | 10 | En gassky falder sammen, og en stjerne tænder. |
| 01:33 | `stjerner-doed` | 23,5 | En stjerne på 30 solmasser: superkæmpe, løgskaller, kernekollaps, supernova og sort hul. De rolige faser kører dobbelt hurtigt. |
| 01:56 | `stjerner-stoev` | 6 | Grundstofferne i din krop blev skabt i stjerner. |
| 02:02 | `dybde` | 36 | Én logaritmisk zoom fra Jorden til det observerbare univers: 10⁷ til 10²⁷ meter i 11 stop. |
| 02:38 | `uendelig-kant` | 7 | Uden kant og uden centrum. Hver boble er en observatørs horisont. |
| 02:45 | `uendelig-zoom` | 9 | Uendelig zoom ud. Den nærmeste kopi af dig er 10^(10^28) m væk. |
| 02:54 | `asi-kardashev` | 5 | Kardashev-skalaen. Menneskeheden er type 0,73. |
| 02:59 | `asi-dyson` | 11 | En Dyson-sværm vokser eksponentielt rundt om Solen. |
| 03:10 | `asi-hjerne` | 6 | Matrjosjka-hjernen: computere drevet af hele Solens energi. |
| 03:16 | `asi-sonder` | 10 | Selvkopierende sonder breder sig gennem Mælkevejen. |
| 03:26 | `asi-raekkevidde` | 6 | Lyset bestemmer tempoet. 94 % af galakserne kan aldrig nås. |
| 03:32 | `hjem` | 15 | Den blå prik. Jorden trækker sig tilbage til 0,12 pixel. Toner ud til sort. |

Overgange mellem to verdener toner via sort. Klippet mellem to shots ligger præcis i det
sorte, så shots kan klippes fra hinanden uden at hakke.

## Forslag til klip

- **Teaser på ca. 60 sekunder:** `--shots intro,sol-foton,dybde,stjerner-doed,asi-dyson,hjem`
  (ca. 1:45 råt) og klip ned. `dybde` er det stærkeste enkeltshot.
- **Lodret til sociale medier:** `--size 1080x1920 --ui clean`.
- **Ren film uden brugerflade:** `--ui none`, og læg titler på fra `univers.srt`.
- **Lyd:** Optagelsen har ingen lyd. Simulationens egen lyd er Web Audio og kommer ikke
  med. Læg musik eller speak på bagefter, og brug kun musik med licens.
- **Slutskilt:** "Rejsen gennem universet · et lab fra SiteDokAI". Skriv først
  sitedokai.com/univers på, når siden er live.

## Sådan virker optagelsen

- Playwrights `clock` erstatter `Date`, `performance.now` og timere, så siden kun ser den
  tid, optageren giver den.
- `requestAnimationFrame` samles i en kø og køres én gang pr. billede. Simulationen går
  derfor præcis 1/fps sekund frem pr. billede.
- CSS-overgange (overtoninger, introen) sættes efter samme ur via
  `document.getAnimations()`.
- `Math.random` får et fast frø, så stjernefelter og partikler bliver ens hver gang.
- Siden styres gennem `window.__univers` (`go(kapitel, trin)`, `W`, `setTimeScale`) og
  knapperne i panelet. Se `SHOTS` for eksempler.

## Regler

- Ret ikke i de genererede filer (`src/pages/univers.astro`, `src/univers/`). Skal
  simulationen ændres, så ret i `lab/univers/src/` og kør `node lab/univers/build.mjs` og
  `npm test`.
- Commit ikke videofiler. `lab/univers/video/` er ignoreret.
