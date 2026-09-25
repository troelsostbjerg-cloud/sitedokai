import React from "react";
import { rad } from "./anim";
import { C } from "./theme";

const S = { stroke: C.ink, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

// ---------- Layout (shared by every kitchen scene) ----------
export const FLOOR = 950;
export const K = {
  counterX0: 290,
  counterX1: 1330,
  counterTop: 700,
  upperY0: 330,
  upperY1: 550,
  upperX0: 320,
  upperW: 245,
  fridgeX0: 1420,
  fridgeX1: 1720,
  fridgeY0: 400,
  machineX: 1190, // centre of coffee machine
  drawerX0: 555,
};
export const upperX = (i: number) => K.upperX0 + i * K.upperW;

/** A hinged door seen from the front. open: 0 closed … 1 wide open (~115°). */
export const Door: React.FC<{
  x: number; y: number; w: number; h: number; open: number; hinge: "left" | "right"; fill?: string; knob?: boolean;
}> = ({ x, y, w, h, open, hinge, fill = C.paper, knob = true }) => {
  const a = rad(open * 115);
  const hx = hinge === "left" ? x : x + w;
  const dir = hinge === "left" ? 1 : -1;
  const fx = hx + Math.cos(a) * w * dir;
  const persp = Math.sin(a) * w * 0.13;
  const pts = [
    [hx, y],
    [fx, y - persp],
    [fx, y + h + persp],
    [hx, y + h],
  ];
  const kx = hx + Math.cos(a) * (w - 26) * dir;
  return (
    <g {...S}>
      <path d={`M${pts.map((p) => p.join(" ")).join(" L")} Z`} fill={fill} />
      {knob && Math.cos(a) > 0.15 && <circle cx={kx} cy={y + h / 2} r={6} fill={C.ink} />}
    </g>
  );
};

/** Upper or lower cabinet: dark inside + door. */
export const Cabinet: React.FC<{
  x: number; y: number; w: number; h: number; open: number; hinge?: "left" | "right"; items?: React.ReactNode;
}> = ({ x, y, w, h, open, hinge = "left", items }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} fill={C.paperDark} {...S} />
    {open > 0.02 && (
      <g>
        <path d={`M${x} ${y + h * 0.5} H${x + w}`} {...S} />
        {items}
      </g>
    )}
    <Door x={x} y={y} w={w} h={h} open={open} hinge={hinge} />
  </g>
);

/** Drawer that slides out towards the viewer. */
export const Drawer: React.FC<{ x: number; y: number; w: number; h: number; out: number }> = ({ x, y, w, h, out }) => {
  const dy = out * 22;
  const grow = out * 12;
  return (
    <g {...S}>
      <rect x={x} y={y} width={w} height={h} fill={C.paperDark} />
      {out > 0.02 && (
        <path d={`M${x} ${y} L${x - grow} ${y + dy} M${x + w} ${y} L${x + w + grow} ${y + dy}`} fill="none" />
      )}
      <rect x={x - grow} y={y + dy} width={w + grow * 2} height={h + grow * 0.4} fill={C.paper} />
      <path d={`M${x + w / 2 - 30} ${y + dy + h / 2} H${x + w / 2 + 30}`} />
    </g>
  );
};

export const Mug: React.FC<{ full?: boolean; steam?: number; frame?: number }> = ({ full, steam = 0, frame = 0 }) => (
  <g {...S} strokeWidth={5}>
    <path d="M-22 -40 L-18 8 Q-18 14 -10 14 L10 14 Q18 14 18 8 L22 -40 Z" fill={C.paper} />
    {full && <path d="M-20 -30 H20" />}
    <path d="M20 -28 Q40 -26 36 -8 Q32 4 18 0" fill="none" />
    {steam > 0 && <Steam x={0} y={-50} frame={frame} scale={0.6} opacity={steam} />}
  </g>
);

export const Steam: React.FC<{ x: number; y: number; frame: number; scale?: number; opacity?: number }> = ({ x, y, frame, scale = 1, opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity} fill="none" stroke={C.grey} strokeWidth={5} strokeLinecap="round">
    {[-18, 0, 18].map((ox, i) => {
      const w = Math.sin(frame / 6 + i * 2) * 8;
      const t = ((frame / 40 + i * 0.33) % 1) * 20;
      return <path key={i} d={`M${ox} ${-t} q${w} -18 0 -36 q${-w} -18 0 -36`} opacity={1 - t / 25} />;
    })}
  </g>
);

