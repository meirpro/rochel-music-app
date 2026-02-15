"use client";

import Link from "next/link";
import {
  StaffLines,
  TrebleClef,
  BarLine,
  LINE_SPACING,
} from "@/lib/staffPrimitives";

/**
 * 404 Design #5: "Empty Measure"
 * A real staff with time signature, bar lines, and a whole rest.
 * Minimalist and on-brand with the editor.
 */
export function EmptyMeasure() {
  const staffCenterY = 140;
  const staffLeft = 10;
  const staffRight = 520;

  // Measure area (after time sig, before closing bar)
  const measureStart = 120;
  const measureEnd = staffRight;
  const measureCenter = (measureStart + measureEnd) / 2;

  // Whole rest: hangs below the 2nd line from top
  const restLineY = staffCenterY - 1 * LINE_SPACING;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <svg
        viewBox="0 0 540 300"
        className="w-full max-w-2xl mb-6"
        aria-hidden="true"
      >
        {/* Staff lines */}
        <StaffLines
          staffCenterY={staffCenterY}
          staffLeft={staffLeft}
          staffRight={staffRight}
        />

        {/* Treble clef */}
        <TrebleClef staffCenterY={staffCenterY} x={12} color="#7c3aed" />

        {/* Opening bar line */}
        <BarLine x={measureStart} staffCenterY={staffCenterY} color="#7c3aed" />

        {/* Whole rest symbol - rectangle hanging below 2nd line */}
        <rect
          x={measureCenter - 10}
          y={restLineY}
          width={20}
          height={10}
          fill="#a78bfa"
          rx={1}
        />

        {/* Closing bar line */}
        <BarLine
          x={measureEnd - 6}
          staffCenterY={staffCenterY}
          color="#7c3aed"
        />

        {/* Final thick bar (end) */}
        <BarLine
          x={measureEnd}
          staffCenterY={staffCenterY}
          color="#7c3aed"
          strokeWidth={4}
        />

        {/* "tacet" annotation below staff */}
        <text
          x={measureCenter}
          y={staffCenterY + 3.5 * LINE_SPACING}
          textAnchor="middle"
          fontSize="13"
          fill="#a78bfa"
          fontStyle="italic"
        >
          tacet
        </text>
      </svg>

      {/* Text */}
      <h1 className="text-6xl font-bold text-violet-400 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-violet-700 mb-3">
        This measure is empty
      </h2>
      <p className="text-violet-500 mb-8 text-center max-w-sm">
        Nothing has been composed here yet. Head back to the editor and fill it
        with something beautiful.
      </p>

      <Link
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        Go Compose Something
      </Link>
    </div>
  );
}
