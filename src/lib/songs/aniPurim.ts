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
    // STRUCTURE: Pickup + A Section (M1-M3 shared + M4 volta1 + M5 volta2) + B Section
    // Volta 1 in M4, Volta 2 in M5 (matching PDF layout)
    // ═══════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════
    // PICKUP MEASURE (Measure 0, beats 0-3)
    // ═══════════════════════════════════════════════════════════════════
    { id: "ap-r1", pitch: "REST", duration: 3, absoluteBeat: 0 },
    { id: "ap-1", pitch: "G4", duration: 1, absoluteBeat: 3 }, // pickup

    // ═══════════════════════════════════════════════════════════════════
    // A SECTION - SHARED (Measures 1-3, beats 4-15)
    // Plays on BOTH passes
    // ═══════════════════════════════════════════════════════════════════

    // Measure 1 (beats 4-7): C G G G
    { id: "ap-2", pitch: "C5", duration: 1, absoluteBeat: 4 },
    { id: "ap-3", pitch: "G4", duration: 1, absoluteBeat: 5 },
    { id: "ap-4", pitch: "G4", duration: 1, absoluteBeat: 6 },
    { id: "ap-5", pitch: "G4", duration: 1, absoluteBeat: 7 },

    // Measure 2 (beats 8-11): A E E E
    { id: "ap-6", pitch: "A4", duration: 1, absoluteBeat: 8 },
    { id: "ap-7", pitch: "E4", duration: 1, absoluteBeat: 9 },
    { id: "ap-8", pitch: "E4", duration: 1, absoluteBeat: 10 },
    { id: "ap-9", pitch: "E4", duration: 1, absoluteBeat: 11 },

    // Measure 3 (beats 12-15): G F E D
    { id: "ap-10", pitch: "G4", duration: 1, absoluteBeat: 12 },
    { id: "ap-11", pitch: "F4", duration: 1, absoluteBeat: 13 },
    { id: "ap-12", pitch: "E4", duration: 1, absoluteBeat: 14 },
    { id: "ap-13", pitch: "D4", duration: 1, absoluteBeat: 15 },

    // ═══════════════════════════════════════════════════════════════════
    // VOLTA 1 - Measure 4 (beats 16-19)
    // First ending - plays on pass 1 only
    // ═══════════════════════════════════════════════════════════════════
    { id: "ap-v1-1", pitch: "E4", duration: 0.5, absoluteBeat: 16 },
    { id: "ap-v1-2", pitch: "F4", duration: 0.5, absoluteBeat: 16.5 },
    { id: "ap-v1-3", pitch: "G4", duration: 2, absoluteBeat: 17 },
    { id: "ap-v1-4", pitch: "G4", duration: 1, absoluteBeat: 19 }, // pickup for repeat

    // ═══════════════════════════════════════════════════════════════════
    // VOLTA 2 - Measure 5 (beats 20-23)
    // Second ending - plays on pass 2 only, then continues to B section
    // ═══════════════════════════════════════════════════════════════════
    { id: "ap-v2-1", pitch: "E4", duration: 0.5, absoluteBeat: 20 },
    { id: "ap-v2-2", pitch: "D4", duration: 0.5, absoluteBeat: 20.5 },
    { id: "ap-v2-3", pitch: "C4", duration: 2, absoluteBeat: 21 },
    { id: "ap-v2-4", pitch: "C4", duration: 1, absoluteBeat: 23 },

    // ═══════════════════════════════════════════════════════════════════
    // B SECTION - CHORUS (Measures 6-13, beats 24-55)
    // ═══════════════════════════════════════════════════════════════════

    // Measure 6 (beats 24-27): D D (half notes)
    { id: "ap-14", pitch: "D4", duration: 2, absoluteBeat: 24 },
    { id: "ap-15", pitch: "D4", duration: 2, absoluteBeat: 26 },

    // Measure 7 (beats 28-31): E F (8ths) + G (half) + G (quarter)
    { id: "ap-16", pitch: "E4", duration: 0.5, absoluteBeat: 28 },
    { id: "ap-17", pitch: "F4", duration: 0.5, absoluteBeat: 28.5 },
    { id: "ap-18", pitch: "G4", duration: 2, absoluteBeat: 29 },
    { id: "ap-19", pitch: "G4", duration: 1, absoluteBeat: 31 },

    // Measure 8 (beats 32-35): A B (half notes)
    { id: "ap-20", pitch: "A4", duration: 2, absoluteBeat: 32 },
    { id: "ap-21", pitch: "B4", duration: 2, absoluteBeat: 34 },

    // Measure 9 (beats 36-39): C5 (quarter) + G (half) + G (quarter)
    { id: "ap-22", pitch: "C5", duration: 1, absoluteBeat: 36 },
    { id: "ap-23", pitch: "G4", duration: 2, absoluteBeat: 37 },
    { id: "ap-24", pitch: "G4", duration: 1, absoluteBeat: 39 },

    // Measure 10 (beats 40-43): D D (half notes)
    { id: "ap-25", pitch: "D4", duration: 2, absoluteBeat: 40 },
    { id: "ap-26", pitch: "D4", duration: 2, absoluteBeat: 42 },

    // Measure 11 (beats 44-47): E F (8ths) + G (half) + G (quarter)
    { id: "ap-27", pitch: "E4", duration: 0.5, absoluteBeat: 44 },
    { id: "ap-28", pitch: "F4", duration: 0.5, absoluteBeat: 44.5 },
    { id: "ap-29", pitch: "G4", duration: 2, absoluteBeat: 45 },
    { id: "ap-30", pitch: "G4", duration: 1, absoluteBeat: 47 },

    // Measure 12 (beats 48-51): A B (half notes)
    { id: "ap-31", pitch: "A4", duration: 2, absoluteBeat: 48 },
    { id: "ap-32", pitch: "B4", duration: 2, absoluteBeat: 50 },

    // Measure 13 (beats 52-55): C5 (whole note) - final cadence
    { id: "ap-33", pitch: "C5", duration: 4, absoluteBeat: 52 },
  ],

  repeatMarkers: [
    // A section repeat - includes shared (M1-M3) + both voltas (M4, M5)
    // Note: Visual repeat barline should be at end of M4 (volta 1)
    // but the logical section must include M5 (volta 2) for playback filtering
    {
      id: "ap-repeat-start",
      pairId: "ap-section-a",
      type: "start",
      measureNumber: 1,
    },
    {
      id: "ap-repeat-end",
      pairId: "ap-section-a",
      type: "end",
      measureNumber: 6, // Exclusive - includes both volta measures for playback
    },
  ],

  voltaBrackets: [
    // Volta 1: Measure 4 - first ending
    {
      id: "ap-volta-1",
      repeatPairId: "ap-section-a",
      startMeasure: 4,
      endMeasure: 5, // Exclusive
      voltaNumber: 1,
    },
    // Volta 2: Measure 5 - second ending
    {
      id: "ap-volta-2",
      repeatPairId: "ap-section-a",
      startMeasure: 5,
      endMeasure: 6, // Exclusive
      voltaNumber: 2,
    },
  ],

  lyrics: [
    // A SECTION - Verse 1
    { text: "A", absoluteBeat: 3 },
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
    // Volta 1 lyrics
    { text: "de", absoluteBeat: 16 },
    { text: "ya", absoluteBeat: 16.5 },
    { text: "ch.", absoluteBeat: 17 },
    // Volta 2 lyrics
    { text: "re", absoluteBeat: 20 },
    { text: "ya", absoluteBeat: 20.5 },
    { text: "ch.", absoluteBeat: 21 },

    // B SECTION - CHORUS
    { text: "La", absoluteBeat: 24 },
    { text: "la", absoluteBeat: 26 },
    { text: "la", absoluteBeat: 28 },
    { text: "-", absoluteBeat: 28.5 },
    { text: "la", absoluteBeat: 29 },
    { text: "la", absoluteBeat: 31 },
    { text: "La", absoluteBeat: 32 },
    { text: "la", absoluteBeat: 34 },
    { text: "la", absoluteBeat: 36 },
    { text: "-", absoluteBeat: 37 },
    { text: "la", absoluteBeat: 39 },
    { text: "La", absoluteBeat: 40 },
    { text: "la", absoluteBeat: 42 },
    { text: "la", absoluteBeat: 44 },
    { text: "-", absoluteBeat: 44.5 },
    { text: "la", absoluteBeat: 45 },
    { text: "la", absoluteBeat: 47 },
    { text: "La", absoluteBeat: 48 },
    { text: "la", absoluteBeat: 50 },
    { text: "la.", absoluteBeat: 52 },
  ],

  settings: {
    tempo: 200,
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
        "repeat at end of A section",
      ],
    },
    changes: [
      {
        what: "Pickup in full measure",
        why: "App doesn't support anacrusis - G at beat 4 (absoluteBeat 3)",
      },
      {
        what: "Volta brackets in separate measures",
        why: "M4 = volta 1, M5 = volta 2 (matching PDF layout)",
      },
    ],
    sources: {
      sheetMusic: "https://israelinote.com/song/ani-purim-sheet-music/",
      lyrics: "https://www.hebrewsongs.com/?song=anipurim",
    },
    transcribedDate: "2026-02-02",
  },
};
