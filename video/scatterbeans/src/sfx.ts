/** Sound effects per short: [frame, sound, volume]. Sounds are made by scripts/make-audio.mjs. */
export type Sound = "pop" | "tick" | "door" | "fridge" | "bonk" | "buzz" | "boing" | "woof" | "ding" | "whoosh" | "sparkle" | "lick";

export const MUSIC_VOLUME = 0.6;

export const SFX: Record<"coffee" | "rose", [number, Sound, number?][]> = {
  coffee: [
    [4, "pop", 0.6], [45, "boing"], [58, "door"], [88, "pop", 0.5], [118, "boing"], [130, "door"], [156, "pop", 0.5],
    [200, "door"], [205, "whoosh", 0.6], [272, "buzz"], [285, "pop"], [300, "woof"], [344, "woof"], [388, "fridge"],
    [415, "pop", 0.5], [430, "fridge"], [494, "pop", 0.5], [560, "pop", 0.6], [650, "whoosh", 0.5], [708, "bonk"],
    [758, "lick"], [770, "boing", 0.7], [785, "sparkle"],
  ],
  rose: [
    [4, "pop", 0.6], [55, "pop", 0.5], [70, "whoosh", 0.35], [92, "pop", 0.5], [110, "woof", 0.7], [160, "sparkle"],
    [165, "pop", 0.5], [225, "whoosh", 0.7], [245, "pop"], [315, "whoosh", 0.7], [335, "pop"], [405, "whoosh", 0.7],
    [425, "pop"], [495, "whoosh", 0.7], [515, "sparkle", 0.6], [550, "pop", 0.5], [662, "whoosh", 0.4], [680, "pop", 0.5],
    [705, "woof", 0.6], [720, "lick"], [724, "boing", 0.5], [780, "sparkle"],
  ],
};
