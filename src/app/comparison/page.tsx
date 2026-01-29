"use client";

import { useState } from "react";
import {
  NoteEditor,
  EditorNote as OldEditorNote,
  RepeatMarker as OldRepeatMarker,
} from "@/components/NoteEditor";
import {
  NoteEditorRefactored,
  EditorNote as NewEditorNote,
  RepeatMarker as NewRepeatMarker,
} from "@/components/NoteEditorRefactored";
import { Pitch } from "@/lib/types";

// Comprehensive test composition - OLD format (beat/system) for original NoteEditor
const testNotesOld: OldEditorNote[] = [
  // System 0: Quarter notes then beamed eighth notes
  { id: "1", pitch: "C4" as Pitch, duration: 1, beat: 0, system: 0 },
  { id: "2", pitch: "E4" as Pitch, duration: 1, beat: 1, system: 0 },
  { id: "3", pitch: "G4" as Pitch, duration: 1, beat: 2, system: 0 },
  { id: "4", pitch: "C5" as Pitch, duration: 1, beat: 3, system: 0 },
  // Beamed eighth notes (4 in a row)
  { id: "5", pitch: "D4" as Pitch, duration: 0.5, beat: 4, system: 0 },
  { id: "6", pitch: "E4" as Pitch, duration: 0.5, beat: 4.5, system: 0 },
  { id: "7", pitch: "F4" as Pitch, duration: 0.5, beat: 5, system: 0 },
  { id: "8", pitch: "G4" as Pitch, duration: 0.5, beat: 5.5, system: 0 },
  // Half note
  { id: "9", pitch: "A4" as Pitch, duration: 2, beat: 6, system: 0 },

  // System 1: Dotted notes and 16th notes (well spaced)
  { id: "10", pitch: "B4" as Pitch, duration: 1.5, beat: 0, system: 1 },
  { id: "11", pitch: "A4" as Pitch, duration: 0.5, beat: 1.5, system: 1 },
  { id: "12", pitch: "G4" as Pitch, duration: 1, beat: 2, system: 1 },
  { id: "13", pitch: "F4" as Pitch, duration: 3, beat: 3, system: 1 },
  { id: "14", pitch: "C5" as Pitch, duration: 0.25, beat: 6, system: 1 },
  { id: "15", pitch: "D5" as Pitch, duration: 0.25, beat: 6.25, system: 1 },
  { id: "16", pitch: "E5" as Pitch, duration: 0.25, beat: 6.5, system: 1 },
  { id: "17", pitch: "F5" as Pitch, duration: 0.25, beat: 6.75, system: 1 },
  { id: "18", pitch: "G4" as Pitch, duration: 1, beat: 7, system: 1 },

  // System 2: Whole note and dotted eighth
  { id: "19", pitch: "E4" as Pitch, duration: 4, beat: 0, system: 2 },
  { id: "20", pitch: "C5" as Pitch, duration: 0.75, beat: 4, system: 2 },
  { id: "21", pitch: "B4" as Pitch, duration: 0.25, beat: 4.75, system: 2 },
  { id: "22", pitch: "A4" as Pitch, duration: 0.5, beat: 5, system: 2 },
  { id: "23", pitch: "G4" as Pitch, duration: 0.5, beat: 5.5, system: 2 },
  { id: "24", pitch: "F4" as Pitch, duration: 2, beat: 6, system: 2 },
];

