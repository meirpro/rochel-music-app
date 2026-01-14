/**
 * Playback Hook
 *
 * Encapsulates all playback logic including:
 * - Play/pause/stop controls
 * - Animation loop with playhead cursor
 * - Repeat marker expansion
 * - Note scheduling and audio playback
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { MIDI_NOTES } from "@/lib/constants";
import { Pitch, EditorNote, RepeatMarker, TimeSignature } from "@/lib/types";
import {
  getLayoutConfig,
  LEFT_MARGIN,
  BEAT_WIDTH,
} from "@/components/NoteEditor";

// Playback types
interface PlaybackNote extends EditorNote {
  playBeat: number;
}

interface TimelineSegment {
  startBeat: number;
  endBeat: number;
  system: number;
  startX: number;
  endX: number;
}

interface UsePlaybackOptions {
  composition: {
    notes: EditorNote[];
    repeatMarkers: RepeatMarker[];
  };
  tempo: number;
  timeSignature: TimeSignature;
  measuresPerRow: number;
  totalMeasures: number;
  onScrollTo?: (scrollLeft: number) => void; // Callback to scroll the container
}

interface UsePlaybackReturn {
  isPlaying: boolean;
  isPaused: boolean;
  playheadX: number | null;
  playheadSystem: number;
  activePitch: Pitch | null;
  activeNoteId: string | null;
  activeNoteDuration: number | undefined;
  activeNoteStartTime: number | undefined;
  handlePlay: () => void;
  handlePause: () => void;
  handleStop: () => void;
  handleTogglePlayPause: () => void;
}

export function usePlayback(options: UsePlaybackOptions): UsePlaybackReturn {
  const {
    composition,
    tempo,
    timeSignature,
    measuresPerRow,
    totalMeasures,
    onScrollTo,
  } = options;

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playheadX, setPlayheadX] = useState<number | null>(null);
  const [playheadSystem, setPlayheadSystem] = useState<number>(0);
  const [activePitch, setActivePitch] = useState<Pitch | null>(null);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activeNoteDuration, setActiveNoteDuration] = useState<
    number | undefined
  >();
  const [activeNoteStartTime, setActiveNoteStartTime] = useState<
    number | undefined
  >();

  // Refs for playback
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const pausedAtBeatRef = useRef<number>(0);
  const playedNotesRef = useRef<Set<number>>(new Set());
  const playbackSequenceRef = useRef<PlaybackNote[]>([]);
  const timelineRef = useRef<TimelineSegment[]>([]);
  const msPerBeatRef = useRef<number>(0);
  const totalPlaybackMsRef = useRef<number>(0);

  // Stop playback handler (resets everything)
  const handleStop = useCallback(() => {
    const player = getAudioPlayer();
    player.stop();
    setIsPlaying(false);
    setIsPaused(false);
    isPlayingRef.current = false;
    isPausedRef.current = false;
    pausedAtBeatRef.current = 0;
    setPlayheadX(null);
    setPlayheadSystem(0);
    setActivePitch(null);
    setActiveNoteId(null);
    playedNotesRef.current = new Set();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Pause playback handler (keeps position)
  const handlePause = useCallback(() => {
    if (!isPlayingRef.current) return;

    const player = getAudioPlayer();
    player.stop();

    // Calculate current beat position
    const elapsed = performance.now() - playbackStartTimeRef.current;
    pausedAtBeatRef.current = elapsed / msPerBeatRef.current;

    setIsPlaying(false);
    setIsPaused(true);
    isPlayingRef.current = false;
    isPausedRef.current = true;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Build playback data (extracted for reuse)
  const buildPlaybackData = useCallback(() => {
    const layout = getLayoutConfig(timeSignature, measuresPerRow);
    const beatsPerMeasure = layout.beatsPerMeasure;
    const BEATS_PER_SYSTEM = measuresPerRow * beatsPerMeasure;
    const msPerBeat = 60000 / tempo;
    const totalBeats = totalMeasures * beatsPerMeasure;

    // Sort notes by absoluteBeat for playback
    const sortedNotes = [...composition.notes].sort(
      (a, b) => a.absoluteBeat - b.absoluteBeat,
    );

    // Build repeat sections from paired markers
    interface RepeatSection {
      pairId: string;
      startAbsoluteBeat: number;
      endAbsoluteBeat: number;
    }
    const repeatSections: RepeatSection[] = [];
    const processedPairIds = new Set<string>();

    for (const marker of composition.repeatMarkers) {
      if (marker.type !== "start" || processedPairIds.has(marker.pairId))
        continue;
      const endMarker = composition.repeatMarkers.find(
        (m) => m.pairId === marker.pairId && m.type === "end",
      );
      if (endMarker) {
        const startAbsoluteBeat = marker.measureNumber * beatsPerMeasure;
        const endAbsoluteBeat = endMarker.measureNumber * beatsPerMeasure;

        if (endAbsoluteBeat > startAbsoluteBeat) {
          repeatSections.push({
            pairId: marker.pairId,
            startAbsoluteBeat,
            endAbsoluteBeat,
          });
        }
        processedPairIds.add(marker.pairId);
      }
    }
    repeatSections.sort((a, b) => a.startAbsoluteBeat - b.startAbsoluteBeat);

    // Build playback sequence with repeat handling
    const playbackSequence: PlaybackNote[] = [];
    const getNoteAbsoluteBeat = (note: EditorNote) => note.absoluteBeat;

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
          } as PlaybackNote);
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
          } as PlaybackNote);
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
          } as PlaybackNote);
        }
      }
      currentBeatOffset += section.endAbsoluteBeat - section.startAbsoluteBeat;

      lastProcessedBeat = section.endAbsoluteBeat;
    }

    // Add notes after all repeat sections
    for (const note of sortedNotes) {
      const noteBeat = getNoteAbsoluteBeat(note);
      if (noteBeat >= lastProcessedBeat) {
        playbackSequence.push({
          ...note,
          playBeat: currentBeatOffset + (noteBeat - lastProcessedBeat),
        } as PlaybackNote);
      }
    }
    currentBeatOffset += totalBeats - lastProcessedBeat;

    playbackSequence.sort((a, b) => a.playBeat - b.playBeat);

    // Build visual timeline segments for playhead
    const timeline: TimelineSegment[] = [];

    const absoluteBeatToVisual = (absBeat: number) => {
      const system = Math.floor(absBeat / BEATS_PER_SYSTEM);
      const beatInSystem = absBeat % BEATS_PER_SYSTEM;
      return {
        system,
        x: LEFT_MARGIN + beatInSystem * BEAT_WIDTH,
      };
    };

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
      if (section.startAbsoluteBeat > lastProcessedAbsBeat) {
        timelineBeat = addSegmentsBetween(
          lastProcessedAbsBeat,
          section.startAbsoluteBeat,
          timelineBeat,
        );
      }

      timelineBeat = addSegmentsBetween(
        section.startAbsoluteBeat,
        section.endAbsoluteBeat,
        timelineBeat,
      );

      timelineBeat = addSegmentsBetween(
        section.startAbsoluteBeat,
        section.endAbsoluteBeat,
        timelineBeat,
      );

      lastProcessedAbsBeat = section.endAbsoluteBeat;
    }

    if (lastProcessedAbsBeat < totalBeats) {
      timelineBeat = addSegmentsBetween(
        lastProcessedAbsBeat,
        totalBeats,
        timelineBeat,
      );
    }

    const totalPlaybackBeats = timelineBeat || currentBeatOffset;
    const totalPlaybackMs = totalPlaybackBeats * msPerBeat;

    return {
      playbackSequence,
      timeline,
      msPerBeat,
      totalPlaybackMs,
      BEATS_PER_SYSTEM,
    };
  }, [composition, tempo, timeSignature, measuresPerRow, totalMeasures]);

  // Play handler
  const handlePlay = useCallback(() => {
    if (composition.notes.length === 0) {
      toast.error("No notes to play");
      return;
    }

    const { playbackSequence, timeline, msPerBeat, totalPlaybackMs } =
      buildPlaybackData();

    const systemCount = Math.ceil(totalMeasures / measuresPerRow);
    const player = getAudioPlayer();
    player.setTempo(tempo);

    // Determine starting beat (resume from pause or start fresh)
    const startingBeat = isPausedRef.current ? pausedAtBeatRef.current : 0;

    // Build set of already-played notes if resuming
    const playedNotes = new Set<number>();
    if (isPausedRef.current) {
      for (let i = 0; i < playbackSequence.length; i++) {
        if (playbackSequence[i].playBeat < startingBeat) {
          playedNotes.add(i);
        }
      }
    }

    setIsPlaying(true);
    setIsPaused(false);
    isPlayingRef.current = true;
    isPausedRef.current = false;

    const activeNotes = new Map<string, number>();
    const startTime = performance.now() - startingBeat * msPerBeat;

    playbackSequenceRef.current = playbackSequence;
    timelineRef.current = timeline;
    msPerBeatRef.current = msPerBeat;
    totalPlaybackMsRef.current = totalPlaybackMs;
    playbackStartTimeRef.current = startTime;
    playedNotesRef.current = playedNotes;

    const animate = () => {
      if (!isPlayingRef.current) {
        setPlayheadX(null);
        setActiveNoteId(null);
        setActivePitch(null);
        setIsPlaying(false);
        return;
      }

      const elapsed = performance.now() - playbackStartTimeRef.current;
      const currentBeat = elapsed / msPerBeatRef.current;

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

      // Scroll-follow: keep playhead centered in viewport
      if (onScrollTo) {
        const viewportCenter = 400;
        const desiredScroll = currentX - viewportCenter;
        if (currentSystem === 0 || systemCount === 1) {
          onScrollTo(Math.max(0, desiredScroll));
        }
      }

      for (let i = 0; i < playbackSequence.length; i++) {
        if (playedNotesRef.current.has(i)) continue;
        const note = playbackSequence[i];
        if (currentBeat >= note.playBeat) {
          const midi = MIDI_NOTES[note.pitch];
          if (midi > 0) {
            const durationSeconds = (note.duration * 60) / tempo;
            player.playNote(midi, durationSeconds * 0.9);
          }
          playedNotesRef.current.add(i);

          const noteEndTime = elapsed + note.duration * msPerBeatRef.current;
          activeNotes.set(note.id, noteEndTime);
          setActiveNoteId(note.id);
          setActivePitch(note.pitch);
          setActiveNoteDuration(note.duration);
          setActiveNoteStartTime(performance.now());
        }
      }

      for (const [noteId, endTime] of activeNotes) {
        if (elapsed >= endTime) {
          activeNotes.delete(noteId);
          if (activeNotes.size === 0) {
            setActiveNoteId(null);
            setActivePitch(null);
          }
        }
      }

      if (elapsed < totalPlaybackMs) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Playback finished - reset everything
        setPlayheadX(null);
        setActiveNoteId(null);
        setActivePitch(null);
        setIsPlaying(false);
        setIsPaused(false);
        isPlayingRef.current = false;
        isPausedRef.current = false;
        pausedAtBeatRef.current = 0;
        playedNotesRef.current = new Set();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [
    composition,
    tempo,
    timeSignature,
    measuresPerRow,
    totalMeasures,
    onScrollTo,
    buildPlaybackData,
  ]);

  // Toggle play/pause
  const handleTogglePlayPause = useCallback(() => {
    if (isPlayingRef.current) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [handlePause, handlePlay]);

  // Global spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if spacebar and not in an input/textarea
      if (
        e.code === "Space" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      ) {
        e.preventDefault();
        handleTogglePlayPause();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTogglePlayPause]);

  return {
    isPlaying,
    isPaused,
    playheadX,
    playheadSystem,
    activePitch,
    activeNoteId,
    activeNoteDuration,
    activeNoteStartTime,
    handlePlay,
    handlePause,
    handleStop,
    handleTogglePlayPause,
  };
}
