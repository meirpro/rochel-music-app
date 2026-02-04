/**
 * Song Library Exports
 *
 * For adding new songs, edit registry.ts (single source of truth).
 * This file re-exports everything for backwards compatibility.
 */

// Re-export the registry (preferred way to get all songs)
export { SONG_REGISTRY } from "./registry";

// Individual song exports (for backwards compatibility)
export { dayenu } from "./dayenu";
export { mashiachNow } from "./mashiachNow";
export { didanNotzach } from "./didanNotzach";
export { aniPurim } from "./aniPurim";
export { havdalah } from "./havdalah";
export { vezakeniLegadel } from "./vezakeniLegadel";
export { adonOlam } from "./adonOlam";
export { adonOlamFull } from "./adonOlamFull";
export { hevenuShalom } from "./hevenuShalom";
export { alYedeyNigunim } from "./alYedeyNigunim";
export { chagPurim } from "./chagPurim";
export { maNishtana } from "./maNishtana";
export { omarRabbiAkiva } from "./omarRabbiAkiva";
export { drorYikra } from "./drorYikra";
export { ochilaLakel } from "./ochilaLakel";
export { shevetAchim } from "./shevetAchim";
export { sheHashemesh } from "./sheHashemesh";
// yeshBiOdKoach moved to _needs_redo/ - requires chords to sound correct

// Updated versions with REST notes from MusicXML
export { hevenuShalomUpdated } from "./hevenuShalomUpdated";
export { sheHashemeshUpdated } from "./sheHashemeshUpdated";
export { shevetAchimUpdated } from "./shevetAchimUpdated";
export { ochilaLakelUpdated } from "./ochilaLakelUpdated";
export { omarRabbiAkivaUpdated } from "./omarRabbiAkivaUpdated";
export { yeshBiOdKoachUpdated } from "./yeshBiOdKoachUpdated";

// Re-export types
export type { SongData } from "./types";
