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

## Staff-Adaptive Positioning

The app supports variable staff line counts (3, 4, or 5 lines). Elements positioned relative to the staff must calculate offsets dynamically based on `staffLines`.

### Pattern for Staff-Relative Offsets

```typescript
// ✅ CORRECT: Calculate staff bounds based on staffLines
const staffTopOffset =
  staffLines === 5 ? -2 * LINE_SPACING :
  staffLines === 4 ? -1 * LINE_SPACING : 0;
const staffBottomOffset = 2 * LINE_SPACING; // Bottom is always at center + 2 lines

const staffTopY = staffCenterY + staffTopOffset;
const staffBottomY = staffCenterY + staffBottomOffset;

// ❌ INCORRECT: Hardcoded offsets that assume 5 lines
const staffTopY = staffCenterY - 2 * LINE_SPACING; // Only correct for 5 lines!
```

### Elements That Must Adapt

| Element | Current Status | Location |
|---------|---------------|----------|
| Staff lines | ✅ Adapts | `StaffSystem.tsx` |
| Ledger lines | ✅ Adapts | `NoteElement.tsx` |
| Rest symbols | ✅ Centered | `NoteElement.tsx` (uses y directly) |
| Playhead | ✅ Adapts | `Playhead.tsx` |
| Volta brackets | ✅ Adapts | `VoltaBracketLayer.tsx` - above staff top |
| Beat highlight | ✅ Adapts | `NoteEditorRefactored.tsx` - learn mode highlight |
| Lyrics | ✅ Correct | `LyricsLayer.tsx` - below staff bottom (see below) |
| Lyrics zone highlight | ✅ Correct | `NoteEditorRefactored.tsx` - UI hint for lyrics tool |

**Note:** `NoteEditor.tsx` is deprecated. Use `NoteEditorRefactored/` for new work.

### Why Lyrics Don't Need to Adapt

Lyrics use `staffCenterY + LINE_SPACING * 3` which equals "staff bottom + 1 line spacing".
The staff **bottom** is always at `staffCenterY + 2 * LINE_SPACING` regardless of visible lines:
- 5 lines: top at -2, bottom at +2
- 4 lines: top at -1, bottom at +2
- 3 lines: top at 0, bottom at +2

So lyrics are always consistently positioned below the staff bottom.

### Visual Staff Center vs B4 Line Position

`getStaffCenterY()` returns the position of the **B4 line** (middle line of a 5-line staff), NOT the visual center. When fewer lines are visible, the visual center shifts:

```typescript
// getStaffCenterY returns the B4 line position (fixed reference point)
const staffCenterY = getStaffCenterY(system, staffLines);

// Visual center calculation (midpoint between top and bottom lines)
const staffTopOffset = staffLines === 5 ? -2 : staffLines === 4 ? -1 : 0;
const staffBottomOffset = 2; // Bottom is always at +2 * LINE_SPACING
const visualCenterY = staffCenterY + ((staffTopOffset + staffBottomOffset) / 2) * LINE_SPACING;

// Results:
// 5 lines: visualCenter = staffCenterY + 0 (same as B4 line)
// 4 lines: visualCenter = staffCenterY + 0.5 * LINE_SPACING
// 3 lines: visualCenter = staffCenterY + 1 * LINE_SPACING
```

**Rest symbols** use this visual center calculation so they appear centered on the visible staff regardless of line count.

## Treble Clef SVG Dimensions

The treble clef is rendered with `translate(x, staffCenterY - 98) scale(5.2)` using `TREBLE_CLEF_PATH` from `constants.ts`. The original path spans roughly y=0 to y=40. At scale 5.2, the rendered clef occupies **~208px vertically**.

```
Clef top:    staffCenterY - 98          (the upper curl)
Clef bottom: staffCenterY - 98 + 208 =  staffCenterY + 110  (the lower dot)
```

### SVG viewBox Sizing Rule

Any standalone SVG containing a treble clef **must** have a viewBox tall enough to show the full clef. Minimum viewBox height formula:

```
minViewBoxHeight = staffCenterY + 110 + padding
```

Example with `staffCenterY = 140` and 20px padding: `minViewBoxHeight = 140 + 110 + 20 = 270`.

| staffCenterY | Clef top (y) | Clef bottom (y) | Min viewBox height |
|-------------|-------------|-----------------|-------------------|
| 100 | 2 | 210 | ~230 |
| 120 | 22 | 230 | ~250 |
| 130 | 32 | 240 | ~260 |
| 140 | 42 | 250 | ~270 |

### Shared Primitives

Location: `/src/lib/staffPrimitives.tsx`

