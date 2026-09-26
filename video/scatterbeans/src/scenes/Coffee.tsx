import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { jump, kf, pop, step, walking } from "../lib/anim";
import { Bean, Eyes, Mouth } from "../lib/Bean";
import { Dog } from "../lib/Dog";
import { cabX, FLOOR, Kitchen, Milk, Mug, Phone, Pot } from "../lib/Kitchen";
import { Bg, Stage } from "../lib/Paper";
import { Camera } from "../lib/Camera";
import { C } from "../lib/theme";
import { Bubble, Chip, EndCard, Heart, Sfx, Sticker, useCopy } from "../lib/UI";

const S = 1.25;
// camera centre x over time (zoomed in 1.45×, so ~745px of the 1080px kitchen is visible)
const CAM: [number, number][] = [[0, 372], [150, 372], [200, 400], [250, 500], [380, 560], [420, 708], [470, 600], [650, 520], [700, 480], [840, 440]];
const opening = (f: number, at: number, dur = 10) => kf(f, [[at, 0], [at + dur, 1]]);

/** Short #1 – "The Coffee": Bo opens everything, closes nothing, except the fridge. */
export const Coffee: React.FC = () => {
  const f = useCurrentFrame();
  const t = useCopy().coffee;

  // ---------- Bo ----------
  const boKeys: [number, number][] = [
    [0, -150], [40, cabX(0)], [84, cabX(0)], [114, cabX(1)], [158, cabX(1)], [190, 370], [210, 370], [250, 470],
    [345, 470], [385, 660], [440, 660], [480, 470], [665, 470], [700, 300], [708, 262],
  ];
  const boX = (fr: number) => kf(fr, boKeys);
  const x = boX(f);
  const j1 = jump(f, 45, 200);
  const j2 = jump(f, 118, 200);
  const j3 = jump(f, 770, 60, 16);
  const lift = j1.lift + j2.lift + j3.lift;
  let squash = j1.squash * j2.squash * j3.squash;
  if (f >= 192 && f < 210) squash *= 0.86;
  const distracted = f >= 272 && f < 345;
  const facing = distracted ? (Math.floor((f - 272) / 12) % 2 ? -1 : 1) : f >= 440 && f < 480 ? -1 : f >= 560 && f < 770 ? -1 : 1;
  const armR = step(f, [
    [0, 25], [50, 175], [70, 30], [122, 175], [146, 30], [196, 70], [212, 30], [250, 110], [262, 70],
    [388, 100], [420, 60], [665, 40],
  ] as [number, number][]);
  const armL = step(f, [[0, 20], [60, 40], [500, 150], [545, 40]] as [number, number][]);
  const eyes = step(f, [
    [0, "half"], [60, "open"], [136, "wide"], [150, "open"], [272, "wide"], [345, "open"], [505, "closed"],
    [545, "wide"], [560, "open"], [700, "wide"], [770, "happy"],
  ] as [number, Eyes][]);
  const mouth = step(f, [
    [0, "flat"], [60, "smile"], [136, "o"], [150, "smile"], [272, "o"], [345, "smile"], [505, "o"], [545, "wobble"],
    [700, "open"], [770, "grin"],
  ] as [number, Mouth][]);
  const tilt = f >= 700 && f < 708 ? kf(f, [[700, 0], [708, -50]]) : 0;
  const flat = f >= 708 && f < 772;

  // ---------- Noodle ----------
  const dogKeys: [number, number][] = [
    [0, 1250], [205, 1250], [255, 150], [300, 620], [392, 620], [430, 180], [590, 180], [630, 690], [735, 690], [758, 560],
  ];
  const dogX = (fr: number) => kf(fr, dogKeys, (v) => v);
  const dx = dogX(f);
  const dogFacing: 1 | -1 = f < 255 ? -1 : f < 300 ? 1 : f < 590 ? -1 : f < 650 ? 1 : -1;
  const dogRun = walking(f, dogX, 1) !== undefined;
  const windowJump = f >= 300 && f < 385 ? Math.abs(Math.sin((f - 300) / 7)) * 70 : 0;
  const spin = f >= 650 && f < 722 ? (f - 650) * 22 : 0;
  const dogEyes = step(f, [[0, "sparkle"], [285, "wide"], [400, "open"], [600, "happy"], [650, "sparkle"], [722, "dizzy"], [740, "open"], [758, "happy"]] as [number, Eyes][]);
  const dogMouth = step(f, [[0, "tongue"], [300, "open"], [385, "tongue"]] as [number, Mouth][]);

  // ---------- props ----------
  const uppers = [opening(f, 58), opening(f, 130)];
  const lower = opening(f, 200);
  const fridge = kf(f, [[388, 0], [400, 1], [430, 1], [442, 0]]);
  const squirrel = kf(f, [[283, 0], [295, 1], [380, 1], [392, 0]]);
  const count = f < 60 ? 0 : f < 130 ? 1 : f < 200 ? 2 : 3;
  const changedAt = f < 130 ? 60 : f < 200 ? 130 : 200;

  const mug = <g transform="translate(0 30)"><Mug tilt={f >= 500 && f < 545 ? -30 : 0} /></g>;
  const holdR = f >= 262 && f < 405 ? <g transform="translate(0 10)"><Pot /></g> : f >= 415 ? <g transform="translate(0 40)"><Milk /></g> : undefined;

  return (
    <AbsoluteFill>
      <Bg />
      <Stage>
        <Camera f={f} keys={CAM} cy={1262} z={1.45}>
        <Kitchen frame={f} uppers={uppers} lower={lower} fridge={fridge} potOnMachine={f < 262} potInFridge={f >= 405} milkInFridge={f < 415} squirrel={squirrel} />
        <Dog x={dx} y={FLOOR + 20} s={0.95} facing={dogFacing} frame={f} run={dogRun} lift={windowJump} spin={spin} eyes={dogEyes} mouth={dogMouth} wag={dogRun ? 3 : 1.8} headTilt={f >= 600 && f < 650 ? -20 : 0} />
        <Bean
          x={x}
          y={FLOOR + 10}
          s={S}
          who="bo"
          facing={facing * 0.8}
          squash={squash}
          lift={lift}
          tilt={tilt}
          armL={armL}
          armR={armR}
          eyes={eyes}
          mouth={mouth}
          walk={walking(f, boX)}
          holdL={f >= 64 ? mug : undefined}
          holdR={holdR}
          flat={flat}
          frame={f}
        />
        {/* phone buzzing in the pocket */}
        {f >= 270 && f < 330 && (
          <g transform={`translate(${x - 150} ${FLOOR - 170})`}>
            <Phone frame={f} buzz />
          </g>
        )}
        <Sfx x={x - 170} y={FLOOR - 260} text={t.bzz} frame={f} from={272} to={330} size={80} />
        <Sfx x={700} y={FLOOR - 330} text={t.woof} frame={f} from={300} to={342} size={80} rot={8} />
        <Sfx x={740} y={FLOOR - 390} text={t.woof} frame={f} from={344} to={384} size={80} rot={-6} />
        {/* dizzy stars after the face-plant */}
        {flat && f >= 712 && (
          <g transform={`translate(262 ${FLOOR - 150})`}>
            {[0, 1, 2, 3].map((i) => {
              const a = (i / 4) * Math.PI * 2 + f / 6;
              return (
                <path key={i} transform={`translate(${Math.cos(a) * 80} ${Math.sin(a) * 22})`} d="M0 -16 Q3 -3 16 0 Q3 3 0 16 Q-3 3 -16 0 Q-3 -3 0 -16 Z" fill={C.spark} stroke={C.line} strokeWidth={4} />
              );
            })}
          </g>
        )}
        <Sfx x={300} y={FLOOR - 250} text={t.oof} frame={f} from={708} to={752} size={110} />
        {/* love */}
        {f >= 765 &&
          [0, 1, 2, 3].map((i) => {
            const k = pop(f, 765 + i * 6);
            const up = (f - 765 - i * 6) * 2.2;
            return k > 0 ? <Heart key={i} x={330 + i * 50 - 60} y={FLOOR - 330 - up - i * 20} s={k * (0.8 + (i % 2) * 0.3)} /> : null;
          })}
        <Bubble cx={470} cy={FLOOR - 450} w={560} tx={x - 10} ty={FLOOR - 330} text={t.where} frame={f} from={560} to={655} size={52} />
        </Camera>
      </Stage>

      <Chip label={t.counter} value={count} changedAt={changedAt} from={60} to={660} y={1420} />
      <Sticker text={t.wants} from={4} to={76} />
      <Sticker text={t.opens} from={88} to={150} rot={2} />
      <Sticker text={t.closes} from={156} to={222} />
      <Sticker text={t.only} from={415} to={490} rot={2} />
      <Sticker text={t.fridge} from={494} to={600} size={70} />
      <EndCard from={785} />
    </AbsoluteFill>
  );
};
