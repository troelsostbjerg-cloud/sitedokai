import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { pop, windowIn } from "../lib/anim";
import { Paper, Sketch } from "../lib/Paper";
import { poseAt } from "../lib/poses";
import { StickFigure, Who } from "../lib/StickFigure";
import { C, FONT } from "../lib/theme";
import { Rich, useCopy } from "../lib/UI";

/** Recurring series element: a pinned "ADHD-FAKTA" note with the character pointing at it. */
const Fact: React.FC<{ tag: string; lines: [string, string, string]; who: Who }> = ({ tag, lines, who }) => {
  const frame = useCurrentFrame();
  const card = pop(frame, 4, 10);
  const pose = poseAt([[0, "stand"], [20, "point"], [120, "think"]], frame);
  const line = (i: number, from: number, size: number, color = C.ink) => (
    <div style={{ fontFamily: FONT, fontSize: size, color, lineHeight: 1.15, marginTop: 26, opacity: windowIn(frame, from, 9999, 8), transform: `translateY(${(1 - pop(frame, from)) * 20}px)` }}>
      <Rich text={lines[i]} />
    </div>
  );
  return (
    <AbsoluteFill>
      <Paper />
      <Sketch>
        <StickFigure x={1700} y={960} scale={1.5} pose={pose} who={who} facing={-1} mouth={frame > 120 ? "smile" : "neutral"} look={frame > 120 ? "camera" : "side"} />
        <path d="M0 960 H1920" stroke={C.ink} strokeWidth={6} />
      </Sketch>
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 150,
          width: 1280,
          padding: "50px 60px 60px",
          background: "#FFFDF7",
          border: `6px solid ${C.ink}`,
          borderRadius: 14,
          transform: `rotate(-1.8deg) scale(${0.8 + 0.2 * card})`,
          opacity: card,
          boxShadow: `14px 14px 0 ${C.soft}`,
        }}
      >
        <div style={{ position: "absolute", top: -22, left: "50%", width: 44, height: 44, borderRadius: 22, background: C.accent, border: `5px solid ${C.ink}` }} />
        <div style={{ display: "inline-block", fontFamily: FONT, fontSize: 46, color: C.paper, background: C.accent, padding: "4px 22px", borderRadius: 10, letterSpacing: 2 }}>{tag}</div>
        {line(0, 18, 84)}
        {line(1, 60, 58)}
        {line(2, 120, 58)}
      </div>
    </AbsoluteFill>
  );
};

export const SceneFactBo: React.FC = () => {
  const t = useCopy().factBo;
  return <Fact tag={t.tag} lines={[t.line1, t.line2, t.line3]} who="bo" />;
};
export const SceneFactLise: React.FC = () => {
  const t = useCopy().factLise;
  return <Fact tag={t.tag} lines={[t.line1, t.line2, t.line3]} who="lise" />;
};
