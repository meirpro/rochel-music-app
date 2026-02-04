/**
 * Song Registry - Single source of truth for all active songs
 *
 * ADDING A NEW SONG:
 * 1. Create your song file: songs/mySong.ts
 * 2. Import it here and add to SONG_REGISTRY
 *
 * That's it! No other files need to be modified.
 *
 * The registry is divided into categories for organization,
 * but all songs are combined into a single array for export.
 */

import type { SongData } from "./types";

// ═══════════════════════════════════════════════════════════════════
// STANDARD SONGS (original transcriptions)
// ═══════════════════════════════════════════════════════════════════
import { dayenu } from "./dayenu";
import { mashiachNow } from "./mashiachNow";
import { didanNotzach } from "./didanNotzach";
import { aniPurim } from "./aniPurim";
import { havdalah } from "./havdalah";
import { vezakeniLegadel } from "./vezakeniLegadel";
import { adonOlam } from "./adonOlam";
import { adonOlamFull } from "./adonOlamFull";
import { hevenuShalom } from "./hevenuShalom";
import { alYedeyNigunim } from "./alYedeyNigunim";
import { chagPurim } from "./chagPurim";
import { maNishtana } from "./maNishtana";
import { omarRabbiAkiva } from "./omarRabbiAkiva";
import { drorYikra } from "./drorYikra";
import { ochilaLakel } from "./ochilaLakel";
import { sheHashemesh } from "./sheHashemesh";

// ═══════════════════════════════════════════════════════════════════
// UPDATED SONGS (with REST notes from MusicXML extraction)
// ═══════════════════════════════════════════════════════════════════
import { hevenuShalomUpdated } from "./hevenuShalomUpdated";
import { sheHashemeshUpdated } from "./sheHashemeshUpdated";
import { shevetAchimUpdated } from "./shevetAchimUpdated";
import { ochilaLakelUpdated } from "./ochilaLakelUpdated";
import { omarRabbiAkivaUpdated } from "./omarRabbiAkivaUpdated";
import { yeshBiOdKoachUpdated } from "./yeshBiOdKoachUpdated";

// ═══════════════════════════════════════════════════════════════════
// SONG REGISTRY - Add new songs here!
// ═══════════════════════════════════════════════════════════════════

/**
 * All active songs in the app, in order of release.
 * Songs in _needs_redo/ are excluded until properly transcribed.
 */
export const SONG_REGISTRY: SongData[] = [
  // Original transcriptions
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
  drorYikra,
  ochilaLakel,
  sheHashemesh,
  // Updated versions with REST notes from MusicXML
  hevenuShalomUpdated,
  sheHashemeshUpdated,
  shevetAchimUpdated,
  ochilaLakelUpdated,
  omarRabbiAkivaUpdated,
  yeshBiOdKoachUpdated,
];

// Re-export for convenience
export { type SongData };
