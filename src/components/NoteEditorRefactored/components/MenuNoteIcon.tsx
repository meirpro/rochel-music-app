// src/components/NoteEditorRefactored/components/MenuNoteIcon.tsx
// Extracted from NoteEditor.tsx lines 1088-1156

// Menu note icon SVG for context menu (matches actual note rendering)
export function MenuNoteIcon({
  duration,
  color = "#6b7280",
}: {
  duration: number;
  color?: string;
}) {
  // Determine note characteristics based on duration
  const isWhole = duration === 4;
  const isHalf = duration === 2 || duration === 3;
  const isHollow = isWhole || isHalf;
  const hasStem = !isWhole;
  const hasFlag = duration === 0.5 || duration === 0.75;
  const hasDoubleFlag = duration === 0.25;
  const hasDot = duration === 0.75 || duration === 1.5 || duration === 3;

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="inline-block flex-shrink-0"
    >
      {/* Note head */}
      <ellipse
        cx={isWhole ? 12 : 10}
        cy="16"
        rx="5"
        ry="3.5"
        fill={isHollow ? "transparent" : color}
        stroke={color}
        strokeWidth={isHollow ? 1.5 : 1}
        transform={`rotate(-15 ${isWhole ? 12 : 10} 16)`}
      />
      {/* Stem */}
      {hasStem && (
        <line x1="14" y1="15" x2="14" y2="4" stroke={color} strokeWidth={1.5} />
      )}
      {/* Single flag for eighth notes */}
      {hasFlag && (
        <path
          d="M 14 4 Q 19 7 17 12"
          stroke={color}
          strokeWidth={1.5}
          fill="none"
        />
      )}
      {/* Double flag for sixteenth notes */}
      {hasDoubleFlag && (
        <>
          <path
            d="M 14 4 Q 19 6 17 10"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
          />
          <path
            d="M 14 7 Q 19 9 17 13"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
          />
        </>
      )}
      {/* Dot for dotted notes */}
      {hasDot && <circle cx="18" cy="16" r="1.5" fill={color} />}
    </svg>
  );
}
