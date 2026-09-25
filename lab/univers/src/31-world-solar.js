// ============================================================
// 31 · Verden: Solsystemet (bruges også i "Tomheden")
// Positioner fra JPL-baneelementer for den valgte dato.
// "Pæn" skala: afstand = 30·√(r/30) AU, overdrevne størrelser. Ægte skala: 1 enhed = 1 AU.
// ============================================================
const VS_BELT = /* glsl */ `
attribute vec4 aOrb; attribute vec3 aColor; attribute float aSize;
uniform float uDays; uniform float uMorph; uniform float uPR; uniform float uSize;
varying vec3 vColor; varying float vB;
void main(){
  float n = 6.2831853 / (365.25 * pow(aOrb.x, 1.5));
  float ang = aOrb.y + n * uDays;
  vec3 p = vec3(cos(ang), 0.0, -sin(ang));
  float ci = cos(aOrb.z), si = sin(aOrb.z);
  p = vec3(p.x, -p.z * si, p.z * ci);
  float cn = cos(aOrb.w), sn = sin(aOrb.w);
  p = vec3(p.x * cn - p.z * sn, p.y, p.x * sn + p.z * cn);
  float r = mix(30.0 * sqrt(aOrb.x / 30.0), aOrb.x, uMorph);
  vec4 mv = modelViewMatrix * vec4(p * r, 1.0);
  gl_Position = projectionMatrix * mv;
  float s = aSize * uSize * uPR;
  vB = 1.0;
  if (s < 1.5) { vB = s / 1.5; s = 1.5; }
  gl_PointSize = s;
  vColor = aColor;
}`;
const VS_GRID = /* glsl */ `
uniform vec4 uMass[9]; uniform float uBase;
varying float vDepth; varying vec2 vXZ;
void main(){
  vec3 p = position;
  float d = 0.0;
  for (int i = 0; i < 9; i++) { vec2 m = uMass[i].xz - p.xz; d += uMass[i].w / sqrt(dot(m, m) + 0.5); }
  p.y = uBase - d;
  vDepth = d; vXZ = p.xz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const FS_GRID = /* glsl */ `