Reusable SVG components extracted from `StaffSystem.tsx` for use in both the editor and standalone contexts (e.g. 404 pages):

| Component | Description |
|-----------|-------------|
| `StaffLines` | Renders 3/4/5 staff lines at a given `staffCenterY` |
| `TrebleClef` | Renders the clef with correct transform |
| `TimeSignatureDisplay` | Renders numerator/denominator with editor-identical positioning |
| `Note` | Note head + stem with color-by-pitch |
| `BarLine` | Vertical bar line spanning the staff |
| `LedgerLine` | Short line for notes outside the staff |
| `pitchToY()` | Converts pitch string to Y coordinate |

These components use constants from `@/lib/constants` and `@/lib/layoutUtils` — nothing is duplicated.

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

**📖 Full Guide: See `SHEET_MUSIC_EXTRACTION.md` for comprehensive extraction instructions.**

Location: `/src/lib/defaultSongs.ts`

When adding new songs from sheet music, follow this format exactly.

### EditorNote Structure

```typescript
interface EditorNote {
  id: string;           // Unique ID: "{songSlug}-{index}"
  pitch: string;        // Note name + octave: "C4", "F#4", "Bb3", or "REST"
  duration: number;     // In beats: 4=whole, 2=half, 1=quarter, 0.5=eighth
  absoluteBeat: number; // Position from start of song (0-indexed)
}
```

### Rests (Silence)

Use `pitch: "REST"` to create silence for a specified duration. Rests are always centered vertically on the staff.

```typescript
// Quarter rest at beat 3
{ id: "song-15", pitch: "REST", duration: 1, absoluteBeat: 3 },

// Half rest at beat 4
{ id: "song-16", pitch: "REST", duration: 2, absoluteBeat: 4 },
```

**Rest symbols rendered:**
| Duration | Symbol | Description |
|----------|--------|-------------|
| 4 beats | Rectangle hanging below line | Whole rest |
| 2 beats | Rectangle sitting on line | Half rest |
| 1 beat | Squiggly zig-zag | Quarter rest |
| 0.5 beats | Flag with dot | Eighth rest |

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

**TODO: Add rest tokens when rests are taught in curriculum:**
| Token | Renders As | Use For |
|-------|-----------|---------|
| `[rest-quarter]` | Quarter rest SVG | Quarter rest tool |
| `[rest-half]` | Half rest SVG | Half rest tool |
| `[rest-eighth]` | Eighth rest SVG | Eighth rest tool |
| `[rest-whole]` | Whole rest SVG | Whole rest tool |

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

## Songs Needing Rests

The following songs have rests marked in comments but not yet added as REST notes.
Now that rest support is implemented, these songs should be updated:

### High Priority (Many Rests)
| Song | File | Notes |
|------|------|-------|
| Shevet Achim | `shevetAchim.ts` | 15+ rests throughout, "Multiple rests" in features |
| She Hashemesh | `sheHashemesh.ts` | 16+ rests, "Rests throughout" in features |

### Medium Priority (Some Rests)
| Song | File | Notes |
|------|------|-------|
| Ochila Lakel | `ochilaLakel.ts` | "Some gaps indicate rests" |
| Dror Yikra | `drorYikra.ts` | "Some gaps indicate rests" |
| Omar Rabbi Akiva | `omarRabbiAkiva.ts` | "Some gaps in source (rests not rendered)" |
| Didan Notzach | `didanNotzach.ts` | Measures 6 and 8 have rests |

### Low Priority (Pickup/Opening Rests)
| Song | File | Notes |
|------|------|-------|
| Ani Purim | `aniPurim.ts` | Beats 1-3 silent before pickup |

### In `_needs_redo/` Folder (Also Need Rests)
- yeshBiOdKoach - many rests + needs chords
- shibnehBeitHamikdash - multiple rests
- nigunSimcha - multiple rests
- eimatiKaatiMar - has rests
- avinuMalkenu - quarter rests

## Learn Mode Stages

Location: `/src/app/learn/`

Current curriculum (5 stages):
1. **The Staff & Notes** - Where notes live
2. **Note Durations** - How long notes last
3. **Reading & Playing** - Making music flow
4. **Rhythm & Shorter Notes** - Adding complexity
5. **Full Editor Intro** - You're ready!

### Future: Rests in Curriculum
Rests could be added to Stage 2 (Note Durations) or as a new Stage 2.5.
Key concepts to teach:
- Rests represent silence/pauses
- Same duration values as notes (whole=4, half=2, quarter=1, eighth=0.5)
- Visual symbols differ from note symbols
- Rests maintain rhythmic structure even without sound
