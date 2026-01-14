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

        {/* Save Section */}
        <div className="px-3 py-3 bg-emerald-50 border-b border-emerald-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newSongName}
              onChange={(e) => setNewSongName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="Save as..."
              className="flex-1 px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:border-emerald-300 focus:outline-none min-w-0"
            />
            <button
              onClick={handleSave}
              disabled={!newSongName.trim()}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
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
        <div className="flex-1 overflow-y-auto p-3">
          {songs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎵</div>
              <p className="text-gray-500 text-sm">No saved songs</p>
            </div>
          ) : (
            <div className="space-y-2">
              {songs.map((song) => {
                const isCurrent = song.id === currentSongId;
                const isConfirming = confirmingDelete === song.id;

                return (
                  <div
                    key={song.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isCurrent
                        ? "bg-purple-50 border-purple-300"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* Song Info */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-800 truncate flex-1">
                        {song.name}
                      </h3>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 bg-purple-200 text-purple-800 text-xs font-medium rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                      <span>{song.composition.notes.length} notes</span>
                      <span>
                        {song.settings.timeSignature.numerator}/
                        {song.settings.timeSignature.denominator}
                      </span>
                      <span>{song.settings.tempo} BPM</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!isCurrent && (
                        <button
                          onClick={() => onLoadSong(song)}
                          className="flex-1 px-3 py-1.5 bg-blue-200 hover:bg-blue-300 text-blue-800 text-xs font-medium rounded-lg transition-colors"
                        >
                          Load
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(song.id)}
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
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-3 py-3 border-t border-gray-200 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={onRestoreDefaults}
              className="flex-1 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 text-xs font-medium rounded-lg transition-colors"
            >
              Restore Defaults
            </button>
            <button
              onClick={onExport}
              disabled={songs.length === 0}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                songs.length > 0
                  ? "bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Export All
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2 bg-gradient-to-r from-blue-200 to-purple-200 text-blue-800 text-sm font-medium rounded-lg hover:from-blue-300 hover:to-purple-300 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
