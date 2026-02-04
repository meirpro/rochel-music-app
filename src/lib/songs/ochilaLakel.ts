// Ochila Lakel (אוחילה לאל)
// Key: D minor (1 flat), Time: 4/4
// Traditional Jewish liturgical song
import { SongData } from "./types";

export const ochilaLakel: SongData = {
  id: "default-ochila-lakel",
  name: "Ochila Lakel",
  hebrewName: "אוחילה לאל",
  description: "שיר ליטורגי מסורתי",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // SECTION A (Measures 1-12)
    // ═══════════════════════════════════════════════════════════════════
    { id: "ochila-r1", pitch: "REST", duration: 1.5, absoluteBeat: 0 },
    { id: "ochila-1", pitch: "A4", duration: 0.5, absoluteBeat: 1.5 },
    { id: "ochila-2", pitch: "A4", duration: 0.5, absoluteBeat: 2 },
    { id: "ochila-3", pitch: "F4", duration: 0.5, absoluteBeat: 2.5 },
    { id: "ochila-4", pitch: "G4", duration: 0.5, absoluteBeat: 3 },
    { id: "ochila-5", pitch: "A4", duration: 0.5, absoluteBeat: 3.5 },
    { id: "ochila-6", pitch: "G4", duration: 4, absoluteBeat: 4 },
    { id: "ochila-r2", pitch: "REST", duration: 2, absoluteBeat: 8 },
    { id: "ochila-7", pitch: "G4", duration: 0.5, absoluteBeat: 10 },
    { id: "ochila-8", pitch: "A4", duration: 0.5, absoluteBeat: 10.5 },
    { id: "ochila-9", pitch: "Bb4", duration: 0.5, absoluteBeat: 11 },
    { id: "ochila-10", pitch: "G4", duration: 0.5, absoluteBeat: 11.5 },
    { id: "ochila-11", pitch: "A4", duration: 4, absoluteBeat: 12 },

    { id: "ochila-12", pitch: "C5", duration: 2, absoluteBeat: 16 },
    { id: "ochila-13", pitch: "Bb4", duration: 1, absoluteBeat: 18 },
    { id: "ochila-14", pitch: "A4", duration: 1, absoluteBeat: 19 },
    { id: "ochila-15", pitch: "Bb4", duration: 1.5, absoluteBeat: 20 },
    { id: "ochila-16", pitch: "A4", duration: 0.5, absoluteBeat: 21.5 },
    { id: "ochila-17", pitch: "G4", duration: 2, absoluteBeat: 22 },
    { id: "ochila-r3", pitch: "REST", duration: 1.5, absoluteBeat: 24 },
    { id: "ochila-18", pitch: "D4", duration: 0.5, absoluteBeat: 25.5 },
    { id: "ochila-19", pitch: "G4", duration: 0.5, absoluteBeat: 26 },
    { id: "ochila-20", pitch: "A4", duration: 0.5, absoluteBeat: 26.5 },
    { id: "ochila-21", pitch: "Bb4", duration: 0.5, absoluteBeat: 27 },
    { id: "ochila-22", pitch: "G4", duration: 0.5, absoluteBeat: 27.5 },
    { id: "ochila-23", pitch: "F4", duration: 1.5, absoluteBeat: 28 },
    { id: "ochila-24", pitch: "E4", duration: 0.5, absoluteBeat: 29.5 },
    { id: "ochila-25", pitch: "D4", duration: 2, absoluteBeat: 30 },
    { id: "ochila-r4", pitch: "REST", duration: 1.5, absoluteBeat: 32 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION B (Measures 13-24)
    // ═══════════════════════════════════════════════════════════════════
    { id: "ochila-26", pitch: "F4", duration: 0.5, absoluteBeat: 33.5 },
    { id: "ochila-27", pitch: "F4", duration: 0.5, absoluteBeat: 34 },
    { id: "ochila-28", pitch: "D4", duration: 0.5, absoluteBeat: 34.5 },
    { id: "ochila-29", pitch: "E4", duration: 0.5, absoluteBeat: 35 },
    { id: "ochila-30", pitch: "F4", duration: 0.5, absoluteBeat: 35.5 },
    { id: "ochila-31", pitch: "E4", duration: 4, absoluteBeat: 36 },
    { id: "ochila-r5", pitch: "REST", duration: 1.5, absoluteBeat: 40 },
    { id: "ochila-32", pitch: "E4", duration: 0.5, absoluteBeat: 41.5 },
    { id: "ochila-33", pitch: "G4", duration: 1, absoluteBeat: 42 },
    { id: "ochila-34", pitch: "E4", duration: 1, absoluteBeat: 43 },
    { id: "ochila-35", pitch: "F4", duration: 1, absoluteBeat: 44 },
    { id: "ochila-36", pitch: "E4", duration: 0.5, absoluteBeat: 45 },
    { id: "ochila-37", pitch: "D4", duration: 1.5, absoluteBeat: 45.5 },
    { id: "ochila-r6", pitch: "REST", duration: 4, absoluteBeat: 47 },
    { id: "ochila-38", pitch: "A3", duration: 0.5, absoluteBeat: 51.5 },
    { id: "ochila-39", pitch: "F4", duration: 0.5, absoluteBeat: 52 },
    { id: "ochila-40", pitch: "E4", duration: 0.5, absoluteBeat: 52.5 },
    { id: "ochila-41", pitch: "D4", duration: 0.5, absoluteBeat: 53 },
    { id: "ochila-42", pitch: "C#4", duration: 0.5, absoluteBeat: 53.5 },
    { id: "ochila-43", pitch: "D4", duration: 4, absoluteBeat: 54 },

    { id: "ochila-44", pitch: "D4", duration: 0.5, absoluteBeat: 59 },
    { id: "ochila-45", pitch: "G4", duration: 0.5, absoluteBeat: 59.5 },
    { id: "ochila-46", pitch: "G4", duration: 0.5, absoluteBeat: 60 },
    { id: "ochila-47", pitch: "F4", duration: 0.5, absoluteBeat: 60.5 },
    { id: "ochila-48", pitch: "E4", duration: 0.5, absoluteBeat: 61 },
    { id: "ochila-49", pitch: "F4", duration: 0.5, absoluteBeat: 61.5 },
    { id: "ochila-50", pitch: "E4", duration: 4, absoluteBeat: 62 },
    { id: "ochila-51", pitch: "E4", duration: 4, absoluteBeat: 66 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION C (Measures 25-36)
    // ═══════════════════════════════════════════════════════════════════
    { id: "ochila-52", pitch: "A3", duration: 1.5, absoluteBeat: 70 },
    { id: "ochila-53", pitch: "A3", duration: 0.5, absoluteBeat: 71.5 },
    { id: "ochila-54", pitch: "C#4", duration: 1.5, absoluteBeat: 72 },
    { id: "ochila-55", pitch: "C#4", duration: 0.5, absoluteBeat: 73.5 },
    { id: "ochila-56", pitch: "E4", duration: 2, absoluteBeat: 74 },
    { id: "ochila-57", pitch: "G4", duration: 2, absoluteBeat: 76 },

    { id: "ochila-58", pitch: "F4", duration: 0.5, absoluteBeat: 79 },
    { id: "ochila-59", pitch: "E4", duration: 0.5, absoluteBeat: 79.5 },
    { id: "ochila-60", pitch: "D4", duration: 1, absoluteBeat: 80 },
    { id: "ochila-61", pitch: "G4", duration: 1, absoluteBeat: 81 },
    { id: "ochila-62", pitch: "F4", duration: 4, absoluteBeat: 82 },

    { id: "ochila-63", pitch: "F4", duration: 0.5, absoluteBeat: 87 },
    { id: "ochila-64", pitch: "E4", duration: 0.5, absoluteBeat: 87.5 },
    { id: "ochila-65", pitch: "D4", duration: 1, absoluteBeat: 88 },
    { id: "ochila-66", pitch: "C#4", duration: 1, absoluteBeat: 89 },
    { id: "ochila-67", pitch: "D4", duration: 4, absoluteBeat: 90 },

    { id: "ochila-68", pitch: "A3", duration: 0.5, absoluteBeat: 95.5 },
    { id: "ochila-69", pitch: "F4", duration: 0.5, absoluteBeat: 96 },
    { id: "ochila-70", pitch: "E4", duration: 0.5, absoluteBeat: 96.5 },
    { id: "ochila-71", pitch: "D4", duration: 0.5, absoluteBeat: 97 },
    { id: "ochila-72", pitch: "C4", duration: 0.5, absoluteBeat: 97.5 },
    { id: "ochila-73", pitch: "D4", duration: 4, absoluteBeat: 98 },

    // ═══════════════════════════════════════════════════════════════════
    // FINALE (Measures 37-end)
    // ═══════════════════════════════════════════════════════════════════
    { id: "ochila-74", pitch: "A4", duration: 0.5, absoluteBeat: 103.5 },
    { id: "ochila-75", pitch: "A4", duration: 0.5, absoluteBeat: 104 },
    { id: "ochila-76", pitch: "G4", duration: 0.5, absoluteBeat: 104.5 },
    { id: "ochila-77", pitch: "F4", duration: 0.5, absoluteBeat: 105 },
    { id: "ochila-78", pitch: "G4", duration: 0.5, absoluteBeat: 105.5 },
    { id: "ochila-79", pitch: "F4", duration: 4, absoluteBeat: 106 },

    { id: "ochila-80", pitch: "F4", duration: 0.5, absoluteBeat: 111.5 },
    { id: "ochila-81", pitch: "F4", duration: 0.5, absoluteBeat: 112 },
    { id: "ochila-82", pitch: "E4", duration: 0.5, absoluteBeat: 112.5 },
    { id: "ochila-83", pitch: "D4", duration: 0.5, absoluteBeat: 113 },
    { id: "ochila-84", pitch: "C4", duration: 0.5, absoluteBeat: 113.5 },
    { id: "ochila-85", pitch: "D4", duration: 2, absoluteBeat: 114 },
    { id: "ochila-86", pitch: "G4", duration: 2, absoluteBeat: 116 },

    { id: "ochila-87", pitch: "D4", duration: 0.5, absoluteBeat: 119.5 },
    { id: "ochila-88", pitch: "F4", duration: 0.5, absoluteBeat: 120 },
    { id: "ochila-89", pitch: "E4", duration: 0.5, absoluteBeat: 120.5 },
    { id: "ochila-90", pitch: "D4", duration: 0.5, absoluteBeat: 121 },
    { id: "ochila-91", pitch: "C4", duration: 0.5, absoluteBeat: 121.5 },
    { id: "ochila-92", pitch: "D4", duration: 4, absoluteBeat: 122 },

    { id: "ochila-93", pitch: "A4", duration: 0.5, absoluteBeat: 127.5 },
    { id: "ochila-94", pitch: "A4", duration: 0.5, absoluteBeat: 128 },
    { id: "ochila-95", pitch: "F4", duration: 0.5, absoluteBeat: 128.5 },
    { id: "ochila-96", pitch: "G4", duration: 0.5, absoluteBeat: 129 },
    { id: "ochila-97", pitch: "A4", duration: 0.5, absoluteBeat: 129.5 },
    { id: "ochila-98", pitch: "G4", duration: 4, absoluteBeat: 130 },

    { id: "ochila-99", pitch: "G4", duration: 0.5, absoluteBeat: 136 },
    { id: "ochila-100", pitch: "A4", duration: 0.5, absoluteBeat: 136.5 },
    { id: "ochila-101", pitch: "Bb4", duration: 0.5, absoluteBeat: 137 },
    { id: "ochila-102", pitch: "G4", duration: 0.5, absoluteBeat: 137.5 },
    { id: "ochila-103", pitch: "F4", duration: 1.5, absoluteBeat: 138 },
    { id: "ochila-104", pitch: "E4", duration: 0.5, absoluteBeat: 139.5 },
    { id: "ochila-105", pitch: "D4", duration: 2, absoluteBeat: 140 },
  ],

  repeatMarkers: [],

  lyrics: [],

  settings: {
    tempo: 160,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-03",

  transcriptionNotes: {
    original: {
      key: "D minor (1 flat)",
      timeSignature: "4/4",
      features: [
        "Traditional Jewish liturgical song",
        "Rests added for phrase breaks",
        "Accidentals: Bb4, C#4",
      ],
    },
    changes: [],
    sources: {
      sheetMusic: "Israeli Note - 1770158290086311_323.musicxml",
    },
    transcribedDate: "2026-02-03",
  },
};
