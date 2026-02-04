// src/components/NoteEditorRefactored/components/NoteElement.tsx
// Renders notes and beam groups for the NoteEditor
//
// This file contains three main components:
// 1. DurationExtension - Semi-transparent bar showing note duration
// 2. NoteElement - Single note with stem, flag, ledger lines
// 3. BeamGroupElement - Group of connected eighth/sixteenth notes
//
// Usage:
// - Use NoteElement for individual notes (handles its own stem/flag if not beamed)
// - Use BeamGroupElement for grouped eighth/sixteenth notes (draws shared beam)
// - Beamed notes skip their own stem (BeamGroupElement draws stems to the beam)
//
// ─────────────────────────────────────────────────────────────────────────────
// SUPPORTED FEATURES:
// ─────────────────────────────────────────────────────────────────────────────
//
// Durations:
//   Duration | Value | Note Type      | Visual
//   ---------|-------|----------------|----------------------------------
//   Whole    | 4     | hollow, no stem| ○
//   Dotted ½ | 3     | hollow + dot   | 𝅗𝅥.
//   Half     | 2     | hollow + stem  | 𝅗𝅥
//   Dotted ¼ | 1.5   | filled + dot   | ♩.
//   Quarter  | 1     | filled + stem  | ♩
//   Dotted ⅛ | 0.75  | filled + flag  | ♪. (or beamed)
//   Eighth   | 0.5   | filled + flag  | ♪  (or beamed)
//   16th     | 0.25  | filled + 2flag | ♬  (or beamed with 2 beams)
//
// Accidentals (shown in note label when showLabels=true):
//   Pitch  | Label displayed
//   -------|----------------
//   C4     | C
//   F#4    | F♯
//   Bb4    | B♭
//   G#5    | G♯
//
//   Note: Accidentals are also indicated by note COLOR - each pitch has a
//   unique color making sharps/flats visually distinct without needing to
//   read traditional notation.
//
// ─────────────────────────────────────────────────────────────────────────────
// NOT YET IMPLEMENTED:
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. Kid-friendly face mode (showKidFaces prop)
//    The original NoteEditor has a mode that renders notes as friendly circles
//    with eyes and smiles instead of traditional note heads. This makes the
//    app more approachable for young children. The prop is defined in types.ts
//    but not yet implemented here. When adding this, consider:
//    - Circular note head with face features (eyes, smile)
//    - Stem attached to side of circle
//    - May want to redesign the face style before implementing
//
// 2. REST symbols
//    The app currently doesn't teach rests, so REST pitch values are skipped
//    during rendering. If rests are added to the curriculum later, we'll need
//    to render proper rest symbols:
//    - Whole rest (hangs from line 4)
//    - Half rest (sits on line 3)
//    - Quarter rest (squiggly symbol)
//    - Eighth rest (flag with dot)
//    - Sixteenth rest (two flags with dot)
//    REST notes currently just create empty space in the music.
//
// 3. Traditional accidental symbols (♯ ♭ ♮) before note heads
//    In standard sheet music, accidentals appear as symbols BEFORE the note
//    head, not inside it. Currently we use color-coding and labels instead.
//    If we want to support traditional notation display, we'd need to:
//    - Render ♯ symbol to the left of sharps (F#, C#, G#, etc.)
//    - Render ♭ symbol to the left of flats (Bb, Eb, Ab, etc.)
//    - Handle spacing so accidentals don't overlap with previous notes
//    - Consider key signatures (which would affect which accidentals show)
//
// 4. Ties (curved lines connecting same-pitch notes)
//    Ties connect two notes of the same pitch, combining their durations.
//    For example, a tied quarter + eighth = 1.5 beats played as one note.
//    Implementation would require:
//    - Detecting consecutive same-pitch notes marked as tied
//    - Drawing a curved arc between the note heads
//    - Playback logic to sustain rather than re-attack the second note
//    - UI for users to add/remove ties between notes
//
// 5. 32nd notes (and shorter)
//    Currently the shortest supported duration is sixteenth (0.25 beats).
//    32nd notes would be 0.125 beats and require:
//    - Third flag on standalone notes
//    - Third beam line for beamed groups
//    - Very narrow beat spacing to fit more notes
//    64th notes (0.0625) would need four flags/beams, etc.
//
// ─────────────────────────────────────────────────────────────────────────────

