// Ani Purim (אני פורים) - Purim Children's Song
// Key: C Major, Time: 4/4, Tempo: 200
// Words: Levin Kipnis, Music: Nachum Nardi
import { SongData } from "./types";

export const aniPurim: SongData = {
  id: "default-ani-purim",
  name: "Ani Purim",
  hebrewName: "אני פורים",
  description: "שיר פורים לילדים - מילים: לוין קיפניס, לחן: נחום נרדי",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // BEAT NUMBERING: absoluteBeat is 0-indexed
    // absoluteBeat 0 = beat 1, absoluteBeat 3 = beat 4
    // Display position = absoluteBeat + 1
    // ═══════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════
    // PICKUP MEASURE (app measure 1, beats 1-4)
    // Beats 1-3 silent, beat 4 has pickup G
    // ═══════════════════════════════════════════════════════════════════
    { id: "ap-r1", pitch: "REST", duration: 3, absoluteBeat: 0 }, // dotted half rest
    { id: "ap-1", pitch: "G4", duration: 1, absoluteBeat: 3 }, // pickup

    // ═══════════════════════════════════════════════════════════════════
    // A SECTION - FIRST PASS (with volta 1 ending)
    // PDF M1-M4, App M2-M5
    // ═══════════════════════════════════════════════════════════════════

    // PDF M1 / App M2 (C chord): C G G G
    { id: "ap-2", pitch: "C5", duration: 1, absoluteBeat: 4 },
    { id: "ap-3", pitch: "G4", duration: 1, absoluteBeat: 5 },
    { id: "ap-4", pitch: "G4", duration: 1, absoluteBeat: 6 },
    { id: "ap-5", pitch: "G4", duration: 1, absoluteBeat: 7 },

    // PDF M2 / App M3 (G chord): A E E E
    { id: "ap-6", pitch: "A4", duration: 1, absoluteBeat: 8 },
    { id: "ap-7", pitch: "E4", duration: 1, absoluteBeat: 9 },
    { id: "ap-8", pitch: "E4", duration: 1, absoluteBeat: 10 },
    { id: "ap-9", pitch: "E4", duration: 1, absoluteBeat: 11 },

    // PDF M3 / App M4: G F E D (descending)
    { id: "ap-10", pitch: "G4", duration: 1, absoluteBeat: 12 },
    { id: "ap-11", pitch: "F4", duration: 1, absoluteBeat: 13 },
    { id: "ap-12", pitch: "E4", duration: 1, absoluteBeat: 14 },
    { id: "ap-13", pitch: "D4", duration: 1, absoluteBeat: 15 },

    // PDF M4 / App M5 - VOLTA 1: E F (8ths) + G (half) + G (quarter pickup)
    { id: "ap-14", pitch: "E4", duration: 0.5, absoluteBeat: 16 },
    { id: "ap-15", pitch: "F4", duration: 0.5, absoluteBeat: 16.5 },
    { id: "ap-16", pitch: "G4", duration: 2, absoluteBeat: 17 },
    { id: "ap-17", pitch: "G4", duration: 1, absoluteBeat: 19 }, // pickup for repeat

    // ═══════════════════════════════════════════════════════════════════
    // A SECTION - SECOND PASS (with volta 2 ending)
    // Linearized repeat: M1-M3 again, then M5 (volta 2) instead of M4
    // ═══════════════════════════════════════════════════════════════════

    // PDF M1 repeat: C G G G
    { id: "ap-18", pitch: "C5", duration: 1, absoluteBeat: 20 },
    { id: "ap-19", pitch: "G4", duration: 1, absoluteBeat: 21 },
    { id: "ap-20", pitch: "G4", duration: 1, absoluteBeat: 22 },
    { id: "ap-21", pitch: "G4", duration: 1, absoluteBeat: 23 },

    // PDF M2 repeat: A E E E
    { id: "ap-22", pitch: "A4", duration: 1, absoluteBeat: 24 },
    { id: "ap-23", pitch: "E4", duration: 1, absoluteBeat: 25 },
    { id: "ap-24", pitch: "E4", duration: 1, absoluteBeat: 26 },
    { id: "ap-25", pitch: "E4", duration: 1, absoluteBeat: 27 },

    // PDF M3 repeat: G F E D
    { id: "ap-26", pitch: "G4", duration: 1, absoluteBeat: 28 },
    { id: "ap-27", pitch: "F4", duration: 1, absoluteBeat: 29 },
    { id: "ap-28", pitch: "E4", duration: 1, absoluteBeat: 30 },
    { id: "ap-29", pitch: "D4", duration: 1, absoluteBeat: 31 },

    // PDF M5 - VOLTA 2: E D (8ths) + C4 (half) + C4 (quarter)
    { id: "ap-30", pitch: "E4", duration: 0.5, absoluteBeat: 32 },
    { id: "ap-31", pitch: "D4", duration: 0.5, absoluteBeat: 32.5 },
    { id: "ap-32", pitch: "C4", duration: 2, absoluteBeat: 33 },
    { id: "ap-33", pitch: "C4", duration: 1, absoluteBeat: 35 },

    // ═══════════════════════════════════════════════════════════════════
    // B SECTION (PDF Lines 2-3, M6-M13)
    // ═══════════════════════════════════════════════════════════════════

    // PDF M6: D D (half notes)
    { id: "ap-34", pitch: "D4", duration: 2, absoluteBeat: 36 },
    { id: "ap-35", pitch: "D4", duration: 2, absoluteBeat: 38 },

    // PDF M7: E F (8ths) + G (half) + G (quarter)
    { id: "ap-36", pitch: "E4", duration: 0.5, absoluteBeat: 40 },
    { id: "ap-37", pitch: "F4", duration: 0.5, absoluteBeat: 40.5 },
    { id: "ap-38", pitch: "G4", duration: 2, absoluteBeat: 41 },
    { id: "ap-39", pitch: "G4", duration: 1, absoluteBeat: 43 },

    // PDF M8: A B (half notes)
    { id: "ap-40", pitch: "A4", duration: 2, absoluteBeat: 44 },
    { id: "ap-41", pitch: "B4", duration: 2, absoluteBeat: 46 },

    // PDF M9: C5 (quarter) + G (half) + G (quarter)
    { id: "ap-42", pitch: "C5", duration: 1, absoluteBeat: 48 },
    { id: "ap-43", pitch: "G4", duration: 2, absoluteBeat: 49 },
    { id: "ap-44", pitch: "G4", duration: 1, absoluteBeat: 51 },

    // PDF M10: D D (half notes) - like M6
    { id: "ap-45", pitch: "D4", duration: 2, absoluteBeat: 52 },
    { id: "ap-46", pitch: "D4", duration: 2, absoluteBeat: 54 },

    // PDF M11: E F (8ths) + G (half) + G (quarter) - like M7
    { id: "ap-47", pitch: "E4", duration: 0.5, absoluteBeat: 56 },
    { id: "ap-48", pitch: "F4", duration: 0.5, absoluteBeat: 56.5 },
    { id: "ap-49", pitch: "G4", duration: 2, absoluteBeat: 57 },
    { id: "ap-50", pitch: "G4", duration: 1, absoluteBeat: 59 },

    // PDF M12: A B (half notes) - like M8
    { id: "ap-51", pitch: "A4", duration: 2, absoluteBeat: 60 },
    { id: "ap-52", pitch: "B4", duration: 2, absoluteBeat: 62 },

    // PDF M13: C5 (whole note) - final cadence
    { id: "ap-53", pitch: "C5", duration: 4, absoluteBeat: 64 },
  ],

  repeatMarkers: [
    // No repeat markers - volta brackets not supported
    // A section linearized: Pass 1 (volta 1) + Pass 2 (volta 2)
  ],

  lyrics: [
    // ═══════════════════════════════════════════════════════════════════
    // A SECTION - FIRST PASS (volta 1)
    // "Ani Purim, ani Purim, Sameach Umvadeyach"
    // ═══════════════════════════════════════════════════════════════════
    { text: "A", absoluteBeat: 3 }, // pickup
    { text: "ni", absoluteBeat: 4 },
    { text: "Pu", absoluteBeat: 5 },
    { text: "rim,", absoluteBeat: 6 },
    { text: "a", absoluteBeat: 7 },
    { text: "ni", absoluteBeat: 8 },
    { text: "Pu", absoluteBeat: 9 },
    { text: "rim,", absoluteBeat: 10 },
    { text: "Sa", absoluteBeat: 11 },
    { text: "me", absoluteBeat: 12 },
    { text: "ach", absoluteBeat: 13 },
    { text: "Um", absoluteBeat: 14 },
    { text: "va", absoluteBeat: 15 },
    { text: "de", absoluteBeat: 16 },
    { text: "ya", absoluteBeat: 16.5 },
    { text: "ch.", absoluteBeat: 17 },

    // ═══════════════════════════════════════════════════════════════════
    // A SECTION - SECOND PASS (volta 2)
    // "Halo rak pa'am bashana, Avo lehitareyach"
    // ═══════════════════════════════════════════════════════════════════
    { text: "Ha", absoluteBeat: 19 }, // pickup for second verse line
    { text: "lo", absoluteBeat: 20 },
    { text: "rak", absoluteBeat: 21 },
    { text: "pa", absoluteBeat: 22 },
    { text: "'am", absoluteBeat: 23 },
    { text: "ba", absoluteBeat: 24 },
    { text: "sha", absoluteBeat: 25 },
    { text: "na", absoluteBeat: 26 },
    { text: "A", absoluteBeat: 27 },
    { text: "vo", absoluteBeat: 28 },
    { text: "le", absoluteBeat: 29 },
    { text: "hi", absoluteBeat: 30 },
    { text: "ta", absoluteBeat: 31 },
    { text: "re", absoluteBeat: 32 },
    { text: "ya", absoluteBeat: 32.5 },
    { text: "ch.", absoluteBeat: 33 },

    // ═══════════════════════════════════════════════════════════════════
    // B SECTION - CHORUS
    // "La la la - la la" (repeated pattern)
    // ═══════════════════════════════════════════════════════════════════
    // Line 1: "La la la - la la"
    { text: "La", absoluteBeat: 36 },
    { text: "la", absoluteBeat: 38 },
    { text: "la", absoluteBeat: 40 },
    { text: "-", absoluteBeat: 40.5 },
    { text: "la", absoluteBeat: 41 },
    { text: "la", absoluteBeat: 43 },
    // Line 2: "La la la - la la"
    { text: "La", absoluteBeat: 44 },
    { text: "la", absoluteBeat: 46 },
    { text: "la", absoluteBeat: 48 },
    { text: "-", absoluteBeat: 49 },
    { text: "la", absoluteBeat: 51 },
    // Line 3: "La la la - la la"
    { text: "La", absoluteBeat: 52 },
    { text: "la", absoluteBeat: 54 },
    { text: "la", absoluteBeat: 56 },
    { text: "-", absoluteBeat: 56.5 },
    { text: "la", absoluteBeat: 57 },
    { text: "la", absoluteBeat: 59 },
    // Line 4: "La la - la."
    { text: "La", absoluteBeat: 60 },
    { text: "la", absoluteBeat: 62 },
    { text: "la.", absoluteBeat: 64 },
  ],

  settings: {
    tempo: 200, // Fast, lively Purim tempo
    timeSignature: { numerator: 4, denominator: 4 },
  },

  releaseDate: "2026-02-02",

  transcriptionNotes: {
    original: {
      key: "C Major",
      timeSignature: "4/4",
      features: [
        "pickup beat (anacrusis)",
        "volta brackets (1st/2nd endings) on A section",
        "repeat at end of PDF M4/M5",
      ],
    },
    changes: [
      {
        what: "Pickup in full measure",
        why: "App doesn't support anacrusis - G at beat 4 (absoluteBeat 3)",
      },
      {
        what: "Linearized volta brackets",
        why: "App doesn't support volta - wrote out both A section passes explicitly",
      },
      {
        what: "No repeat markers used",
        why: "Repeat with volta brackets can't work - entire song written sequentially",
      },
    ],
    sources: {
      sheetMusic: "https://israelinote.com/song/ani-purim-sheet-music/",
      lyrics: "https://www.hebrewsongs.com/?song=anipurim",
    },
    transcribedDate: "2026-02-02",
  },
};
