/**
 * Coordinate Adapter
 *
 * Bridges between new absoluteBeat format and NoteEditor's legacy system-based format.
 * This adapter allows Phase 2 responsive layout to work without refactoring the entire
 * 1659-line NoteEditor component, which will be done in Phase 3.
 *
 * IMPORTANT: When time signature changes exist, rows can have different total beats.
 * The conversion must account for this by calculating actual beats per row.
 */

import {
  EditorNote as NewEditorNote,
  RepeatMarker as NewRepeatMarker,
  Pitch,
  TimeSignature,
  TimeSignatureChange,
} from "@/lib/types";
import { LayoutConfig } from "@/hooks/useResponsiveLayout";

// Legacy format that NoteEditor currently expects
export interface LegacyEditorNote {
  id: string;
  pitch: Pitch;
  duration: number;
  beat: number; // Position within system
  system: number; // Which row
}

export interface LegacyRepeatMarker {
  id: string;
  pairId: string;
  type: "start" | "end";
  measure: number; // Measure within system
  system: number; // Which row
}

// Time signature config matching NoteEditor's TIME_SIG_CONFIG
const TIME_SIG_BEATS: Record<string, number> = {
  "4/4": 4,
  "3/4": 3,
  "2/4": 2,
  "6/8": 6,
};

function getTimeSigKey(ts: TimeSignature): string {
  return `${ts.numerator}/${ts.denominator}`;
}

function getBeatsForMeasure(
  measureIndex: number,
  baseTimeSig: TimeSignature,
  timeSignatureChanges: TimeSignatureChange[],
): number {
  // Check if there's a time signature change at or before this measure
  let effectiveTimeSig = baseTimeSig;
  for (const change of timeSignatureChanges) {
    if (change.measureNumber <= measureIndex) {
      effectiveTimeSig = change.timeSignature;
    }
  }
  return (
    TIME_SIG_BEATS[getTimeSigKey(effectiveTimeSig)] ||
    effectiveTimeSig.numerator
  );
}

/**
 * Calculate the starting absolute beat for each system (row)
 * This accounts for variable beats per row due to time signature changes
 */
function calculateSystemStartBeats(
  layout: LayoutConfig,
  timeSignatureChanges: TimeSignatureChange[],
  maxSystems: number,
): number[] {
  const { measuresPerRow, beatsPerMeasure } = layout;
  const baseTimeSig: TimeSignature = {
    numerator: beatsPerMeasure,
    denominator: 4,
  };
  const startBeats: number[] = [0];

  let currentBeat = 0;
  for (let sys = 0; sys < maxSystems; sys++) {
    const startMeasure = sys * measuresPerRow;
    let systemBeats = 0;

    for (let m = 0; m < measuresPerRow; m++) {
      const measureIndex = startMeasure + m;
      systemBeats += getBeatsForMeasure(
        measureIndex,
        baseTimeSig,
        timeSignatureChanges,
      );
    }

    currentBeat += systemBeats;
    startBeats.push(currentBeat);
  }

  return startBeats;
}

/**
 * Find which system an absolute beat belongs to
 */
function getSystemForAbsoluteBeat(
  absoluteBeat: number,
  systemStartBeats: number[],
): { system: number; beatInSystem: number } {
  for (let i = systemStartBeats.length - 1; i >= 0; i--) {
    if (absoluteBeat >= systemStartBeats[i]) {
      return {
        system: i,
        beatInSystem: absoluteBeat - systemStartBeats[i],
      };
    }
  }
  return { system: 0, beatInSystem: absoluteBeat };
}

/**
 * Convert new format (absoluteBeat) to legacy format (beat/system)
 * Uses responsive layout config to determine system boundaries
 * Accounts for variable beats per row due to time signature changes
 */
export function toLegacyNote(
  note: NewEditorNote,
  layout: LayoutConfig,
  timeSignatureChanges: TimeSignatureChange[] = [],
): LegacyEditorNote {
  // If no time signature changes, use simple calculation
  if (timeSignatureChanges.length === 0) {
    const { beatsPerRow } = layout;
    const system = Math.floor(note.absoluteBeat / beatsPerRow);
    const beat = note.absoluteBeat % beatsPerRow;
    return {
      id: note.id,
      pitch: note.pitch,
      duration: note.duration,
      beat,
      system,
    };
  }

  // With time signature changes, calculate actual system boundaries
  const maxSystems = Math.ceil(note.absoluteBeat / layout.beatsPerRow) + 2;
  const systemStartBeats = calculateSystemStartBeats(
    layout,
    timeSignatureChanges,
    maxSystems,
  );
  const { system, beatInSystem } = getSystemForAbsoluteBeat(
    note.absoluteBeat,
    systemStartBeats,
  );

  return {
    id: note.id,
    pitch: note.pitch,
    duration: note.duration,
    beat: beatInSystem,
    system,
  };
}

