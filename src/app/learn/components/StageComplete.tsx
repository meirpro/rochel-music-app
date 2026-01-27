"use client";

import { useEffect, useState, useMemo } from "react";
import { LearnStage, STAGE_INFO } from "../page";

interface StageCompleteProps {
  stage: LearnStage;
  onContinue: () => void;
  isFinalStage?: boolean;
}

// Pre-generate confetti data to avoid calling Math.random during render
const CONFETTI_EMOJIS = ["🎉", "🎵", "⭐", "🎶", "✨"];

export function StageComplete({
  stage,
  onContinue,
  isFinalStage = false,
}: StageCompleteProps) {
  // Start with confetti visible, hide after 3 seconds
  const [showConfetti, setShowConfetti] = useState(true);

  // Generate confetti data once on mount
  const confettiData = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${(i * 17 + 13) % 100}%`, // Deterministic spread
      top: `${(i * 23 + 7) % 100}%`,
      delay: `${(i % 5) * 0.4}s`,
      duration: `${1 + (i % 3)}s`,
      hue: `${(i * 72) % 360}deg`,
      emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
    }));
  }, []);

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const nextStage = stage < 5 ? ((stage + 1) as LearnStage) : null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confettiData.map((item) => (
            <div
              key={item.id}
              className="absolute animate-bounce"
              style={{
                left: item.left,
                top: item.top,
                animationDelay: item.delay,
                animationDuration: item.duration,
              }}
            >
              <span
                className="text-2xl"
                style={{
                  filter: `hue-rotate(${item.hue})`,
                }}
              >
                {item.emoji}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 p-6 text-white text-center">
          <div className="text-5xl mb-2">🎊</div>
          <div className="text-2xl font-bold">
            {isFinalStage ? "Congratulations!" : "Stage Complete!"}
          </div>
          <div className="text-lg opacity-90">
            {isFinalStage
              ? "You&apos;ve mastered the basics!"
              : `You finished "${STAGE_INFO[stage].title}"`}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isFinalStage ? (
            <p className="text-gray-700 mb-4 text-center">
              You&apos;ve learned everything you need to start creating music!
              The full editor is now unlocked.
            </p>
          ) : (
            <p className="text-gray-700 mb-4 text-center">
              Great job! You&apos;re making excellent progress. Ready for the
              next stage?
            </p>
          )}

          {/* Next stage preview */}
          {nextStage && (
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-purple-600 font-medium mb-1">
                Up Next: Stage {nextStage}
              </div>
              <div className="text-purple-800 font-semibold">
                {STAGE_INFO[nextStage].title}
              </div>
              <div className="text-purple-600 text-sm">
                {STAGE_INFO[nextStage].subtitle}
              </div>
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={onContinue}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold shadow-lg transition-all hover:shadow-xl"
          >
            {isFinalStage ? "Go to Editor →" : "Continue to Next Stage →"}
          </button>
        </div>
      </div>
    </div>
  );
}
