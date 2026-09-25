// ============================================================
// 00 · Kerne: three.js, renderer, kamera, tweens, labels, verdener
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = (s, r = document) => r.querySelector(s);
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const DEG = Math.PI / 180;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (r) => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); };

// ---------- Talformat på dansk ----------
const nfCache = new Map();
function fmt(n, d = 0) {
  let f = nfCache.get(d);
  if (!f) { f = new Intl.NumberFormat('da-DK', { minimumFractionDigits: d, maximumFractionDigits: d }); nfCache.set(d, f); }
  return f.format(n);
}
const minus = (n) => (n < 0 ? '−' + Math.abs(n) : String(n));
const pow10 = (e) => `10<sup>${minus(e)}</sup>`;
// Et tal som læsbar dansk tekst (HTML). Store og små tal får 10-potens.
function num(v, sig = 2) {
  if (!isFinite(v)) return '∞';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e6 || a < 1e-3) {
    const e = Math.floor(Math.log10(a));
    const m = v / Math.pow(10, e);
    const ms = fmt(m, sig - 1);
    return ms === '1' || ms === '1,0' ? pow10(e) : `${ms} × ${pow10(e)}`;
  }
  const d = a >= 100 ? 0 : a >= 10 ? Math.max(0, sig - 2) : a >= 1 ? sig - 1 : Math.min(3, sig + Math.floor(-Math.log10(a)));
  return fmt(v, d);
}
function duration(sec) {
  if (sec < 60) return `${fmt(sec, sec < 10 ? 1 : 0)} s`;
  if (sec < 3600) { const m = Math.floor(sec / 60); return `${m} min ${Math.floor(sec % 60)} s`; }
  if (sec < 86400 * 2) { const h = Math.floor(sec / 3600); return `${h} t ${Math.floor((sec % 3600) / 60)} min`; }
  if (sec < 86400 * 365.25 * 2) return `${fmt(sec / 86400, 1)} døgn`;
  return `${fmt(sec / (86400 * 365.25), 1)} år`;
}
const clock = (sec) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// ---------- Kvalitet ----------
const TOUCH = matchMedia('(pointer: coarse)').matches;
const SMALL = Math.min(innerWidth, innerHeight) < 600;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const Q = {
  dpr: Math.min(window.devicePixelRatio || 1, TOUCH ? 1.5 : 2),
  n: TOUCH || SMALL ? 0.55 : 1, // partikel-faktor
};
const N = (x) => Math.max(8, Math.round(x * Q.n));

// ---------- Renderer ----------
const canvas = $('#scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !TOUCH, powerPreference: 'high-performance' });
} catch (err) {
  window.__universeFail?.('Din browser kunne ikke starte WebGL, som 3D-grafikken kræver. Prøv en anden browser, eller slå hardwareacceleration til.');
  throw err;
}
renderer.setPixelRatio(Q.dpr);
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0x010207, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.05, 4000);
camera.position.set(0, 3, 14);

const composer = new EffectComposer(renderer);
composer.setPixelRatio(Q.dpr);
composer.setSize(innerWidth, innerHeight);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.85, 0.5, 0.82);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.rotateSpeed = 0.55;
controls.zoomSpeed = 0.75;
controls.enablePan = false;
let userTouched = false;
controls.addEventListener('start', () => { userTouched = true; controls.autoRotate = false; });

const resizeHooks = [];
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  for (const f of resizeHooks) f(w, h);
}
addEventListener('resize', resize);

// Pixels pr. verdensenhed i en given afstand (til min. skærmstørrelser).
const viewH = () => innerHeight;

// ---------- Tweens ----------
const tweens = new Set();
function tween(dur, update, done, ease = easeInOut) {
  const tw = { t: 0, dur: Math.max(dur, 0.0001), update, done, ease };
  tweens.add(tw);
  return tw;
}
function stopTween(tw) { if (tw) tweens.delete(tw); }
function stepTweens(dt) {
  for (const tw of tweens) {
    tw.t += dt;
    const k = clamp(tw.t / tw.dur, 0, 1);
    tw.update(tw.ease(k), k);
    if (k >= 1) { tweens.delete(tw); tw.done && tw.done(); }
  }
}

// Portrætformat (telefon): træk kameraet længere tilbage, så motivet får plads i bredden.
function aspectFactor() {
  if (camera.aspect >= 1 || (activeWorld && activeWorld.id === 'cosmos')) return 1;
  return Math.pow(1 / camera.aspect, 0.6);
}

