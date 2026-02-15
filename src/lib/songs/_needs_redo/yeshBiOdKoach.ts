// Yesh Bi Od Koach (יש בי עוד כוח)
// Original Key: Bb minor (5 flats), Transposed to: A minor
// Time: 2/2 (treated as 4/4)
// Very repetitive melody - great for learning
//
// ⚠️ NEEDS REDO: This song requires chords/harmony to sound correct.
// The melody alone doesn't work well - needs accompanying chord progression.
//
import { SongData } from "../types";

export const yeshBiOdKoach: SongData = {
  id: "default-yesh-bi-od-koach",
  name: "Yesh Bi Od Koach",
  hebrewName: "יש בי עוד כוח",
  description: "שיר עידוד ותקווה",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // SECTION A - First Statement (Measures 1-4)
    // Pattern: dotted quarter + eighth + eighth + quarter + eighth
    // Transposed from Bb minor to A minor
    // ═══════════════════════════════════════════════════════════════════
    // Measure 1
    { id: "yesh-1", pitch: "E4", duration: 1.5, absoluteBeat: 0 },
    { id: "yesh-2", pitch: "C4", duration: 0.5, absoluteBeat: 1.5 },
    { id: "yesh-3", pitch: "C4", duration: 0.5, absoluteBeat: 2 },
    { id: "yesh-4", pitch: "E4", duration: 1, absoluteBeat: 2.5 },
    { id: "yesh-5", pitch: "F4", duration: 0.5, absoluteBeat: 3.5 },
    // Measure 2
    { id: "yesh-6", pitch: "F4", duration: 1.5, absoluteBeat: 4 },
    { id: "yesh-7", pitch: "E4", duration: 0.5, absoluteBeat: 5.5 },
    { id: "yesh-8", pitch: "E4", duration: 0.5, absoluteBeat: 6 },
    { id: "yesh-9", pitch: "D4", duration: 1, absoluteBeat: 6.5 },
    { id: "yesh-10", pitch: "E4", duration: 0.5, absoluteBeat: 7.5 },
    // Measure 3
    { id: "yesh-11", pitch: "E4", duration: 1.5, absoluteBeat: 8 },
    { id: "yesh-12", pitch: "C4", duration: 0.5, absoluteBeat: 9.5 },
    { id: "yesh-13", pitch: "C4", duration: 0.5, absoluteBeat: 10 },
    { id: "yesh-14", pitch: "E4", duration: 1, absoluteBeat: 10.5 },
    { id: "yesh-15", pitch: "F4", duration: 0.5, absoluteBeat: 11.5 },
    // Measure 4
    { id: "yesh-16", pitch: "F4", duration: 1.5, absoluteBeat: 12 },
    { id: "yesh-17", pitch: "E4", duration: 0.5, absoluteBeat: 13.5 },
    { id: "yesh-18", pitch: "E4", duration: 1, absoluteBeat: 14 },
    // rest
    { id: "yesh-19", pitch: "D4", duration: 0.5, absoluteBeat: 15.5 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION B - Second Statement (Measures 5-8)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 5
    { id: "yesh-20", pitch: "F4", duration: 1.5, absoluteBeat: 16 },
    { id: "yesh-21", pitch: "D4", duration: 0.5, absoluteBeat: 17.5 },
    { id: "yesh-22", pitch: "D4", duration: 0.5, absoluteBeat: 18 },
    { id: "yesh-23", pitch: "F4", duration: 1, absoluteBeat: 18.5 },
    { id: "yesh-24", pitch: "G4", duration: 0.5, absoluteBeat: 19.5 },
    // Measure 6
    { id: "yesh-25", pitch: "G4", duration: 1.5, absoluteBeat: 20 },
    { id: "yesh-26", pitch: "F4", duration: 0.5, absoluteBeat: 21.5 },
    { id: "yesh-27", pitch: "F4", duration: 1, absoluteBeat: 22 },
    // rest
    { id: "yesh-28", pitch: "E4", duration: 0.5, absoluteBeat: 23.5 },
    // Measure 7
    { id: "yesh-29", pitch: "F4", duration: 1.5, absoluteBeat: 24 },
    { id: "yesh-30", pitch: "D4", duration: 0.5, absoluteBeat: 25.5 },
    { id: "yesh-31", pitch: "D4", duration: 0.5, absoluteBeat: 26 },
    { id: "yesh-32", pitch: "E4", duration: 1, absoluteBeat: 26.5 },
    { id: "yesh-33", pitch: "F4", duration: 0.5, absoluteBeat: 27.5 },
    // Measure 8
    { id: "yesh-34", pitch: "F4", duration: 1.5, absoluteBeat: 28 },
    { id: "yesh-35", pitch: "E4", duration: 0.5, absoluteBeat: 29.5 },
    { id: "yesh-36", pitch: "E4", duration: 1, absoluteBeat: 30 },
    // rest
    { id: "yesh-37", pitch: "D4", duration: 0.5, absoluteBeat: 31.5 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION C - Third Statement (Measures 9-12)
    // Nearly identical to Section A
    // ═══════════════════════════════════════════════════════════════════
    // Measure 9
    { id: "yesh-38", pitch: "E4", duration: 2, absoluteBeat: 32 },
    { id: "yesh-39", pitch: "C4", duration: 0.5, absoluteBeat: 34 },
    { id: "yesh-40", pitch: "E4", duration: 1, absoluteBeat: 34.5 },
    { id: "yesh-41", pitch: "F4", duration: 0.5, absoluteBeat: 35.5 },
    // Measure 10
    { id: "yesh-42", pitch: "F4", duration: 1.5, absoluteBeat: 36 },
    { id: "yesh-43", pitch: "E4", duration: 1, absoluteBeat: 37.5 }, // tied
    { id: "yesh-44", pitch: "D4", duration: 1, absoluteBeat: 38.5 },
    { id: "yesh-45", pitch: "E4", duration: 0.5, absoluteBeat: 39.5 },
    // Measure 11
    { id: "yesh-46", pitch: "E4", duration: 1.5, absoluteBeat: 40 },
    { id: "yesh-47", pitch: "C4", duration: 1, absoluteBeat: 41.5 }, // tied
    { id: "yesh-48", pitch: "E4", duration: 1, absoluteBeat: 42.5 },
    { id: "yesh-49", pitch: "F4", duration: 0.5, absoluteBeat: 43.5 },
    // Measure 12
    { id: "yesh-50", pitch: "F4", duration: 1.5, absoluteBeat: 44 },
    { id: "yesh-51", pitch: "E4", duration: 1.5, absoluteBeat: 45.5 }, // tied
    // rest
    { id: "yesh-52", pitch: "D4", duration: 0.5, absoluteBeat: 47.5 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION D - Fourth Statement (Measures 13-16)
    // Nearly identical to Section B
    // ═══════════════════════════════════════════════════════════════════
    // Measure 13
    { id: "yesh-53", pitch: "F4", duration: 1.5, absoluteBeat: 48 },
    { id: "yesh-54", pitch: "D4", duration: 0.5, absoluteBeat: 49.5 },
    { id: "yesh-55", pitch: "D4", duration: 0.5, absoluteBeat: 50 },
    { id: "yesh-56", pitch: "F4", duration: 1, absoluteBeat: 50.5 },
    { id: "yesh-57", pitch: "G4", duration: 0.5, absoluteBeat: 51.5 },
    // Measure 14
    { id: "yesh-58", pitch: "G4", duration: 1.5, absoluteBeat: 52 },
    { id: "yesh-59", pitch: "F4", duration: 0.5, absoluteBeat: 53.5 },
    { id: "yesh-60", pitch: "F4", duration: 0.5, absoluteBeat: 54 },
    { id: "yesh-61", pitch: "D4", duration: 1, absoluteBeat: 54.5 },
    { id: "yesh-62", pitch: "E4", duration: 0.5, absoluteBeat: 55.5 },
    // Measure 15
    { id: "yesh-63", pitch: "F4", duration: 2, absoluteBeat: 56 },
    { id: "yesh-64", pitch: "D4", duration: 0.5, absoluteBeat: 58 },
    { id: "yesh-65", pitch: "A4", duration: 1, absoluteBeat: 58.5 },
    { id: "yesh-66", pitch: "G4", duration: 0.5, absoluteBeat: 59.5 },
    // Measure 16
    { id: "yesh-67", pitch: "G4", duration: 1.5, absoluteBeat: 60 },
    { id: "yesh-68", pitch: "F4", duration: 0.5, absoluteBeat: 61.5 },
    { id: "yesh-69", pitch: "F4", duration: 0.5, absoluteBeat: 62 },
    { id: "yesh-70", pitch: "E4", duration: 1, absoluteBeat: 62.5 },
    { id: "yesh-71", pitch: "C4", duration: 0.5, absoluteBeat: 63.5 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION E - Fifth Statement (Measures 17-20)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 17
    { id: "yesh-72", pitch: "C4", duration: 1.5, absoluteBeat: 64 },
    { id: "yesh-73", pitch: "C4", duration: 1, absoluteBeat: 65.5 }, // tied
    { id: "yesh-74", pitch: "A4", duration: 1, absoluteBeat: 66.5 },
    { id: "yesh-75", pitch: "G4", duration: 0.5, absoluteBeat: 67.5 },
    // Measure 18
    { id: "yesh-76", pitch: "G4", duration: 1.5, absoluteBeat: 68 },
    { id: "yesh-77", pitch: "F4", duration: 0.5, absoluteBeat: 69.5 },
    { id: "yesh-78", pitch: "F4", duration: 0.5, absoluteBeat: 70 },
    { id: "yesh-79", pitch: "E4", duration: 1, absoluteBeat: 70.5 },
    { id: "yesh-80", pitch: "F4", duration: 0.5, absoluteBeat: 71.5 },
    // Measure 19
    { id: "yesh-81", pitch: "F4", duration: 2, absoluteBeat: 72 },
    { id: "yesh-82", pitch: "D4", duration: 0.5, absoluteBeat: 74 },
    { id: "yesh-83", pitch: "E4", duration: 1, absoluteBeat: 74.5 },
    { id: "yesh-84", pitch: "F4", duration: 0.5, absoluteBeat: 75.5 },
    // Measure 20
    { id: "yesh-85", pitch: "F4", duration: 1.5, absoluteBeat: 76 },
    { id: "yesh-86", pitch: "E4", duration: 0.5, absoluteBeat: 77.5 },
    { id: "yesh-87", pitch: "E4", duration: 0.5, absoluteBeat: 78 },
    { id: "yesh-88", pitch: "D4", duration: 1, absoluteBeat: 78.5 },
    { id: "yesh-89", pitch: "C4", duration: 0.5, absoluteBeat: 79.5 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION F - Sixth Statement (Measures 21-24)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 21
    { id: "yesh-90", pitch: "C4", duration: 2, absoluteBeat: 80 },
    { id: "yesh-91", pitch: "A3", duration: 1, absoluteBeat: 82 },
    { id: "yesh-92", pitch: "C4", duration: 1, absoluteBeat: 83 },
    // Measure 22
    { id: "yesh-93", pitch: "E4", duration: 1.5, absoluteBeat: 84 },
    { id: "yesh-94", pitch: "D4", duration: 1.5, absoluteBeat: 85.5 }, // tied
    // rest
    { id: "yesh-95", pitch: "C4", duration: 0.5, absoluteBeat: 87.5 },
    // Measure 23
    { id: "yesh-96", pitch: "E4", duration: 1.5, absoluteBeat: 88 },
    { id: "yesh-97", pitch: "C4", duration: 1, absoluteBeat: 89.5 }, // tied
    { id: "yesh-98", pitch: "E4", duration: 1, absoluteBeat: 90.5 },
    { id: "yesh-99", pitch: "F4", duration: 0.5, absoluteBeat: 91.5 },
    // Measure 24
    { id: "yesh-100", pitch: "F4", duration: 1.5, absoluteBeat: 92 },
    { id: "yesh-101", pitch: "E4", duration: 1.5, absoluteBeat: 93.5 }, // tied
    // rest
    { id: "yesh-102", pitch: "D4", duration: 0.5, absoluteBeat: 95.5 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION G - Seventh Statement (Measures 25-28)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 25
    { id: "yesh-103", pitch: "F4", duration: 1.5, absoluteBeat: 96 },
    { id: "yesh-104", pitch: "D4", duration: 0.5, absoluteBeat: 97.5 },
    { id: "yesh-105", pitch: "D4", duration: 0.5, absoluteBeat: 98 },
    { id: "yesh-106", pitch: "F4", duration: 1, absoluteBeat: 98.5 },
    { id: "yesh-107", pitch: "G4", duration: 0.5, absoluteBeat: 99.5 },
    // Measure 26
    { id: "yesh-108", pitch: "G4", duration: 1.5, absoluteBeat: 100 },
    { id: "yesh-109", pitch: "F4", duration: 0.5, absoluteBeat: 101.5 },
    { id: "yesh-110", pitch: "F4", duration: 0.5, absoluteBeat: 102 },
    { id: "yesh-111", pitch: "E4", duration: 1, absoluteBeat: 102.5 },
    { id: "yesh-112", pitch: "F4", duration: 0.5, absoluteBeat: 103.5 },
    // Measure 27
    { id: "yesh-113", pitch: "F4", duration: 1.5, absoluteBeat: 104 },
    { id: "yesh-114", pitch: "A3", duration: 0.5, absoluteBeat: 105.5 },
    { id: "yesh-115", pitch: "A3", duration: 0.5, absoluteBeat: 106 },
    { id: "yesh-116", pitch: "F4", duration: 1, absoluteBeat: 106.5 },
    { id: "yesh-117", pitch: "E4", duration: 0.5, absoluteBeat: 107.5 },
    // Measure 28
    { id: "yesh-118", pitch: "E4", duration: 1.5, absoluteBeat: 108 },
    { id: "yesh-119", pitch: "D4", duration: 0.5, absoluteBeat: 109.5 },
    { id: "yesh-120", pitch: "D4", duration: 1, absoluteBeat: 110 },
    // rest
    { id: "yesh-121", pitch: "D4", duration: 0.5, absoluteBeat: 111.5 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION H - Final Statement (Measures 29-32)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 29
    { id: "yesh-122", pitch: "C4", duration: 1, absoluteBeat: 112 },
    // rest
    { id: "yesh-123", pitch: "A3", duration: 1, absoluteBeat: 114 },
    { id: "yesh-124", pitch: "C4", duration: 1, absoluteBeat: 115 },
    // Measure 30
    { id: "yesh-125", pitch: "E4", duration: 1.5, absoluteBeat: 116 },
    { id: "yesh-126", pitch: "D4", duration: 1.5, absoluteBeat: 117.5 }, // tied
    // rest
    { id: "yesh-127", pitch: "C4", duration: 0.5, absoluteBeat: 119.5 },
    // Measure 31
    { id: "yesh-128", pitch: "E4", duration: 1.5, absoluteBeat: 120 },
    { id: "yesh-129", pitch: "C4", duration: 1, absoluteBeat: 121.5 }, // tied
    { id: "yesh-130", pitch: "E4", duration: 1, absoluteBeat: 122.5 },
    { id: "yesh-131", pitch: "F4", duration: 0.5, absoluteBeat: 123.5 },
    // Measure 32
    { id: "yesh-132", pitch: "F4", duration: 1.5, absoluteBeat: 124 },
    { id: "yesh-133", pitch: "E4", duration: 1.5, absoluteBeat: 125.5 }, // tied
    // rest
    { id: "yesh-134", pitch: "C4", duration: 0.5, absoluteBeat: 127.5 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION I - Coda (Measures 33-36)
    // ═══════════════════════════════════════════════════════════════════
    // Measure 33
    { id: "yesh-135", pitch: "C4", duration: 0.5, absoluteBeat: 128 },
    { id: "yesh-136", pitch: "A4", duration: 1, absoluteBeat: 128.5 },
    { id: "yesh-137", pitch: "G4", duration: 0.5, absoluteBeat: 129.5 },
    // Measure 34
    { id: "yesh-138", pitch: "G4", duration: 1.5, absoluteBeat: 130 },
    { id: "yesh-139", pitch: "F4", duration: 0.5, absoluteBeat: 131.5 },
    { id: "yesh-140", pitch: "F4", duration: 0.5, absoluteBeat: 132 },
    { id: "yesh-141", pitch: "E4", duration: 1, absoluteBeat: 132.5 },
    { id: "yesh-142", pitch: "F4", duration: 0.5, absoluteBeat: 133.5 },
    // Measure 35
    { id: "yesh-143", pitch: "F4", duration: 1, absoluteBeat: 134 },
    // rest
    { id: "yesh-144", pitch: "A3", duration: 1, absoluteBeat: 136 },
    { id: "yesh-145", pitch: "F4", duration: 1, absoluteBeat: 137 },
    // Measure 36
    { id: "yesh-146", pitch: "E4", duration: 1.5, absoluteBeat: 138 },
    { id: "yesh-147", pitch: "D4", duration: 0.5, absoluteBeat: 139.5 },
    { id: "yesh-148", pitch: "D4", duration: 0.5, absoluteBeat: 140 },
    { id: "yesh-149", pitch: "C4", duration: 1, absoluteBeat: 140.5 },
    { id: "yesh-150", pitch: "C4", duration: 0.5, absoluteBeat: 141.5 },

    // Measure 37 (Final)
    { id: "yesh-151", pitch: "C4", duration: 4, absoluteBeat: 142 },
  ],

  repeatMarkers: [],

  lyrics: [],

  settings: {
    tempo: 80,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-03",
  category: "experimental",

  transcriptionNotes: {
    original: {
      key: "Bb minor (5 flats: Bb, Eb, Ab, Db, Gb)",
      timeSignature: "2/2 (cut time)",
      features: [
        "Highly repetitive melodic patterns",
        "Multiple tied notes",
        "Slurs throughout",
        "Dotted rhythms",
        "Simple diatonic melody",
      ],
    },
    changes: [
      {
        what: "Transposed from Bb minor to A minor",
        why: "App uses natural keys with no accidentals",
      },
      {
        what: "Converted 2/2 to 4/4 notation",
        why: "App uses consistent 4/4 beat notation",
      },
      {
        what: "Combined tied notes into single durations",
        why: "App does not support ties",
      },
      {
        what: "Omitted slurs and rests",
        why: "Slurs not supported, rest rendering not implemented",
      },
    ],
    sources: {
      sheetMusic: "Israeli Note - 1770159481307067_994.musicxml",
    },
    transcribedDate: "2026-02-03",
  },
};
