import { Song, RenderedNote } from "../types";
import { MIDI_NOTES } from "../constants";

export class AudioPlayer {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private currentIndex = 0;
  private nextNoteTime = 0;
  private tempo = 92;
  private rafId: number | null = null;
  private onNoteCallback: ((index: number) => void) | null = null;
  private song: Song | null = null;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  private beatsToSeconds(beats: number): number {
    return (60 / this.tempo) * beats;
  }

  // Play a single note (for click-to-play) with piano-like sound
  // startDelay allows scheduling notes slightly in the future for sync
  playNote(midi: number, durationSeconds = 0.35, startDelay = 0): void {
    if (midi === 0) return; // REST

    const ctx = this.getContext();
    const startTime = ctx.currentTime + startDelay;

    // Calculate frequency from MIDI note number
    const freq = 440 * Math.pow(2, (midi - 69) / 12);

    // Create main oscillator (triangle for warmer tone)
    const osc1 = ctx.createOscillator();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(freq, startTime);

    // Create second oscillator slightly detuned for richness
    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 1.003, startTime); // Slight detune

    // Create third oscillator one octave higher (soft)
    const osc3 = ctx.createOscillator();
    osc3.type = "sine";
    osc3.frequency.setValueAtTime(freq * 2, startTime);

    // Individual gains for mixing
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const gain3 = ctx.createGain();

    // Low-pass filter for warmer piano tone
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 6, startTime);
    filter.Q.setValueAtTime(1, startTime);

    // Master gain with piano-like ADSR envelope
    const masterGain = ctx.createGain();

    // Piano envelope: quick attack, gradual decay
    masterGain.gain.setValueAtTime(0.0001, startTime);
    masterGain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.008); // Fast attack
    masterGain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.1); // Initial decay
    masterGain.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + durationSeconds,
    ); // Release

    // Mix levels
    gain1.gain.setValueAtTime(0.5, startTime);
    gain2.gain.setValueAtTime(0.3, startTime);
    gain3.gain.setValueAtTime(0.1, startTime); // Subtle octave

    // Connect oscillators through gains to filter
    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    gain1.connect(filter);
    gain2.connect(filter);
    gain3.connect(filter);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Start and stop all oscillators
    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    const stopTime = startTime + durationSeconds + 0.02;
    osc1.stop(stopTime);
    osc2.stop(stopTime);
    osc3.stop(stopTime);
  }

  // Play a pitch by name
  playPitch(
    pitch: "C4" | "D4" | "E4" | "F4" | "G4" | "A4" | "B4" | "C5" | "REST",
    durationSeconds = 0.35,
  ): void {
    const midi = MIDI_NOTES[pitch];
    this.playNote(midi, durationSeconds);
  }

  // Start playing a song
  playSong(
    song: Song,
    notes: RenderedNote[],
    onNote?: (index: number) => void,
  ): void {
    this.stop();

    this.song = song;
    this.tempo = song.tempo;
    this.currentIndex = 0;
    this.isPlaying = true;
    this.onNoteCallback = onNote || null;
    this.nextNoteTime = 0;

    this.getContext(); // Ensure audio context is initialized
    this.scheduleNotes(notes);
  }

  private scheduleNotes(notes: RenderedNote[]): void {
    if (!this.isPlaying || !this.song) return;

    const ctx = this.getContext();
    const now = ctx.currentTime;

    // Delay audio by the same fraction of a beat as the visual note offset (0.25 beats)
    // This keeps audio-visual sync consistent across all tempos
    const visualOffsetBeats = 0.25;
    const audioLatencyOffset = this.beatsToSeconds(visualOffsetBeats);

    // Initialize start time on first call
    if (this.nextNoteTime === 0) {
      this.nextNoteTime = now + audioLatencyOffset;
    }

    // Schedule notes that are coming up
    while (this.currentIndex < notes.length && this.nextNoteTime < now + 0.12) {
      const note = notes[this.currentIndex];
      const duration = Math.max(0.12, this.beatsToSeconds(note.duration) * 0.9);

      // Calculate when this note should play relative to now
      const startDelay = Math.max(0, this.nextNoteTime - now);

      // Play the note with delay for sync
      this.playNote(note.midi, duration, startDelay);

      // Notify callback
      if (this.onNoteCallback) {
        this.onNoteCallback(this.currentIndex);
      }

      // Advance timing
      this.nextNoteTime += this.beatsToSeconds(note.duration);
      this.currentIndex++;
    }

    // Check if we're done
    if (this.currentIndex >= notes.length) {
      this.isPlaying = false;
      this.nextNoteTime = 0;
      if (this.onNoteCallback) {
        this.onNoteCallback(-1); // Signal end
      }
      return;
    }

    // Continue scheduling
    this.rafId = requestAnimationFrame(() => this.scheduleNotes(notes));
  }

  // Pause playback
  pause(): void {
    this.isPlaying = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  // Stop playback and reset
  stop(): void {
    this.pause();
    this.currentIndex = 0;
    this.nextNoteTime = 0;
    if (this.onNoteCallback) {
      this.onNoteCallback(-1);
    }
  }

  // Reset to beginning without stopping context
  reset(): void {
    this.currentIndex = 0;
    this.nextNoteTime = 0;
  }

  // Seek to a specific note index and continue playing
  seekTo(noteIndex: number, notes: RenderedNote[]): void {
    if (noteIndex < 0 || noteIndex >= notes.length) return;

    // Pause current scheduling
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Reset timing and index
    this.currentIndex = noteIndex;
    this.nextNoteTime = 0;

    // Resume if was playing
    if (this.isPlaying) {
      this.scheduleNotes(notes);
    }
  }

  // Set tempo
  setTempo(bpm: number): void {
    this.tempo = bpm;
  }

  // Get current state
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}

// Singleton instance
let playerInstance: AudioPlayer | null = null;

export function getAudioPlayer(): AudioPlayer {
  if (!playerInstance) {
    playerInstance = new AudioPlayer();
  }
  return playerInstance;
}
