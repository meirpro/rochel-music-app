import { SavedSong, SavedSongsMap } from "./types";
import { SongData } from "./songs/types";
import {
  dayenu,
  mashiachNow,
  didanNotzach,
  aniPurim,
  havdalah,
  vezakeniLegadel,
  adonOlam,
  adonOlamFull,
  hevenuShalom,
  alYedeyNigunim,
  chagPurim,
  maNishtana,
  omarRabbiAkiva,
} from "./songs";

// Helper to create a SavedSong from a SongData
// Uses the song's releaseDate for consistent timestamps
function createSavedSong(song: SongData): SavedSong {
  const releaseTimestamp = new Date(song.releaseDate).getTime();
  return {
    id: song.id,
    name: song.name,
    hebrewName: song.hebrewName,
    description: song.description,
    createdAt: releaseTimestamp,
    updatedAt: releaseTimestamp,
    composition: {
      notes: song.notes,
      repeatMarkers: song.repeatMarkers,
      lyrics: song.lyrics,
    },
    settings: song.settings,
  };
}

// All default songs in order of release
// NOTE: Songs in src/lib/songs/_needs_redo/ are excluded until properly transcribed
const ALL_DEFAULT_SONGS: SongData[] = [
  dayenu,
  mashiachNow,
  didanNotzach,
  aniPurim,
  havdalah,
  vezakeniLegadel,
  adonOlam,
  adonOlamFull,
  hevenuShalom,
  alYedeyNigunim,
  chagPurim,
  maNishtana,
  omarRabbiAkiva,
];

// Generate default songs from individual song files
export function getDefaultSongs(): SavedSongsMap {
  const songs = ALL_DEFAULT_SONGS.map((song) => createSavedSong(song));
  return Object.fromEntries(songs.map((song) => [song.id, song]));
}

// Merge new default songs into existing saved songs
// This allows users to automatically receive new songs without resetting
export function mergeWithDefaults(existingSongs: SavedSongsMap): SavedSongsMap {
  const defaults = getDefaultSongs();
  const merged = { ...existingSongs };

  // Add any missing default songs
  for (const [id, song] of Object.entries(defaults)) {
    if (!(id in merged)) {
      merged[id] = song;
    }
  }

  return merged;
}

// Default song IDs for checking if defaults exist
export const DEFAULT_SONG_IDS = ALL_DEFAULT_SONGS.map((song) => song.id);
