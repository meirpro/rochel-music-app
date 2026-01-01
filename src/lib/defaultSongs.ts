import { SavedSong, EditorNote, RepeatMarker } from "./types";

// Mashiach Now notes (beat-based format)
const mashiachNowNotes: EditorNote[] = [
  { id: "mashiach-0", pitch: "D4", duration: 0.5, beat: 0, system: 0 },
  { id: "mashiach-1", pitch: "D4", duration: 0.5, beat: 0.5, system: 0 },
  { id: "mashiach-2", pitch: "D4", duration: 0.5, beat: 1, system: 0 },
  { id: "mashiach-3", pitch: "E4", duration: 0.5, beat: 1.5, system: 0 },
  { id: "mashiach-4", pitch: "F4", duration: 0.5, beat: 2, system: 0 },
  { id: "mashiach-5", pitch: "F4", duration: 0.5, beat: 2.5, system: 0 },
  { id: "mashiach-6", pitch: "F4", duration: 0.5, beat: 3, system: 0 },
  { id: "mashiach-7", pitch: "G4", duration: 0.5, beat: 3.5, system: 0 },
  { id: "mashiach-8", pitch: "A4", duration: 0.5, beat: 4, system: 0 },
  { id: "mashiach-9", pitch: "A4", duration: 0.5, beat: 4.5, system: 0 },
  { id: "mashiach-10", pitch: "A4", duration: 0.5, beat: 5, system: 0 },
  { id: "mashiach-11", pitch: "G4", duration: 0.5, beat: 5.5, system: 0 },
  { id: "mashiach-12", pitch: "F4", duration: 0.5, beat: 6, system: 0 },
  { id: "mashiach-13", pitch: "E4", duration: 0.5, beat: 6.5, system: 0 },
  { id: "mashiach-14", pitch: "D4", duration: 2, beat: 7, system: 0 },
];

