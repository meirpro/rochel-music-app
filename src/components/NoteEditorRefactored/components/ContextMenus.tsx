// src/components/NoteEditorRefactored/components/ContextMenus.tsx
// Context menus for note editing and adding notes in empty space
//
// This file exports two components:
// 1. NoteContextMenu - Menu for editing an existing note (duration, accidental, pitch, octave, delete)
// 2. EmptyContextMenu - Menu for adding a new note at an empty position
//
// Usage:
// ```tsx
// {contextMenu?.type === "note" && (
//   <NoteContextMenu
//     contextMenu={contextMenu}
//     collapsedSections={collapsedSections}
//     onToggleSection={toggleSection}
//     onChangeDuration={handleChangeDuration}
//     onChangeAccidental={handleChangeAccidental}
//     onChangePitchLetter={handleChangePitchLetter}
//     onChangeOctave={handleChangeOctave}
//     onDelete={handleDeleteFromMenu}
//   />
// )}
//
// {contextMenu?.type === "empty" && (
//   <EmptyContextMenu
//     contextMenu={contextMenu}
//     onAddNote={handleAddNoteFromMenu}
//   />
// )}
// ```

import React from "react";
import { Pitch } from "@/lib/types";
import { MenuNoteIcon, MenuRestIcon } from "./MenuNoteIcon";
import { CollapsedSections } from "../hooks/useContextMenu";

// ============================================================================
// TYPES
// ============================================================================

export interface NoteContextMenuState {
  type: "note";
  noteId: string;
  x: number;
  y: number;
}

export interface EmptyContextMenuState {
  type: "empty";
  x: number;
  y: number;
  beat: number;
  system: number;
  pitch: Pitch;
}

// Context menu section types for progressive disclosure
export type ContextMenuSection =
  | "duration"
  | "accidental"
  | "changeNote"
  | "octave"
  | "rest"
  | "delete";

export interface NoteContextMenuProps {
  contextMenu: NoteContextMenuState;
  collapsedSections: CollapsedSections;
  onToggleSection: (
    section:
      | "duration"
      | "accidental"
      | "changeNote"
      | "octave"
      | "rest"
      | "note",
  ) => void;
  onChangeDuration: (duration: number) => void;
  onChangeAccidental: (accidental: "#" | "b" | null) => void;
  onChangePitchLetter: (letter: string) => void;
  onChangeOctave: (direction: "up" | "down") => void;
  /** Convert note to rest with specified duration */
  onConvertToRest: (duration: number) => void;
  /** Convert rest back to note with specified duration (pitch defaults to C4) */
  onConvertToNote: (duration: number) => void;
  onDelete: () => void;
  /** Which sections to show (undefined = show all) */
  visibleSections?: ContextMenuSection[];
  /** Whether the selected note is a rest */
  isRest?: boolean;
}

export interface EmptyContextMenuProps {
  contextMenu: EmptyContextMenuState;
  onAddNote: (duration: number) => void;
}

// ============================================================================
// NOTE CONTEXT MENU
// ============================================================================

/**
 * NoteContextMenu - Menu for editing an existing note
 *
 * Sections (all collapsible):
 * - Duration: Change note duration (sixteenth to whole)
 * - Accidental: Set natural, sharp, or flat
 * - Change Note: Change pitch letter (C-B)
 * - Octave: Move up or down an octave
 * - Delete: Remove the note
 */
