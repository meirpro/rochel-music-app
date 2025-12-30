"use client";

interface DisplayOptionsProps {
  showLabels: boolean;
  monoMode: boolean;
  useStandardNotation: boolean;
  onShowLabelsChange: (show: boolean) => void;
  onMonoModeChange: (mono: boolean) => void;
  onNotationStyleChange: (standard: boolean) => void;
}

export function DisplayOptions({
  showLabels,
  monoMode,
  useStandardNotation,
  onShowLabelsChange,
  onMonoModeChange,
  onNotationStyleChange,
}: DisplayOptionsProps) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="notation" className="block text-xs text-gray-500 mb-1">
          Notation style
        </label>
        <select
          id="notation"
          value={useStandardNotation ? "standard" : "kid"}
          onChange={(e) => onNotationStyleChange(e.target.value === "standard")}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="kid">Kid-friendly (colored ovals with letters)</option>
          <option value="standard">Standard notation (music symbols)</option>
        </select>
      </div>

      {!useStandardNotation && (
        <div>
          <label htmlFor="mode" className="block text-xs text-gray-500 mb-1">
            Color mode
          </label>
          <select
            id="mode"
            value={monoMode ? "mono" : "letters"}
            onChange={(e) => onMonoModeChange(e.target.value === "mono")}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="letters">
              Letter color coding (C=Red, D=Orange, E=Yellow, F=Green, G=Blue,
              A=Purple, B=Pink)
            </option>
            <option value="mono">Monochrome notes (no color coding)</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor="labels" className="block text-xs text-gray-500 mb-1">
          Show note labels
        </label>
        <select
          id="labels"
          value={showLabels ? "on" : "off"}
          onChange={(e) => onShowLabelsChange(e.target.value === "on")}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="on">On (letters above notes)</option>
          <option value="off">Off</option>
        </select>
      </div>

      <div className="text-xs text-gray-600 leading-relaxed">
        <b className="text-gray-700">
          Kid staff mapping (real treble positions):
        </b>
        <br />
        Ledger below = C, space below = D, bottom line = E, space = F, middle
        line = G, space = A, top line = B, space above = C.
      </div>
    </div>
  );
}
