// Avinu Malkenu (אבינו מלכנו) - Chabad Nigun
// Key: Eb major / C minor (3 flats: Bb, Eb, Ab)
// Time: 3/4 throughout (no mid-song time signature changes)
// Source: Admor HaZaken
import { SongData } from "../types";

export const avinuMalkenu: SongData = {
  id: "default-avinu",
  name: "Avinu Malkenu",
  hebrewName: "אבינו מלכנו",
  description: "ניגון חב״ד",
  notes: [
    // Measure 1 (3/4, beats 0-3, chord G)
    // Pattern: dotted eighth + sixteenth + 4 eighths
    { id: "avinuMalkenu-0", pitch: "G4", duration: 0.75, absoluteBeat: 0 },
    { id: "avinuMalkenu-1", pitch: "A4", duration: 0.25, absoluteBeat: 0.75 }, // natural
    { id: "avinuMalkenu-2", pitch: "Bb4", duration: 0.5, absoluteBeat: 1 },
    { id: "avinuMalkenu-3", pitch: "C5", duration: 0.5, absoluteBeat: 1.5 },
    { id: "avinuMalkenu-4", pitch: "Bb4", duration: 0.5, absoluteBeat: 2 },
    { id: "avinuMalkenu-5", pitch: "G4", duration: 0.5, absoluteBeat: 2.5 },

    // Measure 2 (beats 3-6, chord Ab)
    // Pattern: dotted quarter + eighth + quarter
    { id: "avinuMalkenu-6", pitch: "Eb4", duration: 1.5, absoluteBeat: 3 },
    { id: "avinuMalkenu-7", pitch: "F4", duration: 0.5, absoluteBeat: 4.5 },
    { id: "avinuMalkenu-8", pitch: "Eb4", duration: 1, absoluteBeat: 5 },

    // Measure 3 (beats 6-9, chord Fm) - "A vi nu"
    // Pattern: dotted eighth + sixteenth + 2 eighths + quarter
    { id: "avinuMalkenu-9", pitch: "Eb4", duration: 0.75, absoluteBeat: 6 },
    { id: "avinuMalkenu-10", pitch: "Eb4", duration: 0.25, absoluteBeat: 6.75 },
    { id: "avinuMalkenu-11", pitch: "F4", duration: 0.5, absoluteBeat: 7 },
    { id: "avinuMalkenu-12", pitch: "G4", duration: 0.5, absoluteBeat: 7.5 },
    { id: "avinuMalkenu-13", pitch: "Ab4", duration: 1, absoluteBeat: 8 },

    // Measure 4 (beats 9-12, chord G)
    // Pattern: dotted quarter + eighth + quarter
    { id: "avinuMalkenu-14", pitch: "G4", duration: 1.5, absoluteBeat: 9 },
    { id: "avinuMalkenu-15", pitch: "A4", duration: 0.5, absoluteBeat: 10.5 }, // natural
    { id: "avinuMalkenu-16", pitch: "Bb4", duration: 1, absoluteBeat: 11 },

    // Measure 5 (beats 12-15, chord G) - same pattern as M1
    // Pattern: dotted eighth + sixteenth + 4 eighths
    { id: "avinuMalkenu-17", pitch: "G4", duration: 0.75, absoluteBeat: 12 },
    { id: "avinuMalkenu-18", pitch: "A4", duration: 0.25, absoluteBeat: 12.75 }, // natural
    { id: "avinuMalkenu-19", pitch: "Bb4", duration: 0.5, absoluteBeat: 13 },
    { id: "avinuMalkenu-20", pitch: "C5", duration: 0.5, absoluteBeat: 13.5 },
    { id: "avinuMalkenu-21", pitch: "Bb4", duration: 0.5, absoluteBeat: 14 },
    { id: "avinuMalkenu-22", pitch: "G4", duration: 0.5, absoluteBeat: 14.5 },

    // Measure 6 (beats 15-18, chord G) - same pattern as M1
    { id: "avinuMalkenu-23", pitch: "G4", duration: 0.75, absoluteBeat: 15 },
    { id: "avinuMalkenu-24", pitch: "A4", duration: 0.25, absoluteBeat: 15.75 }, // natural
    { id: "avinuMalkenu-25", pitch: "Bb4", duration: 0.5, absoluteBeat: 16 },
    { id: "avinuMalkenu-26", pitch: "C5", duration: 0.5, absoluteBeat: 16.5 },
    { id: "avinuMalkenu-27", pitch: "Bb4", duration: 0.5, absoluteBeat: 17 },
    { id: "avinuMalkenu-28", pitch: "G4", duration: 0.5, absoluteBeat: 17.5 },

    // === TIME SIGNATURE CHANGES TO 4/4 ===

    // Measure 7 (4/4, beats 18-22, chord Ab) - "mal ke"
    // Pattern: dotted quarter + eighth + quarter + quarter rest
    { id: "avinuMalkenu-29", pitch: "Eb4", duration: 1.5, absoluteBeat: 18 },
    { id: "avinuMalkenu-30", pitch: "F4", duration: 0.5, absoluteBeat: 19.5 },
    { id: "avinuMalkenu-31", pitch: "Eb4", duration: 1, absoluteBeat: 20 },
    // beat 21 is a quarter rest

    // Measure 8 (beats 22-26, chord Fm) - "nu"
    // Pattern: dotted eighth + sixteenth + 2 eighths + half
    { id: "avinuMalkenu-32", pitch: "Eb4", duration: 0.75, absoluteBeat: 22 },
    {
      id: "avinuMalkenu-33",
      pitch: "Eb4",
      duration: 0.25,
      absoluteBeat: 22.75,
    },
    { id: "avinuMalkenu-34", pitch: "F4", duration: 0.5, absoluteBeat: 23 },
    { id: "avinuMalkenu-35", pitch: "G4", duration: 0.5, absoluteBeat: 23.5 },
    { id: "avinuMalkenu-36", pitch: "Ab4", duration: 2, absoluteBeat: 24 },
  ],
  repeatMarkers: [
    // Section A repeats (marked with א at beginning)
    {
      id: "avinuMalkenu-repeat-start",
      pairId: "avinuMalkenu-section-a",
      type: "start",
      measureNumber: 0,
    },
    {
      id: "avinuMalkenu-repeat-end",
      pairId: "avinuMalkenu-section-a",
      type: "end",
      measureNumber: 8,
    },
  ],
  lyrics: [
    // "Avinu" on measure 3
    { text: "A", absoluteBeat: 6 },
    { text: "vi", absoluteBeat: 7 },
    { text: "nu", absoluteBeat: 7.5 },
    // "Malkenu" on measures 7-8
    { text: "mal", absoluteBeat: 18 },
    { text: "ke", absoluteBeat: 19.5 },
    { text: "nu", absoluteBeat: 22 },
  ],
  settings: {
    tempo: 72,
    timeSignature: { numerator: 3, denominator: 4 },
    // No mid-song time signature changes - UI only supports changes at system starts
  },
  releaseDate: "2025-01-15",
};
