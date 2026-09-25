// ============================================================
// 15 · Teksturer: Jordens landkort, kystafstand, bylys, is
// ============================================================

// Storbyer: breddegrad, længdegrad, vægt (1–10). Bruges til bylys på natsiden.
const CITIES = [
  [35.7, 139.7, 10], [28.6, 77.2, 9], [31.2, 121.5, 9], [-23.5, -46.6, 8], [19.4, -99.1, 8], [30.0, 31.2, 8],
  [19.1, 72.9, 8], [39.9, 116.4, 8], [23.8, 90.4, 7], [34.7, 135.5, 7], [40.7, -74.0, 9], [24.9, 67.0, 7],
  [-34.6, -58.4, 7], [29.6, 106.5, 6], [41.0, 29.0, 7], [22.6, 88.4, 7], [14.6, 121.0, 7], [6.5, 3.4, 7],
  [-22.9, -43.2, 7], [39.1, 117.2, 6], [-4.3, 15.3, 5], [23.1, 113.3, 8], [34.05, -118.25, 9], [55.75, 37.6, 8],
  [22.5, 114.1, 7], [31.5, 74.3, 6], [12.97, 77.6, 6], [48.86, 2.35, 8], [4.7, -74.1, 6], [-6.2, 106.8, 8],
  [13.1, 80.3, 6], [-12.05, -77.05, 6], [13.75, 100.5, 7], [37.57, 126.98, 8], [35.2, 136.9, 6], [17.4, 78.5, 6],
  [51.5, -0.12, 8], [35.7, 51.4, 6], [41.88, -87.63, 8], [30.66, 104.07, 6], [32.06, 118.8, 5], [30.6, 114.3, 6],
  [10.8, 106.7, 6], [-8.84, 13.23, 4], [23.0, 72.6, 5], [3.14, 101.7, 5], [34.3, 108.9, 5], [22.3, 114.2, 7],
  [30.27, 120.15, 5], [41.8, 123.4, 5], [24.7, 46.7, 5], [33.3, 44.4, 5], [-33.45, -70.66, 5], [21.2, 72.8, 5],
  [40.4, -3.7, 6], [31.3, 120.6, 5], [18.5, 73.9, 5], [45.75, 126.65, 4], [29.76, -95.37, 6], [32.78, -96.8, 6],
  [43.65, -79.38, 6], [-6.8, 39.28, 4], [25.76, -80.19, 6], [-19.9, -43.94, 5], [1.35, 103.82, 6], [39.95, -75.17, 5],
  [33.75, -84.39, 5], [33.59, 130.4, 4], [15.5, 32.56, 4], [41.39, 2.17, 5], [-26.2, 28.05, 6], [59.94, 30.31, 5],
  [36.07, 120.38, 5], [38.91, 121.6, 4], [38.9, -77.04, 5], [16.87, 96.2, 4], [31.2, 29.92, 4], [36.65, 117.0, 4],
  [20.67, -103.35, 5], [5.36, -4.0, 4], [39.93, 32.86, 4], [22.36, 91.78, 4], [-37.8, 144.96, 5], [-33.87, 151.21, 5],
  [25.67, -100.31, 5], [-1.29, 36.82, 4], [21.03, 105.85, 5], [-15.8, -47.9, 4], [-33.92, 18.42, 4], [21.5, 39.2, 4],
  [41.9, 12.5, 5], [52.52, 13.4, 5], [45.46, 9.19, 5], [51.45, 7.0, 6], [52.37, 4.9, 5], [50.85, 4.35, 4],
  [55.68, 12.57, 4], [59.33, 18.07, 3], [59.91, 10.75, 3], [60.17, 24.94, 3], [52.23, 21.01, 4], [48.21, 16.37, 4],
  [47.5, 19.04, 4], [37.98, 23.73, 4], [50.45, 30.52, 4], [38.72, -9.14, 4], [53.48, -2.24, 4], [48.14, 11.58, 4],
  [50.11, 8.68, 4], [53.55, 9.99, 4], [56.16, 10.2, 2], [37.77, -122.42, 6], [47.61, -122.33, 5], [49.28, -123.12, 4],
  [45.5, -73.57, 5], [42.36, -71.06, 5], [42.33, -83.05, 5], [33.45, -112.07, 5], [39.74, -104.99, 4], [44.98, -93.27, 4],
  [23.11, -82.37, 3], [10.48, -66.9, 4], [6.24, -75.58, 4], [-0.18, -78.47, 3], [-30.03, -51.23, 4], [-8.05, -34.88, 4],
  [-12.97, -38.5, 4], [33.57, -7.59, 4], [36.75, 3.06, 4], [36.8, 10.18, 3], [9.03, 38.74, 4], [5.6, -0.19, 4],
  [14.72, -17.47, 3], [32.08, 34.78, 4], [25.2, 55.27, 5], [41.3, 69.24, 4], [43.24, 76.89, 3], [55.03, 82.92, 3],
  [56.84, 60.6, 3], [-31.95, 115.86, 4], [-27.47, 153.03, 4], [-36.85, 174.76, 3], [25.03, 121.57, 6], [35.18, 129.08, 5],
  [6.93, 79.86, 3], [27.72, 85.32, 3], [-7.25, 112.75, 5], [-6.9, 107.6, 4], [10.3, 123.9, 3], [11.56, 104.92, 3],
  [45.76, 4.84, 4], [43.3, 5.37, 4], [53.35, -6.26, 4], [55.95, -3.19, 3], [50.08, 14.44, 4], [44.43, 26.1, 4],
  [42.7, 23.32, 3], [44.79, 20.45, 3], [45.81, 15.98, 3], [54.69, 25.28, 3], [56.95, 24.1, 3], [59.44, 24.75, 2],
  [57.7, 11.97, 3], [55.6, 13.0, 3], [63.43, 10.4, 2], [60.39, 5.32, 2], [64.15, -21.94, 2], [40.85, 14.27, 4],
  [37.5, 15.09, 3], [38.12, 13.36, 3], [39.47, -0.38, 4], [37.39, -5.98, 4], [41.15, -8.61, 3], [43.26, -2.93, 3],
];

