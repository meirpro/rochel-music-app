// src/components/NoteEditorRefactored/hooks/useRepeatPlacement.ts
// Extracts repeat marker placement state and handlers from NoteEditorRefactored

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
// Note: getBeatFromXInSystem properly handles measure xOffsets for decoration-aware positioning
import {
  SystemLayout,
  getLayoutForSystem,
  getBeatFromXInSystem,
} from "../utils/systemLayout";
import { RepeatMarker, RenderedRepeatMarker, NoteTool } from "../types";

// Repeat start state type
export interface RepeatStartState {
  system: number;
  measure: number;
}

// Hook parameters
export interface UseRepeatPlacementParams {
  repeatMarkers: RenderedRepeatMarker[]; // Rendered markers with system/measure for display
  onRepeatMarkersChange?: (markers: RepeatMarker[]) => void; // Base markers with measureNumber
  systemLayouts: SystemLayout[];
  measuresPerSystem: number;
  beatsPerMeasure: number;
  selectedTool: NoteTool;
}

// Hovered measure state type
export interface HoveredRepeatMeasureState {
  system: number;
  measure: number;
}

// Dragged marker state type
export interface DraggedMarkerState {
  id: string;
  type: "start" | "end";
  system: number;
  originalMeasure: number;
}

// Marker drag position state
export interface MarkerDragPosition {
  x: number;
  y: number;
  targetSystem: number;
  targetMeasure: number;
}

// Hook return type
export interface UseRepeatPlacementReturn {
  // State
  repeatStart: RepeatStartState | null;
  setRepeatStart: (state: RepeatStartState | null) => void;
  hoveredRepeatMeasure: HoveredRepeatMeasureState | null;
  hoveredMarker: string | null;
  setHoveredMarker: (id: string | null) => void;

  // Drag state
  draggedMarker: DraggedMarkerState | null;
  setDraggedMarker: (state: DraggedMarkerState | null) => void;
  markerDragPosition: MarkerDragPosition | null;

  // Handlers
  handleRepeatClick: (x: number, system: number) => boolean; // Returns true if handled
  handleRepeatHover: (x: number, system: number) => void; // Track hover for preview
  clearRepeatHover: () => void; // Clear hover state

  // Drag handlers
  handleMarkerDragStart: (marker: RenderedRepeatMarker, system: number) => void;
  handleMarkerDrag: (x: number, y: number, system: number) => void;
  handleMarkerDragEnd: () => void;

  // UI state
  isPlacingRepeat: boolean;
  isDraggingMarker: boolean;
}

/**
 * Hook for managing repeat marker placement state and handlers
 */
