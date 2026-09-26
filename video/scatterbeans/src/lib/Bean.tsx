import React from "react";
import { rad } from "./anim";
import { C, LW } from "./theme";

export type Eyes = "open" | "happy" | "closed" | "wide" | "sparkle" | "dizzy" | "half";
export type Mouth = "smile" | "open" | "o" | "wobble" | "grin" | "flat" | "tongue";
export type Who = "bo" | "lise";

// Body: an egg, 160 wide × 190 tall, resting on y=0.
const BODY = "M0 -190 C54 -190 82 -130 82 -80 C82 -30 50 -8 0 -8 C-50 -8 -82 -30 -82 -80 C-82 -130 -54 -190 0 -190 Z";
const SHOULDER_Y = -92;
const ARM = 54;

export type BeanProps = {
  x: number;
  y: number; // ground
  s?: number;
  who: Who;
  facing?: number; // -1 … 1 (0 = straight at camera)
  squash?: number; // 1 = normal, <1 squashed, >1 stretched
  tilt?: number;
  lift?: number; // px above ground (jumping)
  armL?: number; // deg: 0 = down, 90 = sideways, 180 = straight up
  armR?: number;
  eyes?: Eyes;
  mouth?: Mouth;
  walk?: number; // phase in radians, undefined = standing
  holdL?: React.ReactNode;
  holdR?: React.ReactNode;
  dirty?: boolean;
  flat?: boolean; // lying face-down after a trip
  frame?: number;
};

const colors = (who: Who) => (who === "bo" ? { body: C.bo, dark: C.boDark } : { body: C.lise, dark: C.liseDark });

/** Outlined capsule arm from the shoulder; returns hand position. */
const armEnd = (side: -1 | 1, deg: number) => ({
  x: side * 74 + side * Math.sin(rad(deg)) * ARM,
  y: SHOULDER_Y + Math.cos(rad(deg)) * ARM,
});

export const Eye: React.FC<{ x: number; y: number; kind: Eyes; frame?: number; r?: number }> = ({ x, y, kind, frame = 0, r = 1 }) => {
  const st = { stroke: C.line, strokeWidth: 6, strokeLinecap: "round" as const, fill: "none" };
  switch (kind) {
    case "happy":
      return <path d={`M${x - 11 * r} ${y + 4} Q${x} ${y - 12 * r} ${x + 11 * r} ${y + 4}`} {...st} />;
    case "closed":
      return <path d={`M${x - 11 * r} ${y - 2} Q${x} ${y + 9 * r} ${x + 11 * r} ${y - 2}`} {...st} />;
    case "half":
      return (
        <g>
          <ellipse cx={x} cy={y + 3} rx={9 * r} ry={7 * r} fill={C.line} />
          <path d={`M${x - 13 * r} ${y - 2} L${x + 13 * r} ${y - 2}`} {...st} />
        </g>
      );
    case "wide":
      return (
        <g>
          <ellipse cx={x} cy={y} rx={16 * r} ry={19 * r} fill={C.white} stroke={C.line} strokeWidth={5} />
          <circle cx={x} cy={y + 2} r={8 * r} fill={C.line} />
          <circle cx={x - 3} cy={y - 2} r={2.6 * r} fill={C.white} />
        </g>
      );
    case "sparkle": {
      const k = 1 + 0.15 * Math.sin(frame / 2);
      return (
        <path
          transform={`translate(${x} ${y}) scale(${k * r})`}
          d="M0 -18 Q3 -3 18 0 Q3 3 0 18 Q-3 3 -18 0 Q-3 -3 0 -18 Z"
          fill={C.spark}
          stroke={C.line}
          strokeWidth={4}
          strokeLinejoin="round"
        />
      );
    }
    case "dizzy":
      return (
        <path
          transform={`translate(${x} ${y}) rotate(${frame * 25})`}
          d="M0 0 m-2 0 a2 2 0 1 1 4 0 a5 5 0 1 1 -9 0 a8 8 0 1 1 15 0"
          {...st}
          strokeWidth={4}
        />
      );
    default:
      return (
        <g>
          <ellipse cx={x} cy={y} rx={9.5 * r} ry={13 * r} fill={C.line} />
          <circle cx={x - 3 * r} cy={y - 5 * r} r={3.6 * r} fill={C.white} />
        </g>
      );
  }
};

