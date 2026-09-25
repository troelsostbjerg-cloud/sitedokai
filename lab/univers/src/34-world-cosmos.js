// ============================================================
// 34 · Verden: Dybden og Uendeligheden
// Én logaritmisk skala s = log10(synsfelt i meter). Hvert lag tegnes i sine egne
// enheder og skaleres/flyttes hvert billede, så præcisionen holder over 20 størrelsesordener.
// ============================================================
const FS_WEB = /* glsl */ `
uniform float uOpacity; uniform float uRed; uniform float uReach; uniform float uReachR;
varying vec3 vColor; varying float vB; varying float vR;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c) * 4.0;
  float a = exp(-d * 3.2) * (1.0 - smoothstep(0.7, 1.0, d));
  vec3 col = mix(vColor, vec3(vColor.r * 1.1, vColor.g * 0.42, vColor.b * 0.18), uRed);
  if (uReach > 0.0) {
    float inside = 1.0 - smoothstep(uReachR * 0.97, uReachR * 1.03, vR);
    col = mix(col * 0.32, vec3(1.0, 0.78, 0.42) * (0.7 + 0.5 * vColor.r), inside * uReach);
  }
  gl_FragColor = vec4(col * uOpacity * vB * a, 1.0);
}`;
const VS_WEB = VS_POINTS.replace('varying vec3 vColor; varying float vB;', 'varying vec3 vColor; varying float vB; varying float vR;').replace('vColor = aColor;', 'vColor = aColor; vR = length(position);');
const FS_CMB = /* glsl */ `
uniform float uOpacity;
varying vec3 vW; varying vec3 vN; varying vec3 vObj; varying vec2 vUv;
${GLSL_NOISE}
void main(){
  vec3 d = normalize(vObj);
  float n = fbm5(d * 6.5) * 0.65 + fbm4(d * 19.0) * 0.35;
  vec3 mid = vec3(0.95, 0.72, 0.32);
  vec3 col = n < 0.0 ? mix(mid, vec3(0.08, 0.22, 0.95), clamp(-n * 2.4, 0.0, 1.0)) : mix(mid, vec3(1.0, 0.25, 0.08), clamp(n * 2.4, 0.0, 1.0));
  vec3 V = normalize(cameraPosition - vW);
  float mu = abs(dot(normalize(vN), V));
  float a = pow(1.0 - mu, 3.2);
  gl_FragColor = vec4(col * a * uOpacity * 0.45, 1.0);
}`;
const VS_BH = /* glsl */ `
attribute float aEvap; attribute float aSize;
uniform float uAge; uniform float uPR; uniform float uOn;
varying float vF; varying float vI;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float alive = smoothstep(14.8, 16.0, uAge) * (1.0 - smoothstep(aEvap - 0.2, aEvap + 0.4, uAge));
  vF = exp(-pow((uAge - aEvap) / 0.9, 2.0)) * 5.0 * step(16.0, uAge);
  vI = alive * uOn;
  gl_PointSize = aSize * uPR * (1.0 + vF * 0.6);
}`;
const FS_BH = /* glsl */ `
varying float vF; varying float vI;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c) * 2.0;
  float ring = exp(-pow((r - 0.55) / 0.12, 2.0));
  float flash = exp(-r * r * 6.0) * vF;
  gl_FragColor = vec4(vec3(1.0, 0.55, 0.25) * ring * vI * 0.9 + vec3(1.0, 0.9, 0.8) * flash * uOn, 1.0);
}`.replace('varying float vF;', 'uniform float uOn; varying float vF;');

