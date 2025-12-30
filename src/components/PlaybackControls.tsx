"use client";

interface PlaybackControlsProps {
  isPlaying: boolean;
  tempo: number;
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
  onTempoChange: (tempo: number) => void;
}

export function PlaybackControls({
  isPlaying,
  tempo,
  onPlay,
  onStop,
  onReset,
  onTempoChange,
}: PlaybackControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2.5 flex-wrap">
        <button
          onClick={onPlay}
          className="px-3 py-2.5 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 cursor-pointer transition-transform active:translate-y-px hover:bg-gray-200"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={onStop}
          className="px-3 py-2.5 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 cursor-pointer transition-transform active:translate-y-px hover:bg-gray-200"
        >
          Stop
        </button>
        <button
          onClick={onReset}
          className="px-3 py-2.5 rounded-xl border border-gray-300 bg-gray-100 text-gray-700 cursor-pointer transition-transform active:translate-y-px hover:bg-gray-200"
        >
          Reset
        </button>
      </div>

      <div>
        <label htmlFor="tempo" className="block text-xs text-gray-500 mb-1">
          Tempo (beats per minute): <b className="text-gray-700">{tempo}</b>
        </label>
        <input
          id="tempo"
          type="range"
          min="60"
          max="140"
          value={tempo}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="text-xs text-gray-500 mt-1">
          This sheet is in 4/4. Faster tempo = notes move quicker.
        </div>
      </div>
    </div>
  );
}
