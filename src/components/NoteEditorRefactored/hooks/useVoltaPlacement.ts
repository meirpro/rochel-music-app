/**
 * useVoltaPlacement.ts - Hook for volta bracket placement
 *
 * Implements two-click workflow for placing volta brackets (1st/2nd endings):
 * 1. First click: Sets start measure (must be inside a repeat section)
 * 2. Second click: Sets end measure, auto-assigns volta number
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
// Note: getBeatFromXInSystem properly handles measure xOffsets for decoration-aware positioning
import {
  SystemLayout,
  getLayoutForSystem,
  getBeatFromXInSystem,
} from "../utils/systemLayout";
import { VoltaBracket, RepeatMarker, NoteTool } from "../types";

// Volta start state type
export interface VoltaStartState {
  system: number;
  measure: number;
  repeatPairId: string; // Which repeat section this volta belongs to
}

// Hook parameters
export interface UseVoltaPlacementParams {
  voltaBrackets: VoltaBracket[];
  onVoltaBracketsChange?: (brackets: VoltaBracket[]) => void;
  repeatMarkers: RepeatMarker[]; // Need to find repeat section boundaries
  systemLayouts: SystemLayout[];
  measuresPerSystem: number;
  beatsPerMeasure: number;
  selectedTool: NoteTool;
}

// Hook return type
export interface UseVoltaPlacementReturn {
  // State
  voltaStart: VoltaStartState | null;
  setVoltaStart: (state: VoltaStartState | null) => void;
  hoveredVoltaMeasure: { system: number; measure: number } | null;

  // Handlers
  handleVoltaClick: (x: number, system: number) => boolean;
  handleVoltaHover: (x: number, system: number) => void;
  clearVoltaHover: () => void;

  // UI state
  isPlacingVolta: boolean;
}

/**
 * Find the repeat section that contains a given absolute measure
 */
function findRepeatSectionForMeasure(
  absoluteMeasure: number,
  repeatMarkers: RepeatMarker[],
): { pairId: string; startMeasure: number; endMeasure: number } | null {
  // Group markers by pairId
  const pairs = new Map<string, { start?: RepeatMarker; end?: RepeatMarker }>();

  for (const marker of repeatMarkers) {
    if (!pairs.has(marker.pairId)) {
      pairs.set(marker.pairId, {});
    }
    const pair = pairs.get(marker.pairId)!;
    if (marker.type === "start") {
      pair.start = marker;
    } else {
      pair.end = marker;
    }
  }

  // Find a complete pair that contains this measure
  for (const [pairId, pair] of pairs) {
    if (pair.start && pair.end) {
      const startMeasure = pair.start.measureNumber;
      const endMeasure = pair.end.measureNumber;
      // Measure must be within the repeat section
      if (absoluteMeasure >= startMeasure && absoluteMeasure < endMeasure) {
        return { pairId, startMeasure, endMeasure };
      }
    }
  }

  return null;
}

/**
 * Get the next volta number for a repeat section
 */
function getNextVoltaNumber(
  repeatPairId: string,
  voltaBrackets: VoltaBracket[],
): number {
  const existingVoltas = voltaBrackets.filter(
    (v) => v.repeatPairId === repeatPairId,
  );
  if (existingVoltas.length === 0) return 1;
  return Math.max(...existingVoltas.map((v) => v.voltaNumber)) + 1;
}

/**
 * Check if a volta would overlap with existing voltas
 */
function wouldOverlap(
  startMeasure: number,
  endMeasure: number,
  repeatPairId: string,
  voltaBrackets: VoltaBracket[],
): boolean {
  const existingVoltas = voltaBrackets.filter(
    (v) => v.repeatPairId === repeatPairId,
  );

  for (const volta of existingVoltas) {
    // Check for overlap
    if (startMeasure < volta.endMeasure && endMeasure > volta.startMeasure) {
      return true;
    }
  }

  return false;
}

/**
 * Hook for managing volta bracket placement
 */
