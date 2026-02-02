// Nigun Simcha (ניגון שמחה) - A Joyful Niggun
// Transposed from Db major to C major
// Time: 4/4, Tempo: 145
import { SongData } from "./types";

export const nigunSimcha: SongData = {
  id: "default-simcha",
  name: "Nigun Simcha",
  hebrewName: "ניגון שמחה",
  description: "ניגון שמחה",
  notes: [
    // === SECTION A (Measures 1-8, beats 0-31) ===
    // M1: C D | G G F E E D
    { id: "simcha-0", pitch: "C4", duration: 1, absoluteBeat: 0 },
    { id: "simcha-1", pitch: "D4", duration: 0.5, absoluteBeat: 1 },
    { id: "simcha-2", pitch: "G4", duration: 0.5, absoluteBeat: 1.5 },
    { id: "simcha-3", pitch: "G4", duration: 0.5, absoluteBeat: 2 },
    { id: "simcha-4", pitch: "F4", duration: 0.5, absoluteBeat: 2.5 },
    { id: "simcha-5", pitch: "E4", duration: 0.5, absoluteBeat: 3 },
    { id: "simcha-6", pitch: "D4", duration: 0.5, absoluteBeat: 3.5 },
    // M2: E E D D | C (half)
    { id: "simcha-7", pitch: "E4", duration: 0.5, absoluteBeat: 4 },
    { id: "simcha-8", pitch: "E4", duration: 0.5, absoluteBeat: 4.5 },
    { id: "simcha-9", pitch: "D4", duration: 0.5, absoluteBeat: 5 },
    { id: "simcha-10", pitch: "D4", duration: 0.5, absoluteBeat: 5.5 },
    { id: "simcha-11", pitch: "C4", duration: 2, absoluteBeat: 6 },
    // M3: Rest (dotted half) | C (quarter)
    { id: "simcha-12", pitch: "C4", duration: 1, absoluteBeat: 11 },
    // M4: D G | G G F E E D
    { id: "simcha-13", pitch: "D4", duration: 0.5, absoluteBeat: 12 },
    { id: "simcha-14", pitch: "G4", duration: 0.5, absoluteBeat: 12.5 },
    { id: "simcha-15", pitch: "G4", duration: 0.5, absoluteBeat: 13 },
    { id: "simcha-16", pitch: "G4", duration: 0.5, absoluteBeat: 13.5 },
    { id: "simcha-17", pitch: "F4", duration: 0.5, absoluteBeat: 14 },
    { id: "simcha-18", pitch: "E4", duration: 0.5, absoluteBeat: 14.5 },
    { id: "simcha-19", pitch: "E4", duration: 0.5, absoluteBeat: 15 },
    { id: "simcha-20", pitch: "D4", duration: 0.5, absoluteBeat: 15.5 },
    // M5: Rest | E F E D
    { id: "simcha-21", pitch: "E4", duration: 0.5, absoluteBeat: 18 },
    { id: "simcha-22", pitch: "F4", duration: 0.5, absoluteBeat: 18.5 },
    { id: "simcha-23", pitch: "E4", duration: 0.5, absoluteBeat: 19 },
    { id: "simcha-24", pitch: "D4", duration: 0.5, absoluteBeat: 19.5 },
    // M6: E E D E | rest
    { id: "simcha-25", pitch: "E4", duration: 0.5, absoluteBeat: 20 },
    { id: "simcha-26", pitch: "E4", duration: 0.5, absoluteBeat: 20.5 },
    { id: "simcha-27", pitch: "D4", duration: 0.5, absoluteBeat: 21 },
    { id: "simcha-28", pitch: "E4", duration: 0.5, absoluteBeat: 21.5 },
    // M7: C (whole)
    { id: "simcha-29", pitch: "C4", duration: 4, absoluteBeat: 24 },
    // === SECTION B (Measures 9-16, beats 32-63) ===
    // M9: C D (rest) E F (rest) E F
    { id: "simcha-30", pitch: "C4", duration: 0.5, absoluteBeat: 32 },
    { id: "simcha-31", pitch: "D4", duration: 0.5, absoluteBeat: 32.5 },
    { id: "simcha-32", pitch: "E4", duration: 0.5, absoluteBeat: 34 },
    { id: "simcha-33", pitch: "F4", duration: 0.5, absoluteBeat: 34.5 },
    { id: "simcha-34", pitch: "E4", duration: 0.5, absoluteBeat: 35 },
    { id: "simcha-35", pitch: "F4", duration: 0.5, absoluteBeat: 35.5 },
    // M10: E F (rest) E G (half)
    { id: "simcha-36", pitch: "E4", duration: 0.5, absoluteBeat: 36 },
    { id: "simcha-37", pitch: "F4", duration: 0.5, absoluteBeat: 36.5 },
    { id: "simcha-38", pitch: "E4", duration: 0.5, absoluteBeat: 37.5 },
    { id: "simcha-39", pitch: "G4", duration: 2, absoluteBeat: 38 },
    // M11-12
    { id: "simcha-40", pitch: "E4", duration: 0.5, absoluteBeat: 40 },
    { id: "simcha-41", pitch: "F4", duration: 0.5, absoluteBeat: 40.5 },
    { id: "simcha-42", pitch: "E4", duration: 0.5, absoluteBeat: 42 },
    { id: "simcha-43", pitch: "F4", duration: 0.5, absoluteBeat: 42.5 },
    { id: "simcha-44", pitch: "E4", duration: 0.5, absoluteBeat: 43 },
    { id: "simcha-45", pitch: "F4", duration: 0.5, absoluteBeat: 43.5 },
    { id: "simcha-46", pitch: "G4", duration: 4, absoluteBeat: 44 },
    { id: "simcha-47", pitch: "F4", duration: 1, absoluteBeat: 48 },
    { id: "simcha-48", pitch: "E4", duration: 1, absoluteBeat: 49 },
    // M13-14
    { id: "simcha-49", pitch: "C4", duration: 0.5, absoluteBeat: 50 },
    { id: "simcha-50", pitch: "D4", duration: 0.5, absoluteBeat: 50.5 },
    { id: "simcha-51", pitch: "E4", duration: 0.5, absoluteBeat: 52 },
    { id: "simcha-52", pitch: "F4", duration: 0.5, absoluteBeat: 52.5 },
    { id: "simcha-53", pitch: "E4", duration: 0.5, absoluteBeat: 53 },
    { id: "simcha-54", pitch: "F4", duration: 0.5, absoluteBeat: 53.5 },
    { id: "simcha-55", pitch: "E4", duration: 2, absoluteBeat: 54 },
    // M15: Running eighths to cadence
    { id: "simcha-56", pitch: "E4", duration: 0.5, absoluteBeat: 56 },
    { id: "simcha-57", pitch: "F4", duration: 0.5, absoluteBeat: 56.5 },
    { id: "simcha-58", pitch: "E4", duration: 0.5, absoluteBeat: 57 },
    { id: "simcha-59", pitch: "D4", duration: 0.5, absoluteBeat: 57.5 },
    { id: "simcha-60", pitch: "E4", duration: 1.5, absoluteBeat: 58 },
    { id: "simcha-61", pitch: "D4", duration: 1, absoluteBeat: 59.5 },
    // M16: C (whole)
    { id: "simcha-62", pitch: "C4", duration: 4, absoluteBeat: 60 },
  ],
  repeatMarkers: [
    {
      id: "simcha-repeat-start-1",
      pairId: "simcha-repeat-1",
      type: "start",
      measureNumber: 0,
    },
    {
      id: "simcha-repeat-end-1",
      pairId: "simcha-repeat-1",
      type: "end",
      measureNumber: 8,
    },
    {
      id: "simcha-repeat-start-2",
      pairId: "simcha-repeat-2",
      type: "start",
      measureNumber: 8,
    },
    {
      id: "simcha-repeat-end-2",
      pairId: "simcha-repeat-2",
      type: "end",
      measureNumber: 16,
    },
  ],
  lyrics: [
    { text: "Lai", absoluteBeat: 0 },
    { text: "lai", absoluteBeat: 1 },
    { text: "lai", absoluteBeat: 1.5 },
    { text: "lai", absoluteBeat: 2 },
    { text: "lai", absoluteBeat: 2.5 },
    { text: "lai", absoluteBeat: 3 },
    { text: "lai", absoluteBeat: 3.5 },
    { text: "lai", absoluteBeat: 4 },
    { text: "lai", absoluteBeat: 4.5 },
    { text: "lai", absoluteBeat: 5 },
    { text: "lai", absoluteBeat: 5.5 },
    { text: "lai", absoluteBeat: 6 },
    { text: "Lai", absoluteBeat: 11 },
    { text: "lai", absoluteBeat: 12 },
    { text: "lai", absoluteBeat: 12.5 },
    { text: "lai", absoluteBeat: 13 },
    { text: "lai", absoluteBeat: 13.5 },
    { text: "lai", absoluteBeat: 14 },
    { text: "lai", absoluteBeat: 14.5 },
    { text: "lai", absoluteBeat: 15 },
    { text: "lai", absoluteBeat: 15.5 },
    { text: "lai", absoluteBeat: 18 },
    { text: "lai", absoluteBeat: 18.5 },
    { text: "lai", absoluteBeat: 19 },
    { text: "lai", absoluteBeat: 19.5 },
    { text: "lai", absoluteBeat: 20 },
    { text: "lai", absoluteBeat: 20.5 },
    { text: "lai", absoluteBeat: 21 },
    { text: "lai", absoluteBeat: 21.5 },
    { text: "lai", absoluteBeat: 24 },
  ],
  settings: {
    tempo: 145,
    timeSignature: { numerator: 4, denominator: 4 },
  },
  releaseDate: "2025-01-15",
};
