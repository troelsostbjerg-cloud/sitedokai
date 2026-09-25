// ============================================================
// 50 · Lyd: en rolig, genereret baggrundsklang (Web Audio). Starter kun på klik.
// ============================================================
const CHORDS = [
  [55, 82.41, 110, 138.59],
  [73.42, 110, 146.83, 185],
  [41.2, 61.74, 82.41, 123.47],
  [69.3, 103.83, 138.59, 164.81],
  [55, 82.41, 123.47, 164.81],
  [49, 73.42, 98, 146.83],
  [65.41, 98, 130.81, 196],
  [55, 82.41, 110, 138.59],
];
const Sound = {
  ctx: null, master: null, oscs: [], on: false, chord: 0,
  init() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    const ctx = (this.ctx = new AC());
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(ctx.destination);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 650; filter.Q.value = 0.6;
    const flfo = ctx.createOscillator(), flg = ctx.createGain();
    flfo.frequency.value = 0.03; flg.gain.value = 220;
    flfo.connect(flg).connect(filter.frequency); flfo.start();
    filter.connect(this.master);
    const delay = ctx.createDelay(2), fb = ctx.createGain(), wet = ctx.createGain();
    delay.delayTime.value = 0.47; fb.gain.value = 0.5; wet.gain.value = 0.4;
    filter.connect(delay); delay.connect(fb).connect(delay); delay.connect(wet).connect(this.master);
    this.filter = filter;
    for (const f of CHORDS[0]) {
      const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.value = 0.16;
      lfo.frequency.value = 0.04 + Math.random() * 0.07; lg.gain.value = 0.07;
      lfo.connect(lg).connect(g.gain);
      o.connect(g).connect(filter);
      o.start(); lfo.start();
      this.oscs.push(o);
    }
    const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099046; b1 = 0.963 * b1 + w * 0.2965164; b2 = 0.57 * b2 + w * 1.0526913;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.05;
    }
    const noise = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
    noise.buffer = buf; noise.loop = true;
    bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 0.7;
    ng.gain.value = 0.22;
    noise.connect(bp).connect(ng).connect(filter);
    noise.start();
    return true;
  },
  toggle() {
    if (!this.ctx && !this.init()) return false;
    this.on = !this.on;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const g = this.master.gain, now = this.ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setTargetAtTime(this.on ? 0.2 : 0, now, 0.8);
    if (this.on) this.mood(this.chord);
    return this.on;
  },
  mood(i) {
    this.chord = i;
    if (!this.ctx || !this.on) return;
    const now = this.ctx.currentTime;
    CHORDS[i % CHORDS.length].forEach((f, k) => this.oscs[k].frequency.setTargetAtTime(f, now, 1.5));
  },
  boom() {
    if (!this.ctx || !this.on) return;
    const ctx = this.ctx, now = ctx.currentTime;
    const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.9));
    const src = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = buf;
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(2400, now); lp.frequency.exponentialRampToValueAtTime(90, now + 3.5);
    g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.9, now + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, now + 4);
    src.connect(lp).connect(g).connect(this.master);
    src.start(now);
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.frequency.setValueAtTime(70, now); o.frequency.exponentialRampToValueAtTime(28, now + 2.5);
    og.gain.setValueAtTime(0.6, now); og.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
    o.connect(og).connect(this.master);
    o.start(now); o.stop(now + 3);
  },
};
