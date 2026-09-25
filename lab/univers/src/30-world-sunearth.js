// ============================================================
// 30 · Verden: Solen varmer Jorden
// Jorden i centrum (radius 1). Solen ligger i den virkelige retning lige nu,
// men afstande og størrelser er ikke i skala.
// ============================================================
const FS_CUTFACE = /* glsl */ `
uniform vec3 uCenter; uniform float uR; uniform float uTime;
varying vec3 vW; varying vec3 vN; varying vec3 vObj; varying vec2 vUv;
${GLSL_NOISE}
void main(){
  float r = length(vW - uCenter) / uR;
  vec3 col;
  if (r < 0.25) {
    col = mix(vec3(1.0, 0.93, 0.78) * 1.35, vec3(1.0, 0.78, 0.45) * 1.05, smoothstep(0.0, 0.25, r));
  } else if (r < 0.7) {
    float band = 0.5 + 0.5 * sin(r * 95.0 + snoise(vObj * 5.0 + uTime * 0.05) * 2.5);
    col = mix(vec3(1.0, 0.66, 0.3) * 1.25, vec3(1.0, 0.46, 0.16) * 0.85, (r - 0.25) / 0.45) * (0.8 + 0.2 * band);
  } else {
    float cells = snoise(vec3(vObj.xy * 7.0, uTime * 0.25));
    col = mix(vec3(1.0, 0.4, 0.12) * 0.75, vec3(0.9, 0.26, 0.07) * 0.55, (r - 0.7) / 0.3) * (0.7 + 0.45 * cells);
  }
  float edge = (1.0 - smoothstep(0.0, 0.012, abs(r - 0.25))) + (1.0 - smoothstep(0.0, 0.012, abs(r - 0.7)));
  col *= 1.0 - 0.45 * edge;
  gl_FragColor = vec4(col, 1.0);
}`;

