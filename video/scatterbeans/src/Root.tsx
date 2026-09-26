import React from "react";
import { Composition } from "remotion";
import { CharSheet } from "./CharSheet";
import { Lang, SHORTS } from "./content";
import { FPS, H, W } from "./lib/theme";
import { Coffee } from "./scenes/Coffee";
import { Rose } from "./scenes/Rose";
import { Short } from "./Short";

// Component references can't go through (JSON) props, so each short gets a tiny wrapper.
const CoffeeShort: React.FC<{ lang: Lang }> = ({ lang }) => <Short lang={lang} id="coffee" C={Coffee} />;

const RoseShort: React.FC<{ lang: Lang }> = ({ lang }) => <Short lang={lang} id="rose" C={Rose} />;

const LIST = [["coffee", "Coffee", CoffeeShort], ["rose", "Rose", RoseShort]] as const;

export const RemotionRoot: React.FC = () => (
  <>
    {LIST.map(([id, name, Comp]) =>
      (["en", "da"] as const).map((lang) => (
        <Composition key={`${id}-${lang}`} id={`${name}-${lang.toUpperCase()}`} component={Comp} defaultProps={{ lang }} durationInFrames={SHORTS[id]} fps={FPS} width={W} height={H} />
      )),
    )}
    <Composition id="CharSheet" component={CharSheet} durationInFrames={60} fps={FPS} width={W} height={H} />
  </>
);
