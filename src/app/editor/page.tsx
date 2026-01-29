/**
 * Editor Page with Progressive Tutorial
 *
 * A standalone editor page using NoteEditorRefactored with a progressive
 * tutorial system that gradually reveals UI elements as users learn.
 */

"use client";

import { useRef, useMemo, useCallback, useEffect } from "react";
import { toast, Toaster } from "sonner";

// Components
import { NoteEditorRefactored } from "@/components/NoteEditorRefactored";
import {
  EditorNote as RefactoredEditorNote,
  RepeatMarker as RefactoredRepeatMarker,
} from "@/components/NoteEditorRefactored/types";
import { LyricSyllable } from "@/lib/types";
import { ToolPalette } from "@/components/ToolPalette";
import { Footer } from "@/components/Footer";
import { PianoDrawer } from "@/components/PianoDrawer";

// Hooks
import { useProgressiveTutorial } from "./hooks/useProgressiveTutorial";
import { useEditorState } from "./hooks/useEditorState";
import { usePlayback } from "@/hooks/usePlayback";

// Tutorial components
import { TutorialOverlay } from "./components/TutorialOverlay";
import { TutorialProgress } from "./components/TutorialProgress";

// Types
import { EditorNote as PlaybackEditorNote, RepeatMarker } from "@/lib/types";

/**
 * Convert notes from beat/system format to absoluteBeat format
 */
function toAbsoluteBeatFormat(
  notes: RefactoredEditorNote[],
  measuresPerRow: number,
  beatsPerMeasure: number,
): PlaybackEditorNote[] {
  return notes.map((note) => ({
    id: note.id,
    pitch: note.pitch,
    duration: note.duration,
    absoluteBeat: note.system * measuresPerRow * beatsPerMeasure + note.beat,
  }));
}

/**
 * Convert repeat markers from local format to absolute format
 */
function toAbsoluteRepeatMarkers(
  markers: {
    id: string;
    pairId: string;
    type: "start" | "end";
    measure: number;
    system: number;
  }[],
  measuresPerRow: number,
): RepeatMarker[] {
  return markers.map((marker) => ({
    id: marker.id,
    pairId: marker.pairId,
    type: marker.type,
    measureNumber: marker.system * measuresPerRow + marker.measure,
  }));
}

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

  // Convert notes for playback (absoluteBeat format)
  const playbackNotes = useMemo(
    () =>
      toAbsoluteBeatFormat(
        editor.notes,
        editor.settings.measuresPerRow,
        editor.settings.timeSignature.numerator,
      ),
    [
      editor.notes,
      editor.settings.measuresPerRow,
      editor.settings.timeSignature.numerator,
    ],
  );

  // Convert repeat markers
  const absoluteRepeatMarkers = useMemo(
    () =>
      toAbsoluteRepeatMarkers(
        editor.repeatMarkers,
        editor.settings.measuresPerRow,
      ),
    [editor.repeatMarkers, editor.settings.measuresPerRow],
  );

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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Toast notifications */}
      <Toaster position="top-center" />

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

      {/* Header - simple or hidden based on tutorial stage */}
      {visibility.showHeader ? (
        <SimpleHeader
          title="Rochel's Music Editor"
          onRestartTutorial={
            !tutorial.isActive ? tutorial.resetTutorial : undefined
          }
        />
      ) : (
        <SimpleHeader title="Learn to Use the Editor" />
      )}

      {/* Play controls - only when showPlayButton is true */}
      {visibility.showPlayButton && (
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
          />

          {/* Debug info in development */}
          {process.env.NODE_ENV === "development" && (
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
    </div>
  );
}
