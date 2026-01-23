// Eimati Ka'ati Mar (אימתי קאתי מר) - Chabad Niggun
// Key: G minor (2 flats), Time: 4/4, Tempo: 108
// Words: From the letter of the Baal Shem Tov, Melody: Yerushalmi
import { SongData } from "./types";

export const eimatiKaatiMar: SongData = {
  id: "default-eimati",
  name: "Eimati Ka'ati Mar",
  hebrewName: "אימתי קאתי מר",
  description: "מניגוני חב״ד. מילים: מתוך איגרת הבעל שם טוב. לחן: ירושלמי",
  notes: [
    // === SECTION A (Measures 1-4, beats 0-15) ===
    // M1: D7 chord - dotted pattern with F# accidentals
    { id: "eimati-0", pitch: "D5", duration: 0.75, absoluteBeat: 0 },
    { id: "eimati-1", pitch: "F#4", duration: 0.25, absoluteBeat: 0.75 },
    { id: "eimati-2", pitch: "G4", duration: 0.5, absoluteBeat: 1 },
    { id: "eimati-3", pitch: "A4", duration: 0.5, absoluteBeat: 1.5 },
    { id: "eimati-4", pitch: "G4", duration: 0.5, absoluteBeat: 2 },
    { id: "eimati-5", pitch: "F#4", duration: 0.5, absoluteBeat: 2.5 },
    { id: "eimati-6", pitch: "G4", duration: 1, absoluteBeat: 3 },

    // M2: D7 chord - similar pattern
    { id: "eimati-7", pitch: "D5", duration: 0.75, absoluteBeat: 4 },
    { id: "eimati-8", pitch: "F#4", duration: 0.25, absoluteBeat: 4.75 },
    { id: "eimati-9", pitch: "G4", duration: 0.5, absoluteBeat: 5 },
    { id: "eimati-10", pitch: "A4", duration: 0.5, absoluteBeat: 5.5 },
    { id: "eimati-11", pitch: "G4", duration: 0.5, absoluteBeat: 6 },
    { id: "eimati-12", pitch: "F#4", duration: 0.5, absoluteBeat: 6.5 },
    { id: "eimati-13", pitch: "G4", duration: 1, absoluteBeat: 7 },

    // M3: Eb chord - eighth rest + running eighths
    { id: "eimati-14", pitch: "Bb4", duration: 0.5, absoluteBeat: 8.5 },
    { id: "eimati-15", pitch: "A4", duration: 0.5, absoluteBeat: 9 },
    { id: "eimati-16", pitch: "G4", duration: 0.5, absoluteBeat: 9.5 },
    { id: "eimati-17", pitch: "Bb4", duration: 0.5, absoluteBeat: 10 },
    { id: "eimati-18", pitch: "A4", duration: 0.5, absoluteBeat: 10.5 },
    { id: "eimati-19", pitch: "G4", duration: 1, absoluteBeat: 11 },

    // M4: D7 chord - dotted pattern resolving
    { id: "eimati-20", pitch: "D5", duration: 0.75, absoluteBeat: 12 },
    { id: "eimati-21", pitch: "F#4", duration: 0.25, absoluteBeat: 12.75 },
    { id: "eimati-22", pitch: "G4", duration: 0.5, absoluteBeat: 13 },
    { id: "eimati-23", pitch: "A4", duration: 0.5, absoluteBeat: 13.5 },
    { id: "eimati-24", pitch: "G4", duration: 1, absoluteBeat: 14 },
    // rest at beat 15

    // === SECTION B (Measures 5-8, beats 16-31) - Half note section ===
    // M5: Gm chord - sustained half notes
    { id: "eimati-25", pitch: "G4", duration: 2, absoluteBeat: 16 },
    { id: "eimati-26", pitch: "D5", duration: 2, absoluteBeat: 18 },

    // M6: Gm chord - quarter note pattern
    { id: "eimati-27", pitch: "G4", duration: 1, absoluteBeat: 20 },
    { id: "eimati-28", pitch: "G4", duration: 1, absoluteBeat: 21 },
    { id: "eimati-29", pitch: "G4", duration: 1, absoluteBeat: 22 },
    { id: "eimati-30", pitch: "G4", duration: 1, absoluteBeat: 23 },

    // M7: D7 chord - ending phrase with F#
    { id: "eimati-31", pitch: "G4", duration: 1, absoluteBeat: 24 },
    { id: "eimati-32", pitch: "G4", duration: 1, absoluteBeat: 25 },
    { id: "eimati-33", pitch: "F#4", duration: 0.5, absoluteBeat: 26 },
    { id: "eimati-34", pitch: "G4", duration: 0.5, absoluteBeat: 26.5 },
    { id: "eimati-35", pitch: "A4", duration: 0.5, absoluteBeat: 27 },
    { id: "eimati-36", pitch: "G4", duration: 0.5, absoluteBeat: 27.5 },

    // M8: Gm chord - final cadence
    { id: "eimati-37", pitch: "F#4", duration: 0.5, absoluteBeat: 28 },
    { id: "eimati-38", pitch: "G4", duration: 0.5, absoluteBeat: 28.5 },
    { id: "eimati-39", pitch: "A4", duration: 0.5, absoluteBeat: 29 },
    { id: "eimati-40", pitch: "G4", duration: 0.5, absoluteBeat: 29.5 },
    { id: "eimati-41", pitch: "G4", duration: 2, absoluteBeat: 30 },
  ],
  repeatMarkers: [
    {
      id: "eimati-repeat-start",
      pairId: "eimati-repeat-a",
      type: "start",
      measureNumber: 0,
    },
    {
      id: "eimati-repeat-end",
      pairId: "eimati-repeat-a",
      type: "end",
      measureNumber: 4,
    },
    {
      id: "eimati-repeat-b-start",
      pairId: "eimati-repeat-b",
      type: "start",
      measureNumber: 4,
    },
    {
      id: "eimati-repeat-b-end",
      pairId: "eimati-repeat-b",
      type: "end",
      measureNumber: 8,
    },
  ],
  lyrics: [
    // "Ei-ma-ti ka-a-ti mar" syllables
    { text: "Ei", absoluteBeat: 0 },
    { text: "ma", absoluteBeat: 1 },
    { text: "ti", absoluteBeat: 3 },
    { text: "ka", absoluteBeat: 4 },
    { text: "a", absoluteBeat: 5 },
    { text: "ti", absoluteBeat: 7 },
    { text: "mar", absoluteBeat: 8.5 },
    // Section B
    { text: "Ei", absoluteBeat: 16 },
    { text: "ma", absoluteBeat: 18 },
    { text: "ti", absoluteBeat: 20 },
  ],
  settings: {
    tempo: 108,
    timeSignature: { numerator: 4, denominator: 4 },
  },
};
