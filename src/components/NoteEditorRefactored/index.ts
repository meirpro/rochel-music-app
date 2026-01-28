// src/components/NoteEditorRefactored/index.ts
// Re-exports for the NoteEditorRefactored module

// Main component
export { NoteEditorRefactored } from "./NoteEditorRefactored";

// Types
export type {
  EditorNote,
  BeamGroup,
  RepeatMarker,
  NoteTool,
  NoteEditorProps,
} from "./types";

// Time signature utilities
export type { TimeSignature } from "./utils/timeSigConfig";
export {
  TIME_SIG_NUMERATORS,
  TIME_SIG_DENOMINATORS,
  TIME_SIG_CONFIG,
  getTimeSigKey,
  getLayoutConfig,
} from "./utils/timeSigConfig";

// System layout utilities
export {
  calculateSystemLayouts,
  getLayoutForSystem,
  findBestSystemForX,
  getSystemForAbsoluteBeat,
  getMeasureAtBeat,
  getBeatXInSystem,
  getBeatFromXInSystem,
} from "./utils/systemLayout";
export type {
  SystemLayout,
  MeasureInfo,
  RepeatMarkerForLayout,
} from "./utils/systemLayout";

// Pitch utilities
export {
  NOTE_BASE_POSITIONS,
  PITCH_POSITIONS,
  POSITION_TO_PITCH,
  getPitchPosition,
  getSystemFromY,
  getPitchFromY,
  parsePitch,
  buildPitch,
  changeOctave,
  getYFromPitch,
} from "./utils/pitchUtils";

// Beat utilities
export {
  getXFromBeat,
  getBeatFromX,
  snapX,
  getMeasureFromX,
} from "./utils/beatUtils";

// Duration utilities
export { getNoteLabel, getDurationFromTool } from "./utils/durationUtils";

// Beaming utilities
export { groupEighthNotes, createBeamGroup } from "./utils/beamingUtils";

// Subcomponents
export { MenuNoteIcon } from "./components/MenuNoteIcon";
