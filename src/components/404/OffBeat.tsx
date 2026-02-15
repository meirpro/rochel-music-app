"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  StaffLines,
  TrebleClef,
  BarLine,
  pitchToY,
  getNoteColor,
  LINE_SPACING,
} from "@/lib/staffPrimitives";

/**
 * 404 Design #4: "Off Beat"
 * Notes on a real staff, but one note bounces at the wrong rhythm.
 */
export function OffBeat() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 120);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const staffCenterY = 130;
  const staffLeft = 10;
  const staffRight = 520;

  // Notes with their positions and timing
  const notes = [
    { pitch: "E4", x: 130, delay: 0 },
    { pitch: "G4", x: 210, delay: 15 },
    { pitch: "F4", x: 290, delay: 41, offBeat: true }, // this one is off
    { pitch: "A4", x: 370, delay: 60 },
    { pitch: "C5", x: 450, delay: 80 },
  ];

  const getBounceOffset = (noteIndex: number) => {
    const note = notes[noteIndex];
    const phase = ((tick + note.delay) % 40) / 40;

    if (note.offBeat) {
      // Off-beat: bounces with a different period
      const offPhase = ((tick + 25) % 53) / 53;
      return Math.abs(Math.sin(offPhase * Math.PI)) * -14;
    }

    // Regular beat
    return Math.abs(Math.sin(phase * Math.PI)) * -10;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <svg
        viewBox="0 0 540 270"
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

        {/* Bouncing notes */}
        {notes.map((note, i) => {
          const baseY = pitchToY(note.pitch, staffCenterY);
          const bounceOffset = getBounceOffset(i);
          const y = baseY + bounceOffset;
          const noteColor = note.offBeat
            ? "#f59e0b"
            : getNoteColor(note.pitch as "E4");

          return (
            <g key={i}>
              {/* Note head - same params as NoteElement */}
              <ellipse
                cx={note.x}
                cy={y}
                rx={12}
                ry={10}
                fill={noteColor}
                stroke={noteColor}
                strokeWidth={2}
                transform={`rotate(-15 ${note.x} ${y})`}
              />
              {/* Stem — direction based on resting position, not bounced y */}
              <line
                x1={baseY > staffCenterY ? note.x + 12 : note.x - 11}
                y1={y}
                x2={baseY > staffCenterY ? note.x + 12 : note.x - 11}
                y2={baseY > staffCenterY ? y - 40 : y + 40}
                stroke={noteColor}
                strokeWidth={3}
              />

              {/* Off-beat wobble indicator */}
              {note.offBeat && (
                <text
                  x={note.x}
                  y={staffCenterY - 3 * LINE_SPACING}
                  textAnchor="middle"
                  fontSize="16"
                  fill="#f59e0b"
                  fontWeight="bold"
                  fontStyle="italic"
                >
                  ~
                </text>
              )}
            </g>
          );
        })}

        {/* "off beat" label */}
        <text
          x="290"
          y={staffCenterY - 3.5 * LINE_SPACING}
          textAnchor="middle"
          fontSize="13"
          fill="#f59e0b"
          fontWeight="600"
          fontStyle="italic"
        >
          off beat!
        </text>
      </svg>

      {/* Text */}
      <h1 className="text-6xl font-bold text-amber-400 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-amber-700 mb-3">
        You&apos;re a little off beat!
      </h2>
      <p className="text-amber-600 mb-8 text-center max-w-sm">
        This page lost its rhythm. Let&apos;s get you back in time with the rest
        of the music.
      </p>

      <Link
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        Get Back on Beat
      </Link>
    </div>
  );
}
