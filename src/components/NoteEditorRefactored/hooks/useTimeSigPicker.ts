// src/components/NoteEditorRefactored/hooks/useTimeSigPicker.ts
// Manages time signature picker state for mid-measure time signature changes

import { useState, useCallback, useEffect, useRef } from "react";
import { TimeSignatureChange } from "@/lib/types";
import { TimeSignature } from "../utils/timeSigConfig";
import { NoteTool } from "../types";

// Time signature picker state
export interface TimeSigPickerState {
  measureNumber: number;
  x: number;
  y: number;
}

// Hovered bar line state for time sig preview
export interface HoveredTimeSigBarState {
  systemIndex: number;
  measureIndex: number;
}

// Hook parameters
export interface UseTimeSigPickerParams {
  timeSignatureChanges: TimeSignatureChange[];
  onTimeSignatureChangesChange?: (changes: TimeSignatureChange[]) => void;
  initialTimeSignature: TimeSignature;
  selectedTool: NoteTool;
}

// Hook return type
export interface UseTimeSigPickerReturn {
  // State
  timeSigPicker: TimeSigPickerState | null;
  setTimeSigPicker: (state: TimeSigPickerState | null) => void;
  hoveredTimeSigBar: HoveredTimeSigBarState | null;
  setHoveredTimeSigBar: (state: HoveredTimeSigBarState | null) => void;

  // Handlers
  openTimeSigPicker: (measureNumber: number, x: number, y: number) => void;
  closeTimeSigPicker: () => void;
  handleSetTimeSig: (numerator: number, denominator: number) => void;
  handleDeleteTimeSig: () => void;

  // Helpers
  hasChangeAtMeasure: (measureNumber: number) => boolean;
  getChangeAtMeasure: (
    measureNumber: number,
  ) => TimeSignatureChange | undefined;
}

// Available time signature values
export const TIME_SIG_NUMERATORS = [2, 3, 4, 5, 6, 7, 8, 9, 12];
export const TIME_SIG_DENOMINATORS = [2, 4, 8, 16];

/**
 * Hook for managing time signature picker state
 */
export function useTimeSigPicker({
  timeSignatureChanges,
  onTimeSignatureChangesChange,
  initialTimeSignature: _initialTimeSignature,
  selectedTool,
}: UseTimeSigPickerParams): UseTimeSigPickerReturn {
  // Picker state
  const [timeSigPicker, setTimeSigPicker] = useState<TimeSigPickerState | null>(
    null,
  );

  // Hovered bar line state
  const [hoveredTimeSigBar, setHoveredTimeSigBar] =
    useState<HoveredTimeSigBarState | null>(null);

  // Clear state when tool changes away from timesig
  const prevToolRef = useRef(selectedTool);
  useEffect(() => {
    if (prevToolRef.current === "timesig" && selectedTool !== "timesig") {
      // Tool changed away from timesig - clear states
      const timeoutId = setTimeout(() => {
        setTimeSigPicker(null);
        setHoveredTimeSigBar(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    prevToolRef.current = selectedTool;
  }, [selectedTool]);

  // Open the time signature picker at a specific location
  const openTimeSigPicker = useCallback(
    (measureNumber: number, x: number, y: number) => {
      setTimeSigPicker({ measureNumber, x, y });
    },
    [],
  );

  // Close the picker
  const closeTimeSigPicker = useCallback(() => {
    setTimeSigPicker(null);
  }, []);

  // Check if there's a change at a given measure
  const hasChangeAtMeasure = useCallback(
    (measureNumber: number) => {
      return timeSignatureChanges.some(
        (c) => c.measureNumber === measureNumber,
      );
    },
    [timeSignatureChanges],
  );

  // Get the change at a specific measure
  const getChangeAtMeasure = useCallback(
    (measureNumber: number) => {
      return timeSignatureChanges.find(
        (c) => c.measureNumber === measureNumber,
      );
    },
    [timeSignatureChanges],
  );

  // Set a new time signature at the current picker location
  const handleSetTimeSig = useCallback(
    (numerator: number, denominator: number) => {
      if (!timeSigPicker || !onTimeSignatureChangesChange) return;

      const newTimeSig = { numerator, denominator };
      const existingIndex = timeSignatureChanges.findIndex(
        (c) => c.measureNumber === timeSigPicker.measureNumber,
      );

      if (existingIndex >= 0) {
        // Update existing change
        const updated = [...timeSignatureChanges];
        updated[existingIndex] = {
          ...updated[existingIndex],
          timeSignature: newTimeSig,
        };
        onTimeSignatureChangesChange(updated);
      } else {
        // Add new change
        onTimeSignatureChangesChange([
          ...timeSignatureChanges,
          {
            id: `ts-change-${Date.now()}`,
            measureNumber: timeSigPicker.measureNumber,
            timeSignature: newTimeSig,
          },
        ]);
      }

      setTimeSigPicker(null);
    },
    [timeSigPicker, timeSignatureChanges, onTimeSignatureChangesChange],
  );

  // Delete the time signature change at the current picker location
  const handleDeleteTimeSig = useCallback(() => {
    if (!timeSigPicker || !onTimeSignatureChangesChange) return;

    onTimeSignatureChangesChange(
      timeSignatureChanges.filter(
        (c) => c.measureNumber !== timeSigPicker.measureNumber,
      ),
    );

    setTimeSigPicker(null);
  }, [timeSigPicker, timeSignatureChanges, onTimeSignatureChangesChange]);

  return {
    // State
    timeSigPicker,
    setTimeSigPicker,
    hoveredTimeSigBar,
    setHoveredTimeSigBar,

    // Handlers
    openTimeSigPicker,
    closeTimeSigPicker,
    handleSetTimeSig,
    handleDeleteTimeSig,

    // Helpers
    hasChangeAtMeasure,
    getChangeAtMeasure,
  };
}
