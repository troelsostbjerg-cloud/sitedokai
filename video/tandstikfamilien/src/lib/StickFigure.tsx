import React from "react";
import { rad } from "./anim";
import { Pose } from "./poses";
import { C, STROKE } from "./theme";

export type Who = "bo" | "lise" | "plain";
export type Mouth = "neutral" | "smile" | "open" | "flat" | "grin" | "o";
export type Look = "side" | "camera";

// Segment lengths (unscaled)
const L = { head: 28, neck: 6, torso: 95, ua: 55, fa: 50, th: 60, sh: 58 };

type Pt = { x: number; y: number };
const add = (a: Pt, b: Pt): Pt => ({ x: a.x + b.x, y: a.y + b.y });
/** Vector of length `len` at angle `deg` from straight down, positive towards facing. */
const limb = (deg: number, len: number, dir: number): Pt => ({
  x: Math.sin(rad(deg)) * len * dir,
  y: Math.cos(rad(deg)) * len,
});

export type Joints = {
  hip: Pt; neck: Pt; head: Pt;
  fShoulder: Pt; fElbow: Pt; fHand: Pt;
  bElbow: Pt; bHand: Pt;
  fKnee: Pt; fFoot: Pt; bKnee: Pt; bFoot: Pt;
};

/** Forward kinematics in unscaled local space; ground (standing feet) at y=0. */
export const solve = (p: Pose, dir: number): Joints => {
  const hip = { x: 0, y: -(L.th + L.sh) + p.drop };
  const spine = { x: Math.sin(rad(p.torso)) * dir, y: -Math.cos(rad(p.torso)) };
  const neck = add(hip, { x: spine.x * L.torso, y: spine.y * L.torso });
  const ha = rad(p.torso + p.head * 0.35);
  const head = add(neck, {
    x: Math.sin(ha) * dir * (L.head + L.neck),
    y: -Math.cos(ha) * (L.head + L.neck),
  });
  const sh = add(neck, { x: spine.x * -8, y: spine.y * -8 });
  const fElbow = add(sh, limb(p.fUA + p.torso, L.ua, dir));
  const fHand = add(fElbow, limb(p.fUA + p.torso + p.fFA, L.fa, dir));
  const bElbow = add(sh, limb(p.bUA + p.torso, L.ua, dir));
  const bHand = add(bElbow, limb(p.bUA + p.torso + p.bFA, L.fa, dir));
  const fKnee = add(hip, limb(p.fTh, L.th, dir));
  const fFoot = add(fKnee, limb(p.fTh + p.fSh, L.sh, dir));
  const bKnee = add(hip, limb(p.bTh, L.th, dir));
  const bFoot = add(bKnee, limb(p.bTh + p.bSh, L.sh, dir));
  return { hip, neck, head, fShoulder: sh, fElbow, fHand, bElbow, bHand, fKnee, fFoot, bKnee, bFoot };
};

const line = (pts: Pt[]) => "M" + pts.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" L");

export type StickFigureProps = {
  x: number;
  y: number; // ground
  scale?: number;
  facing?: 1 | -1;
  pose: Pose;
  who?: Who;
  mouth?: Mouth;
  look?: Look;
  blink?: boolean;
  color?: string;
  holdFront?: React.ReactNode;
  holdBack?: React.ReactNode;
  dirty?: boolean;
  headExtra?: React.ReactNode; // drawn in head-local coords (0,0 = head centre)
};