export function useRepeatPlacement({
  repeatMarkers,
  onRepeatMarkersChange,
  systemLayouts,
  measuresPerSystem,
  beatsPerMeasure,
  selectedTool,
}: UseRepeatPlacementParams): UseRepeatPlacementReturn {
  // Repeat start state - tracks first click for two-click placement
  const [repeatStart, setRepeatStart] = useState<RepeatStartState | null>(null);

  // Hover state for showing placement preview
  const [hoveredRepeatMeasure, setHoveredRepeatMeasure] =
    useState<HoveredRepeatMeasureState | null>(null);

  // Hover state for individual markers (for delete/move feedback)
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  // Drag state for marker repositioning
  const [draggedMarker, setDraggedMarker] = useState<DraggedMarkerState | null>(
    null,
  );
  const [markerDragPosition, setMarkerDragPosition] =
    useState<MarkerDragPosition | null>(null);

  // Clear state when tool changes away from repeat
  // Using a ref to track previous tool to avoid cascading renders
  const prevToolRef = useRef(selectedTool);
  useEffect(() => {
    if (prevToolRef.current === "repeat" && selectedTool !== "repeat") {
      // Tool changed away from repeat - clear states on next tick
      const timeoutId = setTimeout(() => {
        setRepeatStart(null);
        setHoveredRepeatMeasure(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    prevToolRef.current = selectedTool;
  }, [selectedTool]);

  // Handle click for repeat placement
  const handleRepeatClick = useCallback(
    (x: number, system: number): boolean => {
      if (!onRepeatMarkersChange) return false;

      const sysLayout = getLayoutForSystem(systemLayouts, system);

      // Calculate beat position using getBeatFromXInSystem which properly
      // accounts for measure xOffsets (repeat markers, time signatures)
      // Use noteOffset=0 since raw click position doesn't include note centering
      const beatInSystem = getBeatFromXInSystem(sysLayout, x, 0);
      const measureContainingClick = Math.floor(beatInSystem / beatsPerMeasure);
      const clampedMeasure = Math.max(
        0,
        Math.min(measuresPerSystem - 1, measureContainingClick),
      );

      if (!repeatStart) {
        // First click - set start position
        setRepeatStart({ system, measure: clampedMeasure });
        return true;
      }

      // Second click - create repeat markers
      const firstClickSystem = repeatStart.system;
      const firstClickMeasure = repeatStart.measure;
      const secondClickSystem = system;
      const secondClickMeasure = clampedMeasure;

      // Calculate absolute measures
      const firstAbsolute =
        firstClickSystem * measuresPerSystem + firstClickMeasure;
      const secondAbsolute =
        secondClickSystem * measuresPerSystem + secondClickMeasure;

      // Auto-swap: earlier measure is start, later is end
      let startSystem: number, startMeasure: number;
      let endClickSystem: number, endClickMeasure: number;

      if (firstAbsolute <= secondAbsolute) {
        startSystem = firstClickSystem;
        startMeasure = firstClickMeasure;
        endClickSystem = secondClickSystem;
        endClickMeasure = secondClickMeasure;
      } else {
        startSystem = secondClickSystem;
        startMeasure = secondClickMeasure;
        endClickSystem = firstClickSystem;
        endClickMeasure = firstClickMeasure;
      }

      // Increment end marker to place at end of clicked measure
      let endSystem = endClickSystem;
      let endMeasure = endClickMeasure + 1;

      // Handle system overflow
      if (endMeasure >= measuresPerSystem) {
        endMeasure = 0;
        endSystem = endClickSystem + 1;
      }

      const startAbsoluteMeasure =
        startSystem * measuresPerSystem + startMeasure;
      const endAbsoluteMeasure = endSystem * measuresPerSystem + endMeasure;

      if (endAbsoluteMeasure > startAbsoluteMeasure) {
        // Check for overlap with existing markers (use measureNumber from markers)
        const hasOverlap = repeatMarkers.some((m) => {
          const markerAbsoluteMeasure = m.measureNumber;
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
          const pairId = `pair-${Date.now()}`;
          // Convert existing rendered markers to base format and add new ones
          const existingBaseMarkers: RepeatMarker[] = repeatMarkers.map(
            (m) => ({
              id: m.id,
              pairId: m.pairId,
              type: m.type,
              measureNumber: m.measureNumber,
            }),
          );
          const newMarkers: RepeatMarker[] = [
            ...existingBaseMarkers,
            {
              id: `start-${Date.now()}`,
              pairId,
              type: "start",
              measureNumber: startAbsoluteMeasure,
            },
            {
              id: `end-${Date.now() + 1}`,
              pairId,
              type: "end",
              measureNumber: endAbsoluteMeasure,
            },
          ];
          onRepeatMarkersChange(newMarkers);
        } else {
          toast.error(
            "Cannot place repeat markers over existing repeat sections",
          );
        }
      }

      setRepeatStart(null);
      setHoveredRepeatMeasure(null);
      return true;
    },
    [
      onRepeatMarkersChange,
      systemLayouts,
      beatsPerMeasure,
      measuresPerSystem,
      repeatStart,
      repeatMarkers,
    ],
  );

  // Handle hover for repeat placement preview
  const handleRepeatHover = useCallback(
    (x: number, system: number) => {
      if (selectedTool !== "repeat") return;

      const sysLayout = getLayoutForSystem(systemLayouts, system);

      // Calculate beat position using getBeatFromXInSystem which properly
      // accounts for measure xOffsets (repeat markers, time signatures)
      const beatInSystem = getBeatFromXInSystem(sysLayout, x, 0);
      const measureContainingHover = Math.floor(beatInSystem / beatsPerMeasure);
      const clampedMeasure = Math.max(
        0,
        Math.min(measuresPerSystem - 1, measureContainingHover),
      );

      setHoveredRepeatMeasure({ system, measure: clampedMeasure });
    },
    [selectedTool, systemLayouts, beatsPerMeasure, measuresPerSystem],
  );

  // Clear hover state
  const clearRepeatHover = useCallback(() => {
    setHoveredRepeatMeasure(null);
  }, []);

  // Start dragging a marker
  const handleMarkerDragStart = useCallback(
    (marker: RenderedRepeatMarker, system: number) => {
      setDraggedMarker({
        id: marker.id,
        type: marker.type,
        system,
        originalMeasure: marker.measure,
      });
    },
    [],
  );

  // Handle marker drag movement
  const handleMarkerDrag = useCallback(
    (x: number, y: number, system: number) => {
      if (!draggedMarker || !onRepeatMarkersChange) return;

      const sysLayout = getLayoutForSystem(systemLayouts, system);

      // Calculate target measure using getBeatFromXInSystem which properly
      // accounts for measure xOffsets (repeat markers, time signatures)
      const beatInSystem = getBeatFromXInSystem(sysLayout, x, 0);
      const measureContainingDrag = Math.floor(beatInSystem / beatsPerMeasure);
      const clampedMeasure = Math.max(
        0,
        Math.min(measuresPerSystem, measureContainingDrag),
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
        // Use measureNumber from the paired marker (absolute measure)
        const pairedAbsoluteMeasure = pairedMarker.measureNumber;

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
        // Convert to base RepeatMarker format with measureNumber
        const newAbsoluteMeasure = system * measuresPerSystem + clampedMeasure;
        const updatedMarkers: RepeatMarker[] = repeatMarkers.map((m) =>
          m.id === draggedMarker.id
            ? {
                id: m.id,
                pairId: m.pairId,
                type: m.type,
                measureNumber: newAbsoluteMeasure,
              }
            : {
                id: m.id,
                pairId: m.pairId,
                type: m.type,
                measureNumber: m.measureNumber,
              },
        );
        onRepeatMarkersChange(updatedMarkers);
        // Update tracked system if changed
        if (system !== draggedMarker.system) {
          setDraggedMarker({ ...draggedMarker, system });
        }
      }
    },
    [
      draggedMarker,
      onRepeatMarkersChange,
      systemLayouts,
      beatsPerMeasure,
      measuresPerSystem,
      repeatMarkers,
    ],
  );

  // End marker drag
  const handleMarkerDragEnd = useCallback(() => {
    setDraggedMarker(null);
    setMarkerDragPosition(null);
  }, []);

  return {
    // State
    repeatStart,
    setRepeatStart,
    hoveredRepeatMeasure,
    hoveredMarker,
    setHoveredMarker,

    // Drag state
    draggedMarker,
    setDraggedMarker,
    markerDragPosition,

    // Handlers
    handleRepeatClick,
    handleRepeatHover,
    clearRepeatHover,

    // Drag handlers
    handleMarkerDragStart,
    handleMarkerDrag,
    handleMarkerDragEnd,

    // UI state
    isPlacingRepeat: repeatStart !== null,
    isDraggingMarker: draggedMarker !== null,
  };
}
