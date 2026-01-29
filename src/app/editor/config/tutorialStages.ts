/**
 * Tutorial Stage Configuration
 *
 * Defines the progressive disclosure stages for the editor tutorial.
 * Each stage controls what UI elements are visible and how to advance.
 */

import { NoteTool } from "@/components/NoteEditorRefactored";

// Types for tutorial advancement conditions
export type TutorialAdvanceCondition =
  | { type: "note-placed"; count?: number }
  | { type: "tool-selected"; tool?: NoteTool }
  | { type: "context-menu-used" }
  | { type: "play-started" }
  | { type: "repeat-changed" }
  | { type: "lyrics-changed" }
  | { type: "manual"; minActions?: number };

// Section types that can be hidden in the tool palette
export type PaletteSection = "notes" | "markup" | "actions";

// Context menu sections that can be progressively revealed
export type ContextMenuSection =
  | "duration"
  | "accidental"
  | "changeNote"
  | "octave"
  | "delete";

// All context menu sections in display order
export const ALL_CONTEXT_MENU_SECTIONS: ContextMenuSection[] = [
  "duration",
  "accidental",
  "changeNote",
  "octave",
  "delete",
];

// Tutorial stage definition
export interface TutorialStage {
  id: string;
  title: string;
  instruction: string;
  hint?: string;

  // UI Visibility
  allowedTools: NoteTool[];
  hidePaletteSections: PaletteSection[];
  showHeader: boolean;
  showMeasureControls: boolean;
  showPlayButton: boolean;
  showPiano: boolean;
  maxMeasures: number;

  // Context menu visibility (undefined = show all)
  visibleContextMenuSections?: ContextMenuSection[];

  // Tool to highlight in the palette (draws attention to a specific tool)
  highlightTool?: NoteTool;

  // Advancement
  advanceOn: TutorialAdvanceCondition;
  canRepeat: boolean;
  minActionsRequired?: number;
}

/**
 * All tutorial stages in order.
 * Users progress through these stages as they learn the editor.
 */
