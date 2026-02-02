// Havdalah (הבדלה) - Shlomo Carlebach
// Key: A Minor, Time: 4/4, Tempo: 250
// Words: Havdalah prayer, Music: Rabbi Shlomo Carlebach
import { SongData } from "./types";

export const havdalah: SongData = {
  id: "default-havdalah",
  name: "Havdalah",
  hebrewName: "הבדלה",
  description: "ר' שלמה קרליבך - ניגון הבדלה",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // SECTION A - Top Line (5 measures)
    // Pattern: E-D-C-A descending motif
    // ═══════════════════════════════════════════════════════════════════

    // M1 (beats 0-3): E D C A (eighths) + D (half)
    { id: "hav-1", pitch: "E5", duration: 0.5, absoluteBeat: 0 },
    { id: "hav-2", pitch: "D5", duration: 0.5, absoluteBeat: 0.5 },
    { id: "hav-3", pitch: "C5", duration: 0.5, absoluteBeat: 1 },
    { id: "hav-4", pitch: "A4", duration: 0.5, absoluteBeat: 1.5 },
    { id: "hav-5", pitch: "D5", duration: 2, absoluteBeat: 2 },

    // M2 (beats 4-7): E D C A (eighths) + C (half)
    { id: "hav-6", pitch: "E5", duration: 0.5, absoluteBeat: 4 },
    { id: "hav-7", pitch: "D5", duration: 0.5, absoluteBeat: 4.5 },
    { id: "hav-8", pitch: "C5", duration: 0.5, absoluteBeat: 5 },
    { id: "hav-9", pitch: "A4", duration: 0.5, absoluteBeat: 5.5 },
    { id: "hav-10", pitch: "C5", duration: 2, absoluteBeat: 6 },

    // M3 (beats 8-11): C A G E (eighths) + D D (quarters)
    { id: "hav-11", pitch: "C5", duration: 0.5, absoluteBeat: 8 },
    { id: "hav-12", pitch: "A4", duration: 0.5, absoluteBeat: 8.5 },
    { id: "hav-13", pitch: "G4", duration: 0.5, absoluteBeat: 9 },
    { id: "hav-14", pitch: "E4", duration: 0.5, absoluteBeat: 9.5 },
    { id: "hav-15", pitch: "D4", duration: 1, absoluteBeat: 10 },
    { id: "hav-16", pitch: "D4", duration: 1, absoluteBeat: 11 },

    // M4 (beats 12-15): D C B A C B A G (8 eighths)
    { id: "hav-17", pitch: "D5", duration: 0.5, absoluteBeat: 12 },
    { id: "hav-18", pitch: "C5", duration: 0.5, absoluteBeat: 12.5 },
    { id: "hav-19", pitch: "B4", duration: 0.5, absoluteBeat: 13 },
    { id: "hav-20", pitch: "A4", duration: 0.5, absoluteBeat: 13.5 },
    { id: "hav-21", pitch: "C5", duration: 0.5, absoluteBeat: 14 },
    { id: "hav-22", pitch: "B4", duration: 0.5, absoluteBeat: 14.5 },
    { id: "hav-23", pitch: "A4", duration: 0.5, absoluteBeat: 15 },
    { id: "hav-24", pitch: "G4", duration: 0.5, absoluteBeat: 15.5 },

    // M5 (beats 16-19): A (whole note)
    { id: "hav-25", pitch: "A4", duration: 4, absoluteBeat: 16 },

    // ═══════════════════════════════════════════════════════════════════
    // SECTION B - Bottom Line (4 measures with repeat, then D.C.)
    // Pattern: A G C B motif
    // ═══════════════════════════════════════════════════════════════════

    // M6 (beats 20-23): A G C B (eighths) + A (half)
    { id: "hav-26", pitch: "A4", duration: 0.5, absoluteBeat: 20 },
    { id: "hav-27", pitch: "G4", duration: 0.5, absoluteBeat: 20.5 },
    { id: "hav-28", pitch: "C5", duration: 0.5, absoluteBeat: 21 },
    { id: "hav-29", pitch: "B4", duration: 0.5, absoluteBeat: 21.5 },
    { id: "hav-30", pitch: "A4", duration: 2, absoluteBeat: 22 },

    // M7 (beats 24-27): A G C B (eighths) + A (half)
    { id: "hav-31", pitch: "A4", duration: 0.5, absoluteBeat: 24 },
    { id: "hav-32", pitch: "G4", duration: 0.5, absoluteBeat: 24.5 },
    { id: "hav-33", pitch: "C5", duration: 0.5, absoluteBeat: 25 },
    { id: "hav-34", pitch: "B4", duration: 0.5, absoluteBeat: 25.5 },
    { id: "hav-35", pitch: "A4", duration: 2, absoluteBeat: 26 },

    // M8 (beats 28-31): A G C B A G C B (8 eighths)
    { id: "hav-36", pitch: "A4", duration: 0.5, absoluteBeat: 28 },
    { id: "hav-37", pitch: "G4", duration: 0.5, absoluteBeat: 28.5 },
    { id: "hav-38", pitch: "C5", duration: 0.5, absoluteBeat: 29 },
    { id: "hav-39", pitch: "B4", duration: 0.5, absoluteBeat: 29.5 },
    { id: "hav-40", pitch: "A4", duration: 0.5, absoluteBeat: 30 },
    { id: "hav-41", pitch: "G4", duration: 0.5, absoluteBeat: 30.5 },
    { id: "hav-42", pitch: "C5", duration: 0.5, absoluteBeat: 31 },
    { id: "hav-43", pitch: "B4", duration: 0.5, absoluteBeat: 31.5 },

    // M9 (beats 32-35): A G C B (eighths) + A (half)
    { id: "hav-44", pitch: "A4", duration: 0.5, absoluteBeat: 32 },
    { id: "hav-45", pitch: "G4", duration: 0.5, absoluteBeat: 32.5 },
    { id: "hav-46", pitch: "C5", duration: 0.5, absoluteBeat: 33 },
    { id: "hav-47", pitch: "B4", duration: 0.5, absoluteBeat: 33.5 },
    { id: "hav-48", pitch: "A4", duration: 2, absoluteBeat: 34 },

    // ═══════════════════════════════════════════════════════════════════
    // D.C. - Repeat Section A (linearized)
    // ═══════════════════════════════════════════════════════════════════

    // M10 = M1 (beats 36-39)
    { id: "hav-49", pitch: "E5", duration: 0.5, absoluteBeat: 36 },
    { id: "hav-50", pitch: "D5", duration: 0.5, absoluteBeat: 36.5 },
    { id: "hav-51", pitch: "C5", duration: 0.5, absoluteBeat: 37 },
    { id: "hav-52", pitch: "A4", duration: 0.5, absoluteBeat: 37.5 },
    { id: "hav-53", pitch: "D5", duration: 2, absoluteBeat: 38 },

    // M11 = M2 (beats 40-43)
    { id: "hav-54", pitch: "E5", duration: 0.5, absoluteBeat: 40 },
    { id: "hav-55", pitch: "D5", duration: 0.5, absoluteBeat: 40.5 },
    { id: "hav-56", pitch: "C5", duration: 0.5, absoluteBeat: 41 },
    { id: "hav-57", pitch: "A4", duration: 0.5, absoluteBeat: 41.5 },
    { id: "hav-58", pitch: "C5", duration: 2, absoluteBeat: 42 },

    // M12 = M3 (beats 44-47)
    { id: "hav-59", pitch: "C5", duration: 0.5, absoluteBeat: 44 },
    { id: "hav-60", pitch: "A4", duration: 0.5, absoluteBeat: 44.5 },
    { id: "hav-61", pitch: "G4", duration: 0.5, absoluteBeat: 45 },
    { id: "hav-62", pitch: "E4", duration: 0.5, absoluteBeat: 45.5 },
    { id: "hav-63", pitch: "D4", duration: 1, absoluteBeat: 46 },
    { id: "hav-64", pitch: "D4", duration: 1, absoluteBeat: 47 },

    // M13 = M4 (beats 48-51)
    { id: "hav-65", pitch: "D5", duration: 0.5, absoluteBeat: 48 },
    { id: "hav-66", pitch: "C5", duration: 0.5, absoluteBeat: 48.5 },
    { id: "hav-67", pitch: "B4", duration: 0.5, absoluteBeat: 49 },
    { id: "hav-68", pitch: "A4", duration: 0.5, absoluteBeat: 49.5 },
    { id: "hav-69", pitch: "C5", duration: 0.5, absoluteBeat: 50 },
    { id: "hav-70", pitch: "B4", duration: 0.5, absoluteBeat: 50.5 },
    { id: "hav-71", pitch: "A4", duration: 0.5, absoluteBeat: 51 },
    { id: "hav-72", pitch: "G4", duration: 0.5, absoluteBeat: 51.5 },

    // M14 = M5 Final (beats 52-55)
    { id: "hav-73", pitch: "A4", duration: 4, absoluteBeat: 52 },
  ],

  repeatMarkers: [
    // Section A repeat (measures 0-5)
    {
      id: "hav-ra-start",
      pairId: "section-a",
      type: "start",
      measureNumber: 0,
    },
    { id: "hav-ra-end", pairId: "section-a", type: "end", measureNumber: 5 },
    // Section B repeat (measures 5-14)
    {
      id: "hav-rb-start",
      pairId: "section-b",
      type: "start",
      measureNumber: 5,
    },
    { id: "hav-rb-end", pairId: "section-b", type: "end", measureNumber: 14 },
  ],

  lyrics: [],

  settings: {
    tempo: 250,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-02",

  transcriptionNotes: {
    original: {
      key: "A Minor",
      timeSignature: "4/4",
      features: [
        "D.C. (Da Capo) at end",
        "Section A and B both have repeat signs",
        "Descending E-D-C-A motif in Section A",
        "A-G-C-B motif in Section B",
      ],
    },
    changes: [
      {
        what: "Linearized D.C. (Da Capo)",
        why: "App doesn't support D.C. - Section A written out again at end",
      },
    ],
    sources: {
      sheetMusic: "Israeli Note - Havdalah (Shlomo Carlebach)",
    },
    transcribedDate: "2026-02-02",
  },
};
