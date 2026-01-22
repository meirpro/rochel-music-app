/**
 * Audio Keep-Alive Layer
 * Maintains persistent silent audio signal to prevent Safari suspension.
 *
 * Safari aggressively suspends AudioContext during silence periods, causing:
 * 1. Intermittent playback when returning from background
 * 2. First-note latency from cold audio graph
 * 3. Dropped notes at high tempos (200+ BPM)
 *
 * Solution: Keep a silent low-frequency oscillator running to maintain active audio graph.
 */
import * as Tone from "tone";

let silentOscillator: Tone.Oscillator | null = null;
let silentGain: Tone.Gain | null = null;
let keepAliveActive = false;

/**
 * Start the silent keep-alive oscillator.
 * Creates a 1Hz oscillator at 0 gain - completely silent but keeps graph active.
 * Deferred slightly to not interfere with audio initialization.
 */
export function startKeepAlive(): void {
  if (keepAliveActive) return;

  // Defer to ensure Tone.js is fully initialized
  setTimeout(() => {
    if (keepAliveActive) return;

    try {
      // Verify context is running before creating oscillator
      if (Tone.context.state !== "running") {
        console.log("[KeepAlive] Context not running, skipping");
        return;
      }

      // Gain at 0 = complete silence
      silentGain = new Tone.Gain(0).toDestination();

      // Very low frequency oscillator (1Hz) - keeps graph active with minimal CPU
      silentOscillator = new Tone.Oscillator({
        frequency: 1,
        type: "sine",
      }).connect(silentGain);

      silentOscillator.start();
      keepAliveActive = true;
      console.log("[KeepAlive] Started");
    } catch (error) {
      console.error("[KeepAlive] Failed:", error);
      // Don't let keepAlive failure break audio
    }
  }, 100);
}

/**
 * Handle visibility changes - ensure keep-alive persists after tab switch.
 * Called from TonePlayer's visibility handler.
 */
export async function handleVisibilityKeepAlive(): Promise<void> {
  if (document.visibilityState !== "visible") return;

  try {
    if (Tone.context.state === "suspended") {
      console.log("[KeepAlive] Resuming...");
      await Tone.context.resume();
    }

    // Restart keep-alive if needed
    if (keepAliveActive && silentOscillator?.state !== "started") {
      silentOscillator?.start();
    }
  } catch (error) {
    console.error("[KeepAlive] Resume failed:", error);
  }
}
