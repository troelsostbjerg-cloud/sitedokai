import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { kf, pop, windowIn } from "../lib/anim";
import { Cat } from "../lib/Cat";
import { Door, Mug } from "../lib/Kitchen";
import { Paper, Sketch } from "../lib/Paper";
import { poseAt } from "../lib/poses";
import { headTop, StickFigure } from "../lib/StickFigure";
import { C, FONT, TITLE_FONT } from "../lib/theme";
import { Bubble, Caption, Rich, useCopy } from "../lib/UI";

const S = { stroke: C.ink, strokeWidth: 6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const FL = 950;

/** Evening on the sofa. Chaos, but theirs. */
export const SceneEvening: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useCopy().evening;
  const lx = kf(frame, [[0, 1620], [52, 1110]]);
  const lisePose = poseAt([[0, "walk"], [52, "stand"], [58, "sit"], [140, "sitArm"], [215, "sit"]], frame);
  const boPose = poseAt([[0, "sit"], [60, "sitArm"], [140, "sit"]], frame);
  const bo = headTop(820, FL, boPose, 1.6, 1);
  const li = headTop(lx, FL, lisePose, 1.6, -1);
  const heart = frame >= 220 ? pop(frame, 220) : 0;
  return (
    <AbsoluteFill>
      <Paper />
      <Sketch>
        <path d={`M0 ${FL} H1920`} {...S} />
        {/* window with moon */}
        <rect x={160} y={260} width={320} height={300} fill={C.night} {...S} />
        <path d="M300 330 a44 44 0 1 0 50 60 a36 36 0 1 1 -50 -60 Z" fill={C.paper} stroke="none" />
        <path d="M320 260 V560 M160 410 H480" {...S} strokeWidth={5} stroke={C.paper} />
        <rect x={160} y={260} width={320} height={300} fill="none" {...S} />
        {/* doorway to the kitchen: every cabinet still open */}
        <path d={`M1480 ${FL} V420 H1830 V${FL}`} fill={C.paperDark} {...S} />
        <rect x={1500} y={520} width={140} height={120} fill={C.paper} {...S} strokeWidth={4} />
        <Door x={1500} y={520} w={140} h={120} open={1} hinge="left" />
        <rect x={1650} y={520} width={140} height={120} fill={C.paper} {...S} strokeWidth={4} />
        <Door x={1650} y={520} w={140} h={120} open={1} hinge="right" />
        <path d={`M1480 760 H1830`} {...S} strokeWidth={4} />
        {/* floor lamp */}
        <path d={`M580 ${FL} H660 M620 ${FL} V470 M560 470 L590 380 H650 L680 470 Z`} fill={C.paper} {...S} />
        {/* sofa */}
        <path d={`M700 ${FL} V860 H1280 V${FL} M700 860 V640 Q700 610 730 610 H1250 Q1280 610 1280 640 V860`} fill={C.paper} {...S} />
        <path d={`M680 ${FL - 10} V760 Q680 730 710 730 H740 V${FL - 10} Z M1240 ${FL - 10} V760 Q1240 730 1270 730 H1300 V${FL - 10} Z`} fill={C.paper} {...S} />
        <path d="M990 640 V860" {...S} strokeWidth={4} />
        <StickFigure x={820} y={FL - 10} scale={1.6} pose={boPose} who="bo" mouth={frame > 215 ? "smile" : "flat"} holdFront={<g transform="translate(26 10) scale(-1 1)"><Mug /></g>} look={frame > 290 ? "camera" : "side"} />
        {frame > 0 && (
          <StickFigure x={lx} y={FL - (frame >= 58 ? 10 : 0)} scale={1.6} pose={lisePose} who="lise" facing={-1} dirty mouth={frame > 140 && frame < 215 ? "grin" : "smile"} look={frame > 290 ? "camera" : "side"} />
        )}
        <Cat x={1270} y={730} frame={frame} scale={0.8} look={frame > 240 ? "camera" : "side"} facing={-1} />
        {heart > 0 && (
          <path
            transform={`translate(${(bo.x + li.x) / 2} ${Math.min(bo.y, li.y) - 60}) scale(${heart * 1.6})`}
            d="M0 20 C-40 -10 -30 -40 0 -22 C30 -40 40 -10 0 20 Z"
            fill={C.accent}
            {...S}
            strokeWidth={4}
          />
        )}
      </Sketch>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <Bubble x={bo.x - 300} y={bo.y - 250} w={600} tx={bo.x + 20} ty={bo.y - 20} text={t.bo} frame={frame} from={62} to={140} />
        <Bubble x={li.x - 250} y={li.y - 250} w={620} tx={li.x - 20} ty={li.y - 20} text={t.lise} frame={frame} from={142} to={216} />
      </svg>
      <Caption text={t.chaos} from={7.4} to={9.3} />
      <Caption text={t.ours} from={9.4} to={12} size={90} />
    </AbsoluteFill>
  );
};

/** End card: subscribe – if you can remember to. */
export const SceneEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useCopy().end;
  const sign = pop(frame, 4, 10);
  const zero = pop(frame, 22, 7);
  const g = 960;
  return (
    <AbsoluteFill>
      <Paper />
      <Sketch>
        <path d={`M0 ${g} H1920`} {...S} />
        <StickFigure x={1300} y={g} scale={1.5} pose={poseAt([[0, "wave"], [10, "wave2"], [20, "wave"], [30, "wave2"], [40, "wave"], [50, "wave2"], [60, "wave"], [70, "wave2"], [80, "wave"], [90, "wave2"], [100, "stand"]], frame)} who="bo" look="camera" mouth="grin" />
        <StickFigure x={1560} y={g} scale={1.5} pose={poseAt([[0, "stand"], [20, "cheer"], [60, "proud"]], frame)} who="lise" look="camera" mouth="smile" facing={-1} dirty />
        <Cat x={1760} y={g} scale={1.1} frame={frame} look="camera" eyes={frame > 150 && frame < 156 ? "closed" : "flat"} />
      </Sketch>
      {/* workplace-safety style sign */}
      <div style={{ position: "absolute", left: 120, top: 60, padding: "20px 40px", border: `6px solid ${C.ink}`, borderRadius: 12, background: "#FFFDF7", fontFamily: FONT, fontSize: 54, color: C.ink, transform: `rotate(-1deg) scale(${0.85 + 0.15 * sign})`, opacity: sign, display: "flex", alignItems: "center", gap: 26 }}>
        {t.sign}
        <span style={{ display: "inline-block", fontSize: 110, color: C.accent, lineHeight: 1, transform: `scale(${zero})`, border: `5px solid ${C.ink}`, borderRadius: 10, padding: "0 22px", background: C.paper }}>0</span>
      </div>
      <div style={{ position: "absolute", left: 130, top: 330, fontFamily: TITLE_FONT, fontSize: 170, color: C.ink, opacity: windowIn(frame, 30, 999, 8), transform: `scale(${0.8 + 0.2 * pop(frame, 30)})`, transformOrigin: "left center" }}>
        {t.subscribe}
      </div>
      <div style={{ position: "absolute", left: 140, top: 540, fontFamily: FONT, fontSize: 84, color: C.ink, opacity: windowIn(frame, 70, 999, 8) }}>
        <Rich text={t.ifYouRemember} />
      </div>
      <Caption text={t.next} from={4.4} to={8.2} pos="bottom" y={985} size={56} />
    </AbsoluteFill>
  );
};