// ---------- Det kosmiske net: knuder (hobe) forbundet af filamenter ----------
function generateWeb({ count, R, cells, seed, shape = 'sphere', heavy = [], links = [], pNode = 0.2, pFil = 0.7 }) {
  const r = rng(seed);
  const C = (2 * R) / cells;
  const nodes = [], grid = new Map();
  for (let i = 0; i < cells; i++) for (let j = 0; j < cells; j++) for (let k = 0; k < cells; k++) {
    const x = -R + (i + 0.15 + 0.7 * r()) * C, y = -R + (j + 0.15 + 0.7 * r()) * C, z = -R + (k + 0.15 + 0.7 * r()) * C;
    if (shape === 'sphere' && x * x + y * y + z * z > R * R * 1.08) continue;
    grid.set(`${i},${j},${k}`, nodes.length);
    nodes.push({ x, y, z, m: 0.12 + Math.pow(r(), 2.6), i, j, k });
  }
  const edges = [], seen = new Set();
  const addEdge = (a, b) => { const key = a < b ? `${a}_${b}` : `${b}_${a}`; if (a !== b && !seen.has(key)) { seen.add(key); edges.push([a, b]); } };
  for (let a = 0; a < nodes.length; a++) {
    const A = nodes[a], cand = [];
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) for (let dk = -1; dk <= 1; dk++) {
      if (!di && !dj && !dk) continue;
      const b = grid.get(`${A.i + di},${A.j + dj},${A.k + dk}`);
      if (b === undefined) continue;
      const B = nodes[b];
      cand.push([b, (A.x - B.x) ** 2 + (A.y - B.y) ** 2 + (A.z - B.z) ** 2]);
    }
    cand.sort((p, q) => p[1] - q[1]);
    const kk = 2 + (r() < 0.5 ? 1 : 0);
    for (let c = 0; c < Math.min(kk, cand.length); c++) addEdge(a, cand[c][0]);
  }
  const heavyIdx = [];
  for (const h of heavy) {
    const idx = nodes.length;
    nodes.push({ x: h.p.x, y: h.p.y, z: h.p.z, m: h.m, heavy: true, spread: h.spread || 1 });
    heavyIdx.push(idx);
    const near = [];
    for (let b = 0; b < idx; b++) { const B = nodes[b]; near.push([b, (h.p.x - B.x) ** 2 + (h.p.y - B.y) ** 2 + (h.p.z - B.z) ** 2]); }
    near.sort((p, q) => p[1] - q[1]);
    for (let c = 0; c < (h.links || 5); c++) if (near[c]) addEdge(idx, near[c][0]);
  }
  for (const [a, b] of links) addEdge(heavyIdx[a], heavyIdx[b]);
  const len = (e) => Math.sqrt((nodes[e[0]].x - nodes[e[1]].x) ** 2 + (nodes[e[0]].y - nodes[e[1]].y) ** 2 + (nodes[e[0]].z - nodes[e[1]].z) ** 2);
  const cumN = new Float64Array(nodes.length), cumE = new Float64Array(edges.length);
  let acc = 0; nodes.forEach((n, i) => { acc += n.m * (n.heavy ? 3 : 1); cumN[i] = acc; });
  let accE = 0; edges.forEach((e, i) => { const hv = nodes[e[0]].heavy || nodes[e[1]].heavy ? 4 : 1; accE += len(e) * (0.25 + nodes[e[0]].m + nodes[e[1]].m) * hv; cumE[i] = accE; });
  const pick = (cum, total) => { const x = r() * total; let lo = 0, hi = cum.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < x) lo = mid + 1; else hi = mid; } return lo; };
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), size = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const u = r();
    let x, y, z, c, s;
    if (u < pNode) {
      const n = nodes[pick(cumN, acc)];
      const sg = C * 0.045 * (0.6 + n.m) * (n.heavy ? 2.2 * n.spread : 1);
      x = n.x + gauss(r) * sg; y = n.y + gauss(r) * sg; z = n.z + gauss(r) * sg;
      const b = 0.7 + r() * 0.7;
      c = [1.0 * b, 0.84 * b, 0.62 * b]; s = 1.3 + r() * 1.4;
    } else if (u < pNode + pFil) {
      const e = edges[pick(cumE, accE)];
      const A = nodes[e[0]], B = nodes[e[1]], t = r();
      const sg = C * 0.02 * (1 + 0.8 * Math.sin(t * Math.PI));
      x = lerp(A.x, B.x, t) + gauss(r) * sg; y = lerp(A.y, B.y, t) + gauss(r) * sg; z = lerp(A.z, B.z, t) + gauss(r) * sg;
      const near = Math.max(1 - t, t);
      const b = 0.35 + r() * 0.45 + near * 0.2;
      c = [0.62 * b, 0.72 * b, 1.0 * b]; s = 0.9 + r() * 0.9;
    } else {
      const n = nodes[Math.floor(r() * nodes.length)];
      x = n.x + (r() - 0.5) * C * 0.9; y = n.y + (r() - 0.5) * C * 0.9; z = n.z + (r() - 0.5) * C * 0.9;
      const b = 0.2 + r() * 0.2;
      c = [0.5 * b, 0.55 * b, 0.75 * b]; s = 0.7;
    }
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    col.set(c, i * 3);
    size[i] = s;
  }
  return { pos, col, size };
}

// ---------- Procedurel Mælkevej (galaktisk-kartesisk, centreret i centrum, enhed = 1.000 lysår) ----------
function generateGalaxy(count, seed, withArrival = false) {
  const r = rng(seed);
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), size = new Float32Array(count);
  const arrival = withArrival ? new Float32Array(count) : null;
  const pitch = 14 * DEG, b = 1 / Math.tan(pitch), R0 = 21, th0 = Math.PI;
  const bar = [-Math.cos(27 * DEG), Math.sin(27 * DEG)];
  const sun = [-26.67, 0, 0.02];
  for (let i = 0; i < count; i++) {
    const u = r();
    let x, y, z, c, s;
    if (u < 0.13) {
      const along = gauss(r) * 5.5, across = gauss(r) * 1.9;
      x = bar[0] * along - bar[1] * across; y = bar[1] * along + bar[0] * across; z = gauss(r) * 1.3;
      const k = 0.4 + r() * 0.3;
      c = [1.0 * k, 0.78 * k, 0.5 * k]; s = 1 + r() * 1.2;
    } else if (u < 0.2) {
      x = gauss(r) * 3.2; y = gauss(r) * 3.2; z = gauss(r) * 2.2;
      const k = 0.35 + r() * 0.3;
      c = [1.0 * k, 0.74 * k, 0.46 * k]; s = 1 + r() * 1.1;
    } else if (u < 0.22) {
      // Orion-armen: en kort sporre gennem Solens position
      const th = th0 + (r() - 0.5) * 0.9, rad = 26.67 * Math.exp((th - th0) * 0.22) + gauss(r) * 0.9;
      x = Math.cos(th) * rad; y = Math.sin(th) * rad; z = gauss(r) * 0.25;
      const k = 0.6 + r() * 0.6;
      c = [0.7 * k, 0.8 * k, 1.0 * k]; s = 0.9 + r();
    } else {
      let rad = -9.5 * Math.log(Math.max(1e-6, r()));
      if (rad > 55) rad = 55 * r();
      rad = Math.max(rad, 3.5 + r() * 2);
      const inArm = r() < 0.68;
      let th;
      if (inArm) {
        const k = Math.floor(r() * 4);
        th = th0 + (k * Math.PI) / 2 + b * Math.log(rad / R0);
        th += gauss(r) * (1.1 + 0.07 * rad) / rad;
      } else th = r() * Math.PI * 2;
      x = Math.cos(th) * rad; y = Math.sin(th) * rad;
      z = gauss(r) * (r() < 0.12 ? 0.9 : 0.28);
      if (inArm && r() < 0.035) { c = [1.0, 0.32, 0.5]; s = 1.8 + r() * 1.5; }
      else if (inArm) { const k = 0.5 + r() * 0.7; c = [0.62 * k, 0.74 * k, 1.0 * k]; s = 0.8 + r() * 1.3; }
      else { const k = 0.4 + r() * 0.5; c = [1.0 * k, 0.86 * k, 0.66 * k]; s = 0.7 + r() * 0.9; }
    }
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    col.set(c, i * 3);
    size[i] = s;
    if (arrival) {
      const d = Math.hypot(x - sun[0], y - sun[1], z - sun[2]);
      arrival[i] = d / 20 * (0.9 + 0.2 * r()); // mio. år ved en effektiv front på ca. 2 % af lysets hastighed
    }
  }
  return { pos, col, size, arrival, sun };
}

