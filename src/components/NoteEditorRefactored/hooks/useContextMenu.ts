// src/components/NoteEditorRefactored/hooks/useContextMenu.ts
// Extracts all context menu state and handlers from NoteEditorRefactored

import { useState, useCallback } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Pitch } from "@/lib/types";
import { LEFT_MARGIN, LINE_SPACING, getStaffCenterY } from "@/lib/layoutUtils";
import {
  findBestSystemForX,
  getBeatFromXInSystem,
  SystemLayout,
} from "../utils/systemLayout";
import {
  getPitchFromY,
  getSystemFromY,
  parsePitch,
  buildPitch,
  changeOctave,
} from "../utils/pitchUtils";
import { snapX } from "../utils/beatUtils";
import { toAbsoluteBeat } from "../utils/systemLayout";
import { EditorNote, RenderedNote } from "../types";

// Context menu state type
export type ContextMenuState =
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
  | null;

// Collapsed sections state type
export interface CollapsedSections {
  duration: boolean;
  accidental: boolean;
  changeNote: boolean;
  octave: boolean;
  rest: boolean;
}

// Hook parameters
export interface UseContextMenuParams {
  notes: RenderedNote[]; // Rendered notes with system/beat for collision detection
  onNotesChange: (notes: RenderedNote[]) => void; // Parent handles conversion to absoluteBeat
  systemLayouts: SystemLayout[];
  systemCount: number;
  staffLines: number;
  readOnly: boolean;
  isPlaying: boolean;
  allowChords: boolean;
  onPlaybackBlock?: () => void;
  onDuplicateNote?: () => void;
  playNoteSound: (pitch: Pitch, duration: number) => void;
  getCoords: (e: React.MouseEvent<SVGSVGElement>) => { x: number; y: number };
  onContextMenuAction?: () => void; // Called when any context menu action is performed
}

// Hook return type
export interface UseContextMenuReturn {
  contextMenu: ContextMenuState;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState>>;
  collapsedSections: CollapsedSections;
  toggleSection: (
    section: "duration" | "accidental" | "changeNote" | "octave" | "rest",
  ) => void;
  handleNoteContextMenu: (e: React.MouseEvent, noteId: string) => void;
  handleEmptyContextMenu: (e: React.MouseEvent<SVGSVGElement>) => void;
  handleChangeDuration: (duration: number) => void;
  handleDeleteFromMenu: () => void;
  handleChangeAccidental: (accidental: "#" | "b" | null) => void;
  handleChangePitchLetter: (newLetter: string) => void;
  handleChangeOctave: (direction: "up" | "down") => void;
  /** Convert note to rest with specified duration */
  handleConvertToRest: (duration: number) => void;
  /** Convert rest back to a note (uses current duration, pitch defaults to C4) */
  handleConvertToNote: () => void;
  handleAddNoteFromMenu: (duration: number) => void;
  /** Returns true if the currently selected note is a rest */
  isSelectedNoteRest: boolean;
}

/**
 * useContextMenu - Hook for managing note editor context menus
 *
 * Extracts all context menu state and handlers into a reusable hook.
 */