export const TUTORIAL_STAGES: TutorialStage[] = [
  // Stage 1: Welcome - Place your first note
  {
    id: "welcome",
    title: "Welcome! Place Your First Note",
    instruction: "Click anywhere on the staff lines to place a quarter note.",
    hint: "The quarter note tool [quarter] is already selected for you in the left panel.",
    allowedTools: ["quarter"],
    hidePaletteSections: ["markup", "actions"],
    showHeader: false,
    showMeasureControls: false,
    showPlayButton: false,
    showPiano: false,
    maxMeasures: 4,
    advanceOn: { type: "note-placed", count: 1 },
    canRepeat: true,
  },

  // Stage 2: More Notes - Learn different durations
  {
    id: "more-notes",
    title: "Try Different Note Lengths",
    instruction:
      "Select half notes or quarter notes from the palette and add more notes to your melody.",
    hint: "Click the half note [half] or quarter note [quarter] button in the left panel to switch note types. Half notes last twice as long as quarter notes.",
    allowedTools: ["quarter", "half"],
    hidePaletteSections: ["markup", "actions"],
    showHeader: false,
    showMeasureControls: false,
    showPlayButton: false,
    showPiano: false,
    maxMeasures: 4,
    advanceOn: { type: "manual", minActions: 2 },
    canRepeat: true,
    minActionsRequired: 2,
  },

  // Stage 3: Edit Notes - Context menu and delete (simplified menu)
  {
    id: "edit-notes",
    title: "Edit Your Notes",
    instruction:
      "Right-click on any note to open the editing menu. Try changing the duration of a note, or delete it.",
    hint: "Right-click a note to see options. You can also select the Delete tool [delete] in the left panel and click notes to delete them.",
    allowedTools: ["quarter", "half", "eighth", "delete"],
    hidePaletteSections: ["markup"],
    showHeader: false,
    showMeasureControls: false,
    showPlayButton: false,
    showPiano: false,
    maxMeasures: 4,
    visibleContextMenuSections: ["duration", "delete"], // Start simple
    advanceOn: { type: "context-menu-used" },
    canRepeat: true,
  },

  // Stage 4: Playback - Hear your music
  {
    id: "playback",
    title: "Listen to Your Music",
    instruction:
      "Press the Play button to hear your melody! You can adjust the tempo later.",
    hint: "Click the Play button at the top of the screen, or press Spacebar as a shortcut.",
    allowedTools: ["quarter", "half", "eighth", "whole", "delete"],
    hidePaletteSections: ["markup"],
    showHeader: true,
    showMeasureControls: false,
    showPlayButton: true,
    showPiano: false,
    maxMeasures: 4,
    visibleContextMenuSections: ["duration", "changeNote", "delete"], // Add pitch changing
    advanceOn: { type: "play-started" },
    canRepeat: true,
  },

  // Stage 5: Expand - Full controls
  {
    id: "expand",
    title: "Expand Your Composition",
    instruction:
      "Now you have access to measure controls. Add more measures to create a longer piece.",
    hint: "Use the + button in the top header to add measures. Select note durations ([whole] [half] [quarter] [eighth]) from the left panel. Right-click notes for more options.",
    allowedTools: [
      "quarter",
      "half",
      "eighth",
      "whole",
      "dotted-quarter",
      "dotted-half",
      "delete",
    ],
    hidePaletteSections: ["markup"],
    showHeader: true,
    showMeasureControls: true,
    showPlayButton: true,
    showPiano: false,
    maxMeasures: 8,
    visibleContextMenuSections: [
      "duration",
      "accidental",
      "changeNote",
      "octave",
      "delete",
    ], // Full menu
    advanceOn: { type: "manual" },
    canRepeat: true,
  },

  // Stage 6: Repeat Markers - Learn to add repeats
  {
    id: "repeat-markers",
    title: "Add Repeat Signs",
    instruction:
      "Select the Repeat tool (highlighted in the side panel), then click on a bar line to add repeat signs. Once you place a repeat, click Next to continue.",
    hint: "Click the Repeat button [repeat] in the Markup section of the left panel (it's highlighted). Then click any bar line on the staff.",
    allowedTools: [
      "quarter",
      "half",
      "eighth",
      "whole",
      "dotted-quarter",
      "dotted-half",
      "delete",
      "repeat",
    ],
    hidePaletteSections: [],
    showHeader: true,
    showMeasureControls: true,
    showPlayButton: true,
    showPiano: false,
    maxMeasures: 8,
    visibleContextMenuSections: [
      "duration",
      "accidental",
      "changeNote",
      "octave",
      "delete",
    ],
    highlightTool: "repeat",
    advanceOn: { type: "repeat-changed" },
    canRepeat: true,
  },

  // Stage 7: Lyrics - Learn to add lyrics
  {
    id: "lyrics",
    title: "Add Lyrics to Your Music",
    instruction:
      "Select the Lyrics tool (highlighted), then click on any note to add a syllable. Once you add lyrics, click Next to continue.",
    hint: "Click the Lyrics button (labeled 'Aa') in the Markup section of the left panel (it's highlighted). Then click a note and type a syllable.",
    allowedTools: [
      "quarter",
      "half",
      "eighth",
      "whole",
      "dotted-quarter",
      "dotted-half",
      "delete",
      "repeat",
      "lyrics",
    ],
    hidePaletteSections: [],
    showHeader: true,
    showMeasureControls: true,
    showPlayButton: true,
    showPiano: false,
    maxMeasures: 8,
    visibleContextMenuSections: [
      "duration",
      "accidental",
      "changeNote",
      "octave",
      "delete",
    ],
    highlightTool: "lyrics",
    advanceOn: { type: "lyrics-changed" },
    canRepeat: true,
  },

  // Stage 8: Complete - Full UI unlocked
  {
    id: "complete",
    title: "You're Ready!",
    instruction:
      "Congratulations! You now have access to all editor features including the piano keyboard. Keep creating!",
    hint: "All tools are now available in the left panel: note durations, repeats, lyrics, and time signature. The piano at the bottom shows which notes are playing.",
    allowedTools: [
      "sixteenth",
      "eighth",
      "dotted-eighth",
      "quarter",
      "dotted-quarter",
      "half",
      "dotted-half",
      "whole",
      "delete",
      "repeat",
      "lyrics",
      "timesig",
    ],
    hidePaletteSections: [],
    showHeader: true,
    showMeasureControls: true,
    showPlayButton: true,
    showPiano: true,
    maxMeasures: 99,
    advanceOn: { type: "manual" },
    canRepeat: false,
  },
];

/**
 * Get a stage by its ID
 */
export function getStageById(id: string): TutorialStage | undefined {
  return TUTORIAL_STAGES.find((stage) => stage.id === id);
}

/**
 * Get the index of a stage by its ID
 */
export function getStageIndex(id: string): number {
  return TUTORIAL_STAGES.findIndex((stage) => stage.id === id);
}

/**
 * Check if a stage is the final stage
 */
export function isFinalStage(stageId: string): boolean {
  return stageId === TUTORIAL_STAGES[TUTORIAL_STAGES.length - 1].id;
}
