// ============================================================
// 35 · Verden: Hvad en superintelligens kunne nå derude (inden for kendt fysik)
// ============================================================
const VS_SWARM = /* glsl */ `
attribute vec4 aOrb; attribute vec3 aMisc;
uniform float uTime; uniform float uBuild;
varying vec3 vW; varying vec3 vN; varying float vVis;
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
void main(){
  float ph = aOrb.w + uTime * aMisc.x;
  vec3 center = rotY(aOrb.z) * rotX(aOrb.y) * vec3(cos(ph) * aOrb.x, 0.0, sin(ph) * aOrb.x);
  vec3 n = normalize(-center);
  vec3 up = abs(n.y) > 0.9 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 t1 = normalize(cross(up, n));
  vec3 t2 = cross(n, t1);
  float vis = step(aMisc.z, uBuild);
  vec3 local = (t1 * position.x + t2 * position.y) * aMisc.y * vis;
  vec4 w = modelMatrix * vec4(center + local, 1.0);
  vW = w.xyz; vN = normalize(mat3(modelMatrix) * n); vVis = vis;
  gl_Position = projectionMatrix * viewMatrix * w;
}`;
const FS_SWARM = /* glsl */ `
varying vec3 vW; varying vec3 vN; varying float vVis;
void main(){
  if (vVis < 0.5) discard;
  vec3 V = normalize(cameraPosition - vW);
  float facing = dot(vN, V);
  vec3 lit = vec3(1.0, 0.78, 0.42) * 1.6;
  vec3 back = vec3(0.35, 0.12, 0.05);
  gl_FragColor = vec4(facing > 0.0 ? lit * (0.4 + 0.6 * facing) : back, 1.0);
}`;
const VS_STREAM = /* glsl */ `
attribute vec3 aEnd; attribute float aSeed; attribute vec3 aColor; attribute float aSize;
uniform vec3 uStart; uniform float uTime; uniform float uPR; uniform float uSize;
varying vec3 vColor; varying float vB;
void main(){
  float t = fract(uTime * 0.25 + aSeed);
  vec3 p = mix(uStart, aEnd, t);
  p.y += sin(t * 3.14159) * 1.2 * (aSeed - 0.5);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uSize * uPR;
  vB = sin(t * 3.14159);
  vColor = aColor;
}`;
const FS_SHELL = /* glsl */ `
uniform vec3 uColor; uniform float uTime; uniform float uOpacity; uniform float uCells;
varying vec3 vW; varying vec3 vN; varying vec3 vObj; varying vec2 vUv;
void main(){
  vec3 p = normalize(vObj);
  float lat = asin(clamp(p.y, -1.0, 1.0));
  float lon = atan(p.z, p.x);
  vec2 g = vec2(lon * uCells / 3.14159, lat * uCells / 1.5708);
  vec2 f = abs(fract(g) - 0.5);
  float seam = smoothstep(0.43, 0.5, max(f.x, f.y));
  float flick = 0.7 + 0.3 * sin(uTime * 1.7 + floor(g.x) * 12.9898 + floor(g.y) * 78.233);
  vec3 V = normalize(cameraPosition - vW);
  float mu = abs(dot(normalize(vN), V));
  vec3 col = uColor * flick * (1.0 - seam * 0.85) * 0.5 + uColor * pow(1.0 - mu, 2.2) * 0.9;
  gl_FragColor = vec4(col * uOpacity, 1.0);
}`;
const VS_PROBE = /* glsl */ `
attribute vec3 aColor; attribute float aSize; attribute float aArr;
uniform float uWave; uniform float uPR; uniform float uSize;
varying vec3 vColor; varying float vB;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float reached = step(aArr, uWave);
  float front = exp(-pow((aArr - uWave) / 0.06, 2.0)) * step(0.001, uWave);
  vec3 c = mix(aColor * 0.5, mix(vec3(0.35, 0.9, 1.0), vec3(1.0, 0.78, 0.3), fract(aArr * 13.7)) * 1.2, reached);
  c += vec3(0.7, 1.0, 1.0) * front * 1.4;
  float s = aSize * uSize * uPR * (1.0 + reached * 0.3 + front * 0.8);
  vB = 1.0;
  if (s < 1.5) { vB = s / 1.5; s = 1.5; }
  gl_PointSize = s;
  vColor = c;
}`;

