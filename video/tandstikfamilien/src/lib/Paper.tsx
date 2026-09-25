import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { C, H, W } from "./theme";

/** Loads the two handwritten fonts from /public before any frame renders. */
export const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const fonts = [
      new FontFace("Patrick Hand", `url(${staticFile("fonts/PatrickHand.woff2")})`),
      new FontFace("Caveat Brush", `url(${staticFile("fonts/CaveatBrush.woff2")})`),
    ];
    Promise.all(fonts.map((f) => f.load()))
      .then((loaded) => {
        loaded.forEach((f) => document.fonts.add(f));
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

/** Off-white paper with a faint grain. */
export const Paper: React.FC<{ tint?: string }> = ({ tint = C.paper }) => (
  <AbsoluteFill style={{ backgroundColor: tint }}>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={3} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter="url(#grain)" opacity={0.07} />
    </svg>
  </AbsoluteFill>
);

/**
 * Full-frame SVG whose drawing "boils" like hand-drawn animation.
 * Children are in 1920×1080 coordinates. `boil={false}` disables the wobble.
 */
export const Sketch: React.FC<{
  children: React.ReactNode;
  boil?: boolean;
  id?: string;
  style?: React.CSSProperties;
}> = ({ children, boil = true, id = "boil", style }) => {
  const frame = useCurrentFrame();
  const seed = (Math.floor(frame / 8) % 5) + 1;
  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}
    >
      <defs>
        <filter id={id} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed={seed} />
          <feDisplacementMap in="SourceGraphic" scale="3.2" />
        </filter>
      </defs>
      <g filter={boil ? `url(#${id})` : undefined}>{children}</g>
    </svg>
  );
};