// NEW format (absoluteBeat) for refactored NoteEditor
// absoluteBeat = system * 8 + beat (with measuresPerRow=2 and beatsPerMeasure=4)
const testNotesNew: NewEditorNote[] = [
  // System 0 (beats 0-7)
  { id: "1", pitch: "C4" as Pitch, duration: 1, absoluteBeat: 0 },
  { id: "2", pitch: "E4" as Pitch, duration: 1, absoluteBeat: 1 },
  { id: "3", pitch: "G4" as Pitch, duration: 1, absoluteBeat: 2 },
  { id: "4", pitch: "C5" as Pitch, duration: 1, absoluteBeat: 3 },
  { id: "5", pitch: "D4" as Pitch, duration: 0.5, absoluteBeat: 4 },
  { id: "6", pitch: "E4" as Pitch, duration: 0.5, absoluteBeat: 4.5 },
  { id: "7", pitch: "F4" as Pitch, duration: 0.5, absoluteBeat: 5 },
  { id: "8", pitch: "G4" as Pitch, duration: 0.5, absoluteBeat: 5.5 },
  { id: "9", pitch: "A4" as Pitch, duration: 2, absoluteBeat: 6 },

  // System 1 (beats 8-15)
  { id: "10", pitch: "B4" as Pitch, duration: 1.5, absoluteBeat: 8 },
  { id: "11", pitch: "A4" as Pitch, duration: 0.5, absoluteBeat: 9.5 },
  { id: "12", pitch: "G4" as Pitch, duration: 1, absoluteBeat: 10 },
  { id: "13", pitch: "F4" as Pitch, duration: 3, absoluteBeat: 11 },
  { id: "14", pitch: "C5" as Pitch, duration: 0.25, absoluteBeat: 14 },
  { id: "15", pitch: "D5" as Pitch, duration: 0.25, absoluteBeat: 14.25 },
  { id: "16", pitch: "E5" as Pitch, duration: 0.25, absoluteBeat: 14.5 },
  { id: "17", pitch: "F5" as Pitch, duration: 0.25, absoluteBeat: 14.75 },
  { id: "18", pitch: "G4" as Pitch, duration: 1, absoluteBeat: 15 },

  // System 2 (beats 16-23)
  { id: "19", pitch: "E4" as Pitch, duration: 4, absoluteBeat: 16 },
  { id: "20", pitch: "C5" as Pitch, duration: 0.75, absoluteBeat: 20 },
  { id: "21", pitch: "B4" as Pitch, duration: 0.25, absoluteBeat: 20.75 },
  { id: "22", pitch: "A4" as Pitch, duration: 0.5, absoluteBeat: 21 },
  { id: "23", pitch: "G4" as Pitch, duration: 0.5, absoluteBeat: 21.5 },
  { id: "24", pitch: "F4" as Pitch, duration: 2, absoluteBeat: 22 },
];

