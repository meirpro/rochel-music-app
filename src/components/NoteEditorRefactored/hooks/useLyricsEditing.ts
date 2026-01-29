// src/components/NoteEditorRefactored/hooks/useLyricsEditing.ts
// Extracts lyrics editing state and handlers from NoteEditorRefactored

import { useState, useCallback, useEffect, useRef } from "react";
import { LyricSyllable } from "@/lib/types";
import {
  LEFT_MARGIN,
  LINE_SPACING,
  SYSTEM_TOP_MARGIN,
  SYSTEM_HEIGHT,
  getNoteOffset,
} from "@/lib/layoutUtils";
import { SystemLayout, getLayoutForSystem } from "../utils/systemLayout";
import { NoteTool } from "../types";

// Editing state type
export interface EditingLyricState {
  absoluteBeat: number;
  initialText: string;
}

// Hook parameters
export interface UseLyricsEditingParams {
  lyrics: LyricSyllable[];
  onLyricsChange?: (lyrics: LyricSyllable[]) => void;
  systemLayouts: SystemLayout[];
  systemCount: number;
  measuresPerSystem: number;
  beatsPerMeasure: number;
  selectedTool: NoteTool;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

// Hook return type
export interface UseLyricsEditingReturn {
  // State
  editingLyric: EditingLyricState | null;
  setEditingLyric: (state: EditingLyricState | null) => void;

  // Handlers
  handleLyricsClick: (x: number, y: number, system: number) => void;
  handleSaveLyric: (text: string) => void;
  handleCancelLyric: () => void;
  handleNavigateLyric: (direction: "next" | "prev") => void;

  // Position calculation
  getInlineLyricPosition: () => { x: number; y: number } | null;

  // Utilities
  getStaffCenterY: (systemIndex: number) => number;
}

/**
 * Hook for managing lyrics editing state and handlers
 */
export function useLyricsEditing({
  lyrics,
  onLyricsChange,
  systemLayouts,
  systemCount,
  measuresPerSystem,
  beatsPerMeasure,
  selectedTool,
  svgRef,
}: UseLyricsEditingParams): UseLyricsEditingReturn {
  // Editing state
  const [editingLyric, setEditingLyric] = useState<EditingLyricState | null>(
    null,
  );

  // Clear editing state when tool changes away from lyrics
  // Using a ref to track previous tool to avoid cascading renders
  const prevToolRef = useRef(selectedTool);
  useEffect(() => {
    if (prevToolRef.current === "lyrics" && selectedTool !== "lyrics") {
      // Tool changed away from lyrics - clear state on next tick
      const timeoutId = setTimeout(() => {
        setEditingLyric(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    prevToolRef.current = selectedTool;
  }, [selectedTool]);

  // Calculate total beats per system
  const beatsPerSystem = beatsPerMeasure * measuresPerSystem;

  // Calculate staff center Y for a system
  const getStaffCenterY = useCallback((systemIndex: number): number => {
    return SYSTEM_TOP_MARGIN + systemIndex * SYSTEM_HEIGHT + 80;
  }, []);

  // Handle click in lyrics zone
  const handleLyricsClick = useCallback(
    (x: number, y: number, system: number) => {
      if (!onLyricsChange) return;

      const staffCenterY = getStaffCenterY(system);
      const lyricsZoneTop = staffCenterY + LINE_SPACING * 3 + 15;
      const lyricsZoneBottom = staffCenterY + LINE_SPACING * 3 + 45;

      // Check if click is in the lyrics area
      if (y >= lyricsZoneTop && y <= lyricsZoneBottom) {
        const sysLayout = getLayoutForSystem(systemLayouts, system);

        // Calculate beat position
        const beatInSystem =
          (x - LEFT_MARGIN - getNoteOffset(sysLayout.beatWidth)) /
          sysLayout.beatWidth;
        const snappedBeatInSystem = Math.round(beatInSystem * 2) / 2;
        const clampedBeatInSystem = Math.max(
          0,
          Math.min(sysLayout.totalBeats - 1, snappedBeatInSystem),
        );
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
    },
    [onLyricsChange, getStaffCenterY, systemLayouts, lyrics],
  );

  // Handle saving lyrics
  const handleSaveLyric = useCallback(
    (text: string) => {
      if (!editingLyric || !onLyricsChange) return;

      const { absoluteBeat } = editingLyric;
      const newLyrics = lyrics.filter(
        (l) => Math.abs(l.absoluteBeat - absoluteBeat) >= 0.1,
      );

      if (text) {
        newLyrics.push({ text, absoluteBeat });
        newLyrics.sort((a, b) => a.absoluteBeat - b.absoluteBeat);
      }

      onLyricsChange(newLyrics);
      setEditingLyric(null);
    },
    [editingLyric, lyrics, onLyricsChange],
  );

  // Handle canceling edit
  const handleCancelLyric = useCallback(() => {
    setEditingLyric(null);
  }, []);

  // Handle navigating to next/prev lyric position
  const handleNavigateLyric = useCallback(
    (direction: "next" | "prev") => {
      if (!editingLyric) return;

      const totalBeats = systemCount * beatsPerSystem;
      const currentBeat = editingLyric.absoluteBeat;
      const nextBeat =
        direction === "next"
          ? Math.min(totalBeats - 1, currentBeat + 0.5)
          : Math.max(0, currentBeat - 0.5);

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

    // Find the system containing this beat
    let targetSystem = 0;
    for (let i = 0; i < systemLayouts.length; i++) {
      const layout = systemLayouts[i];
      if (
        absoluteBeat >= layout.startBeat &&
        absoluteBeat < layout.startBeat + layout.totalBeats
      ) {
        targetSystem = i;
        break;
      }
    }

    const sysLayout = getLayoutForSystem(systemLayouts, targetSystem);
    const beatInSystem = absoluteBeat - sysLayout.startBeat;
    // X position within SVG coordinate space (add 15 for viewBox offset)
    const x =
      LEFT_MARGIN +
      getNoteOffset(sysLayout.beatWidth) +
      beatInSystem * sysLayout.beatWidth +
      15; // Account for viewBox x offset
    const staffCenterY = getStaffCenterY(targetSystem);
    const y = staffCenterY + LINE_SPACING * 3 + 30;

    // Return coordinates relative to the container (not page)
    return { x, y };
  }, [editingLyric, systemLayouts, svgRef, getStaffCenterY]);

  return {
    // State
    editingLyric,
    setEditingLyric,

    // Handlers
    handleLyricsClick,
    handleSaveLyric,
    handleCancelLyric,
    handleNavigateLyric,

    // Position calculation
    getInlineLyricPosition,

    // Utilities
    getStaffCenterY,
  };
}
