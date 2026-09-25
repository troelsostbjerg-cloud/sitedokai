// ============================================================
// 36 · Verden: Den blå prik
// Kameraet står stille, mens Jorden trækker sig væk, til den er en prik i en solstråle.
// ============================================================
const FS_SUNBEAMS = /* glsl */ `
uniform float uOpacity; uniform float uTime; uniform float uAspect; uniform vec2 uCenter;
varying vec2 vUv;
${GLSL_NOISE}
void main(){
  vec2 p = (vUv - uCenter) * vec2(uAspect, 1.0);
  float ang = 0.3;
  float qx = cos(ang) * p.x - sin(ang) * p.y;
  float b1 = exp(-pow((qx - 0.015) / 0.055, 2.0));
  float b2 = exp(-pow((qx + 0.26) / 0.035, 2.0)) * 0.55;
  float b3 = exp(-pow((qx - 0.34) / 0.028, 2.0)) * 0.4;
  float grain = 0.82 + 0.18 * snoise(vec3(vUv * vec2(500.0 * uAspect, 500.0), floor(uTime * 12.0)));
  vec3 col = vec3(0.62, 0.34, 0.2) * b1 + vec3(0.38, 0.3, 0.44) * b2 + vec3(0.5, 0.36, 0.24) * b3;
  gl_FragColor = vec4(col * grain * uOpacity * 0.42, 1.0);
}`;

class BlueDotWorld extends World {
  constructor() {
    super('bluedot');
    this.bloom = [0.9, 0.5, 0.8];
    this.cam = { near: 0.0005, far: 2000 };
    this.pull = 0;
  }
  build() {
    const earthHelio = planetThree('earth', JD_NOW);
    this.sDir = earthHelio.clone().multiplyScalar(-1).normalize();
    this.earth = createEarth({ segments: TOUCH ? 96 : 144 });
    this.earth.spin.quaternion.copy(earthQuaternion(JD_NOW));
    this.earth.setSun(this.sDir.clone().multiplyScalar(2000));
    this.group.add(this.earth.group);
    this.dot = glowSprite({ color: new THREE.Color(0.45, 0.7, 1.0), size: 0.001, intensity: 0, core: 0.05, fall: 9, minPx: 3.2 });
    this.group.add(this.dot);
    const mat = new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0 }, uTime: { value: 0 }, uAspect: { value: camera.aspect }, uCenter: { value: new THREE.Vector2(0.5, 0.5) } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy * 2.0, 0.0, 1.0); }`,
      fragmentShader: FS_SUNBEAMS, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    });
    this.beams = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    this.beams.frustumCulled = false;
    this.beams.renderOrder = 8;
    this.beams.visible = false;
    this.group.add(this.beams);
    this.lbl = this.label('Jorden', 'cool', (v) => v.set(0, 0, 0));
  }
  fitBeams() {
    const c = new THREE.Vector3(0, 0, 0).project(camera);
    this.beams.material.uniforms.uCenter.value.set(c.x * 0.5 + 0.5, c.y * 0.5 + 0.5);
    this.beams.material.uniforms.uAspect.value = innerWidth / innerHeight;
  }
  enter() { this.hideLabels(); this.beams.visible = true; this.fitBeams(); }
  exit() { this.beams.visible = false; stopTween(this._pt); hud(''); }
  beat(i, first) {
    const p = new THREE.Vector3().crossVectors(this.sDir, new THREE.Vector3(0, 1, 0)).normalize();
    const pos = this.sDir.clone().multiplyScalar(1.6).addScaledVector(p, -2.2).add(new THREE.Vector3(0, 0.9, 0)).normalize().multiplyScalar(3.4);
    cutTo(pos, new THREE.Vector3());
    controls.minDistance = 2; controls.maxDistance = 8;
    this.pull = 0;
    this.lbl.show = false;
    stopTween(this._pt);
    this._pt = tween(REDUCED ? 1 : 10, (k) => { this.pull = k; }, () => { this.lbl.set('Jorden · 0,12 pixel'); this.lbl.show = true; }, (x) => (x < 0.12 ? 0 : easeInOut((x - 0.12) / 0.88)));
  }
  update(dt, t) {
    this.fitBeams();
    const sc = Math.pow(10, -5.2 * this.pull);
    this.earth.group.scale.setScalar(sc);
    this.earth.update(t);
    const px = sc * camera.projectionMatrix.elements[5] * innerHeight * 0.5 / camera.position.length();
    this.earth.group.visible = px > 0.8;
    this.dot.material.uniforms.uIntensity.value = 2.4 * smooth(6, 1.5, px);
    this.beams.material.uniforms.uOpacity.value = smooth(0.55, 0.95, this.pull);
    this.beams.material.uniforms.uTime.value = t;
  }
}
