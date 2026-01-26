"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useLocalStorage, useDocumentTitle } from "usehooks-ts";
import { toast, Toaster } from "sonner";
import { NoteEditor, NoteTool, TimeSignature } from "@/components/NoteEditor";
import { PianoDrawer } from "@/components/PianoDrawer";
import { EditorHeader } from "@/components/EditorHeader";
import { ToolPalette } from "@/components/ToolPalette";
import { SettingsModal } from "@/components/SettingsModal";
import { SongLibraryModal } from "@/components/SongLibraryModal";
import { HelpModal } from "@/components/HelpModal";
import { LyricsModal } from "@/components/LyricsModal";
import { FirstVisitTour } from "@/components/FirstVisitTour";
import {
  SavedSong,
  SavedSongsMap,
  Composition,
  LegacyComposition,
  EditorNote,
  RepeatMarker,
  TimeSignatureChange,
} from "@/lib/types";
import { getDefaultSongs } from "@/lib/defaultSongs";
import {
  migrateSavedSong,
  migrateAllSongs,
  isLegacyComposition,
} from "@/lib/migration";
import {
  useResponsiveLayout,
  getInitialMeasuresPerRow,
} from "@/hooks/useResponsiveLayout";
import { usePlayback } from "@/hooks/usePlayback";
import { useIsMobile } from "@/hooks/useIsMobile";
import { MobileBanner } from "@/components/MobileBanner";
import { Footer } from "@/components/Footer";
import {
  toLegacyNotes,
  fromLegacyNotes,
  toLegacyRepeatMarkers,
  fromLegacyRepeatMarkers,
} from "@/lib/coordinateAdapter";
import { InstrumentType, setInstrument } from "@/lib/audio/TonePlayer";

// Types for localStorage persistence
// Supports both legacy (system-based) and new (absoluteBeat) formats during migration
type EditorComposition = Composition | LegacyComposition;

interface EditorSettings {
  selectedTool: NoteTool | null;
  showLabels: boolean;
  showKidFaces: boolean;
  showGrid: boolean;
  allowChords: boolean;
  allowMove: boolean;
  tempo: number;
  timeSignature: TimeSignature;
  instrument: InstrumentType;
  pianoUseColors: boolean;
  pianoShowBlackKeys: boolean;
  staffLines: number; // 2-5, default 3 - number of horizontal lines per staff
  noteSpacing: number; // 1.0-2.0 (100%-200%) - controls beat width multiplier
}

interface EditorUI {
  showPiano: boolean;
  showSongLibrary: boolean;
  showSettings: boolean;
  showHelp: boolean;
  showLyricsModal: boolean;
}

const DEFAULT_COMPOSITION: Composition = {
  notes: [],
  repeatMarkers: [],
  lyrics: [],
};

const DEFAULT_SETTINGS: EditorSettings = {
  selectedTool: null, // No tool selected by default
  showLabels: true,
  showKidFaces: false,
  showGrid: false,
  allowChords: false,
  allowMove: false,
  tempo: 100,
  timeSignature: { numerator: 4, denominator: 4 },
  instrument: "piano",
  pianoUseColors: true,
  pianoShowBlackKeys: false,
  staffLines: 3, // Default: 3 horizontal lines per staff
  noteSpacing: 1.0, // Default: 100% (compact) - range 1.0-2.0
};

const DEFAULT_UI: EditorUI = {
  showPiano: false,
  showSongLibrary: false,
  showSettings: false,
  showHelp: false,
  showLyricsModal: false,
};

// Options to prevent SSR hydration mismatch - load from localStorage after mount
const SSR_SAFE = { initializeWithValue: false };

