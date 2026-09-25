import React, { createContext, useContext } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COPY, Lang } from "../content";
import { pop, windowIn } from "./anim";
import { C, FONT, FPS } from "./theme";

export const LangCtx = createContext<Lang>("da");
export const useCopy = () => COPY[useContext(LangCtx)];

/** Renders "*word*" segments in the accent colour. */
export const Rich: React.FC<{ text: string; accent?: string }> = ({ text, accent = C.accent }) => (
  <>
    {text.split("*").map((part, i) =>
      i % 2 ? (
        <span key={i} style={{ color: accent }}>
          {part}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    )}
  </>
);

/** Text card that pops in and fades out. Times in seconds (scene-relative). */
export const Caption: React.FC<{
  text: string;
  from: number;
  to: number;
  pos?: "top" | "bottom" | "center";
  size?: number;
  y?: number;
  color?: string;
}> = ({ text, from, to, pos = "top", size = 76, y, color = C.ink }) => {
  const frame = useCurrentFrame();
  const f0 = from * FPS;
  const f1 = to * FPS;
  if (frame < f0 - 1 || frame > f1 + 1) return null;
  const s = pop(frame, f0);
  const o = windowIn(frame, f0, f1, 7);
  const top = y ?? (pos === "top" ? 70 : pos === "bottom" ? 900 : 470);
  return (
    <div
      style={{
        position: "absolute",
        left: 100,
        right: 100,
        top,
        textAlign: "center",
        fontFamily: FONT,
        fontSize: size,
        lineHeight: 1.1,
        color,
        opacity: o,
        transform: `scale(${0.88 + 0.12 * s}) rotate(${interpolate(s, [0, 1], [-2, 0])}deg)`,
        textShadow: `0 0 18px ${C.paper}, 0 0 8px ${C.paper}`,
      }}
    >
      <Rich text={text} />
    </div>
  );
};

/** Small counter chip in the top-right corner with a bump when the value changes. */
export const Counter: React.FC<{
  label: string;
  value: number;
  changedAt: number; // frame of last change
  from: number; // frame
  to: number; // frame
  side?: "left" | "right";
  vpos?: "top" | "bottom";
}> = ({ label, value, changedAt, from, to, side = "right", vpos = "top" }) => {
  const frame = useCurrentFrame();
  const o = windowIn(frame, from, to, 8);
  if (o <= 0) return null;
  const bump = 1 + 0.35 * Math.max(0, 1 - pop(frame, changedAt, 8)) * (frame >= changedAt ? 1 : 0);
  return (
    <div
      style={{
        position: "absolute",
        top: vpos === "top" ? 40 : 962,
        [side]: 60,
        opacity: o,
        fontFamily: FONT,
        fontSize: 54,
        color: C.ink,
        border: `4px solid ${C.ink}`,
        borderRadius: 18,
        padding: "6px 22px",
        background: C.paper,
        display: "flex",
        alignItems: "center",
        gap: 16,
        transform: "rotate(-1.5deg)",
      }}
    >
      {label}:
      <span style={{ color: C.accent, fontSize: 72, display: "inline-block", transform: `scale(${bump})`, minWidth: 34, textAlign: "center" }}>
        {value}
      </span>
    </div>
  );
};

/** Speech bubble in SVG world coords, tail pointing to (tx, ty). */
export const Bubble: React.FC<{
  x: number;
  y: number;
  w: number;
  h?: number;
  tx: number;
  ty: number;
  text: string;
  frame: number;
  from: number;
  to: number;
  size?: number;
}> = ({ x, y, w, h = 110, tx, ty, text, frame, from, to, size = 54 }) => {
  if (frame < from || frame > to) return null;
  const s = pop(frame, from);
  const o = windowIn(frame, from, to, 5);
  const cx = x + w / 2;
  const by = y + h;
  return (
    <g opacity={o} transform={`translate(${tx} ${ty}) scale(${0.6 + 0.4 * s}) translate(${-tx} ${-ty})`}>
      <path
        d={`M${x + 30} ${y} H${x + w - 30} Q${x + w} ${y} ${x + w} ${y + 30} V${by - 30} Q${x + w} ${by} ${x + w - 30} ${by}
            H${Math.min(cx + 30, x + w - 40)} L${tx} ${ty} L${Math.min(cx - 10, x + w - 80)} ${by} H${x + 30} Q${x} ${by} ${x} ${by - 30} V${y + 30} Q${x} ${y} ${x + 30} ${y} Z`}
        fill={C.paper}
        stroke={C.ink}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <text x={cx} y={y + h / 2 + size * 0.34} textAnchor="middle" fontFamily={FONT} fontSize={size} fill={C.ink} stroke="none">
        {text}
      </text>
    </g>
  );
};

/** Thought bubble with an icon drawn inside (icon centred on 0,0, ~80px). */
export const Thought: React.FC<{
  x: number;
  y: number;
  ax: number; // anchor near the head
  ay: number;
  frame: number;
  from: number;
  to: number;
  children: React.ReactNode;
  r?: number;
}> = ({ x, y, ax, ay, frame, from, to, children, r = 70 }) => {
  if (frame < from || frame > to) return null;
  const s = pop(frame, from);
  const o = windowIn(frame, from, to, 5);
  const bumps = 9;
  const pts = Array.from({ length: bumps }, (_, i) => {
    const a = (i / bumps) * Math.PI * 2;
    return { x: x + Math.cos(a) * r * 1.25, y: y + Math.sin(a) * r };
  });
  let d = `M${pts[0].x} ${pts[0].y}`;
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % bumps];
    const mx = (p.x + q.x) / 2;
    const my = (p.y + q.y) / 2;
    const ox = (mx - x) * 0.45;
    const oy = (my - y) * 0.45;
    d += ` Q${mx + ox} ${my + oy} ${q.x} ${q.y}`;
  });
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      <circle cx={ax + (x - ax) * 0.25} cy={ay + (y - ay) * 0.25} r={9} fill={C.paper} stroke={C.ink} strokeWidth={5} />
      <circle cx={ax + (x - ax) * 0.5} cy={ay + (y - ay) * 0.5} r={14} fill={C.paper} stroke={C.ink} strokeWidth={5} />
      <path d={d} fill={C.paper} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <g transform={`translate(${x} ${y})`}>{children}</g>
    </g>
  );
};

/** Plain SVG label (world coords). */
export const Label: React.FC<{ x: number; y: number; text: string; size?: number; color?: string; rotate?: number; anchor?: "start" | "middle" | "end"; font?: string }> = ({
  x, y, text, size = 40, color = C.ink, rotate = 0, anchor = "middle", font = FONT,
}) => (
  <text x={x} y={y} fontFamily={font} fontSize={size} fill={color} stroke="none" textAnchor={anchor} transform={`rotate(${rotate} ${x} ${y})`}>
    {text}
  </text>
);
