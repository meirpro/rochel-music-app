"use client";

/**
 * NoteEditor.tsx - Interactive Music Staff Notation Editor
 *
 * This component renders a musical staff where users can place, edit, and delete notes.
 * It supports variable staff line counts (3-5 lines), time signatures, repeat markers,
 * lyrics, and playback visualization.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * COORDINATE SYSTEM & LAYOUT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The staff uses a coordinate system where:
 * - X increases rightward (horizontal position = beat/time)
 * - Y increases downward (vertical position = pitch)
 *
 * Key reference point: `staffCenterY` - the Y coordinate of the middle line (Line 3)
 * for each system. All vertical positioning is relative to this point.
 *
 * Staff lines are numbered 1-5 from TOP to BOTTOM:
 *   Line 1: staffCenterY - 64  (F5 in treble clef)
 *   Line 2: staffCenterY - 32  (D5)
 *   Line 3: staffCenterY + 0   (B4) ← REFERENCE POINT
 *   Line 4: staffCenterY + 32  (G4) ← Treble clef curl wraps here
 *   Line 5: staffCenterY + 64  (E4)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * VARIABLE STAFF LINES (3, 4, or 5 lines)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The editor supports showing 3, 4, or 5 staff lines. When fewer lines are shown,
 * we hide the TOP lines and keep the BOTTOM lines fixed:
 *
 *   5 lines: Lines 1-5 visible (full standard staff)
 *   4 lines: Lines 2-5 visible (Line 1 hidden)
 *   3 lines: Lines 3-5 visible (Lines 1-2 hidden)
 *
 * This means the bottom 3 lines (3, 4, 5) NEVER move - notes placed on these
 * lines stay in the same visual position regardless of the staffLines setting.
 *
 * Key variables for adaptive positioning:
 * - `staffTopOffset`: Y offset of the topmost VISIBLE line from staffCenterY
 *     5 lines: -64, 4 lines: -32, 3 lines: 0
 * - `staffBottomOffset`: Y offset of the bottommost line (always +64 for Line 5)
 * - `visibleCenterOffset`: Center point of the VISIBLE staff area
 *     Used to vertically center time signatures and repeat markers
 * - `decorationSpread`: How far apart time sig numbers and repeat dots spread
 *     Scales with line count so decorations fill the visible space proportionally
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * TREBLE CLEF POSITIONING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The treble clef (G clef) must have its curl wrap around Line 4 (G4).
 * We use an SVG path scaled to 5.1x, positioned so the curl aligns with G4.
 * A clipPath limits the visible portion based on the staffLines setting,
 * cutting off the top of the clef when fewer lines are shown.
 */

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { toast } from "sonner";
import { Pitch, LyricSyllable, TimeSignatureChange } from "@/lib/types";
import { getNoteColor, pitchToMidi } from "@/lib/constants";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { TOUR_ELEMENT_IDS } from "@/lib/tourSteps/driverSteps";
import { useInteractiveTutorial } from "@/hooks/useInteractiveTutorial";
import { InlineLyricInput } from "./InlineLyricInput";
import {
  MIN_BEAT_WIDTH,
  BASE_BEAT_WIDTH,
  LEFT_MARGIN,
  STAFF_LEFT,
  RIGHT_MARGIN,
  LINE_SPACING,
  SYSTEM_HEIGHT,
  SYSTEM_TOP_MARGIN,
  TIME_SIG_DISPLAY_WIDTH,
  REPEAT_MARKER_WIDTH,
  getNoteOffset,
  getStaffCenterY,
} from "@/lib/layoutUtils";

// Time signature type
export interface TimeSignature {
  numerator: number; // Top number (beats per measure)
  denominator: number; // Bottom number (note value)
}

// Valid time signature options for dropdowns
export const TIME_SIG_NUMERATORS = [2, 3, 4, 5, 6, 7, 9, 12] as const;
export const TIME_SIG_DENOMINATORS = [2, 4, 8, 16] as const;

// Helper to convert TimeSignature to string key
function getTimeSigKey(ts: TimeSignature): string {
  return `${ts.numerator}/${ts.denominator}`;
}

