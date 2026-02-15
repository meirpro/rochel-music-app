"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { SavedSong, SavedSongsMap, Composition } from "@/lib/types";
import { DEFAULT_SONG_IDS } from "@/lib/defaultSongs";

// ─── Extracted sub-components (must be outside render to avoid state resets) ───

const SECTION_COLORS = {
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    chevron: "text-emerald-500",
    count: "bg-emerald-100 text-emerald-700",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    chevron: "text-amber-500",
    count: "bg-amber-100 text-amber-700",
  },
} as const;

function SongCard({
  song,
  currentSongId,
  confirmingDelete,
  isSelectMode,
  selectedForExport,
  onToggleSelection,
  onLoadSong,
  onUpdateCurrentSong,
  onDelete,
  formatDate,
}: {
  song: SavedSong;
  currentSongId: string | null;
  confirmingDelete: string | null;
  isSelectMode: boolean;
  selectedForExport: Set<string>;
  onToggleSelection: (id: string) => void;
  onLoadSong: (song: SavedSong) => void;
  onUpdateCurrentSong: () => void;
  onDelete: (id: string) => void;
  formatDate: (timestamp: number) => string;
}) {
  const isCurrent = song.id === currentSongId;
  const isConfirming = confirmingDelete === song.id;
  const isSelected = selectedForExport.has(song.id);

  return (
    <div
      className={`p-3 rounded-lg border transition-all ${
        isCurrent
          ? "bg-purple-50 border-purple-300"
          : isSelectMode && isSelected
            ? "bg-indigo-50 border-indigo-300"
            : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {isSelectMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(song.id)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
            title="Select for export"
          />
        )}
        <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">
          {song.name}
        </h3>
        {isCurrent && (
          <span className="px-1.5 py-0.5 bg-purple-200 text-purple-800 text-xs font-medium rounded">
            Current
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-1">
        <span>{song.composition.notes.length} notes</span>
        <span>
          {song.settings.timeSignature.numerator}/
          {song.settings.timeSignature.denominator}
        </span>
        <span>{song.settings.tempo} BPM</span>
      </div>
      <div className="text-xs text-gray-400 mb-2">
        {DEFAULT_SONG_IDS.includes(song.id) ? (
          <span className="text-emerald-600">
            Added {formatDate(song.createdAt)}
          </span>
        ) : (
          <span>Updated {formatDate(song.updatedAt)}</span>
        )}
      </div>
      <div className="flex gap-2">
        {isCurrent ? (
          <button
            onClick={onUpdateCurrentSong}
            className="flex-1 px-3 py-1.5 bg-emerald-200 hover:bg-emerald-300 text-emerald-800 text-xs font-medium rounded-lg transition-colors"
          >
            Update
          </button>
        ) : (
          <button
            onClick={() => onLoadSong(song)}
            className="flex-1 px-3 py-1.5 bg-blue-200 hover:bg-blue-300 text-blue-800 text-xs font-medium rounded-lg transition-colors"
          >
            Load
          </button>
        )}
        <button
          onClick={() => onDelete(song.id)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
            isConfirming
              ? "bg-red-200 text-red-800 hover:bg-red-300 flex-1"
              : "bg-gray-100 hover:bg-gray-200 text-gray-500"
          }`}
        >
          {isConfirming ? "Confirm?" : "Delete"}
        </button>
      </div>
    </div>
  );
}

