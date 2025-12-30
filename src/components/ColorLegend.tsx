"use client";

import { NOTE_COLORS } from "@/lib/constants";

interface ColorLegendProps {
  monoMode?: boolean;
}

const NOTES = ["C", "D", "E", "F", "G", "A", "B"] as const;
const LABELS: Record<string, string> = {
  C: "(also top C)",
  D: "",
  E: "",
  F: "",
  G: "",
  A: "",
  B: "",
};

export function ColorLegend({ monoMode = false }: ColorLegendProps) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2.5">
      {NOTES.map((note) => (
        <div
          key={note}
          className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-gray-200 bg-gray-50"
        >
          <div
            className="w-3.5 h-3.5 rounded-md border border-gray-300 flex-shrink-0"
            style={{
              backgroundColor: monoMode ? "#e5e7eb" : NOTE_COLORS[note],
            }}
          />
          <span className="text-xs font-bold text-gray-700">{note}</span>
          {LABELS[note] && (
            <span className="text-xs text-gray-500">{LABELS[note]}</span>
          )}
        </div>
      ))}
    </div>
  );
}
