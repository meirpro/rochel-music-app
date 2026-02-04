// SheHashemesh (שהשמש)
// Original Key: G minor (2 flats), Transposed to: E minor (1 sharp)
// Time: 4/4
import { SongData } from "./types";

export const sheHashemesh: SongData = {
  id: "default-she-hashemesh",
  name: "SheHashemesh",
  hebrewName: "שהשמש",
  description: "שיר ישראלי אהוב",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // SECTION A - Verse 1 (Measures 1-6)
    // Transposed from G minor to E minor
    // ═══════════════════════════════════════════════════════════════════
    // Measure 1
    { id: "sheh-1", pitch: "E4", duration: 0.5, absoluteBeat: 0 },
    { id: "sheh-2", pitch: "G4", duration: 0.5, absoluteBeat: 0.5 },
    { id: "sheh-3", pitch: "A4", duration: 0.5, absoluteBeat: 1 },
    // Measure 2
    { id: "sheh-4", pitch: "B4", duration: 2, absoluteBeat: 1.5 },
    // rest
    { id: "sheh-5", pitch: "C5", duration: 0.5, absoluteBeat: 4 },
    { id: "sheh-6", pitch: "C5", duration: 0.5, absoluteBeat: 4.5 },
    { id: "sheh-7", pitch: "C5", duration: 0.5, absoluteBeat: 5 },
    // Measure 3
    { id: "sheh-8", pitch: "B4", duration: 0.75, absoluteBeat: 5.5 },
    { id: "sheh-9", pitch: "B4", duration: 1.25, absoluteBeat: 6.25 }, // tied note combined
    // rest
    { id: "sheh-10", pitch: "A4", duration: 0.5, absoluteBeat: 8 },
    { id: "sheh-11", pitch: "C5", duration: 0.5, absoluteBeat: 8.5 },
    { id: "sheh-12", pitch: "A4", duration: 0.5, absoluteBeat: 9 },
    // Measure 4
    { id: "sheh-13", pitch: "G4", duration: 2, absoluteBeat: 9.5 },
    // rest
    { id: "sheh-14", pitch: "F#4", duration: 0.5, absoluteBeat: 12 },
    { id: "sheh-15", pitch: "F#4", duration: 0.25, absoluteBeat: 12.5 },
    { id: "sheh-16", pitch: "E4", duration: 0.25, absoluteBeat: 12.75 },
    { id: "sheh-17", pitch: "F#4", duration: 0.5, absoluteBeat: 13 },
    // Measure 5
    { id: "sheh-18", pitch: "G4", duration: 2, absoluteBeat: 13.5 },
    // rest
    { id: "sheh-19", pitch: "E4", duration: 0.5, absoluteBeat: 16 },
    { id: "sheh-20", pitch: "G4", duration: 0.5, absoluteBeat: 16.5 },
    { id: "sheh-21", pitch: "B4", duration: 0.5, absoluteBeat: 17 },
    // Measure 6
    { id: "sheh-22", pitch: "E4", duration: 2, absoluteBeat: 17.5 },
    // rest
    { id: "sheh-23", pitch: "F#4", duration: 0.5, absoluteBeat: 20 },
    { id: "sheh-24", pitch: "F#4", duration: 0.5, absoluteBeat: 20.5 },
    { id: "sheh-25", pitch: "G4", duration: 0.5, absoluteBeat: 21 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION B - Verse 2 (Measures 7-12)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 7
    { id: "sheh-26", pitch: "A4", duration: 1.5, absoluteBeat: 21.5 },
    { id: "sheh-27", pitch: "C5", duration: 1, absoluteBeat: 23 }, // tied note combined
    { id: "sheh-28", pitch: "C5", duration: 0.5, absoluteBeat: 24 },
    { id: "sheh-29", pitch: "C5", duration: 0.5, absoluteBeat: 24.5 },
    { id: "sheh-30", pitch: "C5", duration: 0.5, absoluteBeat: 25 },
    // Measure 8
    { id: "sheh-31", pitch: "B4", duration: 0.75, absoluteBeat: 25.5 },
    { id: "sheh-32", pitch: "B4", duration: 1.25, absoluteBeat: 26.25 }, // tied
    // rest
    { id: "sheh-33", pitch: "B4", duration: 0.5, absoluteBeat: 28 },
    { id: "sheh-34", pitch: "E5", duration: 0.5, absoluteBeat: 28.5 },
    { id: "sheh-35", pitch: "B4", duration: 0.5, absoluteBeat: 29 },
    // Measure 9
    { id: "sheh-36", pitch: "A4", duration: 2, absoluteBeat: 29.5 },
    // rest
    { id: "sheh-37", pitch: "A4", duration: 0.5, absoluteBeat: 32 },
    { id: "sheh-38", pitch: "C5", duration: 0.5, absoluteBeat: 32.5 },
    { id: "sheh-39", pitch: "A4", duration: 0.5, absoluteBeat: 33 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION C - Development (Measures 10-18)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 10
    { id: "sheh-40", pitch: "B4", duration: 2, absoluteBeat: 33.5 },
    // rest
    { id: "sheh-41", pitch: "E4", duration: 0.5, absoluteBeat: 36 },
    { id: "sheh-42", pitch: "G4", duration: 0.5, absoluteBeat: 36.5 },
    { id: "sheh-43", pitch: "A4", duration: 0.5, absoluteBeat: 37 },
    // Measure 11
    { id: "sheh-44", pitch: "B4", duration: 2, absoluteBeat: 37.5 },
    // rest
    { id: "sheh-45", pitch: "C5", duration: 0.5, absoluteBeat: 40 },
    { id: "sheh-46", pitch: "C5", duration: 0.5, absoluteBeat: 40.5 },
    { id: "sheh-47", pitch: "C5", duration: 0.5, absoluteBeat: 41 },
    // Measure 12
    { id: "sheh-48", pitch: "B4", duration: 0.75, absoluteBeat: 41.5 },
    { id: "sheh-49", pitch: "B4", duration: 1.25, absoluteBeat: 42.25 }, // tied
    // rest
    { id: "sheh-50", pitch: "C5", duration: 0.5, absoluteBeat: 44.5 },
    { id: "sheh-51", pitch: "A4", duration: 0.5, absoluteBeat: 45 },
    // Measure 13
    { id: "sheh-52", pitch: "G4", duration: 0.75, absoluteBeat: 45.5 },
    { id: "sheh-53", pitch: "G4", duration: 1.25, absoluteBeat: 46.25 }, // tied
    { id: "sheh-54", pitch: "A4", duration: 0.25, absoluteBeat: 47.5 },
    { id: "sheh-55", pitch: "A4", duration: 0.75, absoluteBeat: 47.75 },
    { id: "sheh-56", pitch: "F#4", duration: 0.5, absoluteBeat: 48.5 },
    { id: "sheh-57", pitch: "F#4", duration: 0.5, absoluteBeat: 49 },
    // Measure 14
    { id: "sheh-58", pitch: "E4", duration: 2, absoluteBeat: 49.5 },
    // rest
    { id: "sheh-59", pitch: "B4", duration: 0.5, absoluteBeat: 52.5 },
    { id: "sheh-60", pitch: "C5", duration: 0.5, absoluteBeat: 53 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION D - Climax (Measures 15-22)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 15
    { id: "sheh-61", pitch: "D5", duration: 1.5, absoluteBeat: 53.5 },
    { id: "sheh-62", pitch: "D5", duration: 0.5, absoluteBeat: 55 },
    { id: "sheh-63", pitch: "D5", duration: 1, absoluteBeat: 55.5 },
    { id: "sheh-64", pitch: "B4", duration: 0.5, absoluteBeat: 56.5 },
    { id: "sheh-65", pitch: "D5", duration: 0.5, absoluteBeat: 57 },
    // Measure 16
    { id: "sheh-66", pitch: "E5", duration: 1, absoluteBeat: 57.5 },
    { id: "sheh-67", pitch: "D5", duration: 0.5, absoluteBeat: 58.5 },
    { id: "sheh-68", pitch: "C5", duration: 0.5, absoluteBeat: 59 },
    { id: "sheh-69", pitch: "B4", duration: 1, absoluteBeat: 59.5 },
    { id: "sheh-70", pitch: "G4", duration: 0.5, absoluteBeat: 60.5 },
    { id: "sheh-71", pitch: "B4", duration: 0.5, absoluteBeat: 61 },
    // Measure 17
    { id: "sheh-72", pitch: "E5", duration: 1, absoluteBeat: 61.5 },
    { id: "sheh-73", pitch: "E5", duration: 1, absoluteBeat: 62.5 },
    { id: "sheh-74", pitch: "E5", duration: 0.25, absoluteBeat: 63.5 },
    { id: "sheh-75", pitch: "E5", duration: 0.5, absoluteBeat: 63.75 },
    { id: "sheh-76", pitch: "D5", duration: 0.5, absoluteBeat: 64.25 }, // tied combined
    { id: "sheh-77", pitch: "C5", duration: 0.5, absoluteBeat: 64.75 },
    // Measure 18
    { id: "sheh-78", pitch: "B4", duration: 2, absoluteBeat: 65.25 },
    // rest
    { id: "sheh-79", pitch: "G4", duration: 0.5, absoluteBeat: 68.5 },
    { id: "sheh-80", pitch: "B4", duration: 0.5, absoluteBeat: 69 },
    // Measure 19
    { id: "sheh-81", pitch: "E5", duration: 1, absoluteBeat: 69.5 },
    { id: "sheh-82", pitch: "E5", duration: 0.5, absoluteBeat: 70.5 },
    { id: "sheh-83", pitch: "E5", duration: 1, absoluteBeat: 71 }, // tied
    { id: "sheh-84", pitch: "E5", duration: 0.5, absoluteBeat: 72 },
    { id: "sheh-85", pitch: "D5", duration: 0.5, absoluteBeat: 72.5 },
    { id: "sheh-86", pitch: "C5", duration: 0.5, absoluteBeat: 73 },
    // Measure 20
    { id: "sheh-87", pitch: "B4", duration: 2, absoluteBeat: 73.5 },
    // rest
    { id: "sheh-88", pitch: "B4", duration: 0.5, absoluteBeat: 76.5 },
    { id: "sheh-89", pitch: "C5", duration: 0.5, absoluteBeat: 77 },
    // Measure 21
    { id: "sheh-90", pitch: "B4", duration: 2, absoluteBeat: 77.5 },
    // rest
    { id: "sheh-91", pitch: "B4", duration: 0.5, absoluteBeat: 80 },
    { id: "sheh-92", pitch: "C5", duration: 0.5, absoluteBeat: 80.5 },
    { id: "sheh-93", pitch: "B4", duration: 0.5, absoluteBeat: 81 },
    // Measure 22
    { id: "sheh-94", pitch: "A4", duration: 2, absoluteBeat: 81.5 },
    // rest
  ],

  repeatMarkers: [],

  lyrics: [],

  settings: {
    tempo: 90,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-03",

  transcriptionNotes: {
    original: {
      key: "G minor (2 flats: Bb, Eb)",
      timeSignature: "4/4",
      features: [
        "Multiple tied notes",
        "Dotted rhythms",
        "16th notes",
        "Rests throughout",
      ],
    },
    changes: [
      {
        what: "Transposed from G minor to E minor",
        why: "App uses natural keys with minimal accidentals",
      },
      {
        what: "Combined tied notes into single durations",
        why: "App does not support ties",
      },
      {
        what: "Omitted rests",
        why: "Rest rendering not yet implemented",
      },
    ],
    sources: {
      sheetMusic: "Israeli Note - 1770159449523316_992.musicxml",
    },
    transcribedDate: "2026-02-03",
  },
};
