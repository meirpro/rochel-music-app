"use client";

/**
 * NoteEditorRefactored.tsx - Refactored Interactive Music Staff Notation Editor
 *
 * This component is the refactored version of NoteEditor.tsx, using extracted
 * utility modules for better organization and maintainability.
 */

import { useState, useRef, useCallback, useMemo } from "react";
import { Pitch } from "@/lib/types";
import { pitchToMidi } from "@/lib/constants";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { TOUR_ELEMENT_IDS } from "@/lib/tourSteps/driverSteps";
import {
  LEFT_MARGIN,
  LINE_SPACING,
  getNoteOffset,
  getStaffCenterY,
  getEffectiveSystemHeight,
  getEffectiveTopMargin,
  getEffectiveBottomPadding,
} from "@/lib/layoutUtils";

// Import extracted utilities
import { getLayoutConfig } from "./utils/timeSigConfig";
import {
  calculateSystemLayouts,
  getLayoutForSystem,
  findBestSystemForX,
  getBeatFromXInSystem,
  toRenderedNotes,
  toAbsoluteBeat,
  toRenderedRepeatMarkers,
} from "./utils/systemLayout";
import {
  getPitchFromY,
  getSystemFromY,
  getYFromPitch,
} from "./utils/pitchUtils";
import { snapX } from "./utils/beatUtils";
import { getDurationFromTool, isRestTool } from "./utils/durationUtils";
import { groupEighthNotes } from "./utils/beamingUtils";
import { validateMeasures, MeasureValidation } from "./utils/measureValidation";

// Import types
import { EditorNote, RenderedNote, BeamGroup, NoteEditorProps } from "./types";

// Import subcomponents
import { StaffSystem } from "./components/StaffSystem";
import {
  NoteElement,
  DurationExtension,
  BeamGroupElement,
} from "./components/NoteElement";
import { NoteContextMenu, EmptyContextMenu } from "./components/ContextMenus";
import { Playhead } from "./components/Playhead";
import { LyricsLayer } from "./components/LyricsLayer";
import { VoltaBracketLayer } from "./components/VoltaBracketLayer";

// Import hooks
import { useContextMenu } from "./hooks/useContextMenu";
import { useLyricsEditing } from "./hooks/useLyricsEditing";
import { useRepeatPlacement } from "./hooks/useRepeatPlacement";
import { useVoltaPlacement } from "./hooks/useVoltaPlacement";
import {
  useTimeSigPicker,
  TIME_SIG_NUMERATORS,
  TIME_SIG_DENOMINATORS,
} from "./hooks/useTimeSigPicker";