export const MouthShape: React.FC<{ x: number; y: number; kind: Mouth; r?: number }> = ({ x, y, kind, r = 1 }) => {
  const st = { stroke: C.line, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "open":
      return <path d={`M${x - 13 * r} ${y - 3} Q${x} ${y + 22 * r} ${x + 13 * r} ${y - 3} Z`} fill="#C9575A" {...st} />;
    case "tongue":
      return (
        <g>
          <path d={`M${x - 13 * r} ${y - 3} Q${x} ${y + 22 * r} ${x + 13 * r} ${y - 3} Z`} fill="#C9575A" {...st} />
          <ellipse cx={x + 2} cy={y + 9 * r} rx={7 * r} ry={5 * r} fill={C.cheek} />
        </g>
      );
    case "grin":
      return <path d={`M${x - 18 * r} ${y - 4} Q${x} ${y + 24 * r} ${x + 18 * r} ${y - 4} Z`} fill="#C9575A" {...st} />;
    case "o":
      return <ellipse cx={x} cy={y + 3} rx={7 * r} ry={9 * r} fill="#C9575A" {...st} strokeWidth={5} />;
    case "wobble":
      return <path d={`M${x - 14 * r} ${y + 2} q4 -6 7 0 t7 0 t7 0 t7 0`} fill="none" {...st} strokeWidth={5} />;
    case "flat":
      return <path d={`M${x - 10 * r} ${y + 2} L${x + 10 * r} ${y + 2}`} fill="none" {...st} />;
    default:
      return <path d={`M${x - 11 * r} ${y} Q${x} ${y + 12 * r} ${x + 11 * r} ${y}`} fill="none" {...st} />;
  }
};

