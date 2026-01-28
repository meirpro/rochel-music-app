// src/components/NoteEditorRefactored/components/LyricsLayer.tsx
// Renders lyric syllables below the music staff
//
// Usage:
// ```tsx
// <LyricsLayer
//   lyrics={lyrics}
//   systemLayouts={systemLayouts}
//   systemCount={systemCount}
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

// ============================================================================
// TYPES
// ============================================================================

export interface LyricsLayerProps {
  /** Array of lyric syllables with absoluteBeat positions */
  lyrics: LyricSyllable[];
  /** Layout info for each system */
  systemLayouts: SystemLayout[];
  /** Total number of systems */
  systemCount: number;
}

// ============================================================================
// LYRICS LAYER COMPONENT
// ============================================================================

/**
 * LyricsLayer - Renders lyric syllables below the staff
 *
 * Each syllable is positioned:
 * - Horizontally: aligned with its corresponding note (by absoluteBeat)
 * - Vertically: below the staff (LINE_SPACING + 55 below center)
 *
 * Features:
 * - Handles multi-system layouts
 * - Centers text on note position
 * - Supports RTL text (Hebrew) via unicodeBidi
 */
export function LyricsLayer({
  lyrics,
  systemLayouts,
  systemCount,
}: LyricsLayerProps) {
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

        const system = lyricPosition.systemIndex;
        const lyricSysLayout = getLayoutForSystem(systemLayouts, system);
        const beatInSystem = lyricPosition.beatInSystem;

        // Calculate X position: left margin + beat offset + note centering offset
        const x =
          LEFT_MARGIN +
          beatInSystem * lyricSysLayout.beatWidth +
          getNoteOffset(lyricSysLayout.beatWidth);

        // Calculate Y position: below the staff
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
            style={{ unicodeBidi: "isolate" }} // Proper RTL support for Hebrew
          >
            {lyric.text}
          </text>
        );
      })}
    </>
  );
}
