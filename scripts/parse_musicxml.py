#!/usr/bin/env python3
"""
MusicXML to Rochel Music App converter

Usage:
  python scripts/parse_musicxml.py /path/to/song.mxl
  python scripts/parse_musicxml.py /path/to/song.xml

Outputs TypeScript note arrays that can be copied into song files.
"""

import xml.etree.ElementTree as ET
import sys
import os
import zipfile
import tempfile

def parse_musicxml(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()

    # Get divisions (duration units per quarter note)
    divisions = 2  # default
    for attr in root.findall('.//attributes/divisions'):
        divisions = int(attr.text)
        break

    # Get key signature
    fifths = 0
    for key in root.findall('.//key/fifths'):
        fifths = int(key.text)
        break

    # Get time signature
    beats = 4
    beat_type = 4
    for time in root.findall('.//time'):
        b = time.find('beats')
        bt = time.find('beat-type')
        if b is not None: beats = int(b.text)
        if bt is not None: beat_type = int(bt.text)
        break

    # Key signature names
    key_names = {
        -7: "Cb Major / Ab minor",
        -6: "Gb Major / Eb minor",
        -5: "Db Major / Bb minor",
        -4: "Ab Major / F minor",
        -3: "Eb Major / C minor",
        -2: "Bb Major / G minor",
        -1: "F Major / D minor",
        0: "C Major / A minor",
        1: "G Major / E minor",
        2: "D Major / B minor",
        3: "A Major / F# minor",
        4: "E Major / C# minor",
        5: "B Major / G# minor",
        6: "F# Major / D# minor",
        7: "C# Major / A# minor",
    }

    # Sharp/flat notes by key
    sharps = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
    flats = ['B', 'E', 'A', 'D', 'G', 'C', 'F']

    key_sharps = set()
    key_flats = set()
    if fifths > 0:
        key_sharps = set(sharps[:fifths])
    elif fifths < 0:
        key_flats = set(flats[:abs(fifths)])

    print(f"// Key: {key_names.get(fifths, f'{fifths} fifths')}")
    print(f"// Time: {beats}/{beat_type}")
    print(f"// Divisions: {divisions}")
    print()

    notes = []
    current_beat = 0
    note_id = 1
    repeats = []
    measure_beats = {}  # Track beat position at start of each measure

    for measure in root.findall('.//measure'):
        measure_num = int(measure.get('number'))
        measure_beats[measure_num] = current_beat

        # Check for repeats
        for barline in measure.findall('barline'):
            repeat = barline.find('repeat')
            if repeat is not None:
                direction = repeat.get('direction')
                repeats.append({'measure': measure_num, 'direction': direction, 'beat': current_beat})
                print(f"// Measure {measure_num}: repeat {direction} (beat {current_beat})")

        for elem in measure:
            if elem.tag == 'note':
                # Check if it's a rest
                if elem.find('rest') is not None:
                    dur = elem.find('duration')
                    if dur is not None:
                        current_beat += int(dur.text) / divisions
                    continue

                # Check for chord (simultaneous note)
                is_chord = elem.find('chord') is not None

                # Check for tie stop (skip this note, it's continuation)
                tie = elem.find('tie')
                if tie is not None and tie.get('type') == 'stop':
                    # Don't advance beat for tied note
                    continue

                pitch = elem.find('pitch')
                dur = elem.find('duration')

                if pitch is not None and dur is not None:
                    step = pitch.find('step').text
                    octave = int(pitch.find('octave').text)
                    alter = pitch.find('alter')

                    # Handle accidentals
                    pitch_str = step
                    if alter is not None:
                        alt = int(alter.text)
                        if alt == 1: pitch_str += '#'
                        elif alt == -1: pitch_str += 'b'
                    else:
                        # Apply key signature
                        if step in key_sharps:
                            pitch_str += '#'
                        elif step in key_flats:
                            pitch_str += 'b'

                    pitch_str += str(octave)

                    dur_beats = int(dur.text) / divisions

                    # Check for tie start
                    is_tie_start = tie is not None and tie.get('type') == 'start'

                    # For chords, don't advance the beat
                    note_beat = current_beat if not is_chord else notes[-1]['absoluteBeat'] if notes else current_beat

                    notes.append({
                        'id': note_id,
                        'pitch': pitch_str,
                        'duration': dur_beats,
                        'absoluteBeat': round(note_beat, 2),
                        'measure': measure_num,
                        'tie_start': is_tie_start
                    })
                    note_id += 1

                    if not is_chord:
                        current_beat += dur_beats

    # Combine tied notes
    final_notes = []
    skip_until = -1

    for i, note in enumerate(notes):
        if i < skip_until:
            continue

        new_note = {
            'id': note['id'],
            'pitch': note['pitch'],
            'duration': note['duration'],
            'absoluteBeat': note['absoluteBeat'],
            'measure': note['measure']
        }

        # If this note starts a tie, combine durations
        if note.get('tie_start'):
            j = i + 1
            while j < len(notes):
                if notes[j]['pitch'] == note['pitch']:
                    new_note['duration'] += notes[j]['duration']
                    if not notes[j].get('tie_start'):
                        skip_until = j + 1
                        break
                j += 1

        new_note['duration'] = round(new_note['duration'], 2)
        final_notes.append(new_note)

    print()
    print(f"// Total notes: {len(final_notes)}")
    print(f"// Total beats: {current_beat}")
    print(f"// Total measures: {max(n['measure'] for n in final_notes)}")
    print()

    return final_notes, repeats, {'fifths': fifths, 'beats': beats, 'beat_type': beat_type}


def print_notes(notes, slug="song", start_id=1):
    """Print notes in TypeScript format"""
    print("  notes: [")
    for i, n in enumerate(notes):
        note_id = f"{slug}-{start_id + i}"
        print(f'    {{ id: "{note_id}", pitch: "{n["pitch"]}", duration: {n["duration"]}, absoluteBeat: {n["absoluteBeat"]} }},')
    print("  ],")


def main():
    if len(sys.argv) < 2:
        print("Usage: python parse_musicxml.py <file.mxl or file.xml>")
        sys.exit(1)

    input_path = sys.argv[1]

    # Handle .mxl (compressed) files
    if input_path.endswith('.mxl'):
        with tempfile.TemporaryDirectory() as tmpdir:
            with zipfile.ZipFile(input_path, 'r') as z:
                z.extractall(tmpdir)

            # Find the score.xml file
            xml_path = os.path.join(tmpdir, 'score.xml')
            if not os.path.exists(xml_path):
                # Try to find any .xml file
                for f in os.listdir(tmpdir):
                    if f.endswith('.xml') and f != 'container.xml':
                        xml_path = os.path.join(tmpdir, f)
                        break

            notes, repeats, info = parse_musicxml(xml_path)
    else:
        notes, repeats, info = parse_musicxml(input_path)

    print("// Full notes array:")
    print_notes(notes)

    # If there are repeats, also output the repeated section
    if repeats:
        forward = next((r for r in repeats if r['direction'] == 'forward'), None)
        backward = next((r for r in repeats if r['direction'] == 'backward'), None)

        if forward and backward:
            print()
            print(f"// Repeated section (measures {forward['measure']}-{backward['measure']}):")
            section_notes = [n for n in notes if forward['measure'] <= n['measure'] <= backward['measure']]

            # Adjust absoluteBeat to start from 0
            if section_notes:
                offset = section_notes[0]['absoluteBeat']
                adjusted = []
                for n in section_notes:
                    adjusted.append({
                        **n,
                        'absoluteBeat': round(n['absoluteBeat'] - offset, 2)
                    })
                print_notes(adjusted)


if __name__ == '__main__':
    main()
