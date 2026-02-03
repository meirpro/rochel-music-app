# Sheet Music to TypeScript Extraction Template

Use this template to extract notes from sheet music images into TypeScript code that can be directly added to the Rochel Music App.

---

## ⚠️ CRITICAL RULES - READ FIRST ⚠️

### 1. LINEARIZE ALL NAVIGATION MARKERS

The app does **NOT** support D.C., D.S., Coda, or Volta brackets. You **MUST** write out the complete playback order as sequential notes.

**If you see any of these, you must LINEARIZE:**
- **D.C. (Da Capo)** - Copy the section from the beginning and append it
- **D.S. (Dal Segno)** - Copy from the sign (𝄋) and append it
- **Coda (𝄌)** - Write out the jump to coda section
- **Volta brackets [1. ] [2. ]** - Write out both passes with their different endings

**❌ WRONG:**
```typescript
// Only includes measures as they appear on sheet, ignoring D.C.
notes: [
  // Section A
  // Section B
  // MISSING: D.C. back to Section A!
],
```

**✅ CORRECT:**
```typescript
// Full playback order with D.C. written out
notes: [
  // Section A (first time)
  // Section B
  // Section A AGAIN (D.C. - same notes, NEW IDs, UPDATED absoluteBeat values)
],
```

### 2. REPEAT MARKERS ARE ONLY FOR SIMPLE REPEATS

The `repeatMarkers` array is **ONLY** for sections with repeat signs (:|) that loop back to (|:).

**Repeat markers do NOT handle:**
- D.C. (Da Capo)
- D.S. (Dal Segno)
- Coda jumps
- Volta brackets

All of those must be **LINEARIZED** in the notes array.

### 3. TEMPO MUST MATCH SHEET MUSIC

Look for tempo marking on the sheet (e.g., ♩= 96, Allegro, etc.). If none is marked, estimate based on style:
- Slow/Adagio: 60-80
- Moderate/Andante: 80-100
- Lively/Allegro: 120-160
- Fast/Vivace: 160-200
- Very fast (niggun/freylach): 200-300

**Do NOT default to 120.** The tempo goes in `settings.tempo`.

### 4. RESTS CAN BE OMITTED

The app does not visually render rests. Skip them - just leave gaps in absoluteBeat positions.

### 5. VERIFY MEASURE COUNT

After linearizing, your output should have **MORE measures** than the sheet shows if there was any D.C., D.S., or Volta.

Example: If sheet has Section A + Section B + D.C., your output needs Section A + Section B + Section A again.

---

## OUTPUT FORMAT

```typescript
// {SongName} ({HebrewName}) - {Composer/Artist}
// Key: {Key}, Time: {TimeSignature}, Tempo: {Tempo}
import { SongData } from "./types";

export const {camelCaseName}: SongData = {
  id: "default-{kebab-case-name}",
  name: "{Song Name}",
  hebrewName: "{Hebrew Name}",
  description: "{Brief Hebrew description}",
  notes: [
    // ALL notes in FULL PLAYBACK ORDER (linearized)
  ],

  repeatMarkers: [
    // ONLY for simple repeat signs (:|), NOT for D.C./D.S./Volta
  ],

  lyrics: [],

  settings: {
    tempo: ???,  // ⚠️ REQUIRED: Use tempo from sheet (e.g., 96, 120, 200)
    timeSignature: { numerator: 4, denominator: 4 },
    staffLines: 5,  // Based on pitch range (see below)
  },

  releaseDate: "2026-02-02",

  transcriptionNotes: {
    original: {
      key: "Original Key",
      timeSignature: "4/4",
      features: ["List features like D.C., repeat signs, etc."],
    },
    changes: [
      {
        what: "Linearized D.C. (Da Capo)",
        why: "App doesn't support navigation markers"
      },
    ],
    sources: {
      sheetMusic: "Source name",
    },
    transcribedDate: "2026-02-02"
  },
};
```

---

## NOTE FORMAT

```typescript
{ id: "{slug}-{n}", pitch: "{Note}{Octave}", duration: {beats}, absoluteBeat: {position} }
```

| Property | Description |
|----------|-------------|
| `id` | Unique sequential ID: `"song-1"`, `"song-2"`, etc. |
| `pitch` | Scientific pitch: `"C4"`, `"F#4"`, `"Bb3"` |
| `duration` | Length in beats (see table) |
| `absoluteBeat` | Position from song start (0-indexed) |

### Duration Values:

| Note Type | Duration |
|-----------|----------|
| Whole | `4` |
| Dotted half | `3` |
| Half | `2` |
| Dotted quarter | `1.5` |
| Quarter | `1` |
| Dotted eighth | `0.75` |
| Eighth | `0.5` |
| Sixteenth | `0.25` |

---

## PITCH REFERENCE (Treble Clef)

```
        Ledger line above  = A5
        ─────────────────  = F5 (Line 1, top)
              Space        = E5
        ─────────────────  = D5 (Line 2)
              Space        = C5
        ─────────────────  = B4 (Line 3, middle)
              Space        = A4
        ─────────────────  = G4 (Line 4, clef anchor)
              Space        = F4
        ─────────────────  = E4 (Line 5, bottom)
              Space        = D4
        Ledger line below  = C4 (Middle C)
```

