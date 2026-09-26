import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bean } from "./lib/Bean";
import { Dog, Squirrel } from "./lib/Dog";
import { Bg, Stage, useFonts } from "./lib/Paper";
import { C, FONT } from "./lib/theme";

export const CharSheet: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Bg />
      <Stage>
        <text x={540} y={140} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={90} fill={C.line}>The Scatterbeans</text>
        <Bean x={300} y={560} who="bo" s={1.5} armL={30} armR={150} eyes="open" mouth="smile" />
        <Bean x={760} y={560} who="lise" s={1.5} armL={20} armR={30} eyes="happy" mouth="grin" facing={-0.5} />
        <Bean x={180} y={950} who="bo" s={1} walk={f / 3} facing={1} eyes="wide" mouth="o" />
        <Bean x={430} y={950} who="lise" s={1} squash={0.75} eyes="sparkle" mouth="open" frame={f} armL={160} armR={160} />
        <Bean x={700} y={950} who="bo" s={1} lift={80} squash={1.15} armR={175} armL={40} eyes="closed" mouth="grin" />
        <Bean x={930} y={950} who="lise" s={1} dirty eyes="half" mouth="flat" tilt={-8} />
        <Bean x={250} y={1250} who="bo" s={1} flat />
        <Bean x={560} y={1250} who="bo" s={1} eyes="dizzy" mouth="wobble" frame={f} />
        <Squirrel x={850} y={1250} frame={f} />
        <Dog x={250} y={1600} frame={f} />
        <Dog x={560} y={1600} frame={f} run eyes="sparkle" mouth="open" s={0.9} />
        <Dog x={860} y={1600} frame={f} sit headTilt={-18} eyes="wide" s={0.9} facing={-1} />
        <text x={540} y={1800} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={60} fill={C.line}>Bo · Lise · Noodle</text>
      </Stage>
    </AbsoluteFill>
  );
};
