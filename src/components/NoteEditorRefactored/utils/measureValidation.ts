// src/components/NoteEditorRefactored/utils/measureValidation.ts
// Validates measure beat counts against time signature expectations

import { EditorNote } from "../types";
import { TimeSignature } from "./timeSigConfig";
import { TimeSignatureChange } from "@/lib/types";

/**
 * Validation result for a single measure
 */
export interface MeasureValidation {
  measureIndex: number;
  expectedBeats: number;
  actualBeats: number;
  isValid: boolean;
  errorLabel: string | null; // e.g., "3/4 beats" or "5/4 beats"
}

/**
 * Get the time signature at a given measure number
 */
function getTimeSigAtMeasure(
  measureNum: number,
  initialTimeSig: TimeSignature,
  timeSignatureChanges: TimeSignatureChange[],
): TimeSignature {
  let timeSig = initialTimeSig;
  for (const change of timeSignatureChanges) {
    if (change.measureNumber <= measureNum) {
      timeSig = change.timeSignature;
    } else {
      break;
    }
  }
  return timeSig;
}

/**
 * Calculate the total beats in each measure based on notes
 *
 * A note contributes to a measure if any part of it falls within that measure's beat range.
 * For notes that span multiple measures, we count the portion within each measure.
 */
function calculateBeatsPerMeasure(
  notes: EditorNote[],
  initialTimeSig: TimeSignature,
  timeSignatureChanges: TimeSignatureChange[],
  totalMeasures: number,
): Map<number, number> {
  const beatsPerMeasure = new Map<number, number>();

  // Sort changes for efficient lookup
  const sortedChanges = [...timeSignatureChanges].sort(
    (a, b) => a.measureNumber - b.measureNumber,
  );

  // Calculate measure boundaries (start beats for each measure)
  const measureBoundaries: { startBeat: number; expectedBeats: number }[] = [];
  let currentBeat = 0;

  for (let m = 0; m < totalMeasures; m++) {
    const timeSig = getTimeSigAtMeasure(m, initialTimeSig, sortedChanges);
    measureBoundaries.push({
      startBeat: currentBeat,
      expectedBeats: timeSig.numerator,
    });
    currentBeat += timeSig.numerator;
  }

  // Initialize all measures with 0 beats
  for (let m = 0; m < totalMeasures; m++) {
    beatsPerMeasure.set(m, 0);
  }

  // Process each note
  for (const note of notes) {
    const noteStart = note.absoluteBeat;
    const noteEnd = noteStart + note.duration;

    // Find which measure(s) this note belongs to
    for (let m = 0; m < totalMeasures; m++) {
      const measureStart = measureBoundaries[m].startBeat;
      const measureEnd =
        m + 1 < totalMeasures
          ? measureBoundaries[m + 1].startBeat
          : measureStart + measureBoundaries[m].expectedBeats;

      // Check if note overlaps with this measure
      if (noteStart < measureEnd && noteEnd > measureStart) {
        // Calculate the portion of the note within this measure
        const overlapStart = Math.max(noteStart, measureStart);
        const overlapEnd = Math.min(noteEnd, measureEnd);
        const contribution = overlapEnd - overlapStart;

        const current = beatsPerMeasure.get(m) || 0;
        beatsPerMeasure.set(m, current + contribution);
      }
    }
  }

  return beatsPerMeasure;
}

/**
 * Validate all measures and return a map of validation results
 *
 * @param notes - The notes in the composition
 * @param timeSignature - Initial time signature
 * @param timeSignatureChanges - Mid-song time signature changes
 * @param totalMeasures - Total number of measures
 * @returns Map of measureIndex -> validation result
 */
export function validateMeasures(
  notes: EditorNote[],
  timeSignature: TimeSignature,
  timeSignatureChanges: TimeSignatureChange[],
  totalMeasures: number,
): Map<number, MeasureValidation> {
  const results = new Map<number, MeasureValidation>();

  if (totalMeasures === 0) return results;

  // Sort changes for efficient lookup
  const sortedChanges = [...timeSignatureChanges].sort(
    (a, b) => a.measureNumber - b.measureNumber,
  );

  // Calculate actual beats per measure
  const actualBeatsPerMeasure = calculateBeatsPerMeasure(
    notes,
    timeSignature,
    sortedChanges,
    totalMeasures,
  );

  // Validate each measure
  for (let m = 0; m < totalMeasures; m++) {
    const timeSig = getTimeSigAtMeasure(m, timeSignature, sortedChanges);
    const expectedBeats = timeSig.numerator;
    const actualBeats = actualBeatsPerMeasure.get(m) || 0;

    // Use small tolerance for floating point comparison
    const tolerance = 0.001;
    const isValid = Math.abs(actualBeats - expectedBeats) < tolerance;

    let errorLabel: string | null = null;
    if (!isValid && actualBeats > 0) {
      // Format as fraction-like display: "3/4 beats" or "5/4 beats"
      // Use Math.round to handle floating point artifacts
      const actualDisplay = Number.isInteger(actualBeats)
        ? actualBeats
        : Math.round(actualBeats * 10) / 10;
      errorLabel = `${actualDisplay}/${expectedBeats} beats`;
    } else if (!isValid && actualBeats === 0) {
      // Empty measure
      errorLabel = `0/${expectedBeats} beats`;
    }

    results.set(m, {
      measureIndex: m,
      expectedBeats,
      actualBeats,
      isValid,
      errorLabel,
    });
  }

  return results;
}
