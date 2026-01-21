"use client";

import { useEffect, useRef, useState } from "react";

interface InlineLyricInputProps {
  initialText: string;
  position: { x: number; y: number };
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

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
        zIndex: 50,
      }}
    >
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
  );
}
