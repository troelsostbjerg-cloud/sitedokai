// ============================================================
// 20 · Himmellegemer: Sol, glød, Jord, Måne, planeter, ringe, stjernehimmel
// ============================================================
const SUN_TINT = new THREE.Color(1.0, 0.82, 0.6);

// ---------- Sol / stjerne ----------
const FS_SUN = /* glsl */ `
uniform float uTime; uniform vec3 uTint; uniform float uIntensity; uniform float uGran; uniform float uSpots;
uniform float uCut; uniform vec3 uCutC; uniform vec3 uCutN1; uniform vec3 uCutN2;
varying vec3 vW; varying vec3 vN; varying vec3 vObj;
${GLSL_NOISE}
void main(){
  if (uCut > 0.5 && dot(vW - uCutC, uCutN1) > 0.0 && dot(vW - uCutC, uCutN2) > 0.0) discard;
  vec3 p = normalize(vObj);
  float t = uTime;
  float g1 = snoise(p * uGran + vec3(0.0, t * 0.05, t * 0.03));
  float g2 = snoise(p * uGran * 2.6 - vec3(t * 0.07, 0.0, t * 0.02));
  float cells = fbm3(p * 2.6 + vec3(t * 0.012));
  float spots = smoothstep(0.62, 0.8, snoise(p * 4.2 + vec3(3.1, 0.0, t * 0.004))) * (1.0 - smoothstep(0.1, 0.5, abs(p.y))) * uSpots;
  vec3 V = normalize(cameraPosition - vW);
  float mu = clamp(dot(normalize(vN), V), 0.0, 1.0);
  float limb = 0.3 + 0.7 * pow(mu, 0.55);
  float k = clamp(0.56 + 0.2 * g1 + 0.1 * g2 + 0.16 * cells, 0.0, 1.0);
  vec3 hot = mix(uTint, vec3(1.0), 0.45);
  vec3 cool = uTint * vec3(1.0, 0.66, 0.4);
  vec3 col = mix(cool, hot, k);
  col = mix(uTint * vec3(1.0, 0.45, 0.18), col, smoothstep(0.0, 0.5, mu));
  col *= limb * (1.0 - 0.55 * spots);
  gl_FragColor = vec4(col * uIntensity, 1.0);
}`;
function sunMaterial({ tint = SUN_TINT, intensity = 3, gran = 16, spots = 1 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uTint: { value: tint.clone() }, uIntensity: { value: intensity }, uGran: { value: gran }, uSpots: { value: spots },
      uCut: { value: 0 }, uCutC: { value: new THREE.Vector3() }, uCutN1: { value: new THREE.Vector3(1, 0, 0) }, uCutN2: { value: new THREE.Vector3(0, 0, 1) },
    },
    vertexShader: VS_SURFACE,
    fragmentShader: FS_SUN,
  });
}

// ---------- Glød (billboard i view-space, med minimum-størrelse i pixels) ----------
const VS_GLOW = /* glsl */ `
uniform float uMinPx; uniform float uViewH;
varying vec2 vUv;
void main(){
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float sx = length(modelMatrix[0].xyz);
  float px = sx * projectionMatrix[1][1] * uViewH * 0.5 / max(-mv.z, 1e-6);
  float k = uMinPx > 0.0 ? max(1.0, uMinPx / max(px, 1e-6)) : 1.0;
  mv.xy += position.xy * sx * k;
  gl_Position = projectionMatrix * mv;
}`;
const FS_GLOW = /* glsl */ `
uniform vec3 uColor; uniform float uIntensity; uniform float uTime; uniform float uRays; uniform float uCore; uniform float uFall;
varying vec2 vUv;
${GLSL_NOISE}
void main(){
  vec2 c = vUv - 0.5;
  float r = length(c) * 2.0;
  float d = max(r - uCore, 0.0);
  float g = exp(-d * uFall) * 0.85 + exp(-d * uFall * 0.28) * 0.12;
  if (uRays > 0.0) {
    float a = atan(c.y, c.x);
    float n = snoise(vec3(cos(a) * 1.8, sin(a) * 1.8, uTime * 0.05)) * 0.6 + snoise(vec3(cos(a) * 5.0, sin(a) * 5.0, uTime * 0.08 + 7.0)) * 0.4;
    g *= 1.0 + n * uRays * smoothstep(uCore, uCore + 0.3, r);
  }
  g *= 1.0 - smoothstep(0.72, 1.0, r);
  gl_FragColor = vec4(uColor * g * uIntensity, 1.0);
}`;
const glowMats = new Set();
function glowSprite({ color = new THREE.Color(1, 0.72, 0.4), size = 8, intensity = 1, rays = 0, core = 0.2, fall = 7, minPx = 0 } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: color.clone() }, uIntensity: { value: intensity }, uTime: { value: 0 }, uRays: { value: rays },
      uCore: { value: core }, uFall: { value: fall }, uMinPx: { value: minPx }, uViewH: { value: innerHeight },
    },
    vertexShader: VS_GLOW,
    fragmentShader: FS_GLOW,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  glowMats.add(mat);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  m.scale.setScalar(size);
  m.frustumCulled = false;
  m.renderOrder = 2;
  return m;
}
resizeHooks.push((w, h) => { for (const m of glowMats) m.uniforms.uViewH.value = h; });

