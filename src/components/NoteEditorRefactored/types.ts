// src/components/NoteEditorRefactored/types.ts
// Extracted from NoteEditor.tsx lines 693-775

import { Pitch, LyricSyllable, TimeSignatureChange } from "@/lib/types";
import { TimeSignature } from "./utils/timeSigConfig";

// Context menu sections that can be shown/hidden for progressive disclosure
export type ContextMenuSection =
  | "duration"
  | "accidental"
  | "changeNote"
  | "octave"
  | "delete";

// Editor-specific note type - uses absoluteBeat for layout-independent positioning
// System/beat can be calculated on-the-fly from absoluteBeat based on current layout
export interface EditorNote {
  id: string;
  pitch: Pitch;
  duration: number; // 0.5, 1, 2, or 4 beats
  absoluteBeat: number; // Position from composition start (0, 0.5, 1, 1.5, etc.)
}

// Rendered note with calculated system/beat positions (for display only)
export interface RenderedNote extends EditorNote {
  system: number; // Calculated from absoluteBeat + layout
  beat: number; // Position within system (calculated)
}

// Beam group for rendering connected eighth notes (uses rendered notes with system/beat)
export interface BeamGroup {
  notes: RenderedNote[];
  stemDirection: "up" | "down";
}

// Repeat sign marker - uses absolute measure numbering (layout-independent)
export interface RepeatMarker {
  id: string;
  pairId: string; // Links start and end markers together
  type: "start" | "end";
  measureNumber: number; // Absolute measure from composition start (0, 1, 2...)
}

// Rendered repeat marker with calculated system position (for display only)
export interface RenderedRepeatMarker extends RepeatMarker {
  system: number; // Calculated from measureNumber + layout
  measure: number; // Position within system (calculated)
}

export type NoteTool =
  | "sixteenth"
  | "eighth"
  | "dotted-eighth"
  | "quarter"
  | "dotted-quarter"
  | "half"
  | "dotted-half"
  | "whole"
  | "delete"
  | "repeat"
  | "lyrics"
  | "timesig"
  | null;

// Song metadata for display at top/bottom of staff
export interface SongMetadata {
  title?: string; // English name
  hebrewName?: string; // Hebrew name (אני פורים)
  description?: string; // Brief description or attribution
}

export interface NoteEditorProps {
  notes: EditorNote[];
  onNotesChange: (notes: EditorNote[]) => void;
  repeatMarkers: RepeatMarker[];
  onRepeatMarkersChange: (markers: RepeatMarker[]) => void;
  lyrics?: LyricSyllable[];
  onLyricsChange?: (lyrics: LyricSyllable[]) => void;
  selectedTool: NoteTool | null;
  showLabels?: boolean;
  showKidFaces?: boolean;
  showGrid?: boolean;
  // Song metadata for title/footer display
  songMetadata?: SongMetadata;
  allowChords?: boolean;
  allowMove?: boolean;
  playheadX?: number | null;
  playheadSystem?: number;
  onPlayheadBeatChange?: (beat: number) => void; // Callback for when playhead is dragged
  activeNoteId?: string | null;
  systemCount: number;
  totalMeasures: number; // Actual total measures in composition
  onSystemCountChange: (count: number) => void;
  onDuplicateNote?: () => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  timeSignature?: TimeSignature;
  onStaffClick?: (x: number, system: number) => void;
  tempo?: number;
  isPlaying?: boolean;
  onPlaybackBlock?: () => void;
  measuresPerRow?: number;
  readOnly?: boolean;
  staffLines?: number; // 2-5, controls number of horizontal staff lines (default 3)
  noteSpacing?: number; // 1.0-2.0 (100%-200%) - beat width multiplier (default 1.0)
  // Time signature changes
  timeSignatureChanges?: TimeSignatureChange[];
  onTimeSignatureChangesChange?: (changes: TimeSignatureChange[]) => void;
  onTimeSignatureClick?: () => void; // Called when initial time sig is clicked

  // Learn mode props for progressive music theory tutorial
  learnMode?: boolean; // Enables learn-specific behaviors (simplified UI, interaction callbacks)
  maxVisibleMeasures?: number; // Limit visible measures for focused learning (overrides totalMeasures for display)
  highlightPitchLine?: string; // Highlight a staff line/space for a pitch (e.g., "C4", "G4")
  highlightBeatRange?: [number, number]; // Highlight beat range [startBeat, endBeat] with colored overlay
  onNoteInteraction?: (
    note: EditorNote,
    action: "click" | "place" | "delete",
  ) => void; // Callback for note interactions in learn mode

  // Context menu visibility for progressive tutorial
  visibleContextMenuSections?: ContextMenuSection[]; // Which sections to show (undefined = all)

  // Context menu action callback for tutorial tracking
  onContextMenuAction?: () => void; // Called when any context menu action is performed
}
