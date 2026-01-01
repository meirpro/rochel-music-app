"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { NOTE_COLORS, MIDI_NOTES } from "@/lib/constants";
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
  isOpen: boolean;
  onToggle: () => void;
  activeNoteId: string | null;
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
  isOpen,
  onToggle,
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

  // Refs for tracking active oscillators for sustain
  const activeOscillators = useRef<Map<Pitch, { stop: () => void }>>(new Map());

  // Play a note with optional sustain (returns stop function)
  const startNote = useCallback((pitch: Pitch): (() => void) | null => {
    const player = getAudioPlayer();
    const midi = MIDI_NOTES[pitch];
    if (midi <= 0) return null;

    // For sustained notes, play a longer duration
    // The note will be stopped manually on key release
    const ctx = new AudioContext();
    const freq = 440 * Math.pow(2, (midi - 69) / 12);

    // Create oscillators (similar to AudioPlayer but with manual control)
    const osc1 = ctx.createOscillator();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(freq, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 1.003, ctx.currentTime);

    const osc3 = ctx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(freq * 2, ctx.currentTime);

    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const gain3 = ctx.createGain();

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 6, ctx.currentTime);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    const masterGain = ctx.createGain();

    // Attack
    masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.008);
    masterGain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.1);

    gain1.gain.setValueAtTime(0.5, ctx.currentTime);
    gain2.gain.setValueAtTime(0.3, ctx.currentTime);
    gain3.gain.setValueAtTime(0.1, ctx.currentTime);

    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);
    gain1.connect(filter);
    gain2.connect(filter);
    gain3.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc3.start();

    // Return stop function for sustain release
    return () => {
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      setTimeout(() => {
        osc1.stop();
        osc2.stop();
        osc3.stop();
        ctx.close();
      }, 200);
    };
  }, []);

  // Play a short note (for clicks)
  const playShortNote = useCallback((pitch: Pitch) => {
    const player = getAudioPlayer();
    const midi = MIDI_NOTES[pitch];
    if (midi > 0) {
      player.playNote(midi, 0.4);
    }
  }, []);

  // Handle keyboard events with sustain
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
      const key = e.key.toLowerCase();
      const pianoKey = ALL_KEYS.find((k) => k.keyboard.includes(key));

      if (pianoKey && pressedKeys.has(pianoKey.pitch)) {
        // Stop the sustained note
        const osc = activeOscillators.current.get(pianoKey.pitch);
        if (osc) {
          osc.stop();
          activeOscillators.current.delete(pianoKey.pitch);
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
  }, [pressedKeys, startNote, showBlackKeys]);

  // Handle playback highlight with proper timing and gaps
  // activeNoteStartTime changes for each new note, ensuring we get a fresh cycle even for repeated pitches
  useEffect(() => {
    if (activePitch && activeNoteStartTime > 0) {
      // Show highlight immediately when note plays
      setPlaybackHighlight(activePitch);

      // Calculate how long to show the highlight based on note duration
      const durationMs = (activeNoteDuration * 60000) / tempo;
      // Release the key earlier to create clear separation between notes
      // Shorter notes release earlier, longer notes can hold longer
      const releaseRatio = Math.min(0.8, 0.55 + activeNoteDuration * 0.1);
      const highlightDuration = Math.max(30, durationMs * releaseRatio);

      const hideDelay = setTimeout(() => {
        setPlaybackHighlight(null);
      }, highlightDuration);

      return () => {
        clearTimeout(hideDelay);
      };
    } else if (!activePitch) {
      setPlaybackHighlight(null);
    }
  }, [activePitch, activeNoteDuration, activeNoteStartTime, tempo]);

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
      playbackHighlight === pitch
    );
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={`fixed left-1/2 -translate-x-1/2 z-50 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg rounded-t-xl px-4 py-2 transition-all flex items-center gap-2 ${
          isOpen ? "bottom-32" : "bottom-0"
        }`}
        title={isOpen ? "Hide piano" : "Show piano"}
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
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
        <span className="text-sm font-medium">Piano</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>

      {/* Piano drawer panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 h-32 bg-gray-900 border-t border-gray-700 shadow-2xl z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header with toggles */}
          <div className="flex items-center justify-between px-4 py-1 bg-gray-800 border-b border-gray-700">
            <div className="text-xs text-gray-400">
              Keys: <span className="text-gray-300">A-K</span> or{" "}
              <span className="text-gray-300">1-8</span>
              {showBlackKeys && (
                <>
                  {" "}
                  | Sharps: <span className="text-gray-300">W E T Y U</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Black keys toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-gray-400">Sharps</span>
                <div
                  className={`relative w-8 h-4 rounded-full transition-colors ${
                    showBlackKeys ? "bg-emerald-500" : "bg-gray-600"
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
                <span className="text-xs text-gray-400">Colors</span>
                <div
                  className={`relative w-8 h-4 rounded-full transition-colors ${
                    useColors ? "bg-emerald-500" : "bg-gray-600"
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

          {/* Piano keys */}
          <div className="flex-1 flex items-center justify-center px-4 py-2">
            {/* White keys container - relative for black keys positioning */}
            <div className="flex gap-1 relative">
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
                      ${useColors ? "border-2 border-black/20" : "border border-gray-300"}
                      transition-all duration-[50ms] ease-out
                    `}
                    style={{
                      backgroundColor: pressed
                        ? useColors
                          ? `color-mix(in srgb, ${bgColor} 70%, black)`
                          : "#d0d0d0"
                        : bgColor,
                      width: "60px",
                      height: "80px",
                      transform: pressed
                        ? "translateY(3px) scale(0.97)"
                        : "translateY(0) scale(1)",
                      boxShadow: pressed
                        ? "0 1px 2px rgba(0,0,0,0.3), inset 0 1px 3px rgba(0,0,0,0.2)"
                        : "0 4px 6px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  >
                    {/* Note name */}
                    <span
                      className={`text-lg font-bold transition-opacity duration-50 ${
                        useColors
                          ? "text-white drop-shadow-md"
                          : "text-gray-700"
                      } ${pressed ? "opacity-80" : "opacity-100"}`}
                    >
                      {key.name}
                      {index === 7 && (
                        <span className="text-xs align-super">5</span>
                      )}
                    </span>
                    {/* Keyboard hint */}
                    <span
                      className={`text-xs ${
                        useColors ? "text-white/70" : "text-gray-400"
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
                      className="absolute top-0 flex flex-col items-center justify-end pb-1 rounded-b-md select-none border border-gray-800 transition-all duration-[50ms] ease-out"
                      style={{
                        left: `${leftPos}px`,
                        transform: isKeyPressed(blackKey.pitch)
                          ? "translateY(2px) scale(0.97)"
                          : "translateY(0) scale(1)",
                        width: `${blackKeyWidth}px`,
                        height: "50px",
                        backgroundColor: isKeyPressed(blackKey.pitch)
                          ? "#4a4a4a"
                          : "#1a1a1a",
                        boxShadow: isKeyPressed(blackKey.pitch)
                          ? "0 1px 2px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.1)"
                          : "0 3px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)",
                        zIndex: 10,
                      }}
                    >
                      {/* Note name */}
                      <span className="text-xs font-bold text-gray-300">
                        {blackKey.name}
                      </span>
                      {/* Keyboard hint */}
                      <span className="text-[10px] text-gray-500">
                        {blackKey.keyboard[0].toUpperCase()}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
