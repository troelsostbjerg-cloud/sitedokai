import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { kf, pop, step, windowIn } from "../lib/anim";
import { Cat } from "../lib/Cat";
import { CoffeePot, FLOOR, K, Kitchen, Milk, Mug, Phone, upperX } from "../lib/Kitchen";
import { Paper, Sketch } from "../lib/Paper";
import { poseAt } from "../lib/poses";
import { solve, StickFigure } from "../lib/StickFigure";
import { C, FONT } from "../lib/theme";
import { Bubble, Caption, Counter, Label, Thought, useCopy } from "../lib/UI";

const SC = 1.7;
const cabCentre = (i: number) => upperX(i) + K.upperW / 2;
const open = (frame: number, at: number, dur = 12) => kf(frame, [[at, 0], [at + dur, 1]]);

/** Bo's morning: opens everything, closes nothing – except the fridge, with the coffee inside. */
export const SceneBo: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useCopy().bo;

  // --- Bo's route ---
  const x = kf(frame, [
    [0, -120], [48, cabCentre(0) - 40],
    [86, cabCentre(0) - 40], [124, cabCentre(1) - 40],
    [186, cabCentre(1) - 40], [228, cabCentre(2) - 40],
    [252, cabCentre(2) - 40], [292, 1010],
    [402, 1010], [455, 1300],
    [600, 1300], [680, 820],
    [804, 820], [846, 352], [860, 385],
  ]);
  const facing: 1 | -1 = frame >= 596 ? -1 : 1;
  const pose = poseAt(
    [
      [0, "walk"], [48, "stand"], [50, "reachUp"], [78, "stand"],
      [86, "walk"], [124, "stand"], [127, "reachUp"], [150, "think"],
      [162, "lookDown"], [186, "walk"], [228, "stand"], [232, "reachUp"], [252, "walk"],
      [292, "stand"], [298, "reachFwd"], [312, "pour"],
      [362, "lookDown"], [402, "walk"], [455, "stand"], [458, "reachFwd"], [500, "hold"],
      [520, "stand"], [600, "walk"], [680, "stand"], [690, "pat"], [760, "shrug"],
      [804, "walk"], [846, "shock"], [870, "stand"],
    ],
    frame,
  );
  const mouth = step(frame, [
    [0, "smile"], [140, "o"], [180, "neutral"], [362, "o"], [402, "neutral"], [690, "flat"], [846, "open"], [872, "flat"],
  ] as [number, "smile" | "o" | "neutral" | "flat" | "open"][]);

  // --- The kitchen state ---
  const uppers = [open(frame, 56), open(frame, 134), open(frame, 238), 0];
  const drawer = kf(frame, [[164, 0], [176, 1]]);
  const fridge = kf(frame, [[458, 0], [470, 1], [500, 1], [510, 0]]);
  const potOnMachine = frame < 302;
  const potInHand = frame >= 302 && frame < 478;
  const potInFridge = frame >= 478;
  const milkInHand = frame >= 490;
  const pouring = frame >= 316 && frame < 356;

  const count = frame < 56 ? 0 : frame < 134 ? 1 : frame < 166 ? 2 : frame < 238 ? 3 : 4;
  const changedAt = frame < 134 ? 56 : frame < 166 ? 134 : frame < 238 ? 166 : 238;

  const j = solve(pose, facing);
  const bx = (p: { x: number }) => x + p.x * SC;
  const by = (p: { y: number }) => FLOOR + p.y * SC;

  const mug = <g transform={`translate(${34 * facing} 14) scale(${-facing} 1)`}><Mug full={frame > 340} steam={frame > 340 && frame < 470 ? 1 : 0} frame={frame} /></g>;
  const pot = (
    <g transform={`scale(${-facing} 1)`}>
      <CoffeePot tilt={pouring ? -38 : 0} level={frame > 340 ? 0.35 : 0.6} />
    </g>
  );

  // BONK
  const bonk = frame >= 846 ? pop(frame, 846) : 0;

  return (
    <AbsoluteFill>
      <Paper />
      <Sketch>
        <Kitchen
          frame={frame}
          uppers={uppers}
          drawer={drawer}
          fridge={fridge}
          hasPot={potInFridge}
          potOnMachine={potOnMachine}
          hasMilk={!milkInHand}
          minutes={7 * 60 + 22 + frame / 90}
          brewing={frame < 300}
        />
        <Cat x={1600} y={K.fridgeY0} frame={frame} look={frame > 520 && frame < 800 ? "camera" : "side"} facing={-1} eyes={frame > 520 ? "flat" : "open"} />
        <StickFigure
          x={x}
          y={FLOOR}
          scale={SC}
          facing={facing}
          pose={pose}
          who="bo"
          mouth={mouth}
          look={frame > 690 && frame < 720 ? "camera" : "side"}
          holdBack={frame >= 70 ? mug : undefined}
          holdFront={potInHand ? pot : milkInHand ? <g transform="translate(0 40)"><Milk /></g> : undefined}
        />
        {pouring && (
          <path
            d={`M${bx(j.fHand) + 70 * facing} ${by(j.fHand) + 5} Q${bx(j.fHand) + 40 * facing} ${by(j.fHand) + 40} ${bx(j.bHand) + 34 * facing} ${by(j.bHand) - 20}`}
            stroke={C.ink}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
        )}
        {/* phone in the pocket */}
        {frame >= 350 && frame < 420 && (
          <g transform={`translate(${x + 16 * facing} ${FLOOR - 200})`}>
            <g transform="scale(1.5)"><Phone buzz frame={frame} /></g>
            <Label x={-110 * facing} y={-30} text={t.bzz} size={72} color={C.accent} rotate={-8} />
          </g>
        )}
      </Sketch>

      {/* Thoughts & speech (not boiled, so they stay crisp) */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <Thought x={x + 210} y={FLOOR - 560} ax={x + 40} ay={FLOOR - 470} frame={frame} from={140} to={184}>
          <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontSize={96} fill={C.accent}>?</text>
        </Thought>
        <Thought x={x - 190} y={FLOOR - 590} ax={x - 30} ay={FLOOR - 470} frame={frame} from={372} to={450}>
          <g transform="scale(1.4)"><Phone /></g>
        </Thought>
        <Bubble x={x - 600} y={FLOOR - 740} w={560} tx={x - 60} ty={FLOOR - 520} text={t.glasses} frame={frame} from={698} to={800} size={58} />
        {/* the arrow nobody in the family ever draws */}
        {frame >= 735 && frame < 846 && (
          <g opacity={windowIn(frame, 735, 846, 6)}>
            <path
              d={`M${x + 230} ${FLOOR - 650} Q${x + 150} ${FLOOR - 560} ${x + 30} ${FLOOR - 490}`}
              stroke={C.accent}
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={400}
              strokeDashoffset={400 * (1 - Math.min(1, (frame - 735) / 12))}
            />
            <path d={`M${x + 30} ${FLOOR - 490} l36 -8 M${x + 30} ${FLOOR - 490} l14 32`} stroke={C.accent} strokeWidth={8} strokeLinecap="round" opacity={frame > 745 ? 1 : 0} />
          </g>
        )}
        {bonk > 0 && frame < 885 && (
          <g transform={`translate(${340} ${FLOOR - 470}) scale(${bonk})`}>
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2 + frame / 8;
              return <path key={i} d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4 Z" transform={`translate(${Math.cos(a) * 70} ${Math.sin(a) * 26 - 30})`} fill={C.accent} />;
            })}
            <text x={0} y={-90} textAnchor="middle" fontFamily={FONT} fontSize={90} fill={C.ink} transform="rotate(-8)">{t.bonk}</text>
          </g>
        )}
      </svg>

      <Caption text={t.hasAdhd} from={0.3} to={3.9} />
      <Caption text={t.opensAll} from={4.1} to={6.6} />
      <Caption text={t.closesNothing} from={6.8} to={9.6} />
      <Caption text={t.onlyThing} from={16.4} to={19.3} />
      <Caption text={t.withCoffee} from={19.4} to={23} />
      <Counter label={t.counter} value={count} changedAt={changedAt} from={40} to={885} vpos="bottom" side="left" />
    </AbsoluteFill>
  );
};
