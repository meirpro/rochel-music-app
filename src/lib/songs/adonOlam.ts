// Adon Olam (אדון עולם) - Main Melody
// Key: G Major / E minor, Time: 4/4
// Traditional prayer, Arrangement: Uzi Hitman
import { SongData } from "./types";

export const adonOlam: SongData = {
  id: "default-adon-olam",
  name: "Adon Olam",
  hebrewName: "אדון עולם",
  description: "עוזי חיטמן - מנגינה ראשית",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // INTRO / PICKUP
    // ═══════════════════════════════════════════════════════════════════
    { id: "adon-1", pitch: "B3", duration: 0.5, absoluteBeat: 0 },
    { id: "adon-2", pitch: "B4", duration: 1, absoluteBeat: 0.5 },
    { id: "adon-3", pitch: "A4", duration: 0.5, absoluteBeat: 1.5 },
    { id: "adon-4", pitch: "B4", duration: 0.5, absoluteBeat: 2 },

    // ═══════════════════════════════════════════════════════════════════
    // VERSE (Measures 2-14)
    // ═══════════════════════════════════════════════════════════════════
    // M2 - tied whole note B4 (combined duration)
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

    // M6 - tied whole note A4 (combined duration)
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

    // M14 - Final phrase
    { id: "adon-42", pitch: "A4", duration: 1, absoluteBeat: 48 },
    { id: "adon-43", pitch: "G4", duration: 1, absoluteBeat: 49 },
    { id: "adon-44", pitch: "E4", duration: 4, absoluteBeat: 50 },
  ],

  repeatMarkers: [
    // Verse repeat
    { id: "adon-ra-start", pairId: "verse", type: "start", measureNumber: 0 },
    { id: "adon-ra-end", pairId: "verse", type: "end", measureNumber: 13 },
  ],

  lyrics: [],

  settings: {
    tempo: 100,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-03",

  transcriptionNotes: {
    original: {
      key: "G Major / E minor",
      timeSignature: "4/4",
      features: [
        "Main melody section only (measures 1-14)",
        "Tied notes across bar lines",
        "Accidentals: F#, G#, Bb",
      ],
    },
    changes: [
      {
        what: "Extracted main melody only",
        why: "Full version has fast eighth-note runs that may be too complex for beginners",
      },
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
