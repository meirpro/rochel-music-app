/**
 * NOTE: Importing Tone.js triggers a browser console warning:
 * "The AudioContext was not allowed to start. It must be resumed (or created)
 * after a user gesture on the page."
 *
 * This warning is EXPECTED and BENIGN. Tone.js creates an AudioContext in
 * "suspended" state on import. The context is properly resumed on first user
 * interaction via initAudio(). We intentionally ignore this warning rather than
 * use dynamic imports, as audio is core functionality and the added complexity
 * isn't worth eliminating a harmless console message.
 *
 * Decision logged: 2026-01-27
 */
import * as Tone from "tone";
import { startKeepAlive, handleVisibilityKeepAlive } from "./keepAlive";

/**
 * Audio timing configuration for stable playback
 * lookAhead provides buffer time for note scheduling (prevents pops/clicks)
 * 50ms balances latency vs stability - lower causes pops, higher adds delay
 */
export const AUDIO_CONFIG = {
  LOOK_AHEAD: 0.05,
} as const;

/**
 * Configure Tone.js context for low latency
 * - latencyHint: "interactive" prioritizes low latency over sustained playback
 * - lookAhead: reduced from default 0.1s to 0.01s for faster response
 *
 * Total latency = updateInterval + lookAhead
 * With these settings: ~0.01 + 0.01 = ~20ms latency (vs default ~100ms)
 */
let contextConfigured = false;
function ensureLowLatencyContext(): void {
  if (contextConfigured) return;

  // Only configure if context hasn't started yet
  if (Tone.getContext().state === "suspended") {
    Tone.setContext(
      new Tone.Context({
        latencyHint: "interactive",
        lookAhead: AUDIO_CONFIG.LOOK_AHEAD,
      }),
    );
  } else {
    // Context already running, just reduce lookAhead
    Tone.getContext().lookAhead = AUDIO_CONFIG.LOOK_AHEAD;
  }
  contextConfigured = true;
}

/**
 * Lazy getters for Tone.js singletons
 * These should be called after audio is initialized, not at module load time
 * This follows React best practices for Tone.js integration
 */
export function getTransport(): typeof Tone.Transport {
  return Tone.getTransport();
}

export function getDraw(): typeof Tone.Draw {
  return Tone.getDraw();
}

// Available instrument types
export type InstrumentType =
  | "piano"
  | "organ"
  | "bell"
  | "synth"
  | "music-box"
  | "marimba";

// Envelope settings type (subset of Tone.EnvelopeOptions we use)
interface EnvelopeSettings {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

// Instrument presets
const INSTRUMENT_PRESETS: Record<
  InstrumentType,
  { oscillator: { type: OscillatorType }; envelope: EnvelopeSettings }
> = {
  piano: {
    oscillator: { type: "triangle" },
    // Natural piano decay: quick attack, gradual decay, very low sustain
    // Notes fade naturally even when held (like real piano strings)
    envelope: { attack: 0.01, decay: 2.0, sustain: 0.05, release: 0.8 },
  },
  organ: {
    oscillator: { type: "sine" },
    envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 },
  },
  bell: {
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 0.8 },
  },
  synth: {
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 },
  },
  "music-box": {
    oscillator: { type: "square" },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0.0, release: 0.5 },
  },
  marimba: {
    oscillator: { type: "sine" },
    envelope: { attack: 0.001, decay: 0.5, sustain: 0.0, release: 0.4 },
  },
};

// Human-readable instrument names
export const INSTRUMENT_NAMES: Record<InstrumentType, string> = {
  piano: "Piano",
  organ: "Organ",
  bell: "Bell",
  synth: "Synth",
  "music-box": "Music Box",
  marimba: "Marimba",
};

// Singleton synth instance for shared use
let synth: Tone.PolySynth | null = null;
let currentInstrument: InstrumentType = "piano";
let initPromise: Promise<void> | null = null;
let audioReady = false; // Fast synchronous check for audio readiness

/**
 * Get the current instrument type
 */
export function getInstrument(): InstrumentType {
  return currentInstrument;
}

/**
 * Set the instrument type - recreates synth with new preset
 */
export function setInstrument(instrument: InstrumentType): void {
  if (instrument === currentInstrument && synth) return;

  currentInstrument = instrument;

  // Dispose old synth if it exists
  if (synth) {
    synth.releaseAll();
    synth.dispose();
    synth = null;
  }
  // New synth will be created on next note with new preset
}

