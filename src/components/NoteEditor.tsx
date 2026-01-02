"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { Pitch } from "@/lib/types";
import { getNoteColor, MIDI_NOTES } from "@/lib/constants";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";

// Time signature type
export type TimeSignature = "4/4" | "3/4" | "6/8" | "2/4";

// Time signature configuration
const TIME_SIG_CONFIG: Record<
  TimeSignature,
  {
    beatsPerMeasure: number;
    beamGroups: number[];
    measuresPerSystem: number;
    shadeGroups: number[]; // How to group beats for shading
  }
> = {
  "4/4": {
    beatsPerMeasure: 4,
    beamGroups: [2, 2],
    measuresPerSystem: 2,
    shadeGroups: [1, 1, 1, 1, 1, 1, 1, 1], // Alternate each beat
  },
  "3/4": {
    beatsPerMeasure: 3,
    beamGroups: [1, 1, 1],
    measuresPerSystem: 2,
    shadeGroups: [1, 1, 1, 1, 1, 1], // 6 beats total
  },
  "6/8": {
    beatsPerMeasure: 6,
    beamGroups: [3, 3],
    measuresPerSystem: 2,
    shadeGroups: [3, 3, 3, 3], // Group in 3s (compound meter feel)
  },
  "2/4": {
    beatsPerMeasure: 2,
    beamGroups: [1, 1],
    measuresPerSystem: 2,
    shadeGroups: [1, 1, 1, 1], // 4 beats total
  },
};

// Helper to get layout values based on time signature
function getLayoutConfig(timeSignature: TimeSignature) {
  const config = TIME_SIG_CONFIG[timeSignature];
  const beatsPerSystem = config.beatsPerMeasure * config.measuresPerSystem;
  const staffRight = LEFT_MARGIN + beatsPerSystem * BEAT_WIDTH;
  const svgWidth = staffRight + 60;
  return {
    ...config,
    beatsPerSystem,
    staffRight,
    svgWidth,
  };
}

// Editor-specific note type
export interface EditorNote {
  id: string;
  pitch: Pitch;
  duration: number; // 0.5, 1, 2, or 4 beats
  beat: number; // Position within system (0, 0.5, 1, 1.5, etc.)
  system: number; // Which system/row (0-indexed)
}

// Beam group for rendering connected eighth notes
interface BeamGroup {
  notes: EditorNote[];
  stemDirection: "up" | "down";
}

// Repeat sign marker - supports cross-system repeats
export interface RepeatMarker {
  id: string;
  pairId: string; // Links start and end markers together
  type: "start" | "end";
  measure: number; // Measure number (0, 1, 2 for measures per system)
  system: number;
}

export type NoteTool =
  | "eighth"
  | "quarter"
  | "dotted-quarter"
  | "half"
  | "whole"
  | "delete"
  | "repeat"
  | null;

interface NoteEditorProps {
  notes: EditorNote[];
  onNotesChange: (notes: EditorNote[]) => void;
  repeatMarkers: RepeatMarker[];
  onRepeatMarkersChange: (markers: RepeatMarker[]) => void;
  selectedTool: NoteTool;
  showLabels?: boolean;
  showKidFaces?: boolean;
  showGrid?: boolean;
  playheadX?: number | null;
  playheadSystem?: number;
  activeNoteId?: string | null;
  systemCount: number;
  onSystemCountChange: (count: number) => void;
  onDuplicateNote?: () => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  timeSignature?: TimeSignature;
  onStaffClick?: (x: number, system: number) => void;
}

// Constants - adjusted for better fit
const SYSTEM_HEIGHT = 180;
const SYSTEM_TOP_MARGIN = 60;
const STAFF_CENTER_OFFSET = 80;
const LINE_SPACING = 32;
const BEAT_WIDTH = 60; // Slightly wider for cleaner look
const LEFT_MARGIN = 100;
const NOTE_OFFSET = 15; // Center notes within beat columns (60px width, 2 eighths = 30px each)
const STAFF_LEFT = 40;
// Note: STAFF_RIGHT, BEATS_PER_SYSTEM, MEASURES_PER_SYSTEM, SVG_WIDTH are now dynamic
// based on time signature - use getLayoutConfig(timeSignature)

// Pitch positions (sharps included for type completeness, positioned between naturals)
const PITCH_POSITIONS: Record<Pitch, number> = {
  C4: 0,
  "C#4": 0.5,
  D4: 1,
  "D#4": 1.5,
  E4: 2,
  F4: 3,
  "F#4": 3.5,
  G4: 4,
  "G#4": 4.5,
  A4: 5,
  "A#4": 5.5,
  B4: 6,
  C5: 7,
  REST: -1,
};

const POSITION_TO_PITCH: Pitch[] = [
  "C4",
  "D4",
  "E4",
  "F4",
  "G4",
  "A4",
  "B4",
  "C5",
];

function getStaffCenterY(system: number): number {
  return SYSTEM_TOP_MARGIN + system * SYSTEM_HEIGHT + STAFF_CENTER_OFFSET;
}

function getSystemFromY(y: number, systemCount: number): number {
  const system = Math.floor((y - SYSTEM_TOP_MARGIN) / SYSTEM_HEIGHT);
  return Math.max(0, Math.min(systemCount - 1, system));
}

