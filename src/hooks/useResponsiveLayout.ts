/**
 * Layout Configuration Hook
 *
 * Provides layout parameters based on user preferences.
 * Uses FIXED beatWidth (60px) - layout does not change on resize.
 * The measuresPerRow is a user preference stored in localStorage.
 */

import { useMemo } from "react";
import { TimeSignature } from "@/lib/types";

// Fixed layout constants (matching NoteEditor)
const BEAT_WIDTH = 60;
const LEFT_MARGIN = 100;
const RIGHT_MARGIN = 20;

export interface LayoutConfig {
  // User preferences
  measuresPerRow: number; // How many measures to show per row (1-8+)

  // Time signature info
  beatsPerMeasure: number; // From time signature numerator

  // Fixed dimensions
  beatWidth: number; // Fixed at 60px per beat
  beatsPerRow: number; // measuresPerRow * beatsPerMeasure

  // Layout calculations
  rowWidth: number; // Total width of a row
  totalRows: number; // Number of rows needed for composition

  // Margins (from NoteEditor constants)
  leftMargin: number;
  rightMargin: number;
}

export interface UseResponsiveLayoutOptions {
  timeSignature: TimeSignature;
  totalBeats: number; // Total beats in composition
  userMeasuresPerRow: number; // User's preferred measures per row
}

/**
 * Hook to calculate layout parameters (fixed layout, no resize response)
 */
export function useResponsiveLayout(
  _containerRef: React.RefObject<HTMLElement | null>, // Kept for API compatibility
  options: UseResponsiveLayoutOptions,
): LayoutConfig {
  const { timeSignature, totalBeats, userMeasuresPerRow } = options;

  const beatsPerMeasure = timeSignature.numerator;

  // Memoize layout calculations
  const layout = useMemo(() => {
    const measuresPerRow = Math.max(1, userMeasuresPerRow);
    const beatsPerRow = measuresPerRow * beatsPerMeasure;
    const rowWidth = beatsPerRow * BEAT_WIDTH + LEFT_MARGIN + RIGHT_MARGIN;
    const totalRows = Math.ceil(totalBeats / beatsPerRow) || 1;

    return {
      measuresPerRow,
      beatsPerMeasure,
      beatWidth: BEAT_WIDTH,
      beatsPerRow,
      rowWidth,
      totalRows,
      leftMargin: LEFT_MARGIN,
      rightMargin: RIGHT_MARGIN,
    };
  }, [userMeasuresPerRow, beatsPerMeasure, totalBeats]);

  return layout;
}

/**
 * Calculate recommended measures per row based on viewport width.
 * Called ONCE on initial load to set a sensible default.
 */
export function getInitialMeasuresPerRow(
  viewportWidth: number,
  beatsPerMeasure: number = 4,
): number {
  const availableWidth = viewportWidth - LEFT_MARGIN - RIGHT_MARGIN - 100; // Extra padding for tools
  const minBeatWidth = 50; // Minimum readable beat width

  // Calculate how many measures fit comfortably
  const maxMeasures = Math.floor(
    availableWidth / (beatsPerMeasure * minBeatWidth),
  );

  // Return 1-4 measures, clamped
  return Math.min(4, Math.max(1, maxMeasures));
}

/**
 * Get maximum measures that can fit in container (for UI limits)
 */
export function getMaxMeasuresPerRow(
  containerWidth: number,
  beatsPerMeasure: number,
  minBeatWidth: number = 40,
  leftMargin: number = LEFT_MARGIN,
  rightMargin: number = RIGHT_MARGIN,
): number {
  const availableWidth = containerWidth - leftMargin - rightMargin;
  return Math.max(
    1,
    Math.floor(availableWidth / (beatsPerMeasure * minBeatWidth)),
  );
}

/**
 * Convert absolute beat to row and x coordinate
 */
export function getRowAndX(
  absoluteBeat: number,
  layout: LayoutConfig,
): { row: number; x: number } {
  const { beatsPerRow, beatWidth, leftMargin } = layout;

  // Which row (0-indexed)?
  const row = Math.floor(absoluteBeat / beatsPerRow);

  // Beat position within row (0 to beatsPerRow-1)
  const beatInRow = absoluteBeat % beatsPerRow;

  // X coordinate (with NOTE_OFFSET of 15px for centering within beat column)
  const NOTE_OFFSET = 15;
  const x = leftMargin + beatInRow * beatWidth + NOTE_OFFSET;

  return { row, x };
}

/**
 * Convert x coordinate and row to absolute beat
 */
export function getAbsoluteBeatFromX(
  x: number,
  row: number,
  layout: LayoutConfig,
): number {
  const { beatsPerRow, beatWidth, leftMargin } = layout;
  const NOTE_OFFSET = 15;

  // Calculate beat within row
  const beatInRow = (x - leftMargin - NOTE_OFFSET) / beatWidth;

  // Snap to nearest half-beat
  const snappedBeatInRow = Math.round(beatInRow * 2) / 2;

  // Calculate absolute beat
  const absoluteBeat = row * beatsPerRow + snappedBeatInRow;

  return Math.max(0, absoluteBeat);
}
