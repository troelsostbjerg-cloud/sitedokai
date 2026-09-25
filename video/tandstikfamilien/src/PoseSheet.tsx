import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Paper, Sketch, useFonts } from "./lib/Paper";
import { StickFigure } from "./lib/StickFigure";
import { POSES, resolvePose } from "./lib/poses";
import { Cat } from "./lib/Cat";
import { FONT } from "./lib/theme";

export const PoseSheet: React.FC = () => {
  useFonts();
  const frame = useCurrentFrame();
  const names = [...Object.keys(POSES), "walk"] as (keyof typeof POSES | "walk")[];
  return (
    <AbsoluteFill>
      <Paper />
      <Sketch>
        {names.map((n, i) => {
          const col = i % 9, row = Math.floor(i / 9);
          const who = i % 3 === 0 ? "bo" : i % 3 === 1 ? "lise" : "plain";
          return (
            <g key={n}>
              <StickFigure x={110 + col * 210} y={330 + row * 340} scale={1} pose={resolvePose(n, frame)} who={who} mouth={i % 2 ? "smile" : "neutral"} look={i === 4 ? "camera" : "side"} />
              <text x={110 + col * 210} y={370 + row * 340} textAnchor="middle" fontFamily={FONT} fontSize={30} fill="#1E1E1E">{n}</text>
            </g>
          );
        })}
        <Cat x={1500} y={1000} frame={frame} />
        <Cat x={1700} y={1000} frame={frame} look="camera" />
        <Cat x={1250} y={1000} frame={frame} walking />
        <text x={400} y={1040} fontFamily={FONT} fontSize={60} fill="#1E1E1E">Æbler, øl og år – ÆØÅ</text>
      </Sketch>
    </AbsoluteFill>
  );
};
