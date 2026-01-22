import { SavedSong, EditorNote, RepeatMarker, LyricSyllable } from "./types";

// Mashiach Now notes (absoluteBeat format)
// Full song: Verse (measures 1-2) + Chorus (measures 3-5) + Ending (measures 6-7)
// Chorus+Ending can repeat with repeat markers
const mashiachNowNotes: EditorNote[] = [
  // === VERSE (Measures 1-2, beats 0-7) ===
  // M1: D D D E F F F G (all eighths)
  { id: "mashiach-0", pitch: "D4", duration: 0.5, absoluteBeat: 0 },
  { id: "mashiach-1", pitch: "D4", duration: 0.5, absoluteBeat: 0.5 },
  { id: "mashiach-2", pitch: "D4", duration: 0.5, absoluteBeat: 1 },
  { id: "mashiach-3", pitch: "E4", duration: 0.5, absoluteBeat: 1.5 },
  { id: "mashiach-4", pitch: "F4", duration: 0.5, absoluteBeat: 2 },
  { id: "mashiach-5", pitch: "F4", duration: 0.5, absoluteBeat: 2.5 },
  { id: "mashiach-6", pitch: "F4", duration: 0.5, absoluteBeat: 3 },
  { id: "mashiach-7", pitch: "G4", duration: 0.5, absoluteBeat: 3.5 },
  // M2: A A A G F E D(half)
  { id: "mashiach-8", pitch: "A4", duration: 0.5, absoluteBeat: 4 },
  { id: "mashiach-9", pitch: "A4", duration: 0.5, absoluteBeat: 4.5 },
  { id: "mashiach-10", pitch: "A4", duration: 0.5, absoluteBeat: 5 },
  { id: "mashiach-11", pitch: "G4", duration: 0.5, absoluteBeat: 5.5 },
  { id: "mashiach-12", pitch: "F4", duration: 0.5, absoluteBeat: 6 },
  { id: "mashiach-13", pitch: "E4", duration: 0.5, absoluteBeat: 6.5 },
  { id: "mashiach-14", pitch: "D4", duration: 1, absoluteBeat: 7 },

  // === CHORUS (Measures 3-5, beats 8-19) ===
  // M3: "We want Ma-shi-ach now" - G(q) G(q) E(8) G(8) E(8) G(8)
  { id: "mashiach-15", pitch: "G4", duration: 1, absoluteBeat: 8 },
  { id: "mashiach-16", pitch: "G4", duration: 1, absoluteBeat: 9 },
  { id: "mashiach-17", pitch: "E4", duration: 0.5, absoluteBeat: 10 },
  { id: "mashiach-18", pitch: "G4", duration: 0.5, absoluteBeat: 10.5 },
  { id: "mashiach-19", pitch: "E4", duration: 0.5, absoluteBeat: 11 },
  { id: "mashiach-20", pitch: "G4", duration: 0.5, absoluteBeat: 11.5 },
  // M4: "We want Mo-shi-ach now" - F(q) F(q) F(8) D(8) F(8) D(8)
  { id: "mashiach-21", pitch: "F4", duration: 1, absoluteBeat: 12 },
  { id: "mashiach-22", pitch: "F4", duration: 1, absoluteBeat: 13 },
  { id: "mashiach-23", pitch: "F4", duration: 0.5, absoluteBeat: 14 },
  { id: "mashiach-24", pitch: "D4", duration: 0.5, absoluteBeat: 14.5 },
  { id: "mashiach-25", pitch: "F4", duration: 0.5, absoluteBeat: 15 },
  { id: "mashiach-26", pitch: "D4", duration: 0.5, absoluteBeat: 15.5 },
  // M5: "We don't want to wait" - G(q) G(q) F(8) D(8) F(8) D(8)
  { id: "mashiach-27", pitch: "G4", duration: 1, absoluteBeat: 16 },
  { id: "mashiach-28", pitch: "G4", duration: 1, absoluteBeat: 17 },
  { id: "mashiach-29", pitch: "F4", duration: 0.5, absoluteBeat: 18 },
  { id: "mashiach-30", pitch: "D4", duration: 0.5, absoluteBeat: 18.5 },
  { id: "mashiach-31", pitch: "F4", duration: 0.5, absoluteBeat: 19 },
  { id: "mashiach-32", pitch: "D4", duration: 0.5, absoluteBeat: 19.5 },

  // === ENDING (Measures 6-7, beats 20-27) ===
  // M6: A(q) G(q) F(q) G(q)
  { id: "mashiach-33", pitch: "A4", duration: 1, absoluteBeat: 20 },
  { id: "mashiach-34", pitch: "G4", duration: 1, absoluteBeat: 21 },
  { id: "mashiach-35", pitch: "F4", duration: 1, absoluteBeat: 22 },
  { id: "mashiach-36", pitch: "G4", duration: 1, absoluteBeat: 23 },
  // M7: A(whole)
  { id: "mashiach-37", pitch: "A4", duration: 4, absoluteBeat: 24 },
];

