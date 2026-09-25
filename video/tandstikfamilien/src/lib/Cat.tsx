import React from "react";
import { C } from "./theme";

/**
 * Fru Hansen – the family cat and the only one in the house without ADHD.
 * Sits, judges. (0,0) = bottom centre. Around 120px tall at scale 1.
 */
export const Cat: React.FC<{
  x: number;
  y: number;
  scale?: number;
  frame: number;
  look?: "side" | "camera";
  facing?: 1 | -1;
  eyes?: "flat" | "open" | "closed";
  walking?: boolean;
}> = ({ x, y, scale = 1, frame, look = "side", facing = 1, eyes = "flat", walking = false }) => {
  const tail = Math.sin(frame / 9) * 12;
  const d = facing;
  const s = { stroke: C.ink, strokeWidth: 6 / scale, fill: C.paper, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const hx = look === "camera" ? 0 : 18;
  const eye = (cx: number) =>
    eyes === "open" ? (
      <circle cx={cx} cy={-92} r={3.5} fill={C.ink} stroke="none" />
    ) : eyes === "closed" ? (
      <path d={`M${cx - 5} -91 Q${cx} -87 ${cx + 5} -91`} fill="none" />
    ) : (
      // half-closed, unimpressed
      <g>
        <path d={`M${cx - 6} -93 L${cx + 6} -93`} fill="none" />
        <circle cx={cx} cy={-90} r={2.6} fill={C.ink} stroke="none" />
      </g>
    );
  if (walking) {
    const b = Math.sin(frame / 3);
    return (
      <g transform={`translate(${x} ${y}) scale(${scale * d} ${scale})`} {...s}>
        <path d={`M-58 -48 Q-90 ${-80 + tail} -80 ${-104 + tail}`} fill="none" />
        <path d={`M-40 0 L${-44 + b * 8} -34 M-20 0 L${-18 - b * 8} -34 M22 0 L${24 + b * 8} -34 M40 0 L${38 - b * 8} -34`} fill="none" />
        <ellipse cx={0} cy={-50} rx={60} ry={24} />
        <g transform="translate(50 -30)">
          <path d="M-16 -44 L-12 -70 L0 -52 L12 -70 L16 -44" />
          <circle cx={0} cy={-40} r={24} />
          <circle cx={10} cy={-42} r={3} fill={C.ink} stroke="none" />
        </g>
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${scale * d} ${scale})`} {...s}>
      {/* tail */}
      <path d={`M-30 -6 Q-72 -10 -66 ${-40 + tail} Q-62 ${-60 + tail} -52 ${-62 + tail}`} fill="none" />
      {/* body */}
      <path d="M-34 0 Q-44 -46 -18 -70 L18 -70 Q44 -46 34 0 Z" />
      <path d="M-8 0 L-8 -22 M8 0 L8 -22" fill="none" />
      {/* head */}
      <g transform={`translate(${hx * 0.3} 0)`}>
        <path d="M-22 -100 L-20 -128 L-6 -112 M6 -112 L20 -128 L22 -100" />
        <circle cx={0} cy={-92} r={26} />
        {look === "camera" ? (
          <g>
            {eye(-10)}
            {eye(10)}
            <path d="M-4 -80 L0 -77 L4 -80" fill="none" />
            <path d="M-14 -80 L-34 -82 M14 -80 L34 -82" fill="none" strokeWidth={3 / scale} />
          </g>
        ) : (
          <g>
            {eye(10)}
            {eye(21)}
            <path d="M20 -80 L24 -78" fill="none" />
            <path d="M24 -82 L44 -84 M24 -78 L42 -74" fill="none" strokeWidth={3 / scale} />
          </g>
        )}
      </g>
    </g>
  );
};
