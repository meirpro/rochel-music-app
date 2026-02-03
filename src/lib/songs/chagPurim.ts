// Chag Purim (חג פורים)
// Key: D minor, Time: 4/4
// Traditional Purim song
import { SongData } from "./types";

export const chagPurim: SongData = {
  id: "default-chag-purim",
  name: "Chag Purim",
  hebrewName: "חג פורים",
  description: "שיר פורים מסורתי",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // VERSE 1 (Measures 1-8)
    // ═══════════════════════════════════════════════════════════════════
    // M1
    { id: "chag-1", pitch: "F4", duration: 1, absoluteBeat: 0 },
    { id: "chag-2", pitch: "G4", duration: 1, absoluteBeat: 1 },
    { id: "chag-3", pitch: "F4", duration: 2, absoluteBeat: 2 },

    // M2
    { id: "chag-4", pitch: "F4", duration: 1, absoluteBeat: 4 },
    { id: "chag-5", pitch: "G4", duration: 1, absoluteBeat: 5 },
    { id: "chag-6", pitch: "F4", duration: 2, absoluteBeat: 6 },

    // M3
    { id: "chag-7", pitch: "F4", duration: 1, absoluteBeat: 8 },
    { id: "chag-8", pitch: "G4", duration: 1, absoluteBeat: 9 },
    { id: "chag-9", pitch: "F4", duration: 1, absoluteBeat: 10 },
    { id: "chag-10", pitch: "G4", duration: 1, absoluteBeat: 11 },

    // M4
    { id: "chag-11", pitch: "F4", duration: 1, absoluteBeat: 12 },
    { id: "chag-12", pitch: "E4", duration: 1, absoluteBeat: 13 },
    { id: "chag-13", pitch: "D4", duration: 2, absoluteBeat: 14 },

    // M5
    { id: "chag-14", pitch: "G4", duration: 1, absoluteBeat: 16 },
    { id: "chag-15", pitch: "G4", duration: 1, absoluteBeat: 17 },
    { id: "chag-16", pitch: "G4", duration: 1.5, absoluteBeat: 18 },
    { id: "chag-17", pitch: "D4", duration: 0.5, absoluteBeat: 19.5 },

    // M6
    { id: "chag-18", pitch: "G4", duration: 1, absoluteBeat: 20 },
    { id: "chag-19", pitch: "G4", duration: 1, absoluteBeat: 21 },
    { id: "chag-20", pitch: "G4", duration: 1.5, absoluteBeat: 22 },
    { id: "chag-21", pitch: "D4", duration: 0.5, absoluteBeat: 23.5 },

    // M7
    { id: "chag-22", pitch: "G4", duration: 1, absoluteBeat: 24 },
    { id: "chag-23", pitch: "G4", duration: 1, absoluteBeat: 25 },
    { id: "chag-24", pitch: "F4", duration: 1, absoluteBeat: 26 },
    { id: "chag-25", pitch: "E4", duration: 1, absoluteBeat: 27 },

    // M8
    { id: "chag-26", pitch: "F4", duration: 4, absoluteBeat: 28 },

    // ═══════════════════════════════════════════════════════════════════
    // VERSE 2 / CHORUS (Measures 9-16)
    // ═══════════════════════════════════════════════════════════════════
    // M9
    { id: "chag-27", pitch: "A4", duration: 1, absoluteBeat: 32 },
    { id: "chag-28", pitch: "A4", duration: 0.5, absoluteBeat: 33 },
    { id: "chag-29", pitch: "A4", duration: 0.5, absoluteBeat: 33.5 },
    { id: "chag-30", pitch: "G4", duration: 1, absoluteBeat: 34 },
    { id: "chag-31", pitch: "F4", duration: 1, absoluteBeat: 35 },

    // M10
    { id: "chag-32", pitch: "G4", duration: 1, absoluteBeat: 36 },
    { id: "chag-33", pitch: "G4", duration: 1, absoluteBeat: 37 },
    { id: "chag-34", pitch: "G4", duration: 2, absoluteBeat: 38 },

    // M11
    { id: "chag-35", pitch: "G4", duration: 1, absoluteBeat: 40 },
    { id: "chag-36", pitch: "G4", duration: 0.5, absoluteBeat: 41 },
    { id: "chag-37", pitch: "G4", duration: 0.5, absoluteBeat: 41.5 },
    { id: "chag-38", pitch: "F4", duration: 1, absoluteBeat: 42 },
    { id: "chag-39", pitch: "E4", duration: 1, absoluteBeat: 43 },

    // M12
    { id: "chag-40", pitch: "F4", duration: 1, absoluteBeat: 44 },
    { id: "chag-41", pitch: "F4", duration: 1, absoluteBeat: 45 },
    { id: "chag-42", pitch: "F4", duration: 2, absoluteBeat: 46 },

    // M13
    { id: "chag-43", pitch: "A4", duration: 1, absoluteBeat: 48 },
    { id: "chag-44", pitch: "A4", duration: 0.5, absoluteBeat: 49 },
    { id: "chag-45", pitch: "A4", duration: 0.5, absoluteBeat: 49.5 },
    { id: "chag-46", pitch: "G4", duration: 1, absoluteBeat: 50 },
    { id: "chag-47", pitch: "F4", duration: 1, absoluteBeat: 51 },

    // M14
    { id: "chag-48", pitch: "G4", duration: 1, absoluteBeat: 52 },
    { id: "chag-49", pitch: "G4", duration: 1, absoluteBeat: 53 },
    { id: "chag-50", pitch: "G4", duration: 2, absoluteBeat: 54 },

    // M15
    { id: "chag-51", pitch: "D4", duration: 1, absoluteBeat: 56 },
    { id: "chag-52", pitch: "G4", duration: 1, absoluteBeat: 57 },
    { id: "chag-53", pitch: "F4", duration: 1, absoluteBeat: 58 },
    { id: "chag-54", pitch: "E4", duration: 1, absoluteBeat: 59 },

    // M16 - Final
    { id: "chag-55", pitch: "D4", duration: 4, absoluteBeat: 60 },
  ],

  repeatMarkers: [],

  lyrics: [],

  settings: {
    tempo: 200,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-03",

  transcriptionNotes: {
    original: {
      key: "D minor",
      timeSignature: "4/4",
      features: [
        "Traditional Purim melody",
        "Simple rhythms - beginner friendly",
        "No accidentals in melody",
      ],
    },
    changes: [],
    sources: {
      sheetMusic: "Israeli Note - Chag Purim",
    },
    transcribedDate: "2026-02-03",
  },
};
