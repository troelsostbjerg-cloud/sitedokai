import { Easing } from "remotion";
import { clamp01 } from "./anim";

/**
 * Angles in degrees. 0 = straight down (limbs) / straight up (torso).
 * Positive = towards the direction the figure faces.
 * Arms are relative to the torso, forearms/shins relative to their parent.
 * "f" = front limb (nearest the camera), "b" = back limb.
 */
export type Pose = {
  torso: number;
  head: number;
  fUA: number; fFA: number;
  bUA: number; bFA: number;
  fTh: number; fSh: number;
  bTh: number; bSh: number;
  drop: number; // hip lowered by this many px (unscaled)
};

const base: Pose = {
  torso: 0, head: 0,
  fUA: 12, fFA: 10, bUA: -10, bFA: 10,
  fTh: 6, fSh: -4, bTh: -6, bSh: -4,
  drop: 0,
};

const p = (o: Partial<Pose>): Pose => ({ ...base, ...o });

export const POSES = {
  stand: base,
  proud: p({ fUA: 60, fFA: -90, bUA: -60, bFA: 90, torso: -3, head: -10 }), // hands on hips
  reachUp: p({ fUA: 165, fFA: 5, torso: -4, head: -18 }),
  reachFwd: p({ fUA: 80, fFA: 5, torso: 6 }),
  hold: p({ fUA: 35, fFA: 70 }), // front hand in front of chest
  holdBoth: p({ fUA: 35, fFA: 70, bUA: 30, bFA: 75 }),
  pour: p({ fUA: 70, fFA: 25, bUA: 35, bFA: 70, torso: 4 }),
  lookDown: p({ fUA: 30, fFA: 75, head: 25, torso: 6 }),
  pat: p({ fUA: 8, fFA: -30, bUA: -5, bFA: -40, head: 15 }), // patting pockets
  scratch: p({ fUA: 150, fFA: 120, head: 10, bUA: -8 }), // head scratch
  shrug: p({ fUA: 25, fFA: 75, bUA: -20, bFA: 100, head: 12 }),
  point: p({ fUA: 95, fFA: 0, bUA: -8 }),
  pointUp: p({ fUA: 150, fFA: -10 }),
  wave: p({ fUA: 150, fFA: 30 }),
  wave2: p({ fUA: 140, fFA: -20 }),
  cheer: p({ fUA: 160, fFA: 10, bUA: -160, bFA: -10, head: -10 }),
  shock: p({ fUA: 60, fFA: 90, bUA: -60, bFA: -90, torso: -8, head: -10 }),
  kneel: p({ torso: 18, fTh: 80, fSh: -85, bTh: -10, bSh: -85, drop: 55, fUA: 55, fFA: 10, bUA: 40, bFA: 20 }),
  dig: p({ torso: 22, fUA: 70, fFA: 35, bUA: 55, bFA: 40, fTh: 20, fSh: -10, bTh: -15, bSh: -5, drop: 6 }),
  sit: p({ torso: -5, fTh: 90, fSh: -90, bTh: 85, bSh: -90, drop: 55, fUA: 20, fFA: 60, bUA: 10, bFA: 60 }),
  sitArm: p({ torso: -5, fTh: 90, fSh: -90, bTh: 85, bSh: -90, drop: 55, fUA: 20, fFA: 70, bUA: -25, bFA: 20 }),
  lean: p({ torso: -12, head: -10 }),
  think: p({ fUA: 40, fFA: 125, head: -12, bUA: 25, bFA: 90 }),
};

export type PoseName = keyof typeof POSES | "walk" | "run";

export const walkPose = (frame: number, speed = 1, big = 1): Pose => {
  const ph = (frame / 30) * Math.PI * 2 * 1.6 * speed;
  const s = Math.sin(ph);
  const bend = (x: number) => -(8 + 34 * clamp01((1 + Math.cos(x)) / 2));
  return {
    torso: 3 * big,
    head: 0,
    fUA: -24 * s * big, fFA: 18,
    bUA: 24 * s * big, bFA: 18,
    fTh: 26 * s * big, fSh: bend(ph - 0.6),
    bTh: -26 * s * big, bSh: bend(ph + Math.PI - 0.6),
    drop: -4 * Math.abs(Math.cos(ph)),
  };
};

export const resolvePose = (name: PoseName | Pose, frame: number): Pose => {
  if (typeof name !== "string") return name;
  if (name === "walk") return walkPose(frame);
  if (name === "run") return { ...walkPose(frame, 1.8, 1.6), torso: 14 };
  return POSES[name];
};

export const blend = (a: Pose, b: Pose, t: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => (o[k] = a[k] + (b[k] - a[k]) * t));
  return o;
};

/** Pose keyframes: [[frame, pose], ...]. Blends into each new key over `trans` frames. */
export const poseAt = (keys: [number, PoseName | Pose][], frame: number, trans = 9): Pose => {
  let i = 0;
  for (let k = 0; k < keys.length; k++) if (frame >= keys[k][0]) i = k;
  const cur = resolvePose(keys[i][1], frame);
  if (i === 0) return cur;
  const t = (frame - keys[i][0]) / trans;
  if (t >= 1) return cur;
  const prev = resolvePose(keys[i - 1][1], frame);
  return blend(prev, cur, Easing.inOut(Easing.cubic)(clamp01(t)));
};