// Dayenu notes (absoluteBeat format) - Full song with Section A and Section B
// With 2 measures/system and 4/4 time: BEATS_PER_SYSTEM = 8
// System 0: absoluteBeats 0-7 | System 1: absoluteBeats 8-15
// System 2: absoluteBeats 16-23 | System 3: absoluteBeats 24-31
const dayenuNotes: EditorNote[] = [
  // Measures 1-2 (Section A) - absoluteBeats 0-7
  { id: "dayenu-0", pitch: "E4", duration: 0.5, absoluteBeat: 0 },
  { id: "dayenu-1", pitch: "G4", duration: 0.5, absoluteBeat: 0.5 },
  { id: "dayenu-2", pitch: "G4", duration: 0.5, absoluteBeat: 1 },
  { id: "dayenu-3", pitch: "G4", duration: 0.5, absoluteBeat: 1.5 },
  { id: "dayenu-4", pitch: "G4", duration: 0.5, absoluteBeat: 2 },
  { id: "dayenu-5", pitch: "A4", duration: 0.5, absoluteBeat: 2.5 },
  { id: "dayenu-6", pitch: "G4", duration: 0.5, absoluteBeat: 3 },
  { id: "dayenu-7", pitch: "F4", duration: 0.5, absoluteBeat: 3.5 },
  { id: "dayenu-8", pitch: "E4", duration: 0.5, absoluteBeat: 4 },
  { id: "dayenu-9", pitch: "G4", duration: 0.5, absoluteBeat: 4.5 },
  { id: "dayenu-10", pitch: "G4", duration: 0.5, absoluteBeat: 5 },
  { id: "dayenu-11", pitch: "G4", duration: 0.5, absoluteBeat: 5.5 },
  { id: "dayenu-12", pitch: "G4", duration: 0.5, absoluteBeat: 6 },
  { id: "dayenu-13", pitch: "A4", duration: 0.5, absoluteBeat: 6.5 },
  { id: "dayenu-14", pitch: "G4", duration: 0.5, absoluteBeat: 7 },
  { id: "dayenu-15", pitch: "F4", duration: 0.5, absoluteBeat: 7.5 },
  // Measures 3-4 (Section A continued) - absoluteBeats 8-15
  { id: "dayenu-16", pitch: "E4", duration: 0.5, absoluteBeat: 8 },
  { id: "dayenu-17", pitch: "G4", duration: 0.5, absoluteBeat: 8.5 },
  { id: "dayenu-18", pitch: "D4", duration: 0.5, absoluteBeat: 9 },
  { id: "dayenu-19", pitch: "F4", duration: 0.5, absoluteBeat: 9.5 },
  { id: "dayenu-20", pitch: "E4", duration: 0.5, absoluteBeat: 10 },
  { id: "dayenu-21", pitch: "G4", duration: 0.5, absoluteBeat: 10.5 },
  { id: "dayenu-22", pitch: "D4", duration: 0.5, absoluteBeat: 11 },
  { id: "dayenu-23", pitch: "F4", duration: 0.5, absoluteBeat: 11.5 },
  { id: "dayenu-24", pitch: "E4", duration: 1, absoluteBeat: 12 },
  { id: "dayenu-25", pitch: "D4", duration: 1, absoluteBeat: 13 },
  { id: "dayenu-26", pitch: "C4", duration: 2, absoluteBeat: 14 },
  // Measures 5-6 (Section B - Chorus) - absoluteBeats 16-23
  { id: "dayenu-27", pitch: "E4", duration: 1, absoluteBeat: 16 },
  { id: "dayenu-28", pitch: "E4", duration: 1, absoluteBeat: 17 },
  { id: "dayenu-29", pitch: "G4", duration: 0.5, absoluteBeat: 18 },
  { id: "dayenu-30", pitch: "F4", duration: 1.5, absoluteBeat: 18.5 },
  { id: "dayenu-31", pitch: "F4", duration: 1, absoluteBeat: 20 },
  { id: "dayenu-32", pitch: "F4", duration: 1, absoluteBeat: 21 },
  { id: "dayenu-33", pitch: "A4", duration: 0.5, absoluteBeat: 22 },
  { id: "dayenu-34", pitch: "G4", duration: 1.5, absoluteBeat: 22.5 },
  // Measures 7-8 (Section B continued) - absoluteBeats 24-31
  { id: "dayenu-35", pitch: "G4", duration: 1, absoluteBeat: 24 },
  { id: "dayenu-36", pitch: "G4", duration: 1, absoluteBeat: 25 },
  { id: "dayenu-37", pitch: "C5", duration: 0.5, absoluteBeat: 26 },
  { id: "dayenu-38", pitch: "B4", duration: 1, absoluteBeat: 26.5 },
  { id: "dayenu-39", pitch: "B4", duration: 0.5, absoluteBeat: 27.5 },
  { id: "dayenu-40", pitch: "B4", duration: 0.5, absoluteBeat: 28 },
  { id: "dayenu-41", pitch: "G4", duration: 0.5, absoluteBeat: 28.5 },
  { id: "dayenu-42", pitch: "A4", duration: 0.5, absoluteBeat: 29 },
  { id: "dayenu-43", pitch: "B4", duration: 0.5, absoluteBeat: 29.5 },
  { id: "dayenu-44", pitch: "C5", duration: 2, absoluteBeat: 30 },
];