function createSun({ radius = 1, tint = SUN_TINT, intensity = 3, glow = 1, rays = 0.45, minPx = 0, segments = 64 } = {}) {
  const group = new THREE.Group();
  const mat = sunMaterial({ tint, intensity: intensity * 0.5 });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segments, segments / 2), mat);
  mesh.scale.setScalar(radius);
  group.add(mesh);
  const gl = glowSprite({ color: tint.clone().multiplyScalar(1.1), size: radius * 9, intensity: 0.8 * glow, rays, core: 0.2, fall: 6.5, minPx });
  group.add(gl);
  return {
    group, mesh, mat, glow: gl,
    setRadius(r) { mesh.scale.setScalar(r); gl.scale.setScalar(r * 9); },
    update(t) { mat.uniforms.uTime.value = t; gl.material.uniforms.uTime.value = t; },
  };
}

// ---------- Jorden ----------
const FS_EARTH = /* glsl */ `
uniform sampler2D uLand; uniform sampler2D uField; uniform vec3 uSunPos; uniform float uNight; uniform float uHaze;
varying vec3 vW; varying vec3 vN; varying vec3 vObj; varying vec2 vUv;
${GLSL_NOISE}
void main(){
  vec3 p = normalize(vObj);
  float lat = asin(clamp(p.y, -1.0, 1.0));
  float alat = abs(lat) * 57.29578;
  vec4 f = texture2D(uField, vUv);
  float sd = f.r;
  float detail = snoise(p * 40.0) * 0.5 + snoise(p * 95.0) * 0.25;
  float land = smoothstep(0.4, 0.6, texture2D(uLand, vUv).r + detail * 0.12);
  float shelf = smoothstep(0.3, 0.5, sd);
  vec3 ocean = mix(vec3(0.004, 0.02, 0.07), vec3(0.008, 0.075, 0.14), shelf);
  ocean = mix(ocean, vec3(0.018, 0.04, 0.08), smoothstep(45.0, 70.0, alat) * 0.6);
  float n = fbm4(p * 6.0);
  float inland = smoothstep(0.5, 0.85, sd);
  float subtrop = exp(-pow((alat - 24.0) / 9.0, 2.0));
  float arid = clamp(subtrop * (0.3 + 0.95 * inland) + n * 0.25 - 0.08, 0.0, 1.0);
  vec3 lush = vec3(0.022, 0.07, 0.02);
  vec3 temperate = vec3(0.05, 0.085, 0.03);
  vec3 boreal = vec3(0.028, 0.05, 0.03);
  vec3 tundra = vec3(0.1, 0.09, 0.07);
  vec3 desert = mix(vec3(0.38, 0.24, 0.12), vec3(0.56, 0.42, 0.24), n * 0.5 + 0.5);
  vec3 lc = mix(lush, temperate, smoothstep(12.0, 30.0, alat));
  lc = mix(lc, boreal, smoothstep(48.0, 58.0, alat));
  lc = mix(lc, tundra, smoothstep(62.0, 70.0, alat));
  lc = mix(lc, desert, smoothstep(0.35, 0.65, arid));
  lc *= 0.78 + 0.44 * (snoise(p * 24.0) * 0.5 + 0.5);
  float ice = max(f.b, smoothstep(72.0, 79.0, alat));
  lc = mix(lc, vec3(0.72, 0.78, 0.85), ice);
  float si = lat > 0.0 ? (alat - 74.0) / 9.0 : (alat - 64.0) / 8.0;
  float seaIce = clamp(smoothstep(0.45, 0.8, si + snoise(p * 9.0) * 0.25), 0.0, 1.0);
  vec3 sea = mix(ocean, vec3(0.6, 0.66, 0.74), seaIce);
  vec3 alb = mix(sea, lc, land);

  vec3 N = normalize(vN);
  vec3 L = normalize(uSunPos - vW);
  vec3 V = normalize(cameraPosition - vW);
  float ndl = dot(N, L);
  float day = smoothstep(-0.1, 0.25, ndl);
  vec3 col = alb * max(ndl, 0.0) * 2.3 + alb * 0.005;
  col += alb * vec3(1.0, 0.45, 0.2) * exp(-pow(ndl * 5.0 - 0.2, 2.0)) * 0.18;
  vec3 H = normalize(L + V);
  float water = (1.0 - land) * (1.0 - seaIce);
  float spec = pow(max(dot(N, H), 0.0), 90.0) * 1.6 + pow(max(dot(N, H), 0.0), 14.0) * 0.06;
  col += vec3(1.0, 0.85, 0.62) * spec * water * smoothstep(0.0, 0.2, ndl);
  float nightK = 1.0 - smoothstep(-0.2, 0.05, ndl);
  float lights = f.g * land * (0.5 + 0.5 * snoise(p * 160.0)) ;
  col += vec3(1.0, 0.66, 0.3) * pow(max(lights, 0.0), 1.3) * nightK * uNight * 1.5;
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  col = mix(col, vec3(0.3, 0.56, 1.0) * (day * 0.95 + 0.015), fres * uHaze);
  gl_FragColor = vec4(col, 1.0);
}`;
const FS_CLOUDS = /* glsl */ `
uniform vec3 uSunPos; uniform float uTime; uniform float uCover; uniform float uOpacity;
varying vec3 vW; varying vec3 vN; varying vec3 vObj; varying vec2 vUv;
${GLSL_NOISE}
void main(){
  vec3 p = normalize(vObj);
  float a = uTime * 0.004;
  float ca = cos(a), sa = sin(a);
  vec3 q = vec3(ca * p.x - sa * p.z, p.y, sa * p.x + ca * p.z);
  vec3 w = q * 1.7 + 0.45 * vec3(snoise(q * 1.3 + 1.7), snoise(q * 1.3 + 9.2), snoise(q * 1.3 + 4.4));
  float c = fbm5(w * 2.4);
  float la = abs(p.y);
  float band = 0.16 * exp(-pow((p.y - 0.09) / 0.09, 2.0)) + 0.18 * exp(-pow((la - 0.8) / 0.12, 2.0)) - 0.16 * exp(-pow((la - 0.42) / 0.12, 2.0));
  float cov = smoothstep(0.14, 0.62, c + band + uCover);
  vec3 N = normalize(vN);
  vec3 L = normalize(uSunPos - vW);
  float ndl = dot(N, L);
  float lit = smoothstep(-0.12, 0.3, ndl);
  vec3 col = vec3(1.0) * (0.015 + 1.55 * max(ndl, 0.0)) + vec3(1.0, 0.5, 0.25) * exp(-pow(ndl * 5.0, 2.0)) * 0.22;
  gl_FragColor = vec4(col, cov * (0.2 + 0.7 * lit) * 0.85 * uOpacity);
}`;
const VS_ATMO = /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
const FS_ATMO = /* glsl */ `
uniform vec3 uCenter; uniform float uR; uniform float uThick; uniform vec3 uSunPos; uniform float uIntensity; uniform vec3 uDay; uniform vec3 uDusk;
varying vec3 vW;
void main(){
  vec3 rd = normalize(vW - cameraPosition);
  vec3 oc = uCenter - cameraPosition;
  float tca = dot(oc, rd);
  vec3 cp = cameraPosition + rd * tca;
  float d = length(cp - uCenter) / uR;
  float h = clamp((d - 1.0) / uThick, 0.0, 1.0);
  float glow = pow(1.0 - h, 2.4) * step(0.0, tca);
  vec3 nrm = normalize(cp - uCenter);
  float s = dot(nrm, normalize(uSunPos - uCenter));
  float day = smoothstep(-0.3, 0.45, s);
  float dusk = exp(-pow((s - 0.02) * 3.2, 2.0));
  vec3 col = uDay * day * 1.15 + uDusk * dusk * 0.55;
  gl_FragColor = vec4(col * glow * uIntensity, 1.0);
}`;
function atmosphereMesh(radius = 1, thick = 0.075, day = new THREE.Color(0.28, 0.58, 1.0), dusk = new THREE.Color(1.0, 0.42, 0.16), intensity = 1) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uCenter: { value: new THREE.Vector3() }, uR: { value: radius }, uThick: { value: thick }, uSunPos: { value: new THREE.Vector3() },
      uIntensity: { value: intensity }, uDay: { value: day }, uDusk: { value: dusk },
    },
    vertexShader: VS_ATMO, fragmentShader: FS_ATMO,
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(1 + thick, 64, 32), mat);
  m.renderOrder = 1;
  return m;
}
const _wp = new THREE.Vector3(), _ws = new THREE.Vector3();
function createEarth({ segments = 128, clouds = true, night = 1 } = {}) {
  const tex = earthTextures();
  const group = new THREE.Group();
  const spin = new THREE.Group();
  group.add(spin);
  const surfMat = new THREE.ShaderMaterial({
    uniforms: { uLand: { value: tex.land }, uField: { value: tex.field }, uSunPos: { value: new THREE.Vector3() }, uNight: { value: night }, uHaze: { value: 0.55 } },
    vertexShader: VS_SURFACE, fragmentShader: FS_EARTH,
  });
  const surface = new THREE.Mesh(new THREE.SphereGeometry(1, segments, segments / 2), surfMat);
  spin.add(surface);
  let cloudMesh = null;
  if (clouds) {
    const cm = new THREE.ShaderMaterial({
      uniforms: { uSunPos: { value: new THREE.Vector3() }, uTime: { value: 0 }, uCover: { value: 0 }, uOpacity: { value: 1 } },
      vertexShader: VS_SURFACE, fragmentShader: FS_CLOUDS, transparent: true, depthWrite: false,
    });
    cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(1.012, segments, segments / 2), cm);
    spin.add(cloudMesh);
  }
  const atmo = atmosphereMesh(1, 0.075);
  group.add(atmo);
  const sunPos = new THREE.Vector3();
  return {
    group, spin, surface, clouds: cloudMesh, atmo, sunPos,
    setSun(p) { sunPos.copy(p); },
    update(t) {
      surfMat.uniforms.uSunPos.value.copy(sunPos);
      if (cloudMesh) { cloudMesh.material.uniforms.uSunPos.value.copy(sunPos); cloudMesh.material.uniforms.uTime.value = t; }
      group.getWorldPosition(_wp); group.getWorldScale(_ws);
      atmo.material.uniforms.uCenter.value.copy(_wp);
      atmo.material.uniforms.uR.value = _ws.x;
      atmo.material.uniforms.uSunPos.value.copy(sunPos);
    },
  };
}