/** Glass coffee pot. (0,0) = handle grip. */
export const CoffeePot: React.FC<{ tilt?: number; level?: number }> = ({ tilt = 0, level = 0.6 }) => (
  <g transform={`rotate(${tilt})`} {...S} strokeWidth={5}>
    <path d="M-14 -34 L-80 -34 L-88 -20 L-70 -20 Q-104 10 -94 40 Q-86 60 -46 60 Q-6 60 -2 40 Q6 10 -26 -20 Z" fill={C.paper} />
    <path d={`M-96 ${60 - 70 * level} Q-50 ${56 - 70 * level} -2 ${60 - 70 * level} L-2 44 Q-6 60 -46 60 Q-86 60 -94 44 Z`} fill={C.ink} stroke="none" opacity={0.85} />
    <path d="M-14 -30 Q10 -28 10 0 Q10 24 -4 30" fill="none" strokeWidth={8} />
  </g>
);

export const CoffeeMachine: React.FC<{ x: number; y: number; frame: number; brewing?: boolean }> = ({ x, y, frame, brewing }) => (
  <g transform={`translate(${x} ${y})`} {...S}>
    <path d="M-80 0 V-190 H70 V-150 H-30 V-30 H70 V0 Z" fill={C.paper} />
    <rect x={-80} y={-200} width={150} height={20} rx={6} fill={C.paper} />
    <circle cx={45} cy={-170} r={7} fill={brewing ? C.accent : C.paper} />
    {brewing && <Steam x={0} y={-205} frame={frame} scale={0.5} />}
  </g>
);

export const Milk: React.FC = () => (
  <g {...S} strokeWidth={5}>
    <path d="M-22 -80 L-22 14 L22 14 L22 -80 L12 -100 L-12 -100 Z" fill={C.paper} />
    <path d="M-22 -80 H22 M-12 -100 L-4 -80" fill="none" />
    <path d="M-12 -40 Q0 -54 12 -40 Q0 -26 -12 -40" fill="none" strokeWidth={4} />
  </g>
);

export const Phone: React.FC<{ buzz?: boolean; frame?: number }> = ({ buzz, frame = 0 }) => {
  const j = buzz ? Math.sin(frame * 2.3) * 3 : 0;
  return (
    <g transform={`translate(${j} 0)`} {...S} strokeWidth={4}>
      <rect x={-14} y={-26} width={28} height={50} rx={6} fill={C.ink} />
      {buzz && (
        <g fill="none" stroke={C.accent} strokeWidth={4}>
          <path d="M-26 -18 l-8 6 l8 6 l-8 6" />
          <path d="M26 -18 l8 6 l-8 6 l8 6" />
        </g>
      )}
    </g>
  );
};

export const Fridge: React.FC<{ open: number; frame: number; hasPot?: boolean; hasMilk?: boolean; potSteam?: number }> = ({
  open, frame, hasPot, hasMilk = true, potSteam = 1,
}) => {
  const { fridgeX0: x0, fridgeX1: x1, fridgeY0: y0 } = K;
  const w = x1 - x0;
  const h = FLOOR - y0;
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={h} rx={14} fill={open > 0.02 ? "#FFFDF7" : C.paper} {...S} />
      {open > 0.02 && (
        <g {...S}>
          <path d={`M${x0 + 12} ${y0 + 150} H${x1 - 12} M${x0 + 12} ${y0 + 300} H${x1 - 12} M${x0 + 12} ${y0 + 420} H${x1 - 12}`} fill="none" strokeWidth={4} />
          {/* a sad lettuce and a jar */}
          <path d={`M${x0 + 40} ${y0 + 420} q20 -60 45 -40 q20 -30 40 10 q5 20 -10 30 Z`} fill={C.paper} strokeWidth={4} />
          <rect x={x0 + 190} y={y0 + 370} width={50} height={50} rx={8} fill={C.paper} strokeWidth={4} />
          {hasMilk && (
            <g transform={`translate(${x0 + 215} ${y0 + 136}) scale(0.9)`}>
              <Milk />
            </g>
          )}
          {hasPot && (
            <g transform={`translate(${x0 + 150} ${y0 + 238})`}>
              <CoffeePot />
              <Steam x={-48} y={-40} frame={frame} scale={0.8} opacity={potSteam} />
            </g>
          )}
        </g>
      )}
      <Door x={x0} y={y0} w={w} h={h} open={open} hinge="right" />
      {open < 0.3 && (
        <g {...S}>
          <path d={`M${x0 + 30} ${y0 + 60} V${y0 + 190}`} strokeWidth={9} />
          <path d={`M${x0} ${y0 + 250} H${x1}`} />
        </g>
      )}
    </g>
  );
};

