/**
 * Shared staff rendering primitives for SVG music notation.
 * Used by both the main editor (StaffSystem) and standalone contexts (404 pages).
 *
 * All rendering constants come from @/lib/constants and @/lib/layoutUtils —
 * nothing is duplicated here.
 */

import { TREBLE_CLEF_PATH, getNoteColor } from "@/lib/constants";
import { LINE_SPACING, STAFF_LEFT } from "@/lib/layoutUtils";
import type { Pitch } from "@/lib/types";

const STAFF_LINE_COLOR = "#4a5568";
const STAFF_LINE_WIDTH = 2;

/**
 * Renders staff lines centered at the given Y coordinate.
 * Supports variable line counts (3, 4, or 5) for both standalone and editor use.
 *
 * Line mapping (offsets from staffCenterY):
 *   5 lines: [-2, -1, 0, +1, +2] * LINE_SPACING  (F5, D5, B4, G4, E4)
 *   4 lines: [-1, 0, +1, +2] * LINE_SPACING       (D5, B4, G4, E4)
 *   3 lines: [0, +1, +2] * LINE_SPACING            (B4, G4, E4)
 */
export function StaffLines({
  staffCenterY,
  staffLeft = STAFF_LEFT,
  staffRight,
  staffLines = 5,
  color = STAFF_LINE_COLOR,
}: {
  staffCenterY: number;
  staffLeft?: number;
  staffRight: number;
  staffLines?: number;
  color?: string;
}) {
  const allOffsets = [-2, -1, 0, 1, 2];
  const linesToShow =
    staffLines === 5
      ? [0, 1, 2, 3, 4]
      : staffLines === 4
        ? [1, 2, 3, 4]
        : [2, 3, 4];

  return (
    <>
      {linesToShow.map((lineIndex) => (
        <line
          key={`staff-line-${lineIndex}`}
          x1={staffLeft}
          y1={staffCenterY + allOffsets[lineIndex] * LINE_SPACING}
          x2={staffRight}
          y2={staffCenterY + allOffsets[lineIndex] * LINE_SPACING}
          stroke={color}
          strokeWidth={STAFF_LINE_WIDTH}
        />
      ))}
    </>
  );
}

/**
 * Renders the treble clef at the correct position for a given staff center.
 * Uses the same SVG path and transform as the editor's StaffSystem.
 *
 * Transform: translate(x, staffCenterY - 98) scale(5.2)
 */
export function TrebleClef({
  staffCenterY,
  x = 0,
  color = "#334155",
}: {
  staffCenterY: number;
  x?: number;
  color?: string;
}) {
  return (
    <g
      transform={`translate(${x}, ${staffCenterY - 98}) scale(5.2)`}
      style={{ pointerEvents: "none" }}
    >
      <path d={TREBLE_CLEF_PATH} fill={color} />
    </g>
  );
}

/**
 * Renders a note (head + stem) at exact position.
 * Uses the same ellipse dimensions (rx=12, ry=10, rotate -15) and stem
 * calculations as NoteElement.
 */
export function Note({
  x,
  y,
  pitch,
  duration = 1,
  color,
  stemDir,
  staffCenterY,
  opacity = 1,
}: {
  x: number;
  y: number;
  pitch?: Pitch;
  duration?: number;
  color?: string;
  stemDir?: "up" | "down";
  staffCenterY?: number;
  opacity?: number;
}) {
  const noteColor = color ?? (pitch ? getNoteColor(pitch) : "#8b5cf6");
  const isWhole = duration === 4;
  const isHollow = duration >= 2; // half and whole are hollow

  // Stem direction: notes above center have stems down
  const dir =
    stemDir ?? (staffCenterY !== undefined && y > staffCenterY ? "up" : "down");
  const stemH = 40;
  const stemX = dir === "up" ? x + 12 : x - 11;
  const stemY1 = y;
  const stemY2 = dir === "up" ? y - stemH : y + stemH;
  const hasStem = !isWhole;

  return (
    <g opacity={opacity}>
      {/* Note head */}
      <ellipse
        cx={x}
        cy={y}
        rx={isWhole ? 14 : 12}
        ry={10}
        fill={isHollow ? "white" : noteColor}
        stroke={noteColor}
        strokeWidth={isHollow ? 3 : 2}
        transform={`rotate(-15 ${x} ${y})`}
      />
      {/* Stem */}
      {hasStem && (
        <line
          x1={stemX}
          y1={stemY1}
          x2={stemX}
          y2={stemY2}
          stroke={noteColor}
          strokeWidth={3}
        />
      )}
    </g>
  );
}

/**
 * Renders a ledger line at the given position (for notes outside the staff).
 */
export function LedgerLine({
  x,
  y,
  color = STAFF_LINE_COLOR,
}: {
  x: number;
  y: number;
  color?: string;
}) {
  return (
    <line
      x1={x - 18}
      y1={y}
      x2={x + 18}
      y2={y}
      stroke={color}
      strokeWidth={STAFF_LINE_WIDTH}
    />
  );
}

/**
 * Renders a vertical bar line spanning the full staff height.
 */
export function BarLine({
  x,
  staffCenterY,
  color = "#475569",
  strokeWidth = 2,
}: {
  x: number;
  staffCenterY: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <line
      x1={x}
      y1={staffCenterY - 2 * LINE_SPACING - 8}
      x2={x}
      y2={staffCenterY + 2 * LINE_SPACING + 8}
      stroke={color}
      strokeWidth={strokeWidth}
    />
  );
}

/**
 * Renders a time signature (e.g. 4/4) on the staff.
 * Uses the same positioning as StaffSystem: centered between the two spaces
 * flanking the middle visible staff line.
 */
export function TimeSignatureDisplay({
  staffCenterY,
  x = 85,
  numerator,
  denominator,
  staffLines = 5,
  color = "#334155",
}: {
  staffCenterY: number;
  x?: number;
  numerator: number;
  denominator: number;
  staffLines?: number;
  color?: string;
}) {
  // Same calculation as StaffSystem
  const visibleCenterOffset = staffLines <= 3 ? LINE_SPACING : 0;
  const decorationSpread = LINE_SPACING / 2;

  return (
    <>
      <text
        x={x}
        y={staffCenterY + visibleCenterOffset - decorationSpread + 7}
        fontSize={20}
        fontWeight="bold"
        textAnchor="middle"
        fill={color}
      >
        {numerator}
      </text>
      <text
        x={x}
        y={staffCenterY + visibleCenterOffset + decorationSpread + 7}
        fontSize={20}
        fontWeight="bold"
        textAnchor="middle"
        fill={color}
      >
        {denominator}
      </text>
    </>
  );
}

/**
 * Calculates Y position for a pitch on the staff.
 * Simplified version for standalone contexts (no system index needed).
 */
const PITCH_POS: Record<string, number> = {
  C4: 0,
  D4: 1,
  E4: 2,
  F4: 3,
  G4: 4,
  A4: 5,
  B4: 6,
  C5: 7,
  D5: 8,
  E5: 9,
  F5: 10,
};

export function pitchToY(pitch: string, staffCenterY: number): number {
  const pos = PITCH_POS[pitch] ?? 6; // default B4 (center)
  const bottomLineY = staffCenterY + 2 * LINE_SPACING;
  return bottomLineY - (pos - 2) * (LINE_SPACING / 2);
}

/**
 * Returns true if a pitch needs a ledger line (below E4 staff bottom).
 */
export function needsLedgerBelow(pitch: string): boolean {
  return pitch === "C4" || pitch === "D4";
}

// Re-export for convenience
export { LINE_SPACING, getNoteColor };
