"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * 404 Design #3: "Wrong Key"
 * A piano keyboard with one key highlighted red — you hit the wrong one!
 */
export function WrongKey() {
  const [hoveredKey, setHoveredKey] = useState<number | null>(null);

  // Piano keys
  const whiteKeys = Array.from({ length: 10 }, (_, i) => ({ x: i * 40 }));
  const blackKeyPositions = [0, 1, 3, 4, 5, 7, 8]; // C#, D#, F#, G#, A#, C#, D#
  const wrongKeyIndex = 5; // the A key

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <svg
        viewBox="0 0 420 130"
        className="w-full max-w-lg mb-6"
        aria-hidden="true"
      >
        {/* Piano keyboard */}
        <g transform="translate(10, 5)">
          {/* Piano body */}
          <rect x="0" y="0" width="400" height="120" rx="6" fill="#1e1b2e" />

          {/* White keys */}
          {whiteKeys.map((key, i) => (
            <rect
              key={`w-${i}`}
              x={key.x + 1}
              y="6"
              width="38"
              height="108"
              rx="3"
              fill={
                i === wrongKeyIndex
                  ? "#fca5a5"
                  : hoveredKey === i
                    ? "#e0e7ff"
                    : "#f8fafc"
              }
              stroke={i === wrongKeyIndex ? "#ef4444" : "#d1d5db"}
              strokeWidth="1"
              className="transition-colors duration-150"
              onMouseEnter={() => setHoveredKey(i)}
              onMouseLeave={() => setHoveredKey(null)}
            />
          ))}

          {/* Wrong key X */}
          <g opacity="0.6">
            <line
              x1={wrongKeyIndex * 40 + 12}
              y1="76"
              x2={wrongKeyIndex * 40 + 30}
              y2="96"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1={wrongKeyIndex * 40 + 30}
              y1="76"
              x2={wrongKeyIndex * 40 + 12}
              y2="96"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>

          {/* Black keys */}
          {blackKeyPositions.map((pos, i) => (
            <rect
              key={`b-${i}`}
              x={pos * 40 + 28}
              y="6"
              width="24"
              height="68"
              rx="3"
              fill="#1e1b2e"
              stroke="#374151"
              strokeWidth="0.5"
            />
          ))}
        </g>
      </svg>

      {/* Text */}
      <h1 className="text-6xl font-bold text-rose-400 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-rose-700 mb-3">
        You hit the wrong key!
      </h2>
      <p className="text-rose-500 mb-8 text-center max-w-sm">
        Don&apos;t worry, every musician hits a wrong note sometimes. Let&apos;s
        find your way back to the right page.
      </p>

      <Link
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        Find the Right Key
      </Link>
    </div>
  );
}
