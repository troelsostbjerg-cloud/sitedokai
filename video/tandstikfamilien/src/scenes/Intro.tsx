import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { kf, pop, windowIn } from "../lib/anim";
import { Camera } from "../lib/Camera";
import { Cat } from "../lib/Cat";
import { Clock, FLOOR, K, Kitchen, Mug } from "../lib/Kitchen";
import { Paper, Sketch } from "../lib/Paper";
import { poseAt } from "../lib/poses";
import { headTop, StickFigure } from "../lib/StickFigure";
import { C, FONT, TITLE_FONT } from "../lib/theme";
import { Caption, useCopy } from "../lib/UI";

/** Cold open: Lise opens the fridge. The coffee is in there. Again. */
export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useCopy().hook;
  const pose = poseAt([[0, "reachFwd"], [20, "shock"], [60, "hold"], [118, "stand"]], frame);
  const x = 1290;
  const lookCam = frame >= 118;
  const z = kf(frame, [[0, 1.1], [110, 1.18], [128, 1.45]]);
  const top = headTop(x, FLOOR, pose, 1.7, 1);
  const bang = frame >= 22 && frame < 110 ? pop(frame, 22) : 0;
  return (
    <AbsoluteFill>
      <Paper />
      <Sketch>
        <Camera cx={kf(frame, [[0, 1330], [110, 1330], [128, 1450]])} cy={560} z={z}>
          <Kitchen frame={frame} uppers={[1, 1, 1, 0]} drawer={1} fridge={kf(frame, [[4, 0], [16, 1]])} hasPot hasMilk={false} minutes={7 * 60 + 42} cupsInCab1={false} />
          <Cat x={1600} y={K.fridgeY0} frame={frame} look={frame > 130 ? "camera" : "side"} facing={-1} eyes="flat" />
          <StickFigure
            x={x}
            y={FLOOR}
            scale={1.7}
            pose={pose}
            who="lise"
            mouth={frame < 20 ? "neutral" : frame < 118 ? "open" : "flat"}
            look={lookCam ? "camera" : "side"}
            blink={frame >= 150 && frame < 155}
            holdBack={<g transform="translate(-34 14)"><Mug /></g>}
          />
          {bang > 0 && (
            <text x={top.x + 30} y={top.y - 20} fontFamily={FONT} fontSize={120 * bang} fill={C.accent} textAnchor="middle" transform={`rotate(10 ${top.x} ${top.y})`}>!</text>
          )}
        </Camera>
      </Sketch>
      <Caption text={t.time} from={0.5} to={4} />
      <Caption text={t.again} from={4.3} to={7} size={140} pos="bottom" y={840} />
    </AbsoluteFill>
  );
};

/** Title card: the family lines up. */
export const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useCopy().title;
  const g = 990;
  const pb = pop(frame, 8);
  const pl = pop(frame, 16);
  const pc = pop(frame, 26);
  const boPose = poseAt([[0, "stand"], [30, "wave"], [40, "wave2"], [50, "wave"], [60, "wave2"], [70, "stand"]], frame);
  const lisePose = poseAt([[0, "stand"], [40, "proud"]], frame);
  const titleS = pop(frame, 2, 9);
  const underline = kf(frame, [[18, 0], [40, 1]]);
  return (
    <AbsoluteFill>
      <Paper />
      <Sketch>
        <g transform={`translate(760 ${g}) scale(1 ${pb}) translate(-760 ${-g})`}>
          <StickFigure x={760} y={g} scale={1.45} pose={boPose} who="bo" mouth="grin" look="camera" />
        </g>
        <g transform={`translate(1060 ${g}) scale(1 ${pl}) translate(-1060 ${-g})`}>
          <StickFigure x={1060} y={g} scale={1.45} pose={lisePose} who="lise" mouth="smile" look="camera" facing={-1} />
        </g>
        <g transform={`translate(1290 ${g}) scale(${pc}) translate(-1290 ${-g})`}>
          <Cat x={1290} y={g} scale={1.3} frame={frame} look="camera" eyes={frame > 80 && frame < 86 ? "closed" : "flat"} />
        </g>
        <path d="M0 990 H1920" stroke={C.ink} strokeWidth={6} />
        <path
          d="M620 330 Q800 300 960 318 T1310 320"
          stroke={C.accent}
          strokeWidth={12}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={800}
          strokeDashoffset={800 * (1 - underline)}
        />
      </Sketch>
      <div style={{ position: "absolute", top: 90, width: "100%", textAlign: "center", fontFamily: TITLE_FONT, fontSize: 190, color: C.ink, transform: `scale(${0.7 + 0.3 * titleS}) rotate(-2deg)`, lineHeight: 1 }}>
        {t.series}
      </div>
      <div style={{ position: "absolute", top: 370, width: "100%", textAlign: "center", fontFamily: FONT, fontSize: 68, color: C.ink, opacity: windowIn(frame, 24, 999, 10) }}>
        {t.episode}
      </div>
    </AbsoluteFill>
  );
};

/** Rewind: the clock spins back 20 minutes. */
export const SceneRewind: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useCopy().rewind;
  const minutes = kf(frame, [[8, 7 * 60 + 42], [60, 7 * 60 + 22]]);
  const shake = frame < 62 ? Math.sin(frame * 3.1) * 4 : 0;
  return (
    <AbsoluteFill>
      <Paper />
      <Sketch>
        <g transform={`translate(${shake} 0)`}>
          <Clock x={960} y={430} r={210} minutes={minutes} />
          <g fill={C.accent} opacity={frame < 64 ? 1 : 0}>
            <path d="M600 430 l70 -50 v100 Z M670 430 l70 -50 v100 Z" transform="translate(-60 0)" />
          </g>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M0 ${((frame * 37 + i * 360) % 1080)} H1920`} stroke={C.soft} strokeWidth={4} opacity={frame < 62 ? 0.8 : 0} />
          ))}
        </g>
      </Sketch>
      <Caption text={t} from={0.2} to={3} pos="bottom" y={760} size={90} />
    </AbsoluteFill>
  );
};
