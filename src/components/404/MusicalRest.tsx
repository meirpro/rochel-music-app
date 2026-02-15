"use client";

import Link from "next/link";
import {
  StaffLines,
  TrebleClef,
  BarLine,
  LINE_SPACING,
} from "@/lib/staffPrimitives";

/**
 * 404 Design #2: "Musical Rest"
 * A real staff with a whole rest symbol and sleeping Zs.
 */
export function MusicalRest() {
  const staffCenterY = 140;
  const staffLeft = 10;
  const staffRight = 360;
  const measureCenter = 225;

  // Whole rest: rectangle hanging below the 2nd line from top (line at -1 * LINE_SPACING)
  const restLineY = staffCenterY - 1 * LINE_SPACING;
  const restY = restLineY; // hangs below this line
  const restW = 20;
  const restH = 10;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="relative mb-6">
        <svg
          viewBox="0 0 380 280"
          className="w-full max-w-2xl"
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

          {/* Whole rest - rectangle hanging below the 4th line */}
          <rect
            x={measureCenter - restW / 2}
            y={restY}
            width={restW}
            height={restH}
            fill="#0d9488"
            rx={1}
          />

          {/* Floating Zs */}
          <text
            x={measureCenter + 30}
            y={staffCenterY - 2.5 * LINE_SPACING}
            fontSize="28"
            fill="#5eead4"
            fontWeight="600"
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0.4;0.9;0.4"
              dur="2s"
              repeatCount="indefinite"
            />
            z
          </text>
          <text
            x={measureCenter + 50}
            y={staffCenterY - 3.2 * LINE_SPACING}
            fontSize="22"
            fill="#99f6e4"
            fontWeight="600"
          >
            <animate
              attributeName="opacity"
              values="0.3;0.8;0.3"
              dur="2s"
              begin="0.4s"
              repeatCount="indefinite"
            />
            z
          </text>
          <text
            x={measureCenter + 65}
            y={staffCenterY - 3.8 * LINE_SPACING}
            fontSize="16"
            fill="#ccfbf1"
            fontWeight="600"
          >
            <animate
              attributeName="opacity"
              values="0.2;0.7;0.2"
              dur="2s"
              begin="0.8s"
              repeatCount="indefinite"
            />
            z
          </text>
        </svg>
      </div>

      {/* Text */}
      <h1 className="text-6xl font-bold text-teal-400 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-teal-700 mb-3">
        Time for a Rest
      </h2>
      <p className="text-teal-600 mb-8 text-center max-w-sm">
        This page is taking a pause. In music, rests are just as important as
        notes - but this rest wasn&apos;t planned!
      </p>

      <Link
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        End the Rest
      </Link>
    </div>
  );
}
