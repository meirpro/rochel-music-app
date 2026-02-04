// src/components/NoteEditorRefactored/utils/beatUtils.ts
// Extracted from NoteEditor.tsx lines 985-1062

import { LEFT_MARGIN, getNoteOffset, BASE_BEAT_WIDTH } from "@/lib/layoutUtils";
import { SystemLayout } from "./systemLayout";

const BEAT_WIDTH = BASE_BEAT_WIDTH;

/**
 * Convert beat position to X coordinate (for rendering)
 * Notes are centered within their beat column via getNoteOffset.
 * @returns Rounded X coordinate to prevent sub-pixel rendering issues
 */
export function getXFromBeat(
  beat: number,
  beatWidth: number = BEAT_WIDTH,
): number {
  // Round to prevent floating-point artifacts in SVG (e.g., 236.14583...)
  return Math.round(LEFT_MARGIN + beat * beatWidth + getNoteOffset(beatWidth));
}

/**
 * Convert X coordinate to beat position (for placement)
 *
 * EPSILON FIX: When mouse is exactly at a half-beat boundary (e.g., the midpoint
 * between beat 0 and beat 0.5), floating-point division can produce values like
 * 0.49999999 instead of 0.5, causing Math.round to snap to the wrong beat.
 * Adding a tiny epsilon biases the result forward, ensuring boundary positions
 * consistently snap to the higher beat number.
 */
export function getBeatFromX(
  x: number,
  beatWidth: number = BEAT_WIDTH,
): number {
  const EPSILON = 0.0001;
  const rawBeat =
    (x - LEFT_MARGIN - getNoteOffset(beatWidth)) / beatWidth + EPSILON;
  return Math.round(rawBeat * 2) / 2; // Snap to half-beats
}

/**
 * Snap X coordinate to nearest half-beat position
 *
 * This function determines which half-beat grid line a mouse position should
 * snap to. Used for both note placement (click) and note dragging.
 *
 * EPSILON FIX: At half-beat boundaries, floating-point arithmetic can cause
 * inconsistent rounding. For example, at the exact midpoint between beat 0
 * and beat 0.5, the calculation might produce 0.4999... or 1.0001...,
 * causing unpredictable snapping. The epsilon (0.01) shifts all snap
 * boundaries slightly left, so positions near boundaries consistently
 * snap to the higher beat. This matches user expectation: if visually
 * close to a grid line, snap TO that line, not away from it.
 *
 * @param x - Raw mouse X coordinate
 * @param staffRight - Right edge of the staff (for clamping)
 * @param beatWidth - Width of one beat in pixels
 * @param sysLayout - Optional system layout for measure-aware snapping
 * @returns Snapped X coordinate aligned to a half-beat grid line
 */
export function snapX(
  x: number,
  staffRight: number,
  beatWidth: number = BEAT_WIDTH,
  sysLayout?: SystemLayout,
): number {
  const noteOffset = getNoteOffset(beatWidth);
  const halfBeatWidth = beatWidth / 2;

  // Epsilon biases snapping forward - see function docstring for explanation
  const EPSILON = 0.01;

  // If we have a system layout, use measure xOffsets for proper snapping
  if (sysLayout) {
    const xWithoutOffset = x - noteOffset;

    // Find which measure this X falls into
    for (const measure of sysLayout.measures) {
      const measureStartX = LEFT_MARGIN + measure.xOffset;
      const measureEndX = measureStartX + measure.beatsInMeasure * beatWidth;

      // Extend left tolerance to include prefixWidth (time sig display area)
      // so clicks in the decoration area snap to the first beat
      const leftTolerance = measure.prefixWidth + 10;

      // Check if X falls within this measure's left boundary (with tolerance for prefix area)
      if (xWithoutOffset >= measureStartX - leftTolerance) {
        // X is potentially in this measure - calculate the snap position
        // Clamp xInMeasure to not go negative (clicks in prefix area snap to beat 0)
        const xInMeasure = Math.max(0, xWithoutOffset - measureStartX);
        // Add epsilon to bias rounding forward at boundaries
        const halfBeatCount = xInMeasure / halfBeatWidth + EPSILON;
        const snappedBeatInMeasure = Math.round(halfBeatCount) * halfBeatWidth;

        // Check if snap result is within this measure's valid beat range
        // If snapped beat exceeds measure bounds, fall through to next measure
        // This handles clicks near the bar line that should snap to the next measure
        const maxBeatInMeasure = (measure.beatsInMeasure - 0.5) * beatWidth;
        if (snappedBeatInMeasure <= maxBeatInMeasure) {
          // Snap is within bounds - return this position
          const clampedBeatX = Math.max(0, snappedBeatInMeasure);
          return measureStartX + clampedBeatX + noteOffset;
        }
        // Snap exceeds measure bounds - continue to next measure
      }
    }
  }

  // Fallback: simple calculation without xOffset
  const xWithoutOffset = x - noteOffset;
  const halfBeatCount =
    (xWithoutOffset - LEFT_MARGIN) / halfBeatWidth + EPSILON;
  const snapped =
    Math.round(halfBeatCount) * halfBeatWidth + LEFT_MARGIN + noteOffset;
  // Clamp to valid range
  const maxX = staffRight - beatWidth / 3;
  return Math.max(LEFT_MARGIN + noteOffset, Math.min(maxX, snapped));
}

// Get measure from X position
// beatWidth parameter allows for variable beat widths per system
export function getMeasureFromX(
  x: number,
  beatsPerMeasure: number,
  beatWidth: number = BEAT_WIDTH,
): number {
  const beatsFromLeft = (x - LEFT_MARGIN) / beatWidth;
  // Use Math.round instead of Math.floor so clicks near bar lines
  // are assigned to the nearest measure (more intuitive)
  return Math.round(beatsFromLeft / beatsPerMeasure);
}
