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
  getAbsoluteBeat,
  calculateSystemCount,
  getAbsoluteMeasureNumber,
  getBeatsPerSystem,
} from "@/lib/migration";
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
  measuresPerRow?: number;
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
  const { composition, tempo, timeSignature, measuresPerRow } = options;

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

    // Get layout config
    const layout = getLayoutConfig(timeSignature, measuresPerRow);
    const BEATS_PER_SYSTEM = layout.beatsPerSystem;
    const beatsPerMeasure = layout.beatsPerMeasure;

    setIsPlaying(true);
    isPlayingRef.current = true;
    const player = getAudioPlayer();
    player.setTempo(tempo);

    // Calculate timing
    const msPerBeat = 60000 / tempo;
    const beatsPerSystem = getBeatsPerSystem(timeSignature);
    const systemCount = calculateSystemCount(composition, beatsPerSystem);
    const totalBeats = systemCount * beatsPerSystem;

    // Sort notes by position for playback
    const sortedNotes = [...composition.notes].sort((a, b) => {
      const beatA = getAbsoluteBeat(a, beatsPerSystem);
      const beatB = getAbsoluteBeat(b, beatsPerSystem);
      return beatA - beatB;
    });

    // Build repeat sections from paired markers
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

    const measuresPerSystem = 2;
    for (const marker of composition.repeatMarkers) {
      if (marker.type !== "start" || processedPairIds.has(marker.pairId))
        continue;
      const endMarker = composition.repeatMarkers.find(
        (m) => m.pairId === marker.pairId && m.type === "end",
      );
      if (endMarker) {
        const startMeasureNum = getAbsoluteMeasureNumber(
          marker,
          measuresPerSystem,
        );
        const endMeasureNum = getAbsoluteMeasureNumber(
          endMarker,
          measuresPerSystem,
        );
        const startAbsoluteBeat = startMeasureNum * beatsPerMeasure;
        const endAbsoluteBeat = endMeasureNum * beatsPerMeasure;

        if (endAbsoluteBeat > startAbsoluteBeat) {
          const startSystem = Math.floor(startMeasureNum / measuresPerSystem);
          const startMeasure = startMeasureNum % measuresPerSystem;
          const endSystem = Math.floor(endMeasureNum / measuresPerSystem);
          const endMeasure = endMeasureNum % measuresPerSystem;

          repeatSections.push({
            pairId: marker.pairId,
            startSystem,
            startMeasure,
            endSystem,
            endMeasure,
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
    const getNoteAbsoluteBeat = (note: any) =>
      getAbsoluteBeat(note, beatsPerSystem);

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
  }, [composition, tempo, timeSignature, measuresPerRow, stopPlayback]);

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