function CategorySection({
  title,
  songs: sectionSongs,
  isOpen: sectionOpen,
  onToggle,
  accentColor,
  subtitle,
  cardProps,
}: {
  title: string;
  songs: SavedSong[];
  isOpen: boolean;
  onToggle: () => void;
  accentColor: "emerald" | "amber";
  subtitle?: string;
  cardProps: Omit<React.ComponentProps<typeof SongCard>, "song">;
}) {
  if (sectionSongs.length === 0) return null;
  const colors = SECTION_COLORS[accentColor];

  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg ${colors.bg} ${colors.border} border mb-2 transition-colors hover:opacity-80`}
      >
        <svg
          className={`w-3.5 h-3.5 ${colors.chevron} transition-transform ${sectionOpen ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className={`text-xs font-semibold ${colors.text}`}>{title}</span>
        <span
          className={`text-xs font-medium px-1.5 py-0.5 rounded ${colors.count}`}
        >
          {sectionSongs.length}
        </span>
        {subtitle && (
          <span className="text-xs text-gray-400 ml-auto">{subtitle}</span>
        )}
      </button>
      {sectionOpen && (
        <div className="space-y-2 mb-3">
          {sectionSongs.map((song) => (
            <SongCard key={song.id} song={song} {...cardProps} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface SongLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSongs: SavedSongsMap;
  currentSongId: string | null;
  currentComposition?: Composition; // For showing summary in save dialog
  currentSettings?: {
    tempo: number;
    timeSignature: { numerator: number; denominator: number };
  };
  onLoadSong: (song: SavedSong) => void;
  onDeleteSong: (songId: string) => void;
  onSaveSong: (name: string, description?: string) => void;
  onUpdateCurrentSong: () => void;
  onNewSong?: () => void; // Creates a new blank song (parent handles unsaved warning)
  onRestoreDefaults: () => void;
  onExport: () => void;
  onExportSelected: (songIds: string[]) => void;
}

export function SongLibraryModal({
  isOpen,
  onClose,
  savedSongs,
  currentSongId,
  currentComposition,
  currentSettings,
  onLoadSong,
  onDeleteSong,
  onSaveSong,
  onUpdateCurrentSong,
  onNewSong,
  onRestoreDefaults,
  onExport: _onExport,
  onExportSelected,
}: SongLibraryModalProps) {
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedForExport, setSelectedForExport] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [songsOpen, setSongsOpen] = useState(true);
  const [experimentalOpen, setExperimentalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const saveNameInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Focus save name input when dialog opens
  useEffect(() => {
    if (isSaveDialogOpen && saveNameInputRef.current) {
      saveNameInputRef.current.focus();
    }
  }, [isSaveDialogOpen]);

  // All songs sorted by update time
  const allSongs = useMemo(
    () => Object.values(savedSongs).sort((a, b) => b.updatedAt - a.updatedAt),
    [savedSongs],
  );

  // Filtered songs based on search query
  const songs = useMemo(() => {
    if (!searchQuery.trim()) return allSongs;
    const query = searchQuery.toLowerCase();
    return allSongs.filter(
      (song) =>
        song.name.toLowerCase().includes(query) ||
        song.hebrewName?.toLowerCase().includes(query),
    );
  }, [allSongs, searchQuery]);

  // Split songs into finished vs experimental
  const songsByCategory = useMemo(() => {
    const finished: SavedSong[] = [];
    const experimental: SavedSong[] = [];
    for (const song of songs) {
      if (song.category === "experimental") {
        experimental.push(song);
      } else {
        finished.push(song);
      }
    }
    return { finished, experimental };
  }, [songs]);

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSave = () => {
    if (saveName.trim()) {
      onSaveSong(saveName.trim(), saveDescription.trim() || undefined);
      setSaveName("");
      setSaveDescription("");
      setIsSaveDialogOpen(false);
    }
  };

  const openSaveDialog = () => {
    setSaveName("");
    setSaveDescription("");
    setIsSaveDialogOpen(true);
  };

  const closeSaveDialog = () => {
    setIsSaveDialogOpen(false);
    setSaveName("");
    setSaveDescription("");
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
      setSearchQuery("");
    }
    setIsSearchOpen(!isSearchOpen);
  };

  const handleDelete = (songId: string) => {
    if (confirmingDelete === songId) {
      onDeleteSong(songId);
      setConfirmingDelete(null);
    } else {
      setConfirmingDelete(songId);
      setTimeout(() => setConfirmingDelete(null), 3000);
    }
  };

  const toggleSelection = (songId: string) => {
    setSelectedForExport((prev) => {
      const next = new Set(prev);
      if (next.has(songId)) {
        next.delete(songId);
      } else {
        next.add(songId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedForExport.size === songs.length) {
      setSelectedForExport(new Set());
    } else {
      setSelectedForExport(new Set(songs.map((s) => s.id)));
    }
  };

  const handleExportSelected = () => {
    if (selectedForExport.size > 0) {
      onExportSelected(Array.from(selectedForExport));
      exitSelectMode();
    }
  };

  const enterSelectMode = () => {
    setIsSelectMode(true);
    setSelectedForExport(new Set());
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedForExport(new Set());
  };

  // Shared props for SongCard, passed through CategorySection
  const cardProps: Omit<React.ComponentProps<typeof SongCard>, "song"> = {
    currentSongId,
    confirmingDelete,
    isSelectMode,
    selectedForExport,
    onToggleSelection: toggleSelection,
    onLoadSong,
    onUpdateCurrentSong,
    onDelete: handleDelete,
    formatDate,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-200 to-purple-200 text-blue-800 px-4 py-3 border-b border-blue-300 flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Songs</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/60 hover:bg-white/80 flex items-center justify-center text-xl transition-colors text-blue-700"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Compact Toolbar */}
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            {/* Search Button */}
            {allSongs.length > 3 && (
              <button
                onClick={toggleSearch}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isSearchOpen
                    ? "bg-blue-200 text-blue-700"
                    : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
                title="Search songs"
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            )}

            {/* New Song Button */}
            {onNewSong && (
              <button
                onClick={onNewSong}
                className="flex-1 h-9 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <span className="text-base leading-none">+</span>
                New
              </button>
            )}

            {/* Save Button */}
            <button
              onClick={openSaveDialog}
              className="flex-1 h-9 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
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
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Save
            </button>
          </div>

          {/* Expandable Search Input */}
          {isSearchOpen && (
            <div className="mt-2">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search songs..."
                  className="w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-300 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-gray-500 mt-1">
                  {songs.length} of {allSongs.length} songs
                </p>
              )}
            </div>
          )}
        </div>

        {/* Save Dialog */}
        {isSaveDialogOpen && (
          <div className="px-3 py-3 bg-emerald-50 border-b border-emerald-200">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">
                  Song Name
                </label>
                <input
                  ref={saveNameInputRef}
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && saveName.trim() && handleSave()
                  }
                  placeholder="Enter song name..."
                  className="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:border-emerald-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Brief description or attribution..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:border-emerald-300 focus:outline-none resize-none"
                />
              </div>

              {/* Data Summary */}
              {currentComposition && currentSettings && (
                <div className="bg-white/60 rounded-lg p-2 text-xs text-emerald-700">
                  <div className="font-medium mb-1">Song Summary</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-emerald-600">
                    <span>{currentComposition.notes.length} notes</span>
                    <span>
                      {currentSettings.timeSignature.numerator}/
                      {currentSettings.timeSignature.denominator} time
                    </span>
                    <span>{currentSettings.tempo} BPM</span>
                    {currentComposition.lyrics.length > 0 && (
                      <span>{currentComposition.lyrics.length} lyrics</span>
                    )}
                    {currentComposition.repeatMarkers.length > 0 && (
                      <span>
                        {currentComposition.repeatMarkers.length / 2} repeat(s)
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={closeSaveDialog}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    saveName.trim()
                      ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Save Song
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-3">
          {songs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎵</div>
              <p className="text-gray-500 text-sm">No saved songs</p>
            </div>
          ) : (
            <>
              <CategorySection
                title="Songs"
                songs={songsByCategory.finished}
                isOpen={songsOpen}
                onToggle={() => setSongsOpen(!songsOpen)}
                accentColor="emerald"
                cardProps={cardProps}
              />
              <CategorySection
                title="Experimental"
                songs={songsByCategory.experimental}
                isOpen={experimentalOpen}
                onToggle={() => setExperimentalOpen(!experimentalOpen)}
                accentColor="amber"
                subtitle="WIP"
                cardProps={cardProps}
              />
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-3 py-3 border-t border-gray-200 space-y-2">
          {isSelectMode ? (
            <>
              {/* Select Mode Controls */}
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={toggleSelectAll}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {selectedForExport.size === songs.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
                <span className="text-xs text-gray-500">
                  {selectedForExport.size} of {songs.length} selected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exitSelectMode}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportSelected}
                  disabled={selectedForExport.size === 0}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                    selectedForExport.size > 0
                      ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Export ({selectedForExport.size})
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Normal Mode Controls */}
              <div className="flex gap-2">
                <button
                  onClick={onRestoreDefaults}
                  className="flex-1 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Restore Defaults
                </button>
                <button
                  onClick={enterSelectMode}
                  disabled={songs.length === 0}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                    songs.length > 0
                      ? "bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Export...
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-full py-2 bg-gradient-to-r from-blue-200 to-purple-200 text-blue-800 text-sm font-medium rounded-lg hover:from-blue-300 hover:to-purple-300 transition-all"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
