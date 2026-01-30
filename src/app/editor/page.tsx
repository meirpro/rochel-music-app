/**
 * Editor Page with Progressive Tutorial
 *
 * A standalone editor page using NoteEditorRefactored with a progressive
 * tutorial system that gradually reveals UI elements as users learn.
 * Now with full feature parity with the home page.
 */

"use client";

import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

// Components
import { NoteEditorRefactored } from "@/components/NoteEditorRefactored";
import {
  EditorNote as RefactoredEditorNote,
  RepeatMarker as RefactoredRepeatMarker,
} from "@/components/NoteEditorRefactored/types";
import { LyricSyllable, SavedSong } from "@/lib/types";
import { ToolPalette } from "@/components/ToolPalette";
import { Footer } from "@/components/Footer";
import { PianoDrawer } from "@/components/PianoDrawer";
import { EditorHeader } from "@/components/EditorHeader";
import { SongLibraryModal } from "@/components/SongLibraryModal";
import { SettingsModal } from "@/components/SettingsModal";
import { HelpModal } from "@/components/HelpModal";
import { LyricsModal } from "@/components/LyricsModal";
import { MobileBanner } from "@/components/MobileBanner";
import { InstrumentType } from "@/lib/audio/TonePlayer";

// Hooks
import { useProgressiveTutorial } from "./hooks/useProgressiveTutorial";
import { useEditorState } from "./hooks/useEditorState";
import { usePlayback } from "@/hooks/usePlayback";

// Tutorial components
import { TutorialOverlay } from "./components/TutorialOverlay";
import { TutorialProgress } from "./components/TutorialProgress";

// Types
import { EditorNote as PlaybackEditorNote, RepeatMarker } from "@/lib/types";

// Notes and repeat markers from useEditorState now use absoluteBeat/measureNumber format
// No conversion needed - they're already compatible with playback format

/**
 * Simple header for when full header is hidden
 */
function SimpleHeader({
  title,
  onRestartTutorial,
}: {
  title: string;
  onRestartTutorial?: () => void;
}) {
  return (
    <header className="h-12 bg-gradient-to-r from-purple-200 via-blue-200 to-teal-200 border-b-2 border-purple-300 flex items-center justify-between px-4 shadow-sm">
      <div className="w-24" /> {/* Spacer for centering */}
      <h1 className="text-purple-700 font-semibold text-lg">{title}</h1>
      <div className="w-24 flex justify-end">
        {onRestartTutorial && (
          <button
            onClick={onRestartTutorial}
            className="text-xs text-purple-500 hover:text-purple-700 hover:underline transition-colors"
          >
            Restart Tutorial
          </button>
        )}
      </div>
    </header>
  );
}

/**
 * Play button component for stages where it's visible
 * Includes spacebar handler - only active when this component is mounted
 */
