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
export const STAFF_LEFT = 10; // Where staff lines start (left of clef)
export const RIGHT_MARGIN = 30; // Space after last beat
export const LINE_SPACING = 32; // Vertical distance between staff lines (pixels)
export const SYSTEM_HEIGHT = 200; // Base vertical space between system centers (use getEffectiveSystemHeight for dynamic adjustment)
export const BASE_SYSTEM_TOP_MARGIN = 60; // Base top margin (use getEffectiveTopMargin for dynamic adjustment)
export const SYSTEM_TOP_MARGIN = 60; // Legacy alias for BASE_SYSTEM_TOP_MARGIN (for compatibility)
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
 * Calculate effective system height based on the number of visible staff lines.
 * More lines need more vertical space to prevent overlap between lyrics and the next clef.
 * @param staffLines - Number of visible staff lines (3, 4, or 5)
 * @returns Effective system height in pixels
 */
export function getEffectiveSystemHeight(staffLines: number = 5): number {
  switch (staffLines) {
    case 5:
      return SYSTEM_HEIGHT + 60; // 260px for 5 lines (lyrics + full clef)
    case 4:
      return SYSTEM_HEIGHT + 30; // 230px for 4 lines
    case 3:
    default:
      return SYSTEM_HEIGHT; // 200px for 3 lines (base)
  }
}

/**
 * Calculate effective top margin based on the number of visible staff lines.
 * Fewer lines need less top margin since the clef visual is smaller.
 * @param staffLines - Number of visible staff lines (3, 4, or 5)
 * @returns Effective top margin in pixels
 */
export function getEffectiveTopMargin(staffLines: number = 5): number {
  switch (staffLines) {
    case 5:
      return BASE_SYSTEM_TOP_MARGIN + 20; // 80px for 5 lines (larger clef)
    case 4:
      return BASE_SYSTEM_TOP_MARGIN + 10; // 70px for 4 lines
    case 3:
    default:
      return BASE_SYSTEM_TOP_MARGIN - 20; // 40px for 3 lines (compact)
  }
}

/**
 * Calculate effective bottom padding based on the number of visible staff lines.
 * @param staffLines - Number of visible staff lines (3, 4, or 5)
 * @returns Effective bottom padding in pixels
 */
export function getEffectiveBottomPadding(staffLines: number = 5): number {
  switch (staffLines) {
    case 5:
      return 20; // Less padding for 5 lines (already tall)
    case 4:
      return 30; // Medium padding for 4 lines
    case 3:
    default:
      return 40; // Base padding for 3 lines
  }
}

/**
 * Get the Y coordinate for the center of a staff system
 * @param systemIndex - 0-indexed system number
 * @param staffLines - Optional: number of visible staff lines for dynamic height and margin
 */
export function getStaffCenterY(
  systemIndex: number,
  staffLines?: number,
): number {
  const effectiveHeight = staffLines
    ? getEffectiveSystemHeight(staffLines)
    : SYSTEM_HEIGHT;
  const effectiveTopMargin = staffLines
    ? getEffectiveTopMargin(staffLines)
    : BASE_SYSTEM_TOP_MARGIN;
  return (
    effectiveTopMargin + systemIndex * effectiveHeight + STAFF_CENTER_OFFSET
  );
}
