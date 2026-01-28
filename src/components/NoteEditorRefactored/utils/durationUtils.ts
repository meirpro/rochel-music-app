// src/components/NoteEditorRefactored/utils/durationUtils.ts
// Extracted from NoteEditor.tsx lines 100-108 and 1064-1085

import { Pitch } from "@/lib/types";
import { NoteTool } from "../types";

// Helper to get display label for a pitch (e.g., "B♭" for "Bb4", "F♯" for "F#4")
export function getNoteLabel(pitch: Pitch): string {
  if (pitch === "REST") return "";
  const match = pitch.match(/^([A-G])(#|b)?/);
  if (!match) return pitch[0];
  const [, note, accidental] = match;
  if (accidental === "#") return `${note}♯`;
  if (accidental === "b") return `${note}♭`;
  return note;
}

export function getDurationFromTool(tool: NoteTool): number {
  switch (tool) {
    case "sixteenth":
      return 0.25;
    case "eighth":
      return 0.5;
    case "dotted-eighth":
      return 0.75;
    case "quarter":
      return 1;
    case "dotted-quarter":
      return 1.5;
    case "half":
      return 2;
    case "dotted-half":
      return 3;
    case "whole":
      return 4;
    default:
      return 1;
  }
}
