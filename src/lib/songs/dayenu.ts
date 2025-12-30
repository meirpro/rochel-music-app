import { Song, Note, Duration, Pitch } from "../types";
import { DURATIONS } from "../constants";

const { EIGHTH: E8, QUARTER: Q, HALF: H, DOTTED_QUARTER: DQ } = DURATIONS;

// Helper to create a note
function n(pitch: Pitch, duration: Duration, lyric?: string): Note {
  return { pitch, duration, lyric };
}

// Section A (measures 1-4)
const sectionA: Note[] = [
  // M1: E G G G G A G F (all 8ths)
  n("E4", E8, "I"),
  n("G4", E8, "lu"),
  n("G4", E8, "ho"),
  n("G4", E8, "tzi"),
  n("G4", E8, "ho"),
  n("A4", E8, "tzi"),
  n("G4", E8, "a"),
  n("F4", E8, "nu"),
  // M2: E G G G G A G F (all 8ths)
  n("E4", E8, "ho"),
  n("G4", E8, "tzi"),
  n("G4", E8, "a"),
  n("G4", E8, "nu"),
  n("G4", E8, "mi"),
  n("A4", E8, "mitz"),
  n("G4", E8, "ra"),
  n("F4", E8, "im"),
  // M3: E G D F E G D F (all 8ths)
  n("E4", E8, "ho"),
  n("G4", E8, "tzi"),
  n("D4", E8, "a"),
  n("F4", E8, "nu"),
  n("E4", E8, "mi"),
  n("G4", E8, "mitz"),
  n("D4", E8, "ra"),
  n("F4", E8, "im"),
  // M4: E (q), D (q), C (half)
  n("E4", Q, "Dai"),
  n("D4", Q, "e"),
  n("C4", H, "nu"),
];

// Section B (measures 5-8)
const sectionB: Note[] = [
  // M5: E (q), E (q), G (8th), F (dotted q)
  n("E4", Q, "Dai"),
  n("E4", Q, "dai"),
  n("G4", E8, "ein"),
  n("F4", DQ, "u"),
  // M6: F (q), F (q), A (8th), G (dotted q)
  n("F4", Q, "Dai"),
  n("F4", Q, "dai"),
  n("A4", E8, "ein"),
  n("G4", DQ, "u"),
  // M7: G (q), G (q), C (8th), B (q), B (8th)
  n("G4", Q, "dai"),
  n("G4", Q, "ein"),
  n("C5", E8, "u"),
  n("B4", Q, "dai"),
  n("B4", E8, "ein"),
  // M8: B (8th), G (8th), A (8th), B (8th), C (half)
  n("B4", E8, "u"),
  n("G4", E8, "dai"),
  n("A4", E8, "ei"),
  n("B4", E8, "nu"),
  n("C5", H, ""),
];

export const dayenu: Song = {
  id: "dayenu",
  title: "Dayenu",
  hebrewTitle: "דיינו",
  tempo: 92,
  beatsPerMeasure: 4,
  notes: [...sectionA, ...sectionB], // Notes without duplication
  repeats: [
    { startMeasure: 4, endMeasure: 7, times: 2 }, // Section B (measures 5-8) repeats
  ],
};

// Export individual sections for section selector
export const dayenuSections = {
  A: {
    ...dayenu,
    id: "dayenu-a",
    title: "Dayenu (Section A)",
    notes: sectionA,
  },
  B: {
    ...dayenu,
    id: "dayenu-b",
    title: "Dayenu (Section B)",
    notes: [...sectionB, ...sectionB],
  },
  FULL: dayenu,
};
