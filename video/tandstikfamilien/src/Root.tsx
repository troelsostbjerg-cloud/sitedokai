import React from "react";
import { Composition, Still } from "remotion";
import { Thumbnail } from "./Thumbnail";
import { PoseSheet } from "./PoseSheet";
import { FPS, H, W } from "./lib/theme";
import { Episode, SCENES, totalFrames, Wrap } from "./Episode";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Afsnit1-DA" component={Episode} defaultProps={{ lang: "da" as const }} durationInFrames={totalFrames} fps={FPS} width={W} height={H} />
    <Composition id="Afsnit1-EN" component={Episode} defaultProps={{ lang: "en" as const }} durationInFrames={totalFrames} fps={FPS} width={W} height={H} />
    {SCENES.map((s) => (
      <Composition
        key={s.id}
        id={`Scene-${s.id}`}
        component={() => <Wrap lang="da"><s.C /></Wrap>}
        durationInFrames={s.frames}
        fps={FPS}
        width={W}
        height={H}
      />
    ))}
    <Still id="Thumbnail-DA" component={Thumbnail} defaultProps={{ lang: "da" as const }} width={W} height={H} />
    <Still id="Thumbnail-EN" component={Thumbnail} defaultProps={{ lang: "en" as const }} width={W} height={H} />
    <Composition id="PoseSheet" component={PoseSheet} durationInFrames={60} fps={FPS} width={W} height={H} />
  </>
);
