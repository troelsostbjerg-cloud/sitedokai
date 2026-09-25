// ============================================================
// 70 · Brugerflade: navigation, panel, widgets, HUD, skala-skinne
// ============================================================
const W = {};
let activeWorld = null;
let chIdx = 0, beatIdx = 0, navToken = 0, freeMode = false;
const fadeEl = $('#fade');
const currentBeat = () => beatIdx;
function hud(html) { const h = $('#hud'); if (h.innerHTML !== html) h.innerHTML = html; }

// ---------- Verdensskift med overtoning ----------
function setWorld(w, token, cb) {
  if (activeWorld === w) { cb(false); return; }
  const doSwitch = () => {
    if (token !== navToken) return;
    if (activeWorld) { activeWorld.exit(); activeWorld.group.visible = false; activeWorld.hideLabels(); }
    stopTween(camTween); camTween = null;
    controls.enabled = true;
    w.ensure();
    activeWorld = w;
    w.group.visible = true;
    camera.near = w.cam.near; camera.far = w.cam.far; camera.updateProjectionMatrix();
    bloom.strength = w.bloom[0]; bloom.radius = w.bloom[1]; bloom.threshold = w.bloom[2];
    controls.enableZoom = true;
    w.enter();
    cb(true);
    requestAnimationFrame(() => requestAnimationFrame(() => fadeEl.classList.remove('on')));
  };
  if (!activeWorld) { doSwitch(); return; }
  fadeEl.classList.add('on');
  setTimeout(doSwitch, REDUCED ? 40 : 440);
}

function go(ch, bt = 0, opts = {}) {
  ch = clamp(ch, 0, CHAPTERS.length - 1);
  const C = CHAPTERS[ch];
  bt = clamp(bt, 0, C.beats.length - 1);
  const chChanged = ch !== chIdx || opts.force;
  chIdx = ch; beatIdx = bt;
  const token = ++navToken;
  const B = C.beats[bt];
  if (!opts.tour) stopDepthTour();
  stopTween(ageTween);
  closeCard();
  renderNav();
  renderPanel();
  if (chChanged) {
    Sound.mood(ch);
    try { history.replaceState(null, '', '#' + C.id); } catch (e) { /* sandbox */ }
  }
  const w = W[B.world || C.world];
  setWorld(w, token, (first) => {
    if (token !== navToken) return;
    if (w !== W.cosmos) hud('');
    B.enter(first);
    if (w === W.cosmos) hud(W.cosmos.mode === 'time' ? TIME_HUD : COSMOS_HUD);
    setRail(B.scale);
  });
}
function next() {
  const C = CHAPTERS[chIdx];
  if (beatIdx < C.beats.length - 1) go(chIdx, beatIdx + 1);
  else if (chIdx < CHAPTERS.length - 1) go(chIdx + 1, 0);
  else go(0, 0);
}
function prev() {
  if (beatIdx > 0) go(chIdx, beatIdx - 1);
  else if (chIdx > 0) go(chIdx - 1, CHAPTERS[chIdx - 1].beats.length - 1);
}

