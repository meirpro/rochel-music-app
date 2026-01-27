"use client";

import { LearnStage, STAGE_INFO } from "../page";

interface StageCompleteProps {
  stage: LearnStage;
  onContinue: () => void;
  isFinalStage?: boolean;
}

export function StageComplete({
  stage,
  onContinue,
  isFinalStage = false,
}: StageCompleteProps) {
  const nextStage = stage < 5 ? ((stage + 1) as LearnStage) : null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]">
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
