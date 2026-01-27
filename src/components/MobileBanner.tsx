"use client";

/**
 * Mobile Banner Component
 *
 * Displays a dismissible banner at the bottom of the screen on mobile devices,
 * suggesting users switch to a larger screen for editing features.
 * Dismissed state is stored in sessionStorage (reappears on new session).
 */

import { useState, useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "rochel-mobile-banner-dismissed";

// Use useSyncExternalStore for SSR-safe sessionStorage access
function useSessionStorageDismissed(): boolean {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener("storage", callback);
    return () => window.removeEventListener("storage", callback);
  }, []);

  const getSnapshot = useCallback(
    () => sessionStorage.getItem(STORAGE_KEY) === "true",
    [],
  );

  const getServerSnapshot = useCallback(() => true, []); // Default to dismissed on server

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function MobileBanner() {
  const storageDismissed = useSessionStorageDismissed();
  const [localDismissed, setLocalDismissed] = useState(false);

  const handleDismiss = () => {
    setLocalDismissed(true);
    sessionStorage.setItem(STORAGE_KEY, "true");
  };

  if (storageDismissed || localDismissed) {
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
