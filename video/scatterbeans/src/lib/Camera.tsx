import React from "react";
import { kf } from "./anim";
import { H, W } from "./theme";

/** Zoomed camera following keyframed x; clamped so it never shows past the set edges. */
export const Camera: React.FC<{ f: number; keys: [number, number][]; cy: number; z: number; minX?: number; maxX?: number; children: React.ReactNode }> = ({
  f, keys, cy, z, minX = 0, maxX = W, children,
}) => {
  const half = W / 2 / z;
  const cx = Math.max(minX + half, Math.min(maxX - half, kf(f, keys)));
  return <g transform={`translate(${W / 2} ${H / 2}) scale(${z}) translate(${-cx} ${-cy})`}>{children}</g>;
};
