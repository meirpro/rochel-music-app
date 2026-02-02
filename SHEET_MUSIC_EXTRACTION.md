# Sheet Music Extraction Guide

A comprehensive guide for transcribing sheet music PDFs into the Rochel Music App format, based on lessons learned from transcribing Ani Purim and other songs.

---

## Quick Start Checklist

Before starting extraction:
- [ ] Identify the key signature (sharps/flats)
- [ ] Identify the time signature
- [ ] Note any repeat signs, volta brackets, D.C./D.S. markers
- [ ] Check for pickup beats (anacrusis)
- [ ] Plan transposition if needed (target: C Major or A minor)

---

## Phase 1: Sheet Music Analysis

### 1.1 Identify Key Signature

| Original Key | Accidentals | Transpose To | Interval |
|--------------|-------------|--------------|----------|
| C Major | None | C Major | - |
| G Major | 1♯ (F#) | C Major or G Major | Down P5 or stay |
| D Major | 2♯ (F#, C#) | C Major | Down M2 |
| F Major | 1♭ (Bb) | C Major or F Major | Up P4 or stay |
| Bb Major | 2♭ (Bb, Eb) | C Major | Up M2 |
| A minor | None | A minor | - |
| E minor | 1♯ (F#) | A minor or E minor | Down P5 or stay |
| D minor | 1♭ (Bb) | A minor | Down P4 |
| G minor | 2♭ (Bb, Eb) | E minor | Down m3 |

**App-friendly keys:** C Major, A minor, E minor, G Major (no/minimal accidentals)

### 1.2 Identify Time Signature

Check the beginning of the staff for:
- **4/4** (or C): 4 beats per measure
- **3/4**: 3 beats per measure (waltz)
- **2/4**: 2 beats per measure (march)
- **6/8**: 6 eighth notes per measure (compound duple)

### 1.3 Identify Structural Elements

Look for these music notation elements:

| Element | Symbol | App Support | Workaround |
|---------|--------|-------------|------------|
| Repeat signs | :‖ ‖: | ✅ Yes | - |
| Volta brackets | 1. 2. | ❌ No | Linearize (write out both passes) |
| D.C. (Da Capo) | D.C. | ❌ No | Linearize (copy from beginning) |
| D.S. (Dal Segno) | D.S. 𝄋 | ❌ No | Linearize |
| Coda | 𝄌 | ❌ No | Linearize |
| Pickup beat | Partial first measure | ✅ Hack | Place at fractional beat |

### 1.4 Count Measures and Plan Structure

Before extracting notes:
1. Number all measures in the PDF (write on the sheet!)
2. Map PDF measure numbers to app absoluteBeat positions
3. Identify repeated sections and plan how to linearize

**Example from Ani Purim:**
```
PDF Structure:
  Pickup (1 beat) + M1-M4 with repeat + volta 1 + volta 2 + M6-M13

App Structure (linearized):
  Pickup (beat 3) → M2-M5 (beats 4-19) →
  M2-M5 repeat (beats 20-35) → M6-M13 (beats 36-67)
```

---

## Phase 2: Note Extraction

### 2.1 Duration Values

| Note Type | Symbol | Duration Value | In 4/4 |
|-----------|--------|----------------|--------|
| Whole | 𝅝 | `4` | 4 beats |
| Dotted half | 𝅗𝅥. | `3` | 3 beats |
| Half | 𝅗𝅥 | `2` | 2 beats |
| Dotted quarter | ♩. | `1.5` | 1.5 beats |
| Quarter | ♩ | `1` | 1 beat |
| Dotted eighth | ♪. | `0.75` | 0.75 beat |
| Eighth | ♪ | `0.5` | 0.5 beat |
| Sixteenth | 𝅘𝅥𝅯 | `0.25` | 0.25 beat |

### 2.2 Pitch Notation

Use scientific pitch notation: **NoteName + Octave**

| Staff Position | Pitch | Common Uses |
|----------------|-------|-------------|
| Ledger line below | C4 | Middle C |
| Bottom space | D4 | |
| Bottom line (Line 5) | E4 | |
| 2nd space | F4 | |
| Line 4 | G4 | Treble clef anchor |
| 3rd space | A4 | A440 tuning pitch |
| Middle line (Line 3) | B4 | |
| 4th space | C5 | One octave above middle C |
| Line 2 | D5 | |
| Top space | E5 | |
| Top line (Line 1) | F5 | |

**Accidentals:**
- Sharp: Add `#` → `F#4`, `C#5`
- Flat: Add `b` → `Bb4`, `Eb4`

### 2.3 absoluteBeat Calculation

**Formula:**
```
absoluteBeat = (measureIndex × beatsPerMeasure) + beatWithinMeasure
```

**Important:** Both are 0-indexed!
- Measure 1 = measureIndex 0
- Beat 1 = beatWithinMeasure 0

**Example in 4/4:**
| Position | absoluteBeat |
|----------|--------------|
| M1, beat 1 | 0 |
| M1, beat 2 | 1 |
| M1, beat 2.5 (eighth on "and") | 1.5 |
| M1, beat 4 | 3 |
| M2, beat 1 | 4 |
| M3, beat 3 | 10 |

### 2.4 Pickup Beat Handling

If the song starts with an incomplete measure (pickup/anacrusis):

1. **Identify how many beats** in the pickup
2. **Calculate starting absoluteBeat:**
   ```
   startBeat = beatsPerMeasure - pickupBeats
   ```

**Example:** 4/4 time with 1-beat pickup
- Pickup note goes at `absoluteBeat: 3` (not 0!)
- First full measure starts at `absoluteBeat: 4`

```typescript
// Ani Purim: 1-beat pickup in 4/4
{ id: "ap-1", pitch: "G4", duration: 1, absoluteBeat: 3 }, // pickup
{ id: "ap-2", pitch: "C5", duration: 1, absoluteBeat: 4 }, // M1, beat 1
```

---

## Phase 3: Handling Repeats and Form

### 3.1 Simple Repeats (Supported)

Use `repeatMarkers` array:

```typescript
repeatMarkers: [
  { id: "r-start", pairId: "main-repeat", type: "start", measureNumber: 0 },
  { id: "r-end", pairId: "main-repeat", type: "end", measureNumber: 8 },
]
```

### 3.2 Volta Brackets (Not Supported - Linearize!)

When you see numbered endings like [1.___] [2.___]:

**Instead of:**
```
M1-M4 :| [1. M5] :| [2. M6]
```

**Write out:**
```
M1-M4 + M5 (volta 1) + M1-M4 + M6 (volta 2)
```

**Example from Ani Purim:**
```typescript
// A SECTION - FIRST PASS (volta 1)
{ id: "ap-14", pitch: "E4", duration: 0.5, absoluteBeat: 16 },
{ id: "ap-15", pitch: "F4", duration: 0.5, absoluteBeat: 16.5 },
{ id: "ap-16", pitch: "G4", duration: 2, absoluteBeat: 17 },
{ id: "ap-17", pitch: "G4", duration: 1, absoluteBeat: 19 }, // pickup

// A SECTION - SECOND PASS (volta 2) - repeat M1-M3, then different ending
{ id: "ap-18", pitch: "C5", duration: 1, absoluteBeat: 20 },
// ... full repeat of measures ...
{ id: "ap-30", pitch: "E4", duration: 0.5, absoluteBeat: 32 },
{ id: "ap-31", pitch: "D4", duration: 0.5, absoluteBeat: 32.5 },
{ id: "ap-32", pitch: "C4", duration: 2, absoluteBeat: 33 }, // different ending!
```

### 3.3 D.C. / D.S. / Coda (Not Supported - Linearize!)

Write out the full playback order as sequential notes.

**D.C. al Fine example:**
```
Original: A section → B section → D.C. al Fine (back to A, end at Fine)
Linearized: A section → B section → A section again
```

---

## Phase 4: Lyrics Extraction

### 4.1 LyricSyllable Structure

```typescript
interface LyricSyllable {
  text: string;         // The syllable
  absoluteBeat: number; // Must match a note's absoluteBeat
}
```

### 4.2 Syllable Alignment Rules

1. **One syllable per note** - align with the note's absoluteBeat
2. **Split words at natural syllable breaks:**
   - "Purim" → "Pu" + "rim"
   - "Sameach" → "Sa" + "me" + "ach"
3. **Hyphenated words:** Keep hyphen with preceding syllable
4. **Melisma** (multiple notes on one syllable): Only first note gets text

### 4.3 Handling Repeated Sections with Different Lyrics

When lyrics change on repeat (verses), align each verse's lyrics with the corresponding pass through the notes.

**Example from Ani Purim:**
```typescript
lyrics: [
  // VERSE 1 (volta 1)
  { text: "A", absoluteBeat: 3 },
  { text: "ni", absoluteBeat: 4 },
  { text: "Pu", absoluteBeat: 5 },
  { text: "rim,", absoluteBeat: 6 },
  // ...

  // VERSE 2 (volta 2) - same melody, different words
  { text: "Ha", absoluteBeat: 19 },
  { text: "lo", absoluteBeat: 20 },
  { text: "rak", absoluteBeat: 21 },
  // ...

  // CHORUS (B section)
  { text: "La", absoluteBeat: 36 },
  { text: "la", absoluteBeat: 38 },
  // ...
]
```

---

## Phase 5: Transposition

### 5.1 Transposition Table

When transposing, shift every note by the same interval:

**D minor → A minor (down a 4th):**
| Original | Transposed |
|----------|------------|
| D | A |
| E | B |
| F | C |
| G | D |
| A | E |
| Bb | F (natural!) |
| C | G |

**Bb Major → C Major (up a whole step):**
| Original | Transposed |
|----------|------------|
| Bb | C |
| C | D |
| D | E |
| Eb | F (natural!) |
| F | G |
| G | A |
| A | B |

### 5.2 Octave Adjustments

After transposing, check that all notes fall within the app's range: **C3 to C6**

If notes go too high or low, shift entire song up/down an octave.

---

## Phase 6: Documentation

### 6.1 TranscriptionNotes Structure

Always document what was changed from the original:

```typescript
transcriptionNotes: {
  original: {
    key: "D minor",
    timeSignature: "4/4",
    features: [
      "pickup beat (anacrusis)",
      "volta brackets (1st/2nd endings)",
      "D.C. al Fine",
    ],
  },
  changes: [
    {
      what: "Transposed from D minor to A minor",
      why: "App uses natural note keys (no key signatures)"
    },
    {
      what: "Linearized volta brackets",
      why: "App doesn't support volta - wrote out both passes explicitly"
    },
    {
      what: "Pickup beat at absoluteBeat 3",
      why: "App doesn't support anacrusis - placed in full first measure"
    },
  ],
  sources: {
    sheetMusic: "https://israelinote.com/song/...",
    lyrics: "https://www.hebrewsongs.com/?song=..."
  },
  transcribedDate: "2026-02-02"
}
```

---

## Common Mistakes to Avoid

### ❌ Wrong absoluteBeat calculation
```typescript
// WRONG: Treating measure 1 as index 1
{ absoluteBeat: 4 }  // This is M2, beat 1, not M1, beat 4!

// CORRECT: Measures are 0-indexed
{ absoluteBeat: 3 }  // M1 (index 0), beat 4 (index 3)
```

### ❌ Forgetting pickup beat offset
```typescript
// WRONG: Starting pickup at beat 0
{ id: "pickup", absoluteBeat: 0 }

// CORRECT: Pickup in 4/4 with 1-beat pickup
{ id: "pickup", absoluteBeat: 3 }  // Beat 4 of "measure 0"
```

### ❌ Not accounting for linearized repeats
```typescript
// WRONG: Lyrics for verse 2 at same beats as verse 1
lyrics: [
  { text: "First", absoluteBeat: 0 },
  { text: "Second", absoluteBeat: 0 },  // Conflict!
]

// CORRECT: Verse 2 aligned with second pass of notes
lyrics: [
  { text: "First", absoluteBeat: 0 },   // Verse 1, pass 1
  { text: "Second", absoluteBeat: 16 }, // Verse 2, pass 2
]
```

### ❌ Misaligning eighth notes
```typescript
// WRONG: Eighth notes on integer beats only
{ absoluteBeat: 1 },
{ absoluteBeat: 2 },

// CORRECT: Eighth notes on half-beats
{ absoluteBeat: 1 },
{ absoluteBeat: 1.5 },
{ absoluteBeat: 2 },
{ absoluteBeat: 2.5 },
```

---

## Validation Checklist

Before adding a new song:

- [ ] All `id` values are unique (use pattern: `{songSlug}-{index}`)
- [ ] `absoluteBeat` values are in ascending order
- [ ] Sum of durations per measure equals time signature (4 for 4/4, 3 for 3/4)
- [ ] Pitches are in valid range (C3-C6)
- [ ] No accidentals outside the transposed key (unless intentional)
- [ ] Lyrics align with note positions (matching absoluteBeat values)
- [ ] Repeat markers have matching start/end pairs
- [ ] `transcriptionNotes` documents all changes from original

---

## File Template

```typescript
// {SongName} ({HebrewName}) - {Genre/Artist}
// Key: {Key}, Time: {TimeSignature}, Tempo: {Tempo}
// Words: {Lyricist}, Music: {Composer}
import { SongData } from "./types";

export const {camelCaseName}: SongData = {
  id: "default-{kebab-case-name}",
  name: "{Song Name}",
  hebrewName: "{שם השיר}",
  description: "{Brief description in Hebrew}",
  notes: [
    // ═══════════════════════════════════════════════════════════════════
    // SECTION NAME
    // ═══════════════════════════════════════════════════════════════════
    { id: "{slug}-1", pitch: "C4", duration: 1, absoluteBeat: 0 },
    // ... more notes
  ],

  repeatMarkers: [
    // Add if song has repeats
  ],

  lyrics: [
    // ═══════════════════════════════════════════════════════════════════
    // VERSE 1
    // ═══════════════════════════════════════════════════════════════════
    { text: "First", absoluteBeat: 0 },
    // ... more lyrics
  ],

  settings: {
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
  },

  releaseDate: "2026-02-02",

  transcriptionNotes: {
    original: {
      key: "Original Key",
      timeSignature: "4/4",
      features: ["list", "of", "features"],
    },
    changes: [
      {
        what: "Description of change",
        why: "Reason for change"
      },
    ],
    sources: {
      sheetMusic: "https://...",
      lyrics: "https://..."
    },
    transcribedDate: "2026-02-02"
  },
};
```

---

## Quick Reference Card

### Duration Values
| whole | dotted half | half | dotted quarter | quarter | dotted eighth | eighth | sixteenth |
|-------|-------------|------|----------------|---------|---------------|--------|-----------|
| 4 | 3 | 2 | 1.5 | 1 | 0.75 | 0.5 | 0.25 |

### Treble Clef Pitches (bottom to top)
```
      F5 ─── Line 1 (top)
      E5     Space
      D5 ─── Line 2
      C5     Space
      B4 ─── Line 3 (middle)
      A4     Space
      G4 ─── Line 4 (clef anchor)
      F4     Space
      E4 ─── Line 5 (bottom)
      D4     Space
      C4 ─── Ledger line (middle C)
```

### absoluteBeat Formula
```
absoluteBeat = (measureIndex × beatsPerMeasure) + beatInMeasure
```
Both are 0-indexed!
