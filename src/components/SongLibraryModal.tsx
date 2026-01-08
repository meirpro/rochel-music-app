"use client";

import { useState } from "react";
import { SavedSong, SavedSongsMap } from "@/lib/types";

interface SongLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSongs: SavedSongsMap;
  currentSongId: string | null;
  onLoadSong: (song: SavedSong) => void;
  onDeleteSong: (songId: string) => void;
  onSaveSong: (name: string) => void;
  onRestoreDefaults: () => void;
  onExport: () => void;
}

export function SongLibraryModal({
  isOpen,
  onClose,
  savedSongs,
  currentSongId,
  onLoadSong,
  onDeleteSong,
  onSaveSong,
  onRestoreDefaults,
  onExport,
}: SongLibraryModalProps) {
  const [newSongName, setNewSongName] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  if (!isOpen) return null;

  const songs = Object.values(savedSongs).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  const handleSave = () => {
    if (newSongName.trim()) {
      onSaveSong(newSongName.trim());
      setNewSongName("");
    }
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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-200 to-purple-200 text-blue-800 p-6 rounded-t-2xl border-b-2 border-blue-300">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">My Songs</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 flex items-center justify-center text-2xl transition-colors text-blue-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Save Section */}
        <div className="p-6 bg-emerald-50 border-b-2 border-emerald-200">
          <label className="block text-lg font-semibold text-gray-800 mb-3">
            Save Current Song
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSongName}
              onChange={(e) => setNewSongName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="Enter song name..."
              className="flex-1 px-4 py-3 text-base border-2 border-emerald-200 rounded-xl focus:border-emerald-300 focus:outline-none shadow-sm"
            />
            <button
              onClick={handleSave}
              disabled={!newSongName.trim()}
              className={`px-6 py-3 font-semibold rounded-xl transition-all shadow-sm ${
                newSongName.trim()
                  ? "bg-emerald-200 hover:bg-emerald-300 text-emerald-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        </div>

        {/* Song List */}
        <div className="flex-1 overflow-y-auto p-6">
          {songs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <p className="text-gray-500 text-lg">No saved songs yet!</p>
              <p className="text-gray-400 text-sm mt-2">
                Create your first song and save it above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {songs.map((song) => {
                const isCurrent = song.id === currentSongId;
                const isConfirming = confirmingDelete === song.id;

                return (
                  <div
                    key={song.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isCurrent
                        ? "bg-purple-50 border-purple-300 shadow-md"
                        : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-800 truncate">
                            {song.name}
                          </h3>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs font-semibold rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span>{song.composition.notes.length} notes</span>
                          <span>
                            {song.settings.timeSignature.numerator}/
                            {song.settings.timeSignature.denominator}
                          </span>
                          <span>{song.settings.tempo} BPM</span>
                          <span className="text-gray-400">
                            {new Date(song.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!isCurrent && (
                          <button
                            onClick={() => onLoadSong(song)}
                            className="px-4 py-2 bg-blue-200 hover:bg-blue-300 text-blue-800 font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            Load
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(song.id)}
                          className={`px-4 py-2 font-semibold rounded-lg transition-all shadow-sm ${
                            isConfirming
                              ? "bg-red-200 text-red-800 hover:bg-red-300"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                        >
                          {isConfirming ? "Confirm?" : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-blue-50 p-4 rounded-b-2xl border-t border-blue-200 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={onRestoreDefaults}
              className="flex-1 py-3 bg-orange-200 hover:bg-orange-300 text-orange-800 font-semibold rounded-xl transition-colors shadow-sm"
            >
              Restore Default Songs
            </button>
            <button
              onClick={onExport}
              disabled={songs.length === 0}
              className={`flex-1 py-3 font-semibold rounded-xl transition-colors shadow-sm ${
                songs.length > 0
                  ? "bg-indigo-200 hover:bg-indigo-300 text-indigo-800"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Export All Songs
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-200 to-purple-200 text-blue-800 font-semibold rounded-xl hover:from-blue-300 hover:to-purple-300 transition-all shadow-sm"
          >
            Done ✓
          </button>
        </div>
      </div>
    </div>
  );
}
