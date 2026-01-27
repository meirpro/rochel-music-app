"use client";

import { useState, useCallback } from "react";
import { ConceptCard } from "../components/ConceptCard";
import { StageComplete } from "../components/StageComplete";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { pitchToMidi } from "@/lib/constants";

interface Stage2DurationsProps {
  onComplete: () => void;
}

// Duration info for teaching
const DURATION_INFO = [
  {
    name: "Whole Note",
    beats: 4,
    emoji: "⬭",
    description: "Hold for 4 beats (count: 1-2-3-4)",
    visual: "○",
  },
  {
    name: "Half Note",
    beats: 2,
    emoji: "◐",
    description: "Hold for 2 beats (count: 1-2)",
    visual: "𝅗𝅥",
  },
  {
    name: "Quarter Note",
    beats: 1,
    emoji: "●",
    description: "Hold for 1 beat (count: 1)",
    visual: "♩",
  },
];

export function Stage2Durations({ onComplete }: Stage2DurationsProps) {
  const [step, setStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [playingDuration, setPlayingDuration] = useState<number | null>(null);

  const handlePlayDuration = useCallback((beats: number) => {
    const player = getAudioPlayer();
    const midi = pitchToMidi("C4");
    if (midi !== null) {
      setPlayingDuration(beats);
      // Play note for the duration (at 60 BPM, 1 beat = 1 second)
      player.playNote(midi, beats * 0.5);
      setTimeout(() => setPlayingDuration(null), beats * 500);
    }
  }, []);

  const handleNextStep = useCallback(() => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setShowComplete(true);
    }
  }, [step]);

  const handleContinue = useCallback(() => {
    setShowComplete(false);
    onComplete();
  }, [onComplete]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Stage intro */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">
          Note Durations
        </h1>
        <p className="text-gray-600">Learn how long to hold each note</p>
      </div>

      {/* Step 1: Notes have length */}
      {step >= 0 && (
        <ConceptCard title="Notes Have Length" emoji="⏱️">
          <p className="mb-4">
            When you sing or play a note, you hold it for a certain amount of
            time. Some notes are <strong>long</strong>, and some are{" "}
            <strong>short</strong>.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 my-4 text-center">
            <div className="text-lg">
              Think of it like holding your voice:
              <br />
              <span className="text-purple-600 font-mono">
                &quot;Laaaaaaaa&quot;
              </span>{" "}
              (long) vs{" "}
              <span className="text-purple-600 font-mono">&quot;La&quot;</span>{" "}
              (short)
            </div>
          </div>
          <p className="text-sm text-gray-600">
            We measure note length in <strong>beats</strong> — like counting
            along to music.
          </p>
        </ConceptCard>
      )}

      {/* Step 2: Meet the durations */}
      {step >= 1 && (
        <ConceptCard
          title="Three Basic Durations"
          emoji="🎶"
          variant="interactive"
        >
          <p className="mb-4">
            Click each note type to hear how long it lasts!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
            {DURATION_INFO.map((duration) => {
              const isPlaying = playingDuration === duration.beats;
              return (
                <button
                  key={duration.name}
                  onClick={() => handlePlayDuration(duration.beats)}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-center
                    ${
                      isPlaying
                        ? "border-teal-400 bg-teal-50 ring-2 ring-teal-300"
                        : "border-purple-200 bg-white hover:border-purple-300"
                    }
                  `}
                >
                  <div className="text-4xl mb-2">{duration.visual}</div>
                  <div className="font-bold text-purple-800">
                    {duration.name}
                  </div>
                  <div className="text-lg text-purple-600 font-semibold">
                    {duration.beats} beat{duration.beats > 1 ? "s" : ""}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {duration.description}
                  </div>
                  {isPlaying && (
                    <div className="mt-2 text-teal-600 text-sm animate-pulse">
                      Playing...
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </ConceptCard>
      )}

      {/* Step 3: Visual comparison */}
      {step >= 2 && (
        <ConceptCard title="Compare the Lengths" emoji="📊">
          <p className="mb-4">See how the durations relate to each other:</p>
          <div className="bg-gray-50 rounded-lg p-4 my-4 space-y-3">
            {/* Whole note bar */}
            <div className="flex items-center gap-3">
              <div className="w-20 text-right text-sm font-medium">
                Whole (4)
              </div>
              <div className="flex-1 h-8 bg-purple-500 rounded flex items-center justify-center text-white text-xs">
                1 - 2 - 3 - 4
              </div>
            </div>
            {/* Half note bars */}
            <div className="flex items-center gap-3">
              <div className="w-20 text-right text-sm font-medium">
                Half (2)
              </div>
              <div className="flex-1 flex gap-1">
                <div className="flex-1 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs">
                  1 - 2
                </div>
                <div className="flex-1 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs">
                  3 - 4
                </div>
              </div>
            </div>
            {/* Quarter note bars */}
            <div className="flex items-center gap-3">
              <div className="w-20 text-right text-sm font-medium">
                Quarter (1)
              </div>
              <div className="flex-1 flex gap-1">
                {[1, 2, 3, 4].map((beat) => (
                  <div
                    key={beat}
                    className="flex-1 h-8 bg-teal-500 rounded flex items-center justify-center text-white text-xs"
                  >
                    {beat}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            1 whole = 2 halves = 4 quarters
          </p>
        </ConceptCard>
      )}

      {/* Step 4: Tip */}
      {step >= 3 && (
        <ConceptCard title="Counting Tip" emoji="💡" variant="tip">
          <p className="mb-4">
            When playing music, keep a steady beat in your head (or tap your
            foot!). Count along:
          </p>
          <div className="bg-amber-50 rounded-lg p-4 my-4 text-center">
            <div className="font-mono text-lg text-amber-800">
              🦶 tap - tap - tap - tap 🦶
              <br />
              <span className="text-sm text-amber-600">
                (each tap = 1 beat)
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            <strong>Practice:</strong> Try counting &quot;1, 2, 3, 4&quot; out
            loud while tapping your foot. This steady pulse is called the{" "}
            <strong>tempo</strong>!
          </p>
        </ConceptCard>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            step === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
          }`}
        >
          ← Previous
        </button>

        <button
          onClick={handleNextStep}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-md"
        >
          {step < 3 ? "Next →" : "Complete Stage →"}
        </button>
      </div>

      {/* Stage complete modal */}
      {showComplete && <StageComplete stage={2} onContinue={handleContinue} />}
    </div>
  );
}
