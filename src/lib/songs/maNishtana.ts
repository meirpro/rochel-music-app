// Ma Nishtana (מה נשתנה)
// Key: D minor (1 flat), Time: 4/4
// Traditional Passover song
import { SongData } from "./types";

export const maNishtana: SongData = {
  id: "default-ma-nishtana",
  name: "Ma Nishtana",
  hebrewName: "מה נשתנה",
  description: "שיר פסח מסורתי",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // VERSE 1 - "Ma nishtana halaila hazeh" (Measures 1-6)
    // ═══════════════════════════════════════════════════════════════════
    { id: "ma-1", pitch: "F4", duration: 1, absoluteBeat: 0 },
    { id: "ma-2", pitch: "D4", duration: 0.5, absoluteBeat: 1 },
    { id: "ma-3", pitch: "D4", duration: 0.5, absoluteBeat: 1.5 },
    { id: "ma-4", pitch: "D4", duration: 1, absoluteBeat: 2 },
    { id: "ma-5", pitch: "D4", duration: 1, absoluteBeat: 3 },

    { id: "ma-6", pitch: "F4", duration: 1, absoluteBeat: 4 },
    { id: "ma-7", pitch: "D4", duration: 0.5, absoluteBeat: 5 },
    { id: "ma-8", pitch: "D4", duration: 0.5, absoluteBeat: 5.5 },
    { id: "ma-9", pitch: "D4", duration: 1, absoluteBeat: 6 },
    { id: "ma-10", pitch: "A4", duration: 1, absoluteBeat: 7 },

    { id: "ma-11", pitch: "C5", duration: 1, absoluteBeat: 8 },
    { id: "ma-12", pitch: "Bb4", duration: 1, absoluteBeat: 9 },
    { id: "ma-13", pitch: "G4", duration: 1, absoluteBeat: 10 },
    { id: "ma-14", pitch: "Bb4", duration: 1, absoluteBeat: 11 },

    { id: "ma-15", pitch: "A4", duration: 3, absoluteBeat: 12 },
    { id: "ma-16", pitch: "A4", duration: 1, absoluteBeat: 15 },

    { id: "ma-17", pitch: "C5", duration: 1, absoluteBeat: 16 },
    { id: "ma-18", pitch: "Bb4", duration: 1, absoluteBeat: 17 },
    { id: "ma-19", pitch: "G4", duration: 1, absoluteBeat: 18 },
    { id: "ma-20", pitch: "Bb4", duration: 1, absoluteBeat: 19 },

    { id: "ma-21", pitch: "A4", duration: 3, absoluteBeat: 20 },

    // ═══════════════════════════════════════════════════════════════════
    // VERSE 2 - Repeat pattern (Measures 7-12)
    // ═══════════════════════════════════════════════════════════════════
    { id: "ma-22", pitch: "D4", duration: 0.5, absoluteBeat: 23 },
    { id: "ma-23", pitch: "D4", duration: 0.5, absoluteBeat: 23.5 },
    { id: "ma-24", pitch: "F4", duration: 1, absoluteBeat: 24 },
    { id: "ma-25", pitch: "D4", duration: 0.5, absoluteBeat: 25 },
    { id: "ma-26", pitch: "D4", duration: 0.5, absoluteBeat: 25.5 },
    { id: "ma-27", pitch: "D4", duration: 2, absoluteBeat: 26 },

    { id: "ma-28", pitch: "F4", duration: 1, absoluteBeat: 28 },
    { id: "ma-29", pitch: "D4", duration: 0.5, absoluteBeat: 29 },
    { id: "ma-30", pitch: "D4", duration: 0.5, absoluteBeat: 29.5 },
    { id: "ma-31", pitch: "D4", duration: 1, absoluteBeat: 30 },
    { id: "ma-32", pitch: "A4", duration: 1, absoluteBeat: 31 },

    { id: "ma-33", pitch: "C5", duration: 1, absoluteBeat: 32 },
    { id: "ma-34", pitch: "Bb4", duration: 1, absoluteBeat: 33 },
    { id: "ma-35", pitch: "G4", duration: 1, absoluteBeat: 34 },
    { id: "ma-36", pitch: "Bb4", duration: 1, absoluteBeat: 35 },

    { id: "ma-37", pitch: "A4", duration: 3, absoluteBeat: 36 },
    { id: "ma-38", pitch: "A4", duration: 1, absoluteBeat: 39 },

    { id: "ma-39", pitch: "C5", duration: 1, absoluteBeat: 40 },
    { id: "ma-40", pitch: "Bb4", duration: 1, absoluteBeat: 41 },
    { id: "ma-41", pitch: "G4", duration: 1, absoluteBeat: 42 },
    { id: "ma-42", pitch: "Bb4", duration: 1, absoluteBeat: 43 },

    { id: "ma-43", pitch: "A4", duration: 3, absoluteBeat: 44 },

    // ═══════════════════════════════════════════════════════════════════
    // ENDING (Measures 13-17)
    // ═══════════════════════════════════════════════════════════════════
    { id: "ma-44", pitch: "F4", duration: 1, absoluteBeat: 47 },
    { id: "ma-45", pitch: "A4", duration: 1, absoluteBeat: 48 },
    { id: "ma-46", pitch: "A4", duration: 0.5, absoluteBeat: 49 },
    { id: "ma-47", pitch: "A4", duration: 0.5, absoluteBeat: 49.5 },
    { id: "ma-48", pitch: "G4", duration: 1, absoluteBeat: 50 },
    { id: "ma-49", pitch: "E4", duration: 1, absoluteBeat: 51 },

    { id: "ma-50", pitch: "F4", duration: 1, absoluteBeat: 52 },
    { id: "ma-51", pitch: "D4", duration: 0.5, absoluteBeat: 53 },
    { id: "ma-52", pitch: "D4", duration: 0.5, absoluteBeat: 53.5 },
    { id: "ma-53", pitch: "D4", duration: 1, absoluteBeat: 54 },
    { id: "ma-54", pitch: "F4", duration: 1, absoluteBeat: 55 },

    { id: "ma-55", pitch: "E4", duration: 1, absoluteBeat: 56 },
    { id: "ma-56", pitch: "A3", duration: 1, absoluteBeat: 57 },
    { id: "ma-57", pitch: "C#4", duration: 1, absoluteBeat: 58 },
    { id: "ma-58", pitch: "E4", duration: 1, absoluteBeat: 59 },

    { id: "ma-59", pitch: "D4", duration: 1, absoluteBeat: 60 },
    { id: "ma-60", pitch: "F4", duration: 1, absoluteBeat: 61 },
    { id: "ma-61", pitch: "A4", duration: 1, absoluteBeat: 62 },
    { id: "ma-62", pitch: "F4", duration: 1, absoluteBeat: 63 },

    // Final D
    { id: "ma-63", pitch: "D4", duration: 4, absoluteBeat: 64 },
  ],

  repeatMarkers: [],

  lyrics: [],

  settings: {
    tempo: 80,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-03",

  transcriptionNotes: {
    original: {
      key: "D minor (1 flat)",
      timeSignature: "4/4",
      features: [
        "Traditional Passover four questions",
        "Modal melody with C# leading tone",
        "Repetitive verse structure",
      ],
    },
    changes: [],
    sources: {
      sheetMusic: "Israeli Note - Ma Nishtana",
    },
    transcribedDate: "2026-02-03",
  },
};
