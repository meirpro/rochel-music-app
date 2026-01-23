// Avinu Malkenu (אבינו מלכנו) - Chabad Niggun
// Key: Eb major (3 flats), Time: 3/4 → 4/4, Tempo: 96
// By the Alter Rebbe, words from prayer
import { SongData } from "./types";

export const avinuMalkenu: SongData = {
  id: "default-avinu",
  name: "Avinu Malkenu",
  hebrewName: "אבינו מלכנו",
  description: "ניגון מאדמו״ר הזקן. מילים: מהתפילה",
  notes: [
    // Pickup measure (starts at beat 2 in 3/4)
    { id: "avinu-0", pitch: "G4", duration: 0.75, absoluteBeat: 2 },
    { id: "avinu-1", pitch: "Bb4", duration: 0.25, absoluteBeat: 2.75 },

    // Measure 1 (beats 3-5, 3/4 time)
    { id: "avinu-2", pitch: "G4", duration: 0.75, absoluteBeat: 3 },
    { id: "avinu-3", pitch: "Eb5", duration: 0.25, absoluteBeat: 3.75 },
    { id: "avinu-4", pitch: "D5", duration: 0.5, absoluteBeat: 4 },
    { id: "avinu-5", pitch: "C5", duration: 0.5, absoluteBeat: 4.5 },
    { id: "avinu-6", pitch: "Bb4", duration: 1, absoluteBeat: 5 },

    // Measure 2 (beats 6-8)
    { id: "avinu-7", pitch: "Bb4", duration: 0.5, absoluteBeat: 6 },
    { id: "avinu-8", pitch: "G4", duration: 0.75, absoluteBeat: 6.5 },
    { id: "avinu-9", pitch: "Bb4", duration: 0.25, absoluteBeat: 7.25 },
    { id: "avinu-10", pitch: "C5", duration: 0.5, absoluteBeat: 7.5 },
    { id: "avinu-11", pitch: "Bb4", duration: 1, absoluteBeat: 8 },

    // Measure 3 (beats 9-11) - has rest
    { id: "avinu-12", pitch: "Bb4", duration: 0.5, absoluteBeat: 9 },
    { id: "avinu-13", pitch: "Bb4", duration: 0.75, absoluteBeat: 10.5 },
    { id: "avinu-14", pitch: "C5", duration: 0.25, absoluteBeat: 11.25 },

    // Measure 4 (beats 12-14)
    { id: "avinu-15", pitch: "Bb4", duration: 0.75, absoluteBeat: 12 },
    { id: "avinu-16", pitch: "Eb5", duration: 0.25, absoluteBeat: 12.75 },
    { id: "avinu-17", pitch: "D5", duration: 0.5, absoluteBeat: 13 },
    { id: "avinu-18", pitch: "C5", duration: 0.5, absoluteBeat: 13.5 },
    { id: "avinu-19", pitch: "Bb4", duration: 1, absoluteBeat: 14 },

    // Measure 5 (beats 15-17)
    { id: "avinu-20", pitch: "G4", duration: 0.5, absoluteBeat: 15 },
    { id: "avinu-21", pitch: "Bb4", duration: 0.75, absoluteBeat: 15.5 },
    { id: "avinu-22", pitch: "C5", duration: 0.25, absoluteBeat: 16.25 },
    { id: "avinu-23", pitch: "Bb4", duration: 0.5, absoluteBeat: 16.5 },
    { id: "avinu-24", pitch: "G4", duration: 1, absoluteBeat: 17 },

    // Measure 6 (beats 18-20) - ends with rests
    { id: "avinu-25", pitch: "G4", duration: 0.5, absoluteBeat: 18 },

    // TIME SIGNATURE CHANGE TO 4/4
    // Measure 7 (beats 21-24)
    { id: "avinu-26", pitch: "Bb4", duration: 0.75, absoluteBeat: 21 },
    { id: "avinu-27", pitch: "C5", duration: 0.25, absoluteBeat: 21.75 },
    { id: "avinu-28", pitch: "Bb4", duration: 0.75, absoluteBeat: 22 },
    { id: "avinu-29", pitch: "Eb5", duration: 0.25, absoluteBeat: 22.75 },
    { id: "avinu-30", pitch: "D5", duration: 0.5, absoluteBeat: 23 },
    { id: "avinu-31", pitch: "C5", duration: 0.5, absoluteBeat: 23.5 },
    { id: "avinu-32", pitch: "Bb4", duration: 0.5, absoluteBeat: 24 },
    { id: "avinu-33", pitch: "C5", duration: 0.5, absoluteBeat: 24.5 },

    // Measure 8 (beats 25-28)
    { id: "avinu-34", pitch: "Bb4", duration: 0.75, absoluteBeat: 25 },
    { id: "avinu-35", pitch: "Eb5", duration: 0.25, absoluteBeat: 25.75 },
    { id: "avinu-36", pitch: "D5", duration: 0.5, absoluteBeat: 26 },
    { id: "avinu-37", pitch: "C5", duration: 0.5, absoluteBeat: 26.5 },
    { id: "avinu-38", pitch: "Bb4", duration: 1, absoluteBeat: 27 },
  ],
  repeatMarkers: [],
  lyrics: [
    { text: "A", absoluteBeat: 2 },
    { text: "vi", absoluteBeat: 2.75 },
    { text: "nu", absoluteBeat: 3 },
    { text: "mal", absoluteBeat: 6 },
    { text: "ke", absoluteBeat: 6.5 },
    { text: "nu", absoluteBeat: 8 },
  ],
  settings: {
    tempo: 96,
    timeSignature: { numerator: 3, denominator: 4 },
  },
};
