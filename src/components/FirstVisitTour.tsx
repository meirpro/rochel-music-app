"use client";

import { useEffect, useState } from "react";
import { useTutorial } from "@/hooks/useTutorial";
import { useDriverTour } from "@/hooks/useDriverTour";

export function FirstVisitTour() {
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
            This looks like your first time here. Would you like a quick tour to
            learn how to use the music editor?
          </p>

          <div className="bg-purple-50 rounded-lg p-4 mb-4">
            <div className="font-medium text-purple-800 mb-2">
              We&apos;ll show you around:
            </div>
            <ul className="text-purple-700 text-sm space-y-1">
              <li className="flex items-center gap-2">
                <span className="text-purple-500">📁</span> Song library &
                saving
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">🎼</span> Music settings &
                tempo
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">🎵</span> Note tools & staff
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">▶️</span> Playback controls
              </li>
            </ul>
          </div>

          <div className="text-xs text-gray-500 mb-4">
            Takes about 30 seconds. You can always access tutorials later from
            the Learn button.
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              Skip for now
            </button>
            <button
              onClick={handleStartTour}
              className="flex-1 px-4 py-2.5 text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg transition-colors font-medium shadow-md"
            >
              Start Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
