"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  useTutorial,
  TUTORIAL_MODULES,
  TutorialModule,
} from "@/hooks/useTutorial";
import { useDriverTour } from "@/hooks/useDriverTour";
import {
  useInteractiveTutorial,
  INTERACTIVE_TUTORIALS,
  InteractiveTutorialId,
} from "@/hooks/useInteractiveTutorial";

interface TutorialMenuProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional editor tutorial props (for /editor page)
  editorTutorial?: {
    isActive: boolean;
    currentStageIndex: number;
    totalStages: number;
    onRestart: () => void;
  };
}

export function TutorialMenu({
  isOpen,
  onClose,
  editorTutorial,
}: TutorialMenuProps) {
  const {
    completedModules,
    markComplete,
    resetAllTutorials,
    getModuleProgress,
    hasGraduated,
  } = useTutorial();

  const driverTour = useDriverTour({
    onComplete: (module) => {
      markComplete(module);
    },
  });

  const interactiveTutorial = useInteractiveTutorial();

  const menuRef = useRef<HTMLDivElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const progress = getModuleProgress();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  const handleStartTour = (module: TutorialModule) => {
    onClose();
    // Small delay to let menu close before tour starts
    setTimeout(() => {
      driverTour.startTour(module);
    }, 100);
  };

  const handleStartInteractive = (tutorialId: InteractiveTutorialId) => {
    onClose();
    // Small delay to let menu close before tutorial starts
    setTimeout(() => {
      interactiveTutorial.startTutorial(tutorialId);
    }, 100);
  };

  const handleReset = () => {
    resetAllTutorials();
    setShowResetConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border-2 border-purple-200 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-100 to-blue-100 border-b border-purple-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-purple-800">Learn the App</h3>
          <div className="text-xs text-purple-600">
            {progress.completed}/{progress.total} complete
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-purple-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Learn Music Basics - Featured section */}
      <div className="p-2 border-b border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50">
        <Link
          href="/learn"
          onClick={onClose}
          className={`w-full text-left px-3 py-3 rounded-lg transition-all border-2 flex items-start gap-3 ${
            hasGraduated
              ? "bg-green-50 hover:bg-green-100 border-green-300"
              : "bg-gradient-to-r from-teal-100 to-blue-100 hover:from-teal-200 hover:to-blue-200 border-teal-300 hover:border-teal-400"
          }`}
        >
          {/* Icon */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              hasGraduated
                ? "bg-green-500 text-white"
                : "bg-teal-500 text-white"
            }`}
          >
            {hasGraduated ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <span>📚</span>
            )}
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div
              className={`font-semibold text-sm flex items-center gap-2 ${
                hasGraduated ? "text-green-700" : "text-teal-800"
              }`}
            >
              Learn Music Basics
              {!hasGraduated && (
                <span className="text-[10px] px-1.5 py-0.5 bg-teal-500 text-white rounded-full font-medium">
                  5 STAGES
                </span>
              )}
            </div>
            <div
              className={`text-xs mt-0.5 ${
                hasGraduated ? "text-green-600" : "text-teal-700"
              }`}
            >
              {hasGraduated
                ? "You've completed the music basics course!"
                : "New to music? Learn to read sheet music step by step"}
            </div>
          </div>
          {/* Arrow icon */}
          <div
            className={`flex-shrink-0 mt-1 ${
              hasGraduated ? "text-green-400" : "text-teal-500"
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </Link>
      </div>

      {/* Quick Tour - Featured for new users */}
      <div className="p-2 border-b border-purple-200 bg-purple-50">
        <button
          onClick={() => handleStartTour("ui-overview")}
          className={`w-full text-left px-3 py-3 rounded-lg transition-all border-2 ${
            completedModules.includes("ui-overview")
              ? "bg-green-50 hover:bg-green-100 border-green-300"
              : "bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 border-purple-300 hover:border-purple-400"
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                completedModules.includes("ui-overview")
                  ? "bg-green-500 text-white"
                  : "bg-purple-500 text-white"
              }`}
            >
              {completedModules.includes("ui-overview") ? (
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
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div
                className={`font-semibold text-sm flex items-center gap-2 ${
                  completedModules.includes("ui-overview")
                    ? "text-green-700"
                    : "text-purple-800"
                }`}
              >
                Quick Tour
                {!completedModules.includes("ui-overview") && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-purple-500 text-white rounded-full font-medium">
                    START HERE
                  </span>
                )}
              </div>
              <div
                className={`text-xs mt-0.5 ${
                  completedModules.includes("ui-overview")
                    ? "text-green-600"
                    : "text-purple-700"
                }`}
              >
                Overview of the main UI areas and what they do
              </div>
              <div
                className={`text-xs mt-1 ${
                  completedModules.includes("ui-overview")
                    ? "text-green-500"
                    : "text-purple-600"
                }`}
              >
                9 steps
                {completedModules.includes("ui-overview") && " • Completed"}
              </div>
            </div>
            {/* Play icon */}
            <div
              className={`flex-shrink-0 mt-1 ${
                completedModules.includes("ui-overview")
                  ? "text-green-400"
                  : "text-purple-500"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Interactive Tutorial - Hands-on learning */}
      <div className="p-2 border-b border-amber-200 bg-amber-50">
        <button
          onClick={() => handleStartInteractive("tools-basics")}
          className="w-full text-left px-3 py-3 rounded-lg transition-all bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 border-2 border-amber-300 hover:border-amber-400"
        >
          <div className="flex items-start gap-3">
            {/* Star icon */}
            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-amber-800 text-sm flex items-center gap-2">
                {INTERACTIVE_TUTORIALS["tools-basics"].name}
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500 text-white rounded-full font-medium">
                  HANDS-ON
                </span>
              </div>
              <div className="text-xs text-amber-700 mt-0.5">
                {INTERACTIVE_TUTORIALS["tools-basics"].description}
              </div>
              <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Learn by doing • 7 interactive steps
              </div>
            </div>
            {/* Play icon */}
            <div className="text-amber-500 flex-shrink-0 mt-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Editor Tutorial - Only shown on /editor page */}
      {editorTutorial && (
        <div className="p-2 border-b border-blue-200 bg-blue-50">
          <button
            onClick={() => {
              editorTutorial.onRestart();
              onClose();
            }}
            className={`w-full text-left px-3 py-3 rounded-lg transition-all border-2 ${
              !editorTutorial.isActive
                ? "bg-green-50 hover:bg-green-100 border-green-300"
                : "bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 border-blue-300 hover:border-blue-400"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !editorTutorial.isActive
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white"
                }`}
              >
                {!editorTutorial.isActive ? (
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
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                )}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div
                  className={`font-semibold text-sm flex items-center gap-2 ${
                    !editorTutorial.isActive
                      ? "text-green-700"
                      : "text-blue-800"
                  }`}
                >
                  Editor Tutorial
                  {editorTutorial.isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-500 text-white rounded-full font-medium">
                      {editorTutorial.currentStageIndex + 1}/
                      {editorTutorial.totalStages}
                    </span>
                  )}
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    !editorTutorial.isActive
                      ? "text-green-600"
                      : "text-blue-700"
                  }`}
                >
                  {!editorTutorial.isActive
                    ? "Completed! Click to restart from the beginning"
                    : "Learn to use the music editor step by step"}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    !editorTutorial.isActive
                      ? "text-green-500"
                      : "text-blue-600"
                  }`}
                >
                  {editorTutorial.totalStages} stages
                  {!editorTutorial.isActive && " • Restart"}
                </div>
              </div>
              {/* Restart/Continue icon */}
              <div
                className={`flex-shrink-0 mt-1 ${
                  !editorTutorial.isActive ? "text-green-400" : "text-blue-500"
                }`}
              >
                {!editorTutorial.isActive ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Detailed Tours list - excluding ui-overview since it's featured above */}
      <div className="px-2 pt-2 pb-1">
        <div className="text-xs font-medium text-gray-500 px-1 mb-1">
          Detailed Tutorials
        </div>
      </div>
      <div className="px-2 pb-2 max-h-48 overflow-y-auto">
        {TUTORIAL_MODULES.filter((m) => m.id !== "ui-overview").map(
          (module, index) => {
            const isCompleted = completedModules.includes(module.id);
            return (
              <button
                key={module.id}
                onClick={() => handleStartTour(module.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-all mb-1 last:mb-0
                ${
                  isCompleted
                    ? "bg-green-50 hover:bg-green-100 border border-green-200"
                    : "bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300"
                }
              `}
              >
                <div className="flex items-start gap-3">
                  {/* Status icon */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                    ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-purple-200 text-purple-600"
                    }
                  `}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-3 h-3"
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
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium text-sm ${
                        isCompleted ? "text-green-700" : "text-gray-800"
                      }`}
                    >
                      {module.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {module.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {module.stepCount} steps
                      {isCompleted && " • Completed"}
                    </div>
                  </div>

                  {/* Play icon */}
                  <div className="text-purple-400 flex-shrink-0">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            );
          },
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        {/* Reset button */}
        {showResetConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-600">Reset all progress?</span>
            <button
              onClick={handleReset}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Yes
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            Reset tutorial progress
          </button>
        )}
      </div>
    </div>
  );
}
