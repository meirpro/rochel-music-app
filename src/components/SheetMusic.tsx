"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Song, RenderedNote, LayoutResult } from "@/lib/types";
import { MUSIC_FONT } from "@/lib/constants";
import {
  drawBackground,
  drawAllBeatShading,
  drawAllSystems,
  drawAllBarLines,
  drawNotes,
  drawPlayhead,
  layoutNotes,
  getPlayheadPosition,
  getCanvasCoordinates,
  hitTestNote,
} from "@/lib/rendering";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";

interface SheetMusicProps {
  song: Song;
  isPlaying: boolean;
  currentBeat: number;
  activeNoteIndex: number;
  showLabels: boolean;
  monoMode: boolean;
  useStandardNotation: boolean;
  zoom: number;
  onNoteClick?: (index: number, note: RenderedNote) => void;
  onLayoutChange?: (layout: LayoutResult) => void;
}

const CANVAS_WIDTH = 1200;

export function SheetMusic({
  song,
  isPlaying,
  currentBeat,
  activeNoteIndex,
  showLabels,
  monoMode,
  useStandardNotation,
  zoom,
  onNoteClick,
  onLayoutChange,
}: SheetMusicProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layout, setLayout] = useState<LayoutResult | null>(null);
  const [canvasHeight, setCanvasHeight] = useState(400);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Preload music font
  useEffect(() => {
    const loadFont = async () => {
      try {
        await document.fonts.load(`72px "${MUSIC_FONT}"`);
        setFontLoaded(true);
      } catch {
        // Font loading failed, continue anyway
        setFontLoaded(true);
      }
    };
    loadFont();
  }, []);

  // Calculate layout when song or zoom changes
  useEffect(() => {
    const scale = zoom / 100;
    const newLayout = layoutNotes(song, CANVAS_WIDTH, scale);
    setLayout(newLayout);
    setCanvasHeight(newLayout.canvasHeight);
    onLayoutChange?.(newLayout);
  }, [song, zoom, onLayoutChange]);

  // Render the sheet music
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background and title
    drawBackground(ctx, {
      canvasWidth: CANVAS_WIDTH,
      canvasHeight: layout.canvasHeight,
      title: `${song.title} on a 3-line treble kid staff`,
      subtitle: "Measures wrap to next line • Click notes to hear them",
    });

    // Draw alternating beat shading
    drawAllBeatShading(ctx, layout.systems, {
      canvasWidth: CANVAS_WIDTH,
      beatsPerMeasure: song.beatsPerMeasure,
    });

    // Draw all staff systems (lines)
    drawAllSystems(ctx, layout.systems, CANVAS_WIDTH);

    // Draw all bar lines
    drawAllBarLines(ctx, layout.systems);

    // Draw notes
    drawNotes(
      ctx,
      layout.notes,
      { showLabels, monoMode, useStandardNotation },
      activeNoteIndex,
    );

    // Draw smooth playhead if playing
    if (isPlaying && currentBeat >= 0) {
      const playheadPos = getPlayheadPosition(layout, currentBeat);
      if (playheadPos) {
        drawPlayhead(ctx, playheadPos.x, playheadPos.systemTop);
      }
    }
  }, [
    layout,
    song,
    isPlaying,
    currentBeat,
    activeNoteIndex,
    showLabels,
    monoMode,
    useStandardNotation,
    fontLoaded,
  ]);

  // Re-render when dependencies change
  useEffect(() => {
    render();
  }, [render]);

  // Handle click on canvas
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || !layout) return;

      const { x, y } = getCanvasCoordinates(canvas, e.clientX, e.clientY);
      const noteIndex = hitTestNote(x, y, layout.notes);

      if (noteIndex >= 0) {
        const note = layout.notes[noteIndex];
        const player = getAudioPlayer();
        player.playNote(note.midi, 0.35);
        onNoteClick?.(noteIndex, note);
      }
    },
    [layout, onNoteClick],
  );

  return (
    <div className="p-2.5">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={canvasHeight}
        onClick={handleClick}
        className="w-full h-auto block bg-white rounded-2xl border border-gray-200 cursor-pointer shadow-sm"
        aria-label="Kid staff score"
      />
    </div>
  );
}
