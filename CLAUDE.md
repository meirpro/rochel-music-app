# Rochel Music App - Development Notes

## Layout Constants Synchronization

The following layout constants **must be kept in sync** between files:

### Files that share constants:
- `/src/components/NoteEditor.tsx` - Source of truth for staff layout
- `/src/lib/defaultSongs.ts` - Must match NoteEditor constants

### Critical constants:
```typescript
const LEFT_MARGIN = 100;
const BEAT_WIDTH = 60;
const NOTE_OFFSET = 15;        // Center notes within beat columns
const SYSTEM_HEIGHT = 200;
const SYSTEM_TOP_MARGIN = 60;
const STAFF_CENTER_OFFSET = 80;
const LINE_SPACING = 32;
const BEATS_PER_MEASURE = 4;
const MEASURES_PER_SYSTEM = 2;
```

### Staff Y position calculation:
```typescript
function getStaffCenterY(system: number): number {
  return SYSTEM_TOP_MARGIN + system * SYSTEM_HEIGHT + STAFF_CENTER_OFFSET;
}
// For system 0: 60 + 0 + 80 = 140
```

If these constants drift out of sync, notes will appear at incorrect vertical positions on the staff.

## Beaming Algorithm

Location: `/src/components/NoteEditor.tsx`

### Music Theory Rules Implemented

1. **Stem Direction** (`createBeamGroup` function)
   - Find note furthest from middle staff line
   - All stems in group point that direction
   - If tied for distance, default to stems down

2. **Beat Grouping** (`groupEighthNotes` function, `TIME_SIG_CONFIG`)
   - 4/4: Beam within beats 1-2, then 3-4
   - 6/8: Groups of 3 eighth notes
   - 3/4, 2/4: Each beat separate
   - Never beam across bar lines or measure center

3. **Beam Slope** (beam rendering section)
   - Follows melodic contour (ascending/descending)
   - **Max slope: LINE_SPACING / 2 (16px)** - the "engraver's rule"
   - Centered around midpoint when limited

### Key Code Locations
- `groupEighthNotes()`: ~line 211 - Groups eighth notes by beat
- `createBeamGroup()`: ~line 311 - Determines stem direction
- Beam rendering: ~line 1243 - SVG polygon with slope limiting

## Next.js SSR + useLocalStorage

**Always use `{ initializeWithValue: false }` with `useLocalStorage` from usehooks-ts.**

`useLocalStorage` reads from localStorage immediately on the client, causing hydration mismatch with server-rendered defaults. Setting `initializeWithValue: false` makes it use the default value on first render, then update from localStorage after hydration.

```typescript
// ALWAYS do this in Next.js:
const SSR_SAFE = { initializeWithValue: false };

const [settings, setSettings] = useLocalStorage<Settings>(
  "storage-key",
  DEFAULT_VALUE,
  SSR_SAFE,  // Prevents hydration errors
);
```

## Sheet Music Transcription Format

Location: `/src/lib/defaultSongs.ts`

When adding new songs from sheet music, follow this format exactly.

### EditorNote Structure

```typescript
interface EditorNote {
  id: string;           // Unique ID: "{songSlug}-{index}"
  pitch: string;        // Note name + octave: "C4", "F#4", "Bb3"
  duration: number;     // In beats: 4=whole, 2=half, 1=quarter, 0.5=eighth
  absoluteBeat: number; // Position from start of song (0-indexed)
}
```

### Duration Values

| Note Type | Duration Value | In 4/4 Time |
|-----------|---------------|-------------|
| Whole note | `4` | 4 beats |
| Half note | `2` | 2 beats |
| Quarter note | `1` | 1 beat |
| Eighth note | `0.5` | 1/2 beat |
| Sixteenth note | `0.25` | 1/4 beat |
| Dotted half | `3` | 3 beats |
| Dotted quarter | `1.5` | 1.5 beats |
| Dotted eighth | `0.75` | 3/4 beat |

### absoluteBeat Calculation

```typescript
// Formula: (measureNumber × beatsPerMeasure) + beatWithinMeasure
// Measures are 0-indexed, beats within measure are 0-indexed

// Example in 4/4 time (4 beats per measure):
// Measure 1, beat 1 → absoluteBeat: 0
// Measure 1, beat 2 → absoluteBeat: 1
// Measure 1, beat 3 → absoluteBeat: 2
// Measure 1, beat 4 → absoluteBeat: 3
// Measure 2, beat 1 → absoluteBeat: 4
// Measure 2, beat 2.5 (eighth on "and" of 2) → absoluteBeat: 5.5

// Example in 2/4 time (2 beats per measure):
// Measure 1, beat 1 → absoluteBeat: 0
// Measure 1, beat 2 → absoluteBeat: 1
// Measure 2, beat 1 → absoluteBeat: 2
```