// Dayenu notes (beat-based format) - Full song with Section A and Section B
const dayenuNotes: EditorNote[] = [
  // System 0: M1-M2 (Section A)
  { id: "dayenu-0", pitch: "E4", duration: 0.5, beat: 0, system: 0 },
  { id: "dayenu-1", pitch: "G4", duration: 0.5, beat: 0.5, system: 0 },
  { id: "dayenu-2", pitch: "G4", duration: 0.5, beat: 1, system: 0 },
  { id: "dayenu-3", pitch: "G4", duration: 0.5, beat: 1.5, system: 0 },
  { id: "dayenu-4", pitch: "G4", duration: 0.5, beat: 2, system: 0 },
  { id: "dayenu-5", pitch: "A4", duration: 0.5, beat: 2.5, system: 0 },
  { id: "dayenu-6", pitch: "G4", duration: 0.5, beat: 3, system: 0 },
  { id: "dayenu-7", pitch: "F4", duration: 0.5, beat: 3.5, system: 0 },
  { id: "dayenu-8", pitch: "E4", duration: 0.5, beat: 4, system: 0 },
  { id: "dayenu-9", pitch: "G4", duration: 0.5, beat: 4.5, system: 0 },
  { id: "dayenu-10", pitch: "G4", duration: 0.5, beat: 5, system: 0 },
  { id: "dayenu-11", pitch: "G4", duration: 0.5, beat: 5.5, system: 0 },
  { id: "dayenu-12", pitch: "G4", duration: 0.5, beat: 6, system: 0 },
  { id: "dayenu-13", pitch: "A4", duration: 0.5, beat: 6.5, system: 0 },
  { id: "dayenu-14", pitch: "G4", duration: 0.5, beat: 7, system: 0 },
  { id: "dayenu-15", pitch: "F4", duration: 0.5, beat: 7.5, system: 0 },
  // System 1: M3-M4 (Section A continued)
  { id: "dayenu-16", pitch: "E4", duration: 0.5, beat: 0, system: 1 },
  { id: "dayenu-17", pitch: "G4", duration: 0.5, beat: 0.5, system: 1 },
  { id: "dayenu-18", pitch: "D4", duration: 0.5, beat: 1, system: 1 },
  { id: "dayenu-19", pitch: "F4", duration: 0.5, beat: 1.5, system: 1 },
  { id: "dayenu-20", pitch: "E4", duration: 0.5, beat: 2, system: 1 },
  { id: "dayenu-21", pitch: "G4", duration: 0.5, beat: 2.5, system: 1 },
  { id: "dayenu-22", pitch: "D4", duration: 0.5, beat: 3, system: 1 },
  { id: "dayenu-23", pitch: "F4", duration: 0.5, beat: 3.5, system: 1 },
  { id: "dayenu-24", pitch: "E4", duration: 1, beat: 4, system: 1 },
  { id: "dayenu-25", pitch: "D4", duration: 1, beat: 5, system: 1 },
  { id: "dayenu-26", pitch: "C4", duration: 2, beat: 6, system: 1 },
  // System 2: M5-M6 (Section B - Chorus)
  { id: "dayenu-27", pitch: "E4", duration: 1, beat: 0, system: 2 },
  { id: "dayenu-28", pitch: "E4", duration: 1, beat: 1, system: 2 },
  { id: "dayenu-29", pitch: "G4", duration: 0.5, beat: 2, system: 2 },
  { id: "dayenu-30", pitch: "F4", duration: 1.5, beat: 2.5, system: 2 },
  { id: "dayenu-31", pitch: "F4", duration: 1, beat: 4, system: 2 },
  { id: "dayenu-32", pitch: "F4", duration: 1, beat: 5, system: 2 },
  { id: "dayenu-33", pitch: "A4", duration: 0.5, beat: 6, system: 2 },
  { id: "dayenu-34", pitch: "G4", duration: 1.5, beat: 6.5, system: 2 },
  // System 3: M7-M8 (Section B continued)
  { id: "dayenu-35", pitch: "G4", duration: 1, beat: 0, system: 3 },
  { id: "dayenu-36", pitch: "G4", duration: 1, beat: 1, system: 3 },
  { id: "dayenu-37", pitch: "C5", duration: 0.5, beat: 2, system: 3 },
  { id: "dayenu-38", pitch: "B4", duration: 1, beat: 2.5, system: 3 },
  { id: "dayenu-39", pitch: "B4", duration: 0.5, beat: 3.5, system: 3 },
  { id: "dayenu-40", pitch: "B4", duration: 0.5, beat: 4, system: 3 },
  { id: "dayenu-41", pitch: "G4", duration: 0.5, beat: 4.5, system: 3 },
  { id: "dayenu-42", pitch: "A4", duration: 0.5, beat: 5, system: 3 },
  { id: "dayenu-43", pitch: "B4", duration: 0.5, beat: 5.5, system: 3 },
  { id: "dayenu-44", pitch: "C5", duration: 2, beat: 6, system: 3 },
];

// Dayenu repeat markers (Section B repeats)
const dayenuRepeatMarkers: RepeatMarker[] = [
  {
    id: "dayenu-repeat-start",
    pairId: "dayenu-repeat",
    type: "start",
    measure: 0,
    system: 2,
  },
  {
    id: "dayenu-repeat-end",
    pairId: "dayenu-repeat",
    type: "end",
    measure: 2,
    system: 3,
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
      systemCount: 4,
    },
    settings: {
      tempo: 92,
      timeSignature: "4/4",
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
      systemCount: 2,
    },
    settings: {
      tempo: 100,
      timeSignature: "4/4",
    },
  };

  return {
    [dayenu.id]: dayenu,
    [mashiachNow.id]: mashiachNow,
  };
}

// Default song IDs for checking if defaults exist
export const DEFAULT_SONG_IDS = ["default-dayenu", "default-mashiach"];
