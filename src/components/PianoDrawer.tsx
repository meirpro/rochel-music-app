"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import {
  playNote,
  startSustainedNote,
  stopAllNotes,
  initAudio,
} from "@/lib/audio/TonePlayer";
import { NOTE_COLORS, pitchToMidi } from "@/lib/constants";
import { Pitch } from "@/lib/types";

// White piano keys configuration
const WHITE_KEYS: { pitch: Pitch; name: string; keyboard: string[] }[] = [
  { pitch: "C4", name: "C", keyboard: ["a", "1"] },
  { pitch: "D4", name: "D", keyboard: ["s", "2"] },
  { pitch: "E4", name: "E", keyboard: ["d", "3"] },
  { pitch: "F4", name: "F", keyboard: ["f", "4"] },
  { pitch: "G4", name: "G", keyboard: ["g", "5"] },
  { pitch: "A4", name: "A", keyboard: ["h", "6"] },
  { pitch: "B4", name: "B", keyboard: ["j", "7"] },
  { pitch: "C5", name: "C", keyboard: ["k", "8"] },
];

// Black piano keys configuration (sharps)
// Position index indicates which white key gap they sit in (0 = between C and D, etc.)
const BLACK_KEYS: {
  pitch: Pitch;
  name: string;
  keyboard: string[];
  afterWhiteIndex: number;
}[] = [
  { pitch: "C#4", name: "C#", keyboard: ["w"], afterWhiteIndex: 0 },
  { pitch: "D#4", name: "D#", keyboard: ["e"], afterWhiteIndex: 1 },
  // No black key between E and F
  { pitch: "F#4", name: "F#", keyboard: ["t"], afterWhiteIndex: 3 },
  { pitch: "G#4", name: "G#", keyboard: ["y"], afterWhiteIndex: 4 },
  { pitch: "A#4", name: "A#", keyboard: ["u"], afterWhiteIndex: 5 },
  // No black key between B and C
];

// Combined for keyboard event handling
const ALL_KEYS = [...WHITE_KEYS, ...BLACK_KEYS];

interface PianoDrawerProps {
  activePitch: Pitch | null;
  activeNoteDuration?: number; // Duration in beats
  activeNoteStartTime?: number; // Timestamp when note started (for detecting new notes)
  tempo?: number; // BPM for calculating duration
  useColors: boolean;
  onToggleColors: () => void;
  showBlackKeys: boolean;
  onToggleBlackKeys: () => void;
}

