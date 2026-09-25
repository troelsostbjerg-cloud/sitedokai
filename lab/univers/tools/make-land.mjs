// Genererer src/12-land-data.js: et 2048x1024 land/hav-kort (ækvirektangulært,
// række 0 = 90°N) fra Natural Earth 1:50m via world-atlas, RLE- og base64-kodet.
//
// Kør fra en mappe hvor world-atlas@2 og topojson-client@3 er installeret:
//   npm i --no-save world-atlas@2 topojson-client@3
//   node lab/univers/tools/make-land.mjs lab/univers/src/12-land-data.js
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(join(process.cwd(), 'noop.js'));
const topojson = require('topojson-client');
const topo = require('world-atlas/land-50m.json');

const W = 2048;
const H = 1024;
const land = topojson.feature(topo, topo.objects.land);

const mask = new Uint8Array(W * H);
let circumpolar = 0;

// Hver ring rasteriseres for sig og XOR'es ind i kortet (= even-odd på tværs af
// ringe, så huller som Det Kaspiske Hav bliver hav). Ringe der krydser datolinjen
// "foldes ud" (±360°), og x pakkes rundt ved udfyldning.
const fillRing = (ring) => {
  const pts = [];
  let offset = 0;
  for (let i = 0; i < ring.length; i++) {
    let [lon, lat] = ring[i];
    if (i > 0) {
      const prev = ring[i - 1][0];
      if (lon - prev > 180) offset -= 360;
      else if (prev - lon > 180) offset += 360;
    }
    pts.push([lon + offset, lat]);
  }
  const [fLon] = pts[0];
  const [lLon] = pts[pts.length - 1];
  if (Math.abs(lLon - fLon) > 180) {
    // Ringen går hele vejen rundt om en pol: luk den via polen.
    circumpolar++;
    const meanLat = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    const pole = meanLat < 0 ? -90 : 90;
    pts.push([lLon, pole], [fLon, pole], pts[0]);
  }
  const xy = pts.map(([lon, lat]) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H]);
  let yMin = Infinity, yMax = -Infinity;
  for (const [, y] of xy) { yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
  for (let y = Math.max(0, Math.floor(yMin)); y < Math.min(H, Math.ceil(yMax) + 1); y++) {
    const yc = y + 0.5;
    const xs = [];
    for (let i = 0; i < xy.length - 1; i++) {
      const [x0, y0] = xy[i];
      const [x1, y1] = xy[i + 1];
      if ((y0 <= yc && yc < y1) || (y1 <= yc && yc < y0)) {
        xs.push(x0 + ((yc - y0) / (y1 - y0)) * (x1 - x0));
      }
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const a = Math.ceil(xs[i] - 0.5);
      const b = Math.floor(xs[i + 1] - 0.5);
      for (let x = a; x <= b; x++) {
        const xi = ((x % W) + W) % W;
        mask[y * W + xi] ^= 1;
      }
    }
  }
};
for (const f of land.features) {
  const g = f.geometry;
  const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  for (const poly of polys) for (const ring of poly) fillRing(ring);
}
// Antarktis' indre (syd for 85°S) er land hele vejen rundt.
for (let y = Math.floor(((90 + 85) / 180) * H); y < H; y++) mask.fill(1, y * W, (y + 1) * W);

const bytes = [];
const varint = (n) => {
  while (n > 127) { bytes.push((n & 127) | 128); n >>>= 7; }
  bytes.push(n);
};
let landPx = 0;
for (let y = 0; y < H; y++) {
  let cur = 0;
  let run = 0;
  for (let x = 0; x < W; x++) {
    const v = mask[y * W + x];
    landPx += v;
    if (v === cur) run++;
    else { varint(run); cur = v; run = 1; }
  }
  varint(run);
}

const b64 = Buffer.from(bytes).toString('base64');
const out = `// Genereret af tools/make-land.mjs fra Natural Earth 1:50m (public domain) via world-atlas.
// ${W}x${H} ækvirektangulært land/hav-kort, række 0 = 90°N, RLE (skiftevis hav/land, varint) + base64.
const LAND_W = ${W};
const LAND_H = ${H};
const LAND_RLE = '${b64}';
`;
writeFileSync(process.argv[2], out);
console.log({ circumpolar, landFraction: (landPx / (W * H)).toFixed(3), bytes: bytes.length, b64: b64.length });
