/**
 * useEditorState Hook
 *
 * Manages the editor state including notes, settings, and UI state.
 * Provides a clean interface for the editor page to manage composition data.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import {
  EditorNote,
  NoteTool,
  RepeatMarker,
} from "@/components/NoteEditorRefactored";
import { TimeSignature, LyricSyllable } from "@/lib/types";

// SSR-safe localStorage options
const SSR_SAFE = { initializeWithValue: false };

// Storage keys
const STORAGE_KEY_NOTES = "rochel-editor-notes-v2";
const STORAGE_KEY_SETTINGS = "rochel-editor-settings-v2";

// Default time signature
const DEFAULT_TIME_SIGNATURE: TimeSignature = { numerator: 4, denominator: 4 };

// Editor settings
interface EditorSettings {
  tempo: number;
  timeSignature: TimeSignature;
  measuresPerRow: number;
  totalMeasures: number;
  showLabels: boolean;
  showPiano: boolean;
  useColors: boolean;
  showBlackKeys: boolean;
  noteSpacing: number;
  staffLines: number;
}

const DEFAULT_SETTINGS: EditorSettings = {
  tempo: 100,
  timeSignature: DEFAULT_TIME_SIGNATURE,
  measuresPerRow: 4,
  totalMeasures: 4,
  showLabels: true,
  showPiano: false,
  useColors: true,
  showBlackKeys: true,
  noteSpacing: 1.0,
  staffLines: 3,
};

// Composition data
interface CompositionData {
  notes: EditorNote[];
  repeatMarkers: RepeatMarker[];
  lyrics: LyricSyllable[];
}

const DEFAULT_COMPOSITION: CompositionData = {
  notes: [],
  repeatMarkers: [],
  lyrics: [],
};

// Options for the hook
interface UseEditorStateOptions {
  maxMeasures?: number; // Limit from tutorial
}

// Return type
export interface UseEditorStateReturn {
  // Composition data
  notes: EditorNote[];
  repeatMarkers: RepeatMarker[];
  lyrics: LyricSyllable[];

  // Setters
  setNotes: (notes: EditorNote[]) => void;
  setRepeatMarkers: (markers: RepeatMarker[]) => void;
  setLyrics: (lyrics: LyricSyllable[]) => void;

  // Settings
  settings: EditorSettings;
  setTempo: (tempo: number) => void;
  setTimeSignature: (sig: TimeSignature) => void;
  setMeasuresPerRow: (count: number) => void;
  setTotalMeasures: (count: number) => void;
  setShowLabels: (show: boolean) => void;
  setShowPiano: (show: boolean) => void;
  setUseColors: (use: boolean) => void;
  setShowBlackKeys: (show: boolean) => void;
  setNoteSpacing: (spacing: number) => void;
  setStaffLines: (lines: number) => void;

  // Tool state
  selectedTool: NoteTool;
  setSelectedTool: (tool: NoteTool) => void;
  allowMove: boolean;
  setAllowMove: (allow: boolean) => void;

  // Computed values
  systemCount: number;
  hasNotes: boolean;

  // Actions
  clearComposition: () => void;
}

/**
 * Hook for managing editor state
 */