// ---------- Månen og planeter ----------
const FS_PLANET = /* glsl */ `
uniform int uType; uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform float uSeed; uniform vec3 uSunPos; uniform float uTime; uniform float uSpot;
varying vec3 vW; varying vec3 vN; varying vec3 vObj; varying vec2 vUv;
${GLSL_NOISE}
void main(){
  vec3 p = normalize(vObj);
  float lat = p.y;
  vec3 alb;
  if (uType == 0) {
    float n = fbm4(p * 2.4 + uSeed);
    float cr = snoise(p * 22.0 + uSeed) * 0.5 + snoise(p * 60.0) * 0.3;
    alb = mix(uC1, uC2, smoothstep(-0.15, 0.4, n)) * (0.82 + 0.28 * cr);
  } else if (uType == 1) {
    float n = fbm4(p * 2.5 + uSeed);
    alb = mix(uC1, uC2, smoothstep(-0.05, 0.4, n));
    alb *= 0.82 + 0.22 * snoise(p * 18.0);
    alb = mix(alb, uC3, smoothstep(0.87, 0.93, abs(lat)));
  } else if (uType == 2) {
    float n = fbm4(vec3(p.x * 1.4, p.y * 4.5, p.z * 1.4) + uSeed + vec3(uTime * 0.01, 0.0, 0.0));
    alb = mix(uC1, uC2, n * 0.5 + 0.5);
  } else if (uType == 3) {
    float warp = fbm4(p * vec3(2.0, 7.0, 2.0) + uSeed);
    float b = sin((lat + warp * 0.06) * 26.0 + uSeed);
    float b2 = sin((lat + warp * 0.05) * 63.0 + uSeed * 2.0);
    alb = mix(uC1, uC2, smoothstep(-0.7, 0.7, b));
    alb = mix(alb, uC3, smoothstep(0.5, 1.0, b2) * 0.4);
    if (uSpot > 0.0) {
      float lon = atan(-p.z, p.x) - uTime * 0.02;
      float dl = atan(sin(lon - 0.8), cos(lon - 0.8));
      float s = exp(-pow(dl / 0.2, 2.0) - pow((asin(lat) + 0.38) / 0.08, 2.0));
      alb = mix(alb, vec3(0.55, 0.22, 0.12), s * 0.85);
    }
  } else {
    float b = sin(lat * 14.0 + fbm4(p * 3.0 + uSeed) * 0.9);
    alb = mix(uC1, uC2, b * 0.5 + 0.5);
  }
  vec3 N = normalize(vN);
  vec3 L = normalize(uSunPos - vW);
  vec3 V = normalize(cameraPosition - vW);
  float ndl = dot(N, L);
  float mu = max(dot(N, V), 0.0);
  float limb = uType >= 3 ? (0.55 + 0.45 * pow(mu, 0.5)) : 1.0;
  vec3 col = alb * (max(ndl, 0.0) * 1.9 + 0.006) * limb;
  if (uType >= 2) col += uC3 * pow(1.0 - mu, 3.0) * smoothstep(-0.2, 0.5, ndl) * 0.3;
  gl_FragColor = vec4(col, 1.0);
}`;
const lin = (hex) => new THREE.Color(hex);
function planetMaterial(type, colors, seed = 1, spot = 0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uType: { value: type }, uC1: { value: lin(colors[0]) }, uC2: { value: lin(colors[1]) }, uC3: { value: lin(colors[2]) },
      uSeed: { value: seed }, uSunPos: { value: new THREE.Vector3() }, uTime: { value: 0 }, uSpot: { value: spot },
    },
    vertexShader: VS_SURFACE, fragmentShader: FS_PLANET,
  });
}
function createMoon(radius = 0.27) {
  const mat = planetMaterial(0, [0x9a958e, 0x4f4c49, 0xcfc9bf], 7.3);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), mat);
  mesh.scale.setScalar(radius);
  return { mesh, mat, setSun(p) { mat.uniforms.uSunPos.value.copy(p); } };
}