**Accidentals:** Sharp = `C#4`, Flat = `Bb4`

---

## absoluteBeat CALCULATION

**Formula:**
```
absoluteBeat = (measureIndex × beatsPerMeasure) + beatWithinMeasure
```

**BOTH ARE 0-INDEXED:**
- Measure 1 = measureIndex 0
- Beat 1 = beatWithinMeasure 0

**Examples in 4/4 time:**

| Position | absoluteBeat |
|----------|--------------|
| Measure 1, beat 1 | 0 |
| Measure 1, beat 2 | 1 |
| Measure 1, beat 2.5 (eighth on "and") | 1.5 |
| Measure 2, beat 1 | 4 |
| Measure 3, beat 1 | 8 |
| Measure 4, beat 1 | 12 |

---

## LINEARIZATION GUIDE

### D.C. (Da Capo) - "From the beginning"

When you see D.C. at the end:
1. Write out all sections in order as they first appear
2. Then COPY the notes from the beginning (with new IDs and updated absoluteBeat)
3. Continue absoluteBeat sequentially from where Section B ended

```typescript
notes: [
  // SECTION A (as written)
  { id: "song-1", pitch: "X", duration: Y, absoluteBeat: 0 },
  // ... all Section A notes ...

  // SECTION B (as written)
  { id: "song-N", pitch: "X", duration: Y, absoluteBeat: Z },
  // ... all Section B notes ...

  // D.C. - SECTION A AGAIN
  // Same pitches and durations as Section A
  // But with NEW sequential IDs (continuing from where you left off)
  // And UPDATED absoluteBeat values (continuing from end of Section B)
  { id: "song-M", pitch: "X", duration: Y, absoluteBeat: W },
  // ...
],
```

### Volta Brackets (1st/2nd endings)

When you see [1. ending] and [2. ending]:
1. Write the main section + volta 1 ending
2. Write the main section AGAIN + volta 2 ending
3. Continue with rest of song

```typescript
notes: [
  // FIRST PASS: Main section + Volta 1 ending
  { id: "song-1", ... },  // Main section
  { id: "song-N", ... },  // Volta 1 ending

  // SECOND PASS: Main section again + Volta 2 ending
  { id: "song-N+1", ... },  // Main section (same pitches, new IDs, updated beats)
  { id: "song-M", ... },    // Volta 2 ending (different notes than volta 1)

  // Continue with rest of song...
],
```

---

## PICKUP BEATS (Anacrusis)

If song starts with incomplete measure:

```
startBeat = beatsPerMeasure - pickupBeats
```

**Example:** 4/4 time with 1-beat pickup → first note at absoluteBeat: 3

```typescript
{ id: "song-1", pitch: "G4", duration: 1, absoluteBeat: 3 },   // pickup
{ id: "song-2", pitch: "C5", duration: 1, absoluteBeat: 4 },   // M1, beat 1
```

---

## REPEAT MARKERS

**Use ONLY for simple repeat signs** - sections that loop back with (|:  :|)

```typescript
repeatMarkers: [
  { id: "song-ra-start", pairId: "section-a", type: "start", measureNumber: 0 },
  { id: "song-ra-end", pairId: "section-a", type: "end", measureNumber: X },
],
```

The `measureNumber` is 0-indexed and refers to measures in your **linearized** output.

**Do NOT use repeat markers for D.C., D.S., or Volta** - those must be linearized in the notes array.

---

## STAFF LINES SETTING

| Pitch Range | staffLines |
|-------------|------------|
| E4 to F5 only | 3 |
| D4 to G5 | 4 |
| C4 to A5 | 5 |
| Below C4 or above A5 | 6 |

---

## TRANSPOSITION (Optional)

The app works best with natural keys. If transposing:

| Original | Transpose To |
|----------|--------------|
| D minor (1♭) | A minor |
| F Major (1♭) | C Major |
| Bb Major (2♭) | C Major |
| G minor (2♭) | E minor |

Document any transposition in `transcriptionNotes.changes`.

---

## VALIDATION CHECKLIST

Before outputting, verify:

- [ ] **D.C./D.S. linearized?** - Output has MORE measures than sheet if D.C./D.S. present
- [ ] **Volta linearized?** - Both passes written out
- [ ] **Beat counts correct?** - Each measure totals time signature (4 for 4/4, 3 for 3/4)
- [ ] **Tempo from sheet?** - Not defaulting to 120
- [ ] **IDs sequential?** - `song-1`, `song-2`, `song-3`, ...
- [ ] **absoluteBeat increasing?** - Values go up throughout song
- [ ] **Repeat markers only for (:|)?** - NOT for D.C./D.S./Volta

---

## SAMPLE REQUEST

"Extract notes from this sheet music into TypeScript for the Rochel Music App.

CRITICAL:
1. LINEARIZE any D.C., D.S., Coda, or Volta - write out full playback order
2. Use tempo from sheet (don't default to 120)
3. All notes need sequential IDs and absoluteBeat values
4. Repeat markers ONLY for simple repeat signs, NOT for D.C./D.S.
5. Document linearization in transcriptionNotes.changes"
