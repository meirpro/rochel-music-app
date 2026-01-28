// src/components/NoteEditorRefactored/utils/timeSigConfig.ts
// Extracted from NoteEditor.tsx lines 84-217

import {
  MIN_BEAT_WIDTH,
  BASE_BEAT_WIDTH,
  LEFT_MARGIN,
  RIGHT_MARGIN,
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
export function getTimeSigKey(ts: TimeSignature): string {
  return `${ts.numerator}/${ts.denominator}`;
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
export const TIME_SIG_CONFIG: Record<
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
export function getLayoutConfig(
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
