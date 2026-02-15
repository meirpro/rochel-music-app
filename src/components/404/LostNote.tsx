"use client";

import Link from "next/link";
import {
  StaffLines,
  TrebleClef,
  Note,
  BarLine,
  pitchToY,
} from "@/lib/staffPrimitives";

/**
 * 404 Design #1: "Lost Note"
 * A note that fell off the staff, sitting confused below the lines.
 * Uses real staff rendering from the editor.
 */
export function LostNote() {
  // Staff layout for our self-contained SVG
  const staffCenterY = 120;
  const staffLeft = 10;
  const staffRight = 520;

  // Notes on the staff - a melody with a gap
  const melody: { pitch: string; x: number; duration: number }[] = [
    { pitch: "E4", x: 130, duration: 1 },
    { pitch: "G4", x: 200, duration: 1 },
    // Ghost note gap at x=270 (F4)
    { pitch: "D5", x: 340, duration: 1 },
    { pitch: "C5", x: 410, duration: 1 },
  ];

  // The lost note
  const lostNoteX = 270;
  const lostNoteY = staffCenterY + 180; // way below the staff
  const ghostY = pitchToY("F4", staffCenterY);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* SVG Staff with real rendering */}
      <svg
        viewBox="0 0 540 340"
        className="w-full max-w-xl mb-6"
        aria-hidden="true"
      >
        {/* Staff lines */}
        <StaffLines
          staffCenterY={staffCenterY}
          staffLeft={staffLeft}
          staffRight={staffRight}
        />

        {/* Treble clef */}
        <TrebleClef staffCenterY={staffCenterY} x={12} />

        {/* Bar lines */}
        <BarLine x={staffLeft} staffCenterY={staffCenterY} strokeWidth={3} />
        <BarLine x={staffRight} staffCenterY={staffCenterY} />

        {/* Notes on staff */}
        {melody.map((n) => (
          <Note
            key={n.pitch + n.x}
            x={n.x}
            y={pitchToY(n.pitch, staffCenterY)}
            pitch={n.pitch as "E4" | "G4" | "D5" | "C5"}
            duration={n.duration}
            staffCenterY={staffCenterY}
          />
        ))}

        {/* Ledger line for C5 note doesn't need one, but C4 would */}

        {/* Ghost note (dashed outline where the lost note should be) */}
        <ellipse
          cx={lostNoteX}
          cy={ghostY}
          rx={12}
          ry={10}
          fill="none"
          stroke="#c4b5fd"
          strokeWidth={2}
          strokeDasharray="5 4"
          transform={`rotate(-15 ${lostNoteX} ${ghostY})`}
        />
        <text x={lostNoteX - 4} y={ghostY - 22} fontSize="16" fill="#c4b5fd">
          ?
        </text>

        {/* Dotted trail from ghost position to lost note */}
        <line
          x1={lostNoteX}
          y1={ghostY + 12}
          x2={lostNoteX}
          y2={lostNoteY - 50}
          stroke="#fbbf24"
          strokeWidth={1.5}
          strokeDasharray="5 5"
          opacity={0.5}
        />

        {/* The lost note - fallen below the staff */}
        <g className="animate-bounce" style={{ animationDuration: "2s" }}>
          {/* Note using real rendering but with amber color */}
          <ellipse
            cx={lostNoteX}
            cy={lostNoteY}
            rx={12}
            ry={10}
            fill="#f59e0b"
            stroke="#f59e0b"
            strokeWidth={2}
            transform={`rotate(-15 ${lostNoteX} ${lostNoteY})`}
          />
          <line
            x1={lostNoteX + 12}
            y1={lostNoteY}
            x2={lostNoteX + 12}
            y2={lostNoteY - 40}
            stroke="#f59e0b"
            strokeWidth={3}
          />
          {/* Confused face */}
          <text
            x={lostNoteX - 7}
            y={lostNoteY + 4}
            fontSize="9"
            fill="white"
            fontWeight="bold"
          >
            ?_?
          </text>
        </g>
      </svg>

      {/* Text */}
      <h1 className="text-6xl font-bold text-purple-400 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-purple-700 mb-3">
        This note wandered off the staff!
      </h2>
      <p className="text-purple-500 mb-8 text-center max-w-sm">
        Looks like this page took a tumble. Let&apos;s get you back to making
        music.
      </p>

      <Link
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        Back to the Music
      </Link>
    </div>
  );
}