// ---------- Panel ----------
const scaleText = (s) => (s > 28.5 ? '∞' : `${pow10(Math.round(s))} m`);
function renderPanel(opts = {}) {
  const C = CHAPTERS[chIdx], B = C.beats[beatIdx];
  $('#eyebrow').innerHTML = `<span class="chn">Kapitel ${chIdx + 1} af ${CHAPTERS.length}</span><span>${C.name}</span><span class="sc" id="scaleTag">${scaleText(B.scale)}</span>`;
  $('#beatTitle').innerHTML = B.title;
  $('#beatLead').innerHTML = typeof B.lead === 'function' ? B.lead() : B.lead;
  const ul = $('#facts');
  ul.innerHTML = '';
  const facts = typeof B.facts === 'function' ? B.facts() : B.facts || [];
  for (let f of facts) {
    if (typeof f === 'function') f = f();
    const li = document.createElement('li');
    li.innerHTML = typeof f === 'string' ? `<span>${f}</span>` : `<span class="num">${f.n}</span><span>${f.t}</span>`;
    ul.appendChild(li);
  }
  if (B.note) { const li = document.createElement('li'); li.className = 'note'; li.textContent = B.note; ul.appendChild(li); }
  if (!opts.keepWidget) { const wEl = $('#widget'); wEl.innerHTML = ''; if (B.widget) B.widget(wEl); }
  $('#spec').innerHTML = B.spec ? specHTML(B.spec[0], B.spec[1]) : '';
  hydrateCss($('#spec'));
  const dots = $('#beatDots');
  dots.innerHTML = '';
  C.beats.forEach((b, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'beat-dot';
    d.setAttribute('aria-label', `Trin ${i + 1} af ${C.beats.length}: ${b.title}`);
    if (i === beatIdx) d.setAttribute('aria-current', 'step');
    d.addEventListener('click', () => go(chIdx, i));
    dots.appendChild(d);
  });
  $('#prevBtn').disabled = chIdx === 0 && beatIdx === 0;
  const lastInCh = beatIdx === C.beats.length - 1;
  const last = lastInCh && chIdx === CHAPTERS.length - 1;
  $('#nextBtn').textContent = last ? 'Forfra ↺' : lastInCh ? 'Næste kapitel →' : 'Næste →';
  if (!opts.keepWidget) $('#panelBody').scrollTop = 0;
}
function buildNav() {
  const nav = $('#chapters');
  CHAPTERS.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ch-btn';
    b.innerHTML = `<span class="n">${i + 1}</span><span class="t">${c.short || c.name}</span>`;
    b.setAttribute('aria-label', `Kapitel ${i + 1}: ${c.name}`);
    b.addEventListener('click', () => go(i, 0));
    nav.appendChild(b);
  });
}
function renderNav() {
  [...$('#chapters').children].forEach((b, i) => {
    if (i === chIdx) { b.setAttribute('aria-current', 'step'); b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    else b.removeAttribute('aria-current');
  });
}
function specHTML(level, text) {
  const c = ['#7fd4ff', '#7fd4ff', '#ffb547', '#ff9b6b', '#ff7096'][level - 1];
  return `<div class="spec-top"><span>Spekulationsmåler</span><span class="spec-bars" data-css="--c:${c}" aria-label="${level} af 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= level ? 'on' : ''}"></i>`).join('')}</span></div><div class="spec-txt">${text}</div>`;
}

// ---------- Skala-skinne ----------
const RAIL_TICKS = [[-15, 'atomkerne'], [-10, 'atom'], [0, 'dig'], [7, 'Jorden'], [9, 'Solen'], [13, 'solsystemet'], [16, 'lysår'], [21, 'Mælkevejen'], [24, 'Laniakea'], [27, 'det synlige univers']];
function railY(s) {
  const ss = s > 27.6 ? 27.6 + (2 / Math.PI) * Math.atan((s - 27.6) / 8) * 3.2 : s;
  return ((31 - ss) / 46) * 100;
}
function buildRail() {
  const r = $('#rail');
  r.innerHTML = RAIL_TICKS.map(([s, t]) => `<div class="tick" data-css="top:${railY(s)}%"><span>${t}</span><b>${pow10(s)}</b></div>`).join('') +
    `<div class="tick" data-css="top:${railY(1000)}%"><span>uendeligt</span><b>∞</b></div><div class="mark" id="railMark"></div>`;
  hydrateCss(r);
}
let railS = 11;
function setRail(s) { railS = s; const m = $('#railMark'); if (m) m.style.top = `${railY(s)}%`; }

// ---------- Små byggeklodser ----------
function div(el, cls) { const d = document.createElement('div'); if (cls) d.className = cls; el.appendChild(d); return d; }
function button(el, label, onClick, cls = '') {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chip' + (cls ? ' ' + cls : '');
  b.innerHTML = label;
  b.addEventListener('click', onClick);
  el.appendChild(b);
  return b;
}
function toggleChips(el, items, current, onPick) {
  const row = div(el, 'row');
  const btns = items.map(([label, val]) => {
    const b = button(row, label, () => { btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); onPick(val); });
    b.setAttribute('aria-pressed', String(val === current));
    return b;
  });
  return row;
}
function setRangeFill(inp) { const p = ((inp.value - inp.min) / (inp.max - inp.min)) * 100; inp.style.setProperty('--p', `${p}%`); }
// Stilarter fra genereret markup sættes via CSSOM: sitets CSP tillader ikke style-attributter.
function hydrateCss(root) {
  if (!root) return;
  root.querySelectorAll('[data-css]').forEach((n) => {
    for (const decl of n.dataset.css.split(';')) {
      const i = decl.indexOf(':');
      if (i > 0) n.style.setProperty(decl.slice(0, i).trim(), decl.slice(i + 1).trim());
    }
    n.removeAttribute('data-css');
  });
}

// ---------- Solsystemet: tid og planeter ----------
const DATE_FMT = new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'short', year: 'numeric' });
const sliderToRate = (v) => (v === 0 ? 0 : Math.sign(v) * (Math.pow(10, (Math.abs(v) / 100) * 2.6) - 1));
const rateToSlider = (r) => Math.round(Math.sign(r) * (Math.log10(Math.abs(r) + 1) / 2.6) * 100);
function rateText(r) {
  if (Math.abs(r) < 0.01) return 'Tiden står stille';
  const a = Math.abs(r), sg = r < 0 ? 'baglæns' : 'frem';
  if (a < 60) return `${fmt(a, a < 10 ? 1 : 0)} døgn ${sg} pr. sekund`;
  return `${fmt(a / 365.25, 1)} år ${sg} pr. sekund`;
}
function timeControls(el) {
  const f = div(el, 'field');
  f.innerHTML = `<label for="timeRate">Tidens gang</label><input type="range" id="timeRate" min="-100" max="100" step="1"><div class="readout"><span>Dato: <b id="simDate"></b></span><span id="rateTxt"></span></div>`;
  const inp = f.querySelector('input');
  inp.value = rateToSlider(W.solar.rate);
  const upd = () => { W.solar.rate = sliderToRate(+inp.value); W.solar.follow = null; $('#rateTxt').textContent = rateText(W.solar.rate); setRangeFill(inp); };
  inp.addEventListener('input', upd);
  syncRateSlider();
  const row = div(el, 'row');
  button(row, 'I dag', () => { W.solar.days = 0; inp.value = 0; upd(); });
  button(row, 'Et år frem pr. sekund', () => { inp.value = rateToSlider(365.25); upd(); });
}
function syncRateSlider() {
  const inp = $('#timeRate');
  if (!inp) return;
  inp.value = rateToSlider(W.solar.rate);
  setRangeFill(inp);
  const t = $('#rateTxt'); if (t) t.textContent = rateText(W.solar.rate);
}
function planetChips(el) {
  const f = div(el, 'field');
  f.innerHTML = '<label>Besøg en planet</label>';
  const row = div(f, 'row');
  for (const d of PLANETS) button(row, d.name, () => focusPlanet(d.id));
}
function focusPlanet(id) {
  const S = W.solar;
  if (activeWorld !== S || !S.bodies) return;
  const b = S.bodies.find((x) => x.def.id === id);
  if (!b) return;
  showPlanetCard(b.def);
  if (S.morph > 0.5 || S.travel) return;
  S.rate = 0;
  syncRateSlider();
  S.placeBodies(0);
  const R = S.radiusOf(b);
  const dir = camera.position.clone().sub(b.pos).normalize().add(new THREE.Vector3(0, 0.35, 0)).normalize();
  const dist = R * (b.def.rings !== undefined ? 9 : 6.5) + 0.25;
  flyTo(b.pos.clone().addScaledVector(dir, dist), b.pos.clone(), 2.2, () => { S.follow = b; });
}
function showPlanetCard(def) {
  const c = $('#infoCard');
  c.innerHTML = `<button type="button" class="icon-btn x" aria-label="Luk">×</button><h3>${def.name}</h3><div class="stat-grid">${def.facts.map(([k, v]) => `<div class="stat"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('')}</div><p>${def.note}</p>`;
  c.hidden = false;
  c.querySelector('.x').addEventListener('click', closeCard);
}
function closeCard() { const c = $('#infoCard'); if (c) c.hidden = true; if (W.solar) W.solar.follow = null; }

// ---------- Lysets rejse ----------
let lightMul = 500;
const lightSpeedFactor = () => lightMul;
const kmText = (km) => (km < 1e6 ? `${fmt(km)} km` : km < 1e9 ? `${fmt(km / 1e6, 1)} mio. km` : `${fmt(km / 1e9, 2)} mia. km`);
function lightControls(el) {
  const f = div(el, 'field');
  f.innerHTML = '<label>Tidsforstørrelse</label>';
  toggleChips(f, [['× 1 (ægte tid)', 1], ['× 500', 500], ['× 20.000', 20000]], lightMul, (v) => { lightMul = v; });
  const row = div(el, 'row');
  button(row, 'Send en ny lysstråle', () => startLight(), 'primary');
  const box = div(el, 'field');
  box.innerHTML = '<label>Lyset er nået frem til</label><div class="arrivals" id="arrivals"></div>';
}
function startLight() {
  const S = W.solar;
  if (activeWorld !== S) return;
  const [pos, target] = S.shot('true');
  if (S.pulse && S.pulse.far) flyTo(pos, target, 2.5);
  S.lblVoy.show = false; S.lblHelio.show = false;
  S.startPulse();
  const a = $('#arrivals'); if (a) a.innerHTML = '';
  hud(`<div class="cell"><div class="big sol" id="hudLt">00:00:00</div><div class="sub">siden lyset forlod Solen</div></div><div class="cell"><div class="big" id="hudLd">0 km</div><div class="sub">tilbagelagt</div></div>`);
}
function lightArrived(name, sec) {
  const box = $('#arrivals');
  if (!box) return;
  const r = document.createElement('div');
  r.className = 'readout';
  r.innerHTML = `<span>${name}</span><b>${duration(sec)}</b>`;
  box.appendChild(r);
}
function lightTick(sec, rAU) {
  const a = $('#hudLt'), b = $('#hudLd');
  if (a) a.textContent = sec < 86400 * 3 ? clock(sec) : duration(sec);
  if (b) b.textContent = kmText(rAU * 1.495978707e8);
}

// ---------- Stjerner ----------
const MASS_PRESETS = [['Rød dværg', 0.2], ['Solen', 1], ['15 × Solen', 15], ['30 × Solen', 30]];
const massToV = (M) => Math.round(((Math.log10(M) + 1) / (Math.log10(40) + 1)) * 1000);
const vToMass = (v) => Math.pow(10, lerp(-1, Math.log10(40), v / 1000));
function massControls(el) {
  const f = div(el, 'field');
  f.innerHTML = `<label for="massSlider">Stjernens masse</label><input type="range" id="massSlider" min="0" max="1000" step="1"><div class="stat-grid" id="massStats"></div>`;
  const inp = f.querySelector('input');
  inp.value = massToV(W.stars.mass);
  const upd = () => { W.stars.setMass(vToMass(+inp.value)); massStats(); setRangeFill(inp); };
  inp.addEventListener('input', upd);
  setRangeFill(inp);
  const row = div(el, 'row');
  for (const [label, M] of MASS_PRESETS) button(row, label, () => { inp.value = massToV(M); upd(); W.stars.setMass(M); massStats(); });
  massStats();
}
function massStats() {
  const el = $('#massStats');
  if (!el || !W.stars) return;
  const m = W.stars.model;
  const c = kelvinRGB(m.T, 0.1).map((v) => Math.round(v * 255));
  el.innerHTML = [
    ['Masse', `${fmt(m.M, m.M < 1 ? 2 : m.M < 10 ? 1 : 0)} × Solen`],
    ['Overflade', `<span class="swatch" data-css="color:rgb(${c.join(',')})"></span>${fmt(Math.round(m.T / 100) * 100)} K`],
    ['Lysstyrke', `${num(m.L, 2)} × Solen`],
    ['Levetid', yearsText(m.tMS)],
    ['Ender som', m.fate],
  ].map(([k, v]) => `<div class="stat"><span class="k">${k}</span><span class="v">${v}</span></div>`).join('');
  hydrateCss(el);
}
function lifeControls(el) {
  const f = div(el, 'field');
  f.innerHTML = '<label>Vælg en stjerne</label>';
  toggleChips(f, MASS_PRESETS, MASS_PRESETS.find(([, M]) => Math.abs(M - W.stars.mass) < 1e-6)?.[1], (M) => {
    W.stars.setMass(M);
    renderPanel({ keepWidget: true });
    W.stars.setMode('life');
    renderStages(W.stars.stagesFor(W.stars.model), -1);
    setTimeout(() => { if (activeWorld === W.stars && W.stars.mode === 'life') W.stars.playLife(); }, 1400);
  });
  const row = div(el, 'row');
  button(row, 'Afspil livet', () => W.stars.playLife(), 'primary');
  const list = document.createElement('ol');
  list.className = 'stages';
  list.id = 'stages';
  el.appendChild(list);
  renderStages(W.stars.stagesFor(W.stars.model), -1);
}
function renderStages(stages, i) {
  const el = $('#stages');
  if (!el) return;
  el.innerHTML = stages.map((s, k) => `<li class="${k < i ? 'done' : k === i ? 'now' : ''}"><span>${s.name}</span><span class="t">${s.when}</span></li>`).join('');
}
const ELEMENT_TILES = [
  ['H', 'Brint', 'Big Bang, for 13,8 mia. år siden', '#9ecbff'],
  ['He', 'Helium', 'Big Bang og stjerner', '#ffe08a'],
  ['C', 'Kulstof', 'Døende stjerner som Solen', '#b8bdc7'],
  ['O', 'Ilt', 'Tunge stjerner', '#7fe3ff'],
  ['Ca', 'Calcium', 'Supernovaer', '#cbf27a'],
  ['Fe', 'Jern', 'Supernovaer, også eksploderende hvide dværge', '#ff9a5c'],
  ['Au', 'Guld', 'Kolliderende neutronstjerner (set i 2017)', '#ffd24a'],
];
function elementTiles(el) {
  const g = div(el, 'elements');
  g.innerHTML = ELEMENT_TILES.map(([s, n, t, c]) => `<div class="el" data-css="--c:${c}"><span class="sym">${s}</span><span class="txt"><b>${n}</b>${t}</span></div>`).join('');
  hydrateCss(g);
}

// ---------- Dybden og uendeligheden ----------
const COSMOS_HUD = `<div class="cell"><div class="big" id="hudS"></div><div class="sub" id="hudSL">synsfelt</div></div><div class="cell"><div class="big sol" id="hudPx"></div><div class="sub">Jordens størrelse på skærmen</div></div>`;
const TIME_HUD = `<div class="cell"><div class="big sol" id="hudAge"></div><div class="sub" id="hudEra"></div></div>`;
function lightText(m) {
  const sec = m / C_LIGHT;
  if (sec < 60) return `${num(sec, 2)} lyssekunder`;
  if (sec < 3600) return `${num(sec / 60, 2)} lysminutter`;
  if (sec < 86400) return `${num(sec / 3600, 2)} lystimer`;
  if (sec < 86400 * 365.25) return `${num(sec / 86400, 2)} lysdøgn`;
  const y = sec / (86400 * 365.25);
  if (y < 1e6) return `${num(y, 2)} lysår`;
  if (y < 1e9) return `${fmt(y / 1e6, y < 1e7 ? 1 : 0)} mio. lysår`;
  if (y < 1e12) return `${fmt(y / 1e9, y < 1e10 ? 1 : 0)} mia. lysår`;
  return `${num(y, 2)} lysår`;
}
function earthPxText(s) {
  const px = (1.2742e7 / Math.pow(10, s)) * Math.min(innerWidth, innerHeight);
  if (px >= 1) return fmt(px);
  if (px >= 0.001) return fmt(px, 3);
  return num(px, 1);
}
function depthControls(el) {
  const f = div(el, 'field');
  f.innerHTML = `<label for="depthSlider">Synsfelt (zoom)</label><input type="range" id="depthSlider" min="680" max="2760" step="1"><div class="readout"><span id="depthLight"></span><span>Jorden: <b id="depthEarth"></b> px</span></div>`;
  const inp = f.querySelector('input');
  inp.value = Math.round(W.cosmos.sGoal * 100);
  setRangeFill(inp);
  inp.addEventListener('input', () => {
    stopDepthTour();
    W.cosmos.sAnim = null;
    W.cosmos.sGoal = +inp.value / 100;
    setRangeFill(inp);
    syncDepthStop(W.cosmos.sGoal);
  });
  const row = div(el, 'row');
  const t = button(row, depthTour ? 'Stop turen' : 'Kør hele vejen', () => { if (depthTour) stopDepthTour(); else startDepthTour(); }, 'primary');
  t.id = 'tourBtn';
}
function syncDepthStop(s) {
  if (CHAPTERS[chIdx].id !== 'dybde') return;
  let best = 0, bd = 1e9;
  DEPTH_STOPS.forEach((st, i) => { const d = Math.abs(st.s - s); if (d < bd) { bd = d; best = i; } });
  if (best !== beatIdx) { beatIdx = best; renderPanel({ keepWidget: true }); }
}
function onCosmosUserZoom(s) {
  if (CHAPTERS[chIdx].id === 'dybde') { stopDepthTour(); syncDepthStop(s); }
}
let cosmosUiT = 0;
function onCosmosScale(s) {
  const now = performance.now();
  if (now - cosmosUiT < 90) return;
  cosmosUiT = now;
  setRail(s);
  const tag = $('#scaleTag'); if (tag && CHAPTERS[chIdx].world === 'cosmos') tag.innerHTML = scaleText(s);
  const inp = $('#depthSlider');
  if (inp && document.activeElement !== inp) { inp.value = Math.round(s * 100); setRangeFill(inp); }
  const lt = $('#depthLight'); if (lt) lt.textContent = `≈ ${lightText(Math.pow(10, s))}`;
  const ep = $('#depthEarth'); if (ep) ep.innerHTML = earthPxText(s);
  const ef = $('#earthPxFact'); if (ef) ef.innerHTML = earthPxText(s);
  const hs = $('#hudS');
  if (hs) {
    const e = Math.floor(s), m = Math.pow(10, s - e);
    hs.innerHTML = s < 40 ? `${fmt(m, 1)} × ${pow10(e)} m` : `${pow10(Math.round(s))} m`;
    const sl = $('#hudSL');
    if (sl) sl.innerHTML = s < 28 ? `synsfelt · ≈ ${lightText(Math.pow(10, s))}` : s < 40 ? 'synsfelt · langt ud over det, vi kan se' : 'kopien af dig er stadig 10<sup>10<sup>28</sup></sup> m væk';
    const hp = $('#hudPx'); if (hp) hp.innerHTML = `${earthPxText(s)} px`;
  }
  const ha = $('#hudAge');
  if (ha) {
    const y = W.cosmos.age;
    ha.innerHTML = y <= 10.2 ? '13,8 mia. år' : `${pow10(Math.round(y))} år`;
    $('#hudEra').textContent = y < 14 ? 'Stjernernes tid' : y < 40 ? 'De døde stjerners tid' : y < 100 ? 'De sorte hullers tid' : 'Den mørke tid';
    const at = $('#ageTxt'); if (at) at.innerHTML = ha.innerHTML;
    const ageInp = $('#ageSlider'); if (ageInp && document.activeElement !== ageInp) { ageInp.value = Math.round(y * 100); setRangeFill(ageInp); }
  }
}
let depthTour = null;
function startDepthTour() {
  depthTour = { i: beatIdx, wait: 0 };
  const b = $('#tourBtn'); if (b) b.textContent = 'Stop turen';
  if (Math.abs(W.cosmos.s - DEPTH_STOPS[beatIdx].s) > 0.3) go(4, beatIdx, { tour: true });
}
function stopDepthTour() {
  if (!depthTour) return;
  depthTour = null;
  const b = $('#tourBtn'); if (b) b.textContent = 'Kør hele vejen';
}
function stepDepthTour(dt) {
  if (!depthTour || activeWorld !== W.cosmos || CHAPTERS[chIdx].id !== 'dybde') return;
  if (W.cosmos.sAnim) return;
  depthTour.wait += dt;
  if (depthTour.wait > 3.6) {
    depthTour.wait = 0;
    depthTour.i++;
    if (depthTour.i >= DEPTH_STOPS.length) { stopDepthTour(); return; }
    go(4, depthTour.i, { tour: true });
  }
}
function endlessControls(el) {
  const row = div(el, 'row');
  const b = button(row, 'Stop', () => {
    const A = W.cosmos.auto;
    if (A && !A.paused) { A.paused = true; b.textContent = 'Zoom videre ud'; }
    else startEndless();
  }, 'primary');
  b.id = 'endlessBtn';
  button(row, 'Tilbage til horisonten', () => { W.cosmos.auto = null; const e = $('#endlessBtn'); if (e) e.textContent = 'Zoom videre ud'; W.cosmos.flyToStop(28.6, new THREE.Vector3(0.25, 0.4, 1), 3); });
}
function startEndless() {
  if (activeWorld !== W.cosmos || W.cosmos.mode !== 'endless') return;
  W.cosmos.sAnim = null;
  if (!W.cosmos.auto || W.cosmos.s >= 149) W.cosmos.auto = { until: 150, paused: false };
  W.cosmos.auto.paused = false;
  W.cosmos.sGoal = W.cosmos.s;
  const e = $('#endlessBtn'); if (e) e.textContent = 'Stop';
}
function onEndlessDone() {
  const e = $('#endlessBtn'); if (e) e.textContent = 'Zoom videre ud';
  const sl = $('#hudSL'); if (sl) sl.innerHTML = 'stadig ingen kant · kopien af dig er stadig 10<sup>10<sup>28</sup></sup> m væk';
}
let ageTween = null;
function timeOfUniverseControls(el) {
  const f = div(el, 'field');
  f.innerHTML = `<label for="ageSlider">Universets alder</label><input type="range" id="ageSlider" min="1014" max="11000" step="1"><div class="readout"><span>Alder: <b id="ageTxt">13,8 mia. år</b></span></div>`;
  const inp = f.querySelector('input');
  inp.value = Math.round(W.cosmos.age * 100);
  setRangeFill(inp);
  inp.addEventListener('input', () => { stopTween(ageTween); W.cosmos.age = +inp.value / 100; setRangeFill(inp); });
  const row = div(el, 'row');
  button(row, 'Spol frem til enden', () => {
    stopTween(ageTween);
    const a0 = W.cosmos.age < 109 ? W.cosmos.age : 10.14;
    ageTween = tween(22, (k) => { W.cosmos.age = lerp(a0, 110, k); }, null, (x) => x);
  }, 'primary');
  button(row, 'Tilbage til i dag', () => { stopTween(ageTween); W.cosmos.age = 10.14; });
}

// ---------- ASI ----------
function kardashevGauge(el) {
  const K = 0.727, pct = (k) => (k / 3) * 100;
  el.insertAdjacentHTML('beforeend', `<div class="gauge"><span class="k">Kardashev-skalaen</span><div class="gauge-track"><div class="gauge-fill" data-css="width:${pct(K)}%"></div>${['0', 'I', 'II', 'III'].map((t, i) => `<div class="gauge-tick" data-css="left:${pct(i)}%">${t}</div>`).join('')}<div class="gauge-you" data-css="left:${pct(K)}%"><span>Os: 0,73</span></div></div><div class="gauge-legend"><span>10<sup>6</sup> W</span><span>10<sup>16</sup> W</span><span>10<sup>26</sup> W</span><span>10<sup>36</sup> W</span></div></div>`);
  hydrateCss(el);
}

// ---------- Fri flyvning ----------
let savedDist = null;
function setFree(on) {
  freeMode = on;
  document.body.classList.toggle('free', on);
  $('#freeBtn').setAttribute('aria-pressed', String(on));
  $('#backBtn').hidden = !on;
  if (activeWorld !== W.cosmos) {
    if (on) { savedDist = [controls.minDistance, controls.maxDistance]; controls.minDistance *= 0.25; controls.maxDistance *= 4; controls.enablePan = true; }
    else if (savedDist) { [controls.minDistance, controls.maxDistance] = savedDist; controls.enablePan = false; }
  }
}
