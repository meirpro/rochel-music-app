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

// Convert X coordinate to beat position (for placement)
export function getBeatFromX(
  x: number,
  beatWidth: number = BEAT_WIDTH,
): number {
  const rawBeat = (x - LEFT_MARGIN - getNoteOffset(beatWidth)) / beatWidth;
  return Math.round(rawBeat * 2) / 2; // Snap to half-beats
}

export function snapX(
  x: number,
  staffRight: number,
  beatWidth: number = BEAT_WIDTH,
  sysLayout?: SystemLayout,
): number {
  const noteOffset = getNoteOffset(beatWidth);

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

      if (
        xWithoutOffset >= measureStartX - leftTolerance &&
        xWithoutOffset < measureEndX + 10
      ) {
        // X is in this measure - snap within it
        // Clamp xInMeasure to not go negative (clicks in prefix area snap to beat 0)
        const xInMeasure = Math.max(0, xWithoutOffset - measureStartX);
        const snappedBeatInMeasure =
          Math.round(xInMeasure / (beatWidth / 2)) * (beatWidth / 2);
        // Clamp to measure bounds
        const clampedBeatX = Math.max(
          0,
          Math.min(
            (measure.beatsInMeasure - 0.5) * beatWidth,
            snappedBeatInMeasure,
          ),
        );
        return measureStartX + clampedBeatX + noteOffset;
      }
    }
  }

  // Fallback: simple calculation without xOffset
  const xWithoutOffset = x - noteOffset;
  const snapped =
    Math.round((xWithoutOffset - LEFT_MARGIN) / (beatWidth / 2)) *
      (beatWidth / 2) +
    LEFT_MARGIN +
    noteOffset;
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