const FS_RING = /* glsl */ `
uniform vec3 uSunPos; uniform vec3 uPlanetPos; uniform float uPlanetR; uniform int uKind; uniform float uOpacity;
varying vec3 vW; varying vec3 vObj;
void main(){
  float r = length(vObj.xy);
  float dens = 0.0;
  if (uKind == 0) {
    dens += smoothstep(1.24, 1.27, r) * (1.0 - smoothstep(1.51, 1.53, r)) * 0.22;
    dens += smoothstep(1.52, 1.55, r) * (1.0 - smoothstep(1.93, 1.95, r)) * 0.95;
    dens += smoothstep(2.02, 2.04, r) * (1.0 - smoothstep(2.25, 2.27, r)) * 0.62;
    dens *= 1.0 - (smoothstep(2.195, 2.2, r) - smoothstep(2.21, 2.215, r));
    dens *= 0.72 + 0.28 * sin(r * 420.0) * sin(r * 97.0 + 1.0);
  } else {
    for (int i = 0; i < 5; i++) { float rr = 1.64 + float(i) * 0.06; dens += 0.4 * (1.0 - smoothstep(0.0, 0.006, abs(r - rr))); }
    dens += 0.6 * (1.0 - smoothstep(0.0, 0.012, abs(r - 2.0)));
  }
  vec3 L = normalize(uSunPos - vW);
  vec3 oc = vW - uPlanetPos;
  float b = dot(oc, L);
  float h = b * b - (dot(oc, oc) - uPlanetR * uPlanetR);
  float shadow = (h > 0.0 && b < 0.0) ? 0.07 : 1.0;
  vec3 col = uKind == 0 ? mix(vec3(0.5, 0.42, 0.32), vec3(0.8, 0.72, 0.58), smoothstep(1.5, 2.2, r)) : vec3(0.5, 0.6, 0.62);
  gl_FragColor = vec4(col * 1.7 * shadow, clamp(dens, 0.0, 1.0) * uOpacity);
}`;
const VS_RING = /* glsl */ `varying vec3 vW; varying vec3 vObj; void main(){ vObj = position; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`;
function ringMesh(kind) {
  const inner = kind === 0 ? 1.22 : 1.6, outer = kind === 0 ? 2.3 : 2.05;
  const mat = new THREE.ShaderMaterial({
    uniforms: { uSunPos: { value: new THREE.Vector3() }, uPlanetPos: { value: new THREE.Vector3() }, uPlanetR: { value: 1 }, uKind: { value: kind }, uOpacity: { value: 1 } },
    vertexShader: VS_RING, fragmentShader: FS_RING,
    side: THREE.DoubleSide, transparent: true, depthWrite: false,
  });
  const m = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 160, 1), mat);
  m.rotation.x = -Math.PI / 2;
  return m;
}

