"use client";

/**
 * Legacy NoteEditor Page
 *
 * This page preserves the original NoteEditor component for comparison
 * and testing purposes while the main app uses NoteEditorRefactored.
 */

import { useState, useRef } from "react";
import {
  NoteEditor,
  EditorNote as LegacyEditorNote,
  RepeatMarker as LegacyRepeatMarker,
} from "@/components/NoteEditor";
import { Pitch, LyricSyllable } from "@/lib/types";
import Link from "next/link";

// Test composition in OLD format (beat/system)
const testNotesLegacy: LegacyEditorNote[] = [
  // System 0: Quarter notes then beamed eighth notes
  { id: "1", pitch: "C4" as Pitch, duration: 1, beat: 0, system: 0 },
  { id: "2", pitch: "E4" as Pitch, duration: 1, beat: 1, system: 0 },
  { id: "3", pitch: "G4" as Pitch, duration: 1, beat: 2, system: 0 },
  { id: "4", pitch: "C5" as Pitch, duration: 1, beat: 3, system: 0 },
  // Beamed eighth notes
  { id: "5", pitch: "D4" as Pitch, duration: 0.5, beat: 4, system: 0 },
  { id: "6", pitch: "E4" as Pitch, duration: 0.5, beat: 4.5, system: 0 },
  { id: "7", pitch: "F4" as Pitch, duration: 0.5, beat: 5, system: 0 },
  { id: "8", pitch: "G4" as Pitch, duration: 0.5, beat: 5.5, system: 0 },
  // Half note
  { id: "9", pitch: "A4" as Pitch, duration: 2, beat: 6, system: 0 },

  // System 1: More notes
  { id: "10", pitch: "B4" as Pitch, duration: 1.5, beat: 0, system: 1 },
  { id: "11", pitch: "A4" as Pitch, duration: 0.5, beat: 1.5, system: 1 },
  { id: "12", pitch: "G4" as Pitch, duration: 1, beat: 2, system: 1 },
  { id: "13", pitch: "F4" as Pitch, duration: 2, beat: 3, system: 1 },
  { id: "14", pitch: "E4" as Pitch, duration: 1, beat: 5, system: 1 },
  { id: "15", pitch: "D4" as Pitch, duration: 1, beat: 6, system: 1 },
  { id: "16", pitch: "C4" as Pitch, duration: 1, beat: 7, system: 1 },
];

// Test repeat markers in OLD format (system/measure)
const testRepeatMarkersLegacy: LegacyRepeatMarker[] = [
  {
    id: "repeat-start",
    pairId: "main-repeat",
    type: "start",
    system: 0,
    measure: 0,
  },
  {
    id: "repeat-end",
    pairId: "main-repeat",
    type: "end",
    system: 1,
    measure: 4,
  },
];

// Test lyrics
const testLyrics: LyricSyllable[] = [
  { text: "Do", absoluteBeat: 0 },
  { text: "Re", absoluteBeat: 1 },
  { text: "Mi", absoluteBeat: 2 },
  { text: "Fa", absoluteBeat: 3 },
];

export default function LegacyPage() {
  const [notes, setNotes] = useState<LegacyEditorNote[]>(testNotesLegacy);
  const [repeatMarkers, setRepeatMarkers] = useState<LegacyRepeatMarker[]>(
    testRepeatMarkersLegacy,
  );
  const [lyrics, setLyrics] = useState<LyricSyllable[]>(testLyrics);
  const [selectedTool, setSelectedTool] = useState<
    "quarter" | "half" | "eighth" | "whole" | "delete" | null
  >("quarter");
  const [staffLines, setStaffLines] = useState(3);
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Legacy NoteEditor</h1>
          <div className="flex gap-2">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Home (New Editor)
            </Link>
            <Link
              href="/comparison"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Comparison
            </Link>
            <Link
              href="/editor"
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Editor Page
            </Link>
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          This page uses the original <code>NoteEditor</code> component with the
          legacy coordinate system (beat/system for notes, system/measure for
          repeat markers). Use this for comparison with the refactored version.
        </p>

        {/* Tool selection */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="font-medium py-2">Tool:</span>
          {(
            ["quarter", "half", "eighth", "whole", "delete", null] as const
          ).map((tool) => (
            <button
              key={tool ?? "none"}
              onClick={() => setSelectedTool(tool)}
              className={`px-3 py-2 rounded ${
                selectedTool === tool
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {tool ?? "None"}
            </button>
          ))}
          <span className="border-l border-gray-300 mx-2" />
          <span className="font-medium py-2">Staff Lines:</span>
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setStaffLines(n)}
              className={`px-3 py-2 rounded ${
                staffLines === n
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Reset button */}
        <button
          onClick={() => {
            setNotes(testNotesLegacy);
            setRepeatMarkers(testRepeatMarkersLegacy);
            setLyrics(testLyrics);
          }}
          className="mb-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Reset to Test Data
        </button>

        {/* Editor */}
        <div className="border rounded-lg p-4 bg-white overflow-x-auto">
          <NoteEditor
            notes={notes}
            onNotesChange={setNotes}
            repeatMarkers={repeatMarkers}
            onRepeatMarkersChange={setRepeatMarkers}
            lyrics={lyrics}
            onLyricsChange={setLyrics}
            selectedTool={selectedTool}
            systemCount={2}
            totalMeasures={4}
            onSystemCountChange={() => {}}
            timeSignature={{ numerator: 4, denominator: 4 }}
            measuresPerRow={2}
            showLabels={true}
            showGrid={false}
            noteSpacing={1.5}
            allowMove={true}
            staffLines={staffLines}
            svgRef={svgRef}
          />
        </div>

        {/* Debug info */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">
            Notes ({notes.length}) - Legacy format (beat/system)
          </h3>
          <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
            {JSON.stringify(notes.slice(0, 5), null, 2)}
            {notes.length > 5 && `\n... and ${notes.length - 5} more`}
          </pre>
          <h3 className="font-semibold mt-4 mb-2">
            Repeat Markers ({repeatMarkers.length}) - Legacy format
            (system/measure)
          </h3>
          <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
            {JSON.stringify(repeatMarkers, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
