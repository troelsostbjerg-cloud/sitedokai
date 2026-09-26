import React, { createContext, useContext } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COPY, Lang } from "../content";
import { pop, windowIn } from "./anim";
import { C, FONT } from "./theme";

export const LangCtx = createContext<Lang>("en");
export const useCopy = () => COPY[useContext(LangCtx)];

/** "*word*" → accent colour. */
export const Rich: React.FC<{ text: string; accent?: string }> = ({ text, accent = C.accent }) => (
  <>
    {text.split("*").map((part, i) => (i % 2 ? <span key={i} style={{ color: accent }}>{part}</span> : <span key={i}>{part}</span>))}
  </>
);

/**
 * Caption sticker: white rounded card that bounces in. Frames are scene-relative.
 * Kept in the upper third – the Shorts/Reels UI covers the bottom and the right edge.
 */
export const Sticker: React.FC<{ text: string; from: number; to: number; y?: number; size?: number; rot?: number }> = ({
  text, from, to, y = 170, size = 76, rot = -2,
}) => {
  const frame = useCurrentFrame();
  if (frame < from - 1 || frame > to + 1) return null;
  const s = pop(frame, from, 9);
  const o = windowIn(frame, from, to, 5);
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          maxWidth: 900,
          padding: "20px 40px 26px",
          background: C.white,
          border: `7px solid ${C.line}`,
          borderRadius: 40,
          boxShadow: `0 10px 0 ${C.line}`,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.08,
          color: C.line,
          textAlign: "center",
          transform: `scale(${interpolate(s, [0, 1], [0.5, 1])}) rotate(${rot}deg)`,
        }}
      >
        <Rich text={text} />
      </div>
    </div>
  );
};

/** Small counter chip, e.g. "Open doors: 3". */
export const Chip: React.FC<{ label: React.ReactNode; value: string | number; changedAt: number; from: number; to: number; y?: number; x?: number }> = ({
  label, value, changedAt, from, to, y = 610, x = 50,
}) => {
  const frame = useCurrentFrame();
  const o = windowIn(frame, from, to, 6);
  if (o <= 0) return null;
  const bump = frame >= changedAt ? 1 + 0.4 * (1 - pop(frame, changedAt, 8)) : 1;
  return (
    <div
      style={{
        position: "absolute", top: y, left: x, opacity: o, fontFamily: FONT, fontWeight: 600, fontSize: 50, color: C.line,
        background: C.white, border: `6px solid ${C.line}`, borderRadius: 30, padding: "6px 26px", transform: "rotate(-3deg)",
        display: "flex", gap: 14, alignItems: "center",
      }}
    >
      {label}
      <span style={{ display: "inline-block", color: C.accent, fontWeight: 700, fontSize: 64, transform: `scale(${bump})` }}>{value}</span>
    </div>
  );
};

/** SVG speech bubble (world coords) with tail to (tx, ty). */
export const Bubble: React.FC<{ cx: number; cy: number; w: number; h?: number; tx: number; ty: number; text: string; frame: number; from: number; to: number; size?: number; bold?: boolean }> = ({
  cx, cy, w, h = 120, tx, ty, text, frame, from, to, size = 56, bold,
}) => {
  if (frame < from || frame > to) return null;
  const s = pop(frame, from, 9);
  const o = windowIn(frame, from, to, 4);
  const x = cx - w / 2;
  const y = cy - h / 2;
  const r = h / 2;
  const bx = Math.max(x + r, Math.min(x + w - r, tx));
  return (
    <g opacity={o} transform={`translate(${tx} ${ty}) scale(${s}) translate(${-tx} ${-ty})`}>
      <path d={`M${bx - 26} ${y + h - 4} L${tx} ${ty} L${bx + 26} ${y + h - 4} Z`} fill={C.white} stroke={C.line} strokeWidth={7} strokeLinejoin="round" />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={C.white} stroke={C.line} strokeWidth={7} />
      <path d={`M${bx - 22} ${y + h - 6} L${bx + 22} ${y + h - 6}`} stroke={C.white} strokeWidth={12} />
      <text x={cx} y={cy + size * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={bold ? 700 : 600} fontSize={size} fill={C.line}>{text}</text>
    </g>
  );
};

/** Round thought bubble with an icon (children centred on 0,0). */
export const Thought: React.FC<{ x: number; y: number; ax: number; ay: number; frame: number; from: number; to: number; r?: number; children: React.ReactNode }> = ({
  x, y, ax, ay, frame, from, to, r = 80, children,
}) => {
  if (frame < from || frame > to) return null;
  const s = pop(frame, from, 9);
  const o = windowIn(frame, from, to, 4);
  const st = { fill: C.white, stroke: C.line, strokeWidth: 6 };
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      <circle cx={ax + (x - ax) * 0.3} cy={ay + (y - ay) * 0.3} r={10} {...st} />
      <circle cx={ax + (x - ax) * 0.55} cy={ay + (y - ay) * 0.55} r={16} {...st} />
      <circle cx={x} cy={y} r={r} {...st} />
      <g transform={`translate(${x} ${y})`}>{children}</g>
    </g>
  );
};

/** Pop-art sound word, e.g. "BZZ", "WOOF!", "BONK". */
export const Sfx: React.FC<{ x: number; y: number; text: string; frame: number; from: number; to: number; size?: number; rot?: number; color?: string }> = ({
  x, y, text, frame, from, to, size = 90, rot = -8, color = C.accent,
}) => {
  if (frame < from || frame > to) return null;
  const s = pop(frame, from, 7);
  return (
    <text
      x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={size} fill={color} stroke={C.line} strokeWidth={6}
      paintOrder="stroke" transform={`rotate(${rot} ${x} ${y}) translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}
      opacity={windowIn(frame, from, to, 4)}
    >
      {text}
    </text>
  );
};

export const Heart: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 22 C-44 -8 -34 -44 0 -24 C34 -44 44 -8 0 22 Z" fill={C.accent} stroke={C.line} strokeWidth={6} strokeLinejoin="round" />
);

/** End card: series logo + the only CTA that is honest for this audience. */
export const EndCard: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = useCopy().end;
  if (frame < from) return null;
  const s = pop(frame, from, 10);
  const s2 = pop(frame, from + 10, 10);
  const letters = t.series.split("");
  const cols = [C.bo, C.lise, C.dog];
  return (
    <div style={{ position: "absolute", top: 170, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 118, transform: `scale(${s}) rotate(-3deg)`, lineHeight: 1 }}>
        {letters.map((ch, i) => (
          <span key={i} style={{ color: ch === " " ? undefined : cols[i % 3], WebkitTextStroke: `5px ${C.line}`, paintOrder: "stroke fill", display: "inline-block", transform: `translateY(${Math.sin(frame / 5 + i) * 5}px)` }}>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </div>
      <div style={{ transform: `scale(${s2})`, background: C.white, border: `7px solid ${C.line}`, borderRadius: 40, padding: "14px 36px 20px", fontFamily: FONT, fontWeight: 600, fontSize: 62, color: C.line, boxShadow: `0 10px 0 ${C.line}` }}>
        <Rich text={t.follow} />
      </div>
    </div>
  );
};

/** Tiny clock icon for chips. */
export const ClockIcon: React.FC = () => (
  <svg width={46} height={46} viewBox="-26 -26 52 52">
    <circle r={21} fill={C.white} stroke={C.line} strokeWidth={5} />
    <path d="M0 0 V-13 M0 0 L9 5" stroke={C.line} strokeWidth={5} strokeLinecap="round" />
  </svg>
);
