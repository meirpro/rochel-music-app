// Ani'm Zemirot (אנעים זמירות) - Chabad Niggun
// Key: G minor (2 flats), Time: 4/4, Tempo: 120
// Source: Chabad Niggunim
import { SongData } from "./types";

export const animZemirot: SongData = {
  id: "default-anim",
  name: "Ani'm Zemirot",
  hebrewName: "אנעים זמירות",
  description: "ניגון חב״ד",
  notes: [
    // Pickup measure (starts at beat 3.5)
    { id: "anim-0", pitch: "G4", duration: 0.5, absoluteBeat: 3.5 },

    // Measure 1 (beats 4-7)
    { id: "anim-1", pitch: "D5", duration: 0.5, absoluteBeat: 4.5 },
    { id: "anim-2", pitch: "Eb5", duration: 1, absoluteBeat: 5 },
    { id: "anim-3", pitch: "D5", duration: 0.5, absoluteBeat: 6 },
    { id: "anim-4", pitch: "C5", duration: 0.5, absoluteBeat: 6.5 },
    { id: "anim-5", pitch: "Bb4", duration: 0.5, absoluteBeat: 7 },
    { id: "anim-6", pitch: "C5", duration: 0.5, absoluteBeat: 7.5 },

    // Measure 2 (beats 8-11)
    { id: "anim-7", pitch: "D5", duration: 1.5, absoluteBeat: 8 },
    { id: "anim-8", pitch: "C5", duration: 0.5, absoluteBeat: 9.5 },
    { id: "anim-9", pitch: "Bb4", duration: 0.5, absoluteBeat: 10 },
    { id: "anim-10", pitch: "C5", duration: 0.5, absoluteBeat: 10.5 },
    { id: "anim-11", pitch: "D5", duration: 0.5, absoluteBeat: 11 },
    { id: "anim-12", pitch: "Eb5", duration: 0.5, absoluteBeat: 11.5 },

    // Measure 3 (beats 12-15)
    { id: "anim-13", pitch: "D5", duration: 0.5, absoluteBeat: 12.5 },
    { id: "anim-14", pitch: "Eb5", duration: 1, absoluteBeat: 13 },
    { id: "anim-15", pitch: "D5", duration: 0.5, absoluteBeat: 14 },
    { id: "anim-16", pitch: "C5", duration: 0.5, absoluteBeat: 14.5 },
    { id: "anim-17", pitch: "Bb4", duration: 0.5, absoluteBeat: 15 },
    { id: "anim-18", pitch: "C5", duration: 0.5, absoluteBeat: 15.5 },

    // Measure 4 (beats 16-19)
    { id: "anim-19", pitch: "D5", duration: 1, absoluteBeat: 16 },
    { id: "anim-20", pitch: "G4", duration: 1, absoluteBeat: 17 },
    { id: "anim-21", pitch: "G4", duration: 1, absoluteBeat: 18 },
    { id: "anim-22", pitch: "G4", duration: 1, absoluteBeat: 19 },
  ],
  repeatMarkers: [
    {
      id: "anim-repeat-start",
      pairId: "anim-repeat",
      type: "start",
      measureNumber: 1,
    },
    {
      id: "anim-repeat-end",
      pairId: "anim-repeat",
      type: "end",
      measureNumber: 5,
    },
  ],
  lyrics: [
    { text: "A", absoluteBeat: 3.5 },
    { text: "ni'm", absoluteBeat: 4.5 },
    { text: "ze", absoluteBeat: 5 },
    { text: "mi", absoluteBeat: 6.5 },
    { text: "rot", absoluteBeat: 8 },
  ],
  settings: {
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
  },
};
