"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { toast, Toaster } from "sonner";
import {
  NoteEditor,
  EditorNote,
  NoteTool,
  RepeatMarker,
  TimeSignature,
  LEFT_MARGIN,
  BEAT_WIDTH,
  getLayoutConfig,
  getBeatFromX,
} from "@/components/NoteEditor";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MusicRulesSidebar } from "@/components/MusicRulesSidebar";
import { SongLibrarySidebar } from "@/components/SongLibrarySidebar";
import { PianoDrawer } from "@/components/PianoDrawer";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { MIDI_NOTES } from "@/lib/constants";
import { Pitch, SavedSong, SavedSongsMap } from "@/lib/types";
import { getDefaultSongs } from "@/lib/defaultSongs";

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

// Playback types for seek functionality
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

// Types for localStorage persistence
interface EditorComposition {
  notes: EditorNote[];
  repeatMarkers: RepeatMarker[];
  systemCount: number;
}

interface EditorSettings {
  selectedTool: NoteTool;
  showLabels: boolean;
  showKidFaces: boolean;
  showGrid: boolean;
  allowChords: boolean;
  tempo: number;
  timeSignature: TimeSignature;
  pianoUseColors: boolean;
  pianoShowBlackKeys: boolean;
}

interface EditorUI {
  showRulesSidebar: boolean;
  showSongLibrary: boolean;
  showPiano: boolean;
}

const DEFAULT_COMPOSITION: EditorComposition = {
  notes: [],
  repeatMarkers: [],
  systemCount: 1,
};

const DEFAULT_SETTINGS: EditorSettings = {
  selectedTool: "quarter",
  showLabels: true,
  showKidFaces: false,
  showGrid: false,
  allowChords: false,
  tempo: 100,
  timeSignature: "4/4",
  pianoUseColors: true,
  pianoShowBlackKeys: false,
};

const DEFAULT_UI: EditorUI = {
  showRulesSidebar: true,
  showSongLibrary: false,
  showPiano: false,
};

// Migration function to convert old coordinate-based notes to beat-based
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateNote(note: any): EditorNote {
  if ("x" in note && !("beat" in note)) {
    // Old format - convert x to beat
    return {
      id: note.id,
      pitch: note.pitch,
      duration: note.duration,
      beat: getBeatFromX(note.x),
      system: note.system,
    };
  }
  return note; // Already new format
}

// Migrate an array of notes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateNotes(notes: any[]): EditorNote[] {
  return notes.map(migrateNote);
}

