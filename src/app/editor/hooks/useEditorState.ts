/**
 * useEditorState Hook
 *
 * Manages the editor state including notes, settings, and UI state.
 * Uses absoluteBeat format for layout-independent note positioning.
 * Includes undo/redo history tracking for composition changes.
 */

"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import {
  EditorNote,
  NoteTool,
  RepeatMarker,
} from "@/components/NoteEditorRefactored";
import {
  TimeSignature,
  LyricSyllable,
  SavedSong,
  SavedSongsMap,
  Pitch,
} from "@/lib/types";
import { getDefaultSongs } from "@/lib/defaultSongs";

// SSR-safe localStorage options
const SSR_SAFE = { initializeWithValue: false };

// Storage keys - SAME as home page for shared library
const STORAGE_KEY_COMPOSITION = "rochel-editor-composition";
const STORAGE_KEY_SETTINGS = "rochel-editor-settings";
const STORAGE_KEY_SAVED_SONGS = "rochel-saved-songs";
const STORAGE_KEY_CURRENT_SONG = "rochel-current-song-id";
const STORAGE_KEY_MEASURES_PER_ROW = "rochel-measures-per-row";
const STORAGE_KEY_TOTAL_MEASURES = "rochel-total-measures";

// Maximum history entries to prevent memory issues
const MAX_HISTORY_SIZE = 50;

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

// Composition data - uses absoluteBeat format (layout-independent)
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

  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  handleUndo: () => void;
  handleRedo: () => void;

  // Song library
  savedSongs: SavedSongsMap;
  currentSongId: string | null;
  currentSongTitle: string;
  saveSong: (name: string) => void;
  loadSong: (song: SavedSong) => void;
  deleteSong: (songId: string) => void;
  updateCurrentSong: () => void;
  restoreDefaults: () => void;
  exportSongs: () => void;
  exportSelectedSongs: (songIds: string[]) => void;

  // Actions
  clearComposition: () => void;
}

/**
 * Validates if a pitch string is in the correct format (e.g., "C4", "F#5", "Bb3")
 */