function PlayControls({
  onTogglePlayPause,
  onStop,
  isPlaying,
  isPaused,
  hasNotes,
}: {
  onTogglePlayPause: () => void;
  onStop: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  hasNotes: boolean;
}) {
  // Spacebar handler - only active when PlayControls is mounted
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;

      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      e.preventDefault();
      onTogglePlayPause();
    };

    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [onTogglePlayPause]);

  return (
    <div className="flex items-center justify-center gap-2 py-2 bg-purple-50 border-b border-purple-200">
      {/* Play/Pause button */}
      <button
        onClick={onTogglePlayPause}
        disabled={!hasNotes}
        className={`px-6 py-2 rounded-xl font-semibold text-base shadow-md transition-all flex items-center gap-2 ${
          hasNotes
            ? isPlaying
              ? "bg-orange-200 hover:bg-orange-300 text-orange-700"
              : "bg-teal-200 hover:bg-teal-300 text-teal-700"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isPlaying ? (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
            <span>Pause</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>{isPaused ? "Resume" : "Play"}</span>
          </>
        )}
      </button>

      {/* Stop button - only show when playing or paused */}
      {(isPlaying || isPaused) && (
        <button
          onClick={onStop}
          className="px-4 py-2 rounded-xl font-semibold text-base shadow-md transition-all bg-red-200 hover:bg-red-300 text-red-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
          <span>Stop</span>
        </button>
      )}
    </div>
  );
}

/**
 * Main Editor Page Component
 */
export default function EditorPage() {
  // Tutorial state
  const tutorial = useProgressiveTutorial();
  const visibility = tutorial.getVisibility();

  // Editor state with tutorial constraints
  const editor = useEditorState({
    maxMeasures: visibility.maxMeasures,
  });

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [showSongLibrary, setShowSongLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [showRestartTutorialConfirm, setShowRestartTutorialConfirm] =
    useState(false);
  const [showNewSongConfirm, setShowNewSongConfirm] = useState(false);

  // Instrument state (separate from settings for modal compatibility)
  const [instrument, setInstrument] = useState<InstrumentType>("piano");

  // Keyboard shortcuts for undo/redo and lyrics modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Cmd/Ctrl+Z for undo, Cmd/Ctrl+Shift+Z for redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          editor.handleRedo();
        } else {
          editor.handleUndo();
        }
        return;
      }

      // Cmd/Ctrl+L for lyrics modal
      if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        e.preventDefault();
        setShowLyricsModal(true);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  // Notes already use absoluteBeat format - cast to PlaybackEditorNote for type compatibility
  const playbackNotes = editor.notes as PlaybackEditorNote[];

  // Repeat markers already use measureNumber format
  const absoluteRepeatMarkers = editor.repeatMarkers;

  // Playback hook
  // disableSpacebarControl: true because this page handles spacebar conditionally
  // (only when play button is visible in tutorial)
  const playback = usePlayback({
    composition: {
      notes: playbackNotes,
      repeatMarkers: absoluteRepeatMarkers,
    },
    tempo: editor.settings.tempo,
    timeSignature: editor.settings.timeSignature,
    measuresPerRow: editor.settings.measuresPerRow,
    totalMeasures: editor.settings.totalMeasures,
    noteSpacing: editor.settings.noteSpacing,
    disableSpacebarControl: true,
  });

  // Handle notes change - report to tutorial
  const handleNotesChange = useCallback(
    (newNotes: RefactoredEditorNote[]) => {
      const previousCount = editor.notes.length;
      editor.setNotes(newNotes);

      // Report note placement if a note was added
      if (newNotes.length > previousCount) {
        tutorial.reportAction({ type: "note-placed" });
      }
    },
    [editor, tutorial],
  );

  // Handle tool selection - report to tutorial
  const handleToolSelect = useCallback(
    (tool: typeof editor.selectedTool) => {
      editor.setSelectedTool(tool);
      if (tool) {
        tutorial.reportAction({ type: "tool-selected", tool });
      }
    },
    [editor, tutorial],
  );

  // Handle play - wraps playback.handleTogglePlayPause and reports to tutorial
  const handlePlayToggle = useCallback(() => {
    if (!editor.hasNotes) {
      toast.error("Add some notes first!");
      return;
    }
    // Report to tutorial when starting playback (not pausing/resuming)
    if (!playback.isPlaying && !playback.isPaused) {
      tutorial.reportAction({ type: "play-started" });
    }
    playback.handleTogglePlayPause();
  }, [editor.hasNotes, playback, tutorial]);

  // Handle duplicate note warning
  const handleDuplicateNote = useCallback(() => {
    toast.error("A note already exists at this position", {
      duration: 2000,
    });
  }, []);

  // Handle context menu action - report to tutorial
  const handleContextMenuAction = useCallback(() => {
    tutorial.reportAction({ type: "context-menu-used" });
  }, [tutorial]);

  // Handle repeat markers change - report to tutorial
  const handleRepeatMarkersChange = useCallback(
    (newMarkers: RefactoredRepeatMarker[]) => {
      const previousCount = editor.repeatMarkers.length;
      editor.setRepeatMarkers(newMarkers);

      // Report if repeat markers were added
      if (newMarkers.length > previousCount) {
        tutorial.reportAction({ type: "repeat-changed" });
      }
    },
    [editor, tutorial],
  );

  // Handle lyrics change - report to tutorial
  const handleLyricsChange = useCallback(
    (newLyrics: LyricSyllable[]) => {
      const previousCount = editor.lyrics.length;
      editor.setLyrics(newLyrics);

      // Report if lyrics were added
      if (newLyrics.length > previousCount) {
        tutorial.reportAction({ type: "lyrics-changed" });
      }
    },
    [editor, tutorial],
  );

  // Handle playhead seek - deselect note tools to prevent accidental note placement
  const handlePlayheadSeek = useCallback(
    (absoluteBeat: number) => {
      // Deselect any note placement tool to prevent accidental clicks
      if (editor.selectedTool) {
        editor.setSelectedTool(null);
      }
      playback.handleSeek(absoluteBeat);
    },
    [editor, playback],
  );

  // Handle loading a song - stop playback first
  const handleLoadSong = useCallback(
    (song: SavedSong) => {
      playback.handleStop();
      editor.loadSong(song);
    },
    [playback, editor],
  );

  // Restart tutorial with clean editor state
  // Request to restart tutorial - shows confirmation if there are notes
  const handleRestartTutorial = useCallback(() => {
    if (editor.hasNotes || editor.lyrics.length > 0) {
      // Show confirmation dialog if there's content to lose
      setShowRestartTutorialConfirm(true);
    } else {
      // No content, restart directly
      playback.handleStop();
      editor.setSelectedTool("quarter");
      tutorial.resetTutorial();
    }
  }, [editor, playback, tutorial]);

  // Actually restart the tutorial (called after confirmation)
  const confirmRestartTutorial = useCallback(() => {
    // Stop any playback
    playback.handleStop();
    // Clear all editor content (notes, repeat markers, lyrics) in one call
    editor.clearComposition();
    // Reset the selected tool to quarter note (default)
    editor.setSelectedTool("quarter");
    // Reset the tutorial
    tutorial.resetTutorial();
    // Close the confirmation dialog
    setShowRestartTutorialConfirm(false);
  }, [playback, editor, tutorial]);

  // Request to create a new song - shows confirmation if there are notes
  const handleNewSong = useCallback(() => {
    if (editor.hasNotes || editor.lyrics.length > 0) {
      // Show confirmation dialog if there's content to lose
      setShowNewSongConfirm(true);
    } else {
      // No content, create new song directly
      playback.handleStop();
      editor.clearComposition();
      editor.setSelectedTool("quarter");
      setShowSongLibrary(false);
    }
  }, [editor, playback]);

  // Actually create a new song (called after confirmation)
  const confirmNewSong = useCallback(() => {
    // Stop any playback
    playback.handleStop();
    // Clear all editor content (notes, repeat markers, lyrics)
    editor.clearComposition();
    // Reset the selected tool to quarter note (default)
    editor.setSelectedTool("quarter");
    // Close dialogs
    setShowNewSongConfirm(false);
    setShowSongLibrary(false);
  }, [playback, editor]);

  // Download as PNG
  const handleDownloadPNG = useCallback(async () => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    // Create canvas at 2x resolution for better quality
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = svg.clientWidth * scale;
      canvas.height = svg.clientHeight * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = pngUrl;
          link.download = `${editor.currentSongTitle || "composition"}.png`;
          link.click();
          URL.revokeObjectURL(pngUrl);
        }
      }, "image/png");

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [editor.currentSongTitle]);

  // Download as SVG
  const handleDownloadSVG = useCallback(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${editor.currentSongTitle || "composition"}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }, [editor.currentSongTitle]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toaster position="top-center" />

      {/* Mobile banner */}
      <MobileBanner />

      {/* Tutorial overlay */}
      {tutorial.isActive && tutorial.currentStage && (
        <TutorialOverlay
          stage={tutorial.currentStage}
          onSkip={tutorial.skipTutorial}
          onNext={
            tutorial.currentStage.advanceOn.type === "manual"
              ? tutorial.advanceStage
              : undefined
          }
          onGoToStage={tutorial.goToStage}
          canAdvance={tutorial.canAdvanceManually}
          currentStageIndex={tutorial.currentStageIndex}
          totalStages={tutorial.totalStages}
        />
      )}

      {/* Header - EditorHeader with visibility controls, or SimpleHeader for early tutorial stages */}
      {!tutorial.isActive || visibility.showHeader ? (
        <EditorHeader
          currentSongTitle={editor.currentSongTitle}
          onSongTitleClick={() => setShowSongLibrary(true)}
          tempo={editor.settings.tempo}
          onTempoChange={editor.setTempo}
          timeSignature={editor.settings.timeSignature}
          measuresPerRow={editor.settings.measuresPerRow}
          onMeasuresPerRowChange={editor.setMeasuresPerRow}
          totalMeasures={editor.settings.totalMeasures}
          onTotalMeasuresChange={editor.setTotalMeasures}
          isPlaying={playback.isPlaying}
          isPaused={playback.isPaused}
          hasNotes={editor.hasNotes}
          onPlay={playback.handlePlay}
          onPause={playback.handlePause}
          onStop={playback.handleStop}
          onSettings={() => setShowSettings(true)}
          onHelp={() => setShowHelp(true)}
          showPiano={editor.settings.showPiano}
          onTogglePiano={() => editor.setShowPiano(!editor.settings.showPiano)}
          onDownloadPNG={handleDownloadPNG}
          onDownloadSVG={handleDownloadSVG}
          visibility={
            tutorial.isActive
              ? {
                  showTempo: visibility.showTempo,
                  showMeasureControls: visibility.showMeasureControls,
                  showDownload: visibility.showDownload,
                  showSettings: visibility.showSettings,
                  showHelp: visibility.showHelp,
                  showSongLibrary: visibility.showSongLibrary,
                  showPianoToggle: visibility.showPiano,
                  showPlayControls: false, // Use PlayControls component instead
                }
              : undefined
          }
          editorTutorial={{
            isActive: tutorial.isActive,
            currentStageIndex: tutorial.currentStageIndex,
            totalStages: tutorial.totalStages,
            onRestart: handleRestartTutorial,
          }}
        />
      ) : (
        <SimpleHeader title="Learn to Use the Editor" />
      )}

      {/* Standalone play controls - only during tutorial (after tutorial, use header controls) */}
      {tutorial.isActive && visibility.showPlayButton && (
        <PlayControls
          onTogglePlayPause={handlePlayToggle}
          onStop={playback.handleStop}
          isPlaying={playback.isPlaying}
          isPaused={playback.isPaused}
          hasNotes={editor.hasNotes}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tutorial progress sidebar */}
        {tutorial.isActive && (
          <TutorialProgress
            currentStage={tutorial.currentStageIndex}
            totalStages={tutorial.totalStages}
            stageName={tutorial.currentStage?.title}
          />
        )}

        {/* Editor canvas */}
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-4 bg-gradient-to-br from-white to-purple-50 flex flex-col items-center"
        >
          <NoteEditorRefactored
            notes={editor.notes}
            onNotesChange={handleNotesChange}
            repeatMarkers={editor.repeatMarkers}
            onRepeatMarkersChange={handleRepeatMarkersChange}
            lyrics={editor.lyrics}
            onLyricsChange={handleLyricsChange}
            selectedTool={editor.selectedTool}
            showLabels={editor.settings.showLabels}
            showGrid={editor.settings.showGrid}
            allowChords={editor.settings.allowChords}
            allowMove={editor.allowMove}
            systemCount={editor.systemCount}
            totalMeasures={editor.settings.totalMeasures}
            onSystemCountChange={() => {}}
            onDuplicateNote={handleDuplicateNote}
            svgRef={svgRef}
            timeSignature={editor.settings.timeSignature}
            tempo={editor.settings.tempo}
            measuresPerRow={editor.settings.measuresPerRow}
            readOnly={false}
            staffLines={editor.settings.staffLines}
            noteSpacing={editor.settings.noteSpacing}
            visibleContextMenuSections={visibility.visibleContextMenuSections}
            onContextMenuAction={handleContextMenuAction}
            isPlaying={playback.isPlaying}
            playheadX={playback.playheadX}
            playheadSystem={playback.playheadSystem}
            activeNoteId={playback.activeNoteId}
            onPlayheadBeatChange={handlePlayheadSeek}
          />

          {/* Debug info in development - only during active tutorial */}
          {process.env.NODE_ENV === "development" && tutorial.isActive && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
              <div>Notes: {editor.notes.length}</div>
              <div>Repeat markers: {absoluteRepeatMarkers.length}</div>
              <div>
                Tutorial stage: {tutorial.currentStageIndex + 1}/
                {tutorial.totalStages}
              </div>
              <div>Tutorial active: {tutorial.isActive ? "yes" : "no"}</div>
            </div>
          )}
        </div>

        {/* Tool palette */}
        <ToolPalette
          selectedTool={editor.selectedTool}
          onToolSelect={handleToolSelect}
          allowMove={editor.allowMove}
          onAllowMoveChange={editor.setAllowMove}
          allowedTools={visibility.allowedTools ?? undefined}
          hideSections={visibility.hidePaletteSections}
          isPianoOpen={visibility.showPiano && editor.settings.showPiano}
          highlightTool={visibility.highlightTool}
          onUndo={visibility.showUndo ? editor.handleUndo : undefined}
          onRedo={visibility.showUndo ? editor.handleRedo : undefined}
          canUndo={visibility.showUndo && editor.canUndo}
          canRedo={visibility.showUndo && editor.canRedo}
        />
      </div>

      {/* Piano drawer */}
      {visibility.showPiano && editor.settings.showPiano && (
        <PianoDrawer
          activePitch={playback.activePitch}
          useColors={editor.settings.useColors}
          onToggleColors={() => editor.setUseColors(!editor.settings.useColors)}
          showBlackKeys={editor.settings.showBlackKeys}
          onToggleBlackKeys={() =>
            editor.setShowBlackKeys(!editor.settings.showBlackKeys)
          }
          tempo={editor.settings.tempo}
        />
      )}

      {/* Footer */}
      <Footer />

      {/* Song Library Modal */}
      <SongLibraryModal
        isOpen={showSongLibrary}
        onClose={() => setShowSongLibrary(false)}
        savedSongs={editor.savedSongs}
        currentSongId={editor.currentSongId}
        onLoadSong={handleLoadSong}
        onDeleteSong={editor.deleteSong}
        onSaveSong={editor.saveSong}
        onUpdateCurrentSong={editor.updateCurrentSong}
        onNewSong={handleNewSong}
        onRestoreDefaults={editor.restoreDefaults}
        onExport={editor.exportSongs}
        onExportSelected={editor.exportSelectedSongs}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        tempo={editor.settings.tempo}
        onTempoChange={editor.setTempo}
        timeSignature={editor.settings.timeSignature}
        onTimeSignatureChange={editor.setTimeSignature}
        instrument={instrument}
        onInstrumentChange={setInstrument}
        showLabels={editor.settings.showLabels}
        onShowLabelsChange={editor.setShowLabels}
        showGrid={editor.settings.showGrid}
        onShowGridChange={editor.setShowGrid}
        allowChords={editor.settings.allowChords}
        onAllowChordsChange={editor.setAllowChords}
        staffLines={editor.settings.staffLines}
        onStaffLinesChange={editor.setStaffLines}
        noteSpacing={editor.settings.noteSpacing}
        onNoteSpacingChange={editor.setNoteSpacing}
      />

      {/* Help Modal */}
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Lyrics Modal */}
      <LyricsModal
        isOpen={showLyricsModal}
        onClose={() => setShowLyricsModal(false)}
        lyrics={editor.lyrics}
        onLyricsChange={handleLyricsChange}
        totalMeasures={editor.settings.totalMeasures}
        beatsPerMeasure={editor.settings.timeSignature.numerator}
        notes={playbackNotes}
      />

      {/* Restart Tutorial Confirmation Modal */}
      {showRestartTutorialConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200">
              <h2 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Restart Tutorial?
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-gray-700">
                Restarting the tutorial will clear all your current notes,
                lyrics, and repeat markers.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                This action cannot be undone. Make sure to save your work first
                if you want to keep it.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowRestartTutorialConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestartTutorial}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium"
              >
                Clear & Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Song Confirmation Modal */}
      {showNewSongConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-100 to-purple-100 border-b border-blue-200">
              <h2 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Create New Song?
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <p className="text-gray-700">
                Creating a new song will clear all your current notes, lyrics,
                and repeat markers.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Make sure to save your current work first if you want to keep
                it.
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowNewSongConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmNewSong}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
              >
                Clear & Create New
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
