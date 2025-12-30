import { Song } from "../types";
import { dayenu, dayenuSections } from "./dayenu";
import { mashiachNow, mashiachNowSections } from "./mashiach-now";

// All available songs
export const SONGS: Song[] = [dayenu, mashiachNow];

// Get list of all songs (for dropdown)
export function getSongList(): {
  id: string;
  title: string;
  hebrewTitle?: string;
}[] {
  return SONGS.map((s) => ({
    id: s.id,
    title: s.title,
    hebrewTitle: s.hebrewTitle,
  }));
}

// Get a song by ID
export function getSongById(id: string): Song | undefined {
  // Check for section-specific versions
  if (id.startsWith("dayenu")) {
    if (id === "dayenu-a") return dayenuSections.A;
    if (id === "dayenu-b") return dayenuSections.B;
    return dayenu;
  }
  if (id.startsWith("mashiach")) {
    if (id === "mashiach-verse") return mashiachNowSections.VERSE;
    if (id === "mashiach-chorus") return mashiachNowSections.CHORUS;
    return mashiachNow;
  }
  return SONGS.find((s) => s.id === id);
}

// Export sections for use in UI
export { dayenuSections, mashiachNowSections };
