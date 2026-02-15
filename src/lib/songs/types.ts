// Song data types for individual song files
import {
  EditorNote,
  RepeatMarker,
  LyricSyllable,
  TimeSignatureChange,
  VoltaBracket,
} from "../types";

export interface TranscriptionNotes {
  original: {
    key: string;
    timeSignature: string;
    features: string[];
  };
  changes: Array<{
    what: string;
    why: string;
  }>;
  // Single source URL (backwards compatible)
  sourceUrl?: string;
  // Multiple source URLs (for songs with separate sheet music and lyrics sources)
  sources?: {
    sheetMusic?: string;
    lyrics?: string;
  };
  transcribedDate: string;
}

export interface SongData {
  id: string;
  name: string;
  hebrewName?: string;
  description?: string;
  notes: EditorNote[];
  repeatMarkers: RepeatMarker[];
  voltaBrackets?: VoltaBracket[]; // Optional volta brackets for 1st/2nd endings
  lyrics: LyricSyllable[];
  settings: {
    tempo: number;
    timeSignature: { numerator: number; denominator: number };
    timeSignatureChanges?: TimeSignatureChange[]; // Mid-song time signature changes
    staffLines?: number; // Number of staff lines to display (default: 3)
  };
  releaseDate: string; // ISO date string (YYYY-MM-DD) when song was added to the app
  transcriptionNotes?: TranscriptionNotes; // Documentation for transcribed songs
  category?: "experimental"; // Omit for finished songs; "experimental" = work-in-progress
}
