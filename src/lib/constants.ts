import { NotePosition, Pitch } from "./types";

// Color coding for notes (C=Red through B=Pink)
export const NOTE_COLORS: Record<string, string> = {
  C: "#ff5a5f", // Red
  D: "#ffb020", // Orange
  E: "#ffe14d", // Yellow
  F: "#4ade80", // Green
  G: "#60a5fa", // Blue
  A: "#a78bfa", // Purple
  B: "#ff77c8", // Pink
};

// Base MIDI note numbers for natural notes (C = 0 in each octave)
const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

// Convert any pitch string to MIDI note number
export function pitchToMidi(pitch: Pitch): number {
  if (pitch === "REST") return 0;

  // Parse pitch: e.g., "Bb4" -> note="B", accidental="b", octave=4
  const match = pitch.match(/^([A-G])(#|b)?(\d)$/);
  if (!match) return 60; // Default to middle C

  const [, note, accidental, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);

  // MIDI note = (octave + 1) * 12 + semitone offset + accidental
  const baseMidi = (octave + 1) * 12 + NOTE_TO_SEMITONE[note];
  const accidentalOffset = accidental === "#" ? 1 : accidental === "b" ? -1 : 0;

  return baseMidi + accidentalOffset;
}

// Legacy object for backwards compatibility (common pitches only)
export const MIDI_NOTES: Partial<Record<Pitch, number>> = {
  C4: 60,
  "C#4": 61,
  D4: 62,
  "D#4": 63,
  E4: 64,
  F4: 65,
  "F#4": 66,
  G4: 67,
  "G#4": 68,
  A4: 69,
  "A#4": 70,
  B4: 71,
  C5: 72,
  REST: 0,
};

// Staff position for each pitch (0 = ledger below, 2 = bottom line E, etc.)
export const NOTE_POSITIONS: NotePosition[] = [
  { pitch: "C4", staffPosition: 0, midi: 60, name: "C" },
  { pitch: "D4", staffPosition: 1, midi: 62, name: "D" },
  { pitch: "E4", staffPosition: 2, midi: 64, name: "E" },
  { pitch: "F4", staffPosition: 3, midi: 65, name: "F" },
  { pitch: "G4", staffPosition: 4, midi: 67, name: "G" },
  { pitch: "A4", staffPosition: 5, midi: 69, name: "A" },
  { pitch: "B4", staffPosition: 6, midi: 71, name: "B" },
  { pitch: "C5", staffPosition: 7, midi: 72, name: "C" },
];

// Get note info by pitch
export function getNoteInfo(pitch: Pitch): NotePosition {
  const info = NOTE_POSITIONS.find((n) => n.pitch === pitch);
  return info || NOTE_POSITIONS[2]; // Default to E4
}

// Get color for a pitch
export function getNoteColor(pitch: Pitch): string {
  if (pitch === "REST") return "transparent";
  const baseName = pitch.replace(/[0-9]/g, "");
  return NOTE_COLORS[baseName] || "#eaeef6";
}

// Beat shading colors (alternating gray stripes)
export const BEAT_SHADING = {
  light: "#ffffff",
  dark: "#f0f0f0",
};

// Staff configuration
export const STAFF_CONFIG = {
  lines: 3, // 3-line kid staff
  topMargin: 140, // Increased to avoid overlapping subtitle
  lineGap: 32, // Distance between staff lines (increased)
  noteRadius: 14, // Larger notes
  padding: 30,
  leftStart: 100, // Where notes start (after clef and time sig)
  systemGap: 200, // Distance between staff systems (increased for label/lyric spacing)
  targetMeasureWidth: 200, // Target width per measure
  minMeasuresPerSystem: 2,
  maxMeasuresPerSystem: 6,
};

// Theme colors (light mode for kids)
export const THEME = {
  bg: "#ffffff",
  panel: "#f8f9fa",
  ink: "#2d3748",
  muted: "#718096",
  line: "#4a5568",
  staff: "#e2e8f0",
  bar: "#4a5568",
  accent: "#10b981",
};

// Duration constants (in beats)
export const DURATIONS = {
  EIGHTH: 0.5,
  QUARTER: 1,
  DOTTED_QUARTER: 1.5,
  HALF: 2,
  WHOLE: 4,
} as const;

// SMuFL music notation glyphs (Leland font)
// See: https://w3c.github.io/smufl/latest/tables/noteheads.html
export const SMUFL_GLYPHS = {
  // Note heads
  noteheadWhole: "\uE0A2",
  noteheadHalf: "\uE0A3",
  noteheadBlack: "\uE0A4", // Quarter, eighth, etc.

  // Clefs
  gClef: "\uE050", // Treble clef

  // Flags
  flag8thUp: "\uE240",
  flag8thDown: "\uE241",
  flag16thUp: "\uE242",
  flag16thDown: "\uE243",

  // Rests
  restWhole: "\uE4E3",
  restHalf: "\uE4E4",
  restQuarter: "\uE4E5",
  rest8th: "\uE4E6",

  // Accidentals
  sharp: "\uE262",
  flat: "\uE260",
  natural: "\uE261",

  // Barlines
  barlineSingle: "\uE030",
  barlineDouble: "\uE031",
  repeatLeft: "\uE040",
  repeatRight: "\uE041",
} as const;

// Font name for SMuFL glyphs
export const MUSIC_FONT = "Leland Text";
