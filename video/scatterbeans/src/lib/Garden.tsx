import React from "react";
import { rand } from "./anim";
import { C, LW } from "./theme";

const st = { stroke: C.line, strokeWidth: LW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
export const GROUND = 1500;
const PETALS = [C.lise, C.spark, "#C7A6F2", "#FF9FB2", C.bo];

export const Sun: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 + frame / 50;
      return <path key={i} d={`M${Math.cos(a) * 70} ${Math.sin(a) * 70} L${Math.cos(a) * 92} ${Math.sin(a) * 92}`} {...st} stroke={C.spark} strokeWidth={10} />;
    })}
    <circle r={54} fill={C.spark} {...st} />
    <circle cx={-18} cy={-6} r={5} fill={C.line} />
    <circle cx={18} cy={-6} r={5} fill={C.line} />
    <path d="M-12 12 Q0 22 12 12" fill="none" {...st} strokeWidth={5} />
  </g>
);

export const Backyard: React.FC = () => (
  <g>
    {/* fence */}
    <path d="M280 1260 H1100 M280 1350 H1100" {...st} stroke="#D9CBB8" strokeWidth={14} />
    {Array.from({ length: 12 }, (_, i) => (
      <path key={i} d={`M${300 + i * 70} 1400 V1220 l20 -24 l20 24 V1400 Z`} fill={C.white} {...st} strokeWidth={5} />
    ))}
    {/* grass */}
    <rect x={-40} y={1400} width={1160} height={560} fill={C.grass} />
    <path d="M-40 1400 H1120" {...st} />
    {Array.from({ length: 14 }, (_, i) => (
      <path key={i} d={`M${rand(i) * 1080} ${1560 + rand(i + 5) * 300} l8 -18 l8 18`} fill="none" stroke={C.grassDark} strokeWidth={5} strokeLinecap="round" />
    ))}
    {/* house with the back door */}
    <path d="M-40 880 L150 760 L330 880 Z" fill={C.accent} {...st} />
    <rect x={-40} y={880} width={330} height={600} fill="#F9E3C7" {...st} />
    <rect x={110} y={1230} width={140} height={250} rx={20} fill={C.boDark} {...st} />
    <circle cx={225} cy={1360} r={9} fill={C.spark} {...st} strokeWidth={4} />
    <rect x={20} y={960} width={130} height={130} rx={18} fill={C.sky} {...st} />
    <path d="M85 960 V1090 M20 1025 H150" {...st} strokeWidth={5} />
  </g>
);

