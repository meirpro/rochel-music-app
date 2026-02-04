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

/**
 * Menu rest icon SVG for context menu
 * Shows the appropriate rest symbol based on duration
 */
export function MenuRestIcon({
  duration = 1,
  color = "#6b7280",
}: {
  duration?: number;
  color?: string;
}) {
  // Determine rest type
  const isWhole = duration === 4;
  const isHalf = duration === 2;
  const isQuarter = duration === 1;
  // Eighth (0.5) or other is default

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      className="inline-block flex-shrink-0"
    >
      {isWhole && (
        // Whole rest: rectangle hanging below line
        <rect x="6" y="8" width="12" height="5" fill={color} rx={1} />
      )}
      {isHalf && (
        // Half rest: rectangle sitting on line
        <rect x="6" y="11" width="12" height="5" fill={color} rx={1} />
      )}
      {isQuarter && (
        // Quarter rest: authentic crotchet shape (scaled for 24x24)
        <path
          d="M14 0c-.15.06-.24.28-.17.43l.46.57c.5.56.59.7.7.96.44.9.2 2.04-.57 2.76-.07.09-.35.32-.62.52-.76.66-1.11.97-1.24 1.36-.05.09-.05.17-.05.3-.02.3 0 .33.9 1.38 1.22 1.46 2.1 2.5 2.16 2.56l.06.06-.08-.04c-1.2-.5-2.56-.74-3.02-.52a.52.52 0 0 0-.31.3c-.18.38-.13.92.13 1.73.24.72.72 1.69 1.2 2.41.2.31.57.79.61.81.07.06.16.04.22 0 .06-.09.06-.16-.06-.3-.46-.66-.68-2.02-.42-2.74.11-.33.24-.5.48-.61.64-.28 2.04.07 2.63.65.04.05.13.14.18.16.15.06.37-.02.44-.18.09-.15.04-.26-.16-.5-.37-.44-1.48-1.75-1.64-1.95-.4-.46-.57-.9-.61-1.44-.02-.7.26-1.44.79-1.93.06-.09.35-.33.61-.52.81-.68 1.14-1.05 1.27-1.4.09-.29.05-.55-.15-.79-.07-.06-.83-1-1.73-2.08-1.23-1.44-1.67-1.97-1.73-1.99a.45.45 0 0 0-.29.02"
          fill={color}
          transform="translate(-6.2, 2) scale(1.2)"
        />
      )}
      {!isWhole && !isHalf && !isQuarter && (
        // Eighth rest: authentic quaver shape (scaled for 24x24)
        <path
          d="M14.5 0c-.57.11-1 .5-1.2 1.04-.04.17-.04.22-.04.46 0 .33.02.5.17.76.22.44.68.79 1.2.92.55.15 1.47.02 2.52-.33l.26-.09-1.29 3.57-1.27 3.56s.04.02.11.07c.13.08.35.15.5.15.26 0 .59-.15.64-.28 0-.04.61-2.12 1.36-4.6l1.31-4.53-.04-.06c-.11-.13-.33-.18-.46-.07-.04.04-.11.13-.15.2-.2.33-.7.92-.96 1.14-.24.2-.37.22-.59.13-.2-.11-.26-.22-.4-.81-.13-.59-.28-.85-.61-1.07a1.34 1.34 0 0 0-1.05-.17"
          fill={color}
          transform="translate(-6, 2) scale(1.8)"
        />
      )}
    </svg>
  );
}