function isValidPitch(pitch: unknown): pitch is Pitch {
  if (typeof pitch !== "string") return false;
  if (pitch === "REST") return true;
  // Match note letter (A-G), optional accidental (#/b), and octave number (0-9)
  return /^[A-G](#|b)?[0-9]$/.test(pitch);
}

/**
 * Validate and filter notes to ensure they have valid absoluteBeat format.
 * Filters out corrupted notes with invalid pitch or position data.
 */
function validateNotes(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notes: any[],
): EditorNote[] {
  if (!Array.isArray(notes)) return [];

  const validNotes: EditorNote[] = [];
  let invalidCount = 0;

  for (const note of notes) {
    if (!note || typeof note !== "object") {
      invalidCount++;
      continue;
    }

    // Validate pitch
    if (!isValidPitch(note.pitch)) {
      invalidCount++;
      continue;
    }

    // Validate duration
    if (
      typeof note.duration !== "number" ||
      !Number.isFinite(note.duration) ||
      note.duration <= 0
    ) {
      invalidCount++;
      continue;
    }

    // Validate absoluteBeat
    if (
      typeof note.absoluteBeat !== "number" ||
      !Number.isFinite(note.absoluteBeat) ||
      note.absoluteBeat < 0
    ) {
      invalidCount++;
      continue;
    }

    validNotes.push({
      id: note.id || `note-${Date.now()}-${Math.random()}`,
      pitch: note.pitch,
      duration: note.duration,
      absoluteBeat: note.absoluteBeat,
    });
  }

  if (invalidCount > 0) {
    console.warn(
      `[validateNotes] Filtered out ${invalidCount} invalid notes from localStorage`,
    );
  }

  return validNotes;
}

/**
 * Validate repeat markers to ensure they have valid measureNumber format.
 */
function validateRepeatMarkers(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markers: any[],
): RepeatMarker[] {
  if (!Array.isArray(markers)) return [];

  return markers
    .filter((m) => {
      if (!m || typeof m !== "object") return false;
      if (
        typeof m.measureNumber !== "number" ||
        !Number.isFinite(m.measureNumber)
      )
        return false;
      if (m.type !== "start" && m.type !== "end") return false;
      return true;
    })
    .map((m) => ({
      id: m.id || `marker-${Date.now()}-${Math.random()}`,
      pairId: m.pairId || m.id,
      type: m.type as "start" | "end",
      measureNumber: m.measureNumber,
    }));
}

/**
 * Hook for managing editor state
 */
export function useEditorState(
  options: UseEditorStateOptions = {},
): UseEditorStateReturn {
  const { maxMeasures } = options;

  // Composition data (persisted - SAME keys as home page for shared storage)
  const [rawComposition, setComposition] = useLocalStorage<CompositionData>(
    STORAGE_KEY_COMPOSITION,
    DEFAULT_COMPOSITION,
    SSR_SAFE,
  );

  // Settings (persisted)
  const [settings, setSettings] = useLocalStorage<EditorSettings>(
    STORAGE_KEY_SETTINGS,
    DEFAULT_SETTINGS,
    SSR_SAFE,
  );

  // Song library (shared with home page)
  const [savedSongs, setSavedSongs] = useLocalStorage<SavedSongsMap>(
    STORAGE_KEY_SAVED_SONGS,
    getDefaultSongs(),
    SSR_SAFE,
  );
  const [currentSongId, setCurrentSongId] = useLocalStorage<string | null>(
    STORAGE_KEY_CURRENT_SONG,
    "default-dayenu",
    SSR_SAFE,
  );

  // Measures per row and total measures (shared with home page)
  const [measuresPerRowStored, setMeasuresPerRowStored] =
    useLocalStorage<number>(STORAGE_KEY_MEASURES_PER_ROW, 4, SSR_SAFE);
  const [totalMeasuresStored, setTotalMeasuresStored] = useLocalStorage<number>(
    STORAGE_KEY_TOTAL_MEASURES,
    4,
    SSR_SAFE,
  );

  // Tool state (not persisted)
  const [selectedTool, setSelectedTool] = useState<NoteTool>("quarter");
  const [allowMove, setAllowMove] = useState(false);

  // Undo/Redo history (session-only, not persisted)
  const [history, setHistory] = useState<CompositionData[]>(() => [
    DEFAULT_COMPOSITION,
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);
  const historyInitialized = useRef(false);

  // Apply maxMeasures constraint from tutorial
  const effectiveTotalMeasures = useMemo(() => {
    const baseMeasures =
      totalMeasuresStored ??
      settings.totalMeasures ??
      DEFAULT_SETTINGS.totalMeasures;
    if (maxMeasures !== undefined) {
      return Math.min(baseMeasures, maxMeasures);
    }
    return baseMeasures;
  }, [totalMeasuresStored, settings.totalMeasures, maxMeasures]);

  // Effective measures per row
  const effectiveMeasuresPerRow = useMemo(() => {
    return (
      measuresPerRowStored ??
      settings.measuresPerRow ??
      DEFAULT_SETTINGS.measuresPerRow
    );
  }, [measuresPerRowStored, settings.measuresPerRow]);

  // Validate composition data (filter out corrupted notes)
  const composition: CompositionData = useMemo(() => {
    return {
      notes: validateNotes(rawComposition?.notes || []),
      repeatMarkers: validateRepeatMarkers(rawComposition?.repeatMarkers || []),
      lyrics: rawComposition?.lyrics || [],
    };
  }, [rawComposition]);

  // Sync history with composition on first hydration
  useEffect(() => {
    if (!historyInitialized.current && composition.notes.length > 0) {
      historyInitialized.current = true;
    }
  }, [composition]);

  // Push composition to history
  const pushToHistory = useCallback(
    (newComposition: CompositionData) => {
      if (isUndoRedoAction.current) {
        isUndoRedoAction.current = false;
        return;
      }

      setHistory((prev) => {
        const truncated = prev.slice(0, historyIndex + 1);
        const newHistory = [...truncated, newComposition];
        if (newHistory.length > MAX_HISTORY_SIZE) {
          return newHistory.slice(-MAX_HISTORY_SIZE);
        }
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY_SIZE - 1));
    },
    [historyIndex],
  );

  // Undo handler
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setComposition(history[newIndex]);
    }
  }, [historyIndex, history, setComposition]);

  // Redo handler
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setComposition(history[newIndex]);
    }
  }, [historyIndex, history, setComposition]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Calculate system count
  const systemCount = useMemo(() => {
    return Math.max(
      1,
      Math.ceil(effectiveTotalMeasures / effectiveMeasuresPerRow),
    );
  }, [effectiveTotalMeasures, effectiveMeasuresPerRow]);

  // Note setters with history tracking - direct absoluteBeat format
  const setNotes = useCallback(
    (notes: EditorNote[]) => {
      const newComposition = { ...composition, notes };
      setComposition(newComposition);
      pushToHistory(newComposition);
    },
    [composition, setComposition, pushToHistory],
  );

  const setRepeatMarkers = useCallback(
    (repeatMarkers: RepeatMarker[]) => {
      const newComposition = { ...composition, repeatMarkers };
      setComposition(newComposition);
      pushToHistory(newComposition);
    },
    [composition, setComposition, pushToHistory],
  );

  const setLyrics = useCallback(
    (lyrics: LyricSyllable[]) => {
      const newComposition = { ...composition, lyrics };
      setComposition(newComposition);
      pushToHistory(newComposition);
    },
    [composition, setComposition, pushToHistory],
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
      setMeasuresPerRowStored(measuresPerRow);
      setSettings((prev) => ({ ...prev, measuresPerRow }));
    },
    [setMeasuresPerRowStored, setSettings],
  );

  const setTotalMeasures = useCallback(
    (totalMeasures: number) => {
      setTotalMeasuresStored(totalMeasures);
      setSettings((prev) => ({ ...prev, totalMeasures }));
    },
    [setTotalMeasuresStored, setSettings],
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
    pushToHistory(DEFAULT_COMPOSITION);
  }, [setComposition, pushToHistory]);

  // Current song title
  const currentSongTitle = useMemo(() => {
    if (currentSongId && savedSongs[currentSongId]) {
      return savedSongs[currentSongId].name;
    }
    return "Untitled Song";
  }, [currentSongId, savedSongs]);

  // Save current composition as new song or update existing
  const saveSong = useCallback(
    (name: string) => {
      const songId = currentSongId || `song_${Date.now()}`;
      const song: SavedSong = {
        id: songId,
        name,
        composition: {
          // Notes already in absoluteBeat format - no conversion needed
          notes: composition.notes,
          // Repeat markers already in measureNumber format
          repeatMarkers: composition.repeatMarkers,
          lyrics: composition.lyrics,
        },
        settings: {
          tempo: settings.tempo,
          timeSignature: settings.timeSignature,
        },
        createdAt: savedSongs[songId]?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };
      setSavedSongs({ ...savedSongs, [songId]: song });
      setCurrentSongId(songId);
    },
    [
      currentSongId,
      composition,
      settings,
      savedSongs,
      setSavedSongs,
      setCurrentSongId,
    ],
  );

  // Load a song
  const loadSong = useCallback(
    (song: SavedSong) => {
      // Validate notes (already in absoluteBeat format)
      const validNotes = validateNotes(song.composition.notes);
      const validMarkers = validateRepeatMarkers(
        song.composition.repeatMarkers,
      );

      // Get lyrics (only exists in new format)
      const lyrics =
        "lyrics" in song.composition ? song.composition.lyrics : [];

      const newComposition: CompositionData = {
        notes: validNotes,
        repeatMarkers: validMarkers,
        lyrics: lyrics || [],
      };

      setComposition(newComposition);
      setSettings((prev) => ({
        ...prev,
        tempo: song.settings.tempo,
        timeSignature: song.settings.timeSignature,
      }));
      setCurrentSongId(song.id);

      // Calculate total measures needed from absoluteBeat
      if (validNotes.length > 0) {
        const beatsPerMeasure = song.settings.timeSignature.numerator;
        const maxBeat = Math.max(
          ...validNotes.map((n) => n.absoluteBeat + n.duration),
        );
        const requiredMeasures = Math.ceil(maxBeat / beatsPerMeasure);
        setTotalMeasures(Math.max(requiredMeasures, 4));
      }

      // Reset history for new song
      setHistory([newComposition]);
      setHistoryIndex(0);
    },
    [setComposition, setSettings, setCurrentSongId, setTotalMeasures],
  );

  // Update current song
  const updateCurrentSong = useCallback(() => {
    if (currentSongId && savedSongs[currentSongId]) {
      saveSong(savedSongs[currentSongId].name);
    }
  }, [currentSongId, savedSongs, saveSong]);

  // Delete a song
  const deleteSong = useCallback(
    (songId: string) => {
      const newSongs = { ...savedSongs };
      delete newSongs[songId];
      setSavedSongs(newSongs);
      if (currentSongId === songId) {
        setCurrentSongId(null);
      }
    },
    [savedSongs, currentSongId, setSavedSongs, setCurrentSongId],
  );

  // Restore default songs
  const restoreDefaults = useCallback(() => {
    setSavedSongs(getDefaultSongs());
  }, [setSavedSongs]);

  // Export all songs
  const exportSongs = useCallback(() => {
    const dataStr = JSON.stringify(savedSongs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rochel-songs.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [savedSongs]);

  // Export selected songs
  const exportSelectedSongs = useCallback(
    (songIds: string[]) => {
      const selectedSongs = songIds.reduce(
        (acc, id) => {
          if (savedSongs[id]) {
            acc[id] = savedSongs[id];
          }
          return acc;
        },
        {} as typeof savedSongs,
      );
      const dataStr = JSON.stringify(selectedSongs, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        songIds.length === 1
          ? `${savedSongs[songIds[0]]?.name || "song"}.json`
          : `rochel-songs-${songIds.length}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },
    [savedSongs],
  );

  return {
    // Composition data
    notes: composition.notes,
    repeatMarkers: composition.repeatMarkers,
    lyrics: composition.lyrics,

    // Setters
    setNotes,
    setRepeatMarkers,
    setLyrics,

    // Settings
    settings: {
      ...settings,
      totalMeasures: effectiveTotalMeasures,
      measuresPerRow: effectiveMeasuresPerRow,
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

    // Undo/Redo
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,

    // Song library
    savedSongs,
    currentSongId,
    currentSongTitle,
    saveSong,
    loadSong,
    deleteSong,
    updateCurrentSong,
    restoreDefaults,
    exportSongs,
    exportSelectedSongs,

    // Actions
    clearComposition,
  };
}
