import { Easing, interpolate, spring } from "remotion";
import { FPS } from "./theme";

/** Keyframes: [[frame, value], ...] with ease-in-out between them. */
export const kf = (
  frame: number,
  keys: [number, number][],
  easing: (t: number) => number = Easing.inOut(Easing.cubic),
) => {
  if (keys.length === 1) return keys[0][1];
  return interpolate(
    frame,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
};

/** Step keyframes: holds the latest value (no tween). */
export function step<T>(frame: number, keys: [number, T][]): T {
  let v = keys[0][1];
  for (const [f, val] of keys) if (frame >= f) v = val;
  return v;
}

/** 0 → 1 pop with a little overshoot, starting at `from`. */
export const pop = (frame: number, from: number, damping = 11) =>
  spring({ frame: frame - from, fps: FPS, config: { damping, stiffness: 170, mass: 0.7 } });

/** Visible window with soft in/out, returns 0..1. */
export const windowIn = (frame: number, from: number, to: number, fade = 8) =>
  interpolate(frame, [from, from + fade, to - fade, to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rad = (d: number) => (d * Math.PI) / 180;

/** Deterministic pseudo random. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Cartoon jump: anticipation squash → stretch in the air → squash on landing. */
export const jump = (frame: number, start: number, height: number, air = 24) => {
  const t = frame - start;
  if (t < 0 || t > air + 16) return { lift: 0, squash: 1 };
  if (t < 6) return { lift: 0, squash: 1 - 0.22 * (t / 6) };
  if (t < 6 + air) {
    const u = (t - 6) / air;
    return { lift: height * Math.sin(Math.PI * u), squash: 1 + 0.14 * Math.cos(Math.PI * u) * (u < 0.5 ? 1 : 0.3) };
  }
  const v = (t - 6 - air) / 10;
  return { lift: 0, squash: v >= 1 ? 1 : 0.78 + 0.22 * v + 0.06 * Math.sin(v * Math.PI) };
};

/** Walk phase while a keyframed position is moving, undefined while standing. */
export const walking = (frame: number, xAt: (f: number) => number, speed = 0.55) =>
  Math.abs(xAt(frame + 1) - xAt(frame)) > 0.4 ? frame * speed : undefined;
