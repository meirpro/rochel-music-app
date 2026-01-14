import { TOUR_ELEMENT_IDS } from "./driverSteps";

// NextStepjs Tour format
export interface NextStepTour {
  tour: string;
  steps: Array<{
    icon: string;
    title: string;
    content: string;
    selector?: string;
    side?: "top" | "bottom" | "left" | "right";
    showControls?: boolean;
    showSkip?: boolean;
  }>;
}

// All tours for NextStepjs
export const NEXTSTEP_TOURS: NextStepTour[] = [
  {
    tour: "getting-started",
    steps: [
      {
        icon: "🎵",
        title: "Tool Palette",
        content:
          "Select a note duration here. Start with Quarter notes - they're the most common!",
        selector: `#${TOUR_ELEMENT_IDS.toolPalette}`,
        side: "left",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "🎼",
        title: "Music Staff",
        content:
          "Click anywhere on the staff to place your note. Notes snap to the closest line or space.",
        selector: `#${TOUR_ELEMENT_IDS.staffCanvas}`,
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "▶️",
        title: "Play Your Music",
        content:
          "Press this button (or hit Space) to hear your composition. The playhead will follow along!",
        selector: `#${TOUR_ELEMENT_IDS.playButton}`,
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "💾",
        title: "Song Library",
        content:
          "Save your work, load example songs, or start fresh. Your songs are saved automatically in your browser.",
        selector: `#${TOUR_ELEMENT_IDS.songSelector}`,
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
    ],
  },
  {
    tour: "note-editing",
    steps: [
      {
        icon: "🖱️",
        title: "Right-Click Notes",
        content:
          "Right-click any note to change its duration or delete it. A quick way to edit!",
        selector: `#${TOUR_ELEMENT_IDS.staffCanvas}`,
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "↔️",
        title: "Drag to Reposition",
        content:
          "Click and drag any note horizontally to move it to a different beat position.",
        selector: `#${TOUR_ELEMENT_IDS.staffCanvas}`,
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "🗑️",
        title: "Delete Tool",
        content:
          "Select this tool, then click any note to remove it. Click the tool again to deselect.",
        selector: `#${TOUR_ELEMENT_IDS.deleteTool}`,
        side: "left",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "↩️",
        title: "Undo & Redo",
        content:
          "Made a mistake? Use Undo (Cmd+Z) to go back, or Redo (Cmd+Shift+Z) to restore.",
        selector: `#${TOUR_ELEMENT_IDS.undoButton}`,
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
    ],
  },
  {
    tour: "piano-playback",
    steps: [
      {
        icon: "🎹",
        title: "Piano Keyboard",
        content:
          "Click to show or hide the piano keyboard. Perfect for learning note names!",
        selector: `#${TOUR_ELEMENT_IDS.pianoToggle}`,
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "⌨️",
        title: "Keyboard Shortcuts",
        content:
          "Play notes with your keyboard: A-K for white keys (C4-C5), W/E/T/Y/U for black keys. Hold Shift for sustain!",
        selector: `#${TOUR_ELEMENT_IDS.pianoToggle}`,
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "⏱️",
        title: "Tempo Control",
        content:
          "Click to change the playback speed (40-200 BPM). Slower is great for learning!",
        selector: `#${TOUR_ELEMENT_IDS.tempoDisplay}`,
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "📍",
        title: "Visual Playhead",
        content:
          "During playback, the green line shows the current position. The active note is highlighted!",
        selector: `#${TOUR_ELEMENT_IDS.staffCanvas}`,
        side: "top",
        showControls: true,
        showSkip: true,
      },
    ],
  },
  {
    tour: "advanced-features",
    steps: [
      {
        icon: "🔁",
        title: "Repeat Sections",
        content:
          "Create repeat signs: click the start measure, then click the end measure. Great for verses and choruses!",
        selector: `#${TOUR_ELEMENT_IDS.repeatTool}`,
        side: "left",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "📝",
        title: "Add Lyrics",
        content:
          "Open the lyrics editor to add words that align with each beat. Perfect for songs!",
        selector: `#${TOUR_ELEMENT_IDS.lyricsTool}`,
        side: "left",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "🎶",
        title: "Time Signature",
        content:
          "Click to change between 4/4, 3/4, 6/8, and more. Each affects how beats are grouped.",
        selector: `#${TOUR_ELEMENT_IDS.timeSigDisplay}`,
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
      {
        icon: "⚙️",
        title: "Settings",
        content:
          "Customize your view: show note labels, enable chord mode, toggle the grid, and more!",
        selector: `#${TOUR_ELEMENT_IDS.settingsButton}`,
        side: "bottom",
        showControls: true,
        showSkip: true,
      },
    ],
  },
];
