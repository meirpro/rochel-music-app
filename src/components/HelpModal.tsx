"use client";

import { useState } from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// SVG Note Components (matching the actual editor rendering)
const WholeNote = ({ color = "#3B82F6" }: { color?: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <ellipse
      cx="24"
      cy="24"
      rx="13"
      ry="11"
      fill="#ffffff"
      stroke={color}
      strokeWidth="2.5"
      transform="rotate(-20 24 24)"
    />
  </svg>
);

const HalfNote = ({ color = "#22C55E" }: { color?: string }) => (
  <svg width="48" height="56" viewBox="0 0 48 56">
    {/* Stem */}
    <line x1="36" y1="32" x2="36" y2="4" stroke={color} strokeWidth="3" />
    {/* Notehead */}
    <ellipse
      cx="24"
      cy="32"
      rx="13"
      ry="11"
      fill="#ffffff"
      stroke={color}
      strokeWidth="2.5"
      transform="rotate(-20 24 32)"
    />
  </svg>
);

const DottedQuarterNote = ({ color = "#F97316" }: { color?: string }) => (
  <svg width="60" height="56" viewBox="0 0 60 56">
    {/* Stem */}
    <line x1="36" y1="32" x2="36" y2="4" stroke={color} strokeWidth="3" />
    {/* Notehead */}
    <ellipse
      cx="24"
      cy="32"
      rx="13"
      ry="11"
      fill={color}
      stroke={color}
      strokeWidth="2.5"
      transform="rotate(-20 24 32)"
    />
    {/* Dot */}
    <circle cx="44" cy="30" r="4" fill={color} />
  </svg>
);

const QuarterNote = ({ color = "#A855F7" }: { color?: string }) => (
  <svg width="48" height="56" viewBox="0 0 48 56">
    {/* Stem */}
    <line x1="36" y1="32" x2="36" y2="4" stroke={color} strokeWidth="3" />
    {/* Notehead */}
    <ellipse
      cx="24"
      cy="32"
      rx="13"
      ry="11"
      fill={color}
      stroke={color}
      strokeWidth="2.5"
      transform="rotate(-20 24 32)"
    />
  </svg>
);

const EighthNote = ({ color = "#EC4899" }: { color?: string }) => (
  <svg width="48" height="56" viewBox="0 0 48 56">
    {/* Stem */}
    <line x1="36" y1="32" x2="36" y2="4" stroke={color} strokeWidth="3" />
    {/* Notehead */}
    <ellipse
      cx="24"
      cy="32"
      rx="13"
      ry="11"
      fill={color}
      stroke={color}
      strokeWidth="2.5"
      transform="rotate(-20 24 32)"
    />
    {/* Flag */}
    <path
      d="M 36 4 Q 46 14 46 28"
      stroke={color}
      strokeWidth="3.5"
      fill="none"
    />
  </svg>
);

const HELP_SECTIONS = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">
          Welcome to Rochel Music! Here&apos;s how to create your first song:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>
            <strong>Choose a tool</strong> from the right side (whole note, half
            note, etc.)
          </li>
          <li>
            <strong>Click on the staff</strong> where you want to place a note
          </li>
          <li>
            <strong>Click the Play button</strong> to hear your song!
          </li>
          <li>
            <strong>Save your song</strong> by clicking the save button and
            giving it a name
          </li>
        </ol>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Use the piano at the bottom to hear each note
            before placing it!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "note-durations",
    title: "Notes & Beaming",
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 font-bold">Note Durations:</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
            <WholeNote color="#3B82F6" />
            <div>
              <div className="font-bold text-blue-700">Whole Note</div>
              <div className="text-sm text-gray-600">4 beats (longest)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
            <HalfNote color="#22C55E" />
            <div>
              <div className="font-bold text-green-700">Half Note</div>
              <div className="text-sm text-gray-600">2 beats</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg">
            <DottedQuarterNote color="#F97316" />
            <div>
              <div className="font-bold text-orange-700">Dotted Quarter</div>
              <div className="text-sm text-gray-600">1.5 beats</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
            <QuarterNote color="#A855F7" />
            <div>
              <div className="font-bold text-purple-700">Quarter Note</div>
              <div className="text-sm text-gray-600">1 beat</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-pink-50 rounded-lg">
            <EighthNote color="#EC4899" />
            <div>
              <div className="font-bold text-pink-700">Eighth Note</div>
              <div className="text-sm text-gray-600">0.5 beats (shortest)</div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <p className="text-gray-700 font-bold mb-2">Beaming Eighth Notes:</p>
          <p className="text-gray-600 text-sm mb-2">
            Eighth notes connect with beams to show rhythm groupings.
          </p>
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <p className="font-bold text-blue-800 mb-1">Beat Groups:</p>
            <ul className="list-disc list-inside text-blue-700 space-y-0.5">
              <li>
                <strong>4/4:</strong> Beats 1-2 | Beats 3-4
              </li>
              <li>
                <strong>3/4:</strong> Each beat separate
              </li>
              <li>
                <strong>6/8:</strong> Groups of 3
              </li>
            </ul>
          </div>
          <p className="text-gray-500 italic text-xs mt-2">
            💡 Beams show gradients when notes have different colors!
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "note-colors",
    title: "Note Colors",
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">
          Each note has its own color to make learning easier:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { note: "C", color: "#ff5a5f", name: "Do" },
            { note: "D", color: "#ffb020", name: "Re" },
            { note: "E", color: "#ffe14d", name: "Mi" },
            { note: "F", color: "#4ade80", name: "Fa" },
            { note: "G", color: "#60a5fa", name: "Sol" },
            { note: "A", color: "#a78bfa", name: "La" },
            { note: "B", color: "#ff77c8", name: "Ti" },
          ].map(({ note, color, name }) => (
            <div
              key={note}
              className="flex items-center gap-2 p-2 bg-white rounded-lg border-2"
              style={{ borderColor: color }}
            >
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div>
                <div className="font-bold" style={{ color }}>
                  {note}
                </div>
                <div className="text-xs text-gray-500">{name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "keyboard-shortcuts",
    title: "Keyboard Shortcuts",
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">
          Speed up your composing with these shortcuts:
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium">Play Piano</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
              A-K
            </kbd>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium">Piano Sharps</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
              W E T Y U
            </kbd>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium">Undo</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
              Cmd+Z
            </kbd>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-medium">Redo</span>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
              Cmd+Shift+Z
            </kbd>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "time-signatures",
    title: "Time Signatures & Staff",
    content: (
      <div className="space-y-4">
        <p className="text-gray-700 font-bold">Time Signatures:</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-purple-50 rounded-lg p-2 text-center">
            <div className="text-xl font-bold text-purple-700">4/4</div>
            <div className="text-xs text-gray-600">4 beats</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <div className="text-xl font-bold text-blue-700">3/4</div>
            <div className="text-xs text-gray-600">3 beats</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <div className="text-xl font-bold text-green-700">6/8</div>
            <div className="text-xs text-gray-600">6 eighths</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-2 text-center">
            <div className="text-xl font-bold text-orange-700">2/4</div>
            <div className="text-xs text-gray-600">2 beats</div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <p className="text-gray-700 font-bold mb-2">
            Staff & Note Placement:
          </p>
          <p className="text-gray-600 text-sm mb-2">
            This editor uses a simplified <strong>3-line staff</strong> with
            Treble Clef (𝄞). Notes snap to lines and spaces automatically.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-bold text-gray-800 mb-1">Note positions:</p>
            <ul className="text-gray-600 space-y-0.5">
              <li>
                <strong>Lines:</strong> E, G, B
              </li>
              <li>
                <strong>Spaces:</strong> D, F, A
              </li>
              <li>
                <strong>Ledger:</strong> C (below), C5 (above)
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeSection, setActiveSection] = useState(HELP_SECTIONS[0].id);

  if (!isOpen) return null;

  const currentSection =
    HELP_SECTIONS.find((s) => s.id === activeSection) || HELP_SECTIONS[0];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-200 to-pink-200 text-orange-800 p-6 rounded-t-2xl border-b-2 border-orange-300">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Help & Music Theory</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 flex items-center justify-center text-2xl transition-colors text-orange-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Mobile: Horizontal scrollable tabs */}
          <div className="md:hidden bg-orange-50 border-b border-orange-200 overflow-x-auto overflow-y-hidden hide-scrollbar px-3 py-3">
            <div className="flex gap-2 min-w-max">
              {HELP_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm transition-colors ${
                    activeSection === section.id
                      ? "bg-orange-200 text-orange-800 font-semibold shadow-sm"
                      : "text-gray-700 bg-white/60 hover:bg-orange-100"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Sidebar Navigation */}
          <div className="hidden md:block w-48 bg-orange-50 border-r border-orange-200 overflow-y-auto p-3">
            <div className="space-y-1">
              {HELP_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? "bg-orange-200 text-orange-800 font-semibold shadow-sm"
                      : "text-gray-700 hover:bg-orange-100"
                  }`}
                >
                  <div className="text-sm leading-tight">{section.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
              {currentSection.title}
            </h3>
            {currentSection.content}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-orange-50 p-4 rounded-b-2xl border-t border-orange-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-orange-200 to-pink-200 text-orange-800 font-semibold rounded-xl hover:from-orange-300 hover:to-pink-300 transition-all shadow-sm"
          >
            Got it! ✓
          </button>
        </div>
      </div>
    </div>
  );
}
