import { Song, Note, Duration, Pitch } from "../types";
import { DURATIONS } from "../constants";

const { EIGHTH: E8, QUARTER: Q, HALF: H } = DURATIONS;

// Helper to create a note
function n(pitch: Pitch, duration: Duration, lyric?: string): Note {
  return { pitch, duration, lyric };
}

// Verse
const verse: Note[] = [
  // M1: D D D E (8ths) - "Am Yis-ra-el"
  n("D4", E8, "Am"),
  n("D4", E8, "Yis"),
  n("D4", E8, "ra"),
  n("E4", E8, "el"),
  // M2: F F F G (8ths) - "Have no fear Ma-"
  n("F4", E8, "Have"),
  n("F4", E8, "no"),
  n("F4", E8, "fear"),
  n("G4", E8, "Ma-"),
  // M3: A A A G (8ths) - "shi-ach will be"
  n("A4", E8, "shi"),
  n("A4", E8, "ach"),
  n("A4", E8, "will"),
  n("G4", E8, "be"),
  // M4: F E D(half) - "here this year"
  n("F4", E8, "here"),
  n("E4", E8, "this"),
  n("D4", H, "year"),
];

// Chorus (one repetition)
const chorusOnce: Note[] = [
  // G G E-G E-G (quarter, quarter, 8th-8th, 8th-8th) - "We want Ma-shi-ach no-w"
  n("G4", Q, "We"),
  n("G4", Q, "want"),
  n("E4", E8, "Ma"),
  n("G4", E8, "shi"),
  n("E4", E8, "ach"),
  n("G4", E8, "now"),
  // F F F-D F-D - "We want Mo-shi-ach no-w"
  n("F4", Q, "We"),
  n("F4", Q, "want"),
  n("F4", E8, "Mo"),
  n("D4", E8, "shi"),
  n("F4", E8, "ach"),
  n("D4", E8, "now"),
  // G G F-D F-D - "We don't want to wait"
  n("G4", Q, "We"),
  n("G4", Q, "don't"),
  n("F4", E8, "want"),
  n("D4", E8, "to"),
  n("F4", E8, "wait"),
  n("D4", E8, ""),
];

// Ending 1: A G F G | A(whole)
const ending1: Note[] = [
  n("A4", Q, ""),
  n("G4", Q, ""),
  n("F4", Q, ""),
  n("G4", Q, ""),
  n("A4", 4, ""),
];

// Ending 2: A G F E | D(whole)
const ending2: Note[] = [
  n("A4", Q, ""),
  n("G4", Q, ""),
  n("F4", Q, ""),
  n("E4", Q, ""),
  n("D4", 4, ""),
];

// Full chorus (3 repetitions with endings)
const fullChorus: Note[] = [
  ...chorusOnce,
  ...ending1,
  ...chorusOnce,
  ...ending1,
  ...chorusOnce,
  ...ending2,
];

export const mashiachNow: Song = {
  id: "mashiach-now",
  title: "Mashiach Now",
  hebrewTitle: "משיח נאו",
  tempo: 100,
  beatsPerMeasure: 4,
  notes: [...verse, ...fullChorus],
};

// Export individual sections
export const mashiachNowSections = {
  VERSE: {
    ...mashiachNow,
    id: "mashiach-verse",
    title: "Mashiach Now (Verse)",
    notes: verse,
  },
  CHORUS: {
    ...mashiachNow,
    id: "mashiach-chorus",
    title: "Mashiach Now (Chorus)",
    notes: fullChorus,
  },
  FULL: mashiachNow,
};
