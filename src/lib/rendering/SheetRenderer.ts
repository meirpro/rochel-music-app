import {
  Song,
  RenderedNote,
  LayoutResult,
  SystemInfo,
  RepeatBarType,
} from "../types";
import { STAFF_CONFIG, getNoteInfo } from "../constants";

// Calculate Y position for a staff position within a system
export function getYForPosition(position: number, systemTop: number): number {
  const { lineGap, lines } = STAFF_CONFIG;
  const bottomLineY = systemTop + (lines - 1) * lineGap;
  // Position 2 is the bottom line (E4)
  return bottomLineY - (position - 2) * (lineGap / 2);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// Calculate layout for all notes in a song with multi-line wrapping
export function layoutNotes(
  song: Song,
  canvasWidth: number,
  scale: number = 1,
): LayoutResult {
  const {
    padding,
    leftStart,
    topMargin,
    systemGap,
    targetMeasureWidth,
    minMeasuresPerSystem,
    maxMeasuresPerSystem,
  } = STAFF_CONFIG;

  // Apply scale to measure width (larger scale = wider measures = fewer per line)
  const scaledMeasureWidth = targetMeasureWidth * scale;

  const leftX = padding + leftStart;
  const rightPad = padding;
  const usableWidth = canvasWidth - leftX - rightPad;

  // Calculate total beats and measures
  const totalBeats = song.notes.reduce((sum, note) => sum + note.duration, 0);
  const totalMeasures = Math.ceil(totalBeats / song.beatsPerMeasure);

  // Calculate measures per system based on available width and scale
  const measuresPerSystem = clamp(
    Math.floor(usableWidth / scaledMeasureWidth),
    minMeasuresPerSystem,
    maxMeasuresPerSystem,
  );

  const totalSystems = Math.ceil(totalMeasures / measuresPerSystem);

  // Calculate canvas height based on number of systems
  const canvasHeight = Math.max(400, topMargin + totalSystems * systemGap + 80);

  // Helper to get repeat bar type for a measure boundary
  const getBarType = (measureIndex: number): RepeatBarType => {
    if (!song.repeats) return "none";

    let isStart = false;
    let isEnd = false;

    for (const repeat of song.repeats) {
      if (measureIndex === repeat.startMeasure) isStart = true;
      if (measureIndex === repeat.endMeasure + 1) isEnd = true;
    }

    if (isStart && isEnd) return "both";
    if (isStart) return "start";
    if (isEnd) return "end";
    return "none";
  };

  // Calculate consistent pxPerBeat for all systems (based on full measures per system)
  const consistentPxPerBeat =
    usableWidth / (measuresPerSystem * song.beatsPerMeasure);

  // Build systems info
  const systems: SystemInfo[] = [];
  for (let s = 0; s < totalSystems; s++) {
    const measuresInSystem = Math.min(
      measuresPerSystem,
      totalMeasures - s * measuresPerSystem,
    );
    // Use consistent pxPerBeat so last line doesn't stretch
    const pxPerBeat = consistentPxPerBeat;
    const systemTop = topMargin + s * systemGap;
    const startMeasureIndex = s * measuresPerSystem;

    // Calculate bar positions and types for this system
    const bars: number[] = [];
    const barTypes: RepeatBarType[] = [];
    for (let m = 0; m <= measuresInSystem; m++) {
      bars.push(leftX + m * song.beatsPerMeasure * pxPerBeat);
      barTypes.push(getBarType(startMeasureIndex + m));
    }

    systems.push({
      bars,
      barTypes,
      systemTop,
      measuresInSystem,
      pxPerBeat,
      startMeasureIndex,
    });
  }

  // Layout each note
  const renderedNotes: RenderedNote[] = [];
  let currentBeat = 0;

  song.notes.forEach((note, index) => {
    const noteInfo = getNoteInfo(note.pitch);

    // Determine which system and position within system
    const measureIndex = Math.floor(currentBeat / song.beatsPerMeasure);
    const beatInMeasure = currentBeat % song.beatsPerMeasure;
    const systemIndex = Math.floor(measureIndex / measuresPerSystem);
    const measureInSystem = measureIndex % measuresPerSystem;

    // Get system info
    const system = systems[systemIndex];
    if (!system) {
      currentBeat += note.duration;
      return;
    }

    // Calculate x position (with offset so notes don't sit on bar lines/beat boundaries)
    const noteOffset = system.pxPerBeat * 0.25;
    const x =
      leftX +
      (measureInSystem * song.beatsPerMeasure + beatInMeasure) *
        system.pxPerBeat +
      noteOffset;
    const y = getYForPosition(noteInfo.staffPosition, system.systemTop);

    renderedNotes.push({
      ...note,
      x,
      y,
      staffPosition: noteInfo.staffPosition,
      midi: noteInfo.midi,
      displayName: noteInfo.name,
      index,
      systemIndex,
      beatPosition: currentBeat,
      pxPerBeat: system.pxPerBeat,
    });

    currentBeat += note.duration;
  });

  return {
    notes: renderedNotes,
    systems,
    totalBeats,
    beatsPerMeasure: song.beatsPerMeasure,
    totalMeasures,
    measuresPerSystem,
    canvasHeight,
    repeats: song.repeats,
  };
}

// Get the X position of the playhead based on current beat position
export function getPlayheadPosition(
  layout: LayoutResult,
  currentBeat: number,
): { x: number; systemTop: number; systemIndex: number } | null {
  const { systems, beatsPerMeasure, measuresPerSystem } = layout;
  const { padding, leftStart } = STAFF_CONFIG;
  const leftX = padding + leftStart;

  // Determine which system the playhead is on
  const measureIndex = Math.floor(currentBeat / beatsPerMeasure);
  const beatInMeasure = currentBeat % beatsPerMeasure;
  const systemIndex = Math.floor(measureIndex / measuresPerSystem);
  const measureInSystem = measureIndex % measuresPerSystem;

  const system = systems[systemIndex];
  if (!system) return null;

  // Apply same offset as notes so playhead aligns with note positions
  const noteOffset = system.pxPerBeat * 0.25;
  const x =
    leftX +
    (measureInSystem * beatsPerMeasure + beatInMeasure) * system.pxPerBeat +
    noteOffset;

  return {
    x,
    systemTop: system.systemTop,
    systemIndex,
  };
}

// Expand notes array to include repeated sections for playback
// Returns an array of indices into the original notes array
export function expandNotesForPlayback(
  layout: LayoutResult,
): { noteIndex: number; beatPosition: number }[] {
  const { notes, beatsPerMeasure, repeats } = layout;
  const result: { noteIndex: number; beatPosition: number }[] = [];

  if (!repeats || repeats.length === 0) {
    // No repeats, just return sequential indices
    let beat = 0;
    notes.forEach((note, index) => {
      result.push({ noteIndex: index, beatPosition: beat });
      beat += note.duration;
    });
    return result;
  }

  // Group notes by measure
  const notesByMeasure: Map<number, number[]> = new Map();
  notes.forEach((note, index) => {
    const measureIndex = Math.floor(note.beatPosition / beatsPerMeasure);
    if (!notesByMeasure.has(measureIndex)) {
      notesByMeasure.set(measureIndex, []);
    }
    notesByMeasure.get(measureIndex)!.push(index);
  });

  // Find total measures
  const totalMeasures = Math.ceil(
    notes.reduce((sum, n) => sum + n.duration, 0) / beatsPerMeasure,
  );

  // Build playback order accounting for repeats
  let currentBeat = 0;
  let measure = 0;

  while (measure < totalMeasures) {
    // Check if we're at a repeat section
    const repeat = repeats.find((r) => r.startMeasure === measure);

    if (repeat) {
      // Play through the repeat section 'times' times
      for (let pass = 0; pass < repeat.times; pass++) {
        for (let m = repeat.startMeasure; m <= repeat.endMeasure; m++) {
          const noteIndices = notesByMeasure.get(m) || [];
          for (const noteIndex of noteIndices) {
            result.push({ noteIndex, beatPosition: currentBeat });
            currentBeat += notes[noteIndex].duration;
          }
        }
      }
      measure = repeat.endMeasure + 1;
    } else {
      // Regular measure, play once
      const noteIndices = notesByMeasure.get(measure) || [];
      for (const noteIndex of noteIndices) {
        result.push({ noteIndex, beatPosition: currentBeat });
        currentBeat += notes[noteIndex].duration;
      }
      measure++;
    }
  }

  return result;
}

// Get total playback beats including repeats
export function getTotalPlaybackBeats(layout: LayoutResult): number {
  const expanded = expandNotesForPlayback(layout);
  if (expanded.length === 0) return 0;
  const last = expanded[expanded.length - 1];
  const lastNote = layout.notes[last.noteIndex];
  return last.beatPosition + lastNote.duration;
}

// Convert canvas click coordinates to actual coordinates
export function getCanvasCoordinates(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}
