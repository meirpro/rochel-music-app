// Song data types for individual song files
import {
  EditorNote,
  RepeatMarker,
  LyricSyllable,
  TimeSignatureChange,
} from "../types";

export interface SongData {
  id: string;
  name: string;
  hebrewName?: string;
  description?: string;
  notes: EditorNote[];
  repeatMarkers: RepeatMarker[];
  lyrics: LyricSyllable[];
  settings: {
    tempo: number;
    timeSignature: { numerator: number; denominator: number };
    timeSignatureChanges?: TimeSignatureChange[]; // Mid-song time signature changes
  };
}
