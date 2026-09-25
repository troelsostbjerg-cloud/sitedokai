// ============================================================
// 32 · Verden: Brintatomet (tomhed helt nede i stoffet)
// 1 enhed = Bohr-radius (53 pm). Kernen (protonen) er ca. 63.000 gange mindre.
// ============================================================
const VS_CLOUD = /* glsl */ `
attribute vec3 aColor; attribute float aSize; attribute float aPhase;
uniform float uPR; uniform float uTime; uniform float uSize;
varying vec3 vColor; varying float vB;
void main(){
  vec3 p = position;
  float w = uTime * (0.8 + aPhase) + aPhase * 30.0;
  p += 0.035 * vec3(sin(w), cos(w * 1.3), sin(w * 0.7 + 1.0)) * length(position);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float fl = 0.55 + 0.45 * sin(uTime * 3.0 * (0.5 + aPhase) + aPhase * 50.0);
  float s = aSize * uSize * uPR;
  vB = fl;
  if (s < 1.5) { vB *= s / 1.5; s = 1.5; }
  gl_PointSize = s;
  vColor = aColor;
}`;
const FS_PROTON = /* glsl */ `
uniform float uTime;
varying vec3 vW; varying vec3 vN; varying vec3 vObj; varying vec2 vUv;
${GLSL_NOISE}
void main(){
  vec3 p = normalize(vObj);
  float n = fbm4(p * 3.0 + vec3(uTime * 0.3));
  vec3 V = normalize(cameraPosition - vW);
  float mu = max(dot(normalize(vN), V), 0.0);
  vec3 col = mix(vec3(1.0, 0.3, 0.2), vec3(1.0, 0.75, 0.35), n * 0.5 + 0.5) * (0.6 + 0.8 * pow(mu, 0.6));
  gl_FragColor = vec4(col * 1.6, 1.0);
}`;

class AtomWorld extends World {
  constructor() {
    super('atom');
    this.bloom = [1.0, 0.6, 0.62];
    this.cam = { near: 0.001, far: 4000 };
    this.sky = 0.15; this.skyBand = 0;
    this.zoom = 0;
  }
  build() {
    const n = N(30000), r = rng(8);
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n), ph = new Float32Array(n);
    const v = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      const rr = -0.5 * Math.log(Math.max(1e-9, r() * r() * r()));
      const z = r() * 2 - 1, t = r() * Math.PI * 2, s = Math.sqrt(1 - z * z);
      v.set(s * Math.cos(t), z, s * Math.sin(t)).multiplyScalar(rr).toArray(pos, i * 3);
      const b = 0.5 + r() * 0.6;
      col.set([0.38 * b, 0.62 * b, 1.0 * b], i * 3);
      sz[i] = 0.8 + r() * 1.3;
      ph[i] = r();
    }
    const geo = pointsGeometry(pos, col, sz, { aPhase: { array: ph, size: 1 } });
    this.cloudMat = pointsMaterial({ size: 1.6, vs: VS_CLOUD });
    this.cloud = new THREE.Points(geo, this.cloudMat);
    this.cloud.frustumCulled = false;
    this.scaler = new THREE.Group();
    this.scaler.add(this.cloud);
    this.group.add(this.scaler);
    this.protonMat = new THREE.ShaderMaterial({ uniforms: { uTime: { value: 0 } }, vertexShader: VS_SURFACE, fragmentShader: FS_PROTON });
    this.proton = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), this.protonMat);
    this.proton.scale.setScalar(1 / 63000);
    this.scaler.add(this.proton);
    this.nucleusGlow = glowSprite({ color: new THREE.Color(1, 0.55, 0.3), size: 0.0001, intensity: 2.2, core: 0.05, fall: 9, minPx: 7 });
    this.group.add(this.nucleusGlow);
    this.lblCloud = this.label('Elektronen · en sky af sandsynlighed', 'cool nodot', (v) => v.set(-2.6, 2.0, 0).multiplyScalar(Math.pow(10, this.zoom)));
    this.lblNuc = this.label('Kernen · en proton', 'here', (v) => v.set(0, 0, 0));
  }
  enter() { this.hideLabels(); }
  exit() { hud(''); stopTween(this._zt); }
  beat(i, first) {
    this.setZoom(0, 0.01);
    const pos = new THREE.Vector3(2.2, 1.6, 6.2), target = new THREE.Vector3(0, 0, 0);
    if (first) cutTo(pos.clone().multiplyScalar(2.2), target);
    flyTo(pos, target, first ? 3 : 2);
    controls.minDistance = 0.8; controls.maxDistance = 40;
    this.lblCloud.show = true; this.lblNuc.show = true;
    hud(`<div class="cell"><div class="big" id="hudZoom">× 1</div><div class="sub">forstørrelse</div></div>`);
  }
  setZoom(z, dur = 7) {
    stopTween(this._zt);
    const z0 = this.zoom;
    this._zt = tween(dur, (k) => {
      this.zoom = lerp(z0, z, k);
      const el = $('#hudZoom');
      if (el) el.textContent = `× ${fmt(Math.round(Math.pow(10, this.zoom)))}`;
    }, null, easeInOut);
  }
  update(dt, t) {
    this.cloudMat.uniforms.uTime.value = t;
    this.protonMat.uniforms.uTime.value = t;
    this.scaler.scale.setScalar(Math.pow(10, this.zoom));
    this.nucleusGlow.material.uniforms.uIntensity.value = 2.2 * (1 - smooth(3.2, 4.2, this.zoom));
    this.cloudMat.uniforms.uOpacity.value = 1 - smooth(1.8, 3.2, this.zoom) * 0.85;
    this.lblCloud.alpha = 1 - smooth(0.6, 1.4, this.zoom);
  }
}
