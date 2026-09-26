# The Scatterbeans

Animerede ADHD-shorts (1080×1920, 30 fps, ca. 28 sek.) med Bo, Lise og hunden Noodle. Alt er tegnet i kode med [Remotion](https://www.remotion.dev), og musik og lydeffekter er syntetiseret i kode. Der er ingen eksterne billeder, samples eller licenser.

- Serie, figurer og idéer: **[SERIE.md](SERIE.md)**
- Hvorfor ca. 28 sekunder: **[RESEARCH.md](RESEARCH.md)**

## Filer
| Fil | Hvad |
|---|---|
| `out/short1-coffee-en.mp4` | #1 "The Coffee" |
| `out/short2-rose-en.mp4` | #2 "One Rose" |
| `src/content.ts` | **Al tekst** (EN + DA) og længder |
| `src/sfx.ts` | Lydeffekter pr. short og musikkens lydstyrke |
| `src/scenes/Coffee.tsx`, `Rose.tsx` | Selve afsnittene (timing i frames, 30 fps) |
| `src/lib/Bean.tsx` | Bo og Lise: krop, øjne, munde, squash & stretch |
| `src/lib/Dog.tsx` | Noodle (og egernet) |
| `src/lib/Kitchen.tsx`, `Garden.tsx` | Kulisser |
| `src/CharSheet.tsx` | Figurark til at tjekke designet |

## Kommandoer
```bash
npm install
npm run audio                                   # generér musik + lyde
npm run studio                                  # preview i browseren
npx remotion render Coffee-EN out/short1-coffee-en.mp4
npx remotion render Rose-EN out/short2-rose-en.mp4
node scripts/stills.mjs Coffee-EN 100 400 700   # stillbilleder til tjek
```
Danske versioner: `Coffee-DA` og `Rose-DA`.
