// Reusable SVG note components for the Learn pages
// Uses duration values consistent with the main NoteEditor

export type NoteDuration = 0.25 | 0.5 | 0.75 | 1 | 1.5 | 2 | 3 | 4;

interface NoteSVGProps {
  duration: NoteDuration;
  size?: number;
  color?: string;
}

/**
 * SVG Note component for visual display
 * Supports all note durations used in the main editor:
 * - 4 = whole note
 * - 3 = dotted half note
 * - 2 = half note
 * - 1.5 = dotted quarter note
 * - 1 = quarter note
 * - 0.75 = dotted eighth note
 * - 0.5 = eighth note
 * - 0.25 = sixteenth note
 */
export function NoteSVG({
  duration,
  size = 48,
  color = "#7c3aed",
}: NoteSVGProps) {
  // Determine note characteristics based on duration
  const isWhole = duration === 4;
  const isHalf = duration === 2 || duration === 3;
  const isHollow = isWhole || isHalf;
  const hasStem = !isWhole;
  const hasFlag = duration === 0.5 || duration === 0.75;
  const hasDoubleFlag = duration === 0.25;
  const hasDot = duration === 0.75 || duration === 1.5 || duration === 3;

  // Scale factor based on size
  const scale = size / 48;

  // Adjust width for dotted notes
  const width = hasDot ? size * 1.3 : size;

  return (
    <svg
      width={width}
      height={size * 1.5}
      viewBox={hasDot ? "0 0 62 72" : "0 0 48 72"}
      className="mx-auto"
    >
      {/* Stem */}
      {hasStem && (
        <line
          x1={36}
          y1={36}
          x2={36}
          y2={8}
          stroke={color}
          strokeWidth={3 * scale}
        />
      )}

      {/* Single flag for eighth notes - stroke only like main editor */}
      {hasFlag && (
        <path
          d="M36 8 Q46 18 46 30"
          stroke={color}
          strokeWidth={3.5 * scale}
          fill="none"
        />
      )}

      {/* Double flag for sixteenth notes - stroke only */}
      {hasDoubleFlag && (
        <>
          <path
            d="M36 8 Q46 16 46 26"
            stroke={color}
            strokeWidth={3 * scale}
            fill="none"
          />
          <path
            d="M36 16 Q46 24 46 34"
            stroke={color}
            strokeWidth={3 * scale}
            fill="none"
          />
        </>
      )}

      {/* Notehead - sized like main editor (rx=13, ry=11) */}
      <ellipse
        cx={24}
        cy={40}
        rx={13}
        ry={11}
        fill={isHollow ? "#ffffff" : color}
        stroke={color}
        strokeWidth={2.5 * scale}
        transform="rotate(-20 24 40)"
      />

      {/* Dot for dotted notes */}
      {hasDot && <circle cx={50} cy={36} r={4 * scale} fill={color} />}
    </svg>
  );
}

// Legacy type exports for backward compatibility
export type NoteType = "whole" | "half" | "quarter" | "eighth";
export type DottedNoteType = "half" | "quarter" | "eighth";

// Helper to convert legacy string types to duration
export function noteTypeToDuration(type: NoteType): NoteDuration {
  switch (type) {
    case "whole":
      return 4;
    case "half":
      return 2;
    case "quarter":
      return 1;
    case "eighth":
      return 0.5;
  }
}

export function dottedNoteTypeToDuration(type: DottedNoteType): NoteDuration {
  switch (type) {
    case "half":
      return 3;
    case "quarter":
      return 1.5;
    case "eighth":
      return 0.75;
  }
}

// Helper to get note name for display
export function getDurationName(duration: NoteDuration): string {
  switch (duration) {
    case 4:
      return "Whole";
    case 3:
      return "Dotted Half";
    case 2:
      return "Half";
    case 1.5:
      return "Dotted Quarter";
    case 1:
      return "Quarter";
    case 0.75:
      return "Dotted Eighth";
    case 0.5:
      return "Eighth";
    case 0.25:
      return "Sixteenth";
  }
}

/**
 * SVG component for two beamed eighth notes
 * Used to show beamed pairs in rhythm teaching
 * Matches main editor's beam rendering style
 */
export function BeamedEighthsSVG({
  size = 32,
  color = "#7c3aed",
}: {
  size?: number;
  color?: string;
}) {
  const scale = size / 32;
  const beamThickness = 5 * scale;

  // Beam endpoints (horizontal beam)
  const beamY = 6;
  const leftStemX = 14;
  const rightStemX = 44;

  return (
    <svg
      width={size * 1.8}
      height={size * 1.5}
      viewBox="0 0 58 48"
      className="inline-block align-middle"
    >
      {/* Left stem - from notehead to beam */}
      <line
        x1={leftStemX}
        y1={32}
        x2={leftStemX}
        y2={beamY}
        stroke={color}
        strokeWidth={3 * scale}
      />
      {/* Right stem - from notehead to beam */}
      <line
        x1={rightStemX}
        y1={32}
        x2={rightStemX}
        y2={beamY}
        stroke={color}
        strokeWidth={3 * scale}
      />
      {/* Beam - polygon like main editor */}
      <polygon
        points={`
          ${leftStemX - 1},${beamY}
          ${rightStemX + 1},${beamY}
          ${rightStemX + 1},${beamY + beamThickness}
          ${leftStemX - 1},${beamY + beamThickness}
        `}
        fill={color}
      />
      {/* Left notehead - sized like main editor */}
      <ellipse
        cx={10}
        cy={36}
        rx={9}
        ry={8}
        fill={color}
        transform="rotate(-20 10 36)"
      />
      {/* Right notehead */}
      <ellipse
        cx={40}
        cy={36}
        rx={9}
        ry={8}
        fill={color}
        transform="rotate(-20 40 36)"
      />
    </svg>
  );
}
