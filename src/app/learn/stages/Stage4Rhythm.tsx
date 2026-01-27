"use client";

import { useState, useCallback } from "react";
import { ConceptCard } from "../components/ConceptCard";
import { StageComplete } from "../components/StageComplete";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { pitchToMidi } from "@/lib/constants";

interface Stage4RhythmProps {
  onComplete: () => void;
}

export function Stage4Rhythm({ onComplete }: Stage4RhythmProps) {
  const [step, setStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [playingPattern, setPlayingPattern] = useState<string | null>(null);

  // Play a rhythm pattern
  const playPattern = useCallback(
    async (patternId: string, durations: number[]) => {
      const player = getAudioPlayer();
      const midi = pitchToMidi("C4");
      if (midi === null) return;

      setPlayingPattern(patternId);
      for (const duration of durations) {
        player.playNote(midi, duration * 0.4);
        // Wait before next note
        await new Promise((resolve) => setTimeout(resolve, duration * 400));
      }
      setPlayingPattern(null);
    },
    [],
  );

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
          Rhythm & Shorter Notes
        </h1>
        <p className="text-gray-600">
          Learn eighth notes, dotted notes, and rhythmic patterns
        </p>
      </div>

      {/* Step 1: Eighth notes */}
      {step >= 0 && (
        <ConceptCard title="Eighth Notes" emoji="🎵">
          <p className="mb-4">
            An <strong>eighth note</strong> lasts half a beat — twice as fast as
            a quarter note. You can fit <strong>2 eighth notes</strong> in the
            time of 1 quarter note.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 my-4 flex justify-around items-center">
            <div className="text-center">
              <div className="text-4xl mb-2">♩</div>
              <div className="text-sm font-medium">Quarter</div>
              <div className="text-xs text-gray-500">1 beat</div>
            </div>
            <div className="text-2xl text-gray-400">=</div>
            <div className="text-center">
              <div className="text-4xl mb-2">♫</div>
              <div className="text-sm font-medium">2 Eighths</div>
              <div className="text-xs text-gray-500">½ + ½ beat</div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Eighth notes have a <strong>flag</strong> on their stem (or are{" "}
            <strong>beamed together</strong> in pairs).
          </p>
        </ConceptCard>
      )}

      {/* Step 2: Beaming */}
      {step >= 1 && (
        <ConceptCard title="Beaming" emoji="🔗">
          <p className="mb-4">
            When eighth notes are next to each other, their flags are connected
            by a <strong>beam</strong>. This makes them easier to read!
          </p>
          <div className="bg-purple-50 rounded-lg p-4 my-4 flex justify-around items-center">
            <div className="text-center">
              <div className="text-3xl mb-2">♪ ♪</div>
              <div className="text-sm text-gray-500">Separate flags</div>
            </div>
            <div className="text-2xl text-gray-400">→</div>
            <div className="text-center">
              <div className="text-3xl mb-2">♫</div>
              <div className="text-sm text-gray-500">Beamed together</div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Notes are typically beamed by beat or by groups of beats, making it
            easier to see the rhythm at a glance.
          </p>
        </ConceptCard>
      )}

      {/* Step 3: Dotted notes */}
      {step >= 2 && (
        <ConceptCard title="Dotted Notes" emoji="•">
          <p className="mb-4">
            A <strong>dot</strong> after a note makes it{" "}
            <strong>1.5 times longer</strong>. It adds half the note&apos;s
            value.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 my-4 space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-32 text-right font-medium">Dotted half:</div>
              <div className="flex-1">
                2 + 1 = <strong>3 beats</strong>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-right font-medium">Dotted quarter:</div>
              <div className="flex-1">
                1 + ½ = <strong>1.5 beats</strong>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 text-right font-medium">Dotted eighth:</div>
              <div className="flex-1">
                ½ + ¼ = <strong>0.75 beats</strong>
              </div>
            </div>
          </div>
        </ConceptCard>
      )}

      {/* Step 4: Rhythm patterns */}
      {step >= 3 && (
        <ConceptCard
          title="Try Rhythm Patterns"
          emoji="🎶"
          variant="interactive"
        >
          <p className="mb-4">
            Click each pattern to hear how different rhythms sound:
          </p>
          <div className="space-y-3 my-4">
            {/* Pattern 1: All quarters */}
            <button
              onClick={() => playPattern("quarters", [1, 1, 1, 1])}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                playingPattern === "quarters"
                  ? "border-teal-400 bg-teal-50"
                  : "border-purple-200 hover:border-purple-300"
              }`}
            >
              <div className="font-medium">♩ ♩ ♩ ♩</div>
              <div className="text-sm text-gray-500">
                Four quarter notes (1-2-3-4)
              </div>
            </button>

            {/* Pattern 2: Mixed */}
            <button
              onClick={() => playPattern("mixed", [2, 0.5, 0.5, 1])}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                playingPattern === "mixed"
                  ? "border-teal-400 bg-teal-50"
                  : "border-purple-200 hover:border-purple-300"
              }`}
            >
              <div className="font-medium">𝅗𝅥 ♫ ♩</div>
              <div className="text-sm text-gray-500">
                Half + two eighths + quarter
              </div>
            </button>

            {/* Pattern 3: Eighth notes */}
            <button
              onClick={() =>
                playPattern("eighths", [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5])
              }
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                playingPattern === "eighths"
                  ? "border-teal-400 bg-teal-50"
                  : "border-purple-200 hover:border-purple-300"
              }`}
            >
              <div className="font-medium">♫ ♫ ♫ ♫</div>
              <div className="text-sm text-gray-500">
                Eight eighth notes (1-and-2-and-3-and-4-and)
              </div>
            </button>
          </div>
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
      {showComplete && <StageComplete stage={4} onContinue={handleContinue} />}
    </div>
  );
}