// Import shared components
import { InlineLyricInput } from "@/components/InlineLyricInput";

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
    onNotesChangeForDrag,
    onDragEnd,
    repeatMarkers,
    onRepeatMarkersChange,
    voltaBrackets = [],
    onVoltaBracketsChange,
    lyrics = [],
    onLyricsChange,
    selectedTool,
    showLabels = true,
    showGrid = true,
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
    onTimeSignatureChangesChange,
    onTimeSignatureClick,
    visibleContextMenuSections,
    onContextMenuAction,
    // Learn mode props
    learnMode = false,
    maxVisibleMeasures: _maxVisibleMeasures,
    highlightPitchLine,
    highlightBeatRange,
    onNoteInteraction,
    // Song metadata for title/footer
    songMetadata,
    // Measure validation
    showMeasureErrors = false,
  } = props;
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalSvgRef || internalSvgRef;

  // Note drag state
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [dragTargetPosition, setDragTargetPosition] = useState<{
    system: number;
    beat: number;
  } | null>(null);
  const justDraggedRef = useRef(false);

  // Note hover state (for move tool preview)
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  // Playhead drag state
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  // Volta hover state
  const [hoveredVolta, setHoveredVolta] = useState<string | null>(null);

  // Measures per system for calculations
  const measuresPerSystem = measuresPerRow ?? 4;

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
        // repeatMarkers now use measureNumber directly (absolute measure numbering)
        repeatMarkers.map((m) => ({
          measureNumber: m.measureNumber,
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

  // Convert notes from absoluteBeat format to rendered format with system/beat
  // This allows internal rendering logic to use system/beat while keeping
  // the external interface using layout-independent absoluteBeat
  const renderedNotes = useMemo(
    () => toRenderedNotes(notes, systemLayouts),
    [notes, systemLayouts],
  );

  // Convert repeat markers to rendered format with system/measure
  // Uses toRenderedRepeatMarkers which handles end markers at system boundaries correctly
  const renderedRepeatMarkers = useMemo(
    () => toRenderedRepeatMarkers(repeatMarkers, measuresPerSystem),
    [repeatMarkers, measuresPerSystem],
  );

  // Get max SVG width
  const maxSvgWidth = useMemo(
    () =>
      Math.max(...systemLayouts.map((l) => l.svgWidth), defaultLayout.svgWidth),
    [systemLayouts, defaultLayout.svgWidth],
  );

  const svgWidth = maxSvgWidth;
  // Dynamic layout based on staff lines (more lines = different margins/heights)
  const effectiveSystemHeight = getEffectiveSystemHeight(staffLines);
  const effectiveTopMargin = getEffectiveTopMargin(staffLines);
  const effectiveBottomPadding = getEffectiveBottomPadding(staffLines);
  const svgHeight =
    effectiveTopMargin +
    systemCount * effectiveSystemHeight +
    effectiveBottomPadding;

  // Group eighth notes for beaming (uses rendered notes with system/beat)
  const beamGroups = useMemo(
    () => groupEighthNotes(renderedNotes, systemLayouts, staffLines),
    [renderedNotes, systemLayouts, staffLines],
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

  // Calculate measure validation errors (when enabled)
  const measureErrors = useMemo(() => {
    if (!showMeasureErrors) return undefined;
    return validateMeasures(
      notes,
      timeSignature,
      timeSignatureChanges,
      totalMeasures,
    );
  }, [
    showMeasureErrors,
    notes,
    timeSignature,
    timeSignatureChanges,
    totalMeasures,
  ]);

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

  // Wrapper to convert RenderedNote[] back to EditorNote[] for onNotesChange
  // This allows internal operations to use system/beat while external interface uses absoluteBeat
  const handleNotesChangeWithConversion = useCallback(
    (newRenderedNotes: RenderedNote[]) => {
      const editorNotes: EditorNote[] = newRenderedNotes.map((n) => ({
        id: n.id,
        pitch: n.pitch,
        duration: n.duration,
        absoluteBeat: toAbsoluteBeat(systemLayouts, n.system, n.beat),
      }));
      onNotesChange(editorNotes);
    },
    [onNotesChange, systemLayouts],
  );

  // Same as above but for drag operations (doesn't push to undo history)
  const handleNotesChangeForDragInternal = useCallback(
    (newRenderedNotes: RenderedNote[]) => {
      const editorNotes: EditorNote[] = newRenderedNotes.map((n) => ({
        id: n.id,
        pitch: n.pitch,
        duration: n.duration,
        absoluteBeat: toAbsoluteBeat(systemLayouts, n.system, n.beat),
      }));
      // Use drag-specific callback if provided, otherwise fallback to regular
      if (onNotesChangeForDrag) {
        onNotesChangeForDrag(editorNotes);
      } else {
        onNotesChange(editorNotes);
      }
    },
    [onNotesChange, onNotesChangeForDrag, systemLayouts],
  );

  // Get coordinates from mouse event
  // Note: svgRef is a stable ref object; we intentionally use [] because we only read .current
  // The viewBox starts at x=-15, so we need to account for this offset
  const VIEWBOX_X_OFFSET = -15;
  const getCoords = useCallback(
    (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      return {
        // Account for viewBox offset: pixel position maps to SVG coordinate + viewBoxMinX
        x: e.clientX - rect.left + VIEWBOX_X_OFFSET,
        y: e.clientY - rect.top,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- svgRef is stable
    [],
  );

  // Use extracted context menu hook (uses renderedNotes for rendering and finding notes)
  const {
    contextMenu,
    setContextMenu,
    collapsedSections,
    toggleSection,
    handleNoteContextMenu,
    handleEmptyContextMenu,
    handleChangeDuration,
    handleDeleteFromMenu: _handleDeleteFromMenu,
    handleChangeAccidental,
    handleChangePitchLetter,
    handleChangeOctave,
    handleAddNoteFromMenu,
    isSelectedNoteRest,
  } = useContextMenu({
    notes: renderedNotes,
    onNotesChange: handleNotesChangeWithConversion,
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
  });

  // Wrap delete handler with learn mode interaction callback
  const handleDeleteFromMenu = useCallback(() => {
    // Get the note being deleted before calling the handler
    if (learnMode && onNoteInteraction && contextMenu?.type === "note") {
      const noteToDelete = renderedNotes.find(
        (n) => n.id === contextMenu.noteId,
      );
      if (noteToDelete) {
        // Convert to EditorNote format for callback
        const editorNote: EditorNote = {
          id: noteToDelete.id,
          pitch: noteToDelete.pitch,
          duration: noteToDelete.duration,
          absoluteBeat: toAbsoluteBeat(
            systemLayouts,
            noteToDelete.system,
            noteToDelete.beat,
          ),
        };
        onNoteInteraction(editorNote, "delete");
      }
    }
    _handleDeleteFromMenu();
  }, [
    learnMode,
    onNoteInteraction,
    contextMenu,
    renderedNotes,
    systemLayouts,
    _handleDeleteFromMenu,
  ]);

  // Use extracted repeat placement hook
  const {
    repeatStart,
    handleRepeatClick,
    handleRepeatHover,
    clearRepeatHover: _clearRepeatHover,
    hoveredRepeatMeasure,
    hoveredMarker,
    setHoveredMarker,
    isPlacingRepeat: _isPlacingRepeat,
    // Drag state
    draggedMarker,
    markerDragPosition,
    handleMarkerDragStart,
    handleMarkerDrag,
    handleMarkerDragEnd,
    isDraggingMarker,
  } = useRepeatPlacement({
    repeatMarkers: renderedRepeatMarkers,
    onRepeatMarkersChange,
    systemLayouts,
    measuresPerSystem,
    beatsPerMeasure: defaultLayout.beatsPerMeasure,
    selectedTool,
  });

  // Use extracted volta placement hook
  const {
    voltaStart: _voltaStart,
    handleVoltaClick,
    handleVoltaHover: _handleVoltaHover,
    isPlacingVolta: _isPlacingVolta,
  } = useVoltaPlacement({
    voltaBrackets,
    onVoltaBracketsChange,
    repeatMarkers, // Need absolute measures for finding repeat sections
    systemLayouts,
    measuresPerSystem,
    beatsPerMeasure: defaultLayout.beatsPerMeasure,
    selectedTool,
  });

  // Use extracted lyrics editing hook
  const {
    editingLyric,
    handleLyricsClick,
    handleSaveLyric,
    handleCancelLyric,
    handleNavigateLyric,
    getInlineLyricPosition,
  } = useLyricsEditing({
    lyrics,
    onLyricsChange,
    systemLayouts,
    systemCount,
    measuresPerSystem,
    beatsPerMeasure: defaultLayout.beatsPerMeasure,
    selectedTool,
    svgRef,
    staffLines,
  });

  // Use extracted time signature picker hook
  const {
    timeSigPicker,
    setTimeSigPicker,
    hoveredTimeSigBar,
    setHoveredTimeSigBar,
    openTimeSigPicker,
    handleSetTimeSig,
    handleDeleteTimeSig,
    hasChangeAtMeasure,
  } = useTimeSigPicker({
    timeSignatureChanges,
    onTimeSignatureChangesChange,
    initialTimeSignature: timeSignature,
    selectedTool,
  });

  // Note mouse down handler for drag
  const handleNoteMouseDown = useCallback(
    (e: React.MouseEvent, noteId: string) => {
      if (!allowMove || readOnly) return;
      e.stopPropagation();
      setDraggedNote(noteId);
    },
    [allowMove, readOnly],
  );

  // Note click handler for delete tool and learn mode interaction
  const handleNoteClick = useCallback(
    (e: React.MouseEvent, noteId: string) => {
      // Handle delete tool
      if (selectedTool === "delete") {
        e.stopPropagation();
        const newNotes = renderedNotes.filter((n) => n.id !== noteId);
        handleNotesChangeWithConversion(newNotes);
        // Also call interaction callback if in learn mode
        if (learnMode && onNoteInteraction) {
          const note = renderedNotes.find((n) => n.id === noteId);
          if (note) {
            const editorNote: EditorNote = {
              id: note.id,
              pitch: note.pitch,
              duration: note.duration,
              absoluteBeat: toAbsoluteBeat(
                systemLayouts,
                note.system,
                note.beat,
              ),
            };
            onNoteInteraction(editorNote, "delete");
          }
        }
        return;
      }

      // Handle learn mode click interaction
      if (learnMode && onNoteInteraction) {
        const note = renderedNotes.find((n) => n.id === noteId);
        if (note) {
          const editorNote: EditorNote = {
            id: note.id,
            pitch: note.pitch,
            duration: note.duration,
            absoluteBeat: toAbsoluteBeat(systemLayouts, note.system, note.beat),
          };
          onNoteInteraction(editorNote, "click");
        }
      }
    },
    [
      selectedTool,
      handleNotesChangeWithConversion,
      renderedNotes,
      systemLayouts,
      learnMode,
      onNoteInteraction,
    ],
  );

  // Mouse move handler for dragging notes, playhead, or markers
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Handle playhead dragging - allows dragging across systems/rows
      if (isDraggingPlayhead && onPlayheadBeatChange) {
        const { x, y } = getCoords(e);
        // Determine which system/row the mouse is over
        const targetSystem = getSystemFromY(y, systemCount, staffLines);
        const sysLayout = getLayoutForSystem(systemLayouts, targetSystem);
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
        // Convert to absolute beat for seeking
        const absoluteBeat = sysLayout.startBeat + clampedBeat;
        onPlayheadBeatChange(absoluteBeat);
        return;
      }

      // Handle repeat marker dragging
      if (draggedMarker) {
        const { x, y } = getCoords(e);
        const system = getSystemFromY(y, systemCount, staffLines);
        handleMarkerDrag(x, y, system);
        return;
      }

      // Handle repeat tool hover tracking
      if (selectedTool === "repeat" && !readOnly && !draggedMarker) {
        const { x, y } = getCoords(e);
        const system = getSystemFromY(y, systemCount, staffLines);
        handleRepeatHover(x, system);
      }

      if (!draggedNote) return;

      const { x, y } = getCoords(e);
      const initialSystem = getSystemFromY(y, systemCount, staffLines);

      const { system: bestSystem, beat } = findBestSystemForX(
        x,
        initialSystem,
        systemLayouts,
        systemCount,
        snapX,
        getBeatFromXInSystem,
      );

      // Find the note being dragged to check if it's a REST
      const draggedNoteData = renderedNotes.find((n) => n.id === draggedNote);

      // For REST notes, preserve the REST pitch; for regular notes, calculate from Y
      const pitch =
        draggedNoteData?.pitch === "REST"
          ? "REST"
          : getPitchFromY(y, bestSystem, staffLines);

      // Check for collision (excluding dragged note)
      // For rests, we don't check pitch collision since they're always centered
      const existingNote = renderedNotes.find(
        (n) =>
          n.id !== draggedNote &&
          Math.abs(n.beat - beat) < 0.25 &&
          n.system === bestSystem &&
          (pitch === "REST" || allowChords ? n.pitch === pitch : true),
      );
      if (existingNote) {
        // Still update drag target position for visual feedback even on collision
        setDragTargetPosition({ system: bestSystem, beat });
        return;
      }

      // Update drag target position for visual feedback
      setDragTargetPosition({ system: bestSystem, beat });

      // Use drag-specific handler (doesn't push to undo history on each move)
      handleNotesChangeForDragInternal(
        renderedNotes.map((n) =>
          n.id === draggedNote ? { ...n, beat, pitch, system: bestSystem } : n,
        ),
      );
    },
    [
      isDraggingPlayhead,
      onPlayheadBeatChange,
      draggedMarker,
      handleMarkerDrag,
      selectedTool,
      readOnly,
      handleRepeatHover,
      draggedNote,
      getCoords,
      systemCount,
      systemLayouts,
      renderedNotes,
      allowChords,
      handleNotesChangeForDragInternal,
      staffLines,
    ],
  );

  // Mouse up handler for drag end
  const handleMouseUp = useCallback(() => {
    if (draggedNote) {
      const note = renderedNotes.find((n) => n.id === draggedNote);
      if (note) playNoteSound(note.pitch, note.duration);
      setDraggedNote(null);
      setDragTargetPosition(null);
      justDraggedRef.current = true;
      // Commit the drag operation to undo history
      onDragEnd?.();
    }
    if (isDraggingPlayhead) {
      setIsDraggingPlayhead(false);
    }
    if (draggedMarker) {
      handleMarkerDragEnd();
    }
  }, [
    draggedNote,
    renderedNotes,
    playNoteSound,
    isDraggingPlayhead,
    draggedMarker,
    handleMarkerDragEnd,
    onDragEnd,
  ]);

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
      if (selectedTool === "delete" || selectedTool === "timesig") return;

      // Get SVG coordinates from mouse event (uses getCoords which accounts for viewBox offset)
      const { x, y } = getCoords(e);

      const system = getSystemFromY(y, systemCount, staffLines);
      const sysLayout = getLayoutForSystem(systemLayouts, system);

      // Handle repeat tool - delegate to hook
      if (selectedTool === "repeat") {
        handleRepeatClick(x, system);
        return;
      }

      // Handle volta tool - delegate to hook
      if (selectedTool === "volta") {
        handleVoltaClick(x, system);
        return;
      }

      // Handle lyrics tool - delegate to hook
      if (selectedTool === "lyrics") {
        handleLyricsClick(x, y, system);
        return;
      }

      // Regular note placement
      const snappedX = snapX(
        x,
        sysLayout.staffRight,
        sysLayout.beatWidth,
        sysLayout,
      );
      const beat =
        (snappedX - LEFT_MARGIN - getNoteOffset(sysLayout.beatWidth)) /
        sysLayout.beatWidth;
      // For rest tools, use "REST" pitch; otherwise get pitch from Y position
      const pitch = isRestTool(selectedTool)
        ? "REST"
        : getPitchFromY(y, system, staffLines);
      const duration = getDurationFromTool(selectedTool);

      // Check for collision using renderedNotes (which have system/beat for comparison)
      const existingNote = renderedNotes.find(
        (n) =>
          Math.abs(n.beat - beat) < 0.25 &&
          n.system === system &&
          (allowChords ? n.pitch === pitch : true),
      );
      if (existingNote) {
        onDuplicateNote?.();
        return;
      }

      // Calculate absoluteBeat from system and beat
      const snappedBeat = Math.round(beat * 2) / 2;
      const absoluteBeat = toAbsoluteBeat(systemLayouts, system, snappedBeat);

      const newNote: EditorNote = {
        id: String(Date.now()),
        pitch,
        duration,
        absoluteBeat,
      };

      onNotesChange([...notes, newNote]);
      playNoteSound(pitch, duration);

      // Learn mode: notify of note placement
      if (learnMode && onNoteInteraction) {
        onNoteInteraction(newNote, "place");
      }
    },
    [
      contextMenu,
      setContextMenu,
      draggedNote,
      readOnly,
      selectedTool,
      svgRef,
      systemCount,
      systemLayouts,
      handleRepeatClick,
      handleVoltaClick,
      handleLyricsClick,
      notes,
      renderedNotes,
      allowChords,
      onNotesChange,
      onDuplicateNote,
      playNoteSound,
      staffLines,
      learnMode,
      onNoteInteraction,
    ],
  );

  return (
    <div className="flex flex-col gap-2 relative">
      {/* Song Title Header */}
      {songMetadata && (songMetadata.title || songMetadata.hebrewName) && (
        <div className="text-center px-4 py-2">
          {songMetadata.hebrewName && (
            <h1 className="text-2xl font-bold text-gray-800 mb-1" dir="rtl">
              {songMetadata.hebrewName}
            </h1>
          )}
          {songMetadata.title && (
            <h2 className="text-lg font-medium text-gray-600">
              {songMetadata.title}
            </h2>
          )}
        </div>
      )}

      <svg
        id={TOUR_ELEMENT_IDS.staffCanvas}
        ref={svgRef}
        width={svgWidth + 15}
        height={svgHeight}
        viewBox={`-15 0 ${svgWidth + 15} ${svgHeight}`}
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
        {Array.from({ length: systemCount }, (_, i) => (
          <StaffSystem
            key={`system-${i}`}
            systemIndex={i}
            systemLayouts={systemLayouts}
            staffLines={staffLines}
            timeSignature={timeSignature}
            readOnly={readOnly}
            showGrid={showGrid}
            onTimeSignatureClick={onTimeSignatureClick}
            repeatMarkers={renderedRepeatMarkers}
            onRepeatMarkersChange={onRepeatMarkersChange}
            hoveredMarker={hoveredMarker}
            setHoveredMarker={setHoveredMarker}
            selectedTool={selectedTool}
            allowMove={allowMove}
            timeSignatureChanges={timeSignatureChanges}
            hoveredTimeSigBar={hoveredTimeSigBar}
            setHoveredTimeSigBar={setHoveredTimeSigBar}
            onTimeSigPickerOpen={openTimeSigPicker}
            onMarkerDragStart={handleMarkerDragStart}
            isDraggingMarker={isDraggingMarker}
            measureErrors={measureErrors}
            showMeasureErrors={showMeasureErrors}
          />
        ))}

        {/* Volta brackets (1st/2nd endings) - render above staff */}
        {Array.from({ length: systemCount }, (_, systemIndex) => {
          const staffCenterY = getStaffCenterY(systemIndex, staffLines);
          return (
            <VoltaBracketLayer
              key={`volta-${systemIndex}`}
              voltaBrackets={voltaBrackets.filter((v) => {
                // Only render voltas that start in this system
                const startSystem = Math.floor(
                  v.startMeasure / measuresPerSystem,
                );
                return startSystem === systemIndex;
              })}
              onVoltaBracketsChange={onVoltaBracketsChange}
              systemLayouts={systemLayouts}
              staffCenterY={staffCenterY}
              staffLines={staffLines}
              measuresPerRow={measuresPerSystem}
              selectedTool={selectedTool}
              hoveredVolta={hoveredVolta}
              setHoveredVolta={setHoveredVolta}
            />
          );
        })}

        {/* Drag target position indicator - shows which half-beat the note will snap to */}
        {draggedNote &&
          dragTargetPosition &&
          (() => {
            const targetLayout = getLayoutForSystem(
              systemLayouts,
              dragTargetPosition.system,
            );
            const targetStaffCenterY = getStaffCenterY(
              dragTargetPosition.system,
              staffLines,
            );
            const staffTopOffset =
              staffLines === 5
                ? -2 * LINE_SPACING
                : staffLines === 4
                  ? -1 * LINE_SPACING
                  : 0;
            const staffBottomOffset = 2 * LINE_SPACING;
            const staffPadding = 20;

            // Find which measure and beat-in-measure this falls into
            let targetX = LEFT_MARGIN;
            for (const measure of targetLayout.measures) {
              const measureStartBeat = measure.startBeatInSystem;
              const measureEndBeat = measureStartBeat + measure.beatsInMeasure;
              if (
                dragTargetPosition.beat >= measureStartBeat &&
                dragTargetPosition.beat < measureEndBeat
              ) {
                const beatInMeasure =
                  dragTargetPosition.beat - measureStartBeat;
                targetX =
                  LEFT_MARGIN +
                  measure.xOffset +
                  beatInMeasure * targetLayout.beatWidth +
                  getNoteOffset(targetLayout.beatWidth);
                break;
              }
            }

            // Half-beat column width
            const columnWidth = targetLayout.beatWidth / 2;

            return (
              <g key="drag-target-indicator" style={{ pointerEvents: "none" }}>
                {/* Highlight column for target half-beat */}
                <rect
                  x={targetX - columnWidth / 2}
                  y={targetStaffCenterY + staffTopOffset - staffPadding}
                  width={columnWidth}
                  height={staffBottomOffset - staffTopOffset + staffPadding * 2}
                  fill="rgba(59, 130, 246, 0.2)"
                  rx={2}
                />
                {/* Vertical guide line at exact snap position */}
                <line
                  x1={targetX}
                  y1={targetStaffCenterY + staffTopOffset - staffPadding + 5}
                  x2={targetX}
                  y2={targetStaffCenterY + staffBottomOffset + staffPadding - 5}
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4,4"
                />
              </g>
            );
          })()}

        {/* Duration extensions (render behind notes) */}
        {renderedNotes.map((note) => (
          <DurationExtension
            key={`duration-${note.id}`}
            note={note}
            systemLayouts={systemLayouts}
            staffLines={staffLines}
          />
        ))}

        {/* Render notes */}
        {renderedNotes.map((note) => (
          <NoteElement
            key={note.id}
            note={note}
            systemLayouts={systemLayouts}
            beamGroups={beamGroups}
            beamedNoteIds={beamedNoteIds}
            staffLines={staffLines}
            showLabels={showLabels}
            activeNoteId={activeNoteId}
            draggedNote={draggedNote}
            hoveredNote={hoveredNote}
            allowMove={allowMove}
            readOnly={readOnly}
            selectedTool={selectedTool}
            onContextMenu={handleNoteContextMenu}
            onMouseDown={handleNoteMouseDown}
            onMouseEnter={setHoveredNote}
            onMouseLeave={() => setHoveredNote(null)}
            onClick={handleNoteClick}
          />
        ))}

        {/* Render beam groups (connected eighth/sixteenth notes) */}
        {beamGroups.map((group, index) => (
          <BeamGroupElement
            key={`beam-${index}`}
            group={group}
            groupIndex={index}
            systemLayouts={systemLayouts}
            staffLines={staffLines}
          />
        ))}

        {/* Lyrics zone highlight when lyrics tool is active */}
        {selectedTool === "lyrics" &&
          !readOnly &&
          !isPlaying &&
          Array.from({ length: systemCount }, (_, systemIndex) => {
            const staffCenterY = getStaffCenterY(systemIndex, staffLines);
            const lyricsZoneY = staffCenterY + LINE_SPACING * 3 + 15;
            const lyricsZoneLayout = getLayoutForSystem(
              systemLayouts,
              systemIndex,
            );
            const lyricsZoneWidth = lyricsZoneLayout.staffRight - LEFT_MARGIN;
            return (
              <rect
                key={`lyrics-zone-${systemIndex}`}
                x={LEFT_MARGIN}
                y={lyricsZoneY}
                width={lyricsZoneWidth}
                height={30}
                fill="#fef3c7"
                opacity={0.5}
                rx={4}
                style={{ pointerEvents: "none" }}
              />
            );
          })}

        {/* Lyrics */}
        <LyricsLayer
          lyrics={lyrics}
          systemLayouts={systemLayouts}
          systemCount={systemCount}
          selectedTool={selectedTool}
          readOnly={readOnly}
          isPlaying={isPlaying}
          editingLyric={editingLyric}
          staffLines={staffLines}
        />

        {/* Learn mode: Pitch line highlight */}
        {highlightPitchLine &&
          learnMode &&
          Array.from({ length: systemCount }, (_, systemIndex) => {
            const pitchY = getYFromPitch(
              highlightPitchLine as Pitch,
              systemIndex,
            );
            const sysLayout = getLayoutForSystem(systemLayouts, systemIndex);
            return (
              <g key={`pitch-highlight-${systemIndex}`}>
                {/* Horizontal highlight line across the staff */}
                <rect
                  x={LEFT_MARGIN - 5}
                  y={pitchY - 4}
                  width={sysLayout.staffRight - LEFT_MARGIN + 10}
                  height={8}
                  fill="#bfdbfe"
                  opacity={0.6}
                  rx={2}
                  style={{ pointerEvents: "none" }}
                />
                {/* Small indicator on the left showing the pitch */}
                <rect
                  x={LEFT_MARGIN - 35}
                  y={pitchY - 10}
                  width={28}
                  height={20}
                  fill="#3b82f6"
                  rx={4}
                  style={{ pointerEvents: "none" }}
                />
                <text
                  x={LEFT_MARGIN - 21}
                  y={pitchY + 4}
                  fontSize={11}
                  fontWeight="600"
                  fill="white"
                  textAnchor="middle"
                  style={{ pointerEvents: "none" }}
                >
                  {highlightPitchLine}
                </text>
              </g>
            );
          })}

        {/* Learn mode: Beat range highlight */}
        {highlightBeatRange &&
          learnMode &&
          (() => {
            const [startBeat, endBeat] = highlightBeatRange;
            const highlights: React.ReactNode[] = [];

            // Iterate through systems to find beats in range
            for (let sys = 0; sys < systemCount; sys++) {
              const sysLayout = getLayoutForSystem(systemLayouts, sys);
              const sysBeatStart = sysLayout.startBeat;
              const sysBeatEnd = sysLayout.startBeat + sysLayout.totalBeats;

              // Check if this system contains any beats in the range
              if (startBeat >= sysBeatEnd || endBeat <= sysBeatStart) continue;

              // Calculate which beats in this system to highlight
              const localStartBeat = Math.max(0, startBeat - sysBeatStart);
              const localEndBeat = Math.min(
                sysLayout.totalBeats,
                endBeat - sysBeatStart,
              );

              // Calculate X positions
              const highlightStartX =
                LEFT_MARGIN + localStartBeat * sysLayout.beatWidth;
              const highlightEndX =
                LEFT_MARGIN + localEndBeat * sysLayout.beatWidth;
              const staffCenterY = getStaffCenterY(sys, staffLines);

              // Calculate staff bounds based on visible lines
              const highlightStaffTopOffset =
                staffLines === 5
                  ? -2 * LINE_SPACING
                  : staffLines === 4
                    ? -1 * LINE_SPACING
                    : 0;
              const highlightStaffBottomOffset = 2 * LINE_SPACING;
              const highlightTop = staffCenterY + highlightStaffTopOffset - 15;
              const highlightBottom =
                staffCenterY + highlightStaffBottomOffset + 15;

              highlights.push(
                <rect
                  key={`beat-highlight-${sys}`}
                  x={highlightStartX}
                  y={highlightTop}
                  width={highlightEndX - highlightStartX}
                  height={highlightBottom - highlightTop}
                  fill="#bbf7d0"
                  opacity={0.4}
                  rx={4}
                  style={{ pointerEvents: "none" }}
                />,
              );
            }

            return highlights;
          })()}

        {/* Repeat marker placement preview - before first click */}
        {!repeatStart &&
          selectedTool === "repeat" &&
          hoveredRepeatMeasure &&
          !readOnly &&
          (() => {
            const hoverStaffCenterY = getStaffCenterY(
              hoveredRepeatMeasure.system,
            );
            const hoverSysLayout = getLayoutForSystem(
              systemLayouts,
              hoveredRepeatMeasure.system,
            );
            const hoverMeasureInfo =
              hoverSysLayout.measures[hoveredRepeatMeasure.measure];
            if (!hoverMeasureInfo) return null;
            // Calculate staff extents based on visible lines (same as StaffSystem)
            const staffTopOffset =
              staffLines === 5
                ? -2 * LINE_SPACING
                : staffLines === 4
                  ? -1 * LINE_SPACING
                  : 0;
            const staffBottomOffset = 2 * LINE_SPACING;
            // xOffset points to where beats START (after prefix)
            // Subtract prefixWidth to start at the bar line
            const hoverMeasureX =
              LEFT_MARGIN +
              hoverMeasureInfo.xOffset -
              (hoverMeasureInfo.prefixWidth || 0);
            // Full width = prefix + beats + suffix
            const hoverMeasureWidth =
              (hoverMeasureInfo.prefixWidth || 0) +
              hoverMeasureInfo.beatsInMeasure * hoverSysLayout.beatWidth +
              (hoverMeasureInfo.suffixWidth || 0);
            const hoverMeasureCenterX = hoverMeasureX + hoverMeasureWidth / 2;
            return (
              <g>
                <rect
                  x={hoverMeasureX}
                  y={hoverStaffCenterY + staffTopOffset - 15}
                  width={hoverMeasureWidth}
                  height={staffBottomOffset - staffTopOffset + 30}
                  fill="#8b5cf6"
                  opacity={0.15}
                  rx={4}
                />
                {/* Instructional text - positioned above the highlight */}
                <rect
                  x={hoverMeasureCenterX - 60}
                  y={hoverStaffCenterY + staffTopOffset - 47}
                  width={120}
                  height={24}
                  fill="#f3e8ff"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  rx={6}
                />
                <text
                  x={hoverMeasureCenterX}
                  y={hoverStaffCenterY + staffTopOffset - 31}
                  fontSize={12}
                  fontWeight="600"
                  fill="#6d28d9"
                  textAnchor="middle"
                  style={{ pointerEvents: "none" }}
                >
                  Click to set START
                </text>
              </g>
            );
          })()}

        {/* Repeat marker placement preview - after first click (range highlight) */}
        {repeatStart &&
          selectedTool === "repeat" &&
          !readOnly &&
          (() => {
            // Calculate absolute measures for start and end of range
            const clickedAbsoluteMeasure =
              repeatStart.system * measuresPerSystem + repeatStart.measure;
            const hoveredAbsoluteMeasure = hoveredRepeatMeasure
              ? hoveredRepeatMeasure.system * measuresPerSystem +
                hoveredRepeatMeasure.measure
              : clickedAbsoluteMeasure;

            // Determine range bounds (swap if hovered comes before clicked)
            const isHoveredBefore =
              hoveredAbsoluteMeasure < clickedAbsoluteMeasure;
            const rangeStartAbsolute = isHoveredBefore
              ? hoveredAbsoluteMeasure
              : clickedAbsoluteMeasure;
            const rangeEndAbsolute = isHoveredBefore
              ? clickedAbsoluteMeasure
              : hoveredAbsoluteMeasure;

            // Convert back to system/measure coordinates
            const rangeStartSystem = Math.floor(
              rangeStartAbsolute / measuresPerSystem,
            );
            const rangeStartMeasure = rangeStartAbsolute % measuresPerSystem;
            const rangeEndSystem = Math.floor(
              rangeEndAbsolute / measuresPerSystem,
            );
            const rangeEndMeasure = rangeEndAbsolute % measuresPerSystem;

            // Determine where to show the text (on hovered measure)
            const showTextSystem = hoveredRepeatMeasure
              ? hoveredRepeatMeasure.system
              : repeatStart.system;
            const showTextMeasure = hoveredRepeatMeasure
              ? hoveredRepeatMeasure.measure
              : repeatStart.measure;
            const textStaffCenterY = getStaffCenterY(
              showTextSystem,
              staffLines,
            );

            const textToShow = hoveredRepeatMeasure
              ? isHoveredBefore
                ? "Click to set START"
                : "Click to set END"
              : "Click to set END";

            // Calculate text position
            const textSysLayout = getLayoutForSystem(
              systemLayouts,
              showTextSystem,
            );
            const textMeasureInfo = textSysLayout.measures[showTextMeasure];
            if (!textMeasureInfo) return null;
            const textMeasureX =
              LEFT_MARGIN +
              textMeasureInfo.xOffset -
              (textMeasureInfo.prefixWidth || 0);
            const textMeasureWidth =
              (textMeasureInfo.prefixWidth || 0) +
              textMeasureInfo.beatsInMeasure * textSysLayout.beatWidth +
              (textMeasureInfo.suffixWidth || 0);
            const textMeasureCenterX = textMeasureX + textMeasureWidth / 2;

            // Build range highlight rectangles for each system in the range
            const rangeHighlights: React.ReactNode[] = [];
            for (
              let sys = rangeStartSystem;
              sys <= rangeEndSystem && sys < systemCount;
              sys++
            ) {
              const sysLayout = getLayoutForSystem(systemLayouts, sys);
              if (!sysLayout.measures.length) continue;

              // Determine which measures to highlight in this system
              const startMeasureInSys =
                sys === rangeStartSystem ? rangeStartMeasure : 0;
              const endMeasureInSys =
                sys === rangeEndSystem
                  ? rangeEndMeasure
                  : sysLayout.measures.length - 1;

              // Get first and last measure info
              const firstMeasureInfo = sysLayout.measures[startMeasureInSys];
              const lastMeasureInfo = sysLayout.measures[endMeasureInSys];
              if (!firstMeasureInfo || !lastMeasureInfo) continue;

              // Calculate range rectangle X and width
              const rangeX =
                LEFT_MARGIN +
                firstMeasureInfo.xOffset -
                (firstMeasureInfo.prefixWidth || 0);
              const rangeEndX =
                LEFT_MARGIN +
                lastMeasureInfo.xOffset +
                lastMeasureInfo.beatsInMeasure * sysLayout.beatWidth +
                (lastMeasureInfo.suffixWidth || 0);
              const rangeWidth = rangeEndX - rangeX;
              const sysStaffCenterY = getStaffCenterY(sys, staffLines);

              // Calculate staff extents based on visible lines (same as StaffSystem)
              const sysStaffTopOffset =
                staffLines === 5
                  ? -2 * LINE_SPACING
                  : staffLines === 4
                    ? -1 * LINE_SPACING
                    : 0;
              const sysStaffBottomOffset = 2 * LINE_SPACING;
              rangeHighlights.push(
                <rect
                  key={`range-highlight-${sys}`}
                  x={rangeX}
                  y={sysStaffCenterY + sysStaffTopOffset - 15}
                  width={rangeWidth}
                  height={sysStaffBottomOffset - sysStaffTopOffset + 30}
                  fill="#8b5cf6"
                  opacity={0.15}
                  rx={4}
                />,
              );
            }

            // Calculate staff top offset for text positioning
            const textStaffTopOffset =
              staffLines === 5
                ? -2 * LINE_SPACING
                : staffLines === 4
                  ? -1 * LINE_SPACING
                  : 0;

            return (
              <g>
                {/* Highlight range across all affected systems */}
                {hoveredRepeatMeasure && rangeHighlights}
                {/* Background rectangle for text visibility */}
                <rect
                  x={
                    textMeasureCenterX -
                    (textToShow === "Click to set END" ? 55 : 60)
                  }
                  y={textStaffCenterY + textStaffTopOffset - 47}
                  width={textToShow === "Click to set END" ? 110 : 120}
                  height={24}
                  fill="#f3e8ff"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  rx={6}
                  style={{ pointerEvents: "none" }}
                />
                {/* Text on top */}
                <text
                  x={textMeasureCenterX}
                  y={textStaffCenterY + textStaffTopOffset - 31}
                  fontSize={12}
                  fontWeight="600"
                  fill="#7c3aed"
                  textAnchor="middle"
                  style={{ pointerEvents: "none" }}
                >
                  {textToShow}
                </text>
              </g>
            );
          })()}

        {/* Marker drag preview - shows drop zone when dragging repeat markers */}
        {draggedMarker &&
          markerDragPosition &&
          (() => {
            const dragSysLayout = getLayoutForSystem(
              systemLayouts,
              markerDragPosition.targetSystem,
            );
            const dragStaffCenterY = getStaffCenterY(
              markerDragPosition.targetSystem,
            );
            // Calculate staff extents based on visible lines (same as StaffSystem)
            const dragStaffTopOffset =
              staffLines === 5
                ? -2 * LINE_SPACING
                : staffLines === 4
                  ? -1 * LINE_SPACING
                  : 0;
            const dragStaffBottomOffset = 2 * LINE_SPACING;
            // Calculate X position for the target measure boundary
            let dragPreviewX: number;
            if (
              markerDragPosition.targetMeasure < dragSysLayout.measures.length
            ) {
              const targetMeasureInfo =
                dragSysLayout.measures[markerDragPosition.targetMeasure];
              dragPreviewX =
                LEFT_MARGIN +
                targetMeasureInfo.xOffset -
                (targetMeasureInfo.prefixWidth || 0);
            } else {
              // Past the last measure - show at end of system
              const lastMeasure =
                dragSysLayout.measures[dragSysLayout.measures.length - 1];
              dragPreviewX =
                LEFT_MARGIN +
                lastMeasure.xOffset +
                lastMeasure.beatsInMeasure * dragSysLayout.beatWidth +
                (lastMeasure.suffixWidth || 0);
            }

            return (
              <g style={{ pointerEvents: "none" }}>
                {/* Vertical line at target position - extends from above staff to below lyrics */}
                <line
                  x1={dragPreviewX}
                  y1={dragStaffCenterY + dragStaffTopOffset - 25}
                  x2={dragPreviewX}
                  y2={
                    dragStaffCenterY +
                    dragStaffBottomOffset +
                    LINE_SPACING * 2 +
                    20
                  }
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  strokeDasharray="6,4"
                />
                {/* Indicator circle */}
                <circle
                  cx={dragPreviewX}
                  cy={
                    draggedMarker.type === "start"
                      ? dragStaffCenterY + dragStaffTopOffset - 35
                      : dragStaffCenterY +
                        dragStaffBottomOffset +
                        LINE_SPACING * 2 +
                        30
                  }
                  r={8}
                  fill="#8b5cf6"
                  stroke="white"
                  strokeWidth={2}
                />
                {/* Label */}
                <rect
                  x={dragPreviewX - 30}
                  y={
                    draggedMarker.type === "start"
                      ? dragStaffCenterY + dragStaffTopOffset - 65
                      : dragStaffCenterY +
                        dragStaffBottomOffset +
                        LINE_SPACING * 2 +
                        40
                  }
                  width={60}
                  height={20}
                  fill="#8b5cf6"
                  rx={4}
                />
                <text
                  x={dragPreviewX}
                  y={
                    draggedMarker.type === "start"
                      ? dragStaffCenterY + dragStaffTopOffset - 51
                      : dragStaffCenterY +
                        dragStaffBottomOffset +
                        LINE_SPACING * 2 +
                        54
                  }
                  fontSize={11}
                  fontWeight="600"
                  fill="white"
                  textAnchor="middle"
                >
                  {draggedMarker.type === "start" ? "START" : "END"}
                </text>
              </g>
            );
          })()}

        {/* Playhead - taller than beat shading to stick out on both ends */}
        {playheadX !== null && (
          <Playhead
            playheadX={playheadX}
            playheadSystem={playheadSystem}
            staffLines={staffLines}
            isDraggable={!!onPlayheadBeatChange}
            onMouseDown={handlePlayheadMouseDown}
          />
        )}
      </svg>

      {/* Song Description Footer */}
      {songMetadata?.description && (
        <div className="text-center px-4 py-2 text-sm text-gray-500 italic">
          {songMetadata.description}
        </div>
      )}

      {/* Context menu for note editing */}
      {contextMenu && contextMenu.type === "note" && (
        <NoteContextMenu
          contextMenu={contextMenu}
          collapsedSections={collapsedSections}
          onToggleSection={toggleSection}
          onChangeDuration={handleChangeDuration}
          onChangeAccidental={handleChangeAccidental}
          onChangePitchLetter={handleChangePitchLetter}
          onChangeOctave={handleChangeOctave}
          onDelete={handleDeleteFromMenu}
          visibleSections={visibleContextMenuSections}
          isRest={isSelectedNoteRest}
        />
      )}

      {/* Context menu for adding notes on empty space */}
      {contextMenu && contextMenu.type === "empty" && (
        <EmptyContextMenu
          contextMenu={contextMenu}
          onAddNote={handleAddNoteFromMenu}
        />
      )}

      {/* Inline lyric input - rendered as HTML overlay */}
      {editingLyric &&
        (() => {
          const position = getInlineLyricPosition();
          if (!position) return null;
          return (
            <InlineLyricInput
              initialText={editingLyric.initialText}
              position={position}
              absoluteBeat={editingLyric.absoluteBeat}
              onSave={handleSaveLyric}
              onCancel={handleCancelLyric}
              onNavigate={handleNavigateLyric}
            />
          );
        })()}

      {/* Repeat placement instruction tooltip */}
      {repeatStart && selectedTool === "repeat" && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm shadow-lg z-10">
          Click another measure to complete the repeat section
        </div>
      )}

      {/* Time signature change picker modal */}
      {timeSigPicker && (
        <div
          className="absolute bg-white rounded-lg shadow-lg border border-cyan-200 p-3 z-50"
          style={{
            left: timeSigPicker.x - 60,
            top: timeSigPicker.y + LINE_SPACING * 2 + 20,
          }}
        >
          <div className="text-xs font-semibold text-cyan-600 mb-2">
            Time Signature at M{timeSigPicker.measureNumber + 1}
          </div>
          <div className="flex gap-2 items-center">
            <select
              className="border rounded px-2 py-1 text-sm w-14"
              defaultValue={timeSignature.numerator}
              id="timesig-numerator"
            >
              {TIME_SIG_NUMERATORS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-gray-500">/</span>
            <select
              className="border rounded px-2 py-1 text-sm w-14"
              defaultValue={timeSignature.denominator}
              id="timesig-denominator"
            >
              {TIME_SIG_DENOMINATORS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              className="flex-1 px-3 py-1 text-sm bg-cyan-500 text-white rounded hover:bg-cyan-600"
              onClick={() => {
                const numEl = document.getElementById(
                  "timesig-numerator",
                ) as HTMLSelectElement;
                const denEl = document.getElementById(
                  "timesig-denominator",
                ) as HTMLSelectElement;
                if (numEl && denEl) {
                  handleSetTimeSig(
                    parseInt(numEl.value, 10),
                    parseInt(denEl.value, 10),
                  );
                }
              }}
            >
              Set
            </button>
            <button
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
              onClick={() => setTimeSigPicker(null)}
            >
              Cancel
            </button>
            {/* Delete button if there's an existing change at this measure */}
            {hasChangeAtMeasure(timeSigPicker.measureNumber) && (
              <button
                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                onClick={handleDeleteTimeSig}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export types
export type { EditorNote, BeamGroup, NoteEditorProps };
