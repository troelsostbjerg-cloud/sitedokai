import React from "react";
import { AbsoluteFill } from "remotion";
import { Lang } from "./content";
import { Cat } from "./lib/Cat";
import { CoffeePot, Steam } from "./lib/Kitchen";
import { Paper, Sketch, useFonts } from "./lib/Paper";
import { POSES } from "./lib/poses";
import { StickFigure } from "./lib/StickFigure";
import { C, FONT, TITLE_FONT } from "./lib/theme";

const T = {
  da: { a: "Kaffen er i", b: "køleskabet.", c: "IGEN.", tag: "ADHD i hverdagen" },
  en: { a: "The coffee is", b: "in the fridge.", c: "AGAIN.", tag: "Everyday ADHD" },
};

/** YouTube thumbnail: one big joke, readable at phone size. */
export const Thumbnail: React.FC<{ lang: Lang }> = ({ lang }) => {
  useFonts();
  const t = T[lang];
  const S = { stroke: C.ink, strokeWidth: 9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <AbsoluteFill>
      <Paper />
      <Sketch boil={false}>
        {/* open fridge, big */}
        <g transform="translate(90 190)">
          <rect x={0} y={0} width={420} height={840} rx={20} fill="#FFFDF7" {...S} />
          <path d="M20 200 H400 M20 590 H400" {...S} strokeWidth={6} />
          <path d="M420 0 L560 -40 L560 880 L420 840 Z" fill={C.paper} {...S} />
          <g transform="translate(230 470) scale(1.9)">
            <CoffeePot />
          </g>
          <Steam x={140} y={395} frame={12} scale={1.4} />
          <Cat x={250} y={0} frame={0} scale={1.15} look="camera" facing={-1} />
        </g>
        <StickFigure x={820} y={1060} scale={2.7} pose={POSES.shock} who="lise" mouth="open" look="camera" />
        <text x={900} y={260} fontFamily={FONT} fontSize={220} fill={C.accent} transform="rotate(12 900 260)">!</text>
      </Sketch>
      <div style={{ position: "absolute", right: 70, top: 110, width: 900, textAlign: "right", fontFamily: TITLE_FONT, color: C.ink, lineHeight: 0.95 }}>
        <div style={{ fontSize: 150 }}>{t.a}</div>
        <div style={{ fontSize: 150 }}>{t.b}</div>
        <div style={{ fontSize: 230, color: C.accent, transform: "rotate(-4deg)", marginTop: 30 }}>{t.c}</div>
      </div>
      <div style={{ position: "absolute", right: 80, bottom: 70, fontFamily: FONT, fontSize: 60, color: C.paper, background: C.ink, padding: "8px 30px", borderRadius: 14, transform: "rotate(-2deg)" }}>
        {t.tag}
      </div>
    </AbsoluteFill>
  );
};
