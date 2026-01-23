"use client";

import { useState, useRef, useCallback } from "react";
import { LyricSyllable, EditorNote, Pitch } from "@/lib/types";

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lyrics: LyricSyllable[];
  onLyricsChange: (lyrics: LyricSyllable[]) => void;
  totalMeasures: number;
  beatsPerMeasure: number;
  notes: EditorNote[];
}

// Extract display name from any pitch (e.g., "Bb4" -> "Bb", "C#5" -> "C#")
function getPitchDisplay(pitch: Pitch): string {
  if (pitch === "REST") return "";
  // Remove the octave number to get the note name with accidental
  return pitch.replace(/\d+$/, "");
}

// Helper to create initial lyrics map
function createLyricsMap(lyrics: LyricSyllable[]): Map<number, string> {
  const map = new Map<number, string>();
  lyrics.forEach((l) => map.set(l.absoluteBeat, l.text));
  return map;
}

// Inner component that manages its own state
function LyricsModalContent({
  onClose,
  initialLyrics,
  onLyricsChange,
  totalMeasures,
  beatsPerMeasure,
  notes,
}: {
  onClose: () => void;
  initialLyrics: Map<number, string>;
  onLyricsChange: (lyrics: LyricSyllable[]) => void;
  totalMeasures: number;
  beatsPerMeasure: number;
  notes: EditorNote[];
}) {
  const [localLyrics, setLocalLyrics] =
    useState<Map<number, string>>(initialLyrics);
  const inputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  // Get notes at a specific beat
  const getNotesAtBeat = useCallback(
    (beat: number): EditorNote[] => {
      return notes.filter((n) => n.absoluteBeat === beat && n.pitch !== "REST");
    },
    [notes],
  );

  // Handle input change
  const handleInputChange = (beat: number, value: string) => {
    const newMap = new Map(localLyrics);
    if (value.trim() === "") {
      newMap.delete(beat);
    } else {
      newMap.set(beat, value);
    }
    setLocalLyrics(newMap);
  };

  // Handle key navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    beat: number,
    totalBeats: number,
  ) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      const nextBeat = e.shiftKey ? beat - 1 : beat + 1;
      if (nextBeat >= 0 && nextBeat < totalBeats) {
        inputRefs.current.get(nextBeat)?.focus();
      }
    }
  };

  // Save changes and close
  const handleSave = () => {
    const newLyrics: LyricSyllable[] = [];
    localLyrics.forEach((text, beat) => {
      if (text.trim()) {
        newLyrics.push({ text: text.trim(), absoluteBeat: beat });
      }
    });
    // Sort by beat position
    newLyrics.sort((a, b) => a.absoluteBeat - b.absoluteBeat);
    onLyricsChange(newLyrics);
    onClose();
  };

  // Clear all lyrics
  const handleClearAll = () => {
    setLocalLyrics(new Map());
  };

  const totalBeats = totalMeasures * beatsPerMeasure;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-200 to-orange-200 text-amber-800 p-6 border-b-2 border-amber-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Lyrics Editor</h2>
              <p className="text-sm text-amber-700 mt-1">
                Type syllables for each beat. Use Tab or Enter to move between
                fields.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 flex items-center justify-center text-2xl transition-colors text-amber-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content - scrollable grid */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            {Array.from({ length: totalMeasures }, (_, measureIndex) => {
              const measureStartBeat = measureIndex * beatsPerMeasure;

              return (
                <div
                  key={measureIndex}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  {/* Measure header */}
                  <div className="text-sm font-medium text-gray-500 mb-3">
                    Measure {measureIndex + 1}
                  </div>

                  {/* Beat inputs grid */}
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${beatsPerMeasure}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: beatsPerMeasure }, (_, beatIndex) => {
                      const absoluteBeat = measureStartBeat + beatIndex;
                      const notesAtBeat = getNotesAtBeat(absoluteBeat);
                      const pitchDisplay = notesAtBeat
                        .map((n) => getPitchDisplay(n.pitch))
                        .join(",");

                      return (
                        <div key={beatIndex} className="flex flex-col">
                          {/* Beat number */}
                          <div className="text-xs text-gray-400 text-center mb-1">
                            Beat {beatIndex + 1}
                          </div>

                          {/* Input field */}
                          <input
                            ref={(el) => {
                              if (el) {
                                inputRefs.current.set(absoluteBeat, el);
                              }
                            }}
                            type="text"
                            dir="auto"
                            value={localLyrics.get(absoluteBeat) || ""}
                            onChange={(e) =>
                              handleInputChange(absoluteBeat, e.target.value)
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, absoluteBeat, totalBeats)
                            }
                            className={`
                              w-full px-2 py-1.5 text-center text-sm rounded-md border
                              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400
                              ${
                                notesAtBeat.length > 0
                                  ? "border-purple-300 bg-purple-50"
                                  : "border-gray-300 bg-white"
                              }
                            `}
                            placeholder={notesAtBeat.length > 0 ? "..." : ""}
                          />

                          {/* Note indicator */}
                          <div className="text-xs text-purple-500 text-center mt-1 h-4 font-medium">
                            {pitchDisplay}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Clear All
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component that conditionally renders the content
// This ensures fresh state each time the modal opens
export function LyricsModal({
  isOpen,
  onClose,
  lyrics,
  onLyricsChange,
  totalMeasures,
  beatsPerMeasure,
  notes,
}: LyricsModalProps) {
  if (!isOpen) return null;

  // Create initial lyrics map when mounting
  const initialLyrics = createLyricsMap(lyrics);

  return (
    <LyricsModalContent
      onClose={onClose}
      initialLyrics={initialLyrics}
      onLyricsChange={onLyricsChange}
      totalMeasures={totalMeasures}
      beatsPerMeasure={beatsPerMeasure}
      notes={notes}
    />
  );
}
