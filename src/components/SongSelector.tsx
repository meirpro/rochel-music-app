"use client";

import { getSongList } from "@/lib/songs";

interface SongSelectorProps {
  value: string;
  onChange: (songId: string) => void;
}

export function SongSelector({ value, onChange }: SongSelectorProps) {
  const songs = getSongList();

  return (
    <div>
      <label htmlFor="song" className="block text-xs text-gray-500 mb-1">
        Song
      </label>
      <select
        id="song"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 outline-none focus:border-emerald-500 transition-colors"
      >
        {songs.map((song) => (
          <option key={song.id} value={song.id}>
            {song.title}
            {song.hebrewTitle ? ` (${song.hebrewTitle})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
