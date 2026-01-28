"use client";

/**
 * NoteEditorRefactored.tsx - Refactored Interactive Music Staff Notation Editor
 *
 * This component is the refactored version of NoteEditor.tsx, using extracted
 * utility modules for better organization and maintainability.
 */

import { useState, useRef, useCallback, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Pitch } from "@/lib/types";
import { getNoteColor, pitchToMidi } from "@/lib/constants";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { TOUR_ELEMENT_IDS } from "@/lib/tourSteps/driverSteps";
import {
  LEFT_MARGIN,
  STAFF_LEFT,
  LINE_SPACING,
  SYSTEM_HEIGHT,
  SYSTEM_TOP_MARGIN,
  getNoteOffset,
  getStaffCenterY,
} from "@/lib/layoutUtils";

// Import extracted utilities
import { getLayoutConfig } from "./utils/timeSigConfig";
import {
  calculateSystemLayouts,
  getLayoutForSystem,
  findBestSystemForX,
  getBeatXInSystem,
  getBeatFromXInSystem,
  getSystemForAbsoluteBeat,
} from "./utils/systemLayout";
import {
  getYFromPitch,
  getPitchFromY,
  getSystemFromY,
  parsePitch,
  buildPitch,
  changeOctave,
} from "./utils/pitchUtils";
import { snapX } from "./utils/beatUtils";
import { getNoteLabel, getDurationFromTool } from "./utils/durationUtils";
import { groupEighthNotes } from "./utils/beamingUtils";

// Import types
import { EditorNote, BeamGroup, NoteEditorProps } from "./types";

// Import subcomponents
import { MenuNoteIcon } from "./components/MenuNoteIcon";

/**
 * NoteEditorRefactored - Main Component
 *
 * Renders a musical staff with notes, clef, time signature, and bar lines.
 * Uses extracted utility modules for calculations.
 */
