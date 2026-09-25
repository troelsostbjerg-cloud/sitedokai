import React from "react";
import { rand } from "./anim";
import { C } from "./theme";

const S = { stroke: C.ink, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const GROUND = 900;

export const Sun: React.FC<{ x: number; y: number; frame: number }> = ({ x, y, frame }) => (
  <g transform={`translate(${x} ${y})`} {...S}>
    <circle r={48} fill={C.paper} />
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2 + frame / 60;
      return <path key={i} d={`M${Math.cos(a) * 64} ${Math.sin(a) * 64} L${Math.cos(a) * 86} ${Math.sin(a) * 86}`} strokeWidth={5} />;
    })}
  </g>
);

export const Fence: React.FC<{ x0: number; x1: number }> = ({ x0, x1 }) => {
  const n = Math.floor((x1 - x0) / 70);
  return (
    <g {...S} strokeWidth={5} stroke={C.grey}>
      <path d={`M${x0} ${GROUND - 150} H${x1} M${x0} ${GROUND - 60} H${x1}`} />
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${x0 + 30 + i * 70} ${GROUND} V${GROUND - 200} l-14 -18`} fill="none" />
      ))}
    </g>
  );
};

export const HouseWall: React.FC = () => (
  <g {...S}>
    <rect x={-20} y={220} width={290} height={GROUND - 220} fill={C.paperDark} />
    <path d={`M-20 220 L130 120 L290 220`} fill="none" />
    <rect x={70} y={560} width={140} height={GROUND - 560} fill={C.paper} />
    <circle cx={185} cy={740} r={7} fill={C.ink} />
    <rect x={60} y={300} width={160} height={150} fill={C.paper} />
    <path d="M140 300 V450 M60 375 H220" />
  </g>
);

export const Rose: React.FC<{ x: number; y: number; scale?: number; pot?: boolean }> = ({ x, y, scale = 1, pot }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} {...S} strokeWidth={5}>
    {pot && <path d="M-40 0 L-48 -60 H48 L40 0 Z" fill={C.paper} />}
    <path d={`M0 ${pot ? -60 : 0} V-150`} fill="none" />
    <path d={`M0 ${pot ? -90 : -60} q-34 -8 -40 -30 q30 -2 40 30 M0 -110 q30 -10 38 -34 q-30 0 -38 34`} fill={C.paper} strokeWidth={4} />
    <circle cx={0} cy={-168} r={24} fill={C.accent} />
    <path d="M-10 -172 q10 -14 18 0 q-8 10 -16 2" fill="none" strokeWidth={4} />
  </g>
);

export const Flower: React.FC<{ x: number; y: number; h?: number; s?: number }> = ({ x, y, h = 110, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} {...S} strokeWidth={5}>
    <path d={`M0 0 V${-h}`} fill="none" />
    <path d={`M0 ${-h * 0.4} q-24 -4 -28 -22 q20 0 28 22`} fill={C.paper} strokeWidth={4} />
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * 18} cy={-h + Math.sin(a) * 18} r={13} fill={C.paper} strokeWidth={4} />;
    })}
    <circle cx={0} cy={-h} r={10} fill={C.ink} />
  </g>
);

export const Sprout: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`} {...S} strokeWidth={4}>
    <path d="M0 0 V-40 M0 -30 q-22 -4 -24 -22 q18 2 24 22 M0 -40 q20 -6 24 -26 q-18 2 -24 26" fill={C.paper} />
  </g>
);

/** Version 1: neat rows of flowers. */
export const GardenV1: React.FC = () => (
  <g>
    <path d={`M540 ${GROUND + 30} H1480`} {...S} strokeWidth={4} stroke={C.grey} />
    {Array.from({ length: 8 }, (_, i) => (
      <Flower key={i} x={580 + i * 125} y={GROUND + 25} h={100 + (i % 2) * 30} />
    ))}
  </g>
);

