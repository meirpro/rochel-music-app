"use client";

import {
  TimeSignature,
  TIME_SIG_NUMERATORS,
  TIME_SIG_DENOMINATORS,
} from "./NoteEditor";
import { InstrumentType, INSTRUMENT_NAMES } from "@/lib/audio/TonePlayer";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;

  // Settings
  tempo: number;
  onTempoChange: (tempo: number) => void;

  timeSignature: TimeSignature;
  onTimeSignatureChange: (ts: TimeSignature) => void;

  instrument: InstrumentType;
  onInstrumentChange: (instrument: InstrumentType) => void;

  showLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;

  showKidFaces: boolean;
  onShowKidFacesChange: (show: boolean) => void;

  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;

  allowChords: boolean;
  onAllowChordsChange: (allow: boolean) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  tempo,
  onTempoChange,
  timeSignature,
  onTimeSignatureChange,
  instrument,
  onInstrumentChange,
  showLabels,
  onShowLabelsChange,
  showKidFaces,
  onShowKidFacesChange,
  showGrid,
  onShowGridChange,
  allowChords,
  onAllowChordsChange,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-200 to-blue-200 text-purple-800 p-6 border-b-2 border-purple-300">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Settings</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 flex items-center justify-center text-2xl transition-colors text-purple-700"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Tempo Section */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              Tempo (Speed)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="40"
                max="200"
                value={tempo}
                onChange={(e) => onTempoChange(Number(e.target.value))}
                className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #c084fc 0%, #c084fc ${((tempo - 40) / 160) * 100}%, #e5e7eb ${((tempo - 40) / 160) * 100}%, #e5e7eb 100%)`,
                }}
              />
              <div className="w-20 text-center">
                <div className="text-2xl font-semibold text-purple-600">
                  {tempo}
                </div>
                <div className="text-xs text-gray-500">BPM</div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Time Signature Section */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              Time Signature
            </label>
            <div className="flex items-end gap-4">
              {/* Numerator Dropdown */}
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-2">
                  Beats per measure
                </label>
                <select
                  value={timeSignature.numerator}
                  onChange={(e) =>
                    onTimeSignatureChange({
                      numerator: Number(e.target.value),
                      denominator: timeSignature.denominator,
                    })
                  }
                  className="w-full px-4 py-3 text-lg font-semibold text-center border-2 border-purple-200 rounded-xl focus:border-purple-300 focus:outline-none bg-white cursor-pointer hover:bg-purple-50 transition-colors shadow-sm"
                >
                  {TIME_SIG_NUMERATORS.map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              {/* Divider */}
              <div className="text-4xl font-semibold text-purple-300 pb-3">
                /
              </div>

              {/* Denominator Dropdown */}
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-2">
                  Note value
                </label>
                <select
                  value={timeSignature.denominator}
                  onChange={(e) =>
                    onTimeSignatureChange({
                      numerator: timeSignature.numerator,
                      denominator: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 text-lg font-semibold text-center border-2 border-blue-200 rounded-xl focus:border-blue-300 focus:outline-none bg-white cursor-pointer hover:bg-blue-50 transition-colors shadow-sm"
                >
                  {TIME_SIG_DENOMINATORS.map((denom) => (
                    <option key={denom} value={denom}>
                      {denom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-center text-sm text-gray-500">
              Current:{" "}
              <span className="font-semibold text-gray-700">
                {timeSignature.numerator}/{timeSignature.denominator}
              </span>
            </div>
          </div>

          {/* Instrument Section */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              Instrument Sound
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(INSTRUMENT_NAMES) as InstrumentType[]).map(
                (inst) => (
                  <button
                    key={inst}
                    onClick={() => onInstrumentChange(inst)}
                    className={`px-3 py-2.5 rounded-xl font-medium transition-all text-sm ${
                      instrument === inst
                        ? "bg-purple-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-purple-100"
                    }`}
                  >
                    {INSTRUMENT_NAMES[inst]}
                  </button>
                ),
              )}
            </div>
            <a
              href="https://tonejs.github.io/examples/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-500 hover:text-purple-700 underline"
            >
              Explore more sounds on Tone.js →
            </a>
          </div>

          {/* Display Options */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-gray-800">
              Display Options
            </label>

            {/* Toggle Switches */}
            <div className="space-y-3">
              <ToggleSwitch
                label="Note Names (C, D, E...)"
                checked={showLabels}
                onChange={onShowLabelsChange}
                color="emerald"
              />

              <ToggleSwitch
                label="Kid Faces"
                checked={showKidFaces}
                onChange={onShowKidFacesChange}
                color="pink"
              />

              <ToggleSwitch
                label="Grid Lines"
                checked={showGrid}
                onChange={onShowGridChange}
                color="blue"
              />

              <ToggleSwitch
                label="Chords (Multiple Notes)"
                checked={allowChords}
                onChange={onAllowChordsChange}
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-purple-50 p-4 rounded-b-2xl border-t border-purple-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-purple-200 to-blue-200 text-purple-800 font-semibold rounded-xl hover:from-purple-300 hover:to-blue-300 transition-all text-lg shadow-sm"
          >
            Done ✓
          </button>
        </div>
      </div>
    </div>
  );
}

// Toggle Switch Component (Kid-Friendly)
interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color: "emerald" | "pink" | "blue" | "purple";
}

function ToggleSwitch({ label, checked, onChange, color }: ToggleSwitchProps) {
  const colorClasses = {
    emerald: "bg-emerald-300",
    pink: "bg-pink-300",
    blue: "bg-blue-300",
    purple: "bg-purple-300",
  };

  return (
    <label className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
      <span className="text-base font-medium text-gray-700">{label}</span>
      <div
        className={`relative w-14 h-7 rounded-full transition-colors ${
          checked ? colorClasses[color] : "bg-gray-200"
        }`}
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
      >
        <div
          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
            checked ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
}