import React from "react";
import { getNoteColor } from "@/lib/constants";
import {
  LINE_SPACING,
  getNoteOffset,
  getStaffCenterY,
} from "@/lib/layoutUtils";
import {
  getLayoutForSystem,
  getBeatXInSystem,
  SystemLayout,
} from "../utils/systemLayout";
import { getYFromPitch } from "../utils/pitchUtils";
import { getNoteLabel } from "../utils/durationUtils";
import { RenderedNote, BeamGroup, NoteTool } from "../types";

// ============================================================================
// REST SYMBOL COMPONENTS
// ============================================================================
// Rest symbols adapted from Wikimedia Commons (Public Domain)
// Source: https://commons.wikimedia.org/wiki/File:Music_rests.svg
//
// All rests are centered vertically at the provided y coordinate (staff center)

/**
 * Render a whole rest (4 beats) - rectangle hanging below a line
 * Centered at staff center, hangs down from the center point
 */
function WholeRestSymbol({ x, y }: { x: number; y: number }) {
  const width = 18;
  const height = 8;
  // Center vertically: top edge at y - 4, bottom at y + 4
  return (
    <rect
      x={x - width / 2}
      y={y - height / 2 - 4}
      width={width}
      height={height}
      fill="#374151"
      rx={1}
    />
  );
}

/**
 * Render a half rest (2 beats) - rectangle sitting on a line
 * Centered at staff center, sits up from the center point
 */
function HalfRestSymbol({ x, y }: { x: number; y: number }) {
  const width = 18;
  const height = 8;
  // Center vertically: top edge at y - 4, bottom at y + 4
  return (
    <rect
      x={x - width / 2}
      y={y - height / 2 + 4}
      width={width}
      height={height}
      fill="#374151"
      rx={1}
    />
  );
}

/**
 * Render a quarter rest (1 beat) - authentic crotchet rest shape
 * Based on Wikimedia Commons Music_rests.svg
 */
function QuarterRestSymbol({ x, y }: { x: number; y: number }) {
  // The path is ~17 units tall at scale 1. We want it ~50 units tall (1.5 LINE_SPACING)
  const scale = 2.8;
  // Path bounds: X from ~9 to ~18 (center ~13.5), Y from 0 to ~17 (center ~8.5)
  // The path starts at M14 0, so the center is around x=13.5
  const pathCenterX = 13.5 * scale;
  const pathCenterY = 8.5 * scale;

  return (
    <path
      d="M14 0c-.15.06-.24.28-.17.43l.46.57c.5.56.59.7.7.96.44.9.2 2.04-.57 2.76-.07.09-.35.32-.62.52-.76.66-1.11.97-1.24 1.36-.05.09-.05.17-.05.3-.02.3 0 .33.9 1.38 1.22 1.46 2.1 2.5 2.16 2.56l.06.06-.08-.04c-1.2-.5-2.56-.74-3.02-.52a.52.52 0 0 0-.31.3c-.18.38-.13.92.13 1.73.24.72.72 1.69 1.2 2.41.2.31.57.79.61.81.07.06.16.04.22 0 .06-.09.06-.16-.06-.3-.46-.66-.68-2.02-.42-2.74.11-.33.24-.5.48-.61.64-.28 2.04.07 2.63.65.04.05.13.14.18.16.15.06.37-.02.44-.18.09-.15.04-.26-.16-.5-.37-.44-1.48-1.75-1.64-1.95-.4-.46-.57-.9-.61-1.44-.02-.7.26-1.44.79-1.93.06-.09.35-.33.61-.52.81-.68 1.14-1.05 1.27-1.4.09-.29.05-.55-.15-.79-.07-.06-.83-1-1.73-2.08-1.23-1.44-1.67-1.97-1.73-1.99a.45.45 0 0 0-.29.02"
      fill="#374151"
      transform={`translate(${x - pathCenterX}, ${y - pathCenterY}) scale(${scale})`}
    />
  );
}

/**
 * Render an eighth rest (0.5 beats) - authentic quaver rest shape
 * Based on Wikimedia Commons Music_rests.svg
 */
