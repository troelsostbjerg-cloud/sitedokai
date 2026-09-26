import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Lang } from "./content";
import { useFonts } from "./lib/Paper";
import { LangCtx } from "./lib/UI";
import { MUSIC_VOLUME, SFX, Sound } from "./sfx";

/** Wraps one short with fonts, language, music and its sound effects. */
export const Short: React.FC<{ lang: Lang; id: keyof typeof SFX; C: React.FC; audio?: boolean }> = ({ lang, id, C, audio = true }) => {
  useFonts();
  return (
    <LangCtx.Provider value={lang}>
      <AbsoluteFill>
        <C />
        {audio && (
          <>
            <Audio src={staticFile("audio/music.wav")} volume={MUSIC_VOLUME} />
            {SFX[id].map(([at, name, vol], i) => (
              <Sequence key={i} from={at} layout="none">
                <Audio src={staticFile(`audio/${name as Sound}.wav`)} volume={vol ?? 1} />
              </Sequence>
            ))}
          </>
        )}
      </AbsoluteFill>
    </LangCtx.Provider>
  );
};