class AsiWorld extends World {
  constructor() {
    super('asi');
    this.bloom = [0.75, 0.5, 0.85];
    this.cam = { near: 0.01, far: 30000 };
    this.coverage = 0;
    this.wave = 0;
    this.mode = 'kardashev';
  }
  build() {
    this.gEarth = new THREE.Group();
    this.gSun = new THREE.Group();
    this.gGal = new THREE.Group();
    this.gReach = new THREE.Group();
    this.group.add(this.gEarth, this.gSun, this.gGal, this.gReach);

    // Jorden om natten
    const earthHelio = planetThree('earth', JD_NOW);
    this.sDir = earthHelio.clone().multiplyScalar(-1).normalize();
    this.earth = createEarth({ segments: TOUCH ? 96 : 144 });
    this.earth.spin.quaternion.copy(earthQuaternion(JD_NOW));
    this.earth.setSun(this.sDir.clone().multiplyScalar(500));
    this.earth.surface.material.uniforms.uNight.value = 1.1;
    this.gEarth.add(this.earth.group);

    // Solen med Dyson-sværm og Merkur
    this.sun = createSun({ radius: 2, intensity: 3.2, rays: 0.4 });
    this.gSun.add(this.sun.group);
    const n = N(9000), r = rng(9);
    const base = new THREE.PlaneGeometry(1, 0.62);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute('position', base.attributes.position);
    geo.setAttribute('uv', base.attributes.uv);
    const orb = new Float32Array(n * 4), misc = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const rad = 3.3 + r() * 1.0;
      orb.set([rad, Math.acos(r() * 2 - 1), r() * Math.PI * 2, r() * Math.PI * 2], i * 4);
      misc.set([0.9 / Math.pow(rad, 1.5), 0.1 + r() * 0.1, r()], i * 3);
    }
    geo.setAttribute('aOrb', new THREE.InstancedBufferAttribute(orb, 4));
    geo.setAttribute('aMisc', new THREE.InstancedBufferAttribute(misc, 3));
    geo.instanceCount = n;
    this.swarmMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 }, uBuild: { value: 0 } }, vertexShader: VS_SWARM, fragmentShader: FS_SWARM, side: THREE.DoubleSide });
    this.swarm = new THREE.Mesh(geo, this.swarmMat);
    this.swarm.frustumCulled = false;
    this.gSun.add(this.swarm);
    this.mercury = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), planetMaterial(0, PLANETS[0].c, 2.2));
    this.mercury.scale.setScalar(0.32);
    this.gSun.add(this.mercury);
    const m = N(900);
    const pos = new Float32Array(m * 3), col = new Float32Array(m * 3), sz = new Float32Array(m), end = new Float32Array(m * 3), seed = new Float32Array(m);
    for (let i = 0; i < m; i++) {
      const v = new THREE.Vector3(gauss(r), gauss(r), gauss(r)).normalize().multiplyScalar(3.4 + r());
      end.set([v.x, v.y, v.z], i * 3);
      seed[i] = r();
      col.set([1.0, 0.7, 0.4], i * 3);
      sz[i] = 1 + r();
    }
    this.streamMat = pointsMaterial({ size: 1.6, vs: VS_STREAM, uniforms: { uStart: { value: new THREE.Vector3() } } });
    this.stream = new THREE.Points(pointsGeometry(pos, col, sz, { aEnd: { array: end, size: 3 }, aSeed: { array: seed, size: 1 } }), this.streamMat);
    this.stream.frustumCulled = false;
    this.gSun.add(this.stream);
    this.ir = fresnelShell(4.6, new THREE.Color(1.0, 0.22, 0.08), { power: 2.2, intensity: 0 });
    this.gSun.add(this.ir);
    // Matrjosjka-hjerne: skaller uden om hinanden
    this.shells = [[3.1, 0xffc070, 14], [4.2, 0xff7a3a, 18], [5.5, 0xb8321a, 22]].map(([rad, c, cells], i) => {
      const mat = new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color(c) }, uTime: { value: 0 }, uOpacity: { value: 0 }, uCells: { value: cells } }, vertexShader: VS_SURFACE, fragmentShader: FS_SHELL, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const s = new THREE.Mesh(new THREE.SphereGeometry(rad, 96, 48), mat);
      s.userData.rate = 0.03 * (i % 2 ? -1 : 1) / (i + 1);
      this.gSun.add(s);
      return s;
    });

    // Galaksen med sonder
    const g = generateGalaxy(N(80000), 71, true);
    this.arrSorted = Float32Array.from(g.arrival).sort();
    this.maxArr = this.arrSorted[this.arrSorted.length - 1];
    this.probeMat = pointsMaterial({ size: 1.4, opacity: 0.62, vs: VS_PROBE, uniforms: { uWave: { value: 0 } } });
    const gp = new THREE.Points(pointsGeometry(g.pos, g.col, g.size, { aArr: { array: g.arrival, size: 1 } }), this.probeMat);
    gp.frustumCulled = false;
    this.galInner = new THREE.Group();
    this.galInner.rotation.x = -Math.PI / 2;
    this.galInner.add(gp);
    this.gGal.add(this.galInner);
    const sunMark = glowSprite({ color: new THREE.Color(1, 0.8, 0.5), size: 0.5, intensity: 2, core: 0.05, fall: 8, minPx: 12 });
    sunMark.position.set(g.sun[0], g.sun[1], g.sun[2]);
    this.galInner.add(sunMark);
    this.sunLocal = new THREE.Vector3(...g.sun);

    // Det nåbare univers
    const web = generateWeb({ count: N(70000), R: 46.5, cells: 15, seed: 99 });
    this.reachMat = pointsMaterial({ size: 1.4, fs: FS_WEB, vs: VS_WEB, uniforms: { uRed: { value: 0 }, uReach: { value: 1 }, uReachR: { value: 18 } } });
    const rp = new THREE.Points(pointsGeometry(web.pos, web.col, web.size), this.reachMat);
    rp.frustumCulled = false;
    this.gReach.add(rp);
    this.gReach.add(fresnelShell(18, new THREE.Color(1.0, 0.72, 0.35), { power: 3, intensity: 0.8 }));
    this.gReach.add(fresnelShell(46.5, new THREE.Color(0.35, 0.6, 1.0), { power: 3, intensity: 0.45 }));

    this.lblSun = this.label('Solen', 'here', (v) => v.set(0, 2.5, 0));
    this.lblMerc = this.label('Merkur bliver til solfangere', 'faint', (v) => this.mercury.getWorldPosition(v).add(new THREE.Vector3(0, 0.6, 0)));
    this.lblStart = this.label('Start: Solen', 'here', (v) => this.galInner.localToWorld(v.copy(this.sunLocal)));
    this.lblReach = this.label('Kan nås · ca. 6 % af galakserne', 'here nodot', (v) => v.set(0, 19.5, 0));
    this.lblSee = this.label('Kan ses, men aldrig nås', 'cool nodot', (v) => v.set(0, 48, 0));
    this.lblNight = this.label('Bylys: menneskehedens 19 terawatt', 'here nodot', (v) => v.copy(this.sDir).multiplyScalar(-1.3).add(new THREE.Vector3(0, 0.85, 0)));
  }

  enter() { this.hideLabels(); }
  exit() { hud(''); stopTween(this._bt); }
  setMode(mode, first) {
    this.mode = mode;
    this.hideLabels();
    stopTween(this._bt);
    this.gEarth.visible = mode === 'kardashev';
    this.gSun.visible = mode === 'dyson' || mode === 'brain';
    this.gGal.visible = mode === 'probes';
    this.gReach.visible = mode === 'reach';
    this.shellA = mode === 'brain' ? 1 : 0;
    controls.minDistance = 1.3; controls.maxDistance = 900;
    let pos, target = new THREE.Vector3();
    if (mode === 'kardashev') {
      const p = new THREE.Vector3().crossVectors(this.sDir, new THREE.Vector3(0, 1, 0)).normalize();
      pos = this.sDir.clone().multiplyScalar(-2.3).addScaledVector(p, 1.25).add(new THREE.Vector3(0, 1.0, 0));
      this.lblNight.show = true;
    } else if (mode === 'dyson') {
      pos = new THREE.Vector3(7, 4.5, 15);
      this.lblSun.show = true; this.lblMerc.show = true;
      this.coverage = 0;
      this._bt = tween(14, (k) => { this.coverage = (Math.pow(2, k * 16) - 1) / (Math.pow(2, 16) - 1); }, null, (x) => x);
      hud(`<div class="cell"><div class="big sol" id="hudCov">0 %</div><div class="sub">af Solen dækket</div></div><div class="cell"><div class="big" id="hudPow">0 ×</div><div class="sub">menneskehedens energiforbrug</div></div>`);
    } else if (mode === 'brain') {
      pos = new THREE.Vector3(9, 6, 17);
      this.coverage = 1;
      hud('');
    } else if (mode === 'probes') {
      pos = new THREE.Vector3(-4, 62, 70);
      target = new THREE.Vector3(-6, 0, 0);
      this.lblStart.show = true;
      this.wave = 0;
      this._bt = tween(16, (k) => { this.wave = k * this.maxArr; }, null, (x) => x);
      hud(`<div class="cell"><div class="big sol" id="hudYears">0</div><div class="sub">mio. år efter start</div></div><div class="cell"><div class="big" id="hudPct">0 %</div><div class="sub">af Mælkevejen nået</div></div>`);
    } else {
      pos = new THREE.Vector3(10, 38, 118);
      this.lblReach.show = true; this.lblSee.show = true;
      hud('');
    }
    if (first) cutTo(pos.clone().multiplyScalar(1.6), target);
    flyTo(pos, target, first ? 3.2 : 2.6);
  }
  replay() { this.setMode(this.mode); }

  update(dt, t) {
    if (this.gEarth.visible) this.earth.update(t);
    if (this.gSun.visible) {
      this.sun.update(t);
      const c = this.coverage;
      this.swarmMat.uniforms.uTime.value = t;
      this.swarmMat.uniforms.uBuild.value = c;
      this.sun.glow.material.uniforms.uIntensity.value = 0.8 * (1 - 0.85 * c);
      this.sun.mat.uniforms.uIntensity.value = 1.6 * (1 - 0.5 * c);
      const ma = t * 0.12;
      this.mercury.position.set(Math.cos(ma) * 8, 0.4, -Math.sin(ma) * 8);
      this.mercury.scale.setScalar(0.32 * Math.cbrt(Math.max(0.001, 1 - c)));
      this.mercury.visible = c < 0.995;
      this.mercury.material.uniforms.uSunPos.value.set(0, 0, 0);
      this.streamMat.uniforms.uStart.value.copy(this.mercury.position);
      this.streamMat.uniforms.uTime.value = t;
      this.streamMat.uniforms.uOpacity.value = this.mode === 'dyson' && c > 0.001 && c < 0.99 ? 1 : 0;
      this.ir.material.uniforms.uIntensity.value = 0.9 * c * (this.mode === 'dyson' ? 1 : 0.4);
      this.lblMerc.show = this.mode === 'dyson' && c < 0.95;
      this.shells.forEach((s) => {
        const u = s.material.uniforms;
        u.uTime.value = t;
        u.uOpacity.value = lerp(u.uOpacity.value, this.shellA || 0, 1 - Math.exp(-dt * 1.5));
        s.rotation.y += s.userData.rate * dt;
        s.visible = u.uOpacity.value > 0.01;
      });
      this.swarm.visible = this.mode === 'dyson' || (this.shells[0].material.uniforms.uOpacity.value < 0.6);
      if (this.mode === 'dyson') {
        const a = $('#hudCov'), b = $('#hudPow');
        if (a) a.textContent = `${fmt(c * 100, c < 0.1 ? 2 : 0)} %`;
        if (b) b.innerHTML = `${num(Math.max(c * 2e13, 0), 2)} ×`;
      }
    }
    if (this.gGal.visible) {
      this.probeMat.uniforms.uWave.value = this.wave;
      this.galInner.rotation.z = t * 0.004;
      const a = $('#hudYears'), b = $('#hudPct');
      if (a) a.textContent = fmt(this.wave, 1);
      if (b) {
        const A = this.arrSorted;
        let lo = 0, hi = A.length;
        while (lo < hi) { const mid = (lo + hi) >> 1; if (A[mid] <= this.wave) lo = mid + 1; else hi = mid; }
        b.textContent = `${fmt((lo / A.length) * 100)} %`;
      }
    }
  }
}
