// Hevenu Shalom Aleichem (הבאנו שלום עליכם)
// Key: F Major / D minor, Time: 4/4
// UPDATED: Now includes rests from MusicXML
import { SongData } from "./types";

export const hevenuShalomUpdated: SongData = {
  id: "default-hevenu-shalom-updated",
  name: "Hevenu Shalom Aleichem (Updated)",
  hebrewName: "הבאנו שלום עליכם",
  description: "שיר עברי מסורתי",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // VERSE 1 (Measures 1-8)
    // ═══════════════════════════════════════════════════════════════════
    { id: "hevenu-1", pitch: "A3", duration: 0.5, absoluteBeat: 0 },
    { id: "hevenu-2", pitch: "D4", duration: 0.5, absoluteBeat: 0.5 },
    { id: "hevenu-3", pitch: "F4", duration: 0.5, absoluteBeat: 1.0 },
    { id: "hevenu-4", pitch: "A4", duration: 2.0, absoluteBeat: 1.5 },
    { id: "hevenu-5", pitch: "F4", duration: 1.5, absoluteBeat: 3.5 },
    { id: "hevenu-6", pitch: "E4", duration: 0.5, absoluteBeat: 5.0 },
    { id: "hevenu-7", pitch: "E4", duration: 0.5, absoluteBeat: 5.5 },
    { id: "hevenu-8", pitch: "D4", duration: 1.5, absoluteBeat: 6.0 },
    { id: "hevenu-r1", pitch: "REST", duration: 0.5, absoluteBeat: 7.5 },
    { id: "hevenu-9", pitch: "D4", duration: 0.5, absoluteBeat: 8.0 },
    { id: "hevenu-10", pitch: "F4", duration: 0.5, absoluteBeat: 8.5 },
    { id: "hevenu-11", pitch: "A4", duration: 0.5, absoluteBeat: 9.0 },
    { id: "hevenu-12", pitch: "D5", duration: 2.0, absoluteBeat: 9.5 },
    { id: "hevenu-13", pitch: "Bb4", duration: 1.5, absoluteBeat: 11.5 },
    { id: "hevenu-14", pitch: "A4", duration: 0.5, absoluteBeat: 13.0 },
    { id: "hevenu-15", pitch: "A4", duration: 0.5, absoluteBeat: 13.5 },
    { id: "hevenu-16", pitch: "G4", duration: 1.5, absoluteBeat: 14.0 },
    { id: "hevenu-r2", pitch: "REST", duration: 0.5, absoluteBeat: 15.5 },
    { id: "hevenu-17", pitch: "G4", duration: 0.5, absoluteBeat: 16.0 },
    { id: "hevenu-18", pitch: "A4", duration: 0.5, absoluteBeat: 16.5 },
    { id: "hevenu-19", pitch: "Bb4", duration: 0.5, absoluteBeat: 17.0 },
    { id: "hevenu-20", pitch: "A4", duration: 1.5, absoluteBeat: 17.5 },
    { id: "hevenu-21", pitch: "E4", duration: 0.5, absoluteBeat: 19.0 },
    { id: "hevenu-22", pitch: "A4", duration: 1.5, absoluteBeat: 19.5 },
    { id: "hevenu-23", pitch: "G4", duration: 0.5, absoluteBeat: 21.0 },
    { id: "hevenu-24", pitch: "G4", duration: 0.5, absoluteBeat: 21.5 },
    { id: "hevenu-25", pitch: "F4", duration: 1.5, absoluteBeat: 22.0 },
    { id: "hevenu-r3", pitch: "REST", duration: 0.5, absoluteBeat: 23.5 },
    { id: "hevenu-26", pitch: "F4", duration: 0.5, absoluteBeat: 24.0 },
    { id: "hevenu-27", pitch: "E4", duration: 0.5, absoluteBeat: 24.5 },
    { id: "hevenu-28", pitch: "D4", duration: 0.5, absoluteBeat: 25.0 },
    { id: "hevenu-29", pitch: "A4", duration: 1.0, absoluteBeat: 25.5 },
    { id: "hevenu-30", pitch: "A4", duration: 1.0, absoluteBeat: 26.5 },
    { id: "hevenu-31", pitch: "A4", duration: 1.0, absoluteBeat: 27.5 },
    { id: "hevenu-32", pitch: "A4", duration: 1.0, absoluteBeat: 28.5 },
    { id: "hevenu-33", pitch: "A4", duration: 0.75, absoluteBeat: 29.5 },
    { id: "hevenu-34", pitch: "G4", duration: 0.25, absoluteBeat: 30.25 },
    { id: "hevenu-35", pitch: "F4", duration: 0.5, absoluteBeat: 30.5 },
    { id: "hevenu-36", pitch: "E4", duration: 0.5, absoluteBeat: 31.0 },
    { id: "hevenu-37", pitch: "D4", duration: 0.5, absoluteBeat: 31.5 },

    // ═══════════════════════════════════════════════════════════════════
    // VERSE 2 (Measures 9-17) - Repeat of melody
    // ═══════════════════════════════════════════════════════════════════
    { id: "hevenu-38", pitch: "A3", duration: 0.5, absoluteBeat: 32.0 },
    { id: "hevenu-39", pitch: "D4", duration: 0.5, absoluteBeat: 32.5 },
    { id: "hevenu-40", pitch: "F4", duration: 0.5, absoluteBeat: 33.0 },
    { id: "hevenu-41", pitch: "A4", duration: 2.0, absoluteBeat: 33.5 },
    { id: "hevenu-42", pitch: "F4", duration: 1.5, absoluteBeat: 35.5 },
    { id: "hevenu-43", pitch: "E4", duration: 0.5, absoluteBeat: 37.0 },
    { id: "hevenu-44", pitch: "E4", duration: 0.5, absoluteBeat: 37.5 },
    { id: "hevenu-45", pitch: "D4", duration: 1.5, absoluteBeat: 38.0 },
    { id: "hevenu-r4", pitch: "REST", duration: 0.5, absoluteBeat: 39.5 },
    { id: "hevenu-46", pitch: "D4", duration: 0.5, absoluteBeat: 40.0 },
    { id: "hevenu-47", pitch: "F4", duration: 0.5, absoluteBeat: 40.5 },
    { id: "hevenu-48", pitch: "A4", duration: 0.5, absoluteBeat: 41.0 },
    { id: "hevenu-49", pitch: "D5", duration: 2.0, absoluteBeat: 41.5 },
    { id: "hevenu-50", pitch: "Bb4", duration: 1.5, absoluteBeat: 43.5 },
    { id: "hevenu-51", pitch: "A4", duration: 0.5, absoluteBeat: 45.0 },
    { id: "hevenu-52", pitch: "A4", duration: 0.5, absoluteBeat: 45.5 },
    { id: "hevenu-53", pitch: "G4", duration: 1.5, absoluteBeat: 46.0 },
    { id: "hevenu-r5", pitch: "REST", duration: 0.5, absoluteBeat: 47.5 },
    { id: "hevenu-54", pitch: "G4", duration: 0.5, absoluteBeat: 48.0 },
    { id: "hevenu-55", pitch: "A4", duration: 0.5, absoluteBeat: 48.5 },
    { id: "hevenu-56", pitch: "Bb4", duration: 0.5, absoluteBeat: 49.0 },
    { id: "hevenu-57", pitch: "A4", duration: 1.5, absoluteBeat: 49.5 },
    { id: "hevenu-58", pitch: "E4", duration: 0.5, absoluteBeat: 51.0 },
    { id: "hevenu-59", pitch: "A4", duration: 1.5, absoluteBeat: 51.5 },
    { id: "hevenu-60", pitch: "G4", duration: 0.5, absoluteBeat: 53.0 },
    { id: "hevenu-61", pitch: "G4", duration: 0.5, absoluteBeat: 53.5 },
    { id: "hevenu-62", pitch: "F4", duration: 1.5, absoluteBeat: 54.0 },
    { id: "hevenu-r6", pitch: "REST", duration: 0.5, absoluteBeat: 55.5 },
    { id: "hevenu-63", pitch: "F4", duration: 0.5, absoluteBeat: 56.0 },
    { id: "hevenu-64", pitch: "E4", duration: 0.5, absoluteBeat: 56.5 },
    { id: "hevenu-65", pitch: "D4", duration: 0.5, absoluteBeat: 57.0 },
    { id: "hevenu-66", pitch: "A4", duration: 1.0, absoluteBeat: 57.5 },
    { id: "hevenu-67", pitch: "A4", duration: 1.0, absoluteBeat: 58.5 },
    { id: "hevenu-68", pitch: "A4", duration: 1.0, absoluteBeat: 59.5 },
    { id: "hevenu-69", pitch: "A4", duration: 1.0, absoluteBeat: 60.5 },
    { id: "hevenu-70", pitch: "A4", duration: 0.75, absoluteBeat: 61.5 },
    { id: "hevenu-71", pitch: "G4", duration: 0.25, absoluteBeat: 62.25 },
    { id: "hevenu-72", pitch: "F4", duration: 0.5, absoluteBeat: 62.5 },
    { id: "hevenu-73", pitch: "E4", duration: 0.5, absoluteBeat: 63.0 },
    { id: "hevenu-74", pitch: "D4", duration: 0.5, absoluteBeat: 63.5 },
  ],

  repeatMarkers: [],

  lyrics: [],

  settings: {
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,
  },

  releaseDate: "2026-02-03",

  transcriptionNotes: {
    original: {
      key: "F Major / D minor",
      timeSignature: "4/4",
      features: [
        "Traditional Hebrew song",
        "Melody repeats twice",
        "Pickup notes at start",
        "6 rests added from MusicXML source",
      ],
    },
    changes: [
      {
        what: "Added 6 rests from MusicXML extraction",
        why: "Original sheet music has rests that were missing from first transcription",
      },
    ],
    sources: {
      sheetMusic: "hevenu-shalom-alechem.mxl from MuseScore",
    },
    transcribedDate: "2026-02-04",
  },
};
