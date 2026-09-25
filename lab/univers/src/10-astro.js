// ============================================================
// 10 · Astronomi: tid, koordinater, planetbaner, kataloger
// Verdensrammen er ekliptika J2000: x mod forårspunktet, y op = ekliptikas nordpol.
// ============================================================
const AU = 1.495978707e11;          // m
const LY = 9.4607304725808e15;      // m
const C_LIGHT = 299792458;          // m/s
const R_EARTH = 6.371e6;            // m
const R_SUN = 6.957e8;              // m
const LIGHT_AU_S = AU / C_LIGHT;    // 499 s
const OBLIQ = 23.4392911 * DEG;

const NOW = new Date();
const julian = (date) => date.getTime() / 86400000 + 2440587.5;
const JD_NOW = julian(NOW);

const eclToThree = (x, y, z, out = new THREE.Vector3()) => out.set(x, z, -y);
function eqToEcl(v) {
  const c = Math.cos(OBLIQ), s = Math.sin(OBLIQ);
  return [v[0], v[1] * c + v[2] * s, -v[1] * s + v[2] * c];
}
const eqToThree = (v, out = new THREE.Vector3()) => { const e = eqToEcl(v); return eclToThree(e[0], e[1], e[2], out); };
function radec(raH, decD) {
  const ra = raH * 15 * DEG, dec = decD * DEG;
  return [Math.cos(dec) * Math.cos(ra), Math.cos(dec) * Math.sin(ra), Math.sin(dec)];
}
// Galaktisk -> ækvatorial (J2000, Hipparcos-matricen transponeret)
const GAL2EQ = [
  [-0.0548755604, 0.4941094279, -0.8676661490],
  [-0.8734370902, -0.4448296300, -0.1980763734],
  [-0.4838350155, 0.7469822445, 0.4559837762],
];
const galToEq = (g) => [
  GAL2EQ[0][0] * g[0] + GAL2EQ[0][1] * g[1] + GAL2EQ[0][2] * g[2],
  GAL2EQ[1][0] * g[0] + GAL2EQ[1][1] * g[1] + GAL2EQ[1][2] * g[2],
  GAL2EQ[2][0] * g[0] + GAL2EQ[2][1] * g[1] + GAL2EQ[2][2] * g[2],
];
const galToThree = (g, out = new THREE.Vector3()) => eqToThree(galToEq(g), out);
function lb(lDeg, bDeg) {
  const l = lDeg * DEG, b = bDeg * DEG;
  return [Math.cos(b) * Math.cos(l), Math.cos(b) * Math.sin(l), Math.sin(b)];
}
// Rotation, der lægger en galaktisk-kartesisk model ind i verdensrammen.
function galacticQuaternion() {
  const m = new THREE.Matrix4().makeBasis(galToThree([1, 0, 0]), galToThree([0, 1, 0]), galToThree([0, 0, 1]));
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

// ---------- Planetbaner (JPL, "Approximate Positions of the Planets", 1800–2050) ----------
// a, e, I, L, ϖ, Ω og deres ændring pr. århundrede.
const ELEMENTS = {
  mercury: [0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593, 0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
  venus: [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255, 0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
  earth: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0, 0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0],
  mars: [1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891, 0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
  jupiter: [5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909, -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
  saturn: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448, -0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
  uranus: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503, -0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589],
  neptune: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574, 0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664],
};
function orbitalElements(name, jd) {
  const e0 = ELEMENTS[name];
  const T = (jd - 2451545.0) / 36525;
  return {
    a: e0[0] + e0[6] * T, e: e0[1] + e0[7] * T, I: (e0[2] + e0[8] * T) * DEG,
    L: e0[3] + e0[9] * T, wbar: e0[4] + e0[10] * T, Om: e0[5] + e0[11] * T,
  };
}
function keplerToEcl(el, E) {
  const w = (el.wbar - el.Om) * DEG, Om = el.Om * DEG;
  const xp = el.a * (Math.cos(E) - el.e);
  const yp = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(Om), sO = Math.sin(Om), cI = Math.cos(el.I), sI = Math.sin(el.I);
  return [
    (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    sw * sI * xp + cw * sI * yp,
  ];
}
// Heliocentrisk position i AU (ekliptika J2000).
function planetEcl(name, jd) {
  const el = orbitalElements(name, jd);
  let M = (el.L - el.wbar) % 360;
  if (M > 180) M -= 360; else if (M < -180) M += 360;
  M *= DEG;
  let E = M + el.e * Math.sin(M);
  for (let i = 0; i < 8; i++) E -= (E - el.e * Math.sin(E) - M) / (1 - el.e * Math.cos(E));
  return keplerToEcl(el, E);
}
function orbitEcl(name, jd, n = 256) {
  const el = orbitalElements(name, jd);
  const pts = [];
  for (let i = 0; i < n; i++) pts.push(keplerToEcl(el, (i / n) * Math.PI * 2));
  return pts;
}
const planetThree = (name, jd, out = new THREE.Vector3()) => { const p = planetEcl(name, jd); return eclToThree(p[0], p[1], p[2], out); };

// Månen (lav præcision, Astronomical Almanac): geocentrisk retning og afstand i km.
function moonGeo(jd) {
  const d = jd - 2451545.0;
  const L = (218.316 + 13.176396 * d) * DEG;
  const M = (134.963 + 13.064993 * d) * DEG;
  const F = (93.272 + 13.229350 * d) * DEG;
  const lon = L + 6.289 * DEG * Math.sin(M);
  const lat = 5.128 * DEG * Math.sin(F);
  const km = 385001 - 20905 * Math.cos(M);
  return { dir: eclToThree(Math.cos(lat) * Math.cos(lon), Math.cos(lat) * Math.sin(lon), Math.sin(lat)), km };
}

// Jordens orientering: lokal +Y = nordpol, lokal +X = Greenwich-meridianen (GMST).
function gmst(jd) { let g = (280.46061837 + 360.98564736629 * (jd - 2451545.0)) % 360; if (g < 0) g += 360; return g * DEG; }
function earthQuaternion(jd) {
  const G = gmst(jd);
  const X = eqToThree([Math.cos(G), Math.sin(G), 0]);
  const Y = eqToThree([0, 0, 1]);
  const Z = eqToThree([Math.sin(G), -Math.cos(G), 0]);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
}
// Lokal retning på en kugle (samme konvention som SphereGeometry-UV'erne).
const latLonDir = (lat, lon, out = new THREE.Vector3()) =>
  out.set(Math.cos(lat * DEG) * Math.cos(lon * DEG), Math.sin(lat * DEG), -Math.cos(lat * DEG) * Math.sin(lon * DEG));

// Voyager 1: retning (RA 17t13m, dek. +12°) og ca. 172,3 AU fra Solen den 18. nov. 2026, +3,57 AU/år.
const VOYAGER_LIGHTDAY = new Date('2026-11-18T10:16:07Z');
const voyagerAU = (date = NOW) => 172.3 + 3.57 * ((date - VOYAGER_LIGHTDAY) / (365.25 * 86400000));
const voyagerDir = eqToThree(radec(17.22, 12.0));
const voyagerYears = () => Math.floor((NOW - new Date('1977-09-05T12:56:00Z')) / (365.25 * 86400000));

// ---------- Planetdata til kort ----------
const PLANETS = [
  { id: 'mercury', name: 'Merkur', km: 2439.7, rD: 0.13, type: 0, c: [0x8d8680, 0x5b5652, 0xb8b0a6], tilt: 0.03,
    facts: [['Diameter', '4.879 km'], ['Et år', '88 døgn'], ['Et døgn', '176 jorddøgn'], ['Temperatur', '−180 til 430 °C'], ['Måner', '0']],
    note: 'Fra solopgang til solopgang går der to merkurår.' },
  { id: 'venus', name: 'Venus', km: 6051.8, rD: 0.22, type: 2, c: [0xe8d3a6, 0xc9a86c, 0xf3e6c4], tilt: 177.4,
    facts: [['Diameter', '12.104 km'], ['Et år', '225 døgn'], ['En omdrejning', '243 døgn (baglæns)'], ['Temperatur', '465 °C'], ['Måner', '0']],
    note: 'Et døgn er længere end et år, og Solen står op i vest.' },
  { id: 'earth', name: 'Jorden', km: 6371, rD: 0.24, type: -1, tilt: 23.44,
    facts: [['Diameter', '12.742 km'], ['Et år', '365,25 døgn'], ['Et døgn', '24 timer'], ['Gennemsnit', '+15 °C'], ['Måner', '1']],
    note: 'Den eneste adresse i universet, hvor vi med sikkerhed ved, at der findes liv.' },
  { id: 'mars', name: 'Mars', km: 3389.5, rD: 0.17, type: 1, c: [0xb5552b, 0x6e3420, 0xf2ece6], tilt: 25.2,
    facts: [['Diameter', '6.779 km'], ['Et år', '687 døgn'], ['Et døgn', '24 t 37 min'], ['Gennemsnit', '−63 °C'], ['Måner', '2']],
    note: 'Vulkanen Olympus Mons er ca. 2,5 gange så høj som Mount Everest.' },
  { id: 'jupiter', name: 'Jupiter', km: 69911, rD: 1.0, type: 3, c: [0xe3c9a2, 0xa8754a, 0xf5ecdc], spot: 1, tilt: 3.1,
    facts: [['Diameter', '139.820 km'], ['Et år', '11,9 år'], ['Et døgn', '9 t 56 min'], ['Skytoppe', '−110 °C'], ['Måner', 'ca. 100']],
    note: 'Den store røde plet er en storm, der er større end hele Jorden.' },
  { id: 'saturn', name: 'Saturn', km: 58232, rD: 0.86, type: 3, c: [0xe8d6a8, 0xb89a62, 0xf6ebcf], rings: 0, tilt: 26.7,
    facts: [['Diameter', '116.460 km'], ['Et år', '29,4 år'], ['Et døgn', '10 t 33 min'], ['Skytoppe', '−140 °C'], ['Måner', 'ca. 290']],
    note: 'Ringene er ca. 280.000 km brede, men de fleste steder kun omkring 10 meter tykke.' },
  { id: 'uranus', name: 'Uranus', km: 25362, rD: 0.5, type: 4, c: [0xa9dde2, 0x86c3cc, 0xcbeef0], rings: 1, tilt: 97.8,
    facts: [['Diameter', '50.724 km'], ['Et år', '84 år'], ['Et døgn', '17 t 14 min'], ['Skytoppe', '−195 °C'], ['Måner', '29']],
    note: 'Den ligger på siden, så hver pol får 42 års sommer og 42 års vinter.' },
  { id: 'neptune', name: 'Neptun', km: 24622, rD: 0.48, type: 4, c: [0x3f66d8, 0x2a45a6, 0x8fb0ff], tilt: 28.3,
    facts: [['Diameter', '49.244 km'], ['Et år', '165 år'], ['Et døgn', '16 t 6 min'], ['Skytoppe', '−200 °C'], ['Måner', 'mindst 16']],
    note: 'Her blæser de hurtigste vinde i solsystemet, over 2.000 km/t.' },
];

// ---------- Nære og kendte stjerner (RA timer, dek. grader, afstand lysår, temperatur K) ----------
const STARS = [
  ['Proxima Centauri', 14.4953, -62.68, 4.24, 3040, 1],
  ['Alfa Centauri A/B', 14.66, -60.83, 4.37, 5790, 1],
  ["Barnards stjerne", 17.963, 4.69, 5.96, 3130, 1],
  ['Luhman 16', 10.82, -53.32, 6.5, 1300, 0],
  ['Wolf 359', 10.941, 7.01, 7.86, 2800, 1],
  ['Lalande 21185', 11.056, 35.97, 8.31, 3550, 0],
  ['Sirius', 6.7525, -16.72, 8.6, 9940, 1],
  ['UV Ceti', 1.65, -17.95, 8.73, 2700, 0],
  ['Ross 154', 18.83, -23.84, 9.69, 3300, 0],
  ['Ross 248', 23.699, 44.17, 10.3, 2800, 0],
  ['Epsilon Eridani', 3.549, -9.46, 10.47, 5080, 1],
  ['Lacaille 9352', 23.098, -35.85, 10.72, 3700, 0],
  ['Ross 128', 11.795, 0.8, 11.0, 3200, 0],
  ['EZ Aquarii', 22.643, -15.3, 11.1, 3000, 0],
  ['Procyon', 7.655, 5.22, 11.46, 6530, 1],
  ['61 Cygni', 21.115, 38.75, 11.4, 4400, 0],
  ['Struve 2398', 18.71, 59.63, 11.5, 3400, 0],
  ['Groombridge 34', 0.3, 44.02, 11.6, 3700, 0],
  ['Epsilon Indi', 22.055, -56.79, 11.87, 4600, 0],
  ['Tau Ceti', 1.734, -15.94, 11.9, 5340, 1],
  ['Kapteyns stjerne', 5.19, -45.02, 12.8, 3600, 0],
  ['Altair', 19.846, 8.87, 16.7, 7700, 2],
  ['Vega', 18.6156, 38.78, 25.0, 9600, 2],
  ['Fomalhaut', 22.9608, -29.62, 25.1, 8600, 2],
  ['Pollux', 7.7553, 28.03, 33.8, 4600, 2],
  ['Arcturus', 14.261, 19.18, 36.7, 4290, 2],
  ['Capella', 5.278, 46.0, 42.9, 4970, 2],
  ['Aldebaran', 4.5987, 16.51, 65, 3910, 2],
  ['Regulus', 10.1395, 11.97, 79, 12460, 2],
  ['Polaris', 2.53, 89.26, 433, 6000, 3],
  ['Betelgeuse', 5.919, 7.41, 550, 3500, 3],
  ['Antares', 16.49, -26.43, 550, 3400, 3],
  ['Rigel', 5.242, -8.2, 860, 12100, 3],
  ['Deneb', 20.69, 45.28, 2600, 8500, 3],
];

// Lokalgruppen: navn, l, b, afstand (mio. lysår), diameter (tusind lysår), type (0 spiral, 1 irregulær, 2 elliptisk)
const LOCAL_GROUP = [
  ['Andromeda', 121.17, -21.57, 2.54, 170, 0],
  ['Triangulum', 133.61, -31.33, 2.73, 60, 0],
  ['Store Magellanske Sky', 280.47, -32.89, 0.163, 14, 1],
  ['Lille Magellanske Sky', 302.81, -44.33, 0.203, 7, 1],
  ['M32', 121.15, -21.98, 2.49, 6.5, 2],
  ['M110', 120.72, -21.14, 2.69, 17, 2],
  ['NGC 6822', 25.34, -18.4, 1.6, 7, 1],
  ['IC 1613', 129.73, -60.58, 2.38, 10, 1],
  ['Leo I', 225.99, 49.11, 0.82, 2, 2],
  ['Sagittarius-dværgen', 5.6, -14.2, 0.07, 10, 2],
  ['Fornax-dværgen', 237.1, -65.7, 0.46, 3, 2],
  ['Sculptor-dværgen', 287.5, -83.2, 0.29, 3, 2],
];

// Temperatur (K) -> RGB (Tanner Helland-tilnærmelse), let afmættet som øjet ser stjerner.
function kelvinRGB(K, desat = 0.2) {
  const t = K / 100;
  let r, g, b;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }
  const c = [clamp(r, 0, 255) / 255, clamp(g, 0, 255) / 255, clamp(b, 0, 255) / 255];
  return c.map((v) => lerp(v, 1, desat));
}
