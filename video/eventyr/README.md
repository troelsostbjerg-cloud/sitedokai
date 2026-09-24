# Eventyr — 5 sekunders three.js-kortfilm

Et Peter Pan-agtigt øjeblik fra et børneværelse: en fe flyver ind ad vinduet,
drysser fe-støv, og barnet i nattøj letter, flyver ud over byens tage og
forbi klokketårnet mod månen og "second star to the right".

Alt er bygget i kode med three.js — ingen modeller, ingen billedfiler.
Toon-shading med tusch-outlines, månelys med skygger gennem vinduet,
varm lampe mod kold nat, bloom, vignet og filmkorn.

- `eventyr.mp4` — færdig video, 1920×1080, 60 fps, 5 sek.
- `scene.html` — hele scenen, deterministisk: `window.renderAt(t)` tegner tidspunkt `t`
- `render.mjs` — kører scenen i headless Chromium og sender frames til ffmpeg

## Render selv

```bash
cd video/eventyr
npm install                       # henter three.js
FFMPEG=/sti/til/ffmpeg node render.mjs --fps 60 --out eventyr.mp4
node render.mjs --stills 0.5,2,4.9                # hurtige stillbilleder i stills/
node render.mjs --w 1280 --h 720 --out preview.mp4 # hurtig preview
```

Kræver Playwright (Chromium) og en ffmpeg med libx264.
Se scenen live: `npx http-server .` og åbn `scene.html` (`?t=2.5` fryser et tidspunkt).