const FS_AURORA = /* glsl */ `
uniform float uTime; uniform float uI; uniform vec3 uSunPos;
varying float vH; varying float vPhi; varying vec3 vW; varying vec3 vNrm;
${GLSL_NOISE}
void main(){
  float prof = smoothstep(0.0, 0.12, vH) * (1.0 - smoothstep(0.25, 1.0, vH));
  float folds = 0.45 + 0.55 * snoise(vec3(vPhi * 7.0, vH * 1.5, uTime * 0.35));
  float rays = 0.6 + 0.4 * snoise(vec3(vPhi * 40.0, uTime * 0.6, 0.0));
  vec3 col = mix(vec3(0.25, 1.0, 0.55), vec3(0.75, 0.25, 0.8), smoothstep(0.35, 1.0, vH));
  float night = 1.0 - smoothstep(-0.15, 0.35, dot(normalize(vNrm), normalize(uSunPos - vW)));
  gl_FragColor = vec4(col * prof * folds * rays * uI * (0.25 + 0.75 * night) * 1.6, 1.0);
}`;
const VS_AURORA = /* glsl */ `
attribute float aH; attribute float aPhi;
varying float vH; varying float vPhi; varying vec3 vW; varying vec3 vNrm;
void main(){
  vH = aH; vPhi = aPhi;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vNrm = normalize(mat3(modelMatrix) * normalize(position));
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

class SunEarthWorld extends World {
  constructor() {
    super('sunEarth');
    this.bloom = [0.72, 0.5, 0.86];
    this.cam = { near: 0.02, far: 3000 };
    this.fx = { rad: 0, beam: 0, ir: 0, aurora: 0, field: 0, wind: 0 };
    this.fxT = { ...this.fx };
    this.atmosphereOn = true;
    this.walk = null;
  }

  build() {
    const g = this.group;
    this.SUN_D = 34; this.SUN_R = 5.2;
    const earthHelio = planetThree('earth', JD_NOW);
    this.s = earthHelio.clone().multiplyScalar(-1).normalize(); // fra Jorden mod Solen
    this.u = new THREE.Vector3(0, 1, 0);
    this.p = new THREE.Vector3().crossVectors(this.s, this.u).normalize();
    this.sunPos = this.s.clone().multiplyScalar(this.SUN_D);

    this.sun = createSun({ radius: this.SUN_R, intensity: 3.1, rays: 0.5 });
    this.sun.group.position.copy(this.sunPos);
    g.add(this.sun.group);

    this.earth = createEarth({ segments: TOUCH ? 96 : 144 });
    this.earth.spin.quaternion.copy(earthQuaternion(JD_NOW));
    this.earth.setSun(this.sunPos);
    g.add(this.earth.group);

    const mg = moonGeo(JD_NOW);
    this.moon = createMoon(0.27);
    this.moon.mesh.position.copy(mg.dir).multiplyScalar(9);
    this.moon.setSun(this.sunPos);
    g.add(this.moon.mesh);

    this.buildCutaway();
    this.buildParticles();
    this.buildMagnetosphere();

    this.lblSun = this.label('Solen', 'big', (v) => v.copy(this.sunPos).addScaledVector(this.u, this.SUN_R * 1.25));
    this.lblEarth = this.label('Jorden', '', (v) => v.set(0, 1.35, 0));
    const dkLocal = latLonDir(55.68, 12.57).multiplyScalar(1.01);
    const _n = new THREE.Vector3(), _c = new THREE.Vector3();
    this.lblDK = this.label('Du er her', 'here', (v) => v.copy(dkLocal).applyQuaternion(this.earth.spin.quaternion));
    this.lblDK.occluded = (pos) => { _n.copy(pos).normalize(); _c.copy(camera.position).sub(pos); return _n.dot(_c) < 0; };
    this.lblTemp = this.label('+15 °C', 'here big nodot', (v) => v.copy(this.p).multiplyScalar(-1.6).addScaledVector(this.u, 0.2));
    this.zoneLbls = [
      this.label('Kernen · 15 mio. °C', 'nodot', (v) => this.faceLabelPos(v, 0.12)),
      this.label('Strålingszonen', 'nodot', (v) => this.faceLabelPos(v, 0.47)),
      this.label('Konvektionszonen', 'nodot', (v) => this.faceLabelPos(v, 0.85)),
    ];
  }

  // ---------- Snit gennem Solen og fotonens tilfældige vandring ----------
  buildCutaway() {
    this.cut = { alpha: 0, target: 0, v: new THREE.Vector3(1, 0, 0) };
    const mk = () => {
      const mat = new THREE.ShaderMaterial({
        uniforms: { uCenter: { value: this.sunPos.clone() }, uR: { value: this.SUN_R }, uTime: { value: 0 } },
        vertexShader: VS_SURFACE, fragmentShader: FS_CUTFACE, side: THREE.DoubleSide,
      });
      const m = new THREE.Mesh(new THREE.CircleGeometry(1, 72, -Math.PI / 2, Math.PI), mat);
      m.scale.setScalar(this.SUN_R);
      m.position.copy(this.sunPos);
      m.visible = false;
      this.group.add(m);
      return m;
    };
    this.face1 = mk();
    this.face2 = mk();
    this.walkLine = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: new THREE.Color(0.1, 0.55, 0.75), transparent: true, opacity: 0.9, depthTest: false }));
    this.walkLine.renderOrder = 5;
    this.walkLine.visible = false;
    this.group.add(this.walkLine);
    this.walkDotsMat = pointsMaterial({ size: 3.2, opacity: 1, blending: THREE.NormalBlending, fs: FS_POINTS.replace('gl_FragColor = vec4(vColor * uOpacity * vB * a, 1.0);', 'gl_FragColor = vec4(vColor, min(1.0, a * 1.6) * uOpacity);') });
    this.walkDotsMat.depthTest = false;
    this.walkDots = new THREE.Points(new THREE.BufferGeometry(), this.walkDotsMat);
    this.walkDots.renderOrder = 5;
    this.walkDots.frustumCulled = false;
    this.walkDots.visible = false;
    this.group.add(this.walkDots);
    this.photon = glowSprite({ color: new THREE.Color(1, 0.95, 0.8), size: 1.2, intensity: 2.6, core: 0.05, fall: 9, minPx: 10 });
    this.photon.visible = false;
    this.photon.material.depthTest = false;
    this.photon.renderOrder = 6;
    this.group.add(this.photon);
  }
  wedgeDir(sign, alpha, out) {
    return out.copy(this.cut.v).applyAxisAngle(this.u, sign * alpha);
  }
  setWedge(alpha) {
    const m = this.sun.mat.uniforms;
    const a = clamp(alpha, 0, Math.PI / 4);
    m.uCut.value = a > 0.001 ? 1 : 0;
    m.uCutC.value.copy(this.sunPos);
    m.uCutN1.value.copy(this.cut.v).applyAxisAngle(this.u, -(Math.PI / 2 - a));
    m.uCutN2.value.copy(this.cut.v).applyAxisAngle(this.u, Math.PI / 2 - a);
    const show = a > 0.001;
    this.face1.visible = this.face2.visible = show;
    if (!show) return;
    const e1 = this.wedgeDir(1, a, new THREE.Vector3()), e2 = this.wedgeDir(-1, a, new THREE.Vector3());
    const orient = (mesh, e) => {
      const z = new THREE.Vector3().crossVectors(e, this.u).normalize();
      mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(e, this.u, z));
    };
    orient(this.face1, e1);
    orient(this.face2, e2);
  }
  faceLabelPos(v, r) {
    const e = this.wedgeDir(1, Math.PI / 4, new THREE.Vector3());
    return v.copy(this.sunPos).addScaledVector(e, r * this.SUN_R).addScaledVector(this.u, -0.1 * this.SUN_R);
  }
  makeWalk() {
    const r = rng(Math.floor(Math.random() * 1e6));
    const pts2 = [[0.0, 0.0]];
    let x = 0.03, y = 0;
    while (Math.hypot(x, y) < 0.7) {
      const a = r() * Math.PI * 2;
      const rad = Math.hypot(x, y) || 1;
      x += Math.cos(a) * 0.022 + (x / rad) * 0.0028;
      y += Math.sin(a) * 0.022 + (y / rad) * 0.0028;
      if (x < 0.02) x = 0.04 - x;
      pts2.push([x, y]);
    }
    // Konvektion: store, rullende bevægelser op mod overfladen.
    let ang = Math.atan2(y, x);
    let rr = Math.hypot(x, y);
    const steps = 90;
    for (let i = 0; i < steps; i++) {
      rr = lerp(0.7, 1.0, (i + 1) / steps);
      ang += Math.sin(i * 0.35) * 0.02;
      const wob = Math.sin(i * 0.5) * 0.02;
      pts2.push([Math.cos(ang) * (rr + wob), Math.sin(ang) * (rr + wob)]);
    }
    const e = this.wedgeDir(1, Math.PI / 4, new THREE.Vector3());
    const off = this.cut.v.clone().sub(e.clone().multiplyScalar(this.cut.v.dot(e))).normalize().multiplyScalar(0.012 * this.SUN_R);
    const pts = pts2.map(([a, b]) => new THREE.Vector3().copy(this.sunPos).addScaledVector(e, Math.max(0.02, a) * this.SUN_R).addScaledVector(this.u, b * this.SUN_R).add(off));
    this.walkLine.geometry.dispose();
    this.walkLine.geometry = new THREE.BufferGeometry().setFromPoints(pts);
    this.walkLine.geometry.setDrawRange(0, 0);
    const n = pts.length, pa = new Float32Array(n * 3), ca = new Float32Array(n * 3), sa = new Float32Array(n);
    pts.forEach((p, i) => { p.toArray(pa, i * 3); ca.set([0.12, 0.72, 0.95], i * 3); sa[i] = 1; });
    this.walkDots.geometry.dispose();
    this.walkDots.geometry = pointsGeometry(pa, ca, sa);
    this.walkDots.geometry.setDrawRange(0, 0);
    return pts;
  }
  startPhotonJourney() {
    const pts = this.makeWalk();
    this.walk = { pts, t: 0, phase: 0, exit: pts[pts.length - 1].clone() };
    this.walkLine.visible = true;
    this.walkDots.visible = true;
    this.photon.visible = true;
    hud(`<div class="cell"><div class="big sol" id="hudA">0 år</div><div class="sub">i Solen</div></div><div class="cell"><div class="big" id="hudB">0:00</div><div class="sub">på vej til Jorden</div></div>`);
  }
  stopPhotonJourney() {
    this.walk = null;
    this.walkLine.visible = false;
    this.walkDots.visible = false;
    this.photon.visible = false;
  }

  // ---------- Partikler: stråling, lys mod Jorden, infrarød varme ----------
  buildParticles() {
    const mk = (n, color, size) => {
      const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n).fill(1);
      for (let i = 0; i < n; i++) col.set(color, i * 3);
      const geo = pointsGeometry(pos, col, sz);
      const mat = pointsMaterial({ size, opacity: 0 });
      const pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false;
      this.group.add(pts);
      return { n, pos, col, geo, mat, pts, dir: new Float32Array(n * 3), state: new Float32Array(n), timer: new Float32Array(n) };
    };
    const r = rng(5);
    this.rnd = r;
    // A: udstråling i alle retninger
    this.A = mk(N(1500), [1.0, 0.82, 0.55], 2.2);
    for (let i = 0; i < this.A.n; i++) this.spawnA(i, r() * 60);
    // B: det lys, der rammer Jorden
    this.B = mk(N(460), [1.0, 0.92, 0.72], 3.0);
    for (let i = 0; i < this.B.n; i++) this.spawnB(i, r());
    // C: infrarød varme fra overfladen
    this.C = mk(N(520), [1.0, 0.28, 0.08], 3.2);
    for (let i = 0; i < this.C.n; i++) this.spawnC(i, true);
  }
  randUnit(out) {
    const r = this.rnd;
    const z = r() * 2 - 1, t = r() * Math.PI * 2, s = Math.sqrt(1 - z * z);
    return out.set(s * Math.cos(t), z, s * Math.sin(t));
  }
  spawnA(i, pre = 0) {
    const d = this.randUnit(new THREE.Vector3());
    const o = i * 3;
    const start = d.clone().multiplyScalar(this.SUN_R * 1.02 + pre).add(this.sunPos);
    start.toArray(this.A.pos, o);
    d.toArray(this.A.dir, o);
  }
  spawnB(i, pre = 0) {
    const r = this.rnd;
    const B = this.B, o = i * 3;
    const a1 = r() * Math.PI * 2, rr1 = Math.sqrt(r()) * this.SUN_R * 0.7;
    const start = this.sunPos.clone().addScaledVector(this.s, -this.SUN_R * 0.95).addScaledVector(this.p, Math.cos(a1) * rr1).addScaledVector(this.u, Math.sin(a1) * rr1);
    const a2 = r() * Math.PI * 2, rr2 = Math.sqrt(r()) * 1.0;
    const target = new THREE.Vector3().addScaledVector(this.p, Math.cos(a2) * rr2).addScaledVector(this.u, Math.sin(a2) * rr2);
    const dir = target.sub(start).normalize();
    start.addScaledVector(dir, pre * (this.SUN_D - this.SUN_R));
    start.toArray(B.pos, o);
    dir.toArray(B.dir, o);
    B.state[i] = 0;
    B.col.set([1.0, 0.92, 0.72], o);
  }
  spawnC(i, randomDay = false, from = null) {
    const r = this.rnd, C = this.C, o = i * 3;
    let n;
    if (from) n = from.clone().normalize();
    else {
      n = this.randUnit(new THREE.Vector3());
      if (n.dot(this.s) < 0 && r() < 0.7) n.addScaledVector(this.s, -2 * n.dot(this.s));
    }
    const pos = n.clone().multiplyScalar(1.005 + (randomDay ? r() * 0.08 : 0));
    const t = this.randUnit(new THREE.Vector3()).multiplyScalar(0.45);
    const dir = n.clone().add(t).normalize();
    if (dir.dot(n) < 0.2) dir.addScaledVector(n, 0.5).normalize();
    pos.toArray(C.pos, o);
    dir.toArray(C.dir, o);
    C.state[i] = 0;
    C.col.set([1.0, 0.26, 0.07], o);
  }
  stepParticles(dt) {
    const r = this.rnd;
    const v = new THREE.Vector3(), d = new THREE.Vector3();
    if (this.fx.rad > 0.01) {
      const A = this.A;
      for (let i = 0; i < A.n; i++) {
        const o = i * 3;
        A.pos[o] += A.dir[o] * 16 * dt; A.pos[o + 1] += A.dir[o + 1] * 16 * dt; A.pos[o + 2] += A.dir[o + 2] * 16 * dt;
        v.fromArray(A.pos, o).sub(this.sunPos);
        if (v.lengthSq() > 70 * 70) this.spawnA(i);
      }
      A.geo.attributes.position.needsUpdate = true;
    }
    if (this.fx.beam > 0.01) {
      const B = this.B;
      for (let i = 0; i < B.n; i++) {
        const o = i * 3;
        if (B.state[i] === 2) {
          B.timer[i] -= dt;
          const k = clamp(B.timer[i] / 1.2, 0, 1);
          B.col[o] = 1.0 * k; B.col[o + 1] = 0.42 * k; B.col[o + 2] = 0.12 * k;
          if (B.timer[i] <= 0) {
            if (this.fx.ir > 0.01) { const j = Math.floor(r() * this.C.n); this.spawnC(j, false, v.fromArray(B.pos, o)); }
            this.spawnB(i);
          }
          continue;
        }
        const sp = B.state[i] === 1 ? 9 : 13;
        B.pos[o] += B.dir[o] * sp * dt; B.pos[o + 1] += B.dir[o + 1] * sp * dt; B.pos[o + 2] += B.dir[o + 2] * sp * dt;
        v.fromArray(B.pos, o);
        const l = v.length();
        if (B.state[i] === 0 && l < 1.03) {
          const nrm = v.clone().normalize();
          if (r() < 0.3) {
            d.fromArray(B.dir, o).reflect(nrm).add(this.randUnit(new THREE.Vector3()).multiplyScalar(0.25)).normalize();
            d.toArray(B.dir, o);
            B.state[i] = 1;
            B.col.set([0.62, 0.8, 1.0], o);
          } else {
            nrm.multiplyScalar(1.004).toArray(B.pos, o);
            B.state[i] = 2;
            B.timer[i] = 1.2;
          }
        } else if (B.state[i] === 1 && l > 14) this.spawnB(i);
      }
      B.geo.attributes.position.needsUpdate = true;
      B.geo.attributes.aColor.needsUpdate = true;
    }
    if (this.fx.ir > 0.01) {
      const C = this.C;
      const back = this.atmosphereOn ? 0.62 : 0.0;
      for (let i = 0; i < C.n; i++) {
        const o = i * 3;
        C.pos[o] += C.dir[o] * 0.36 * dt; C.pos[o + 1] += C.dir[o + 1] * 0.36 * dt; C.pos[o + 2] += C.dir[o + 2] * 0.36 * dt;
        v.fromArray(C.pos, o);
        const l = v.length();
        const out = v.dot(d.fromArray(C.dir, o)) > 0;
        if (out && l > 1.1 && C.state[i] === 0) {
          if (r() < back) {
            const nrm = v.clone().normalize();
            d.reflect(nrm).addScaledVector(this.randUnit(new THREE.Vector3()), 0.3).normalize();
            if (d.dot(nrm) > -0.1) d.addScaledVector(nrm, -0.6).normalize();
            d.toArray(C.dir, o);
            C.col.set([1.0, 0.45, 0.12], o);
          } else C.state[i] = 1;
        } else if (!out && l < 1.004) {
          this.spawnC(i, false, v);
        } else if (l > 1.75) this.spawnC(i, true);
      }
      C.geo.attributes.position.needsUpdate = true;
      C.geo.attributes.aColor.needsUpdate = true;
    }
  }

  // ---------- Magnetfelt, solvind, nordlys ----------
  buildMagnetosphere() {
    const mag = new THREE.Group();
    this.earth.spin.add(mag);
    this.magGroup = mag;
    const mN = latLonDir(80.7, -72.7), mS = latLonDir(-80.7, 107.3);
    const basis = (m) => {
      const a = new THREE.Vector3(0, 1, 0).cross(m).normalize();
      if (a.lengthSq() < 0.01) a.set(1, 0, 0);
      const b = new THREE.Vector3().crossVectors(m, a).normalize();
      return [a, b];
    };
    // Nordlys-ovaler
    this.auroraMats = [];
    for (const [m, seed] of [[mN, 1.3], [mS, 4.1]]) {
      const [a, b] = basis(m);
      const seg = 220, pos = [], aH = [], aPhi = [], idx = [];
      for (let i = 0; i <= seg; i++) {
        const phi = (i / seg) * Math.PI * 2;
        const th = (21 + 2.2 * Math.sin(3 * phi + seed) + 1.2 * Math.sin(7 * phi)) * DEG;
        const dir = m.clone().multiplyScalar(Math.cos(th)).addScaledVector(a, Math.sin(th) * Math.cos(phi)).addScaledVector(b, Math.sin(th) * Math.sin(phi));
        const lo = dir.clone().multiplyScalar(1.013), hi = dir.clone().multiplyScalar(1.085);
        pos.push(lo.x, lo.y, lo.z, hi.x, hi.y, hi.z);
        aH.push(0, 1); aPhi.push(phi, phi);
        if (i < seg) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute('aH', new THREE.Float32BufferAttribute(aH, 1));
      geo.setAttribute('aPhi', new THREE.Float32BufferAttribute(aPhi, 1));
      geo.setIndex(idx);
      const mat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uI: { value: 0 }, uSunPos: { value: this.sunPos } },
        vertexShader: VS_AURORA, fragmentShader: FS_AURORA,
        transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      });
      this.auroraMats.push(mat);
      mag.add(new THREE.Mesh(geo, mat));
    }
    // Feltlinjer (dipol)
    const [a, b] = basis(mN);
    this.fieldMat = new THREE.LineBasicMaterial({ color: new THREE.Color(0.45, 0.75, 1.0), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    for (const L of [1.7, 2.5, 3.6, 5.2]) {
      const th0 = Math.asin(Math.sqrt(1 / L));
      for (let k = 0; k < 8; k++) {
        const phi = (k / 8) * Math.PI * 2 + L;
        const pts = [];
        for (let i = 0; i <= 80; i++) {
          const th = lerp(th0, Math.PI - th0, i / 80);
          const rr = L * Math.sin(th) ** 2;
          pts.push(mN.clone().multiplyScalar(rr * Math.cos(th)).addScaledVector(a, rr * Math.sin(th) * Math.cos(phi)).addScaledVector(b, rr * Math.sin(th) * Math.sin(phi)));
        }
        mag.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), this.fieldMat));
      }
    }
    // Solvind, der bøjer uden om magnetosfæren
    const n = N(520), r = rng(21);
    this.wind = { n, x: new Float32Array(n), rho: new Float32Array(n), psi: new Float32Array(n) };
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n).fill(1);
    for (let i = 0; i < n; i++) {
      this.wind.x[i] = -14 + r() * 28;
      this.wind.rho[i] = 0.2 + Math.sqrt(r()) * 6.5;
      this.wind.psi[i] = r() * Math.PI * 2;
      col.set([0.95, 0.85, 0.62], i * 3);
    }
    this.wind.geo = pointsGeometry(pos, col, sz);
    this.wind.mat = pointsMaterial({ size: 2.0, opacity: 0 });
    this.wind.pts = new THREE.Points(this.wind.geo, this.wind.mat);
    this.wind.pts.frustumCulled = false;
    this.group.add(this.wind.pts);
  }
  stepWind(dt) {
    if (this.fx.wind < 0.01) return;
    const W = this.wind, pos = W.geo.attributes.position.array;
    const flow = this.s.clone().multiplyScalar(-1);
    const A = 3.1;
    for (let i = 0; i < W.n; i++) {
      W.x[i] += 3.2 * dt;
      if (W.x[i] > 14) W.x[i] -= 28;
      const x = W.x[i];
      const g = smooth(-7, -2.2, x);
      const rho = Math.sqrt(W.rho[i] ** 2 + A * A * g) + Math.max(0, x) * 0.04;
      const c = Math.cos(W.psi[i]), s = Math.sin(W.psi[i]);
      const o = i * 3;
      pos[o] = flow.x * x + (this.p.x * c + this.u.x * s) * rho;
      pos[o + 1] = flow.y * x + (this.p.y * c + this.u.y * s) * rho;
      pos[o + 2] = flow.z * x + (this.p.z * c + this.u.z * s) * rho;
    }
    W.geo.attributes.position.needsUpdate = true;
  }

  // ---------- Kameraindstillinger ----------
  shot(i) {
    const s = this.s, p = this.p, u = this.u;
    const V = (a, b, c) => new THREE.Vector3().addScaledVector(s, a).addScaledVector(p, b).addScaledVector(u, c);
    switch (i) {
      case 0: return [V(-7.2, 7.4, 2.4), V(9, -3.2, 0.2)];
      case 1: {
        const dir = V(-0.35, 0.95, 0.32).normalize();
        return [this.sunPos.clone().addScaledVector(dir, 24), this.sunPos.clone()];
      }
      case 2: return [V(14.5, 44, 8), V(14, 0, 0)];
      default: return [V(0.9, 2.5, 2.2), V(0, 0, 0.3)];
    }
  }

  enter() {
    this.hideLabels();
  }
  exit() {
    this.stopPhotonJourney();
    this.cut.target = 0; this.cut.alpha = 0; this.setWedge(0);
    for (const l of this.zoneLbls) l.show = false;
    hud('');
  }
  beat(i, first) {
    const [pos, target] = this.shot(i);
    if (first) cutTo(pos.clone().multiplyScalar(1.6).sub(target.clone().multiplyScalar(0.6)), target);
    flyTo(pos, target, first ? 3.2 : 2.8);
    controls.minDistance = 1.3; controls.maxDistance = 140;
    controls.autoRotate = false;
    this.lblSun.show = i !== 1;
    this.lblEarth.show = i === 0 || i === 2;
    this.lblDK.show = i === 0 || i === 3;
    this.lblTemp.show = i === 3;
    this.fxT = { rad: i === 0 || i === 2 ? 1 : 0, beam: i === 2 || i === 3 ? 1 : 0, ir: i === 3 ? 1 : 0, aurora: i === 3 ? 1 : i === 0 ? 0.5 : 0, field: i === 3 ? 1 : 0, wind: i === 3 ? 1 : 0 };
    this.stopPhotonJourney();
    hud('');
    for (const l of this.zoneLbls) l.show = false;
    if (i === 1) {
      const dir = this.shot(1)[0].clone().sub(this.sunPos).projectOnPlane(this.u).normalize();
      this.cut.v.copy(dir);
      this.cut.target = Math.PI / 4;
      setTimeout(() => { if (activeWorld === this && currentBeat() === 1) { for (const l of this.zoneLbls) l.show = true; this.startPhotonJourney(); } }, first ? 3300 : 2900);
    } else this.cut.target = 0;
    if (i === 3) this.setAtmosphere(true);
  }
  introShot() {
    const dir = new THREE.Vector3().addScaledVector(this.s, -0.25).addScaledVector(this.p, 1).addScaledVector(this.u, 0.32).normalize();
    cutTo(dir.clone().multiplyScalar(9), new THREE.Vector3());
    flyTo(dir.clone().multiplyScalar(4.6), new THREE.Vector3(), 4);
    controls.minDistance = 1.3; controls.maxDistance = 140;
    this.lblSun.show = false; this.lblEarth.show = false; this.lblDK.show = false;
    this.fxT = { rad: 0, beam: 0, ir: 0, aurora: 0.6, field: 0, wind: 0 };
  }
  replayPhoton() {
    const [pos, target] = this.shot(1);
    flyTo(pos, target, 1.6, () => this.startPhotonJourney());
  }
  setAtmosphere(on) {
    this.atmosphereOn = on;
    this.lblTemp.set(on ? '+15 °C i gennemsnit' : '−18 °C i gennemsnit');
    this.earth.atmo.visible = on;
    if (this.earth.clouds) this.earth.clouds.visible = on;
    this.earth.surface.material.uniforms.uHaze.value = on ? 0.55 : 0.0;
  }

  update(dt, t) {
    this.sun.update(t);
    this.earth.update(t);
    for (const k in this.fx) this.fx[k] = lerp(this.fx[k], this.fxT[k], 1 - Math.exp(-dt * 2.5));
    this.A.mat.uniforms.uOpacity.value = this.fx.rad * 0.8;
    this.B.mat.uniforms.uOpacity.value = this.fx.beam;
    this.C.mat.uniforms.uOpacity.value = this.fx.ir;
    this.wind.mat.uniforms.uOpacity.value = this.fx.wind * 0.55;
    this.fieldMat.opacity = this.fx.field * 0.1;
    for (const m of this.auroraMats) { m.uniforms.uTime.value = t; m.uniforms.uI.value = this.fx.aurora; }
    this.stepParticles(dt);
    this.stepWind(dt);
    // Snittet åbner og lukker blødt.
    this.cut.alpha = lerp(this.cut.alpha, this.cut.target, 1 - Math.exp(-dt * 2.2));
    if (this.cut.alpha < 0.002 && this.cut.target === 0) this.cut.alpha = 0;
    this.setWedge(this.cut.alpha);
    this.sun.glow.material.uniforms.uIntensity.value = 0.8 * (1 - 0.7 * (this.cut.alpha / (Math.PI / 4)));
    this.face1.material.uniforms.uTime.value = t;
    this.face2.material.uniforms.uTime.value = t;
    if (this.walk) this.stepWalk(dt);
  }
  stepWalk(dt) {
    const W = this.walk;
    W.t += dt;
    const n = W.pts.length;
    if (W.phase === 0) {
      const k = clamp(W.t / 7.5, 0, 1);
      const idx = Math.max(1, Math.floor(easeInOut(k) * (n - 1)));
      this.walkLine.geometry.setDrawRange(0, idx + 1);
      this.walkDots.geometry.setDrawRange(0, idx + 1);
      this.photon.position.copy(W.pts[idx]);
      const a = $('#hudA'); if (a) a.textContent = `${fmt(Math.round(easeInOut(k) * 170000 / 1000) * 1000)} år`;
      if (k >= 1) {
        W.phase = 1; W.t = 0;
        const [pos, target] = this.shot(0);
        flyTo(pos, target, 5.0);
      }
    } else if (W.phase === 1) {
      const k = clamp(W.t / 5.0, 0, 1);
      const e = easeInOut(k);
      const end = new THREE.Vector3().addScaledVector(this.s, 1.02);
      this.photon.position.lerpVectors(W.exit, end, e);
      const sec = Math.round(e * 500);
      const b = $('#hudB'); if (b) b.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
      if (k >= 1) { W.phase = 2; this.photon.visible = false; }
    }
  }
}
