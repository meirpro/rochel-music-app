import { SavedSong } from "./types";
import {
  dayenu,
  mashiachNow,
  didanNotzach,
  nigunSimcha,
  koliDodiDofek,
  avinuMalkenu,
  animZemirot,
  shibnehBeitHamikdash,
  eimatiKaatiMar,
} from "./songs";

// Helper to create a SavedSong from a SongData
function createSavedSong(song: typeof dayenu, createdAt: number): SavedSong {
  return {
    id: song.id,
    name: song.name,
    createdAt,
    updatedAt: createdAt,
    composition: {
      notes: song.notes,
      repeatMarkers: song.repeatMarkers,
      lyrics: song.lyrics,
    },
    settings: song.settings,
  };
}

// Generate default songs from individual song files
export function getDefaultSongs(): Record<string, SavedSong> {
  const now = Date.now();

  const songs = [
    createSavedSong(dayenu, now),
    createSavedSong(mashiachNow, now - 1000),
    createSavedSong(didanNotzach, now - 2000),
    createSavedSong(nigunSimcha, now - 3000),
    createSavedSong(koliDodiDofek, now - 4000),
    createSavedSong(avinuMalkenu, now - 5000),
    createSavedSong(animZemirot, now - 6000),
    createSavedSong(shibnehBeitHamikdash, now - 7000),
    createSavedSong(eimatiKaatiMar, now - 8000),
  ];

  return Object.fromEntries(songs.map((song) => [song.id, song]));
}

// Default song IDs for checking if defaults exist
export const DEFAULT_SONG_IDS = [
  "default-dayenu",
  "default-mashiach",
  "default-didan",
  "default-simcha",
  "default-koli",
  "default-avinu",
  "default-anim",
  "default-shibneh",
  "default-eimati",
];
