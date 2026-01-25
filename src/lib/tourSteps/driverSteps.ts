import type { DriveStep } from "driver.js";
import type { TutorialModule } from "@/hooks/useTutorial";

// Element IDs used by the tour (must match IDs added to components)
export const TOUR_ELEMENT_IDS = {
  // UI Section Groups (for overview tour)
  sectionStaffCanvas: "tour-section-staff",
  sectionToolPalette: "tour-section-tools",
  sectionPlayControls: "tour-section-play",
  sectionUtilityButtons: "tour-section-utility",
  sectionMusicSettings: "tour-section-settings",
  sectionUndoRedo: "tour-section-undo",
  sectionSongLibrary: "tour-section-song",
  learnButton: "tour-learn-button",

  // Tool palette
  toolPalette: "tour-tool-palette",
  wholeNoteTool: "tour-whole-note",
  dottedHalfTool: "tour-dotted-half",
  halfNoteTool: "tour-half-note",
  dottedQuarterTool: "tour-dotted-quarter",
  quarterNoteTool: "tour-quarter-note",
  dottedEighthTool: "tour-dotted-eighth",
  eighthNoteTool: "tour-eighth-note",
  sixteenthNoteTool: "tour-sixteenth-note",
  deleteTool: "tour-delete-tool",
  repeatTool: "tour-repeat-tool",
  lyricsTool: "tour-lyrics-tool",
  timesigTool: "tour-timesig-tool",
  moveToggle: "tour-move-toggle",

  // Staff/Canvas
  staffCanvas: "tour-staff-canvas",

  // Header controls
  songSelector: "tour-song-selector",
  undoButton: "tour-undo-button",
  redoButton: "tour-redo-button",
  timeSigDisplay: "tour-time-sig",
  tempoDisplay: "tour-tempo",
  measuresPerRow: "tour-measures-per-row",
  totalMeasures: "tour-total-measures",
  playButton: "tour-play-button",
  pianoToggle: "tour-piano-toggle",
  settingsButton: "tour-settings-button",
  helpButton: "tour-help-button",

  // Piano drawer
  pianoDrawer: "tour-piano-drawer",
  pianoKeys: "tour-piano-keys",
} as const;

