/**
 * Measures Per Row Control Component
 *
 * Allows users to adjust how many measures are displayed per row.
 * Shows current value, min/max bounds, and +/- buttons for adjustment.
 */

"use client";

import { TimeSignature } from "@/lib/types";
import { getMaxMeasuresPerRow } from "@/hooks/useResponsiveLayout";

interface MeasuresControlProps {
  value: number;
  onChange: (value: number) => void;
  containerWidth: number;
  timeSignature: TimeSignature;
  minMeasures?: number;
  leftMargin?: number;
  rightMargin?: number;
}

export function MeasuresControl({
  value,
  onChange,
  containerWidth,
  timeSignature,
  minMeasures = 1,
  leftMargin = 100,
  rightMargin = 20,
}: MeasuresControlProps) {
  const beatsPerMeasure = timeSignature.numerator;

  // Calculate maximum measures that can fit
  const maxMeasures = getMaxMeasuresPerRow(
    containerWidth,
    beatsPerMeasure,
    40, // minBeatWidth
    leftMargin,
    rightMargin,
  );

  const handleDecrease = () => {
    if (value > minMeasures) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < maxMeasures) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-purple-700">
        Measures per row:
      </label>

      <div className="flex items-center gap-1 bg-white rounded-lg border-2 border-purple-200 shadow-sm">
        {/* Decrease button */}
        <button
          onClick={handleDecrease}
          disabled={value <= minMeasures}
          className="px-3 py-1.5 text-purple-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-l-lg font-semibold text-lg"
          aria-label="Decrease measures per row"
        >
          −
        </button>

        {/* Current value display */}
        <div className="px-4 py-1.5 min-w-[3rem] text-center">
          <span className="text-lg font-semibold text-purple-800">{value}</span>
        </div>

        {/* Increase button */}
        <button
          onClick={handleIncrease}
          disabled={value >= maxMeasures}
          className="px-3 py-1.5 text-purple-600 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-r-lg font-semibold text-lg"
          aria-label="Increase measures per row"
        >
          +
        </button>
      </div>

      {/* Max indicator */}
      <span className="text-xs text-gray-500">(max {maxMeasures})</span>
    </div>
  );
}

/**
 * Compact version for toolbar
 */
interface MeasuresControlCompactProps {
  value: number;
  onChange: (value: number) => void;
  maxMeasures: number; // Max is now passed in (typically = totalMeasures)
  label?: string;
}

export function MeasuresControlCompact({
  value,
  onChange,
  maxMeasures,
  label = "Per row:",
}: MeasuresControlCompactProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-purple-600 text-xs font-medium">{label}</span>
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="w-6 h-6 rounded bg-purple-200 hover:bg-purple-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-purple-800 font-bold transition-colors text-sm"
        aria-label="Fewer measures"
      >
        −
      </button>

      <div className="w-8 h-6 bg-white rounded border border-purple-200 flex items-center justify-center">
        <span className="text-xs font-semibold text-purple-800">{value}</span>
      </div>

      <button
        onClick={() => onChange(Math.min(maxMeasures, value + 1))}
        disabled={value >= maxMeasures}
        className="w-6 h-6 rounded bg-purple-200 hover:bg-purple-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-purple-800 font-bold transition-colors text-sm"
        aria-label="More measures"
      >
        +
      </button>
    </div>
  );
}