// ---------- Stjernehimmel (skybox ved "uendelig" afstand) ----------
const VS_SKYPTS = /* glsl */ `
attribute vec3 aColor; attribute float aSize; attribute float aPhase;
uniform float uPR; uniform float uTime;
varying vec3 vColor;
void main(){
  vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0);
  p.z = p.w * 0.99999;
  gl_Position = p;
  float tw = 0.86 + 0.14 * sin(uTime * (0.6 + aPhase) + aPhase * 40.0);
  gl_PointSize = aSize * uPR * tw;
  vColor = aColor;
}`;
const FS_SKYPTS = /* glsl */ `
uniform float uOpacity; varying vec3 vColor;
void main(){ vec2 c = gl_PointCoord - 0.5; float d = dot(c, c) * 4.0; float a = exp(-d * 3.5) * (1.0 - smoothstep(0.7, 1.0, d)); gl_FragColor = vec4(vColor * a * uOpacity, 1.0); }`;
const VS_SKYBAND = /* glsl */ `varying vec3 vDir; void main(){ vDir = position; vec4 p = projectionMatrix * vec4(mat3(viewMatrix) * position, 1.0); p.z = p.w * 0.99998; gl_Position = p; }`;
const FS_SKYBAND_BAKE = /* glsl */ `
uniform vec3 uGC; uniform vec3 uNGP; uniform vec3 uL90;
varying vec2 vUv;
${GLSL_NOISE}
void main(){
  float lon = (vUv.x - 0.5) * 6.2831853, lat = (vUv.y - 0.5) * 3.1415927;
  vec3 d = vec3(cos(lat) * cos(lon), sin(lat), -cos(lat) * sin(lon));
  float b = asin(clamp(dot(d, uNGP), -1.0, 1.0));
  float l = atan(dot(d, uL90), dot(d, uGC));
  float width = 0.2 + 0.16 * exp(-pow(l / 0.9, 2.0));
  float band = exp(-pow(b / width, 2.0));
  float center = 0.35 + 0.65 * exp(-pow(l / 1.1, 2.0));
  float n = fbm4(d * 3.2) * 0.5 + 0.5;
  float n2 = fbm4(d * 9.0 + 3.0) * 0.5 + 0.5;
  float dust = 1.0 - 0.6 * exp(-pow(b / 0.045, 2.0)) * smoothstep(0.35, 0.7, n2) * exp(-pow(l / 1.6, 2.0));
  float v = band * center * (0.45 + 0.75 * n) * dust;
  vec3 col = mix(vec3(0.55, 0.62, 0.9), vec3(1.0, 0.86, 0.66), center * 0.8);
  gl_FragColor = vec4(col * v, 1.0);
}`;
const FS_SKYBAND = /* glsl */ `
uniform sampler2D uTex; uniform float uOpacity;
varying vec3 vDir;
void main(){
  vec3 d = normalize(vDir);
  vec2 uv = vec2(atan(-d.z, d.x) / 6.2831853 + 0.5, asin(clamp(d.y, -1.0, 1.0)) / 3.1415927 + 0.5);
  gl_FragColor = vec4(texture2D(uTex, uv).rgb * 0.085 * uOpacity, 1.0);
}`;
function createSky() {
  const count = N(7500);
  const r = rng(11);
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3), size = new Float32Array(count), phase = new Float32Array(count);
  const GC = galToThree([1, 0, 0]), NGP = galToThree([0, 0, 1]), L90 = galToThree([0, 1, 0]);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    if (r() < 0.45) {
      const l = r() < 0.4 ? gauss(r) * 50 * DEG : r() * Math.PI * 2;
      const b = gauss(r) * 11 * DEG;
      v.copy(GC).multiplyScalar(Math.cos(b) * Math.cos(l)).addScaledVector(L90, Math.cos(b) * Math.sin(l)).addScaledVector(NGP, Math.sin(b));
    } else {
      const z = r() * 2 - 1, t = r() * Math.PI * 2, s = Math.sqrt(1 - z * z);
      v.set(s * Math.cos(t), z, s * Math.sin(t));
    }
    v.normalize().toArray(pos, i * 3);
    const u = r();
    const T = u < 0.22 ? 3000 + r() * 1000 : u < 0.72 ? 4200 + r() * 1900 : 6200 + r() * 9000;
    const c = kelvinRGB(T, 0.25);
    const mag = Math.pow(r(), 5.5);
    const b = 0.35 + mag * 1.9;
    col[i * 3] = c[0] * b; col[i * 3 + 1] = c[1] * b; col[i * 3 + 2] = c[2] * b;
    size[i] = 1.1 + mag * 3.4;
    phase[i] = r();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uPR: { value: renderer.getPixelRatio() }, uTime: { value: 0 }, uOpacity: { value: 1 } },
    vertexShader: VS_SKYPTS, fragmentShader: FS_SKYPTS,
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(g, mat);
  stars.frustumCulled = false;
  stars.renderOrder = -10;
  const bandTex = bakeTexture(FS_SKYBAND_BAKE, 1024, 512, { uGC: { value: GC }, uNGP: { value: NGP }, uL90: { value: L90 } });
  const bandMat = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: bandTex }, uOpacity: { value: 1 } },
    vertexShader: VS_SKYBAND, fragmentShader: FS_SKYBAND,
    side: THREE.BackSide, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  });
  const band = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), bandMat);
  band.frustumCulled = false;
  band.renderOrder = -11;
  scene.add(band, stars);
  return { stars, band, target: [1, 1], cur: [1, 1] };
}

// ---------- Hjælpere ----------
function fresnelShell(radius, color, { power = 2.5, intensity = 1, side = THREE.FrontSide, segments = 64 } = {}) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color.clone() }, uPower: { value: power }, uIntensity: { value: intensity } },
    vertexShader: VS_SURFACE,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uPower; uniform float uIntensity;
      varying vec3 vW; varying vec3 vN; varying vec3 vObj; varying vec2 vUv;
      void main(){
        vec3 V = normalize(cameraPosition - vW);
        float f = pow(1.0 - abs(dot(normalize(vN), V)), uPower);
        gl_FragColor = vec4(uColor * f * uIntensity, 1.0);
      }`,
    side, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, segments, segments / 2), mat);
  m.scale.setScalar(radius);
  return m;
}
function lineFromPoints(points, color, opacity = 0.4, loop = false) {
  const g = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending });
  return loop ? new THREE.LineLoop(g, mat) : new THREE.Line(g, mat);
}
function circlePoints(radius, n = 128, normal = new THREE.Vector3(0, 1, 0)) {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal.clone().normalize());
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius).applyQuaternion(q));
  }
  return pts;
}
