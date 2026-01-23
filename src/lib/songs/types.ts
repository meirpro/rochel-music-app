// Song data types for individual song files
import { EditorNote, RepeatMarker, LyricSyllable } from "../types";

export interface SongData {
  id: string;
  name: string;
  notes: EditorNote[];
  repeatMarkers: RepeatMarker[];
  lyrics: LyricSyllable[];
  settings: {
    tempo: number;
    timeSignature: { numerator: number; denominator: number };
  };
}
