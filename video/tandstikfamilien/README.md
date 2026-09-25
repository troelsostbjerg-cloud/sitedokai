# The Stick Family – Episode 1: "The Coffee Is in the Fridge"

*(Dansk arbejdstitel: Tændstikfamilien. Videoen udgives på engelsk; en dansk version findes også.)*

Animeret YouTube-video (1920×1080, 30 fps, ca. 2 min) om ADHD i hverdagen. Alt er tegnet i kode med [Remotion](https://www.remotion.dev) (React → MP4), og musik og lydeffekter er syntetiseret i kode. Der er ingen eksterne billeder, samples eller licenser.

Serie-konceptet, figurerne og idéer til nye afsnit står i **[SERIE.md](SERIE.md)**.

## Filer
| Fil | Hvad |
|---|---|
| `out/episode1-en.mp4` | **Færdig video, engelsk (hovedversion)** |
| `out/episode1-da.mp4` | Færdig video, dansk |
| `out/thumbnail-en.png` / `-da.png` | YouTube-thumbnails |
| `src/content.ts` | **Al tekst** (DA + EN) og scenelængder, så du kan rette ordlyd her |
| `src/sfx.ts` | Lydeffekter pr. scene og musikkens lydstyrke |
| `src/scenes/*.tsx` | Én fil pr. scene (Intro, Bo, Fact, Lise, House, Outro) |
| `src/lib/` | Tændstikfigur, poser, køkken, have, kat, papir og "line boil" |
| `scripts/make-audio.mjs` | Genererer musik og lyd til `public/audio/` |

## Kom i gang
```bash
npm install
npm run audio          # lav musik + lydeffekter (første gang)
npm run studio         # live preview i browseren, med scrubbing pr. scene
npm run render         # → out/episode1-en.mp4 (engelsk)
npm run render:da      # → out/episode1-da.mp4 (dansk)
npm run thumbnail      # → out/thumbnail-en.png
```

## Et nyt afsnit
1. Kopiér et sæt scener (eller genbrug `Kitchen`, `Garden`, `StickFigure` og `Cat`).
2. Skriv teksten i `content.ts`, og sæt tidspunkter.
3. Registrér kompositionen i `src/Root.tsx`.
4. Tjek stillbilleder undervejs: `node scripts/stills.mjs Scene-bo 100 300 600`.

## Antagelser og valg
- **Engelsk er hovedsproget.** Den engelske tekst står under `en` i `content.ts`, og den danske under `da`.
- **Uden speak:** fortalt med billeder og tekstkort (stumfilm-komik). Det gør den nem at oversætte og fungerer også lydløst i feeds.
- **Navne:** Bo, Lise og katten Fru Hansen. De kan ændres i `content.ts`, men navnene står også i faktakortene.
- I cloud-miljøet blev der renderet med den forudinstallerede Chromium (`REMOTION_CHROME`). Lokalt henter Remotion selv sin browser.