export function useVoltaPlacement({
  voltaBrackets,
  onVoltaBracketsChange,
  repeatMarkers,
  systemLayouts,
  measuresPerSystem,
  beatsPerMeasure,
  selectedTool,
}: UseVoltaPlacementParams): UseVoltaPlacementReturn {
  // Volta start state - tracks first click
  const [voltaStart, setVoltaStart] = useState<VoltaStartState | null>(null);

  // Hover state for preview
  const [hoveredVoltaMeasure, setHoveredVoltaMeasure] = useState<{
    system: number;
    measure: number;
  } | null>(null);

  // Clear state when tool changes away from volta
  const prevToolRef = useRef(selectedTool);
  useEffect(() => {
    if (prevToolRef.current === "volta" && selectedTool !== "volta") {
      const timeoutId = setTimeout(() => {
        setVoltaStart(null);
        setHoveredVoltaMeasure(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    prevToolRef.current = selectedTool;
  }, [selectedTool]);

  // Handle click for volta placement
  const handleVoltaClick = useCallback(
    (x: number, system: number): boolean => {
      if (!onVoltaBracketsChange) {
        return false;
      }

      const sysLayout = getLayoutForSystem(systemLayouts, system);

      // Calculate measure using getBeatFromXInSystem which properly
      // accounts for measure xOffsets (repeat markers, time signatures)
      const beatInSystem = getBeatFromXInSystem(sysLayout, x, 0);
      const measureInSystem = Math.floor(beatInSystem / beatsPerMeasure);
      const clampedMeasure = Math.max(
        0,
        Math.min(measuresPerSystem - 1, measureInSystem),
      );

      // Calculate absolute measure
      const absoluteMeasure = system * measuresPerSystem + clampedMeasure;

      // Find which repeat section this click is in
      const repeatSection = findRepeatSectionForMeasure(
        absoluteMeasure,
        repeatMarkers,
      );

      if (!repeatSection) {
        toast.error("Click inside a repeat section to add volta brackets");
        setVoltaStart(null);
        return false;
      }

      if (!voltaStart) {
        // First click - set start position
        setVoltaStart({
          system,
          measure: clampedMeasure,
          repeatPairId: repeatSection.pairId,
        });
        toast.info("Click again to set the end of the volta bracket");
        return true;
      }

      // Second click - create volta bracket
      // Ensure we're still in the same repeat section
      if (voltaStart.repeatPairId !== repeatSection.pairId) {
        toast.error("Volta start and end must be in the same repeat section");
        setVoltaStart(null);
        return false;
      }

      // Calculate start and end measures
      const startAbsolute =
        voltaStart.system * measuresPerSystem + voltaStart.measure;
      const endAbsolute = absoluteMeasure + 1; // Exclusive end

      // Ensure proper order
      const [startMeasure, endMeasure] =
        startAbsolute <= absoluteMeasure
          ? [startAbsolute, endAbsolute]
          : [absoluteMeasure, startAbsolute + 1];

      // Check for overlap with existing voltas
      if (
        wouldOverlap(
          startMeasure,
          endMeasure,
          voltaStart.repeatPairId,
          voltaBrackets,
        )
      ) {
        toast.error("Volta brackets cannot overlap");
        setVoltaStart(null);
        return false;
      }

      // Get next volta number
      const voltaNumber = getNextVoltaNumber(
        voltaStart.repeatPairId,
        voltaBrackets,
      );

      // Create new volta bracket
      const newVolta: VoltaBracket = {
        id: `volta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        repeatPairId: voltaStart.repeatPairId,
        startMeasure,
        endMeasure,
        voltaNumber,
      };

      onVoltaBracketsChange([...voltaBrackets, newVolta]);
      setVoltaStart(null);
      toast.success(
        `Added ${voltaNumber === 1 ? "1st" : voltaNumber === 2 ? "2nd" : `${voltaNumber}th`} ending`,
      );
      return true;
    },
    [
      voltaStart,
      voltaBrackets,
      onVoltaBracketsChange,
      repeatMarkers,
      systemLayouts,
      measuresPerSystem,
      beatsPerMeasure,
    ],
  );

  // Handle hover for preview
  const handleVoltaHover = useCallback(
    (x: number, system: number) => {
      if (selectedTool !== "volta") {
        setHoveredVoltaMeasure(null);
        return;
      }

      const sysLayout = getLayoutForSystem(systemLayouts, system);
      // Use getBeatFromXInSystem which accounts for measure xOffsets
      const beatInSystem = getBeatFromXInSystem(sysLayout, x, 0);
      const measureInSystem = Math.floor(beatInSystem / beatsPerMeasure);
      const clampedMeasure = Math.max(
        0,
        Math.min(measuresPerSystem - 1, measureInSystem),
      );

      setHoveredVoltaMeasure({ system, measure: clampedMeasure });
    },
    [selectedTool, systemLayouts, beatsPerMeasure, measuresPerSystem],
  );

  // Clear hover state
  const clearVoltaHover = useCallback(() => {
    setHoveredVoltaMeasure(null);
  }, []);

  return {
    voltaStart,
    setVoltaStart,
    hoveredVoltaMeasure,
    handleVoltaClick,
    handleVoltaHover,
    clearVoltaHover,
    isPlacingVolta: voltaStart !== null,
  };
}
