// Pitch names for the kid staff (C4 to C5 range)
// Includes sharps for piano keyboard (not used in kid staff notation)
export type Pitch =
  | "C4"
  | "C#4"
  | "D4"
  | "D#4"
  | "E4"
  | "F4"
  | "F#4"
  | "G4"
  | "G#4"
  | "A4"
  | "A#4"
  | "B4"
  | "C5"
  | "REST";

// Note durations in beats
export type Duration = 0.5 | 1 | 1.5 | 2 | 4;

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

// Lyrics container for a composition
export type Lyrics = LyricSyllable[];

// New composition format (no systemCount needed)
export interface Composition {
  notes: EditorNote[];
  repeatMarkers: RepeatMarker[];
  lyrics: Lyrics;
}

// Saved song structure for localStorage persistence
export interface SavedSong {
  id: string; // "song-{timestamp}"
  name: string; // User-provided name
  createdAt: number; // Unix timestamp
  updatedAt: number; // Unix timestamp
  composition: Composition | LegacyComposition; // Support both formats during migration
  settings: {
    tempo: number;
    timeSignature: TimeSignature;
  };
}

// Map of song ID to SavedSong for localStorage
export type SavedSongsMap = Record<string, SavedSong>;
