import { SavedSong, EditorNote, RepeatMarker } from "./types";

// Mashiach Now notes (absoluteBeat format)
// System 0 had beats 0-7, which become absoluteBeats 0-7
const mashiachNowNotes: EditorNote[] = [
  { id: "mashiach-0", pitch: "D4", duration: 0.5, absoluteBeat: 0 },
  { id: "mashiach-1", pitch: "D4", duration: 0.5, absoluteBeat: 0.5 },
  { id: "mashiach-2", pitch: "D4", duration: 0.5, absoluteBeat: 1 },
  { id: "mashiach-3", pitch: "E4", duration: 0.5, absoluteBeat: 1.5 },
  { id: "mashiach-4", pitch: "F4", duration: 0.5, absoluteBeat: 2 },
  { id: "mashiach-5", pitch: "F4", duration: 0.5, absoluteBeat: 2.5 },
  { id: "mashiach-6", pitch: "F4", duration: 0.5, absoluteBeat: 3 },
  { id: "mashiach-7", pitch: "G4", duration: 0.5, absoluteBeat: 3.5 },
  { id: "mashiach-8", pitch: "A4", duration: 0.5, absoluteBeat: 4 },
  { id: "mashiach-9", pitch: "A4", duration: 0.5, absoluteBeat: 4.5 },
  { id: "mashiach-10", pitch: "A4", duration: 0.5, absoluteBeat: 5 },
  { id: "mashiach-11", pitch: "G4", duration: 0.5, absoluteBeat: 5.5 },
  { id: "mashiach-12", pitch: "F4", duration: 0.5, absoluteBeat: 6 },
  { id: "mashiach-13", pitch: "E4", duration: 0.5, absoluteBeat: 6.5 },
  { id: "mashiach-14", pitch: "D4", duration: 2, absoluteBeat: 7 },
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
// Section B spans measures 4-7 (0-indexed), which are absoluteBeats 16-31
const dayenuRepeatMarkers: RepeatMarker[] = [
  {
    id: "dayenu-repeat-start",
    pairId: "dayenu-repeat",
    type: "start",
    measureNumber: 4, // Start of measure 5 (1-indexed)
  },
  {
    id: "dayenu-repeat-end",
    pairId: "dayenu-repeat",
    type: "end",
    measureNumber: 7, // End of measure 8 (1-indexed)
  },
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
      repeatMarkers: [],
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
