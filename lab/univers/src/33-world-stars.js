// ============================================================
// 33 · Verden: Stjernernes liv og død
// Størrelser vises logaritmisk: visningsradius = 1,2 · (R/R☉)^0,33. De ægte tal står i HUD'en.
// ============================================================
const LIFE_TABLE = [[0.08, 1.2e13], [0.1, 6e12], [0.2, 1e12], [0.3, 3e11], [0.5, 6e10], [0.8, 2e10], [1, 1e10], [1.5, 3e9], [2, 1.2e9], [3, 3.5e8], [5, 1e8], [8, 4e7], [10, 2.5e7], [15, 1.3e7], [20, 9e6], [30, 6e6], [40, 5e6], [60, 3.8e6]];
function msLifetime(M) {
  for (let i = 0; i < LIFE_TABLE.length - 1; i++) {
    const [m0, t0] = LIFE_TABLE[i], [m1, t1] = LIFE_TABLE[i + 1];
    if (M <= m1) return Math.pow(10, lerp(Math.log10(t0), Math.log10(t1), (Math.log10(M) - Math.log10(m0)) / (Math.log10(m1) - Math.log10(m0))));
  }
  return 3.8e6;
}
function starModel(M) {
  const L = M < 0.43 ? 0.23 * Math.pow(M, 2.3) : M < 2 ? Math.pow(M, 4) : M < 55 ? 1.4 * Math.pow(M, 3.5) : 32000 * M;
  const R = M < 1 ? Math.pow(M, 0.8) : Math.pow(M, 0.62);
  const T = 5772 * Math.pow(L / (R * R), 0.25);
  const cls = M < 0.5 ? 'low' : M < 8 ? 'mid' : 'high';
  const fate = M < 0.5 ? 'Hvid dværg (efter billioner af år)' : M < 8 ? 'Hvid dværg' : M < 20 ? 'Neutronstjerne' : 'Sort hul';
  return { M, L, R, T, tMS: msLifetime(M), cls, fate };
}
const dispR = (R) => 1.2 * Math.pow(R, 0.33);
function yearsText(y) {
  if (y >= 1e12) return `${fmt(y / 1e12, y < 1e13 ? 1 : 0)} billioner år`;
  if (y >= 1e9) return `${fmt(y / 1e9, y < 1e10 ? 1 : 0)} mia. år`;
  if (y >= 1e6) return `${fmt(y / 1e6, y < 1e7 ? 1 : 0)} mio. år`;
  return `${fmt(y)} år`;
}
function tintFor(T) { const c = kelvinRGB(T, 0.12); return new THREE.Color(c[0], c[1] * 0.97, c[2] * 0.95); }

