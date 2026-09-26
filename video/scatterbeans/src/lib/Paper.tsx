import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";
import { C, H, W } from "./theme";

/** Loads Fredoka from /public before any frame renders. */
export const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const f = new FontFace("Fredoka", `url(${staticFile("fonts/Fredoka.woff2")})`, { weight: "300 700" });
    f.load()
      .then((l) => {
        document.fonts.add(l);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const Bg: React.FC<{ color?: string }> = ({ color = C.bg }) => <AbsoluteFill style={{ backgroundColor: color }} />;

/** Full-frame SVG in 1080×1920 world coords. */
export const Stage: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}>
    {children}
  </svg>
);
