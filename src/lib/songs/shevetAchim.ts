// Shevet Achim (שבת אחים)
// Key: A minor (no sharps/flats), Time: 4/4 (normalized from mixed meter)
// Traditional Jewish song
import { SongData } from "./types";

export const shevetAchim: SongData = {
  id: "default-shevet-achim",
  name: "Shevet Achim",
  hebrewName: "שבת אחים",
  description: "הנה מה טוב ומה נעים שבת אחים גם יחד",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // SECTION A - Verse (4/4 time, Measures 1-4)
    // "Hinei ma tov uma na'im, shevet achim gam yachad"
    // ═══════════════════════════════════════════════════════════════════
    // Measure 1 (pickup + first full measure)
    { id: "shevet-1", pitch: "C5", duration: 0.5, absoluteBeat: 0.5 },
    { id: "shevet-2", pitch: "C5", duration: 0.5, absoluteBeat: 1 },
    { id: "shevet-3", pitch: "C5", duration: 0.5, absoluteBeat: 1.5 },
    { id: "shevet-4", pitch: "B4", duration: 1, absoluteBeat: 2 },
    { id: "shevet-5", pitch: "A4", duration: 1, absoluteBeat: 3 },
    // Measure 2
    { id: "shevet-6", pitch: "G4", duration: 1, absoluteBeat: 4 },
    { id: "shevet-7", pitch: "A4", duration: 1, absoluteBeat: 5 },
    { id: "shevet-8", pitch: "A4", duration: 1, absoluteBeat: 6 },
    // rest beat 7
    // Measure 3 (repeat of phrase)
    { id: "shevet-9", pitch: "C5", duration: 0.5, absoluteBeat: 8.5 },
    { id: "shevet-10", pitch: "C5", duration: 0.5, absoluteBeat: 9 },
    { id: "shevet-11", pitch: "C5", duration: 0.5, absoluteBeat: 9.5 },
    { id: "shevet-12", pitch: "B4", duration: 1, absoluteBeat: 10 },
    { id: "shevet-13", pitch: "A4", duration: 1, absoluteBeat: 11 },
    // Measure 4
    { id: "shevet-14", pitch: "G4", duration: 1, absoluteBeat: 12 },
    { id: "shevet-15", pitch: "A4", duration: 1, absoluteBeat: 13 },
    { id: "shevet-16", pitch: "A4", duration: 1, absoluteBeat: 14 },
    // rest beat 15

    // ═══════════════════════════════════════════════════════════════════
    // SECTION B - Bridge (9/8 feel, Measures 5-8)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 5 (9/8 → treating as 4.5 beats worth)
    { id: "shevet-17", pitch: "G4", duration: 0.5, absoluteBeat: 16.5 },
    { id: "shevet-18", pitch: "G4", duration: 0.5, absoluteBeat: 17 },
    { id: "shevet-19", pitch: "G4", duration: 0.5, absoluteBeat: 17.5 },
    { id: "shevet-20", pitch: "C5", duration: 0.5, absoluteBeat: 18 },
    { id: "shevet-21", pitch: "C5", duration: 0.5, absoluteBeat: 18.5 },
    { id: "shevet-22", pitch: "C5", duration: 0.5, absoluteBeat: 19 },
    { id: "shevet-23", pitch: "E5", duration: 0.5, absoluteBeat: 19.5 },
    // Measure 6
    { id: "shevet-24", pitch: "D5", duration: 0.75, absoluteBeat: 20 },
    { id: "shevet-25", pitch: "C5", duration: 0.25, absoluteBeat: 20.75 },
    { id: "shevet-26", pitch: "A4", duration: 1, absoluteBeat: 21 },
    // rest
    // Measure 7
    { id: "shevet-27", pitch: "D5", duration: 0.5, absoluteBeat: 24.5 },
    { id: "shevet-28", pitch: "D5", duration: 0.5, absoluteBeat: 25 },
    { id: "shevet-29", pitch: "C5", duration: 0.5, absoluteBeat: 25.5 },
    { id: "shevet-30", pitch: "D5", duration: 0.5, absoluteBeat: 26 },
    { id: "shevet-31", pitch: "C5", duration: 0.5, absoluteBeat: 26.5 },
    { id: "shevet-32", pitch: "D5", duration: 0.5, absoluteBeat: 27 },
    { id: "shevet-33", pitch: "E5", duration: 0.5, absoluteBeat: 27.5 },
    // Measure 8
    { id: "shevet-34", pitch: "A4", duration: 1, absoluteBeat: 28 },
    // rest
    { id: "shevet-35", pitch: "C5", duration: 0.5, absoluteBeat: 30 },
    { id: "shevet-36", pitch: "B4", duration: 0.5, absoluteBeat: 30.5 },
    { id: "shevet-37", pitch: "A4", duration: 0.5, absoluteBeat: 31 },
    // rest
    // Measure 9
    { id: "shevet-38", pitch: "A4", duration: 1, absoluteBeat: 32 },
    // rest

    // ═══════════════════════════════════════════════════════════════════
    // SECTION C - Interlude (Measures 10-11)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 10
    { id: "shevet-39", pitch: "D5", duration: 0.25, absoluteBeat: 36.75 },
    { id: "shevet-40", pitch: "D5", duration: 0.5, absoluteBeat: 37 },
    { id: "shevet-41", pitch: "C5", duration: 0.5, absoluteBeat: 37.5 },
    { id: "shevet-42", pitch: "D5", duration: 0.75, absoluteBeat: 38 },
    { id: "shevet-43", pitch: "C5", duration: 0.25, absoluteBeat: 38.75 },
    { id: "shevet-44", pitch: "D5", duration: 0.5, absoluteBeat: 39 },
    { id: "shevet-45", pitch: "E5", duration: 0.5, absoluteBeat: 39.5 },
    // Measure 11
    { id: "shevet-46", pitch: "A4", duration: 2, absoluteBeat: 40 },
    // rest

    // ═══════════════════════════════════════════════════════════════════
    // SECTION D - Second Bridge (Measures 12-13)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 12
    { id: "shevet-47", pitch: "G4", duration: 0.5, absoluteBeat: 44.5 },
    { id: "shevet-48", pitch: "G4", duration: 0.5, absoluteBeat: 45 },
    { id: "shevet-49", pitch: "G4", duration: 0.5, absoluteBeat: 45.5 },
    { id: "shevet-50", pitch: "C5", duration: 0.5, absoluteBeat: 46 },
    { id: "shevet-51", pitch: "C5", duration: 0.5, absoluteBeat: 46.5 },
    { id: "shevet-52", pitch: "C5", duration: 0.5, absoluteBeat: 47 },
    { id: "shevet-53", pitch: "E5", duration: 0.5, absoluteBeat: 47.5 },
    // Measure 13
    { id: "shevet-54", pitch: "D5", duration: 0.75, absoluteBeat: 48 },
    { id: "shevet-55", pitch: "C5", duration: 0.25, absoluteBeat: 48.75 },
    { id: "shevet-56", pitch: "A4", duration: 1, absoluteBeat: 49 },
    // rest
    { id: "shevet-57", pitch: "D5", duration: 0.5, absoluteBeat: 51.5 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION E - Development (2/2 time, Measures 14-17)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 14 (2/2 = 4 quarter beats)
    { id: "shevet-58", pitch: "D5", duration: 0.5, absoluteBeat: 52 },
    { id: "shevet-59", pitch: "C5", duration: 0.5, absoluteBeat: 52.5 },
    { id: "shevet-60", pitch: "D5", duration: 0.5, absoluteBeat: 53 },
    { id: "shevet-61", pitch: "C5", duration: 0.5, absoluteBeat: 53.5 },
    { id: "shevet-62", pitch: "D5", duration: 0.5, absoluteBeat: 54 },
    { id: "shevet-63", pitch: "C5", duration: 0.5, absoluteBeat: 54.5 },
    { id: "shevet-64", pitch: "D5", duration: 0.5, absoluteBeat: 55 },
    { id: "shevet-65", pitch: "E5", duration: 0.5, absoluteBeat: 55.5 },
    // Measure 15
    { id: "shevet-66", pitch: "E5", duration: 0.75, absoluteBeat: 56 },
    { id: "shevet-67", pitch: "D5", duration: 0.25, absoluteBeat: 56.75 },
    { id: "shevet-68", pitch: "C5", duration: 0.75, absoluteBeat: 57 },
    { id: "shevet-69", pitch: "B4", duration: 0.25, absoluteBeat: 57.75 },
    { id: "shevet-70", pitch: "A4", duration: 2, absoluteBeat: 58 },
    // Measure 16
    { id: "shevet-71", pitch: "A4", duration: 0.5, absoluteBeat: 60.5 },
    { id: "shevet-72", pitch: "A4", duration: 0.5, absoluteBeat: 61 },
    { id: "shevet-73", pitch: "A4", duration: 0.5, absoluteBeat: 61.5 },
    { id: "shevet-74", pitch: "C5", duration: 0.5, absoluteBeat: 62 },
    { id: "shevet-75", pitch: "A4", duration: 0.5, absoluteBeat: 62.5 },
    { id: "shevet-76", pitch: "C5", duration: 0.5, absoluteBeat: 63 },
    { id: "shevet-77", pitch: "E5", duration: 0.5, absoluteBeat: 63.5 },
    // Measure 17
    { id: "shevet-78", pitch: "D5", duration: 2, absoluteBeat: 64 },
    { id: "shevet-79", pitch: "C5", duration: 1, absoluteBeat: 66 },
    { id: "shevet-80", pitch: "D5", duration: 1, absoluteBeat: 67 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION F - Ending (Measures 18-28)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 18
    { id: "shevet-81", pitch: "C5", duration: 0.75, absoluteBeat: 68 },
    { id: "shevet-82", pitch: "B4", duration: 0.25, absoluteBeat: 68.75 },
    { id: "shevet-83", pitch: "A4", duration: 1, absoluteBeat: 69 },
    { id: "shevet-84", pitch: "A4", duration: 1, absoluteBeat: 70 },
    { id: "shevet-85", pitch: "B4", duration: 1, absoluteBeat: 71 },
    // Measure 19
    { id: "shevet-86", pitch: "C5", duration: 1, absoluteBeat: 72 },
    // rest
    { id: "shevet-87", pitch: "C5", duration: 1, absoluteBeat: 74 },
    { id: "shevet-88", pitch: "E5", duration: 1, absoluteBeat: 75 },
    // Measure 20
    { id: "shevet-89", pitch: "D5", duration: 1, absoluteBeat: 76 },
    { id: "shevet-90", pitch: "A4", duration: 1, absoluteBeat: 77 },
    { id: "shevet-91", pitch: "D5", duration: 1, absoluteBeat: 78 },
    { id: "shevet-92", pitch: "E5", duration: 1, absoluteBeat: 79 },
    // Measure 21
    { id: "shevet-93", pitch: "C5", duration: 1, absoluteBeat: 80 },
    // rest
    { id: "shevet-94", pitch: "C5", duration: 1, absoluteBeat: 82 },
    { id: "shevet-95", pitch: "A4", duration: 1, absoluteBeat: 83 },
    // Measure 22
    { id: "shevet-96", pitch: "G4", duration: 1, absoluteBeat: 84 },
    { id: "shevet-97", pitch: "G4", duration: 1, absoluteBeat: 85 },
    { id: "shevet-98", pitch: "C5", duration: 1, absoluteBeat: 86 },
    { id: "shevet-99", pitch: "E5", duration: 1, absoluteBeat: 87 },
    // Measure 23
    { id: "shevet-100", pitch: "D5", duration: 1, absoluteBeat: 88 },
    // rest
    { id: "shevet-101", pitch: "D5", duration: 1, absoluteBeat: 90 },
    { id: "shevet-102", pitch: "E5", duration: 1, absoluteBeat: 91 },
    // Measure 24
    { id: "shevet-103", pitch: "C5", duration: 1, absoluteBeat: 92 },
    { id: "shevet-104", pitch: "A4", duration: 1, absoluteBeat: 93 },
    { id: "shevet-105", pitch: "A4", duration: 1, absoluteBeat: 94 },
    { id: "shevet-106", pitch: "G4", duration: 1, absoluteBeat: 95 },
    // Measure 25
    { id: "shevet-107", pitch: "A4", duration: 1, absoluteBeat: 96 },
    { id: "shevet-108", pitch: "G4", duration: 1, absoluteBeat: 97 },
    { id: "shevet-109", pitch: "A4", duration: 1, absoluteBeat: 98 },
    { id: "shevet-110", pitch: "B4", duration: 1, absoluteBeat: 99 },
    // Measure 26
    { id: "shevet-111", pitch: "C5", duration: 2, absoluteBeat: 100 },
    // rest
    // Measure 27
    { id: "shevet-112", pitch: "D5", duration: 0.5, absoluteBeat: 104 },
    { id: "shevet-113", pitch: "D5", duration: 0.5, absoluteBeat: 104.5 },
    { id: "shevet-114", pitch: "C5", duration: 0.5, absoluteBeat: 105 },
    { id: "shevet-115", pitch: "D5", duration: 1, absoluteBeat: 105.5 }, // tied note combined
    { id: "shevet-116", pitch: "C5", duration: 0.5, absoluteBeat: 106.5 },
    { id: "shevet-117", pitch: "D5", duration: 0.5, absoluteBeat: 107 },
    { id: "shevet-118", pitch: "E5", duration: 0.5, absoluteBeat: 107.5 },
    // Measure 28 (Final)
    { id: "shevet-119", pitch: "C5", duration: 0.75, absoluteBeat: 108 },
    { id: "shevet-120", pitch: "B4", duration: 0.25, absoluteBeat: 108.75 },
    { id: "shevet-121", pitch: "A4", duration: 1, absoluteBeat: 109 },
    // rest (ending)
  ],

  repeatMarkers: [],

  lyrics: [
    // Verse 1
    { text: "Hi", absoluteBeat: 0.5 },
    { text: "nei", absoluteBeat: 1 },
    { text: "ma", absoluteBeat: 1.5 },
    { text: "tov", absoluteBeat: 2 },
    { text: "u", absoluteBeat: 3 },
    { text: "ma", absoluteBeat: 4 },
    { text: "na", absoluteBeat: 5 },
    { text: "'im", absoluteBeat: 6 },
    // Verse 1 repeat
    { text: "she", absoluteBeat: 8.5 },
    { text: "vet", absoluteBeat: 9 },
    { text: "a", absoluteBeat: 9.5 },
    { text: "chim", absoluteBeat: 10 },
    { text: "gam", absoluteBeat: 11 },
    { text: "ya", absoluteBeat: 12 },
    { text: "chad", absoluteBeat: 13 },
  ],

  settings: {
    tempo: 100,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-03",

  transcriptionNotes: {
    original: {
      key: "A minor (no key signature)",
      timeSignature: "Mixed: 4/4 → 9/8 → 2/2",
      features: [
        "Time signature changes throughout",
        "Dotted rhythms (dotted eighth + sixteenth)",
        "One tied note near end",
        "Multiple rests",
        "No accidentals - pure A minor",
      ],
    },
    changes: [
      {
        what: "Normalized all time signatures to 4/4",
        why: "App does not support time signature changes",
      },
      {
        what: "Combined tied notes into single duration",
        why: "App does not support ties",
      },
      {
        what: "Omitted rests",
        why: "Rest rendering not yet implemented",
      },
    ],
    sources: {
      sheetMusic: "Israeli Note - 1770159405415751_556.musicxml",
    },
    transcribedDate: "2026-02-03",
  },
};
