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
  getBeatFromXInSystem,
  getSystemForAbsoluteBeat,
} from "./utils/systemLayout";
import { getPitchFromY, getSystemFromY } from "./utils/pitchUtils";
import { snapX } from "./utils/beatUtils";
import { getDurationFromTool } from "./utils/durationUtils";
import { groupEighthNotes } from "./utils/beamingUtils";

// Import types
import { EditorNote, BeamGroup, NoteEditorProps } from "./types";

// Import subcomponents
import { MenuNoteIcon } from "./components/MenuNoteIcon";
import { StaffSystem } from "./components/StaffSystem";
import {
  NoteElement,
  DurationExtension,
  BeamGroupElement,
} from "./components/NoteElement";

// Import hooks
import { useContextMenu } from "./hooks/useContextMenu";

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
