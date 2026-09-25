// ============================================================
// 90 · Opstart og hovedløkke
// ============================================================
let sky = null;
let tAll = 0;
let introOn = true;
let lastT = performance.now();
let timeScale = 1;
const perf = { frames: 0, time: 0, dpr: Q.dpr, checks: 0 };

function loop() {
  requestAnimationFrame(loop);
  const nowT = performance.now();
  const real = (nowT - lastT) / 1000;
  const dt = Math.min(real, 0.1) * timeScale;
  lastT = nowT;
  tAll += dt;
  stepTweens(dt);
  stepDepthTour(dt);
  if (activeWorld) activeWorld.update(dt, tAll);
  // Stjernehimmel og Mælkevejsbånd toner efter verdenen.
  if (sky && activeWorld) {
    sky.cur[0] = lerp(sky.cur[0], activeWorld.sky, 1 - Math.exp(-dt * 3));
    sky.cur[1] = lerp(sky.cur[1], activeWorld.skyBand, 1 - Math.exp(-dt * 3));
    sky.stars.material.uniforms.uOpacity.value = sky.cur[0];
    sky.stars.material.uniforms.uTime.value = tAll;
    sky.band.material.uniforms.uOpacity.value = sky.cur[1];
    sky.stars.visible = sky.cur[0] > 0.01;
    sky.band.visible = sky.cur[1] > 0.01;
  }
  for (const m of glowMats) m.uniforms.uTime.value = tAll;
  if (activeWorld === W.solar && W.solar.built) {
    const d = $('#simDate');
    if (d && (perf.frames & 7) === 0) d.textContent = DATE_FMT.format(new Date(NOW.getTime() + W.solar.days * 86400000));
  }
  updateViewShift(dt);
  controls.update();
  camera.updateMatrixWorld();
  scene.updateMatrixWorld();
  if (activeWorld) { const w = innerWidth, h = innerHeight; for (const l of activeWorld.labels) l.update(w, h); }
  composer.render();
  adaptQuality(Math.min(real, 1));
}

// Forskyder billedets optiske centrum, så motivet ligger i det frie område ved siden af (eller over) panelet.
const vshift = { x: 0, y: 0 };
function updateViewShift(dt) {
  const w = innerWidth, h = innerHeight;
  let tx = 0, ty = 0;
  const panel = $('#panel');
  const collapsed = document.body.classList.contains('collapsed');
  if (introOn) {
    if (w > 720) tx = w * 0.14; else ty = h * 0.16;
  } else if (!freeMode && panel) {
    const r = panel.getBoundingClientRect();
    if (w > 720) tx = collapsed ? 0 : (r.right + 8) / 2;
    else ty = h / 2 - (clamp(r.top, 0, h) + 96) / 2;
  }
  const k = 1 - Math.exp(-dt * 4);
  vshift.x = lerp(vshift.x, tx, k);
  vshift.y = lerp(vshift.y, ty, k);
  if (Math.abs(vshift.x) < 0.5 && Math.abs(vshift.y) < 0.5 && !camera.view) return;
  camera.setViewOffset(w, h, -vshift.x, vshift.y, w, h);
}

// Sænker opløsningen, hvis maskinen har svært ved at følge med.
function adaptQuality(dt) {
  perf.frames++;
  perf.time += dt;
  if (perf.frames < 120) return;
  const fps = perf.frames / perf.time;
  perf.frames = 0; perf.time = 0;
  if (document.hidden || introOn) return;
  if (fps < 34 && perf.dpr > 1) {
    perf.dpr = Math.max(1, perf.dpr - 0.25);
    renderer.setPixelRatio(perf.dpr);
    composer.setPixelRatio(perf.dpr);
    resize();
  }
}

// Byg de næste verdener i baggrunden, så kapitelskift går hurtigt.
function prebuild() {
  const order = ['solar', 'atom', 'stars', 'cosmos', 'asi', 'bluedot'];
  let i = 0;
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200));
  const step = () => {
    if (i >= order.length) return;
    const w = W[order[i++]];
    if (!w.built && w !== activeWorld) {
      try {
        w.ensure();
        const vis = w.group.visible;
        w.group.visible = true;
        renderer.compile(scene, camera);
        w.group.visible = vis;
      } catch (e) { console.warn('prebuild', e); }
    }
    idle(step, { timeout: 1500 });
  };
  setTimeout(() => idle(step, { timeout: 1500 }), 1800);
}

