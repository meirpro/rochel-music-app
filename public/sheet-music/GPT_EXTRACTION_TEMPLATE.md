# Sheet Music Extraction Template for Rochel Music App

Use this template to extract notes from sheet music images. Output in the exact format below.

---

## OUTPUT FORMAT

```
SONG: [Song Name]
HEBREW: [Hebrew Name]
COMPOSER: [Composer/Artist]
KEY: [Key signature, e.g., A minor, C Major, G Major]
TIME: [Time signature, e.g., 4/4, 3/4, 6/8]
TEMPO: [Suggested BPM, e.g., 100, 120, 80]
STAFF_LINES: [Number of staff lines needed to display song, typically 3-6]

STRUCTURE:
- Section A: measures [X-Y] [repeat if applicable]
- Section B: measures [X-Y] [repeat if applicable]
- D.C./D.S./Coda: [describe navigation if any]

MEASURES:
M1: [pitch]-[duration], [pitch]-[duration], ...
M2: [pitch]-[duration], [pitch]-[duration], ...
...
```

---

## PITCH FORMAT

Use scientific pitch notation: **Note + Octave**

| Staff Position (Treble Clef) | Pitch |
|------------------------------|-------|
| Ledger line above | A5 |
| Top line (Line 1) | F5 |
| Top space | E5 |
| Line 2 | D5 |
| Space | C5 |
| Middle line (Line 3) | B4 |
| Space | A4 |
| Line 4 (G clef curls here) | G4 |
| Space | F4 |
| Bottom line (Line 5) | E4 |
| Space below | D4 |
| Ledger line below | C4 (Middle C) |

**Accidentals:**
- Sharp: `C#4`, `F#4`, `G#4`
- Flat: `Bb4`, `Eb4`, `Ab4`

---

## DURATION FORMAT

| Symbol | Code | Beats (in 4/4) |
|--------|------|----------------|
| Whole note (𝅝) | `w` | 4 |
| Dotted half (𝅗𝅥.) | `h.` | 3 |
| Half note (𝅗𝅥) | `h` | 2 |
| Dotted quarter (♩.) | `q.` | 1.5 |
| Quarter note (♩) | `q` | 1 |
| Dotted eighth (♪.) | `e.` | 0.75 |
| Eighth note (♪) | `e` | 0.5 |
| Sixteenth (𝅘𝅥𝅯) | `s` | 0.25 |

---

## EXAMPLE OUTPUT

```
SONG: Havdalah
HEBREW: הבדלה
COMPOSER: Rabbi Shlomo Carlebach
KEY: A minor
TIME: 4/4
TEMPO: 250
STAFF_LINES: 5

STRUCTURE:
- Section A: measures 1-5, repeat
- Section B: measures 6-9, repeat
- D.C. back to beginning after Section B

MEASURES:
M1: E5-e, D5-e, C5-e, A4-e, D5-h
M2: E5-e, D5-e, C5-e, A4-e, C5-h
M3: C5-e, A4-e, G4-e, E4-e, D4-q, D4-q
M4: D5-e, C5-e, B4-e, A4-e, C5-e, B4-e, A4-e, G4-e
M5: A4-w
M6: A4-e, G4-e, C5-e, B4-e, A4-h
M7: A4-e, G4-e, C5-e, B4-e, A4-h
M8: A4-e, G4-e, C5-e, B4-e, A4-e, G4-e, C5-e, B4-e
M9: A4-e, G4-e, C5-e, B4-e, A4-h
```

---

## VALIDATION RULES

Before submitting, verify:

1. **Beat count per measure** - Must equal time signature
   - 4/4 = 4 beats per measure
   - 3/4 = 3 beats per measure
   - 6/8 = 6 eighth notes (count as 2 dotted quarters)

2. **Duration math:**
   - `e` = 0.5, so 8 eighths = 4 beats ✓
   - `q` = 1, so 4 quarters = 4 beats ✓
   - `h` = 2, so 2 halves = 4 beats ✓
   - `e + e + e + e + h` = 0.5+0.5+0.5+0.5+2 = 4 ✓

3. **Pitch range** - Should be within C3 to C6

4. **Accidentals** - Note any sharps/flats from key signature

---

## STRUCTURE NOTATION

**Repeat signs:**
- `|:` = repeat start
- `:|` = repeat end
- If no `|:` before `:|`, repeat from beginning

**Navigation:**
- `D.C.` (Da Capo) = go back to the beginning
- `D.S.` (Dal Segno) = go back to the sign (𝄋)
- `Fine` = end here on repeat
- `Coda` (𝄌) = jump to coda section

**Volta brackets:**
- `[1. ___]` = play first time only
- `[2. ___]` = play second time only

---

## PICKUP BEATS (Anacrusis)

If the song starts with an incomplete measure:
- Note it in STRUCTURE section
- Example: "Pickup: 1 beat before M1"

---

## LYRICS (Optional)

If lyrics are visible, include them aligned to measures:

```
LYRICS:
M1: "A-ni Pu-rim"
M2: "A-ni Pu-rim"
...
```

Split syllables with hyphens where they align with separate notes.

---

## TRANSPOSITION NOTES

If the original key has many accidentals, suggest transposition:

| Original Key | Accidentals | Transpose To |
|--------------|-------------|--------------|
| F Major | 1♭ (Bb) | C Major (up P4) |
| Bb Major | 2♭ | C Major (up M2) |
| D Major | 2♯ | C Major (down M2) |
| G minor | 2♭ | A minor or E minor |
| D minor | 1♭ | A minor (down P4) |

The app works best with: **C Major, A minor, G Major, E minor** (minimal accidentals)

---

## SAMPLE REQUEST

"Please extract the notes from this sheet music image using the template format. Include:
1. All metadata (song name, key, time, tempo)
2. Structure with repeat signs and navigation markers
3. Every measure with pitches and durations
4. Verify beat counts add up correctly"
