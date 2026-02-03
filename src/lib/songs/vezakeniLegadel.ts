// Vezakeni Legadel (וזקני לגדל) – Baruch Levine
// Key: C minor, Time: 4/4, Tempo: 96
import { SongData } from "./types";

export const vezakeniLegadel: SongData = {
  id: "default-vezakeni-legadel",
  name: "Vezakeni Legadel",
  hebrewName: "וזקני לגדל",
  description: "ניגון לברכת נרות שבת",
  notes: [
    // SECTION A – opening phrase
    { id: "vez-1", pitch: "G4", duration: 1, absoluteBeat: 0 },
    { id: "vez-2", pitch: "C5", duration: 1, absoluteBeat: 1 },
    { id: "vez-3", pitch: "Bb4", duration: 1, absoluteBeat: 2 },
    { id: "vez-4", pitch: "A4", duration: 1, absoluteBeat: 3 },

    { id: "vez-5", pitch: "G4", duration: 1, absoluteBeat: 4 },
    { id: "vez-6", pitch: "A4", duration: 1, absoluteBeat: 5 },
    { id: "vez-7", pitch: "Bb4", duration: 2, absoluteBeat: 6 },

    // continuation
    { id: "vez-8", pitch: "C5", duration: 1, absoluteBeat: 8 },
    { id: "vez-9", pitch: "Bb4", duration: 1, absoluteBeat: 9 },
    { id: "vez-10", pitch: "A4", duration: 2, absoluteBeat: 10 },

    // VOLTA 1 – first ending
    { id: "vez-11", pitch: "G4", duration: 4, absoluteBeat: 12 },

    // SECTION A AGAIN – second pass
    { id: "vez-12", pitch: "G4", duration: 1, absoluteBeat: 16 },
    { id: "vez-13", pitch: "C5", duration: 1, absoluteBeat: 17 },
    { id: "vez-14", pitch: "Bb4", duration: 1, absoluteBeat: 18 },
    { id: "vez-15", pitch: "A4", duration: 1, absoluteBeat: 19 },

    { id: "vez-16", pitch: "G4", duration: 1, absoluteBeat: 20 },
    { id: "vez-17", pitch: "A4", duration: 1, absoluteBeat: 21 },
    { id: "vez-18", pitch: "Bb4", duration: 2, absoluteBeat: 22 },

    // VOLTA 2 – second ending
    { id: "vez-19", pitch: "C5", duration: 2, absoluteBeat: 24 },
    { id: "vez-20", pitch: "G4", duration: 2, absoluteBeat: 26 },
  ],

  repeatMarkers: [],

  lyrics: [],

  settings: {
    tempo: 96,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-02",

  transcriptionNotes: {
    original: {
      key: "C minor",
      timeSignature: "4/4",
      features: ["Volta 1/2 endings"],
    },
    changes: [
      {
        what: "Linearized 1st and 2nd endings",
        why: "App does not support volta brackets",
      },
    ],
    sources: {
      sheetMusic: "Israeli Note – Baruch Levine",
    },
    transcribedDate: "2026-02-02",
  },
};
