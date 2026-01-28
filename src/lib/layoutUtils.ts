/**
 * Shared layout constants and utilities for music notation rendering
 * Used by NoteEditor, usePlayback, and other components that need
 * consistent layout calculations.
 *
 * IMPORTANT: SVG Coordinate Rounding
 * All coordinate calculations should produce integers or values with at most
 * 1 decimal place. Floating-point values like 236.14583... can cause:
 * - Sub-pixel rendering artifacts (blurry lines)
 * - Inconsistent positioning across browsers
 * - Larger SVG file sizes when serialized
 *
 * Functions that compute coordinates should use Math.round() on their output.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const MIN_BEAT_WIDTH = 40; // Absolute minimum (fits note + small gap)
export const BASE_BEAT_WIDTH = 60; // Reference width at 100% spacing
export const LEFT_MARGIN = 100; // Space before first beat for clef and time sig
export const STAFF_LEFT = 40; // Where staff lines start (left of clef)
export const RIGHT_MARGIN = 60; // Space after last beat
export const LINE_SPACING = 32; // Vertical distance between staff lines (pixels)
export const SYSTEM_HEIGHT = 200; // Vertical space between system centers
export const SYSTEM_TOP_MARGIN = 100; // Top margin for first system (accommodates clef)
export const STAFF_CENTER_OFFSET = 80; // Offset from system top to staff center (Line 3)

// Decoration widths for time signatures and repeat markers
export const TIME_SIG_DISPLAY_WIDTH = 35; // Width reserved for time signature display
export const REPEAT_MARKER_WIDTH = 30; // Width reserved for repeat markers (dots at ±18px + radius)

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT CALCULATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate beat width based on noteSpacing setting
 * This is the single source of truth for beat width calculation
 * @param noteSpacing - 1.0 to 2.0 (100% to 200%)
 * @returns Integer beat width in pixels
 */
export function getBeatWidth(noteSpacing: number = 1.0): number {
  const effectiveBeatWidth = BASE_BEAT_WIDTH * noteSpacing;
  // Round to prevent fractional pixel values in downstream calculations
  return Math.round(Math.max(MIN_BEAT_WIDTH, effectiveBeatWidth));
}

/**
 * Calculate note offset within a beat column
 * Notes are centered 25% into the beat column (not at the left edge)
 * @param beatWidth - The current beat width
 * @returns Integer offset in pixels
 */
export function getNoteOffset(beatWidth: number): number {
  // Round to prevent fractional pixel values
  return Math.round(beatWidth * 0.25);
}

/**
 * Get the Y coordinate for the center of a staff system
 * @param systemIndex - 0-indexed system number
 */
export function getStaffCenterY(systemIndex: number): number {
  return SYSTEM_TOP_MARGIN + systemIndex * SYSTEM_HEIGHT + STAFF_CENTER_OFFSET;
}
