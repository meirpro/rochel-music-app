/**
 * Migration utilities for converting legacy system-based positioning to absolute beat positioning
 */

import {
  EditorNote,
  LegacyEditorNote,
  RepeatMarker,
  LegacyRepeatMarker,
  Composition,
  LegacyComposition,
  SavedSong,
  TimeSignature,
} from "./types";

/**
 * Type guard to check if composition uses legacy format
 */
export function isLegacyComposition(
  composition: Composition | LegacyComposition,
): composition is LegacyComposition {
  // Check if notes have the old 'system' and 'beat' fields
  if (composition.notes.length === 0) return false;

  const firstNote = composition.notes[0] as any;
  return (
    "system" in firstNote &&
    "beat" in firstNote &&
    !("absoluteBeat" in firstNote)
  );
}

/**
 * Calculate beats per system based on time signature and measures per system
 */
export function getBeatsPerSystem(timeSignature: TimeSignature): number {
  const MEASURES_PER_SYSTEM = 2; // Default from old system
  return timeSignature.numerator * MEASURES_PER_SYSTEM;
}

/**
 * Migrate a single legacy note to the new format
 */
export function migrateLegacyNote(
  legacyNote: LegacyEditorNote,
  beatsPerSystem: number,
): EditorNote {
  const absoluteBeat = legacyNote.system * beatsPerSystem + legacyNote.beat;

  return {
    id: legacyNote.id,
    pitch: legacyNote.pitch,
    duration: legacyNote.duration,
    absoluteBeat,
  };
}

/**
 * Migrate a single legacy repeat marker to the new format
 */
export function migrateLegacyRepeatMarker(
  legacyMarker: LegacyRepeatMarker,
  timeSignature: TimeSignature,
): RepeatMarker {
  const MEASURES_PER_SYSTEM = 2; // Default from old system
  // Calculate absolute measure number from system and measure within system
  const measureNumber =
    legacyMarker.system * MEASURES_PER_SYSTEM + legacyMarker.measure;

  return {
    id: legacyMarker.id,
    pairId: legacyMarker.pairId,
    type: legacyMarker.type,
    measureNumber,
  };
}

/**
 * Migrate an entire legacy composition to the new format
 */
export function migrateLegacyComposition(
  legacyComposition: LegacyComposition,
  timeSignature: TimeSignature,
): Composition {
  const beatsPerSystem = getBeatsPerSystem(timeSignature);

  // Migrate all notes
  const notes = legacyComposition.notes.map((note) =>
    migrateLegacyNote(note as LegacyEditorNote, beatsPerSystem),
  );

  // Migrate all repeat markers
  const repeatMarkers = legacyComposition.repeatMarkers.map((marker) =>
    migrateLegacyRepeatMarker(marker as LegacyRepeatMarker, timeSignature),
  );

  return {
    notes,
    repeatMarkers,
  };
}

/**
 * Migrate a saved song if it uses legacy format
 * Returns the original song if already using new format
 */
export function migrateSavedSong(song: SavedSong): SavedSong {
  // Check if migration is needed
  if (!isLegacyComposition(song.composition)) {
    // Already using new format
    return song;
  }

  // Perform migration
  const migratedComposition = migrateLegacyComposition(
    song.composition,
    song.settings.timeSignature,
  );

  return {
    ...song,
    composition: migratedComposition,
    updatedAt: Date.now(), // Update timestamp to reflect migration
  };
}

/**
 * Migrate all songs in a SavedSongsMap
 */
export function migrateAllSongs(
  songs: Record<string, SavedSong>,
): Record<string, SavedSong> {
  const migratedSongs: Record<string, SavedSong> = {};

  for (const [id, song] of Object.entries(songs)) {
    migratedSongs[id] = migrateSavedSong(song);
  }

  return migratedSongs;
}

/**
 * Convert a new-format note back to legacy format for testing/compatibility
 * (Useful during transition period)
 */
export function toLegacyNote(
  note: EditorNote,
  beatsPerSystem: number,
): LegacyEditorNote {
  const system = Math.floor(note.absoluteBeat / beatsPerSystem);
  const beat = note.absoluteBeat % beatsPerSystem;

  return {
    id: note.id,
    pitch: note.pitch,
    duration: note.duration,
    beat,
    system,
  };
}

/**
 * Get absolute beat from either format (for transition period)
 */
export function getAbsoluteBeat(
  note: EditorNote | LegacyEditorNote,
  beatsPerSystem: number,
): number {
  if ("absoluteBeat" in note) {
    return note.absoluteBeat;
  }
  // Legacy format
  return note.system * beatsPerSystem + note.beat;
}

/**
 * Calculate system count from notes (for backward compatibility)
 */
export function calculateSystemCount(
  composition: Composition | LegacyComposition,
  beatsPerSystem: number,
): number {
  if ("systemCount" in composition) {
    return composition.systemCount;
  }

  if (composition.notes.length === 0) return 1;

  // Find max absolute beat
  let maxBeat = 0;
  for (const note of composition.notes) {
    const absoluteBeat = getAbsoluteBeat(note as any, beatsPerSystem);
    const notEnd = absoluteBeat + note.duration;
    if (notEnd > maxBeat) {
      maxBeat = notEnd;
    }
  }

  // Calculate required systems
  return Math.ceil(maxBeat / beatsPerSystem) || 1;
}

/**
 * Get absolute measure number from repeat marker (for transition period)
 */
export function getAbsoluteMeasureNumber(
  marker: RepeatMarker | LegacyRepeatMarker,
  measuresPerSystem: number,
): number {
  if ("measureNumber" in marker) {
    return marker.measureNumber;
  }
  // Legacy format
  return marker.system * measuresPerSystem + marker.measure;
}
