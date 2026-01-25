/**
 * Time Signature Utilities
 *
 * Helper functions for working with mid-song time signature changes.
 * These utilities handle the complexity of variable-length measures when
 * time signatures change during a piece.
 */

import { TimeSignature, TimeSignatureChange } from "./types";

/**
 * Information about a single measure's boundaries
 */
export interface MeasureInfo {
  measureNumber: number;
  startBeat: number; // Absolute beat where measure starts
  endBeat: number; // Absolute beat where measure ends
  beatsInMeasure: number; // Number of beats in this measure
  timeSignature: TimeSignature;
}

/**
 * Get the time signature in effect at a specific measure number
 */
export function getTimeSignatureAtMeasure(
  measureNumber: number,
  initialTimeSig: TimeSignature,
  changes?: TimeSignatureChange[],
): TimeSignature {
  if (!changes || changes.length === 0) {
    return initialTimeSig;
  }

  // Sort changes by measure number (ascending)
  const sortedChanges = [...changes].sort(
    (a, b) => a.measureNumber - b.measureNumber,
  );

  // Find the last change that occurs at or before this measure
  let currentTimeSig = initialTimeSig;
  for (const change of sortedChanges) {
    if (change.measureNumber <= measureNumber) {
      currentTimeSig = change.timeSignature;
    } else {
      break;
    }
  }

  return currentTimeSig;
}

/**
 * Get measure number and beat-within-measure from an absolute beat position.
 * Accounts for time signature changes.
 */
export function getMeasureFromAbsoluteBeat(
  absoluteBeat: number,
  initialTimeSig: TimeSignature,
  changes?: TimeSignatureChange[],
): {
  measureNumber: number;
  beatInMeasure: number;
  timeSignature: TimeSignature;
} {
  if (!changes || changes.length === 0) {
    const beatsPerMeasure = initialTimeSig.numerator;
    const measureNumber = Math.floor(absoluteBeat / beatsPerMeasure);
    const beatInMeasure = absoluteBeat - measureNumber * beatsPerMeasure;
    return { measureNumber, beatInMeasure, timeSignature: initialTimeSig };
  }

  // Sort changes by measure number
  const sortedChanges = [...changes].sort(
    (a, b) => a.measureNumber - b.measureNumber,
  );

  // Walk through measures, accumulating beats
  let currentBeat = 0;
  let currentMeasure = 0;
  let currentTimeSig = initialTimeSig;

  while (currentBeat <= absoluteBeat) {
    // Check if there's a time signature change at this measure
    const changeAtMeasure = sortedChanges.find(
      (c) => c.measureNumber === currentMeasure,
    );
    if (changeAtMeasure) {
      currentTimeSig = changeAtMeasure.timeSignature;
    }

    const beatsInThisMeasure = currentTimeSig.numerator;
    const measureEndBeat = currentBeat + beatsInThisMeasure;

    if (absoluteBeat < measureEndBeat) {
      // Found the measure containing this beat
      return {
        measureNumber: currentMeasure,
        beatInMeasure: absoluteBeat - currentBeat,
        timeSignature: currentTimeSig,
      };
    }

    currentBeat = measureEndBeat;
    currentMeasure++;
  }

  // Shouldn't reach here, but handle edge case
  return {
    measureNumber: currentMeasure,
    beatInMeasure: 0,
    timeSignature: currentTimeSig,
  };
}

/**
 * Get the absolute beat position where a measure starts.
 * Accounts for time signature changes.
 */
export function getAbsoluteBeatForMeasure(
  measureNumber: number,
  initialTimeSig: TimeSignature,
  changes?: TimeSignatureChange[],
): number {
  if (!changes || changes.length === 0) {
    return measureNumber * initialTimeSig.numerator;
  }

  // Sort changes by measure number
  const sortedChanges = [...changes].sort(
    (a, b) => a.measureNumber - b.measureNumber,
  );

  let totalBeats = 0;
  let currentTimeSig = initialTimeSig;

  for (let m = 0; m < measureNumber; m++) {
    // Check if there's a time signature change at this measure
    const changeAtMeasure = sortedChanges.find((c) => c.measureNumber === m);
    if (changeAtMeasure) {
      currentTimeSig = changeAtMeasure.timeSignature;
    }

    totalBeats += currentTimeSig.numerator;
  }

  return totalBeats;
}

/**
 * Get the number of beats in a specific measure.
 */
export function getBeatsInMeasure(
  measureNumber: number,
  initialTimeSig: TimeSignature,
  changes?: TimeSignatureChange[],
): number {
  const timeSig = getTimeSignatureAtMeasure(
    measureNumber,
    initialTimeSig,
    changes,
  );
  return timeSig.numerator;
}

/**
 * Build an array of MeasureInfo for all measures up to a given count.
 * This pre-computes all measure boundaries for efficient lookups.
 */
export function buildMeasureBoundaries(
  totalMeasures: number,
  initialTimeSig: TimeSignature,
  changes?: TimeSignatureChange[],
): MeasureInfo[] {
  const measures: MeasureInfo[] = [];
  let currentBeat = 0;

  // Sort changes by measure number
  const sortedChanges = changes
    ? [...changes].sort((a, b) => a.measureNumber - b.measureNumber)
    : [];

  let currentTimeSig = initialTimeSig;

  for (let m = 0; m < totalMeasures; m++) {
    // Check if there's a time signature change at this measure
    const changeAtMeasure = sortedChanges.find((c) => c.measureNumber === m);
    if (changeAtMeasure) {
      currentTimeSig = changeAtMeasure.timeSignature;
    }

    const beatsInMeasure = currentTimeSig.numerator;
    const endBeat = currentBeat + beatsInMeasure;

    measures.push({
      measureNumber: m,
      startBeat: currentBeat,
      endBeat,
      beatsInMeasure,
      timeSignature: { ...currentTimeSig },
    });

    currentBeat = endBeat;
  }

  return measures;
}

/**
 * Get total beats for a given number of measures, accounting for time signature changes.
 */
export function getTotalBeats(
  totalMeasures: number,
  initialTimeSig: TimeSignature,
  changes?: TimeSignatureChange[],
): number {
  if (!changes || changes.length === 0) {
    return totalMeasures * initialTimeSig.numerator;
  }

  // Use getAbsoluteBeatForMeasure to get the start of the measure after the last one
  return getAbsoluteBeatForMeasure(totalMeasures, initialTimeSig, changes);
}

/**
 * Find which measure contains a given absolute beat.
 * Returns -1 if the beat is beyond all measures.
 */
export function findMeasureContainingBeat(
  absoluteBeat: number,
  measures: MeasureInfo[],
): number {
  for (const measure of measures) {
    if (absoluteBeat >= measure.startBeat && absoluteBeat < measure.endBeat) {
      return measure.measureNumber;
    }
  }
  return -1;
}

/**
 * Get a list of all measures where time signature changes occur.
 * Returns measure numbers sorted in ascending order.
 */
export function getTimeSignatureChangeMeasures(
  changes?: TimeSignatureChange[],
): number[] {
  if (!changes || changes.length === 0) {
    return [];
  }

  return [...changes].map((c) => c.measureNumber).sort((a, b) => a - b);
}
