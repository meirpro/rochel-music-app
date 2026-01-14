"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { toast, Toaster } from "sonner";
import {
  NoteEditor,
  NoteTool,
  TimeSignature,
  LEFT_MARGIN,
  BEAT_WIDTH,
  getLayoutConfig,
  getBeatFromX,
} from "@/components/NoteEditor";
import { PianoDrawer } from "@/components/PianoDrawer";
import { EditorHeader } from "@/components/EditorHeader";
import { ToolPalette } from "@/components/ToolPalette";
import { SettingsModal } from "@/components/SettingsModal";
import { SongLibraryModal } from "@/components/SongLibraryModal";
import { HelpModal } from "@/components/HelpModal";
import { LyricsModal } from "@/components/LyricsModal";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { MIDI_NOTES } from "@/lib/constants";
import {
  Pitch,
  SavedSong,
  SavedSongsMap,
  Composition,
  LegacyComposition,
  EditorNote,
  RepeatMarker,
  LyricSyllable,
} from "@/lib/types";
import { getDefaultSongs } from "@/lib/defaultSongs";
import {
  migrateSavedSong,
  migrateAllSongs,
  isLegacyComposition,
  getAbsoluteBeat,
  calculateSystemCount,
  getAbsoluteMeasureNumber,
  getBeatsPerSystem,
} from "@/lib/migration";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { usePlayback } from "@/hooks/usePlayback";
import {
  toLegacyNotes,
  fromLegacyNotes,
  toLegacyRepeatMarkers,
  fromLegacyRepeatMarkers,
  calculateLegacySystemCount,
} from "@/lib/coordinateAdapter";

// Types for localStorage persistence
// Supports both legacy (system-based) and new (absoluteBeat) formats during migration
type EditorComposition = Composition | LegacyComposition;

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
  selectedTool: "quarter",
  showLabels: true,
  showKidFaces: false,
  showGrid: false,
  allowChords: false,
  tempo: 100,
  timeSignature: { numerator: 4, denominator: 4 },
  pianoUseColors: true,
  pianoShowBlackKeys: false,
};

const DEFAULT_UI: EditorUI = {
  showPiano: false,
  showSongLibrary: false,
  showSettings: false,
  showHelp: false,
  showLyricsModal: false,
};

export default function EditorPage() {
  // Persistent state
  const [composition, setComposition] = useLocalStorage<EditorComposition>(
    "rochel-editor-composition",
    DEFAULT_COMPOSITION,
  );
  const [settings, setSettings] = useLocalStorage<EditorSettings>(
    "rochel-editor-settings",
    DEFAULT_SETTINGS,
  );
  const [ui, setUI] = useLocalStorage<EditorUI>("rochel-editor-ui", DEFAULT_UI);
  const [savedSongs, setSavedSongs] = useLocalStorage<SavedSongsMap>(
    "rochel-saved-songs",
    getDefaultSongs(),
  );
  const [currentSongId, setCurrentSongId] = useLocalStorage<string | null>(
    "rochel-current-song-id",
    null,
  );
  const [measuresPerRow, setMeasuresPerRow] = useLocalStorage<number>(
    "rochel-measures-per-row",
    2, // Default: 2 measures per row
  );
  const [totalMeasures, setTotalMeasures] = useLocalStorage<number>(
    "rochel-total-measures",
    4, // Default: 4 measures
  );

  // SVG ref for export functionality
  const svgRef = useRef<SVGSVGElement>(null);

  // Ref for responsive layout
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Calculate total beats for layout based on user-defined totalMeasures
  const beatsPerMeasure = settings.timeSignature.numerator;
  const beatsPerSystem = measuresPerRow * beatsPerMeasure;
  const systemCount = Math.ceil(totalMeasures / measuresPerRow);
  const totalBeats = totalMeasures * beatsPerMeasure;

  // Get responsive layout configuration
  const layout = useResponsiveLayout(editorContainerRef, {
    timeSignature: settings.timeSignature,
    totalBeats,
    userMeasuresPerRow: measuresPerRow,
  });

  // Scroll handler for playback follow
  const handleScrollTo = useCallback((scrollLeft: number) => {
    if (editorContainerRef.current) {
      editorContainerRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  // Playback hook
  const playback = usePlayback({
    composition: composition as Composition,
    tempo: settings.tempo,
    timeSignature: settings.timeSignature,
    measuresPerRow,
    totalMeasures,
    onScrollTo: handleScrollTo,
  });

  // Undo/Redo state
  const [history, setHistory] = useState<EditorComposition[]>([composition]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Current song title
  const currentSongTitle =
    currentSongId && savedSongs[currentSongId]
      ? savedSongs[currentSongId].name
      : "Untitled Song";

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

  // Keyboard shortcuts for undo/redo
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Playback handlers are now in the usePlayback hook

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
  const handleLoadSong = useCallback(
    (song: SavedSong) => {
      // Migrate if needed
      const migratedSong = migrateSavedSong(song);

      setComposition(migratedSong.composition);
      setSettings({
        ...settings,
        tempo: migratedSong.settings.tempo,
        timeSignature: migratedSong.settings.timeSignature,
      });
      setCurrentSongId(migratedSong.id);
      setUI({ ...ui, showSongLibrary: false });
      toast.success(`Loaded "${migratedSong.name}"`);

      // Calculate and set totalMeasures based on song content
      const notes = migratedSong.composition.notes as EditorNote[];
      if (notes.length > 0) {
        const maxBeat = Math.max(
          ...notes.map((n) => n.absoluteBeat + n.duration),
        );
        const songBeatsPerMeasure =
          migratedSong.settings.timeSignature.numerator;
        const requiredMeasures = Math.ceil(maxBeat / songBeatsPerMeasure);
        setTotalMeasures(Math.max(requiredMeasures, 4)); // Minimum 4 measures
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
    ],
  );

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
        onSave={() => setUI({ ...ui, showSongLibrary: true })}
        onSettings={() => setUI({ ...ui, showSettings: true })}
        onHelp={() => setUI({ ...ui, showHelp: true })}
        onPlay={playback.handlePlay}
        isPlaying={playback.isPlaying}
        hasNotes={composition.notes.length > 0}
        showPiano={ui.showPiano}
        onTogglePiano={() => setUI({ ...ui, showPiano: !ui.showPiano })}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDownloadPNG={handleSavePNG}
        onDownloadSVG={handleSaveSVG}
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
                timeSignature={settings.timeSignature}
                measuresPerRow={measuresPerRow}
                systemCount={systemCount}
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
              />
            </div>
          </div>
        </div>

        {/* Tool Palette */}
        <ToolPalette
          selectedTool={settings.selectedTool}
          onToolSelect={(tool) => {
            if (tool === "lyrics") {
              // Open the lyrics modal instead of selecting the tool
              setUI({ ...ui, showLyricsModal: true });
            } else {
              setSettings({ ...settings, selectedTool: tool });
            }
          }}
        />
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
    </div>
  );
}
