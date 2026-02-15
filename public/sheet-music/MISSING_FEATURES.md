# Missing Features for Full Sheet Music Support

This document describes features needed in the Rochel Music App to support importing additional songs from sheet music.

## Current App Capabilities

| Feature | Status | Notes |
|---------|--------|-------|
| Note durations | ✅ Supported | whole, half, quarter, eighth, sixteenth + dotted |
| Time signatures | ✅ Supported | 2/4, 3/4, 4/4, 6/8 and others |
| Simple repeats | ✅ Supported | Start/end repeat signs |
| Volta brackets | ✅ Supported | 1st/2nd endings with automatic playback |
| Rests | ✅ Supported | whole, half, quarter, eighth rests |
| Lyrics | ✅ Supported | Syllable alignment with notes |
| Pickup beats | ⚠️ Partial | Works by placing notes at fractional beats, no formal anacrusis |
| Range | ✅ Supported | C3-C6 (treble clef only) |

## Missing Features

### ~~HIGH PRIORITY - Blocks Many Songs~~ (Completed!)

#### 1. ~~Rest Rendering~~ ✅ IMPLEMENTED

| Attribute | Value |
|-----------|-------|
| **What it is** | Visual display of silence/pause in music (quarter rest, half rest, eighth rest, etc.) |
| **Status** | ✅ **IMPLEMENTED** - pitch "REST" creates silence with SVG symbols |
| **Songs unblocked** | 12+ songs (Bore Olam, Hevenu Shalom, Al Yedey Nigunim, Avinu Malcenu, etc.) |

**Rest SVG symbols available:**
- Whole rest (4 beats) - rectangle hanging from line
- Half rest (2 beats) - rectangle sitting on line
- Quarter rest (1 beat) - squiggly vertical symbol
- Eighth rest (0.5 beats) - flag with dot

---

#### 2. ~~Volta Brackets (1st/2nd Endings)~~ ✅ IMPLEMENTED

| Attribute | Value |
|-----------|-------|
| **What it is** | Numbered brackets above measures indicating which ending to play on each repeat pass |
| **Example** | "1." bracket = play first time, "2." bracket = play second time (skipping 1.) |
| **Status** | ✅ **IMPLEMENTED** - VoltaBracket type with automatic playback filtering |
| **Songs unblocked** | Ani Purim, many folk songs with verse/chorus structures |

**VoltaBracket data structure:**
```typescript
interface VoltaBracket {
  id: string;
  repeatPairId: string;  // Links to RepeatMarker.pairId
  startMeasure: number;  // Absolute measure where volta begins
  endMeasure: number;    // Absolute measure where volta ends (exclusive)
  voltaNumber: number;   // 1, 2, 3, etc.
}
```

---

### HIGH PRIORITY - Still Missing

#### 3. D.C. / D.S. / Coda Navigation

| Attribute | Value |
|-----------|-------|
| **What it is** | Navigation markers that tell player to jump to different sections |
| **D.C. (Da Capo)** | "Go back to the beginning" |
| **D.S. (Dal Segno)** | "Go back to the sign (𝄋)" |
| **Coda (𝄌)** | "Jump to the ending section" |
| **Fine** | "End here" |
| **Songs blocked** | Havdalah, Ma She'at Ohevet, Gam Ki Elech, Yerushlaim Shebalev |
| **Implementation** | Add navigation markers to data model, modify playback engine to handle jumps |
| **Complexity** | 🟡 MEDIUM |

**Navigation types needed:**
- `D.C.` - Da Capo (repeat from beginning)
- `D.C. al Fine` - Repeat from beginning until "Fine"
- `D.C. al Coda` - Repeat from beginning, then jump to Coda
- `D.S.` - Dal Segno (repeat from the sign)
- `D.S. al Fine` - Repeat from sign until "Fine"
- `D.S. al Coda` - Repeat from sign, then jump to Coda
- `Segno (𝄋)` - The sign marker
- `Coda (𝄌)` - Coda marker
- `To Coda` - Jump instruction
- `Fine` - End marker

---

### MEDIUM PRIORITY - Blocks Some Songs

#### 4. Time Signature Changes

| Attribute | Value |
|-----------|-------|
| **What it is** | Switching meter mid-song (e.g., 4/4 → 3/4 → 4/4) |
| **Current state** | Single time signature per song only |
| **Songs blocked** | Gam Ki Elech (4/4↔3/4↔2/4), Melech Ha'olam |
| **Implementation** | Store time signature per measure, update beat calculation and rendering |
| **Complexity** | 🔴 HIGH |

---

#### 5. Key Signature Display & Changes

| Attribute | Value |
|-----------|-------|
| **What it is** | Displaying sharps/flats at start of staff, changing key mid-song |
| **Current state** | No key signature display at all - app uses accidentals on individual notes |
| **Songs blocked** | Ma She'at Ohevet, Melech Ha'olam (for key changes) |
| **Implementation** | Add key signature to song data, render sharps/flats, handle modulations |
| **Complexity** | 🔴 HIGH |

---

#### 6. Triplets (Tuplets)

| Attribute | Value |
|-----------|-------|
| **What it is** | 3 notes in the time of 2 (or other ratios like 5:4) |
| **Visual** | Notes grouped with bracket and "3" above |
| **Songs blocked** | Sha'ar Harachamim |
| **Implementation** | New duration calculation (divide beat by 3), bracket rendering |
| **Complexity** | 🟡 MEDIUM |

**Duration calculation:**
- Eighth-note triplet: each note = 1/3 beat (instead of 0.5)
- Quarter-note triplet: each note = 2/3 beat (instead of 1)

---

#### 7. Ties

