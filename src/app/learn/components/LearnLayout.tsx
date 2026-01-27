"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { LearnStage, STAGE_INFO } from "../page";
import { LogoIcon } from "@/components/LogoIcon";

interface LearnLayoutProps {
  currentStage: LearnStage;
  completedStages: number[];
  onStageSelect: (stage: LearnStage) => void;
  onExit: () => void;
  children: ReactNode;
}

export function LearnLayout({
  currentStage,
  completedStages,
  onStageSelect,
  onExit,
  children,
}: LearnLayoutProps) {
  const stageInfo = STAGE_INFO[currentStage];

  // Check if a stage is accessible
  const isStageAccessible = (stage: LearnStage): boolean => {
    if (stage === 1) return true;
    if (stage === 2) return completedStages.includes(1);
    // Stages 3-5 are freely accessible after completing stage 2
    return completedStages.includes(2);
  };

  // Check if a stage is completed
  const isStageCompleted = (stage: LearnStage): boolean => {
    return completedStages.includes(stage);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-purple-200 flex items-center justify-between px-4 shadow-sm sticky top-0 z-50">
        {/* Left - Back button */}
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
        >
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="hidden sm:inline font-medium">Back to Editor</span>
        </button>

        {/* Center - Stage title */}
        <div className="flex items-center gap-3">
          <LogoIcon className="w-6 h-6 text-purple-600" />
          <div className="text-center">
            <div className="text-xs text-purple-500 font-medium">
              Stage {currentStage} of 5
            </div>
            <div className="text-purple-800 font-semibold">
              {stageInfo.title}
            </div>
          </div>
        </div>

        {/* Right - Progress indicator */}
        <div className="flex items-center gap-1">
          {([1, 2, 3, 4, 5] as LearnStage[]).map((stage) => {
            const isAccessible = isStageAccessible(stage);
            const isCompleted = isStageCompleted(stage);
            const isCurrent = stage === currentStage;

            return (
              <button
                key={stage}
                onClick={() => isAccessible && onStageSelect(stage)}
                disabled={!isAccessible}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  transition-all duration-200
                  ${
                    isCurrent
                      ? "bg-purple-500 text-white ring-2 ring-purple-300 ring-offset-2"
                      : isCompleted
                        ? "bg-teal-500 text-white"
                        : isAccessible
                          ? "bg-purple-100 text-purple-600 hover:bg-purple-200"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }
                `}
                title={`${STAGE_INFO[stage].title}${!isAccessible ? " (locked)" : ""}`}
              >
                {isCompleted && !isCurrent ? (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  stage
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>

      {/* Footer with escape hatch */}
      <footer className="py-3 px-4 bg-white/50 border-t border-purple-100 text-center">
        <Link
          href="/"
          className="text-sm text-purple-500 hover:text-purple-700 transition-colors"
        >
          Skip learning and go to editor →
        </Link>
      </footer>
    </div>
  );
}
