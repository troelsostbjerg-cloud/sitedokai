/** Sound effects per scene: [frame (scene-relative), sound, volume]. Sounds are made by scripts/make-audio.mjs. */
export type Sound = "pop" | "tick" | "door" | "fridge" | "bonk" | "buzz" | "rewind" | "ding" | "whoosh" | "sparkle";

export const MUSIC_VOLUME = 0.75;

export const SFX: Record<string, [number, Sound, number?][]> = {
  hook: [[4, "fridge"], [22, "pop"], [130, "pop", 0.5]],
  title: [[2, "sparkle", 0.5], [8, "pop"], [16, "pop"], [26, "pop"]],
  rewind: [[6, "rewind"]],
  bo: [
    [56, "door"], [134, "door"], [140, "pop", 0.4], [164, "tick"], [238, "door"],
    [350, "buzz"], [372, "pop", 0.4], [380, "buzz"], [458, "fridge"], [505, "fridge"],
    [698, "pop", 0.5], [846, "bonk"],
  ],
  factBo: [[4, "ding"]],
  lise: [
    [228, "sparkle"], [300, "whoosh", 0.8], [336, "pop"], [452, "whoosh", 0.8], [482, "pop"],
    [572, "whoosh", 0.8], [602, "pop"], [692, "whoosh", 0.8], [722, "pop"], [855, "sparkle", 0.5],
  ],
  house: [[20, "tick"], [130, "tick"], [250, "tick"]],
  factLise: [[4, "ding"]],
  evening: [[62, "pop", 0.5], [142, "pop", 0.5], [220, "sparkle"]],
  end: [[4, "pop"], [22, "pop"], [30, "sparkle", 0.5]],
};
