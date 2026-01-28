// src/components/NoteEditorRefactored/utils/beamingUtils.ts
// Extracted from NoteEditor.tsx lines 1158-1310

import { EditorNote, BeamGroup } from "../types";
import {
  getLayoutForSystem,
  getMeasureAtBeat,
  SystemLayout,
} from "./systemLayout";
import { getStaffCenterY } from "@/lib/layoutUtils";
import { getYFromPitch } from "./pitchUtils";

/**
 * Group Eighth Notes for Beaming
 *
 * Music engraving rules for beaming:
 * 1. Only beam notes with flags (eighth notes and shorter): 0.25, 0.5, 0.75 beats
 * 2. Never beam across beat group boundaries (defined by beamGroups in TIME_SIG_CONFIG)
 *    - In 4/4: don't beam beats 2→3 (first half vs second half)
 *    - In 6/8: beam groups of 3 (compound meter)
 * 3. Never beam across bar lines
 * 4. Don't beam notes with other notes (quarter notes, etc.) in between them
 *
 * The algorithm:
 * - Sort beamable notes by position
 * - Group consecutive notes that share the same "beat group"
 * - A beat group is determined by the time signature's beamGroups array
 */
export function groupEighthNotes(
  allNotes: EditorNote[],
  systemLayouts: SystemLayout[],
): BeamGroup[] {
  // Include sixteenths (0.25), eighths (0.5), and dotted eighths (0.75) for beaming
  const beamableNotes = allNotes.filter(
    (n) => n.duration === 0.25 || n.duration === 0.5 || n.duration === 0.75,
  );

  // Sort all notes by system, then by beat position (for checking notes in between)
  const allSorted = [...allNotes].sort((a, b) => {
    if (a.system !== b.system) return a.system - b.system;
    return a.beat - b.beat;
  });

  // Sort beamable notes by system, then by beat position
  const sorted = [...beamableNotes].sort((a, b) => {
    if (a.system !== b.system) return a.system - b.system;
    return a.beat - b.beat;
  });

  // Helper to check if there's any note between two notes
  const hasNoteBetween = (note1: EditorNote, note2: EditorNote): boolean => {
    if (note1.system !== note2.system) return true; // Different systems = don't beam
    const minBeat = Math.min(note1.beat, note2.beat);
    const maxBeat = Math.max(note1.beat, note2.beat);
    return allSorted.some(
      (n) =>
        n.system === note1.system &&
        n.beat > minBeat + 0.1 &&
        n.beat < maxBeat - 0.1 &&
        n.id !== note1.id &&
        n.id !== note2.id,
    );
  };

  const groups: BeamGroup[] = [];
  let currentGroup: EditorNote[] = [];
  let currentBeatGroup = -1;

  for (const note of sorted) {
    // Get per-system layout and find the measure containing this note
    const sysLayout = getLayoutForSystem(systemLayouts, note.system);
    const measureInfo = getMeasureAtBeat(sysLayout, note.beat);
    if (!measureInfo) continue;

    // Use the measure's time signature config
    const config = {
      beatsPerMeasure: measureInfo.beatsInMeasure,
      beamGroups: measureInfo.beamGroups,
    };

    // Calculate which beat within the measure this note is on
    const beatInMeasure = note.beat - measureInfo.startBeatInSystem;
    const measureBeat = beatInMeasure % config.beatsPerMeasure;

    // Find which beam group this beat belongs to
    let beatGroup = 0;
    let beatCount = 0;
    for (let i = 0; i < config.beamGroups.length; i++) {
      beatCount += config.beamGroups[i];
      if (measureBeat < beatCount) {
        beatGroup = i;
        break;
      }
    }

    // Calculate absolute beat group (including system and measure)
    const absoluteBeatGroup =
      note.system * 1000 + measureInfo.measureIndex * 100 + beatGroup;

    // Check if this note should join the current group
    if (currentGroup.length === 0) {
      currentGroup.push(note);
      currentBeatGroup = absoluteBeatGroup;
    } else if (absoluteBeatGroup === currentBeatGroup) {
      // Same beat group - check if consecutive AND no notes in between
      const lastNote = currentGroup[currentGroup.length - 1];
      const beatDiff = note.beat - lastNote.beat;
      // Only beam if adjacent (within 1.5 beats) AND no other notes in between
      if (beatDiff > 0 && beatDiff <= 1.5 && !hasNoteBetween(lastNote, note)) {
        currentGroup.push(note);
      } else {
        // Not consecutive or has notes in between, finish current group
        if (currentGroup.length >= 2) {
          groups.push(createBeamGroup(currentGroup));
        }
        currentGroup = [note];
        currentBeatGroup = absoluteBeatGroup;
      }
    } else {
      // Different beat group, finish current and start new
      if (currentGroup.length >= 2) {
        groups.push(createBeamGroup(currentGroup));
      }
      currentGroup = [note];
      currentBeatGroup = absoluteBeatGroup;
    }
  }

  // Don't forget the last group
  if (currentGroup.length >= 2) {
    groups.push(createBeamGroup(currentGroup));
  }

  return groups;
}

/**
 * Create a Beam Group with Stem Direction
 *
 * Stem direction rules (standard music engraving):
 * 1. Find the note furthest from the middle line (Line 3)
 * 2. ALL notes in the group get the same stem direction
 * 3. If furthest note is above middle → stems point DOWN
 *    If furthest note is below middle → stems point UP
 * 4. If equidistant, default to stems DOWN (common convention)
 *
 * This ensures the beam doesn't collide with nearby staff lines.
 */
export function createBeamGroup(notes: EditorNote[]): BeamGroup {
  let maxDistance = 0;
  let stemDirection: "up" | "down" = "up";

  for (const note of notes) {
    const staffCenterY = getStaffCenterY(note.system);
    const noteY = getYFromPitch(note.pitch, note.system);
    const distance = Math.abs(noteY - staffCenterY);
    if (distance > maxDistance) {
      maxDistance = distance;
      // Note above center (lower Y) → stems down; note below center → stems up
      stemDirection = noteY < staffCenterY ? "down" : "up";
    }
  }

  return { notes, stemDirection };
}
