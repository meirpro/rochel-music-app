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

  // Play a single note (for click-to-play)
  // startDelay allows scheduling notes slightly in the future for sync
  playNote(midi: number, durationSeconds = 0.35, startDelay = 0): void {
    if (midi === 0) return; // REST

    const ctx = this.getContext();
    const startTime = ctx.currentTime + startDelay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Calculate frequency from MIDI note number
    const freq = 440 * Math.pow(2, (midi - 69) / 12);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    // ADSR envelope
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.25, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + durationSeconds + 0.02);
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