export function NoteEditorRefactored(props: NoteEditorProps) {
  // Destructure props
  const {
    notes,
    onNotesChange,
    repeatMarkers,
    lyrics = [],
    selectedTool,
    showLabels = true,
    allowChords = false,
    allowMove = false,
    playheadX = null,
    playheadSystem = 0,
    onPlayheadBeatChange,
    activeNoteId = null,
    systemCount,
    totalMeasures,
    onDuplicateNote,
    svgRef: externalSvgRef,
    timeSignature = { numerator: 4, denominator: 4 },
    tempo = 100,
    measuresPerRow,
    readOnly = false,
    isPlaying = false,
    onPlaybackBlock,
    staffLines = 3,
    noteSpacing = 1.0,
    timeSignatureChanges = [],
    onTimeSignatureClick,
  } = props;
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalSvgRef || internalSvgRef;

  // Context menu state
  const [contextMenu, setContextMenu] = useState<
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
    | null
  >(null);

  // Collapsed sections state for context menu (persisted in localStorage)
  const [collapsedSections, setCollapsedSections] = useLocalStorage<{
    duration: boolean;
    accidental: boolean;
    changeNote: boolean;
    octave: boolean;
  }>(
    "note-menu-collapsed",
    { duration: false, accidental: false, changeNote: false, octave: false },
    { initializeWithValue: false },
  );

  const toggleSection = useCallback(
    (section: "duration" | "accidental" | "changeNote" | "octave") => {
      setCollapsedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    },
    [setCollapsedSections],
  );

  // Note drag state
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const justDraggedRef = useRef(false);

  // Playhead drag state
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  // Get dynamic layout based on time signature
  const defaultLayout = useMemo(
    () => getLayoutConfig(timeSignature, measuresPerRow, noteSpacing),
    [timeSignature, measuresPerRow, noteSpacing],
  );

  // Calculate per-system layouts
  const systemLayouts = useMemo(
    () =>
      calculateSystemLayouts(
        systemCount,
        totalMeasures,
        timeSignature,
        timeSignatureChanges || [],
        measuresPerRow ?? 4,
        noteSpacing,
        repeatMarkers.map((m) => ({
          measureNumber: m.system * (measuresPerRow ?? 4) + m.measure,
          type: m.type,
        })),
      ),
    [
      systemCount,
      totalMeasures,
      timeSignature,
      timeSignatureChanges,
      measuresPerRow,
      noteSpacing,
      repeatMarkers,
    ],
  );

  // Get max SVG width
  const maxSvgWidth = useMemo(
    () =>
      Math.max(...systemLayouts.map((l) => l.svgWidth), defaultLayout.svgWidth),
    [systemLayouts, defaultLayout.svgWidth],
  );

  const svgWidth = maxSvgWidth;
  const svgHeight = SYSTEM_TOP_MARGIN + systemCount * SYSTEM_HEIGHT + 40;

  // Group eighth notes for beaming
  const beamGroups = useMemo(
    () => groupEighthNotes(notes, systemLayouts),
    [notes, systemLayouts],
  );

  // Get set of note IDs that are part of beam groups
  const beamedNoteIds = useMemo(() => {
    const ids = new Set<string>();
    for (const group of beamGroups) {
      for (const note of group.notes) {
        ids.add(note.id);
      }
    }
    return ids;
  }, [beamGroups]);

  // Play a note sound
  const playNoteSound = useCallback(
    (pitch: Pitch, durationBeats: number) => {
      const midi = pitchToMidi(pitch);
      if (midi > 0) {
        const player = getAudioPlayer();
        const durationSeconds = (durationBeats * 60) / tempo;
        player.playNote(midi, durationSeconds);
      }
    },
    [tempo],
  );

  // Get coordinates from mouse event
  const getCoords = useCallback(
    (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [svgRef],
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
      setContextMenu(null);
    },
    [contextMenu, notes, onNotesChange, isPlaying, onPlaybackBlock],
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
    setContextMenu(null);
  }, [contextMenu, notes, onNotesChange, isPlaying, onPlaybackBlock]);

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
      setContextMenu(null);
    },
    [contextMenu, notes, onNotesChange, isPlaying, onPlaybackBlock],
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
      setContextMenu(null);
    },
    [contextMenu, notes, onNotesChange, isPlaying, onPlaybackBlock],
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
      setContextMenu(null);
    },
    [contextMenu, notes, onNotesChange, isPlaying, onPlaybackBlock],
  );

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

      const newNote: EditorNote = {
        id: String(Date.now()),
        pitch: contextMenu.pitch,
        duration,
        beat: contextMenu.beat,
        system: contextMenu.system,
      };

      onNotesChange([...notes, newNote]);
      playNoteSound(contextMenu.pitch, duration);
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
      const initialSystem = getSystemFromY(y, systemCount);

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

      const staffCenterY = getStaffCenterY(bestSystem);
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

  // Note mouse down handler for drag
  const handleNoteMouseDown = useCallback(
    (e: React.MouseEvent, noteId: string) => {
      if (!allowMove || readOnly) return;
      e.stopPropagation();
      setDraggedNote(noteId);
    },
    [allowMove, readOnly],
  );

  // Mouse move handler for dragging notes or playhead
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Handle playhead dragging
      if (isDraggingPlayhead && onPlayheadBeatChange) {
        const { x } = getCoords(e);
        const sysLayout = getLayoutForSystem(systemLayouts, playheadSystem);
        // Calculate beat from X position
        const rawBeat = getBeatFromXInSystem(
          sysLayout,
          x,
          getNoteOffset(sysLayout.beatWidth),
        );
        // Snap to half-beats and clamp to valid range
        const snappedBeat = Math.round(rawBeat * 2) / 2;
        const clampedBeat = Math.max(
          0,
          Math.min(sysLayout.totalBeats - 0.5, snappedBeat),
        );
        onPlayheadBeatChange(clampedBeat);
        return;
      }

      if (!draggedNote) return;

      const { x, y } = getCoords(e);
      const initialSystem = getSystemFromY(y, systemCount);

      const { system: bestSystem, beat } = findBestSystemForX(
        x,
        initialSystem,
        systemLayouts,
        systemCount,
        snapX,
        getBeatFromXInSystem,
      );

      const pitch = getPitchFromY(y, bestSystem, staffLines);

      // Check for collision (excluding dragged note)
      const existingNote = notes.find(
        (n) =>
          n.id !== draggedNote &&
          Math.abs(n.beat - beat) < 0.25 &&
          n.system === bestSystem &&
          (allowChords ? n.pitch === pitch : true),
      );
      if (existingNote) return;

      onNotesChange(
        notes.map((n) =>
          n.id === draggedNote ? { ...n, beat, pitch, system: bestSystem } : n,
        ),
      );
    },
    [
      isDraggingPlayhead,
      onPlayheadBeatChange,
      playheadSystem,
      draggedNote,
      getCoords,
      systemCount,
      systemLayouts,
      notes,
      allowChords,
      onNotesChange,
      staffLines,
    ],
  );

  // Mouse up handler for drag end
  const handleMouseUp = useCallback(() => {
    if (draggedNote) {
      const note = notes.find((n) => n.id === draggedNote);
      if (note) playNoteSound(note.pitch, note.duration);
      setDraggedNote(null);
      justDraggedRef.current = true;
    }
    if (isDraggingPlayhead) {
      setIsDraggingPlayhead(false);
    }
  }, [draggedNote, notes, playNoteSound, isDraggingPlayhead]);

  // Playhead drag handlers
  const handlePlayheadMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!onPlayheadBeatChange) return;
      e.stopPropagation();
      e.preventDefault();
      setIsDraggingPlayhead(true);
    },
    [onPlayheadBeatChange],
  );

  // Handle click on SVG
  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Close context menu if open
      if (contextMenu) {
        setContextMenu(null);
        return;
      }

      // Skip if dragging
      if (draggedNote) return;

      // Skip if just finished dragging
      if (justDraggedRef.current) {
        justDraggedRef.current = false;
        return;
      }

      if (readOnly || !selectedTool) return;
      if (
        selectedTool === "delete" ||
        selectedTool === "repeat" ||
        selectedTool === "lyrics" ||
        selectedTool === "timesig"
      )
        return;

      // Get SVG coordinates from mouse event
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const system = getSystemFromY(y, systemCount);
      const sysLayout = getLayoutForSystem(systemLayouts, system);
      const snappedX = snapX(
        x,
        sysLayout.staffRight,
        sysLayout.beatWidth,
        sysLayout,
      );
      const beat =
        (snappedX - LEFT_MARGIN - getNoteOffset(sysLayout.beatWidth)) /
        sysLayout.beatWidth;
      const pitch = getPitchFromY(y, system, staffLines);
      const duration = getDurationFromTool(selectedTool);

      // Check for collision
      const existingNote = notes.find(
        (n) =>
          Math.abs(n.beat - beat) < 0.25 &&
          n.system === system &&
          (allowChords ? n.pitch === pitch : true),
      );
      if (existingNote) {
        onDuplicateNote?.();
        return;
      }

      const newNote: EditorNote = {
        id: String(Date.now()),
        pitch,
        duration,
        beat: Math.round(beat * 2) / 2,
        system,
      };

      onNotesChange([...notes, newNote]);
      playNoteSound(pitch, duration);
    },
    [
      contextMenu,
      draggedNote,
      readOnly,
      selectedTool,
      svgRef,
      systemCount,
      systemLayouts,
      notes,
      allowChords,
      onNotesChange,
      onDuplicateNote,
      playNoteSound,
      staffLines,
    ],
  );

  /**
   * Render duration extension bar (semi-transparent line showing note length)
   */
  const renderDurationExtension = (note: EditorNote) => {
    if (note.pitch === "REST") return null;

    // Shorten extension by one eighth note (0.5 beats) - eighth notes get no line
    const adjustedDuration = note.duration - 0.5;
    if (adjustedDuration <= 0) return null;

    // Get system's beat width for variable widths
    const sysLayout = getLayoutForSystem(systemLayouts, note.system);
    const sysBeatWidth = sysLayout.beatWidth;

    // Use getBeatXInSystem to account for decoration widths
    const x =
      getBeatXInSystem(sysLayout, note.beat) + getNoteOffset(sysBeatWidth);
    const y = getYFromPitch(note.pitch, note.system);
    const color = getNoteColor(note.pitch);

    // Extension shows adjusted duration (shortened by 1/8 beat)
    const extensionWidth = adjustedDuration * sysBeatWidth;

    return (
      <rect
        key={`duration-${note.id}`}
        x={x} // Start from note center
        y={y - 4}
        width={extensionWidth}
        height={8}
        rx={4}
        fill={color}
        opacity={0.4}
        style={{ pointerEvents: "none" }}
      />
    );
  };

  /**
   * Render a single note
   */
  const renderNote = (note: EditorNote) => {
    const sysLayout = getLayoutForSystem(systemLayouts, note.system);
    const x =
      getBeatXInSystem(sysLayout, note.beat) +
      getNoteOffset(sysLayout.beatWidth);
    const y = getYFromPitch(note.pitch, note.system);
    const color = getNoteColor(note.pitch);
    const isActive = activeNoteId === note.id;
    const isBeamed = beamedNoteIds.has(note.id);

    // Note characteristics
    const isWhole = note.duration === 4;
    const isHalf = note.duration === 2 || note.duration === 3;
    const isHollow = isWhole || isHalf;
    const isEighthOrShorter = note.duration < 1; // 0.5, 0.25, 0.75
    // Skip stem for beamed eighth notes (beam section draws their stems)
    const hasStem = !isWhole && !(isEighthOrShorter && isBeamed);
    const hasFlag =
      (note.duration === 0.5 ||
        note.duration === 0.75 ||
        note.duration === 0.25) &&
      !isBeamed;
    const hasDot =
      note.duration === 0.75 || note.duration === 1.5 || note.duration === 3;
    const isSixteenth = note.duration === 0.25;

    // Stem direction: notes above middle line have stems down
    // For beamed notes, use the beam group's stem direction
    const staffCenterY = getStaffCenterY(note.system);
    let stemDir: "up" | "down" = y > staffCenterY ? "up" : "down";
    if (isBeamed) {
      const beamGroup = beamGroups.find((g) =>
        g.notes.some((n) => n.id === note.id),
      );
      if (beamGroup) {
        stemDir = beamGroup.stemDirection;
      }
    }
    const stemH = 40;
    // Stems down moved inward by 1px for better alignment
    const stemX = stemDir === "up" ? x + 12 : x - 11;
    const stemY1 = y;
    const stemY2 = stemDir === "up" ? y - stemH : y + stemH;

    // Ledger lines for notes outside staff
    const staffTopOffset =
      staffLines === 5
        ? -2 * LINE_SPACING
        : staffLines === 4
          ? -1 * LINE_SPACING
          : 0;
    const staffBottomY = staffCenterY + 2 * LINE_SPACING;
    const staffTopY = staffCenterY + staffTopOffset;
    const ledgerLines: number[] = [];

    // Below staff (C4, D4 need ledger lines)
    if (y > staffBottomY) {
      for (
        let ly = staffBottomY + LINE_SPACING;
        ly <= y + 8;
        ly += LINE_SPACING
      ) {
        ledgerLines.push(ly);
      }
    }
    // Above staff
    if (y < staffTopY) {
      for (let ly = staffTopY - LINE_SPACING; ly >= y - 8; ly -= LINE_SPACING) {
        ledgerLines.push(ly);
      }
    }

    const isSelected = draggedNote === note.id;

    return (
      <g
        key={note.id}
        data-note-id={note.id}
        onContextMenu={(e) => handleNoteContextMenu(e, note.id)}
        onMouseDown={(e) => handleNoteMouseDown(e, note.id)}
        style={{ cursor: allowMove && !readOnly ? "move" : "pointer" }}
      >
        {/* Ledger lines */}
        {ledgerLines.map((ly, i) => (
          <line
            key={`ledger-${i}`}
            x1={x - 18}
            y1={ly}
            x2={x + 18}
            y2={ly}
            stroke="#4a5568"
            strokeWidth={2}
          />
        ))}

        {/* Invisible hit area for interactions */}
        <rect
          x={x - 18}
          y={y - 25}
          width={36}
          height={50}
          fill="transparent"
          style={{ cursor: allowMove && !readOnly ? "move" : "pointer" }}
        />

        {/* Selection indicator - blue dot above the note */}
        {isSelected && <circle cx={x} cy={y - 28} r={4} fill="#3B82F6" />}

        {/* Note head */}
        <ellipse
          cx={x}
          cy={y}
          rx={isWhole ? 14 : 12}
          ry={10}
          fill={isHollow ? "white" : color}
          stroke={color}
          strokeWidth={isHollow ? 3 : 2}
          transform={`rotate(-15 ${x} ${y})`}
        />

        {/* Active note glow */}
        {isActive && (
          <ellipse
            cx={x}
            cy={y}
            rx={18}
            ry={14}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={3}
            opacity={0.7}
            transform={`rotate(-15 ${x} ${y})`}
          />
        )}

        {/* Stem */}
        {hasStem && (
          <line
            x1={stemX}
            y1={stemY1}
            x2={stemX}
            y2={stemY2}
            stroke={color}
            strokeWidth={3}
          />
        )}

        {/* Flag for eighth/sixteenth notes (not beamed) */}
        {hasFlag && (
          <path
            d={
              stemDir === "up"
                ? `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 + 10} ${stemX + 10} ${stemY2 + 22}`
                : `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 - 10} ${stemX + 10} ${stemY2 - 22}`
            }
            stroke={color}
            strokeWidth={3.5}
            fill="none"
          />
        )}

        {/* Second flag for sixteenth notes */}
        {hasFlag && isSixteenth && (
          <path
            d={
              stemDir === "up"
                ? `M ${stemX} ${stemY2 + 8} Q ${stemX + 10} ${stemY2 + 18} ${stemX + 10} ${stemY2 + 30}`
                : `M ${stemX} ${stemY2 - 8} Q ${stemX + 10} ${stemY2 - 18} ${stemX + 10} ${stemY2 - 30}`
            }
            stroke={color}
            strokeWidth={3.5}
            fill="none"
          />
        )}

        {/* Dot for dotted notes */}
        {hasDot && (
          <circle cx={x + 20} cy={y - LINE_SPACING / 4} r={4} fill={color} />
        )}

        {/* Note label */}
        {showLabels && (
          <text
            x={x}
            y={y + 5}
            textAnchor="middle"
            fill="#1a1a1a"
            fontSize={11}
            fontWeight="bold"
            fontFamily="system-ui, sans-serif"
            style={{ pointerEvents: "none" }}
          >
            {getNoteLabel(note.pitch)}
          </text>
        )}
      </g>
    );
  };

  /**
   * Render a single staff system
   */
  const renderSystem = (systemIndex: number) => {
    const isFirstSystem = systemIndex === 0;
    const staffCenterY = getStaffCenterY(systemIndex);

    // Dynamic staff extents based on visible lines
    const staffTopOffset =
      staffLines === 5
        ? -2 * LINE_SPACING
        : staffLines === 4
          ? -1 * LINE_SPACING
          : 0;
    const staffBottomOffset = 2 * LINE_SPACING;
    const staffPadding = 20;

    // Visual center for decorations
    const visibleCenterOffset = (staffTopOffset + staffBottomOffset) / 2;
    const decorationSpread =
      staffLines === 5
        ? LINE_SPACING
        : staffLines === 4
          ? LINE_SPACING * 0.875
          : LINE_SPACING / 2;

    // Clip area
    const clipTopOffset = staffTopOffset - 1.5 * LINE_SPACING;

    // Get per-system layout
    const sysLayout = getLayoutForSystem(systemLayouts, systemIndex);
    const sysTotalBeats = sysLayout.totalBeats;
    const sysBeatWidth = sysLayout.beatWidth;
    const sysMeasures = sysLayout.measures;
    const sysStaffRight = sysLayout.staffRight;

    return (
      <g key={`system-${systemIndex}`}>
        {/* Clip path */}
        <defs>
          <clipPath id={`system-clip-${systemIndex}`}>
            <rect
              x={0}
              y={staffCenterY + clipTopOffset}
              width={sysLayout.svgWidth}
              height={staffBottomOffset - clipTopOffset + 120}
            />
          </clipPath>
        </defs>

        {/* Beat shading */}
        {sysMeasures.flatMap((measure) =>
          Array.from({ length: measure.beatsInMeasure }, (_, beatInMeasure) => {
            const beatInSystem = measure.startBeatInSystem + beatInMeasure;
            const beatX =
              LEFT_MARGIN + measure.xOffset + beatInMeasure * sysBeatWidth;
            const isShaded = beatInSystem % 2 === 1;
            return (
              <rect
                key={`shade-${systemIndex}-${beatInSystem}`}
                x={beatX}
                y={staffCenterY + staffTopOffset - staffPadding}
                width={sysBeatWidth}
                height={staffBottomOffset - staffTopOffset + staffPadding * 2}
                fill={isShaded ? "#e2e8f0" : "#f8fafc"}
              />
            );
          }),
        )}

        {/* Staff lines */}
        {(() => {
          const allLineOffsets = [
            -2 * LINE_SPACING,
            -1 * LINE_SPACING,
            0,
            1 * LINE_SPACING,
            2 * LINE_SPACING,
          ];
          const linesToShow =
            staffLines === 5
              ? [0, 1, 2, 3, 4]
              : staffLines === 4
                ? [1, 2, 3, 4]
                : [2, 3, 4];
          return linesToShow.map((lineIndex) => (
            <line
              key={`staff-line-${lineIndex}`}
              x1={STAFF_LEFT}
              y1={staffCenterY + allLineOffsets[lineIndex]}
              x2={sysStaffRight}
              y2={staffCenterY + allLineOffsets[lineIndex]}
              stroke="#4a5568"
              strokeWidth={2}
            />
          ));
        })()}

        {/* Bar lines */}
        {[...sysMeasures, null].map((measure, measureIndex) => {
          const isLastBarLine = measure === null;
          let barX: number;
          if (isLastBarLine) {
            const lastMeasure = sysMeasures[sysMeasures.length - 1];
            barX =
              LEFT_MARGIN +
              lastMeasure.xOffset +
              lastMeasure.beatsInMeasure * sysBeatWidth +
              lastMeasure.suffixWidth;
          } else {
            barX = LEFT_MARGIN + measure.xOffset - measure.prefixWidth;
          }
          const isEdge = measureIndex === 0 || isLastBarLine;

          return (
            <g key={`bar-${systemIndex}-${measureIndex}`}>
              <line
                x1={barX}
                y1={staffCenterY + staffTopOffset - 8}
                x2={barX}
                y2={staffCenterY + staffBottomOffset + 8}
                stroke={isEdge ? "#1e293b" : "#475569"}
                strokeWidth={isEdge ? 4 : 2}
              />

              {/* Time signature display at mid-row changes */}
              {measure?.showTimeSig && measureIndex !== 0 && (
                <g>
                  <text
                    x={barX + 15}
                    y={
                      staffCenterY + visibleCenterOffset - decorationSpread + 6
                    }
                    fontSize={20}
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#334155"
                  >
                    {measure.timeSignature.numerator}
                  </text>
                  <text
                    x={barX + 15}
                    y={
                      staffCenterY + visibleCenterOffset + decorationSpread + 6
                    }
                    fontSize={20}
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#334155"
                  >
                    {measure.timeSignature.denominator}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Treble Clef */}
        <g clipPath={`url(#system-clip-${systemIndex})`}>
          <g
            transform={`translate(0, ${staffCenterY - 96}) scale(5.1)`}
            style={{ pointerEvents: "none" }}
          >
            <path
              d="m12.049 3.5296c0.305 3.1263-2.019 5.6563-4.0772 7.7014-0.9349 0.897-0.155 0.148-0.6437 0.594-0.1022-0.479-0.2986-1.731-0.2802-2.11 0.1304-2.6939 2.3198-6.5875 4.2381-8.0236 0.309 0.5767 0.563 0.6231 0.763 1.8382zm0.651 16.142c-1.232-0.906-2.85-1.144-4.3336-0.885-0.1913-1.255-0.3827-2.51-0.574-3.764 2.3506-2.329 4.9066-5.0322 5.0406-8.5394 0.059-2.232-0.276-4.6714-1.678-6.4836-1.7004 0.12823-2.8995 2.156-3.8019 3.4165-1.4889 2.6705-1.1414 5.9169-0.57 8.7965-0.8094 0.952-1.9296 1.743-2.7274 2.734-2.3561 2.308-4.4085 5.43-4.0046 8.878 0.18332 3.334 2.5894 6.434 5.8702 7.227 1.2457 0.315 2.5639 0.346 3.8241 0.099 0.2199 2.25 1.0266 4.629 0.0925 6.813-0.7007 1.598-2.7875 3.004-4.3325 2.192-0.5994-0.316-0.1137-0.051-0.478-0.252 1.0698-0.257 1.9996-1.036 2.26-1.565 0.8378-1.464-0.3998-3.639-2.1554-3.358-2.262 0.046-3.1904 3.14-1.7356 4.685 1.3468 1.52 3.833 1.312 5.4301 0.318 1.8125-1.18 2.0395-3.544 1.8325-5.562-0.07-0.678-0.403-2.67-0.444-3.387 0.697-0.249 0.209-0.059 1.193-0.449 2.66-1.053 4.357-4.259 3.594-7.122-0.318-1.469-1.044-2.914-2.302-3.792zm0.561 5.757c0.214 1.991-1.053 4.321-3.079 4.96-0.136-0.795-0.172-1.011-0.2626-1.475-0.4822-2.46-0.744-4.987-1.116-7.481 1.6246-0.168 3.4576 0.543 4.0226 2.184 0.244 0.577 0.343 1.197 0.435 1.812zm-5.1486 5.196c-2.5441 0.141-4.9995-1.595-5.6343-4.081-0.749-2.153-0.5283-4.63 0.8207-6.504 1.1151-1.702 2.6065-3.105 4.0286-4.543 0.183 1.127 0.366 2.254 0.549 3.382-2.9906 0.782-5.0046 4.725-3.215 7.451 0.5324 0.764 1.9765 2.223 2.7655 1.634-1.102-0.683-2.0033-1.859-1.8095-3.227-0.0821-1.282 1.3699-2.911 2.6513-3.198 0.4384 2.869 0.9413 6.073 1.3797 8.943-0.5054 0.1-1.0211 0.143-1.536 0.143z"
              fill="#334155"
            />
          </g>
        </g>

        {/* Time signature (first system only) */}
        {isFirstSystem && (
          <g
            onClick={(e) => {
              if (!readOnly && onTimeSignatureClick) {
                e.stopPropagation();
                onTimeSignatureClick();
              }
            }}
            style={{ cursor: readOnly ? "default" : "pointer" }}
          >
            <rect
              x={70}
              y={staffCenterY + staffTopOffset}
              width={30}
              height={staffBottomOffset - staffTopOffset}
              fill="transparent"
            />
            <text
              x={85}
              y={staffCenterY + visibleCenterOffset - decorationSpread + 6}
              fontSize={20}
              fontWeight="bold"
              textAnchor="middle"
              fill="#334155"
            >
              {timeSignature.numerator}
            </text>
            <text
              x={85}
              y={staffCenterY + visibleCenterOffset + decorationSpread + 6}
              fontSize={20}
              fontWeight="bold"
              textAnchor="middle"
              fill="#334155"
            >
              {timeSignature.denominator}
            </text>
          </g>
        )}

        {/* Beat numbers */}
        {Array.from({ length: sysTotalBeats }, (_, i) => i).map((beatIndex) => (
          <text
            key={`beat-${systemIndex}-${beatIndex}`}
            x={
              getBeatXInSystem(sysLayout, beatIndex) +
              getNoteOffset(sysBeatWidth)
            }
            y={staffCenterY + staffBottomOffset + 25}
            fontSize={11}
            textAnchor="middle"
            fill="#64748b"
          >
            {sysLayout.startBeat + beatIndex + 1}
          </text>
        ))}

        {/* System number label */}
        <text
          x={15}
          y={staffCenterY + clipTopOffset - 10}
          fontSize={14}
          fill="#94a3b8"
          fontWeight="bold"
        >
          {systemIndex + 1}
        </text>
      </g>
    );
  };

  /**
   * Render beam groups for connected eighth notes
   * Copied from original NoteEditor.tsx beam rendering logic
   */
  const renderBeamGroups = () => {
    return beamGroups.map((group, groupIndex) => {
      const { notes: groupNotes, stemDirection } = group;
      if (groupNotes.length < 2) return null;

      const stemH = 40;
      const beamThickness = 6;

      // Calculate stem X positions
      const stemXs = groupNotes.map((note) => {
        const sysLayout = getLayoutForSystem(systemLayouts, note.system);
        const noteX =
          getBeatXInSystem(sysLayout, note.beat) +
          getNoteOffset(sysLayout.beatWidth);
        // Stems closer to note (was 13), stems down moved inward by 1px
        return stemDirection === "up" ? noteX + 11 : noteX - 11;
      });

      // Calculate stem Y positions (before beam adjustment)
      const stemYs = groupNotes.map((note) => {
        const noteY = getYFromPitch(note.pitch, note.system);
        return stemDirection === "up" ? noteY - stemH : noteY + stemH;
      });

      // Get note colors
      const colors = groupNotes.map((n) => getNoteColor(n.pitch));

      // Calculate beam slope (limited)
      const MAX_BEAM_SLOPE = LINE_SPACING / 2;
      const rawSlope = stemYs[stemYs.length - 1] - stemYs[0];
      const limitedSlope = Math.max(
        -MAX_BEAM_SLOPE,
        Math.min(MAX_BEAM_SLOPE, rawSlope),
      );

      // Anchor beam at extremity
      let firstY: number, lastY: number;
      if (stemDirection === "up") {
        const minStemY = Math.min(...stemYs);
        firstY = minStemY;
        lastY = minStemY + limitedSlope;
      } else {
        const maxStemY = Math.max(...stemYs);
        firstY = maxStemY;
        lastY = maxStemY + limitedSlope;
      }

      const firstX = stemXs[0];
      const lastX = stemXs[stemXs.length - 1];

      // Linear interpolation for beam Y at any X
      const getBeamYAtX = (x: number) => {
        if (firstX === lastX) return firstY;
        const t = (x - firstX) / (lastX - firstX);
        return firstY + t * (lastY - firstY);
      };

      // Beam color (gradient if multi-colored)
      const uniqueColors = [...new Set(colors)];
      const beamColor =
        uniqueColors.length > 1
          ? `url(#beam-gradient-${groupIndex})`
          : colors[0];

      // Calculate secondary beams for 16th notes
      // Draw continuous beams for runs of consecutive 16ths (not individual segments)
      const secondaryBeams: Array<{
        startX: number;
        endX: number;
        startY: number;
        endY: number;
        color: string;
      }> = [];

      const secondaryBeamOffset = stemDirection === "up" ? 8 : -8;

      // Find runs of consecutive 16th notes
      let runStart: number | null = null;
      for (let i = 0; i <= groupNotes.length; i++) {
        const is16th = i < groupNotes.length && groupNotes[i].duration === 0.25;

        if (is16th && runStart === null) {
          // Start of a new run
          runStart = i;
        } else if (!is16th && runStart !== null) {
          // End of a run - draw beam from runStart to i-1
          const runEnd = i - 1;
          if (runEnd > runStart) {
            // Multiple consecutive 16ths - draw one continuous beam
            const startX = stemXs[runStart];
            const endX = stemXs[runEnd];
            const startY = getBeamYAtX(startX) + secondaryBeamOffset;
            const endY = getBeamYAtX(endX) + secondaryBeamOffset;
            // Use the main beam gradient for continuous secondary beam
            secondaryBeams.push({
              startX,
              endX,
              startY,
              endY,
              color: beamColor, // Same gradient as primary beam
            });
          } else {
            // Single isolated 16th - draw a stub beam
            const stubLength = 12;
            const stemX = stemXs[runStart];
            const isFirst = runStart === 0;
            const isLast = runStart === groupNotes.length - 1;
            let stubStartX: number, stubEndX: number;
            if (isFirst) {
              stubStartX = stemX;
              stubEndX = stemX + stubLength;
            } else if (isLast) {
              stubStartX = stemX - stubLength;
              stubEndX = stemX;
            } else {
              stubStartX = stemX;
              stubEndX = stemX + stubLength;
            }
            const stubStartY = getBeamYAtX(stubStartX) + secondaryBeamOffset;
            const stubEndY = getBeamYAtX(stubEndX) + secondaryBeamOffset;
            secondaryBeams.push({
              startX: stubStartX,
              endX: stubEndX,
              startY: stubStartY,
              endY: stubEndY,
              color: colors[runStart],
            });
          }
          runStart = null;
        }
      }

      return (
        <g key={`beam-group-${groupIndex}`}>
          {/* Gradient definition if needed */}
          {uniqueColors.length > 1 && (
            <defs>
              <linearGradient
                id={`beam-gradient-${groupIndex}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                {groupNotes.map((note, i) => (
                  <stop
                    key={note.id}
                    offset={`${(i / (groupNotes.length - 1)) * 100}%`}
                    stopColor={getNoteColor(note.pitch)}
                  />
                ))}
              </linearGradient>
            </defs>
          )}

          {/* Stems from each note to the beam */}
          {groupNotes.map((note, i) => {
            const stemX = stemXs[i];
            const noteY = getYFromPitch(note.pitch, note.system);
            const beamY = getBeamYAtX(stemX);
            return (
              <line
                key={`beam-stem-${groupIndex}-${i}`}
                x1={stemX}
                y1={noteY}
                x2={stemX}
                y2={beamY}
                stroke={colors[i]}
                strokeWidth={4.5}
              />
            );
          })}

          {/* Primary beam */}
          <polygon
            points={`
              ${firstX},${firstY}
              ${lastX},${lastY}
              ${lastX},${lastY + (stemDirection === "up" ? beamThickness : -beamThickness)}
              ${firstX},${firstY + (stemDirection === "up" ? beamThickness : -beamThickness)}
            `}
            fill={beamColor}
          />

          {/* Secondary beams for 16th notes */}
          {secondaryBeams.map((sb, sbIndex) => (
            <polygon
              key={`secondary-beam-${groupIndex}-${sbIndex}`}
              points={`
                ${sb.startX},${sb.startY}
                ${sb.endX},${sb.endY}
                ${sb.endX},${sb.endY + (stemDirection === "up" ? beamThickness : -beamThickness)}
                ${sb.startX},${sb.startY + (stemDirection === "up" ? beamThickness : -beamThickness)}
              `}
              fill={sb.color}
            />
          ))}

          {/* Dots for dotted notes within beam group */}
          {groupNotes.map((note, i) => {
            if (note.duration !== 0.75) return null;
            const dotSysLayout = getLayoutForSystem(systemLayouts, note.system);
            const noteX =
              getBeatXInSystem(dotSysLayout, note.beat) +
              getNoteOffset(dotSysLayout.beatWidth);
            const noteY = getYFromPitch(note.pitch, note.system);
            return (
              <circle
                key={`beam-dot-${groupIndex}-${i}`}
                cx={noteX + 20}
                cy={noteY - LINE_SPACING / 4}
                r={4}
                fill={colors[i]}
              />
            );
          })}
        </g>
      );
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <svg
        id={TOUR_ELEMENT_IDS.staffCanvas}
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        onClick={handleClick}
        onContextMenu={handleEmptyContextMenu}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="bg-white border border-gray-200 rounded-xl shadow-sm select-none"
        style={{
          cursor: draggedNote
            ? "grabbing"
            : selectedTool === null
              ? "default"
              : selectedTool === "delete"
                ? "not-allowed"
                : "crosshair",
        }}
      >
        {/* Render systems */}
        {Array.from({ length: systemCount }, (_, i) => renderSystem(i))}

        {/* Duration extensions (render behind notes) */}
        {notes.map(renderDurationExtension)}

        {/* Render notes */}
        {notes.map(renderNote)}

        {/* Render beam groups */}
        {renderBeamGroups()}

        {/* Lyrics */}
        {lyrics.map((lyric) => {
          const lyricPosition = getSystemForAbsoluteBeat(
            systemLayouts,
            lyric.absoluteBeat,
          );
          if (!lyricPosition || lyricPosition.systemIndex >= systemCount)
            return null;
          const system = lyricPosition.systemIndex;
          const lyricSysLayout = getLayoutForSystem(systemLayouts, system);
          const beatInSystem = lyricPosition.beatInSystem;
          const x =
            LEFT_MARGIN +
            beatInSystem * lyricSysLayout.beatWidth +
            getNoteOffset(lyricSysLayout.beatWidth);
          const staffCenterY = getStaffCenterY(system);
          const lyricsY = staffCenterY + LINE_SPACING + 55;

          return (
            <text
              key={`lyric-${lyric.absoluteBeat}`}
              x={x}
              y={lyricsY}
              textAnchor="middle"
              fontSize={12}
              fontFamily="system-ui, sans-serif"
              fill="#374151"
              style={{ unicodeBidi: "isolate" }}
            >
              {lyric.text}
            </text>
          );
        })}

        {/* Playhead - taller than beat shading to stick out on both ends */}
        {playheadX !== null &&
          (() => {
            // Calculate staff extents
            const staffTopOffset =
              staffLines === 5
                ? -2 * LINE_SPACING
                : staffLines === 4
                  ? -1 * LINE_SPACING
                  : 0;
            const staffBottomOffset = 2 * LINE_SPACING;
            // Beat shading has 20px padding, playhead extends 35px to stick out 15px beyond
            const playheadOverhang = 35;
            const playheadTop =
              getStaffCenterY(playheadSystem) +
              staffTopOffset -
              playheadOverhang;
            const playheadBottom =
              getStaffCenterY(playheadSystem) +
              staffBottomOffset +
              playheadOverhang;

            const isDraggable = !!onPlayheadBeatChange;

            return (
              <g
                onMouseDown={isDraggable ? handlePlayheadMouseDown : undefined}
                style={{ cursor: isDraggable ? "ew-resize" : "default" }}
              >
                {/* Invisible hit area for easier dragging */}
                {isDraggable && (
                  <rect
                    x={playheadX - 10}
                    y={playheadTop}
                    width={20}
                    height={playheadBottom - playheadTop}
                    fill="transparent"
                  />
                )}
                <line
                  x1={playheadX}
                  y1={playheadTop}
                  x2={playheadX}
                  y2={playheadBottom}
                  stroke="#f59e0b"
                  strokeWidth={3}
                  opacity={0.8}
                />
                {/* Triangle at top of playhead */}
                <polygon
                  points={`${playheadX - 8},${playheadTop} ${playheadX + 8},${playheadTop} ${playheadX},${playheadTop + 10}`}
                  fill="#f59e0b"
                  opacity={0.8}
                />
              </g>
            );
          })()}
      </svg>

      {/* Context menu for note editing */}
      {contextMenu && contextMenu.type === "note" && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px] overflow-y-auto"
          style={{
            left: contextMenu.x,
            top: Math.min(
              contextMenu.y,
              typeof window !== "undefined"
                ? window.innerHeight - 600
                : contextMenu.y,
            ),
            maxHeight: "calc(100vh - 40px)",
          }}
        >
          {/* Duration section */}
          <button
            onClick={() => toggleSection("duration")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Duration</span>
            <span className="text-gray-400">
              {collapsedSections.duration ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.duration && (
            <>
              <button
                onClick={() => handleChangeDuration(0.25)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={0.25} /> Sixteenth
              </button>
              <button
                onClick={() => handleChangeDuration(0.5)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={0.5} /> Eighth
              </button>
              <button
                onClick={() => handleChangeDuration(0.75)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={0.75} /> Dotted Eighth
              </button>
              <button
                onClick={() => handleChangeDuration(1)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={1} /> Quarter
              </button>
              <button
                onClick={() => handleChangeDuration(1.5)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={1.5} /> Dotted Quarter
              </button>
              <button
                onClick={() => handleChangeDuration(2)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={2} /> Half
              </button>
              <button
                onClick={() => handleChangeDuration(3)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={3} /> Dotted Half
              </button>
              <button
                onClick={() => handleChangeDuration(4)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={4} /> Whole
              </button>
            </>
          )}

          {/* Accidental section */}
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => toggleSection("accidental")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Accidental</span>
            <span className="text-gray-400">
              {collapsedSections.accidental ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.accidental && (
            <div className="px-2 py-1 flex gap-1">
              <button
                onClick={() => handleChangeAccidental(null)}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 font-medium"
                title="Natural"
              >
                ♮
              </button>
              <button
                onClick={() => handleChangeAccidental("#")}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 font-medium"
                title="Sharp"
              >
                ♯
              </button>
              <button
                onClick={() => handleChangeAccidental("b")}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 font-medium"
                title="Flat"
              >
                ♭
              </button>
            </div>
          )}

          {/* Change Note section */}
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => toggleSection("changeNote")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Change Note</span>
            <span className="text-gray-400">
              {collapsedSections.changeNote ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.changeNote && (
            <div className="px-2 py-1 flex gap-0.5">
              {["C", "D", "E", "F", "G", "A", "B"].map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleChangePitchLetter(letter)}
                  className="flex-1 px-1 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 font-medium"
                >
                  {letter}
                </button>
              ))}
            </div>
          )}

          {/* Octave section */}
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => toggleSection("octave")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Octave</span>
            <span className="text-gray-400">
              {collapsedSections.octave ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.octave && (
            <div className="px-2 py-1 flex gap-1">
              <button
                onClick={() => handleChangeOctave("up")}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 flex items-center justify-center gap-1"
                title="Octave Up"
              >
                <span>▲</span> Up
              </button>
              <button
                onClick={() => handleChangeOctave("down")}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 flex items-center justify-center gap-1"
                title="Octave Down"
              >
                <span>▼</span> Down
              </button>
            </div>
          )}

          {/* Delete section */}
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={handleDeleteFromMenu}
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
          >
            <span>🗑</span> Delete
          </button>
        </div>
      )}

      {/* Context menu for adding notes on empty space */}
      {contextMenu && contextMenu.type === "empty" && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px] overflow-y-auto"
          style={{
            left: contextMenu.x,
            top: Math.min(
              contextMenu.y,
              typeof window !== "undefined"
                ? window.innerHeight - 370
                : contextMenu.y,
            ),
            maxHeight: "calc(100vh - 40px)",
          }}
        >
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Add Note ({contextMenu.pitch})
          </div>
          <button
            onClick={() => handleAddNoteFromMenu(0.25)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={0.25} /> Sixteenth
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(0.5)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={0.5} /> Eighth
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(0.75)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={0.75} /> Dotted Eighth
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(1)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={1} /> Quarter
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(1.5)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={1.5} /> Dotted Quarter
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(2)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={2} /> Half
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(3)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={3} /> Dotted Half
          </button>
          <button
            onClick={() => handleAddNoteFromMenu(4)}
            className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <MenuNoteIcon duration={4} /> Whole
          </button>
        </div>
      )}
    </div>
  );
}

// Re-export types
export type { EditorNote, BeamGroup, NoteEditorProps };