function EighthRestSymbol({ x, y }: { x: number; y: number }) {
  // The path is ~10 units tall at scale 1. We want it ~36 units tall (~1 LINE_SPACING)
  const scale = 2.4;
  // Path bounds: roughly 8 wide x 10 tall, center at ~15, 5
  const pathCenterX = 15 * scale;
  const pathCenterY = 5 * scale;

  return (
    <path
      d="M14.5 0c-.57.11-1 .5-1.2 1.04-.04.17-.04.22-.04.46 0 .33.02.5.17.76.22.44.68.79 1.2.92.55.15 1.47.02 2.52-.33l.26-.09-1.29 3.57-1.27 3.56s.04.02.11.07c.13.08.35.15.5.15.26 0 .59-.15.64-.28 0-.04.61-2.12 1.36-4.6l1.31-4.53-.04-.06c-.11-.13-.33-.18-.46-.07-.04.04-.11.13-.15.2-.2.33-.7.92-.96 1.14-.24.2-.37.22-.59.13-.2-.11-.26-.22-.4-.81-.13-.59-.28-.85-.61-1.07a1.34 1.34 0 0 0-1.05-.17"
      fill="#374151"
      transform={`translate(${x - pathCenterX}, ${y - pathCenterY}) scale(${scale})`}
    />
  );
}

/**
 * RestElement - Renders a rest symbol based on duration
 */
