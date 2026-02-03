// Hevenu Shalom Aleichem (הבאנו שלום עליכם)
// Key: D minor (1 flat), Time: 4/4
// Traditional Hebrew song
import { SongData } from "./types";

export const hevenuShalom: SongData = {
  id: "default-hevenu-shalom",
  name: "Hevenu Shalom Aleichem",
  hebrewName: "הבאנו שלום עליכם",
  description: "שיר עברי מסורתי",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // VERSE 1 (Measures 1-8)
    // ═══════════════════════════════════════════════════════════════════
    // M1 - Pickup and first phrase
    { id: "hevenu-1", pitch: "A3", duration: 0.5, absoluteBeat: 0 },
    { id: "hevenu-2", pitch: "D4", duration: 0.5, absoluteBeat: 0.5 },
    { id: "hevenu-3", pitch: "F4", duration: 0.5, absoluteBeat: 1 },
    { id: "hevenu-4", pitch: "A4", duration: 2, absoluteBeat: 1.5 },

    // M2
    { id: "hevenu-5", pitch: "F4", duration: 1.5, absoluteBeat: 3.5 },
    { id: "hevenu-6", pitch: "E4", duration: 0.5, absoluteBeat: 5 },
    { id: "hevenu-7", pitch: "E4", duration: 0.5, absoluteBeat: 5.5 },
    { id: "hevenu-8", pitch: "D4", duration: 1, absoluteBeat: 6 },

    // M3
    { id: "hevenu-9", pitch: "F4", duration: 0.5, absoluteBeat: 7.5 },
    { id: "hevenu-10", pitch: "A4", duration: 0.5, absoluteBeat: 8 },
    { id: "hevenu-11", pitch: "D5", duration: 2, absoluteBeat: 8.5 },

    // M4
    { id: "hevenu-12", pitch: "Bb4", duration: 1.5, absoluteBeat: 10.5 },
    { id: "hevenu-13", pitch: "A4", duration: 0.5, absoluteBeat: 12 },
    { id: "hevenu-14", pitch: "A4", duration: 0.5, absoluteBeat: 12.5 },
    { id: "hevenu-15", pitch: "G4", duration: 1, absoluteBeat: 13 },

    // M5
    { id: "hevenu-16", pitch: "A4", duration: 0.5, absoluteBeat: 14.5 },
    { id: "hevenu-17", pitch: "Bb4", duration: 0.5, absoluteBeat: 15 },
    { id: "hevenu-18", pitch: "A4", duration: 1.5, absoluteBeat: 15.5 },
    { id: "hevenu-19", pitch: "E4", duration: 0.5, absoluteBeat: 17 },

    // M6
    { id: "hevenu-20", pitch: "A4", duration: 1.5, absoluteBeat: 17.5 },
    { id: "hevenu-21", pitch: "G4", duration: 0.5, absoluteBeat: 19 },
    { id: "hevenu-22", pitch: "G4", duration: 0.5, absoluteBeat: 19.5 },
    { id: "hevenu-23", pitch: "F4", duration: 1, absoluteBeat: 20 },

    // M7
    { id: "hevenu-24", pitch: "E4", duration: 0.5, absoluteBeat: 21.5 },
    { id: "hevenu-25", pitch: "D4", duration: 0.5, absoluteBeat: 22 },
    { id: "hevenu-26", pitch: "A4", duration: 1, absoluteBeat: 22.5 },
    { id: "hevenu-27", pitch: "A4", duration: 1, absoluteBeat: 23.5 },

    // M8 - Ending phrase with ornament
    { id: "hevenu-28", pitch: "A4", duration: 1, absoluteBeat: 24.5 },
    { id: "hevenu-29", pitch: "A4", duration: 1, absoluteBeat: 25.5 },
    { id: "hevenu-30", pitch: "A4", duration: 0.75, absoluteBeat: 26.5 },
    { id: "hevenu-31", pitch: "G4", duration: 0.25, absoluteBeat: 27.25 },
    { id: "hevenu-32", pitch: "F4", duration: 0.5, absoluteBeat: 27.5 },
    { id: "hevenu-33", pitch: "E4", duration: 0.5, absoluteBeat: 28 },
    { id: "hevenu-34", pitch: "D4", duration: 0.5, absoluteBeat: 28.5 },

    // ═══════════════════════════════════════════════════════════════════
    // VERSE 2 (Measures 9-17) - Repeat of melody
    // ═══════════════════════════════════════════════════════════════════
    // M9
    { id: "hevenu-35", pitch: "A3", duration: 0.5, absoluteBeat: 29 },
    { id: "hevenu-36", pitch: "D4", duration: 0.5, absoluteBeat: 29.5 },
    { id: "hevenu-37", pitch: "F4", duration: 0.5, absoluteBeat: 30 },
    { id: "hevenu-38", pitch: "A4", duration: 2, absoluteBeat: 30.5 },

    // M10
    { id: "hevenu-39", pitch: "F4", duration: 1.5, absoluteBeat: 32.5 },
    { id: "hevenu-40", pitch: "E4", duration: 0.5, absoluteBeat: 34 },
    { id: "hevenu-41", pitch: "E4", duration: 0.5, absoluteBeat: 34.5 },
    { id: "hevenu-42", pitch: "D4", duration: 1, absoluteBeat: 35 },

    // M11
    { id: "hevenu-43", pitch: "F4", duration: 0.5, absoluteBeat: 36.5 },
    { id: "hevenu-44", pitch: "A4", duration: 0.5, absoluteBeat: 37 },
    { id: "hevenu-45", pitch: "D5", duration: 2, absoluteBeat: 37.5 },

    // M12
    { id: "hevenu-46", pitch: "Bb4", duration: 1.5, absoluteBeat: 39.5 },
    { id: "hevenu-47", pitch: "A4", duration: 0.5, absoluteBeat: 41 },
    { id: "hevenu-48", pitch: "A4", duration: 0.5, absoluteBeat: 41.5 },
    { id: "hevenu-49", pitch: "G4", duration: 1, absoluteBeat: 42 },

    // M13
    { id: "hevenu-50", pitch: "A4", duration: 0.5, absoluteBeat: 43.5 },
    { id: "hevenu-51", pitch: "Bb4", duration: 0.5, absoluteBeat: 44 },
    { id: "hevenu-52", pitch: "A4", duration: 1.5, absoluteBeat: 44.5 },
    { id: "hevenu-53", pitch: "E4", duration: 0.5, absoluteBeat: 46 },

    // M14
    { id: "hevenu-54", pitch: "A4", duration: 1.5, absoluteBeat: 46.5 },
    { id: "hevenu-55", pitch: "G4", duration: 0.5, absoluteBeat: 48 },
    { id: "hevenu-56", pitch: "G4", duration: 0.5, absoluteBeat: 48.5 },
    { id: "hevenu-57", pitch: "F4", duration: 1, absoluteBeat: 49 },

    // M15
    { id: "hevenu-58", pitch: "E4", duration: 0.5, absoluteBeat: 50.5 },
    { id: "hevenu-59", pitch: "D4", duration: 0.5, absoluteBeat: 51 },
    { id: "hevenu-60", pitch: "A4", duration: 1, absoluteBeat: 51.5 },
    { id: "hevenu-61", pitch: "A4", duration: 1, absoluteBeat: 52.5 },

    // M16-17 - Final ending
    { id: "hevenu-62", pitch: "A4", duration: 1, absoluteBeat: 53.5 },
    { id: "hevenu-63", pitch: "A4", duration: 1, absoluteBeat: 54.5 },
    { id: "hevenu-64", pitch: "A4", duration: 0.75, absoluteBeat: 55.5 },
    { id: "hevenu-65", pitch: "G4", duration: 0.25, absoluteBeat: 56.25 },
    { id: "hevenu-66", pitch: "F4", duration: 0.5, absoluteBeat: 56.5 },
    { id: "hevenu-67", pitch: "E4", duration: 0.5, absoluteBeat: 57 },
    { id: "hevenu-68", pitch: "D4", duration: 0.5, absoluteBeat: 57.5 },
  ],

  repeatMarkers: [],

  lyrics: [],

  settings: {
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-03",

  transcriptionNotes: {
    original: {
      key: "D minor (1 flat)",
      timeSignature: "4/4",
      features: [
        "Traditional Hebrew song",
        "Melody repeats twice",
        "Pickup notes at start",
        "Dotted rhythms and sixteenth ornaments",
      ],
    },
    changes: [],
    sources: {
      sheetMusic: "hevenu-shalom-alechem.mxl from MuseScore",
    },
    transcribedDate: "2026-02-03",
  },
};