function getPitchFromY(y: number, system: number): Pitch {
  const staffCenterY = getStaffCenterY(system);
  const bottomLineY = staffCenterY + LINE_SPACING;
  const position = Math.round((bottomLineY - y) / (LINE_SPACING / 2)) + 2;
  const clamped = Math.max(0, Math.min(7, position));
  return POSITION_TO_PITCH[clamped];
}

function getYFromPitch(pitch: Pitch, system: number): number {
  const pos = PITCH_POSITIONS[pitch];
  const staffCenterY = getStaffCenterY(system);
  if (pos < 0) return staffCenterY;
  // Round position to handle sharps (which have fractional positions like 0.5)
  // This ensures they render at valid staff positions
  const roundedPos = Math.round(pos);
  const bottomLineY = staffCenterY + LINE_SPACING;
  return bottomLineY - (roundedPos - 2) * (LINE_SPACING / 2);
}

// Convert beat position to X coordinate (for rendering)
function getXFromBeat(beat: number): number {
  return LEFT_MARGIN + beat * BEAT_WIDTH + NOTE_OFFSET;
}

// Convert X coordinate to beat position (for placement)
function getBeatFromX(x: number): number {
  const rawBeat = (x - LEFT_MARGIN - NOTE_OFFSET) / BEAT_WIDTH;
  return Math.round(rawBeat * 2) / 2; // Snap to half-beats
}

function snapX(x: number, staffRight: number): number {
  // Snap to half-beat positions, offset from bar lines
  const xWithoutOffset = x - NOTE_OFFSET;
  const snapped =
    Math.round((xWithoutOffset - LEFT_MARGIN) / (BEAT_WIDTH / 2)) *
      (BEAT_WIDTH / 2) +
    LEFT_MARGIN +
    NOTE_OFFSET;
  // Clamp to valid range (notes are offset so they don't overlap bar lines)
  return Math.max(
    LEFT_MARGIN + NOTE_OFFSET,
    Math.min(staffRight - 20, snapped),
  );
}

// Get measure from X position
function getMeasureFromX(x: number, beatsPerMeasure: number): number {
  const beatsFromLeft = (x - LEFT_MARGIN) / BEAT_WIDTH;
  return Math.floor(beatsFromLeft / beatsPerMeasure);
}

function getDurationFromTool(tool: NoteTool): number {
  switch (tool) {
    case "eighth":
      return 0.5;
    case "quarter":
      return 1;
    case "dotted-quarter":
      return 1.5;
    case "half":
      return 2;
    case "whole":
      return 4;
    default:
      return 1;
  }
}

// Function to group eighth notes for beaming
function groupEighthNotes(
  allNotes: EditorNote[],
  timeSignature: TimeSignature,
): BeamGroup[] {
  const config = TIME_SIG_CONFIG[timeSignature];
  const eighthNotes = allNotes.filter((n) => n.duration === 0.5);

  // Sort all notes by system, then by beat position (for checking notes in between)
  const allSorted = [...allNotes].sort((a, b) => {
    if (a.system !== b.system) return a.system - b.system;
    return a.beat - b.beat;
  });

  // Sort eighth notes by system, then by beat position
  const sorted = [...eighthNotes].sort((a, b) => {
    if (a.system !== b.system) return a.system - b.system;
    return a.beat - b.beat;
  });

  // Helper to check if there's any note between two notes
  const hasNoteBetween = (note1: EditorNote, note2: EditorNote): boolean => {
    if (note1.system !== note2.system) return true; // Different systems = don't beam
    const minBeat = Math.min(note1.beat, note2.beat);
    const maxBeat = Math.max(note1.beat, note2.beat);
    return allSorted.some(
      (n) =>
        n.system === note1.system &&
        n.beat > minBeat + 0.1 &&
        n.beat < maxBeat - 0.1 &&
        n.id !== note1.id &&
        n.id !== note2.id,
    );
  };

  const groups: BeamGroup[] = [];
  let currentGroup: EditorNote[] = [];
  let currentBeatGroup = -1;

  for (const note of sorted) {
    // Calculate which beat group this note belongs to
    const measureBeat = note.beat % config.beatsPerMeasure;

    // Find which beam group this beat belongs to
    let beatGroup = 0;
    let beatCount = 0;
    for (let i = 0; i < config.beamGroups.length; i++) {
      beatCount += config.beamGroups[i];
      if (measureBeat < beatCount) {
        beatGroup = i;
        break;
      }
    }

    // Calculate absolute beat group (including system and measure)
    const measure = Math.floor(note.beat / config.beatsPerMeasure);
    const absoluteBeatGroup = note.system * 1000 + measure * 100 + beatGroup;

    // Check if this note should join the current group
    if (currentGroup.length === 0) {
      currentGroup.push(note);
      currentBeatGroup = absoluteBeatGroup;
    } else if (absoluteBeatGroup === currentBeatGroup) {
      // Same beat group - check if consecutive AND no notes in between
      const lastNote = currentGroup[currentGroup.length - 1];
      const beatDiff = note.beat - lastNote.beat;
      // Only beam if adjacent (within 1.5 beats) AND no other notes in between
      if (beatDiff > 0 && beatDiff <= 1.5 && !hasNoteBetween(lastNote, note)) {
        currentGroup.push(note);
      } else {
        // Not consecutive or has notes in between, finish current group
        if (currentGroup.length >= 2) {
          groups.push(createBeamGroup(currentGroup));
        }
        currentGroup = [note];
        currentBeatGroup = absoluteBeatGroup;
      }
    } else {
      // Different beat group, finish current and start new
      if (currentGroup.length >= 2) {
        groups.push(createBeamGroup(currentGroup));
      }
      currentGroup = [note];
      currentBeatGroup = absoluteBeatGroup;
    }
  }

  // Don't forget the last group
  if (currentGroup.length >= 2) {
    groups.push(createBeamGroup(currentGroup));
  }

  return groups;
}