export const Flower: React.FC<{ x: number; y: number; h?: number; c?: string; s?: number }> = ({ x, y, h = 110, c = C.lise, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M0 0 V${-h}`} {...st} stroke={C.grassDark} strokeWidth={9} />
    <path d={`M0 ${-h * 0.45} q-30 -6 -34 -28 q24 0 34 28`} fill={C.grassDark} {...st} strokeWidth={4} />
    {Array.from({ length: 5 }, (_, i) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      return <circle key={i} cx={Math.cos(a) * 20} cy={-h + Math.sin(a) * 20} r={16} fill={c} {...st} strokeWidth={5} />;
    })}
    <circle cx={0} cy={-h} r={13} fill={C.spark} {...st} strokeWidth={5} />
  </g>
);

export const Rose: React.FC<{ x: number; y: number; s?: number; pot?: boolean }> = ({ x, y, s = 1, pot }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {pot && <path d="M-46 0 L-54 -70 H54 L46 0 Z" fill="#E0896B" {...st} />}
    {pot && <rect x={-60} y={-86} width={120} height={22} rx={8} fill="#E0896B" {...st} />}
    <path d={`M0 ${pot ? -80 : 0} V-170`} {...st} stroke="#5E9E57" strokeWidth={10} />
    <path d="M0 -120 q-40 -6 -46 -34 q34 0 46 34 M0 -140 q36 -12 42 -40 q-32 2 -42 40" fill={C.grassDark} {...st} strokeWidth={4} />
    <circle cx={0} cy={-196} r={34} fill="#E8505B" {...st} />
    <path d="M-14 -200 q12 -18 26 -2 q-10 14 -22 4 q4 -8 10 -4" fill="none" {...st} strokeWidth={4} />
  </g>
);

const Sprout: React.FC<{ x: number; y: number; tomato?: boolean }> = ({ x, y, tomato }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M0 0 V-50" {...st} stroke="#5E9E57" strokeWidth={8} />
    <path d="M0 -36 q-28 -4 -30 -26 q22 2 30 26 M0 -46 q24 -8 28 -30 q-22 2 -28 30" fill={C.grassDark} {...st} strokeWidth={4} />
    {tomato && <circle cx={14} cy={-20} r={13} fill={C.accent} {...st} strokeWidth={4} />}
  </g>
);

/** V1: tidy rows. */
export const GardenV1: React.FC = () => (
  <g>
    <rect x={360} y={GROUND - 10} width={620} height={40} rx={20} fill={C.dirt} {...st} />
    {Array.from({ length: 6 }, (_, i) => (
      <Flower key={i} x={410 + i * 104} y={GROUND + 6} h={110 + (i % 2) * 34} c={PETALS[i % PETALS.length]} />
    ))}
  </g>
);

/** V2: round bed + pond (with a rubber duck, obviously). */
export const GardenV2: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <path d={`M330 ${GROUND + 20} Q470 ${GROUND - 150} 610 ${GROUND + 20} Z`} fill={C.dirt} {...st} />
    <Flower x={420} y={GROUND - 30} h={90} c={C.lise} />
    <Flower x={475} y={GROUND - 60} h={100} c="#C7A6F2" />
    <Flower x={530} y={GROUND - 30} h={90} c={C.spark} />
    <ellipse cx={800} cy={GROUND + 30} rx={190} ry={50} fill="#9ED8F5" {...st} />
    {[0, 1].map((i) => {
      const k = (frame / 30 + i * 0.5) % 1;
      return <ellipse key={i} cx={800} cy={GROUND + 30} rx={40 + k * 120} ry={10 + k * 26} fill="none" stroke={C.white} strokeWidth={5} opacity={1 - k} />;
    })}
    <g transform={`translate(830 ${GROUND + 24 + Math.sin(frame / 6) * 3})`}>
      <path d="M-30 0 Q-32 -30 0 -26 Q10 -50 28 -40 Q40 -34 30 -22 L42 -18 L30 -12 Q34 4 0 6 Q-26 6 -30 0 Z" fill={C.spark} {...st} strokeWidth={5} />
      <circle cx={18} cy={-38} r={4} fill={C.line} />
    </g>
  </g>
);

/** V3: raised beds. */
export const GardenV3: React.FC = () => (
  <g>
    {[360, 690].map((x, k) => (
      <g key={x}>
        <rect x={x} y={GROUND - 70} width={290} height={100} rx={14} fill={C.wood} {...st} />
        <path d={`M${x} ${GROUND - 20} H${x + 290}`} {...st} strokeWidth={5} />
        {[50, 120, 190, 250].map((o, i) => (
          <Sprout key={o} x={x + o} y={GROUND - 70} tomato={(i + k) % 2 === 0} />
        ))}
      </g>
    ))}
  </g>
);

/** V4: minimalist zen gravel. With exactly one rose. */
export const GardenV4: React.FC<{ rose: boolean; hole: boolean }> = ({ rose, hole }) => (
  <g>
    <ellipse cx={660} cy={GROUND + 20} rx={330} ry={62} fill="#E4DED4" {...st} />
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={660} cy={GROUND + 20} rx={290 - i * 70} ry={50 - i * 13} fill="none" stroke="#C4BBAE" strokeWidth={5} />
    ))}
    <path d={`M430 ${GROUND + 34} Q430 ${GROUND - 20} 480 ${GROUND - 22} Q530 ${GROUND - 20} 530 ${GROUND + 34} Z`} fill="#B9B2A6" {...st} />
    <path d={`M820 ${GROUND + 36} Q822 ${GROUND + 4} 850 ${GROUND + 2} Q880 ${GROUND + 4} 880 ${GROUND + 36} Z`} fill="#B9B2A6" {...st} />
    {rose && <Rose x={660} y={GROUND + 20} s={0.9} />}
    {hole && <ellipse cx={660} cy={GROUND + 20} rx={40} ry={14} fill={C.dirt} {...st} strokeWidth={5} />}
  </g>
);

/** Dirt flying out of a hole. */
export const DirtSpray: React.FC<{ x: number; y: number; frame: number; dir?: number }> = ({ x, y, frame, dir = -1 }) => (
  <g>
    {Array.from({ length: 7 }, (_, i) => {
      const t = ((frame + i * 4) % 20) / 20;
      const vx = (40 + rand(i) * 80) * dir;
      return <circle key={i} cx={x + vx * t * 2} cy={y - 160 * t + 200 * t * t} r={7 + rand(i + 3) * 6} fill={C.dirt} {...st} strokeWidth={3} opacity={1 - t * 0.5} />;
    })}
  </g>
);

/** Cartoon "fight cloud": Lise + Noodle redesigning the garden at hyperfocus speed. */
export const DustCloud: React.FC<{ x: number; y: number; frame: number; s?: number }> = ({ x, y, frame, s = 1 }) => {
  const t = Math.floor(frame / 3);
  const puffs = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 + t * 0.35;
    return { x: Math.cos(a) * 170 * (0.75 + 0.25 * rand(i + t)), y: Math.sin(a) * 95 * (0.75 + 0.25 * rand(i * 3 + t)), r: 70 + 35 * rand(i * 7 + t) };
  });
  const pokes = [
    { kind: "arm", c: C.lise },
    { kind: "paw", c: C.dog },
    { kind: "shovel", c: C.bo },
    { kind: "flower", c: C.spark },
  ].map((p, i) => ({ ...p, a: rand(t * 5 + i) * Math.PI * 2 }));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {pokes.map((p, i) => {
        const ex = Math.cos(p.a) * 250;
        const ey = Math.sin(p.a) * 150;
        return (
          <g key={i}>
            {p.kind === "flower" ? (
              <Flower x={ex} y={ey} h={60} c={PETALS[t % PETALS.length]} s={0.8} />
            ) : p.kind === "shovel" ? (
              <g transform={`translate(${ex} ${ey}) rotate(${(p.a * 180) / Math.PI + 90})`}>
                <path d="M0 0 V70" {...st} stroke={C.woodDark} strokeWidth={12} />
                <path d="M-26 -2 H26 L18 -50 Q0 -66 -18 -50 Z" fill="#BFC7CF" {...st} />
              </g>
            ) : (
              <g>
                <path d={`M0 0 L${ex} ${ey}`} stroke={C.line} strokeWidth={30} strokeLinecap="round" />
                <path d={`M0 0 L${ex} ${ey}`} stroke={p.c} strokeWidth={16} strokeLinecap="round" />
              </g>
            )}
          </g>
        );
      })}
      {puffs.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#F3E6D3" {...st} />
      ))}
      <ellipse cx={0} cy={0} rx={165} ry={85} fill="#F3E6D3" />
      {Array.from({ length: 6 }, (_, i) => {
        const a = rand(i * 11 + t) * Math.PI * 2;
        const d = 140 + 110 * rand(i + t * 7);
        return i % 2 ? (
          <circle key={i} cx={Math.cos(a) * d * 1.4} cy={Math.sin(a) * d * 0.7} r={10} fill={C.dirt} {...st} strokeWidth={3} />
        ) : (
          <path key={i} d="M0 -20 Q4 -4 20 0 Q4 4 0 20 Q-4 4 -20 0 Q-4 -4 0 -20 Z" transform={`translate(${Math.cos(a) * d * 1.3} ${Math.sin(a) * d * 0.8})`} fill={C.spark} {...st} strokeWidth={4} />
        );
      })}
    </g>
  );
};
