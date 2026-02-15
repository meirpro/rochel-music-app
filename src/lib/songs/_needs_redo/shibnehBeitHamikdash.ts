// Shibneh Beit HaMikdash (שיבנה בית המקדש) - Chabad Niggun
// Key: A minor (no key signature, chromatic F#), Time: 4/4, Tempo: 120
// Words: From the prayer, Melody: R' Yisrael Shor
import { SongData } from "../types";

export const shibnehBeitHamikdash: SongData = {
  id: "default-shibneh",
  name: "Shibneh Beit HaMikdash",
  hebrewName: "שיבנה בית המקדש",
  description: "ניגון חב״ד. מילים: מתוך התפילה. לחן: ר׳ ישראל שור",
  notes: [
    // === SECTION A (Measures 1-4, beats 0-15) ===
    // Pickup: eighth rest + E4 eighth
    { id: "shibneh-0", pitch: "E4", duration: 0.5, absoluteBeat: 0.5 },

    // M1: E chord - E4 F#4 | E4 E4 | F#4. E4
    { id: "shibneh-1", pitch: "E4", duration: 0.5, absoluteBeat: 1 },
    { id: "shibneh-2", pitch: "F#4", duration: 0.5, absoluteBeat: 1.5 },
    { id: "shibneh-3", pitch: "E4", duration: 1, absoluteBeat: 2 },
    { id: "shibneh-4", pitch: "E4", duration: 1, absoluteBeat: 3 },
    { id: "shibneh-5", pitch: "F#4", duration: 0.75, absoluteBeat: 4 },
    { id: "shibneh-6", pitch: "E4", duration: 0.25, absoluteBeat: 4.75 },

    // M2: F chord - F4 G4 | A4 A4 | G4. F4
    { id: "shibneh-7", pitch: "F4", duration: 0.5, absoluteBeat: 5 },
    { id: "shibneh-8", pitch: "G4", duration: 0.5, absoluteBeat: 5.5 },
    { id: "shibneh-9", pitch: "A4", duration: 1, absoluteBeat: 6 },
    { id: "shibneh-10", pitch: "A4", duration: 1, absoluteBeat: 7 },
    { id: "shibneh-11", pitch: "G4", duration: 0.75, absoluteBeat: 8 },
    { id: "shibneh-12", pitch: "F4", duration: 0.25, absoluteBeat: 8.75 },

    // M3: Dm chord - F4 E4 | D4 D4 | E4. D4
    { id: "shibneh-13", pitch: "F4", duration: 0.5, absoluteBeat: 9 },
    { id: "shibneh-14", pitch: "E4", duration: 0.5, absoluteBeat: 9.5 },
    { id: "shibneh-15", pitch: "D4", duration: 1, absoluteBeat: 10 },
    { id: "shibneh-16", pitch: "D4", duration: 1, absoluteBeat: 11 },
    { id: "shibneh-17", pitch: "E4", duration: 0.75, absoluteBeat: 12 },
    { id: "shibneh-18", pitch: "D4", duration: 0.25, absoluteBeat: 12.75 },

    // M4: E chord - F#4 (half) | rest | E4 pickup
    { id: "shibneh-19", pitch: "F#4", duration: 2, absoluteBeat: 13 },
    // rest at beat 15
    { id: "shibneh-20", pitch: "E4", duration: 0.5, absoluteBeat: 15.5 },

    // === SECTION A' (Measures 5-8, beats 16-31) - Variation ===
    // M5: E chord - F#4 E4 | E4 E4 | F#4. E4
    { id: "shibneh-21", pitch: "F#4", duration: 0.5, absoluteBeat: 16 },
    { id: "shibneh-22", pitch: "E4", duration: 0.5, absoluteBeat: 16.5 },
    { id: "shibneh-23", pitch: "E4", duration: 1, absoluteBeat: 17 },
    { id: "shibneh-24", pitch: "E4", duration: 1, absoluteBeat: 18 },
    { id: "shibneh-25", pitch: "F#4", duration: 0.75, absoluteBeat: 19 },
    { id: "shibneh-26", pitch: "E4", duration: 0.25, absoluteBeat: 19.75 },

    // M6: F chord - F4 G4 | A4 A4 | G4. F4
    { id: "shibneh-27", pitch: "F4", duration: 0.5, absoluteBeat: 20 },
    { id: "shibneh-28", pitch: "G4", duration: 0.5, absoluteBeat: 20.5 },
    { id: "shibneh-29", pitch: "A4", duration: 1, absoluteBeat: 21 },
    { id: "shibneh-30", pitch: "A4", duration: 1, absoluteBeat: 22 },
    { id: "shibneh-31", pitch: "G4", duration: 0.75, absoluteBeat: 23 },
    { id: "shibneh-32", pitch: "F4", duration: 0.25, absoluteBeat: 23.75 },

    // M7: Dm chord - F4 E4 | D4 D4 | E4. D4
    { id: "shibneh-33", pitch: "F4", duration: 0.5, absoluteBeat: 24 },
    { id: "shibneh-34", pitch: "E4", duration: 0.5, absoluteBeat: 24.5 },
    { id: "shibneh-35", pitch: "D4", duration: 1, absoluteBeat: 25 },
    { id: "shibneh-36", pitch: "D4", duration: 1, absoluteBeat: 26 },
    { id: "shibneh-37", pitch: "E4", duration: 0.75, absoluteBeat: 27 },
    { id: "shibneh-38", pitch: "D4", duration: 0.25, absoluteBeat: 27.75 },

    // M8: E chord - F#4 (half) | rest | E4 ending
    { id: "shibneh-39", pitch: "F#4", duration: 2, absoluteBeat: 28 },
    // rest at beat 30
    { id: "shibneh-40", pitch: "E4", duration: 1, absoluteBeat: 31 },
  ],
  repeatMarkers: [
    {
      id: "shibneh-repeat-start",
      pairId: "shibneh-repeat",
      type: "start",
      measureNumber: 0,
    },
    {
      id: "shibneh-repeat-end",
      pairId: "shibneh-repeat",
      type: "end",
      measureNumber: 8,
    },
  ],
  lyrics: [
    // "Shi-b'neh beit ha-mik-dash" syllables
    { text: "Shi", absoluteBeat: 0.5 },
    { text: "b'neh", absoluteBeat: 1 },
    { text: "beit", absoluteBeat: 2 },
    { text: "ha", absoluteBeat: 4 },
    { text: "mik", absoluteBeat: 5 },
    { text: "dash", absoluteBeat: 6 },
    { text: "bim", absoluteBeat: 8 },
    { text: "hei", absoluteBeat: 9 },
    { text: "ra", absoluteBeat: 10 },
    { text: "b'ya", absoluteBeat: 12 },
    { text: "mei", absoluteBeat: 13 },
    { text: "nu", absoluteBeat: 15.5 },
  ],
  settings: {
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
  },
  releaseDate: "2025-01-15",
  category: "experimental",
};