export default function Home() {
  // Persistent state (SSR safe to prevent hydration mismatch)
  const [composition, setComposition] = useLocalStorage<EditorComposition>(
    "rochel-editor-composition",
    DEFAULT_COMPOSITION,
    SSR_SAFE,
  );
  const [settings, setSettings] = useLocalStorage<EditorSettings>(
    "rochel-editor-settings",
    DEFAULT_SETTINGS,
    SSR_SAFE,
  );
  const [ui, setUI] = useLocalStorage<EditorUI>(
    "rochel-editor-ui",
    DEFAULT_UI,
    SSR_SAFE,
  );
  const [savedSongs, setSavedSongs] = useLocalStorage<SavedSongsMap>(
    "rochel-saved-songs",
    getDefaultSongs(),
    SSR_SAFE,
  );
  const [currentSongId, setCurrentSongId] = useLocalStorage<string | null>(
    "rochel-current-song-id",
    "default-dayenu",
    SSR_SAFE,
  );

  // Get time signature changes for current song (stored per-song, not in editor settings)
  const timeSignatureChanges: TimeSignatureChange[] =
    currentSongId && savedSongs[currentSongId]?.settings?.timeSignatureChanges
      ? savedSongs[currentSongId].settings.timeSignatureChanges
      : [];

  // Handler to update time signature changes for current song
  const handleTimeSignatureChangesChange = useCallback(
    (changes: TimeSignatureChange[]) => {
      if (!currentSongId || !savedSongs[currentSongId]) return;
      setSavedSongs({
        ...savedSongs,
        [currentSongId]: {
          ...savedSongs[currentSongId],
          settings: {
            ...savedSongs[currentSongId].settings,
            timeSignatureChanges: changes,
          },
          updatedAt: Date.now(),
        },
      });
    },
    [currentSongId, savedSongs, setSavedSongs],
  );

  const [measuresPerRow, setMeasuresPerRow] = useLocalStorage<number>(
    "rochel-measures-per-row",
    4, // Default: 4 measures per row (overridden by viewport on first load)
    SSR_SAFE,
  );
  const [totalMeasures, setTotalMeasures] = useLocalStorage<number>(
    "rochel-total-measures",
    4, // Default: 4 measures
    SSR_SAFE,
  );
  const [hasInitializedLayout, setHasInitializedLayout] =
    useLocalStorage<boolean>("rochel-layout-initialized", false, SSR_SAFE);

  // Set viewport-based default for measuresPerRow on first visit only
  useEffect(() => {
    if (!hasInitializedLayout && typeof window !== "undefined") {
      const beatsPerMeasure = settings.timeSignature.numerator;
      const optimalMeasures = getInitialMeasuresPerRow(
        window.innerWidth,
        beatsPerMeasure,
      );
      setMeasuresPerRow(optimalMeasures);
      setHasInitializedLayout(true);
    }
  }, [
    hasInitializedLayout,
    settings.timeSignature.numerator,
    setMeasuresPerRow,
    setHasInitializedLayout,
  ]);

  // Sync instrument setting with TonePlayer on mount
  useEffect(() => {
    if (settings.instrument) {
      setInstrument(settings.instrument);
    }
  }, [settings.instrument]);

  // SVG ref for export functionality
  const svgRef = useRef<SVGSVGElement>(null);

  // Ref for responsive layout
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Container size state for playback scroll-follow
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Track container size for auto-scroll during playback
  // Uses requestAnimationFrame to defer updates and avoid hydration mismatch
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const updateSize = () => {
      // Cancel pending update to avoid batching issues
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      // Defer state update to next frame (ensures hydration completes first)
      rafId = requestAnimationFrame(() => {
        setContainerSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      observer.disconnect();
    };
  }, []);

  // Mobile detection for read-only mode
  const isMobile = useIsMobile();

  // Calculate total beats for layout based on user-defined totalMeasures
  const beatsPerMeasure = settings.timeSignature.numerator;
  const systemCount = Math.ceil(totalMeasures / measuresPerRow);
  const totalBeats = totalMeasures * beatsPerMeasure;

  // Get responsive layout configuration
  const layout = useResponsiveLayout(editorContainerRef, {
    timeSignature: settings.timeSignature,
    totalBeats,
    userMeasuresPerRow: measuresPerRow,
  });

  // Scroll handler for playback follow (smooth scroll with both axes)
  const handleScrollTo = useCallback(
    (scrollLeft: number, scrollTop: number) => {
      if (editorContainerRef.current) {
        editorContainerRef.current.scrollTo({
          left: scrollLeft,
          top: scrollTop,
          behavior: "smooth",
        });
      }
    },
    [],
  );

  // Playback hook
  const playback = usePlayback({
    composition: composition as Composition,
    tempo: settings.tempo,
    timeSignature: settings.timeSignature,
    timeSignatureChanges,
    measuresPerRow,
    totalMeasures,
    containerWidth: containerSize.width,
    containerHeight: containerSize.height,
    onScrollTo: handleScrollTo,
    noteSpacing: settings.noteSpacing ?? 1.0,
  });

  // Undo/Redo state
  const [history, setHistory] = useState<EditorComposition[]>([composition]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Current song title
  const currentSongTitle =
    currentSongId && savedSongs[currentSongId]
      ? savedSongs[currentSongId].name
      : "Untitled Song";

  // Update document title dynamically with current song name
  useDocumentTitle(
    currentSongTitle !== "Untitled Song"
      ? `${currentSongTitle} | Rochel's Piano School`
      : "Rochel's Piano School - The Batya Method",
  );

  // Update composition helper with history tracking
  const updateComposition = useCallback(
    (updates: Partial<EditorComposition>) => {
      const newComposition = {
        ...composition,
        ...updates,
      } as EditorComposition;
      setComposition(newComposition);

      // Add to history for undo/redo
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newComposition);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [composition, history, historyIndex, setComposition],
  );

  // Undo/Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setComposition(history[newIndex]);
    }
  }, [historyIndex, history, setComposition]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setComposition(history[newIndex]);
    }
  }, [historyIndex, history, setComposition]);

  // Auto-migrate saved songs on mount (runs once)
  useEffect(() => {
    let needsMigration = false;

    // Check if any songs need migration
    for (const song of Object.values(savedSongs)) {
      if (isLegacyComposition(song.composition)) {
        needsMigration = true;
        break;
      }
    }

    // Perform migration if needed
    if (needsMigration) {
      console.log("Migrating saved songs to new format...");
      const migratedSongs = migrateAllSongs(savedSongs);
      setSavedSongs(migratedSongs);
      toast.success("Songs updated to new format");
    }

    // Also migrate current composition if needed
    if (isLegacyComposition(composition)) {
      console.log("Migrating current composition to new format...");
      const migratedComp = migrateSavedSong({
        id: "temp",
        name: "temp",
        composition,
        settings: settings,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }).composition;
      setComposition(migratedComp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Keyboard shortcuts for undo/redo and bulk lyrics editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === "Z" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        // Cmd+L opens bulk lyrics editor modal
        e.preventDefault();
        setUI((prev) => ({ ...prev, showLyricsModal: true }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, setUI]);

  // Save current composition as song
  const handleSaveSong = useCallback(
    (name: string) => {
      const songId = currentSongId || `song_${Date.now()}`;

      // Ensure composition is migrated before saving
      const migratedComp = isLegacyComposition(composition)
        ? migrateSavedSong({
            id: songId,
            name,
            composition,
            settings,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }).composition
        : composition;
      const migratedComposition = migratedComp as Composition;

      const song: SavedSong = {
        id: songId,
        name,
        composition: migratedComposition,
        settings: {
          tempo: settings.tempo,
          timeSignature: settings.timeSignature,
          // Preserve existing time signature changes from the current song
          timeSignatureChanges:
            savedSongs[songId]?.settings?.timeSignatureChanges,
        },
        createdAt: savedSongs[songId]?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      setSavedSongs({ ...savedSongs, [songId]: song });
      setCurrentSongId(songId);
      toast.success(`Saved "${name}"`);
    },
    [
      currentSongId,
      composition,
      settings,
      savedSongs,
      setSavedSongs,
      setCurrentSongId,
    ],
  );

  // Load song handler (with automatic migration)
  // showToast: false on initial page load, true when user manually selects a song
  const handleLoadSong = useCallback(
    (song: SavedSong, showToast = true, preserveTempo = false) => {
      // Stop any currently playing song before switching
      playback.handleStop();

      // Migrate if needed
      const migratedSong = migrateSavedSong(song);

      setComposition(migratedSong.composition);
      setSettings({
        ...settings,
        // Preserve user's tempo on initial page load, use song's tempo on explicit load
        tempo: preserveTempo ? settings.tempo : migratedSong.settings.tempo,
        timeSignature: migratedSong.settings.timeSignature,
      });
      setCurrentSongId(migratedSong.id);
      setUI({ ...ui, showSongLibrary: false });
      if (showToast) {
        toast.success(`Loaded "${migratedSong.name}"`);
      }

      // Calculate and set totalMeasures based on song content
      const notes = migratedSong.composition.notes as EditorNote[];
      const songBeatsPerMeasure = migratedSong.settings.timeSignature.numerator;
      if (notes.length > 0) {
        const maxBeat = Math.max(
          ...notes.map((n) => n.absoluteBeat + n.duration),
        );
        const requiredMeasures = Math.ceil(maxBeat / songBeatsPerMeasure);
        setTotalMeasures(Math.max(requiredMeasures, 4)); // Minimum 4 measures
      } else {
        setTotalMeasures(4); // Default for empty songs
      }

      // Save migrated version if it was updated
      if (migratedSong.updatedAt !== song.updatedAt) {
        setSavedSongs({ ...savedSongs, [migratedSong.id]: migratedSong });
      }
    },
    [
      settings,
      ui,
      savedSongs,
      setComposition,
      setSettings,
      setCurrentSongId,
      setUI,
      setSavedSongs,
      setTotalMeasures,
      playback.handleStop,
    ],
  );

  // Auto-load default song on first visit (when composition is truly empty)
  // Check localStorage directly to avoid stale closure issues with SSR_SAFE
  useEffect(() => {
    const timer = setTimeout(() => {
      // Read directly from localStorage to get hydrated values
      const storedComposition = localStorage.getItem(
        "rochel-editor-composition",
      );
      const storedSettings = localStorage.getItem("rochel-editor-settings");
      const storedSongId = localStorage.getItem("rochel-current-song-id");
      const storedSongs = localStorage.getItem("rochel-saved-songs");

      const parsedComp = storedComposition
        ? JSON.parse(storedComposition)
        : null;
      const parsedSettings = storedSettings ? JSON.parse(storedSettings) : null;
      const parsedSongId = storedSongId ? JSON.parse(storedSongId) : null;
      const parsedSongs = storedSongs ? JSON.parse(storedSongs) : null;

      const isEmptyComposition =
        !parsedComp ||
        (parsedComp.notes?.length === 0 &&
          parsedComp.repeatMarkers?.length === 0);

      if (isEmptyComposition && parsedSongId && parsedSongs?.[parsedSongId]) {
        const song = parsedSongs[parsedSongId];
        // Load song but preserve user's tempo from localStorage
        const userTempo = parsedSettings?.tempo ?? DEFAULT_SETTINGS.tempo;
        setComposition(song.composition);
        setSettings((prev) => ({
          ...prev,
          tempo: userTempo, // Use localStorage tempo, not song tempo
          timeSignature: song.settings.timeSignature,
        }));
        setCurrentSongId(song.id);
      }
    }, 50); // Small delay for localStorage hydration
    return () => clearTimeout(timer);
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Delete song handler
  const handleDeleteSong = useCallback(
    (songId: string) => {
      const newSongs = { ...savedSongs };
      delete newSongs[songId];
      setSavedSongs(newSongs);
      if (currentSongId === songId) {
        setCurrentSongId(null);
      }
      toast.success("Song deleted");
    },
    [savedSongs, currentSongId, setSavedSongs, setCurrentSongId],
  );

  // Restore defaults handler
  const handleRestoreDefaults = useCallback(() => {
    setSavedSongs(getDefaultSongs());
    toast.success("Default songs restored");
  }, [setSavedSongs]);

  // Export handler
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(savedSongs, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rochel-songs.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Songs exported");
  }, [savedSongs]);

  // Export selected songs handler
  const handleExportSelected = useCallback(
    (songIds: string[]) => {
      const selectedSongs = songIds.reduce(
        (acc, id) => {
          if (savedSongs[id]) {
            acc[id] = savedSongs[id];
          }
          return acc;
        },
        {} as typeof savedSongs,
      );
      const dataStr = JSON.stringify(selectedSongs, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        songIds.length === 1
          ? `${savedSongs[songIds[0]]?.name || "song"}.json`
          : `rochel-songs-${songIds.length}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(
        `${songIds.length} song${songIds.length > 1 ? "s" : ""} exported`,
      );
    },
    [savedSongs],
  );

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
      toast.success("Exported as PNG");
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
    toast.success("Exported as SVG");
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Toaster position="top-center" />

      {/* Header */}
      <EditorHeader
        currentSongTitle={currentSongTitle}
        onSongTitleClick={() => setUI({ ...ui, showSongLibrary: true })}
        tempo={settings.tempo}
        onTempoChange={(tempo) => setSettings({ ...settings, tempo })}
        songTempo={
          currentSongId ? savedSongs[currentSongId]?.settings.tempo : undefined
        }
        timeSignature={settings.timeSignature}
        measuresPerRow={measuresPerRow}
        onMeasuresPerRowChange={setMeasuresPerRow}
        totalMeasures={totalMeasures}
        onTotalMeasuresChange={(newTotal) => {
          setTotalMeasures(newTotal);
          // Clamp measuresPerRow if it exceeds new total
          if (measuresPerRow > newTotal) {
            setMeasuresPerRow(newTotal);
          }
        }}
        onSettings={() => setUI({ ...ui, showSettings: true })}
        onHelp={() => setUI({ ...ui, showHelp: true })}
        onPlay={playback.handlePlay}
        onPause={playback.handlePause}
        onStop={playback.handleStop}
        isPlaying={playback.isPlaying}
        isPaused={playback.isPaused}
        hasNotes={composition.notes.length > 0}
        showPiano={ui.showPiano}
        onTogglePiano={() => setUI({ ...ui, showPiano: !ui.showPiano })}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDownloadPNG={handleSavePNG}
        onDownloadSVG={handleSaveSVG}
        isMobile={isMobile}
        savedSongs={savedSongs}
        currentSongId={currentSongId}
        onQuickLoadSong={handleLoadSong}
      />

      {/* Main content area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Canvas area */}
        <div ref={editorContainerRef} className="flex-1 overflow-auto">
          <div className="py-4">
            <div className="mx-auto w-fit">
              <NoteEditor
                notes={toLegacyNotes(composition.notes as EditorNote[], layout)}
                onNotesChange={(legacyNotes) => {
                  const newNotes = fromLegacyNotes(legacyNotes, layout);
                  updateComposition({ notes: newNotes });
                }}
                repeatMarkers={toLegacyRepeatMarkers(
                  composition.repeatMarkers as RepeatMarker[],
                  layout,
                )}
                onRepeatMarkersChange={(legacyMarkers) => {
                  const newMarkers = fromLegacyRepeatMarkers(
                    legacyMarkers,
                    layout,
                  );
                  updateComposition({ repeatMarkers: newMarkers });
                }}
                lyrics={(composition as Composition).lyrics || []}
                onLyricsChange={(newLyrics) => {
                  updateComposition({ lyrics: newLyrics });
                }}
                selectedTool={settings.selectedTool}
                showLabels={settings.showLabels}
                showKidFaces={settings.showKidFaces}
                showGrid={settings.showGrid}
                allowChords={settings.allowChords}
                allowMove={settings.allowMove}
                timeSignature={settings.timeSignature}
                measuresPerRow={measuresPerRow}
                systemCount={systemCount}
                totalMeasures={totalMeasures}
                onSystemCountChange={(count) => {
                  // System count is now calculated dynamically from layout
                  // This callback is kept for compatibility but does nothing
                  console.log(
                    "System count is now dynamic based on layout:",
                    count,
                  );
                }}
                tempo={settings.tempo}
                isPlaying={playback.isPlaying}
                playheadX={playback.playheadX}
                playheadSystem={playback.playheadSystem}
                activeNoteId={playback.activeNoteId}
                svgRef={svgRef}
                readOnly={isMobile}
                staffLines={settings.staffLines ?? 3}
                noteSpacing={settings.noteSpacing ?? 1.0}
                timeSignatureChanges={timeSignatureChanges}
                onTimeSignatureChangesChange={handleTimeSignatureChangesChange}
                onTimeSignatureClick={() =>
                  setUI({ ...ui, showSettings: true })
                }
              />
            </div>
          </div>
        </div>

        {/* Tool Palette - hidden on mobile (read-only mode) */}
        {!isMobile && (
          <ToolPalette
            selectedTool={settings.selectedTool}
            onToolSelect={(tool) => {
              // All tools (including lyrics) are now toggleable
              setSettings({ ...settings, selectedTool: tool });
            }}
            allowMove={settings.allowMove}
            onAllowMoveChange={(allow) =>
              setSettings({ ...settings, allowMove: allow })
            }
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
        )}
      </div>

      {/* Piano drawer */}
      {ui.showPiano && (
        <PianoDrawer
          activePitch={playback.activePitch}
          activeNoteDuration={playback.activeNoteDuration}
          activeNoteStartTime={playback.activeNoteStartTime}
          tempo={settings.tempo}
          useColors={settings.pianoUseColors}
          onToggleColors={() =>
            setSettings({
              ...settings,
              pianoUseColors: !settings.pianoUseColors,
            })
          }
          showBlackKeys={settings.pianoShowBlackKeys}
          onToggleBlackKeys={() =>
            setSettings({
              ...settings,
              pianoShowBlackKeys: !settings.pianoShowBlackKeys,
            })
          }
        />
      )}

      {/* Modals */}
      <SongLibraryModal
        isOpen={ui.showSongLibrary}
        onClose={() => setUI({ ...ui, showSongLibrary: false })}
        savedSongs={savedSongs}
        currentSongId={currentSongId}
        onLoadSong={handleLoadSong}
        onDeleteSong={handleDeleteSong}
        onSaveSong={handleSaveSong}
        onUpdateCurrentSong={() => {
          if (currentSongId && savedSongs[currentSongId]) {
            handleSaveSong(savedSongs[currentSongId].name);
          }
        }}
        onRestoreDefaults={handleRestoreDefaults}
        onExport={handleExport}
        onExportSelected={handleExportSelected}
      />

      <SettingsModal
        isOpen={ui.showSettings}
        onClose={() => setUI({ ...ui, showSettings: false })}
        tempo={settings.tempo}
        onTempoChange={(tempo) => setSettings({ ...settings, tempo })}
        timeSignature={settings.timeSignature}
        onTimeSignatureChange={(ts) =>
          setSettings({ ...settings, timeSignature: ts })
        }
        instrument={settings.instrument}
        onInstrumentChange={(instrument) => {
          setSettings({ ...settings, instrument });
          setInstrument(instrument);
        }}
        showLabels={settings.showLabels}
        onShowLabelsChange={(show) =>
          setSettings({ ...settings, showLabels: show })
        }
        showKidFaces={settings.showKidFaces}
        onShowKidFacesChange={(show) =>
          setSettings({ ...settings, showKidFaces: show })
        }
        showGrid={settings.showGrid}
        onShowGridChange={(show) =>
          setSettings({ ...settings, showGrid: show })
        }
        allowChords={settings.allowChords}
        onAllowChordsChange={(allow) =>
          setSettings({ ...settings, allowChords: allow })
        }
        staffLines={settings.staffLines ?? 3}
        onStaffLinesChange={(count) =>
          setSettings({ ...settings, staffLines: count })
        }
        noteSpacing={settings.noteSpacing ?? 1.0}
        onNoteSpacingChange={(spacing) =>
          setSettings({ ...settings, noteSpacing: spacing })
        }
      />

      <HelpModal
        isOpen={ui.showHelp}
        onClose={() => setUI({ ...ui, showHelp: false })}
      />

      <LyricsModal
        isOpen={ui.showLyricsModal}
        onClose={() => setUI({ ...ui, showLyricsModal: false })}
        lyrics={(composition as Composition).lyrics || []}
        onLyricsChange={(newLyrics) => {
          updateComposition({ lyrics: newLyrics });
        }}
        totalMeasures={totalMeasures}
        beatsPerMeasure={beatsPerMeasure}
        notes={composition.notes as EditorNote[]}
      />

      {/* First visit tour */}
      <FirstVisitTour />

      {/* Mobile banner - suggests using desktop for editing */}
      {isMobile && <MobileBanner />}

      {/* Footer - fixed at bottom */}
      <Footer />
    </div>
  );
}