// Kameraflyvning: retning slerpes, afstand interpoleres logaritmisk.
let camTween = null;
const _q = new THREE.Quaternion(), _qa = new THREE.Quaternion();
function flyTo(pos, target, dur = 2.6, done) {
  stopTween(camTween);
  if (REDUCED) dur = Math.min(dur, 0.35);
  const t0 = controls.target.clone(), t1 = target.clone();
  const o0 = camera.position.clone().sub(t0), o1 = pos.clone().sub(t1).multiplyScalar(aspectFactor());
  const d0 = Math.max(o0.length(), 1e-6), d1 = Math.max(o1.length(), 1e-6);
  const u0 = o0.clone().divideScalar(d0), u1 = o1.clone().divideScalar(d1);
  _q.setFromUnitVectors(u0, u1);
  const q = _q.clone();
  controls.enabled = false;
  camTween = tween(dur, (k) => {
    controls.target.lerpVectors(t0, t1, k);
    _qa.identity().slerp(q, k);
    const d = Math.exp(lerp(Math.log(d0), Math.log(d1), k));
    camera.position.copy(u0).applyQuaternion(_qa).multiplyScalar(d).add(controls.target);
  }, () => { camTween = null; controls.enabled = !uiLockControls; done && done(); });
  return camTween;
}
let uiLockControls = false;
function cutTo(pos, target) {
  stopTween(camTween); camTween = null;
  controls.target.copy(target);
  camera.position.copy(pos).sub(target).multiplyScalar(aspectFactor()).add(target);
  controls.enabled = !uiLockControls;
}

// ---------- Labels (HTML over 3D) ----------
const labelLayer = $('#labels');
const _pv = new THREE.Vector3();
class Label {
  constructor(html, cls = '') {
    this.el = document.createElement('div');
    this.el.className = 'lbl ' + cls;
    this.el.innerHTML = html;
    labelLayer.appendChild(this.el);
    this.pos = new THREE.Vector3();
    this.show = false;
    this.alpha = 1;
    this.getPos = null;
    this.occluded = null;
    this._on = false; this._x = -9; this._y = -9; this._a = -1;
  }
  set(html) { this.el.innerHTML = html; }
  hide() { if (this._on) { this.el.classList.remove('on'); this._on = false; } }
  hit() { this.el.classList.remove('hit'); void this.el.offsetWidth; this.el.classList.add('hit'); }
  update(w, h) {
    if (!this.show || this.alpha < 0.03) return this.hide();
    if (this.getPos) this.getPos(this.pos);
    _pv.copy(this.pos).project(camera);
    if (!(Math.abs(_pv.z) <= 1) || Math.abs(_pv.x) > 1.05 || Math.abs(_pv.y) > 1.05) return this.hide();
    if (this.occluded && this.occluded(this.pos)) return this.hide();
    const x = (_pv.x * 0.5 + 0.5) * w, y = (-_pv.y * 0.5 + 0.5) * h;
    if (!this._on) { this.el.classList.add('on'); this._on = true; }
    if (Math.abs(x - this._x) > 0.25 || Math.abs(y - this._y) > 0.25) {
      this.el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translateY(-50%)`;
      this._x = x; this._y = y;
    }
    const a = clamp(this.alpha, 0, 1);
    if (Math.abs(a - this._a) > 0.01) { this.el.style.opacity = a.toFixed(2); this._a = a; }
  }
}

// ---------- Verdener ----------
class World {
  constructor(id) {
    this.id = id;
    this.group = new THREE.Group();
    this.group.visible = false;
    scene.add(this.group);
    this.labels = [];
    this.built = false;
    this.bloom = [0.85, 0.5, 0.82];
    this.cam = { near: 0.05, far: 4000 };
    this.sky = 1;
    this.skyBand = 1;
    this.exposure = 1.05;
  }
  ensure() { if (!this.built) { this.build(); this.built = true; } }
  build() {}
  enter() {}
  exit() {}
  beat() {}
  update() {}
  label(html, cls, getPos) {
    const l = new Label(html, cls);
    l.getPos = getPos || null;
    this.labels.push(l);
    return l;
  }
  hideLabels() { for (const l of this.labels) { l.show = false; l.hide(); } }
}
