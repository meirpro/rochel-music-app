// Koli Dodi Dofek (קולי דודי דופק) - Chabad Niggun
// Key: E minor, Time: 4/4, Tempo: 120
// By the Alter Rebbe, words from Shir HaShirim
import { SongData } from "../types";

export const koliDodiDofek: SongData = {
  id: "default-koli",
  name: "Koli Dodi Dofek",
  hebrewName: "קולי דודי דופק",
  description: "ניגון מאדמו״ר הזקן. מילים: משיר השירים",
  notes: [
    // Pickup measure (1 beat)
    { id: "koli-0", pitch: "E4", duration: 1, absoluteBeat: 0 },

    // Measure 1 (absoluteBeat 1-4)
    { id: "koli-1", pitch: "E4", duration: 1, absoluteBeat: 1 },
    { id: "koli-2", pitch: "F#4", duration: 1, absoluteBeat: 2 },
    { id: "koli-3", pitch: "G4", duration: 1, absoluteBeat: 3 },
    { id: "koli-4", pitch: "F#4", duration: 1, absoluteBeat: 4 },

    // Measure 2 (absoluteBeat 5-8)
    { id: "koli-5", pitch: "E4", duration: 1.5, absoluteBeat: 5 },
    { id: "koli-6", pitch: "F#4", duration: 0.5, absoluteBeat: 6.5 },
    { id: "koli-7", pitch: "G4", duration: 0.5, absoluteBeat: 7 },
    { id: "koli-8", pitch: "F#4", duration: 0.5, absoluteBeat: 7.5 },
    { id: "koli-9", pitch: "E4", duration: 0.5, absoluteBeat: 8 },
    { id: "koli-10", pitch: "D4", duration: 0.5, absoluteBeat: 8.5 },

    // Measure 3 (absoluteBeat 9-12)
    { id: "koli-11", pitch: "E4", duration: 0.5, absoluteBeat: 9 },
    { id: "koli-12", pitch: "D4", duration: 0.5, absoluteBeat: 9.5 },
    { id: "koli-13", pitch: "C4", duration: 1, absoluteBeat: 10 },
    { id: "koli-14", pitch: "D4", duration: 1, absoluteBeat: 11 },
    { id: "koli-15", pitch: "E4", duration: 1, absoluteBeat: 12 },

    // Measure 4 (absoluteBeat 13-16)
    { id: "koli-16", pitch: "D4", duration: 1.5, absoluteBeat: 13 },
    { id: "koli-17", pitch: "F#4", duration: 0.5, absoluteBeat: 14.5 },
    { id: "koli-18", pitch: "E4", duration: 0.5, absoluteBeat: 15 },
    { id: "koli-19", pitch: "D4", duration: 2, absoluteBeat: 15.5 },

    // Measure 5 (absoluteBeat 17-20)
    { id: "koli-20", pitch: "E4", duration: 1, absoluteBeat: 17 },
    { id: "koli-21", pitch: "E4", duration: 1, absoluteBeat: 18 },
    { id: "koli-22", pitch: "F#4", duration: 1, absoluteBeat: 19 },
    { id: "koli-23", pitch: "G4", duration: 1, absoluteBeat: 20 },

    // Measure 6 (absoluteBeat 21-24)
    { id: "koli-24", pitch: "F#4", duration: 1.5, absoluteBeat: 21 },
    { id: "koli-25", pitch: "F#4", duration: 0.5, absoluteBeat: 22.5 },
    { id: "koli-26", pitch: "G4", duration: 0.5, absoluteBeat: 23 },
    { id: "koli-27", pitch: "F#4", duration: 0.5, absoluteBeat: 23.5 },
    { id: "koli-28", pitch: "E4", duration: 0.5, absoluteBeat: 24 },
    { id: "koli-29", pitch: "D4", duration: 0.5, absoluteBeat: 24.5 },

    // Measure 7 (absoluteBeat 25-28)
    { id: "koli-30", pitch: "E4", duration: 0.5, absoluteBeat: 25 },
    { id: "koli-31", pitch: "D4", duration: 0.5, absoluteBeat: 25.5 },
    { id: "koli-32", pitch: "E4", duration: 1, absoluteBeat: 26 },
    { id: "koli-33", pitch: "C4", duration: 1, absoluteBeat: 27 },
    { id: "koli-34", pitch: "D4", duration: 1, absoluteBeat: 28 },

    // Measure 8 (absoluteBeat 29-32)
    { id: "koli-35", pitch: "E4", duration: 1, absoluteBeat: 29 },
    { id: "koli-36", pitch: "D4", duration: 1.5, absoluteBeat: 30 },
    { id: "koli-37", pitch: "F#4", duration: 0.5, absoluteBeat: 31.5 },
    { id: "koli-38", pitch: "E4", duration: 0.5, absoluteBeat: 32 },
    { id: "koli-39", pitch: "D4", duration: 2, absoluteBeat: 32.5 },
  ],
  repeatMarkers: [],
  lyrics: [
    { text: "Ko", absoluteBeat: 0 },
    { text: "li", absoluteBeat: 1 },
    { text: "do", absoluteBeat: 2 },
    { text: "di", absoluteBeat: 3 },
    { text: "do", absoluteBeat: 4 },
    { text: "fek", absoluteBeat: 5 },
  ],
  settings: {
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
  },
  releaseDate: "2025-01-15",
  category: "experimental",
};
