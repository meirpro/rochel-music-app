"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  SheetMusic,
  SongSelector,
  PlaybackControls,
  DisplayOptions,
  ColorLegend,
} from "@/components";
import { getSongById } from "@/lib/songs";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { expandNotesForPlayback, getTotalPlaybackBeats } from "@/lib/rendering";
import { Song, LayoutResult, RenderedNote } from "@/lib/types";

export default function Home() {
  const [currentSongId, setCurrentSongId] = useState("dayenu");
  const [song, setSong] = useState<Song>(() => getSongById("dayenu")!);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [tempo, setTempo] = useState(92);
  const [showLabels, setShowLabels] = useState(true);
  const [monoMode, setMonoMode] = useState(false);
  const [useStandardNotation, setUseStandardNotation] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [layout, setLayout] = useState<LayoutResult | null>(null);

  // Refs for animation
  const playStartTimeRef = useRef(0);
  const startBeatRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Memoize expanded playback sequence for songs with repeats
  const playbackSequence = useMemo(() => {
    if (!layout) return null;
    return expandNotesForPlayback(layout);
  }, [layout]);

  const totalPlaybackBeats = useMemo(() => {
    if (!layout) return 0;
    return getTotalPlaybackBeats(layout);
  }, [layout]);

  // Update song when selection changes
  useEffect(() => {
    const newSong = getSongById(currentSongId);
    if (newSong) {
      setSong(newSong);
      setTempo(newSong.tempo);
      handleStop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSongId]);

  // Update audio player tempo
  useEffect(() => {
    const player = getAudioPlayer();
    player.setTempo(tempo);
  }, [tempo]);

  // Animation loop for smooth playhead with repeat support
  const animatePlayhead = useCallback(() => {
    if (!isPlaying || !layout || !playbackSequence) return;

    const now = performance.now();
    const elapsedMs = now - playStartTimeRef.current;
    const beatsPerMs = tempo / 60 / 1000;
    const playbackBeat = startBeatRef.current + elapsedMs * beatsPerMs;

    // Check if we've reached the end (including repeats)
    if (playbackBeat >= totalPlaybackBeats) {
      setIsPlaying(false);
      setCurrentBeat(0);
      setActiveNoteIndex(-1);
      return;
    }

    // Find the current position in the playback sequence
    let currentSeqIndex = 0;
    for (let i = 0; i < playbackSequence.length; i++) {
      const seq = playbackSequence[i];
      const note = layout.notes[seq.noteIndex];
      if (playbackBeat < seq.beatPosition + note.duration) {
        currentSeqIndex = i;
        break;
      }
    }

    // Get the visual note index and beat position
    const seq = playbackSequence[currentSeqIndex];
    const visualNoteIndex = seq.noteIndex;
    const visualNote = layout.notes[visualNoteIndex];

    // Calculate visual beat for playhead (using the original note's beat position)
    const beatWithinNote = playbackBeat - seq.beatPosition;
    const visualBeat = visualNote.beatPosition + beatWithinNote;

    setCurrentBeat(visualBeat);

    if (activeNoteIndex !== visualNoteIndex) {
      setActiveNoteIndex(visualNoteIndex);
    }

    rafRef.current = requestAnimationFrame(animatePlayhead);
  }, [
    isPlaying,
    layout,
    playbackSequence,
    tempo,
    totalPlaybackBeats,
    activeNoteIndex,
  ]);

  // Start/stop animation when playing state changes
  useEffect(() => {
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(animatePlayhead);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying, animatePlayhead]);

  // Keyboard shortcut for space to play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        handlePlayPause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, layout, tempo, song]);

  const handlePlayPause = useCallback(() => {
    const player = getAudioPlayer();

    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else if (layout && playbackSequence) {
      player.setTempo(tempo);

      // Store the start time and current beat position
      playStartTimeRef.current = performance.now();
      startBeatRef.current = 0; // Always start from beginning for now

      // Create expanded notes array for audio playback
      const expandedNotes = playbackSequence.map(
        (seq) => layout.notes[seq.noteIndex],
      );

      player.playSong(song, expandedNotes, (index) => {
        if (index === -1) {
          setIsPlaying(false);
          setCurrentBeat(0);
          setActiveNoteIndex(-1);
        }
      });
      setIsPlaying(true);
    }
  }, [isPlaying, layout, playbackSequence, song, tempo]);

  const handleStop = useCallback(() => {
    const player = getAudioPlayer();
    player.stop();
    setIsPlaying(false);
    setCurrentBeat(0);
    setActiveNoteIndex(-1);
  }, []);

  const handleReset = useCallback(() => {
    const player = getAudioPlayer();
    player.reset();
    setCurrentBeat(0);
    setActiveNoteIndex(-1);
    startBeatRef.current = 0;
  }, []);

  const handleNoteClick = useCallback(
    (index: number, note: RenderedNote) => {
      setActiveNoteIndex(index);

      if (isPlaying && layout && playbackSequence) {
        // Find the position in playback sequence for this visual note
        const seqIndex = playbackSequence.findIndex(
          (seq) => seq.noteIndex === index,
        );
        if (seqIndex >= 0) {
          const player = getAudioPlayer();
          const expandedNotes = playbackSequence.map(
            (seq) => layout.notes[seq.noteIndex],
          );
          player.seekTo(seqIndex, expandedNotes);

          // Update playhead position
          const seq = playbackSequence[seqIndex];
          playStartTimeRef.current = performance.now();
          startBeatRef.current = seq.beatPosition;
          setCurrentBeat(note.beatPosition);
        }
      } else {
        setTimeout(() => {
          if (!isPlaying) {
            setActiveNoteIndex(-1);
          }
        }, 160);
      }
    },
    [isPlaying, layout, playbackSequence],
  );

  const handleLayoutChange = useCallback((newLayout: LayoutResult) => {
    setLayout(newLayout);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-gray-800 tracking-tight m-0">
          3-Line Treble Kid Staff - Music Teaching App
        </h1>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          Only the &quot;green zone&quot; notes:{" "}
          <b className="text-gray-700">C D E F G A B C</b>. Three staff lines
          (E, G, B) plus one optional ledger line below for middle C. Click
          notes to hear them.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-3.5">
        {/* Controls Panel */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-3.5 py-3 border-b border-gray-200 flex items-center justify-between gap-2.5">
            <div className="font-bold text-sm text-gray-800">Controls</div>
            <div className="text-xs text-gray-500">
              <kbd className="font-mono text-xs px-1.5 py-0.5 rounded-lg border border-gray-300 bg-gray-100 text-gray-700">
                Space
              </kbd>{" "}
              play / pause
            </div>
          </div>

          <div className="p-3.5 space-y-4">
            <SongSelector value={currentSongId} onChange={setCurrentSongId} />

            <PlaybackControls
              isPlaying={isPlaying}
              tempo={tempo}
              onPlay={handlePlayPause}
              onStop={handleStop}
              onReset={handleReset}
              onTempoChange={setTempo}
            />

            <DisplayOptions
              showLabels={showLabels}
              monoMode={monoMode}
              useStandardNotation={useStandardNotation}
              onShowLabelsChange={setShowLabels}
              onMonoModeChange={setMonoMode}
              onNotationStyleChange={setUseStandardNotation}
            />

            <ColorLegend monoMode={monoMode} />

            <div className="flex flex-wrap gap-2.5 text-xs text-gray-500">
              <div className="px-2.5 py-1.5 rounded-full border border-gray-200 bg-gray-50">
                Time signature: 4/4
              </div>
              <div className="px-2.5 py-1.5 rounded-full border border-gray-200 bg-gray-50">
                No sharps / flats
              </div>
              <div className="px-2.5 py-1.5 rounded-full border border-gray-200 bg-gray-50">
                Range: C4 - C5
              </div>
            </div>
          </div>
        </section>

        {/* Score Panel */}
        <section className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-3.5 py-3 border-b border-gray-200 flex items-center justify-between gap-2.5">
            <div className="font-bold text-sm text-gray-800">Score</div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Zoom:</label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-24 h-1.5"
                />
                <span className="text-xs text-gray-600 w-10">{zoom}%</span>
              </div>
              <div className="text-xs text-gray-500">
                Click a note to hear it
              </div>
            </div>
          </div>

          <SheetMusic
            song={song}
            isPlaying={isPlaying}
            currentBeat={currentBeat}
            activeNoteIndex={activeNoteIndex}
            showLabels={showLabels}
            monoMode={monoMode}
            useStandardNotation={useStandardNotation}
            zoom={zoom}
            onNoteClick={handleNoteClick}
            onLayoutChange={handleLayoutChange}
          />
        </section>
      </main>
    </div>
  );
}