| Attribute | Value |
|-----------|-------|
| **What it is** | Curved line connecting two notes of same pitch to combine duration |
| **Songs blocked** | 0 in beginner set (but common in intermediate) |
| **Implementation** | Add tie property to notes, combine playback duration, render curved line |
| **Complexity** | 🟡 MEDIUM |

---

### LOW PRIORITY - Nice to Have

#### 8. Chord Symbols

| Attribute | Value |
|-----------|-------|
| **What it is** | Letter names above the staff indicating harmony (e.g., C, G, Am, F) |
| **Purpose** | Tells accompanist what chord to play; does not affect melody |
| **Visual** | Text labels positioned above measures (C, G7, Am, Dm, etc.) |
| **Current state** | NOT SUPPORTED - no chord symbol data type or rendering |
| **Songs affected** | All songs with accompaniment (cosmetic, not blocking) |
| **Implementation** | Add chord array to song data, render text labels above staff |
| **Complexity** | 🟢 LOW |

**Chord symbol types:**
- Major chords: C, D, E, F, G, A, B
- Minor chords: Am, Dm, Em, etc.
- Seventh chords: G7, C7, Dm7, etc.
- Other extensions: Cmaj7, Am7, Gsus4, etc.

**Data structure:**
```typescript
interface ChordSymbol {
  chord: string;        // "C", "G7", "Am", etc.
  absoluteBeat: number; // Position where chord changes
}
```

---

#### 9. Fermata (𝄐)

| Attribute | Value |
|-----------|-------|
| **What it is** | A "pause" symbol meaning hold the note longer than written |
| **Songs blocked** | Ma She'at Ohevet |
| **Implementation** | Add fermata symbol to note data, extend duration during playback |
| **Complexity** | 🟢 LOW |

---

#### 10. Pickup Measure (Anacrusis) - Formal Support

| Attribute | Value |
|-----------|-------|
| **What it is** | Incomplete first measure (e.g., song starts on beat 4 of a 4/4 bar) |
| **Current state** | Works via hack - place notes at fractional absoluteBeat values |
| **Desired state** | Formal `pickupBeats: number` in song settings |
| **Songs affected** | Ani Purim, many folk songs |
| **Implementation** | Add pickupBeats to song settings, adjust measure numbering |
| **Complexity** | 🟢 LOW |

---

#### 11. Grace Notes

| Attribute | Value |
|-----------|-------|
| **What it is** | Small ornamental notes played quickly before the main note |
| **Current state** | NOT SUPPORTED |
| **Implementation** | Add grace note type, render as small notes, handle timing |
| **Complexity** | 🟡 MEDIUM |

---

#### 12. Articulations

| Attribute | Value |
|-----------|-------|
| **What it is** | Staccato (dots), accents (>), tenuto (-), legato (slurs) |
| **Current state** | NOT SUPPORTED |
| **Implementation** | Add articulation property to notes, render symbols, adjust playback |
| **Complexity** | 🟡 MEDIUM |

---

#### 13. Dynamic Markings

| Attribute | Value |
|-----------|-------|
| **What it is** | Volume indicators: p (piano/soft), f (forte/loud), mf, mp, crescendo, etc. |
| **Current state** | NOT SUPPORTED |
| **Implementation** | Add dynamics to song data, render text/hairpins, adjust playback volume |
| **Complexity** | 🟡 MEDIUM |

---

## Implementation Priority Recommendation

Based on song analysis and complexity:

| Priority | Feature | Complexity | Songs Unlocked | Status |
|----------|---------|------------|----------------|--------|
| ~~1~~ | ~~**Rest rendering**~~ | 🟢 LOW | 12+ songs | ✅ DONE |
| ~~2~~ | ~~**Volta brackets**~~ | 🟡 MEDIUM | 5+ songs | ✅ DONE |
| 3 | **D.C./D.S./Coda** | 🟡 MEDIUM | 4 songs | ⏳ Next |
| 4 | **Fermata** | 🟢 LOW | 1 song | |
| 5 | **Triplets** | 🟡 MEDIUM | 1+ songs | |
| 6 | **Ties** | 🟡 MEDIUM | Future songs | |
| 7 | **Pickup (formal)** | 🟢 LOW | Quality improvement | |
| 8 | **Time sig changes** | 🔴 HIGH | 2 songs | |
| 9 | **Key changes** | 🔴 HIGH | 2 songs | |
| 10 | **Chord symbols** | 🟢 LOW | Cosmetic only | |

**Next recommendation:** Implement **D.C./D.S./Coda navigation** - this unlocks 4 more songs with moderate effort.

---

## Workarounds for Current Limitations

### Songs with volta brackets (1st/2nd endings)
**Workaround:** "Linearize" by writing out the full form explicitly (both passes through the repeat).
**Downside:** Doubles the note count, doesn't match original notation.

### Songs with D.C./D.S.
**Workaround:** Write out all repeated sections explicitly.
**Downside:** Much longer transcription, loses form structure.

### Songs with rests
**Workaround:** Omit rests - notes will be positioned correctly but silence won't show.
**Downside:** Missing visual feedback, harder to read.

### Songs with pickup beats
**Workaround:** Place pickup notes at appropriate fractional beats (e.g., beat 3 for a 1-beat pickup in 4/4).
**This actually works** but measure numbers may be off by one.

### Songs with triplets
**Workaround:** Replace with equivalent straight rhythms where musically acceptable.
**Downside:** Changes the musical character.

---

## Compatibility Summary

From the 24 songs in the collection:

| Status | Count | Percentage |
|--------|-------|------------|
| Compatible now (with rests + voltas) | 17 | ~70% |
| Needs transposition only | 3 | 12.5% |
| Needs D.C./D.S./Coda | 4 | 16.7% |

**With D.C./D.S./Coda implemented:** ~85% of songs would be fully transcribable.