export function RestElement({
  note,
  systemLayouts,
  staffLines,
  activeNoteId,
  hoveredNote,
  allowMove,
  readOnly,
  selectedTool,
  onContextMenu,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: Omit<
  NoteElementProps,
  "beamGroups" | "beamedNoteIds" | "showLabels" | "draggedNote"
>) {
  if (note.pitch !== "REST") return null;

  const sysLayout = getLayoutForSystem(systemLayouts, note.system);
  const x =
    getBeatXInSystem(sysLayout, note.beat) + getNoteOffset(sysLayout.beatWidth);

  // Calculate the VISUAL center of the staff (not the fixed B4 line position)
  // Staff top varies by line count, bottom is always at +2 * LINE_SPACING
  const staffCenterY = getStaffCenterY(note.system, staffLines);
  const staffTopOffset =
    staffLines === 5
      ? -2 * LINE_SPACING
      : staffLines === 4
        ? -1 * LINE_SPACING
        : 0;
  const staffBottomOffset = 2 * LINE_SPACING;
  // Visual center is midway between top and bottom lines
  const y = staffCenterY + (staffTopOffset + staffBottomOffset) / 2;

  const isActive = activeNoteId === note.id;
  const isHoveredForMove = hoveredNote === note.id && allowMove && !readOnly;

  // Determine which rest symbol to render based on duration
  let RestSymbol: React.FC<{ x: number; y: number }>;
  if (note.duration >= 4) {
    RestSymbol = WholeRestSymbol;
  } else if (note.duration >= 2) {
    RestSymbol = HalfRestSymbol;
  } else if (note.duration >= 1) {
    RestSymbol = QuarterRestSymbol;
  } else {
    RestSymbol = EighthRestSymbol;
  }

  return (
    <g
      key={note.id}
      data-note-id={note.id}
      onContextMenu={(e) => onContextMenu(e, note.id)}
      onMouseDown={(e) => onMouseDown(e, note.id)}
      onMouseEnter={() => onMouseEnter?.(note.id)}
      onMouseLeave={() => onMouseLeave?.()}
      onClick={(e) => onClick?.(e, note.id)}
      style={{
        cursor:
          selectedTool === "delete"
            ? "pointer"
            : allowMove && !readOnly
              ? "move"
              : readOnly
                ? "default"
                : "pointer",
      }}
    >
      {/* Invisible hit area for interactions */}
      <rect
        x={x - 18}
        y={y - 25}
        width={36}
        height={50}
        fill="transparent"
        style={{
          cursor:
            allowMove && !readOnly ? "move" : readOnly ? "default" : "pointer",
        }}
      />

      {/* Move preview highlight - shows which rest will move on drag */}
      {isHoveredForMove && (
        <ellipse cx={x} cy={y} rx={22} ry={22} fill="#3B82F6" opacity={0.15} />
      )}

      {/* Active rest glow */}
      {isActive && (
        <ellipse
          cx={x}
          cy={y}
          rx={20}
          ry={20}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={3}
          opacity={0.7}
        />
      )}

      {/* Rest symbol */}
      <RestSymbol x={x} y={y} />
    </g>
  );
}

export interface NoteElementProps {
  note: RenderedNote;
  systemLayouts: SystemLayout[];
  beamGroups: BeamGroup[];
  beamedNoteIds: Set<string>;
  staffLines: number;
  showLabels: boolean;
  activeNoteId: string | null;
  draggedNote: string | null;
  hoveredNote: string | null;
  allowMove: boolean;
  readOnly: boolean;
  selectedTool?: NoteTool;
  onContextMenu: (e: React.MouseEvent, noteId: string) => void;
  onMouseDown: (e: React.MouseEvent, noteId: string) => void;
  onMouseEnter?: (noteId: string) => void;
  onMouseLeave?: () => void;
  onClick?: (e: React.MouseEvent, noteId: string) => void;
}

/**
 * Render duration extension bar (semi-transparent line showing note length)
 * Works for both notes (positioned at pitch) and rests (centered on staff)
 */
export function DurationExtension({
  note,
  systemLayouts,
  staffLines,
}: {
  note: RenderedNote;
  systemLayouts: SystemLayout[];
  staffLines?: number;
}) {
  // Skip if note has invalid data
  if (
    !note.pitch ||
    !Number.isFinite(note.system) ||
    !Number.isFinite(note.beat)
  ) {
    return null;
  }

  // Shorten extension by one eighth note (0.5 beats) - eighth notes get no line
  const adjustedDuration = note.duration - 0.5;
  if (adjustedDuration <= 0) return null;

  // Get system's beat width for variable widths
  const sysLayout = getLayoutForSystem(systemLayouts, note.system);
  const sysBeatWidth = sysLayout.beatWidth;

  // Use getBeatXInSystem to account for decoration widths
  const x =
    getBeatXInSystem(sysLayout, note.beat) + getNoteOffset(sysBeatWidth);

  // For rests, use the VISUAL center of the staff; for notes, use pitch position
  let y: number;
  if (note.pitch === "REST") {
    const staffCenterY = getStaffCenterY(note.system, staffLines);
    const staffTopOffset =
      staffLines === 5
        ? -2 * LINE_SPACING
        : staffLines === 4
          ? -1 * LINE_SPACING
          : 0;
    const staffBottomOffset = 2 * LINE_SPACING;
    y = staffCenterY + (staffTopOffset + staffBottomOffset) / 2;
  } else {
    y = getYFromPitch(note.pitch, note.system, staffLines);
  }

  // Rests use a neutral gray color
  const color = note.pitch === "REST" ? "#6b7280" : getNoteColor(note.pitch);

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
}

/**
 * NoteElement - Renders a single note with all visual elements
 */
export function NoteElement({
  note,
  systemLayouts,
  beamGroups,
  beamedNoteIds,
  staffLines,
  showLabels,
  activeNoteId,
  draggedNote,
  hoveredNote,
  allowMove,
  readOnly,
  selectedTool,
  onContextMenu,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: NoteElementProps) {
  // Skip rendering if note has invalid data
  if (
    !note.pitch ||
    !Number.isFinite(note.system) ||
    !Number.isFinite(note.beat)
  ) {
    console.warn("[NoteElement] Skipping note with invalid data:", note.id);
    return null;
  }

  // Render rest symbol for REST pitch
  if (note.pitch === "REST") {
    return (
      <RestElement
        note={note}
        systemLayouts={systemLayouts}
        staffLines={staffLines}
        activeNoteId={activeNoteId}
        hoveredNote={hoveredNote}
        allowMove={allowMove}
        readOnly={readOnly}
        selectedTool={selectedTool}
        onContextMenu={onContextMenu}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      />
    );
  }

  const sysLayout = getLayoutForSystem(systemLayouts, note.system);
  const x =
    getBeatXInSystem(sysLayout, note.beat) + getNoteOffset(sysLayout.beatWidth);
  const y = getYFromPitch(note.pitch, note.system, staffLines);
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
  const staffCenterY = getStaffCenterY(note.system, staffLines);
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
  const isHoveredForMove = hoveredNote === note.id && allowMove && !readOnly;

  return (
    <g
      key={note.id}
      data-note-id={note.id}
      onContextMenu={(e) => onContextMenu(e, note.id)}
      onMouseDown={(e) => onMouseDown(e, note.id)}
      onMouseEnter={() => onMouseEnter?.(note.id)}
      onMouseLeave={() => onMouseLeave?.()}
      onClick={(e) => onClick?.(e, note.id)}
      style={{
        cursor:
          selectedTool === "delete"
            ? "pointer"
            : allowMove && !readOnly
              ? "move"
              : "pointer",
      }}
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

      {/* Move preview highlight - shows which note will move on drag */}
      {isHoveredForMove && (
        <ellipse
          cx={x}
          cy={y}
          rx={18}
          ry={14}
          fill="#3B82F6"
          opacity={0.2}
          transform={`rotate(-15 ${x} ${y})`}
        />
      )}

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
              ? `M ${stemX} ${stemY2 + 1.5} Q ${stemX + 12} ${stemY2 + 6.5} ${stemX + 10} ${stemY2 + 14}`
              : `M ${stemX} ${stemY2 - 1.5} Q ${stemX + 12} ${stemY2 - 6.5} ${stemX + 10} ${stemY2 - 14}`
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
              ? `M ${stemX} ${stemY2 + 10} Q ${stemX + 12} ${stemY2 + 15} ${stemX + 10} ${stemY2 + 22}`
              : `M ${stemX} ${stemY2 - 10} Q ${stemX + 12} ${stemY2 - 15} ${stemX + 10} ${stemY2 - 22}`
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
}

// ============================================================================
// BEAM GROUP ELEMENT
// ============================================================================

/**
 * Props for BeamGroupElement component
 */
export interface BeamGroupElementProps {
  /** The beam group containing notes and stem direction */
  group: BeamGroup;
  /** Index of this group (used for unique gradient IDs) */
  groupIndex: number;
  /** Layout information for all systems */
  systemLayouts: SystemLayout[];
  /** Number of visible staff lines (for dynamic system height) */
  staffLines?: number;
}

/**
 * BeamGroupElement - Renders a group of connected eighth/sixteenth notes
 *
 * This component handles:
 * - Drawing stems from each note up/down to the shared beam
 * - Primary beam connecting all notes in the group
 * - Secondary beams for 16th notes (continuous runs or stubs for isolated 16ths)
 * - Dots for dotted notes within the beam group
 * - Multi-color gradient beams when notes have different colors
 *
 * Music theory rules implemented:
 * - Beam slope follows melodic contour but is limited to prevent steep angles
 * - Maximum slope: LINE_SPACING / 2 (the "engraver's rule")
 * - Stem direction is determined by the BeamGroup (based on avg note position)
 * - 16th note secondary beams: continuous for runs, stubs for isolated notes
 *
 * Usage:
 * ```tsx
 * {beamGroups.map((group, index) => (
 *   <BeamGroupElement
 *     key={`beam-${index}`}
 *     group={group}
 *     groupIndex={index}
 *     systemLayouts={systemLayouts}
 *   />
 * ))}
 * ```
 */
export function BeamGroupElement({
  group,
  groupIndex,
  systemLayouts,
  staffLines,
}: BeamGroupElementProps) {
  const { notes: groupNotes, stemDirection } = group;

  // Need at least 2 notes to form a beam
  if (groupNotes.length < 2) return null;

  // Validate all notes have valid pitch, system, and beat
  const hasInvalidNote = groupNotes.some(
    (note) =>
      !note.pitch ||
      !Number.isFinite(note.system) ||
      !Number.isFinite(note.beat),
  );
  if (hasInvalidNote) {
    console.warn("[BeamGroupElement] Skipping beam group with invalid notes");
    return null;
  }

  // Constants for beam geometry
  const stemH = 40; // Standard stem height
  const beamThickness = 6; // Thickness of the beam line

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Calculate stem X positions for each note
  // Stems are slightly inward from note center for better visual alignment
  // ─────────────────────────────────────────────────────────────────────────
  const stemXs = groupNotes.map((note) => {
    const sysLayout = getLayoutForSystem(systemLayouts, note.system);
    const noteX =
      getBeatXInSystem(sysLayout, note.beat) +
      getNoteOffset(sysLayout.beatWidth);
    // Stems closer to note center, stems down moved inward by 1px
    return stemDirection === "up" ? noteX + 11 : noteX - 11;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: Calculate stem Y endpoints (before beam slope adjustment)
  // ─────────────────────────────────────────────────────────────────────────
  const stemYs = groupNotes.map((note) => {
    const noteY = getYFromPitch(note.pitch, note.system, staffLines);
    return stemDirection === "up" ? noteY - stemH : noteY + stemH;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: Get colors for each note (used for stems and gradient)
  // ─────────────────────────────────────────────────────────────────────────
  const colors = groupNotes.map((n) => getNoteColor(n.pitch));

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4: Calculate beam slope with limiting
  // The "engraver's rule" limits beam slope to prevent awkward angles
  // ─────────────────────────────────────────────────────────────────────────
  const MAX_BEAM_SLOPE = LINE_SPACING / 2;
  const rawSlope = stemYs[stemYs.length - 1] - stemYs[0];
  const limitedSlope = Math.max(
    -MAX_BEAM_SLOPE,
    Math.min(MAX_BEAM_SLOPE, rawSlope),
  );

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 5: Anchor beam at the extremity (highest or lowest stem endpoint)
  // This ensures the beam doesn't collide with note heads
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 6: Linear interpolation function for beam Y at any X position
  // Used to calculate where stems meet the angled beam
  // ─────────────────────────────────────────────────────────────────────────
  const getBeamYAtX = (x: number): number => {
    if (firstX === lastX) return firstY;
    const t = (x - firstX) / (lastX - firstX);
    return firstY + t * (lastY - firstY);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 7: Determine beam color (solid or gradient)
  // Multi-colored note groups get a horizontal gradient
  // ─────────────────────────────────────────────────────────────────────────
  const uniqueColors = [...new Set(colors)];
  const beamColor =
    uniqueColors.length > 1 ? `url(#beam-gradient-${groupIndex})` : colors[0];

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 8: Calculate secondary beams for 16th notes
  // - Consecutive 16ths get a continuous secondary beam
  // - Isolated 16ths get a short "stub" beam
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER THE BEAM GROUP
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <g key={`beam-group-${groupIndex}`}>
      {/* Gradient definition for multi-colored beams */}
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
        const noteY = getYFromPitch(note.pitch, note.system, staffLines);
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

      {/* Primary beam (polygon for angled thick line) */}
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

      {/* Dots for dotted notes within beam group (e.g., dotted eighths) */}
      {groupNotes.map((note, i) => {
        if (note.duration !== 0.75) return null;
        const dotSysLayout = getLayoutForSystem(systemLayouts, note.system);
        const noteX =
          getBeatXInSystem(dotSysLayout, note.beat) +
          getNoteOffset(dotSysLayout.beatWidth);
        const noteY = getYFromPitch(note.pitch, note.system, staffLines);
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
}

// ============================================================================
// STANDALONE COMPONENTS (for Learn pages, icons, etc.)
// ============================================================================

/** Duration type for standalone components */
export type NoteDuration = 0.25 | 0.5 | 0.75 | 1 | 1.5 | 2 | 3 | 4;

interface StandaloneSingleNoteProps {
  duration: NoteDuration;
  size?: number;
  color?: string;
}

/**
 * Standalone SVG of a single note (for icons, Learn pages, etc.)
 * Self-contained - doesn't need editor context
 */
export function StandaloneSingleNote({
  duration,
  size = 48,
  color = "#7c3aed",
}: StandaloneSingleNoteProps) {
  const isWhole = duration === 4;
  const isHalf = duration === 2 || duration === 3;
  const isHollow = isWhole || isHalf;
  const hasFlag = duration === 0.5 || duration === 0.75 || duration === 0.25;
  const hasDoubleFlag = duration === 0.25;
  const hasDot = duration === 0.75 || duration === 1.5 || duration === 3;

  // Scaled values for standalone display (viewBox 50x72)
  const noteX = 22;
  const noteY = hasDot ? 48 : 50;
  const rx = 8;
  const ry = 6.5;
  const stemHeight = 24;
  const stemWidth = 2;
  const strokeWidth = 1.5;
  const flagStrokeWidth = 2;
  const dotRadius = 2.5;

  const stemX = noteX + 8;
  const stemEndY = noteY - stemHeight;

  const viewBoxWidth = hasDot ? 70 : 50;
  const viewBoxHeight = 72;
  const scaledWidth = (viewBoxWidth / 60) * size;
  const scaledHeight = (viewBoxHeight / 60) * size;

  const flagPath = `M ${stemX} ${stemEndY} Q ${stemX + 6} ${stemEndY + 6} ${stemX + 6} ${stemEndY + 13}`;
  const secondFlagPath = `M ${stemX} ${stemEndY + 5} Q ${stemX + 6} ${stemEndY + 11} ${stemX + 6} ${stemEndY + 18}`;

  return (
    <svg
      width={scaledWidth}
      height={scaledHeight}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className="inline-block align-middle"
    >
      {/* Stem (not for whole notes) */}
      {!isWhole && (
        <line
          x1={stemX}
          y1={noteY}
          x2={stemX}
          y2={stemEndY}
          stroke={color}
          strokeWidth={stemWidth}
        />
      )}
      {/* Flag for eighth notes */}
      {hasFlag && !hasDoubleFlag && (
        <path
          d={flagPath}
          stroke={color}
          strokeWidth={flagStrokeWidth}
          fill="none"
        />
      )}
      {/* Double flag for sixteenth notes */}
      {hasDoubleFlag && (
        <>
          <path
            d={flagPath}
            stroke={color}
            strokeWidth={flagStrokeWidth}
            fill="none"
          />
          <path
            d={secondFlagPath}
            stroke={color}
            strokeWidth={flagStrokeWidth}
            fill="none"
          />
        </>
      )}
      {/* Notehead */}
      <ellipse
        cx={noteX}
        cy={noteY}
        rx={rx}
        ry={ry}
        fill={isHollow ? "#ffffff" : color}
        stroke={color}
        strokeWidth={strokeWidth}
        transform={`rotate(-20 ${noteX} ${noteY})`}
      />
      {/* Dot for dotted notes */}
      {hasDot && (
        <circle cx={noteX + 14} cy={noteY - 4} r={dotRadius} fill={color} />
      )}
    </svg>
  );
}

interface StandaloneBeamedNotesProps {
  count?: number;
  size?: number;
  color?: string;
}

/**
 * Standalone SVG of beamed eighth notes (for icons, Learn pages, etc.)
 * Self-contained - doesn't need editor context
 */
export function StandaloneBeamedNotes({
  count = 2,
  size = 40,
  color = "#7c3aed",
}: StandaloneBeamedNotesProps) {
  // Scaled values for standalone display
  const rx = 8;
  const ry = 6.5;
  const stemWidth = 2;
  const beamThickness = 4;
  const strokeWidth = 1.5;
  const stemXOffset = 8;

  const beamY = 12;
  const noteY = 48;
  const noteSpacing = 28;
  const padding = 16;

  const viewBoxWidth = padding * 2 + (count - 1) * noteSpacing;
  const viewBoxHeight = 60;

  const noteXs = Array.from(
    { length: count },
    (_, i) => padding + i * noteSpacing,
  );
  const stemXs = noteXs.map((nx) => nx + stemXOffset);
  const firstStemX = stemXs[0];
  const lastStemX = stemXs[stemXs.length - 1];

  const scaleFactor = size / 40;
  const width = viewBoxWidth * scaleFactor;
  const height = viewBoxHeight * scaleFactor;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className="inline-block align-middle"
    >
      {/* Stems */}
      {stemXs.map((stemX, i) => (
        <line
          key={`stem-${i}`}
          x1={stemX}
          y1={noteY}
          x2={stemX}
          y2={beamY + beamThickness}
          stroke={color}
          strokeWidth={stemWidth}
        />
      ))}
      {/* Primary beam - extend by half stem width on each side to cover stems */}
      <polygon
        points={`
          ${firstStemX - stemWidth / 2},${beamY}
          ${lastStemX + stemWidth / 2},${beamY}
          ${lastStemX + stemWidth / 2},${beamY + beamThickness}
          ${firstStemX - stemWidth / 2},${beamY + beamThickness}
        `}
        fill={color}
      />
      {/* Noteheads */}
      {noteXs.map((nx, i) => (
        <ellipse
          key={`notehead-${i}`}
          cx={nx}
          cy={noteY}
          rx={rx}
          ry={ry}
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          transform={`rotate(-20 ${nx} ${noteY})`}
        />
      ))}
    </svg>
  );
}
