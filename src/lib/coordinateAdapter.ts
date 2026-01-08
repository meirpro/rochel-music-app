/**
 * Coordinate Adapter
 *
 * Bridges between new absoluteBeat format and NoteEditor's legacy system-based format.
 * This adapter allows Phase 2 responsive layout to work without refactoring the entire
 * 1659-line NoteEditor component, which will be done in Phase 3.
 */

import {
  EditorNote as NewEditorNote,
  RepeatMarker as NewRepeatMarker,
  Pitch,
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

/**
 * Convert new format (absoluteBeat) to legacy format (beat/system)
 * Uses responsive layout config to determine system boundaries
 */
export function toLegacyNote(
  note: NewEditorNote,
  layout: LayoutConfig,
): LegacyEditorNote {
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

/**
 * Convert legacy format (beat/system) to new format (absoluteBeat)
 */
export function fromLegacyNote(
  note: LegacyEditorNote,
  layout: LayoutConfig,
): NewEditorNote {
  const { beatsPerRow } = layout;
  const absoluteBeat = note.system * beatsPerRow + note.beat;

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
): LegacyEditorNote[] {
  return notes.map((note) => toLegacyNote(note, layout));
}

/**
 * Convert array of legacy notes to new format
 */
export function fromLegacyNotes(
  notes: LegacyEditorNote[],
  layout: LayoutConfig,
): NewEditorNote[] {
  return notes.map((note) => fromLegacyNote(note, layout));
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
