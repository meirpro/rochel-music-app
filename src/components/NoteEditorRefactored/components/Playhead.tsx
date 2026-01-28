// src/components/NoteEditorRefactored/components/Playhead.tsx
// Draggable playback position indicator for the music staff
//
// Usage:
// ```tsx
// {playheadX !== null && (
//   <Playhead
//     playheadX={playheadX}
//     playheadSystem={playheadSystem}
//     staffLines={staffLines}
//     isDraggable={!!onPlayheadBeatChange}
//     onMouseDown={handlePlayheadMouseDown}
//   />
// )}
// ```

import React from "react";
import { LINE_SPACING, getStaffCenterY } from "@/lib/layoutUtils";

// ============================================================================
// TYPES
// ============================================================================

export interface PlayheadProps {
  /** X position of the playhead in SVG coordinates */
  playheadX: number;
  /** Which system (row) the playhead is on */
  playheadSystem: number;
  /** Number of staff lines (3, 4, or 5) - affects vertical extent */
  staffLines: number;
  /** Whether the playhead can be dragged */
  isDraggable: boolean;
  /** Handler for mouse down to start drag */
  onMouseDown?: (e: React.MouseEvent) => void;
}

// ============================================================================
// PLAYHEAD COMPONENT
// ============================================================================

/**
 * Playhead - Visual indicator for current playback position
 *
 * Features:
 * - Vertical line with triangle marker at top
 * - Invisible hit area for easier dragging
 * - Extends beyond the staff lines for visibility
 * - Orange color (#f59e0b) at 80% opacity
 */
export function Playhead({
  playheadX,
  playheadSystem,
  staffLines,
  isDraggable,
  onMouseDown,
}: PlayheadProps) {
  // Calculate staff extents based on number of staff lines
  // The playhead extends beyond the staff to be clearly visible
  const staffTopOffset =
    staffLines === 5
      ? -2 * LINE_SPACING // 5 lines: extends 2 line-spacings above center
      : staffLines === 4
        ? -1 * LINE_SPACING // 4 lines: extends 1 line-spacing above center
        : 0; // 3 lines: starts at center
  const staffBottomOffset = 2 * LINE_SPACING;

  // Beat shading has 20px padding, playhead extends 35px to stick out 15px beyond
  const playheadOverhang = 35;

  const playheadTop =
    getStaffCenterY(playheadSystem) + staffTopOffset - playheadOverhang;
  const playheadBottom =
    getStaffCenterY(playheadSystem) + staffBottomOffset + playheadOverhang;

  return (
    <g
      onMouseDown={isDraggable ? onMouseDown : undefined}
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

      {/* Main vertical line */}
      <line
        x1={playheadX}
        y1={playheadTop}
        x2={playheadX}
        y2={playheadBottom}
        stroke="#f59e0b"
        strokeWidth={3}
        opacity={0.8}
      />

      {/* Triangle marker at top of playhead */}
      <polygon
        points={`${playheadX - 8},${playheadTop} ${playheadX + 8},${playheadTop} ${playheadX},${playheadTop + 10}`}
        fill="#f59e0b"
        opacity={0.8}
      />
    </g>
  );
}
