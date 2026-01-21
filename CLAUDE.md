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
const SYSTEM_HEIGHT = 180;
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
