import React from "react";
import { rad } from "./anim";
import { Squirrel } from "./Dog";
import { C, LW } from "./theme";

const st = { stroke: C.line, strokeWidth: LW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// ---- Vertical kitchen layout (1080×1920) ----
export const FLOOR = 1520;
export const K = {
  upperY0: 880,
  upperY1: 1100,
  upperX0: 40,
  upperW: 200,
  counterTop: 1240,
  counterX0: 30,
  counterX1: 710,
  lowerY0: 1262,
  lowerY1: 1505,
  fridgeX0: 730,
  fridgeX1: 1050,
  fridgeY0: 880,
  machineX: 580,
};
export const cabX = (i: number) => K.upperX0 + i * K.upperW + K.upperW / 2;

/** Hinged door, seen from the front. open: 0 → 1 (≈115°). */
export const Door: React.FC<{ x: number; y: number; w: number; h: number; open: number; hinge: "left" | "right"; fill?: string; knob?: boolean }> = ({
  x, y, w, h, open, hinge, fill = C.mint, knob = true,
}) => {
  const a = rad(open * 115);
  const hx = hinge === "left" ? x : x + w;
  const dir = hinge === "left" ? 1 : -1;
  const fx = hx + Math.cos(a) * w * dir;
  const p = Math.sin(a) * w * 0.14;
  const kx = hx + Math.cos(a) * (w - 30) * dir;
  return (
    <g>
      <path d={`M${hx} ${y} L${fx} ${y - p} L${fx} ${y + h + p} L${hx} ${y + h} Z`} fill={Math.cos(a) < 0 ? C.mintDark : fill} {...st} />
      {knob && Math.cos(a) > 0.2 && <circle cx={kx} cy={y + h / 2} r={9} fill={C.white} {...st} strokeWidth={5} />}
    </g>
  );
};

const Cabinet: React.FC<{ x: number; y: number; w: number; h: number; open: number; hinge?: "left" | "right"; inside?: React.ReactNode }> = ({ x, y, w, h, open, hinge = "left", inside }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill="#8FB8A4" {...st} />
    {open > 0.02 && inside}
    <Door x={x} y={y} w={w} h={h} open={open} hinge={hinge} />
  </g>
);

export const Mug: React.FC<{ fill?: "none" | "milk" | "coffee"; tilt?: number }> = ({ fill = "none", tilt = 0 }) => (
  <g transform={`rotate(${tilt})`}>
    <path d="M24 -30 Q50 -30 48 -10 Q46 8 22 6" fill="none" stroke={C.line} strokeWidth={14} strokeLinecap="round" />
    <path d="M24 -30 Q50 -30 48 -10 Q46 8 22 6" fill="none" stroke="#FF9FB2" strokeWidth={5} strokeLinecap="round" />
    <rect x={-28} y={-44} width={56} height={62} rx={14} fill="#FF9FB2" {...st} />
    {fill !== "none" && <ellipse cx={0} cy={-38} rx={20} ry={5} fill={fill === "milk" ? C.white : "#7A4A2B"} />}
    <circle cx={-6} cy={-14} r={7} fill={C.white} opacity={0.7} />
  </g>
);

/** Glass coffee pot. (0,0) = grip; body to the right. */
export const Pot: React.FC<{ tilt?: number }> = ({ tilt = 0 }) => (
  <g transform={`rotate(${tilt})`}>
    <path d="M8 -30 H78 L86 -18 L70 -16 Q104 14 92 44 Q84 62 46 62 Q8 62 2 44 Q-6 14 22 -16 Z" fill="#EAF6FF" {...st} />
    <path d="M-2 26 Q8 54 46 56 Q84 54 94 26 Z" fill="#7A4A2B" />
    <path d="M-4 -26 Q-26 -20 -24 8 Q-22 30 -2 32" fill="none" stroke={C.line} strokeWidth={12} strokeLinecap="round" />
    <path d="M8 -30 H78 L86 -18 L70 -16 Q104 14 92 44 Q84 62 46 62 Q8 62 2 44 Q-6 14 22 -16 Z" fill="none" {...st} />
  </g>
);

export const Milk: React.FC<{ tilt?: number }> = ({ tilt = 0 }) => (
  <g transform={`rotate(${tilt})`}>
    <path d="M-26 -60 L-26 30 L26 30 L26 -60 L14 -84 L-14 -84 Z" fill={C.white} {...st} />
    <path d="M-26 -60 H26" {...st} fill="none" />
    <rect x={-26} y={-30} width={52} height={32} fill={C.bo} />
    <path d="M-26 -30 H26 M-26 2 H26" {...st} fill="none" strokeWidth={4} />
    <path d="M-26 -60 L-26 30 L26 30 L26 -60 L14 -84 L-14 -84 Z" fill="none" {...st} />
  </g>
);

export const Steam: React.FC<{ x: number; y: number; frame: number; s?: number }> = ({ x, y, frame, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke="#C9B8A6" strokeWidth={7} strokeLinecap="round">
    {[-18, 0, 18].map((ox, i) => {
      const w = Math.sin(frame / 6 + i * 2) * 8;
      const t = ((frame / 40 + i * 0.33) % 1) * 22;
      return <path key={i} d={`M${ox} ${-t} q${w} -18 0 -36 q${-w} -18 0 -36`} opacity={1 - t / 26} />;
    })}
  </g>
);

export const Phone: React.FC<{ frame: number; buzz?: boolean }> = ({ frame, buzz }) => (
  <g transform={`translate(${buzz ? Math.sin(frame * 2.2) * 4 : 0} 0) rotate(-10)`}>
    <rect x={-24} y={-44} width={48} height={84} rx={12} fill={C.line} />
    <rect x={-17} y={-34} width={34} height={60} rx={6} fill={C.sky} />
    <circle cx={0} cy={-8} r={9} fill={C.accent} />
  </g>
);

/** Window between the cabinets – where the squirrel shows up. */
export const SquirrelWindow: React.FC<{ frame: number; squirrel: number }> = ({ frame, squirrel }) => {
  const x = K.upperX0 + 2 * K.upperW + 14;
  const y = K.upperY0 + 10;
  const w = K.upperW - 28;
  const h = K.upperY1 - K.upperY0 - 30;
  return (
    <g>
      <clipPath id="win">
        <rect x={x} y={y} width={w} height={h} rx={24} />
      </clipPath>
      <rect x={x} y={y} width={w} height={h} rx={24} fill={C.sky} />
      <g clipPath="url(#win)">
        <circle cx={x + 40} cy={y + h + 10} r={70} fill={C.grass} />
        <circle cx={x + w - 20} cy={y + h + 20} r={80} fill={C.grassDark} />
        <path d={`M${x} ${y + 120} Q${x + w / 2} ${y + 100} ${x + w} ${y + 130}`} stroke="#9B6B43" strokeWidth={14} fill="none" />
        {squirrel > 0 && <Squirrel x={x + w / 2 - 6} y={y + 124 + (1 - squirrel) * 130} frame={frame} s={0.8} />}
      </g>
      <rect x={x} y={y} width={w} height={h} rx={24} fill="none" {...st} strokeWidth={10} />
      <path d={`M${x + w / 2} ${y} V${y + h}`} {...st} strokeWidth={6} opacity={0.35} />
      <path d={`M${x - 10} ${y + h + 6} H${x + w + 10}`} {...st} strokeWidth={12} />
    </g>
  );
};

/** Fridge; door hinged on the right. */
export const Fridge: React.FC<{ open: number; hasPot?: boolean; hasMilk?: boolean; frame: number }> = ({ open, hasPot, hasMilk = true, frame }) => {
  const { fridgeX0: x0, fridgeX1: x1, fridgeY0: y0 } = K;
  const w = x1 - x0;
  const h = FLOOR - y0;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} rx={30} fill={open > 0.02 ? "#EAF6FF" : C.white} {...st} />
      {open > 0.02 && (
        <g>
          {[y0 + 170, y0 + 360, y0 + 500].map((yy) => (
            <path key={yy} d={`M${x0 + 20} ${yy} H${x1 - 20}`} {...st} strokeWidth={5} />
          ))}
          <circle cx={x0 + 80} cy={y0 + 470} r={28} fill={C.grass} {...st} strokeWidth={5} />
          <rect x={x0 + 180} y={y0 + 440} width={60} height={60} rx={12} fill={C.lise} {...st} strokeWidth={5} />
          {hasMilk && <g transform={`translate(${x0 + 230} ${y0 + 140})`}><Milk /></g>}
          {hasPot && (
            <g transform={`translate(${x0 + 100} ${y0 + 298})`}>
              <Pot />
              <Steam x={46} y={-40} frame={frame} s={0.8} />
            </g>
          )}
        </g>
      )}
      <Door x={x0} y={y0} w={w} h={h} open={open} hinge="right" fill={C.white} knob={false} />
      {open < 0.25 && (
        <g>
          <path d={`M${x0 + 40} ${y0 + 80} V${y0 + 220}`} {...st} strokeWidth={14} />
          <path d={`M${x0} ${y0 + 280} H${x1}`} {...st} />
          {/* fridge magnet: a heart, obviously */}
          <path transform={`translate(${x0 + 200} ${y0 + 140}) scale(0.7)`} d="M0 22 C-44 -8 -34 -44 0 -24 C34 -44 44 -8 0 22 Z" fill={C.accent} {...st} />
        </g>
      )}
    </g>
  );
};