function decodeLand() {
  const W = LAND_W, H = LAND_H;
  const bin = atob(LAND_RLE);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const mask = new Uint8Array(W * H); // teksturrækker: 0 = syd
  let p = 0;
  for (let y = 0; y < H; y++) {
    const row = (H - 1 - y) * W;
    let x = 0, cur = 0;
    while (x < W) {
      let n = 0, sh = 0, b;
      do { b = bytes[p++]; n |= (b & 127) << sh; sh += 7; } while (b & 128);
      if (cur) mask.fill(255, row + x, row + x + n);
      x += n; cur ^= 1;
    }
  }
  return mask;
}

function chamfer(bin, w, h, target) {
  const d = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) d[i] = bin[i] === target ? 1e9 : 0;
  const A = 1, B = Math.SQRT2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; let v = d[i]; if (v === 0) continue;
    if (x > 0) v = Math.min(v, d[i - 1] + A);
    if (y > 0) {
      v = Math.min(v, d[i - w] + A);
      if (x > 0) v = Math.min(v, d[i - w - 1] + B);
      if (x < w - 1) v = Math.min(v, d[i - w + 1] + B);
    }
    d[i] = v;
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x; let v = d[i]; if (v === 0) continue;
    if (x < w - 1) v = Math.min(v, d[i + 1] + A);
    if (y < h - 1) {
      v = Math.min(v, d[i + w] + A);
      if (x < w - 1) v = Math.min(v, d[i + w + 1] + B);
      if (x > 0) v = Math.min(v, d[i + w - 1] + B);
    }
    d[i] = v;
  }
  return d;
}

