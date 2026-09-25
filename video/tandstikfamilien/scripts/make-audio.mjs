// Synthesises all music and sound effects from scratch (no samples, no licences).
// node scripts/make-audio.mjs  →  public/audio/*.wav
import fs from "node:fs";

const SR = 44100;
const out = "public/audio";
fs.mkdirSync(out, { recursive: true });

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

const writeWav = (name, data) => {
  const n = data.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  let peak = 0;
  for (const v of data) peak = Math.max(peak, Math.abs(v));
  const g = peak > 0.95 ? 0.95 / peak : 1;
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, data[i] * g)) * 32767), 44 + i * 2);
  fs.writeFileSync(`${out}/${name}.wav`, buf);
  console.log(name, (n / SR).toFixed(2) + "s");
};

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

/** Karplus–Strong plucked string into `track` at time t. */
const pluck = (track, t, midi, vol = 0.5, decay = 0.994, bright = 0.5) => {
  const f = hz(midi);
  const N = Math.round(SR / f);
  const b = new Float32Array(N);
  let last = 0;
  for (let i = 0; i < N; i++) { const r = rnd(); last = last + bright * (r - last); b[i] = last; }
  const start = Math.round(t * SR);
  const len = Math.min(track.length - start, SR * 1.6);
  for (let i = 0; i < len; i++) {
    const k = i % N;
    const v = b[k];
    b[k] = decay * 0.5 * (b[k] + b[(k + 1) % N]);
    track[start + i] += v * vol;
  }
};

// ---------- Music: a quirky pizzicato bed ----------
{
  const secs = 127;
  const m = new Float32Array(SR * secs);
  const bpm = 112;
  const beat = 60 / bpm;
  // C  Am  F  G  |  C  Em  F  G
  const chords = [
    [48, [60, 64, 67, 72]], [45, [57, 60, 64, 69]], [41, [57, 60, 65, 69]], [43, [55, 59, 62, 67]],
    [48, [60, 64, 67, 72]], [40, [55, 59, 64, 67]], [41, [57, 60, 65, 69]], [43, [55, 59, 62, 67]],
  ];
  const pattern = [0, 2, 1, 3, 2, 1, 3, 2]; // eighth-note arpeggio
  const bars = Math.floor(secs / (beat * 4));
  for (let bar = 0; bar < bars; bar++) {
    const [bass, notes] = chords[bar % chords.length];
    const t0 = bar * beat * 4;
    pluck(m, t0, bass, 0.9, 0.996, 0.35);
    pluck(m, t0 + beat * 2, bass + 7, 0.7, 0.996, 0.35);
    for (let e = 0; e < 8; e++) {
      // leave little holes – ADHD-style skipped beats
      if ((bar % 4 === 3 && e === 5) || (bar % 2 === 1 && e === 7)) continue;
      const swing = e % 2 ? 0.04 : 0;
      pluck(m, t0 + e * beat * 0.5 + swing, notes[pattern[e]] + (bar % 8 >= 4 && e === 6 ? 12 : 0), 0.38, 0.99, 0.7);
    }
    // soft woodblock tick on the off-beats
    for (let q = 0; q < 4; q++) {
      const s = Math.round((t0 + q * beat + beat / 2) * SR);
      for (let i = 0; i < 1200; i++) m[s + i] += Math.sin((2 * Math.PI * 1800 * i) / SR) * Math.exp(-i / 180) * 0.12;
    }
  }
  // fade in/out
  for (let i = 0; i < m.length; i++) {
    const t = i / SR;
    m[i] *= Math.min(1, t / 0.6) * Math.min(1, (secs - t) / 3);
  }
  writeWav("music", m);
}

// ---------- SFX ----------
const make = (secs, fn) => {
  const a = new Float32Array(Math.round(SR * secs));
  for (let i = 0; i < a.length; i++) a[i] = fn(i / SR, i);
  return a;
};
let phase = 0;
const sweep = (secs, f0, f1, vol, shape = (t) => 1) => {
  phase = 0;
  return make(secs, (t) => {
    const f = f0 + (f1 - f0) * (t / secs);
    phase += (2 * Math.PI * f) / SR;
    return Math.sin(phase) * vol * shape(t);
  });
};

writeWav("pop", sweep(0.12, 900, 300, 0.8, (t) => Math.exp(-t * 30)));
writeWav("tick", make(0.08, (t) => Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t * 90) * 0.6));
// cabinet door: wooden knock + tiny creak
{
  const knock = make(0.5, (t) => Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 40) * 0.9 + rnd() * Math.exp(-t * 80) * 0.3);
  phase = 0;
  const creak = make(0.5, (t) => {
    const f = 520 + 180 * Math.sin(t * 20) + 60 * rnd();
    phase += (2 * Math.PI * f) / SR;
    return (phase % (2 * Math.PI) < Math.PI ? 1 : -1) * 0.08 * Math.sin(Math.PI * Math.min(1, t / 0.35)) * (t < 0.35 ? 1 : 0);
  });
  writeWav("door", knock.map((v, i) => v + creak[i]));
}
writeWav("fridge", make(0.5, (t) => (Math.sin(2 * Math.PI * 70 * t) * 0.9 + rnd() * 0.25) * Math.exp(-t * 14)));
writeWav("bonk", sweep(0.45, 420, 90, 0.95, (t) => Math.exp(-t * 7)));
{
  const s = 0.6;
  writeWav("buzz", make(s, (t) => ((t * 6) % 1 < 0.6 ? 1 : 0) * Math.sign(Math.sin(2 * Math.PI * 150 * t)) * 0.35 * Math.exp(-t)));
}
writeWav("rewind", sweep(1.6, 1400, 200, 0.5, (t) => Math.sin(Math.PI * Math.min(1, t / 1.6)) * (0.7 + 0.3 * Math.sin(t * 60))));
{
  // two-note "ding-dong" for the fact card
  const a = make(1.4, (t) => {
    const e1 = Math.exp(-t * 4), t2 = Math.max(0, t - 0.18), e2 = t > 0.18 ? Math.exp(-t2 * 4) : 0;
    return (Math.sin(2 * Math.PI * hz(84) * t) * e1 + Math.sin(2 * Math.PI * hz(88) * t2) * e2) * 0.4;
  });
  writeWav("ding", a);
}
{
  // dust-cloud scramble: filtered noise swell + rattling
  let lp = 0;
  writeWav("whoosh", make(2.2, (t) => {
    const cut = 0.05 + 0.25 * Math.sin(Math.PI * Math.min(1, t / 2.2));
    lp += cut * (rnd() - lp);
    const rattle = (t * 14) % 1 < 0.2 ? rnd() * 0.25 : 0;
    return (lp * 1.6 + rattle) * Math.sin(Math.PI * Math.min(1, t / 2.2));
  }));
}
writeWav("sparkle", (() => {
  const a = new Float32Array(SR * 1.2);
  [84, 88, 91, 96].forEach((n, k) => {
    const s = Math.round(k * 0.08 * SR);
    for (let i = 0; i < SR * 0.8 && s + i < a.length; i++) a[s + i] += Math.sin((2 * Math.PI * hz(n) * i) / SR) * Math.exp(-i / (SR * 0.15)) * 0.3;
  });
  return a;
})());
