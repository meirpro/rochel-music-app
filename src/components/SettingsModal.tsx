"use client";

import {
  TimeSignature,
  TIME_SIG_NUMERATORS,
  TIME_SIG_DENOMINATORS,
} from "./NoteEditorRefactored";
import {
  InstrumentType,
  INSTRUMENT_NAMES,
  INSTRUMENT_GAIN_DEFAULTS,
} from "@/lib/audio/TonePlayer";

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

  volume: number;
  onVolumeChange: (volume: number) => void;

  instrumentGains: Record<InstrumentType, number>;
  onInstrumentGainsChange: (gains: Record<InstrumentType, number>) => void;

  showLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;

  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;

  allowChords: boolean;
  onAllowChordsChange: (allow: boolean) => void;

  staffLines: number;
  onStaffLinesChange: (count: number) => void;

  noteSpacing: number;
  onNoteSpacingChange: (spacing: number) => void;

  showMeasureErrors: boolean;
  onShowMeasureErrorsChange: (show: boolean) => void;
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
  volume,
  onVolumeChange,
  instrumentGains,
  onInstrumentGainsChange,
  showLabels,
  onShowLabelsChange,
  showGrid,
  onShowGridChange,
  allowChords,
  onAllowChordsChange,
  staffLines,
  onStaffLinesChange,
  noteSpacing,
  onNoteSpacingChange,
  showMeasureErrors,
  onShowMeasureErrorsChange,
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
              className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/80 flex items-center justify-center transition-colors text-purple-700"
              aria-label="Close"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="3" y1="3" x2="13" y2="13" />
                <line x1="13" y1="3" x2="3" y2="13" />
              </svg>
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
                max="300"
                value={tempo}
                onChange={(e) => onTempoChange(Number(e.target.value))}
                className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #c084fc 0%, #c084fc ${((tempo - 40) / 260) * 100}%, #e5e7eb ${((tempo - 40) / 260) * 100}%, #e5e7eb 100%)`,
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

          {/* Volume Section */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              Volume
            </label>
            <div className="flex items-center gap-4">
              {/* Mute/Unmute button */}
              <button
                onClick={() => onVolumeChange(volume === 0 ? 80 : 0)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  volume === 0
                    ? "bg-gray-200 text-gray-500"
                    : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                }`}
                title={volume === 0 ? "Unmute" : "Mute"}
              >
                {volume === 0 ? (
                  // Muted icon (speaker with X)
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                ) : (
                  // Volume icon (speaker with waves)
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                )}
              </button>
              {/* Volume slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="flex-1 h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #60a5fa 0%, #60a5fa ${volume}%, #e5e7eb ${volume}%, #e5e7eb 100%)`,
                }}
              />
              <div className="w-16 text-center">
                <div className="text-2xl font-semibold text-blue-600">
                  {volume}%
                </div>
              </div>
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

            {/* Instrument Balance - per-instrument gain adjustment */}
            <details className="mt-3">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-purple-600 select-none">
                Advanced: Instrument Balance
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
                <p className="text-xs text-gray-500 mb-2">
                  Adjust relative volume for each instrument (dB offset from
                  default)
                </p>
                {(Object.keys(INSTRUMENT_NAMES) as InstrumentType[]).map(
                  (inst) => {
                    const gain = instrumentGains[inst] ?? 0;
                    const defaultGain = INSTRUMENT_GAIN_DEFAULTS[inst];
                    const effectiveGain = defaultGain + gain;
                    return (
                      <div key={inst} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-16 truncate">
                          {INSTRUMENT_NAMES[inst]}
                        </span>
                        <input
                          type="range"
                          min="-12"
                          max="12"
                          step="1"
                          value={gain}
                          onChange={(e) => {
                            const newGains = { ...instrumentGains };
                            newGains[inst] = Number(e.target.value);
                            onInstrumentGainsChange(newGains);
                          }}
                          className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right,
                              #e5e7eb 0%,
                              #e5e7eb ${((gain + 12) / 24) * 100}%,
                              ${gain >= 0 ? "#a855f7" : "#ef4444"} ${((gain + 12) / 24) * 100}%,
                              ${gain >= 0 ? "#a855f7" : "#ef4444"} 50%,
                              #e5e7eb 50%,
                              #e5e7eb 100%)`,
                          }}
                        />
                        <span
                          className={`text-xs w-14 text-right ${
                            gain > 0
                              ? "text-purple-600"
                              : gain < 0
                                ? "text-red-500"
                                : "text-gray-500"
                          }`}
                        >
                          {gain > 0 ? "+" : ""}
                          {gain}dB ({effectiveGain > 0 ? "+" : ""}
                          {effectiveGain})
                        </span>
                      </div>
                    );
                  },
                )}
                <button
                  onClick={() => {
                    const resetGains: Record<InstrumentType, number> = {
                      piano: 0,
                      organ: 0,
                      bell: 0,
                      synth: 0,
                      "music-box": 0,
                      marimba: 0,
                    };
                    onInstrumentGainsChange(resetGains);
                  }}
                  className="text-xs text-purple-500 hover:text-purple-700 underline mt-1"
                >
                  Reset to defaults
                </button>
              </div>
            </details>
          </div>

          {/* Display Options */}
          <div className="space-y-3">
            <label className="text-lg font-semibold text-gray-800">
              Display Options
            </label>

            {/* Staff Lines Slider - controls horizontal lines per staff */}
            <div className="p-3 bg-white rounded-xl border-2 border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-700">
                  Staff Lines
                </span>
                <span className="text-lg font-semibold text-blue-600">
                  {staffLines}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-4">3</span>
                <input
                  type="range"
                  min="3"
                  max="5"
                  step="1"
                  value={staffLines}
                  onChange={(e) => onStaffLinesChange(Number(e.target.value))}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #60a5fa 0%, #60a5fa ${((staffLines - 3) / 2) * 100}%, #e5e7eb ${((staffLines - 3) / 2) * 100}%, #e5e7eb 100%)`,
                  }}
                />
                <span className="text-xs text-gray-500 w-4">5</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 px-5">
                {[3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={n === staffLines ? "text-blue-600" : ""}
                  >
                    {n === staffLines ? "●" : "○"}
                  </span>
                ))}
              </div>
            </div>

            {/* Note Spacing Slider - controls beat width */}
            <div className="p-3 bg-white rounded-xl border-2 border-gray-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-700">
                  Note Spacing
                </span>
                <span className="text-lg font-semibold text-purple-600">
                  {Math.round(noteSpacing * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-10">100%</span>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.1"
                  value={noteSpacing}
                  onChange={(e) => onNoteSpacingChange(Number(e.target.value))}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #c084fc 0%, #c084fc ${((noteSpacing - 1) / 1) * 100}%, #e5e7eb ${((noteSpacing - 1) / 1) * 100}%, #e5e7eb 100%)`,
                  }}
                />
                <span className="text-xs text-gray-500 w-10">200%</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-10">
                <span>Compact</span>
                <span>Spacious</span>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="space-y-3">
              <ToggleSwitchWithDescription
                label="Note Names (C, D, E...)"
                description="Display note letter names inside each note head"
                checked={showLabels}
                onChange={onShowLabelsChange}
                color="emerald"
              />

              <ToggleSwitchWithDescription
                label="Grid Lines"
                description="Show dashed vertical lines at each beat position to help with note placement"
                checked={showGrid}
                onChange={onShowGridChange}
                color="blue"
              />

              <ToggleSwitchWithDescription
                label="Chords (Multiple Notes)"
                description="Allow placing multiple notes at the same beat position to create chords"
                checked={allowChords}
                onChange={onAllowChordsChange}
                color="purple"
              />

              <ToggleSwitchWithDescription
                label="Measure Validation"
                description="Highlight measures with incorrect beat counts in red"
                checked={showMeasureErrors}
                onChange={onShowMeasureErrorsChange}
                color="pink"
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

// Toggle Switch Component with Description
interface ToggleSwitchWithDescriptionProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  color: "emerald" | "pink" | "blue" | "purple";
}

function ToggleSwitchWithDescription({
  label,
  description,
  checked,
  onChange,
  color,
}: ToggleSwitchWithDescriptionProps) {
  const colorClasses = {
    emerald: "bg-emerald-300",
    pink: "bg-pink-300",
    blue: "bg-blue-300",
    purple: "bg-purple-300",
  };

  return (
    <div
      className="p-3 bg-white rounded-xl border-2 border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-gray-700">{label}</span>
        <div
          className={`relative w-14 h-7 rounded-full transition-colors ${
            checked ? colorClasses[color] : "bg-gray-200"
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
              checked ? "translate-x-7" : "translate-x-0"
            }`}
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1.5">{description}</p>
    </div>
  );
}