// Helper to create a beam group with calculated stem direction
function createBeamGroup(notes: EditorNote[]): BeamGroup {
  // Find the note furthest from the staff center to determine stem direction
  let maxDistance = 0;
  let stemDirection: "up" | "down" = "up";

  for (const note of notes) {
    const staffCenterY = getStaffCenterY(note.system);
    const noteY = getYFromPitch(note.pitch, note.system);
    const distance = Math.abs(noteY - staffCenterY);
    if (distance > maxDistance) {
      maxDistance = distance;
      // If the furthest note is above center, stems go down; otherwise up
      stemDirection = noteY < staffCenterY ? "down" : "up";
    }
  }

  return { notes, stemDirection };
}

export function NoteEditor({
  notes,
  onNotesChange,
  repeatMarkers,
  onRepeatMarkersChange,
  selectedTool,
  showLabels = true,
  showKidFaces = false,
  showGrid = false,
  playheadX = null,
  playheadSystem = 0,
  activeNoteId = null,
  systemCount,
  onSystemCountChange,
  onDuplicateNote,
  svgRef: externalSvgRef,
  timeSignature = "4/4",
  onStaffClick,
}: NoteEditorProps) {
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalSvgRef || internalSvgRef;

  // Get dynamic layout based on time signature
  const layout = useMemo(() => getLayoutConfig(timeSignature), [timeSignature]);
  const {
    beatsPerSystem,
    beatsPerMeasure,
    staffRight,
    svgWidth,
    measuresPerSystem,
    shadeGroups,
  } = layout;

  // Group eighth notes for beaming
  const beamGroups = useMemo(
    () => groupEighthNotes(notes, timeSignature),
    [notes, timeSignature],
  );

  // Get set of note IDs that are part of beam groups (for skipping individual flags)
  const beamedNoteIds = useMemo(() => {
    const ids = new Set<string>();
    for (const group of beamGroups) {
      for (const note of group.notes) {
        ids.add(note.id);
      }
    }
    return ids;
  }, [beamGroups]);
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [draggedMarker, setDraggedMarker] = useState<{
    id: string;
    type: "start" | "end";
    system: number;
    originalMeasure: number;
  } | null>(null);
  const [repeatStart, setRepeatStart] = useState<{
    system: number;
    measure: number;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    noteId: string;
    x: number;
    y: number;
  } | null>(null);
  const justDraggedRef = useRef(false);

  const svgHeight = SYSTEM_TOP_MARGIN + systemCount * SYSTEM_HEIGHT + 40;

  const getCoords = useCallback(
    (e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [],
  );

  const playNoteSound = useCallback((pitch: Pitch) => {
    const midi = MIDI_NOTES[pitch];
    if (midi > 0) {
      const player = getAudioPlayer();
      player.playNote(midi, 0.25);
    }
  }, []);

  const handleNoteContextMenu = useCallback(
    (e: React.MouseEvent, noteId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ noteId, x: e.clientX, y: e.clientY });
    },
    [],
  );

  const handleChangeDuration = useCallback(
    (duration: number) => {
      if (!contextMenu) return;
      onNotesChange(
        notes.map((n) =>
          n.id === contextMenu.noteId ? { ...n, duration } : n,
        ),
      );
      setContextMenu(null);
    },
    [contextMenu, notes, onNotesChange],
  );

  const handleDeleteFromMenu = useCallback(() => {
    if (!contextMenu) return;
    onNotesChange(notes.filter((n) => n.id !== contextMenu.noteId));
    setContextMenu(null);
  }, [contextMenu, notes, onNotesChange]);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      // Close context menu on any click
      if (contextMenu) {
        setContextMenu(null);
        return;
      }

      if (draggedNote) return;

      // Skip if we just finished dragging (click fires after mouseup)
      if (justDraggedRef.current) {
        justDraggedRef.current = false;
        return;
      }

      const { x, y } = getCoords(e);
      const system = getSystemFromY(y, systemCount);
      const staffCenterY = getStaffCenterY(system);

      if (x < LEFT_MARGIN - 20 || x > staffRight + 20) return;
      if (y < staffCenterY - LINE_SPACING * 2 - 30) return;
      if (y > staffCenterY + LINE_SPACING * 2 + 30) return;

      // Call onStaffClick for seek functionality
      if (onStaffClick) {
        onStaffClick(x, system);
      }

      // No action when no tool is selected
      if (selectedTool === null) return;

      // Handle repeat tool - allows multiple repeat sections
      if (selectedTool === "repeat") {
        const measure = getMeasureFromX(x, layout.beatsPerMeasure);

        if (!repeatStart) {
          // First click - set start position
          setRepeatStart({ system, measure });
        } else {
          // Second click - set end and create markers
          const startSystem = repeatStart.system;
          const startMeasure = repeatStart.measure;
          const endMeasure = measure;

          // Only create if end is after start on same system
          if (system === startSystem && endMeasure > startMeasure) {
            // Check if this would overlap with existing repeat sections
            const hasOverlap = repeatMarkers.some((m) => {
              if (m.system !== startSystem) return false;
              // Check if the new section overlaps with existing markers
              if (
                m.type === "start" &&
                m.measure >= startMeasure &&
                m.measure < endMeasure
              )
                return true;
              if (
                m.type === "end" &&
                m.measure > startMeasure &&
                m.measure <= endMeasure
              )
                return true;
              return false;
            });

            if (!hasOverlap) {
              // Add new markers without removing existing ones
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
                  system: startSystem,
                },
              ];
              onRepeatMarkersChange(newMarkers);
            }
          }
          setRepeatStart(null);
        }
        return;
      }

      if (selectedTool === "delete") return;

      const pitch = getPitchFromY(y, system);
      const snappedX = snapX(x, staffRight);
      const beat = getBeatFromX(snappedX);

      // Check for collision using beat position
      const existingNote = notes.find(
        (n) => Math.abs(n.beat - beat) < 0.25 && n.system === system,
      );
      if (existingNote) {
        onDuplicateNote?.();
        return;
      }

      const newNote: EditorNote = {
        id: String(Date.now()),
        pitch,
        duration: getDurationFromTool(selectedTool),
        beat,
        system,
      };

      onNotesChange([...notes, newNote]);
      playNoteSound(pitch);
    },
    [
      selectedTool,
      draggedNote,
      getCoords,
      notes,
      onNotesChange,
      playNoteSound,
      systemCount,
      repeatMarkers,
      onRepeatMarkersChange,
      repeatStart,
      contextMenu,
      onStaffClick,
    ],
  );

  const handleNoteMouseDown = useCallback(
    (e: React.MouseEvent, noteId: string) => {
      e.stopPropagation();
      if (selectedTool === "delete") {
        onNotesChange(notes.filter((n) => n.id !== noteId));
        return;
      }
      setDraggedNote(noteId);
    },
    [selectedTool, notes, onNotesChange],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const { x, y } = getCoords(e);

      // Handle marker dragging - allows cross-system repeats
      if (draggedMarker) {
        const system = getSystemFromY(y, systemCount);
        const measure = getMeasureFromX(x, layout.beatsPerMeasure);
        const clampedMeasure = Math.max(
          0,
          Math.min(measuresPerSystem, measure),
        );

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

        // Validate position based on type
        let isValid = true;
        if (pairedMarker) {
          const draggedAbsoluteBeat =
            system * beatsPerSystem + clampedMeasure * layout.beatsPerMeasure;
          const pairedAbsoluteBeat =
            pairedMarker.system * beatsPerSystem +
            pairedMarker.measure * layout.beatsPerMeasure;

          if (
            draggedMarker.type === "start" &&
            draggedAbsoluteBeat >= pairedAbsoluteBeat
          ) {
            isValid = false;
          }
          if (
            draggedMarker.type === "end" &&
            draggedAbsoluteBeat <= pairedAbsoluteBeat
          ) {
            isValid = false;
          }
        }

        if (isValid) {
          onRepeatMarkersChange(
            repeatMarkers.map((m) =>
              m.id === draggedMarker.id
                ? { ...m, system, measure: clampedMeasure }
                : m,
            ),
          );
          // Update tracked system if changed
          if (system !== draggedMarker.system) {
            setDraggedMarker({ ...draggedMarker, system });
          }
        }
        return;
      }

      if (!draggedNote) return;
      const system = getSystemFromY(y, systemCount);
      const pitch = getPitchFromY(y, system);
      const snappedX = snapX(x, staffRight);
      const beat = getBeatFromX(snappedX);

      // Check if another note exists at this position (excluding the dragged note)
      const collision = notes.find(
        (n) =>
          n.id !== draggedNote &&
          Math.abs(n.beat - beat) < 0.25 &&
          n.system === system,
      );
      if (collision) return; // Don't allow moving to occupied position

      onNotesChange(
        notes.map((n) =>
          n.id === draggedNote ? { ...n, beat, pitch, system } : n,
        ),
      );
    },
    [
      draggedNote,
      draggedMarker,
      getCoords,
      notes,
      onNotesChange,
      systemCount,
      repeatMarkers,
      onRepeatMarkersChange,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (draggedNote) {
      const note = notes.find((n) => n.id === draggedNote);
      if (note) playNoteSound(note.pitch);
      setDraggedNote(null);
      // Set flag to prevent click event from firing after drag
      justDraggedRef.current = true;
    }
    if (draggedMarker) {
      setDraggedMarker(null);
      justDraggedRef.current = true;
    }
  }, [draggedNote, draggedMarker, notes, playNoteSound]);

  const getNoteType = (duration: number): string => {
    if (duration >= 4) return "whole";
    if (duration >= 2) return "half";
    if (duration === 1.5) return "dotted-quarter";
    if (duration >= 1) return "quarter";
    return "eighth";
  };

  // Render duration extension bar (semi-transparent line showing note length)
  const renderDurationExtension = (note: EditorNote) => {
    if (note.pitch === "REST") return null;

    const x = getXFromBeat(note.beat);
    const y = getYFromPitch(note.pitch, note.system);
    const color = getNoteColor(note.pitch);

    // Extension shows exact note duration
    // Starts from note center, extends for full duration in beats
    const extensionWidth = note.duration * BEAT_WIDTH;

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

  const renderNote = (note: EditorNote) => {
    // Calculate x and y from beat and pitch at render time
    const x = getXFromBeat(note.beat);
    const y = getYFromPitch(note.pitch, note.system);

    const color = getNoteColor(note.pitch);
    const isSelected = draggedNote === note.id;
    const isActive = activeNoteId === note.id;
    const type = getNoteType(note.duration);
    const staffCenterY = getStaffCenterY(note.system);
    const isBeamed = beamedNoteIds.has(note.id);

    // For beamed notes, use the beam group's stem direction
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
    const isHollow = type === "half" || type === "whole";
    const stemX = stemDir === "up" ? x + 12 : x - 12;
    const stemY1 = y;
    const stemY2 = stemDir === "up" ? y - stemH : y + stemH;

    // Kid-friendly note with face
    if (showKidFaces) {
      const faceRadius = 12;
      return (
        <g
          key={note.id}
          onMouseDown={(e) => handleNoteMouseDown(e, note.id)}
          onContextMenu={(e) => handleNoteContextMenu(e, note.id)}
          style={{ cursor: selectedTool === "delete" ? "not-allowed" : "grab" }}
          className="transition-opacity hover:opacity-80"
        >
          {note.pitch === "C4" && (
            <line
              x1={x - 18}
              y1={y}
              x2={x + 18}
              y2={y}
              stroke="#4a5568"
              strokeWidth={2}
            />
          )}
          {isSelected && <circle cx={x} cy={y - 22} r={4} fill="#3B82F6" />}
          {/* Active glow effect */}
          {isActive && (
            <circle
              cx={x}
              cy={y}
              r={faceRadius + 8}
              fill="none"
              stroke={color}
              strokeWidth={4}
              opacity={0.6}
              className="animate-pulse"
            />
          )}
          {/* Face circle */}
          <circle
            cx={x}
            cy={y}
            r={faceRadius}
            fill={color}
            stroke={isActive ? "#fff" : "#000"}
            strokeWidth={isActive ? 3 : 2}
          />
          {/* Eyes */}
          <circle cx={x - 4} cy={y - 3} r={2.5} fill="#000" />
          <circle cx={x + 4} cy={y - 3} r={2.5} fill="#000" />
          {/* Eye shine */}
          <circle cx={x - 3} cy={y - 4} r={1} fill="#fff" />
          <circle cx={x + 5} cy={y - 4} r={1} fill="#fff" />
          {/* Smile */}
          <path
            d={`M ${x - 5} ${y + 4} Q ${x} ${y + 9} ${x + 5} ${y + 4}`}
            stroke="#000"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          {/* Stem (not for whole notes) */}
          {type !== "whole" && (
            <line
              x1={stemDir === "up" ? x + faceRadius - 2 : x - faceRadius + 2}
              y1={y}
              x2={stemDir === "up" ? x + faceRadius - 2 : x - faceRadius + 2}
              y2={stemDir === "up" ? y - 38 : y + 38}
              stroke="#000"
              strokeWidth={3.5}
            />
          )}
          {/* Note name label */}
          {showLabels && (
            <text
              x={x}
              y={y - faceRadius - 8}
              textAnchor="middle"
              fill={color}
              fontSize={12}
              fontWeight="bold"
              style={{ pointerEvents: "none" }}
            >
              {note.pitch[0]}
            </text>
          )}
        </g>
      );
    }

    // Standard note rendering with SVG ellipse
    // All notes have color outline; filled notes have color fill, hollow have white fill
    const fill = isHollow ? "#ffffff" : color;
    const stroke = color; // Always use color outline
    const strokeWidth = 2.5;

    return (
      <g
        key={note.id}
        onMouseDown={(e) => handleNoteMouseDown(e, note.id)}
        onContextMenu={(e) => handleNoteContextMenu(e, note.id)}
        style={{ cursor: selectedTool === "delete" ? "not-allowed" : "grab" }}
        className="transition-opacity hover:opacity-80"
      >
        {/* Ledger line for C4 */}
        {note.pitch === "C4" && (
          <line
            x1={x - 20}
            y1={y}
            x2={x + 20}
            y2={y}
            stroke="#4a5568"
            strokeWidth={2}
          />
        )}
        {/* Selection indicator */}
        {isSelected && <circle cx={x} cy={y - 28} r={4} fill="#3B82F6" />}
        {/* Active glow effect */}
        {isActive && (
          <ellipse
            cx={x}
            cy={y}
            rx={18}
            ry={15}
            fill="none"
            stroke={color}
            strokeWidth={4}
            opacity={0.6}
            transform={`rotate(-20 ${x} ${y})`}
          />
        )}
        {/* Stem - skip for beamed eighth notes (beam section draws their stems) */}
        {type !== "whole" && !(type === "eighth" && isBeamed) && (
          <line
            x1={stemX}
            y1={stemY1}
            x2={stemX}
            y2={stemY2}
            stroke={color}
            strokeWidth={3}
          />
        )}
        {/* Notehead - sized to span between staff lines */}
        <ellipse
          cx={x}
          cy={y}
          rx={13}
          ry={11}
          fill={fill}
          stroke={isActive ? "#fff" : stroke}
          strokeWidth={isActive ? 2.5 : strokeWidth}
          transform={`rotate(-20 ${x} ${y})`}
        />
        {/* Flag for eighth notes (only if not beamed) */}
        {type === "eighth" && !isBeamed && (
          <path
            d={
              stemDir === "up"
                ? `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 + 10} ${
                    stemX + 10
                  } ${stemY2 + 22}`
                : `M ${stemX} ${stemY2} Q ${stemX + 10} ${stemY2 - 10} ${
                    stemX + 10
                  } ${stemY2 - 22}`
            }
            stroke={color}
            strokeWidth={3.5}
            fill="none"
          />
        )}
        {/* Dot for dotted notes - positioned to the right, in a space (not on a line) */}
        {type === "dotted-quarter" && (
          <circle
            cx={x + 20}
            cy={y - LINE_SPACING / 4} // Offset up slightly to sit in a space
            r={4}
            fill={color}
          />
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
            {note.pitch[0]}
          </text>
        )}
      </g>
    );
  };

  const renderSystem = (systemIndex: number) => {
    const staffCenterY = getStaffCenterY(systemIndex);
    const isFirstSystem = systemIndex === 0;

    // Check for repeat markers on this system (supports multiple sections)
    const systemMarkers = repeatMarkers.filter((m) => m.system === systemIndex);
    const startMarkers = systemMarkers.filter((m) => m.type === "start");
    const endMarkers = systemMarkers.filter((m) => m.type === "end");

    return (
      <g key={`system-${systemIndex}`}>
        {/* Beat shading - based on time signature groupings */}
        {Array.from({ length: beatsPerSystem }, (_, beatIndex) => {
          const beatX = LEFT_MARGIN + beatIndex * BEAT_WIDTH;
          // Calculate which shade group this beat belongs to
          let groupIndex = 0;
          let beatCount = 0;
          for (let i = 0; i < shadeGroups.length; i++) {
            beatCount += shadeGroups[i];
            if (beatIndex < beatCount) {
              groupIndex = i;
              break;
            }
          }
          const isShaded = groupIndex % 2 === 1;
          return (
            <rect
              key={`shade-${systemIndex}-${beatIndex}`}
              x={beatX}
              y={staffCenterY - LINE_SPACING - 20}
              width={BEAT_WIDTH}
              height={LINE_SPACING * 2 + 40}
              fill={isShaded ? "#f8fafc" : "#f1f5f9"}
            />
          );
        })}

        {/* Grid lines showing valid note positions */}
        {showGrid &&
          Array.from({ length: beatsPerSystem * 2 }, (_, i) => {
            const beatPosition = i * 0.5;
            // Grid lines are offset from bar lines, so all positions are valid
            const gridX = LEFT_MARGIN + beatPosition * BEAT_WIDTH + NOTE_OFFSET;
            const isFullBeat = beatPosition % 1 === 0;
            return (
              <line
                key={`grid-${systemIndex}-${i}`}
                x1={gridX}
                y1={staffCenterY - LINE_SPACING - 15}
                x2={gridX}
                y2={staffCenterY + LINE_SPACING + 15}
                stroke="#10b981"
                strokeWidth={isFullBeat ? 1.5 : 1}
                strokeDasharray="4 3"
                opacity={isFullBeat ? 0.8 : 0.5}
              />
            );
          })}

        {/* Staff lines */}
        <line
          x1={STAFF_LEFT}
          y1={staffCenterY - LINE_SPACING}
          x2={staffRight}
          y2={staffCenterY - LINE_SPACING}
          stroke="#4a5568"
          strokeWidth={2}
        />
        <line
          x1={STAFF_LEFT}
          y1={staffCenterY}
          x2={staffRight}
          y2={staffCenterY}
          stroke="#4a5568"
          strokeWidth={2}
        />
        <line
          x1={STAFF_LEFT}
          y1={staffCenterY + LINE_SPACING}
          x2={staffRight}
          y2={staffCenterY + LINE_SPACING}
          stroke="#4a5568"
          strokeWidth={2}
        />

        {/* Bar lines - dynamic based on time signature */}
        {Array.from(
          { length: measuresPerSystem + 1 },
          (_, i) => i * layout.beatsPerMeasure,
        ).map((beat) => {
          const barX = LEFT_MARGIN + beat * BEAT_WIDTH;
          const measureIndex = beat / layout.beatsPerMeasure;
          const isEdge = beat === 0 || beat === beatsPerSystem;

          const startMarker = startMarkers.find(
            (m) => m.measure === measureIndex,
          );
          const endMarker = endMarkers.find((m) => m.measure === measureIndex);
          const isRepeatStart = !!startMarker;
          const isRepeatEnd = !!endMarker;

          return (
            <g key={`bar-${systemIndex}-${beat}`}>
              <line
                x1={barX}
                y1={staffCenterY - LINE_SPACING - 8}
                x2={barX}
                y2={staffCenterY + LINE_SPACING + 8}
                stroke={isEdge ? "#334155" : "#94a3b8"}
                strokeWidth={isEdge ? 4 : 2}
              />
              {isRepeatStart && startMarker && (
                <g
                  style={{ cursor: draggedMarker ? "grabbing" : "grab" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggedMarker({
                      id: startMarker.id,
                      type: "start",
                      system: systemIndex,
                      originalMeasure: startMarker.measure,
                    });
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    // Remove this repeat section by pairId
                    onRepeatMarkersChange(
                      repeatMarkers.filter(
                        (m) => m.pairId !== startMarker.pairId,
                      ),
                    );
                  }}
                >
                  <line
                    x1={barX + 6}
                    y1={staffCenterY - LINE_SPACING - 8}
                    x2={barX + 6}
                    y2={staffCenterY + LINE_SPACING + 8}
                    stroke="#8b5cf6"
                    strokeWidth={3}
                  />
                  <circle
                    cx={barX + 18}
                    cy={staffCenterY - LINE_SPACING / 2}
                    r={5}
                    fill="#8b5cf6"
                    className="hover:fill-red-500 transition-colors"
                  />
                  <circle
                    cx={barX + 18}
                    cy={staffCenterY + LINE_SPACING / 2}
                    r={5}
                    fill="#8b5cf6"
                    className="hover:fill-red-500 transition-colors"
                  />
                </g>
              )}
              {isRepeatEnd && endMarker && (
                <g
                  style={{ cursor: draggedMarker ? "grabbing" : "grab" }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggedMarker({
                      id: endMarker.id,
                      type: "end",
                      system: systemIndex,
                      originalMeasure: endMarker.measure,
                    });
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    // Remove this repeat section by pairId
                    onRepeatMarkersChange(
                      repeatMarkers.filter(
                        (m) => m.pairId !== endMarker.pairId,
                      ),
                    );
                  }}
                >
                  <line
                    x1={barX - 6}
                    y1={staffCenterY - LINE_SPACING - 8}
                    x2={barX - 6}
                    y2={staffCenterY + LINE_SPACING + 8}
                    stroke="#8b5cf6"
                    strokeWidth={3}
                  />
                  <circle
                    cx={barX - 18}
                    cy={staffCenterY - LINE_SPACING / 2}
                    r={5}
                    fill="#8b5cf6"
                    className="hover:fill-red-500 transition-colors"
                  />
                  <circle
                    cx={barX - 18}
                    cy={staffCenterY + LINE_SPACING / 2}
                    r={5}
                    fill="#8b5cf6"
                    className="hover:fill-red-500 transition-colors"
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* Pending repeat start indicator */}
        {repeatStart &&
          repeatStart.system === systemIndex &&
          selectedTool === "repeat" && (
            <rect
              x={
                LEFT_MARGIN +
                repeatStart.measure * layout.beatsPerMeasure * BEAT_WIDTH
              }
              y={staffCenterY - LINE_SPACING - 15}
              width={layout.beatsPerMeasure * BEAT_WIDTH}
              height={LINE_SPACING * 2 + 30}
              fill="#8b5cf6"
              opacity={0.15}
              rx={4}
            />
          )}

        {/* Treble clef */}
        <text
          x={55}
          y={staffCenterY + 15}
          fontSize={50}
          fill="#334155"
          style={{ pointerEvents: "none" }}
        >
          𝄞
        </text>

        {/* Time signature (only on first system) */}
        {isFirstSystem && (
          <>
            <text
              x={85}
              y={staffCenterY - LINE_SPACING / 2 + 6}
              fontSize={20}
              fontWeight="bold"
              textAnchor="middle"
              fill="#334155"
            >
              {timeSignature.split("/")[0]}
            </text>
            <text
              x={85}
              y={staffCenterY + LINE_SPACING / 2 + 6}
              fontSize={20}
              fontWeight="bold"
              textAnchor="middle"
              fill="#334155"
            >
              {timeSignature.split("/")[1]}
            </text>
          </>
        )}

        {/* Beat numbers */}
        {Array.from({ length: beatsPerSystem }, (_, i) => i + 1).map((beat) => (
          <text
            key={`beat-${systemIndex}-${beat}`}
            x={LEFT_MARGIN + (beat - 0.5) * BEAT_WIDTH}
            y={staffCenterY + LINE_SPACING + 35}
            fontSize={11}
            textAnchor="middle"
            fill="#64748b"
          >
            {systemIndex * beatsPerSystem + beat}
          </text>
        ))}

        {/* System number label */}
        <text
          x={18}
          y={staffCenterY + 5}
          fontSize={12}
          fill="#94a3b8"
          fontWeight="bold"
        >
          {systemIndex + 1}
        </text>
      </g>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 justify-end">
        <span className="text-sm text-gray-500">Systems:</span>
        <button
          onClick={() => onSystemCountChange(Math.max(1, systemCount - 1))}
          disabled={systemCount <= 1}
          className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-bold"
        >
          −
        </button>
        <span className="text-sm font-medium w-6 text-center">
          {systemCount}
        </span>
        <button
          onClick={() => onSystemCountChange(systemCount + 1)}
          className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
        >
          +
        </button>
      </div>

      <svg
        ref={svgRef}
        width={svgWidth}
        height={svgHeight}
        onClick={handleClick}
        onContextMenu={(e) => e.preventDefault()}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="bg-white border border-gray-200 rounded-xl shadow-sm select-none"
        style={{
          cursor:
            selectedTool === null
              ? "default"
              : selectedTool === "delete"
                ? "not-allowed"
                : selectedTool === "repeat"
                  ? "pointer"
                  : draggedNote
                    ? "grabbing"
                    : "crosshair",
        }}
      >
        {/* Gradient definitions for multi-colored beams */}
        <defs>
          {beamGroups.map((group, groupIndex) => {
            const colors = group.notes.map((n) => getNoteColor(n.pitch));
            const uniqueColors = [...new Set(colors)];
            if (uniqueColors.length > 1) {
              return (
                <linearGradient
                  key={`beam-gradient-${groupIndex}`}
                  id={`beam-gradient-${groupIndex}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  {group.notes.map((note, i) => (
                    <stop
                      key={note.id}
                      offset={`${(i / (group.notes.length - 1)) * 100}%`}
                      stopColor={getNoteColor(note.pitch)}
                    />
                  ))}
                </linearGradient>
              );
            }
            return null;
          })}
        </defs>

        {Array.from({ length: systemCount }, (_, i) => renderSystem(i))}
        {/* Duration extensions (render behind notes) */}
        {notes.map(renderDurationExtension)}
        {notes.map(renderNote)}

        {/* Render beams for grouped eighth notes */}
        {beamGroups.map((group, groupIndex) => {
          const { notes: groupNotes, stemDirection } = group;
          if (groupNotes.length < 2) return null;

          const stemH = 40;
          const beamThickness = 6;

          // Calculate beam Y position (at the end of stems)
          const stemYs = groupNotes.map((note) => {
            const noteY = getYFromPitch(note.pitch, note.system);
            return stemDirection === "up" ? noteY - stemH : noteY + stemH;
          });

          // Limit beam slope to max one staff space (engraver's rule)
          const MAX_BEAM_SLOPE = LINE_SPACING / 2; // 16px max
          const rawFirstY = stemYs[0];
          const rawLastY = stemYs[stemYs.length - 1];
          const rawSlope = rawLastY - rawFirstY;
          const limitedSlope = Math.max(
            -MAX_BEAM_SLOPE,
            Math.min(MAX_BEAM_SLOPE, rawSlope),
          );

          // Position beam so ALL stems can reach it (anchor at the extremity)
          // For stems up: beam must be at or above all note positions
          // For stems down: beam must be at or below all note positions
          let firstY: number;
          let lastY: number;

          if (stemDirection === "up") {
            // Find the highest stem tip (smallest Y) - beam must be at or above this
            const minStemY = Math.min(...stemYs);
            firstY = minStemY;
            lastY = minStemY + limitedSlope;
          } else {
            // Find the lowest stem tip (largest Y) - beam must be at or below this
            const maxStemY = Math.max(...stemYs);
            firstY = maxStemY;
            lastY = maxStemY + limitedSlope;
          }

          // Get colors
          const colors = groupNotes.map((n) => getNoteColor(n.pitch));
          const uniqueColors = [...new Set(colors)];
          const beamColor =
            uniqueColors.length > 1
              ? `url(#beam-gradient-${groupIndex})`
              : colors[0];

          // Calculate stem X positions
          const stemXs = groupNotes.map((note) => {
            const noteX = getXFromBeat(note.beat);
            return stemDirection === "up" ? noteX + 13 : noteX - 13;
          });

          const firstX = stemXs[0];
          const lastX = stemXs[stemXs.length - 1];

          // Calculate beam Y at each note's X position (linear interpolation)
          const getBeamYAtX = (x: number) => {
            if (firstX === lastX) return firstY;
            const t = (x - firstX) / (lastX - firstX);
            return firstY + t * (lastY - firstY);
          };

          return (
            <g key={`beam-group-${groupIndex}`}>
              {/* Draw stems from each note to the beam */}
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
                    strokeWidth={3}
                  />
                );
              })}
              {/* The beam itself */}
              <polygon
                points={`
                  ${firstX},${firstY}
                  ${lastX},${lastY}
                  ${lastX},${
                    lastY +
                    (stemDirection === "up" ? beamThickness : -beamThickness)
                  }
                  ${firstX},${
                    firstY +
                    (stemDirection === "up" ? beamThickness : -beamThickness)
                  }
                `}
                fill={beamColor}
              />
            </g>
          );
        })}

        {playheadX !== null && (
          <g>
            <line
              x1={playheadX}
              y1={getStaffCenterY(playheadSystem) - LINE_SPACING - 20}
              x2={playheadX}
              y2={getStaffCenterY(playheadSystem) + LINE_SPACING + 20}
              stroke="#10b981"
              strokeWidth={3}
            />
            <polygon
              points={`${playheadX - 6},${
                getStaffCenterY(playheadSystem) - LINE_SPACING - 20
              } ${playheadX + 6},${
                getStaffCenterY(playheadSystem) - LINE_SPACING - 20
              } ${playheadX},${
                getStaffCenterY(playheadSystem) - LINE_SPACING - 12
              }`}
              fill="#10b981"
            />
          </g>
        )}

        {notes.length === 0 && systemCount === 1 && (
          <text
            x={svgWidth / 2}
            y={getStaffCenterY(0)}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={14}
          >
            Click on the staff to add notes
          </text>
        )}
      </svg>

      {/* Context menu for changing note duration */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => handleChangeDuration(0.5)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <span className="text-gray-500">♪</span> Eighth
          </button>
          <button
            onClick={() => handleChangeDuration(1)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <span className="text-gray-500">♩</span> Quarter
          </button>
          <button
            onClick={() => handleChangeDuration(1.5)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <span className="text-gray-500">♩.</span> Dotted
          </button>
          <button
            onClick={() => handleChangeDuration(2)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <span className="text-gray-500">𝅗𝅥</span> Half
          </button>
          <button
            onClick={() => handleChangeDuration(4)}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <span className="text-gray-500">𝅝</span> Whole
          </button>
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={handleDeleteFromMenu}
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
          >
            <span>🗑</span> Delete
          </button>
        </div>
      )}

      {/* Repeat mode indicator */}
      {selectedTool === "repeat" && repeatStart && (
        <div className="text-center text-sm text-purple-600">
          Click another measure to set repeat end point
        </div>
      )}
    </div>
  );
}

// Export constants and helpers for use in page
export { LEFT_MARGIN, BEAT_WIDTH, getLayoutConfig, getBeatFromX };