export const Clock: React.FC<{ x: number; y: number; r?: number; minutes: number }> = ({ x, y, r = 55, minutes }) => {
  const m = rad((minutes % 60) * 6);
  const hh = rad(((minutes / 60) % 12) * 30);
  return (
    <g transform={`translate(${x} ${y})`} {...S}>
      <circle r={r} fill={C.paper} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = rad(i * 30);
        return <path key={i} d={`M${Math.sin(a) * r * 0.78} ${-Math.cos(a) * r * 0.78} L${Math.sin(a) * r * 0.88} ${-Math.cos(a) * r * 0.88}`} strokeWidth={4} />;
      })}
      <path d={`M0 0 L${Math.sin(hh) * r * 0.5} ${-Math.cos(hh) * r * 0.5}`} strokeWidth={7} />
      <path d={`M0 0 L${Math.sin(m) * r * 0.75} ${-Math.cos(m) * r * 0.75}`} strokeWidth={5} />
      <circle r={5} fill={C.ink} />
    </g>
  );
};

/** The whole kitchen. opens: 4 upper doors (0..1), drawer out (0..1), fridge open. */
export const Kitchen: React.FC<{
  frame: number;
  uppers: number[];
  lowers?: number[];
  drawer?: number;
  fridge: number;
  hasPot?: boolean; // pot in the fridge
  potOnMachine?: boolean;
  hasMilk?: boolean;
  minutes?: number;
  brewing?: boolean;
  cupsInCab1?: boolean;
}> = ({ frame, uppers, lowers = [0, 0, 0, 0], drawer = 0, fridge, hasPot, potOnMachine, hasMilk, minutes = 7 * 60 + 22, brewing, cupsInCab1 = true }) => {
  const baseW = (K.counterX1 - K.counterX0) / 4;
  return (
    <g>
      {/* floor + doorway */}
      <path d={`M0 ${FLOOR} H1920`} {...S} />
      <path d={`M70 ${FLOOR} V450 H230 V${FLOOR}`} fill="none" {...S} />
      <Clock x={150} y={320} minutes={minutes} />
      {/* upper cabinets */}
      {uppers.map((o, i) => (
        <Cabinet
          key={i}
          x={upperX(i)}
          y={K.upperY0}
          w={K.upperW}
          h={K.upperY1 - K.upperY0}
          open={o}
          hinge={i % 2 ? "right" : "left"}
          items={
            i === 0 ? (
              cupsInCab1 ? (
                <g {...S} strokeWidth={4}>
                  <path d={`M${upperX(0) + 40} ${K.upperY0 + 110} h30 v-40 h-30 Z M${upperX(0) + 150} ${K.upperY0 + 110} h30 v-40 h-30 Z`} fill={C.paper} />
                </g>
              ) : null
            ) : i === 1 ? (
              <g {...S} strokeWidth={4}>
                <rect x={upperX(1) + 40} y={K.upperY0 + 40} width={45} height={70} fill={C.paper} />
                <rect x={upperX(1) + 150} y={K.upperY0 + 150} width={60} height={70} fill={C.paper} />
              </g>
            ) : i === 2 ? (
              <g {...S} strokeWidth={4}>
                <path d={`M${upperX(2) + 50} ${K.upperY0 + 110} l20 -60 l20 60 Z`} fill={C.paper} />
                <circle cx={upperX(2) + 170} cy={K.upperY0 + 190} r={24} fill={C.paper} />
              </g>
            ) : (
              <g {...S} strokeWidth={4}>
                <rect x={upperX(3) + 60} y={K.upperY0 + 50} width={120} height={60} fill={C.paper} />
              </g>
            )
          }
        />
      ))}
      {/* counter */}
      <rect x={K.counterX0 - 10} y={K.counterTop - 14} width={K.counterX1 - K.counterX0 + 20} height={20} fill={C.paper} {...S} />
      {[0, 1, 2, 3].map((i) =>
        i === 1 ? (
          <g key={i}>
            <Drawer x={K.counterX0 + i * baseW} y={K.counterTop + 6} w={baseW} h={70} out={drawer} />
            <Cabinet x={K.counterX0 + i * baseW} y={K.counterTop + 76 + drawer * 22} w={baseW} h={FLOOR - 25 - K.counterTop - 76 - drawer * 22} open={lowers[i]} />
          </g>
        ) : (
          <Cabinet key={i} x={K.counterX0 + i * baseW} y={K.counterTop + 6} w={baseW} h={FLOOR - 25 - K.counterTop - 6} open={lowers[i]} hinge={i % 2 ? "right" : "left"} />
        ),
      )}
      <path d={`M${K.counterX0} ${FLOOR - 19} H${K.counterX1}`} {...S} />
      <CoffeeMachine x={K.machineX} y={K.counterTop - 14} frame={frame} brewing={brewing} />
      {potOnMachine && (
        <g transform={`translate(${K.machineX + 75} ${K.counterTop - 76})`}>
          <CoffeePot />
        </g>
      )}
      <Fridge open={fridge} frame={frame} hasPot={hasPot} hasMilk={hasMilk} />
    </g>
  );
};