export function useEditorState(
  options: UseEditorStateOptions = {},
): UseEditorStateReturn {
  const { maxMeasures } = options;

  // Composition data (persisted)
  const [composition, setComposition] = useLocalStorage<CompositionData>(
    STORAGE_KEY_NOTES,
    DEFAULT_COMPOSITION,
    SSR_SAFE,
  );

  // Settings (persisted)
  const [settings, setSettings] = useLocalStorage<EditorSettings>(
    STORAGE_KEY_SETTINGS,
    DEFAULT_SETTINGS,
    SSR_SAFE,
  );

  // Tool state (not persisted)
  const [selectedTool, setSelectedTool] = useState<NoteTool>("quarter");
  const [allowMove, setAllowMove] = useState(false);

  // Apply maxMeasures constraint from tutorial
  const effectiveTotalMeasures = useMemo(() => {
    if (maxMeasures !== undefined) {
      return Math.min(settings.totalMeasures, maxMeasures);
    }
    return settings.totalMeasures;
  }, [settings.totalMeasures, maxMeasures]);

  // Calculate system count
  const systemCount = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(effectiveTotalMeasures / settings.measuresPerRow),
    );
  }, [effectiveTotalMeasures, settings.measuresPerRow]);

  // Note setters
  const setNotes = useCallback(
    (notes: EditorNote[]) => {
      setComposition((prev) => ({ ...prev, notes }));
    },
    [setComposition],
  );

  const setRepeatMarkers = useCallback(
    (repeatMarkers: RepeatMarker[]) => {
      setComposition((prev) => ({ ...prev, repeatMarkers }));
    },
    [setComposition],
  );

  const setLyrics = useCallback(
    (lyrics: LyricSyllable[]) => {
      setComposition((prev) => ({ ...prev, lyrics }));
    },
    [setComposition],
  );

  // Settings setters
  const setTempo = useCallback(
    (tempo: number) => {
      setSettings((prev) => ({ ...prev, tempo }));
    },
    [setSettings],
  );

  const setTimeSignature = useCallback(
    (timeSignature: TimeSignature) => {
      setSettings((prev) => ({ ...prev, timeSignature }));
    },
    [setSettings],
  );

  const setMeasuresPerRow = useCallback(
    (measuresPerRow: number) => {
      setSettings((prev) => ({ ...prev, measuresPerRow }));
    },
    [setSettings],
  );

  const setTotalMeasures = useCallback(
    (totalMeasures: number) => {
      setSettings((prev) => ({ ...prev, totalMeasures }));
    },
    [setSettings],
  );

  const setShowLabels = useCallback(
    (showLabels: boolean) => {
      setSettings((prev) => ({ ...prev, showLabels }));
    },
    [setSettings],
  );

  const setShowPiano = useCallback(
    (showPiano: boolean) => {
      setSettings((prev) => ({ ...prev, showPiano }));
    },
    [setSettings],
  );

  const setUseColors = useCallback(
    (useColors: boolean) => {
      setSettings((prev) => ({ ...prev, useColors }));
    },
    [setSettings],
  );

  const setShowBlackKeys = useCallback(
    (showBlackKeys: boolean) => {
      setSettings((prev) => ({ ...prev, showBlackKeys }));
    },
    [setSettings],
  );

  const setNoteSpacing = useCallback(
    (noteSpacing: number) => {
      setSettings((prev) => ({ ...prev, noteSpacing }));
    },
    [setSettings],
  );

  const setStaffLines = useCallback(
    (staffLines: number) => {
      setSettings((prev) => ({ ...prev, staffLines }));
    },
    [setSettings],
  );

  // Clear composition
  const clearComposition = useCallback(() => {
    setComposition(DEFAULT_COMPOSITION);
  }, [setComposition]);

  return {
    // Composition data
    notes: composition.notes,
    repeatMarkers: composition.repeatMarkers,
    lyrics: composition.lyrics,

    // Setters
    setNotes,
    setRepeatMarkers,
    setLyrics,

    // Settings (with effective measures applied)
    settings: {
      ...settings,
      totalMeasures: effectiveTotalMeasures,
    },
    setTempo,
    setTimeSignature,
    setMeasuresPerRow,
    setTotalMeasures,
    setShowLabels,
    setShowPiano,
    setUseColors,
    setShowBlackKeys,
    setNoteSpacing,
    setStaffLines,

    // Tool state
    selectedTool,
    setSelectedTool,
    allowMove,
    setAllowMove,

    // Computed
    systemCount,
    hasNotes: composition.notes.length > 0,

    // Actions
    clearComposition,
  };
}