// Dayenu repeat markers (Section B repeats)
// Section B spans measures 5-8 (1-indexed), which are absoluteBeats 16-31
const dayenuRepeatMarkers: RepeatMarker[] = [
  {
    id: "dayenu-repeat-start",
    pairId: "dayenu-repeat",
    type: "start",
    measureNumber: 4, // Bar line 4 = start of measure 5 (1-indexed)
  },
  {
    id: "dayenu-repeat-end",
    pairId: "dayenu-repeat",
    type: "end",
    measureNumber: 8, // Bar line 8 = end of measure 8 (1-indexed)
  },
];

// Mashiach Now repeat markers (chorus repeats)
const mashiachNowRepeatMarkers: RepeatMarker[] = [
  {
    id: "mashiach-repeat-start",
    pairId: "mashiach-repeat",
    type: "start",
    measureNumber: 2, // Start of chorus (measure 3, 0-indexed = 2)
  },
  {
    id: "mashiach-repeat-end",
    pairId: "mashiach-repeat",
    type: "end",
    measureNumber: 6, // End of measure 7 (0-indexed = 6)
  },
];

// Mashiach Now lyrics (full song - matches the notes above)
const mashiachNowLyrics: LyricSyllable[] = [
  // Verse (measures 1-2)
  { text: "Am", absoluteBeat: 0 },
  { text: "Yis", absoluteBeat: 0.5 },
  { text: "ra", absoluteBeat: 1 },
  { text: "el", absoluteBeat: 1.5 },
  { text: "Have", absoluteBeat: 2 },
  { text: "no", absoluteBeat: 2.5 },
  { text: "fear", absoluteBeat: 3 },
  { text: "Ma-", absoluteBeat: 3.5 },
  { text: "shi", absoluteBeat: 4 },
  { text: "ach", absoluteBeat: 4.5 },
  { text: "will", absoluteBeat: 5 },
  { text: "be", absoluteBeat: 5.5 },
  { text: "here", absoluteBeat: 6 },
  { text: "this", absoluteBeat: 6.5 },
  { text: "year", absoluteBeat: 7 },
  // Chorus (measures 3-5)
  { text: "We", absoluteBeat: 8 },
  { text: "want", absoluteBeat: 9 },
  { text: "Ma", absoluteBeat: 10 },
  { text: "shi", absoluteBeat: 10.5 },
  { text: "ach", absoluteBeat: 11 },
  { text: "now", absoluteBeat: 11.5 },
  { text: "We", absoluteBeat: 12 },
  { text: "want", absoluteBeat: 13 },
  { text: "Mo", absoluteBeat: 14 },
  { text: "shi", absoluteBeat: 14.5 },
  { text: "ach", absoluteBeat: 15 },
  { text: "now", absoluteBeat: 15.5 },
  { text: "We", absoluteBeat: 16 },
  { text: "don't", absoluteBeat: 17 },
  { text: "want", absoluteBeat: 18 },
  { text: "to", absoluteBeat: 18.5 },
  { text: "wait", absoluteBeat: 19 },
];

// Dayenu lyrics (matches the notes above)
const dayenuLyrics: LyricSyllable[] = [
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
];

// Generate default songs
export function getDefaultSongs(): Record<string, SavedSong> {
  const now = Date.now();

  const dayenu: SavedSong = {
    id: "default-dayenu",
    name: "Dayenu (דיינו)",
    createdAt: now,
    updatedAt: now,
    composition: {
      notes: dayenuNotes,
      repeatMarkers: dayenuRepeatMarkers,
      lyrics: dayenuLyrics,
    },
    settings: {
      tempo: 92,
      timeSignature: { numerator: 4, denominator: 4 },
    },
  };

  const mashiachNow: SavedSong = {
    id: "default-mashiach",
    name: "Mashiach Now (משיח נאו)",
    createdAt: now - 1000,
    updatedAt: now - 1000,
    composition: {
      notes: mashiachNowNotes,
      repeatMarkers: mashiachNowRepeatMarkers,
      lyrics: mashiachNowLyrics,
    },
    settings: {
      tempo: 100,
      timeSignature: { numerator: 4, denominator: 4 },
    },
  };

  return {
    [dayenu.id]: dayenu,
    [mashiachNow.id]: mashiachNow,
  };
}

// Default song IDs for checking if defaults exist
export const DEFAULT_SONG_IDS = ["default-dayenu", "default-mashiach"];
