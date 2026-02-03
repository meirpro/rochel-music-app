// Adon Olam (אדון עולם) - Full Version
// Key: G Major / E minor, Time: 4/4
// Traditional prayer, Arrangement: Uzi Hitman
import { SongData } from "./types";

export const adonOlamFull: SongData = {
  id: "default-adon-olam-full",
  name: "Adon Olam (Full)",
  hebrewName: "אדון עולם",
  description: "עוזי חיטמן - גרסה מלאה",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // INTRO / PICKUP (Measure 1)
    // ═══════════════════════════════════════════════════════════════════
    { id: "adon-1", pitch: "B3", duration: 0.5, absoluteBeat: 0 },
    { id: "adon-2", pitch: "B4", duration: 1, absoluteBeat: 0.5 },
    { id: "adon-3", pitch: "A4", duration: 0.5, absoluteBeat: 1.5 },
    { id: "adon-4", pitch: "B4", duration: 0.5, absoluteBeat: 2 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION A - Main Verse (Measures 2-17, repeated)
    // ═══════════════════════════════════════════════════════════════════
    // M2 - tied whole note B4
    { id: "adon-5", pitch: "B4", duration: 4.5, absoluteBeat: 2.5 },

    // M3
    { id: "adon-6", pitch: "G4", duration: 1, absoluteBeat: 8 },
    { id: "adon-7", pitch: "A4", duration: 1, absoluteBeat: 9 },
    { id: "adon-8", pitch: "B4", duration: 1, absoluteBeat: 10 },

    // M4
    { id: "adon-9", pitch: "B4", duration: 1.5, absoluteBeat: 11 },
    { id: "adon-10", pitch: "C5", duration: 0.5, absoluteBeat: 12.5 },
    { id: "adon-11", pitch: "A4", duration: 2, absoluteBeat: 13 },

    // M5
    { id: "adon-12", pitch: "A4", duration: 0.5, absoluteBeat: 16.5 },
    { id: "adon-13", pitch: "A4", duration: 0.5, absoluteBeat: 17 },
    { id: "adon-14", pitch: "G4", duration: 1, absoluteBeat: 17.5 },
    { id: "adon-15", pitch: "A4", duration: 0.5, absoluteBeat: 18.5 },

    // M6 - tied whole note A4
    { id: "adon-16", pitch: "A4", duration: 4.5, absoluteBeat: 19 },

    // M7
    { id: "adon-17", pitch: "F#4", duration: 1, absoluteBeat: 24 },
    { id: "adon-18", pitch: "G4", duration: 1, absoluteBeat: 25 },
    { id: "adon-19", pitch: "A4", duration: 1, absoluteBeat: 26 },

    // M8
    { id: "adon-20", pitch: "B4", duration: 2.5, absoluteBeat: 27 },
    { id: "adon-21", pitch: "A4", duration: 0.5, absoluteBeat: 29.5 },
    { id: "adon-22", pitch: "G4", duration: 0.5, absoluteBeat: 30 },
    { id: "adon-23", pitch: "F#4", duration: 0.5, absoluteBeat: 30.5 },

    // M9
    { id: "adon-24", pitch: "B4", duration: 0.5, absoluteBeat: 31 },
    { id: "adon-25", pitch: "B4", duration: 0.5, absoluteBeat: 31.5 },
    { id: "adon-26", pitch: "B4", duration: 0.5, absoluteBeat: 32 },
    { id: "adon-27", pitch: "A4", duration: 0.5, absoluteBeat: 32.5 },
    { id: "adon-28", pitch: "B4", duration: 0.5, absoluteBeat: 33 },

    // M10
    { id: "adon-29", pitch: "G#4", duration: 1, absoluteBeat: 34.5 },
    { id: "adon-30", pitch: "A4", duration: 1, absoluteBeat: 35.5 },
    { id: "adon-31", pitch: "B4", duration: 1, absoluteBeat: 36.5 },

    // M11
    { id: "adon-32", pitch: "D5", duration: 1, absoluteBeat: 37.5 },
    { id: "adon-33", pitch: "C5", duration: 0.5, absoluteBeat: 38.5 },
    { id: "adon-34", pitch: "B4", duration: 0.5, absoluteBeat: 39 },
    { id: "adon-35", pitch: "C5", duration: 2, absoluteBeat: 39.5 },

    // M12
    { id: "adon-36", pitch: "A4", duration: 0.5, absoluteBeat: 43 },
    { id: "adon-37", pitch: "B4", duration: 1, absoluteBeat: 43.5 },
    { id: "adon-38", pitch: "C5", duration: 0.5, absoluteBeat: 44.5 },

    // M13
    { id: "adon-39", pitch: "B4", duration: 1.5, absoluteBeat: 45 },
    { id: "adon-40", pitch: "B4", duration: 0.5, absoluteBeat: 46.5 },
    { id: "adon-41", pitch: "Bb4", duration: 1, absoluteBeat: 47 },

    // M14
    { id: "adon-42", pitch: "A4", duration: 1, absoluteBeat: 48 },
    { id: "adon-43", pitch: "G4", duration: 1, absoluteBeat: 49 },
    { id: "adon-44", pitch: "E4", duration: 4, absoluteBeat: 50 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION B - Bridge/Instrumental (Measures 15-17)
    // ═══════════════════════════════════════════════════════════════════
    { id: "adon-45", pitch: "B4", duration: 0.5, absoluteBeat: 56 },
    { id: "adon-46", pitch: "B4", duration: 1, absoluteBeat: 56.5 },
    { id: "adon-47", pitch: "Bb4", duration: 0.5, absoluteBeat: 57.5 },
    { id: "adon-48", pitch: "B4", duration: 0.5, absoluteBeat: 58 },

    // M16
    { id: "adon-49", pitch: "B4", duration: 1.5, absoluteBeat: 58.5 },
    { id: "adon-50", pitch: "E5", duration: 0.5, absoluteBeat: 60 },
    { id: "adon-51", pitch: "E5", duration: 1, absoluteBeat: 60.5 },
    { id: "adon-52", pitch: "E5", duration: 0.5, absoluteBeat: 61.5 },

    // M17
    { id: "adon-53", pitch: "D#5", duration: 1.5, absoluteBeat: 62 },
    { id: "adon-54", pitch: "C#5", duration: 1, absoluteBeat: 63.5 },
    { id: "adon-55", pitch: "D#5", duration: 1, absoluteBeat: 64.5 },
    { id: "adon-56", pitch: "E5", duration: 4, absoluteBeat: 65.5 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION C - Fast Section (Measures 18-25)
    // Running eighth notes pattern
    // ═══════════════════════════════════════════════════════════════════
    // M18 - E C B C B C B C
    { id: "adon-57", pitch: "E4", duration: 0.5, absoluteBeat: 72 },
    { id: "adon-58", pitch: "C5", duration: 0.5, absoluteBeat: 72.5 },
    { id: "adon-59", pitch: "B4", duration: 0.5, absoluteBeat: 73 },
    { id: "adon-60", pitch: "C5", duration: 0.5, absoluteBeat: 73.5 },
    { id: "adon-61", pitch: "B4", duration: 0.5, absoluteBeat: 74 },
    { id: "adon-62", pitch: "C5", duration: 0.5, absoluteBeat: 74.5 },
    { id: "adon-63", pitch: "B4", duration: 0.5, absoluteBeat: 75 },
    { id: "adon-64", pitch: "C5", duration: 0.5, absoluteBeat: 75.5 },

    // M19
    { id: "adon-65", pitch: "B4", duration: 0.5, absoluteBeat: 76 },
    { id: "adon-66", pitch: "C5", duration: 0.5, absoluteBeat: 76.5 },
    { id: "adon-67", pitch: "B4", duration: 0.5, absoluteBeat: 77 },
    { id: "adon-68", pitch: "C5", duration: 0.5, absoluteBeat: 77.5 },
    { id: "adon-69", pitch: "B4", duration: 0.5, absoluteBeat: 78 },
    { id: "adon-70", pitch: "C5", duration: 0.5, absoluteBeat: 78.5 },
    { id: "adon-71", pitch: "B4", duration: 0.5, absoluteBeat: 79 },
    { id: "adon-72", pitch: "C5", duration: 0.5, absoluteBeat: 79.5 },

    // M20 - A B A B A B A B
    { id: "adon-73", pitch: "A4", duration: 0.5, absoluteBeat: 80 },
    { id: "adon-74", pitch: "B4", duration: 0.5, absoluteBeat: 80.5 },
    { id: "adon-75", pitch: "A4", duration: 0.5, absoluteBeat: 81 },
    { id: "adon-76", pitch: "B4", duration: 0.5, absoluteBeat: 81.5 },
    { id: "adon-77", pitch: "A4", duration: 0.5, absoluteBeat: 82 },
    { id: "adon-78", pitch: "B4", duration: 0.5, absoluteBeat: 82.5 },
    { id: "adon-79", pitch: "A4", duration: 0.5, absoluteBeat: 83 },
    { id: "adon-80", pitch: "B4", duration: 0.5, absoluteBeat: 83.5 },

    // M21
    { id: "adon-81", pitch: "A4", duration: 0.5, absoluteBeat: 84 },
    { id: "adon-82", pitch: "B4", duration: 0.5, absoluteBeat: 84.5 },
    { id: "adon-83", pitch: "A4", duration: 0.5, absoluteBeat: 85 },
    { id: "adon-84", pitch: "B4", duration: 0.5, absoluteBeat: 85.5 },
    { id: "adon-85", pitch: "A4", duration: 0.5, absoluteBeat: 86 },
    { id: "adon-86", pitch: "B4", duration: 0.5, absoluteBeat: 86.5 },
    { id: "adon-87", pitch: "A4", duration: 0.5, absoluteBeat: 87 },
    { id: "adon-88", pitch: "B4", duration: 0.5, absoluteBeat: 87.5 },

    // M22 - G A G A G A G A
    { id: "adon-89", pitch: "G4", duration: 0.5, absoluteBeat: 88 },
    { id: "adon-90", pitch: "A4", duration: 0.5, absoluteBeat: 88.5 },
    { id: "adon-91", pitch: "G4", duration: 0.5, absoluteBeat: 89 },
    { id: "adon-92", pitch: "A4", duration: 0.5, absoluteBeat: 89.5 },
    { id: "adon-93", pitch: "G4", duration: 0.5, absoluteBeat: 90 },
    { id: "adon-94", pitch: "A4", duration: 0.5, absoluteBeat: 90.5 },
    { id: "adon-95", pitch: "G4", duration: 0.5, absoluteBeat: 91 },
    { id: "adon-96", pitch: "A4", duration: 1, absoluteBeat: 91.5 },

    // M23
    { id: "adon-97", pitch: "A4", duration: 0.5, absoluteBeat: 92.5 },
    { id: "adon-98", pitch: "G4", duration: 0.5, absoluteBeat: 93 },
    { id: "adon-99", pitch: "A4", duration: 0.5, absoluteBeat: 93.5 },
    { id: "adon-100", pitch: "G4", duration: 0.5, absoluteBeat: 94 },
    { id: "adon-101", pitch: "A4", duration: 0.5, absoluteBeat: 94.5 },
    { id: "adon-102", pitch: "G4", duration: 0.5, absoluteBeat: 95 },
    { id: "adon-103", pitch: "A4", duration: 0.5, absoluteBeat: 95.5 },

    // M24
    { id: "adon-104", pitch: "F#4", duration: 0.5, absoluteBeat: 96 },
    { id: "adon-105", pitch: "G4", duration: 0.5, absoluteBeat: 96.5 },
    { id: "adon-106", pitch: "G4", duration: 0.5, absoluteBeat: 97 },
    { id: "adon-107", pitch: "G4", duration: 0.5, absoluteBeat: 97.5 },
    { id: "adon-108", pitch: "A4", duration: 0.5, absoluteBeat: 98 },
    { id: "adon-109", pitch: "B4", duration: 0.5, absoluteBeat: 98.5 },
    { id: "adon-110", pitch: "A4", duration: 0.5, absoluteBeat: 99 },
    { id: "adon-111", pitch: "G4", duration: 0.5, absoluteBeat: 99.5 },

    // M25
    { id: "adon-112", pitch: "G4", duration: 0.5, absoluteBeat: 100 },
    { id: "adon-113", pitch: "G4", duration: 0.5, absoluteBeat: 100.5 },
    { id: "adon-114", pitch: "G4", duration: 0.5, absoluteBeat: 101 },
    { id: "adon-115", pitch: "G4", duration: 0.5, absoluteBeat: 101.5 },
    { id: "adon-116", pitch: "A4", duration: 0.5, absoluteBeat: 102 },
    { id: "adon-117", pitch: "B4", duration: 0.5, absoluteBeat: 102.5 },
    { id: "adon-118", pitch: "A4", duration: 0.5, absoluteBeat: 103 },
    { id: "adon-119", pitch: "G4", duration: 0.5, absoluteBeat: 103.5 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION D - Melodic Section (Measures 26-33)
    // ═══════════════════════════════════════════════════════════════════
    // M26
    { id: "adon-120", pitch: "E4", duration: 0.5, absoluteBeat: 104 },
    { id: "adon-121", pitch: "C5", duration: 0.5, absoluteBeat: 104.5 },
    { id: "adon-122", pitch: "C5", duration: 0.5, absoluteBeat: 105 },
    { id: "adon-123", pitch: "C5", duration: 0.5, absoluteBeat: 105.5 },
    { id: "adon-124", pitch: "C5", duration: 0.5, absoluteBeat: 106 },
    { id: "adon-125", pitch: "D5", duration: 0.5, absoluteBeat: 106.5 },
    { id: "adon-126", pitch: "E5", duration: 0.5, absoluteBeat: 107 },
    { id: "adon-127", pitch: "D5", duration: 0.5, absoluteBeat: 107.5 },

    // M27
    { id: "adon-128", pitch: "C5", duration: 0.5, absoluteBeat: 108 },
    { id: "adon-129", pitch: "B4", duration: 0.5, absoluteBeat: 108.5 },
    { id: "adon-130", pitch: "B4", duration: 0.5, absoluteBeat: 109 },
    { id: "adon-131", pitch: "B4", duration: 0.5, absoluteBeat: 109.5 },
    { id: "adon-132", pitch: "B4", duration: 0.5, absoluteBeat: 110 },
    { id: "adon-133", pitch: "C5", duration: 0.5, absoluteBeat: 110.5 },
    { id: "adon-134", pitch: "D5", duration: 0.5, absoluteBeat: 111 },
    { id: "adon-135", pitch: "C5", duration: 0.5, absoluteBeat: 111.5 },

    // M28
    { id: "adon-136", pitch: "B4", duration: 0.5, absoluteBeat: 112 },
    { id: "adon-137", pitch: "A4", duration: 0.5, absoluteBeat: 112.5 },
    { id: "adon-138", pitch: "A4", duration: 0.5, absoluteBeat: 113 },
    { id: "adon-139", pitch: "A4", duration: 0.5, absoluteBeat: 113.5 },
    { id: "adon-140", pitch: "A4", duration: 0.5, absoluteBeat: 114 },
    { id: "adon-141", pitch: "B4", duration: 0.5, absoluteBeat: 114.5 },
    { id: "adon-142", pitch: "C5", duration: 0.5, absoluteBeat: 115 },
    { id: "adon-143", pitch: "B4", duration: 0.5, absoluteBeat: 115.5 },

    // M29
    { id: "adon-144", pitch: "A4", duration: 0.5, absoluteBeat: 116 },
    { id: "adon-145", pitch: "G4", duration: 0.5, absoluteBeat: 116.5 },
    { id: "adon-146", pitch: "F#4", duration: 0.5, absoluteBeat: 117 },
    { id: "adon-147", pitch: "G4", duration: 0.5, absoluteBeat: 117.5 },
    { id: "adon-148", pitch: "A4", duration: 0.5, absoluteBeat: 118 },
    { id: "adon-149", pitch: "B4", duration: 0.5, absoluteBeat: 118.5 },
    { id: "adon-150", pitch: "A4", duration: 0.5, absoluteBeat: 119 },
    { id: "adon-151", pitch: "G4", duration: 0.5, absoluteBeat: 119.5 },

    // M30 (same as M26)
    { id: "adon-152", pitch: "E4", duration: 0.5, absoluteBeat: 120 },
    { id: "adon-153", pitch: "C5", duration: 0.5, absoluteBeat: 120.5 },
    { id: "adon-154", pitch: "C5", duration: 0.5, absoluteBeat: 121 },
    { id: "adon-155", pitch: "C5", duration: 0.5, absoluteBeat: 121.5 },
    { id: "adon-156", pitch: "C5", duration: 0.5, absoluteBeat: 122 },
    { id: "adon-157", pitch: "D5", duration: 0.5, absoluteBeat: 122.5 },
    { id: "adon-158", pitch: "E5", duration: 0.5, absoluteBeat: 123 },
    { id: "adon-159", pitch: "D5", duration: 0.5, absoluteBeat: 123.5 },

    // M31
    { id: "adon-160", pitch: "C5", duration: 0.5, absoluteBeat: 124 },
    { id: "adon-161", pitch: "B4", duration: 0.5, absoluteBeat: 124.5 },
    { id: "adon-162", pitch: "B4", duration: 0.5, absoluteBeat: 125 },
    { id: "adon-163", pitch: "B4", duration: 0.5, absoluteBeat: 125.5 },
    { id: "adon-164", pitch: "B4", duration: 0.5, absoluteBeat: 126 },
    { id: "adon-165", pitch: "C5", duration: 0.5, absoluteBeat: 126.5 },
    { id: "adon-166", pitch: "D5", duration: 0.5, absoluteBeat: 127 },
    { id: "adon-167", pitch: "C5", duration: 0.5, absoluteBeat: 127.5 },

    // M32
    { id: "adon-168", pitch: "B4", duration: 0.5, absoluteBeat: 128 },
    { id: "adon-169", pitch: "A4", duration: 0.5, absoluteBeat: 128.5 },
    { id: "adon-170", pitch: "B4", duration: 0.5, absoluteBeat: 129 },
    { id: "adon-171", pitch: "C5", duration: 0.5, absoluteBeat: 129.5 },
    { id: "adon-172", pitch: "A4", duration: 0.5, absoluteBeat: 130 },
    { id: "adon-173", pitch: "G4", duration: 0.5, absoluteBeat: 130.5 },
    { id: "adon-174", pitch: "A4", duration: 0.5, absoluteBeat: 131 },
    { id: "adon-175", pitch: "B4", duration: 1, absoluteBeat: 131.5 },

    // M33
    { id: "adon-176", pitch: "F#4", duration: 0.5, absoluteBeat: 133 },
    { id: "adon-177", pitch: "F#4", duration: 0.5, absoluteBeat: 133.5 },
    { id: "adon-178", pitch: "F#4", duration: 0.5, absoluteBeat: 134 },
    { id: "adon-179", pitch: "B4", duration: 1.5, absoluteBeat: 134.5 },

    // ═══════════════════════════════════════════════════════════════════
    // CODA - Ending (Measures 34-40)
    // ═══════════════════════════════════════════════════════════════════
    // M34
    { id: "adon-180", pitch: "G4", duration: 0.5, absoluteBeat: 136 },
    { id: "adon-181", pitch: "A4", duration: 0.5, absoluteBeat: 136.5 },
    { id: "adon-182", pitch: "B4", duration: 0.5, absoluteBeat: 137 },
    { id: "adon-183", pitch: "C5", duration: 0.5, absoluteBeat: 137.5 },
    { id: "adon-184", pitch: "A4", duration: 0.5, absoluteBeat: 138 },
    { id: "adon-185", pitch: "G4", duration: 0.5, absoluteBeat: 138.5 },
    { id: "adon-186", pitch: "A4", duration: 0.5, absoluteBeat: 139 },
    { id: "adon-187", pitch: "B4", duration: 1, absoluteBeat: 139.5 },

    // M35-36
    { id: "adon-188", pitch: "F#4", duration: 1, absoluteBeat: 141.5 },
    { id: "adon-189", pitch: "F#4", duration: 1, absoluteBeat: 142.5 },
    { id: "adon-190", pitch: "F#4", duration: 1, absoluteBeat: 143.5 },

    // Final E4 whole note
    { id: "adon-191", pitch: "E4", duration: 4, absoluteBeat: 144.5 },
  ],

  repeatMarkers: [
    // Main verse repeat (measures 2-17)
    { id: "adon-ra-start", pairId: "verse", type: "start", measureNumber: 1 },
    { id: "adon-ra-end", pairId: "verse", type: "end", measureNumber: 16 },
  ],

  lyrics: [],

  settings: {
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 6,
  },

  releaseDate: "2026-02-03",

  transcriptionNotes: {
    original: {
      key: "G Major / E minor",
      timeSignature: "4/4",
      features: [
        "Repeat measures 2-17",
        "Tied notes across bar lines",
        "Fast eighth-note runs in section C",
        "Accidentals: G#, Bb, D#, C#",
      ],
    },
    changes: [
      {
        what: "Combined tied notes",
        why: "App handles duration, not ties",
      },
    ],
    sources: {
      sheetMusic: "Israeli Note - Adon Olam (Uzi Hitman)",
      // MXL source: adon-olam.mxl from MuseScore
    },
    transcribedDate: "2026-02-03",
  },
};
