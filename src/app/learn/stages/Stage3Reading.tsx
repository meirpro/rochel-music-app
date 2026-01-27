"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ConceptCard } from "../components/ConceptCard";
import { StageComplete } from "../components/StageComplete";

interface Stage3ReadingProps {
  onComplete: () => void;
}

export function Stage3Reading({ onComplete }: Stage3ReadingProps) {
  const [step, setStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  // Refs for scrolling to sections
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  // Scroll to newly revealed section when step changes
  useEffect(() => {
    const refs = [step1Ref, step2Ref, step3Ref, step4Ref];
    const targetRef = refs[step];
    if (targetRef?.current && step > 0) {
      setTimeout(() => {
        targetRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [step]);

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
          Reading & Playing
        </h1>
        <p className="text-gray-600">Learn to read music from left to right</p>
      </div>

      {/* Step 1: Reading direction */}
      <div ref={step1Ref}>
        {step >= 0 && (
          <ConceptCard title="Reading Music" emoji="📖">
            <p className="mb-4">
              Just like reading a book, music is read from{" "}
              <strong>left to right</strong>. The first note is on the left, and
              you play each note in order as you move right.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 my-4">
              <div className="flex items-center justify-center gap-4">
                <div className="text-2xl">🎵</div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-2xl">🎵</div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-2xl">🎵</div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-2xl">🎵</div>
              </div>
              <div className="text-center text-sm text-gray-500 mt-2">
                Play notes in order: first → second → third → fourth
              </div>
            </div>
          </ConceptCard>
        )}
      </div>

      {/* Step 2: Bar lines and measures */}
      <div ref={step2Ref}>
        {step >= 1 && (
          <ConceptCard title="Bar Lines & Measures" emoji="📏">
            <p className="mb-4">
              Music is divided into sections called <strong>measures</strong>{" "}
              (also called &quot;bars&quot;). Vertical lines called{" "}
              <strong>bar lines</strong> separate them.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 my-4">
              <svg viewBox="0 0 400 80" className="w-full max-w-md mx-auto">
                {/* Staff lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="20"
                    y1={15 + i * 12}
                    x2="380"
                    y2={15 + i * 12}
                    stroke="#d1d5db"
                    strokeWidth="1"
                  />
                ))}
                {/* Bar lines */}
                <line
                  x1="100"
                  y1="15"
                  x2="100"
                  y2="63"
                  stroke="#6b7280"
                  strokeWidth="2"
                />
                <line
                  x1="200"
                  y1="15"
                  x2="200"
                  y2="63"
                  stroke="#6b7280"
                  strokeWidth="2"
                />
                <line
                  x1="300"
                  y1="15"
                  x2="300"
                  y2="63"
                  stroke="#6b7280"
                  strokeWidth="2"
                />
                {/* Labels */}
                <text
                  x="60"
                  y="78"
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="10"
                >
                  Measure 1
                </text>
                <text
                  x="150"
                  y="78"
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="10"
                >
                  Measure 2
                </text>
                <text
                  x="250"
                  y="78"
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="10"
                >
                  Measure 3
                </text>
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              Think of measures like sentences in a book — they help organize
              the music into manageable chunks.
            </p>
          </ConceptCard>
        )}
      </div>

      {/* Step 3: Time signature */}
      <div ref={step3Ref}>
        {step >= 2 && (
          <ConceptCard title="Time Signature" emoji="4️⃣">
            <p className="mb-4">
              The numbers at the start of the music tell you how to count. The
              most common is <strong>4/4</strong> (called
              &quot;four-four&quot;).
            </p>
            <div className="bg-purple-50 rounded-lg p-4 my-4 flex justify-around items-start">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-700">
                  <div>4</div>
                  <div className="border-t-2 border-purple-400">4</div>
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm mb-2">
                  <strong>Top number (4):</strong>
                  <br />4 beats per measure
                </div>
                <div className="text-sm">
                  <strong>Bottom number (4):</strong>
                  <br />
                  Quarter note gets 1 beat
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              In 4/4 time, count &quot;1, 2, 3, 4&quot; for each measure, then
              start over.
            </p>
          </ConceptCard>
        )}
      </div>

      {/* Step 4: Playback */}
      <div ref={step4Ref}>
        {step >= 3 && (
          <ConceptCard title="Using Playback" emoji="▶️" variant="interactive">
            <p className="mb-4">
              The editor has a <strong>Play button</strong> that plays your
              music for you! A moving line (the &quot;playhead&quot;) shows you
              which note is playing.
            </p>
            <div className="bg-teal-50 rounded-lg p-4 my-4 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-teal-500 text-white rounded-xl">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="font-semibold">Play</span>
              </div>
              <div className="text-sm text-teal-700 mt-3">
                Click to hear your music come to life!
              </div>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Tip:</strong> Use the tempo control to speed up or slow
              down playback. Start slow when learning a new piece!
            </p>
          </ConceptCard>
        )}
      </div>

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
      {showComplete && <StageComplete stage={3} onContinue={handleContinue} />}
    </div>
  );
}
