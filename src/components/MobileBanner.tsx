"use client";

/**
 * Mobile Banner Component
 *
 * Displays a dismissible banner at the bottom of the screen on mobile devices,
 * suggesting users switch to a larger screen for editing features.
 * Dismissed state is stored in sessionStorage (reappears on new session).
 */

import { useState, useEffect } from "react";

const STORAGE_KEY = "rochel-mobile-banner-dismissed";

export function MobileBanner() {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash

  // Check sessionStorage on mount
  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY) === "true";
    setIsDismissed(dismissed);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-3 shadow-lg z-50">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-lg">🖥️</span>
          <span className="text-sm font-medium">
            For editing, please use a larger screen
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss banner"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
