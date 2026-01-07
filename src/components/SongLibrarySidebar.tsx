"use client";

import { useState } from "react";
import { SavedSong, SavedSongsMap } from "@/lib/types";

interface SongLibrarySidebarProps {
  isOpen: boolean;
  savedSongs: SavedSongsMap;
  onSaveSong: (name: string) => void;
  onLoadSong: (song: SavedSong) => void;
  onDeleteSong: (songId: string) => void;
  onRestoreDefaults: () => void;
  onExport: () => void;
}

export function SongLibrarySidebar({
  isOpen,
  savedSongs,
  onSaveSong,
  onLoadSong,
  onDeleteSong,
  onRestoreDefaults,
  onExport,
}: SongLibrarySidebarProps) {
  const [songName, setSongName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const songList = Object.values(savedSongs).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  const handleSave = () => {
    if (songName.trim()) {
      onSaveSong(songName.trim());
      setSongName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && songName.trim()) {
      handleSave();
    }
  };

  const handleDelete = (songId: string) => {
    if (deleteConfirmId === songId) {
      onDeleteSong(songId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(songId);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-40 transform transition-transform duration-300 overflow-y-auto ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <h2 className="text-lg font-bold text-gray-800">Song Library</h2>
        <p className="text-xs text-gray-500">Save and load your compositions</p>
      </div>

      {/* Save section */}
      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Save Current Song
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={songName}
            onChange={(e) => setSongName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter song name..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            onClick={handleSave}
            disabled={!songName.trim()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={onRestoreDefaults}
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Restore Defaults
        </button>
        <button
          onClick={onExport}
          disabled={songList.length === 0}
          className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export JSON
        </button>
      </div>

      {/* Song list */}
      <div className="p-4 pt-0">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          My Songs ({songList.length})
        </h3>

        {songList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <p className="text-sm">No saved songs yet</p>
            <p className="text-xs mt-1">Create some music and save it here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {songList.map((song) => (
              <div
                key={song.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-800 truncate flex-1 mr-2">
                    {song.name}
                  </h4>
                </div>
                <div className="text-xs text-gray-500 mb-3 flex items-center gap-3">
                  <span>{song.composition.notes.length} notes</span>
                  <span>•</span>
                  <span>{formatDate(song.updatedAt)}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onLoadSong(song)}
                    className="flex-1 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDelete(song.id)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      deleteConfirmId === song.id
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {deleteConfirmId === song.id ? "Confirm?" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
