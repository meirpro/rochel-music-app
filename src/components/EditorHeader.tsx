"use client";

import { useState, useEffect, useRef } from "react";
import { MeasuresControlCompact } from "@/components/MeasuresControl";
import { TOUR_ELEMENT_IDS } from "@/lib/tourSteps/driverSteps";
import { TutorialMenu } from "@/components/TutorialMenu";
import { LogoIcon } from "@/components/LogoIcon";
import { SavedSong, SavedSongsMap } from "@/lib/types";

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

  // Undo/Redo (optional - moved to ToolPalette but kept for compatibility)
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;

  // Mobile song dropdown
  isMobile?: boolean;
  savedSongs?: SavedSongsMap;
  currentSongId?: string | null;
  onQuickLoadSong?: (song: SavedSong) => void;
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
  isMobile,
  savedSongs,
  currentSongId,
  onQuickLoadSong,
}: EditorHeaderProps) {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showTutorialMenu, setShowTutorialMenu] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showMobileSongMenu, setShowMobileSongMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const tutorialMenuRef = useRef<HTMLDivElement>(null);
  const hamburgerMenuRef = useRef<HTMLDivElement>(null);
  const mobileSongMenuRef = useRef<HTMLDivElement>(null);
  const [isEditingTempo, setIsEditingTempo] = useState(false);
  const [tempoInputValue, setTempoInputValue] = useState(tempo.toString());
  const tempoInputRef = useRef<HTMLInputElement>(null);

  // Sort songs for mobile dropdown
  const sortedSongs = savedSongs
    ? Object.values(savedSongs).sort((a, b) => b.updatedAt - a.updatedAt)
    : [];

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(event.target as Node)
      ) {
        setShowDownloadMenu(false);
      }
      if (
        hamburgerMenuRef.current &&
        !hamburgerMenuRef.current.contains(event.target as Node)
      ) {
        setShowHamburgerMenu(false);
      }
      if (
        mobileSongMenuRef.current &&
        !mobileSongMenuRef.current.contains(event.target as Node)
      ) {
        setShowMobileSongMenu(false);
      }
    }

    if (showDownloadMenu || showHamburgerMenu || showMobileSongMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showDownloadMenu, showHamburgerMenu, showMobileSongMenu]);

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
    <header className="h-16 bg-gradient-to-r from-purple-200 via-blue-200 to-teal-200 border-b-2 border-purple-300 flex items-center justify-between px-2 sm:px-4 shadow-sm">
      {/* Left section - Logo and Song */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Piano logo icon */}
          <LogoIcon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-700" />
          <span className="text-purple-700 font-semibold text-lg hidden md:inline">
            Rochel&apos;s Piano School
          </span>
        </div>

        <div className="h-8 w-px bg-purple-300 hidden md:block flex-shrink-0" />

        {/* Song Library Button / Mobile Dropdown */}
        <div className="relative" ref={mobileSongMenuRef}>
          <button
            id={TOUR_ELEMENT_IDS.songSelector}
            onClick={() => {
              if (isMobile && savedSongs && onQuickLoadSong) {
                setShowMobileSongMenu(!showMobileSongMenu);
              } else {
                onSongTitleClick();
              }
            }}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors shadow-sm border group min-w-0 ${
              showMobileSongMenu
                ? "bg-purple-100 border-purple-300"
                : "bg-white/70 hover:bg-white/90 border-purple-200 hover:border-purple-300"
            }`}
          >
            {/* Folder/Library icon */}
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0"
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
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[10px] text-purple-400 leading-none hidden sm:block">
                Current Song
              </span>
              <span className="text-purple-700 font-semibold text-xs sm:text-sm max-w-[80px] sm:max-w-[140px] truncate leading-tight">
                {currentSongTitle}
              </span>
            </div>
            <svg
              className={`w-3 h-3 sm:w-4 sm:h-4 text-purple-400 group-hover:text-purple-600 transition-all flex-shrink-0 ${
                showMobileSongMenu ? "rotate-180" : ""
              }`}
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

          {/* Mobile Song Dropdown */}
          {showMobileSongMenu && isMobile && (
            <div className="absolute left-0 top-12 bg-white rounded-lg shadow-lg border-2 border-purple-200 overflow-hidden z-50 min-w-[200px] max-w-[280px] max-h-[60vh] overflow-y-auto">
              <div className="px-3 py-2 bg-gradient-to-r from-blue-100 to-purple-100 border-b border-purple-200">
                <span className="text-xs font-semibold text-purple-700">
                  Select a Song
                </span>
              </div>
              {sortedSongs.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No songs saved
                </div>
              ) : (
                sortedSongs.map((song) => {
                  const isCurrent = song.id === currentSongId;
                  return (
                    <button
                      key={song.id}
                      onClick={() => {
                        if (!isCurrent && onQuickLoadSong) {
                          onQuickLoadSong(song);
                        }
                        setShowMobileSongMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left transition-colors flex items-center justify-between gap-2 ${
                        isCurrent
                          ? "bg-purple-50 text-purple-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">
                          {song.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {song.composition.notes.length} notes •{" "}
                          {song.settings.tempo} BPM
                        </div>
                      </div>
                      {isCurrent && (
                        <svg
                          className="w-4 h-4 text-purple-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center section - Time sig, Tempo, and Measures (responsive) */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Music Settings Group */}
        <div
          id={TOUR_ELEMENT_IDS.sectionMusicSettings}
          className="flex items-center gap-2"
        >
          {/* Time signature display */}
          <button
            id={TOUR_ELEMENT_IDS.timeSigDisplay}
            onClick={onSettings}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-white/60 hover:bg-white/80 rounded-lg shadow-sm transition-colors"
            title="Click to change time signature"
          >
            <span className="text-purple-700 font-semibold text-base sm:text-lg">
              {timeSignature.numerator}
            </span>
            <span className="text-purple-400 font-semibold text-base sm:text-lg">
              /
            </span>
            <span className="text-purple-700 font-semibold text-base sm:text-lg">
              {timeSignature.denominator}
            </span>
          </button>

          {/* Tempo input/display */}
          <div
            id={TOUR_ELEMENT_IDS.tempoDisplay}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-white/60 rounded-lg shadow-sm"
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
                className="w-10 sm:w-12 text-purple-700 font-semibold text-sm bg-transparent border-none outline-none text-center"
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

          {/* Measures per row control - only on xl screens */}
          <div className="hidden xl:block">
            <MeasuresControlCompact
              value={measuresPerRow}
              onChange={onMeasuresPerRowChange}
              maxMeasures={totalMeasures}
              label="Per row:"
            />
          </div>

          {/* Total measures control - only on xl screens */}
          <div className="hidden xl:block ml-2 pl-2 border-l border-purple-300">
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
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Hamburger Menu - shows below lg (1024px) */}
        <div className="relative lg:hidden" ref={hamburgerMenuRef}>
          <button
            onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all shadow-sm ${
              showHamburgerMenu
                ? "bg-purple-500 text-white"
                : "bg-white/60 hover:bg-white/80 text-purple-600"
            }`}
            title="Menu"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Hamburger menu dropdown */}
          {showHamburgerMenu && (
            <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border-2 border-purple-200 overflow-hidden z-50 min-w-[200px] max-h-[70vh] overflow-y-auto">
              {/* Measures controls - show in menu below xl */}
              <div className="xl:hidden border-b border-purple-200 p-3">
                <div className="text-xs text-purple-500 font-semibold mb-2">
                  LAYOUT
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Per row:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          onMeasuresPerRowChange(
                            Math.max(1, measuresPerRow - 1),
                          )
                        }
                        className="w-7 h-7 rounded bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-purple-700 font-semibold">
                        {measuresPerRow}
                      </span>
                      <button
                        onClick={() =>
                          onMeasuresPerRowChange(
                            Math.min(totalMeasures, measuresPerRow + 1),
                          )
                        }
                        className="w-7 h-7 rounded bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Total:</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          onTotalMeasuresChange(Math.max(1, totalMeasures - 1))
                        }
                        className="w-7 h-7 rounded bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-purple-700 font-semibold">
                        {totalMeasures}
                      </span>
                      <button
                        onClick={() =>
                          onTotalMeasuresChange(Math.min(99, totalMeasures + 1))
                        }
                        className="w-7 h-7 rounded bg-purple-100 hover:bg-purple-200 text-purple-700 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time sig and Tempo - show in menu below sm */}
              <div className="sm:hidden border-b border-purple-200 p-3">
                <div className="text-xs text-purple-500 font-semibold mb-2">
                  MUSIC
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      onSettings();
                      setShowHamburgerMenu(false);
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded text-purple-700"
                  >
                    <span className="font-semibold">
                      {timeSignature.numerator}/{timeSignature.denominator}
                    </span>
                  </button>
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 rounded">
                    <span className="text-purple-700 font-semibold">
                      {tempo}
                    </span>
                    <span className="text-purple-500 text-xs">BPM</span>
                  </div>
                </div>
              </div>

              {/* Piano toggle */}
              <button
                onClick={() => {
                  onTogglePiano();
                  setShowHamburgerMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-3"
              >
                <LogoIcon className="w-5 h-5" />
                <span>Piano {showPiano ? "(ON)" : "(OFF)"}</span>
              </button>

              {/* Settings */}
              <button
                onClick={() => {
                  onSettings();
                  setShowHamburgerMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-3 border-t border-purple-100"
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
                <span>Settings</span>
              </button>

              {/* Help */}
              <button
                onClick={() => {
                  onHelp();
                  setShowHamburgerMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-3 border-t border-purple-100"
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
                <span>Help</span>
              </button>

              {/* Download PNG */}
              <button
                onClick={() => {
                  onDownloadPNG();
                  setShowHamburgerMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-3 border-t border-purple-100"
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
                <span>Download PNG</span>
              </button>

              {/* Download SVG */}
              <button
                onClick={() => {
                  onDownloadSVG();
                  setShowHamburgerMenu(false);
                }}
                className="w-full px-4 py-3 text-left text-purple-700 hover:bg-purple-50 transition-colors flex items-center gap-3 border-t border-purple-100"
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
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
                <span>Download SVG</span>
              </button>
            </div>
          )}
        </div>

        {/* Utility Buttons Group - shows at lg (1024px+) */}
        <div
          id={TOUR_ELEMENT_IDS.sectionUtilityButtons}
          className="hidden lg:flex items-center gap-2"
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
            <LogoIcon className="w-5 h-5" />
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

        <div className="hidden lg:block h-8 w-px bg-purple-300" />

        {/* Play Controls Section */}
        <div
          id={TOUR_ELEMENT_IDS.sectionPlayControls}
          className="flex items-center gap-1"
        >
          {/* Stop/Reset button - shows when playing or paused */}
          {(isPlaying || isPaused) && (
            <button
              onClick={onStop}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-all shadow-sm"
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
            className={`px-3 sm:px-6 py-2 rounded-xl font-semibold text-sm sm:text-base shadow-md transition-all flex items-center gap-1 sm:gap-2 ${
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
