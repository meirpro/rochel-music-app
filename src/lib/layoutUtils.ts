/**
 * Shared layout constants and utilities for music notation rendering
 * Used by NoteEditor, usePlayback, and other components that need
 * consistent layout calculations.
 */

// Layout constants
export const MIN_BEAT_WIDTH = 40; // Absolute minimum (fits note + small gap)
export const BASE_BEAT_WIDTH = 60; // Reference width at 100% spacing
export const LEFT_MARGIN = 100;
export const STAFF_LEFT = 40;
export const RIGHT_MARGIN = 60;
export const LINE_SPACING = 32;
export const SYSTEM_HEIGHT = 200; // Space between system centers
export const SYSTEM_TOP_MARGIN = 100; // Top margin for first system (accommodates clef)
export const STAFF_CENTER_OFFSET = 80;

// Decoration widths for time signatures and repeat markers
export const TIME_SIG_DISPLAY_WIDTH = 35; // Width reserved for time signature display
export const REPEAT_MARKER_WIDTH = 30; // Width reserved for repeat markers (dots at ±18px + radius)

/**
 * Calculate beat width based on noteSpacing setting
 * This is the single source of truth for beat width calculation
 * @param noteSpacing - 1.0 to 2.0 (100% to 200%)
 */
export function getBeatWidth(noteSpacing: number = 1.0): number {
  const effectiveBeatWidth = BASE_BEAT_WIDTH * noteSpacing;
  return Math.max(MIN_BEAT_WIDTH, effectiveBeatWidth);
}

/**
 * Calculate note offset within a beat column
 * Original ratio: 15px for 60px beatWidth = 25%
 * @param beatWidth - The current beat width
 */
export function getNoteOffset(beatWidth: number): number {
  return beatWidth * 0.25;
}

/**
 * Get the Y coordinate for the center of a staff system
 * @param systemIndex - 0-indexed system number
 */
export function getStaffCenterY(systemIndex: number): number {
  return SYSTEM_TOP_MARGIN + systemIndex * SYSTEM_HEIGHT + STAFF_CENTER_OFFSET;
}
