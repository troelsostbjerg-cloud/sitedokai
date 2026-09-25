import React from "react";
import { H, W } from "./theme";

/** Zoom `z` centred on world point (cx, cy). */
export const Camera: React.FC<{ cx: number; cy: number; z: number; children: React.ReactNode }> = ({ cx, cy, z, children }) => (
  <g transform={`translate(${W / 2} ${H / 2}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>
);
