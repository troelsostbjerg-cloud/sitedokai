/**
 * ALL on-screen text lives here. Frames are 30 fps and relative to the short.
 * *Words in stars* get the accent colour.
 */
export type Lang = "en" | "da";

export const COPY = {
  en: {
    end: { series: "The Scatterbeans", follow: "Follow. If you *remember* to." },
    coffee: {
      wants: "Bo just wants coffee.",
      opens: "He opens everything.",
      closes: "He closes *nothing*.",
      only: "The only thing he closes…",
      fridge: "…is the fridge. *With the coffee inside.*",
      where: "Where's my coffee?",
      counter: "Open:",
      bzz: "BZZ",
      woof: "WOOF!",
      oof: "OOF",
    },
    rose: {
      plan: "Lise will plant *ONE* rose.",
      helping: "Noodle is helping.",
      hyper: "Then… *hyperfocus.*",
      version: "Version",
      times: ["9:14", "11:02", "1:47", "4:30", "7:58"],
      one: "Result: *one* rose.",
      zero: "Result: *zero* roses.",
    },
  },
  da: {
    end: { series: "The Scatterbeans", follow: "Følg. Hvis du *husker* det." },
    coffee: {
      wants: "Bo vil bare have kaffe.",
      opens: "Han åbner alt.",
      closes: "Han lukker *intet*.",
      only: "Det eneste, han lukker…",
      fridge: "…er køleskabet. *Med kaffen i.*",
      where: "Hvor er min kaffe?",
      counter: "Åbne:",
      bzz: "BZZ",
      woof: "VOV!",
      oof: "AV",
    },
    rose: {
      plan: "Lise vil plante *ÉN* rose.",
      helping: "Noodle hjælper.",
      hyper: "Så kom… *hyperfokus.*",
      version: "Version",
      times: ["9:14", "11:02", "13:47", "16:30", "19:58"],
      one: "Resultat: *én* rose.",
      zero: "Resultat: *nul* roser.",
    },
  },
} as const;

export const SHORTS = {
  coffee: 840, // 28 s
  rose: 840, // 28 s
};
