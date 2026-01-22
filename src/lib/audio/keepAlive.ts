/**
 * Audio Keep-Alive Layer
 * Maintains persistent silent audio signal to prevent Safari suspension.
 *
 * Safari aggressively suspends AudioContext during silence periods, causing:
 * 1. Intermittent playback when returning from background
 * 2. First-note latency from cold audio graph
 * 3. Dropped notes at high tempos (200+ BPM)
 *
 * Solution: Keep a silent DC oscillator running to maintain active audio graph.
 */
import * as Tone from "tone";

let silentOscillator: Tone.Oscillator | null = null;
let silentGain: Tone.Gain | null = null;
let keepAliveActive = false;
let synthWarmed = false;
let getSynthCallback: (() => Tone.PolySynth) | null = null;

/**
 * Register the synth getter function from TonePlayer.
 * Called during initAudio() to allow prewarming without circular deps.
 */
export function registerSynthGetter(getter: () => Tone.PolySynth): void {
  getSynthCallback = getter;
}

/**
 * Start the silent keep-alive oscillator.
 * Creates a 0Hz DC oscillator at 0 gain - completely silent but keeps graph active.
 */
export function startKeepAlive(): void {
  if (keepAliveActive) return;

  try {
    // Gain at 0 = complete silence
    silentGain = new Tone.Gain(0).toDestination();

    // DC oscillator (0Hz) - keeps graph active with minimal CPU
    silentOscillator = new Tone.Oscillator({
      frequency: 0,
      type: "sine",
    }).connect(silentGain);

    silentOscillator.start();
    keepAliveActive = true;
    console.log("[KeepAlive] Started");

    prewarmSynth();
  } catch (error) {
    console.error("[KeepAlive] Failed:", error);
  }
}

/**
 * Pre-warm the synth by playing an inaudible note.
 * Allocates internal voice pools for instant subsequent playback.
 */
function prewarmSynth(): void {
  if (synthWarmed || !getSynthCallback) return;

  try {
    const synth = getSynthCallback();
    // Silent note at 20Hz (below audible range) to allocate voices
    synth.triggerAttackRelease(20, 0.001, Tone.context.currentTime);
    synthWarmed = true;
    console.log("[KeepAlive] Synth warmed");
  } catch (error) {
    console.error("[KeepAlive] Prewarm failed:", error);
  }
}

/**
 * Mark synth as needing re-warming (called when instrument changes).
 */
export function rewarmSynth(): void {
  synthWarmed = false;
  if (keepAliveActive) {
    setTimeout(prewarmSynth, 10);
  }
}

/**
 * Handle visibility changes - ensure keep-alive persists after tab switch.
 * Called from TonePlayer's visibility handler.
 */
export async function handleVisibilityKeepAlive(): Promise<void> {
  if (document.visibilityState !== "visible" || !keepAliveActive) return;

  if (Tone.context.state === "suspended") {
    console.log("[KeepAlive] Resuming...");
    await Tone.context.resume();

    if (silentOscillator?.state !== "started") {
      silentOscillator?.start();
    }
    prewarmSynth();
  }
}
