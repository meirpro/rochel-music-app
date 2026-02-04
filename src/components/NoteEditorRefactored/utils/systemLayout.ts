// src/components/NoteEditorRefactored/utils/systemLayout.ts
// Extracted from NoteEditor.tsx lines 220-690

import { TimeSignatureChange } from "@/lib/types";
import {
  MIN_BEAT_WIDTH,
  BASE_BEAT_WIDTH,
  LEFT_MARGIN,
  RIGHT_MARGIN,
  TIME_SIG_DISPLAY_WIDTH,
  REPEAT_MARKER_WIDTH,
  getNoteOffset,
} from "@/lib/layoutUtils";
import { TimeSignature, getTimeSigKey, TIME_SIG_CONFIG } from "./timeSigConfig";

// Info about a single measure within a system
export interface MeasureInfo {
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
export interface SystemLayout {
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
export interface RepeatMarkerForLayout {
  measureNumber: number;
  type: "start" | "end";
}

// Calculate per-system layouts with uniform width but variable beat spacing
// Includes dynamic space for time signatures and repeat markers
// noteSpacing: 1.0-2.0 (100%-200%) controls overall system width
export function calculateSystemLayouts(
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
      // END marker at measureNumber N means it's at the START of measure N,
      // which is visually at the END of measure N-1. So check measureIndex + 1.
      const hasRepeatEnd = repeatEndMeasures.has(measureIndex + 1);

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
export function getLayoutForSystem(
  systemLayouts: SystemLayout[],
  systemIndex: number,
): SystemLayout {
  // Guard against NaN/undefined system index
  if (!Number.isFinite(systemIndex) || systemIndex < 0) {
    console.warn(
      `[getLayoutForSystem] Invalid systemIndex: ${systemIndex}. Defaulting to 0.`,
    );
    systemIndex = 0;
  }

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
export function findBestSystemForX(
  x: number,
  initialSystem: number,
  systemLayouts: SystemLayout[],
  systemCount: number,
  snapXFn: (
    x: number,
    staffRight: number,
    beatWidth: number,
    sysLayout?: SystemLayout,
  ) => number,
  getBeatFromXInSystemFn: (
    sysLayout: SystemLayout,
    x: number,
    noteOffset: number,
  ) => number,
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
    const snappedX = snapXFn(x, layout.staffRight, layout.beatWidth, layout);
    const rawBeat = getBeatFromXInSystemFn(layout, snappedX, noteOffset);
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
  const snappedX = snapXFn(
    x,
    fallbackLayout.staffRight,
    fallbackLayout.beatWidth,
    fallbackLayout,
  );
  const rawBeat = getBeatFromXInSystemFn(fallbackLayout, snappedX, noteOffset);
  return {
    system: fallbackSystemIdx,
    beat: Math.max(0, Math.min(fallbackLayout.totalBeats - 0.5, rawBeat)),
    sysLayout: fallbackLayout,
  };
}

// Find which system contains a given absolute beat and return the beat within that system
export function getSystemForAbsoluteBeat(
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
export function getMeasureAtBeat(
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
export function getBeatXInSystem(
  sysLayout: SystemLayout,
  beatInSystem: number,
): number {
  // Guard against NaN/undefined beat values (can happen with corrupted data)
  if (!Number.isFinite(beatInSystem)) {
    console.warn(
      `[getBeatXInSystem] Invalid beatInSystem: ${beatInSystem}. Defaulting to 0.`,
    );
    beatInSystem = 0;
  }

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

/**
 * Convert X coordinate to beat position within a system (accounts for decorations)
 *
 * This is the inverse of snapX - given a snapped X coordinate, return the beat number.
 * Used during drag operations to determine which beat the note should be placed at.
 *
 * EPSILON FIX: This function and snapX must use matching epsilon values to ensure
 * consistency. When snapX snaps a position to (say) beat 2.0, this function must
 * return exactly 2.0 when given that same X coordinate. Due to floating-point
 * division, the raw calculation might produce 1.9999999 instead of 2.0, which
 * would then round to 1.5 (the previous half-beat). The epsilon ensures we
 * consistently round to the intended beat.
 *
 * IMPORTANT: Both snapX and getBeatFromXInSystem must agree on snap boundaries.
 * If one uses epsilon and the other doesn't, notes will appear to "jump" during
 * drag operations as the two calculations disagree.
 */
export function getBeatFromXInSystem(
  sysLayout: SystemLayout,
  x: number,
  noteOffset: number,
): number {
  // Remove note offset for calculation
  const xWithoutOffset = x - noteOffset;

  // Epsilon biases rounding forward - must match snapX epsilon behavior
  const EPSILON = 0.0001;

  // Find which measure this X falls into
  for (const measure of sysLayout.measures) {
    const measureStartX = LEFT_MARGIN + measure.xOffset;

    // Extend left tolerance to include prefixWidth (time sig display area)
    // so clicks in the decoration area are assigned to this measure
    const leftTolerance = measure.prefixWidth + 5;

    // Check if X falls within this measure's left boundary
    if (xWithoutOffset >= measureStartX - leftTolerance) {
      // X is potentially in this measure - calculate the snap position
      const xInMeasure = Math.max(0, xWithoutOffset - measureStartX);
      const beatInMeasure = xInMeasure / sysLayout.beatWidth;
      const rawBeat = measure.startBeatInSystem + beatInMeasure + EPSILON;
      const snappedBeat = Math.round(rawBeat * 2) / 2; // Snap to half-beats

      // Check if snapped beat is within this measure's valid range
      // If it exceeds measure bounds, fall through to next measure
      const maxBeatInMeasure =
        measure.startBeatInSystem + measure.beatsInMeasure - 0.5;
      if (snappedBeat <= maxBeatInMeasure) {
        return snappedBeat;
      }
      // Snapped beat exceeds measure - continue to next measure
    }
  }

  // Fallback: use simple calculation (should rarely reach here now)
  const rawBeat =
    (xWithoutOffset - LEFT_MARGIN) / sysLayout.beatWidth + EPSILON;
  return Math.round(rawBeat * 2) / 2;
}

// Import types needed for conversion functions
import {
  EditorNote,
  RenderedNote,
  RepeatMarker,
  RenderedRepeatMarker,
} from "../types";

/**
 * Convert a single note from absoluteBeat format to rendered format with system/beat
 * Returns null if note has invalid data
 */
export function toRenderedNote(
  note: EditorNote,
  systemLayouts: SystemLayout[],
): RenderedNote | null {
  // Validate note data
  if (!note.pitch || !Number.isFinite(note.absoluteBeat)) {
    console.warn("[toRenderedNote] Invalid note data:", note.id);
    return null;
  }

  const position = getSystemForAbsoluteBeat(systemLayouts, note.absoluteBeat);
  if (!position) {
    console.warn(
      "[toRenderedNote] Could not find system for beat:",
      note.absoluteBeat,
    );
    return null;
  }

  return {
    ...note,
    system: position.systemIndex,
    beat: position.beatInSystem,
  };
}

/**
 * Convert an array of notes from absoluteBeat to rendered format
 * Filters out notes with invalid data
 */
export function toRenderedNotes(
  notes: EditorNote[],
  systemLayouts: SystemLayout[],
): RenderedNote[] {
  const rendered: RenderedNote[] = [];
  for (const note of notes) {
    const renderedNote = toRenderedNote(note, systemLayouts);
    if (renderedNote) {
      rendered.push(renderedNote);
    }
  }
  return rendered;
}

/**
 * Convert a repeat marker from absolute measureNumber to rendered format with system/measure
 *
 * For END markers: measureNumber indicates "after this measure number" which means
 * the marker appears at the END of measure (measureNumber - 1). When measureNumber
 * is a multiple of measuresPerRow, the marker belongs at the end of the previous system.
 */
export function toRenderedRepeatMarker(
  marker: RepeatMarker,
  measuresPerRow: number,
): RenderedRepeatMarker {
  let system = Math.floor(marker.measureNumber / measuresPerRow);
  let measure = marker.measureNumber % measuresPerRow;

  // For END markers at system boundaries (measure would be 0), place at end of previous system
  // e.g., measureNumber=8 with measuresPerRow=4 should be system=1, measure=4 (end of system 1)
  if (marker.type === "end" && measure === 0 && marker.measureNumber > 0) {
    system = system - 1;
    measure = measuresPerRow; // This equals sysMeasures.length for that system
  }

  return {
    ...marker,
    system,
    measure,
  };
}

/**
 * Convert an array of repeat markers to rendered format
 */
export function toRenderedRepeatMarkers(
  markers: RepeatMarker[],
  measuresPerRow: number,
): RenderedRepeatMarker[] {
  return markers.map((m) => toRenderedRepeatMarker(m, measuresPerRow));
}

/**
 * Convert system/beat position back to absoluteBeat
 */
export function toAbsoluteBeat(
  systemLayouts: SystemLayout[],
  system: number,
  beat: number,
): number {
  const layout = systemLayouts[system];
  if (!layout) {
    // Fallback: estimate based on typical layout
    console.warn("[toAbsoluteBeat] System layout not found:", system);
    return system * 8 + beat; // Assume 8 beats per system as fallback
  }
  return layout.startBeat + beat;
}
