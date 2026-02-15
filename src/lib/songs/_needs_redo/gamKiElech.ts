// Gam Ki Elech (גם כי אלך) - Avraham Fried
// Key: D minor (1 flat), Time: 4/4 (with changes)
// Based on Psalm 23:4
import { SongData } from "../types";

export const gamKiElech: SongData = {
  id: "default-gam-ki-elech",
  name: "Gam Ki Elech",
  hebrewName: "גם כי אלך",
  description: "אברהם פריד - תהילים כ״ג",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // INTRO (Measures 1-4)
    // ═══════════════════════════════════════════════════════════════════
    { id: "gam-1", pitch: "F4", duration: 1, absoluteBeat: 0 },
    { id: "gam-2", pitch: "F5", duration: 1, absoluteBeat: 1 },
    { id: "gam-3", pitch: "E5", duration: 0.5, absoluteBeat: 2 },
    { id: "gam-4", pitch: "D5", duration: 0.5, absoluteBeat: 2.5 },
    { id: "gam-5", pitch: "C5", duration: 0.5, absoluteBeat: 3 },
    { id: "gam-6", pitch: "Bb4", duration: 0.5, absoluteBeat: 3.5 },

    // M2
    { id: "gam-7", pitch: "A4", duration: 1.5, absoluteBeat: 4 },
    { id: "gam-8", pitch: "G4", duration: 0.25, absoluteBeat: 5.5 },
    { id: "gam-9", pitch: "A4", duration: 0.25, absoluteBeat: 5.75 },
    { id: "gam-10", pitch: "Bb4", duration: 0.75, absoluteBeat: 6 },
    { id: "gam-11", pitch: "D4", duration: 0.25, absoluteBeat: 6.75 },
    { id: "gam-12", pitch: "F4", duration: 1, absoluteBeat: 7 },

    // M3
    { id: "gam-13", pitch: "F4", duration: 1, absoluteBeat: 8 },
    { id: "gam-14", pitch: "F5", duration: 1, absoluteBeat: 9 },
    { id: "gam-15", pitch: "E5", duration: 0.5, absoluteBeat: 10 },
    { id: "gam-16", pitch: "D5", duration: 0.5, absoluteBeat: 10.5 },
    { id: "gam-17", pitch: "C5", duration: 0.5, absoluteBeat: 11 },
    { id: "gam-18", pitch: "Bb4", duration: 0.5, absoluteBeat: 11.5 },

    // M4
    { id: "gam-19", pitch: "A4", duration: 1.5, absoluteBeat: 12 },
    { id: "gam-20", pitch: "G4", duration: 0.25, absoluteBeat: 13.5 },
    { id: "gam-21", pitch: "A4", duration: 0.25, absoluteBeat: 13.75 },
    { id: "gam-22", pitch: "Bb4", duration: 0.75, absoluteBeat: 14 },
    { id: "gam-23", pitch: "G4", duration: 0.25, absoluteBeat: 14.75 },
    { id: "gam-24", pitch: "D4", duration: 3, absoluteBeat: 15 },

    // ═══════════════════════════════════════════════════════════════════
    // VERSE A (Measures 5-12)
    // ═══════════════════════════════════════════════════════════════════
    // M5
    { id: "gam-25", pitch: "D4", duration: 1, absoluteBeat: 18 },
    { id: "gam-26", pitch: "D5", duration: 1, absoluteBeat: 19 },
    { id: "gam-27", pitch: "A4", duration: 1, absoluteBeat: 20 },
    { id: "gam-28", pitch: "F4", duration: 0.75, absoluteBeat: 21 },
    { id: "gam-29", pitch: "A4", duration: 0.25, absoluteBeat: 21.75 },

    // M6
    { id: "gam-30", pitch: "A4", duration: 0.75, absoluteBeat: 22 },
    { id: "gam-31", pitch: "Bb4", duration: 0.25, absoluteBeat: 22.75 },
    { id: "gam-32", pitch: "A4", duration: 0.5, absoluteBeat: 23 },
    { id: "gam-33", pitch: "G4", duration: 0.5, absoluteBeat: 23.5 },
    { id: "gam-34", pitch: "F4", duration: 0.5, absoluteBeat: 24 },
    { id: "gam-35", pitch: "E4", duration: 0.5, absoluteBeat: 24.5 },
    { id: "gam-36", pitch: "D4", duration: 1, absoluteBeat: 25 },

    // M7
    { id: "gam-37", pitch: "D4", duration: 1, absoluteBeat: 26 },
    { id: "gam-38", pitch: "D5", duration: 0.25, absoluteBeat: 27 },
    { id: "gam-39", pitch: "D5", duration: 0.75, absoluteBeat: 27.25 },
    { id: "gam-40", pitch: "A4", duration: 1, absoluteBeat: 28 },

    // M8
    { id: "gam-41", pitch: "G4", duration: 0.25, absoluteBeat: 29.75 },
    { id: "gam-42", pitch: "G4", duration: 0.25, absoluteBeat: 30 },
    { id: "gam-43", pitch: "G4", duration: 0.75, absoluteBeat: 30.25 },
    { id: "gam-44", pitch: "C5", duration: 0.5, absoluteBeat: 31 },
    { id: "gam-45", pitch: "Bb4", duration: 0.5, absoluteBeat: 31.5 },
    { id: "gam-46", pitch: "A4", duration: 1, absoluteBeat: 32 },

    // M9
    { id: "gam-47", pitch: "D4", duration: 1, absoluteBeat: 34 },
    { id: "gam-48", pitch: "D5", duration: 1, absoluteBeat: 35 },
    { id: "gam-49", pitch: "A4", duration: 1, absoluteBeat: 36 },
    { id: "gam-50", pitch: "F4", duration: 0.75, absoluteBeat: 37 },
    { id: "gam-51", pitch: "A4", duration: 0.25, absoluteBeat: 37.75 },

    // M10
    { id: "gam-52", pitch: "A4", duration: 0.75, absoluteBeat: 38 },
    { id: "gam-53", pitch: "Bb4", duration: 0.25, absoluteBeat: 38.75 },
    { id: "gam-54", pitch: "A4", duration: 0.5, absoluteBeat: 39 },
    { id: "gam-55", pitch: "G4", duration: 0.5, absoluteBeat: 39.5 },
    { id: "gam-56", pitch: "F4", duration: 0.5, absoluteBeat: 40 },
    { id: "gam-57", pitch: "E4", duration: 0.5, absoluteBeat: 40.5 },
    { id: "gam-58", pitch: "D4", duration: 1, absoluteBeat: 41 },

    // M11
    { id: "gam-59", pitch: "D4", duration: 0.5, absoluteBeat: 42 },
    { id: "gam-60", pitch: "E4", duration: 0.5, absoluteBeat: 42.5 },
    { id: "gam-61", pitch: "F4", duration: 0.5, absoluteBeat: 43 },
    { id: "gam-62", pitch: "C5", duration: 0.25, absoluteBeat: 43.5 },
    { id: "gam-63", pitch: "A4", duration: 1.25, absoluteBeat: 43.75 },

    // ═══════════════════════════════════════════════════════════════════
    // VERSE B (Measures 13-20) - Similar pattern
    // ═══════════════════════════════════════════════════════════════════
    { id: "gam-64", pitch: "F4", duration: 0.75, absoluteBeat: 52 },
    { id: "gam-65", pitch: "A4", duration: 0.25, absoluteBeat: 52.75 },
    { id: "gam-66", pitch: "A4", duration: 0.75, absoluteBeat: 53 },
    { id: "gam-67", pitch: "Bb4", duration: 0.25, absoluteBeat: 53.75 },
    { id: "gam-68", pitch: "A4", duration: 0.5, absoluteBeat: 54 },
    { id: "gam-69", pitch: "G4", duration: 0.5, absoluteBeat: 54.5 },
    { id: "gam-70", pitch: "F4", duration: 0.5, absoluteBeat: 55 },
    { id: "gam-71", pitch: "E4", duration: 0.5, absoluteBeat: 55.5 },
    { id: "gam-72", pitch: "D4", duration: 1, absoluteBeat: 56 },

    { id: "gam-73", pitch: "D4", duration: 1, absoluteBeat: 57 },
    { id: "gam-74", pitch: "D5", duration: 0.25, absoluteBeat: 58 },
    { id: "gam-75", pitch: "D5", duration: 0.75, absoluteBeat: 58.25 },
    { id: "gam-76", pitch: "A4", duration: 1, absoluteBeat: 59 },

    { id: "gam-77", pitch: "G4", duration: 0.25, absoluteBeat: 60.75 },
    { id: "gam-78", pitch: "G4", duration: 0.25, absoluteBeat: 61 },
    { id: "gam-79", pitch: "G4", duration: 0.75, absoluteBeat: 61.25 },
    { id: "gam-80", pitch: "C5", duration: 0.5, absoluteBeat: 62 },
    { id: "gam-81", pitch: "Bb4", duration: 0.5, absoluteBeat: 62.5 },
    { id: "gam-82", pitch: "A4", duration: 1, absoluteBeat: 63 },

    { id: "gam-83", pitch: "D4", duration: 1, absoluteBeat: 65 },
    { id: "gam-84", pitch: "D5", duration: 1, absoluteBeat: 66 },
    { id: "gam-85", pitch: "A4", duration: 1, absoluteBeat: 67 },
    { id: "gam-86", pitch: "F4", duration: 0.75, absoluteBeat: 68 },
    { id: "gam-87", pitch: "A4", duration: 0.25, absoluteBeat: 68.75 },

    { id: "gam-88", pitch: "A4", duration: 0.75, absoluteBeat: 69 },
    { id: "gam-89", pitch: "Bb4", duration: 0.25, absoluteBeat: 69.75 },
    { id: "gam-90", pitch: "A4", duration: 0.5, absoluteBeat: 70 },
    { id: "gam-91", pitch: "G4", duration: 0.5, absoluteBeat: 70.5 },
    { id: "gam-92", pitch: "F4", duration: 0.5, absoluteBeat: 71 },
    { id: "gam-93", pitch: "E4", duration: 0.5, absoluteBeat: 71.5 },
    { id: "gam-94", pitch: "D4", duration: 1, absoluteBeat: 72 },

    { id: "gam-95", pitch: "D4", duration: 0.5, absoluteBeat: 73 },
    { id: "gam-96", pitch: "E4", duration: 0.5, absoluteBeat: 73.5 },
    { id: "gam-97", pitch: "F4", duration: 0.5, absoluteBeat: 74 },
    { id: "gam-98", pitch: "C5", duration: 0.25, absoluteBeat: 74.5 },
    { id: "gam-99", pitch: "A4", duration: 1, absoluteBeat: 74.75 },

    // ═══════════════════════════════════════════════════════════════════
    // CHORUS (Measures 21-34)
    // ═══════════════════════════════════════════════════════════════════
    { id: "gam-100", pitch: "F5", duration: 0.25, absoluteBeat: 87.75 },
    { id: "gam-101", pitch: "E5", duration: 1, absoluteBeat: 88 },
    { id: "gam-102", pitch: "A4", duration: 1, absoluteBeat: 89 },

    { id: "gam-103", pitch: "Bb4", duration: 0.75, absoluteBeat: 91 },
    { id: "gam-104", pitch: "A4", duration: 0.25, absoluteBeat: 91.75 },
    { id: "gam-105", pitch: "G4", duration: 1, absoluteBeat: 92 },
    { id: "gam-106", pitch: "G4", duration: 0.75, absoluteBeat: 93 },
    { id: "gam-107", pitch: "E4", duration: 0.25, absoluteBeat: 93.75 },
    { id: "gam-108", pitch: "G4", duration: 0.75, absoluteBeat: 94 },
    { id: "gam-109", pitch: "Bb4", duration: 0.25, absoluteBeat: 94.75 },
    { id: "gam-110", pitch: "A4", duration: 0.75, absoluteBeat: 95 },
    { id: "gam-111", pitch: "G4", duration: 0.25, absoluteBeat: 95.75 },
    { id: "gam-112", pitch: "F4", duration: 2, absoluteBeat: 96 },

    { id: "gam-113", pitch: "G4", duration: 2, absoluteBeat: 100 },
    { id: "gam-114", pitch: "G4", duration: 0.5, absoluteBeat: 102 },
    { id: "gam-115", pitch: "E4", duration: 0.5, absoluteBeat: 102.5 },
    { id: "gam-116", pitch: "G4", duration: 0.75, absoluteBeat: 103 },
    { id: "gam-117", pitch: "Bb4", duration: 0.25, absoluteBeat: 103.75 },
    { id: "gam-118", pitch: "A4", duration: 0.75, absoluteBeat: 104 },
    { id: "gam-119", pitch: "F4", duration: 0.25, absoluteBeat: 104.75 },
    { id: "gam-120", pitch: "D4", duration: 1, absoluteBeat: 105 },

    { id: "gam-121", pitch: "D4", duration: 0.25, absoluteBeat: 107.75 },
    { id: "gam-122", pitch: "G4", duration: 1, absoluteBeat: 108 },
    { id: "gam-123", pitch: "G4", duration: 0.75, absoluteBeat: 109 },
    { id: "gam-124", pitch: "G4", duration: 0.25, absoluteBeat: 109.75 },
    { id: "gam-125", pitch: "G4", duration: 1, absoluteBeat: 110 },
    { id: "gam-126", pitch: "F4", duration: 0.5, absoluteBeat: 111 },
    { id: "gam-127", pitch: "G4", duration: 0.5, absoluteBeat: 111.5 },
    { id: "gam-128", pitch: "A4", duration: 2, absoluteBeat: 112 },

    { id: "gam-129", pitch: "G4", duration: 1, absoluteBeat: 116 },
    { id: "gam-130", pitch: "G4", duration: 0.75, absoluteBeat: 117 },
    { id: "gam-131", pitch: "D4", duration: 0.25, absoluteBeat: 117.75 },
    { id: "gam-132", pitch: "G4", duration: 1, absoluteBeat: 118 },
    { id: "gam-133", pitch: "F4", duration: 0.75, absoluteBeat: 119 },
    { id: "gam-134", pitch: "E4", duration: 0.25, absoluteBeat: 119.75 },

    // ═══════════════════════════════════════════════════════════════════
    // OUTRO / CODA (Measures 35-38)
    // ═══════════════════════════════════════════════════════════════════
    { id: "gam-135", pitch: "D4", duration: 1, absoluteBeat: 120 },
    { id: "gam-136", pitch: "F4", duration: 1, absoluteBeat: 120 }, // Chord
    { id: "gam-137", pitch: "F5", duration: 1, absoluteBeat: 121 },
    { id: "gam-138", pitch: "E5", duration: 0.5, absoluteBeat: 122 },
    { id: "gam-139", pitch: "D5", duration: 0.5, absoluteBeat: 122.5 },
    { id: "gam-140", pitch: "C5", duration: 0.5, absoluteBeat: 123 },
    { id: "gam-141", pitch: "Bb4", duration: 0.5, absoluteBeat: 123.5 },

    { id: "gam-142", pitch: "A4", duration: 1.5, absoluteBeat: 124 },
    { id: "gam-143", pitch: "G4", duration: 0.25, absoluteBeat: 125.5 },
    { id: "gam-144", pitch: "A4", duration: 0.25, absoluteBeat: 125.75 },
    { id: "gam-145", pitch: "Bb4", duration: 0.75, absoluteBeat: 126 },
    { id: "gam-146", pitch: "G4", duration: 0.25, absoluteBeat: 126.75 },

    // Final D
    { id: "gam-147", pitch: "D4", duration: 3, absoluteBeat: 128 },
    { id: "gam-148", pitch: "D4", duration: 4, absoluteBeat: 132 },
  ],

  repeatMarkers: [],

  lyrics: [],

  settings: {
    tempo: 72,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-03",
  category: "experimental",

  transcriptionNotes: {
    original: {
      key: "D minor (1 flat)",
      timeSignature: "4/4 with changes to 3/4 and 2/4",
      features: [
        "Avraham Fried arrangement",
        "D.S. al Coda navigation",
        "Time signature changes mid-song",
        "Sixteenth note ornaments",
        "Based on Psalm 23:4",
      ],
    },
    changes: [
      {
        what: "Linearized D.S. al Coda structure",
        why: "App does not support navigation markers",
      },
      {
        what: "Ignored time signature changes",
        why: "App does not support mid-song time signature changes - may affect measure alignment",
      },
    ],
    sources: {
      sheetMusic: "Israeli Note - Gam Ki Elech (Avraham Fried)",
    },
    transcribedDate: "2026-02-03",
  },
};
