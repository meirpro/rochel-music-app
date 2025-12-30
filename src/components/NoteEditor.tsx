"use client";

import { useState, useRef, useCallback } from "react";
import { Pitch } from "@/lib/types";
import { getNoteColor, MIDI_NOTES } from "@/lib/constants";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";

// Editor-specific note type
export interface EditorNote {
  id: string;
  pitch: Pitch;
  duration: number; // 0.5, 1, 2, or 4 beats
  x: number;
  y: number;
  system: number; // Which system/row (0-indexed)
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
  | "half"
  | "whole"
  | "delete"
  | "repeat";

interface NoteEditorProps {
  notes: EditorNote[];
  onNotesChange: (notes: EditorNote[]) => void;
  repeatMarkers: RepeatMarker[];
  onRepeatMarkersChange: (markers: RepeatMarker[]) => void;
  selectedTool: NoteTool;
  showLabels?: boolean;
  showKidFaces?: boolean;
  playheadX?: number | null;
  playheadSystem?: number;
  activeNoteId?: string | null;
  systemCount: number;
  onSystemCountChange: (count: number) => void;
  onDuplicateNote?: () => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

// Constants - adjusted for better fit
const SYSTEM_HEIGHT = 180;
const SYSTEM_TOP_MARGIN = 60;
const STAFF_CENTER_OFFSET = 80;
const LINE_SPACING = 32;
const BEAT_WIDTH = 60; // Slightly wider for cleaner look
const LEFT_MARGIN = 100;
const STAFF_LEFT = 40;
const STAFF_RIGHT = 580; // Fits 8 beats nicely
const BEATS_PER_SYSTEM = 8; // 2 measures of 4/4
const MEASURES_PER_SYSTEM = 2;
const SVG_WIDTH = 640;

// Pitch positions
const PITCH_POSITIONS: Record<Pitch, number> = {
  C4: 0,
  D4: 1,
  E4: 2,
  F4: 3,
  G4: 4,
  A4: 5,
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
  const bottomLineY = staffCenterY + LINE_SPACING;
  return bottomLineY - (pos - 2) * (LINE_SPACING / 2);
}

function snapX(x: number): number {
  const snapped =
    Math.round((x - LEFT_MARGIN) / (BEAT_WIDTH / 2)) * (BEAT_WIDTH / 2) +
    LEFT_MARGIN;
  return Math.max(LEFT_MARGIN, Math.min(STAFF_RIGHT - 20, snapped));
}

// Get measure from X position
function getMeasureFromX(x: number): number {
  const beatsFromLeft = (x - LEFT_MARGIN) / BEAT_WIDTH;
  return Math.floor(beatsFromLeft / 4);
}

function getDurationFromTool(tool: NoteTool): number {
  switch (tool) {
    case "eighth":
      return 0.5;
    case "quarter":
      return 1;
    case "half":
      return 2;
    case "whole":
      return 4;
    default:
      return 1;
  }
}

export function NoteEditor({
  notes,
  onNotesChange,
  repeatMarkers,
  onRepeatMarkersChange,
  selectedTool,
  showLabels = true,
  showKidFaces = false,
  playheadX = null,
  playheadSystem = 0,
  activeNoteId = null,
  systemCount,
  onSystemCountChange,
  onDuplicateNote,
  svgRef: externalSvgRef,
}: NoteEditorProps) {
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const svgRef = externalSvgRef || internalSvgRef;
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

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (draggedNote) return;

      // Skip if we just finished dragging (click fires after mouseup)
      if (justDraggedRef.current) {
        justDraggedRef.current = false;
        return;
      }

      const { x, y } = getCoords(e);
      const system = getSystemFromY(y, systemCount);
      const staffCenterY = getStaffCenterY(system);

      if (x < LEFT_MARGIN - 20 || x > STAFF_RIGHT + 20) return;
      if (y < staffCenterY - LINE_SPACING * 2 - 30) return;
      if (y > staffCenterY + LINE_SPACING * 2 + 30) return;

      // Handle repeat tool - allows multiple repeat sections
      if (selectedTool === "repeat") {
        const measure = getMeasureFromX(x);

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
      const snappedX = snapX(x);
      const snappedY = getYFromPitch(pitch, system);

      const existingNote = notes.find(
        (n) => Math.abs(n.x - snappedX) < 5 && n.system === system,
      );
      if (existingNote) {
        onDuplicateNote?.();
        return;
      }

      const newNote: EditorNote = {
        id: String(Date.now()),
        pitch,
        duration: getDurationFromTool(selectedTool),
        x: snappedX,
        y: snappedY,
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
        const measure = getMeasureFromX(x);
        const clampedMeasure = Math.max(
          0,
          Math.min(MEASURES_PER_SYSTEM, measure),
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
            system * BEATS_PER_SYSTEM + clampedMeasure * 4;
          const pairedAbsoluteBeat =
            pairedMarker.system * BEATS_PER_SYSTEM + pairedMarker.measure * 4;

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
      const snappedX = snapX(x);
      const snappedY = getYFromPitch(pitch, system);

      // Check if another note exists at this position (excluding the dragged note)
      const collision = notes.find(
        (n) =>
          n.id !== draggedNote &&
          Math.abs(n.x - snappedX) < 5 &&
          n.system === system,
      );
      if (collision) return; // Don't allow moving to occupied position

      onNotesChange(
        notes.map((n) =>
          n.id === draggedNote
            ? { ...n, x: snappedX, y: snappedY, pitch, system }
            : n,
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
    if (duration >= 1) return "quarter";
    return "eighth";
  };

  const renderNote = (note: EditorNote) => {
    const color = getNoteColor(note.pitch);
    const isSelected = draggedNote === note.id;
    const isActive = activeNoteId === note.id;
    const type = getNoteType(note.duration);
    const staffCenterY = getStaffCenterY(note.system);
    const stemDir = note.y > staffCenterY ? "up" : "down";
    const isHollow = type === "half" || type === "whole";
    const fill = isHollow ? "#ffffff" : color;
    const stroke = isHollow ? color : "#000";
    const strokeWidth = isHollow ? 3 : 1;
    const stemH = 35;
    const stemX = stemDir === "up" ? note.x + 9 : note.x - 9;
    const stemY1 = note.y;
    const stemY2 = stemDir === "up" ? note.y - stemH : note.y + stemH;

    // Kid-friendly note with face
    if (showKidFaces) {
      const faceRadius = 14;
      return (
        <g
          key={note.id}
          onMouseDown={(e) => handleNoteMouseDown(e, note.id)}
          style={{ cursor: selectedTool === "delete" ? "not-allowed" : "grab" }}
          className="transition-opacity hover:opacity-80"
        >
          {note.pitch === "C4" && (
            <line
              x1={note.x - 18}
              y1={note.y}
              x2={note.x + 18}
              y2={note.y}
              stroke="#4a5568"
              strokeWidth={2}
            />
          )}
          {isSelected && (
            <circle cx={note.x} cy={note.y - 22} r={4} fill="#3B82F6" />
          )}
          {/* Active glow effect */}
          {isActive && (
            <circle
              cx={note.x}
              cy={note.y}
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
            cx={note.x}
            cy={note.y}
            r={faceRadius}
            fill={color}
            stroke={isActive ? "#fff" : "#000"}
            strokeWidth={isActive ? 3 : 2}
          />
          {/* Eyes */}
          <circle cx={note.x - 4} cy={note.y - 3} r={2.5} fill="#000" />
          <circle cx={note.x + 4} cy={note.y - 3} r={2.5} fill="#000" />
          {/* Eye shine */}
          <circle cx={note.x - 3} cy={note.y - 4} r={1} fill="#fff" />
          <circle cx={note.x + 5} cy={note.y - 4} r={1} fill="#fff" />
          {/* Smile */}
          <path
            d={`M ${note.x - 5} ${note.y + 4} Q ${note.x} ${note.y + 9} ${note.x + 5} ${note.y + 4}`}
            stroke="#000"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          {/* Stem (not for whole notes) */}
          {type !== "whole" && (
            <line
              x1={
                stemDir === "up"
                  ? note.x + faceRadius - 2
                  : note.x - faceRadius + 2
              }
              y1={note.y}
              x2={
                stemDir === "up"
                  ? note.x + faceRadius - 2
                  : note.x - faceRadius + 2
              }
              y2={stemDir === "up" ? note.y - 38 : note.y + 38}
              stroke="#000"
              strokeWidth={3}
            />
          )}
          {/* Note name label */}
          {showLabels && (
            <text
              x={note.x}
              y={note.y - faceRadius - 8}
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

    // Standard note rendering
    return (
      <g
        key={note.id}
        onMouseDown={(e) => handleNoteMouseDown(e, note.id)}
        style={{ cursor: selectedTool === "delete" ? "not-allowed" : "grab" }}
        className="transition-opacity hover:opacity-80"
      >
        {note.pitch === "C4" && (
          <line
            x1={note.x - 14}
            y1={note.y}
            x2={note.x + 14}
            y2={note.y}
            stroke="#4a5568"
            strokeWidth={2}
          />
        )}
        {isSelected && (
          <circle cx={note.x} cy={note.y - 25} r={4} fill="#3B82F6" />
        )}
        {/* Active glow effect */}
        {isActive && (
          <ellipse
            cx={note.x}
            cy={note.y}
            rx={16}
            ry={14}
            fill="none"
            stroke={color}
            strokeWidth={4}
            opacity={0.6}
            transform={`rotate(-15 ${note.x} ${note.y})`}
          />
        )}
        <ellipse
          cx={note.x}
          cy={note.y}
          rx={10}
          ry={8}
          fill={fill}
          stroke={isActive ? "#fff" : stroke}
          strokeWidth={isActive ? 3 : strokeWidth}
          transform={`rotate(-15 ${note.x} ${note.y})`}
        />
        {type !== "whole" && (
          <line
            x1={stemX}
            y1={stemY1}
            x2={stemX}
            y2={stemY2}
            stroke={color}
            strokeWidth={3}
          />
        )}
        {type === "eighth" && (
          <path
            d={
              stemDir === "up"
                ? `M ${stemX} ${stemY2} Q ${stemX + 9} ${stemY2 + 10} ${stemX + 9} ${stemY2 + 20}`
                : `M ${stemX} ${stemY2} Q ${stemX - 9} ${stemY2 - 10} ${stemX - 9} ${stemY2 - 20}`
            }
            stroke={color}
            strokeWidth={3}
            fill="none"
          />
        )}
        {showLabels && (
          <text
            x={note.x}
            y={note.y + 4}
            textAnchor="middle"
            fill={isHollow ? color : "#1a1a1a"}
            fontSize={11}
            fontWeight="bold"
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
        {/* Beat shading - alternating gray */}
        {Array.from({ length: BEATS_PER_SYSTEM }, (_, beatIndex) => {
          const beatX = LEFT_MARGIN + beatIndex * BEAT_WIDTH;
          const isOdd = beatIndex % 2 === 1;
          return (
            <rect
              key={`shade-${systemIndex}-${beatIndex}`}
              x={beatX}
              y={staffCenterY - LINE_SPACING - 20}
              width={BEAT_WIDTH}
              height={LINE_SPACING * 2 + 40}
              fill={isOdd ? "#f8fafc" : "#f1f5f9"}
            />
          );
        })}

        {/* Staff lines */}
        <line
          x1={STAFF_LEFT}
          y1={staffCenterY - LINE_SPACING}
          x2={STAFF_RIGHT}
          y2={staffCenterY - LINE_SPACING}
          stroke="#4a5568"
          strokeWidth={2}
        />
        <line
          x1={STAFF_LEFT}
          y1={staffCenterY}
          x2={STAFF_RIGHT}
          y2={staffCenterY}
          stroke="#4a5568"
          strokeWidth={2}
        />
        <line
          x1={STAFF_LEFT}
          y1={staffCenterY + LINE_SPACING}
          x2={STAFF_RIGHT}
          y2={staffCenterY + LINE_SPACING}
          stroke="#4a5568"
          strokeWidth={2}
        />

        {/* Bar lines - at measures 0, 1, 2 (beginning, middle, end) */}
        {[0, 4, 8].map((beat) => {
          const barX = LEFT_MARGIN + beat * BEAT_WIDTH;
          const measureIndex = beat / 4;
          const isEdge = beat === 0 || beat === 8;

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
              x={LEFT_MARGIN + repeatStart.measure * 4 * BEAT_WIDTH}
              y={staffCenterY - LINE_SPACING - 15}
              width={4 * BEAT_WIDTH}
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
              4
            </text>
            <text
              x={85}
              y={staffCenterY + LINE_SPACING / 2 + 6}
              fontSize={20}
              fontWeight="bold"
              textAnchor="middle"
              fill="#334155"
            >
              4
            </text>
          </>
        )}

        {/* Beat numbers */}
        {Array.from({ length: BEATS_PER_SYSTEM }, (_, i) => i + 1).map(
          (beat) => (
            <text
              key={`beat-${systemIndex}-${beat}`}
              x={LEFT_MARGIN + (beat - 0.5) * BEAT_WIDTH}
              y={staffCenterY + LINE_SPACING + 35}
              fontSize={11}
              textAnchor="middle"
              fill="#64748b"
            >
              {systemIndex * BEATS_PER_SYSTEM + beat}
            </text>
          ),
        )}

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
        width={SVG_WIDTH}
        height={svgHeight}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="bg-white border border-gray-200 rounded-xl shadow-sm select-none"
        style={{
          cursor:
            selectedTool === "delete"
              ? "not-allowed"
              : selectedTool === "repeat"
                ? "pointer"
                : draggedNote
                  ? "grabbing"
                  : "crosshair",
        }}
      >
        {Array.from({ length: systemCount }, (_, i) => renderSystem(i))}
        {notes.map(renderNote)}

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
              points={`${playheadX - 6},${getStaffCenterY(playheadSystem) - LINE_SPACING - 20} ${playheadX + 6},${getStaffCenterY(playheadSystem) - LINE_SPACING - 20} ${playheadX},${getStaffCenterY(playheadSystem) - LINE_SPACING - 12}`}
              fill="#10b981"
            />
          </g>
        )}

        {notes.length === 0 && systemCount === 1 && (
          <text
            x={SVG_WIDTH / 2}
            y={getStaffCenterY(0)}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={14}
          >
            Click on the staff to add notes
          </text>
        )}
      </svg>

      {/* Repeat mode indicator */}
      {selectedTool === "repeat" && repeatStart && (
        <div className="text-center text-sm text-purple-600">
          Click another measure to set repeat end point
        </div>
      )}
    </div>
  );
}

// Export constants for use in page
export { LEFT_MARGIN, BEAT_WIDTH, BEATS_PER_SYSTEM };
