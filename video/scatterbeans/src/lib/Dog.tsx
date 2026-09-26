import React from "react";
import { Eye, Eyes, Mouth, MouthShape } from "./Bean";
import { C, LW } from "./theme";

/**
 * Noodle – the family dog. Also has ADHD: tail on turbo, sees squirrels everywhere,
 * forgets mid-zoomie what he was running towards. (0,0) = ground under the middle.
 */
export const Dog: React.FC<{
  x: number;
  y: number;
  s?: number;
  facing?: 1 | -1;
  frame: number;
  run?: boolean; // legs pattering
  sit?: boolean;
  dig?: boolean;
  spin?: number; // deg rotation (chasing his tail)
  headTilt?: number;
  lift?: number;
  eyes?: Eyes;
  mouth?: Mouth;
  wag?: number; // wag speed multiplier (1 = normal, 3 = turbo)
  hold?: React.ReactNode; // something in the mouth
}> = ({ x, y, s = 1, facing = 1, frame, run, sit, dig, spin = 0, headTilt = 0, lift = 0, eyes = "open", mouth = "tongue", wag = 1.5, hold }) => {
  const st = { stroke: C.line, strokeWidth: LW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const ph = frame * (run ? 1.3 : dig ? 1.6 : 0);
  const legY = (i: number) => (run || dig ? Math.max(0, Math.sin(ph + i * 1.6)) * 14 : 0);
  const bounce = run ? Math.abs(Math.sin(ph)) * 12 : 0;
  const tailA = Math.sin(frame * 0.9 * wag) * 38;
  const earA = run ? Math.sin(frame * 0.8) * 20 : Math.sin(frame * 0.2) * 4;
  const bodyRot = sit ? -24 : dig ? 16 : 0;
  return (
    <g transform={`translate(${x} ${y - lift}) scale(${s * facing} ${s})`}>
      <ellipse cx={0} cy={2} rx={80} ry={12} fill={C.shadow} />
      <g transform={`rotate(${spin} 0 -70)`}>
        <g transform={`translate(0 ${-bounce})`}>
          {/* tail – the fastest thing in the house */}
          <g transform={`rotate(${tailA - 10} -72 -78)`}>
            <path d="M-72 -78 Q-110 -96 -104 -132" fill="none" stroke={C.line} strokeWidth={24} strokeLinecap="round" />
            <path d="M-72 -78 Q-110 -96 -104 -132" fill="none" stroke={C.dog} strokeWidth={11} strokeLinecap="round" />
          </g>
          {/* back legs */}
          <rect x={-58} y={-34 - legY(0)} width={26} height={34} rx={12} fill={C.dogDark} {...st} />
          <rect x={30} y={-34 - legY(2)} width={26} height={34} rx={12} fill={C.dogDark} {...st} />
          <g transform={`rotate(${bodyRot} -40 -40)`}>
            {/* body */}
            <ellipse cx={0} cy={-62} rx={80} ry={50} fill={C.dog} {...st} />
            <ellipse cx={-26} cy={-78} rx={24} ry={16} fill={C.dogDark} opacity={0.7} />
          </g>
          {/* front legs */}
          <rect x={-34} y={-30 - legY(1)} width={26} height={30} rx={12} fill={C.dog} {...st} />
          <rect x={52} y={-30 - legY(3) + (dig ? -Math.abs(Math.sin(ph)) * 16 : 0)} width={26} height={30} rx={12} fill={C.dog} {...st} />
          {/* head */}
          <g transform={`translate(64 ${sit ? -150 : -118}) rotate(${headTilt})`}>
            <g transform={`rotate(${20 + earA} -34 -26)`}>
              <path d="M-34 -26 Q-60 -10 -52 26 Q-40 36 -26 14 Z" fill={C.dogDark} {...st} />
            </g>
            <circle cx={0} cy={0} r={52} fill={C.dog} {...st} />
            {/* collar with a tag */}
            <path d="M-40 34 Q0 62 40 34" fill="none" stroke={C.line} strokeWidth={20} strokeLinecap="round" />
            <path d="M-40 34 Q0 62 40 34" fill="none" stroke={C.accent} strokeWidth={9} strokeLinecap="round" />
            <circle cx={0} cy={60} r={11} fill={C.spark} {...st} strokeWidth={5} />
            <g transform={`rotate(${-20 - earA} 34 -26)`}>
              <path d="M34 -26 Q60 -10 52 26 Q40 36 26 14 Z" fill={C.dogDark} {...st} />
            </g>
            <ellipse cx={-30} cy={14} rx={10} ry={6} fill={C.cheek} opacity={0.6} />
            <ellipse cx={30} cy={14} rx={10} ry={6} fill={C.cheek} opacity={0.6} />
            <Eye x={-17} y={-6} kind={eyes} frame={frame} r={0.9} />
            <Eye x={17} y={-6} kind={eyes} frame={frame} r={0.9} />
            <ellipse cx={0} cy={12} rx={10} ry={7} fill={C.line} />
            {hold ? <g transform="translate(0 30)">{hold}</g> : <MouthShape x={0} y={24} kind={mouth} r={0.8} />}
          </g>
        </g>
      </g>
    </g>
  );
};

/** The squirrel. Noodle's nemesis. Appears in windows. */
export const Squirrel: React.FC<{ x: number; y: number; s?: number; frame: number }> = ({ x, y, s = 1, frame }) => {
  const st = { stroke: C.line, strokeWidth: 6, strokeLinejoin: "round" as const };
  const t = Math.sin(frame / 4) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M-10 0 Q-70 ${-10 + t} -60 -70 Q-50 -110 -20 -90 Q-40 -60 -10 -30 Z`} fill="#C98B5B" {...st} />
      <ellipse cx={10} cy={-24} rx={26} ry={30} fill="#D9A06E" {...st} />
      <circle cx={20} cy={-62} r={20} fill="#D9A06E" {...st} />
      <path d="M8 -80 L10 -96 L20 -82" fill="#D9A06E" {...st} />
      <circle cx={27} cy={-64} r={4} fill={C.line} />
      <ellipse cx={24} cy={-40} rx={9} ry={7} fill="#8B5A2B" {...st} strokeWidth={4} />
    </g>
  );
};
