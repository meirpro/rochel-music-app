/**
 * TutorialProgress Component
 *
 * A simple progress indicator showing which stage of the tutorial
 * the user is currently on.
 */

"use client";

interface TutorialProgressProps {
  currentStage: number;
  totalStages: number;
  stageName?: string;
}

export function TutorialProgress({
  currentStage,
  totalStages,
  stageName,
}: TutorialProgressProps) {
  const progress = ((currentStage + 1) / totalStages) * 100;

  return (
    <div className="w-16 bg-purple-50 border-r border-purple-200 flex flex-col items-center py-4 px-2">
      {/* Stage indicator */}
      <div className="text-center mb-3">
        <div className="text-lg font-bold text-purple-700">
          {currentStage + 1}
        </div>
        <div className="text-[10px] text-purple-500 font-medium">
          of {totalStages}
        </div>
      </div>

      {/* Vertical progress bar */}
      <div className="flex-1 w-2 bg-purple-200 rounded-full overflow-hidden relative">
        <div
          className="absolute bottom-0 left-0 right-0 bg-purple-500 rounded-full transition-all duration-500"
          style={{ height: `${progress}%` }}
        />
      </div>

      {/* Stage name (abbreviated) */}
      {stageName && (
        <div className="mt-3 text-[9px] text-purple-600 font-medium text-center leading-tight max-w-full">
          {stageName.split(" ").slice(0, 2).join(" ")}
        </div>
      )}
    </div>
  );
}
