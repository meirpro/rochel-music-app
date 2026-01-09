/**
 * Playback Hook
 *
 * Encapsulates all playback logic including:
 * - Play/stop controls
 * - Animation loop with playhead cursor
 * - Repeat marker expansion
 * - Note scheduling and audio playback
 */

import { useState, useRef, useCallback } from "react";
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
  playheadX: number | null;
  playheadSystem: number;
  activePitch: Pitch | null;
  activeNoteId: string | null;
  activeNoteDuration: number | undefined;
  activeNoteStartTime: number | undefined;
  handlePlay: () => void;
  stopPlayback: () => void;
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
  const animationRef = useRef<number | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const playedNotesRef = useRef<Set<number>>(new Set());
  const playbackSequenceRef = useRef<PlaybackNote[]>([]);
  const timelineRef = useRef<TimelineSegment[]>([]);
  const msPerBeatRef = useRef<number>(0);

  // Stop playback handler
  const stopPlayback = useCallback(() => {
    const player = getAudioPlayer();
    player.stop();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setPlayheadX(null);
    setPlayheadSystem(0);
    setActivePitch(null);
    setActiveNoteId(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Play handler with full playback logic
  const handlePlay = useCallback(() => {
    if (isPlayingRef.current) {
      stopPlayback();
      return;
    }

    if (composition.notes.length === 0) {
      toast.error("No notes to play");
      return;
    }

    // Get layout config using user-defined measuresPerRow
    const layout = getLayoutConfig(timeSignature, measuresPerRow);
    const beatsPerMeasure = layout.beatsPerMeasure;
    const BEATS_PER_SYSTEM = measuresPerRow * beatsPerMeasure;

    setIsPlaying(true);
    isPlayingRef.current = true;
    const player = getAudioPlayer();
    player.setTempo(tempo);

    // Calculate timing based on user-defined totalMeasures
    const msPerBeat = 60000 / tempo;
    const systemCount = Math.ceil(totalMeasures / measuresPerRow);
    const totalBeats = totalMeasures * beatsPerMeasure;

    // Sort notes by absoluteBeat for playback
    const sortedNotes = [...composition.notes].sort(
      (a, b) => a.absoluteBeat - b.absoluteBeat,
    );

    // Build repeat sections from paired markers (using new measureNumber format)
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

    const playedNotes = new Set<number>();
    const activeNotes = new Map<string, number>();
    const startTime = performance.now();

    playbackSequenceRef.current = playbackSequence;
    timelineRef.current = timeline;
    msPerBeatRef.current = msPerBeat;
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
        // Assume viewport width of ~800px for centering calculation
        // The container will clamp this to valid scroll range
        const viewportCenter = 400;
        const desiredScroll = currentX - viewportCenter;
        // Only scroll on the current system (row 0 for now)
        // For multi-row, we'd need to handle vertical scrolling too
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
        setPlayheadX(null);
        setActiveNoteId(null);
        setActivePitch(null);
        setIsPlaying(false);
        isPlayingRef.current = false;
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
    stopPlayback,
  ]);

  return {
    isPlaying,
    playheadX,
    playheadSystem,
    activePitch,
    activeNoteId,
    activeNoteDuration,
    activeNoteStartTime,
    handlePlay,
    stopPlayback,
  };
}
