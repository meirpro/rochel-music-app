import { SavedSong, SavedSongsMap } from "./types";
import { SONG_REGISTRY, SongData } from "./songs/registry";

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
      voltaBrackets: song.voltaBrackets ?? [],
      lyrics: song.lyrics,
    },
    settings: song.settings,
  };
}

// Generate default songs from the registry
export function getDefaultSongs(): SavedSongsMap {
  const songs = SONG_REGISTRY.map((song) => createSavedSong(song));
  return Object.fromEntries(songs.map((song) => [song.id, song]));
}

// Merge default songs into existing saved songs
// - Adds any missing default songs
// - Updates existing default songs with latest versions (fixes, new features like voltas)
// - Preserves user-created songs (non-default IDs)
export function mergeWithDefaults(existingSongs: SavedSongsMap): SavedSongsMap {
  const defaults = getDefaultSongs();
  const merged = { ...existingSongs };

  // Add or update all default songs
  for (const [id, song] of Object.entries(defaults)) {
    merged[id] = song;
  }

  return merged;
}

// Default song IDs for checking if defaults exist
export const DEFAULT_SONG_IDS = SONG_REGISTRY.map((song) => song.id);