/**
 * Initialize audio - MUST be called from a user gesture (click/tap)
 *
 * Web Audio API Security Model:
 * - Browsers block audio playback until a user gesture (click/tap) occurs
 * - This prevents websites from playing unwanted sounds automatically
 * - iOS Safari is particularly strict about this requirement
 *
 * Why this function exists:
 * - Centralizes audio initialization to ensure it only happens once
 * - Handles the complex async dance required to unlock audio on all browsers
 * - Sets up keep-alive mechanisms for Safari's aggressive audio suspension
 *
 * Returns a promise that resolves when audio is ready (or has failed to start).
 */
export function initAudio(): Promise<void> {
  // Singleton pattern: only initialize once, return same promise on subsequent calls
  // This prevents race conditions if multiple components try to init simultaneously
  if (!initPromise) {
    initPromise = (async () => {
      // Step 1: Configure low-latency context BEFORE starting
      // Must happen before Tone.start() because some settings can only be set
      // on a fresh context (before it transitions from "suspended" to "running")
      ensureLowLatencyContext();
      console.log("[TonePlayer] Starting Tone.js...", Tone.context.state);

      // Step 2: Request audio permission via Tone.start()
      // This is Tone.js's wrapper around AudioContext.resume()
      // It tells the browser "the user wants audio now"
      await Tone.start();
      console.log("[TonePlayer] After Tone.start():", Tone.context.state);

      // Step 3: Handle the "suspended but promised" edge case
      // IMPORTANT: Tone.start() can resolve its promise while context is still
      // "suspended". This happens when:
      // - The user gesture wasn't "strong enough" (e.g., too far from the click)
      // - The browser is being extra cautious (common on iOS Safari)
      // - The page loaded recently and browser wants more user interaction
      //
      // Solution: Explicitly call resume() and check state
      if (Tone.context.state !== "running") {
        console.log("[TonePlayer] Context not running, resuming...");
        await Tone.context.resume();
        console.log("[TonePlayer] After resume:", Tone.context.state);
      }

      // Step 4: Poll for "running" state with timeout
      // Even after resume(), the context may take a moment to transition.
      // This is async at the OS audio layer level.
      // We poll every 20ms for up to 1 second (50 attempts) before giving up.
      let attempts = 0;
      while (Tone.context.state !== "running" && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 20));
        attempts++;
      }

      // Step 5: Log failure but don't throw - let caller decide how to handle
      // The caller (usePlayback) will check isAudioReady() and show appropriate UI
      if (Tone.context.state !== "running") {
        console.warn(
          "[TonePlayer] Context still not running after wait:",
          Tone.context.state,
        );
      }

      // Step 6: Set the ready flag for synchronous checks elsewhere
      // isAudioReady() uses this for fast-path audio playback
      audioReady = Tone.context.state === "running";
      console.log("[TonePlayer] Tone.js ready:", Tone.context.state);

      // Step 7: Prime the synth to prevent "first note swallowing"
      // Some browsers/devices drop the first audio event after context starts.
      // Playing an inaudible note (1Hz is below human hearing ~20Hz) warms up
      // the audio pipeline so real notes play correctly.
      if (audioReady) {
        const s = getSynth();
        s.triggerAttackRelease(1, 0.001, Tone.context.currentTime); // 1Hz = inaudible
        console.log("[TonePlayer] Synth primed");

        // Step 8: Start keep-alive layer for Safari
        // Safari aggressively suspends AudioContext when:
        // - Tab loses focus
        // - Device screen locks
        // - No audio plays for ~30 seconds
        // The keep-alive plays inaudible tones periodically to prevent this
        startKeepAlive();
      }

      // Step 9: Listen for visibility changes to handle tab switching
      // When user switches tabs and comes back, Safari may have suspended audio.
      // This listener resumes the context when the tab becomes visible again.
      document.addEventListener("visibilitychange", handleVisibilityChange);
    })();
  }
  return initPromise;
}

/**
 * Check if audio is ready for immediate playback (synchronous check)
 *
 * Why two conditions?
 * - audioReady: Set during initAudio() - indicates initialization completed successfully
 * - Tone.context.state === "running": Live check of actual AudioContext state
 *
 * We check both because:
 * 1. audioReady alone could be stale (Safari may have suspended context since init)
 * 2. context.state alone doesn't tell us if init completed (could be running from elsewhere)
 *
 * This function enables the "fast path" in playNote() - when audio is ready,
 * we can play notes synchronously without async overhead, reducing latency.
 */
export function isAudioReady(): boolean {
  return audioReady && Tone.context.state === "running";
}

/**
 * Resume audio context when page becomes visible again.
 * Safari suspends AudioContext when switching windows.
 */