function bindUi() {
  $('#nextBtn').addEventListener('click', next);
  $('#prevBtn').addEventListener('click', prev);
  $('#startBtn').addEventListener('click', startJourney);
  $('#freeBtn').addEventListener('click', () => setFree(!freeMode));
  $('#backBtn').addEventListener('click', () => setFree(false));
  $('#soundBtn').addEventListener('click', () => { const on = Sound.toggle(); $('#soundBtn').setAttribute('aria-pressed', String(!!on)); });
  $('#collapseBtn').addEventListener('click', () => {
    const c = document.body.classList.toggle('collapsed');
    $('#collapseBtn').setAttribute('aria-expanded', String(!c));
    $('#collapseBtn').setAttribute('aria-label', c ? 'Vis teksten' : 'Skjul teksten');
    $('#collapseBtn').firstElementChild.textContent = c ? '+' : '−';
  });
  addEventListener('keydown', (e) => {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (introOn && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); startJourney(); return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); if (introOn) startJourney(); else next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); if (!introOn) prev(); }
    else if (e.key === 'f' || e.key === 'F') setFree(!freeMode);
    else if (e.key === 'm' || e.key === 'M') $('#soundBtn').click();
    else if (e.key === 'Escape' && freeMode) setFree(false);
    else if (/^[1-8]$/.test(e.key)) { if (introOn) hideIntro(); go(+e.key - 1, 0); }
  });
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    window.__universeFail?.('Grafikkortet mistede forbindelsen til 3D-scenen. Genindlæs siden for at fortsætte.');
  });
}

function hideIntro() {
  if (!introOn) return;
  introOn = false;
  document.body.classList.remove('intro-on');
  $('#intro').classList.add('gone');
  controls.autoRotate = false;
  setTimeout(() => { const i = $('#intro'); if (i) i.hidden = true; }, 1000);
}
function startJourney() {
  const wasIntro = introOn;
  hideIntro();
  if (!wasIntro) return;
  const hash = (location.hash || '').replace('#', '');
  const idx = CHAPTERS.findIndex((c) => c.id === hash);
  go(idx > 0 ? idx : 0, 0, { force: true });
}

function boot() {
  document.body.classList.add('intro-on');
  scene.add(camera);
  sky = createSky();
  W.sunEarth = new SunEarthWorld();
  W.solar = new SolarWorld();
  W.atom = new AtomWorld();
  W.stars = new StarsWorld();
  W.cosmos = new CosmosWorld();
  W.asi = new AsiWorld();
  W.bluedot = new BlueDotWorld();
  buildNav();
  buildRail();
  bindUi();
  // Introen viser Jorden og Solen, som de står lige nu.
  navToken++;
  setWorld(W.sunEarth, navToken, () => {
    W.sunEarth.introShot();
    setTimeout(() => { if (introOn) { controls.autoRotate = !REDUCED; controls.autoRotateSpeed = 0.5; } }, 4100);
  });
  renderNav();
  renderPanel();
  setRail(11);
  const hash = (location.hash || '').replace('#', '');
  const idx = CHAPTERS.findIndex((c) => c.id === hash);
  if (idx > 0) $('#startBtn').textContent = `Start ved: ${CHAPTERS[idx].name}`;
  loop();
  window.__universeReady = true;
  window.__univers = { go, next, W, CHAPTERS, busy: () => !!camTween || fadeEl.classList.contains('on') || !!(W.cosmos.built && W.cosmos.sAnim), fps: () => perf, setTimeScale: (k) => { timeScale = k; } };
  requestAnimationFrame(() => $('#loading').classList.add('gone'));
  prebuild();
}

try {
  boot();
} catch (err) {
  console.error(err);
  window.__universeFail?.('Noget gik galt under opstarten: ' + (err && err.message ? err.message : err));
}
