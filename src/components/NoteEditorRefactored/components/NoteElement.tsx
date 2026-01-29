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

export interface NoteElementProps {
  note: RenderedNote;
  systemLayouts: SystemLayout[];
  beamGroups: BeamGroup[];
  beamedNoteIds: Set<string>;
  staffLines: number;
  showLabels: boolean;
  activeNoteId: string | null;
  draggedNote: string | null;
  allowMove: boolean;
  readOnly: boolean;
  selectedTool?: NoteTool;
  onContextMenu: (e: React.MouseEvent, noteId: string) => void;
  onMouseDown: (e: React.MouseEvent, noteId: string) => void;
  onClick?: (e: React.MouseEvent, noteId: string) => void;
}

/**
 * Render duration extension bar (semi-transparent line showing note length)
 */
export function DurationExtension({
  note,
  systemLayouts,
}: {
  note: RenderedNote;
  systemLayouts: SystemLayout[];
}) {
  // Skip if note has invalid data
  if (
    !note.pitch ||
    !Number.isFinite(note.system) ||
    !Number.isFinite(note.beat)
  ) {
    return null;
  }

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
  allowMove,
  readOnly,
  selectedTool,
  onContextMenu,
  onMouseDown,
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

  const sysLayout = getLayoutForSystem(systemLayouts, note.system);
  const x =
    getBeatXInSystem(sysLayout, note.beat) + getNoteOffset(sysLayout.beatWidth);
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
      onContextMenu={(e) => onContextMenu(e, note.id)}
      onMouseDown={(e) => onMouseDown(e, note.id)}
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
    const noteY = getYFromPitch(note.pitch, note.system);
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