async function handleVisibilityChange(): Promise<void> {
  console.log(
    "[TonePlayer] Visibility changed:",
    document.visibilityState,
    "context:",
    Tone.context.state,
  );
  if (document.visibilityState === "visible" && initPromise) {
    if (Tone.context.state === "suspended") {
      console.log("[TonePlayer] Resuming suspended context...");
      await Tone.context.resume();
      console.log("[TonePlayer] Context resumed:", Tone.context.state);
    }
    // Ensure keep-alive layer persists after tab switch
    await handleVisibilityKeepAlive();
  }
}

/**
 * Check if audio has been initialized
 */
export function isAudioInitialized(): boolean {
  return initPromise !== null;
}

/**
 * Get or create the shared synth instance.
 * Uses PolySynth for playing multiple notes simultaneously.
 */
function getSynth(): Tone.PolySynth {
  if (!synth) {
    const preset = INSTRUMENT_PRESETS[currentInstrument];
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: preset.oscillator,
      envelope: preset.envelope,
    }).toDestination();

    // Limit max polyphony to prevent audio glitches
    synth.maxPolyphony = 8;
  }
  return synth;
}

/**
 * Convert MIDI note number to frequency
 */
function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Play a single note by MIDI number (synchronous when audio is ready)
 * @param midi - MIDI note number (60 = C4)
 * @param duration - Duration in seconds
 * @param startDelay - Delay before playing (for scheduling)
 */
export function playNote(midi: number, duration = 0.35, startDelay = 0): void {
  if (midi === 0) return; // REST

  // Fast path: if audio is ready, play immediately (no async overhead)
  if (isAudioReady()) {
    const freq = midiToFreq(midi);
    const s = getSynth();
    // Use raw currentTime for immediate playback (bypasses lookAhead delay)
    // Tone.now() adds lookAhead which causes perceptible latency
    const now = Tone.context.currentTime;
    if (startDelay > 0) {
      s.triggerAttackRelease(freq, duration, now + startDelay);
    } else {
      s.triggerAttackRelease(freq, duration, now);
    }
    return;
  }

  // Slow path: initialize audio first (only happens on first interaction)
  (async () => {
    await initAudio();
    if (Tone.context.state !== "running") {
      await Tone.context.resume();
    }
    const freq = midiToFreq(midi);
    const s = getSynth();
    const now = Tone.context.currentTime;
    if (startDelay > 0) {
      s.triggerAttackRelease(freq, duration, now + startDelay);
    } else {
      s.triggerAttackRelease(freq, duration, now);
    }
  })();
}

/**
 * Start a sustained note (for piano key press) - synchronous when audio is ready
 * Returns a stop function to release the note.
 * @param midi - MIDI note number
 */
export function startSustainedNote(midi: number): () => void {
  if (midi === 0) return () => {};

  const freq = midiToFreq(midi);

  // Fast path: if audio is ready, start immediately (no async overhead)
  if (isAudioReady()) {
    // Use raw currentTime for immediate playback (bypasses lookAhead delay)
    getSynth().triggerAttack(freq, Tone.context.currentTime);
  } else {
    // Slow path: initialize audio first (only happens on first interaction)
    (async () => {
      await initAudio();
      if (Tone.context.state !== "running") {
        await Tone.context.resume();
      }
      getSynth().triggerAttack(freq, Tone.context.currentTime);
    })();
  }

  return () => {
    // Release is safe to call even if attack hasn't happened yet
    if (synth) {
      synth.triggerRelease(freq, Tone.context.currentTime);
    }
  };
}

/**
 * Stop all currently playing notes
 */
export function stopAllNotes(): void {
  if (synth) {
    synth.releaseAll();
  }
}

/**
 * Get current audio context time (for scheduling)
 */
export function getCurrentTime(): number {
  return Tone.now();
}

/**
 * Convert beats to seconds at a given tempo
 */
export function beatsToSeconds(beats: number, bpm: number): number {
  return (beats * 60) / bpm;
}

/**
 * Schedule a note to play at a specific time
 * Used by the Transport-based playback system
 */
export function scheduleNote(
  midi: number,
  duration: number,
  time: number,
): void {
  if (midi === 0) return; // REST

  const freq = midiToFreq(midi);
  const s = getSynth();
  s.triggerAttackRelease(freq, duration, time);
}

/**
 * Create a new Tone.Part for scheduling multiple notes
 * Returns the Part instance for control
 */
export function createNotePart(
  notes: Array<{ time: number; midi: number; duration: number; id: string }>,
  onNote: (noteId: string, midi: number, duration: number) => void,
): Tone.Part {
  const draw = getDraw();
  return new Tone.Part((time, value) => {
    // Play the audio
    scheduleNote(value.midi, value.duration, time);

    // Schedule visual update at the exact same time
    draw.schedule(() => {
      onNote(value.id, value.midi, value.duration);
    }, time);
  }, notes);
}

/**
 * Get the Tone.js module for advanced usage
 */
export { Tone };