const FS_NEBULA_BAKE = /* glsl */ `
uniform float uSeed;
varying vec2 vUv;
${GLSL_NOISE}
void main(){
  vec2 c = vUv - 0.5;
  float r = length(c) * 2.0;
  float n = fbm5(vec3(c * 2.2, uSeed));
  float n2 = fbm4(vec3(c * 6.0 + n, uSeed * 1.7));
  float d = (1.0 - smoothstep(0.25, 1.0, r)) * smoothstep(-0.25, 0.55, n + 0.25 * n2);
  gl_FragColor = vec4(d, d, d, 1.0);
}`;
const FS_NEBULA = /* glsl */ `
uniform vec3 uColor; uniform float uOpacity; uniform float uDark; uniform sampler2D uTex; uniform float uRot;
varying vec2 vUv;
void main(){
  vec2 c = vUv - 0.5;
  float cr = cos(uRot), sr = sin(uRot);
  float d = texture2D(uTex, vec2(cr * c.x - sr * c.y, sr * c.x + cr * c.y) + 0.5).r * (1.0 - smoothstep(0.4, 0.5, length(c)));
  if (uDark > 0.5) gl_FragColor = vec4(uColor, d * uOpacity * 0.75);
  else gl_FragColor = vec4(uColor * d * uOpacity, 1.0);
}`;
const FS_PN = /* glsl */ `
uniform vec3 uColor; uniform float uOpacity; uniform float uSeed;
varying vec3 vW; varying vec3 vN; varying vec3 vObj; varying vec2 vUv;
${GLSL_NOISE}
void main(){
  vec3 V = normalize(cameraPosition - vW);
  float mu = abs(dot(normalize(vN), V));
  float rim = pow(1.0 - mu, 1.5);
  float fil = fbm4(normalize(vObj) * 4.5 + uSeed) * 0.5 + 0.5;
  float n = 0.3 + 0.7 * smoothstep(0.3, 0.8, fil);
  gl_FragColor = vec4(uColor * (rim * 1.5 + 0.06) * n * uOpacity, 1.0);
}`;
const FS_ONION = /* glsl */ `
uniform vec3 uCenter; uniform float uR;
varying vec3 vW; varying vec3 vN; varying vec3 vObj; varying vec2 vUv;
void main(){
  float r = length(vW - uCenter) / uR;
  vec3 col;
  if (r < 0.08) col = vec3(0.75, 0.78, 0.85) * 3.5;
  else if (r < 0.16) col = vec3(1.0, 0.9, 0.35) * 3.0;
  else if (r < 0.26) col = vec3(0.35, 0.9, 1.0) * 2.4;
  else if (r < 0.34) col = vec3(1.0, 0.45, 0.8) * 2.2;
  else if (r < 0.46) col = vec3(0.7, 0.7, 0.72) * 1.7;
  else if (r < 0.62) col = vec3(1.0, 0.8, 0.4) * 1.8;
  else col = vec3(1.0, 0.42, 0.2) * 1.4;
  float e = 0.0;
  for (int i = 0; i < 6; i++) { float b = i == 0 ? 0.08 : i == 1 ? 0.16 : i == 2 ? 0.26 : i == 3 ? 0.34 : i == 4 ? 0.46 : 0.62; e += 1.0 - smoothstep(0.0, 0.01, abs(r - b)); }
  gl_FragColor = vec4(col * (1.0 - 0.6 * min(e, 1.0)), 1.0);
}`;
const VS_SN = /* glsl */ `
attribute vec3 aColor; attribute float aSize; attribute vec3 aDir; attribute float aSpeed; attribute float aSeed; attribute vec3 aDisk;
uniform float uT; uniform float uCollapse; uniform float uPR; uniform float uTime; uniform float uSize;
varying vec3 vColor; varying float vB;
void main(){
  float r = aSpeed * (1.0 - exp(-uT * 0.55)) * 11.0;
  vec3 p = aDir * r * (1.0 + 0.18 * sin(aSeed * 40.0 + dot(aDir, vec3(12.0, 7.0, 3.0)) * 3.0));
  float rd = length(aDisk.xz);
  float ang = atan(aDisk.z, aDisk.x) + uTime * 0.5 / pow(rd + 0.4, 1.5);
  vec3 disk = vec3(cos(ang) * rd, aDisk.y, sin(ang) * rd);
  float c = smoothstep(0.0, 1.0, clamp(uCollapse * 1.4 - aSeed * 0.4, 0.0, 1.0));
  p = mix(p, disk, c);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float s = aSize * uSize * uPR;
  vB = 1.0;
  if (s < 1.5) { vB = s / 1.5; s = 1.5; }
  gl_PointSize = s;
  vColor = aColor;
}`;
const VS_DISK = /* glsl */ `
varying vec3 vW; varying vec3 vObj; varying vec3 vTan;
void main(){
  vObj = position;
  vTan = normalize(mat3(modelMatrix) * normalize(vec3(-position.y, position.x, 0.0)));
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const FS_DISK = /* glsl */ `
uniform float uTime; uniform float uH; uniform float uOpacity;
varying vec3 vW; varying vec3 vObj; varying vec3 vTan;
${GLSL_NOISE}
void main(){
  float r = length(vObj.xy) / uH;
  float a = atan(vObj.y, vObj.x);
  float temp = pow(3.0 / r, 0.9);
  vec3 col = mix(vec3(1.0, 0.35, 0.1), vec3(1.0, 0.85, 0.6), clamp(temp - 0.3, 0.0, 1.0));
  col = mix(col, vec3(0.8, 0.9, 1.0), clamp(temp - 1.0, 0.0, 1.0) * 0.6);
  float n = fbm4(vec3(r * 1.3, a * 2.0 - uTime * 2.2 / pow(r, 1.5), 0.0)) * 0.5 + 0.5;
  float dop = 1.0 + 0.75 * dot(normalize(vTan), normalize(cameraPosition - vW));
  float edge = smoothstep(3.0, 3.6, r) * (1.0 - smoothstep(9.0, 12.0, r));
  gl_FragColor = vec4(col * temp * (0.35 + 0.9 * n) * pow(dop, 3.0) * edge * 1.6 * uOpacity, 1.0);
}`;
const FS_RINGGLOW = /* glsl */ `
uniform float uOpacity; uniform float uTime;
varying vec2 vUv;
void main(){
  vec2 c = vUv - 0.5;
  float r = length(c) * 2.0;
  float a = atan(c.y, c.x);
  float ring = exp(-pow((r - 0.42) / 0.018, 2.0)) * 2.2;
  float halo = exp(-pow((r - 0.55) / 0.12, 2.0)) * (0.35 + 0.35 * abs(sin(a)));
  float lens = exp(-pow((r - 0.5) / 0.06, 2.0)) * smoothstep(0.2, 1.0, abs(sin(a))) * 0.9;
  vec3 col = vec3(1.0, 0.72, 0.42) * (ring + halo + lens);
  gl_FragColor = vec4(col * uOpacity * step(0.36, r), 1.0);
}`;
const FS_BEAM = /* glsl */ `
uniform float uOpacity; varying vec2 vUv;
void main(){ float along = vUv.y; float a = pow(1.0 - along, 0.2) * pow(along, 0.8); gl_FragColor = vec4(vec3(0.55, 0.75, 1.0) * a * uOpacity * 1.3, 1.0); }`;

class StarsWorld extends World {
  constructor() {
    super('stars');
    this.bloom = [0.75, 0.55, 0.9];
    this.cam = { near: 0.005, far: 6000 };
    this.mass = 1;
    this.model = starModel(1);
    this.v = { R: 1, T: 5772, gran: 16, lum: 1, pulse: 0 }; // aktuel visuel tilstand
    this.life = null;
    this.mode = 'nebula';
  }

  build() {
    this.buildNebula();
    this.starGroup = new THREE.Group();
    this.group.add(this.starGroup);
    this.star = createSun({ radius: 1.2, intensity: 3, rays: 0.3, segments: 96 });
    this.starGroup.add(this.star.group);
    this.buildOnion();
    this.orbitRing = lineFromPoints(circlePoints(dispR(215), 160), new THREE.Color(0.5, 0.75, 1.0), 0.55, true);
    this.orbitRing.visible = false;
    this.starGroup.add(this.orbitRing);
    this.earthDot = glowSprite({ color: new THREE.Color(0.4, 0.7, 1.0), size: 0.2, intensity: 1.8, core: 0.1, fall: 8, minPx: 9 });
    this.earthDot.position.set(dispR(215), 0, 0);
    this.earthDot.visible = false;
    this.starGroup.add(this.earthDot);
    this.lblEarthOrbit = this.label('Jordens bane', 'cool', (v) => v.set(dispR(215) * 0.707, 0, dispR(215) * 0.707));
    this.lblEarthDot = this.label('Jorden', 'cool nodot', (v) => v.set(dispR(215), 0.25, 0));

    // Planetarisk tåge
    const pnMat = (c, seed) => new THREE.ShaderMaterial({
      uniforms: { uColor: { value: c }, uOpacity: { value: 0 }, uSeed: { value: seed } },
      vertexShader: VS_SURFACE, fragmentShader: FS_PN, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.pn = [new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), pnMat(new THREE.Color(0.25, 0.95, 0.85), 1.2)),
      new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), pnMat(new THREE.Color(1.0, 0.3, 0.38), 4.4))];
    this.pn[0].scale.set(1, 0.8, 1); this.pn[1].scale.set(1.3, 1.05, 1.3);
    this.pnGroup = new THREE.Group();
    this.pnGroup.rotation.set(0.5, 0.3, 0.2);
    this.pnGroup.add(...this.pn);
    this.pnGroup.visible = false;
    this.group.add(this.pnGroup);

    // Supernova: glimt, udslyngede grundstoffer, chokbølge
    this.flash = glowSprite({ color: new THREE.Color(1, 0.95, 0.9), size: 30, intensity: 0, core: 0.02, fall: 5 });
    this.group.add(this.flash);
    this.buildDebris();
    this.shock = fresnelShell(1, new THREE.Color(0.6, 0.8, 1.0), { power: 4, intensity: 0 });
    this.shock.visible = false;
    this.group.add(this.shock);

    // Neutronstjerne med pulsarstråler
    this.ns = new THREE.Group();
    const nsCore = createSun({ radius: 0.06, tint: new THREE.Color(0.75, 0.85, 1.0), intensity: 6, rays: 0, glow: 1.4, minPx: 16 });
    this.nsCore = nsCore;
    this.ns.add(nsCore.group);
    this.beamMat = new THREE.ShaderMaterial({ uniforms: { uOpacity: { value: 0 } }, vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`, fragmentShader: FS_BEAM, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    this.beams = new THREE.Group();
    for (const sgn of [1, -1]) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 7, 32, 1, true), this.beamMat);
      cone.position.y = sgn * 3.5;
      cone.rotation.x = sgn > 0 ? Math.PI : 0;
      this.beams.add(cone);
    }
    this.beamTilt = new THREE.Group();
    this.beamTilt.rotation.z = 0.45;
    this.beamTilt.add(this.beams);
    this.nsSpin = new THREE.Group();
    this.nsSpin.add(this.beamTilt);
    this.ns.add(this.nsSpin);
    this.ns.visible = false;
    this.group.add(this.ns);

    // Sort hul
    this.bh = new THREE.Group();
    const H = 0.35;
    const horizon = new THREE.Mesh(new THREE.SphereGeometry(H, 48, 24), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    this.bh.add(horizon);
    this.diskMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uH: { value: H }, uOpacity: { value: 1 } }, vertexShader: VS_DISK, fragmentShader: FS_DISK, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const disk = new THREE.Mesh(new THREE.RingGeometry(H * 2.9, H * 12, 160, 4), this.diskMat);
    disk.rotation.x = -Math.PI / 2 + 0.12;
    this.bh.add(disk);
    this.ringMat = new THREE.ShaderMaterial({ uniforms: { uOpacity: { value: 1 }, uTime: { value: 0 } }, vertexShader: VS_GLOW.replace('uniform float uMinPx; uniform float uViewH;', 'const float uMinPx = 0.0; const float uViewH = 1.0;'), fragmentShader: FS_RINGGLOW, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const ring = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.ringMat);
    ring.scale.setScalar(H * 7.2);
    ring.frustumCulled = false;
    this.bh.add(ring);
    this.bh.visible = false;
    this.group.add(this.bh);

    // Ny stjerne + planeter efter kollapset (grundstof-kapitlet)
    this.newSun = createSun({ radius: 0.55, intensity: 3.2, rays: 0.3 });
    this.newSun.group.visible = false;
    this.group.add(this.newSun.group);

    this.lblStar = this.label('', 'big', (v) => v.set(0, dispR(this.v.R) * 1.15 + 0.2, 0));
    this.lblNeb = this.label('Stjernetåge · kold gas og støv', 'faint nodot', (v) => v.set(-9, 6, -4));
    this.lblNew = this.label('Ny stjerne tænder', 'here', (v) => v.set(0, 0.6, 0));
    this.onionLbls = ['Jern', 'Silicium', 'Ilt', 'Neon', 'Kulstof', 'Helium', 'Brint'].map((name, i) =>
      this.label(name, 'nodot', (v) => this.onionLabelPos(v, [0.04, 0.12, 0.21, 0.3, 0.4, 0.54, 0.8][i], i)));
  }

  buildNebula() {
    this.neb = new THREE.Group();
    this.group.add(this.neb);
    const r = rng(42);
    const billboardVS = VS_GLOW.replace('uniform float uMinPx; uniform float uViewH;', 'const float uMinPx = 0.0; const float uViewH = 1.0;');
    this.nebMats = [];
    const texs = Array.from({ length: 8 }, (_, i) => bakeTexture(FS_NEBULA_BAKE, 256, 256, { uSeed: { value: 3.7 + i * 11.3 } }));
    const count = TOUCH ? 22 : 34;
    for (let i = 0; i < count; i++) {
      const dark = i % 5 === 4;
      const c = dark ? new THREE.Color(0.02, 0.012, 0.01) : r() < 0.55 ? new THREE.Color(1.0, 0.25, 0.4).multiplyScalar(0.4 + r() * 0.3) : new THREE.Color(0.2, 0.75, 0.8).multiplyScalar(0.3 + r() * 0.25);
      const mat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: c }, uTex: { value: texs[i % texs.length] }, uOpacity: { value: 0 }, uDark: { value: dark ? 1 : 0 }, uRot: { value: r() * Math.PI * 2 } },
        vertexShader: billboardVS, fragmentShader: FS_NEBULA,
        transparent: true, depthWrite: false, blending: dark ? THREE.NormalBlending : THREE.AdditiveBlending,
      });
      mat.userData.base = dark ? 1 : 0.42;
      this.nebMats.push(mat);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      m.position.set(gauss(r) * 7, gauss(r) * 4, gauss(r) * 5 - 2);
      m.scale.setScalar(8 + r() * 12);
      m.frustumCulled = false;
      m.renderOrder = dark ? 3 : 1;
      this.neb.add(m);
    }
    // Unge stjerner i tågen
    const n = N(260);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos.set([gauss(r) * 8, gauss(r) * 4.5, gauss(r) * 6 - 2], i * 3);
      const c = kelvinRGB(r() < 0.3 ? 15000 + r() * 20000 : 4000 + r() * 4000, 0.2);
      const b = 0.6 + r() * 1.6;
      col.set([c[0] * b, c[1] * b, c[2] * b], i * 3);
      sz[i] = 1 + Math.pow(r(), 6) * 6;
    }
    this.nebStarsMat = pointsMaterial({ size: 1.6, opacity: 0 });
    this.neb.add(new THREE.Points(pointsGeometry(pos, col, sz), this.nebStarsMat));
    // Kollaps: gas der spiraler ind og danner en skive
    const m = N(3200);
    const p2 = new Float32Array(m * 3), c2 = new Float32Array(m * 3), s2 = new Float32Array(m), dir = new Float32Array(m * 3), sp = new Float32Array(m), seed = new Float32Array(m), disk = new Float32Array(m * 3);
    for (let i = 0; i < m; i++) {
      const u = new THREE.Vector3(gauss(r), gauss(r) * 0.7, gauss(r)).normalize();
      dir.set([u.x, u.y, u.z], i * 3);
      sp[i] = 0.25 + r() * 0.5;
      seed[i] = r();
      const rd = 0.25 + Math.pow(r(), 1.5) * 3.2;
      const a = r() * Math.PI * 2;
      disk.set([Math.cos(a) * rd, gauss(r) * 0.03 * rd, Math.sin(a) * rd], i * 3);
      const warm = r() < 0.5;
      c2.set(warm ? [1.0, 0.45, 0.3] : [0.9, 0.75, 0.6], i * 3);
      s2[i] = 0.8 + r();
    }
    this.collapseMat = pointsMaterial({ size: 2.3, vs: VS_SN, uniforms: { uT: { value: 1.6 }, uCollapse: { value: 0 } } });
    const geo = pointsGeometry(p2, c2, s2, { aDir: { array: dir, size: 3 }, aSpeed: { array: sp, size: 1 }, aSeed: { array: seed, size: 1 }, aDisk: { array: disk, size: 3 } });
    this.collapse = new THREE.Points(geo, this.collapseMat);
    this.collapse.frustumCulled = false;
    this.collapse.visible = false;
    this.group.add(this.collapse);
    this.proto = glowSprite({ color: new THREE.Color(1, 0.6, 0.35), size: 3, intensity: 0, core: 0.04, fall: 6, minPx: 10 });
    this.group.add(this.proto);
  }

  buildOnion() {
    this.onion = { v: new THREE.Vector3(1, 0, 0), alpha: 0, target: 0 };
    const mk = () => {
      const mat = new THREE.ShaderMaterial({ uniforms: { uCenter: { value: new THREE.Vector3() }, uR: { value: 1 } }, vertexShader: VS_SURFACE, fragmentShader: FS_ONION, side: THREE.DoubleSide });
      const m = new THREE.Mesh(new THREE.CircleGeometry(1, 72, -Math.PI / 2, Math.PI), mat);
      m.visible = false;
      this.starGroup.add(m);
      return m;
    };
    this.onionFaces = [mk(), mk()];
  }
  setOnion(alpha) {
    const up = new THREE.Vector3(0, 1, 0);
    const a = clamp(alpha, 0, Math.PI / 4);
    const u = this.star.mat.uniforms;
    u.uCut.value = a > 0.001 ? 1 : 0;
    u.uCutC.value.set(0, 0, 0);
    u.uCutN1.value.copy(this.onion.v).applyAxisAngle(up, -(Math.PI / 2 - a));
    u.uCutN2.value.copy(this.onion.v).applyAxisAngle(up, Math.PI / 2 - a);
    const R = dispR(this.v.R);
    this.onionFaces.forEach((f, i) => {
      f.visible = a > 0.001;
      if (!f.visible) return;
      const e = this.onion.v.clone().applyAxisAngle(up, (i === 0 ? 1 : -1) * a);
      const z = new THREE.Vector3().crossVectors(e, up).normalize();
      f.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(e, up, z));
      f.scale.setScalar(R);
      f.material.uniforms.uR.value = R;
    });
  }
  onionLabelPos(v, r, i) {
    const e = this.onion.v.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);
    const R = dispR(this.v.R);
    return v.copy(e).multiplyScalar(r * R).addScaledVector(new THREE.Vector3(0, 1, 0), (i % 2 ? -0.06 : 0.06) * R);
  }

  buildDebris() {
    const n = N(9000), r = rng(77);
    const EL = [[0.62, 0.8, 1.0, 0.34], [1.0, 0.88, 0.5, 0.2], [0.7, 0.72, 0.78, 0.12], [0.45, 0.9, 1.0, 0.14], [0.8, 1.0, 0.45, 0.06], [1.0, 0.55, 0.28, 0.1], [1.0, 0.82, 0.25, 0.04]];
    const cum = []; let acc = 0; for (const e of EL) { acc += e[3]; cum.push(acc); }
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n), dir = new Float32Array(n * 3), sp = new Float32Array(n), seed = new Float32Array(n), disk = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = new THREE.Vector3(gauss(r), gauss(r), gauss(r)).normalize();
      dir.set([u.x, u.y, u.z], i * 3);
      sp[i] = 0.55 + Math.pow(r(), 0.5) * 0.5;
      seed[i] = r();
      const x = r() * acc;
      const k = cum.findIndex((c) => x <= c);
      const e = EL[k], b = 0.7 + r() * 0.8;
      col.set([e[0] * b, e[1] * b, e[2] * b], i * 3);
      sz[i] = 0.9 + r() * 1.4 + (k === 6 ? 1 : 0);
      const rd = 0.8 + Math.pow(r(), 1.3) * 5.5, a = r() * Math.PI * 2;
      disk.set([Math.cos(a) * rd, gauss(r) * 0.04 * rd, Math.sin(a) * rd], i * 3);
    }
    this.debrisMat = pointsMaterial({ size: 1.7, vs: VS_SN, uniforms: { uT: { value: 0 }, uCollapse: { value: 0 } } });
    this.debris = new THREE.Points(pointsGeometry(pos, col, sz, { aDir: { array: dir, size: 3 }, aSpeed: { array: sp, size: 1 }, aSeed: { array: seed, size: 1 }, aDisk: { array: disk, size: 3 } }), this.debrisMat);
    this.debris.frustumCulled = false;
    this.debris.visible = false;
    this.group.add(this.debris);
  }

  // ---------- Visuel tilstand ----------
  applyStar(dt) {
    const v = this.v;
    const R = dispR(v.R) * (1 + v.pulse * 0.06 * Math.sin(this.t * 2.2));
    this.star.setRadius(R);
    const tint = tintFor(v.T);
    this.star.mat.uniforms.uTint.value.copy(tint);
    this.star.glow.material.uniforms.uColor.value.copy(tint).multiplyScalar(1.1);
    this.star.mat.uniforms.uGran.value = v.gran;
    this.star.mat.uniforms.uIntensity.value = 0.95 * v.lum;
    this.star.glow.material.uniforms.uIntensity.value = 0.5 * v.lum;
    this.star.group.visible = v.lum > 0.01;
  }
  setStarTarget(R, T, gran, lum, pulse, dur = 2.5) {
    stopTween(this._st);
    this.targetR = R;
    const a = { ...this.v };
    this._st = tween(dur, (k) => {
      this.v.R = Math.exp(lerp(Math.log(a.R), Math.log(R), k));
      this.v.T = lerp(a.T, T, k);
      this.v.gran = lerp(a.gran, gran, k);
      this.v.lum = lerp(a.lum, lum, k);
      this.v.pulse = lerp(a.pulse, pulse, k);
    });
  }
  setMass(M) {
    this.mass = M;
    this.model = starModel(M);
    if (this.mode === 'mass') {
      const m = this.model;
      this.v.R = m.R; this.v.T = m.T; this.v.gran = 16; this.v.lum = clamp(0.8 + Math.log10(m.L) * 0.08, 0.6, 1.6); this.v.pulse = 0;
      this.targetR = m.R;
    }
  }
  frameStar(dur = 2) {
    const R = dispR(this.targetR ?? this.v.R);
    const d = Math.max(7.5, R * 4.6);
    flyTo(new THREE.Vector3(0.35, 0.28, 1).normalize().multiplyScalar(d), new THREE.Vector3(0, 0, 0), dur);
  }
  resetRemnants() {
    this.pnGroup.visible = false; this.ns.visible = false; this.bh.visible = false;
    this.debris.visible = false; this.shock.visible = false; this.flash.material.uniforms.uIntensity.value = 0;
    this.newSun.group.visible = false; this.collapse.visible = false; this.proto.material.uniforms.uIntensity.value = 0;
    this.orbitRing.visible = false; this.earthDot.visible = false; this.lblEarthOrbit.show = false; this.lblEarthDot.show = false;
    this.onion.target = 0;
    this.lblNew.show = false;
    for (const l of this.onionLbls) l.show = false;
    this.debrisMat.uniforms.uCollapse.value = 0;
    this.pnState = null; this.snState = null;
  }

  // ---------- Livsforløb ----------
  stagesFor(m) {
    const t = m.tMS;
    if (m.cls === 'low') return [
      { name: 'Hovedserie', when: yearsText(t), dur: 4.5, go: () => this.setStarTarget(m.R, m.T, 16, 0.9, 0, 1.5) },
      { name: 'Blå dværg (teoretisk)', when: 'til sidst', dur: 4, go: () => this.setStarTarget(m.R * 1.4, 9000, 18, 1.1, 0, 3) },
      { name: 'Hvid dværg af helium', when: 'derefter', dur: 5, go: () => this.setStarTarget(0.015, 14000, 20, 0.9, 0, 3) },
    ];
    if (m.cls === 'mid') return [
      { name: 'Hovedserie', when: yearsText(t), dur: 4, go: () => this.setStarTarget(m.R, m.T, 16, 1, 0, 1.5) },
      { name: 'Rød kæmpe', when: `ca. ${yearsText(t * 0.1)}`, dur: 5.5, go: () => { this.setStarTarget(m.R * 170, 3300, 5, 1.1, 0.2, 4.5); this.showEarthOrbit(true); } },
      { name: 'Heliumbrænding', when: `ca. ${yearsText(t * 0.012)}`, dur: 3.5, go: () => this.setStarTarget(m.R * 10, 4800, 8, 1.0, 0, 2.5) },
      { name: 'Pulserende kæmpe', when: 'nogle mio. år', dur: 4.5, go: () => this.setStarTarget(m.R * 240, 3000, 4, 1.1, 1, 3.5) },
      { name: 'Planetarisk tåge', when: 'ca. 10.000 år', dur: 6, go: () => { this.showEarthOrbit(false); this.setStarTarget(0.014, 60000, 20, 1.4, 0, 2.5); this.startPN(); } },
      { name: 'Hvid dværg', when: 'i billioner af år', dur: 5, go: () => this.setStarTarget(0.013, 20000, 20, 0.9, 0, 3) },
    ];
    const bh = m.M >= 20;
    const sg = m.M < 25;
    return [
      { name: 'Hovedserie', when: yearsText(t), dur: 4, go: () => this.setStarTarget(m.R, m.T, 16, 1.4, 0, 1.5) },
      { name: sg ? 'Rød superkæmpe' : 'Blå superkæmpe', when: `ca. ${yearsText(t * 0.1)}`, dur: 5, go: () => this.setStarTarget(sg ? 800 : 60, sg ? 3500 : 22000, 4, 1.4, 0.15, 4) },
      { name: 'Løgskaller', when: 'sidste trin: 1 døgn', dur: 6, go: () => { this.onion.v.copy(camera.position).projectOnPlane(new THREE.Vector3(0, 1, 0)).normalize(); this.onion.target = Math.PI / 4; for (const l of this.onionLbls) l.show = true; } },
      { name: 'Kernekollaps', when: 'under 1 sekund', dur: 1.6, go: () => { this.onion.target = 0; for (const l of this.onionLbls) l.show = false; this.setStarTarget(0.4, 30000, 20, 2.5, 0, 1.2); } },
      { name: 'Supernova', when: 'lyser i uger', dur: 6.5, go: () => this.startSN(bh) },
      { name: bh ? 'Sort hul' : 'Neutronstjerne', when: bh ? 'for evigt (næsten)' : '20 km på tværs', dur: 6, go: () => this.showRemnant(bh) },
    ];
  }
  showEarthOrbit(on) {
    this.orbitRing.visible = on; this.earthDot.visible = on;
    this.lblEarthOrbit.show = on; this.lblEarthDot.show = on;
  }
  startPN() {
    this.pnGroup.visible = true;
    this.pnState = { t: 0 };
  }
  startSN(bh) {
    this.star.group.visible = false;
    this.v.lum = 0;
    this.snState = { t: 0, bh };
    this.debris.visible = true;
    this.shock.visible = true;
    Sound.boom();
    flyTo(new THREE.Vector3(0.4, 0.35, 1).normalize().multiplyScalar(38), new THREE.Vector3(0, 0, 0), 3.5);
  }
  showRemnant(bh) {
    if (bh) { this.bh.visible = true; flyTo(new THREE.Vector3(0.2, 0.32, 1).normalize().multiplyScalar(5.2), new THREE.Vector3(0, 0, 0), 3); }
    else { this.ns.visible = true; flyTo(new THREE.Vector3(0.4, 0.3, 1).normalize().multiplyScalar(9), new THREE.Vector3(0, 0, 0), 3); }
  }
  playLife() {
    this.resetRemnants();
    const m = this.model;
    this.v.R = m.R; this.v.T = m.T; this.v.gran = 16; this.v.lum = 1; this.v.pulse = 0;
    this.star.group.visible = true;
    const stages = this.stagesFor(m);
    this.targetR = m.R;
    this.life = { stages, i: -1, t: 0 };
    renderStages(stages, -1);
    this.nextStage();
  }
  nextStage() {
    const L = this.life;
    if (!L) return;
    L.i++;
    L.t = 0;
    if (L.i >= L.stages.length) { this.life = null; renderStages(L.stages, L.stages.length); return; }
    renderStages(L.stages, L.i);
    L.stages[L.i].go();
    const name = L.stages[L.i].name;
    if (!/Supernova|Sort hul|Neutronstjerne/.test(name)) setTimeout(() => this.frameStar(2.2), 60);
  }

  // mode: 'nebula' | 'mass' | 'life' | 'elements'
  setMode(mode, first) {
    this.mode = mode;
    this.life = null;
    this.resetRemnants();
    this.hideLabels();
    this.star.group.visible = mode === 'mass' || mode === 'life';
    this.nebT = mode === 'nebula' ? 1 : 0;
    controls.minDistance = 0.6; controls.maxDistance = 300;
    if (mode === 'nebula') {
      const pos = new THREE.Vector3(6, 5, 38), target = new THREE.Vector3(0, 0, -1);
      if (first) cutTo(pos.clone().multiplyScalar(1.6), target);
      flyTo(pos, target, first ? 3.2 : 2.6, () => { if (this.mode === 'nebula') this.startCollapse(); });
      this.lblNeb.show = true;
    } else if (mode === 'mass' || mode === 'life') {
      this.setMass(this.mass);
      const m = this.model;
      this.v.R = m.R; this.v.T = m.T; this.v.gran = 16; this.v.lum = 1; this.v.pulse = 0;
      const R = dispR(m.R), d = Math.max(7.5, R * 4.6);
      const pos = new THREE.Vector3(0.35, 0.28, 1).normalize().multiplyScalar(d);
      if (first) cutTo(pos.clone().multiplyScalar(2), new THREE.Vector3());
      flyTo(pos, new THREE.Vector3(), first ? 3 : 2);
      this.lblStar.show = true;
      if (mode === 'life') renderStages(this.stagesFor(m), -1);
    } else if (mode === 'elements') {
      this.star.group.visible = false;
      this.debris.visible = true;
      this.snState = { t: 0, bh: false, elements: true };
      this.shock.visible = true;
      const pos = new THREE.Vector3(0.3, 0.45, 1).normalize().multiplyScalar(40);
      if (first) cutTo(pos.clone().multiplyScalar(1.5), new THREE.Vector3());
      flyTo(pos, new THREE.Vector3(), first ? 3 : 2.2);
      Sound.boom();
    }
  }
  startCollapse() {
    this.collapse.visible = true;
    this.colState = { t: 0 };
    this.lblNew.show = false;
  }
  enter() { this.hideLabels(); }
  exit() { this.life = null; this.resetRemnants(); hud(''); }

  update(dt, t) {
    this.t = t;
    // Tåge
    this.nebA = lerp(this.nebA || 0, this.nebT || 0, 1 - Math.exp(-dt * 1.8));
    this.neb.visible = this.nebA > 0.01;
    for (const m of this.nebMats) m.uniforms.uOpacity.value = this.nebA * m.userData.base;
    this.nebStarsMat.uniforms.uOpacity.value = this.nebA;
    if (this.colState) {
      const C = this.colState;
      C.t += dt;
      const k = clamp(C.t / 7, 0, 1);
      this.collapseMat.uniforms.uCollapse.value = easeInOut(k);
      this.collapseMat.uniforms.uTime.value = t;
      this.collapseMat.uniforms.uOpacity.value = this.nebA;
      this.proto.material.uniforms.uIntensity.value = this.nebA * (k < 0.8 ? 0.3 + k * 1.5 : 1.5 + (k - 0.8) * 10);
      this.proto.material.uniforms.uColor.value.setRGB(1, lerp(0.45, 0.9, smooth(0.75, 1, k)), lerp(0.3, 0.75, smooth(0.75, 1, k)));
      if (k >= 1 && !this.lblNew.show && this.mode === 'nebula') this.lblNew.show = true;
      if (this.mode !== 'nebula') this.colState = null;
    }
    // Stjerne
    this.star.update(t);
    if (this.mode === 'mass' || this.mode === 'life') this.applyStar(dt);
    if (this.mode === 'mass' && !camTween) {
      const want = Math.max(7.5, dispR(this.v.R) * 4.6) * aspectFactor();
      const off = camera.position.clone().sub(controls.target);
      const d = off.length();
      off.multiplyScalar(lerp(d, want, 1 - Math.exp(-dt * 3)) / d);
      camera.position.copy(controls.target).add(off);
    }
    if (this.lblStar.show) {
      const m = this.model;
      this.lblStar.set(this.mode === 'mass' ? `${fmt(m.M, m.M < 1 ? 1 : 0)} × Solens masse` : `Radius ${num(this.v.R, 2)} × Solen`);
    }
    // Løgskaller
    this.onion.alpha = lerp(this.onion.alpha, this.onion.target, 1 - Math.exp(-dt * 2.4));
    if (this.onion.target === 0 && this.onion.alpha < 0.003) this.onion.alpha = 0;
    this.setOnion(this.onion.alpha);
    // Livsforløb
    if (this.life && this.life.i >= 0) {
      this.life.t += dt;
      const st = this.life.stages[this.life.i];
      if (this.life.t >= st.dur) this.nextStage();
    }
    // Planetarisk tåge
    if (this.pnState) {
      this.pnState.t += dt;
      const k = this.pnState.t;
      const s = 0.6 + k * 1.1;
      this.pn[0].scale.set(s, s * 0.8, s);
      this.pn[1].scale.set(s * 1.3, s * 1.05, s * 1.3);
      const o = smooth(0, 1.5, k) * (1 - smooth(9, 14, k) * 0.6);
      this.pn.forEach((p) => { p.material.uniforms.uOpacity.value = o; });
    }
    // Supernova
    if (this.snState) {
      const S = this.snState;
      S.t += dt;
      const flash = S.elements ? 0 : Math.exp(-S.t * 1.4) * 9 * smooth(0, 0.15, S.t);
      this.flash.material.uniforms.uIntensity.value = flash;
      this.debrisMat.uniforms.uT.value = S.t + (S.elements ? 1.5 : 0);
      this.debrisMat.uniforms.uTime.value = t;
      this.shock.scale.setScalar(0.5 + (1 - Math.exp(-S.t * 0.55)) * 13);
      this.shock.material.uniforms.uIntensity.value = 0.45 * Math.exp(-S.t * 0.35);
      if (S.elements) {
        const c = smooth(6.5, 13, S.t);
        this.debrisMat.uniforms.uCollapse.value = c;
        this.debrisMat.uniforms.uOpacity.value = 1;
        this.newSun.group.visible = c > 0.3;
        this.newSun.setRadius(0.55 * smooth(0.3, 0.9, c));
        this.newSun.update(t);
        if (c > 0.85 && !this.lblNew.show) { this.lblNew.set('Et nyt solsystem'); this.lblNew.show = true; }
      } else {
        this.debrisMat.uniforms.uOpacity.value = 1 - smooth(8, 16, S.t) * 0.7;
      }
    }
    // Rester
    if (this.ns.visible) {
      this.nsSpin.rotation.y = t * 5.5;
      this.beamMat.uniforms.uOpacity.value = 0.8;
      this.nsCore.update(t);
    }
    if (this.bh.visible) { this.diskMat.uniforms.uTime.value = t; }
  }
}
