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
  isAudioReady,
  getTransport,
  getDraw,
  beatsToSeconds,
  scheduleNote,
  stopAllNotes,
  Tone,
} from "@/lib/audio/TonePlayer";
import { pitchToMidi } from "@/lib/constants";
import {
  Pitch,
  EditorNote,
  RepeatMarker,
  TimeSignature,
  TimeSignatureChange,
} from "@/lib/types";
import { getLayoutConfig } from "@/components/NoteEditor";
import {
  LEFT_MARGIN,
  SYSTEM_HEIGHT,
  SYSTEM_TOP_MARGIN,
  MIN_BEAT_WIDTH,
  BASE_BEAT_WIDTH,
  TIME_SIG_DISPLAY_WIDTH,
  REPEAT_MARKER_WIDTH,
} from "@/lib/layoutUtils";

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
  timeSignatureChanges?: TimeSignatureChange[];
  measuresPerRow: number;
  totalMeasures: number;
  containerWidth?: number;
  containerHeight?: number;
  onScrollTo?: (scrollLeft: number, scrollTop: number) => void;
  noteSpacing?: number; // 1.0 to 2.0, default 1.0
}

// Measure info for playback cursor positioning
interface PlaybackMeasureInfo {
  startBeatInSystem: number;
  beatsInMeasure: number;
  xOffset: number; // X offset accounting for decorations
}

// Simplified system layout for playback cursor positioning
interface PlaybackSystemLayout {
  startBeat: number; // Absolute beat where this system starts
  totalBeats: number;
  beatWidth: number;
  staffRight: number;
  measures: PlaybackMeasureInfo[]; // Measure-level info for xOffset
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
    timeSignatureChanges = [],
    measuresPerRow,
    totalMeasures,
    containerWidth,
    containerHeight,
    onScrollTo,
    noteSpacing = 1.0,
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
    const defaultBeatsPerMeasure = layout.beatsPerMeasure;
    const systemCount = Math.ceil(totalMeasures / measuresPerRow);

    // Sort time signature changes for lookup
    const sortedChanges = [...timeSignatureChanges].sort(
      (a, b) => a.measureNumber - b.measureNumber,
    );

    // Helper to get time signature at a given measure
    const getTimeSigAtMeasure = (measureNum: number) => {
      let timeSig = timeSignature;
      for (const change of sortedChanges) {
        if (change.measureNumber <= measureNum) {
          timeSig = change.timeSignature;
        } else {
          break;
        }
      }
      return timeSig;
    };

    // Helper to get beats per measure at a given measure
    const getBeatsAtMeasure = (measureNum: number): number => {
      return getTimeSigAtMeasure(measureNum).numerator;
    };

    // Helper to check if time sig should be displayed at a measure
    // Must match NoteEditor logic exactly for cursor alignment
    const shouldShowTimeSig = (
      measureNum: number,
      isFirstInRow: boolean,
    ): boolean => {
      // Don't show at measure 0 - it's already shown in the left margin
      if (measureNum === 0) return false;
      if (sortedChanges.some((c) => c.measureNumber === measureNum))
        return true;
      if (isFirstInRow) {
        const currentSig = getTimeSigAtMeasure(measureNum);
        const prevSig = getTimeSigAtMeasure(measureNum - 1);
        return (
          currentSig.numerator !== timeSignature.numerator ||
          currentSig.denominator !== timeSignature.denominator ||
          prevSig.numerator !== currentSig.numerator ||
          prevSig.denominator !== currentSig.denominator
        );
      }
      return false;
    };

    // Create sets for repeat marker lookup (using absolute measureNumber)
    const repeatStartMeasures = new Set(
      composition.repeatMarkers
        .filter((m) => m.type === "start")
        .map((m) => m.measureNumber),
    );
    const repeatEndMeasures = new Set(
      composition.repeatMarkers
        .filter((m) => m.type === "end")
        .map((m) => m.measureNumber),
    );

    // Calculate per-system layouts (matching NoteEditor logic with decorations)
    const systemLayouts: PlaybackSystemLayout[] = [];
    let maxEffectiveWidth = 0;

