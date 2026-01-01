import { SavedSong, Pitch, EditorNote } from "./types";

const BEATS_PER_MEASURE = 4; // For 4/4 time
const MEASURES_PER_SYSTEM = 2;
const BEATS_PER_SYSTEM = BEATS_PER_MEASURE * MEASURES_PER_SYSTEM; // 8

// Convert array of {pitch, duration} to EditorNote array with beat-based positions
function convertToEditorNotes(
  notes: Array<{ pitch: Pitch; duration: number }>,
): EditorNote[] {
  let currentBeat = 0;
  const timestamp = Date.now();
  return notes.map((note, index) => {
    const system = Math.floor(currentBeat / BEATS_PER_SYSTEM);
    const beatInSystem = currentBeat % BEATS_PER_SYSTEM;

    const editorNote: EditorNote = {
      id: `default-${timestamp}-${index}`,
      pitch: note.pitch,
      duration: note.duration,
      beat: beatInSystem,
      system,
    };
    currentBeat += note.duration;
    return editorNote;
  });
}

// Calculate systems needed for a song
function calculateSystemCount(notes: Array<{ duration: number }>): number {
  const totalBeats = notes.reduce((sum, n) => sum + n.duration, 0);
  return Math.ceil(totalBeats / BEATS_PER_SYSTEM);
}

// Dayenu FULL - Section A (measures 1-4) + Section B (measures 5-8)
const dayenuNotes: Array<{ pitch: Pitch; duration: number }> = [
  // === Section A ===
  // M1: E G G G G A G F (all 8ths)
  { pitch: "E4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "A4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "F4", duration: 0.5 },
  // M2: E G G G G A G F (all 8ths)
  { pitch: "E4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "A4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "F4", duration: 0.5 },
  // M3: E G D F E G D F (all 8ths)
  { pitch: "E4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "D4", duration: 0.5 },
  { pitch: "F4", duration: 0.5 },
  { pitch: "E4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "D4", duration: 0.5 },
  { pitch: "F4", duration: 0.5 },
  // M4: E (q), D (q), C (half)
  { pitch: "E4", duration: 1 },
  { pitch: "D4", duration: 1 },
  { pitch: "C4", duration: 2 },

  // === Section B ===
  // M5: E (q), E (q), G (8th), F (dotted q = 1.5)
  { pitch: "E4", duration: 1 },
  { pitch: "E4", duration: 1 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "F4", duration: 1.5 },
  // M6: F (q), F (q), A (8th), G (dotted q = 1.5)
  { pitch: "F4", duration: 1 },
  { pitch: "F4", duration: 1 },
  { pitch: "A4", duration: 0.5 },
  { pitch: "G4", duration: 1.5 },
  // M7: G (q), G (q), C5 (8th), B (q), B (8th)
  { pitch: "G4", duration: 1 },
  { pitch: "G4", duration: 1 },
  { pitch: "C5", duration: 0.5 },
  { pitch: "B4", duration: 1 },
  { pitch: "B4", duration: 0.5 },
  // M8: B (8th), G (8th), A (8th), B (8th), C5 (half)
  { pitch: "B4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  { pitch: "A4", duration: 0.5 },
  { pitch: "B4", duration: 0.5 },
  { pitch: "C5", duration: 2 },
];

// Mashiach Now verse (4 measures)
const mashiachNowNotes: Array<{ pitch: Pitch; duration: number }> = [
  // M1: D D D E (8ths) - 2 beats, then rest for 2 beats
  { pitch: "D4", duration: 0.5 },
  { pitch: "D4", duration: 0.5 },
  { pitch: "D4", duration: 0.5 },
  { pitch: "E4", duration: 0.5 },
  // M2: F F F G (8ths)
  { pitch: "F4", duration: 0.5 },
  { pitch: "F4", duration: 0.5 },
  { pitch: "F4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  // M3: A A A G (8ths)
  { pitch: "A4", duration: 0.5 },
  { pitch: "A4", duration: 0.5 },
  { pitch: "A4", duration: 0.5 },
  { pitch: "G4", duration: 0.5 },
  // M4: F E D(half)
  { pitch: "F4", duration: 0.5 },
  { pitch: "E4", duration: 0.5 },
  { pitch: "D4", duration: 2 },
];

// Generate default songs with fresh IDs
export function getDefaultSongs(): Record<string, SavedSong> {
  const now = Date.now();

  const dayenu: SavedSong = {
    id: "default-dayenu",
    name: "Dayenu (דיינו)",
    createdAt: now,
    updatedAt: now,
    composition: {
      notes: convertToEditorNotes(dayenuNotes),
      repeatMarkers: [],
      systemCount: calculateSystemCount(dayenuNotes),
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
      notes: convertToEditorNotes(mashiachNowNotes),
      repeatMarkers: [],
      systemCount: calculateSystemCount(mashiachNowNotes),
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