class CosmosWorld extends World {
  constructor() {
    super('cosmos');
    this.bloom = [0.55, 0.45, 0.9];
    this.cam = { near: 0.004, far: 60000 };
    this.s = 7.35; this.sGoal = 7.35; this.sMin = 6.8; this.sMax = 27.6;
    this.sAnim = null;
    this.age = 10.14;
    this.auto = null;
    this.beyondBright = 1;
  }
  viewD() { return 10 / (2 * Math.tan((camera.fov * DEG) / 2) * Math.min(1, camera.aspect)); }

  build() {
    this.T = new THREE.Vector3();
    this.layers = [];
    const O = new THREE.Vector3();
    this.earthM = planetThree('earth', JD_NOW).multiplyScalar(AU);
    this.gcDir = galToThree([1, 0, 0]);
    this.ngp = galToThree([0, 0, 1]);
    this.gcM = this.gcDir.clone().multiplyScalar(26670 * LY);
    this.m31M = galToThree(lb(121.17, -21.57)).multiplyScalar(2.54e6 * LY);
    this.lgM = this.m31M.clone().multiplyScalar(0.42);
    this.keys = [[9.3, this.earthM], [10.8, O], [20.2, O], [21.3, this.gcM], [22.2, this.gcM], [23.0, this.lgM], [23.8, this.lgM], [24.6, O]];
    this.buildEarth(); this.buildSolar(); this.buildOort(); this.buildNeighbors(); this.buildGalaxy();
    this.buildLocalGroup(); this.buildLaniakea(); this.buildUniverse(); this.buildBeyond();
    this.initInput();
  }

  // ---------- Lag-mekanik ----------
  addLayer(name, unit, anchor, range, sRef, quat) {
    const L = { name, unit, anchor, range, sRef, group: new THREE.Group(), alpha: 0, fades: [], atten: [], labels: [], onUpdate: null };
    if (quat) L.group.quaternion.copy(quat);
    this.group.add(L.group);
    this.layers.push(L);
    return L;
  }
  fade(L, mat, base = 1, key = 'uOpacity') {
    L.fades.push((a) => { if (mat.uniforms && mat.uniforms[key]) mat.uniforms[key].value = base * a; else mat.opacity = base * a; });
  }
  pts(L, data, { size = 1.6, fs = FS_POINTS, vs = VS_POINTS, max = 18, extra = {}, uniforms = {}, bright = 1 } = {}) {
    const mat = pointsMaterial({ size, fs, vs, max, uniforms });
    const p = new THREE.Points(pointsGeometry(data.pos, data.col, data.size, extra), mat);
    p.frustumCulled = false;
    L.group.add(p);
    this.fade(L, mat, bright);
    L.atten.push(mat);
    return p;
  }
  lbl(L, html, cls, local, s0, s1, occluded) {
    const l = this.label(html, cls, (v) => L.group.localToWorld(v.copy(local)));
    if (occluded) l.occluded = occluded;
    L.labels.push({ l, s0, s1 });
    return l;
  }
  targetFor(s, out) {
    const K = this.keys;
    if (s <= K[0][0]) return out.copy(K[0][1]);
    for (let i = 0; i < K.length - 1; i++) if (s <= K[i + 1][0]) return out.lerpVectors(K[i][1], K[i + 1][1], smooth(K[i][0], K[i + 1][0], s));
    return out.copy(K[K.length - 1][1]);
  }