/**
 * Convert legacy format (beat/system) to new format (absoluteBeat)
 * Accounts for variable beats per row due to time signature changes
 */
export function fromLegacyNote(
  note: LegacyEditorNote,
  layout: LayoutConfig,
  timeSignatureChanges: TimeSignatureChange[] = [],
): NewEditorNote {
  // If no time signature changes, use simple calculation
  if (timeSignatureChanges.length === 0) {
    const { beatsPerRow } = layout;
    const absoluteBeat = note.system * beatsPerRow + note.beat;
    return {
      id: note.id,
      pitch: note.pitch,
      duration: note.duration,
      absoluteBeat,
    };
  }

  // With time signature changes, calculate actual system start beat
  const maxSystems = note.system + 2;
  const systemStartBeats = calculateSystemStartBeats(
    layout,
    timeSignatureChanges,
    maxSystems,
  );
  const systemStartBeat = systemStartBeats[note.system] || 0;
  const absoluteBeat = systemStartBeat + note.beat;

  return {
    id: note.id,
    pitch: note.pitch,
    duration: note.duration,
    absoluteBeat,
  };
}

/**
 * Convert array of new notes to legacy format
 */
export function toLegacyNotes(
  notes: NewEditorNote[],
  layout: LayoutConfig,
  timeSignatureChanges: TimeSignatureChange[] = [],
): LegacyEditorNote[] {
  return notes.map((note) => toLegacyNote(note, layout, timeSignatureChanges));
}

/**
 * Convert array of legacy notes to new format
 */
export function fromLegacyNotes(
  notes: LegacyEditorNote[],
  layout: LayoutConfig,
  timeSignatureChanges: TimeSignatureChange[] = [],
): NewEditorNote[] {
  return notes.map((note) =>
    fromLegacyNote(note, layout, timeSignatureChanges),
  );
}

/**
 * Convert new repeat marker to legacy format
 */
export function toLegacyRepeatMarker(
  marker: NewRepeatMarker,
  layout: LayoutConfig,
): LegacyRepeatMarker {
  const { beatsPerMeasure, measuresPerRow } = layout;
  const system = Math.floor(marker.measureNumber / measuresPerRow);
  const measure = marker.measureNumber % measuresPerRow;

  return {
    id: marker.id,
    pairId: marker.pairId,
    type: marker.type,
    measure,
    system,
  };
}

/**
 * Convert legacy repeat marker to new format
 */
export function fromLegacyRepeatMarker(
  marker: LegacyRepeatMarker,
  layout: LayoutConfig,
): NewRepeatMarker {
  const { measuresPerRow } = layout;
  const measureNumber = marker.system * measuresPerRow + marker.measure;

  return {
    id: marker.id,
    pairId: marker.pairId,
    type: marker.type,
    measureNumber,
  };
}

/**
 * Convert array of new markers to legacy format
 */
export function toLegacyRepeatMarkers(
  markers: NewRepeatMarker[],
  layout: LayoutConfig,
): LegacyRepeatMarker[] {
  return markers.map((marker) => toLegacyRepeatMarker(marker, layout));
}

/**
 * Convert array of legacy markers to new format
 */
export function fromLegacyRepeatMarkers(
  markers: LegacyRepeatMarker[],
  layout: LayoutConfig,
): NewRepeatMarker[] {
  return markers.map((marker) => fromLegacyRepeatMarker(marker, layout));
}

/**
 * Calculate system count needed for given notes
 * This replaces the old fixed systemCount with dynamic calculation
 */
export function calculateLegacySystemCount(
  notes: NewEditorNote[],
  layout: LayoutConfig,
): number {
  if (notes.length === 0) return 1;

  const { beatsPerRow } = layout;

  // Find maximum beat position (including note duration)
  let maxBeat = 0;
  for (const note of notes) {
    const noteEnd = note.absoluteBeat + note.duration;
    if (noteEnd > maxBeat) {
      maxBeat = noteEnd;
    }
  }

  // Calculate required systems
  return Math.ceil(maxBeat / beatsPerRow) || 1;
}
