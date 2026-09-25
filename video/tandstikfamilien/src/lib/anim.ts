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
