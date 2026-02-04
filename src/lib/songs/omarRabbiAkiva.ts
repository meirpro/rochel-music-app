// Omar Rabbi Akiva (אמר רבי עקיבא)
// Key: Bb Major (2 flats), Time: 4/4
import { SongData } from "./types";

export const omarRabbiAkiva: SongData = {
  id: "default-omar-rabbi-akiva",
  name: "Omar Rabbi Akiva",
  hebrewName: "אמר רבי עקיבא",
  description: "ואהבת לרעך כמוך",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // INTRO (Measures 1-3)
    // ═══════════════════════════════════════════════════════════════════
    { id: "ora-1", pitch: "Bb4", duration: 0.5, absoluteBeat: 0 },
    { id: "ora-2", pitch: "C5", duration: 0.5, absoluteBeat: 0.5 },
    { id: "ora-3", pitch: "D5", duration: 1, absoluteBeat: 1 },
    { id: "ora-4", pitch: "C5", duration: 0.5, absoluteBeat: 2 },
    { id: "ora-5", pitch: "Bb4", duration: 0.5, absoluteBeat: 2.5 },
    { id: "ora-6", pitch: "C5", duration: 1, absoluteBeat: 3 },
    { id: "ora-r1", pitch: "REST", duration: 0.5, absoluteBeat: 4 },

    { id: "ora-7", pitch: "Bb4", duration: 0.25, absoluteBeat: 4.5 },
    { id: "ora-8", pitch: "C5", duration: 0.25, absoluteBeat: 4.75 },
    { id: "ora-9", pitch: "D5", duration: 0.5, absoluteBeat: 5 },
    { id: "ora-10", pitch: "C5", duration: 0.5, absoluteBeat: 5.5 },
    { id: "ora-11", pitch: "Bb4", duration: 0.5, absoluteBeat: 6 },
    { id: "ora-12", pitch: "C5", duration: 0.5, absoluteBeat: 6.5 },
    { id: "ora-13", pitch: "A4", duration: 0.5, absoluteBeat: 7 },
    { id: "ora-14", pitch: "F4", duration: 1, absoluteBeat: 7.5 },
    { id: "ora-15", pitch: "F4", duration: 0.5, absoluteBeat: 8.5 },

    { id: "ora-16", pitch: "Bb4", duration: 1, absoluteBeat: 9 },
    { id: "ora-17", pitch: "Bb4", duration: 0.5, absoluteBeat: 10 },
    { id: "ora-18", pitch: "A4", duration: 1, absoluteBeat: 10.5 },
    // Instrumental break (10.5 beats)
    { id: "ora-r2", pitch: "REST", duration: 0.5, absoluteBeat: 11.5 },
    { id: "ora-r3", pitch: "REST", duration: 4, absoluteBeat: 12 },
    { id: "ora-r4", pitch: "REST", duration: 4, absoluteBeat: 16 },
    { id: "ora-r5", pitch: "REST", duration: 2, absoluteBeat: 20 },

    // ═══════════════════════════════════════════════════════════════════
    // VERSE (Measures 6-12)
    // ═══════════════════════════════════════════════════════════════════
    { id: "ora-19", pitch: "F4", duration: 1, absoluteBeat: 22 },
    { id: "ora-20", pitch: "F4", duration: 0.5, absoluteBeat: 23 },
    { id: "ora-21", pitch: "Bb4", duration: 0.5, absoluteBeat: 23.5 },
    { id: "ora-22", pitch: "Bb4", duration: 0.5, absoluteBeat: 24 },
    { id: "ora-23", pitch: "Bb4", duration: 0.5, absoluteBeat: 24.5 },
    { id: "ora-24", pitch: "Bb4", duration: 1, absoluteBeat: 25 },
    { id: "ora-r6", pitch: "REST", duration: 4, absoluteBeat: 26 },
    { id: "ora-r7", pitch: "REST", duration: 0.5, absoluteBeat: 30 },

    { id: "ora-25", pitch: "C5", duration: 0.5, absoluteBeat: 30.5 },
    { id: "ora-26", pitch: "F5", duration: 2, absoluteBeat: 31 },
    { id: "ora-27", pitch: "D5", duration: 1, absoluteBeat: 33 },
    { id: "ora-28", pitch: "C5", duration: 1, absoluteBeat: 34 },

    { id: "ora-29", pitch: "Bb4", duration: 1.5, absoluteBeat: 35 },
    { id: "ora-30", pitch: "G4", duration: 0.5, absoluteBeat: 36.5 },
    { id: "ora-31", pitch: "Bb4", duration: 0.5, absoluteBeat: 37 },
    { id: "ora-32", pitch: "C5", duration: 0.5, absoluteBeat: 37.5 },
    { id: "ora-33", pitch: "D5", duration: 0.5, absoluteBeat: 38 },
    { id: "ora-34", pitch: "C5", duration: 0.5, absoluteBeat: 38.5 },
    { id: "ora-35", pitch: "C5", duration: 0.5, absoluteBeat: 39 },
    { id: "ora-36", pitch: "F4", duration: 1.5, absoluteBeat: 39.5 },

    { id: "ora-37", pitch: "D5", duration: 1, absoluteBeat: 41 },
    { id: "ora-38", pitch: "C5", duration: 1, absoluteBeat: 42 },
    { id: "ora-39", pitch: "Bb4", duration: 1.5, absoluteBeat: 43 },
    { id: "ora-40", pitch: "G4", duration: 0.5, absoluteBeat: 44.5 },
    { id: "ora-41", pitch: "Bb4", duration: 0.5, absoluteBeat: 45 },
    { id: "ora-42", pitch: "C5", duration: 0.5, absoluteBeat: 45.5 },
    { id: "ora-43", pitch: "D5", duration: 0.5, absoluteBeat: 46 },
    { id: "ora-44", pitch: "C5", duration: 0.5, absoluteBeat: 46.5 },
    { id: "ora-45", pitch: "C5", duration: 3, absoluteBeat: 47 },
    { id: "ora-r8", pitch: "REST", duration: 0.5, absoluteBeat: 50 },

    // ═══════════════════════════════════════════════════════════════════
    // CHORUS (Measures 13-22)
    // ═══════════════════════════════════════════════════════════════════
    { id: "ora-46", pitch: "C5", duration: 0.5, absoluteBeat: 50.5 },
    { id: "ora-47", pitch: "C5", duration: 0.5, absoluteBeat: 51 },
    { id: "ora-48", pitch: "C5", duration: 0.5, absoluteBeat: 51.5 },
    { id: "ora-49", pitch: "C5", duration: 0.5, absoluteBeat: 52 },
    { id: "ora-50", pitch: "C5", duration: 0.5, absoluteBeat: 52.5 },
    { id: "ora-51", pitch: "C5", duration: 0.5, absoluteBeat: 53 },
    { id: "ora-52", pitch: "F5", duration: 0.5, absoluteBeat: 53.5 },
    { id: "ora-53", pitch: "Eb5", duration: 0.5, absoluteBeat: 54 },
    { id: "ora-54", pitch: "Eb5", duration: 0.5, absoluteBeat: 54.5 },
    { id: "ora-55", pitch: "Eb5", duration: 0.5, absoluteBeat: 55 },
    { id: "ora-56", pitch: "D5", duration: 1.5, absoluteBeat: 55.5 },
    { id: "ora-r9", pitch: "REST", duration: 1.5, absoluteBeat: 57 },

    { id: "ora-57", pitch: "Bb4", duration: 0.5, absoluteBeat: 58.5 },
    { id: "ora-58", pitch: "Bb4", duration: 0.5, absoluteBeat: 59 },
    { id: "ora-59", pitch: "Bb4", duration: 0.5, absoluteBeat: 59.5 },
    { id: "ora-60", pitch: "Bb4", duration: 0.5, absoluteBeat: 60 },
    { id: "ora-61", pitch: "Bb4", duration: 0.5, absoluteBeat: 60.5 },
    { id: "ora-62", pitch: "Bb4", duration: 0.5, absoluteBeat: 61 },
    { id: "ora-63", pitch: "G5", duration: 0.5, absoluteBeat: 61.5 },
    { id: "ora-64", pitch: "G5", duration: 0.5, absoluteBeat: 62 },
    { id: "ora-65", pitch: "D5", duration: 0.5, absoluteBeat: 62.5 },
    { id: "ora-66", pitch: "F5", duration: 2, absoluteBeat: 63 },

    { id: "ora-67", pitch: "D5", duration: 1, absoluteBeat: 65 },
    { id: "ora-68", pitch: "C5", duration: 1, absoluteBeat: 66 },
    { id: "ora-69", pitch: "Bb4", duration: 1.5, absoluteBeat: 67 },
    { id: "ora-70", pitch: "G4", duration: 0.5, absoluteBeat: 68.5 },
    { id: "ora-71", pitch: "Bb4", duration: 0.5, absoluteBeat: 69 },
    { id: "ora-72", pitch: "C5", duration: 0.5, absoluteBeat: 69.5 },
    { id: "ora-73", pitch: "D5", duration: 0.5, absoluteBeat: 70 },
    { id: "ora-74", pitch: "C5", duration: 0.5, absoluteBeat: 70.5 },
    { id: "ora-75", pitch: "C5", duration: 0.5, absoluteBeat: 71 },
    { id: "ora-76", pitch: "F4", duration: 1.5, absoluteBeat: 71.5 },

    { id: "ora-77", pitch: "D5", duration: 1, absoluteBeat: 73 },
    { id: "ora-78", pitch: "C5", duration: 1, absoluteBeat: 74 },
    { id: "ora-79", pitch: "Bb4", duration: 1.5, absoluteBeat: 75 },
    { id: "ora-80", pitch: "G4", duration: 0.5, absoluteBeat: 76.5 },
    { id: "ora-81", pitch: "Bb4", duration: 0.5, absoluteBeat: 77 },
    { id: "ora-82", pitch: "C5", duration: 0.5, absoluteBeat: 77.5 },
    { id: "ora-83", pitch: "D5", duration: 0.5, absoluteBeat: 78 },
    { id: "ora-84", pitch: "C5", duration: 0.5, absoluteBeat: 78.5 },
    { id: "ora-r10", pitch: "REST", duration: 0.5, absoluteBeat: 79 },

    // ═══════════════════════════════════════════════════════════════════
    // ENDING (Measures 20-23)
    // ═══════════════════════════════════════════════════════════════════
    { id: "ora-85", pitch: "F5", duration: 0.5, absoluteBeat: 79.5 },
    { id: "ora-86", pitch: "F5", duration: 0.5, absoluteBeat: 80 },
    { id: "ora-87", pitch: "F5", duration: 0.5, absoluteBeat: 80.5 },
    { id: "ora-88", pitch: "F5", duration: 0.5, absoluteBeat: 81 },
    { id: "ora-89", pitch: "F5", duration: 0.5, absoluteBeat: 81.5 },
    { id: "ora-90", pitch: "Eb5", duration: 0.5, absoluteBeat: 82 },
    { id: "ora-91", pitch: "D5", duration: 0.5, absoluteBeat: 82.5 },
    { id: "ora-92", pitch: "D5", duration: 0.5, absoluteBeat: 83 },
    { id: "ora-93", pitch: "D5", duration: 0.5, absoluteBeat: 83.5 },
    { id: "ora-94", pitch: "C5", duration: 1, absoluteBeat: 84 },
    { id: "ora-95", pitch: "Bb4", duration: 0.5, absoluteBeat: 85 },
    { id: "ora-96", pitch: "C5", duration: 0.5, absoluteBeat: 85.5 },
    { id: "ora-97", pitch: "Bb4", duration: 0.5, absoluteBeat: 86 },
    { id: "ora-98", pitch: "C5", duration: 1, absoluteBeat: 86.5 },

    // Final G
    { id: "ora-99", pitch: "G4", duration: 4, absoluteBeat: 87.5 },
  ],

  repeatMarkers: [],

  lyrics: [],

  settings: {
    tempo: 100,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-03",

  transcriptionNotes: {
    original: {
      key: "Bb Major (2 flats)",
      timeSignature: "4/4",
      features: [
        "Popular Jewish song about loving your neighbor",
        "Upbeat tempo",
        "10.5-beat instrumental break between intro and verse",
      ],
    },
    changes: [],
    sources: {
      sheetMusic: "Israeli Note - Omar Rabbi Akiva",
    },
    transcribedDate: "2026-02-03",
  },
};