export const CoffeeMachine: React.FC<{ frame: number; hasPot: boolean }> = ({ frame, hasPot }) => {
  const x = K.machineX;
  const y = K.counterTop - 14;
  return (
    <g>
      <path d={`M${x - 80} ${y} V${y - 220} Q${x - 80} ${y - 240} ${x - 60} ${y - 240} H${x + 70} Q${x + 90} ${y - 240} ${x + 90} ${y - 220} V${y - 175} H${x - 20} V${y - 30} H${x + 90} V${y} Z`} fill="#F4A38C" {...st} />
      <circle cx={x + 55} cy={y - 205} r={10} fill={hasPot ? C.spark : C.white} {...st} strokeWidth={4} />
      {hasPot && (
        <g transform={`translate(${x - 12} ${y - 96})`}>
          <Pot />
          <Steam x={46} y={-44} frame={frame} s={0.6} />
        </g>
      )}
    </g>
  );
};

export const Kitchen: React.FC<{
  frame: number;
  uppers: number[];
  lower: number; // open amount of lower door #1
  fridge: number;
  potOnMachine: boolean;
  potInFridge: boolean;
  milkInFridge: boolean;
  squirrel: number;
}> = ({ frame, uppers, lower, fridge, potOnMachine, potInFridge, milkInFridge, squirrel }) => {
  const lw = (K.counterX1 - K.counterX0) / 3;
  return (
    <g>
      {/* floor */}
      <rect x={-20} y={FLOOR} width={1120} height={420} fill={C.floor} />
      <path d={`M-20 ${FLOOR} H1100`} {...st} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${-20 + i * 260} ${FLOOR + 30 + (i % 2) * 90} h120`} stroke={C.woodDark} strokeWidth={6} strokeLinecap="round" />
      ))}
      <SquirrelWindow frame={frame} squirrel={squirrel} />
      {/* upper cabinets */}
      {uppers.map((o, i) => (
        <Cabinet
          key={i}
          x={K.upperX0 + i * K.upperW}
          y={K.upperY0}
          w={K.upperW}
          h={K.upperY1 - K.upperY0}
          open={o}
          hinge={i === 2 ? "right" : "left"}
          inside={
            <g>
              <path d={`M${K.upperX0 + i * K.upperW} ${K.upperY0 + 110} h${K.upperW}`} {...st} strokeWidth={5} />
              {i === 0 && <g transform={`translate(${cabX(0) + 40} ${K.upperY0 + 100}) scale(0.7)`}><Mug /></g>}
              {i === 1 && <rect x={cabX(1) - 30} y={K.upperY0 + 30} width={60} height={80} rx={10} fill={C.dog} {...st} strokeWidth={5} />}
            </g>
          }
        />
      ))}
      {/* counter + lower cabinets */}
      {[0, 1, 2].map((i) => (
        <Cabinet
          key={i}
          x={K.counterX0 + i * lw}
          y={K.lowerY0}
          w={lw}
          h={K.lowerY1 - K.lowerY0}
          open={i === 1 ? lower : 0}
          inside={i === 1 ? <circle cx={K.counterX0 + lw * 1.5} cy={K.lowerY0 + 160} r={36} fill={C.lise} {...st} strokeWidth={5} /> : null}
        />
      ))}
      <rect x={K.counterX0 - 10} y={K.counterTop - 16} width={K.counterX1 - K.counterX0 + 20} height={34} rx={10} fill={C.wood} {...st} />
      <CoffeeMachine frame={frame} hasPot={potOnMachine} />
      <Fridge open={fridge} hasPot={potInFridge} hasMilk={milkInFridge} frame={frame} />
    </g>
  );
};