    // Pass 1: Calculate total beats and decoration widths for each system
    interface SystemData {
      measures: PlaybackMeasureInfo[];
      totalBeats: number;
      totalDecorationWidth: number;
      startBeat: number;
    }
    const systemData: SystemData[] = [];
    let absoluteBeat = 0;

    for (let sysIdx = 0; sysIdx < systemCount; sysIdx++) {
      const startMeasure = sysIdx * measuresPerRow;
      const measures: PlaybackMeasureInfo[] = [];
      let systemTotalBeats = 0;
      let totalDecorationWidth = 0;

      for (let m = 0; m < measuresPerRow; m++) {
        const measureNum = startMeasure + m;
        if (measureNum >= totalMeasures) break;

        const beatsInMeasure = getBeatsAtMeasure(measureNum);
        const isFirstInRow = m === 0;
        const showTimeSig = shouldShowTimeSig(measureNum, isFirstInRow);
        const hasRepeatStart = repeatStartMeasures.has(measureNum);
        const hasRepeatEnd = repeatEndMeasures.has(measureNum);

        // Note: For first measure of row, time sig is rendered in preamble area
        // (with clef), not as a prefix after bar line. Match NoteEditor logic.
        let prefixWidth = 0;
        if (showTimeSig && !isFirstInRow) prefixWidth += TIME_SIG_DISPLAY_WIDTH;
        if (hasRepeatStart) prefixWidth += REPEAT_MARKER_WIDTH;

        let suffixWidth = 0;
        if (hasRepeatEnd) suffixWidth += REPEAT_MARKER_WIDTH;

        measures.push({
          startBeatInSystem: systemTotalBeats,
          beatsInMeasure,
          xOffset: 0, // Will be calculated in pass 2
        });

        systemTotalBeats += beatsInMeasure;
        totalDecorationWidth += prefixWidth + suffixWidth;
      }

      systemData.push({
        measures,
        totalBeats: systemTotalBeats,
        totalDecorationWidth,
        startBeat: absoluteBeat,
      });

      const effectiveBeatWidth = BASE_BEAT_WIDTH * noteSpacing;
      const systemEffectiveWidth =
        systemTotalBeats * Math.max(MIN_BEAT_WIDTH, effectiveBeatWidth) +
        totalDecorationWidth;
      maxEffectiveWidth = Math.max(maxEffectiveWidth, systemEffectiveWidth);

      absoluteBeat += systemTotalBeats;
    }

    // Calculate uniform width and staffRight
    const uniformContentWidth = maxEffectiveWidth;
    const staffRight = LEFT_MARGIN + uniformContentWidth;

    // Pass 2: Build system layouts with per-system beat widths and xOffsets
    for (let sysIdx = 0; sysIdx < systemCount; sysIdx++) {
      const data = systemData[sysIdx];
      const { measures, totalBeats, totalDecorationWidth, startBeat } = data;

      const availableForBeats = uniformContentWidth - totalDecorationWidth;
      const beatWidth =
        totalBeats > 0 ? availableForBeats / totalBeats : BASE_BEAT_WIDTH;

      // Calculate xOffsets for each measure
      let currentX = 0;
      const startMeasure = sysIdx * measuresPerRow;
      for (let m = 0; m < measures.length; m++) {
        const measureNum = startMeasure + m;
        const isFirstInRow = m === 0;
        const showTimeSig = shouldShowTimeSig(measureNum, isFirstInRow);
        const hasRepeatStart = repeatStartMeasures.has(measureNum);

        // Note: For first measure of row, time sig is in preamble, not prefix
        let prefixWidth = 0;
        if (showTimeSig && !isFirstInRow) prefixWidth += TIME_SIG_DISPLAY_WIDTH;
        if (hasRepeatStart) prefixWidth += REPEAT_MARKER_WIDTH;

        measures[m].xOffset = currentX + prefixWidth;

        const hasRepeatEnd = repeatEndMeasures.has(measureNum);
        let suffixWidth = 0;
        if (hasRepeatEnd) suffixWidth += REPEAT_MARKER_WIDTH;

        currentX =
          measures[m].xOffset +
          measures[m].beatsInMeasure * beatWidth +
          suffixWidth;
      }

      systemLayouts.push({
        startBeat,
        totalBeats,
        beatWidth,
        staffRight,
        measures,
      });
    }

