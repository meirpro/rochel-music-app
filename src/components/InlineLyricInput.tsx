"use client";

import { useEffect, useRef, useState } from "react";

interface InlineLyricInputProps {
  initialText: string;
  position: { x: number; y: number };
  absoluteBeat?: number;
  onSave: (text: string) => void;
  onCancel: () => void;
  onNavigate: (direction: "next" | "prev") => void;
}

/**
 * Inline text input for editing lyrics directly on the staff.
 * Positioned as an HTML overlay on top of the SVG canvas.
 *
 * Keyboard shortcuts:
 * - Tab: Save and move to next beat
 * - Shift+Tab: Save and move to previous beat
 * - Enter: Save and close
 * - Escape: Cancel (restore original)
 */
export function InlineLyricInput({
  initialText,
  position,
  absoluteBeat,
  onSave,
  onCancel,
  onNavigate,
}: InlineLyricInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialText);

  // Auto-focus and select text on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // Update value when navigating to a new beat position
  // Watch absoluteBeat too, since initialText might be "" for both old and new positions
  useEffect(() => {
    setValue(initialText);
    // Re-select text when navigating
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, [initialText, absoluteBeat]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      onSave(value.trim());
      onNavigate(e.shiftKey ? "prev" : "next");
    } else if (e.key === "Enter") {
      e.preventDefault();
      onSave(value.trim());
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    // Save on blur (clicking outside)
    onSave(value.trim());
  };

  // Format beat display (e.g., "Beat 4.5" or "Beat 4")
  const formatBeat = (beat: number) => {
    const displayBeat = beat + 1; // Convert 0-indexed to 1-indexed
    return Number.isInteger(displayBeat)
      ? `Beat ${displayBeat}`
      : `Beat ${displayBeat.toFixed(1)}`;
  };

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: position.x,
        top: position.y,
        transform: "translateX(-50%)", // Only center horizontally, position below
        zIndex: 50,
      }}
    >
      <div className="flex flex-col items-center gap-1">
        {/* Beat indicator */}
        {absoluteBeat !== undefined && (
          <div className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {formatBeat(absoluteBeat)}
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          dir="auto"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="
            w-24 px-2 py-1 text-center text-sm
            border-2 border-amber-400 rounded-md
            bg-white shadow-lg
            focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-500
          "
          placeholder="..."
        />
      </div>
    </div>
  );
}