export default function EditorPage() {
  // Persisted state - composition (notes, markers, layout)
  const [composition, setComposition] = useLocalStorage<EditorComposition>(
    "rochel-editor-composition",
    DEFAULT_COMPOSITION,
  );

  // Persisted state - editor settings (tool, toggles, tempo, time sig)
  const [settings, setSettings] = useLocalStorage<EditorSettings>(
    "rochel-editor-settings",
    DEFAULT_SETTINGS,
  );

  // Persisted state - UI visibility
  const [ui, setUI] = useLocalStorage<EditorUI>("rochel-editor-ui", DEFAULT_UI);

  // Persisted state - saved songs library (initialized with defaults)
  const [savedSongs, setSavedSongs] = useLocalStorage<SavedSongsMap>(
    "rochel-saved-songs",
    getDefaultSongs(),
  );

  // Transient state - playback (not persisted)
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadX, setPlayheadX] = useState<number | null>(null);
  const [playheadSystem, setPlayheadSystem] = useState(0);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [activePitch, setActivePitch] = useState<Pitch | null>(null);
  const [activeNoteDuration, setActiveNoteDuration] = useState<number>(1);
  const [activeNoteStartTime, setActiveNoteStartTime] = useState<number>(0); // Unique timestamp for each note event

  const isPlayingRef = useRef(false);
  const animationRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Refs for seek functionality
  const playbackSequenceRef = useRef<PlaybackNote[]>([]);
  const timelineRef = useRef<TimelineSegment[]>([]);
  const playbackStartTimeRef = useRef<number>(0);
  const msPerBeatRef = useRef<number>(600);
  const playedNotesRef = useRef<Set<number>>(new Set());

  // Migration effect - convert old coordinate-based notes to beat-based
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Check if any notes need migration (have x property but no beat property)
    const needsMigration = composition.notes.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (note: any) => "x" in note && !("beat" in note),
    );
    if (needsMigration) {
      setComposition((prev) => ({
        ...prev,
        notes: migrateNotes(prev.notes),
      }));
    }
  }, []); // Only run once on mount - intentionally omit deps

  // Migration for saved songs library
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let needsMigration = false;
    const migratedSongs: SavedSongsMap = {};

    for (const [id, song] of Object.entries(savedSongs)) {
      const songNeedsMigration = song.composition.notes.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (note: any) => "x" in note && !("beat" in note),
      );
      if (songNeedsMigration) {
        needsMigration = true;
        migratedSongs[id] = {
          ...song,
          composition: {
            ...song.composition,
            notes: migrateNotes(song.composition.notes),
          },
        };
      } else {
        migratedSongs[id] = song;
      }
    }

    if (needsMigration) {
      setSavedSongs(migratedSongs);
    }
  }, []); // Only run once on mount - intentionally omit deps

  // Destructure for easier access
  const { notes, repeatMarkers, systemCount } = composition;
  const {
    selectedTool,
    showLabels,
    showKidFaces,
    showGrid,
    allowChords,
    tempo,
    timeSignature,
    pianoUseColors,
    pianoShowBlackKeys,
  } = settings;
  const { showRulesSidebar, showSongLibrary, showPiano } = ui;

  // Helper setters for composition
  const setNotes = useCallback(
    (notesOrUpdater: EditorNote[] | ((prev: EditorNote[]) => EditorNote[])) => {
      setComposition((prev) => ({
        ...prev,
        notes:
          typeof notesOrUpdater === "function"
            ? notesOrUpdater(prev.notes)
            : notesOrUpdater,
      }));
    },
    [setComposition],
  );

  const setRepeatMarkers = useCallback(
    (
      markersOrUpdater:
        | RepeatMarker[]
        | ((prev: RepeatMarker[]) => RepeatMarker[]),
    ) => {
      setComposition((prev) => ({
        ...prev,
        repeatMarkers:
          typeof markersOrUpdater === "function"
            ? markersOrUpdater(prev.repeatMarkers)
            : markersOrUpdater,
      }));
    },
    [setComposition],
  );

  const setSystemCount = useCallback(
    (countOrUpdater: number | ((prev: number) => number)) => {
      setComposition((prev) => ({
        ...prev,
        systemCount:
          typeof countOrUpdater === "function"
            ? countOrUpdater(prev.systemCount)
            : countOrUpdater,
      }));
    },
    [setComposition],
  );

  // Helper setters for settings
  const setSelectedTool = useCallback(
    (tool: NoteTool) => {
      setSettings((prev) => ({ ...prev, selectedTool: tool }));
    },
    [setSettings],
  );

  const setShowLabels = useCallback(
    (show: boolean) => {
      setSettings((prev) => ({ ...prev, showLabels: show }));
    },
    [setSettings],
  );

  const setShowKidFaces = useCallback(
    (show: boolean) => {
      setSettings((prev) => ({ ...prev, showKidFaces: show }));
    },
    [setSettings],
  );

  const setShowGrid = useCallback(
    (show: boolean) => {
      setSettings((prev) => ({ ...prev, showGrid: show }));
    },
    [setSettings],
  );

  const setAllowChords = useCallback(
    (allow: boolean) => {
      setSettings((prev) => ({ ...prev, allowChords: allow }));
    },
    [setSettings],
  );

  const setTempo = useCallback(
    (tempoValue: number) => {
      setSettings((prev) => ({ ...prev, tempo: tempoValue }));
    },
    [setSettings],
  );

  const setTimeSignature = useCallback(
    (sig: TimeSignature) => {
      setSettings((prev) => ({ ...prev, timeSignature: sig }));
    },
    [setSettings],
  );

  // Helper setter for UI
  const setShowRulesSidebar = useCallback(
    (show: boolean) => {
      setUI((prev) => ({ ...prev, showRulesSidebar: show }));
    },
    [setUI],
  );

  const setShowSongLibrary = useCallback(
    (show: boolean) => {
      setUI((prev) => ({ ...prev, showSongLibrary: show }));
    },
    [setUI],
  );

  const setShowPiano = useCallback(
    (show: boolean) => {
      setUI((prev) => ({ ...prev, showPiano: show }));
    },
    [setUI],
  );

  const setPianoUseColors = useCallback(
    (use: boolean) => {
      setSettings((prev) => ({ ...prev, pianoUseColors: use }));
    },
    [setSettings],
  );

  const setPianoShowBlackKeys = useCallback(
    (show: boolean) => {
      setSettings((prev) => ({ ...prev, pianoShowBlackKeys: show }));
    },
    [setSettings],
  );

  // Song library handlers
  const handleSaveSong = useCallback(
    (name: string) => {
      const id = `song-${Date.now()}`;
      const now = Date.now();
      const newSong: SavedSong = {
        id,
        name,
        createdAt: now,
        updatedAt: now,
        composition: {
          notes,
          repeatMarkers,
          systemCount,
        },
        settings: {
          tempo,
          timeSignature,
        },
      };
      setSavedSongs((prev) => ({ ...prev, [id]: newSong }));
      toast.success(`Saved "${name}"`, {
        description: `${notes.length} notes saved`,
        position: "top-left",
      });
    },
    [notes, repeatMarkers, systemCount, tempo, timeSignature, setSavedSongs],
  );

  const handleLoadSong = useCallback(
    (song: SavedSong) => {
      if (
        notes.length > 0 &&
        !confirm("Load this song? Current work will be replaced.")
      ) {
        return;
      }
      setComposition({
        notes: song.composition.notes,
        repeatMarkers: song.composition.repeatMarkers,
        systemCount: song.composition.systemCount,
      });
      setSettings((prev) => ({
        ...prev,
        tempo: song.settings.tempo,
        timeSignature: song.settings.timeSignature,
      }));
      toast.success(`Loaded "${song.name}"`, {
        description: `${song.composition.notes.length} notes`,
        position: "top-left",
      });
    },
    [notes.length, setComposition, setSettings],
  );

  const handleDeleteSong = useCallback(
    (songId: string) => {
      const song = savedSongs[songId];
      setSavedSongs((prev) => {
        const updated = { ...prev };
        delete updated[songId];
        return updated;
      });
      toast.success(`Deleted "${song?.name || "song"}"`, {
        position: "top-left",
      });
    },
    [savedSongs, setSavedSongs],
  );

  const handleRestoreDefaults = useCallback(() => {
    const defaults = getDefaultSongs();
    setSavedSongs((prev) => ({ ...prev, ...defaults }));
    toast.success("Default songs restored", {
      description: "Dayenu and Mashiach Now added",
      position: "top-left",
    });
  }, [setSavedSongs]);

  const handleExportSongs = useCallback(() => {
    const json = JSON.stringify(savedSongs, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "rochel-songs.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Songs exported", {
      description: `${Object.keys(savedSongs).length} songs saved to file`,
      position: "top-left",
    });
  }, [savedSongs]);

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

  // Handle playback with smooth scrolling
  const handlePlay = useCallback(() => {
    if (isPlayingRef.current || notes.length === 0) return;

    // Get dynamic layout based on current time signature
    const layout = getLayoutConfig(timeSignature);
    const BEATS_PER_SYSTEM = layout.beatsPerSystem;
    const beatsPerMeasure = layout.beatsPerMeasure;

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
      return a.beat - b.beat;
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
          marker.system * BEATS_PER_SYSTEM + marker.measure * beatsPerMeasure;
        const endAbsoluteBeat =
          endMarker.system * BEATS_PER_SYSTEM +
          endMarker.measure * beatsPerMeasure;
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
      note.system * BEATS_PER_SYSTEM + note.beat;

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

    // Store in refs for seek functionality
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
        if (playedNotesRef.current.has(i)) continue;
        const note = playbackSequence[i];
        if (currentBeat >= note.playBeat) {
          // Play this note
          const midi = MIDI_NOTES[note.pitch];
          if (midi > 0) {
            const durationSeconds = (note.duration * 60) / tempo;
            player.playNote(midi, durationSeconds * 0.9);
          }
          playedNotesRef.current.add(i);

          // Set as active note
          const noteEndTime = elapsed + note.duration * msPerBeatRef.current;
          activeNotes.set(note.id, noteEndTime);
          setActiveNoteId(note.id);
          setActivePitch(note.pitch);
          setActiveNoteDuration(note.duration);
          setActiveNoteStartTime(performance.now());
        }
      }

      // Clear expired active notes
      for (const [noteId, endTime] of activeNotes) {
        if (elapsed >= endTime) {
          activeNotes.delete(noteId);
          if (activeNotes.size === 0) {
            setActiveNoteId(null);
            setActivePitch(null);
          }
        }
      }

      // Continue or stop
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
  }, [notes, tempo, repeatMarkers, systemCount, timeSignature]);

  const handleStop = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    setPlayheadX(null);
    setActiveNoteId(null);
    setActivePitch(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const handleSeek = useCallback((clickX: number, clickSystem: number) => {
    // Only allow seeking during playback
    if (!isPlayingRef.current) return;

    // Find timeline segment and adjust startTime
    const timeline = timelineRef.current;
    if (timeline.length === 0) return;

    for (const segment of timeline) {
      if (
        segment.system === clickSystem &&
        clickX >= segment.startX &&
        clickX <= segment.endX
      ) {
        // Calculate beat within this segment
        const progress =
          (clickX - segment.startX) / (segment.endX - segment.startX);
        const targetBeat =
          segment.startBeat + progress * (segment.endBeat - segment.startBeat);

        // Adjust startTime so elapsed time matches targetBeat
        const elapsedMs = targetBeat * msPerBeatRef.current;
        playbackStartTimeRef.current = performance.now() - elapsedMs;

        // Reset played notes for notes after this point
        const playedNotes = playedNotesRef.current;
        const playbackSequence = playbackSequenceRef.current;
        playedNotes.clear();
        // Mark notes before current beat as played
        for (let i = 0; i < playbackSequence.length; i++) {
          if (playbackSequence[i].playBeat < targetBeat) {
            playedNotes.add(i);
          }
        }
        break;
      }
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
    noteType: "whole" | "half" | "quarter" | "dotted-quarter" | "eighth";
  }) => {
    const isHollow = noteType === "whole" || noteType === "half";
    const hasStem = noteType !== "whole";
    const hasFlag = noteType === "eighth";
    const hasDot = noteType === "dotted-quarter";

    return (
      <button
        onClick={() => setSelectedTool(selectedTool === tool ? null : tool)}
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
            cx="10"
            cy="16"
            rx="6"
            ry="4"
            fill={isHollow ? "#fff" : NOTE_COLORS.G}
            stroke={isHollow ? NOTE_COLORS.G : "#000"}
            strokeWidth={isHollow ? 2 : 1}
            transform="rotate(-15 10 16)"
          />
          {/* Stem */}
          {hasStem && (
            <line
              x1="15"
              y1="15"
              x2="15"
              y2="4"
              stroke={NOTE_COLORS.G}
              strokeWidth={2}
            />
          )}
          {/* Flag for eighth note */}
          {hasFlag && (
            <path
              d="M 15 4 Q 20 8 18 14"
              stroke={NOTE_COLORS.G}
              strokeWidth={2}
              fill="none"
            />
          )}
          {/* Dot for dotted notes */}
          {hasDot && <circle cx="20" cy="14" r="2.5" fill={NOTE_COLORS.G} />}
        </svg>
        <span className="text-xs">{label}</span>
      </button>
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <Toaster richColors />

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 flex-wrap">
            {/* Note duration tools */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <ToolButton tool="whole" label="Whole" noteType="whole" />
              <ToolButton tool="half" label="Half" noteType="half" />
              <ToolButton tool="quarter" label="Quarter" noteType="quarter" />
              <ToolButton
                tool="dotted-quarter"
                label="Dotted"
                noteType="dotted-quarter"
              />
              <ToolButton tool="eighth" label="Eighth" noteType="eighth" />
            </div>

            <div className="w-px h-8 bg-gray-300" />

            {/* Repeat tool */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() =>
                  setSelectedTool(selectedTool === "repeat" ? null : "repeat")
                }
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
                    onClick={() =>
                      setSelectedTool(
                        selectedTool === "delete" ? null : "delete",
                      )
                    }
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

            <label className="flex items-center gap-2">
              <span className="text-gray-600">Time:</span>
              <select
                value={timeSignature}
                onChange={(e) =>
                  setTimeSignature(e.target.value as TimeSignature)
                }
                className="px-2 py-1 rounded border border-gray-300 text-gray-800 font-medium bg-white"
              >
                <option value="4/4">4/4</option>
                <option value="3/4">3/4</option>
                <option value="6/8">6/8</option>
                <option value="2/4">2/4</option>
              </select>
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

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="text-gray-600">Grid</span>
            </label>

            <div className="w-px h-5 bg-gray-300" />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowChords}
                onChange={(e) => setAllowChords(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span className="text-gray-600">Chords</span>
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
              showGrid={showGrid}
              allowChords={allowChords}
              playheadX={playheadX}
              playheadSystem={playheadSystem}
              activeNoteId={activeNoteId}
              systemCount={systemCount}
              onSystemCountChange={setSystemCount}
              onDuplicateNote={handleDuplicateNote}
              svgRef={svgRef}
              timeSignature={timeSignature}
              onStaffClick={handleSeek}
              tempo={tempo}
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

        {/* Music Rules Sidebar */}
        <MusicRulesSidebar
          isOpen={showRulesSidebar}
          onToggle={() => setShowRulesSidebar(!showRulesSidebar)}
        />

        {/* Song Library Sidebar */}
        <SongLibrarySidebar
          isOpen={showSongLibrary}
          onToggle={() => setShowSongLibrary(!showSongLibrary)}
          savedSongs={savedSongs}
          onSaveSong={handleSaveSong}
          onLoadSong={handleLoadSong}
          onDeleteSong={handleDeleteSong}
          onRestoreDefaults={handleRestoreDefaults}
          onExport={handleExportSongs}
        />

        {/* Piano Drawer */}
        <PianoDrawer
          isOpen={showPiano}
          onToggle={() => setShowPiano(!showPiano)}
          activeNoteId={activeNoteId}
          activePitch={activePitch}
          activeNoteDuration={activeNoteDuration}
          activeNoteStartTime={activeNoteStartTime}
          tempo={tempo}
          useColors={pianoUseColors}
          onToggleColors={() => setPianoUseColors(!pianoUseColors)}
          showBlackKeys={pianoShowBlackKeys}
          onToggleBlackKeys={() => setPianoShowBlackKeys(!pianoShowBlackKeys)}
        />
      </div>
    </TooltipProvider>
  );
}