    // Use default for backward compatibility in repeat calculations
    const totalBeats = absoluteBeat;
    const beatsPerMeasure = defaultBeatsPerMeasure;

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

    // Helper to find which system contains a given absolute beat
    const getSystemForBeat = (absBeat: number): number => {
      for (let i = 0; i < systemLayouts.length; i++) {
        const sys = systemLayouts[i];
        const nextStart =
          i < systemLayouts.length - 1
            ? systemLayouts[i + 1].startBeat
            : sys.startBeat + sys.totalBeats;
        if (absBeat >= sys.startBeat && absBeat < nextStart) {
          return i;
        }
      }
      return systemLayouts.length - 1;
    };

    const absoluteBeatToVisual = (absBeat: number) => {
      const systemIdx = getSystemForBeat(absBeat);
      const sys = systemLayouts[systemIdx] || systemLayouts[0];
      const beatInSystem = absBeat - sys.startBeat;

      // Find the measure containing this beat and use its xOffset
      let measureXOffset = 0;
      let beatInMeasure = beatInSystem;
      for (const measure of sys.measures) {
        if (
          beatInSystem >= measure.startBeatInSystem &&
          beatInSystem < measure.startBeatInSystem + measure.beatsInMeasure
        ) {
          measureXOffset = measure.xOffset;
          beatInMeasure = beatInSystem - measure.startBeatInSystem;
          break;
        }
      }

      // NOTE: Don't add noteOffset here - the cursor tracks continuous time
      // progression, while noteOffset is for positioning static note elements.
      // Adding it here made the cursor appear 25% ahead of actual playback.

      return {
        system: systemIdx,
        x: LEFT_MARGIN + measureXOffset + beatInMeasure * sys.beatWidth,
        beatWidth: sys.beatWidth,
        systemEndBeat: sys.startBeat + sys.totalBeats,
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
        const systemEndBeat = startVisual.systemEndBeat;
        const segmentEndBeat = Math.min(endAbsBeat, systemEndBeat);
        const endVisual = absoluteBeatToVisual(segmentEndBeat);

        const duration = segmentEndBeat - currentBeat;
        const sys = systemLayouts[startVisual.system] || systemLayouts[0];

        timeline.push({
          startBeat: currentTimelineBeat,
          endBeat: currentTimelineBeat + duration,
          system: startVisual.system,
          startX: startVisual.x,
          endX: segmentEndBeat === systemEndBeat ? sys.staffRight : endVisual.x,
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
    };
  }, [
    composition,
    tempo,
    timeSignature,
    timeSignatureChanges,
    measuresPerRow,
    totalMeasures,
    noteSpacing,
  ]);

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
    // Step 1: Initialize audio context (required for Web Audio API)
    // This MUST be called from a user gesture (click/tap) to unlock audio.
    // On iOS Safari, audio won't play at all without this user-initiated call.
    // The function is idempotent - subsequent calls return the same promise.
    await initAudio();

    // Step 2: Verify audio actually started
    // IMPORTANT: initAudio() resolving does NOT guarantee audio is working!
    // The AudioContext may still be "suspended" if:
    // - Browser didn't accept the user gesture (too far from click event)
    // - iOS Safari wanted a more direct interaction
    // - Page loaded too recently
    //
    // If audio isn't ready, we show a helpful error and bail out.
    // This prevents the confusing UX of playhead moving with no sound.
    if (!isAudioReady()) {
      toast.error(
        "Audio failed to start. Please tap the screen and try again.",
      );
      return;
    }

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
      midi: pitchToMidi(note.pitch),
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

    // Start Transport immediately - the increased lookAhead handles scheduling buffer
    // (We tested "+0.1" delay but it caused silence issues)
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