// Step definitions for each tutorial module
export const DRIVER_STEPS: Record<TutorialModule, DriveStep[]> = {
  // UI Overview - Quick tour of main interface sections
  "ui-overview": [
    {
      popover: {
        title: "Welcome to Rochel Music! 🎵",
        description:
          "Let's take a quick tour of the interface. We'll show you where everything is, and you can explore detailed tutorials later.",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.songSelector}`,
      popover: {
        title: "📁 Song Library",
        description:
          "Your songs live here! Click to open the library where you can save your work, load example songs, or start fresh. Songs save automatically to your browser.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.sectionUndoRedo}`,
      popover: {
        title: "↶ Undo & Redo",
        description:
          "Made a mistake? No problem! Undo your last action or redo to bring it back. Keyboard shortcuts: Cmd+Z (undo) and Cmd+Shift+Z (redo).",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.sectionMusicSettings}`,
      popover: {
        title: "🎼 Music Settings",
        description:
          "Control your composition here: Time signature (4/4, 3/4, etc.), tempo (playback speed), and how many measures to display per row.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.sectionUtilityButtons}`,
      popover: {
        title: "🛠️ Tools & Settings",
        description:
          "Piano keyboard toggle, app settings, tutorials, help, and download options. The book icon opens the tutorial menu you're using now!",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.sectionPlayControls}`,
      popover: {
        title: "▶️ Play Controls",
        description:
          "Hit Play to hear your music! Press Space as a shortcut. A green playhead will follow along on the staff as your notes play.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.toolPalette}`,
      popover: {
        title: "🎵 Note Tools",
        description:
          "Select a note duration (whole, half, quarter, eighth), then click on the staff to place it. Also includes delete, repeat markers, and lyrics tools.",
        side: "left",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.staffCanvas}`,
      popover: {
        title: "📜 Music Staff",
        description:
          "This is your canvas! Click to place notes, drag them to reposition, or right-click for quick editing. Notes snap to the nearest line or space.",
        side: "top",
        align: "center",
      },
    },
    {
      popover: {
        title: "You're Ready! 🎉",
        description:
          "That's the overview! Click the 📖 Learn button anytime to explore detailed tutorials on note editing, piano playback, and advanced features. Now go make some music!",
      },
    },
  ],

  "getting-started": [
    {
      element: `#${TOUR_ELEMENT_IDS.toolPalette}`,
      popover: {
        title: "Tool Palette",
        description:
          "Select a note duration here. Start with Quarter notes - they're the most common!",
        side: "left",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.staffCanvas}`,
      popover: {
        title: "Music Staff",
        description:
          "Click anywhere on the staff to place your note. Notes snap to the closest line or space.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.playButton}`,
      popover: {
        title: "Play Your Music",
        description:
          "Press this button (or hit Space) to hear your composition. The playhead will follow along!",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.songSelector}`,
      popover: {
        title: "Song Library",
        description:
          "Save your work, load example songs, or start fresh. Your songs are saved automatically in your browser.",
        side: "bottom",
        align: "start",
      },
    },
  ],

  "note-editing": [
    {
      element: `#${TOUR_ELEMENT_IDS.staffCanvas}`,
      popover: {
        title: "Right-Click Notes",
        description:
          "Right-click any note to change its duration or delete it. A quick way to edit!",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.moveToggle}`,
      popover: {
        title: "Move Mode",
        description:
          "Toggle this ON to drag and reposition notes and repeat markers. It's OFF by default to prevent accidental moves.",
        side: "left",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.staffCanvas}`,
      popover: {
        title: "Drag to Reposition",
        description:
          "With Move mode ON, click and drag any note to reposition it. This also works for repeat markers!",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.deleteTool}`,
      popover: {
        title: "Delete Tool",
        description:
          "Select this tool, then click any note to remove it. Click the tool again to deselect.",
        side: "left",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.undoButton}`,
      popover: {
        title: "Undo & Redo",
        description:
          "Made a mistake? Use Undo (Cmd+Z) to go back, or Redo (Cmd+Shift+Z) to restore.",
        side: "bottom",
        align: "center",
      },
    },
  ],

  "piano-playback": [
    {
      element: `#${TOUR_ELEMENT_IDS.pianoToggle}`,
      popover: {
        title: "Piano Keyboard",
        description:
          "Click to show or hide the piano keyboard. Perfect for learning note names!",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.pianoToggle}`,
      popover: {
        title: "Keyboard Shortcuts",
        description:
          "Play notes with your keyboard: A-K for white keys (C4-C5), W/E/T/Y/U for black keys. Hold Shift for sustain!",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.tempoDisplay}`,
      popover: {
        title: "Tempo Control",
        description:
          "Click to change the playback speed (40-200 BPM). Slower is great for learning!",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.staffCanvas}`,
      popover: {
        title: "Visual Playhead",
        description:
          "During playback, the green line shows the current position. The active note is highlighted!",
        side: "top",
        align: "center",
      },
    },
  ],

  "advanced-features": [
    {
      element: `#${TOUR_ELEMENT_IDS.repeatTool}`,
      popover: {
        title: "Repeat Sections",
        description:
          "Create repeat signs: click the start measure, then click the end measure. Great for verses and choruses!",
        side: "left",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.lyricsTool}`,
      popover: {
        title: "Add Lyrics",
        description:
          "Open the lyrics editor to add words that align with each beat. Perfect for songs!",
        side: "left",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.timeSigDisplay}`,
      popover: {
        title: "Time Signature",
        description:
          "Click to change between 4/4, 3/4, 6/8, and more. Each affects how beats are grouped.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: `#${TOUR_ELEMENT_IDS.settingsButton}`,
      popover: {
        title: "Settings",
        description:
          "Customize your view: show note labels, enable chord mode, toggle the grid, and more!",
        side: "bottom",
        align: "center",
      },
    },
  ],
};

// Popover class for custom styling
export const DRIVER_POPOVER_CLASS = "rochel-tour-popover";