  // ---------- Lagene ----------
  buildEarth() {
    const L = this.addLayer('earth', R_EARTH, this.earthM, [6.3, 6.6, 9.7, 10.4], 7.3);
    this.earth = createEarth({ segments: TOUCH ? 96 : 128 });
    this.earth.spin.quaternion.copy(earthQuaternion(JD_NOW));
    L.group.add(this.earth.group);
    const mg = moonGeo(JD_NOW);
    this.moon = createMoon(0.2727);
    this.moon.mesh.position.copy(mg.dir).multiplyScalar(mg.km / 6371);
    L.group.add(this.moon.mesh);
    const orbit = lineFromPoints(circlePoints(mg.km / 6371, 256), new THREE.Color(0.5, 0.65, 0.9), 0.3, true);
    L.group.add(orbit);
    this.fade(L, orbit.material, 0.3);
    const dk = latLonDir(55.68, 12.57);
    const _a = new THREE.Vector3(), _b = new THREE.Vector3();
    this.lbl(L, 'Jorden', 'big', new THREE.Vector3(0, 1.25, 0), 6.8, 8.6);
    const dkl = this.lbl(L, 'Du er her', 'here', dk.clone().multiplyScalar(1.01), 6.8, 7.9);
    dkl.getPos = (v) => L.group.localToWorld(v.copy(dk).multiplyScalar(1.01).applyQuaternion(this.earth.spin.quaternion));
    dkl.occluded = (pos) => { L.group.getWorldPosition(_a); _b.copy(pos).sub(_a).normalize(); return _b.dot(_a.copy(camera.position).sub(pos)) < 0; };
    this.lbl(L, 'Månen · 384.400 km', 'faint', this.moon.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)), 8.4, 10.1);
    L.onUpdate = () => {
      const k = 10 / Math.pow(10, this.s);
      const sunDisp = new THREE.Vector3(-this.T.x * k, -this.T.y * k, -this.T.z * k);
      this.earth.setSun(sunDisp);
      this.earth.update(this.t || 0);
      this.moon.setSun(sunDisp);
    };
  }

  buildSolar() {
    const L = this.addLayer('solar', AU, new THREE.Vector3(), [9.6, 10.4, 14.6, 15.5], 13);
    const sun = createSun({ radius: 0.00465, intensity: 3, rays: 0, minPx: 0 });
    sun.glow.material.uniforms.uMinPx.value = 18;
    L.group.add(sun.group);
    this.fade(L, sun.glow.material, 0.9, 'uIntensity');
    this.solarSun = sun;
    const col = [], pos = [], sz = [];
    for (const d of PLANETS) {
      const p = planetThree(d.id, JD_NOW);
      pos.push(p.x, p.y, p.z);
      const c = new THREE.Color(d.c ? d.c[0] : 0x6fa8ff);
      col.push(c.r * 2.2, c.g * 2.2, c.b * 2.2);
      sz.push(3.2);
      const orbit = lineFromPoints(orbitEcl(d.id, JD_NOW, 256).map(([x, y, z]) => eclToThree(x, y, z)), new THREE.Color(0.45, 0.58, 0.85), 0.3, true);
      L.group.add(orbit);
      this.fade(L, orbit.material, 0.3);
      const inner = ['mercury', 'venus', 'earth', 'mars'].includes(d.id);
      this.lbl(L, d.name, inner ? '' : 'faint', p.clone(), inner ? 10.4 : 11.7, inner ? 12.2 : 13.9);
    }
    this.pts(L, { pos: new Float32Array(pos), col: new Float32Array(col), size: new Float32Array(sz) }, { size: 1.4 });
    const r = rng(17);
    const belt = (n, a0, a1, inc, c) => {
      const p = new Float32Array(n * 3), cc = new Float32Array(n * 3), s = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const a = lerp(a0, a1, Math.pow(r(), 0.8)), th = r() * Math.PI * 2, y = gauss(r) * inc * a;
        p.set([Math.cos(th) * a, y, Math.sin(th) * a], i * 3);
        const k = 0.4 + r() * 0.5;
        cc.set([c[0] * k, c[1] * k, c[2] * k], i * 3);
        s[i] = 0.7 + r() * 0.8;
      }
      return { pos: p, col: cc, size: s };
    };
    this.pts(L, belt(N(2500), 2.15, 3.3, 0.08, [0.8, 0.72, 0.6]), { size: 1.2 });
    this.pts(L, belt(N(3500), 30, 50, 0.12, [0.55, 0.65, 0.9]), { size: 1.2 });
    const helio = fresnelShell(120, new THREE.Color(0.3, 0.55, 1.0), { power: 3, intensity: 0.4 });
    L.group.add(helio);
    this.fade(L, helio.material, 0.35, 'uIntensity');
    const ld = lineFromPoints(circlePoints(173.1, 200), new THREE.Color(1.0, 0.75, 0.45), 0.35, true);
    L.group.add(ld);
    this.fade(L, ld.material, 0.35);
    const vpos = voyagerDir.clone().multiplyScalar(voyagerAU());
    const vp = this.pts(L, { pos: new Float32Array([vpos.x, vpos.y, vpos.z]), col: new Float32Array([0.6, 0.9, 1.4]), size: new Float32Array([3.5]) }, { size: 1.4 });
    vp.renderOrder = 3;
    this.lbl(L, 'Solen', 'here', new THREE.Vector3(0, 0, 0), 10.5, 15.2);
    this.lbl(L, 'Asteroidebæltet', 'faint nodot', new THREE.Vector3(2.0, 0, 2.0), 11.2, 12.3);
    this.lbl(L, 'Kuiperbæltet', 'faint nodot', new THREE.Vector3(-30, 0, 30), 12.8, 14.0);
    this.lbl(L, 'Heliopausen · her slutter solvinden', 'faint nodot', new THREE.Vector3(-70, -80, 40), 13.3, 14.7);
    this.lbl(L, `Voyager 1 · ${voyagerYears()} år på vejen`, 'cool', vpos, 13.2, 15.1);
    this.lbl(L, '1 lysdøgn', 'nodot', new THREE.Vector3(122, 0, 122), 13.8, 15.1);
    L.onUpdate = () => this.solarSun.update(this.t || 0);
  }

  buildOort() {
    const L = this.addLayer('oort', 1000 * AU, new THREE.Vector3(), [14.4, 15.3, 16.9, 17.6], 16.2);
    const n = N(9000), r = rng(23);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n);
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      const inner = r() < 0.35;
      const rad = inner ? lerp(2, 20, Math.pow(r(), 0.7)) : lerp(20, 100, Math.pow(r(), 0.9));
      v.set(gauss(r), gauss(r) * (inner ? 0.45 : 1), gauss(r)).normalize().multiplyScalar(rad);
      v.toArray(pos, i * 3);
      const k = 0.25 + r() * 0.35;
      col.set([0.7 * k, 0.82 * k, 1.0 * k], i * 3);
      sz[i] = 0.8 + r() * 0.8;
    }
    this.pts(L, { pos, col, size: sz }, { size: 1.3 });
    const sg = glowSprite({ color: new THREE.Color(1, 0.8, 0.55), size: 0.001, intensity: 1.6, core: 0.05, fall: 8, minPx: 14 });
    L.group.add(sg);
    this.fade(L, sg.material, 1.6, 'uIntensity');
    this.lbl(L, 'Oortskyen · op til ca. 1,5 lysår ude', 'faint nodot', new THREE.Vector3(60, 45, 40), 15.5, 17.3);
    this.lbl(L, 'Solen', 'here', new THREE.Vector3(), 15.3, 17.2);
  }

  buildNeighbors() {
    const L = this.addLayer('neighbors', LY, new THREE.Vector3(), [15.9, 16.5, 19.4, 20.3], 17.6);
    const r = rng(31);
    const n = N(2600);
    const pos = [], col = [], sz = [];
    for (let i = 0; i < n; i++) {
      const rad = 60 * Math.cbrt(r());
      const v = new THREE.Vector3(gauss(r), gauss(r), gauss(r)).normalize().multiplyScalar(Math.max(rad, 5));
      pos.push(v.x, v.y, v.z);
      const c = kelvinRGB(r() < 0.75 ? 2800 + r() * 1200 : 4000 + r() * 5000, 0.2);
      const k = 0.35 + r() * 0.5;
      col.push(c[0] * k, c[1] * k, c[2] * k);
      sz.push(0.8 + r() * 1.0);
    }
    for (const [name, ra, dec, dist, T, cls] of STARS) {
      const v = eqToThree(radec(ra, dec)).multiplyScalar(dist);
      pos.push(v.x, v.y, v.z);
      const c = kelvinRGB(T, 0.15);
      const k = cls >= 2 ? 2.2 : 1.5;
      col.push(c[0] * k, c[1] * k, c[2] * k);
      sz.push(cls >= 2 ? 4.2 : 3.2);
      const s0 = cls <= 1 ? 16.2 : cls === 2 ? 17.3 : 18.6;
      const s1 = cls <= 1 ? 17.9 : cls === 2 ? 19.2 : 20.3;
      if (cls >= 1) this.lbl(L, `${name} · ${fmt(dist, dist < 20 ? 2 : 0)} lysår`, cls >= 2 ? '' : 'faint', v.clone(), s0, s1);
    }
    this.pts(L, { pos: new Float32Array(pos), col: new Float32Array(col), size: new Float32Array(sz) }, { size: 1.5 });
    const sg = glowSprite({ color: new THREE.Color(1, 0.8, 0.55), size: 0.001, intensity: 1.8, core: 0.05, fall: 8, minPx: 13 });
    L.group.add(sg);
    this.fade(L, sg.material, 1.8, 'uIntensity');
    this.lbl(L, 'Solen', 'here', new THREE.Vector3(), 16.0, 19.2);
  }

  buildGalaxy() {
    const L = this.addLayer('galaxy', 1000 * LY, this.gcM, [19.4, 20.3, 22.3, 23.1], 21.1, galacticQuaternion());
    const g = generateGalaxy(N(95000), 71);
    this.pts(L, g, { size: 1.4, max: 10, bright: 0.75 });
    // Støvbånd: mørke punkter langs armenes inderside
    const n = N(14000), r = rng(72);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n);
    const b = 1 / Math.tan(14 * DEG);
    for (let i = 0; i < n; i++) {
      const rad = 4 + Math.pow(r(), 0.7) * 38;
      const k = Math.floor(r() * 4);
      const th = Math.PI + (k * Math.PI) / 2 + b * Math.log(rad / 21) - 0.12 + gauss(r) * 0.05;
      pos.set([Math.cos(th) * rad, Math.sin(th) * rad, gauss(r) * 0.12], i * 3);
      col.set([0.05, 0.035, 0.03], i * 3);
      sz[i] = 2 + r() * 2.5;
    }
    const dust = this.pts(L, { pos, col, size: sz }, { size: 1.6, max: 12, fs: FS_POINTS.replace('gl_FragColor = vec4(vColor * uOpacity * vB * a, 1.0);', 'gl_FragColor = vec4(vColor, a * 0.55 * uOpacity * vB);') });
    dust.material.blending = THREE.NormalBlending;
    dust.renderOrder = 4;
    const bulge = glowSprite({ color: new THREE.Color(1, 0.78, 0.5), size: 14, intensity: 0.22, core: 0.02, fall: 6 });
    L.group.add(bulge);
    this.fade(L, bulge.material, 0.22, 'uIntensity');
    const sunLocal = new THREE.Vector3(-26.67, 0, 0.02);
    this.lbl(L, 'Du er her', 'here', sunLocal, 19.6, 22.2);
    this.lbl(L, 'Centrum · sort hul på 4 mio. solmasser', 'faint', new THREE.Vector3(0, 0, 0), 20.4, 21.9);
    const armPt = (k, rad) => { const th = Math.PI + (k * Math.PI) / 2 + b * Math.log(rad / 21); return new THREE.Vector3(Math.cos(th) * rad, Math.sin(th) * rad, 0); };
    this.lbl(L, 'Perseus-armen', 'faint nodot', armPt(-1, 36), 20.5, 21.8);
    this.lbl(L, 'Skytte-armen', 'faint nodot', armPt(0, 17), 20.5, 21.8);
    this.lbl(L, 'Orion-armen', 'faint nodot', new THREE.Vector3(-25.6, -4.5, 0), 20.0, 21.2);
  }

  buildLocalGroup() {
    const L = this.addLayer('lg', 1e6 * LY, new THREE.Vector3(), [21.9, 22.5, 24.0, 24.7], 23);
    const r = rng(41);
    const place = (dir, distMly, diamKly, kind, seed, tint, normal) => {
      const mat = new THREE.MeshBasicMaterial({ map: galaxyTexture(seed, kind), color: tint, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: 1 });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      m.position.copy(dir).multiplyScalar(distMly);
      m.scale.setScalar((diamKly / 1000) * (kind === 2 ? 3 : 3.2));
      const nrm = normal || new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize();
      m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm);
      L.group.add(m);
      this.fade(L, mat, 1);
      if (diamKly >= 14) {
        const gs = glowSprite({ color: kind === 1 ? new THREE.Color(0.7, 0.8, 1.0) : new THREE.Color(1, 0.85, 0.65), size: 0.02, intensity: 1.1, core: 0.05, fall: 7, minPx: diamKly > 50 ? 13 : 8 });
        gs.position.copy(m.position);
        L.group.add(gs);
        this.fade(L, gs.material, 1.1, 'uIntensity');
      }
      return m;
    };
    const mw = place(this.gcDir, 0.02667, 110, 0, 5, new THREE.Color(1, 1, 1), this.ngp);
    for (const [name, l, b, d, diam, kind] of LOCAL_GROUP) {
      const dir = galToThree(lb(l, b));
      const nrm = name === 'Andromeda' ? dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0).cross(dir).normalize(), 77 * DEG) : null;
      place(dir, d, diam, kind, Math.floor(l * 10), kind === 1 ? new THREE.Color(0.85, 0.9, 1.0) : new THREE.Color(1, 0.95, 0.9), nrm);
      if (['Andromeda', 'Triangulum', 'Store Magellanske Sky'].includes(name)) {
        const txt = name === 'Andromeda' ? 'Andromeda · 2,5 mio. lysår' : name === 'Triangulum' ? 'Triangulum · 2,7 mio. lysår' : 'Magellanske Skyer';
        this.lbl(L, txt, name === 'Andromeda' ? '' : 'faint', dir.clone().multiplyScalar(d), 22.3, 24.1);
      }
    }
    // Dværggalakser rundt om Mælkevejen og Andromeda
    const n = 40, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n);
    const m31 = galToThree(lb(121.17, -21.57)).multiplyScalar(2.54);
    for (let i = 0; i < n; i++) {
      const c = i % 2 ? m31 : this.gcDir.clone().multiplyScalar(0.027);
      pos.set([c.x + gauss(r) * 0.3, c.y + gauss(r) * 0.3, c.z + gauss(r) * 0.3], i * 3);
      col.set([0.6, 0.62, 0.75], i * 3);
      sz[i] = 1.5 + r() * 1.5;
    }
    this.pts(L, { pos, col, size: sz }, { size: 1.3 });
    this.lbl(L, 'Mælkevejen · os', 'here', mw.position.clone(), 22.2, 24.1);
  }

  buildLaniakea() {
    const L = this.addLayer('laniakea', 1e6 * LY, new THREE.Vector3(), [23.6, 24.2, 25.7, 26.4], 25);
    const P = (l, b, d) => galToThree(lb(l, b)).multiplyScalar(d);
    const heavy = [
      { p: new THREE.Vector3(0, 0, 0), m: 0.4, links: 3 },
      { p: P(283.8, 74.5, 54), m: 1.6, links: 6, spread: 1.4 },
      { p: P(302.4, 21.6, 170), m: 1.4, links: 5 },
      { p: P(269.6, 26.5, 160), m: 1.1, links: 5 },
      { p: P(325.3, -7.3, 220), m: 2.2, links: 7, spread: 1.6 },
      { p: P(150, -13, 240), m: 1.6, links: 6, spread: 1.2 },
      { p: P(58.1, 88.0, 320), m: 1.6, links: 6 },
    ];
    const web = generateWeb({ count: N(46000), R: 330, cells: 11, seed: 55, heavy, links: [[0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [0, 5]] });
    this.pts(L, web, { size: 1.4, max: 12, bright: 0.45 });
    this.lbl(L, 'Lokalgruppen · os', 'here', heavy[0].p.clone(), 23.8, 25.3);
    this.lbl(L, 'Virgohoben', '', heavy[1].p.clone(), 24.1, 25.4);
    this.lbl(L, 'Den Store Tiltrækker', '', heavy[4].p.clone(), 24.4, 25.7);
    this.lbl(L, 'Perseus-Pisces', 'faint', heavy[5].p.clone(), 24.5, 25.7);
    this.lbl(L, 'Laniakea · 520 mio. lysår', 'faint nodot', P(300, 40, 140).add(new THREE.Vector3(0, 60, 0)), 24.6, 25.7);
  }

  buildUniverse() {
    const L = this.addLayer('universe', 1e9 * LY, new THREE.Vector3(), [25.4, 26.2, 28.3, 29.3], 26.9);
    const web = generateWeb({ count: N(115000), R: 46.5, cells: 17, seed: 88 });
    this.webPts = this.pts(L, web, { size: 1.4, max: 10, fs: FS_WEB, vs: VS_WEB, uniforms: { uRed: { value: 0 }, uReach: { value: 0 }, uReachR: { value: 18 } } });
    const cmbMat = new THREE.ShaderMaterial({ uniforms: { uOpacity: { value: 1 } }, vertexShader: VS_SURFACE, fragmentShader: FS_CMB, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    this.cmb = new THREE.Mesh(new THREE.SphereGeometry(46.5, 96, 48), cmbMat);
    L.group.add(this.cmb);
    this.cmbBase = 1;
    L.fades.push((a) => { cmbMat.uniforms.uOpacity.value = a * this.cmbBase; });
    const hg = glowSprite({ color: new THREE.Color(1, 0.8, 0.5), size: 0.01, intensity: 1.6, core: 0.05, fall: 8, minPx: 12 });
    L.group.add(hg);
    this.fade(L, hg.material, 1.6, 'uIntensity');
    this.lbl(L, 'Du er her', 'here', new THREE.Vector3(), 25.6, 29);
    this.lbl(L, 'Baggrundsstrålingen · lys fra 380.000 år efter Big Bang', 'faint nodot', new THREE.Vector3(0, 36, 30), 26.6, 28.2);
    this.lbl(L, 'Det observerbare univers · 93 mia. lysår på tværs', 'nodot', new THREE.Vector3(0, -40, 26), 26.6, 28.0);
    // Sorte huller til tidskapitlet
    const n = 500, r = rng(66);
    const pos = new Float32Array(n * 3), ev = new Float32Array(n), sz = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos.set([gauss(r) * 16, gauss(r) * 16, gauss(r) * 16], i * 3);
      ev[i] = 67 + Math.pow(r(), 0.6) * 33;
      sz[i] = 4 + r() * 5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aEvap', new THREE.BufferAttribute(ev, 1));
    g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
    this.bhMat = new THREE.ShaderMaterial({ uniforms: { uAge: { value: 10 }, uPR: { value: renderer.getPixelRatio() }, uOn: { value: 0 } }, vertexShader: VS_BH, fragmentShader: FS_BH, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const bh = new THREE.Points(g, this.bhMat);
    bh.frustumCulled = false;
    L.group.add(bh);
    L.onUpdate = (a) => {
      const y = this.age;
      const red = smooth(10.6, 13.8, y);
      const bright = y < 10.2 ? 1 : lerp(1, 0.06, smooth(10.8, 14.6, y)) * (1 - smooth(34, 40, y));
      this.webPts.material.uniforms.uRed.value = red;
      this.webPts.material.uniforms.uOpacity.value = a * bright * 0.42;
      this.cmbBase = y < 10.2 ? 1 : 1 - smooth(10.3, 11, y) * 0.85;
      this.bhMat.uniforms.uAge.value = y;
      this.bhMat.uniforms.uOn.value = a * (this.mode === 'time' ? 1 : 0);
    };
  }

  buildBeyond() {
    const L = this.addLayer('beyond', 1e9 * LY, new THREE.Vector3(), [27.4, 28.4, 998, 999], 28.6);
    this.beyondLayer = L;
    const web = generateWeb({ count: N(40000), R: 15, cells: 10, seed: 314, shape: 'cube' });
    const geo = pointsGeometry(web.pos, web.col, web.size);
    this.decades = [0, 1, 2].map(() => {
      const mat = pointsMaterial({ size: 1.4, max: 8 });
      const p = new THREE.Points(geo, mat);
      p.frustumCulled = false;
      this.group.add(p);
      return { p, mat };
    });
    // Andre observatørers horisonter
    const r = rng(12);
    this.bubbles = new THREE.Group();
    L.group.add(this.bubbles);
    const mk = (pos, c, i) => {
      const m = fresnelShell(46.5, c, { power: 3.2, intensity: 0.5 });
      m.position.copy(pos);
      this.bubbles.add(m);
      this.fade(L, m.material, i === 0 ? 0.7 : 0.35, 'uIntensity');
    };
    mk(new THREE.Vector3(), new THREE.Color(1.0, 0.72, 0.4), 0);
    for (let i = 1; i < 9; i++) mk(new THREE.Vector3(gauss(r), gauss(r) * 0.7, gauss(r)).normalize().multiplyScalar(55 + r() * 70), new THREE.Color(0.4, 0.7, 1.0), i);
    L.onUpdate = () => { this.bubbles.visible = this.s < 30.5; };
    this.lbl(L, 'Vores horisont', 'here', new THREE.Vector3(0, 47, 0), 28.0, 29.6);
    this.lbl(L, 'En andens horisont', 'cool nodot', this.bubbles.children[1].position.clone(), 28.3, 29.8);
  }
  updateBeyond(s) {
    const present = smooth(27.5, 28.7, s) * this.beyondBright;
    const base = Math.floor(s - 0.5);
    for (let i = 0; i < 3; i++) {
      const n = base - 1 + i;
      const slot = this.decades[((n % 3) + 3) % 3];
      const sc = Math.pow(10, n + 0.5 - s);
      slot.p.scale.setScalar(sc);
      slot.p.rotation.set(n * 1.7, n * 2.3, n * 0.9);
      const w = Math.exp(-Math.pow((s - (n + 0.5)) / 0.8, 2));
      slot.mat.uniforms.uOpacity.value = w * present * 0.45;
      slot.p.visible = present > 0.003;
    }
  }

  // ---------- Input: rul og knib ændrer skalaen ----------
  initInput() {
    canvas.addEventListener('wheel', (e) => {
      if (activeWorld !== this || !this.zoomable) return;
      e.preventDefault();
      this.nudge(e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0022));
    }, { passive: false });
    const pts = new Map();
    let d0 = 0;
    canvas.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2) d0 = 0; });
    canvas.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2 && activeWorld === this && this.zoomable) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        if (d0 > 0) this.nudge(-Math.log10(d / d0) * 1.6);
        d0 = d;
      }
    });
    const up = (e) => { pts.delete(e.pointerId); d0 = 0; };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
  }
  nudge(ds) {
    this.sAnim = null;
    if (this.auto) this.auto.paused = true;
    this.sGoal = clamp(this.sGoal + ds, this.sMin, this.sMax);
    onCosmosUserZoom(this.sGoal);
  }
  setS(s, dur = 0) {
    s = clamp(s, this.sMin, this.sMax);
    if (dur <= 0) { this.sAnim = null; this.sGoal = s; return; }
    this.sAnim = { from: this.s, to: s, t: 0, dur: REDUCED ? Math.min(dur, 0.5) : dur };
    this.sGoal = s;
  }
  flyToStop(s, dir, dur) {
    const D = this.viewD();
    const d = Math.max(2.5, Math.abs(s - this.s) * 0.45);
    dur = dur ?? clamp(d, 2.2, 7);
    this.setS(s, dur);
    if (dir) flyTo(dir.clone().normalize().multiplyScalar(D), new THREE.Vector3(), dur);
    return dur;
  }
  earthDir() {
    const sunFromEarth = this.earthM.clone().multiplyScalar(-1).normalize();
    const p = new THREE.Vector3().crossVectors(sunFromEarth, new THREE.Vector3(0, 1, 0)).normalize();
    return sunFromEarth.clone().multiplyScalar(0.55).addScaledVector(p, 0.8).add(new THREE.Vector3(0, 0.35, 0)).normalize();
  }
  galaxyDir() { return this.ngp.clone().multiplyScalar(1).addScaledVector(this.gcDir, -0.62).normalize(); }

  enter() {
    this.hideLabels();
    controls.enableZoom = false;
    const D = this.viewD();
    controls.minDistance = D; controls.maxDistance = D;
  }
  exit() {
    controls.enableZoom = true;
    this.auto = null;
    this.beyondBright = 1;
    hud('');
  }
  setMode(mode) {
    this.mode = mode;
    this.zoomable = true;
    this.sMin = mode === 'time' ? 26 : 6.8;
    this.sMax = mode === 'depth' ? 27.6 : 290;
    if (mode !== 'endless') this.auto = null;
  }

  update(dt, t) {
    this.t = t;
    const D = this.viewD();
    controls.minDistance = D; controls.maxDistance = D;
    if (this.sAnim) {
      const A = this.sAnim;
      A.t += dt;
      const k = clamp(A.t / A.dur, 0, 1);
      this.s = lerp(A.from, A.to, easeInOut(k));
      if (k >= 1) { this.sAnim = null; this.sGoal = this.s; }
    } else if (this.auto && !this.auto.paused) {
      const rate = clamp(0.8 + 0.07 * (this.s - 28), 0.8, 9);
      this.sGoal = Math.min(this.sGoal + rate * dt, this.auto.until);
      this.s = this.sGoal;
      if (this.s >= this.auto.until) { this.auto.paused = true; onEndlessDone(); }
    } else {
      this.s = lerp(this.s, this.sGoal, 1 - Math.exp(-dt * 6));
    }
    const s = this.s;
    const k = 10 / Math.pow(10, s);
    this.targetFor(s, this.T);
    for (const L of this.layers) {
      const [a0, a1, a2, a3] = L.range;
      const a = smooth(a0, a1, s) * (1 - smooth(a2, a3, s));
      L.alpha = a;
      const vis = a > 0.003;
      L.group.visible = vis;
      if (vis) {
        const sc = k * L.unit;
        L.group.scale.setScalar(sc);
        L.group.position.set((L.anchor.x - this.T.x) * k, (L.anchor.y - this.T.y) * k, (L.anchor.z - this.T.z) * k);
        L.group.updateMatrixWorld(true);
        for (const f of L.fades) f(a);
        const att = D * Math.pow(10, L.sRef - s);
        for (const m of L.atten) m.uniforms.uAtten.value = att;
        if (L.onUpdate) L.onUpdate(a, sc, s, t);
      }
      for (const lb of L.labels) {
        const la = smooth(lb.s0 - 0.3, lb.s0, s) * (1 - smooth(lb.s1, lb.s1 + 0.3, s));
        lb.l.show = vis && la > 0.02;
        lb.l.alpha = a * la;
      }
    }
    this.updateBeyond(s);
    for (const d of this.decades) d.p.position.set(0, 0, 0);
    // Stjernehimlen passer kun inde i galaksen.
    this.sky = 1 - smooth(19.3, 20.4, s);
    this.skyBand = 1 - smooth(19.3, 20.4, s);
    onCosmosScale(s);
  }
}
