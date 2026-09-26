import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { kf, pop, step, walking } from "../lib/anim";
import { Bean, Eyes, Mouth } from "../lib/Bean";
import { Camera } from "../lib/Camera";
import { Dog } from "../lib/Dog";
import { Backyard, DirtSpray, DustCloud, GardenV1, GardenV2, GardenV3, GardenV4, GROUND, Rose as RosePlant, Sun } from "../lib/Garden";
import { Bg, Stage } from "../lib/Paper";
import { C, H, W } from "../lib/theme";
import { Chip, ClockIcon, EndCard, Heart, Sticker, useCopy } from "../lib/UI";

const Z = 1.35;
const CX = 560;
const CY = 1250;
const toScreen = (x: number, y: number) => ({ x: (x - CX) * Z + W / 2, y: (y - CY) * Z + H / 2 });

// Dust-cloud windows; the garden switches version at each midpoint.
const CLOUDS: [number, number][] = [[225, 265], [315, 355], [405, 445], [495, 535]];
const REVEAL = CLOUDS.map(([a, b]) => (a + b) / 2);

/** Short #2 – "One Rose": Lise plants one rose. Hyperfocus plants a whole new garden. Four times. */
export const Rose: React.FC = () => {
  const f = useCurrentFrame();
  const t = useCopy().rose;
  const version = REVEAL.filter((r) => f >= r).length;
  const cloud = CLOUDS.find(([a, b]) => f >= a && f < b);
  const cloudK = cloud ? Math.min(1, (f - cloud[0]) / 6, (cloud[1] - f) / 6) : 0;

  // ---------- Lise ----------
  const liseX = (fr: number) => kf(fr, [[0, 200], [45, 420], [150, 420], [225, 420], [245, 290]]);
  const lx = liseX(f);
  const digging = f >= 60 && f < 150;
  const hyper = f >= 160 && f < 225;
  const between = version > 0 && !cloud;
  const armBounce = Math.floor(f / 8) % 2;
  const liseArmR = f < 50 ? 50 : digging ? (armBounce ? 70 : 130) : between && f < 545 ? (armBounce ? 150 : 165) : f >= 720 ? 110 : 30;
  const liseArmL = digging ? 30 : between && f < 545 ? (armBounce ? 165 : 150) : f >= 720 ? 110 : 25;
  const liseEyes = step(f, [[0, "happy"], [60, "open"], [160, "sparkle"], [545, "happy"], [665, "wide"], [705, "happy"]] as [number, Eyes][]);
  const liseMouth = step(f, [[0, "smile"], [60, "smile"], [160, "open"], [545, "grin"], [665, "o"], [705, "grin"]] as [number, Mouth][]);

  // ---------- Noodle ----------
  const dogKeys: [number, number][] = [[0, 1200], [80, 1200], [110, 700], [160, 700], [225, 880], [640, 880], [660, 720], [692, 720], [715, 480]];
  const dogX = (fr: number) => kf(fr, dogKeys, (v) => v);
  const dx = dogX(f);
  const dogRun = walking(f, dogX, 1) !== undefined;
  const dogDig = (f >= 110 && f < 160) || (f >= 662 && f < 692);
  const dogEyes = step(f, [[0, "open"], [110, "happy"], [160, "sparkle"], [545, "open"], [715, "happy"]] as [number, Eyes][]);
  const hasRose = f >= 692;

  // ---------- sky: morning → sunset ----------
  const sky = interpolateColors(f, [0, REVEAL[0], REVEAL[1], REVEAL[2], REVEAL[3]], ["#D6EEFF", "#CFEAFF", "#E3EDFF", "#FFDDB8", "#F2C6D9"]);
  const sunP = kf(f, [[0, 0.1], [REVEAL[3], 0.95]], (v) => v);
  const ring = kf(f, [[160, 1500], [178, 360], [222, 360], [232, 1500]]);
  const head = toScreen(420, GROUND - 250);

  return (
    <AbsoluteFill>
      <Bg color={sky} />
      <Stage>
        <Camera f={f} keys={[[0, CX]]} cy={CY} z={Z}>
          <Sun x={250 + 700 * sunP} y={1020 - 170 * Math.sin(Math.PI * sunP)} frame={f} />
          <Backyard />
          {version === 0 && f >= 55 && <RosePlant x={560} y={GROUND + 10} s={0.8} pot />}
          {version === 1 && <GardenV1 />}
          {version === 2 && <GardenV2 frame={f} />}
          {version === 3 && <GardenV3 />}
          {version === 4 && <GardenV4 rose={!hasRose && f < 690} hole={f >= 690} />}
          {!cloud && (
            <Dog
              x={dx}
              y={GROUND + 30}
              s={0.9}
              facing={-1}
              frame={f}
              run={dogRun}
              dig={dogDig}
              sit={!dogRun && !dogDig && f >= 160}
              eyes={dogEyes}
              wag={f >= 160 ? 3 : 1.6}
              hold={hasRose ? <g transform="rotate(-80) scale(0.6) translate(0 150)"><RosePlant x={0} y={0} /></g> : undefined}
            />
          )}
          {!cloud && (
            <Bean
              x={lx}
              y={GROUND + 20}
              s={1.3}
              who="lise"
              facing={f < 60 ? 0.6 : f >= 545 ? 0.5 : 0}
              squash={digging ? 0.8 : 1}
              tilt={digging ? 12 : 0}
              armL={liseArmL}
              armR={liseArmR}
              eyes={liseEyes}
              mouth={liseMouth}
              walk={walking(f, liseX)}
              dirty={version > 0}
              frame={f}
              holdR={f < 52 ? <g transform="translate(0 70) scale(0.6)"><RosePlant x={0} y={0} pot /></g> : undefined}
            />
          )}
          {digging && <DirtSpray x={520} y={GROUND} frame={f} dir={1} />}
          {dogDig && <DirtSpray x={dx - 40} y={GROUND + 10} frame={f} dir={1} />}
          {cloud && (
            <g opacity={cloudK}>
              <DustCloud x={640} y={GROUND - 150} frame={f} />
            </g>
          )}
          {/* hyperfocus sparkles */}
          {hyper &&
            Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2 + f / 10;
              const r = 190 + 20 * Math.sin(f / 3 + i);
              return <path key={i} transform={`translate(${420 + Math.cos(a) * r} ${GROUND - 170 + Math.sin(a) * r * 0.8})`} d="M0 -22 Q4 -4 22 0 Q4 4 0 22 Q-4 4 -22 0 Q-4 -4 0 -22 Z" fill={C.spark} stroke={C.line} strokeWidth={4} />;
            })}
          {f >= 720 &&
            [0, 1, 2, 3].map((i) => {
              const k = pop(f, 720 + i * 7);
              const up = Math.max(0, f - 720 - i * 7) * 2;
              return k > 0 ? <Heart key={i} x={330 + i * 60} y={GROUND - 330 - up - i * 16} s={k * (0.8 + (i % 2) * 0.3)} /> : null;
            })}
        </Camera>
      </Stage>

      {/* hyperfocus tunnel */}
      {f >= 160 && f < 232 && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <path
            fillRule="evenodd"
            d={`M0 0 H${W} V${H} H0 Z M${head.x + ring} ${head.y} a${ring} ${ring} 0 1 0 ${-2 * ring} 0 a${ring} ${ring} 0 1 0 ${2 * ring} 0 Z`}
            fill={C.line}
            opacity={0.45}
          />
          <circle cx={head.x} cy={head.y} r={ring} fill="none" stroke={C.spark} strokeWidth={14} />
        </svg>
      )}

      <Chip label={t.version} value={version} changedAt={REVEAL[Math.max(0, version - 1)]} from={REVEAL[0] - 2} to={780} y={1420} />
      <Chip label={<ClockIcon />} value={t.times[Math.min(version, 4)]} changedAt={REVEAL[Math.max(0, version - 1)]} from={160} to={780} y={1420} x={430} />
      <Sticker text={t.plan} from={4} to={80} />
      <Sticker text={t.helping} from={92} to={158} rot={2} />
      <Sticker text={t.hyper} from={165} to={226} />
      <Sticker text={t.one} from={550} to={640} rot={2} />
      <Sticker text={t.zero} from={680} to={776} />
      <EndCard from={780} />
    </AbsoluteFill>
  );
};
