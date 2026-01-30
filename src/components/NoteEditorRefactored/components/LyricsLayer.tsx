// src/components/NoteEditorRefactored/components/LyricsLayer.tsx
// Renders lyric syllables below the music staff
//
// Usage:
// ```tsx
// <LyricsLayer
//   lyrics={lyrics}
//   systemLayouts={systemLayouts}
//   systemCount={systemCount}
//   selectedTool={selectedTool}
//   readOnly={readOnly}
//   isPlaying={isPlaying}
//   editingLyric={editingLyric}
// />
// ```

import React from "react";
import { LyricSyllable } from "@/lib/types";
import {
  LEFT_MARGIN,
  LINE_SPACING,
  getNoteOffset,
  getStaffCenterY,
} from "@/lib/layoutUtils";
import {
  getLayoutForSystem,
  getSystemForAbsoluteBeat,
  SystemLayout,
} from "../utils/systemLayout";
import { NoteTool } from "../types";

// ============================================================================
// TYPES
// ============================================================================

/** State for inline lyric editing */
export interface EditingLyricState {
  absoluteBeat: number;
  initialText: string;
}

export interface LyricsLayerProps {
  /** Array of lyric syllables with absoluteBeat positions */
  lyrics: LyricSyllable[];
  /** Layout info for each system */
  systemLayouts: SystemLayout[];
  /** Total number of systems */
  systemCount: number;
  /** Currently selected tool */
  selectedTool?: NoteTool;
  /** Whether the editor is in read-only mode */
  readOnly?: boolean;
  /** Whether playback is active */
  isPlaying?: boolean;
  /** Currently editing lyric state (to hide the original text) */
  editingLyric?: EditingLyricState | null;
  /** Number of visible staff lines (for dynamic system height) */
  staffLines?: number;
}

// ============================================================================
// LYRICS LAYER COMPONENT
// ============================================================================

/**
 * LyricsLayer - Renders lyric syllables below the staff
 *
 * Each syllable is positioned:
 * - Horizontally: aligned with its corresponding note (by absoluteBeat)
 * - Vertically: below the staff and beat numbers (LINE_SPACING * 3 + 30 below center)
 *
 * Features:
 * - Handles multi-system layouts
 * - Centers text on note position
 * - Supports RTL text (Hebrew) via unicodeBidi
 * - Interactive styling when lyrics tool is active
 * - Hides lyric being edited to avoid visual overlap
 */
export function LyricsLayer({
  lyrics,
  systemLayouts,
  systemCount,
  selectedTool,
  readOnly = false,
  isPlaying = false,
  editingLyric,
  staffLines,
}: LyricsLayerProps) {
  const isLyricToolActive =
    selectedTool === "lyrics" && !readOnly && !isPlaying;

  return (
    <>
      {lyrics.map((lyric) => {
        // Find which system and beat position this lyric belongs to
        const lyricPosition = getSystemForAbsoluteBeat(
          systemLayouts,
          lyric.absoluteBeat,
        );

        // Skip if position not found or beyond visible systems
        if (!lyricPosition || lyricPosition.systemIndex >= systemCount) {
          return null;
        }

        // Skip rendering if this lyric is being edited inline
        if (
          editingLyric &&
          Math.abs(editingLyric.absoluteBeat - lyric.absoluteBeat) < 0.1
        ) {
          return null;
        }

        const system = lyricPosition.systemIndex;
        const lyricSysLayout = getLayoutForSystem(systemLayouts, system);
        const beatInSystem = lyricPosition.beatInSystem;

        // Calculate X position: left margin + beat offset + note centering offset
        const x =
          LEFT_MARGIN +
          beatInSystem * lyricSysLayout.beatWidth +
          getNoteOffset(lyricSysLayout.beatWidth);

        // Calculate Y position: below the staff (after beat numbers)
        // Pass staffLines for dynamic system height calculation
        const staffCenterY = getStaffCenterY(system, staffLines);
        const lyricsY = staffCenterY + LINE_SPACING * 3 + 30;

        return (
          <text
            key={`lyric-${lyric.absoluteBeat}`}
            x={x}
            y={lyricsY}
            textAnchor="middle"
            fontSize={12}
            fontFamily="system-ui, sans-serif"
            fill={isLyricToolActive ? "#b45309" : "#374151"}
            style={{
              unicodeBidi: "isolate", // Proper RTL support for Hebrew
              cursor: isLyricToolActive ? "text" : "default",
            }}
          >
            {lyric.text}
          </text>
        );
      })}
    </>
  );
}
