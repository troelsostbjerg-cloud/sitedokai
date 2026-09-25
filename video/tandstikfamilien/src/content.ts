/**
 * ALT tekst og timing ligger her. Ret ordlyden uden at røre animationskoden.
 * Tider er i sekunder, relativt til scenens start.
 * *Ord i stjerner* bliver farvet i accentfarven.
 */

export type Lang = "da" | "en";

export const SCENE_SECONDS = {
  hook: 7,
  title: 4.5,
  rewind: 3,
  bo: 29.5,
  factBo: 7,
  lise: 32,
  house: 16,
  factLise: 7,
  evening: 12,
  end: 8,
};

type Copy = {
  hook: { time: string; again: string };
  title: { series: string; episode: string };
  rewind: string;
  bo: {
    hasAdhd: string;
    opensAll: string;
    closesNothing: string;
    onlyThing: string;
    withCoffee: string;
    glasses: string;
    counter: string;
    bonk: string;
    bzz: string;
  };
  factBo: { tag: string; line1: string; line2: string; line3: string };
  lise: {
    alsoAdhd: string;
    justOneRose: string;
    hyperfocus: string;
    version: string;
    times: [string, string, string, string, string];
    fourTimes: string;
    result: string;
  };
  house: {
    meanwhile: string;
    counter: string;
    notes: [string, string, string];
    doesntSee: string;
    blinkers: string;
  };
  factLise: { tag: string; line1: string; line2: string; line3: string };
  evening: { bo: string; lise: string; chaos: string; ours: string };
  end: { sign: string; subscribe: string; ifYouRemember: string; next: string };
};

export const COPY: Record<Lang, Copy> = {
  da: {
    hook: { time: "Kl. 07:42. Kaffen står i *køleskabet*.", again: "Igen." },
    title: { series: "Tændstikfamilien", episode: "Afsnit 1: Kaffen er i køleskabet" },
    rewind: "20 minutter tidligere …",
    bo: {
      hasAdhd: "Det her er Bo. Bo har *ADHD*.",
      opensAll: "Han åbner alt.",
      closesNothing: "Han lukker *intet*.",
      onlyThing: "Det eneste, han lukker …",
      withCoffee: "… er køleskabet. *Med kaffen i.*",
      glasses: "Hvor er mine briller?",
      counter: "Åbne låger",
      bonk: "BONK",
      bzz: "BZZ",
    },
    factBo: {
      tag: "ADHD-FAKTA #1",
      line1: "Ude af syne = ude af sind.",
      line2: "Lukker Bo lågen, glemmer han, hvad der er bag den.",
      line3: "Åbne låger er hans *huskeliste*.",
    },
    lise: {
      alsoAdhd: "Det her er Lise. Hun har *også* ADHD.",
      justOneRose: "Hun skulle bare lige plante én rose.",
      hyperfocus: "Så kom *hyperfokus*.",
      version: "Version",
      times: ["Lørdag 09:14", "11:02", "13:47", "16:30", "19:58"],
      fourTimes: "Haven er lavet om *4 gange*.",
      result: "Resultat: én rose.",
    },
    house: {
      meanwhile: "Imens, inde i huset:",
      counter: "Ufærdige projekter",
      notes: ["Startet: marts", "Startet: 2024", "Startet: ???"],
      doesntSee: "Hun ser dem ikke.",
      blinkers: "Hyperfokus har *skyklapper*.",
    },
    factLise: {
      tag: "ADHD-FAKTA #2",
      line1: "Hyperfokus er ikke viljestyrke.",
      line2: "Hjernen vælger selv, hvad der er *spændende*.",
      line3: "(Det er aldrig opvasken.)",
    },
    evening: {
      bo: "Har du set min kaffe?",
      lise: "Har du set HAVEN?!",
      chaos: "Det er kaos.",
      ours: "Men det er *vores* kaos.",
    },
    end: {
      sign: "Dage uden ufærdigt projekt:",
      subscribe: "Abonnér.",
      ifYouRemember: "Hvis du kan *huske* det.",
      next: "Næste afsnit: Hvor er bilnøglerne?",
    },
  },
  en: {
    hook: { time: "7:42 AM. The coffee is in the *fridge*.", again: "Again." },
    title: { series: "The Stick Family", episode: "Episode 1: The Coffee Is in the Fridge" },
    rewind: "20 minutes earlier …",
    bo: {
      hasAdhd: "This is Bo. Bo has *ADHD*.",
      opensAll: "He opens everything.",
      closesNothing: "He closes *nothing*.",
      onlyThing: "The only thing he closes …",
      withCoffee: "… is the fridge. *With the coffee inside.*",
      glasses: "Where are my glasses?",
      counter: "Open doors",
      bonk: "BONK",
      bzz: "BZZ",
    },
    factBo: {
      tag: "ADHD FACT #1",
      line1: "Out of sight = out of mind.",
      line2: "If Bo closes the door, he forgets what's behind it.",
      line3: "Open doors are his *to-do list*.",
    },
    lise: {
      alsoAdhd: "This is Lise. She *also* has ADHD.",
      justOneRose: "She was just going to plant one rose.",
      hyperfocus: "Then came *hyperfocus*.",
      version: "Version",
      times: ["Saturday 9:14", "11:02", "13:47", "16:30", "19:58"],
      fourTimes: "The garden was redone *4 times*.",
      result: "Result: one rose.",
    },
    house: {
      meanwhile: "Meanwhile, inside the house:",
      counter: "Unfinished projects",
      notes: ["Started: March", "Started: 2024", "Started: ???"],
      doesntSee: "She doesn't see them.",
      blinkers: "Hyperfocus comes with *blinkers*.",
    },
    factLise: {
      tag: "ADHD FACT #2",
      line1: "Hyperfocus isn't willpower.",
      line2: "The brain picks what's *interesting*.",
      line3: "(It's never the dishes.)",
    },
    evening: {
      bo: "Have you seen my coffee?",
      lise: "Have you seen the GARDEN?!",
      chaos: "It's chaos.",
      ours: "But it's *our* chaos.",
    },
    end: {
      sign: "Days without an unfinished project:",
      subscribe: "Subscribe.",
      ifYouRemember: "If you can *remember* to.",
      next: "Next episode: Where are the car keys?",
    },
  },
};
