/**
 * Responsive Layout Hook
 *
 * Calculates dynamic layout parameters based on container width and user preferences.
 * Replaces the hardcoded system-based layout with flexible measures-per-row approach.
 */

import { useState, useEffect, RefObject } from "react";
import { TimeSignature } from "@/lib/types";

export interface LayoutConfig {
  // User preferences
  measuresPerRow: number; // How many measures to show per row (1-8+)

  // Time signature info
  beatsPerMeasure: number; // From time signature numerator

  // Calculated dimensions
  beatWidth: number; // Pixels per beat (dynamic based on container)
  beatsPerRow: number; // measuresPerRow * beatsPerMeasure

  // Layout calculations
  containerWidth: number; // Available width for content
  rowWidth: number; // Total width of a row
  totalRows: number; // Number of rows needed for composition

  // Margins (from NoteEditor constants)
  leftMargin: number;
  rightMargin: number;
}

export interface UseResponsiveLayoutOptions {
  timeSignature: TimeSignature;
  totalBeats: number; // Total beats in composition
  userMeasuresPerRow?: number; // User's preferred measures per row (default: 4)
  minBeatWidth?: number; // Minimum readable beat width (default: 40)
  maxBeatWidth?: number; // Maximum beat width before too sparse (default: 80)
  leftMargin?: number; // Left margin (default: 100)
  rightMargin?: number; // Right margin (default: 20)
}

const DEFAULT_MEASURES_PER_ROW = 4;
const MIN_BEAT_WIDTH = 40;
const MAX_BEAT_WIDTH = 80;
const LEFT_MARGIN = 100;
const RIGHT_MARGIN = 20;

/**
 * Calculate optimal measures per row based on container width
 */
function calculateOptimalMeasures(
  containerWidth: number,
  beatsPerMeasure: number,
  userPreference: number | "auto",
  minBeatWidth: number,
  maxBeatWidth: number,
  leftMargin: number,
  rightMargin: number,
): number {
  const availableWidth = containerWidth - leftMargin - rightMargin;

  // Calculate how many measures can fit with comfortable beat width
  const maxMeasuresAtMinWidth = Math.floor(
    availableWidth / (beatsPerMeasure * minBeatWidth),
  );

  if (userPreference === "auto") {
    // Auto mode: Try to fit up to 4 measures, scale down for smaller screens
    return Math.min(4, Math.max(1, maxMeasuresAtMinWidth));
  }

  // Respect user's choice, but ensure it fits
  return Math.max(1, Math.min(userPreference, maxMeasuresAtMinWidth));
}

/**
 * Calculate beat width based on measures per row and container width
 */
function calculateBeatWidth(
  containerWidth: number,
  measuresPerRow: number,
  beatsPerMeasure: number,
  leftMargin: number,
  rightMargin: number,
  minBeatWidth: number,
  maxBeatWidth: number,
): number {
  const availableWidth = containerWidth - leftMargin - rightMargin;
  const totalBeats = measuresPerRow * beatsPerMeasure;

  // Calculate ideal beat width
  const idealBeatWidth = availableWidth / totalBeats;

  // Clamp to min/max for readability
  return Math.max(minBeatWidth, Math.min(maxBeatWidth, idealBeatWidth));
}

/**
 * Hook to calculate responsive layout parameters
 */
export function useResponsiveLayout(
  containerRef: RefObject<HTMLElement | null>,
  options: UseResponsiveLayoutOptions,
): LayoutConfig {
  const {
    timeSignature,
    totalBeats,
    userMeasuresPerRow = DEFAULT_MEASURES_PER_ROW,
    minBeatWidth = MIN_BEAT_WIDTH,
    maxBeatWidth = MAX_BEAT_WIDTH,
    leftMargin = LEFT_MARGIN,
    rightMargin = RIGHT_MARGIN,
  } = options;

  const beatsPerMeasure = timeSignature.numerator;

  // Track container width
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // Calculate measures per row
  const [measuresPerRow, setMeasuresPerRow] =
    useState<number>(userMeasuresPerRow);

  // Update measures per row when user preference changes
  useEffect(() => {
    const optimal = calculateOptimalMeasures(
      containerWidth,
      beatsPerMeasure,
      userMeasuresPerRow,
      minBeatWidth,
      maxBeatWidth,
      leftMargin,
      rightMargin,
    );
    setMeasuresPerRow(optimal);
  }, [
    containerWidth,
    beatsPerMeasure,
    userMeasuresPerRow,
    minBeatWidth,
    maxBeatWidth,
    leftMargin,
    rightMargin,
  ]);

  // Track container size with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial size
    setContainerWidth(container.clientWidth);

    // Setup ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setContainerWidth(width);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  // Calculate beat width
  const beatWidth = calculateBeatWidth(
    containerWidth,
    measuresPerRow,
    beatsPerMeasure,
    leftMargin,
    rightMargin,
    minBeatWidth,
    maxBeatWidth,
  );

  // Calculate derived values
  const beatsPerRow = measuresPerRow * beatsPerMeasure;
  const rowWidth = beatsPerRow * beatWidth + leftMargin + rightMargin;
  const totalRows = Math.ceil(totalBeats / beatsPerRow) || 1;

  return {
    measuresPerRow,
    beatsPerMeasure,
    beatWidth,
    beatsPerRow,
    containerWidth,
    rowWidth,
    totalRows,
    leftMargin,
    rightMargin,
  };
}

/**
 * Get maximum measures that can fit in container
 */
export function getMaxMeasuresPerRow(
  containerWidth: number,
  beatsPerMeasure: number,
  minBeatWidth: number = MIN_BEAT_WIDTH,
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
