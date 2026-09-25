import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { kf, step, windowIn } from "../lib/anim";
import { DustCloud, Fence, GardenV1, GardenV2, GardenV3, GardenV4, GROUND, HouseWall, Rose, Sun } from "../lib/Garden";
import { Paper, Sketch } from "../lib/Paper";
import { poseAt } from "../lib/poses";
import { headTop, StickFigure } from "../lib/StickFigure";
import { C, FONT, H, W } from "../lib/theme";
import { Caption, Counter, useCopy } from "../lib/UI";

// Cloud windows: [start, end]; the garden switches version at the midpoint.
const CLOUDS: [number, number][] = [[300, 372], [452, 512], [572, 632], [692, 752]];
const REVEALS = CLOUDS.map(([a, b]) => Math.round((a + b) / 2));

/** Lise was going to plant one rose. Hyperfocus had other plans. */
export const SceneLise: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useCopy().lise;
  const version = frame < REVEALS[0] ? 0 : frame < REVEALS[1] ? 1 : frame < REVEALS[2] ? 2 : frame < REVEALS[3] ? 3 : 4;
  const inCloud = CLOUDS.find(([a, b]) => frame >= a && frame < b);
  const cloudIn = inCloud ? windowIn(frame, inCloud[0], inCloud[1], 10) : 0;

  // Lise
  const x = kf(frame, [[0, 140], [60, 560], [300, 560], [372, 380]]);
  const pose = poseAt(
    [
      [0, "walk"], [60, "stand"], [70, "kneel"], [150, "stand"], [175, "think"], [228, "stand"],
      [372, "proud"], [512, "cheer"], [540, "proud"], [632, "proud"], [752, "kneel"],
    ],
    frame,
  );
  const facing: 1 | -1 = 1;
  const roseInHand = frame < 88;
  const top = headTop(x, GROUND, pose, 1.6, facing);

  // Time-lapse sun
  const times = t.times;
  const sunP = kf(frame, [[0, 0.2], [REVEALS[0], 0.32], [REVEALS[1], 0.5], [REVEALS[2], 0.7], [REVEALS[3], 0.93]]);
  const sunX = 380 + 1300 * sunP;
  const sunY = 400 - 190 * Math.sin(Math.PI * sunP);
  const dusk = interpolate(sunP, [0.75, 0.93], [0, 0.22], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Hyperfocus tunnel
  const tunnelR = kf(frame, [[228, 1800], [250, 380], [290, 380], [305, 1800]]);
  const showTunnel = frame >= 228 && frame < 305;

  return (
    <AbsoluteFill>
      <Paper />
      <Sketch>
        <Sun x={sunX} y={sunY} frame={frame} />
        <Fence x0={290} x1={1920} />
        <HouseWall />
        <path d={`M0 ${GROUND} H${W}`} stroke={C.ink} strokeWidth={6} />
        {version === 1 && <GardenV1 />}
        {version === 2 && <GardenV2 frame={frame} />}
        {version === 3 && <GardenV3 />}
        {version === 4 && <GardenV4 />}
        {version === 0 && frame >= 88 && <Rose x={690} y={GROUND + 10} pot scale={0.9} />}
        {!inCloud && (
          <StickFigure
            x={x}
            y={GROUND}
            scale={1.6}
            facing={facing}
            pose={pose}
            who="lise"
            dirty={version > 0}
            mouth={version === 4 ? "smile" : version > 0 ? "grin" : frame > 228 ? "o" : "smile"}
            look={version > 0 && frame > REVEALS[version - 1] + 20 ? "camera" : "side"}
            holdFront={roseInHand ? <g transform="translate(0 10) scale(0.8)"><Rose x={0} y={60} pot /></g> : undefined}
          />
        )}
        {inCloud && (
          <g opacity={cloudIn}>
            <DustCloud x={960} y={GROUND - 170} frame={frame} s={1.1} />
          </g>
        )}
        {/* hyperfocus sparks */}
        {frame >= 228 && frame < 300 && (
          <g stroke={C.accent} strokeWidth={8} strokeLinecap="round">
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const k = 1 + 0.25 * Math.sin(frame / 2 + i);
              return <path key={i} d={`M${top.x + Math.cos(a) * 70 * k} ${top.y + 45 + Math.sin(a) * 70 * k} l${Math.cos(a) * 30} ${Math.sin(a) * 30}`} />;
            })}
          </g>
        )}
      </Sketch>
      {showTunnel && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <path
            fillRule="evenodd"
            d={`M0 0 H${W} V${H} H0 Z M${top.x + tunnelR} ${top.y + 45} a${tunnelR} ${tunnelR} 0 1 0 ${-2 * tunnelR} 0 a${tunnelR} ${tunnelR} 0 1 0 ${2 * tunnelR} 0 Z`}
            fill={C.night}
            opacity={0.55}
          />
          <circle cx={top.x} cy={top.y + 45} r={tunnelR} fill="none" stroke={C.accent} strokeWidth={10} />
        </svg>
      )}
      <AbsoluteFill style={{ backgroundColor: C.night, opacity: dusk, pointerEvents: "none" }} />

      {frame >= 230 && (
        <div style={{ position: "absolute", right: 60, top: 40, fontFamily: FONT, fontSize: 54, color: C.ink, border: `4px solid ${C.ink}`, borderRadius: 18, padding: "6px 22px", background: C.paper, transform: "rotate(1.5deg)" }}>
          {step(frame, [[0, times[0]], [REVEALS[0], times[1]], [REVEALS[1], times[2]], [REVEALS[2], times[3]], [REVEALS[3], times[4]]])}
        </div>
      )}
      <Counter label={t.version} value={version} changedAt={REVEALS[Math.max(0, version - 1)]} from={REVEALS[0] - 4} to={960} vpos="bottom" side="left" />

      <Caption text={t.alsoAdhd} from={0.3} to={3.8} />
      <Caption text={t.justOneRose} from={3.9} to={7.5} />
      <Caption text={t.hyperfocus} from={7.6} to={10.2} size={96} />
      <Caption text={t.fourTimes} from={25.2} to={28.4} />
      <Caption text={t.result} from={28.5} to={32} size={96} />
    </AbsoluteFill>
  );
};
