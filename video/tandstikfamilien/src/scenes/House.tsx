import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { kf, rand } from "../lib/anim";
import { DustCloud } from "../lib/Garden";
import { Paper, Sketch } from "../lib/Paper";
import { C, FONT } from "../lib/theme";
import { Caption, Counter, useCopy } from "../lib/UI";

const S = { stroke: C.ink, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
const FL = 940;

const PostIt: React.FC<{ x: number; y: number; text: string; rot?: number }> = ({ x, y, text, rot = -4 }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-150} y={-55} width={300} height={110} fill="#FFFDF7" stroke={C.ink} strokeWidth={5} />
    <rect x={-40} y={-70} width={80} height={26} fill={C.accent} opacity={0.85} />
    <text x={0} y={16} textAnchor="middle" fontFamily={FONT} fontSize={46} fill={C.ink}>{text}</text>
  </g>
);

const PaintProject: React.FC = () => (
  <g>
    <rect x={120} y={260} width={760} height={FL - 260} {...S} strokeWidth={4} stroke={C.grey} />
    {/* painted half: hatching with a wobbly roller edge */}
    <clipPath id="painted">
      <path d={`M120 260 H470 Q500 400 460 520 Q510 640 470 ${FL} H120 Z`} />
    </clipPath>
    <g clipPath="url(#painted)" stroke={C.grey} strokeWidth={4}>
      {Array.from({ length: 40 }, (_, i) => (
        <path key={i} d={`M${120 + i * 26 - 300} ${FL} L${120 + i * 26} 260`} />
      ))}
    </g>
    <path d={`M470 260 Q500 400 460 520 Q510 640 470 ${FL}`} {...S} strokeWidth={4} />
    {/* ladder */}
    <path d={`M560 ${FL} L630 380 L700 ${FL} M580 ${FL - 100} H680 M595 ${FL - 230} H665 M610 ${FL - 360} H650`} {...S} />
    {/* paint can + roller */}
    <path d={`M760 ${FL} V${FL - 90} H860 V${FL} Z`} {...S} fill={C.paper} />
    <ellipse cx={810} cy={FL - 90} rx={50} ry={12} {...S} fill={C.paper} />
    <path d={`M800 ${FL - 100} L760 ${FL - 190} M740 ${FL - 200} h60`} {...S} strokeWidth={10} />
  </g>
);

const ShelfProject: React.FC = () => (
  <g>
    <rect x={1100} y={420} width={300} height={FL - 420} {...S} fill={C.paper} />
    <path d={`M1100 520 H1400`} {...S} />
    {/* loose shelves leaning */}
    <path d={`M1450 ${FL} L1560 600 M1480 ${FL} L1600 620 M1510 ${FL} L1640 640`} {...S} strokeWidth={10} />
    {/* screws */}
    {Array.from({ length: 7 }, (_, i) => (
      <path key={i} d={`M${1160 + rand(i) * 420} ${FL - 6} l${10 + rand(i + 9) * 6} -4`} {...S} strokeWidth={5} />
    ))}
    {/* manual */}
    <g transform={`translate(1240 ${FL - 10}) rotate(-6)`}>
      <rect x={-60} y={-40} width={120} height={40} {...S} fill={C.paper} strokeWidth={4} />
      <text x={0} y={-8} textAnchor="middle" fontFamily={FONT} fontSize={34} fill={C.accent}>?</text>
    </g>
  </g>
);

const KnitProject: React.FC = () => (
  <g>
    {/* chair */}
    <path d={`M1900 ${FL} V720 H2120 V${FL} M2120 720 V430`} {...S} />
    {/* sweater with ONE sleeve */}
    <path d="M1920 600 L1990 560 H2070 L2130 600 L2110 650 L2090 640 V780 H1970 V640 L1950 650 Z" {...S} fill={C.paper} />
    <path d="M1950 650 L1900 760 L1930 770 L1970 660" {...S} fill={C.paper} />
    <path d="M2000 560 Q2030 580 2060 560" {...S} strokeWidth={4} />
    {/* yarn ball + needles, yarn trailing away */}
    <circle cx={2230} cy={FL - 34} r={34} {...S} fill={C.paper} />
    <path d={`M2208 ${FL - 50} Q2230 ${FL - 20} 2252 ${FL - 52} M2200 ${FL - 30} Q2230 ${FL - 60} 2262 ${FL - 26}`} {...S} strokeWidth={3} />
    <path d={`M2190 ${FL - 90} L2280 ${FL - 10} M2200 ${FL - 10} L2270 ${FL - 100}`} {...S} strokeWidth={5} />
    <path d={`M2090 780 Q2150 ${FL - 20} 2200 ${FL - 30}`} {...S} strokeWidth={3} stroke={C.grey} />
  </g>
);

const Window: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={2480} y={300} width={420} height={380} {...S} fill={C.paper} />
    <clipPath id="win">
      <rect x={2480} y={300} width={420} height={380} />
    </clipPath>
    <g clipPath="url(#win)">
      <path d="M2480 600 H2900" {...S} strokeWidth={4} stroke={C.grey} />
      <DustCloud x={2690} y={520} frame={frame} s={0.55} />
    </g>
    <path d="M2690 300 V680 M2480 490 H2900" {...S} strokeWidth={5} />
    <path d="M2460 690 H2920" {...S} strokeWidth={10} />
  </g>
);

/** Meanwhile, inside: three unfinished projects Lise walks right past. */
export const SceneHouse: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useCopy().house;
  const camX = kf(frame, [[0, 0], [70, 0], [125, 600], [190, 600], [245, 1250], [305, 1250], [365, 1950], [480, 2000]]);
  const count = frame < 20 ? 0 : frame < 130 ? 1 : frame < 250 ? 2 : 3;
  const changedAt = frame < 130 ? 20 : frame < 250 ? 130 : 250;
  return (
    <AbsoluteFill>
      <Paper />
      <Sketch>
        <g transform={`translate(${-camX} 0)`}>
          <path d={`M-100 ${FL} H4300 M-100 ${FL - 24} H4300`} {...S} />
          <PaintProject />
          <PostIt x={300} y={350} text={t.notes[0]} />
          <ShelfProject />
          <PostIt x={1250} y={340} text={t.notes[1]} rot={3} />
          <KnitProject />
          <PostIt x={2010} y={360} text={t.notes[2]} rot={-2} />
          <Window frame={frame} />
        </g>
      </Sketch>
      <Counter label={t.counter} value={count} changedAt={changedAt} from={10} to={480} vpos="bottom" side="left" />
      <Caption text={t.meanwhile} from={0.2} to={2.8} />
      <Caption text={t.doesntSee} from={11.3} to={13.6} />
      <Caption text={t.blinkers} from={13.7} to={16} />
    </AbsoluteFill>
  );
};