/** Bo & Lise: small, soft, round, loving – and gloriously clumsy. */
export const Bean: React.FC<BeanProps> = ({
  x, y, s = 1.4, who, facing = 0, squash = 1, tilt = 0, lift = 0, armL = 20, armR = 20,
  eyes = "open", mouth = "smile", walk, holdL, holdR, dirty, flat, frame = 0,
}) => {
  const col = colors(who);
  // walking = little hops
  let bob = 0;
  let fl = 0;
  let fr = 0;
  let sq = squash;
  if (walk !== undefined) {
    const sw = Math.sin(walk);
    bob = Math.abs(sw) * 16;
    fl = Math.max(0, sw) * 12;
    fr = Math.max(0, -sw) * 12;
    sq = squash * (1 + 0.05 * Math.abs(sw) - 0.04);
  }
  const sx = 1 + (1 - sq) * 0.9;
  const fx = facing * 24;
  const hl = armEnd(-1, armL);
  const hr = armEnd(1, armR);
  const armPath = (side: -1 | 1, h: { x: number; y: number }) => `M${side * 66} ${SHOULDER_Y} L${h.x} ${h.y}`;
  const shadowK = Math.max(0.4, 1 - (lift + bob) / 300);

  if (flat) {
    // Face-plant: a squashed pancake bean with feet in the air
    return (
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <ellipse cx={0} cy={4} rx={110} ry={14} fill={C.shadow} />
        <ellipse cx={0} cy={-38} rx={110} ry={42} fill={col.body} stroke={C.line} strokeWidth={LW} />
        <ellipse cx={-96} cy={-70} rx={16} ry={24} fill={col.dark} stroke={C.line} strokeWidth={LW} transform="rotate(-30 -96 -70)" />
        <ellipse cx={-70} cy={-78} rx={16} ry={24} fill={col.dark} stroke={C.line} strokeWidth={LW} transform="rotate(-10 -70 -78)" />
        {who === "bo" && (
          <g transform="translate(90 -20) rotate(20)">
            <circle cx={-16} cy={0} r={15} fill="rgba(255,255,255,0.6)" stroke={C.line} strokeWidth={5} />
            <circle cx={16} cy={0} r={15} fill="rgba(255,255,255,0.6)" stroke={C.line} strokeWidth={5} />
          </g>
        )}
      </g>
    );
  }

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={72 * shadowK} ry={12 * shadowK} fill={C.shadow} />
      <g transform={`translate(0 ${-lift - bob}) rotate(${tilt}) scale(${sx} ${sq})`}>
        {/* feet */}
        <ellipse cx={-34} cy={-6 - fl} rx={25} ry={14} fill={col.dark} stroke={C.line} strokeWidth={LW} />
        <ellipse cx={34} cy={-6 - fr} rx={25} ry={14} fill={col.dark} stroke={C.line} strokeWidth={LW} />
        {/* arms (behind the body) */}
        {([[-1, hl] as const, [1, hr] as const]).map(([side, h]) => (
          <g key={side}>
            <path d={armPath(side, h)} stroke={C.line} strokeWidth={30} strokeLinecap="round" />
            <path d={armPath(side, h)} stroke={col.body} strokeWidth={16} strokeLinecap="round" />
          </g>
        ))}
        {/* hair / features behind body */}
        {who === "lise" && (
          <g>
            <circle cx={0} cy={-200} r={30} fill={col.dark} stroke={C.line} strokeWidth={LW} />
            <path d="M-14 -212 q14 -10 26 4" stroke={C.line} strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d="M-30 -226 L34 -196" stroke={C.line} strokeWidth={15} strokeLinecap="round" />
            <path d="M-30 -226 L34 -196" stroke={C.spark} strokeWidth={7} strokeLinecap="round" />
            <path d="M34 -196 L44 -191" stroke={C.line} strokeWidth={8} strokeLinecap="round" />
          </g>
        )}
        <path d={BODY} fill={col.body} stroke={C.line} strokeWidth={LW} strokeLinejoin="round" />
        {/* belly highlight */}
        <path d="M-50 -150 Q-62 -120 -58 -96" stroke={C.white} strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.55} />
        {who === "bo" && (
          <g>
            {/* one hair curl + glasses parked on the head (they are always there) */}
            <path d="M-6 -188 q-10 -30 14 -34 q18 -2 10 16" stroke={C.line} strokeWidth={6} fill="none" strokeLinecap="round" />
            <g transform={`translate(${fx * 0.4} -186) rotate(-6)`}>
              <circle cx={-20} cy={0} r={17} fill="rgba(255,255,255,0.55)" stroke={C.line} strokeWidth={5} />
              <circle cx={20} cy={0} r={17} fill="rgba(255,255,255,0.55)" stroke={C.line} strokeWidth={5} />
              <path d="M-3 0 L3 0" stroke={C.line} strokeWidth={5} />
            </g>
          </g>
        )}
        {/* face */}
        <ellipse cx={fx - 44} cy={-100} rx={14} ry={8} fill={C.cheek} opacity={0.6} />
        <ellipse cx={fx + 44} cy={-100} rx={14} ry={8} fill={C.cheek} opacity={0.6} />
        <Eye x={fx - 24} y={-122} kind={eyes} frame={frame} />
        <Eye x={fx + 24} y={-122} kind={eyes} frame={frame} />
        <MouthShape x={fx} y={-96} kind={mouth} />
        {dirty && (
          <g fill={C.dirt}>
            <circle cx={-40} cy={-60} r={7} />
            <circle cx={30} cy={-40} r={5} />
            <circle cx={50} cy={-150} r={6} />
            <circle cx={-20} cy={-30} r={4} />
          </g>
        )}
        {/* held props (drawn in front) */}
        {holdL && <g transform={`translate(${hl.x} ${hl.y}) scale(${1 / sx} ${1 / sq})`}>{holdL}</g>}
        {holdR && <g transform={`translate(${hr.x} ${hr.y}) scale(${1 / sx} ${1 / sq})`}>{holdR}</g>}
      </g>
    </g>
  );
};

/** World position of a bean's hand (for pouring streams etc.). */
export const beanHand = (x: number, y: number, s: number, side: -1 | 1, deg: number, lift = 0) => {
  const h = armEnd(side, deg);
  return { x: x + h.x * s, y: y + (h.y - lift) * s };
};
