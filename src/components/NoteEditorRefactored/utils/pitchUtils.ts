// src/components/NoteEditorRefactored/utils/pitchUtils.ts
// Extracted from NoteEditor.tsx lines 779-978

import { Pitch } from "@/lib/types";
import {
  LINE_SPACING,
  SYSTEM_HEIGHT,
  SYSTEM_TOP_MARGIN,
  getStaffCenterY,
} from "@/lib/layoutUtils";

// Layout constants imported from @/lib/layoutUtils
// BEAT_WIDTH alias for backward compatibility
// Note: STAFF_RIGHT, BEATS_PER_SYSTEM, MEASURES_PER_SYSTEM, SVG_WIDTH are now dynamic
// based on time signature - use getLayoutConfig(timeSignature)

// Base position for natural notes within an octave (C=0, D=1, E=2, F=3, G=4, A=5, B=6)
export const NOTE_BASE_POSITIONS: Record<string, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

// Calculate staff position for any pitch (e.g., "Bb4" -> position relative to C4)
export function getPitchPosition(pitch: Pitch | undefined | null): number {
  // Guard against undefined/null pitch
  if (!pitch) {
    console.warn(
      "[getPitchPosition] Undefined pitch, defaulting to position 0",
    );
    return 0;
  }

  if (pitch === "REST") return -1;

  // Parse pitch: e.g., "Bb4" -> note="B", accidental="b", octave=4
  const match = pitch.match(/^([A-G])(#|b)?(\d)$/);
  if (!match) return 0;

  const [, note, _accidental, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);

  // Position within octave (0-6 for C-B)
  const positionInOctave = NOTE_BASE_POSITIONS[note];
  // Accidentals do NOT change staff position - F# sits on the same line as F
  // The accidental symbol is rendered separately beside the notehead

  // Calculate position relative to C4 (octave 4 starts at position 0)
  const octaveOffset = (octave - 4) * 7;

  return octaveOffset + positionInOctave;
}

// Legacy lookup for common pitches (for backwards compatibility)
export const PITCH_POSITIONS: Partial<Record<Pitch, number>> = {
  C4: 0,
  "C#4": 0,
  D4: 1,
  "D#4": 1,
  E4: 2,
  F4: 3,
  "F#4": 3,
  G4: 4,
  "G#4": 4,
  A4: 5,
  "A#4": 5,
  B4: 6,
  C5: 7,
  REST: -1,
};

// Extended pitch array to support notes on higher staff lines (when staffLines > 3)
// Position 0 = C4 (middle C, below staff)
// Position 2 = E4 (bottom line, line 5)
// Position 6 = B4 (middle line, line 3)
// Position 8 = D5 (line 2, visible when staffLines >= 4)
// Position 10 = F5 (top line, line 1, visible when staffLines = 5)
// Position 11 = G5 (above top line)
export const POSITION_TO_PITCH: Pitch[] = [
  "C4", // 0
  "D4", // 1
  "E4", // 2 - line 5 (bottom)
  "F4", // 3
  "G4", // 4 - line 4
  "A4", // 5
  "B4", // 6 - line 3 (middle)
  "C5", // 7
  "D5", // 8 - line 2 (visible when staffLines >= 4)
  "E5", // 9
  "F5", // 10 - line 1 (top, visible when staffLines = 5)
  "G5", // 11 - above top line
];

// getStaffCenterY imported from @/lib/layoutUtils

export function getSystemFromY(
  y: number,
  systemCount: number,
  staffLines?: number,
): number {
  // Use actual staff visual boundaries instead of simple SYSTEM_HEIGHT division
  // Each staff has valid note placement from position 7 (top) to position 0 (bottom)
  // Position 7: y = staffCenterY - 48 (above top line)
  // Position 0: y = staffCenterY + 64 (below bottom line)
  // Lyrics zone extends to staffCenterY + LINE_SPACING * 3 + 45 (approximately +141)
  // For gaps between systems, use midpoint as boundary

  for (let sys = 0; sys < systemCount; sys++) {
    const staffCenterY = getStaffCenterY(sys, staffLines);

    // Calculate visual boundaries for this system
    // Extend beyond the exact note positions to catch clicks near the staff
    const topNoteY = staffCenterY - 48; // Position 7 (highest note)
    // Include lyrics zone in the visual extent (lyrics go to staffCenterY + ~141)
    const bottomVisualY = staffCenterY + LINE_SPACING * 3 + 45; // Bottom of lyrics zone

    // Top boundary: midpoint to previous system, or 0 for first system
    let topBound: number;
    if (sys === 0) {
      topBound = 0;
    } else {
      // Use previous system's lyrics zone bottom for calculating boundary
      const prevBottomVisualY =
        getStaffCenterY(sys - 1, staffLines) + LINE_SPACING * 3 + 45;
      topBound = (prevBottomVisualY + topNoteY) / 2;
    }

    // Bottom boundary: midpoint to next system, or Infinity for last system
    let bottomBound: number;
    if (sys === systemCount - 1) {
      bottomBound = Infinity;
    } else {
      const nextTopNoteY = getStaffCenterY(sys + 1, staffLines) - 48;
      bottomBound = (bottomVisualY + nextTopNoteY) / 2;
    }

    if (y >= topBound && y < bottomBound) {
      return sys;
    }
  }

  // Fallback: use simple division (should rarely reach here)
  const system = Math.floor((y - SYSTEM_TOP_MARGIN) / SYSTEM_HEIGHT);
  return Math.max(0, Math.min(systemCount - 1, system));
}

/**
 * Get the pitch at a given Y coordinate on the staff.
 * The max position depends on staffLines:
 * - staffLines = 3: max position 7 (C5) - space above middle line
 * - staffLines = 4: max position 9 (E5) - space above line 2
 * - staffLines = 5: max position 11 (G5) - space above line 1
 */
export function getPitchFromY(
  y: number,
  system: number,
  staffLines: number = 3,
): Pitch {
  const staffCenterY = getStaffCenterY(system, staffLines);
  // Line 5 (E4, position 2) is at staffCenterY + 2*LINE_SPACING (64px below center)
  // Must match getYFromPitch calculation
  const bottomLineY = staffCenterY + 2 * LINE_SPACING;
  const position = Math.round((bottomLineY - y) / (LINE_SPACING / 2)) + 2;

  // Max position depends on visible staff lines
  const maxPosition = staffLines === 5 ? 11 : staffLines === 4 ? 9 : 7;

  const clamped = Math.max(0, Math.min(maxPosition, position));

  // Guard against NaN or out-of-bounds (can happen with invalid mouse coordinates)
  if (!Number.isFinite(clamped) || clamped >= POSITION_TO_PITCH.length) {
    console.warn(
      `[getPitchFromY] Invalid position calculated: y=${y}, system=${system}, position=${position}, clamped=${clamped}. Defaulting to C4.`,
    );
    return "C4"; // Default to middle C
  }

  return POSITION_TO_PITCH[clamped];
}

// Parse pitch into components: "C#4" -> { note: "C", accidental: "#", octave: 4 }
export function parsePitch(pitch: Pitch): {
  note: string;
  accidental: "#" | "b" | null;
  octave: number;
} | null {
  if (pitch === "REST") return null;
  const match = pitch.match(/^([A-G])(#|b)?(\d)$/);
  if (!match) return null;
  const [, note, accidental, octaveStr] = match;
  return {
    note,
    accidental: (accidental as "#" | "b") || null,
    octave: parseInt(octaveStr, 10),
  };
}

// Build pitch from components: { note: "C", accidental: "#", octave: 4 } -> "C#4"
export function buildPitch(
  note: string,
  accidental: "#" | "b" | null,
  octave: number,
): Pitch {
  const pitchStr = `${note}${accidental || ""}${octave}`;
  return pitchStr as Pitch;
}

// Change octave with clamping to valid range (C3 min, C6 max)
export function changeOctave(pitch: Pitch, direction: "up" | "down"): Pitch {
  const parsed = parsePitch(pitch);
  if (!parsed) return pitch;

  const newOctave = direction === "up" ? parsed.octave + 1 : parsed.octave - 1;

  // Clamp to valid range: C3 to C6
  // C6 is the max, but only natural C6 is valid (no C#6 or higher)
  if (newOctave < 3) return pitch;
  if (newOctave > 6) return pitch;
  if (newOctave === 6 && (parsed.note !== "C" || parsed.accidental !== null)) {
    return pitch; // Only C6 is valid in octave 6
  }

  return buildPitch(parsed.note, parsed.accidental, newOctave);
}

/**
 * Convert a pitch to its Y coordinate on the staff.
 *
 * Pitch Position System:
 * - Position 0 = Middle C (C4), which is on a ledger line below the treble staff
 * - Position 2 = E4, which sits ON Line 5 (bottom line of treble staff)
 * - Position 4 = G4, which sits ON Line 4 (second from bottom, where treble clef curls)
 * - Position 6 = B4, which sits ON Line 3 (middle line)
 * - Each position step = one "slot" (either a line or a space)
 *
 * The formula converts position to Y coordinate:
 * 1. Start from Line 5 (bottom line) at staffCenterY + 64
 * 2. Move UP by (position - 2) half-line-spacings
 *    (position 2 is E4 on Line 5, so we measure from there)
 *
 * Visual mapping (treble clef):
 *   Pos 10 = F5 → Line 1 (top)      Y = staffCenterY - 64
 *   Pos  8 = D5 → Line 2            Y = staffCenterY - 32
 *   Pos  6 = B4 → Line 3 (middle)   Y = staffCenterY
 *   Pos  4 = G4 → Line 4            Y = staffCenterY + 32
 *   Pos  2 = E4 → Line 5 (bottom)   Y = staffCenterY + 64
 */
export function getYFromPitch(
  pitch: Pitch | undefined | null,
  system: number,
  staffLines?: number,
): number {
  // Guard against undefined/null pitch
  if (!pitch) {
    console.warn("[getYFromPitch] Undefined pitch, defaulting to staff center");
    return getStaffCenterY(system, staffLines);
  }

  const pos = PITCH_POSITIONS[pitch] ?? getPitchPosition(pitch);
  const staffCenterY = getStaffCenterY(system, staffLines);
  if (pos < 0) return staffCenterY;

  // Line 5 (E4, position 2) is at staffCenterY + 2*LINE_SPACING (64px below center)
  // Each position step moves by LINE_SPACING/2 (16px)
  // Sharps/flats use the same staff position as their natural note
  const bottomLineY = staffCenterY + 2 * LINE_SPACING;
  return bottomLineY - (pos - 2) * (LINE_SPACING / 2);
}