export function PianoDrawer({
  activePitch,
  activeNoteDuration = 1,
  activeNoteStartTime = 0,
  tempo = 100,
  useColors,
  onToggleColors,
  showBlackKeys,
  onToggleBlackKeys,
}: PianoDrawerProps) {
  // Track keyboard-pressed keys for sustain behavior
  const [pressedKeys, setPressedKeys] = useState<Set<Pitch>>(new Set());
  // Track mouse-pressed key
  const [mousePressed, setMousePressed] = useState<Pitch | null>(null);
  // Track playback highlight with timing
  const [playbackHighlight, setPlaybackHighlight] = useState<Pitch | null>(
    null,
  );
  // Track sustain pedal state (Shift or Space held)
  const [sustainActive, setSustainActive] = useState(false);
  // Track which keys should be sustained when pedal is released
  const [sustainedKeys, setSustainedKeys] = useState<Set<Pitch>>(new Set());

  // Refs for tracking active oscillators for sustain
  const activeOscillators = useRef<Map<Pitch, { stop: () => void }>>(new Map());

  // Cleanup: Stop all sounds when component unmounts (piano closes)
  useEffect(() => {
    const oscillatorsRef = activeOscillators.current;
    return () => {
      // Stop all tracked oscillators
      oscillatorsRef.forEach((osc) => {
        osc.stop();
      });
      oscillatorsRef.clear();
      // Also tell TonePlayer to release all notes
      stopAllNotes();
    };
  }, []);

  // Play a note with optional sustain (returns stop function)
  // Uses shared TonePlayer for DRY code and iOS compatibility
  const startNote = useCallback((pitch: Pitch): (() => void) | null => {
    const midi = pitchToMidi(pitch);
    if (midi <= 0) return null;

    // Initialize audio on first interaction (handles iOS)
    initAudio();

    // Start sustained note and return the stop function
    return startSustainedNote(midi);
  }, []);

  // Play a short note (for clicks)
  // Uses shared TonePlayer for DRY code and iOS compatibility
  const playShortNote = useCallback((pitch: Pitch) => {
    const midi = pitchToMidi(pitch);
    if (midi > 0) {
      // Initialize audio on first interaction (handles iOS)
      initAudio();
      playNote(midi, 0.4);
    }
  }, []);

  // Handle keyboard events with sustain pedal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ignore repeat events (key held down)
      if (e.repeat) return;

      // Check for sustain pedal (Shift only - Space is used for play/pause)
      if (e.key === "Shift") {
        e.preventDefault();
        setSustainActive(true);
        return;
      }

      const key = e.key.toLowerCase();
      // Check white keys first, then black keys (if enabled)
      const whiteKey = WHITE_KEYS.find((k) => k.keyboard.includes(key));
      const blackKey = showBlackKeys
        ? BLACK_KEYS.find((k) => k.keyboard.includes(key))
        : null;
      const pianoKey = whiteKey || blackKey;

      if (pianoKey && !pressedKeys.has(pianoKey.pitch)) {
        e.preventDefault();

        // Start sustained note
        const stopFn = startNote(pianoKey.pitch);
        if (stopFn) {
          activeOscillators.current.set(pianoKey.pitch, { stop: stopFn });
        }

        setPressedKeys((prev) => new Set(prev).add(pianoKey.pitch));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Check for sustain pedal release (Shift only)
      if (e.key === "Shift") {
        setSustainActive(false);
        // Stop all sustained notes that are no longer being pressed
        sustainedKeys.forEach((pitch) => {
          if (!pressedKeys.has(pitch)) {
            const osc = activeOscillators.current.get(pitch);
            if (osc) {
              osc.stop();
              activeOscillators.current.delete(pitch);
            }
          }
        });
        setSustainedKeys(new Set());
        return;
      }

      const key = e.key.toLowerCase();
      const pianoKey = ALL_KEYS.find((k) => k.keyboard.includes(key));

      if (pianoKey && pressedKeys.has(pianoKey.pitch)) {
        // If sustain pedal is active, keep the note playing but track it
        if (sustainActive) {
          setSustainedKeys((prev) => new Set(prev).add(pianoKey.pitch));
        } else {
          // Stop the note immediately
          const osc = activeOscillators.current.get(pianoKey.pitch);
          if (osc) {
            osc.stop();
            activeOscillators.current.delete(pianoKey.pitch);
          }
        }

        setPressedKeys((prev) => {
          const next = new Set(prev);
          next.delete(pianoKey.pitch);
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pressedKeys, startNote, showBlackKeys, sustainActive, sustainedKeys]);

  // Refs for managing highlight timing
  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const attackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastNoteStartTimeRef = useRef<number>(0);

  // Handle playback highlight with proper timing and gaps
  // Creates visible press/release cycle even for consecutive notes
  useEffect(() => {
    // Clear any pending timeouts
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = null;
    }
    if (attackTimeoutRef.current) {
      clearTimeout(attackTimeoutRef.current);
      attackTimeoutRef.current = null;
    }

    if (activePitch && activeNoteStartTime > 0) {
      const isNewNote = activeNoteStartTime !== lastNoteStartTimeRef.current;
      lastNoteStartTimeRef.current = activeNoteStartTime;

      // Calculate how long to show the highlight based on note duration
      const durationMs = (activeNoteDuration * 60000) / tempo;
      // Release the key earlier to create clear separation between notes
      const releaseRatio = Math.min(0.8, 0.5 + activeNoteDuration * 0.1);
      const highlightDuration = Math.max(40, durationMs * releaseRatio);

      if (isNewNote) {
        // Force a brief "release" state before showing new note (creates visual gap)
        // Using queueMicrotask to avoid synchronous setState in effect
        queueMicrotask(() => setPlaybackHighlight(null));

        // After a tiny gap, show the new note press
        attackTimeoutRef.current = setTimeout(() => {
          setPlaybackHighlight(activePitch);

          // Schedule the release
          highlightTimeoutRef.current = setTimeout(() => {
            setPlaybackHighlight(null);
            highlightTimeoutRef.current = null;
          }, highlightDuration);
        }, 20); // 20ms gap between notes for visible release
      } else {
        // Same note continuing - just set highlight
        // Using queueMicrotask to avoid synchronous setState in effect
        queueMicrotask(() => setPlaybackHighlight(activePitch));

        highlightTimeoutRef.current = setTimeout(() => {
          setPlaybackHighlight(null);
          highlightTimeoutRef.current = null;
        }, highlightDuration);
      }
    }

    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
      if (attackTimeoutRef.current) {
        clearTimeout(attackTimeoutRef.current);
        attackTimeoutRef.current = null;
      }
    };
  }, [activePitch, activeNoteDuration, activeNoteStartTime, tempo]);

  // Use the managed playbackHighlight state (not directly from props)
  // This allows us to control the visual timing with gaps
  const currentPlaybackHighlight = playbackHighlight;

  // Get color for a key
  const getKeyColor = (pitch: Pitch) => {
    if (!useColors) {
      return "#ffffff";
    }
    const baseName = pitch.replace(/[0-9]/g, "");
    return NOTE_COLORS[baseName] || "#ffffff";
  };

  // Check if a key is pressed (keyboard, mouse, or playback)
  const isKeyPressed = (pitch: Pitch) => {
    return (
      pressedKeys.has(pitch) ||
      mousePressed === pitch ||
      currentPlaybackHighlight === pitch
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-32 bg-purple-100 border-t-2 border-purple-300 shadow-lg z-40">
      <div className="h-full flex flex-col">
        {/* Header with toggles */}
        <div className="flex items-center justify-between px-4 py-1 bg-purple-200 border-b border-purple-300">
          {/* Keyboard hints - hidden on mobile (no physical keyboard) */}
          <div className="text-xs text-purple-700 hidden md:flex items-center gap-3">
            <span>
              Keys: <span className="text-purple-800 font-semibold">A-K</span>{" "}
              or <span className="text-purple-800 font-semibold">1-8</span>
              {showBlackKeys && (
                <>
                  {" "}
                  | Sharps:{" "}
                  <span className="text-purple-800 font-semibold">
                    W E T Y U
                  </span>
                </>
              )}
            </span>
            <span className="border-l border-purple-400 pl-3 flex items-center gap-1">
              Sustain:{" "}
              <span className="text-purple-800 font-semibold">Shift</span>
              {sustainActive && (
                <span className="ml-1 px-1.5 py-0.5 bg-emerald-400 text-white text-[10px] font-bold rounded animate-pulse">
                  ON
                </span>
              )}
            </span>
          </div>
          {/* Spacer on mobile to push toggles right */}
          <div className="md:hidden" />
          <div className="flex items-center gap-4">
            {/* Black keys toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-purple-700 font-medium">
                Sharps
              </span>
              <div
                className={`relative w-8 h-4 rounded-full transition-colors ${
                  showBlackKeys ? "bg-emerald-300" : "bg-purple-300"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onToggleBlackKeys();
                }}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                    showBlackKeys ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
            {/* Colors toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-purple-700 font-medium">
                Colors
              </span>
              <div
                className={`relative w-8 h-4 rounded-full transition-colors ${
                  useColors ? "bg-emerald-300" : "bg-purple-300"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onToggleColors();
                }}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                    useColors ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Piano keys - scrollable horizontally on mobile */}
        <div className="flex-1 flex items-center justify-start md:justify-center px-4 py-2 overflow-x-auto overflow-y-hidden hide-scrollbar">
          {/* White keys container - relative for black keys positioning */}
          <div className="flex gap-1 relative flex-shrink-0">
            {WHITE_KEYS.map((key, index) => {
              const pressed = isKeyPressed(key.pitch);
              const bgColor = getKeyColor(key.pitch);

              return (
                <button
                  key={key.pitch}
                  onMouseDown={() => {
                    setMousePressed(key.pitch);
                    playShortNote(key.pitch);
                  }}
                  onMouseUp={() => setMousePressed(null)}
                  onMouseLeave={() => setMousePressed(null)}
                  className={`relative flex flex-col items-center justify-end pb-2 rounded-b-lg select-none
                      ${useColors ? "border-2 border-purple-200" : "border-2 border-purple-200"}
                      transition-all duration-[50ms] ease-out
                    `}
                  style={{
                    backgroundColor: pressed
                      ? useColors
                        ? `color-mix(in srgb, ${bgColor} 75%, #c084fc)`
                        : "#e9d5ff"
                      : bgColor,
                    width: "60px",
                    height: "80px",
                    transform: pressed
                      ? "translateY(3px) scale(0.97)"
                      : "translateY(0) scale(1)",
                    boxShadow: pressed
                      ? "0 1px 2px rgba(168,85,247,0.2), inset 0 1px 3px rgba(168,85,247,0.15)"
                      : "0 3px 5px rgba(168,85,247,0.15), 0 1px 3px rgba(168,85,247,0.1)",
                  }}
                >
                  {/* Note name */}
                  <span
                    className={`text-lg font-semibold transition-opacity duration-50 ${
                      useColors
                        ? "text-white drop-shadow-md"
                        : "text-purple-700"
                    } ${pressed ? "opacity-80" : "opacity-100"}`}
                  >
                    {key.name}
                    {index === 7 && (
                      <span className="text-xs align-super">5</span>
                    )}
                  </span>
                  {/* Keyboard hint - hidden on mobile */}
                  <span
                    className={`text-xs hidden md:block ${
                      useColors ? "text-white/70" : "text-purple-500"
                    }`}
                  >
                    {key.keyboard[0].toUpperCase()}
                  </span>
                </button>
              );
            })}

            {/* Black keys (overlay) - positioned absolutely over white keys */}
            {showBlackKeys &&
              BLACK_KEYS.map((blackKey) => {
                // Calculate exact position: each white key is 60px + 4px gap
                // Black key should be centered on the gap after white key at afterWhiteIndex
                // Position = (afterWhiteIndex + 1) * 60px + afterWhiteIndex * 4px - half of black key width
                const whiteKeyWidth = 60;
                const gapWidth = 4;
                const blackKeyWidth = 36;
                const leftPos =
                  (blackKey.afterWhiteIndex + 1) * whiteKeyWidth +
                  blackKey.afterWhiteIndex * gapWidth +
                  gapWidth / 2 -
                  blackKeyWidth / 2;

                return (
                  <button
                    key={blackKey.pitch}
                    onMouseDown={() => {
                      setMousePressed(blackKey.pitch);
                      playShortNote(blackKey.pitch);
                    }}
                    onMouseUp={() => setMousePressed(null)}
                    onMouseLeave={() => setMousePressed(null)}
                    className="absolute top-0 flex flex-col items-center justify-end pb-1 rounded-b-md select-none border-2 border-purple-400 transition-all duration-[50ms] ease-out"
                    style={{
                      left: `${leftPos}px`,
                      transform: isKeyPressed(blackKey.pitch)
                        ? "translateY(2px) scale(0.97)"
                        : "translateY(0) scale(1)",
                      width: `${blackKeyWidth}px`,
                      height: "50px",
                      backgroundColor: isKeyPressed(blackKey.pitch)
                        ? "#a78bfa"
                        : "#7c3aed",
                      boxShadow: isKeyPressed(blackKey.pitch)
                        ? "0 1px 2px rgba(124,58,237,0.3), inset 0 1px 2px rgba(255,255,255,0.2)"
                        : "0 3px 4px rgba(124,58,237,0.3), 0 1px 2px rgba(124,58,237,0.2)",
                      zIndex: 10,
                    }}
                  >
                    {/* Note name */}
                    <span className="text-xs font-semibold text-white">
                      {blackKey.name}
                    </span>
                    {/* Keyboard hint - hidden on mobile */}
                    <span className="text-[10px] text-purple-100 hidden md:block">
                      {blackKey.keyboard[0].toUpperCase()}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
