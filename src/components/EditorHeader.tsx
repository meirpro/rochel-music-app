"use client";

import { useState, useEffect, useRef } from "react";
import { MeasuresControlCompact } from "@/components/MeasuresControl";
import { TOUR_ELEMENT_IDS } from "@/lib/tourSteps/driverSteps";
import { TutorialMenu } from "@/components/TutorialMenu";

interface TimeSignature {
  numerator: number;
  denominator: number;
}

interface EditorHeaderProps {
  // Song info
  currentSongTitle: string;
  onSongTitleClick: () => void;

  // Tempo
  tempo: number;
  onTempoChange: (tempo: number) => void;

  // Time signature (for display)
  timeSignature: TimeSignature;

  // Layout control
  measuresPerRow: number;
  onMeasuresPerRowChange: (value: number) => void;
  totalMeasures: number;
  onTotalMeasuresChange: (value: number) => void;

  // Actions
  onSettings: () => void;
  onHelp: () => void;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  hasNotes: boolean;
  onDownloadPNG: () => void;
  onDownloadSVG: () => void;

  // Piano toggle
  showPiano: boolean;
  onTogglePiano: () => void;

  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function EditorHeader({
  currentSongTitle,
  onSongTitleClick,
  tempo,
  onTempoChange,
  timeSignature,
  measuresPerRow,
  onMeasuresPerRowChange,
  totalMeasures,
  onTotalMeasuresChange,
  onSettings,
  onHelp,
  onPlay,
  onPause,
  onStop,
  isPlaying,
  isPaused,
  hasNotes,
  onDownloadPNG,
  onDownloadSVG,
  showPiano,
  onTogglePiano,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: EditorHeaderProps) {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showTutorialMenu, setShowTutorialMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const tutorialMenuRef = useRef<HTMLDivElement>(null);
  const [isEditingTempo, setIsEditingTempo] = useState(false);
  const [tempoInputValue, setTempoInputValue] = useState(tempo.toString());
  const tempoInputRef = useRef<HTMLInputElement>(null);

  // Sync tempo input value when tempo changes
  useEffect(() => {
    setTempoInputValue(tempo.toString());
  }, [tempo]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTempo && tempoInputRef.current) {
      tempoInputRef.current.focus();
      tempoInputRef.current.select();
    }
  }, [isEditingTempo]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(event.target as Node)
      ) {
        setShowDownloadMenu(false);
      }
    }

    if (showDownloadMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showDownloadMenu]);

  const handleTempoBlur = () => {
    const newTempo = parseInt(tempoInputValue);
    if (!isNaN(newTempo) && newTempo >= 40 && newTempo <= 200) {
      onTempoChange(newTempo);
    } else {
      setTempoInputValue(tempo.toString());
    }
    setIsEditingTempo(false);
  };

  const handleTempoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTempoBlur();
    } else if (e.key === "Escape") {
      setTempoInputValue(tempo.toString());
      setIsEditingTempo(false);
    }
  };

  return (
    <header className="h-16 bg-gradient-to-r from-purple-200 via-blue-200 to-teal-200 border-b-2 border-purple-300 flex items-center justify-between px-4 shadow-sm">
      {/* Left section - Logo and Song */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Piano logo icon */}
          <svg
            className="w-7 h-7 text-purple-700"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect
              x="2"
              y="4"
              width="20"
              height="16"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect x="5" y="4" width="3" height="10" fill="currentColor" />
            <rect x="10" y="4" width="3" height="10" fill="currentColor" />
            <rect x="16" y="4" width="3" height="10" fill="currentColor" />
          </svg>
          <span className="text-purple-700 font-semibold text-lg hidden sm:inline">
            Rochel Music
          </span>
        </div>

        <div className="h-8 w-px bg-purple-300 hidden sm:block" />

        {/* Song Library Button */}
        <button
          id={TOUR_ELEMENT_IDS.songSelector}
          onClick={onSongTitleClick}
          className="flex items-center gap-2 px-3 py-2 bg-white/70 hover:bg-white/90 rounded-lg transition-colors shadow-sm border border-purple-200 hover:border-purple-300 group"
        >
          {/* Folder/Library icon */}
          <svg
            className="w-5 h-5 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-purple-400 leading-none">
              Current Song
            </span>
            <span className="text-purple-700 font-semibold text-sm max-w-[140px] truncate leading-tight">
              {currentSongTitle}
            </span>
          </div>
          <svg
            className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Center section - Tempo and Controls */}
      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div id={TOUR_ELEMENT_IDS.sectionUndoRedo} className="flex gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              canUndo
                ? "bg-white/60 hover:bg-white/80 text-purple-600 shadow-sm"
                : "bg-white/30 text-purple-300 cursor-not-allowed"
            }`}
            title="Undo (Cmd+Z)"
          >
            ↶
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              canRedo
                ? "bg-white/60 hover:bg-white/80 text-purple-600 shadow-sm"
                : "bg-white/30 text-purple-300 cursor-not-allowed"
            }`}
            title="Redo (Cmd+Shift+Z)"
          >
            ↷
          </button>
        </div>

        {/* Music Settings Group */}
        <div
          id={TOUR_ELEMENT_IDS.sectionMusicSettings}
          className="flex items-center gap-2"
        >
          {/* Time signature display */}
          <button
            id={TOUR_ELEMENT_IDS.timeSigDisplay}
            onClick={onSettings}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-white/60 hover:bg-white/80 rounded-lg shadow-sm transition-colors"
            title="Click to change time signature"
          >
            <span className="text-purple-700 font-semibold text-lg">
              {timeSignature.numerator}
            </span>
            <span className="text-purple-400 font-semibold text-lg">/</span>
            <span className="text-purple-700 font-semibold text-lg">
              {timeSignature.denominator}
            </span>
          </button>

          {/* Tempo input/display */}
          <div
            id={TOUR_ELEMENT_IDS.tempoDisplay}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/60 rounded-lg shadow-sm"
          >
            {isEditingTempo ? (
              <input
                ref={tempoInputRef}
                type="number"
                min="40"
                max="200"
                value={tempoInputValue}
                onChange={(e) => setTempoInputValue(e.target.value)}
                onBlur={handleTempoBlur}
                onKeyDown={handleTempoKeyDown}
                className="w-12 text-purple-700 font-semibold text-sm bg-transparent border-none outline-none text-center"
              />
            ) : (
              <button
                onClick={() => setIsEditingTempo(true)}
                className="text-purple-700 font-semibold text-sm hover:text-purple-800"
              >
                {tempo}
              </button>
            )}
            <span className="text-purple-500 text-xs">BPM</span>
          </div>

          {/* Measures per row control - max is totalMeasures (can't show more per row than exist) */}
          <div className="hidden md:block">
            <MeasuresControlCompact
              value={measuresPerRow}
              onChange={onMeasuresPerRowChange}
              maxMeasures={totalMeasures}
              label="Per row:"
            />
          </div>

          {/* Total measures control */}
          <div className="hidden md:block ml-2 pl-2 border-l border-purple-300">
            <MeasuresControlCompact
              value={totalMeasures}
              onChange={onTotalMeasuresChange}
              maxMeasures={99}
              label="Total measures:"
            />
          </div>
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Utility Buttons Group */}
        <div
          id={TOUR_ELEMENT_IDS.sectionUtilityButtons}
          className="flex items-center gap-2"
        >
          {/* Piano toggle */}
          <button
            id={TOUR_ELEMENT_IDS.pianoToggle}
            onClick={onTogglePiano}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              showPiano
                ? "bg-white text-purple-600 shadow-md ring-2 ring-purple-300"
                : "bg-white/60 hover:bg-white/80 text-purple-600 shadow-sm"
            }`}
            title="Toggle Piano"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <rect x="5" y="4" width="3" height="10" fill="currentColor" />
              <rect x="10" y="4" width="3" height="10" fill="currentColor" />
              <rect x="16" y="4" width="3" height="10" fill="currentColor" />
            </svg>
          </button>

          {/* Settings button */}
          <button
            id={TOUR_ELEMENT_IDS.settingsButton}
            onClick={onSettings}
            className="w-10 h-10 bg-white/60 hover:bg-white/80 text-purple-600 rounded-lg flex items-center justify-center transition-all shadow-sm"
            title="Settings"
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>

          {/* Learn/Tutorial button */}
          <div className="relative" ref={tutorialMenuRef}>
            <button
              onClick={() => setShowTutorialMenu(!showTutorialMenu)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all shadow-sm ${
                showTutorialMenu
                  ? "bg-purple-500 text-white"
                  : "bg-white/60 hover:bg-white/80 text-purple-600"
              }`}
              title="Learn the App"
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </button>

            {/* Tutorial menu dropdown */}
            <TutorialMenu
              isOpen={showTutorialMenu}
              onClose={() => setShowTutorialMenu(false)}
            />
          </div>

          {/* Help button */}
          <button
            id={TOUR_ELEMENT_IDS.helpButton}
            onClick={onHelp}
            className="w-10 h-10 bg-white/60 hover:bg-white/80 text-purple-600 rounded-lg flex items-center justify-center transition-all shadow-sm"
            title="Help"
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
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>

          {/* Download button with dropdown */}
          <div className="relative" ref={downloadMenuRef}>
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="w-10 h-10 bg-white/60 hover:bg-white/80 text-purple-600 rounded-lg flex items-center justify-center transition-all shadow-sm"
              title="Download"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showDownloadMenu && (
              <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border-2 border-purple-200 overflow-hidden z-50 min-w-[140px]">
                <button
                  onClick={() => {
                    onDownloadPNG();
                    setShowDownloadMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>PNG Image</span>
                </button>
                <button
                  onClick={() => {
                    onDownloadSVG();
                    setShowDownloadMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-2 border-t border-purple-100"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  <span>SVG Vector</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* End Utility Buttons Group */}

        <div className="h-8 w-px bg-purple-300" />

        {/* Play Controls Section */}
        <div
          id={TOUR_ELEMENT_IDS.sectionPlayControls}
          className="flex items-center gap-1"
        >
          {/* Stop/Reset button - shows when playing or paused */}
          {(isPlaying || isPaused) && (
            <button
              onClick={onStop}
              className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-all shadow-sm"
              title="Stop and reset (rewind)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
            </button>
          )}

          {/* Play/Pause button - Large and prominent */}
          <button
            id={TOUR_ELEMENT_IDS.playButton}
            onClick={isPlaying ? onPause : onPlay}
            disabled={!hasNotes && !isPlaying && !isPaused}
            className={`px-6 py-2 rounded-xl font-semibold text-base shadow-md transition-all flex items-center gap-2 ${
              isPlaying
                ? "bg-amber-200 hover:bg-amber-300 text-amber-700"
                : isPaused
                  ? "bg-teal-200 hover:bg-teal-300 text-teal-700"
                  : hasNotes
                    ? "bg-teal-200 hover:bg-teal-300 text-teal-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
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
                <span className="hidden sm:inline">Pause</span>
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
                <span className="hidden sm:inline">
                  {isPaused ? "Resume" : "Play"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
