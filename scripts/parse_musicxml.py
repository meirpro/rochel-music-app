#!/usr/bin/env python3
"""
MusicXML to Rochel Music App converter

Usage:
  python scripts/parse_musicxml.py /path/to/song.mxl
  python scripts/parse_musicxml.py /path/to/song.xml

Outputs TypeScript arrays for notes, rests, repeats, voltas, time signatures, and lyrics.
"""

import xml.etree.ElementTree as ET
import sys
import os
import zipfile
import tempfile
import math


def snap_to_half_beat(beat):
    """
    Snap beat position to nearest half-beat (0, 0.5, 1, 1.5, etc.)
    The app's editor uses a half-beat grid, so positions like 6.25 or 30.75
    need to be snapped to 6.0 or 31.0 respectively.
    """
    return math.floor(beat * 2 + 0.5) / 2


def parse_musicxml(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()

    # Get divisions (duration units per quarter note)
    divisions = 2  # default
    for attr in root.findall('.//attributes/divisions'):
        divisions = int(attr.text)
        break

    # Get initial key signature
    fifths = 0
    for key in root.findall('.//key/fifths'):
        fifths = int(key.text)
        break

    # Get initial time signature
    beats = 4
    beat_type = 4
    for time in root.findall('.//time'):
        b = time.find('beats')
        bt = time.find('beat-type')
        if b is not None:
            beats = int(b.text)
        if bt is not None:
            beat_type = int(bt.text)
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
    sharps_order = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
    flats_order = ['B', 'E', 'A', 'D', 'G', 'C', 'F']

    def get_key_accidentals(fifths_val):
        key_sharps = set()
        key_flats = set()
        if fifths_val > 0:
            key_sharps = set(sharps_order[:fifths_val])
        elif fifths_val < 0:
            key_flats = set(flats_order[:abs(fifths_val)])
        return key_sharps, key_flats

    current_key_sharps, current_key_flats = get_key_accidentals(fifths)

    print(f"// Key: {key_names.get(fifths, f'{fifths} fifths')}")
    print(f"// Time: {beats}/{beat_type}")
    print(f"// Divisions: {divisions}")
    print()

    notes = []
    rests = []
    lyrics_list = []
    current_beat = 0
    note_id = 1
    rest_id = 1
    repeats = []
    voltas = []
    time_sig_changes = []
    measure_beats = {}  # Track beat position at start of each measure

    # Track accidentals within a measure (for natural handling)
    measure_accidentals = {}

    for measure in root.findall('.//measure'):
        measure_num = int(measure.get('number'))
        measure_beats[measure_num] = current_beat
        measure_accidentals = {}  # Reset accidentals at each bar line

        # Check for attribute changes (time sig, key sig, divisions)
        for attr in measure.findall('attributes'):
            # Divisions can change mid-piece
            div_elem = attr.find('divisions')
            if div_elem is not None:
                divisions = int(div_elem.text)

            # Key signature change
            key_elem = attr.find('key')
            if key_elem is not None:
                fifths_elem = key_elem.find('fifths')
                if fifths_elem is not None:
                    new_fifths = int(fifths_elem.text)
                    if new_fifths != fifths:
                        fifths = new_fifths
                        current_key_sharps, current_key_flats = get_key_accidentals(fifths)
                        print(f"// Measure {measure_num}: Key change to {key_names.get(fifths, f'{fifths} fifths')}")

            # Time signature change
            time_elem = attr.find('time')
            if time_elem is not None:
                new_beats_elem = time_elem.find('beats')
                new_beat_type_elem = time_elem.find('beat-type')
                if new_beats_elem is not None and new_beat_type_elem is not None:
                    new_b = int(new_beats_elem.text)
                    new_bt = int(new_beat_type_elem.text)
                    if new_b != beats or new_bt != beat_type:
                        beats = new_b
                        beat_type = new_bt
                        time_sig_changes.append({
                            'measureNumber': measure_num,
                            'timeSignature': {'numerator': beats, 'denominator': beat_type}
                        })
                        print(f"// Measure {measure_num}: Time signature change to {beats}/{beat_type}")

        # Check for repeats and voltas in barlines
        for barline in measure.findall('barline'):
            location = barline.get('location', 'right')

            repeat = barline.find('repeat')
            if repeat is not None:
                direction = repeat.get('direction')
                repeats.append({
                    'measure': measure_num,
                    'direction': direction,
                    'beat': current_beat,
                    'location': location
                })
                print(f"// Measure {measure_num}: repeat {direction} (beat {current_beat})")

            ending = barline.find('ending')
            if ending is not None:
                ending_type = ending.get('type')  # start, stop, discontinue
                ending_number = ending.get('number', '1')
                voltas.append({
                    'measure': measure_num,
                    'type': ending_type,
                    'number': ending_number,
                    'beat': current_beat
                })
                print(f"// Measure {measure_num}: volta {ending_number} {ending_type}")

        for elem in measure:
            if elem.tag == 'note':
                # Check if it's a rest
                if elem.find('rest') is not None:
                    dur = elem.find('duration')
                    if dur is not None:
                        dur_beats = int(dur.text) / divisions
                        rests.append({
                            'id': f'r{rest_id}',
                            'pitch': 'REST',
                            'duration': round(dur_beats, 2),
                            'absoluteBeat': snap_to_half_beat(current_beat),
                            'measure': measure_num
                        })
                        rest_id += 1
                        current_beat += dur_beats
                    continue

                # Check for chord (simultaneous note)
                is_chord = elem.find('chord') is not None

                # Check for ties - a note can have multiple tie elements (start AND stop)
                ties = elem.findall('tie')
                is_tie_start = any(t.get('type') == 'start' for t in ties)
                is_tie_stop = any(t.get('type') == 'stop' for t in ties)

                pitch = elem.find('pitch')
                dur = elem.find('duration')

                if pitch is not None and dur is not None:
                    step = pitch.find('step').text
                    octave = int(pitch.find('octave').text)
                    alter_elem = pitch.find('alter')

                    # Handle accidentals
                    pitch_str = step

                    if alter_elem is not None:
                        alt = int(float(alter_elem.text))
                        if alt == 2:
                            pitch_str += '##'  # double sharp
                        elif alt == 1:
                            pitch_str += '#'
                        elif alt == -1:
                            pitch_str += 'b'
                        elif alt == -2:
                            pitch_str += 'bb'  # double flat
                        # alt == 0 means natural (no accidental added)

                        # Track this accidental for the measure
                        measure_accidentals[step] = alt
                    else:
                        # Check if this note was altered earlier in the measure
                        if step in measure_accidentals:
                            alt = measure_accidentals[step]
                            if alt == 1:
                                pitch_str += '#'
                            elif alt == -1:
                                pitch_str += 'b'
                            elif alt == 2:
                                pitch_str += '##'
                            elif alt == -2:
                                pitch_str += 'bb'
                            # alt == 0 means natural
                        else:
                            # Apply key signature
                            if step in current_key_sharps:
                                pitch_str += '#'
                            elif step in current_key_flats:
                                pitch_str += 'b'

                    pitch_str += str(octave)

                    dur_beats = int(dur.text) / divisions

                    # For chords, don't advance the beat
                    note_beat = current_beat if not is_chord else notes[-1]['absoluteBeat'] if notes else current_beat

                    notes.append({
                        'id': note_id,
                        'pitch': pitch_str,
                        'duration': dur_beats,
                        'absoluteBeat': snap_to_half_beat(note_beat),
                        'measure': measure_num,
                        'tie_start': is_tie_start,
                        'tie_stop': is_tie_stop
                    })

                    # Extract lyrics
                    for lyric in elem.findall('lyric'):
                        text_elem = lyric.find('text')
                        syllabic = lyric.find('syllabic')
                        if text_elem is not None and text_elem.text:
                            lyrics_list.append({
                                'text': text_elem.text,
                                'absoluteBeat': snap_to_half_beat(note_beat),
                                'syllabic': syllabic.text if syllabic is not None else None
                            })

                    note_id += 1

                    if not is_chord:
                        current_beat += dur_beats

    # Combine tied notes
    final_notes = []
    skip_indices = set()

    for i, note in enumerate(notes):
        if i in skip_indices:
            continue

        new_note = {
            'id': note['id'],
            'pitch': note['pitch'],
            'duration': note['duration'],
            'absoluteBeat': note['absoluteBeat'],
            'measure': note['measure']
        }

        # If this note starts a tie, combine durations with following tied notes
        if note.get('tie_start'):
            j = i + 1
            while j < len(notes):
                if notes[j]['pitch'] == note['pitch'] and notes[j].get('tie_stop'):
                    new_note['duration'] += notes[j]['duration']
                    skip_indices.add(j)
                    # If this note also starts a new tie, continue
                    if not notes[j].get('tie_start'):
                        break
                j += 1

        new_note['duration'] = round(new_note['duration'], 2)
        final_notes.append(new_note)

    # Merge notes and rests, sorted by absoluteBeat
    all_items = final_notes + rests
    all_items.sort(key=lambda x: (x['absoluteBeat'], 0 if x['pitch'] != 'REST' else 1))

    print()
    print(f"// Total notes: {len(final_notes)}")
    print(f"// Total rests: {len(rests)}")
    print(f"// Total beats: {current_beat}")
    if all_items:
        print(f"// Total measures: {max(n['measure'] for n in all_items)}")
    print()

    return all_items, repeats, voltas, time_sig_changes, lyrics_list, {
        'fifths': fifths,
        'beats': beats,
        'beat_type': beat_type
    }


def print_notes(items, slug="song", start_id=1):
    """Print notes and rests in TypeScript format"""
    print("  notes: [")
    note_num = start_id
    rest_num = 1
    for item in items:
        if item['pitch'] == 'REST':
            item_id = f"{slug}-r{rest_num}"
            rest_num += 1
        else:
            item_id = f"{slug}-{note_num}"
            note_num += 1
        print(f'    {{ id: "{item_id}", pitch: "{item["pitch"]}", duration: {item["duration"]}, absoluteBeat: {item["absoluteBeat"]} }},')
    print("  ],")


def print_repeats(repeats, slug="song"):
    """Print repeat markers in TypeScript format"""
    if not repeats:
        print("  repeatMarkers: [],")
        return

    print("  repeatMarkers: [")
    # Group repeats into pairs
    forwards = [r for r in repeats if r['direction'] == 'forward']
    backwards = [r for r in repeats if r['direction'] == 'backward']

    pair_id = 1
    for backward in backwards:
        # Find matching forward (the one before this backward)
        matching_forward = None
        for fwd in forwards:
            if fwd['measure'] < backward['measure']:
                matching_forward = fwd

        if matching_forward:
            print(f'    {{ id: "{slug}-repeat-start-{pair_id}", pairId: "{slug}-repeat-{pair_id}", type: "start", measureNumber: {matching_forward["measure"] - 1} }},')
        print(f'    {{ id: "{slug}-repeat-end-{pair_id}", pairId: "{slug}-repeat-{pair_id}", type: "end", measureNumber: {backward["measure"] - 1} }},')
        pair_id += 1

    print("  ],")


def print_voltas(voltas, slug="song"):
    """Print volta brackets in TypeScript format"""
    if not voltas:
        print("  voltaBrackets: [],")
        return

    print("  voltaBrackets: [")
    # Group voltas by number
    volta_groups = {}
    for v in voltas:
        num = v['number']
        if num not in volta_groups:
            volta_groups[num] = []
        volta_groups[num].append(v)

    volta_id = 1
    for num, group in sorted(volta_groups.items()):
        starts = [v for v in group if v['type'] == 'start']
        stops = [v for v in group if v['type'] in ('stop', 'discontinue')]

        for start in starts:
            # Find matching stop
            stop = next((s for s in stops if s['measure'] >= start['measure']), None)
            end_measure = stop['measure'] if stop else start['measure']

            print(f'    {{ id: "{slug}-volta-{volta_id}", number: {num}, startMeasure: {start["measure"] - 1}, endMeasure: {end_measure - 1} }},')
            volta_id += 1

    print("  ],")


def print_time_sig_changes(changes):
    """Print time signature changes in TypeScript format"""
    if not changes:
        print("  timeSignatureChanges: [],")
        return

    print("  timeSignatureChanges: [")
    for change in changes:
        ts = change['timeSignature']
        print(f'    {{ measureNumber: {change["measureNumber"] - 1}, timeSignature: {{ numerator: {ts["numerator"]}, denominator: {ts["denominator"]} }} }},')
    print("  ],")


def print_lyrics(lyrics, slug="song"):
    """Print lyrics in TypeScript format"""
    if not lyrics:
        print("  lyrics: [],")
        return

    print("  lyrics: [")
    for lyric in lyrics:
        text = lyric['text'].replace('"', '\\"').replace('\n', '\\n')
        print(f'    {{ text: "{text}", absoluteBeat: {lyric["absoluteBeat"]} }},')
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

            items, repeats, voltas, time_sigs, lyrics, info = parse_musicxml(xml_path)
    else:
        items, repeats, voltas, time_sigs, lyrics, info = parse_musicxml(input_path)

    print("// ═══════════════════════════════════════════════════════════════════")
    print("// Full song data:")
    print("// ═══════════════════════════════════════════════════════════════════")
    print()
    print_notes(items)
    print()
    print_repeats(repeats)
    print()
    print_voltas(voltas)
    print()
    print_time_sig_changes(time_sigs)
    print()
    print_lyrics(lyrics)

    # If there are repeats, also output the repeated section
    if repeats:
        forward = next((r for r in repeats if r['direction'] == 'forward'), None)
        backward = next((r for r in repeats if r['direction'] == 'backward'), None)

        if forward and backward:
            print()
            print(f"// ═══════════════════════════════════════════════════════════════════")
            print(f"// Repeated section (measures {forward['measure']}-{backward['measure']}):")
            print(f"// ═══════════════════════════════════════════════════════════════════")
            section_items = [n for n in items if forward['measure'] <= n['measure'] <= backward['measure']]

            # Adjust absoluteBeat to start from 0
            if section_items:
                offset = section_items[0]['absoluteBeat']
                adjusted = []
                for n in section_items:
                    adjusted.append({
                        **n,
                        'absoluteBeat': snap_to_half_beat(n['absoluteBeat'] - offset)
                    })
                print_notes(adjusted)


if __name__ == '__main__':
    main()
