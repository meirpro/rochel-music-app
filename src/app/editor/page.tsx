"use client";

import { useState, useCallback, useRef } from "react";
import { toast, Toaster } from "sonner";
import {
  NoteEditor,
  EditorNote,
  NoteTool,
  RepeatMarker,
  LEFT_MARGIN,
  BEAT_WIDTH,
} from "@/components/NoteEditor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { MIDI_NOTES } from "@/lib/constants";

// Note colors matching the color legend
const NOTE_COLORS = {
  C: "#ff5a5f",
  D: "#ffb020",
  E: "#ffe14d",
  F: "#4ade80",
  G: "#60a5fa",
  A: "#a78bfa",
  B: "#ff77c8",
};

export default function EditorPage() {
  const [notes, setNotes] = useState<EditorNote[]>([]);
  const [repeatMarkers, setRepeatMarkers] = useState<RepeatMarker[]>([]);
  const [selectedTool, setSelectedTool] = useState<NoteTool>("quarter");
  const [showLabels, setShowLabels] = useState(true);
  const [showKidFaces, setShowKidFaces] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(100);
  const [playheadX, setPlayheadX] = useState<number | null>(null);
  const [playheadSystem, setPlayheadSystem] = useState(0);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [systemCount, setSystemCount] = useState(1);
  const isPlayingRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Handle duplicate note attempt
  const handleDuplicateNote = useCallback(() => {
    toast.error("A note already exists at this position", {
      description: "Only one note per beat is allowed",
      position: "top-left",
    });
  }, []);

  // Save as PNG
  const handleSavePNG = useCallback(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = svg.clientWidth * 2;
      canvas.height = svg.clientHeight * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = "music-composition.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  }, []);

  // Save as SVG
  const handleSaveSVG = useCallback(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");
    link.download = "music-composition.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  // Constants for playback
  const BEATS_PER_SYSTEM = 8;

  // Handle playback with smooth scrolling
  const handlePlay = useCallback(() => {
    if (isPlayingRef.current || notes.length === 0) return;

    setIsPlaying(true);
    isPlayingRef.current = true;
    const player = getAudioPlayer();
    player.setTempo(tempo);

    // Calculate timing
    const msPerBeat = 60000 / tempo;
    const totalBeats = systemCount * BEATS_PER_SYSTEM;
    const totalMs = totalBeats * msPerBeat;

    // Sort notes by position for playback
    const sortedNotes = [...notes].sort((a, b) => {
      if (a.system !== b.system) return a.system - b.system;
      return a.x - b.x;
    });

    // Build repeat sections from paired markers (supports cross-system repeats)
    interface RepeatSection {
      pairId: string;
      startSystem: number;
      startMeasure: number;
      endSystem: number;
      endMeasure: number;
      startAbsoluteBeat: number;
      endAbsoluteBeat: number;
    }
    const repeatSections: RepeatSection[] = [];
    const processedPairIds = new Set<string>();

    for (const marker of repeatMarkers) {
      if (marker.type !== "start" || processedPairIds.has(marker.pairId))
        continue;
      const endMarker = repeatMarkers.find(
        (m) => m.pairId === marker.pairId && m.type === "end",
      );
      if (endMarker) {
        const startAbsoluteBeat =
          marker.system * BEATS_PER_SYSTEM + marker.measure * 4;
        const endAbsoluteBeat =
          endMarker.system * BEATS_PER_SYSTEM + endMarker.measure * 4;
        if (endAbsoluteBeat > startAbsoluteBeat) {
          repeatSections.push({
            pairId: marker.pairId,
            startSystem: marker.system,
            startMeasure: marker.measure,
            endSystem: endMarker.system,
            endMeasure: endMarker.measure,
            startAbsoluteBeat,
            endAbsoluteBeat,
          });
        }
        processedPairIds.add(marker.pairId);
      }
    }
    repeatSections.sort((a, b) => a.startAbsoluteBeat - b.startAbsoluteBeat);

    // Build playback sequence with cross-system repeat handling
    interface PlaybackNote extends EditorNote {
      playBeat: number;
    }
    const playbackSequence: PlaybackNote[] = [];

    // Helper to get absolute beat for a note
    const getNoteAbsoluteBeat = (note: EditorNote) =>
      note.system * BEATS_PER_SYSTEM + (note.x - LEFT_MARGIN) / BEAT_WIDTH;

    // Build timeline with repeats
    let currentBeatOffset = 0;
    let lastProcessedBeat = 0;

    for (const section of repeatSections) {
      // Add notes before this repeat section
      for (const note of sortedNotes) {
        const noteBeat = getNoteAbsoluteBeat(note);
        if (
          noteBeat >= lastProcessedBeat &&
          noteBeat < section.startAbsoluteBeat
        ) {
          playbackSequence.push({
            ...note,
            playBeat: currentBeatOffset + (noteBeat - lastProcessedBeat),
          });
        }
      }
      currentBeatOffset += section.startAbsoluteBeat - lastProcessedBeat;

      // First pass of repeated section
      for (const note of sortedNotes) {
        const noteBeat = getNoteAbsoluteBeat(note);
        if (
          noteBeat >= section.startAbsoluteBeat &&
          noteBeat < section.endAbsoluteBeat
        ) {
          playbackSequence.push({
            ...note,
            playBeat:
              currentBeatOffset + (noteBeat - section.startAbsoluteBeat),
          });
        }
      }
      currentBeatOffset += section.endAbsoluteBeat - section.startAbsoluteBeat;

      // Second pass of repeated section
      for (const note of sortedNotes) {
        const noteBeat = getNoteAbsoluteBeat(note);
        if (
          noteBeat >= section.startAbsoluteBeat &&
          noteBeat < section.endAbsoluteBeat
        ) {
          playbackSequence.push({
            ...note,
            playBeat:
              currentBeatOffset + (noteBeat - section.startAbsoluteBeat),
          });
        }
      }
      currentBeatOffset += section.endAbsoluteBeat - section.startAbsoluteBeat;

      lastProcessedBeat = section.endAbsoluteBeat;
    }

    // Add notes after all repeat sections
    const totalAbsoluteBeats = systemCount * BEATS_PER_SYSTEM;
    for (const note of sortedNotes) {
      const noteBeat = getNoteAbsoluteBeat(note);
      if (noteBeat >= lastProcessedBeat) {
        playbackSequence.push({
          ...note,
          playBeat: currentBeatOffset + (noteBeat - lastProcessedBeat),
        });
      }
    }
    currentBeatOffset += totalAbsoluteBeats - lastProcessedBeat;

    // Sort by play time
    playbackSequence.sort((a, b) => a.playBeat - b.playBeat);

    // Build visual timeline segments for playhead (supports cross-system repeats)
    interface TimelineSegment {
      startBeat: number;
      endBeat: number;
      system: number;
      startX: number;
      endX: number;
    }
    const timeline: TimelineSegment[] = [];

    // Helper to convert absolute beat to system + X position
    const absoluteBeatToVisual = (absBeat: number) => {
      const system = Math.floor(absBeat / BEATS_PER_SYSTEM);
      const beatInSystem = absBeat % BEATS_PER_SYSTEM;
      return { system, x: LEFT_MARGIN + beatInSystem * BEAT_WIDTH };
    };

    // Helper to add timeline segments between two absolute beats
    const addSegmentsBetween = (
      startAbsBeat: number,
      endAbsBeat: number,
      timelineStart: number,
    ) => {
      let currentBeat = startAbsBeat;
      let currentTimelineBeat = timelineStart;

      while (currentBeat < endAbsBeat) {
        const startVisual = absoluteBeatToVisual(currentBeat);
        const systemEndBeat = (startVisual.system + 1) * BEATS_PER_SYSTEM;
        const segmentEndBeat = Math.min(endAbsBeat, systemEndBeat);
        const endVisual = absoluteBeatToVisual(segmentEndBeat);

        const duration = segmentEndBeat - currentBeat;
        timeline.push({
          startBeat: currentTimelineBeat,
          endBeat: currentTimelineBeat + duration,
          system: startVisual.system,
          startX: startVisual.x,
          endX:
            segmentEndBeat === systemEndBeat
              ? LEFT_MARGIN + BEATS_PER_SYSTEM * BEAT_WIDTH
              : endVisual.x,
        });

        currentTimelineBeat += duration;
        currentBeat = segmentEndBeat;
      }
      return currentTimelineBeat;
    };

    let timelineBeat = 0;
    let lastProcessedAbsBeat = 0;

    for (const section of repeatSections) {
      // Add segments before this repeat
      if (section.startAbsoluteBeat > lastProcessedAbsBeat) {
        timelineBeat = addSegmentsBetween(
          lastProcessedAbsBeat,
          section.startAbsoluteBeat,
          timelineBeat,
        );
      }

      // First pass of repeat
      timelineBeat = addSegmentsBetween(
        section.startAbsoluteBeat,
        section.endAbsoluteBeat,
        timelineBeat,
      );

      // Second pass of repeat (visual loop back)
      timelineBeat = addSegmentsBetween(
        section.startAbsoluteBeat,
        section.endAbsoluteBeat,
        timelineBeat,
      );

      lastProcessedAbsBeat = section.endAbsoluteBeat;
    }

    // Add segments after all repeats
    if (lastProcessedAbsBeat < totalAbsoluteBeats) {
      timelineBeat = addSegmentsBetween(
        lastProcessedAbsBeat,
        totalAbsoluteBeats,
        timelineBeat,
      );
    }

    const totalPlaybackBeats = timelineBeat || currentBeatOffset;
    const totalPlaybackMs = totalPlaybackBeats * msPerBeat;

    // Track state during animation
    const playedNotes = new Set<number>(); // Track by index in sequence
    const activeNotes = new Map<string, number>(); // noteId -> end time in ms
    const startTime = performance.now();

    const animate = () => {
      if (!isPlayingRef.current) {
        setPlayheadX(null);
        setActiveNoteId(null);
        setIsPlaying(false);
        return;
      }

      const elapsed = performance.now() - startTime;
      const currentBeat = elapsed / msPerBeat;

      // Find current timeline segment and interpolate position
      let currentSystem = 0;
      let currentX = LEFT_MARGIN;

      for (const segment of timeline) {
        if (currentBeat >= segment.startBeat && currentBeat < segment.endBeat) {
          const progress =
            (currentBeat - segment.startBeat) /
            (segment.endBeat - segment.startBeat);
          currentSystem = segment.system;
          currentX =
            segment.startX + progress * (segment.endX - segment.startX);
          break;
        } else if (currentBeat >= segment.endBeat) {
          currentSystem = segment.system;
          currentX = segment.endX;
        }
      }

      setPlayheadX(currentX);
      setPlayheadSystem(currentSystem);

      // Check for notes to play
      for (let i = 0; i < playbackSequence.length; i++) {
        if (playedNotes.has(i)) continue;
        const note = playbackSequence[i];
        if (currentBeat >= note.playBeat) {
          // Play this note
          const midi = MIDI_NOTES[note.pitch];
          if (midi > 0) {
            const durationSeconds = (note.duration * 60) / tempo;
            player.playNote(midi, durationSeconds * 0.9);
          }
          playedNotes.add(i);

          // Set as active note
          const noteEndTime = elapsed + note.duration * msPerBeat;
          activeNotes.set(note.id, noteEndTime);
          setActiveNoteId(note.id);
        }
      }

      // Clear expired active notes
      for (const [noteId, endTime] of activeNotes) {
        if (elapsed >= endTime) {
          activeNotes.delete(noteId);
          if (activeNotes.size === 0) {
            setActiveNoteId(null);
          }
        }
      }

      // Continue or stop
      if (elapsed < totalPlaybackMs) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setPlayheadX(null);
        setActiveNoteId(null);
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [notes, tempo, repeatMarkers, systemCount]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setPlayheadX(null);
    setActiveNoteId(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const handleClear = useCallback(() => {
    if (notes.length > 0 && confirm("Clear all notes and repeat markers?")) {
      setNotes([]);
      setRepeatMarkers([]);
    }
  }, [notes.length]);

  // Tool button with colored note icon
  const ToolButton = ({
    tool,
    label,
    noteType,
  }: {
    tool: NoteTool;
    label: string;
    noteType: "whole" | "half" | "quarter" | "eighth";
  }) => {
    const isHollow = noteType === "whole" || noteType === "half";
    const hasStem = noteType !== "whole";
    const hasFlag = noteType === "eighth";

    return (
      <button
        onClick={() => setSelectedTool(tool)}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-1 min-w-[3.5rem]
        ${
          selectedTool === tool
            ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24">
          {/* Note head */}
          <ellipse
            cx="12"
            cy="16"
            rx="6"
            ry="4"
            fill={isHollow ? "#fff" : NOTE_COLORS.G}
            stroke={isHollow ? NOTE_COLORS.G : "#000"}
            strokeWidth={isHollow ? 2 : 1}
            transform="rotate(-15 12 16)"
          />
          {/* Stem */}
          {hasStem && (
            <line
              x1="17"
              y1="15"
              x2="17"
              y2="4"
              stroke={NOTE_COLORS.G}
              strokeWidth={2}
            />
          )}
          {/* Flag for eighth note */}
          {hasFlag && (
            <path
              d="M 17 4 Q 22 8 20 14"
              stroke={NOTE_COLORS.G}
              strokeWidth={2}
              fill="none"
            />
          )}
        </svg>
        <span className="text-xs">{label}</span>
      </button>
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <Toaster richColors />

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Note Editor</h1>
              <p className="text-sm text-gray-500">
                Click to add notes, drag to move them
              </p>
            </div>
            <a
              href="/"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              ← Back to Player
            </a>
          </div>
        </header>

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 flex-wrap">
            {/* Note duration tools */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <ToolButton tool="whole" label="Whole" noteType="whole" />
              <ToolButton tool="half" label="Half" noteType="half" />
              <ToolButton tool="quarter" label="Quarter" noteType="quarter" />
              <ToolButton tool="eighth" label="Eighth" noteType="eighth" />
            </div>

            <div className="w-px h-8 bg-gray-300" />

            {/* Repeat tool */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedTool("repeat")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-1 min-w-[3.5rem]
                ${
                  selectedTool === "repeat"
                    ? "bg-purple-100 text-purple-700 ring-1 ring-purple-300"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    <div className="w-0.5 h-4 bg-current" />
                    <div className="w-0.5 h-4 bg-current ml-0.5" />
                    <div className="flex flex-col gap-0.5 ml-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    </div>
                  </div>
                </div>
                <span className="text-xs">Repeat</span>
              </button>
            </div>

            <div className="w-px h-8 bg-gray-300" />

            {/* Delete tool with tooltip */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedTool("delete")}
                    className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2
                      ${
                        selectedTool === "delete"
                          ? "bg-red-100 text-red-700"
                          : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                      }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click on a note to delete it</p>
                </TooltipContent>
              </Tooltip>
              <button
                onClick={handleClear}
                className="px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
                title="Clear All"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            <div className="w-px h-8 bg-gray-300" />

            {/* Save buttons */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={handleSavePNG}
                className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-all text-xs font-medium"
              >
                PNG
              </button>
              <button
                onClick={handleSaveSVG}
                className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-all text-xs font-medium"
              >
                SVG
              </button>
            </div>

            <div className="w-px h-8 bg-gray-300" />

            {/* Playback controls */}
            <div className="flex gap-2 items-center">
              <button
                onClick={isPlaying ? handleStop : handlePlay}
                disabled={notes.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${
                    isPlaying
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPlaying ? (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    Stop
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Settings bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-6 text-sm flex-wrap">
            <label className="flex items-center gap-2">
              <span className="text-gray-600">Tempo:</span>
              <input
                type="range"
                min="40"
                max="200"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-gray-800 font-medium w-12">
                {tempo} BPM
              </span>
            </label>

            <div className="w-px h-5 bg-gray-300" />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="text-gray-600">Note names</span>
            </label>

            <div className="w-px h-5 bg-gray-300" />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showKidFaces}
                onChange={(e) => setShowKidFaces(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="text-gray-600">Kid faces</span>
            </label>

            <div className="w-px h-5 bg-gray-300" />

            <span className="text-gray-500">
              {notes.length} note{notes.length !== 1 ? "s" : ""}
              {repeatMarkers.length > 0 &&
                ` • ${repeatMarkers.length / 2} repeat`}
            </span>
          </div>
        </div>

        {/* Editor canvas */}
        <main className="max-w-4xl mx-auto p-6">
          <div className="flex justify-center">
            <NoteEditor
              notes={notes}
              onNotesChange={setNotes}
              repeatMarkers={repeatMarkers}
              onRepeatMarkersChange={setRepeatMarkers}
              selectedTool={selectedTool}
              showLabels={showLabels}
              showKidFaces={showKidFaces}
              playheadX={playheadX}
              playheadSystem={playheadSystem}
              activeNoteId={activeNoteId}
              systemCount={systemCount}
              onSystemCountChange={setSystemCount}
              onDuplicateNote={handleDuplicateNote}
              svgRef={svgRef}
            />
          </div>

          {/* Color legend */}
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            {Object.entries(NOTE_COLORS).map(([note, color]) => (
              <div key={note} className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-full border border-black/10"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-600">{note}</span>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              <strong>Click</strong> on the staff to add a note •{" "}
              <strong>Drag</strong> notes to move them •{" "}
              <strong>Delete tool</strong> to remove notes
            </p>
            <p className="mt-1">
              <strong>Repeat</strong>: Click first measure to start, click
              second to end • Use +/- to add more systems
            </p>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