### Pitch Notation

Use scientific pitch notation (note name + octave number):
- Middle C = `C4`
- One octave above middle C = `C5`
- One octave below middle C = `C3`
- Sharps: `F#4`, `C#5`
- Flats: `Bb4`, `Eb4`

### Example Transcription

Given sheet music in F major, 4/4 time, M1 contains: F-A-G-F-E-F-G-A (eighth notes)

```typescript
const exampleNotes: EditorNote[] = [
  // M1 (beats 0-3): 8 eighth notes
  { id: "example-0", pitch: "F4", duration: 0.5, absoluteBeat: 0 },
  { id: "example-1", pitch: "A4", duration: 0.5, absoluteBeat: 0.5 },
  { id: "example-2", pitch: "G4", duration: 0.5, absoluteBeat: 1 },
  { id: "example-3", pitch: "F4", duration: 0.5, absoluteBeat: 1.5 },
  { id: "example-4", pitch: "E4", duration: 0.5, absoluteBeat: 2 },
  { id: "example-5", pitch: "F4", duration: 0.5, absoluteBeat: 2.5 },
  { id: "example-6", pitch: "G4", duration: 0.5, absoluteBeat: 3 },
  { id: "example-7", pitch: "A4", duration: 0.5, absoluteBeat: 3.5 },
];
```

### RepeatMarker Structure

```typescript
interface RepeatMarker {
  id: string;           // Unique ID
  pairId: string;       // Matches start/end pairs
  type: "start" | "end";
  measureNumber: number; // 0-indexed measure where repeat sign appears
}

// Example: Repeat measures 1-8
const repeatMarkers: RepeatMarker[] = [
  { id: "song-repeat-start", pairId: "song-repeat", type: "start", measureNumber: 0 },
  { id: "song-repeat-end", pairId: "song-repeat", type: "end", measureNumber: 8 },
];
```

### LyricSyllable Structure

```typescript
interface LyricSyllable {
  text: string;         // The syllable text
  absoluteBeat: number; // Must match a note's absoluteBeat
}

// Attach syllables to notes at their absoluteBeat positions
const lyrics: LyricSyllable[] = [
  { text: "Di", absoluteBeat: 0 },
  { text: "dan", absoluteBeat: 0.5 },
  { text: "no", absoluteBeat: 1 },
  { text: "tzach", absoluteBeat: 1.5 },
];
```

### Key Signature Transposition

The app primarily uses natural notes. When transcribing from other keys:

| Original Key | Transposition | Example |
|-------------|---------------|---------|
| F major (1♭) | Keep as-is or transpose to C | F→F or F→C |
| G major (1♯) | Keep as-is or transpose to C | G→G or G→C |
| D♭ major (5♭) | Transpose to C major | D♭→C, E♭→D, F→E |

### Validation Checklist

Before adding a new song, verify:
- [ ] All `id` values are unique within the song
- [ ] `absoluteBeat` values are in ascending order (except chords)
- [ ] Sum of durations per measure equals time signature numerator
- [ ] Pitches are in valid range (typically C3-C6)
- [ ] RepeatMarkers have matching start/end pairs
- [ ] Lyrics align with note positions

## Tutorial Icon Tokens

Location: `/src/app/editor/components/TutorialOverlay.tsx`

Tutorial hint strings in `/src/app/editor/config/tutorialStages.ts` support inline icon tokens that render as SVG icons. This avoids Unicode rendering issues (like ♩ or 𝅗𝅥 showing as boxes on some systems).

### Available Tokens

| Token | Renders As | Use For |
|-------|-----------|---------|
| `[quarter]` | Quarter note SVG | Quarter note tool |
| `[half]` | Half note SVG | Half note tool |
| `[eighth]` | Eighth note SVG | Eighth note tool |
| `[whole]` | Whole note SVG | Whole note tool |
| `[repeat]` | Repeat sign SVG | Repeat marker tool |
| `[delete]` | X icon SVG | Delete tool |

### Example Usage

```typescript
// In tutorialStages.ts
{
  id: "more-notes",
  title: "Try Different Note Lengths",
  hint: "Click the half note [half] or quarter note [quarter] button in the left panel.",
  // ...
}
```

### Adding New Icon Tokens

1. Create an `Inline*Icon` component in `TutorialOverlay.tsx` (12-14px wide)
2. Add the token to `ICON_MAP`: `"[newtoken]": InlineNewIcon`
3. Add the pattern to the regex in `renderHintWithIcons()`
