"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ConceptCard } from "../components/ConceptCard";
import { StageComplete } from "../components/StageComplete";
import { getAudioPlayer } from "@/lib/audio/AudioPlayer";
import { pitchToMidi, getNoteColor } from "@/lib/constants";
import { Pitch } from "@/lib/types";

interface Stage1StaffProps {
  onComplete: () => void;
}

// Notes to teach in Stage 1 (C4 to C5)
const STAGE1_NOTES: { pitch: Pitch; label: string; position: string }[] = [
  { pitch: "C4", label: "C", position: "Below the staff (ledger line)" },
  { pitch: "D4", label: "D", position: "Just below bottom line" },
  { pitch: "E4", label: "E", position: "On the bottom line" },
  { pitch: "F4", label: "F", position: "In the first space" },
  { pitch: "G4", label: "G", position: "On the second line" },
  { pitch: "A4", label: "A", position: "In the second space" },
  { pitch: "B4", label: "B", position: "On the third line" },
  { pitch: "C5", label: "C", position: "In the third space" },
];

export function Stage1Staff({ onComplete }: Stage1StaffProps) {
  const [step, setStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [playedNotes, setPlayedNotes] = useState<Set<string>>(new Set());

  // Refs for scrolling to sections
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const step4Ref = useRef<HTMLDivElement>(null);

  // Scroll to newly revealed section when step changes
  useEffect(() => {
    const refs = [step1Ref, step2Ref, step3Ref, step4Ref];
    const targetRef = refs[step];
    if (targetRef?.current && step > 0) {
      // Small delay to allow DOM to render
      setTimeout(() => {
        targetRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [step]);

  const handlePlayNote = useCallback((pitch: Pitch) => {
    const player = getAudioPlayer();
    const midi = pitchToMidi(pitch);
    if (midi !== null) {
      player.playNote(midi, 0.5);
      setPlayedNotes((prev) => new Set([...prev, pitch]));
    }
  }, []);

  const handleNextStep = useCallback(() => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setShowComplete(true);
    }
  }, [step]);

  const handleContinue = useCallback(() => {
    setShowComplete(false);
    onComplete();
  }, [onComplete]);

  // All notes played?
  const allNotesPlayed = playedNotes.size >= 5;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Stage intro */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-purple-800 mb-2">
          The Staff & Notes
        </h1>
        <p className="text-gray-600">
          Learn where notes live and how to read them
        </p>
      </div>

      {/* Step 1: What is a staff? */}
      <div ref={step1Ref}>
        {step >= 0 && (
          <ConceptCard title="What is a Staff?" emoji="🎼">
            <p className="mb-4">
              A <strong>staff</strong> is a set of horizontal lines where we
              write music. Think of it like lined paper for notes!
            </p>
            <div className="bg-gray-50 rounded-lg p-4 my-4">
              {/* Simple staff visualization */}
              <svg viewBox="0 0 400 100" className="w-full max-w-md mx-auto">
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="20"
                    y1={20 + i * 15}
                    x2="380"
                    y2={20 + i * 15}
                    stroke="#6b7280"
                    strokeWidth="1"
                  />
                ))}
                <text
                  x="200"
                  y="95"
                  textAnchor="middle"
                  className="text-sm"
                  fill="#6b7280"
                >
                  ↑ 5 lines = 1 staff
                </text>
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              Notes sit <strong>on lines</strong> or{" "}
              <strong>in the spaces between lines</strong>.
            </p>
          </ConceptCard>
        )}
      </div>

      {/* Step 2: High vs Low */}
      <div ref={step2Ref}>
        {step >= 1 && (
          <ConceptCard title="High & Low" emoji="📈">
            <p className="mb-4">
              Notes placed <strong>higher on the staff</strong> sound{" "}
              <strong>higher</strong> (like a bird chirping).
              <br />
              Notes placed <strong>lower</strong> sound <strong>lower</strong>{" "}
              (like a bear growling).
            </p>
            <div className="bg-gray-50 rounded-lg p-4 my-4 flex justify-around items-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🐦</div>
                <div className="text-sm text-gray-600">High notes</div>
              </div>
              <div className="text-2xl text-gray-400">↕️</div>
              <div className="text-center">
                <div className="text-4xl mb-2">🐻</div>
                <div className="text-sm text-gray-600">Low notes</div>
              </div>
            </div>
          </ConceptCard>
        )}
      </div>

      {/* Step 3: Meet the notes */}
      <div ref={step3Ref}>
        {step >= 2 && (
          <ConceptCard title="Meet the Notes" emoji="🎵" variant="interactive">
            <p className="mb-4">
              Click each note to hear how it sounds! Notes are named using
              letters: <strong>C D E F G A B</strong> (then it repeats).
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 my-4">
              {STAGE1_NOTES.map((note) => {
                const color = getNoteColor(note.pitch);
                const isPlayed = playedNotes.has(note.pitch);
                return (
                  <button
                    key={note.pitch}
                    onClick={() => handlePlayNote(note.pitch)}
                    className={`
                    p-3 rounded-xl border-2 transition-all
                    ${isPlayed ? "ring-2 ring-teal-400 ring-offset-2" : ""}
                    hover:scale-105 active:scale-95
                  `}
                    style={{
                      backgroundColor: color + "20",
                      borderColor: color,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: color }}
                    />
                    <div className="font-bold text-gray-800">{note.label}</div>
                    <div className="text-xs text-gray-500">{note.pitch}</div>
                  </button>
                );
              })}
            </div>
            {allNotesPlayed && (
              <div className="text-center text-teal-600 font-medium">
                Great job! You heard all the notes!
              </div>
            )}
          </ConceptCard>
        )}
      </div>

      {/* Step 4: Lines vs Spaces */}
      <div ref={step4Ref}>
        {step >= 3 && (
          <ConceptCard title="Lines vs Spaces" emoji="📍" variant="tip">
            <p className="mb-4">
              <strong>Tip:</strong> Notes on <em>lines</em> have the line going
              through their middle. Notes in <em>spaces</em> sit between two
              lines.
            </p>
            <div className="bg-amber-50 rounded-lg p-4 my-4">
              <div className="flex justify-center gap-16 text-center">
                <div>
                  <div className="text-2xl mb-2">━●━</div>
                  <div className="text-sm font-medium">On a line</div>
                  <div className="text-xs text-gray-500">E, G, B</div>
                </div>
                <div>
                  <div className="text-2xl mb-2 leading-tight">
                    ━<br />●<br />━
                  </div>
                  <div className="text-sm font-medium">In a space</div>
                  <div className="text-xs text-gray-500">F, A, C</div>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <strong>Key insight:</strong> Notes go in order:{" "}
                <strong>C-D-E-F-G-A-B</strong>, then back to C again! They
                alternate between lines and spaces as you move up the staff.
              </p>
              <p className="text-xs text-gray-500">
                If you know one note, the next one up is always the next letter
                (and after G comes A).
              </p>
            </div>
          </ConceptCard>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            step === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
          }`}
        >
          ← Previous
        </button>

        <button
          onClick={handleNextStep}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all shadow-md"
        >
          {step < 3 ? "Next →" : "Complete Stage →"}
        </button>
      </div>

      {/* Stage complete modal */}
      {showComplete && <StageComplete stage={1} onContinue={handleContinue} />}
    </div>
  );
}