export function NoteContextMenu({
  contextMenu,
  collapsedSections,
  onToggleSection,
  onChangeDuration,
  onChangeAccidental,
  onChangePitchLetter,
  onChangeOctave,
  onConvertToRest,
  onConvertToNote,
  onDelete,
  visibleSections,
  isRest = false,
}: NoteContextMenuProps) {
  // Helper to check if a section should be shown
  // Hide pitch-related sections (accidental, changeNote, octave) for rests
  const showSection = (section: ContextMenuSection) => {
    if (visibleSections && !visibleSections.includes(section)) return false;
    // Rests don't have pitch-related properties
    if (
      isRest &&
      (section === "accidental" ||
        section === "changeNote" ||
        section === "octave")
    ) {
      return false;
    }
    return true;
  };

  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px] overflow-y-auto"
      style={{
        left: contextMenu.x,
        top: Math.min(
          contextMenu.y,
          typeof window !== "undefined"
            ? window.innerHeight - 600
            : contextMenu.y,
        ),
        maxHeight: "calc(100vh - 40px)",
      }}
    >
      {/* Duration section */}
      {showSection("duration") && (
        <>
          <button
            onClick={() => onToggleSection("duration")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Duration</span>
            <span className="text-gray-400">
              {collapsedSections.duration ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.duration && (
            <>
              <button
                onClick={() => onChangeDuration(0.25)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={0.25} /> Sixteenth
              </button>
              <button
                onClick={() => onChangeDuration(0.5)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={0.5} /> Eighth
              </button>
              <button
                onClick={() => onChangeDuration(0.75)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={0.75} /> Dotted Eighth
              </button>
              <button
                onClick={() => onChangeDuration(1)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={1} /> Quarter
              </button>
              <button
                onClick={() => onChangeDuration(1.5)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={1.5} /> Dotted Quarter
              </button>
              <button
                onClick={() => onChangeDuration(2)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={2} /> Half
              </button>
              <button
                onClick={() => onChangeDuration(3)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={3} /> Dotted Half
              </button>
              <button
                onClick={() => onChangeDuration(4)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={4} /> Whole
              </button>
            </>
          )}
        </>
      )}

      {/* Convert to Rest section (shown for notes) / Convert to Note section (shown for rests) */}
      {isRest ? (
        <>
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => onToggleSection("note")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Convert to Note</span>
            <span className="text-gray-400">
              {collapsedSections.note ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.note && (
            <>
              <button
                onClick={() => onConvertToNote(0.5)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={0.5} /> Eighth Note
              </button>
              <button
                onClick={() => onConvertToNote(1)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={1} /> Quarter Note
              </button>
              <button
                onClick={() => onConvertToNote(2)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={2} /> Half Note
              </button>
              <button
                onClick={() => onConvertToNote(4)}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
              >
                <MenuNoteIcon duration={4} /> Whole Note
              </button>
            </>
          )}
        </>
      ) : (
        showSection("rest") && (
          <>
            <div className="border-t border-gray-200 my-1" />
            <button
              onClick={() => onToggleSection("rest")}
              className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
            >
              <span>Convert to Rest</span>
              <span className="text-gray-400">
                {collapsedSections.rest ? "▸" : "▾"}
              </span>
            </button>
            {!collapsedSections.rest && (
              <>
                <button
                  onClick={() => onConvertToRest(0.5)}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <MenuRestIcon duration={0.5} /> Eighth Rest
                </button>
                <button
                  onClick={() => onConvertToRest(1)}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <MenuRestIcon duration={1} /> Quarter Rest
                </button>
                <button
                  onClick={() => onConvertToRest(2)}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <MenuRestIcon duration={2} /> Half Rest
                </button>
                <button
                  onClick={() => onConvertToRest(4)}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <MenuRestIcon duration={4} /> Whole Rest
                </button>
              </>
            )}
          </>
        )
      )}

      {/* Accidental section */}
      {showSection("accidental") && (
        <>
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => onToggleSection("accidental")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Accidental</span>
            <span className="text-gray-400">
              {collapsedSections.accidental ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.accidental && (
            <div className="px-2 py-1 flex gap-1">
              <button
                onClick={() => onChangeAccidental(null)}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 font-medium"
                title="Natural"
              >
                ♮
              </button>
              <button
                onClick={() => onChangeAccidental("#")}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 font-medium"
                title="Sharp"
              >
                ♯
              </button>
              <button
                onClick={() => onChangeAccidental("b")}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 font-medium"
                title="Flat"
              >
                ♭
              </button>
            </div>
          )}
        </>
      )}

      {/* Change Note section */}
      {showSection("changeNote") && (
        <>
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => onToggleSection("changeNote")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Change Note</span>
            <span className="text-gray-400">
              {collapsedSections.changeNote ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.changeNote && (
            <div className="px-2 py-1 flex gap-0.5">
              {["C", "D", "E", "F", "G", "A", "B"].map((letter) => (
                <button
                  key={letter}
                  onClick={() => onChangePitchLetter(letter)}
                  className="flex-1 px-1 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 font-medium"
                >
                  {letter}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Octave section */}
      {showSection("octave") && (
        <>
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => onToggleSection("octave")}
            className="w-full px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50"
          >
            <span>Octave</span>
            <span className="text-gray-400">
              {collapsedSections.octave ? "▸" : "▾"}
            </span>
          </button>
          {!collapsedSections.octave && (
            <div className="px-2 py-1 flex gap-1">
              <button
                onClick={() => onChangeOctave("up")}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 flex items-center justify-center gap-1"
                title="Octave Up"
              >
                <span>▲</span> Up
              </button>
              <button
                onClick={() => onChangeOctave("down")}
                className="flex-1 px-2 py-1.5 text-sm hover:bg-gray-100 rounded border border-gray-200 flex items-center justify-center gap-1"
                title="Octave Down"
              >
                <span>▼</span> Down
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete section */}
      {showSection("delete") && (
        <>
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={onDelete}
            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
          >
            <span>🗑</span> Delete
          </button>
        </>
      )}
    </div>
  );
}

// ============================================================================
// EMPTY CONTEXT MENU
// ============================================================================

/**
 * EmptyContextMenu - Menu for adding a new note at an empty position
 *
 * Shows the pitch that will be added and duration options (sixteenth to whole)
 */
export function EmptyContextMenu({
  contextMenu,
  onAddNote,
}: EmptyContextMenuProps) {
  return (
    <div
      className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[180px] overflow-y-auto"
      style={{
        left: contextMenu.x,
        top: Math.min(
          contextMenu.y,
          typeof window !== "undefined"
            ? window.innerHeight - 370
            : contextMenu.y,
        ),
        maxHeight: "calc(100vh - 40px)",
      }}
    >
      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Add Note ({contextMenu.pitch})
      </div>
      <button
        onClick={() => onAddNote(0.25)}
        className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <MenuNoteIcon duration={0.25} /> Sixteenth
      </button>
      <button
        onClick={() => onAddNote(0.5)}
        className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <MenuNoteIcon duration={0.5} /> Eighth
      </button>
      <button
        onClick={() => onAddNote(0.75)}
        className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <MenuNoteIcon duration={0.75} /> Dotted Eighth
      </button>
      <button
        onClick={() => onAddNote(1)}
        className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <MenuNoteIcon duration={1} /> Quarter
      </button>
      <button
        onClick={() => onAddNote(1.5)}
        className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <MenuNoteIcon duration={1.5} /> Dotted Quarter
      </button>
      <button
        onClick={() => onAddNote(2)}
        className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <MenuNoteIcon duration={2} /> Half
      </button>
      <button
        onClick={() => onAddNote(3)}
        className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <MenuNoteIcon duration={3} /> Dotted Half
      </button>
      <button
        onClick={() => onAddNote(4)}
        className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <MenuNoteIcon duration={4} /> Whole
      </button>
    </div>
  );
}