let EARTH_TEX = null;
function earthTextures() {
  if (EARTH_TEX) return EARTH_TEX;
  const W = LAND_W, H = LAND_H;
  const mask = decodeLand();
  const land = new THREE.DataTexture(mask, W, H, THREE.RedFormat, THREE.UnsignedByteType);
  land.wrapS = THREE.RepeatWrapping;
  land.minFilter = land.magFilter = THREE.LinearFilter;
  land.generateMipmaps = false;
  land.needsUpdate = true;

  const w = W / 2, h = H / 2;
  const cov = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = 2 * y * W + 2 * x;
    cov[y * w + x] = mask[i] + mask[i + 1] + mask[i + W] + mask[i + W + 1] >= 510 ? 1 : 0;
  }
  const dL = chamfer(cov, w, h, 1), dS = chamfer(cov, w, h, 0);
  const lat = (y) => ((y + 0.5) / h) * 180 - 90; // række 0 = syd
  const lonOf = (x) => ((x + 0.5) / w) * 360 - 180;

  const lights = new Float32Array(w * h);
  const blob = (la, lo, amp, sig) => {
    const cx = ((lo + 180) / 360) * w - 0.5, cy = ((la + 90) / 180) * h - 0.5;
    const sx = sig / Math.max(0.2, Math.cos(la * DEG));
    const R = Math.ceil(sig * 3), RX = Math.ceil(sx * 3);
    for (let dy = -R; dy <= R; dy++) {
      const y = Math.round(cy) + dy; if (y < 0 || y >= h) continue;
      for (let dx = -RX; dx <= RX; dx++) {
        const xr = Math.round(cx) + dx, x = ((xr % w) + w) % w;
        const ex = (xr - cx) / sx, ey = (y - cy) / sig;
        lights[y * w + x] += amp * Math.exp(-0.5 * (ex * ex + ey * ey));
      }
    }
  };
  for (const [la, lo, wt] of CITIES) blob(la, lo, 0.22 + wt * 0.05, 0.45 + wt * 0.09);
  const r = rng(99);
  for (let i = 0; i < 9000; i++) {
    const north = r() < 0.72;
    const la = north ? 35 + gauss(r) * 13 : -14 + gauss(r) * 13;
    const lo = r() * 360 - 180;
    const x = clamp(Math.floor(((lo + 180) / 360) * w), 0, w - 1), y = clamp(Math.floor(((la + 90) / 180) * h), 0, h - 1);
    const k = y * w + x;
    if (!cov[k]) continue;
    const al = Math.abs(la);
    if (al > 62 && r() < 0.9) continue;
    const arid = Math.exp(-Math.pow((al - 24) / 9, 2)) * smooth(4, 14, dL[k]);
    if (r() < arid * 0.92) continue;
    if (r() > 0.35 + 0.65 * Math.exp(-dL[k] / 18)) continue;
    blob(la, lo, 0.06 + r() * 0.16, 0.4 + r() * 0.35);
  }

  const data = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const k = y * w + x, o = k * 4;
    const la = lat(y), lo = lonOf(x);
    data[o] = cov[k] ? clamp(128 + Math.min(dL[k], 63) * 2, 128, 255) : clamp(128 - Math.min(dS[k], 64) * 2, 0, 127);
    data[o + 1] = clamp(Math.round(Math.min(1, lights[k]) * 255), 0, 255);
    let ice = 0;
    if (cov[k]) {
      if (la < -60) ice = 255;
      else if (la > 59.8 && lo > -74 && lo < -11) ice = 255; // Grønland
      else if (la > 76) ice = 210;
      else if (la > 74 && lo > -125 && lo < -60) ice = 150;
    }
    data[o + 2] = ice;
    data[o + 3] = 255;
  }
  const field = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  field.wrapS = THREE.RepeatWrapping;
  field.minFilter = field.magFilter = THREE.LinearFilter;
  field.generateMipmaps = false;
  field.needsUpdate = true;
  EARTH_TEX = { land, field };
  return EARTH_TEX;
}

// Et lille spiralgalakse-billede til Lokalgruppen (tegnet på canvas).
function galaxyTexture(seed, kind = 0) {
  const S = 256, cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
  g.globalCompositeOperation = 'lighter';
  const r = rng(seed), c = S / 2;
  const core = g.createRadialGradient(c, c, 0, c, c, kind === 2 ? S * 0.45 : S * 0.2);
  core.addColorStop(0, 'rgba(255,236,200,0.95)');
  core.addColorStop(0.4, kind === 2 ? 'rgba(255,210,160,0.35)' : 'rgba(255,210,160,0.25)');
  core.addColorStop(1, 'rgba(255,200,150,0)');
  g.fillStyle = core; g.fillRect(0, 0, S, S);
  if (kind !== 2) {
    const n = 2600;
    for (let i = 0; i < n; i++) {
      const arm = kind === 1 ? r() * Math.PI * 2 : (i % 2) * Math.PI;
      const t = Math.pow(r(), 0.8);
      const rad = t * S * 0.46;
      const th = arm + (kind === 1 ? 0 : t * 3.4) + gauss(r) * (kind === 1 ? 1.2 : 0.28);
      const x = c + Math.cos(th) * rad, y = c + Math.sin(th) * rad;
      const young = r() < 0.5;
      g.fillStyle = young ? 'rgba(170,200,255,0.2)' : 'rgba(255,225,190,0.16)';
      const s = 0.8 + r() * 1.8;
      g.fillRect(x, y, s, s);
      if (r() < 0.02) { g.fillStyle = 'rgba(255,120,160,0.35)'; g.fillRect(x, y, 2, 2); }
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
