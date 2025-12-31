"use client";

import { useState } from "react";

// Note colors matching the color legend
const NOTE_COLORS: Record<string, string> = {
  C: "#ff5a5f",
  D: "#ffb020",
  E: "#ffe14d",
  F: "#4ade80",
  G: "#60a5fa",
  A: "#a78bfa",
  B: "#ff77c8",
};

interface MusicRulesSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MusicRulesSidebar({
  isOpen,
  onToggle,
}: MusicRulesSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    "durations",
  );

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-800">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            expandedSection === id ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expandedSection === id && (
        <div className="px-4 pb-4 text-sm text-gray-600">{children}</div>
      )}
    </div>
  );

  // Mini note SVG for examples
  const MiniNote = ({
    type,
    color = NOTE_COLORS.G,
  }: {
    type: "whole" | "half" | "quarter" | "eighth";
    color?: string;
  }) => {
    const isHollow = type === "whole" || type === "half";
    const hasStem = type !== "whole";
    const hasFlag = type === "eighth";

    return (
      <svg width="20" height="28" viewBox="0 0 20 28" className="inline-block">
        <ellipse
          cx="10"
          cy="20"
          rx="5"
          ry="3.5"
          fill={isHollow ? "#fff" : color}
          stroke={isHollow ? color : "#000"}
          strokeWidth={isHollow ? 1.5 : 0.5}
          transform="rotate(-15 10 20)"
        />
        {hasStem && (
          <line
            x1="14"
            y1="19"
            x2="14"
            y2="6"
            stroke={color}
            strokeWidth={1.5}
          />
        )}
        {hasFlag && (
          <path
            d="M 14 6 Q 18 9 17 14"
            stroke={color}
            strokeWidth={1.5}
            fill="none"
          />
        )}
      </svg>
    );
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={`fixed top-1/2 -translate-y-1/2 z-50 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg rounded-l-xl px-3 py-4 transition-all flex flex-col items-center gap-1 ${
          isOpen ? "right-80" : "right-0"
        }`}
        title={isOpen ? "Hide music rules" : "Show music rules"}
      >
        <span className="text-lg">?</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-40 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
          <h2 className="text-lg font-bold text-gray-800">
            Music Notation Rules
          </h2>
          <p className="text-xs text-gray-500">
            Learn about music symbols and notation
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {/* Note Durations */}
          <Section id="durations" title="Note Durations">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MiniNote type="whole" />
                <div>
                  <span className="font-medium text-gray-700">Whole Note</span>
                  <span className="text-gray-500"> - 4 beats</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MiniNote type="half" />
                <div>
                  <span className="font-medium text-gray-700">Half Note</span>
                  <span className="text-gray-500"> - 2 beats</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MiniNote type="quarter" />
                <div>
                  <span className="font-medium text-gray-700">
                    Quarter Note
                  </span>
                  <span className="text-gray-500"> - 1 beat</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MiniNote type="eighth" />
                <div>
                  <span className="font-medium text-gray-700">Eighth Note</span>
                  <span className="text-gray-500"> - 1/2 beat</span>
                </div>
              </div>
            </div>
          </Section>

          {/* Beaming Rules */}
          <Section id="beaming" title="Beaming Rules">
            <div className="space-y-3">
              <p>
                <strong>Beams</strong> connect eighth notes (and shorter) to
                show rhythm groupings.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="font-medium text-gray-700">Rules:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Only eighth notes or shorter can be beamed</li>
                  <li>Never beam across bar lines</li>
                  <li>
                    In 4/4: don&apos;t beam across the middle of the measure
                  </li>
                  <li>In 6/8: beam in groups of 3</li>
                </ul>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  <MiniNote type="eighth" color={NOTE_COLORS.C} />
                  <MiniNote type="eighth" color={NOTE_COLORS.E} />
                </div>
                <span className="text-gray-500">
                  = Two eighth notes beamed together
                </span>
              </div>
              <p className="text-gray-500 italic text-xs">
                When notes have different colors, the beam shows a gradient!
              </p>
            </div>
          </Section>

          {/* Stem Direction */}
          <Section id="stems" title="Stem Direction">
            <div className="space-y-3">
              <p>
                Stem direction depends on the note&apos;s position on the staff:
              </p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">↑</span>
                  <span>
                    <strong>Stems up:</strong> Notes below the middle line (B4)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">↓</span>
                  <span>
                    <strong>Stems down:</strong> Notes above the middle line
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-xs">
                For beamed groups, all stems follow the direction of the note
                furthest from the middle line.
              </p>
            </div>
          </Section>

          {/* Time Signatures */}
          <Section id="time" title="Time Signatures">
            <div className="space-y-3">
              <p>Time signatures tell you how many beats per measure:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-gray-700">4/4</div>
                  <div className="text-xs text-gray-500">
                    4 beats per measure
                  </div>
                  <div className="text-xs text-gray-400">Beam: groups of 2</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-gray-700">3/4</div>
                  <div className="text-xs text-gray-500">
                    3 beats per measure
                  </div>
                  <div className="text-xs text-gray-400">Beam: each beat</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-gray-700">6/8</div>
                  <div className="text-xs text-gray-500">6 eighth notes</div>
                  <div className="text-xs text-gray-400">Beam: groups of 3</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold text-gray-700">2/4</div>
                  <div className="text-xs text-gray-500">
                    2 beats per measure
                  </div>
                  <div className="text-xs text-gray-400">Beam: each beat</div>
                </div>
              </div>
            </div>
          </Section>

          {/* Color Legend */}
          <Section id="colors" title="Note Colors">
            <div className="space-y-3">
              <p>Each pitch has its own color to help you learn:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(NOTE_COLORS).map(([note, color]) => (
                  <div key={note} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full border border-black/10 flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {note}
                    </div>
                    <span className="text-gray-600">
                      {note}
                      {note === "C"
                        ? " (Do)"
                        : note === "D"
                          ? " (Re)"
                          : note === "E"
                            ? " (Mi)"
                            : note === "F"
                              ? " (Fa)"
                              : note === "G"
                                ? " (Sol)"
                                : note === "A"
                                  ? " (La)"
                                  : " (Ti)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Staff & Clef */}
          <Section id="staff" title="Staff & Clef">
            <div className="space-y-3">
              <p>
                The <strong>staff</strong> has 5 lines and 4 spaces. Notes are
                placed on lines or spaces to show pitch.
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-700 mb-2">
                  Treble Clef (G Clef):
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">𝄞</span>
                  <span className="text-gray-600">
                    Used for higher-pitched instruments and the right hand of
                    piano
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                The <strong>ledger line</strong> below the staff is middle C
                (C4).
              </p>
            </div>
          </Section>

          {/* Repeat Signs */}
          <Section id="repeats" title="Repeat Signs">
            <div className="space-y-3">
              <p>Repeat signs tell you to play a section again:</p>
              <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    <div className="w-1 h-6 bg-purple-500" />
                    <div className="w-1 h-6 bg-purple-500 ml-0.5" />
                    <div className="flex flex-col gap-1 ml-1">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">Start</span>
                </div>
                <span className="text-gray-400">...</span>
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    <div className="flex flex-col gap-1 mr-1">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                    </div>
                    <div className="w-1 h-6 bg-purple-500" />
                    <div className="w-1 h-6 bg-purple-500 ml-0.5" />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">End</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Click and drag repeat markers to reposition them. Double-click
                to remove.
              </p>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