export default function ComparisonPage() {
  const [version, setVersion] = useState<"original" | "refactored" | "both">(
    "both",
  );
  const [oldNotes, setOldNotes] = useState<OldEditorNote[]>(testNotesOld);
  const [newNotes, setNewNotes] = useState<NewEditorNote[]>(testNotesNew);
  const [oldRepeatMarkers, setOldRepeatMarkers] = useState<OldRepeatMarker[]>(
    [],
  );
  const [newRepeatMarkers, setNewRepeatMarkers] = useState<NewRepeatMarker[]>(
    [],
  );
  const [playheadBeat, setPlayheadBeat] = useState<number | null>(null);
  const [playheadSystem, setPlayheadSystem] = useState(0);
  const [staffLines, setStaffLines] = useState(3);

  // Calculate playhead X position from beat
  const beatWidth = 120; // 60 * 2.0 noteSpacing
  const leftMargin = 100;
  const noteOffset = 22.5; // getNoteOffset(beatWidth)
  const playheadX =
    playheadBeat !== null
      ? leftMargin + playheadBeat * beatWidth + noteOffset
      : null;

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">NoteEditor Comparison</h1>

      <p className="text-gray-600 mb-4">
        This page allows side-by-side comparison of the original NoteEditor and
        the refactored version. Use it to verify that the refactored component
        renders identically to the original.
      </p>

      {/* Version toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setVersion("original")}
          className={`px-4 py-2 rounded ${
            version === "original"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Original
        </button>
        <button
          onClick={() => setVersion("refactored")}
          className={`px-4 py-2 rounded ${
            version === "refactored"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Refactored
        </button>
        <button
          onClick={() => setVersion("both")}
          className={`px-4 py-2 rounded ${
            version === "both"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          Side by Side
        </button>
      </div>

      {/* Reset button */}
      <button
        onClick={() => {
          setOldNotes(testNotesOld);
          setNewNotes(testNotesNew);
        }}
        className="mb-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
      >
        Reset Notes
      </button>

      {/* Playhead controls */}
      <div className="mb-4 flex items-center gap-4 p-3 bg-gray-100 rounded-lg">
        <span className="font-medium">Playhead:</span>
        <button
          onClick={() => {
            setPlayheadBeat(null);
          }}
          className={`px-3 py-1 rounded ${playheadBeat === null ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          Off
        </button>
        <input
          type="range"
          min={0}
          max={7.5}
          step={0.5}
          value={playheadBeat ?? 0}
          onChange={(e) => setPlayheadBeat(parseFloat(e.target.value))}
          className="w-48"
        />
        <span className="text-sm">Beat: {playheadBeat ?? "—"}</span>
        <select
          value={playheadSystem}
          onChange={(e) => setPlayheadSystem(parseInt(e.target.value))}
          className="px-2 py-1 rounded border"
        >
          <option value={0}>System 1</option>
          <option value={1}>System 2</option>
          <option value={2}>System 3</option>
        </select>
        <span className="border-l border-gray-300 mx-2 h-6" />
        <span className="font-medium">Staff Lines:</span>
        {[3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setStaffLines(n)}
            className={`px-3 py-1 rounded ${staffLines === n ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Editor display */}
      <div
        className={`grid ${version === "both" ? "grid-cols-2" : "grid-cols-1"} gap-4`}
      >
        {(version === "original" || version === "both") && (
          <div className="border rounded-lg p-4 bg-white overflow-x-auto">
            <h2 className="text-lg font-semibold mb-2">Original NoteEditor</h2>
            <NoteEditor
              notes={oldNotes}
              onNotesChange={setOldNotes}
              repeatMarkers={oldRepeatMarkers}
              onRepeatMarkersChange={setOldRepeatMarkers}
              selectedTool="quarter"
              systemCount={3}
              totalMeasures={6}
              onSystemCountChange={() => {}}
              timeSignature={{ numerator: 4, denominator: 4 }}
              measuresPerRow={2}
              showLabels={true}
              showGrid={false}
              noteSpacing={2.0}
              allowMove={true}
              playheadX={playheadX}
              playheadSystem={playheadSystem}
              staffLines={staffLines}
            />
          </div>
        )}
        {(version === "refactored" || version === "both") && (
          <div className="border rounded-lg p-4 bg-white overflow-x-auto">
            <h2 className="text-lg font-semibold mb-2">
              Refactored NoteEditor
            </h2>
            <NoteEditorRefactored
              notes={newNotes}
              onNotesChange={setNewNotes}
              repeatMarkers={newRepeatMarkers}
              onRepeatMarkersChange={setNewRepeatMarkers}
              selectedTool="quarter"
              systemCount={3}
              totalMeasures={6}
              onSystemCountChange={() => {}}
              timeSignature={{ numerator: 4, denominator: 4 }}
              measuresPerRow={2}
              showLabels={true}
              showGrid={false}
              noteSpacing={2.0}
              allowMove={true}
              playheadX={playheadX}
              playheadSystem={playheadSystem}
              staffLines={staffLines}
              onPlayheadBeatChange={(beat) => setPlayheadBeat(beat)}
            />
          </div>
        )}
      </div>

      {/* Debug info */}
      <div className="mt-4 p-4 bg-gray-100 rounded-lg grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">
            Old Notes ({oldNotes.length}) - beat/system format
          </h3>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(oldNotes, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="font-semibold mb-2">
            New Notes ({newNotes.length}) - absoluteBeat format
          </h3>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(newNotes, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