export const StickFigure: React.FC<StickFigureProps> = ({
  x, y, scale = 1.8, facing = 1, pose, who = "plain", mouth = "neutral",
  look = "side", blink = false, color = C.ink, holdFront, holdBack, dirty, headExtra,
}) => {
  const d = facing;
  const j = solve(pose, d);
  const sw = STROKE / scale;
  const r = L.head;
  const tilt = pose.head * d;

  // Face
  const eyeY = -2;
  const eyes: Pt[] =
    look === "camera"
      ? [{ x: -9, y: eyeY }, { x: 9, y: eyeY }]
      : [{ x: 4 * d, y: eyeY }, { x: 16 * d, y: eyeY }];
  const mx = look === "camera" ? 0 : 11 * d;
  const my = 12;
  const mouthEl = (() => {
    switch (mouth) {
      case "smile":
        return <path d={`M${mx - 7} ${my - 2} Q${mx} ${my + 6} ${mx + 7} ${my - 2}`} />;
      case "grin":
        return <path d={`M${mx - 9} ${my - 3} Q${mx} ${my + 10} ${mx + 9} ${my - 3} Z`} fill={color} />;
      case "open":
        return <ellipse cx={mx} cy={my + 1} rx={5} ry={7} fill={color} stroke="none" />;
      case "o":
        return <circle cx={mx} cy={my} r={4} fill="none" />;
      case "flat":
        return <path d={`M${mx - 7} ${my} L${mx + 7} ${my}`} />;
      default:
        return <path d={`M${mx - 6} ${my} Q${mx} ${my + 2} ${mx + 6} ${my}`} />;
    }
  })();

  // Distinguishing features
  const feature = (() => {
    if (who === "bo") {
      // Messy tuft + glasses pushed up on the head (his signature, and the running gag)
      return (
        <g>
          <path d={`M-6 ${-r + 1} l-8 -14 M2 ${-r} l2 -16 M10 ${-r + 3} l10 -12`} />
          <g transform={`translate(${6 * d} ${-r + 6}) rotate(${-12 * d})`}>
            <circle cx={-9} cy={0} r={8} fill={C.paper} />
            <circle cx={9} cy={0} r={8} fill={C.paper} />
            <path d="M-1 0 L1 0" />
          </g>
        </g>
      );
    }
    if (who === "lise") {
      // Bun on the top/back of the head with a pencil stuck through it
      const bx = -14 * d;
      return (
        <g>
          <circle cx={bx} cy={-r - 6} r={13} fill={C.paper} />
          <path d={`M${bx - 20 * d} ${-r - 22} L${bx + 18 * d} ${-r + 8}`} strokeWidth={sw * 0.8} />
          <path d={`M${-r + 4} -6 Q${-r - 4} 14 ${-r + 2} 26`} transform={`scale(${d} 1)`} />
        </g>
      );
    }
    return null;
  })();

  const stroke = { stroke: color, strokeWidth: sw, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g {...stroke} opacity={1}>
        {/* back limbs */}
        <path d={line([j.hip, j.bKnee, j.bFoot])} />
        <path d={line([j.fShoulder, j.bElbow, j.bHand])} />
        {holdBack && <g transform={`translate(${j.bHand.x} ${j.bHand.y}) scale(${1 / scale})`}>{holdBack}</g>}
        {/* body */}
        <path d={line([j.hip, j.neck])} />
        <path d={line([j.hip, j.fKnee, j.fFoot])} />
        {/* feet */}
        <path d={`M${j.bFoot.x} ${j.bFoot.y} l${9 * d} 0`} />
        <path d={`M${j.fFoot.x} ${j.fFoot.y} l${9 * d} 0`} />
        {/* head */}
        <g transform={`translate(${j.head.x} ${j.head.y}) rotate(${tilt * 0.6})`}>
          <circle r={r} fill={C.paper} />
          {feature}
          {blink ? (
            eyes.map((e, i) => <path key={i} d={`M${e.x - 4} ${e.y} L${e.x + 4} ${e.y}`} />)
          ) : (
            eyes.map((e, i) => <circle key={i} cx={e.x} cy={e.y} r={3.4} fill={color} stroke="none" />)
          )}
          {mouthEl}
          {dirty && (
            <g fill={C.grey} stroke="none">
              <circle cx={-12} cy={10} r={2.5} />
              <circle cx={-4} cy={18} r={2} />
              <circle cx={14 * d} cy={-14} r={2} />
            </g>
          )}
          {headExtra}
        </g>
        {/* front arm last so it sits in front of the body */}
        <path d={line([j.fShoulder, j.fElbow, j.fHand])} />
        {holdFront && <g transform={`translate(${j.fHand.x} ${j.fHand.y}) scale(${1 / scale})`}>{holdFront}</g>}
      </g>
    </g>
  );
};

/** World position of the head top (for bubbles etc.). */
export const headTop = (x: number, y: number, pose: Pose, scale = 1.8, facing: 1 | -1 = 1) => {
  const j = solve(pose, facing);
  return { x: x + j.head.x * scale, y: y + (j.head.y - L.head) * scale };
};
export const handPos = (x: number, y: number, pose: Pose, scale = 1.8, facing: 1 | -1 = 1) => {
  const j = solve(pose, facing);
  return { x: x + j.fHand.x * scale, y: y + j.fHand.y * scale };
};
