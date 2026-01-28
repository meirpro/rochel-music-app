"use client";

/**
 * NoteEditorRefactored.tsx - Refactored Interactive Music Staff Notation Editor
 *
 * This component is the refactored version of NoteEditor.tsx, using extracted
 * utility modules for better organization and maintainability.
 */

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { Pitch, LyricSyllable } from "@/lib/types";
import { pitchToMidi } from "@/lib/constants";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { TOUR_ELEMENT_IDS } from "@/lib/tourSteps/driverSteps";
import { toast } from "sonner";
import {
  LEFT_MARGIN,
  SYSTEM_HEIGHT,
  SYSTEM_TOP_MARGIN,
  LINE_SPACING,
  getNoteOffset,
} from "@/lib/layoutUtils";

// Import extracted utilities
import { getLayoutConfig } from "./utils/timeSigConfig";
import {
  calculateSystemLayouts,
  getLayoutForSystem,
  findBestSystemForX,
  getBeatFromXInSystem,
} from "./utils/systemLayout";
import { getPitchFromY, getSystemFromY } from "./utils/pitchUtils";
import { snapX } from "./utils/beatUtils";
import { getDurationFromTool } from "./utils/durationUtils";
import { groupEighthNotes } from "./utils/beamingUtils";

// Import types
import { EditorNote, BeamGroup, NoteEditorProps } from "./types";

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

// Import hooks
import { useContextMenu } from "./hooks/useContextMenu";

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
    repeatMarkers,
    onRepeatMarkersChange,
    lyrics = [],
    onLyricsChange,
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
    visibleContextMenuSections,
    onContextMenuAction,
  } = props;
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalSvgRef || internalSvgRef;

  // Note drag state
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const justDraggedRef = useRef(false);

  // Playhead drag state
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  // Repeat tool state - tracks first click for two-click placement
  const [repeatStart, setRepeatStart] = useState<{
    system: number;
    measure: number;
  } | null>(null);

  // Lyrics editing state
  const [editingLyric, setEditingLyric] = useState<{
    absoluteBeat: number;
    initialText: string;
  } | null>(null);

  // Clear tool-specific state when tool changes
  useEffect(() => {
    if (selectedTool !== "repeat") {
      setRepeatStart(null);
    }
    if (selectedTool !== "lyrics") {
      setEditingLyric(null);
    }
  }, [selectedTool]);

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

  // Use extracted context menu hook
  const {
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
    handleAddNoteFromMenu,
  } = useContextMenu({
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

  // Calculate staff center Y for a system (used for lyrics zone)
  const getStaffCenterY = useCallback((systemIndex: number): number => {
    return SYSTEM_TOP_MARGIN + systemIndex * SYSTEM_HEIGHT + 80;
  }, []);

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

      // Get SVG coordinates from mouse event
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const system = getSystemFromY(y, systemCount);
      const sysLayout = getLayoutForSystem(systemLayouts, system);

      // Handle repeat tool - two-click placement
      if (selectedTool === "repeat") {
        if (!onRepeatMarkersChange) return;

        // Calculate beat position to determine measure
        const beatInSystem = (x - LEFT_MARGIN) / sysLayout.beatWidth;
        const measureContainingClick = Math.floor(
          beatInSystem / defaultLayout.beatsPerMeasure,
        );
        const clampedMeasure = Math.max(
          0,
          Math.min(measuresPerSystem - 1, measureContainingClick),
        );

        if (!repeatStart) {
          // First click - set start position
          setRepeatStart({ system, measure: clampedMeasure });
        } else {
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
            // Check for overlap with existing markers
            const hasOverlap = repeatMarkers.some((m) => {
              const markerAbsoluteMeasure =
                m.system * measuresPerSystem + m.measure;
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
              const newMarkers = [
                ...repeatMarkers,
                {
                  id: `start-${Date.now()}`,
                  pairId,
                  type: "start" as const,
                  measure: startMeasure,
                  system: startSystem,
                },
                {
                  id: `end-${Date.now() + 1}`,
                  pairId,
                  type: "end" as const,
                  measure: endMeasure,
                  system: endSystem,
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
        }
        return;
      }

      // Handle lyrics tool - click to add/edit lyrics
      if (selectedTool === "lyrics") {
        if (!onLyricsChange) return;

        const staffCenterY = getStaffCenterY(system);
        const lyricsZoneTop = staffCenterY + LINE_SPACING + 40;
        const lyricsZoneBottom = staffCenterY + LINE_SPACING + 70;

        // Check if click is in the lyrics area
        if (y >= lyricsZoneTop && y <= lyricsZoneBottom) {
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
      defaultLayout.beatsPerMeasure,
      measuresPerSystem,
      repeatStart,
      repeatMarkers,
      onRepeatMarkersChange,
      lyrics,
      onLyricsChange,
      getStaffCenterY,
      notes,
      allowChords,
      onNotesChange,
      onDuplicateNote,
      playNoteSound,
      staffLines,
    ],
  );

  // Calculate total beats per system for navigation
  const beatsPerSystem = useMemo(() => {
    return defaultLayout.beatsPerMeasure * measuresPerSystem;
  }, [defaultLayout.beatsPerMeasure, measuresPerSystem]);

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
    const x =
      LEFT_MARGIN +
      getNoteOffset(sysLayout.beatWidth) +
      beatInSystem * sysLayout.beatWidth;
    const staffCenterY = getStaffCenterY(targetSystem);
    const y = staffCenterY + LINE_SPACING + 55;

    const svgRect = svgRef.current.getBoundingClientRect();
    return {
      x: svgRect.left + x,
      y: svgRect.top + y,
    };
  }, [editingLyric, systemLayouts, svgRef, getStaffCenterY]);

  return (
    <div className="flex flex-col gap-2 relative">
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
            onTimeSignatureClick={onTimeSignatureClick}
          />
        ))}

        {/* Duration extensions (render behind notes) */}
        {notes.map((note) => (
          <DurationExtension
            key={`duration-${note.id}`}
            note={note}
            systemLayouts={systemLayouts}
          />
        ))}

        {/* Render notes */}
        {notes.map((note) => (
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
            allowMove={allowMove}
            readOnly={readOnly}
            onContextMenu={handleNoteContextMenu}
            onMouseDown={handleNoteMouseDown}
          />
        ))}

        {/* Render beam groups (connected eighth/sixteenth notes) */}
        {beamGroups.map((group, index) => (
          <BeamGroupElement
            key={`beam-${index}`}
            group={group}
            groupIndex={index}
            systemLayouts={systemLayouts}
          />
        ))}

        {/* Lyrics */}
        <LyricsLayer
          lyrics={lyrics}
          systemLayouts={systemLayouts}
          systemCount={systemCount}
        />

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
              onSave={handleSaveLyric}
              onCancel={() => setEditingLyric(null)}
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
    </div>
  );
}

// Re-export types
export type { EditorNote, BeamGroup, NoteEditorProps };
