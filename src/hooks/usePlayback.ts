/**
 * Playback Hook (Tone.js Transport-based)
 *
 * Uses Tone.Transport for sample-accurate scheduling and
 * Tone.Draw for synchronized visual updates.
 *
 * Encapsulates all playback logic including:
 * - Play/pause/stop controls
 * - Playhead cursor animation (synced to audio)
 * - Repeat marker expansion
 * - Note scheduling and audio playback
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
  initAudio,
  getTransport,
  getDraw,
  beatsToSeconds,
  scheduleNote,
  stopAllNotes,
  Tone,
} from "@/lib/audio/TonePlayer";
import { MIDI_NOTES } from "@/lib/constants";
import { Pitch, EditorNote, RepeatMarker, TimeSignature } from "@/lib/types";
import {
  getLayoutConfig,
  LEFT_MARGIN,
  BEAT_WIDTH,
  SYSTEM_HEIGHT,
  SYSTEM_TOP_MARGIN,
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
  containerWidth?: number;
  containerHeight?: number;
  onScrollTo?: (scrollLeft: number, scrollTop: number) => void;
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
    containerWidth,
    containerHeight,
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

  // Refs for playback control
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const partRef = useRef<Tone.Part | null>(null);
  const rafRef = useRef<number | null>(null); // For playhead animation
  const endEventRef = useRef<number | null>(null);
  const timelineRef = useRef<TimelineSegment[]>([]);
  const totalPlaybackSecondsRef = useRef<number>(0);
  const systemCountRef = useRef<number>(1);
  const tempoRef = useRef<number>(120); // Store tempo for RAF calculations

  // Refs for Tone.js singletons (following React best practices)
  // These are initialized lazily when playback starts
  const transportRef = useRef<typeof Tone.Transport | null>(null);
  const drawRef = useRef<typeof Tone.Draw | null>(null);

  // Helper to get Transport (initializes on first use)
  const getTransportInstance = useCallback(() => {
    if (!transportRef.current) {
      transportRef.current = getTransport();
    }
    return transportRef.current;
  }, []);

  // Helper to get Draw (initializes on first use)
  const getDrawInstance = useCallback(() => {
    if (!drawRef.current) {
      drawRef.current = getDraw();
    }
    return drawRef.current;
  }, []);

  // Build playback data (extracted for reuse)
  const buildPlaybackData = useCallback(() => {
    const layout = getLayoutConfig(timeSignature, measuresPerRow);
    const beatsPerMeasure = layout.beatsPerMeasure;
    const BEATS_PER_SYSTEM = measuresPerRow * beatsPerMeasure;
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
    const totalPlaybackSeconds = beatsToSeconds(totalPlaybackBeats, tempo);

    return {
      playbackSequence,
      timeline,
      totalPlaybackSeconds,
      totalPlaybackBeats,
      BEATS_PER_SYSTEM,
    };
  }, [composition, tempo, timeSignature, measuresPerRow, totalMeasures]);

  // Calculate playhead position from current beat
  const getPlayheadPosition = useCallback(
    (currentBeat: number, timeline: TimelineSegment[]) => {
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

      return { x: currentX, system: currentSystem };
    },
    [],
  );

  // Clean up Transport events
  const cleanupTransport = useCallback(() => {
    const transport = getTransportInstance();

    // Stop and clear Transport
    transport.stop();
    transport.cancel();

    // Dispose of Part if exists
    if (partRef.current) {
      partRef.current.dispose();
      partRef.current = null;
    }

    // Cancel RAF animation
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Clear end event if scheduled
    if (endEventRef.current !== null) {
      transport.clear(endEventRef.current);
      endEventRef.current = null;
    }

    // Stop any playing notes
    stopAllNotes();
  }, [getTransportInstance]);

  // Stop playback handler (resets everything)
  const handleStop = useCallback(() => {
    cleanupTransport();

    setIsPlaying(false);
    setIsPaused(false);
    isPlayingRef.current = false;
    isPausedRef.current = false;
    setPlayheadX(null);
    setPlayheadSystem(0);
    setActivePitch(null);
    setActiveNoteId(null);
    setActiveNoteDuration(undefined);
    setActiveNoteStartTime(undefined);
  }, [cleanupTransport]);

  // Pause playback handler (keeps position)
  const handlePause = useCallback(() => {
    if (!isPlayingRef.current) return;

    getTransportInstance().pause();
    stopAllNotes();

    setIsPlaying(false);
    setIsPaused(true);
    isPlayingRef.current = false;
    isPausedRef.current = true;
  }, [getTransportInstance]);

  // Play handler
  const handlePlay = useCallback(async () => {
    // Initialize audio on first interaction (handles iOS Safari)
    await initAudio();

    if (composition.notes.length === 0) {
      toast.error("No notes to play");
      return;
    }

    const { playbackSequence, timeline, totalPlaybackSeconds } =
      buildPlaybackData();

    // Get Tone.js instances (lazy initialization)
    const transport = getTransportInstance();
    const draw = getDrawInstance();

    // Store for playhead calculation
    timelineRef.current = timeline;
    totalPlaybackSecondsRef.current = totalPlaybackSeconds;
    systemCountRef.current = Math.ceil(totalMeasures / measuresPerRow);

    // Set tempo on Transport
    transport.bpm.value = tempo;
    tempoRef.current = tempo;

    // RAF-based playhead animation function (reused for play and resume)
    const animatePlayhead = () => {
      if (!isPlayingRef.current) return;

      const currentSeconds = transport.seconds;
      const currentBeat = (currentSeconds * tempoRef.current) / 60;
      const { x, system } = getPlayheadPosition(
        currentBeat,
        timelineRef.current,
      );

      setPlayheadX(x);
      setPlayheadSystem(system);

      // Check if playback should end
      if (currentSeconds >= totalPlaybackSecondsRef.current) {
        handleStop();
        return;
      }

      // Scroll-follow: keep playhead visible with system snapping
      if (onScrollTo && containerWidth && containerHeight) {
        // Horizontal: center playhead in viewport
        const desiredScrollX = x - containerWidth / 2;

        // Vertical: snap to current system row
        const systemY = SYSTEM_TOP_MARGIN + system * SYSTEM_HEIGHT;
        const desiredScrollY =
          systemY - containerHeight / 2 + SYSTEM_HEIGHT / 2;

        onScrollTo(Math.max(0, desiredScrollX), Math.max(0, desiredScrollY));
      }

      rafRef.current = requestAnimationFrame(animatePlayhead);
    };

    // If resuming from pause, just start Transport and RAF
    if (isPausedRef.current) {
      setIsPlaying(true);
      setIsPaused(false);
      isPlayingRef.current = true;
      isPausedRef.current = false;
      transport.start();
      rafRef.current = requestAnimationFrame(animatePlayhead);
      return;
    }

    // Clean up any existing playback
    cleanupTransport();

    // Create note events for Tone.Part
    const noteEvents = playbackSequence.map((note) => ({
      time: beatsToSeconds(note.playBeat, tempo),
      midi: MIDI_NOTES[note.pitch],
      duration: beatsToSeconds(note.duration, tempo) * 0.9,
      id: note.id,
      pitch: note.pitch,
      noteDuration: note.duration,
    }));

    // Create Part for note scheduling
    partRef.current = new Tone.Part((time, value) => {
      // Play the audio at the scheduled time
      if (value.midi > 0) {
        scheduleNote(value.midi, value.duration, time);
      }

      // Schedule visual update synced to audio
      draw.schedule(() => {
        setActiveNoteId(value.id);
        setActivePitch(value.pitch as Pitch);
        setActiveNoteDuration(value.noteDuration);
        setActiveNoteStartTime(performance.now());
      }, time);
    }, noteEvents);

    partRef.current.start(0);

    // Update state
    setIsPlaying(true);
    setIsPaused(false);
    isPlayingRef.current = true;
    isPausedRef.current = false;

    // Start playhead at beginning
    setPlayheadX(LEFT_MARGIN);
    setPlayheadSystem(0);

    // Start Transport and RAF animation together
    transport.start();
    rafRef.current = requestAnimationFrame(animatePlayhead);
  }, [
    composition,
    tempo,
    timeSignature,
    measuresPerRow,
    totalMeasures,
    containerWidth,
    containerHeight,
    onScrollTo,
    buildPlaybackData,
    cleanupTransport,
    getPlayheadPosition,
    getTransportInstance,
    getDrawInstance,
    handleStop,
  ]);

  // Toggle play/pause
  const handleTogglePlayPause = useCallback(() => {
    if (isPlayingRef.current) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [handlePause, handlePlay]);

  // Global spacebar listener - uses keyup to prevent repeated triggers when holding
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
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

    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [handleTogglePlayPause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTransport();
    };
  }, [cleanupTransport]);

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