// Helper to get display label for a pitch (e.g., "B♭" for "Bb4", "F♯" for "F#4")
function getNoteLabel(pitch: Pitch): string {
  if (pitch === "REST") return "";
  const match = pitch.match(/^([A-G])(#|b)?/);
  if (!match) return pitch[0];
  const [, note, accidental] = match;
  if (accidental === "#") return `${note}♯`;
  if (accidental === "b") return `${note}♭`;
  return note;
}

/**
 * Time Signature Configuration
 *
 * Each time signature defines:
 * - beatsPerMeasure: Number of beats in one measure
 * - beamGroups: How to group eighth notes for beaming
 *     e.g., [2, 2] for 4/4 means beam beats 1-2 together, then beats 3-4 together
 *     This follows standard music engraving rules (don't beam across beat groups)
 * - measuresPerSystem: How many measures fit on one staff line
 *     Longer meters (7/4, 9/8) get fewer measures per system to avoid crowding
 * - shadeGroups: Visual beat grouping for the alternating background shading
 */
const TIME_SIG_CONFIG: Record<
  string,
  {
    beatsPerMeasure: number;
    beamGroups: number[];
    measuresPerSystem: number;
    shadeGroups: number[];
  }
> = {
  "4/4": {
    beatsPerMeasure: 4,
    beamGroups: [2, 2], // Beam beats 1-2 together, 3-4 together (standard 4/4 beaming)
    measuresPerSystem: 2,
    shadeGroups: [1, 1, 1, 1, 1, 1, 1, 1],
  },
  "3/4": {
    beatsPerMeasure: 3,
    beamGroups: [1, 1, 1],
    measuresPerSystem: 2,
    shadeGroups: [1, 1, 1, 1, 1, 1], // 6 beats total
  },
  "6/8": {
    beatsPerMeasure: 6,
    beamGroups: [3, 3],
    measuresPerSystem: 2,
    shadeGroups: [3, 3, 3, 3], // Group in 3s (compound meter feel)
  },
  "2/4": {
    beatsPerMeasure: 2,
    beamGroups: [1, 1],
    measuresPerSystem: 2,
    shadeGroups: [1, 1, 1, 1], // 4 beats total
  },
  "5/4": {
    beatsPerMeasure: 5,
    beamGroups: [2, 3], // or [3, 2] depending on feel
    measuresPerSystem: 2,
    shadeGroups: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
  "7/4": {
    beatsPerMeasure: 7,
    beamGroups: [2, 2, 3],
    measuresPerSystem: 1, // Fewer measures per system for longer meters
    shadeGroups: [1, 1, 1, 1, 1, 1, 1],
  },
  "9/8": {
    beatsPerMeasure: 9,
    beamGroups: [3, 3, 3],
    measuresPerSystem: 1,
    shadeGroups: [3, 3, 3],
  },
  "12/8": {
    beatsPerMeasure: 12,
    beamGroups: [3, 3, 3, 3],
    measuresPerSystem: 1,
    shadeGroups: [3, 3, 3, 3],
  },
  "2/2": {
    beatsPerMeasure: 2,
    beamGroups: [1, 1],
    measuresPerSystem: 2,
    shadeGroups: [1, 1, 1, 1],
  },
  "3/2": {
    beatsPerMeasure: 3,
    beamGroups: [1, 1, 1],
    measuresPerSystem: 2,
    shadeGroups: [1, 1, 1, 1, 1, 1],
  },
};

// Helper to get layout values based on time signature
// Used for backward compatibility and default layout calculations
function getLayoutConfig(
  timeSignature: TimeSignature,
  measuresPerRow?: number,
  noteSpacing: number = 1.0,
) {
  const key = getTimeSigKey(timeSignature);
  const config = TIME_SIG_CONFIG[key] || TIME_SIG_CONFIG["4/4"]; // Fallback to 4/4
  const effectiveMeasuresPerRow = measuresPerRow ?? config.measuresPerSystem;
  const beatsPerSystem = config.beatsPerMeasure * effectiveMeasuresPerRow;
  // Use noteSpacing to calculate beat width (this is a reference layout)
  const effectiveBeatWidth = BASE_BEAT_WIDTH * noteSpacing;
  const beatWidth = Math.max(MIN_BEAT_WIDTH, effectiveBeatWidth);
  const staffRight = LEFT_MARGIN + beatsPerSystem * beatWidth;
  const svgWidth = staffRight + RIGHT_MARGIN;
  return {
    ...config,
    measuresPerSystem: effectiveMeasuresPerRow,
    beatsPerSystem,
    beatWidth,
    staffRight,
    svgWidth,
  };
}

// Info about a single measure within a system
interface MeasureInfo {
  measureIndex: number; // Absolute measure number (0-indexed)
  timeSignature: TimeSignature;
  beatsInMeasure: number;
  beamGroups: number[];
  shadeGroups: number[];
  startBeatInSystem: number; // Beat offset within this system (cumulative)
  // Decoration tracking
  showTimeSig: boolean; // Show time signature at this measure
  hasRepeatStart: boolean;
  hasRepeatEnd: boolean;
  prefixWidth: number; // Extra width before beats (time sig + repeat start)
  suffixWidth: number; // Extra width after beats (repeat end)
  xOffset: number; // X offset from LEFT_MARGIN for this measure's content
}

// Layout for a single system - fixed width, variable beat spacing
interface SystemLayout {
  systemIndex: number;
  measures: MeasureInfo[]; // All measures on this system with their time sigs
  startMeasure: number; // First absolute measure number
  startBeat: number; // First absolute beat (for beat labels)
  totalBeats: number; // Total beats in this system
  totalDecorationWidth: number; // Total width used by decorations (time sigs, repeats)
  beatWidth: number; // Width per beat (calculated to fit fixed system width)
  measuresPerSystem: number;
  staffRight: number; // Fixed width (same for all systems)
  svgWidth: number;
}

// Uniform system width - all systems same width, variable beat spacing
// Constants imported from @/lib/layoutUtils

// Repeat marker info for layout calculation
interface RepeatMarkerForLayout {
  measureNumber: number;
  type: "start" | "end";
}

// Calculate per-system layouts with uniform width but variable beat spacing
// Includes dynamic space for time signatures and repeat markers
// noteSpacing: 1.0-2.0 (100%-200%) controls overall system width
function calculateSystemLayouts(
  systemCount: number,
  totalMeasures: number, // Total measures in the composition
  initialTimeSig: TimeSignature,
  timeSignatureChanges: TimeSignatureChange[],
  measuresPerRow: number,
  noteSpacing: number = 1.0,
  repeatMarkers: RepeatMarkerForLayout[] = [],
): SystemLayout[] {
  // Sort changes by measure number for quick lookup
  const sortedChanges = [...timeSignatureChanges].sort(
    (a, b) => a.measureNumber - b.measureNumber,
  );

  // Create sets for quick repeat marker lookup
  const repeatStartMeasures = new Set(
    repeatMarkers.filter((m) => m.type === "start").map((m) => m.measureNumber),
  );
  const repeatEndMeasures = new Set(
    repeatMarkers.filter((m) => m.type === "end").map((m) => m.measureNumber),
  );

  // Helper to get time signature at a given measure
  const getTimeSigAtMeasure = (measureNum: number): TimeSignature => {
    let timeSig = initialTimeSig;
    for (const change of sortedChanges) {
      if (change.measureNumber <= measureNum) {
        timeSig = change.timeSignature;
      } else {
        break;
      }
    }
    return timeSig;
  };

  // Helper to check if time sig should be displayed at a measure
  const shouldShowTimeSig = (
    measureNum: number,
    isFirstInRow: boolean,
  ): boolean => {
    // Don't show at measure 0 - it's already shown in the left margin with treble clef
    if (measureNum === 0) return false;
    // Show if there's a time sig change at this measure
    if (sortedChanges.some((c) => c.measureNumber === measureNum)) return true;
    // Show at start of each row if time sig is different from default
    if (isFirstInRow) {
      const currentSig = getTimeSigAtMeasure(measureNum);
      const prevSig = getTimeSigAtMeasure(measureNum - 1);
      // Show if continuing a different time sig from initial
      return (
        currentSig.numerator !== initialTimeSig.numerator ||
        currentSig.denominator !== initialTimeSig.denominator ||
        prevSig.numerator !== currentSig.numerator ||
        prevSig.denominator !== currentSig.denominator
      );
    }
    return false;
  };

  // PASS 1: Calculate total beats and decoration widths for each system
  const systemData: {
    measures: MeasureInfo[];
    totalBeats: number;
    totalDecorationWidth: number;
  }[] = [];
  let maxEffectiveWidth = 0; // beats * baseWidth + decorations

  for (let sysIdx = 0; sysIdx < systemCount; sysIdx++) {
    const startMeasure = sysIdx * measuresPerRow;
    const measures: MeasureInfo[] = [];
    let totalBeats = 0;
    let totalDecorationWidth = 0;
    let xOffset = 0;

    // Only iterate through measures that actually exist
    const measuresInThisSystem = Math.min(
      measuresPerRow,
      totalMeasures - startMeasure,
    );

    for (let m = 0; m < measuresInThisSystem; m++) {
      const measureIndex = startMeasure + m;
      const timeSig = getTimeSigAtMeasure(measureIndex);
      const config =
        TIME_SIG_CONFIG[getTimeSigKey(timeSig)] || TIME_SIG_CONFIG["4/4"];

      const isFirstInRow = m === 0;
      const showTimeSig = shouldShowTimeSig(measureIndex, isFirstInRow);
      const hasRepeatStart = repeatStartMeasures.has(measureIndex);
      const hasRepeatEnd = repeatEndMeasures.has(measureIndex);

      // Calculate prefix and suffix widths
      // Note: For first measure of row, time sig is rendered in the preamble area
      // (with the clef, at x=85) rather than as a prefix after the bar line.
      // So we only count time sig width for mid-row changes.
      let prefixWidth = 0;
      if (showTimeSig && !isFirstInRow) prefixWidth += TIME_SIG_DISPLAY_WIDTH;
      if (hasRepeatStart) prefixWidth += REPEAT_MARKER_WIDTH;

      let suffixWidth = 0;
      if (hasRepeatEnd) suffixWidth += REPEAT_MARKER_WIDTH;

      measures.push({
        measureIndex,
        timeSignature: timeSig,
        beatsInMeasure: config.beatsPerMeasure,
        beamGroups: config.beamGroups,
        shadeGroups:
          config.shadeGroups || Array(config.beatsPerMeasure).fill(1),
        startBeatInSystem: totalBeats,
        showTimeSig,
        hasRepeatStart,
        hasRepeatEnd,
        prefixWidth,
        suffixWidth,
        xOffset, // Will be recalculated in pass 2
      });

      totalBeats += config.beatsPerMeasure;
      totalDecorationWidth += prefixWidth + suffixWidth;
      xOffset += prefixWidth + suffixWidth; // Placeholder, recalculated later
    }

    systemData.push({ measures, totalBeats, totalDecorationWidth });

    // Effective width = beats at base width + decorations
    const effectiveBeatWidth = BASE_BEAT_WIDTH * noteSpacing;
    const systemEffectiveWidth =
      totalBeats * Math.max(MIN_BEAT_WIDTH, effectiveBeatWidth) +
      totalDecorationWidth;
    maxEffectiveWidth = Math.max(maxEffectiveWidth, systemEffectiveWidth);
  }

  // Calculate uniform system content width (excluding LEFT_MARGIN and RIGHT_MARGIN)
  const uniformContentWidth = maxEffectiveWidth;
  const staffRight = LEFT_MARGIN + uniformContentWidth;
  const svgWidth = staffRight + RIGHT_MARGIN;

  // PASS 2: Build layouts with uniform width and calculate x offsets
  const layouts: SystemLayout[] = [];
  let currentAbsoluteBeat = 0;

  for (let sysIdx = 0; sysIdx < systemCount; sysIdx++) {
    const { measures, totalBeats, totalDecorationWidth } = systemData[sysIdx];

    // Beat width fills remaining space after decorations
    const availableForBeats = uniformContentWidth - totalDecorationWidth;
    const beatWidth = availableForBeats / totalBeats;

    // Recalculate x offsets for each measure
    let currentX = 0;
    for (const measure of measures) {
      measure.xOffset = currentX + measure.prefixWidth;
      currentX =
        measure.xOffset +
        measure.beatsInMeasure * beatWidth +
        measure.suffixWidth;
    }

    layouts.push({
      systemIndex: sysIdx,
      measures,
      startMeasure: sysIdx * measuresPerRow,
      startBeat: currentAbsoluteBeat,
      totalBeats,
      totalDecorationWidth,
      beatWidth,
      measuresPerSystem: measuresPerRow,
      staffRight,
      svgWidth,
    });

    currentAbsoluteBeat += totalBeats;
  }

  return layouts;
}

// Get layout for a specific system (or default if not found)
function getLayoutForSystem(
  systemLayouts: SystemLayout[],
  systemIndex: number,
): SystemLayout {
  // Default fallback values for 8 beats at base width
  const defaultTotalBeats = 8;
  const defaultStaffRight = LEFT_MARGIN + defaultTotalBeats * BASE_BEAT_WIDTH;
  const defaultSvgWidth = defaultStaffRight + RIGHT_MARGIN;

  return (
    systemLayouts[systemIndex] ||
    systemLayouts[0] || {
      systemIndex: 0,
      measures: [
        {
          measureIndex: 0,
          timeSignature: { numerator: 4, denominator: 4 },
          beatsInMeasure: 4,
          beamGroups: [2, 2],
          shadeGroups: [1, 1, 1, 1],
          startBeatInSystem: 0,
        },
      ],
      startMeasure: 0,
      startBeat: 0,
      totalBeats: defaultTotalBeats,
      beatWidth: BASE_BEAT_WIDTH,
      measuresPerSystem: 2,
      staffRight: defaultStaffRight,
      svgWidth: defaultSvgWidth,
    }
  );
}

// Find the best system for a given X position by checking where it maps to a valid beat
// This handles the case where Y drift causes the wrong system to be initially selected
function findBestSystemForX(
  x: number,
  initialSystem: number,
  systemLayouts: SystemLayout[],
  systemCount: number,
): { system: number; beat: number; sysLayout: SystemLayout } {
  // Use actual layout count to ensure we don't access non-existent layouts
  const layoutCount = systemLayouts.length;

  // Helper to calculate beat for a given system
  // Returns both the clamped beat and whether it was clamped (indicates X beyond natural range)
  const calcBeatForSystem = (
    sysIdx: number,
  ): { beat: number; layout: SystemLayout; wasClamped: boolean } | null => {
    // Must be within BOTH systemCount and actual layouts
    if (sysIdx < 0 || sysIdx >= systemCount || sysIdx >= layoutCount)
      return null;
    const layout = systemLayouts[sysIdx];
    if (!layout) return null;

    const noteOffset = getNoteOffset(layout.beatWidth);
    const snappedX = snapX(x, layout.staffRight, layout.beatWidth, layout);
    const rawBeat = getBeatFromXInSystem(layout, snappedX, noteOffset);
    // Check if beat is within valid range (with small tolerance)
    if (rawBeat >= -0.25 && rawBeat < layout.totalBeats + 0.25) {
      const clampedBeat = Math.max(
        0,
        Math.min(layout.totalBeats - 0.5, rawBeat),
      );
      // Beat was clamped if raw value differs from clamped value by more than snap tolerance
      const wasClamped = Math.abs(rawBeat - clampedBeat) > 0.3;
      return {
        beat: clampedBeat,
        layout,
        wasClamped,
      };
    }
    return null;
  };

  // STRATEGY: When Y drift causes wrong system selection, prefer the system
  // where the beat makes more physical sense. Y drift downward is common when
  // clicking at the bottom-right of a row.
  const initialResult = calcBeatForSystem(initialSystem);
  const aboveResult =
    initialSystem > 0 ? calcBeatForSystem(initialSystem - 1) : null;

  // If both systems give valid results, check if the initial beat was clamped
  // Clamping indicates X is beyond the system's natural beat range (Y drift case)
  // Example: clicking at beat 25 (row 2) with Y drift to row 3
  //   - Row 3 raw beat = 3.85, clamped to 3.5 (wasClamped = true)
  //   - Row 2 raw beat = 12.5, not clamped (wasClamped = false)
  //   - Prefer row 2 because X naturally belongs there
  if (initialResult && aboveResult) {
    if (initialResult.wasClamped && !aboveResult.wasClamped) {
      return {
        system: initialSystem - 1,
        beat: aboveResult.beat,
        sysLayout: aboveResult.layout,
      };
    }
  }

  // Use initial system if it has a valid result
  if (initialResult) {
    return {
      system: initialSystem,
      beat: initialResult.beat,
      sysLayout: initialResult.layout,
    };
  }

  // Try system above
  if (aboveResult) {
    return {
      system: initialSystem - 1,
      beat: aboveResult.beat,
      sysLayout: aboveResult.layout,
    };
  }

  // Try system below
  if (initialSystem < systemCount - 1 && initialSystem < layoutCount - 1) {
    const belowResult = calcBeatForSystem(initialSystem + 1);
    if (belowResult) {
      return {
        system: initialSystem + 1,
        beat: belowResult.beat,
        sysLayout: belowResult.layout,
      };
    }
  }

  // Fallback: use the closest valid system
  const fallbackSystemIdx =
    initialSystem < layoutCount ? initialSystem : layoutCount - 1;
  const fallbackLayout =
    systemLayouts[fallbackSystemIdx] ||
    systemLayouts[0] ||
    getLayoutForSystem(systemLayouts, 0);
  const noteOffset = getNoteOffset(fallbackLayout.beatWidth);
  const snappedX = snapX(
    x,
    fallbackLayout.staffRight,
    fallbackLayout.beatWidth,
    fallbackLayout,
  );
  const rawBeat = getBeatFromXInSystem(fallbackLayout, snappedX, noteOffset);
  return {
    system: fallbackSystemIdx,
    beat: Math.max(0, Math.min(fallbackLayout.totalBeats - 0.5, rawBeat)),
    sysLayout: fallbackLayout,
  };
}

// Find which system contains a given absolute beat and return the beat within that system
function getSystemForAbsoluteBeat(
  systemLayouts: SystemLayout[],
  absoluteBeat: number,
): { systemIndex: number; beatInSystem: number } | null {
  for (let i = systemLayouts.length - 1; i >= 0; i--) {
    const layout = systemLayouts[i];
    if (absoluteBeat >= layout.startBeat) {
      return {
        systemIndex: i,
        beatInSystem: absoluteBeat - layout.startBeat,
      };
    }
  }
  // Default to first system if no match (shouldn't happen in practice)
  return systemLayouts.length > 0
    ? { systemIndex: 0, beatInSystem: absoluteBeat }
    : null;
}

// Get the measure info at a given beat position within a system
function getMeasureAtBeat(
  sysLayout: SystemLayout,
  beatInSystem: number,
): MeasureInfo | null {
  for (let i = sysLayout.measures.length - 1; i >= 0; i--) {
    const measure = sysLayout.measures[i];
    if (beatInSystem >= measure.startBeatInSystem) {
      return measure;
    }
  }
  return sysLayout.measures[0] || null;
}

/**
 * Calculate X position for a beat within a system
 *
 * Uses the system's per-measure layout which accounts for:
 * - Time signature decoration widths (at measure boundaries)
 * - Repeat marker widths (start/end markers)
 * - Variable beat width based on noteSpacing setting
 *
 * @returns Rounded X coordinate to prevent sub-pixel rendering artifacts
 */
function getBeatXInSystem(
  sysLayout: SystemLayout,
  beatInSystem: number,
): number {
  const measure = getMeasureAtBeat(sysLayout, beatInSystem);
  if (!measure) {
    // Fallback if no measure found (shouldn't happen in normal use)
    return Math.round(LEFT_MARGIN + beatInSystem * sysLayout.beatWidth);
  }

  // Calculate beat position relative to measure start
  const beatInMeasure = beatInSystem - measure.startBeatInSystem;

  // Use measure's xOffset (accounts for all decorations before this measure)
  // Round to prevent floating-point artifacts in SVG rendering
  return Math.round(
    LEFT_MARGIN + measure.xOffset + beatInMeasure * sysLayout.beatWidth,
  );
}

// Convert X coordinate to beat position within a system (accounts for decorations)
function getBeatFromXInSystem(
  sysLayout: SystemLayout,
  x: number,
  noteOffset: number,
): number {
  // Remove note offset for calculation
  const xWithoutOffset = x - noteOffset;

  // Find which measure this X falls into
  for (const measure of sysLayout.measures) {
    const measureStartX = LEFT_MARGIN + measure.xOffset;
    const measureEndX =
      measureStartX + measure.beatsInMeasure * sysLayout.beatWidth;

    // Extend left tolerance to include prefixWidth (time sig display area)
    // so clicks in the decoration area are assigned to this measure
    const leftTolerance = measure.prefixWidth + 5;

    if (
      xWithoutOffset >= measureStartX - leftTolerance &&
      xWithoutOffset < measureEndX + 5
    ) {
      // X is in this measure - clamp xInMeasure to not go negative
      const xInMeasure = Math.max(0, xWithoutOffset - measureStartX);
      const beatInMeasure = xInMeasure / sysLayout.beatWidth;
      const rawBeat = measure.startBeatInSystem + beatInMeasure;
      return Math.round(rawBeat * 2) / 2; // Snap to half-beats
    }
  }

  // Fallback: use simple calculation (should rarely reach here now)
  const rawBeat = (xWithoutOffset - LEFT_MARGIN) / sysLayout.beatWidth;
  return Math.round(rawBeat * 2) / 2;
}

// Editor-specific note type
export interface EditorNote {
  id: string;
  pitch: Pitch;
  duration: number; // 0.5, 1, 2, or 4 beats
  beat: number; // Position within system (0, 0.5, 1, 1.5, etc.)
  system: number; // Which system/row (0-indexed)
}

// Beam group for rendering connected eighth notes
interface BeamGroup {
  notes: EditorNote[];
  stemDirection: "up" | "down";
}

// Repeat sign marker - supports cross-system repeats
export interface RepeatMarker {
  id: string;
  pairId: string; // Links start and end markers together
  type: "start" | "end";
  measure: number; // Measure number (0, 1, 2 for measures per system)
  system: number;
}

export type NoteTool =
  | "sixteenth"
  | "eighth"
  | "dotted-eighth"
  | "quarter"
  | "dotted-quarter"
  | "half"
  | "dotted-half"
  | "whole"
  | "delete"
  | "repeat"
  | "lyrics"
  | "timesig"
  | null;

interface NoteEditorProps {
  notes: EditorNote[];
  onNotesChange: (notes: EditorNote[]) => void;
  repeatMarkers: RepeatMarker[];
  onRepeatMarkersChange: (markers: RepeatMarker[]) => void;
  lyrics?: LyricSyllable[];
  onLyricsChange?: (lyrics: LyricSyllable[]) => void;
  selectedTool: NoteTool | null;
  showLabels?: boolean;
  showKidFaces?: boolean;
  showGrid?: boolean;
  allowChords?: boolean;
  allowMove?: boolean;
  playheadX?: number | null;
  playheadSystem?: number;
  activeNoteId?: string | null;
  systemCount: number;
  totalMeasures: number; // Actual total measures in composition
  onSystemCountChange: (count: number) => void;
  onDuplicateNote?: () => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  timeSignature?: TimeSignature;
  onStaffClick?: (x: number, system: number) => void;
  tempo?: number;
  isPlaying?: boolean;
  onPlaybackBlock?: () => void;
  measuresPerRow?: number;
  readOnly?: boolean;
  staffLines?: number; // 2-5, controls number of horizontal staff lines (default 3)
  noteSpacing?: number; // 1.0-2.0 (100%-200%) - beat width multiplier (default 1.0)
  // Time signature changes
  timeSignatureChanges?: TimeSignatureChange[];
  onTimeSignatureChangesChange?: (changes: TimeSignatureChange[]) => void;
  onTimeSignatureClick?: () => void; // Called when initial time sig is clicked

  // Learn mode props for progressive music theory tutorial
  learnMode?: boolean; // Enables learn-specific behaviors (simplified UI, interaction callbacks)
  maxVisibleMeasures?: number; // Limit visible measures for focused learning (overrides totalMeasures for display)
  highlightPitchLine?: string; // Highlight a staff line/space for a pitch (e.g., "C4", "G4")
  highlightBeatRange?: [number, number]; // Highlight beat range [startBeat, endBeat] with colored overlay
  onNoteInteraction?: (
    note: EditorNote,
    action: "click" | "place" | "delete",
  ) => void; // Callback for note interactions in learn mode
}

// Layout constants imported from @/lib/layoutUtils
// BEAT_WIDTH alias for backward compatibility
const BEAT_WIDTH = BASE_BEAT_WIDTH;
// Note: STAFF_RIGHT, BEATS_PER_SYSTEM, MEASURES_PER_SYSTEM, SVG_WIDTH are now dynamic
// based on time signature - use getLayoutConfig(timeSignature)

// Base position for natural notes within an octave (C=0, D=1, E=2, F=3, G=4, A=5, B=6)
const NOTE_BASE_POSITIONS: Record<string, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

// Calculate staff position for any pitch (e.g., "Bb4" -> position relative to C4)
function getPitchPosition(pitch: Pitch): number {
  if (pitch === "REST") return -1;

  // Parse pitch: e.g., "Bb4" -> note="B", accidental="b", octave=4
  const match = pitch.match(/^([A-G])(#|b)?(\d)$/);
  if (!match) return 0;

  const [, note, accidental, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);

  // Position within octave (0-6 for C-B)
  const positionInOctave = NOTE_BASE_POSITIONS[note];
  // Accidentals shift position slightly for visual distinction
  const accidentalOffset =
    accidental === "#" ? 0.5 : accidental === "b" ? -0.5 : 0;

  // Calculate position relative to C4 (octave 4 starts at position 0)
  const octaveOffset = (octave - 4) * 7;

  return octaveOffset + positionInOctave + accidentalOffset;
}

// Legacy lookup for common pitches (for backwards compatibility)
const PITCH_POSITIONS: Partial<Record<Pitch, number>> = {
  C4: 0,
  "C#4": 0.5,
  D4: 1,
  "D#4": 1.5,
  E4: 2,
  F4: 3,
  "F#4": 3.5,
  G4: 4,
  "G#4": 4.5,
  A4: 5,
  "A#4": 5.5,
  B4: 6,
  C5: 7,
  REST: -1,
};

const POSITION_TO_PITCH: Pitch[] = [
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
];

// getStaffCenterY imported from @/lib/layoutUtils

function getSystemFromY(y: number, systemCount: number): number {
  // Use actual staff visual boundaries instead of simple SYSTEM_HEIGHT division
  // Each staff has valid note placement from position 7 (top) to position 0 (bottom)
  // Position 7: y = staffCenterY - 48 (above top line)
  // Position 0: y = staffCenterY + 64 (below bottom line)
  // For gaps between systems, use midpoint as boundary

  for (let sys = 0; sys < systemCount; sys++) {
    const staffCenterY = getStaffCenterY(sys);

    // Calculate visual boundaries for this system
    // Extend beyond the exact note positions to catch clicks near the staff
    const topNoteY = staffCenterY - 48; // Position 7 (highest note)
    const bottomNoteY = staffCenterY + 64; // Position 0 (lowest note)

    // Top boundary: midpoint to previous system, or 0 for first system
    let topBound: number;
    if (sys === 0) {
      topBound = 0;
    } else {
      const prevBottomNoteY = getStaffCenterY(sys - 1) + 64;
      topBound = (prevBottomNoteY + topNoteY) / 2;
    }

    // Bottom boundary: midpoint to next system, or Infinity for last system
    let bottomBound: number;
    if (sys === systemCount - 1) {
      bottomBound = Infinity;
    } else {
      const nextTopNoteY = getStaffCenterY(sys + 1) - 48;
      bottomBound = (bottomNoteY + nextTopNoteY) / 2;
    }

    if (y >= topBound && y < bottomBound) {
      return sys;
    }
  }

  // Fallback: use simple division (should rarely reach here)
  const system = Math.floor((y - SYSTEM_TOP_MARGIN) / SYSTEM_HEIGHT);
  return Math.max(0, Math.min(systemCount - 1, system));
}

function getPitchFromY(y: number, system: number): Pitch {
  const staffCenterY = getStaffCenterY(system);
  const bottomLineY = staffCenterY + LINE_SPACING;
  const position = Math.round((bottomLineY - y) / (LINE_SPACING / 2)) + 2;
  const clamped = Math.max(0, Math.min(7, position));
  return POSITION_TO_PITCH[clamped];
}

// Parse pitch into components: "C#4" -> { note: "C", accidental: "#", octave: 4 }
function parsePitch(pitch: Pitch): {
  note: string;
  accidental: "#" | "b" | null;
  octave: number;
} | null {
  if (pitch === "REST") return null;
  const match = pitch.match(/^([A-G])(#|b)?(\d)$/);
  if (!match) return null;
  const [, note, accidental, octaveStr] = match;
  return {
    note,
    accidental: (accidental as "#" | "b") || null,
    octave: parseInt(octaveStr, 10),
  };
}

// Build pitch from components: { note: "C", accidental: "#", octave: 4 } -> "C#4"
function buildPitch(
  note: string,
  accidental: "#" | "b" | null,
  octave: number,
): Pitch {
  const pitchStr = `${note}${accidental || ""}${octave}`;
  return pitchStr as Pitch;
}

// Change octave with clamping to valid range (C3 min, C6 max)
function changeOctave(pitch: Pitch, direction: "up" | "down"): Pitch {
  const parsed = parsePitch(pitch);
  if (!parsed) return pitch;

  const newOctave = direction === "up" ? parsed.octave + 1 : parsed.octave - 1;

  // Clamp to valid range: C3 to C6
  // C6 is the max, but only natural C6 is valid (no C#6 or higher)
  if (newOctave < 3) return pitch;
  if (newOctave > 6) return pitch;
  if (newOctave === 6 && (parsed.note !== "C" || parsed.accidental !== null)) {
    return pitch; // Only C6 is valid in octave 6
  }

  return buildPitch(parsed.note, parsed.accidental, newOctave);
}

/**
 * Convert a pitch to its Y coordinate on the staff.
 *
 * Pitch Position System:
 * - Position 0 = Middle C (C4), which is on a ledger line below the treble staff
 * - Position 2 = E4, which sits ON Line 5 (bottom line of treble staff)
 * - Position 4 = G4, which sits ON Line 4 (second from bottom, where treble clef curls)
 * - Position 6 = B4, which sits ON Line 3 (middle line)
 * - Each position step = one "slot" (either a line or a space)
 *
 * The formula converts position to Y coordinate:
 * 1. Start from Line 5 (bottom line) at staffCenterY + 64
 * 2. Move UP by (position - 2) half-line-spacings
 *    (position 2 is E4 on Line 5, so we measure from there)
 *
 * Visual mapping (treble clef):
 *   Pos 10 = F5 → Line 1 (top)      Y = staffCenterY - 64
 *   Pos  8 = D5 → Line 2            Y = staffCenterY - 32
 *   Pos  6 = B4 → Line 3 (middle)   Y = staffCenterY
 *   Pos  4 = G4 → Line 4            Y = staffCenterY + 32
 *   Pos  2 = E4 → Line 5 (bottom)   Y = staffCenterY + 64
 */
function getYFromPitch(pitch: Pitch, system: number): number {
  const pos = PITCH_POSITIONS[pitch] ?? getPitchPosition(pitch);
  const staffCenterY = getStaffCenterY(system);
  if (pos < 0) return staffCenterY;

  // Round to handle accidentals (sharps/flats share visual position with their natural)
  const roundedPos = Math.round(pos);

  // Line 5 (E4, position 2) is at staffCenterY + 2*LINE_SPACING (64px below center)
  // Each position step moves by LINE_SPACING/2 (16px)
  const bottomLineY = staffCenterY + 2 * LINE_SPACING;
  return bottomLineY - (roundedPos - 2) * (LINE_SPACING / 2);
}

/**
 * Convert beat position to X coordinate (for rendering)
 * Notes are centered within their beat column via getNoteOffset.
 * @returns Rounded X coordinate to prevent sub-pixel rendering issues
 */
function getXFromBeat(beat: number, beatWidth: number = BEAT_WIDTH): number {
  // Round to prevent floating-point artifacts in SVG (e.g., 236.14583...)
  return Math.round(LEFT_MARGIN + beat * beatWidth + getNoteOffset(beatWidth));
}

// Convert X coordinate to beat position (for placement)
function getBeatFromX(x: number, beatWidth: number = BEAT_WIDTH): number {
  const rawBeat = (x - LEFT_MARGIN - getNoteOffset(beatWidth)) / beatWidth;
  return Math.round(rawBeat * 2) / 2; // Snap to half-beats
}

function snapX(
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
function getMeasureFromX(
  x: number,
  beatsPerMeasure: number,
  beatWidth: number = BEAT_WIDTH,
): number {
  const beatsFromLeft = (x - LEFT_MARGIN) / beatWidth;
  // Use Math.round instead of Math.floor so clicks near bar lines
  // are assigned to the nearest measure (more intuitive)
  return Math.round(beatsFromLeft / beatsPerMeasure);
}

function getDurationFromTool(tool: NoteTool): number {
  switch (tool) {
    case "sixteenth":
      return 0.25;
    case "eighth":
      return 0.5;
    case "dotted-eighth":
      return 0.75;
    case "quarter":
      return 1;
    case "dotted-quarter":
      return 1.5;
    case "half":
      return 2;
    case "dotted-half":
      return 3;
    case "whole":
      return 4;
    default:
      return 1;
  }
}

// Menu note icon SVG for context menu (matches actual note rendering)
function MenuNoteIcon({
  duration,
  color = "#6b7280",
}: {
  duration: number;
  color?: string;
}) {
  // Determine note characteristics based on duration
  const isWhole = duration === 4;
  const isHalf = duration === 2 || duration === 3;
  const isHollow = isWhole || isHalf;
  const hasStem = !isWhole;
  const hasFlag = duration === 0.5 || duration === 0.75;
  const hasDoubleFlag = duration === 0.25;
  const hasDot = duration === 0.75 || duration === 1.5 || duration === 3;

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="inline-block flex-shrink-0"
    >
      {/* Note head */}
      <ellipse
        cx={isWhole ? 12 : 10}
        cy="16"
        rx="5"
        ry="3.5"
        fill={isHollow ? "transparent" : color}
        stroke={color}
        strokeWidth={isHollow ? 1.5 : 1}
        transform={`rotate(-15 ${isWhole ? 12 : 10} 16)`}
      />
      {/* Stem */}
      {hasStem && (
        <line x1="14" y1="15" x2="14" y2="4" stroke={color} strokeWidth={1.5} />
      )}
      {/* Single flag for eighth notes */}
      {hasFlag && (
        <path
          d="M 14 4 Q 19 7 17 12"
          stroke={color}
          strokeWidth={1.5}
          fill="none"
        />
      )}
      {/* Double flag for sixteenth notes */}
      {hasDoubleFlag && (
        <>
          <path
            d="M 14 4 Q 19 6 17 10"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
          />
          <path
            d="M 14 7 Q 19 9 17 13"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
          />
        </>
      )}
      {/* Dot for dotted notes */}
      {hasDot && <circle cx="18" cy="16" r="1.5" fill={color} />}
    </svg>
  );
}

/**
 * Group Eighth Notes for Beaming
 *
 * Music engraving rules for beaming:
 * 1. Only beam notes with flags (eighth notes and shorter): 0.25, 0.5, 0.75 beats
 * 2. Never beam across beat group boundaries (defined by beamGroups in TIME_SIG_CONFIG)
 *    - In 4/4: don't beam beats 2→3 (first half vs second half)
 *    - In 6/8: beam groups of 3 (compound meter)
 * 3. Never beam across bar lines
 * 4. Don't beam notes with other notes (quarter notes, etc.) in between them
 *
 * The algorithm:
 * - Sort beamable notes by position
 * - Group consecutive notes that share the same "beat group"
 * - A beat group is determined by the time signature's beamGroups array
 */
function groupEighthNotes(
  allNotes: EditorNote[],
  systemLayouts: SystemLayout[],
): BeamGroup[] {
  // Include sixteenths (0.25), eighths (0.5), and dotted eighths (0.75) for beaming
  const beamableNotes = allNotes.filter(
    (n) => n.duration === 0.25 || n.duration === 0.5 || n.duration === 0.75,
  );

  // Sort all notes by system, then by beat position (for checking notes in between)
  const allSorted = [...allNotes].sort((a, b) => {
    if (a.system !== b.system) return a.system - b.system;
    return a.beat - b.beat;
  });

  // Sort beamable notes by system, then by beat position
  const sorted = [...beamableNotes].sort((a, b) => {
    if (a.system !== b.system) return a.system - b.system;
    return a.beat - b.beat;
  });

  // Helper to check if there's any note between two notes
  const hasNoteBetween = (note1: EditorNote, note2: EditorNote): boolean => {
    if (note1.system !== note2.system) return true; // Different systems = don't beam
    const minBeat = Math.min(note1.beat, note2.beat);
    const maxBeat = Math.max(note1.beat, note2.beat);
    return allSorted.some(
      (n) =>
        n.system === note1.system &&
        n.beat > minBeat + 0.1 &&
        n.beat < maxBeat - 0.1 &&
        n.id !== note1.id &&
        n.id !== note2.id,
    );
  };

  const groups: BeamGroup[] = [];
  let currentGroup: EditorNote[] = [];
  let currentBeatGroup = -1;

  for (const note of sorted) {
    // Get per-system layout and find the measure containing this note
    const sysLayout = getLayoutForSystem(systemLayouts, note.system);
    const measureInfo = getMeasureAtBeat(sysLayout, note.beat);
    if (!measureInfo) continue;

    // Use the measure's time signature config
    const config = {
      beatsPerMeasure: measureInfo.beatsInMeasure,
      beamGroups: measureInfo.beamGroups,
    };

    // Calculate which beat within the measure this note is on
    const beatInMeasure = note.beat - measureInfo.startBeatInSystem;
    const measureBeat = beatInMeasure % config.beatsPerMeasure;

    // Find which beam group this beat belongs to
    let beatGroup = 0;
    let beatCount = 0;
    for (let i = 0; i < config.beamGroups.length; i++) {
      beatCount += config.beamGroups[i];
      if (measureBeat < beatCount) {
        beatGroup = i;
        break;
      }
    }

    // Calculate absolute beat group (including system and measure)
    const absoluteBeatGroup =
      note.system * 1000 + measureInfo.measureIndex * 100 + beatGroup;

    // Check if this note should join the current group
    if (currentGroup.length === 0) {
      currentGroup.push(note);
      currentBeatGroup = absoluteBeatGroup;
    } else if (absoluteBeatGroup === currentBeatGroup) {
      // Same beat group - check if consecutive AND no notes in between
      const lastNote = currentGroup[currentGroup.length - 1];
      const beatDiff = note.beat - lastNote.beat;
      // Only beam if adjacent (within 1.5 beats) AND no other notes in between
      if (beatDiff > 0 && beatDiff <= 1.5 && !hasNoteBetween(lastNote, note)) {
        currentGroup.push(note);
      } else {
        // Not consecutive or has notes in between, finish current group
        if (currentGroup.length >= 2) {
          groups.push(createBeamGroup(currentGroup));
        }
        currentGroup = [note];
        currentBeatGroup = absoluteBeatGroup;
      }
    } else {
      // Different beat group, finish current and start new
      if (currentGroup.length >= 2) {
        groups.push(createBeamGroup(currentGroup));
      }
      currentGroup = [note];
      currentBeatGroup = absoluteBeatGroup;
    }
  }

  // Don't forget the last group
  if (currentGroup.length >= 2) {
    groups.push(createBeamGroup(currentGroup));
  }

  return groups;
}

/**
 * Create a Beam Group with Stem Direction
 *
 * Stem direction rules (standard music engraving):
 * 1. Find the note furthest from the middle line (Line 3)
 * 2. ALL notes in the group get the same stem direction
 * 3. If furthest note is above middle → stems point DOWN
 *    If furthest note is below middle → stems point UP
 * 4. If equidistant, default to stems DOWN (common convention)
 *
 * This ensures the beam doesn't collide with nearby staff lines.
 */
function createBeamGroup(notes: EditorNote[]): BeamGroup {
  let maxDistance = 0;
  let stemDirection: "up" | "down" = "up";

  for (const note of notes) {
    const staffCenterY = getStaffCenterY(note.system);
    const noteY = getYFromPitch(note.pitch, note.system);
    const distance = Math.abs(noteY - staffCenterY);
    if (distance > maxDistance) {
      maxDistance = distance;
      // Note above center (lower Y) → stems down; note below center → stems up
      stemDirection = noteY < staffCenterY ? "down" : "up";
    }
  }

  return { notes, stemDirection };
}

export function NoteEditor({
  notes,
  onNotesChange,
  repeatMarkers,
  onRepeatMarkersChange,
  lyrics = [],
  onLyricsChange,
  selectedTool,
  showLabels = true,
  showKidFaces = false,
  showGrid = false,
  allowChords = false,
  allowMove = false,
  playheadX = null,
  playheadSystem = 0,
  activeNoteId = null,
  systemCount,
  totalMeasures,
  onSystemCountChange,
  onDuplicateNote,
  svgRef: externalSvgRef,
  timeSignature = { numerator: 4, denominator: 4 },
  onStaffClick,
  tempo = 100,
  isPlaying = false,
  onPlaybackBlock,
  measuresPerRow,
  readOnly = false,
  staffLines = 3,
  noteSpacing = 1.0,
  timeSignatureChanges = [],
  onTimeSignatureChangesChange,
  onTimeSignatureClick,
  // Learn mode props
  learnMode = false,
  maxVisibleMeasures,
  highlightPitchLine,
  highlightBeatRange,
  onNoteInteraction,
}: NoteEditorProps) {
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalSvgRef || internalSvgRef;

  // Interactive tutorial hook
  const { reportAction, isActive: tutorialActive } = useInteractiveTutorial();

  // Get dynamic layout based on time signature and measures per row
  // For backward compatibility, also compute a "default" layout from initial time sig
  const defaultLayout = useMemo(
    () => getLayoutConfig(timeSignature, measuresPerRow, noteSpacing),
    [timeSignature, measuresPerRow, noteSpacing],
  );

  // Calculate per-system layouts based on time signature changes and note spacing
  // Includes dynamic space for time signatures and repeat markers
  const systemLayouts = useMemo(
    () =>
      calculateSystemLayouts(
        systemCount,
        totalMeasures,
        timeSignature,
        timeSignatureChanges || [],
        measuresPerRow ?? 4, // Default to 4 measures per row
        noteSpacing, // Beat width multiplier (1.0-2.0)
        // Convert RepeatMarker (system + measure) to absolute measure number
        repeatMarkers.map((m) => ({
          measureNumber: m.system * (measuresPerRow ?? 4) + m.measure,
          type: m.type,
        })),
      ),
    [
      systemCount,
      totalMeasures,
      timeSignature,
      timeSignatureChanges,
      measuresPerRow,
      noteSpacing,
      repeatMarkers,
    ],
  );

  // Get max SVG width (widest system determines canvas width)
  const maxSvgWidth = useMemo(
    () =>
      Math.max(...systemLayouts.map((l) => l.svgWidth), defaultLayout.svgWidth),
    [systemLayouts, defaultLayout.svgWidth],
  );

  // Keep these for backward compatibility with code that uses single layout
  // (will be gradually replaced with per-system lookups)
  const {
    beatsPerSystem,
    beatsPerMeasure,
    staffRight,
    svgWidth: _svgWidth,
    measuresPerSystem,
    shadeGroups,
  } = defaultLayout;

  // Use maxSvgWidth for the actual canvas
  const svgWidth = maxSvgWidth;

  // Group eighth notes for beaming (uses per-system layouts for variable time signatures)
  const beamGroups = useMemo(
    () => groupEighthNotes(notes, systemLayouts),
    [notes, systemLayouts],
  );

  // Get set of note IDs that are part of beam groups (for skipping individual flags)
  const beamedNoteIds = useMemo(() => {
    const ids = new Set<string>();
    for (const group of beamGroups) {
      for (const note of group.notes) {
        ids.add(note.id);
      }
    }
    return ids;
  }, [beamGroups]);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [draggedMarker, setDraggedMarker] = useState<{
    id: string;
    type: "start" | "end";
    system: number;
    originalMeasure: number;
  } | null>(null);
  // Inline lyric editing state
  const [editingLyric, setEditingLyric] = useState<{
    absoluteBeat: number;
    initialText: string;
  } | null>(null);
  // Track mouse position during marker drag for preview
  const [markerDragPosition, setMarkerDragPosition] = useState<{
    x: number;
    y: number;
    targetSystem: number;
    targetMeasure: number;
  } | null>(null);
  const [repeatStart, setRepeatStart] = useState<{
    system: number;
    measure: number;
  } | null>(null);
  const [hoveredRepeatMeasure, setHoveredRepeatMeasure] = useState<{
    system: number;
    measure: number;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<
    | {
        type: "note";
        noteId: string;
        x: number;
        y: number;
      }
    | {
        type: "empty";
        x: number;
        y: number;
        beat: number;
        system: number;
        pitch: Pitch;
      }
    | null
  >(null);

  // Collapsed sections state for context menu (persisted in localStorage)
  // SSR safe: initializeWithValue: false prevents hydration mismatch
  const [collapsedSections, setCollapsedSections] = useLocalStorage<{
    duration: boolean;
    accidental: boolean;
    changeNote: boolean;
    octave: boolean;
  }>(
    "note-menu-collapsed",
    { duration: false, accidental: false, changeNote: false, octave: false },
    { initializeWithValue: false },
  );

  const toggleSection = useCallback(
    (section: "duration" | "accidental" | "changeNote" | "octave") => {
      setCollapsedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    },
    [setCollapsedSections],
  );

  const justDraggedRef = useRef(false);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  // Hovered bar line for time signature ghost preview
  const [hoveredTimeSigBar, setHoveredTimeSigBar] = useState<{
    systemIndex: number;
    measureIndex: number;
  } | null>(null);
  // Time signature change picker state
  const [timeSigPicker, setTimeSigPicker] = useState<{
    measureNumber: number;
    x: number;
    y: number;
  } | null>(null);

  // Clear tool-specific state when tool changes
   
  useEffect(() => {
    if (selectedTool !== "repeat") {
      setRepeatStart(null);
      setHoveredRepeatMeasure(null);
    }
    if (selectedTool !== "timesig") {
      setTimeSigPicker(null);
      setHoveredTimeSigBar(null);
    }
    // Intentional cleanup effect when tool changes
  }, [selectedTool]);

  const svgHeight = SYSTEM_TOP_MARGIN + systemCount * SYSTEM_HEIGHT + 40;

  const getCoords = useCallback(
    (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [],
  );

  const playNoteSound = useCallback(
    (pitch: Pitch, durationBeats: number) => {
      const midi = pitchToMidi(pitch);
      if (midi > 0) {
        const player = getAudioPlayer();
        // Convert beats to seconds using tempo
        const durationSeconds = (durationBeats * 60) / tempo;
        player.playNote(midi, durationSeconds);
      }
    },
    [tempo],
  );

  const handleNoteContextMenu = useCallback(
    (e: React.MouseEvent, noteId: string) => {
      e.preventDefault();
      e.stopPropagation();

      // Block context menu in read-only mode
      if (readOnly) return;

      // Calculate menu position to prevent off-screen overflow
      const menuWidth = 180; // Wider for new sections
      const menuHeight = 520; // Taller: 8 durations + accidentals + notes + octave + delete
      const padding = 8; // padding from edges

      let x = e.clientX;
      let y = e.clientY;

      // Check right edge
      if (x + menuWidth + padding > window.innerWidth) {
        x = window.innerWidth - menuWidth - padding;
      }

      // Check bottom edge
      if (y + menuHeight + padding > window.innerHeight) {
        y = window.innerHeight - menuHeight - padding;
      }

      // Check left edge
      if (x < padding) {
        x = padding;
      }

      // Check top edge
      if (y < padding) {
        y = padding;
      }

      setContextMenu({ type: "note", noteId, x, y });
    },
    [readOnly],
  );

  const handleChangeDuration = useCallback(
    (duration: number) => {
      if (!contextMenu || contextMenu.type !== "note") return;
      if (isPlaying) {
        onPlaybackBlock?.();
        setContextMenu(null);
        return;
      }
      onNotesChange(
        notes.map((n) =>
          n.id === contextMenu.noteId ? { ...n, duration } : n,
        ),
      );
      setContextMenu(null);
    },
    [contextMenu, notes, onNotesChange, isPlaying, onPlaybackBlock],
  );

  const handleDeleteFromMenu = useCallback(() => {
    if (!contextMenu || contextMenu.type !== "note") return;
    if (isPlaying) {
      onPlaybackBlock?.();
      setContextMenu(null);
      return;
    }
    onNotesChange(notes.filter((n) => n.id !== contextMenu.noteId));
    setContextMenu(null);
  }, [contextMenu, notes, onNotesChange, isPlaying, onPlaybackBlock]);

  // Handler for changing note accidental (sharp, flat, natural)
  const handleChangeAccidental = useCallback(
    (accidental: "#" | "b" | null) => {
      if (!contextMenu || contextMenu.type !== "note") return;
      if (isPlaying) {
        onPlaybackBlock?.();
        setContextMenu(null);
        return;
      }

      const note = notes.find((n) => n.id === contextMenu.noteId);
      if (!note) return;

      const parsed = parsePitch(note.pitch);
      if (!parsed) return;

      // Build new pitch with the selected accidental
      const newPitch = buildPitch(parsed.note, accidental, parsed.octave);

      onNotesChange(
        notes.map((n) =>
          n.id === contextMenu.noteId ? { ...n, pitch: newPitch } : n,
        ),
      );
      setContextMenu(null);
    },
    [contextMenu, notes, onNotesChange, isPlaying, onPlaybackBlock],
  );

  // Handler for changing note letter (C-B) while keeping octave and accidental
  const handleChangePitchLetter = useCallback(
    (newLetter: string) => {
      if (!contextMenu || contextMenu.type !== "note") return;
      if (isPlaying) {
        onPlaybackBlock?.();
        setContextMenu(null);
        return;
      }

      const note = notes.find((n) => n.id === contextMenu.noteId);
      if (!note) return;

      const parsed = parsePitch(note.pitch);
      if (!parsed) return;

      // Keep the same accidental and octave, change the note letter
      // But handle edge cases: C6 can't have accidentals
      let newAccidental = parsed.accidental;
      if (parsed.octave === 6 && newLetter !== "C") {
        // Can't go above C6, so clamp to B5
        const newPitch = buildPitch(newLetter, newAccidental, 5);
        onNotesChange(
          notes.map((n) =>
            n.id === contextMenu.noteId ? { ...n, pitch: newPitch } : n,
          ),
        );
      } else {
        // If we're at C6 with an accidental attempting to change letter, drop accidental
        if (parsed.octave === 6 && newAccidental !== null) {
          newAccidental = null;
        }
        const newPitch = buildPitch(newLetter, newAccidental, parsed.octave);
        onNotesChange(
          notes.map((n) =>
            n.id === contextMenu.noteId ? { ...n, pitch: newPitch } : n,
          ),
        );
      }
      setContextMenu(null);
    },
    [contextMenu, notes, onNotesChange, isPlaying, onPlaybackBlock],
  );

  // Handler for changing octave up/down
  const handleChangeOctave = useCallback(
    (direction: "up" | "down") => {
      if (!contextMenu || contextMenu.type !== "note") return;
      if (isPlaying) {
        onPlaybackBlock?.();
        setContextMenu(null);
        return;
      }

      const note = notes.find((n) => n.id === contextMenu.noteId);
      if (!note) return;

      const newPitch = changeOctave(note.pitch, direction);
      if (newPitch === note.pitch) {
        // Octave change was blocked (at boundary)
        setContextMenu(null);
        return;
      }

      onNotesChange(
        notes.map((n) =>
          n.id === contextMenu.noteId ? { ...n, pitch: newPitch } : n,
        ),
      );
      setContextMenu(null);
    },
    [contextMenu, notes, onNotesChange, isPlaying, onPlaybackBlock],
  );

  // Handler for adding a note from empty space context menu
  const handleAddNoteFromMenu = useCallback(
    (duration: number) => {
      if (!contextMenu || contextMenu.type !== "empty") return;
      if (isPlaying) {
        onPlaybackBlock?.();
        setContextMenu(null);
        return;
      }

      // Check for collision at this position
      const existingNote = notes.find(
        (n) =>
          Math.abs(n.beat - contextMenu.beat) < 0.25 &&
          n.system === contextMenu.system &&
          (allowChords ? n.pitch === contextMenu.pitch : true),
      );
      if (existingNote) {
        onDuplicateNote?.();
        setContextMenu(null);
        return;
      }

      const newNote: EditorNote = {
        id: String(Date.now()),
        pitch: contextMenu.pitch,
        duration,
        beat: contextMenu.beat,
        system: contextMenu.system,
      };

      onNotesChange([...notes, newNote]);
      playNoteSound(contextMenu.pitch, duration);
      setContextMenu(null);
    },
    [
      contextMenu,
      notes,
      onNotesChange,
      isPlaying,
      onPlaybackBlock,
      allowChords,
      onDuplicateNote,
      playNoteSound,
    ],
  );

  // Handler for empty space right-click
  const handleEmptyContextMenu = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      e.preventDefault();

      // Block context menu in read-only mode
      if (readOnly) return;

      // Block during playback
      if (isPlaying) {
        onPlaybackBlock?.();
        return;
      }

      const { x, y } = getCoords(e);
      const initialSystem = getSystemFromY(y, systemCount);

      // Find the best system for this X position (handles Y drift near system boundaries)
      const {
        system: bestSystem,
        beat,
        sysLayout: sysLayoutForCtx,
      } = findBestSystemForX(x, initialSystem, systemLayouts, systemCount);

      const staffCenterY = getStaffCenterY(bestSystem);
      const sysStaffRightForCtx = sysLayoutForCtx.staffRight;

      // Check if click is within valid staff bounds (include some margin)
      if (x < LEFT_MARGIN - 10 || x > sysStaffRightForCtx + 10) return;
      if (y < staffCenterY - LINE_SPACING * 2 - 20) return;
      if (y > staffCenterY + LINE_SPACING * 2 + 20) return;

      // Check if clicking on an existing note (let note handler take over)
      const pitch = getPitchFromY(y, bestSystem);

      const clickedNote = notes.find(
        (n) =>
          Math.abs(n.beat - beat) < 0.25 &&
          n.system === bestSystem &&
          n.pitch === pitch,
      );
      if (clickedNote) {
        // A note exists here - don't show empty menu
        return;
      }

      // Calculate menu position
      const menuWidth = 180;
      const menuHeight = 340; // Shorter: only 8 duration options
      const padding = 8;

      let menuX = e.clientX;
      let menuY = e.clientY;

      if (menuX + menuWidth + padding > window.innerWidth) {
        menuX = window.innerWidth - menuWidth - padding;
      }
      if (menuY + menuHeight + padding > window.innerHeight) {
        menuY = window.innerHeight - menuHeight - padding;
      }
      if (menuX < padding) menuX = padding;
      if (menuY < padding) menuY = padding;

      setContextMenu({
        type: "empty",
        x: menuX,
        y: menuY,
        beat,
        system: bestSystem,
        pitch,
      });
    },
    [
      readOnly,
      isPlaying,
      onPlaybackBlock,
      getCoords,
      systemCount,
      staffRight,
      notes,
      systemLayouts,
    ],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Close context menu on any click
      if (contextMenu) {
        setContextMenu(null);
        return;
      }

      if (draggedNote) return;

      // Skip if we just finished dragging (click fires after mouseup)
      if (justDraggedRef.current) {
        justDraggedRef.current = false;
        return;
      }

      // Block modifications during playback (except seek which is handled by onStaffClick)
      if (isPlaying && selectedTool !== null) {
        onPlaybackBlock?.();
        return;
      }

      const { x, y } = getCoords(e);
      const system = getSystemFromY(y, systemCount);
      const staffCenterY = getStaffCenterY(system);

      // Get system-specific layout for proper bounds check
      const sysLayoutForBounds = getLayoutForSystem(systemLayouts, system);
      const sysStaffRight = sysLayoutForBounds.staffRight;

      if (x < LEFT_MARGIN - 20 || x > sysStaffRight + 20) return;
      if (y < staffCenterY - LINE_SPACING * 2 - 30) return;
      if (y > staffCenterY + LINE_SPACING * 2 + 30) return;

      // Call onStaffClick for seek functionality
      if (onStaffClick) {
        onStaffClick(x, system);
      }

      // Block all editing in read-only mode (seek still works above)
      if (readOnly) return;

      // No action when no tool is selected
      if (selectedTool === null) return;

      // Handle repeat tool - allows multiple repeat sections
      if (selectedTool === "repeat") {
        // Get this system's layout for variable beat width
        const sysLayout = getLayoutForSystem(systemLayouts, system);
        const sysBeatWidth = sysLayout.beatWidth;

        // Calculate beat position within the current system using variable beat width
        const beatInSystem = (x - LEFT_MARGIN) / sysBeatWidth;

        // Find which measure this beat falls in (using per-measure info)
        const measureInfo = getMeasureAtBeat(sysLayout, beatInSystem);
        const measureContainingClick = measureInfo
          ? sysLayout.measures.indexOf(measureInfo)
          : Math.floor(beatInSystem / defaultLayout.beatsPerMeasure);
        const clampedMeasure = Math.max(
          0,
          Math.min(measuresPerSystem - 1, measureContainingClick),
        );

        if (!repeatStart) {
          // First click - set start position
          setRepeatStart({ system, measure: clampedMeasure });
        } else {
          // Second click - determine which is start and which is end
          const firstClickSystem = repeatStart.system;
          const firstClickMeasure = repeatStart.measure;
          const secondClickSystem = system;
          const secondClickMeasure = clampedMeasure;

          // Calculate absolute measures to determine order
          const firstAbsolute =
            firstClickSystem * measuresPerSystem + firstClickMeasure;
          const secondAbsolute =
            secondClickSystem * measuresPerSystem + secondClickMeasure;

          // AUTO-SWAP LOGIC: Allow clicking in any order
          // - Clicking measure 3 then 1 produces same result as 1 then 3
          // - Always place earlier measure as start, later as end
          let startSystem: number, startMeasure: number;
          let endClickSystem: number, endClickMeasure: number;

          if (firstAbsolute <= secondAbsolute) {
            // Normal order: first click is start, second is end
            startSystem = firstClickSystem;
            startMeasure = firstClickMeasure;
            endClickSystem = secondClickSystem;
            endClickMeasure = secondClickMeasure;
          } else {
            // Reverse order: second click is start, first is end
            startSystem = secondClickSystem;
            startMeasure = secondClickMeasure;
            endClickSystem = firstClickSystem;
            endClickMeasure = firstClickMeasure;
          }

          // CRITICAL: Increment END marker to place at end of clicked measure
          // - User clicks measure 3 expecting to INCLUDE measure 3 in the repeat
          // - Bar lines mark the START of each measure
          // - End of measure 3 = start of measure 4
          // - So we increment by 1 to place marker at end of clicked measure
          // - Example: Click 1 → 3 creates repeat from start of 1 to end of 3
          let endSystem = endClickSystem;
          let endMeasure = endClickMeasure + 1;

          // Handle system overflow when incrementing
          if (endMeasure >= measuresPerSystem) {
            endMeasure = 0;
            endSystem = endClickSystem + 1;
          }

          // Calculate final absolute measures
          const startAbsoluteMeasure =
            startSystem * measuresPerSystem + startMeasure;
          const endAbsoluteMeasure = endSystem * measuresPerSystem + endMeasure;

          // Only create if end is after start (should always be true)
          if (endAbsoluteMeasure > startAbsoluteMeasure) {
            // Check if this would overlap with existing repeat sections
            const hasOverlap = repeatMarkers.some((m) => {
              const markerAbsoluteMeasure =
                m.system * measuresPerSystem + m.measure;
              // Check if the new section overlaps with existing markers
              if (
                m.type === "start" &&
                markerAbsoluteMeasure >= startAbsoluteMeasure &&
                markerAbsoluteMeasure < endAbsoluteMeasure
              )
                return true;
              if (
                m.type === "end" &&
                markerAbsoluteMeasure > startAbsoluteMeasure &&
                markerAbsoluteMeasure <= endAbsoluteMeasure
              )
                return true;
              return false;
            });

            if (!hasOverlap) {
              // Add new markers without removing existing ones
              const pairId = `pair-${Date.now()}`;
              const newMarkers = [
                ...repeatMarkers,
                {
                  id: `start-${Date.now()}`,
                  pairId,
                  type: "start" as const,
                  measure: startMeasure,
                  system: startSystem,
                },
                {
                  id: `end-${Date.now() + 1}`,
                  pairId,
                  type: "end" as const,
                  measure: endMeasure,
                  system: endSystem,
                },
              ];
              onRepeatMarkersChange(newMarkers);
            } else {
              // Show clear user feedback when overlap is detected
              // Prevents silent failure and explains why markers weren't placed
              toast.error(
                "Cannot place repeat markers over existing repeat sections",
              );
            }
          }
          setRepeatStart(null);
          setHoveredRepeatMeasure(null);
        }
        return;
      }

      if (selectedTool === "delete") return;

      // Handle time signature tool - click on bar lines to insert changes
      if (selectedTool === "timesig") {
        // Get this system's layout for variable beat width
        const sysLayout = getLayoutForSystem(systemLayouts, system);
        const sysBeatWidth = sysLayout.beatWidth;

        // Calculate beat position within the current system using variable beat width
        const beatInSystem = (x - LEFT_MARGIN) / sysBeatWidth;

        // Find which measure boundary is closest to the click
        let closestBarLineIndex = 0;
        let closestDistance = Infinity;
        for (let i = 0; i <= sysLayout.measures.length; i++) {
          const barBeat =
            i < sysLayout.measures.length
              ? sysLayout.measures[i].startBeatInSystem
              : sysLayout.totalBeats;
          const distance = Math.abs(beatInSystem - barBeat);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestBarLineIndex = i;
          }
        }

        // Calculate absolute measure number
        const absoluteMeasure = sysLayout.startMeasure + closestBarLineIndex;

        // Don't allow time sig change at measure 0 (that's the initial time sig)
        if (absoluteMeasure <= 0) {
          toast.error("Use the settings to change the initial time signature");
          return;
        }

        // Open the time signature picker at the bar line position
        const barLineBeat =
          closestBarLineIndex < sysLayout.measures.length
            ? sysLayout.measures[closestBarLineIndex].startBeatInSystem
            : sysLayout.totalBeats;
        const barLineX = LEFT_MARGIN + barLineBeat * sysBeatWidth;
        const staffCenterYForPicker = getStaffCenterY(system);
        setTimeSigPicker({
          measureNumber: absoluteMeasure,
          x: barLineX,
          y: staffCenterYForPicker,
        });
        return;
      }

      // Handle lyrics tool - detect clicks in the lyrics area
      if (selectedTool === "lyrics") {
        const lyricsZoneTop = staffCenterY + LINE_SPACING + 40;
        const lyricsZoneBottom = staffCenterY + LINE_SPACING + 70;

        // Check if click is in the lyrics area
        if (y >= lyricsZoneTop && y <= lyricsZoneBottom) {
          // Get this system's layout for variable beat width
          const sysLayout = getLayoutForSystem(systemLayouts, system);
          const sysBeatWidth = sysLayout.beatWidth;

          // Calculate the beat position from click using variable beat width
          const beatInSystem =
            (x - LEFT_MARGIN - getNoteOffset(sysBeatWidth)) / sysBeatWidth;
          // Snap to nearest half-beat
          const snappedBeatInSystem = Math.round(beatInSystem * 2) / 2;
          // Clamp to valid range
          const clampedBeatInSystem = Math.max(
            0,
            Math.min(sysLayout.totalBeats - 1, snappedBeatInSystem),
          );
          // Calculate absolute beat
          const absoluteBeat = sysLayout.startBeat + clampedBeatInSystem;

          // Find existing lyric at this beat
          const existingLyric = lyrics.find(
            (l) => Math.abs(l.absoluteBeat - absoluteBeat) < 0.1,
          );

          // Open inline editor
          setEditingLyric({
            absoluteBeat,
            initialText: existingLyric?.text || "",
          });
        }
        return;
      }

      // Find the best system for this X position (handles Y drift near system boundaries)
      const {
        system: bestSystem,
        beat,
        sysLayout: sysLayoutForNote,
      } = findBestSystemForX(x, system, systemLayouts, systemCount);

      // Use the corrected system for pitch calculation
      const pitch = getPitchFromY(y, bestSystem);

      // Check for collision
      // If allowChords: only block exact same position (beat + pitch)
      // Otherwise: block any note on same beat
      const existingNote = notes.find(
        (n) =>
          Math.abs(n.beat - beat) < 0.25 &&
          n.system === bestSystem &&
          (allowChords ? n.pitch === pitch : true),
      );
      if (existingNote) {
        onDuplicateNote?.();
        return;
      }

      const duration = getDurationFromTool(selectedTool);
      const newNote: EditorNote = {
        id: String(Date.now()),
        pitch,
        duration,
        beat,
        system: bestSystem,
      };

      onNotesChange([...notes, newNote]);
      playNoteSound(pitch, duration);

      // Report to interactive tutorial
      if (tutorialActive) {
        reportAction({ type: "place-note" });
      }
    },
    [
      selectedTool,
      draggedNote,
      getCoords,
      notes,
      onNotesChange,
      playNoteSound,
      systemCount,
      repeatMarkers,
      onRepeatMarkersChange,
      repeatStart,
      contextMenu,
      onStaffClick,
      allowChords,
      measuresPerSystem,
      tutorialActive,
      reportAction,
      staffRight,
      defaultLayout.beatsPerMeasure,
      onDuplicateNote,
      isPlaying,
      onPlaybackBlock,
      readOnly,
      beatsPerSystem,
      lyrics,
      systemLayouts,
    ],
  );

  const handleNoteMouseDown = useCallback(
    (e: React.MouseEvent, noteId: string) => {
      e.stopPropagation();
      if (readOnly) return;
      if (isPlaying) {
        onPlaybackBlock?.();
        return;
      }
      if (selectedTool === "delete") {
        onNotesChange(notes.filter((n) => n.id !== noteId));
        // Report to interactive tutorial
        if (tutorialActive) {
          reportAction({ type: "delete-note" });
        }
        return;
      }
      // Only allow drag if move mode is enabled
      if (allowMove) {
        setDraggedNote(noteId);
      }
    },
    [
      selectedTool,
      notes,
      onNotesChange,
      isPlaying,
      onPlaybackBlock,
      tutorialActive,
      reportAction,
      allowMove,
      readOnly,
    ],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const { x, y } = getCoords(e);

      // Handle repeat placement hover preview (show even before first click)
      if (selectedTool === "repeat" && !draggedMarker) {
        const system = getSystemFromY(y, systemCount);

        // Get this system's layout for variable beat width
        const sysLayoutForHover = getLayoutForSystem(systemLayouts, system);
        const sysBeatWidthForHover = sysLayoutForHover.beatWidth;

        // Calculate beat position within the current system using variable beat width
        const beatInSystem = (x - LEFT_MARGIN) / sysBeatWidthForHover;

        // Find which measure this beat falls in (using per-measure info)
        const measureInfo = getMeasureAtBeat(sysLayoutForHover, beatInSystem);
        const measureContainingBeat = measureInfo
          ? sysLayoutForHover.measures.indexOf(measureInfo)
          : 0;
        const clampedMeasure = Math.max(
          0,
          Math.min(
            sysLayoutForHover.measuresPerSystem - 1,
            measureContainingBeat,
          ),
        );

        // Only show hover if within staff bounds
        if (x >= LEFT_MARGIN - 20 && x <= staffRight + 20) {
          setHoveredRepeatMeasure({ system, measure: clampedMeasure });
        } else {
          setHoveredRepeatMeasure(null);
        }
      } else if (hoveredRepeatMeasure) {
        setHoveredRepeatMeasure(null);
      }

      // Handle marker dragging - allows cross-system repeats
      if (draggedMarker) {
        const system = getSystemFromY(y, systemCount);
        const measure = getMeasureFromX(x, defaultLayout.beatsPerMeasure);
        const clampedMeasure = Math.max(
          0,
          Math.min(measuresPerSystem, measure),
        );

        // Update drag position for visual preview
        setMarkerDragPosition({
          x,
          y,
          targetSystem: system,
          targetMeasure: clampedMeasure,
        });

        // Find the paired marker by pairId
        const currentMarker = repeatMarkers.find(
          (m) => m.id === draggedMarker.id,
        );
        const pairedMarker = currentMarker
          ? repeatMarkers.find(
              (m) =>
                m.pairId === currentMarker.pairId && m.id !== draggedMarker.id,
            )
          : undefined;

        // Validate position based on type using absolute measures
        let isValid = true;
        if (pairedMarker) {
          const draggedAbsoluteMeasure =
            system * measuresPerSystem + clampedMeasure;
          const pairedAbsoluteMeasure =
            pairedMarker.system * measuresPerSystem + pairedMarker.measure;

          if (
            draggedMarker.type === "start" &&
            draggedAbsoluteMeasure >= pairedAbsoluteMeasure
          ) {
            isValid = false;
          }
          if (
            draggedMarker.type === "end" &&
            draggedAbsoluteMeasure <= pairedAbsoluteMeasure
          ) {
            isValid = false;
          }
        }

        if (isValid) {
          onRepeatMarkersChange(
            repeatMarkers.map((m) =>
              m.id === draggedMarker.id
                ? { ...m, system, measure: clampedMeasure }
                : m,
            ),
          );
          // Update tracked system if changed
          if (system !== draggedMarker.system) {
            setDraggedMarker({ ...draggedMarker, system });
          }
        }
        return;
      }

      if (!draggedNote) return;
      const initialSystem = getSystemFromY(y, systemCount);

      // Find the best system for this X position (handles Y drift near system boundaries)
      const { system: bestSystem, beat } = findBestSystemForX(
        x,
        initialSystem,
        systemLayouts,
        systemCount,
      );

      // Use the corrected system for pitch calculation
      const pitch = getPitchFromY(y, bestSystem);

      // Check if another note exists at this position (excluding the dragged note)
      const collision = notes.find(
        (n) =>
          n.id !== draggedNote &&
          Math.abs(n.beat - beat) < 0.25 &&
          n.system === bestSystem,
      );
      if (collision) return; // Don't allow moving to occupied position

      onNotesChange(
        notes.map((n) =>
          n.id === draggedNote ? { ...n, beat, pitch, system: bestSystem } : n,
        ),
      );
    },
    [
      draggedNote,
      draggedMarker,
      getCoords,
      notes,
      onNotesChange,
      systemCount,
      repeatMarkers,
      onRepeatMarkersChange,
      measuresPerSystem,
      staffRight,
      defaultLayout.beatsPerMeasure,
      selectedTool,
      repeatStart,
      hoveredRepeatMeasure,
      systemLayouts,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (draggedNote) {
      const note = notes.find((n) => n.id === draggedNote);
      if (note) playNoteSound(note.pitch, note.duration);
      setDraggedNote(null);
      // Set flag to prevent click event from firing after drag
      justDraggedRef.current = true;
    }
    if (draggedMarker) {
      setDraggedMarker(null);
      setMarkerDragPosition(null);
      justDraggedRef.current = true;
    }
  }, [draggedNote, draggedMarker, notes, playNoteSound]);

  // Lyric editing handlers
  const handleSaveLyric = useCallback(
    (text: string) => {
      if (!editingLyric || !onLyricsChange) return;

      const { absoluteBeat } = editingLyric;
      const newLyrics = lyrics.filter(
        (l) => Math.abs(l.absoluteBeat - absoluteBeat) >= 0.1,
      );

      if (text.trim()) {
        newLyrics.push({ text: text.trim(), absoluteBeat });
        newLyrics.sort((a, b) => a.absoluteBeat - b.absoluteBeat);
      }

      onLyricsChange(newLyrics);
      setEditingLyric(null);
    },
    [editingLyric, lyrics, onLyricsChange],
  );

  const handleCancelLyricEdit = useCallback(() => {
    setEditingLyric(null);
  }, []);

  const handleNavigateLyric = useCallback(
    (direction: "next" | "prev") => {
      if (!editingLyric) return;

      const totalBeats = systemCount * beatsPerSystem;
      const currentBeat = editingLyric.absoluteBeat;
      const nextBeat =
        direction === "next"
          ? Math.min(totalBeats - 1, currentBeat + 1)
          : Math.max(0, currentBeat - 1);

      // Don't navigate if at bounds
      if (nextBeat === currentBeat) {
        setEditingLyric(null);
        return;
      }

      // Find existing lyric at next beat
      const existingLyric = lyrics.find(
        (l) => Math.abs(l.absoluteBeat - nextBeat) < 0.1,
      );

      setEditingLyric({
        absoluteBeat: nextBeat,
        initialText: existingLyric?.text || "",
      });
    },
    [editingLyric, systemCount, beatsPerSystem, lyrics],
  );

  // Calculate inline input position for editing lyric
  const getInlineLyricPosition = useCallback(() => {
    if (!editingLyric || !svgRef.current) return null;

    const { absoluteBeat } = editingLyric;

    // Use proper system lookup for variable beat widths
    const lyricPosition = getSystemForAbsoluteBeat(systemLayouts, absoluteBeat);
    if (!lyricPosition) return null;

    const system = lyricPosition.systemIndex;
    const beatInSystem = lyricPosition.beatInSystem;
    const sysLayout = getLayoutForSystem(systemLayouts, system);
    const sysBeatWidth = sysLayout.beatWidth;

    const svgRect = svgRef.current.getBoundingClientRect();
    // Use getBeatXInSystem to account for decoration offsets
    const x =
      getBeatXInSystem(sysLayout, beatInSystem) + getNoteOffset(sysBeatWidth);
    const staffCenterY = getStaffCenterY(system);
    const y = staffCenterY + LINE_SPACING + 55;

    return {
      x: svgRect.left + x,
      y: svgRect.top + y,
    };
  }, [editingLyric, systemLayouts]);

  const getNoteType = (duration: number): string => {
    if (duration >= 4) return "whole";
    if (duration >= 2) return "half";
    if (duration === 1.5) return "dotted-quarter";
    if (duration >= 1) return "quarter";
    return "eighth";
  };

  // Render duration extension bar (semi-transparent line showing note length)
  const renderDurationExtension = (note: EditorNote) => {
    if (note.pitch === "REST") return null;

    // Shorten extension by one eighth note (0.5 beats) - eighth notes get no line
    const adjustedDuration = note.duration - 0.5;
    if (adjustedDuration <= 0) return null;

    // Get system's beat width for variable widths
    const sysLayout = getLayoutForSystem(systemLayouts, note.system);
    const sysBeatWidth = sysLayout.beatWidth;

    // Use getBeatXInSystem to account for decoration widths
    const x =
      getBeatXInSystem(sysLayout, note.beat) + getNoteOffset(sysBeatWidth);
    const y = getYFromPitch(note.pitch, note.system);
    const color = getNoteColor(note.pitch);

    // Extension shows adjusted duration (shortened by 1/8 beat)
    const extensionWidth = adjustedDuration * sysBeatWidth;

    return (
      <rect
        key={`duration-${note.id}`}
        x={x} // Start from note center
        y={y - 4}
        width={extensionWidth}
        height={8}
        rx={4}
        fill={color}
        opacity={0.4}
        style={{ pointerEvents: "none" }}
      />
    );
  };

  const renderNote = (note: EditorNote) => {
    // Get system's beat width for variable widths
    const sysLayout = getLayoutForSystem(systemLayouts, note.system);
    const sysBeatWidth = sysLayout.beatWidth;

    // Calculate x and y from beat and pitch
    // Use getBeatXInSystem to account for decoration widths (time sig, repeat markers)
    const x =
      getBeatXInSystem(sysLayout, note.beat) + getNoteOffset(sysBeatWidth);
    const y = getYFromPitch(note.pitch, note.system);

    const color = getNoteColor(note.pitch);
    const isSelected = draggedNote === note.id;
    const isActive = activeNoteId === note.id;
    const type = getNoteType(note.duration);
    const staffCenterY = getStaffCenterY(note.system);
    const isBeamed = beamedNoteIds.has(note.id);

    // For beamed notes, use the beam group's stem direction
    let stemDir: "up" | "down" = y > staffCenterY ? "up" : "down";
    if (isBeamed) {
      const beamGroup = beamGroups.find((g) =>
        g.notes.some((n) => n.id === note.id),
      );
      if (beamGroup) {
        stemDir = beamGroup.stemDirection;
      }
    }

    const stemH = 40;
    const isHollow = type === "half" || type === "whole";
    const stemX = stemDir === "up" ? x + 12 : x - 12;
    const stemY1 = y;
    const stemY2 = stemDir === "up" ? y - stemH : y + stemH;

    // Kid-friendly note with face
    if (showKidFaces) {
      const faceRadius = 12;
      return (
        <g
          key={note.id}
          onMouseDown={(e) => handleNoteMouseDown(e, note.id)}
          onContextMenu={(e) => handleNoteContextMenu(e, note.id)}
          style={{
            cursor:
              selectedTool === "delete"
                ? "not-allowed"
                : allowMove
                  ? "grab"
                  : "default",
          }}
          className="transition-opacity hover:opacity-80"
        >
          {note.pitch === "C4" && (
            <line
              x1={x - 18}
              y1={y}
              x2={x + 18}
              y2={y}
              stroke="#4a5568"
              strokeWidth={2}
            />
          )}
          {isSelected && <circle cx={x} cy={y - 22} r={4} fill="#3B82F6" />}
          {/* Active glow effect */}
          {isActive && (
            <circle
              cx={x}
              cy={y}
              r={faceRadius + 8}
              fill="none"
              stroke={color}
              strokeWidth={4}
              opacity={0.6}
              className="animate-pulse"
            />
          )}
          {/* Face circle */}
          <circle
            cx={x}
            cy={y}
            r={faceRadius}
            fill={color}
            stroke={isActive ? "#fff" : "#000"}
            strokeWidth={isActive ? 3 : 2}
          />
          {/* Eyes */}
          <circle cx={x - 4} cy={y - 3} r={2.5} fill="#000" />
          <circle cx={x + 4} cy={y - 3} r={2.5} fill="#000" />
          {/* Eye shine */}
          <circle cx={x - 3} cy={y - 4} r={1} fill="#fff" />
          <circle cx={x + 5} cy={y - 4} r={1} fill="#fff" />
          {/* Smile */}
          <path
            d={`M ${x - 5} ${y + 4} Q ${x} ${y + 9} ${x + 5} ${y + 4}`}
            stroke="#000"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          {/* Stem (not for whole notes) */}
          {type !== "whole" && (
            <line
              x1={stemDir === "up" ? x + faceRadius - 2 : x - faceRadius + 2}
              y1={y}
              x2={stemDir === "up" ? x + faceRadius - 2 : x - faceRadius + 2}
              y2={stemDir === "up" ? y - 38 : y + 38}
              stroke="#000"
              strokeWidth={3.5}
            />
          )}
          {/* Note name label */}
          {showLabels && (
            <text
              x={x}
              y={y - faceRadius - 8}
              textAnchor="middle"
              fill={color}
              fontSize={12}
              fontWeight="bold"
              style={{ pointerEvents: "none" }}
            >
              {getNoteLabel(note.pitch)}
            </text>
          )}
        </g>
      );
    }

    // Standard note rendering with SVG ellipse
    // All notes have color outline; filled notes have color fill, hollow have white fill
    const fill = isHollow ? "#ffffff" : color;
    const stroke = color; // Always use color outline
    const strokeWidth = 2.5;

    return (
      <g
        key={note.id}
        onMouseDown={(e) => handleNoteMouseDown(e, note.id)}
        onContextMenu={(e) => handleNoteContextMenu(e, note.id)}
        style={{
          cursor:
            selectedTool === "delete"
              ? "not-allowed"
              : allowMove
                ? "grab"
                : "default",
        }}
        className="transition-opacity hover:opacity-80"
      >
        {/* Ledger line for C4 */}
        {note.pitch === "C4" && (
          <line
            x1={x - 20}
            y1={y}
            x2={x + 20}
            y2={y}
            stroke="#4a5568"
            strokeWidth={2}
          />
        )}
        {/* Selection indicator */}
        {isSelected && <circle cx={x} cy={y - 28} r={4} fill="#3B82F6" />}
        {/* Active glow effect */}
        {isActive && (
          <ellipse
            cx={x}
            cy={y}
            rx={18}
            ry={15}
            fill="none"
            stroke={color}
            strokeWidth={4}
            opacity={0.6}
            transform={`rotate(-20 ${x} ${y})`}
          />
        )}
        {/* Stem - skip for beamed eighth notes (beam section draws their stems) */}
        {type !== "whole" && !(type === "eighth" && isBeamed) && (
          <line
            x1={stemX}
            y1={stemY1}
            x2={stemX}
            y2={stemY2}
            stroke={color}
            strokeWidth={3}
          />
        )}
        {/* Notehead - sized to span between staff lines */}
        <ellipse
          cx={x}
          cy={y}
          rx={13}
          ry={11}
          fill={fill}
          stroke={isActive ? "#fff" : stroke}
          strokeWidth={isActive ? 2.5 : strokeWidth}
          transform={`rotate(-20 ${x} ${y})`}
        />
        {/* Flag for eighth notes (only if not beamed) */}
        {type === "eighth" && !isBeamed && (
          <path
            d={
              stemDir === "up"
                ? `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 + 10} ${
                    stemX + 10
                  } ${stemY2 + 22}`
                : `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 - 10} ${
                    stemX + 10
                  } ${stemY2 - 22}`
            }
            stroke={color}
            strokeWidth={3.5}
            fill="none"
          />
        )}
        {/* Dot for dotted notes - positioned to the right, in a space (not on a line) */}
        {(note.duration === 0.75 ||
          note.duration === 1.5 ||
          note.duration === 3) && (
          <circle
            cx={x + 20}
            cy={y - LINE_SPACING / 4} // Offset up slightly to sit in a space
            r={4}
            fill={color}
          />
        )}
        {/* Note label */}
        {showLabels && (
          <text
            x={x}
            y={y + 5}
            textAnchor="middle"
            fill="#1a1a1a"
            fontSize={11}
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
            style={{ pointerEvents: "none" }}
          >
            {getNoteLabel(note.pitch)}
          </text>
        )}
      </g>
    );
  };

  /**
   * Render a single staff system (one horizontal line of music)
   *
   * Each system contains:
   * - Staff lines (3, 4, or 5 based on settings)
   * - Treble clef (clipped based on visible lines)
   * - Time signature (on first system or at changes)
   * - Bar lines separating measures
   * - Beat shading for visual guidance
   * - Repeat markers (start/end dots)
   * - System number label
   *
   * Coordinate reference: All Y positions are relative to `staffCenterY`,
   * which is the Y coordinate of the middle staff line (Line 3).
   */
  const renderSystem = (systemIndex: number) => {
    const isFirstSystem = systemIndex === 0;

    // Staff center Y: the fixed reference point (Line 3 position)
    // Notes are positioned relative to this point regardless of visible line count
    const staffCenterY = getStaffCenterY(systemIndex);

    // Dynamic staff extents based on visible lines
    // 3 lines: top at 0 (line 3), 4 lines: top at -32 (line 2), 5 lines: top at -64 (line 1)
    // Bottom is always at +64 (line 5)
    const staffTopOffset =
      staffLines === 5
        ? -2 * LINE_SPACING // -64
        : staffLines === 4
          ? -1 * LINE_SPACING // -32
          : 0; // 3 lines: top at line 3 (offset 0)
    const staffBottomOffset = 2 * LINE_SPACING; // Line 5 (bottom) at +64

    // Padding around staff for backgrounds and bar lines
    const staffPadding = 20;

    // Visual center of visible lines (for positioning time sig, repeat markers)
    // 3 lines: (0+64)/2=32, 4 lines: (-32+64)/2=16, 5 lines: (-64+64)/2=0
    const visibleCenterOffset = (staffTopOffset + staffBottomOffset) / 2;

    // Decoration spread scales with visible staff lines
    // Time sig numbers and repeat dots spread apart more with more visible lines
    // 3 lines: 16px (standard half-space, dots in middle 2 spaces)
    // 4 lines: 28px (generous spread to fill 3 spaces)
    // 5 lines: 32px (full line spacing, dots in outer 2 of 4 spaces)
    const decorationSpread =
      staffLines === 5
        ? LINE_SPACING // 32px
        : staffLines === 4
          ? LINE_SPACING * 0.875 // 28px
          : LINE_SPACING / 2; // 16px

    // Clip area extends 1.5 lines above visible top for note placement
    const clipTopOffset = staffTopOffset - 1.5 * LINE_SPACING; // 1.5 lines above top visible line

    // Get per-system layout (variable beat width, fixed system width)
    const sysLayout = getLayoutForSystem(systemLayouts, systemIndex);
    const sysTotalBeats = sysLayout.totalBeats;
    const sysBeatWidth = sysLayout.beatWidth;
    const sysMeasures = sysLayout.measures;
    const sysMeasuresPerSystem = sysLayout.measuresPerSystem;
    const sysStaffRight = sysLayout.staffRight;

    // Get markers on this system
    const markersOnSystem = repeatMarkers.filter(
      (m) => m.system === systemIndex,
    );
    // Start markers: exclude those at measure 0 (they belong to the end of the previous system conceptually,
    // but START markers at measure 0 should show at the start of THIS system)
    const startMarkers = markersOnSystem.filter((m) => m.type === "start");
    // End markers: exclude those at measure 0 (they should render at the END of the previous system)
    const endMarkers = markersOnSystem.filter(
      (m) => m.type === "end" && m.measure !== 0,
    );

    // Also check for END markers at measure 0 of the NEXT system - these render at the end of THIS system
    const endMarkersFromNextSystem = repeatMarkers.filter(
      (m) =>
        m.system === systemIndex + 1 && m.type === "end" && m.measure === 0,
    );
    // Also check for START markers at measure 0 of the NEXT system - these should NOT render at end of this system
    // (they correctly render at the start of the next system)

    return (
      <g key={`system-${systemIndex}`}>
        {/* Clip path for this system - clips TOP only based on visible lines */}
        {/* Bottom extends well below staff to show full clef tail */}
        <defs>
          <clipPath id={`system-clip-${systemIndex}`}>
            <rect
              x={0}
              y={staffCenterY + clipTopOffset}
              width={sysLayout.svgWidth}
              height={staffBottomOffset - clipTopOffset + 120}
            />
          </clipPath>
        </defs>

        {/* Beat shading - simple alternating pattern across entire system */}
        {sysMeasures.flatMap((measure) => {
          return Array.from(
            { length: measure.beatsInMeasure },
            (_, beatInMeasure) => {
              const beatInSystem = measure.startBeatInSystem + beatInMeasure;
              // Use measure.xOffset to account for decoration spacing
              const beatX =
                LEFT_MARGIN + measure.xOffset + beatInMeasure * sysBeatWidth;
              // Simple alternating pattern: white-gray-white-gray based on beat position
              const isShaded = beatInSystem % 2 === 1;
              return (
                <rect
                  key={`shade-${systemIndex}-${beatInSystem}`}
                  x={beatX}
                  y={staffCenterY + staffTopOffset - staffPadding}
                  width={sysBeatWidth}
                  height={staffBottomOffset - staffTopOffset + staffPadding * 2}
                  fill={isShaded ? "#e2e8f0" : "#f8fafc"}
                />
              );
            },
          );
        })}

        {/* Grid lines showing valid note positions */}
        {showGrid &&
          Array.from({ length: sysTotalBeats * 2 }, (_, i) => {
            const beatPosition = i * 0.5;
            // Grid lines are centered in beat columns, using getBeatXInSystem for decoration offsets
            const gridX =
              getBeatXInSystem(sysLayout, beatPosition) +
              getNoteOffset(sysBeatWidth);
            const isFullBeat = beatPosition % 1 === 0;
            return (
              <line
                key={`grid-${systemIndex}-${i}`}
                x1={gridX}
                y1={staffCenterY + staffTopOffset - 15}
                x2={gridX}
                y2={staffCenterY + staffBottomOffset + 15}
                stroke="#10b981"
                strokeWidth={isFullBeat ? 1.5 : 1}
                strokeDasharray="4 3"
                opacity={isFullBeat ? 0.8 : 0.5}
              />
            );
          })}

        {/* Staff lines - configurable count (3-5 lines) */}
        {/* Lines are at fixed positions based on a 5-line standard staff */}
        {/* staffLines=3: lines 2,3,4 (-32,0,+32), staffLines=4: add line 5 (+64), staffLines=5: add line 1 (-64) */}
        {(() => {
          // Standard 5-line staff positions (fixed, never move)
          const allLineOffsets = [
            -2 * LINE_SPACING, // Line 1: top (-64)
            -1 * LINE_SPACING, // Line 2 (-32)
            0, // Line 3: middle (0)
            1 * LINE_SPACING, // Line 4 (+32)
            2 * LINE_SPACING, // Line 5: bottom (+64)
          ];

          // Which lines to show based on staffLines setting (indices into allLineOffsets)
          // 3 lines = lines 3,4,5 (bottom 3), 4 lines = add line 2 above, 5 lines = add line 1 above
          // All additions extend upward only
          let linesToShow: number[];
          switch (staffLines) {
            case 3:
              linesToShow = [2, 3, 4]; // Lines 3, 4, 5 (bottom 3) - DEFAULT
              break;
            case 4:
              linesToShow = [1, 2, 3, 4]; // Lines 2-5 (add one above)
              break;
            case 5:
            default:
              linesToShow = [0, 1, 2, 3, 4]; // All 5 lines (add another above)
              break;
          }

          return linesToShow.map((lineIndex) => (
            <line
              key={`staff-line-${lineIndex}`}
              x1={STAFF_LEFT}
              y1={staffCenterY + allLineOffsets[lineIndex]}
              x2={sysStaffRight}
              y2={staffCenterY + allLineOffsets[lineIndex]}
              stroke="#4a5568"
              strokeWidth={2}
            />
          ));
        })()}

        {/* Bar lines - at measure boundaries (variable widths per measure) */}
        {[...sysMeasures, null].map((measure, measureIndex) => {
          // Bar line at start of each measure, plus one at the end
          const isLastBarLine = measure === null;

          // Calculate bar line X position using xOffset (accounts for decorations)
          let barX: number;
          if (isLastBarLine) {
            // Last bar line: after all content of the last measure
            const lastMeasure = sysMeasures[sysMeasures.length - 1];
            barX =
              LEFT_MARGIN +
              lastMeasure.xOffset +
              lastMeasure.beatsInMeasure * sysBeatWidth +
              lastMeasure.suffixWidth;
          } else {
            // Bar line at start of measure (before any prefix decorations)
            barX = LEFT_MARGIN + measure.xOffset - measure.prefixWidth;
          }

          const isEdge = measureIndex === 0 || isLastBarLine;

          // Handle repeat markers at bar lines
          let startMarker, endMarker;

          if (isLastBarLine) {
            // At last bar line: show END markers from the NEXT system's measure 0
            // (they logically belong at the end of this system)
            endMarker = endMarkersFromNextSystem[0];
            // Don't show START markers here - they'll show at measure 0 of the next system
          } else {
            startMarker = startMarkers.find((m) => m.measure === measureIndex);
            endMarker = endMarkers.find((m) => m.measure === measureIndex);
          }

          const isRepeatStart = !!startMarker;
          const isRepeatEnd = !!endMarker;

          // Check if this bar line already has a time signature change
          // Use the system's startMeasure + measureIndex for accurate absolute measure
          const absoluteMeasure = sysLayout.startMeasure + measureIndex;
          const hasTimeSigChange = timeSignatureChanges.some(
            (c) => c.measureNumber === absoluteMeasure,
          );
          // Check if this is the hovered bar for time sig preview
          const isTimeSigHovered =
            selectedTool === "timesig" &&
            hoveredTimeSigBar?.systemIndex === systemIndex &&
            hoveredTimeSigBar?.measureIndex === measureIndex &&
            !hasTimeSigChange;

          return (
            <g key={`bar-${systemIndex}-${measureIndex}`}>
              <line
                x1={barX}
                y1={staffCenterY + staffTopOffset - 8}
                x2={barX}
                y2={staffCenterY + staffBottomOffset + 8}
                stroke={isEdge ? "#1e293b" : "#475569"}
                strokeWidth={isEdge ? 4 : 2}
              />

              {/* Time signature display - shown at measures where time sig changes */}
              {measure?.showTimeSig && (
                <g>
                  {/*
                    Position time sig based on location:
                    - First measure of row (measureIndex === 0): Use same position as initial time sig (x=85)
                      This follows music notation convention: Clef → Time Sig → Bar line → Notes
                    - Mid-row changes: After the bar line (standard practice for time sig changes)
                  */}
                  {/* Numerator */}
                  <text
                    x={
                      measureIndex === 0
                        ? 85
                        : barX + TIME_SIG_DISPLAY_WIDTH / 2
                    }
                    y={
                      staffCenterY + visibleCenterOffset - decorationSpread + 6
                    }
                    fontSize={20}
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#334155"
                  >
                    {measure.timeSignature.numerator}
                  </text>
                  {/* Denominator */}
                  <text
                    x={
                      measureIndex === 0
                        ? 85
                        : barX + TIME_SIG_DISPLAY_WIDTH / 2
                    }
                    y={
                      staffCenterY + visibleCenterOffset + decorationSpread + 6
                    }
                    fontSize={20}
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#334155"
                  >
                    {measure.timeSignature.denominator}
                  </text>
                </g>
              )}

              {/* Time signature tool hover zone - at any bar line (not last) */}
              {selectedTool === "timesig" &&
                !hasTimeSigChange &&
                !isLastBarLine && (
                  <rect
                    x={barX - 10}
                    y={staffCenterY + staffTopOffset - 15}
                    width={40}
                    height={staffBottomOffset - staffTopOffset + 30}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() =>
                      setHoveredTimeSigBar({ systemIndex, measureIndex })
                    }
                    onMouseLeave={() => setHoveredTimeSigBar(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTimeSigPicker({
                        measureNumber: absoluteMeasure,
                        x: barX,
                        y: staffCenterY,
                      });
                    }}
                  />
                )}

              {/* Ghost time signature preview on hover - at any bar line (not last) */}
              {isTimeSigHovered && !isLastBarLine && (
                <g opacity={0.5} style={{ pointerEvents: "none" }}>
                  <rect
                    x={barX + 5}
                    y={
                      staffCenterY + visibleCenterOffset - decorationSpread - 10
                    }
                    width={25}
                    height={decorationSpread * 2 + 20}
                    fill="#e0f2fe"
                    rx={3}
                  />
                  <text
                    x={barX + 17}
                    y={
                      staffCenterY + visibleCenterOffset - decorationSpread + 5
                    }
                    fontSize={14}
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#0891b2"
                  >
                    ?
                  </text>
                  <text
                    x={barX + 17}
                    y={
                      staffCenterY + visibleCenterOffset + decorationSpread + 5
                    }
                    fontSize={14}
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#0891b2"
                  >
                    ?
                  </text>
                </g>
              )}

              {isRepeatStart && startMarker && (
                <g
                  style={{
                    cursor:
                      selectedTool === "delete"
                        ? "pointer"
                        : draggedMarker
                          ? "grabbing"
                          : allowMove
                            ? "grab"
                            : "default",
                  }}
                  onMouseEnter={() => {
                    // Only show hover effect when move tool or delete tool is active
                    if (allowMove || selectedTool === "delete") {
                      setHoveredMarker(startMarker.id);
                    }
                  }}
                  onMouseLeave={() => setHoveredMarker(null)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    // Only allow drag when move mode is enabled and NOT in delete mode
                    if (allowMove && selectedTool !== "delete") {
                      setDraggedMarker({
                        id: startMarker.id,
                        type: "start",
                        system: systemIndex,
                        originalMeasure: startMarker.measure,
                      });
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Single click delete when delete tool is active
                    if (selectedTool === "delete") {
                      onRepeatMarkersChange(
                        repeatMarkers.filter(
                          (m) => m.pairId !== startMarker.pairId,
                        ),
                      );
                    }
                  }}
                >
                  {/* Larger invisible hit box for easier interaction */}
                  <rect
                    x={barX - 5}
                    y={staffCenterY + staffTopOffset - 15}
                    width={35}
                    height={staffBottomOffset - staffTopOffset + 30}
                    fill="transparent"
                    stroke={
                      hoveredMarker === startMarker.id
                        ? selectedTool === "delete"
                          ? "#ef4444"
                          : "#8b5cf6"
                        : "transparent"
                    }
                    strokeWidth={2}
                    strokeDasharray={
                      hoveredMarker === startMarker.id ? "4,2" : "0"
                    }
                    rx={4}
                  />
                  {/* Visual feedback background when hovered */}
                  {hoveredMarker === startMarker.id && (
                    <rect
                      x={barX - 5}
                      y={staffCenterY + staffTopOffset - 15}
                      width={35}
                      height={staffBottomOffset - staffTopOffset + 30}
                      fill={selectedTool === "delete" ? "#fef2f2" : "#f3e8ff"}
                      opacity={0.5}
                      rx={4}
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                  <line
                    x1={barX + 6}
                    y1={staffCenterY + staffTopOffset - 8}
                    x2={barX + 6}
                    y2={staffCenterY + staffBottomOffset + 8}
                    stroke={
                      hoveredMarker === startMarker.id
                        ? selectedTool === "delete"
                          ? "#ef4444"
                          : "#a855f7"
                        : "#8b5cf6"
                    }
                    strokeWidth={hoveredMarker === startMarker.id ? 4 : 3}
                    style={{ pointerEvents: "none" }}
                  />
                  <circle
                    cx={barX + 18}
                    cy={staffCenterY + visibleCenterOffset - decorationSpread}
                    r={hoveredMarker === startMarker.id ? 7 : 5}
                    fill={
                      hoveredMarker === startMarker.id
                        ? selectedTool === "delete"
                          ? "#ef4444"
                          : "#a855f7"
                        : "#8b5cf6"
                    }
                    style={{ pointerEvents: "none" }}
                  />
                  <circle
                    cx={barX + 18}
                    cy={staffCenterY + visibleCenterOffset + decorationSpread}
                    r={hoveredMarker === startMarker.id ? 7 : 5}
                    fill={
                      hoveredMarker === startMarker.id
                        ? selectedTool === "delete"
                          ? "#ef4444"
                          : "#a855f7"
                        : "#8b5cf6"
                    }
                    style={{ pointerEvents: "none" }}
                  />
                  {/* Hover tooltip */}
                  {hoveredMarker === startMarker.id && (
                    <g>
                      <rect
                        x={barX - 20}
                        y={staffCenterY + staffTopOffset - 45}
                        width={selectedTool === "delete" ? 90 : 80}
                        height={22}
                        fill="#1f2937"
                        rx={4}
                        style={{ pointerEvents: "none" }}
                      />
                      <text
                        x={barX + (selectedTool === "delete" ? 25 : 20)}
                        y={staffCenterY + staffTopOffset - 30}
                        fontSize={11}
                        fill="white"
                        textAnchor="middle"
                        fontWeight="600"
                        style={{ pointerEvents: "none" }}
                      >
                        {selectedTool === "delete"
                          ? "Click to delete"
                          : "Drag to move"}
                      </text>
                    </g>
                  )}
                </g>
              )}
              {isRepeatEnd && endMarker && (
                <g
                  style={{
                    cursor:
                      selectedTool === "delete"
                        ? "pointer"
                        : draggedMarker
                          ? "grabbing"
                          : allowMove
                            ? "grab"
                            : "default",
                  }}
                  onMouseEnter={() => {
                    // Only show hover effect when move tool or delete tool is active
                    if (allowMove || selectedTool === "delete") {
                      setHoveredMarker(endMarker.id);
                    }
                  }}
                  onMouseLeave={() => setHoveredMarker(null)}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    // Only allow drag when move mode is enabled and NOT in delete mode
                    if (allowMove && selectedTool !== "delete") {
                      setDraggedMarker({
                        id: endMarker.id,
                        type: "end",
                        system: systemIndex,
                        originalMeasure: endMarker.measure,
                      });
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Single click delete when delete tool is active
                    if (selectedTool === "delete") {
                      onRepeatMarkersChange(
                        repeatMarkers.filter(
                          (m) => m.pairId !== endMarker.pairId,
                        ),
                      );
                    }
                  }}
                >
                  {/* Larger invisible hit box for easier interaction */}
                  <rect
                    x={barX - 30}
                    y={staffCenterY + staffTopOffset - 15}
                    width={35}
                    height={staffBottomOffset - staffTopOffset + 30}
                    fill="transparent"
                    stroke={
                      hoveredMarker === endMarker.id
                        ? selectedTool === "delete"
                          ? "#ef4444"
                          : "#8b5cf6"
                        : "transparent"
                    }
                    strokeWidth={2}
                    strokeDasharray={
                      hoveredMarker === endMarker.id ? "4,2" : "0"
                    }
                    rx={4}
                  />
                  {/* Visual feedback background when hovered */}
                  {hoveredMarker === endMarker.id && (
                    <rect
                      x={barX - 30}
                      y={staffCenterY + staffTopOffset - 15}
                      width={35}
                      height={staffBottomOffset - staffTopOffset + 30}
                      fill={selectedTool === "delete" ? "#fef2f2" : "#f3e8ff"}
                      opacity={0.5}
                      rx={4}
                      style={{ pointerEvents: "none" }}
                    />
                  )}
                  <line
                    x1={barX - 6}
                    y1={staffCenterY + staffTopOffset - 8}
                    x2={barX - 6}
                    y2={staffCenterY + staffBottomOffset + 8}
                    stroke={
                      hoveredMarker === endMarker.id
                        ? selectedTool === "delete"
                          ? "#ef4444"
                          : "#a855f7"
                        : "#8b5cf6"
                    }
                    strokeWidth={hoveredMarker === endMarker.id ? 4 : 3}
                    style={{ pointerEvents: "none" }}
                  />
                  <circle
                    cx={barX - 18}
                    cy={staffCenterY + visibleCenterOffset - decorationSpread}
                    r={hoveredMarker === endMarker.id ? 7 : 5}
                    fill={
                      hoveredMarker === endMarker.id
                        ? selectedTool === "delete"
                          ? "#ef4444"
                          : "#a855f7"
                        : "#8b5cf6"
                    }
                    style={{ pointerEvents: "none" }}
                  />
                  <circle
                    cx={barX - 18}
                    cy={staffCenterY + visibleCenterOffset + decorationSpread}
                    r={hoveredMarker === endMarker.id ? 7 : 5}
                    fill={
                      hoveredMarker === endMarker.id
                        ? selectedTool === "delete"
                          ? "#ef4444"
                          : "#a855f7"
                        : "#8b5cf6"
                    }
                    style={{ pointerEvents: "none" }}
                  />
                  {/* Hover tooltip */}
                  {hoveredMarker === endMarker.id && (
                    <g>
                      <rect
                        x={barX - 90}
                        y={staffCenterY + staffTopOffset - 45}
                        width={selectedTool === "delete" ? 90 : 80}
                        height={22}
                        fill="#1f2937"
                        rx={4}
                        style={{ pointerEvents: "none" }}
                      />
                      <text
                        x={barX - (selectedTool === "delete" ? 45 : 50)}
                        y={staffCenterY + staffTopOffset - 30}
                        fontSize={11}
                        fill="white"
                        textAnchor="middle"
                        fontWeight="600"
                        style={{ pointerEvents: "none" }}
                      >
                        {selectedTool === "delete"
                          ? "Click to delete"
                          : "Drag to move"}
                      </text>
                    </g>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* Time signature change markers */}
        {timeSignatureChanges.map((change) => {
          // Time sig changes are constrained to system start (measureIndex === 0)
          // Check if this change belongs to the current system
          if (change.measureNumber !== sysLayout.startMeasure) return null;

          // measureInSystem is always 0 since changes only at system start
          const barX = LEFT_MARGIN;

          return (
            <g
              key={change.id}
              onClick={(e) => {
                e.stopPropagation();
                // Open picker when clicked with delete tool or timesig tool
                if (selectedTool === "delete" && onTimeSignatureChangesChange) {
                  onTimeSignatureChangesChange(
                    timeSignatureChanges.filter((c) => c.id !== change.id),
                  );
                } else if (selectedTool === "timesig") {
                  setTimeSigPicker({
                    measureNumber: change.measureNumber,
                    x: barX,
                    y: staffCenterY,
                  });
                }
              }}
              style={{
                cursor:
                  selectedTool === "delete" || selectedTool === "timesig"
                    ? "pointer"
                    : "default",
              }}
            >
              {/* Background highlight */}
              <rect
                x={barX + 5}
                y={staffCenterY + visibleCenterOffset - decorationSpread - 10}
                width={25}
                height={decorationSpread * 2 + 20}
                fill="#e0f2fe"
                rx={3}
              />
              {/* Time signature numbers */}
              <text
                x={barX + 17}
                y={staffCenterY + visibleCenterOffset - decorationSpread + 5}
                fontSize={14}
                fontWeight="bold"
                textAnchor="middle"
                fill="#0891b2"
              >
                {change.timeSignature.numerator}
              </text>
              <text
                x={barX + 17}
                y={staffCenterY + visibleCenterOffset + decorationSpread + 5}
                fontSize={14}
                fontWeight="bold"
                textAnchor="middle"
                fill="#0891b2"
              >
                {change.timeSignature.denominator}
              </text>
            </g>
          );
        })}

        {/* Interactive repeat placement highlighting */}
        {repeatStart &&
          selectedTool === "repeat" &&
          (() => {
            // Calculate which measures to highlight on this system
            const startSystem = repeatStart.system;
            const startMeasure = repeatStart.measure;
            const endSystem = hoveredRepeatMeasure?.system ?? startSystem;
            const endMeasure = hoveredRepeatMeasure?.measure ?? startMeasure;

            // Get layouts for the involved systems to calculate absolute measures
            const startLayout = getLayoutForSystem(systemLayouts, startSystem);
            const endLayout = getLayoutForSystem(systemLayouts, endSystem);

            // Calculate absolute measure numbers for comparison
            const startAbsolute = startLayout.startMeasure + startMeasure;
            const endAbsolute = endLayout.startMeasure + endMeasure;

            // Ensure start comes before end
            const [minAbsolute, maxAbsolute] =
              startAbsolute <= endAbsolute
                ? [startAbsolute, endAbsolute]
                : [endAbsolute, startAbsolute];

            // Calculate which measures on this system should be highlighted
            const systemStartMeasure = sysLayout.startMeasure;
            const systemEndMeasure =
              systemStartMeasure + sysMeasuresPerSystem - 1;

            const highlightStart = Math.max(
              0,
              minAbsolute - systemStartMeasure,
            );
            const highlightEnd = Math.min(
              sysMeasuresPerSystem - 1,
              maxAbsolute - systemStartMeasure,
            );

            // Only render if this system has measures to highlight
            if (highlightStart > sysMeasuresPerSystem - 1 || highlightEnd < 0) {
              return null;
            }

            const measures = [];
            for (let m = highlightStart; m <= highlightEnd; m++) {
              measures.push(m);
            }

            // Determine where to show the instructional text
            const showTextInMeasure = hoveredRepeatMeasure
              ? hoveredRepeatMeasure.system === systemIndex
                ? hoveredRepeatMeasure.measure
                : null
              : startSystem === systemIndex
                ? startMeasure
                : null;

            return (
              <g>
                {measures.map((m) => {
                  // Get measure info to calculate position
                  const measureInfo = sysMeasures[m];
                  if (!measureInfo) return null;
                  const measureX =
                    LEFT_MARGIN + measureInfo.startBeatInSystem * sysBeatWidth;
                  const measureWidth =
                    measureInfo.beatsInMeasure * sysBeatWidth;
                  return (
                    <rect
                      key={`highlight-${m}`}
                      x={measureX}
                      y={
                        staffCenterY +
                        visibleCenterOffset -
                        decorationSpread -
                        15
                      }
                      width={measureWidth}
                      height={decorationSpread * 2 + 30}
                      fill="#8b5cf6"
                      opacity={0.15}
                      rx={4}
                    />
                  );
                })}
              </g>
            );
          })()}

        {/*
          Treble Clef (G Clef) Rendering

          The treble clef is called a "G clef" because its inner curl wraps around
          the G line (Line 4, second from bottom). This is THE defining feature -
          wherever you place the curl is where G4 lives.

          Positioning math:
          - Original SVG is 15.186 x 40.768 units
          - Scale 5.1x makes it ~208px tall
          - The curl center in the original SVG is at approximately y=18.8 units
          - At 5.1x scale, that's 18.8 * 5.1 = ~96px from the top of the scaled clef
          - G4 (Line 4) is at staffCenterY + 32 (one line below middle)
          - So we position: translate(0, staffCenterY - 96) to align curl with G line

          The clipPath limits visibility based on staffLines setting, cutting off
          the top of the clef when fewer than 5 lines are shown.
        */}
        <g clipPath={`url(#system-clip-${systemIndex})`}>
          <g
            transform={`translate(0, ${staffCenterY - 96}) scale(5.1)`}
            style={{ pointerEvents: "none" }}
          >
            <path
              d="m12.049 3.5296c0.305 3.1263-2.019 5.6563-4.0772 7.7014-0.9349 0.897-0.155 0.148-0.6437 0.594-0.1022-0.479-0.2986-1.731-0.2802-2.11 0.1304-2.6939 2.3198-6.5875 4.2381-8.0236 0.309 0.5767 0.563 0.6231 0.763 1.8382zm0.651 16.142c-1.232-0.906-2.85-1.144-4.3336-0.885-0.1913-1.255-0.3827-2.51-0.574-3.764 2.3506-2.329 4.9066-5.0322 5.0406-8.5394 0.059-2.232-0.276-4.6714-1.678-6.4836-1.7004 0.12823-2.8995 2.156-3.8019 3.4165-1.4889 2.6705-1.1414 5.9169-0.57 8.7965-0.8094 0.952-1.9296 1.743-2.7274 2.734-2.3561 2.308-4.4085 5.43-4.0046 8.878 0.18332 3.334 2.5894 6.434 5.8702 7.227 1.2457 0.315 2.5639 0.346 3.8241 0.099 0.2199 2.25 1.0266 4.629 0.0925 6.813-0.7007 1.598-2.7875 3.004-4.3325 2.192-0.5994-0.316-0.1137-0.051-0.478-0.252 1.0698-0.257 1.9996-1.036 2.26-1.565 0.8378-1.464-0.3998-3.639-2.1554-3.358-2.262 0.046-3.1904 3.14-1.7356 4.685 1.3468 1.52 3.833 1.312 5.4301 0.318 1.8125-1.18 2.0395-3.544 1.8325-5.562-0.07-0.678-0.403-2.67-0.444-3.387 0.697-0.249 0.209-0.059 1.193-0.449 2.66-1.053 4.357-4.259 3.594-7.122-0.318-1.469-1.044-2.914-2.302-3.792zm0.561 5.757c0.214 1.991-1.053 4.321-3.079 4.96-0.136-0.795-0.172-1.011-0.2626-1.475-0.4822-2.46-0.744-4.987-1.116-7.481 1.6246-0.168 3.4576 0.543 4.0226 2.184 0.244 0.577 0.343 1.197 0.435 1.812zm-5.1486 5.196c-2.5441 0.141-4.9995-1.595-5.6343-4.081-0.749-2.153-0.5283-4.63 0.8207-6.504 1.1151-1.702 2.6065-3.105 4.0286-4.543 0.183 1.127 0.366 2.254 0.549 3.382-2.9906 0.782-5.0046 4.725-3.215 7.451 0.5324 0.764 1.9765 2.223 2.7655 1.634-1.102-0.683-2.0033-1.859-1.8095-3.227-0.0821-1.282 1.3699-2.911 2.6513-3.198 0.4384 2.869 0.9413 6.073 1.3797 8.943-0.5054 0.1-1.0211 0.143-1.536 0.143z"
              fill="#334155"
            />
          </g>
        </g>

        {/* Time signature (only on first system) - clickable to open settings */}
        {isFirstSystem && (
          <g
            onClick={(e) => {
              if (!readOnly && onTimeSignatureClick) {
                e.stopPropagation();
                onTimeSignatureClick();
              }
            }}
            style={{
              cursor: readOnly ? "default" : "pointer",
            }}
            className={!readOnly ? "hover:opacity-80 transition-opacity" : ""}
          >
            {/* Invisible hit area for better click target */}
            <rect
              x={70}
              y={staffCenterY + staffTopOffset}
              width={30}
              height={staffBottomOffset - staffTopOffset}
              fill="transparent"
            />
            <text
              x={85}
              y={staffCenterY + visibleCenterOffset - decorationSpread + 6}
              fontSize={20}
              fontWeight="bold"
              textAnchor="middle"
              fill="#334155"
            >
              {timeSignature.numerator}
            </text>
            <text
              x={85}
              y={staffCenterY + visibleCenterOffset + decorationSpread + 6}
              fontSize={20}
              fontWeight="bold"
              textAnchor="middle"
              fill="#334155"
            >
              {timeSignature.denominator}
            </text>
          </g>
        )}

        {/* Beat numbers - positioned below the staff */}
        {Array.from({ length: sysTotalBeats }, (_, i) => i).map((beatIndex) => (
          <text
            key={`beat-${systemIndex}-${beatIndex}`}
            x={
              getBeatXInSystem(sysLayout, beatIndex) +
              getNoteOffset(sysBeatWidth)
            }
            y={staffCenterY + staffBottomOffset + 25}
            fontSize={11}
            textAnchor="middle"
            fill="#64748b"
          >
            {sysLayout.startBeat + beatIndex + 1}
          </text>
        ))}

        {/* System number label - positioned above the visible staff area */}
        <text
          x={15}
          y={staffCenterY + clipTopOffset - 10}
          fontSize={14}
          fill="#94a3b8"
          fontWeight="bold"
        >
          {systemIndex + 1}
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <svg
        id={TOUR_ELEMENT_IDS.staffCanvas}
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        onClick={handleClick}
        onContextMenu={handleEmptyContextMenu}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="bg-white border border-gray-200 rounded-xl shadow-sm select-none"
        style={{
          cursor:
            selectedTool === null
              ? "default"
              : selectedTool === "delete"
                ? "not-allowed"
                : selectedTool === "repeat" || selectedTool === "timesig"
                  ? "pointer"
                  : draggedNote
                    ? "grabbing"
                    : "crosshair",
        }}
      >
        {/* Gradient definitions for multi-colored beams */}
        <defs>
          {beamGroups.map((group, groupIndex) => {
            const colors = group.notes.map((n) => getNoteColor(n.pitch));
            const uniqueColors = [...new Set(colors)];
            if (uniqueColors.length > 1) {
              return (
                <linearGradient
                  key={`beam-gradient-${groupIndex}`}
                  id={`beam-gradient-${groupIndex}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  {group.notes.map((note, i) => (
                    <stop
                      key={note.id}
                      offset={`${(i / (group.notes.length - 1)) * 100}%`}
                      stopColor={getNoteColor(note.pitch)}
                    />
                  ))}
                </linearGradient>
              );
            }
            return null;
          })}
        </defs>

        {Array.from({ length: systemCount }, (_, i) => renderSystem(i))}

        {/* Duration extensions (render behind notes) */}
        {notes.map(renderDurationExtension)}
        {notes.map(renderNote)}

        {/* Lyrics editing zone highlight when lyrics tool is selected */}
        {selectedTool === "lyrics" &&
          !readOnly &&
          !isPlaying &&
          Array.from({ length: systemCount }, (_, systemIndex) => {
            const staffCenterY = getStaffCenterY(systemIndex);
            const lyricsZoneY = staffCenterY + LINE_SPACING + 40;
            const lyricsZoneLayout = getLayoutForSystem(
              systemLayouts,
              systemIndex,
            );
            // Fixed system width: staffRight - LEFT_MARGIN
            const lyricsZoneWidth = lyricsZoneLayout.staffRight - LEFT_MARGIN;
            return (
              <rect
                key={`lyrics-zone-${systemIndex}`}
                x={LEFT_MARGIN}
                y={lyricsZoneY}
                width={lyricsZoneWidth}
                height={30}
                fill="#fef3c7"
                opacity={0.5}
                rx={4}
                style={{ pointerEvents: "none" }}
              />
            );
          })}

        {/* Lyrics below each system */}
        {lyrics.map((lyric) => {
          // Use helper to find system for this absolute beat (handles variable time signatures)
          const lyricPosition = getSystemForAbsoluteBeat(
            systemLayouts,
            lyric.absoluteBeat,
          );
          if (!lyricPosition || lyricPosition.systemIndex >= systemCount)
            return null;
          const system = lyricPosition.systemIndex;

          // Skip rendering if this lyric is being edited inline
          if (
            editingLyric &&
            Math.abs(editingLyric.absoluteBeat - lyric.absoluteBeat) < 0.1
          ) {
            return null;
          }

          // Get system's beat width for variable widths
          const lyricSysLayout = getLayoutForSystem(systemLayouts, system);
          const lyricBeatWidth = lyricSysLayout.beatWidth;

          const beatInSystem = lyricPosition.beatInSystem;
          const x =
            LEFT_MARGIN +
            beatInSystem * lyricBeatWidth +
            getNoteOffset(lyricBeatWidth);
          const staffCenterY = getStaffCenterY(system);
          const lyricsY = staffCenterY + LINE_SPACING + 55;

          const isLyricToolActive =
            selectedTool === "lyrics" && !readOnly && !isPlaying;

          return (
            <text
              key={`lyric-${lyric.absoluteBeat}`}
              x={x}
              y={lyricsY}
              textAnchor="middle"
              fontSize={12}
              fontFamily="system-ui, sans-serif"
              fill={isLyricToolActive ? "#b45309" : "#374151"}
              style={{
                unicodeBidi: "isolate",
                cursor: isLyricToolActive ? "text" : "default",
              }}
              onClick={
                isLyricToolActive
                  ? (e) => {
                      e.stopPropagation();
                      setEditingLyric({
                        absoluteBeat: lyric.absoluteBeat,
                        initialText: lyric.text,
                      });
                    }
                  : undefined
              }
            >
              {lyric.text}
            </text>
          );
        })}

        {/* Render beams for grouped eighth notes */}
        {beamGroups.map((group, groupIndex) => {
          const { notes: groupNotes, stemDirection } = group;
          if (groupNotes.length < 2) return null;

          const stemH = 40;
          const beamThickness = 6;

          // Calculate beam Y position (at the end of stems)
          const stemYs = groupNotes.map((note) => {
            const noteY = getYFromPitch(note.pitch, note.system);
            return stemDirection === "up" ? noteY - stemH : noteY + stemH;
          });

          /**
           * Beam Slope Limiting (the "engraver's rule")
           *
           * In professional music engraving, beams should follow the melodic contour
           * (ascending notes = beam slopes up, descending = slopes down) BUT the slope
           * must be limited to prevent the beam from looking awkward or colliding with
           * other elements.
           *
           * Standard rule: max slope = half a staff space (LINE_SPACING / 2 = 16px)
           * This keeps beams visually balanced while still showing melodic direction.
           */
          const MAX_BEAM_SLOPE = LINE_SPACING / 2; // 16px max
          const rawFirstY = stemYs[0];
          const rawLastY = stemYs[stemYs.length - 1];
          const rawSlope = rawLastY - rawFirstY;
          const limitedSlope = Math.max(
            -MAX_BEAM_SLOPE,
            Math.min(MAX_BEAM_SLOPE, rawSlope),
          );

          // Anchor beam at the extremity so ALL stems can reach it
          // Stems up: beam at/above highest note; Stems down: beam at/below lowest note
          let firstY: number;
          let lastY: number;

          if (stemDirection === "up") {
            // Find the highest stem tip (smallest Y) - beam must be at or above this
            const minStemY = Math.min(...stemYs);
            firstY = minStemY;
            lastY = minStemY + limitedSlope;
          } else {
            // Find the lowest stem tip (largest Y) - beam must be at or below this
            const maxStemY = Math.max(...stemYs);
            firstY = maxStemY;
            lastY = maxStemY + limitedSlope;
          }

          // Get colors
          const colors = groupNotes.map((n) => getNoteColor(n.pitch));
          const uniqueColors = [...new Set(colors)];
          const beamColor =
            uniqueColors.length > 1
              ? `url(#beam-gradient-${groupIndex})`
              : colors[0];

          // Calculate stem X positions using system-specific beat width
          // Use getBeatXInSystem to account for decoration widths
          const stemXs = groupNotes.map((note) => {
            const sysLayout = getLayoutForSystem(systemLayouts, note.system);
            const noteX =
              getBeatXInSystem(sysLayout, note.beat) +
              getNoteOffset(sysLayout.beatWidth);
            return stemDirection === "up" ? noteX + 13 : noteX - 13;
          });

          const firstX = stemXs[0];
          const lastX = stemXs[stemXs.length - 1];

          // Calculate beam Y at each note's X position (linear interpolation)
          const getBeamYAtX = (x: number) => {
            if (firstX === lastX) return firstY;
            const t = (x - firstX) / (lastX - firstX);
            return firstY + t * (lastY - firstY);
          };

          // Calculate secondary beams for 16th notes
          // A 16th note needs a secondary beam; we draw partial beams (stubs) or full beams
          const secondaryBeams: Array<{
            startX: number;
            endX: number;
            startY: number;
            endY: number;
            color: string;
          }> = [];

          const secondaryBeamOffset = stemDirection === "up" ? 8 : -8;

          for (let i = 0; i < groupNotes.length; i++) {
            const note = groupNotes[i];
            if (note.duration === 0.25) {
              // 16th note - needs secondary beam
              const prevIs16th = i > 0 && groupNotes[i - 1].duration === 0.25;
              const nextIs16th =
                i < groupNotes.length - 1 &&
                groupNotes[i + 1].duration === 0.25;

              if (nextIs16th && !prevIs16th) {
                // Start of a run of 16ths - will be drawn when we hit the end
              } else if (prevIs16th) {
                // Continuation or end of 16th run - draw beam from prev to current
                const startX = stemXs[i - 1];
                const endX = stemXs[i];
                const startY = getBeamYAtX(startX) + secondaryBeamOffset;
                const endY = getBeamYAtX(endX) + secondaryBeamOffset;
                // Use gradient if colors differ
                const beamCol =
                  colors[i - 1] === colors[i]
                    ? colors[i]
                    : `url(#beam-gradient-${groupIndex})`;
                secondaryBeams.push({
                  startX,
                  endX,
                  startY,
                  endY,
                  color: beamCol,
                });
              } else {
                // Isolated 16th (adjacent to 8th notes) - draw a stub beam
                const stubLength = 12;
                const stemX = stemXs[i];
                const beamY = getBeamYAtX(stemX) + secondaryBeamOffset;
                // Determine stub direction: point toward the center of the group
                const isFirst = i === 0;
                const isLast = i === groupNotes.length - 1;
                let stubStartX: number, stubEndX: number;
                if (isFirst) {
                  // First note: stub extends right
                  stubStartX = stemX;
                  stubEndX = stemX + stubLength;
                } else if (isLast) {
                  // Last note: stub extends left
                  stubStartX = stemX - stubLength;
                  stubEndX = stemX;
                } else {
                  // Middle note: stub extends toward next note
                  stubStartX = stemX;
                  stubEndX = stemX + stubLength;
                }
                const stubStartY =
                  getBeamYAtX(stubStartX) + secondaryBeamOffset;
                const stubEndY = getBeamYAtX(stubEndX) + secondaryBeamOffset;
                secondaryBeams.push({
                  startX: stubStartX,
                  endX: stubEndX,
                  startY: stubStartY,
                  endY: stubEndY,
                  color: colors[i],
                });
              }
            }
          }

          return (
            <g key={`beam-group-${groupIndex}`}>
              {/* Draw stems from each note to the beam */}
              {groupNotes.map((note, i) => {
                const stemX = stemXs[i];
                const noteY = getYFromPitch(note.pitch, note.system);
                const beamY = getBeamYAtX(stemX);
                return (
                  <line
                    key={`beam-stem-${groupIndex}-${i}`}
                    x1={stemX}
                    y1={noteY}
                    x2={stemX}
                    y2={beamY}
                    stroke={colors[i]}
                    strokeWidth={3}
                  />
                );
              })}
              {/* Primary beam */}
              <polygon
                points={`
                  ${firstX},${firstY}
                  ${lastX},${lastY}
                  ${lastX},${
                    lastY +
                    (stemDirection === "up" ? beamThickness : -beamThickness)
                  }
                  ${firstX},${
                    firstY +
                    (stemDirection === "up" ? beamThickness : -beamThickness)
                  }
                `}
                fill={beamColor}
              />
              {/* Secondary beams for 16th notes */}
              {secondaryBeams.map((sb, sbIndex) => (
                <polygon
                  key={`secondary-beam-${groupIndex}-${sbIndex}`}
                  points={`
                    ${sb.startX},${sb.startY}
                    ${sb.endX},${sb.endY}
                    ${sb.endX},${
                      sb.endY +
                      (stemDirection === "up" ? beamThickness : -beamThickness)
                    }
                    ${sb.startX},${
                      sb.startY +
                      (stemDirection === "up" ? beamThickness : -beamThickness)
                    }
                  `}
                  fill={sb.color}
                />
              ))}
              {/* Dots for dotted notes within beam group */}
              {groupNotes.map((note, i) => {
                if (note.duration !== 0.75) return null;
                const dotSysLayout = getLayoutForSystem(
                  systemLayouts,
                  note.system,
                );
                // Use getBeatXInSystem to account for decoration widths
                const noteX =
                  getBeatXInSystem(dotSysLayout, note.beat) +
                  getNoteOffset(dotSysLayout.beatWidth);
                const noteY = getYFromPitch(note.pitch, note.system);
                return (
                  <circle
                    key={`beam-dot-${groupIndex}-${i}`}
                    cx={noteX + 20}
                    cy={noteY - LINE_SPACING / 4}
                    r={4}
                    fill={colors[i]}
                  />
                );
              })}
            </g>
          );
        })}

        {/* Hover highlight before first click (rendered on top of notes) */}
        {/* PLACEMENT: This MUST render AFTER notes/beams to appear on top
            - SVG has no z-index; rendering order determines layering
            - Staff → Notes → Beams → Hover Highlight (this)
            - If moved before notes, purple highlight will be hidden behind them */}
        {!repeatStart &&
          selectedTool === "repeat" &&
          hoveredRepeatMeasure &&
          (() => {
            const hoverStaffCenterY = getStaffCenterY(
              hoveredRepeatMeasure.system,
            );
            // Get measure position from system layout for variable beat widths
            const hoverSysLayout = getLayoutForSystem(
              systemLayouts,
              hoveredRepeatMeasure.system,
            );
            const hoverMeasureInfo =
              hoverSysLayout.measures[hoveredRepeatMeasure.measure];
            if (!hoverMeasureInfo) return null;
            const hoverMeasureX =
              LEFT_MARGIN +
              hoverMeasureInfo.startBeatInSystem * hoverSysLayout.beatWidth;
            const hoverMeasureWidth =
              hoverMeasureInfo.beatsInMeasure * hoverSysLayout.beatWidth;
            const hoverMeasureCenterX = hoverMeasureX + hoverMeasureWidth / 2;
            return (
              <g>
                <rect
                  x={hoverMeasureX}
                  y={hoverStaffCenterY - LINE_SPACING - 15}
                  width={hoverMeasureWidth}
                  height={LINE_SPACING * 2 + 30}
                  fill="#8b5cf6"
                  opacity={0.15}
                  rx={4}
                />
                {/* Instructional text */}
                <rect
                  x={hoverMeasureCenterX - 60}
                  y={hoverStaffCenterY - LINE_SPACING - 32}
                  width={120}
                  height={24}
                  fill="#f3e8ff"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  rx={6}
                />
                <text
                  x={hoverMeasureCenterX}
                  y={hoverStaffCenterY - LINE_SPACING - 16}
                  fontSize={12}
                  fontWeight="600"
                  fill="#6d28d9"
                  textAnchor="middle"
                  style={{ pointerEvents: "none" }}
                >
                  Click to set START
                </text>
              </g>
            );
          })()}

        {/* Interactive repeat placement instructional text (rendered on top of notes) */}
        {/* PLACEMENT: This also renders AFTER notes/beams for same SVG z-index reason
            - Shows range highlighting and dynamic START/END text during second click
            - Must appear above notes for visibility */}
        {repeatStart &&
          selectedTool === "repeat" &&
          (() => {
            const startSystem = repeatStart.system;
            const startMeasure = repeatStart.measure;

            // Determine where to show the instructional text and what to say
            const showTextSystem = hoveredRepeatMeasure
              ? hoveredRepeatMeasure.system
              : startSystem;
            const showTextMeasure = hoveredRepeatMeasure
              ? hoveredRepeatMeasure.measure
              : startMeasure;
            const staffCenterY = getStaffCenterY(showTextSystem);

            // Calculate if hovered measure comes before or after clicked measure
            const clickedAbsoluteMeasure =
              startSystem * measuresPerSystem + startMeasure;
            const hoveredAbsoluteMeasure = hoveredRepeatMeasure
              ? hoveredRepeatMeasure.system * measuresPerSystem +
                hoveredRepeatMeasure.measure
              : clickedAbsoluteMeasure;

            const isHoveredBefore =
              hoveredAbsoluteMeasure < clickedAbsoluteMeasure;
            const textToShow = hoveredRepeatMeasure
              ? isHoveredBefore
                ? "Click to set START"
                : "Click to set END"
              : "Click to set END";

            // Get measure position from system layout for variable beat widths
            const textSysLayout = getLayoutForSystem(
              systemLayouts,
              showTextSystem,
            );
            const textMeasureInfo = textSysLayout.measures[showTextMeasure];
            if (!textMeasureInfo) return null;
            const textMeasureX =
              LEFT_MARGIN +
              textMeasureInfo.startBeatInSystem * textSysLayout.beatWidth;
            const textMeasureWidth =
              textMeasureInfo.beatsInMeasure * textSysLayout.beatWidth;
            const textMeasureCenterX = textMeasureX + textMeasureWidth / 2;

            return (
              <g>
                {/* Background rectangle for text visibility */}
                <rect
                  x={
                    textMeasureCenterX -
                    (textToShow === "Click to set END" ? 55 : 60)
                  }
                  y={staffCenterY - LINE_SPACING - 32}
                  width={textToShow === "Click to set END" ? 110 : 120}
                  height={24}
                  fill="#f3e8ff"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  rx={6}
                  style={{ pointerEvents: "none" }}
                />
                {/* Text on top */}
                <text
                  x={textMeasureCenterX}
                  y={staffCenterY - LINE_SPACING - 16}
                  fontSize={12}
                  fontWeight="600"
                  fill="#7c3aed"
                  textAnchor="middle"
                  style={{ pointerEvents: "none" }}
                >
                  {textToShow}
                </text>
              </g>
            );
          })()}

        {playheadX !== null && (
          <g>
            <line
              x1={playheadX}
              y1={getStaffCenterY(playheadSystem) - LINE_SPACING - 20}
              x2={playheadX}
              y2={getStaffCenterY(playheadSystem) + LINE_SPACING + 20}
              stroke="#10b981"
              strokeWidth={3}
            />
            <polygon
              points={`${playheadX - 6},${
                getStaffCenterY(playheadSystem) - LINE_SPACING - 20
              } ${playheadX + 6},${
                getStaffCenterY(playheadSystem) - LINE_SPACING - 20
              } ${playheadX},${
                getStaffCenterY(playheadSystem) - LINE_SPACING - 12
              }`}
              fill="#10b981"
            />
          </g>
        )}

        {notes.length === 0 && systemCount === 1 && (
          <text
            x={svgWidth / 2}
            y={getStaffCenterY(0)}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={14}
          >
            Click on the staff to add notes
          </text>
        )}

        {/* Marker drag preview - shows target measure highlight and floating marker */}
        {draggedMarker && markerDragPosition && (
          <g style={{ pointerEvents: "none" }}>
            {/* Target measure highlight - end markers highlight the measure BEFORE the bar line */}
            {(() => {
              const dragSysLayout = getLayoutForSystem(
                systemLayouts,
                markerDragPosition.targetSystem,
              );
              const highlightMeasureIndex = Math.max(
                0,
                markerDragPosition.targetMeasure -
                  (draggedMarker.type === "end" ? 1 : 0),
              );
              const dragMeasureInfo =
                dragSysLayout.measures[highlightMeasureIndex];
              if (!dragMeasureInfo) return null;
              const dragMeasureX =
                LEFT_MARGIN +
                dragMeasureInfo.startBeatInSystem * dragSysLayout.beatWidth;
              const dragMeasureWidth =
                dragMeasureInfo.beatsInMeasure * dragSysLayout.beatWidth;
              return (
                <rect
                  x={dragMeasureX}
                  y={
                    getStaffCenterY(markerDragPosition.targetSystem) -
                    LINE_SPACING -
                    15
                  }
                  width={dragMeasureWidth}
                  height={LINE_SPACING * 2 + 30}
                  fill="#a855f7"
                  opacity={0.2}
                  rx={4}
                />
              );
            })()}
            {/* Floating marker preview following mouse */}
            <g
              transform={`translate(${markerDragPosition.x - 15}, ${markerDragPosition.y - 40})`}
              opacity={0.8}
            >
              {draggedMarker.type === "start" ? (
                <>
                  <line
                    x1={6}
                    y1={0}
                    x2={6}
                    y2={LINE_SPACING * 2 + 16}
                    stroke="#a855f7"
                    strokeWidth={3}
                  />
                  <circle
                    cx={18}
                    cy={LINE_SPACING / 2 + 8}
                    r={5}
                    fill="#a855f7"
                  />
                  <circle
                    cx={18}
                    cy={LINE_SPACING * 1.5 + 8}
                    r={5}
                    fill="#a855f7"
                  />
                </>
              ) : (
                <>
                  <line
                    x1={24}
                    y1={0}
                    x2={24}
                    y2={LINE_SPACING * 2 + 16}
                    stroke="#a855f7"
                    strokeWidth={3}
                  />
                  <circle
                    cx={12}
                    cy={LINE_SPACING / 2 + 8}
                    r={5}
                    fill="#a855f7"
                  />
                  <circle
                    cx={12}
                    cy={LINE_SPACING * 1.5 + 8}
                    r={5}
                    fill="#a855f7"
                  />
                </>
              )}
            </g>
          </g>
        )}
      </svg>

      {/* Time signature picker popup */}
      {timeSigPicker && (
        <div
          className="absolute bg-white rounded-lg shadow-lg border border-cyan-200 p-3 z-50"
          style={{
            left: timeSigPicker.x - 60,
            top: timeSigPicker.y + LINE_SPACING * 2 + 20,
          }}
        >
          <div className="text-xs font-semibold text-cyan-600 mb-2">
            Time Signature at M{timeSigPicker.measureNumber + 1}
          </div>
          <div className="flex gap-2 items-center">
            <select
              className="border rounded px-2 py-1 text-sm w-14"
              defaultValue={timeSignature.numerator}
              id="timesig-numerator"
            >
              {TIME_SIG_NUMERATORS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-gray-500">/</span>
            <select
              className="border rounded px-2 py-1 text-sm w-14"
              defaultValue={timeSignature.denominator}
              id="timesig-denominator"
            >
              {TIME_SIG_DENOMINATORS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              className="flex-1 px-3 py-1 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600"
              onClick={() => {
                const numEl = document.getElementById(
                  "timesig-numerator",
                ) as HTMLSelectElement;
                const denEl = document.getElementById(
                  "timesig-denominator",
                ) as HTMLSelectElement;
                if (numEl && denEl && onTimeSignatureChangesChange) {
                  const newTimeSig = {
                    numerator: parseInt(numEl.value, 10),
                    denominator: parseInt(denEl.value, 10),
                  };
                  // Check if there's already a change at this measure
                  const existingIndex = timeSignatureChanges.findIndex(
                    (c) => c.measureNumber === timeSigPicker.measureNumber,
                  );
                  if (existingIndex >= 0) {
                    // Update existing
                    const updated = [...timeSignatureChanges];
                    updated[existingIndex] = {
                      ...updated[existingIndex],
                      timeSignature: newTimeSig,
                    };
                    onTimeSignatureChangesChange(updated);
                  } else {
                    // Add new
                    onTimeSignatureChangesChange([
                      ...timeSignatureChanges,
                      {
                        id: `ts-change-${Date.now()}`,
                        measureNumber: timeSigPicker.measureNumber,
                        timeSignature: newTimeSig,
                      },
                    ]);
                  }
                }
                setTimeSigPicker(null);
              }}
            >
              Set
            </button>
            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              onClick={() => setTimeSigPicker(null)}
            >
              Cancel
            </button>
            {/* Delete button if there's an existing change at this measure */}
            {timeSignatureChanges.some(
              (c) => c.measureNumber === timeSigPicker.measureNumber,
            ) && (
              <button
                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                onClick={() => {
                  if (onTimeSignatureChangesChange) {
                    onTimeSignatureChangesChange(
                      timeSignatureChanges.filter(
                        (c) => c.measureNumber !== timeSigPicker.measureNumber,
                      ),
                    );
                  }
                  setTimeSigPicker(null);
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}

      {/* Context menu for note editing or adding notes */}
      {contextMenu && contextMenu.type === "note" && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px] overflow-y-auto"
          style={{
            left: contextMenu.x,
            // Constrain menu to viewport: menu is ~560px tall, keep 40px margin
            top: Math.min(
              contextMenu.y,
              typeof window !== "undefined"
                ? window.innerHeight - 600
                : contextMenu.y,
            ),
            maxHeight: "calc(100vh - 40px)",
          }}
        >
          {/* Duration section - collapsible */}
          <button
            onClick={() => toggleSection("duration")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Duration</span>
            <span className="text-gray-400">
              {collapsedSections.duration ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.duration && (
            <>
              <button
                onClick={() => handleChangeDuration(0.25)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={0.25} /> Sixteenth
              </button>
              <button
                onClick={() => handleChangeDuration(0.5)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={0.5} /> Eighth
              </button>
              <button
                onClick={() => handleChangeDuration(0.75)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={0.75} /> Dotted Eighth
              </button>
              <button
                onClick={() => handleChangeDuration(1)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={1} /> Quarter
              </button>
              <button
                onClick={() => handleChangeDuration(1.5)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={1.5} /> Dotted Quarter
              </button>
              <button
                onClick={() => handleChangeDuration(2)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={2} /> Half
              </button>
              <button
                onClick={() => handleChangeDuration(3)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={3} /> Dotted Half
              </button>
              <button
                onClick={() => handleChangeDuration(4)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={4} /> Whole
              </button>
            </>
          )}

          {/* Accidental section - collapsible */}
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => toggleSection("accidental")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Accidental</span>
            <span className="text-gray-400">
              {collapsedSections.accidental ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.accidental && (
            <div className="px-2 py-1 flex gap-1">
              <button
                onClick={() => handleChangeAccidental(null)}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 font-medium"
                title="Natural"
              >
                ♮
              </button>
              <button
                onClick={() => handleChangeAccidental("#")}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 font-medium"
                title="Sharp"
              >
                ♯
              </button>
              <button
                onClick={() => handleChangeAccidental("b")}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 font-medium"
                title="Flat"
              >
                ♭
              </button>
            </div>
          )}

          {/* Change Note section - collapsible */}
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => toggleSection("changeNote")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Change Note</span>
            <span className="text-gray-400">
              {collapsedSections.changeNote ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.changeNote && (
            <div className="px-2 py-1 flex gap-0.5">
              {["C", "D", "E", "F", "G", "A", "B"].map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleChangePitchLetter(letter)}
                  className="flex-1 px-1 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 font-medium"
                >
                  {letter}
                </button>
              ))}
            </div>
          )}

          {/* Octave section - collapsible */}
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => toggleSection("octave")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Octave</span>
            <span className="text-gray-400">
              {collapsedSections.octave ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.octave && (
            <div className="px-2 py-1 flex gap-1">
              <button
                onClick={() => handleChangeOctave("up")}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 flex items-center justify-center gap-1"
                title="Octave Up"
              >
                <span>▲</span> Up
              </button>
              <button
                onClick={() => handleChangeOctave("down")}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 flex items-center justify-center gap-1"
                title="Octave Down"
              >
                <span>▼</span> Down
              </button>
            </div>
          )}

          {/* Delete section - always visible */}
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={handleDeleteFromMenu}
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
          >
            <span>🗑</span> Delete
          </button>
        </div>
      )}

      {/* Context menu for adding notes on empty space */}
      {contextMenu && contextMenu.type === "empty" && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px] overflow-y-auto"
          style={{
            left: contextMenu.x,
            // Constrain menu to viewport: estimate menu height ~350px, keep 20px margin
            top: Math.min(
              contextMenu.y,
              typeof window !== "undefined"
                ? window.innerHeight - 370
                : contextMenu.y,
            ),
            maxHeight: "calc(100vh - 40px)",
          }}
        >
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Add Note ({contextMenu.pitch})
          </div>
          <button
            onClick={() => handleAddNoteFromMenu(0.25)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={0.25} /> Sixteenth
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(0.5)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={0.5} /> Eighth
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(0.75)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={0.75} /> Dotted Eighth
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(1)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={1} /> Quarter
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(1.5)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={1.5} /> Dotted Quarter
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(2)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={2} /> Half
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(3)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={3} /> Dotted Half
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(4)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={4} /> Whole
          </button>
        </div>
      )}

      {/* Inline lyric input - rendered as HTML overlay */}
      {editingLyric &&
        (() => {
          const position = getInlineLyricPosition();
          if (!position) return null;
          return (
            <InlineLyricInput
              initialText={editingLyric.initialText}
              position={position}
              onSave={handleSaveLyric}
              onCancel={handleCancelLyricEdit}
              onNavigate={handleNavigateLyric}
            />
          );
        })()}
    </div>
  );
}

// Export constants and helpers for use in page
export {
  LEFT_MARGIN,
  BEAT_WIDTH,
  SYSTEM_HEIGHT,
  SYSTEM_TOP_MARGIN,
  getLayoutConfig,
  getBeatFromX,
};
