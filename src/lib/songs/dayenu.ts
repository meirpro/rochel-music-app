// Dayenu (דיינו) - Passover Song
// Key: C major, Time: 4/4, Tempo: 92
import { SongData } from "./types";

export const dayenu: SongData = {
  id: "default-dayenu",
  name: "Dayenu (דיינו)",
  notes: [
    // === SECTION A (Measures 1-4, beats 0-15) ===
    // M1: E G G G | G A G F (all eighths)
    { id: "dayenu-0", pitch: "E4", duration: 0.5, absoluteBeat: 0 },
    { id: "dayenu-1", pitch: "G4", duration: 0.5, absoluteBeat: 0.5 },
    { id: "dayenu-2", pitch: "G4", duration: 0.5, absoluteBeat: 1 },
    { id: "dayenu-3", pitch: "G4", duration: 0.5, absoluteBeat: 1.5 },
    { id: "dayenu-4", pitch: "G4", duration: 0.5, absoluteBeat: 2 },
    { id: "dayenu-5", pitch: "A4", duration: 0.5, absoluteBeat: 2.5 },
    { id: "dayenu-6", pitch: "G4", duration: 0.5, absoluteBeat: 3 },
    { id: "dayenu-7", pitch: "F4", duration: 0.5, absoluteBeat: 3.5 },
    // M2: E G G G | G A G F (all eighths)
    { id: "dayenu-8", pitch: "E4", duration: 0.5, absoluteBeat: 4 },
    { id: "dayenu-9", pitch: "G4", duration: 0.5, absoluteBeat: 4.5 },
    { id: "dayenu-10", pitch: "G4", duration: 0.5, absoluteBeat: 5 },
    { id: "dayenu-11", pitch: "G4", duration: 0.5, absoluteBeat: 5.5 },
    { id: "dayenu-12", pitch: "G4", duration: 0.5, absoluteBeat: 6 },
    { id: "dayenu-13", pitch: "A4", duration: 0.5, absoluteBeat: 6.5 },
    { id: "dayenu-14", pitch: "G4", duration: 0.5, absoluteBeat: 7 },
    { id: "dayenu-15", pitch: "F4", duration: 0.5, absoluteBeat: 7.5 },
    // M3: E G D F | E G D F (all eighths)
    { id: "dayenu-16", pitch: "E4", duration: 0.5, absoluteBeat: 8 },
    { id: "dayenu-17", pitch: "G4", duration: 0.5, absoluteBeat: 8.5 },
    { id: "dayenu-18", pitch: "D4", duration: 0.5, absoluteBeat: 9 },
    { id: "dayenu-19", pitch: "F4", duration: 0.5, absoluteBeat: 9.5 },
    { id: "dayenu-20", pitch: "E4", duration: 0.5, absoluteBeat: 10 },
    { id: "dayenu-21", pitch: "G4", duration: 0.5, absoluteBeat: 10.5 },
    { id: "dayenu-22", pitch: "D4", duration: 0.5, absoluteBeat: 11 },
    { id: "dayenu-23", pitch: "F4", duration: 0.5, absoluteBeat: 11.5 },
    // M4: E(q) D(q) | C(half)
    { id: "dayenu-24", pitch: "E4", duration: 1, absoluteBeat: 12 },
    { id: "dayenu-25", pitch: "D4", duration: 1, absoluteBeat: 13 },
    { id: "dayenu-26", pitch: "C4", duration: 2, absoluteBeat: 14 },
    // === SECTION B (Measures 5-8, beats 16-31) ===
    // M5: E(q) E(q) | G(8th) F(dotted q)
    { id: "dayenu-27", pitch: "E4", duration: 1, absoluteBeat: 16 },
    { id: "dayenu-28", pitch: "E4", duration: 1, absoluteBeat: 17 },
    { id: "dayenu-29", pitch: "G4", duration: 0.5, absoluteBeat: 18 },
    { id: "dayenu-30", pitch: "F4", duration: 1.5, absoluteBeat: 18.5 },
    // M6: F(q) F(q) | A(8th) G(dotted q)
    { id: "dayenu-31", pitch: "F4", duration: 1, absoluteBeat: 20 },
    { id: "dayenu-32", pitch: "F4", duration: 1, absoluteBeat: 21 },
    { id: "dayenu-33", pitch: "A4", duration: 0.5, absoluteBeat: 22 },
    { id: "dayenu-34", pitch: "G4", duration: 1.5, absoluteBeat: 22.5 },
    // M7: G(q) G(q) | C(8th) B(q) B(8th)
    { id: "dayenu-35", pitch: "G4", duration: 1, absoluteBeat: 24 },
    { id: "dayenu-36", pitch: "G4", duration: 1, absoluteBeat: 25 },
    { id: "dayenu-37", pitch: "C5", duration: 0.5, absoluteBeat: 26 },
    { id: "dayenu-38", pitch: "B4", duration: 1, absoluteBeat: 26.5 },
    { id: "dayenu-39", pitch: "B4", duration: 0.5, absoluteBeat: 27.5 },
    // M8: B(8th) G(8th) A(8th) B(8th) | C(half)
    { id: "dayenu-40", pitch: "B4", duration: 0.5, absoluteBeat: 28 },
    { id: "dayenu-41", pitch: "G4", duration: 0.5, absoluteBeat: 28.5 },
    { id: "dayenu-42", pitch: "A4", duration: 0.5, absoluteBeat: 29 },
    { id: "dayenu-43", pitch: "B4", duration: 0.5, absoluteBeat: 29.5 },
    { id: "dayenu-44", pitch: "C5", duration: 2, absoluteBeat: 30 },
  ],
  repeatMarkers: [
    {
      id: "dayenu-repeat-start",
      pairId: "dayenu-repeat",
      type: "start",
      measureNumber: 4,
    },
    {
      id: "dayenu-repeat-end",
      pairId: "dayenu-repeat",
      type: "end",
      measureNumber: 8,
    },
  ],
  lyrics: [
    // Section A - Measures 1-2
    { text: "I", absoluteBeat: 0 },
    { text: "lu", absoluteBeat: 0.5 },
    { text: "ho", absoluteBeat: 1 },
    { text: "tzi", absoluteBeat: 1.5 },
    { text: "ho", absoluteBeat: 2 },
    { text: "tzi", absoluteBeat: 2.5 },
    { text: "a", absoluteBeat: 3 },
    { text: "nu", absoluteBeat: 3.5 },
    { text: "ho", absoluteBeat: 4 },
    { text: "tzi", absoluteBeat: 4.5 },
    { text: "a", absoluteBeat: 5 },
    { text: "nu", absoluteBeat: 5.5 },
    { text: "mi", absoluteBeat: 6 },
    { text: "mitz", absoluteBeat: 6.5 },
    { text: "ra", absoluteBeat: 7 },
    { text: "im", absoluteBeat: 7.5 },
    // Section A - Measures 3-4
    { text: "ho", absoluteBeat: 8 },
    { text: "tzi", absoluteBeat: 8.5 },
    { text: "a", absoluteBeat: 9 },
    { text: "nu", absoluteBeat: 9.5 },
    { text: "mi", absoluteBeat: 10 },
    { text: "mitz", absoluteBeat: 10.5 },
    { text: "ra", absoluteBeat: 11 },
    { text: "im", absoluteBeat: 11.5 },
    { text: "Dai", absoluteBeat: 12 },
    { text: "e", absoluteBeat: 13 },
    { text: "nu", absoluteBeat: 14 },
    // Section B - Measures 5-6
    { text: "Dai", absoluteBeat: 16 },
    { text: "dai", absoluteBeat: 17 },
    { text: "ein", absoluteBeat: 18 },
    { text: "u", absoluteBeat: 18.5 },
    { text: "Dai", absoluteBeat: 20 },
    { text: "dai", absoluteBeat: 21 },
    { text: "ein", absoluteBeat: 22 },
    { text: "u", absoluteBeat: 22.5 },
    // Section B - Measures 7-8
    { text: "dai", absoluteBeat: 24 },
    { text: "dai", absoluteBeat: 25 },
    { text: "ein", absoluteBeat: 26 },
    { text: "u", absoluteBeat: 26.5 },
    { text: "dai", absoluteBeat: 27.5 },
    { text: "ein", absoluteBeat: 28 },
    { text: "u", absoluteBeat: 28.5 },
    { text: "dai", absoluteBeat: 29 },
    { text: "ei", absoluteBeat: 29.5 },
    { text: "nu", absoluteBeat: 30 },
  ],
  settings: {
    tempo: 92,
    timeSignature: { numerator: 4, denominator: 4 },
  },
};