export function useContextMenu({
  notes,
  onNotesChange,
  systemLayouts,
  systemCount,
  staffLines,
  readOnly,
  isPlaying,
  allowChords,
  onPlaybackBlock,
  onDuplicateNote,
  playNoteSound,
  getCoords,
  onContextMenuAction,
}: UseContextMenuParams): UseContextMenuReturn {
  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  // Collapsed sections state for context menu (persisted in localStorage)
  const [collapsedSections, setCollapsedSections] =
    useLocalStorage<CollapsedSections>(
      "note-menu-collapsed",
      {
        duration: false,
        accidental: false,
        changeNote: false,
        octave: false,
        rest: false,
      },
      { initializeWithValue: false },
    );

  const toggleSection = useCallback(
    (section: "duration" | "accidental" | "changeNote" | "octave" | "rest") => {
      setCollapsedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    },
    [setCollapsedSections],
  );

  // Context menu handler for notes
  const handleNoteContextMenu = useCallback(
    (e: React.MouseEvent, noteId: string) => {
      e.preventDefault();
      e.stopPropagation();

      if (readOnly) return;

      // Calculate menu position to prevent off-screen overflow
      const menuWidth = 180;
      const menuHeight = 520;
      const padding = 8;

      let x = e.clientX;
      let y = e.clientY;

      if (x + menuWidth + padding > window.innerWidth) {
        x = window.innerWidth - menuWidth - padding;
      }
      if (y + menuHeight + padding > window.innerHeight) {
        y = window.innerHeight - menuHeight - padding;
      }
      if (x < padding) x = padding;
      if (y < padding) y = padding;

      setContextMenu({ type: "note", noteId, x, y });
    },
    [readOnly],
  );

  // Handler for changing note duration
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
      onContextMenuAction?.();
      setContextMenu(null);
    },
    [
      contextMenu,
      notes,
      onNotesChange,
      isPlaying,
      onPlaybackBlock,
      onContextMenuAction,
    ],
  );

  // Handler for deleting note from menu
  const handleDeleteFromMenu = useCallback(() => {
    if (!contextMenu || contextMenu.type !== "note") return;
    if (isPlaying) {
      onPlaybackBlock?.();
      setContextMenu(null);
      return;
    }
    onNotesChange(notes.filter((n) => n.id !== contextMenu.noteId));
    onContextMenuAction?.();
    setContextMenu(null);
  }, [
    contextMenu,
    notes,
    onNotesChange,
    isPlaying,
    onPlaybackBlock,
    onContextMenuAction,
  ]);

  // Handler for changing note accidental
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

      const newPitch = buildPitch(parsed.note, accidental, parsed.octave);

      onNotesChange(
        notes.map((n) =>
          n.id === contextMenu.noteId ? { ...n, pitch: newPitch } : n,
        ),
      );
      onContextMenuAction?.();
      setContextMenu(null);
    },
    [
      contextMenu,
      notes,
      onNotesChange,
      isPlaying,
      onPlaybackBlock,
      onContextMenuAction,
    ],
  );

  // Handler for changing note letter (C-B)
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

      let newAccidental = parsed.accidental;
      if (parsed.octave === 6 && newLetter !== "C") {
        const newPitch = buildPitch(newLetter, newAccidental, 5);
        onNotesChange(
          notes.map((n) =>
            n.id === contextMenu.noteId ? { ...n, pitch: newPitch } : n,
          ),
        );
      } else {
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
      onContextMenuAction?.();
      setContextMenu(null);
    },
    [
      contextMenu,
      notes,
      onNotesChange,
      isPlaying,
      onPlaybackBlock,
      onContextMenuAction,
    ],
  );

  // Handler for changing octave
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
        setContextMenu(null);
        return;
      }

      onNotesChange(
        notes.map((n) =>
          n.id === contextMenu.noteId ? { ...n, pitch: newPitch } : n,
        ),
      );
      onContextMenuAction?.();
      setContextMenu(null);
    },
    [
      contextMenu,
      notes,
      onNotesChange,
      isPlaying,
      onPlaybackBlock,
      onContextMenuAction,
    ],
  );

  // Handler for converting note to rest with specified duration
  const handleConvertToRest = useCallback(
    (duration: number) => {
      if (!contextMenu || contextMenu.type !== "note") return;
      if (isPlaying) {
        onPlaybackBlock?.();
        setContextMenu(null);
        return;
      }

      const note = notes.find((n) => n.id === contextMenu.noteId);
      if (!note) return;

      onNotesChange(
        notes.map((n) =>
          n.id === contextMenu.noteId
            ? { ...n, pitch: "REST" as Pitch, duration }
            : n,
        ),
      );
      onContextMenuAction?.();
      setContextMenu(null);
    },
    [
      contextMenu,
      notes,
      onNotesChange,
      isPlaying,
      onPlaybackBlock,
      onContextMenuAction,
    ],
  );

  // Handler for converting rest back to note (defaults to C4, keeps duration)
  const handleConvertToNote = useCallback(() => {
    if (!contextMenu || contextMenu.type !== "note") return;
    if (isPlaying) {
      onPlaybackBlock?.();
      setContextMenu(null);
      return;
    }

    const note = notes.find((n) => n.id === contextMenu.noteId);
    if (!note || note.pitch !== "REST") return;

    onNotesChange(
      notes.map((n) =>
        n.id === contextMenu.noteId ? { ...n, pitch: "C4" as Pitch } : n,
      ),
    );
    onContextMenuAction?.();
    setContextMenu(null);
  }, [
    contextMenu,
    notes,
    onNotesChange,
    isPlaying,
    onPlaybackBlock,
    onContextMenuAction,
  ]);

  // Check if the currently selected note is a rest
  const isSelectedNoteRest =
    contextMenu?.type === "note"
      ? notes.find((n) => n.id === contextMenu.noteId)?.pitch === "REST"
      : false;

  // Handler for adding note from empty space menu
  const handleAddNoteFromMenu = useCallback(
    (duration: number) => {
      if (!contextMenu || contextMenu.type !== "empty") return;
      if (isPlaying) {
        onPlaybackBlock?.();
        setContextMenu(null);
        return;
      }

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

      // Calculate absoluteBeat from system and beat for storage
      const absoluteBeat = toAbsoluteBeat(
        systemLayouts,
        contextMenu.system,
        contextMenu.beat,
      );

      const newNote: RenderedNote = {
        id: String(Date.now()),
        pitch: contextMenu.pitch,
        duration,
        absoluteBeat,
        beat: contextMenu.beat,
        system: contextMenu.system,
      };

      onNotesChange([...notes, newNote]);
      playNoteSound(contextMenu.pitch, duration);
      onContextMenuAction?.();
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
      onContextMenuAction,
      systemLayouts,
    ],
  );

  // Handler for empty space right-click
  const handleEmptyContextMenu = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      e.preventDefault();

      if (readOnly) return;

      if (isPlaying) {
        onPlaybackBlock?.();
        return;
      }

      const { x, y } = getCoords(e);
      const initialSystem = getSystemFromY(y, systemCount, staffLines);

      const {
        system: bestSystem,
        beat,
        sysLayout: sysLayoutForCtx,
      } = findBestSystemForX(
        x,
        initialSystem,
        systemLayouts,
        systemCount,
        snapX,
        getBeatFromXInSystem,
      );

      const staffCenterY = getStaffCenterY(bestSystem, staffLines);
      const sysStaffRightForCtx = sysLayoutForCtx.staffRight;

      // Check bounds
      if (x < LEFT_MARGIN - 10 || x > sysStaffRightForCtx + 10) return;
      if (y < staffCenterY - LINE_SPACING * 2 - 20) return;
      if (y > staffCenterY + LINE_SPACING * 2 + 20) return;

      const pitch = getPitchFromY(y, bestSystem, staffLines);

      const clickedNote = notes.find(
        (n) =>
          Math.abs(n.beat - beat) < 0.25 &&
          n.system === bestSystem &&
          n.pitch === pitch,
      );
      if (clickedNote) return;

      // Calculate menu position
      const menuWidth = 180;
      const menuHeight = 340;
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
      systemLayouts,
      notes,
      staffLines,
    ],
  );

  return {
    contextMenu,
    setContextMenu,
    collapsedSections,
    toggleSection,
    handleNoteContextMenu,
    handleEmptyContextMenu,
    handleChangeDuration,
    handleDeleteFromMenu,
    handleChangeAccidental,
    handleChangePitchLetter,
    handleChangeOctave,
    handleConvertToRest,
    handleConvertToNote,
    handleAddNoteFromMenu,
    isSelectedNoteRest,
  };
}
