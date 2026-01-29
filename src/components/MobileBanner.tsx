"use client";

/**
 * Mobile Banner Component
 *
 * Displays a dismissible popup on mobile devices (or small screens),
 * suggesting users switch to a larger screen for editing features.
 * Uses localStorage to only show once per day after dismissal.
 */

import { useState, useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "rochel-mobile-banner-dismissed";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Check if the banner was dismissed within the last day
 */
function wasDismissedRecently(): boolean {
  try {
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (!dismissedAt) return false;

    const dismissedTime = parseInt(dismissedAt, 10);
    if (isNaN(dismissedTime)) return false;

    return Date.now() - dismissedTime < ONE_DAY_MS;
  } catch {
    return false;
  }
}

/**
 * Subscribe to window resize events
 */
function subscribeToResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

/**
 * Get current mobile state
 */
function getIsMobile() {
  return window.innerWidth < 768;
}

/**
 * Server snapshot - assume not mobile on server
 */
function getServerIsMobile() {
  return false;
}

/**
 * Subscribe to storage events (for cross-tab sync)
 */
function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/**
 * Get dismissal state from localStorage
 */
function getDismissedState() {
  return wasDismissedRecently();
}

/**
 * Server snapshot - assume dismissed on server to prevent flash
 */
function getServerDismissedState() {
  return true;
}

export function MobileBanner() {
  // Track if manually dismissed during this session
  const [isDismissed, setIsDismissed] = useState(false);

  // Use useSyncExternalStore for SSR-safe screen size detection
  const isMobile = useSyncExternalStore(
    subscribeToResize,
    getIsMobile,
    getServerIsMobile,
  );

  // Use useSyncExternalStore for SSR-safe localStorage check
  const wasRecentlyDismissed = useSyncExternalStore(
    subscribeToStorage,
    getDismissedState,
    getServerDismissedState,
  );

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Don't show if not mobile, dismissed this session, or dismissed recently
  if (!isMobile || isDismissed || wasRecentlyDismissed) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-200"
        onClick={handleDismiss}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 pointer-events-auto animate-in zoom-in-95 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🖥️</span>
            </div>
          </div>

          {/* Content */}
          <h2 className="text-lg font-semibold text-gray-800 text-center mb-2">
            Better on a Larger Screen
          </h2>
          <p className="text-gray-600 text-center text-sm mb-6">
            The music editor works best on tablets or computers. Some features
            may be limited on mobile devices.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleDismiss}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Got it, continue anyway
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Don&apos;t show again today
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