/** Version 2: round mound + pond. */
export const GardenV2: React.FC<{ frame: number }> = ({ frame }) => (
  <g {...S}>
    <path d={`M540 ${GROUND + 30} Q720 ${GROUND - 120} 900 ${GROUND + 30} Z`} fill={C.paperDark} />
    <Flower x={650} y={GROUND - 20} h={90} />
    <Flower x={720} y={GROUND - 50} h={100} />
    <Flower x={790} y={GROUND - 20} h={90} />
    <ellipse cx={1200} cy={GROUND + 40} rx={260} ry={52} fill={C.paper} />
    {[0, 1].map((i) => {
      const k = ((frame / 30 + i * 0.5) % 1);
      return <ellipse key={i} cx={1180} cy={GROUND + 40} rx={40 + k * 150} ry={8 + k * 28} fill="none" strokeWidth={4} stroke={C.grey} opacity={1 - k} />;
    })}
    {/* a frog-free lily pad */}
    <path d={`M1300 ${GROUND + 44} a30 12 0 1 1 20 -10 l-20 10`} fill={C.paper} strokeWidth={4} />
  </g>
);

/** Version 3: raised beds. */
export const GardenV3: React.FC = () => (
  <g {...S}>
    {[560, 880, 1200].map((x) => (
      <g key={x}>
        <rect x={x} y={GROUND - 70} width={260} height={100} fill={C.paper} />
        <path d={`M${x} ${GROUND - 20} H${x + 260}`} strokeWidth={4} />
        {[40, 100, 160, 220].map((o) => (
          <Sprout key={o} x={x + o} y={GROUND - 70} />
        ))}
      </g>
    ))}
  </g>
);

/** Version 4: minimalist zen gravel. With one rose. */
export const GardenV4: React.FC = () => (
  <g {...S}>
    {Array.from({ length: 5 }, (_, i) => (
      <path
        key={i}
        d={`M520 ${GROUND + 8 + i * 16} Q720 ${GROUND - 4 + i * 16} 920 ${GROUND + 8 + i * 16} T1320 ${GROUND + 8 + i * 16} T1520 ${GROUND + 8 + i * 16}`}
        fill="none"
        strokeWidth={3}
        stroke={C.grey}
      />
    ))}
    <path d={`M1180 ${GROUND + 30} Q1170 ${GROUND - 50} 1260 ${GROUND - 56} Q1350 ${GROUND - 50} 1340 ${GROUND + 30} Z`} fill={C.paperDark} />
    <Rose x={900} y={GROUND + 20} scale={1.2} />
  </g>
);

/** Cartoon "fight cloud": Lise redesigning the garden at hyperfocus speed. */
export const DustCloud: React.FC<{ x: number; y: number; frame: number; s?: number }> = ({ x, y, frame, s = 1 }) => {
  const t = Math.floor(frame / 3);
  const puffs = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2 + t * 0.3;
    return {
      x: Math.cos(a) * 190 * (0.7 + 0.3 * rand(i + t)),
      y: Math.sin(a) * 100 * (0.7 + 0.3 * rand(i * 3 + t)),
      r: 80 + 40 * rand(i * 7 + t),
    };
  });
  const limbs = Array.from({ length: 4 }, (_, i) => {
    const a = rand(t * 5 + i) * Math.PI * 2;
    return { a, len: 250 + 60 * rand(i + t * 2) };
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} {...S}>
      {limbs.map((l, i) => (
        <g key={i}>
          <path d={`M0 0 L${Math.cos(l.a) * l.len} ${Math.sin(l.a) * l.len * 0.6}`} />
          {i === 0 && (
            // the shovel
            <g transform={`translate(${Math.cos(l.a) * l.len} ${Math.sin(l.a) * l.len * 0.6}) rotate(${(l.a * 180) / Math.PI + 90})`}>
              <path d="M0 0 V-60" />
              <path d="M-26 -60 H26 L18 -110 Q0 -126 -18 -110 Z" fill={C.paper} />
            </g>
          )}
        </g>
      ))}
      {puffs.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={C.paper} />
      ))}
      <ellipse cx={0} cy={0} rx={170} ry={90} fill={C.paper} stroke="none" />
      {Array.from({ length: 6 }, (_, i) => {
        const a = rand(i * 11 + t) * Math.PI * 2;
        const d = 150 + 120 * rand(i + t * 7);
        return i % 2 ? (
          <circle key={i} cx={Math.cos(a) * d * 1.4} cy={Math.sin(a) * d * 0.7} r={8} fill={C.grey} stroke="none" />
        ) : (
          <path key={i} d="M0 -18 L5 -5 L18 -5 L8 3 L12 17 L0 9 L-12 17 L-8 3 L-18 -5 L-5 -5 Z" transform={`translate(${Math.cos(a) * d * 1.3} ${Math.sin(a) * d * 0.8})`} fill={C.accent} strokeWidth={3} />
        );
      })}
    </g>
  );
};
