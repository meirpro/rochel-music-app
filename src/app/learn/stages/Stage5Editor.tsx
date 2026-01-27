"use client";

import { useState, useCallback } from "react";
import { ConceptCard } from "../components/ConceptCard";
import { StageComplete } from "../components/StageComplete";

interface Stage5EditorProps {
  onComplete: () => void;
  onExit: () => void;
}

const FEATURE_LIST = [
  {
    icon: "🎵",
    name: "Note Tools",
    description: "All note durations from whole to sixteenth",
  },
  {
    icon: "🔁",
    name: "Repeat Signs",
    description: "Mark sections to play multiple times",
  },
  {
    icon: "📝",
    name: "Lyrics",
    description: "Add words below notes",
  },
  {
    icon: "🎼",
    name: "Time Signatures",
    description: "Change meter anywhere in your piece",
  },
  {
    icon: "▶️",
    name: "Playback",
    description: "Hear your music with adjustable tempo",
  },
  {
    icon: "📁",
    name: "Song Library",
    description: "Save and load your compositions",
  },
];

export function Stage5Editor({ onComplete }: Stage5EditorProps) {
  const [step, setStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const handleNextStep = useCallback(() => {
    if (step < 2) {
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
          Full Editor Intro
        </h1>
        <p className="text-gray-600">
          You&apos;re ready to use the complete music editor!
        </p>
      </div>

      {/* Step 1: All features */}
      {step >= 0 && (
        <ConceptCard title="Everything You Can Do" emoji="🎹">
          <p className="mb-4">
            Now you know the basics! Here&apos;s everything available in the
            full editor:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
            {FEATURE_LIST.map((feature) => (
              <div
                key={feature.name}
                className="p-3 bg-purple-50 rounded-lg text-center"
              >
                <div className="text-2xl mb-1">{feature.icon}</div>
                <div className="font-medium text-purple-800 text-sm">
                  {feature.name}
                </div>
                <div className="text-xs text-gray-500">
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </ConceptCard>
      )}

      {/* Step 2: Tips for success */}
      {step >= 1 && (
        <ConceptCard title="Tips for Success" emoji="💡" variant="tip">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="text-xl">1️⃣</div>
              <div>
                <strong>Start simple</strong> — Begin with quarter notes and
                work up to faster rhythms.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-xl">2️⃣</div>
              <div>
                <strong>Use playback often</strong> — Hearing your music helps
                you catch mistakes.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-xl">3️⃣</div>
              <div>
                <strong>Save your work</strong> — Click the song name to save
                before closing.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-xl">4️⃣</div>
              <div>
                <strong>Explore!</strong> — Try all the tools. You can always
                undo with Ctrl+Z.
              </div>
            </div>
          </div>
        </ConceptCard>
      )}

      {/* Step 3: Ready to go */}
      {step >= 2 && (
        <ConceptCard title="You're Ready!" emoji="🎉" variant="interactive">
          <p className="mb-4">
            Congratulations on completing the learning stages! You now
            understand:
          </p>
          <div className="bg-teal-50 rounded-lg p-4 my-4">
            <ul className="space-y-2 text-teal-800">
              <li className="flex items-center gap-2">
                <span className="text-teal-500">✓</span> How to read the staff
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal-500">✓</span> Note durations and
                rhythms
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal-500">✓</span> Measures and time
                signatures
              </li>
              <li className="flex items-center gap-2">
                <span className="text-teal-500">✓</span> How to use the editor
              </li>
            </ul>
          </div>
          <p className="text-gray-600 text-center">
            Click the button below to start creating music!
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
          className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 transition-all shadow-md"
        >
          {step < 2 ? "Next →" : "Graduate & Go to Editor! 🎓"}
        </button>
      </div>

      {/* Stage complete modal */}
      {showComplete && (
        <StageComplete stage={5} onContinue={handleContinue} isFinalStage />
      )}
    </div>
  );
}
