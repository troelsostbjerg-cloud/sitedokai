import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, Series, staticFile, useCurrentFrame } from "remotion";
import { MUSIC_VOLUME, SFX } from "./sfx";
import { Lang, SCENE_SECONDS } from "./content";
import { useFonts } from "./lib/Paper";
import { C, FPS } from "./lib/theme";
import { LangCtx } from "./lib/UI";
import { SceneBo } from "./scenes/Bo";
import { SceneHook, SceneRewind, SceneTitle } from "./scenes/Intro";
import { SceneFactBo, SceneFactLise } from "./scenes/Fact";
import { SceneLise } from "./scenes/Lise";
import { SceneHouse } from "./scenes/House";
import { SceneEnd, SceneEvening } from "./scenes/Outro";

export const SCENES: { id: keyof typeof SCENE_SECONDS; C: React.FC; frames: number }[] = (
  [
    ["hook", SceneHook],
    ["title", SceneTitle],
    ["rewind", SceneRewind],
    ["bo", SceneBo],
    ["factBo", SceneFactBo],
    ["lise", SceneLise],
    ["house", SceneHouse],
    ["factLise", SceneFactLise],
    ["evening", SceneEvening],
    ["end", SceneEnd],
  ] as [keyof typeof SCENE_SECONDS, React.FC][]
).map(([id, C]) => ({ id, C, frames: Math.round(SCENE_SECONDS[id] * FPS) }));

export const totalFrames = SCENES.reduce((a, s) => a + s.frames, 0);

export const Wrap: React.FC<{ lang: Lang; children: React.ReactNode }> = ({ lang, children }) => {
  useFonts();
  return <LangCtx.Provider value={lang}>{children}</LangCtx.Provider>;
};

/** Short paper-coloured dip between scenes. */
const Dip: React.FC<{ frames: number }> = ({ frames }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6, frames - 6, frames], [1, 0, 0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ backgroundColor: C.paper, opacity: o, pointerEvents: "none" }} />;
};

export const Episode: React.FC<{ lang: Lang }> = ({ lang }) => (
  <Wrap lang={lang}>
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <Series>
        {SCENES.map((s) => (
          <Series.Sequence key={s.id} durationInFrames={s.frames}>
            <s.C />
            <Dip frames={s.frames} />
            {(SFX[s.id] ?? []).map(([at, name, vol], i) => (
              <Sequence key={i} from={at} layout="none">
                <Audio src={staticFile(`audio/${name}.wav`)} volume={vol ?? 1} />
              </Sequence>
            ))}
          </Series.Sequence>
        ))}
      </Series>
      <Audio src={staticFile("audio/music.wav")} volume={MUSIC_VOLUME} />
    </AbsoluteFill>
  </Wrap>
);