uniform float uOpacity; varying float vDepth; varying vec2 vXZ;
void main(){
  vec2 q = vXZ / 1.6;
  vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
  float line = 1.0 - min(min(g.x, g.y), 1.0);
  float fade = 1.0 - smoothstep(22.0, 38.0, length(vXZ));
  vec3 col = mix(vec3(0.3, 0.55, 1.0), vec3(1.0, 0.72, 0.38), clamp(vDepth / 3.5, 0.0, 1.0));
  gl_FragColor = vec4(col * line * fade * uOpacity * 0.3, 1.0);
}`;

class SolarWorld extends World {
  constructor() {
    super('solar');
    this.bloom = [0.7, 0.5, 0.86];
    this.cam = { near: 0.01, far: 30000 };
    this.days = 0; this.rate = 0;
    this.morph = 0; this.morphT = 0;
    this.gridA = 0; this.gridT = 0;
    this.travel = false;
    this.pulse = null;
    this.follow = null;
  }
  get jd() { return JD_NOW + this.days; }

  build() {
    const g = this.group;
    this.sun = createSun({ radius: 1.6, intensity: 3.0, rays: 0.35 });
    this.system = new THREE.Group();
    g.add(this.system);
    this.system.add(this.sun.group);
    this.sunPoint = glowSprite({ color: new THREE.Color(1, 0.78, 0.5), size: 0.04, intensity: 0, core: 0.04, fall: 9, minPx: 26 });
    this.system.add(this.sunPoint);

    const r = rng(3);
    this.bodies = PLANETS.map((def, i) => {
      const b = { def, rC: def.rD, rT: def.km / 1.495978707e8, au: new THREE.Vector3(), pos: new THREE.Vector3() };
      b.group = new THREE.Group();
      b.tilt = new THREE.Group();
      b.tilt.rotation.z = def.tilt * DEG;
      b.group.add(b.tilt);
      if (def.id === 'earth') {
        b.earth = createEarth({ segments: 64 });
        b.tilt.add(b.earth.group);
        b.tilt.rotation.z = 0;
        b.moon = createMoon(1);
        this.system.add(b.moon.mesh);
      } else {
        b.mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), planetMaterial(def.type, def.c, 1.7 + i * 3.1, def.spot || 0));
        b.tilt.add(b.mesh);
        if (def.rings !== undefined) { b.ring = ringMesh(def.rings); b.tilt.add(b.ring); }
      }
      this.system.add(b.group);
      const pts = orbitEcl(def.id, JD_NOW, 256).map(([x, y, z]) => eclToThree(x, y, z));
      b.orbitAU = pts;
      b.orbit = lineFromPoints(pts.map((p) => p.clone()), new THREE.Color(0.45, 0.58, 0.85), 0.28, true);
      this.system.add(b.orbit);
      b.label = this.label(def.name, 'click', (v) => v.copy(b.pos).addScaledVector(camera.up, this.radiusOf(b) * 1.25));
      b.label.el.addEventListener('click', () => focusPlanet(def.id));
      return b;
    });
    this.updateOrbits();

    // Asteroidebæltet og Kuiperbæltet (baner regnes i shaderen).
    const belt = (n, aMin, aMax, inc, col, size) => {
      const orb = new Float32Array(n * 4), cols = new Float32Array(n * 3), sz = new Float32Array(n), pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        orb[i * 4] = aMin + (aMax - aMin) * Math.pow(r(), 0.8);
        orb[i * 4 + 1] = r() * Math.PI * 2;
        orb[i * 4 + 2] = gauss(r) * inc;
        orb[i * 4 + 3] = r() * Math.PI * 2;
        const k = 0.5 + r() * 0.6;
        cols.set([col[0] * k, col[1] * k, col[2] * k], i * 3);
        sz[i] = 0.6 + r() * 1.2;
      }
      const geo = pointsGeometry(pos, cols, sz, { aOrb: { array: orb, size: 4 } });
      const mat = pointsMaterial({ size, vs: VS_BELT, uniforms: { uDays: { value: 0 }, uMorph: { value: 0 } } });
      const p = new THREE.Points(geo, mat);
      p.frustumCulled = false;
      this.system.add(p);
      return p;
    };
    this.asteroids = belt(N(2600), 2.15, 3.3, 0.12, [0.75, 0.68, 0.6], 1.4);
    this.kuiper = belt(N(2600), 30, 50, 0.16, [0.55, 0.65, 0.85], 1.3);
    this.lblBelt = this.label('Asteroidebæltet', 'faint nodot', (v) => v.set(this.mapR(2.8) * 0.72, 0, this.mapR(2.8) * 0.72));
    this.lblKuiper = this.label('Kuiperbæltet · Pluto og andre isverdener', 'faint nodot', (v) => v.set(this.mapR(42) * 0.96, 0, this.mapR(42) * 0.2));

    // Voyager 1 og heliopausen (kun relevant i ægte skala).
    this.voyPos = voyagerDir.clone().multiplyScalar(voyagerAU());
    this.lblVoy = this.label('Voyager 1', 'cool', (v) => v.copy(this.voyPos));
    this.helio = fresnelShell(120, new THREE.Color(0.3, 0.55, 1.0), { power: 3, intensity: 0 });
    this.system.add(this.helio);
    this.lblHelio = this.label('Heliopausen · her slutter solvinden', 'faint nodot', (v) => v.set(0, 120 * 0.72, 120 * 0.7));

    // Lyspuls (ægte skala).
    this.pulseMesh = fresnelShell(1, new THREE.Color(1.0, 0.85, 0.55), { power: 3.5, intensity: 0 });
    this.pulseMesh.visible = false;
    this.system.add(this.pulseMesh);

    // Rumtidsgitter.
    const gridGeo = new THREE.PlaneGeometry(80, 80, TOUCH ? 140 : 220, TOUCH ? 140 : 220);
    gridGeo.rotateX(-Math.PI / 2);
    this.gridMat = new THREE.ShaderMaterial({
      uniforms: { uMass: { value: Array.from({ length: 9 }, () => new THREE.Vector4()) }, uBase: { value: -0.8 }, uOpacity: { value: 0 } },
      vertexShader: VS_GRID, fragmentShader: FS_GRID,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    this.grid = new THREE.Mesh(gridGeo, this.gridMat);
    this.grid.frustumCulled = false;
    this.grid.visible = false;
    g.add(this.grid);

    // Spor til rejsen gennem galaksen.
    this.trailN = 1200;
    this.trails = [this.sun, ...this.bodies].map((b, i) => {
      const buf = new Float32Array(this.trailN * 3), col = new Float32Array(this.trailN * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(buf, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const c = i === 0 ? [1, 0.72, 0.35] : i === 3 ? [0.4, 0.75, 1] : [0.75, 0.75, 0.85];
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      line.frustumCulled = false;
      line.visible = false;
      g.add(line);
      return { line, geo, buf, col, c, hist: [], count: 0 };
    });
    this.travelDir = galToThree([0, 1, 0]).normalize();
    this.offset = new THREE.Vector3();
  }

  mapR(rAU) { return lerp(30 * Math.sqrt(rAU / 30), rAU, this.morph); }
  mapVec(v, out) {
    const rr = v.length();
    if (rr === 0) return out.set(0, 0, 0);
    return out.copy(v).multiplyScalar(this.mapR(rr) / rr);
  }
  radiusOf(b) { return Math.exp(lerp(Math.log(b.rC), Math.log(b.rT), this.morph)); }
  updateOrbits() {
    const v = new THREE.Vector3();
    for (const b of this.bodies) {
      const arr = b.orbit.geometry.attributes.position.array;
      b.orbitAU.forEach((p, i) => { this.mapVec(p, v); arr[i * 3] = v.x; arr[i * 3 + 1] = v.y; arr[i * 3 + 2] = v.z; });
      b.orbit.geometry.attributes.position.needsUpdate = true;
      b.orbit.geometry.computeBoundingSphere();
    }
  }
  placeBodies(t) {
    const jd = this.jd;
    for (const b of this.bodies) {
      planetThree(b.def.id, jd, b.au);
      this.mapVec(b.au, b.pos);
      b.pos.add(this.offset);
      b.group.position.copy(b.pos).sub(this.offset);
      const R = this.radiusOf(b);
      b.group.scale.setScalar(R);
      const spinRate = b.def.id === 'jupiter' || b.def.id === 'saturn' ? 0.35 : 0.12;
      if (b.mesh) {
        b.mesh.rotation.y = t * spinRate;
        b.mesh.material.uniforms.uSunPos.value.copy(this.offset);
        b.mesh.material.uniforms.uTime.value = t;
      }
      if (b.ring) {
        const u = b.ring.material.uniforms;
        u.uSunPos.value.copy(this.offset);
        u.uPlanetPos.value.copy(b.pos);
        u.uPlanetR.value = R;
      }
      if (b.earth) {
        b.earth.spin.quaternion.copy(earthQuaternion(jd));
        b.earth.setSun(this.offset);
        b.earth.update(t);
        const mg = moonGeo(jd);
        const md = lerp(0.62, mg.km / 1.495978707e8, this.morph);
        b.moon.mesh.position.copy(b.group.position).addScaledVector(mg.dir, md);
        b.moon.mesh.scale.setScalar(Math.exp(lerp(Math.log(0.07), Math.log(1737.4 / 1.495978707e8), this.morph)));
        b.moon.setSun(this.offset);
      }
    }
  }

  // ---------- Tilstande styret af kapitlerne ----------
  setMorph(m, dur = 3) {
    this.morphT = m;
    stopTween(this._mt);
    const m0 = this.morph;
    this._mt = tween(dur, (k) => { this.morph = lerp(m0, m, k); this.updateOrbits(); });
  }
  setGrid(on) { this.gridT = on ? 1 : 0; }
  setTravel(on) {
    this.travel = on;
    for (const tr of this.trails) { tr.hist.length = 0; tr.line.visible = on; }
    if (!on) {
      camera.position.sub(this.offset);
      controls.target.sub(this.offset);
      this.offset.set(0, 0, 0);
      this.system.position.set(0, 0, 0);
    }
  }
  startPulse() {
    this.pulse = { sec: 0, hit: new Set() };
    this.pulseMesh.visible = true;
    for (const b of this.bodies) b.label.el.classList.remove('hit');
  }
  stopPulse() { this.pulse = null; this.pulseMesh.visible = false; }

  shot(kind) {
    switch (kind) {
      case 'overview': return [new THREE.Vector3(8, 34, 46), new THREE.Vector3(0, -2, 0)];
      case 'inner': return [new THREE.Vector3(3, 9, 13), new THREE.Vector3(0, -1, 0)];
      case 'grid': return [new THREE.Vector3(12, 16, 36), new THREE.Vector3(0, -3, 0)];
      case 'travel': return [new THREE.Vector3(60, 45, 70), new THREE.Vector3(0, 0, 0)];
      case 'true': return [new THREE.Vector3(6, 38, 52), new THREE.Vector3(0, 0, 0)];
      case 'far': return [new THREE.Vector3(40, 240, 330), new THREE.Vector3(0, 0, 0)];
      default: return [new THREE.Vector3(8, 34, 46), new THREE.Vector3(0, 0, 0)];
    }
  }
  enter() { this.hideLabels(); }
  exit() {
    this.setTravel(false);
    this.stopPulse();
    this.follow = null;
    hud('');
    closeCard();
  }
  // mode: 'today' | 'gravity' | 'travel' | 'true' | 'light'
  setMode(mode, first) {
    this.mode = mode;
    this.follow = null;
    closeCard();
    this.stopPulse();
    if (mode !== 'travel' && this.travel) this.setTravel(false);
    const trueScale = mode === 'true' || mode === 'light';
    if ((this.morphT === 1) !== trueScale) this.setMorph(trueScale ? 1 : 0, first ? 0.01 : 3.2);
    this.setGrid(mode === 'gravity');
    this.rate = mode === 'today' ? 2 : mode === 'gravity' ? 6 : mode === 'travel' ? 60 : 0;
    if (mode === 'today' || trueScale) this.days = 0;
    syncRateSlider();
    const [pos, target] = this.shot(mode === 'gravity' ? 'grid' : mode === 'travel' ? 'travel' : trueScale ? 'true' : 'overview');
    if (first) cutTo(pos.clone().multiplyScalar(1.8), target);
    flyTo(pos, target, first ? 3.2 : 2.8, () => { if (mode === 'travel' && this.mode === 'travel' && activeWorld === this) this.setTravel(true); });
    controls.minDistance = 0.2; controls.maxDistance = 1400;
    for (const b of this.bodies) { b.label.show = true; b.label.el.classList.toggle('ring', trueScale); }
    this.lblBelt.show = !trueScale && mode !== 'travel';
    this.lblKuiper.show = !trueScale && mode !== 'travel';
    this.lblVoy.show = false;
    this.lblHelio.show = false;
    if (mode === 'light') setTimeout(() => { if (activeWorld === this && this.mode === 'light' && !this.pulse) startLight(); }, first ? 3400 : 3000);
  }

  update(dt, t) {
    this.sun.update(t);
    this.days += this.rate * dt;
    if (this.travel) {
      const step = this.travelDir.clone().multiplyScalar(20 / 365.25 * this.rate * dt);
      this.offset.add(step);
      this.system.position.copy(this.offset);
      camera.position.add(step);
      controls.target.add(step);
    }
    this.placeBodies(t);
    const R = Math.exp(lerp(Math.log(1.6), Math.log(0.00465), this.morph));
    this.sun.setRadius(R);
    this.sun.glow.material.uniforms.uIntensity.value = 0.8 * (1 - this.morph);
    this.sunPoint.material.uniforms.uIntensity.value = 2.4 * smooth(0.2, 0.9, this.morph);
    for (const p of [this.asteroids, this.kuiper]) { p.material.uniforms.uDays.value = this.days; p.material.uniforms.uMorph.value = this.morph; }
    this.helio.material.uniforms.uIntensity.value = this.mode === 'light' ? 0.35 * this.morph : 0;

    // Rumtidsgitter
    this.gridA = lerp(this.gridA, this.gridT, 1 - Math.exp(-dt * 2));
    this.grid.visible = this.gridA > 0.01;
    if (this.grid.visible) {
      this.gridMat.uniforms.uOpacity.value = this.gridA;
      const ms = this.gridMat.uniforms.uMass.value;
      ms[0].set(0, 0, 0, 2.6);
      const w = { mercury: 0.02, venus: 0.05, earth: 0.06, mars: 0.03, jupiter: 0.55, saturn: 0.35, uranus: 0.14, neptune: 0.15 };
      this.bodies.forEach((b, i) => ms[i + 1].set(b.pos.x, b.pos.y, b.pos.z, w[b.def.id]));
    }

    // Spor gennem galaksen
    if (this.travel) {
      const all = [this.sun.group, ...this.bodies.map((b) => b.group)];
      const wp = new THREE.Vector3();
      this.trails.forEach((tr, i) => {
        all[i].getWorldPosition(wp);
        tr.hist.push(wp.x, wp.y, wp.z);
        if (tr.hist.length > this.trailN * 3) tr.hist.splice(0, 3);
        const n = tr.hist.length / 3;
        tr.buf.set(tr.hist);
        for (let k = 0; k < n; k++) {
          const a = Math.pow(k / Math.max(1, n - 1), 1.2) * 2.2;
          tr.col[k * 3] = tr.c[0] * a; tr.col[k * 3 + 1] = tr.c[1] * a; tr.col[k * 3 + 2] = tr.c[2] * a;
        }
        tr.geo.setDrawRange(0, n);
        tr.geo.attributes.position.needsUpdate = true;
        tr.geo.attributes.color.needsUpdate = true;
      });
    }

    // Lyspulsen
    if (this.pulse) {
      const P = this.pulse;
      P.sec += dt * lightSpeedFactor();
      const rAU = P.sec / LIGHT_AU_S;
      this.pulseMesh.scale.setScalar(Math.max(rAU, 1e-4));
      this.pulseMesh.material.uniforms.uIntensity.value = 0.9;
      for (const b of this.bodies) {
        if (!P.hit.has(b.def.id) && rAU >= b.au.length()) { P.hit.add(b.def.id); b.label.hit(); lightArrived(b.def.name, b.au.length() * LIGHT_AU_S); }
      }
      if (!P.hit.has('voy') && rAU >= voyagerAU()) { P.hit.add('voy'); this.lblVoy.hit(); lightArrived('Voyager 1', voyagerAU() * LIGHT_AU_S); }
      if (rAU > 34 && !P.far) {
        P.far = true;
        this.lblVoy.show = true; this.lblHelio.show = true;
        const [pos, target] = this.shot('far');
        flyTo(pos, target, 4);
      }
      lightTick(P.sec, rAU);
      if (rAU > 200) this.pulseMesh.material.uniforms.uIntensity.value = 0.9 * clamp(1 - (rAU - 200) / 40, 0, 1);
    }

    if (this.follow) {
      const b = this.follow;
      const d = b.pos.clone().sub(controls.target);
      if (!camTween) { controls.target.add(d); camera.position.add(d); }
    }
  }
}
