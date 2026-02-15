// Pitch names for musical notation
// Extended range from C3 to C6 with both sharps and flats
export type Pitch =
  // Octave 3
  | "C3"
  | "C#3"
  | "Db3"
  | "D3"
  | "D#3"
  | "Eb3"
  | "E3"
  | "F3"
  | "F#3"
  | "Gb3"
  | "G3"
  | "G#3"
  | "Ab3"
  | "A3"
  | "A#3"
  | "Bb3"
  | "B3"
  // Octave 4
  | "C4"
  | "C#4"
  | "Db4"
  | "D4"
  | "D#4"
  | "Eb4"
  | "E4"
  | "F4"
  | "F#4"
  | "Gb4"
  | "G4"
  | "G#4"
  | "Ab4"
  | "A4"
  | "A#4"
  | "Bb4"
  | "B4"
  // Octave 5
  | "C5"
  | "C#5"
  | "Db5"
  | "D5"
  | "D#5"
  | "Eb5"
  | "E5"
  | "F5"
  | "F#5"
  | "Gb5"
  | "G5"
  | "G#5"
  | "Ab5"
  | "A5"
  | "A#5"
  | "Bb5"
  | "B5"
  // Octave 6
  | "C6"
  | "REST";

// Note durations in beats
// 0.25 = sixteenth, 0.5 = eighth, 0.75 = dotted eighth
// 1 = quarter, 1.5 = dotted quarter, 2 = half, 3 = dotted half, 4 = whole
export type Duration = 0.25 | 0.5 | 0.75 | 1 | 1.5 | 2 | 3 | 4;

// A single note in a song
export interface Note {
  pitch: Pitch;
  duration: Duration;
  lyric?: string;
}

// Repeat section definition
export interface RepeatSection {
  startMeasure: number; // 0-indexed measure where repeat starts
  endMeasure: number; // 0-indexed measure where repeat ends (inclusive)
  times: number; // Total times to play (2 = play twice)
}

// Song definition
export interface Song {
  id: string;
  title: string;
  hebrewTitle?: string;
  tempo: number;
  beatsPerMeasure: number;
  notes: Note[];
  repeats?: RepeatSection[]; // Optional repeat sections
}

// Note position info for rendering
export interface NotePosition {
  pitch: Pitch;
  staffPosition: number; // 0-7, where 0=C4 ledger, 2=E4 bottom line, etc.
  midi: number;
  name: string; // Display name (C, D, E, etc.)
}

// Rendered note with layout info
export interface RenderedNote extends Note {
  x: number;
  y: number;
  staffPosition: number;
  midi: number;
  displayName: string;
  index: number;
  systemIndex: number; // Which line/system this note is on
  beatPosition: number; // Beat position from start of song
  pxPerBeat: number; // Pixels per beat for duration visualization
}

// Repeat barline type
export type RepeatBarType = "start" | "end" | "both" | "none";

// System (line) info for multi-line layout
export interface SystemInfo {
  bars: number[];
  barTypes: RepeatBarType[]; // Type of each barline (for repeat signs)
  systemTop: number;
  measuresInSystem: number;
  pxPerBeat: number;
  startMeasureIndex: number; // Global measure index where this system starts
}

// Layout result from calculating note positions
export interface LayoutResult {
  notes: RenderedNote[];
  systems: SystemInfo[];
  totalBeats: number;
  beatsPerMeasure: number;
  totalMeasures: number;
  measuresPerSystem: number;
  canvasHeight: number;
  repeats?: RepeatSection[]; // Repeat sections for playback
}

// Playback state
export interface PlaybackState {
  isPlaying: boolean;
  currentNoteIndex: number;
  tempo: number;
}

// Time signature type (also exported from NoteEditor)
export interface TimeSignature {
  numerator: number; // Top number (beats per measure)
  denominator: number; // Bottom number (note value)
}

// Legacy editor note format (for backward compatibility during migration)
export interface LegacyEditorNote {
  id: string;
  pitch: Pitch;
  duration: number;
  beat: number; // Position within system
  system: number; // Which system/row (LEGACY - being phased out)
}

// New editor note type using absolute beat positioning
export interface EditorNote {
  id: string;
  pitch: Pitch;
  duration: number; // 0.5, 1, 2, or 4 beats
  absoluteBeat: number; // Position from composition start (0, 0.5, 1, 2, 2.5...)
}

// Legacy repeat marker format (for backward compatibility)
export interface LegacyRepeatMarker {
  id: string;
  pairId: string;
  type: "start" | "end";
  measure: number; // Measure within system
  system: number; // Which system
}

// New repeat marker using absolute measure numbering
export interface RepeatMarker {
  id: string;
  pairId: string; // Links start and end markers together
  type: "start" | "end";
  measureNumber: number; // Absolute measure from composition start (0, 1, 2...)
}

// Volta bracket (1st/2nd endings) - links to a repeat section
export interface VoltaBracket {
  id: string;
  repeatPairId: string; // Links to RepeatMarker.pairId this volta belongs to
  startMeasure: number; // Absolute measure where volta begins (0-indexed)
  endMeasure: number; // Absolute measure where volta ends (exclusive)
  voltaNumber: number; // 1, 2, 3, etc. - determines which pass plays these notes
}

// Legacy composition format
export interface LegacyComposition {
  notes: LegacyEditorNote[];
  repeatMarkers: LegacyRepeatMarker[];
  systemCount: number;
}

// Lyric syllable positioned at a specific beat
export interface LyricSyllable {
  text: string; // The syllable text (supports Hebrew/English)
  absoluteBeat: number; // Beat position (0, 0.5, 1, 1.5, 2...)
}

// Mid-song time signature change
export interface TimeSignatureChange {
  id: string;
  measureNumber: number; // 0-indexed measure where change takes effect
  timeSignature: TimeSignature;
}

// Lyrics container for a composition
export type Lyrics = LyricSyllable[];

// New composition format (no systemCount needed)
export interface Composition {
  notes: EditorNote[];
  repeatMarkers: RepeatMarker[];
  lyrics: Lyrics;
  voltaBrackets?: VoltaBracket[]; // Optional: 1st/2nd endings within repeat sections
}

// Saved song structure for localStorage persistence
export interface SavedSong {
  id: string; // "song-{timestamp}"
  name: string; // User-provided name
  hebrewName?: string; // Hebrew name for display (e.g., "אני פורים")
  description?: string; // Brief description or attribution
  category?: "experimental"; // Omit for finished songs; "experimental" = work-in-progress
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  composition: Composition | LegacyComposition; // Support both formats during migration
  settings: {
    tempo: number;
    timeSignature: TimeSignature;
    timeSignatureChanges?: TimeSignatureChange[]; // Mid-song time signature changes
    staffLines?: number; // Number of staff lines to display (default: 3)
  };
}

// Map of song ID to SavedSong for localStorage
export type SavedSongsMap = Record<string, SavedSong>;
