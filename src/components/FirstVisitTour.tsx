"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTutorial } from "@/hooks/useTutorial";
import { useDriverTour } from "@/hooks/useDriverTour";

export function FirstVisitTour() {
  const router = useRouter();
  const { isFirstVisit, markWelcomeSeen, markComplete } = useTutorial();
  const [showWelcome, setShowWelcome] = useState(false);

  const driverTour = useDriverTour({
    onComplete: (module) => {
      markComplete(module);
    },
  });

  // Check for first visit after mount
  useEffect(() => {
    if (isFirstVisit) {
      // Small delay to let the page render
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFirstVisit]);

  const handleStartLearning = () => {
    setShowWelcome(false);
    markWelcomeSeen();
    router.push("/learn");
  };

  const handleStartTour = () => {
    setShowWelcome(false);
    markWelcomeSeen();
    // Start the UI overview tour for first-time visitors
    setTimeout(() => {
      driverTour.startTour("ui-overview");
    }, 100);
  };

  const handleSkip = () => {
    setShowWelcome(false);
    markWelcomeSeen();
  };

  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-500 p-6 text-white">
          <div className="text-4xl mb-2">Welcome!</div>
          <div className="text-lg opacity-90">to Rochel Music</div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            This looks like your first time here! How would you like to get
            started?
          </p>

          {/* Option 1: Learn from scratch */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-3 border-2 border-purple-200">
            <div className="font-medium text-purple-800 mb-2 flex items-center gap-2">
              <span>📚</span> Learn Music Basics
            </div>
            <p className="text-sm text-gray-600 mb-3">
              New to reading music? Our 5-stage tutorial teaches you everything
              from scratch!
            </p>
            <button
              onClick={handleStartLearning}
              className="w-full px-4 py-2.5 text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg transition-colors font-medium shadow-md"
            >
              Start Learning →
            </button>
          </div>

          {/* Option 2: Quick tour */}
          <div className="bg-gray-50 rounded-lg p-4 mb-3">
            <div className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <span>🎯</span> Quick App Tour
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Already know music? Take a 30-second tour of the editor.
            </p>
            <button
              onClick={handleStartTour}
              className="w-full px-4 py-2 text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors font-medium"
            >
              Quick Tour
            </button>
          </div>

          {/* Skip option */}
          <button
            onClick={handleSkip}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors mt-2"
          >
            Skip — I&apos;ll explore on my own
          </button>
        </div>
      </div>
    </div>
  );
}
