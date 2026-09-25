// ============================================================
// 05 · GLSL-byggesten
// Simplex-støj: Ashima Arts / Stefan Gustavson (MIT-licens), webgl-noise.
// ============================================================
const GLSL_NOISE = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v){
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
float fbm3(vec3 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 3; i++){ s += a * snoise(p); p *= 2.03; a *= 0.5; } return s; }
float fbm4(vec3 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ s += a * snoise(p); p *= 2.03; a *= 0.5; } return s; }
float fbm5(vec3 p){ float s = 0.0, a = 0.5; for (int i = 0; i < ${Q.n < 1 ? 4 : 5}; i++){ s += a * snoise(p); p *= 2.03; a *= 0.5; } return s; }
float hash11(float n){ return fract(sin(n) * 43758.5453123); }
`;

// Standard-vertexshader: verdensposition, verdensnormal og objektposition.
const VS_SURFACE = /* glsl */ `
varying vec3 vW; varying vec3 vN; varying vec3 vObj; varying vec2 vUv;
void main(){
  vObj = position; vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vW = w.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}`;

// Punktsky: størrelse i pixels, dæmpes blødt under 1,5 px i stedet for at flimre.
const VS_POINTS = /* glsl */ `
attribute vec3 aColor; attribute float aSize;
uniform float uSize; uniform float uPR; uniform float uAtten; uniform float uMax;
varying vec3 vColor; varying float vB;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float s = aSize * uSize * uPR;
  if (uAtten > 0.0) s *= min(1.0, uAtten / max(-mv.z, 1e-4));
  vB = 1.0;
  if (s < 1.5) { vB = s / 1.5; s = 1.5; }
  gl_PointSize = min(s, uMax * uPR);
  vColor = aColor;
}`;
const FS_POINTS = /* glsl */ `
uniform float uOpacity; varying vec3 vColor; varying float vB;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c) * 4.0;
  float a = exp(-d * 3.2) * (1.0 - smoothstep(0.7, 1.0, d));
  gl_FragColor = vec4(vColor * uOpacity * vB * a, 1.0);
}`;

function pointsMaterial({ size = 2, opacity = 1, atten = 0, max = 24, blending = THREE.AdditiveBlending, vs = VS_POINTS, fs = FS_POINTS, uniforms = {} } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSize: { value: size }, uOpacity: { value: opacity }, uPR: { value: renderer.getPixelRatio() },
      uAtten: { value: atten }, uMax: { value: max }, uTime: { value: 0 }, ...uniforms,
    },
    vertexShader: vs,
    fragmentShader: fs,
    transparent: true,
    depthWrite: false,
    blending,
  });
}

function pointsGeometry(pos, col, size, extra = {}) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  for (const [k, v] of Object.entries(extra)) g.setAttribute(k, new THREE.BufferAttribute(v.array, v.size));
  return g;
}

// Bager en procedurel shader til en tekstur én gang (billigt at sample bagefter).
function bakeTexture(fragmentShader, w, h, uniforms = {}) {
  const rt = new THREE.WebGLRenderTarget(w, h, { depthBuffer: false, generateMipmaps: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, wrapS: THREE.RepeatWrapping });
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader, depthTest: false, depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
  const sc = new THREE.Scene();
  sc.add(quad);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const prev = renderer.getRenderTarget();
  renderer.setRenderTarget(rt);
  renderer.render(sc, cam);
  renderer.setRenderTarget(prev);
  mat.dispose();
  quad.geometry.dispose();
  return rt.texture;
}
