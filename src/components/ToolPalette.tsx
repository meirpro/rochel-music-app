"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import { NoteTool } from "./NoteEditor";
import { TOUR_ELEMENT_IDS } from "@/lib/tourSteps/driverSteps";
import { useInteractiveTutorial } from "@/hooks/useInteractiveTutorial";

interface ToolPaletteProps {
  selectedTool: NoteTool | null;
  onToolSelect: (tool: NoteTool | null) => void;
  allowMove: boolean;
  onAllowMoveChange: (allow: boolean) => void;
  // Undo/redo
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  // Piano state for margin adjustment
  isPianoOpen?: boolean;
}

// SVG Note Icons - larger for better visibility
const WholeNoteIcon = () => (
  <svg width="28" height="36" viewBox="0 0 28 36" className="inline-block">
    <ellipse
      cx="14"
      cy="24"
      rx="7"
      ry="5"
      fill="#fff"
      stroke="currentColor"
      strokeWidth="2"
      transform="rotate(-15 14 24)"
    />
  </svg>
);

const HalfNoteIcon = () => (
  <svg width="28" height="36" viewBox="0 0 28 36" className="inline-block">
    <ellipse
      cx="14"
      cy="26"
      rx="7"
      ry="5"
      fill="#fff"
      stroke="currentColor"
      strokeWidth="2"
      transform="rotate(-15 14 26)"
    />
    <line
      x1="20"
      y1="24"
      x2="20"
      y2="8"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const DottedQuarterIcon = () => (
  <svg width="34" height="36" viewBox="0 0 34 36" className="inline-block">
    <ellipse
      cx="12"
      cy="26"
      rx="7"
      ry="5"
      fill="currentColor"
      stroke="#000"
      strokeWidth="0.5"
      transform="rotate(-15 12 26)"
    />
    <line
      x1="18"
      y1="24"
      x2="18"
      y2="8"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="26" cy="26" r="3" fill="currentColor" />
  </svg>
);

const QuarterNoteIcon = () => (
  <svg width="28" height="36" viewBox="0 0 28 36" className="inline-block">
    <ellipse
      cx="14"
      cy="26"
      rx="7"
      ry="5"
      fill="currentColor"
      stroke="#000"
      strokeWidth="0.5"
      transform="rotate(-15 14 26)"
    />
    <line
      x1="20"
      y1="24"
      x2="20"
      y2="8"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const EighthNoteIcon = () => (
  <svg width="28" height="36" viewBox="0 0 28 36" className="inline-block">
    <ellipse
      cx="14"
      cy="26"
      rx="7"
      ry="5"
      fill="currentColor"
      stroke="#000"
      strokeWidth="0.5"
      transform="rotate(-15 14 26)"
    />
    <line
      x1="20"
      y1="24"
      x2="20"
      y2="8"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M 20 8 Q 26 12 24 20"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const DottedEighthIcon = () => (
  <svg width="34" height="36" viewBox="0 0 34 36" className="inline-block">
    <ellipse
      cx="12"
      cy="26"
      rx="7"
      ry="5"
      fill="currentColor"
      stroke="#000"
      strokeWidth="0.5"
      transform="rotate(-15 12 26)"
    />
    <line
      x1="18"
      y1="24"
      x2="18"
      y2="8"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M 18 8 Q 24 12 22 18"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="28" cy="26" r="3" fill="currentColor" />
  </svg>
);

const SixteenthNoteIcon = () => (
  <svg width="28" height="36" viewBox="0 0 28 36" className="inline-block">
    <ellipse
      cx="14"
      cy="26"
      rx="7"
      ry="5"
      fill="currentColor"
      stroke="#000"
      strokeWidth="0.5"
      transform="rotate(-15 14 26)"
    />
    <line
      x1="20"
      y1="24"
      x2="20"
      y2="8"
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* Two flags for sixteenth note */}
    <path
      d="M 20 8 Q 26 10 24 16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M 20 12 Q 26 14 24 20"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const DottedHalfIcon = () => (
  <svg width="34" height="36" viewBox="0 0 34 36" className="inline-block">
    <ellipse
      cx="12"
      cy="26"
      rx="7"
      ry="5"
      fill="#fff"
      stroke="currentColor"
      strokeWidth="2"
      transform="rotate(-15 12 26)"
    />
    <line
      x1="18"
      y1="24"
      x2="18"
      y2="8"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="26" cy="26" r="3" fill="currentColor" />
  </svg>
);

const RepeatIcon = () => (
  <svg width="28" height="36" viewBox="0 0 28 36" className="inline-block">
    <g transform="translate(6, 10)">
      <rect x="0" y="0" width="3" height="16" fill="currentColor" />
      <rect x="5" y="0" width="3" height="16" fill="currentColor" />
      <circle cx="12" cy="4" r="3" fill="currentColor" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </g>
  </svg>
);

const DeleteIcon = () => (
  <svg width="28" height="36" viewBox="0 0 28 36" className="inline-block">
    <line
      x1="8"
      y1="12"
      x2="20"
      y2="24"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="20"
      y1="12"
      x2="8"
      y2="24"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const LyricsIcon = () => (
  <svg width="28" height="36" viewBox="0 0 28 36" className="inline-block">
    <text
      x="14"
      y="24"
      textAnchor="middle"
      fontSize="16"
      fontWeight="bold"
      fill="currentColor"
      fontFamily="system-ui, sans-serif"
    >
      Aa
    </text>
  </svg>
);

const TimeSigIcon = () => (
  <svg width="28" height="36" viewBox="0 0 28 36" className="inline-block">
    <text
      x="14"
      y="15"
      textAnchor="middle"
      fontSize="14"
      fontWeight="bold"
      fill="currentColor"
      fontFamily="system-ui, sans-serif"
    >
      4
    </text>
    <line
      x1="7"
      y1="18"
      x2="21"
      y2="18"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <text
      x="14"
      y="30"
      textAnchor="middle"
      fontSize="14"
      fontWeight="bold"
      fill="currentColor"
      fontFamily="system-ui, sans-serif"
    >
      4
    </text>
  </svg>
);

const MoveIcon = () => (
  <svg width="28" height="36" viewBox="0 0 28 36" className="inline-block">
    <g transform="translate(14, 18)">
      <circle cx="0" cy="0" r="2" fill="currentColor" />
      {/* Up arrow */}
      <line
        x1="0"
        y1="-3"
        x2="0"
        y2="-8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polyline
        points="-3,-5 0,-8 3,-5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Down arrow */}
      <line x1="0" y1="3" x2="0" y2="8" stroke="currentColor" strokeWidth="2" />
      <polyline
        points="-3,5 0,8 3,5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left arrow */}
      <line
        x1="-3"
        y1="0"
        x2="-8"
        y2="0"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polyline
        points="-5,-3 -8,0 -5,3"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right arrow */}
      <line x1="3" y1="0" x2="8" y2="0" stroke="currentColor" strokeWidth="2" />
      <polyline
        points="5,-3 8,0 5,3"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

// Note duration tools with descriptions
const NOTE_TOOLS: Array<{
  id: NoteTool;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}> = [
  {
    id: "whole",
    icon: <WholeNoteIcon />,
    label: "Whole Note",
    description: "4 beats • Fills an entire 4/4 measure",
    color: "bg-blue-100 border-blue-300 text-blue-600",
  },
  {
    id: "half",
    icon: <HalfNoteIcon />,
    label: "Half Note",
    description: "2 beats • Half of a 4/4 measure",
    color: "bg-green-100 border-green-300 text-green-600",
  },
  {
    id: "dotted-half",
    icon: <DottedHalfIcon />,
    label: "Dotted Half",
    description: "3 beats • Dot adds 50% (2 + 1)",
    color: "bg-teal-100 border-teal-300 text-teal-600",
  },
  {
    id: "quarter",
    icon: <QuarterNoteIcon />,
    label: "Quarter Note",
    description: "1 beat • The basic pulse in most music",
    color: "bg-purple-100 border-purple-300 text-purple-600",
  },
  {
    id: "dotted-quarter",
    icon: <DottedQuarterIcon />,
    label: "Dotted Quarter",
    description: "1½ beats • Common in 6/8 time",
    color: "bg-orange-100 border-orange-300 text-orange-600",
  },
  {
    id: "eighth",
    icon: <EighthNoteIcon />,
    label: "Eighth Note",
    description: "½ beat • Two per beat, often beamed",
    color: "bg-pink-100 border-pink-300 text-pink-600",
  },
  {
    id: "dotted-eighth",
    icon: <DottedEighthIcon />,
    label: "Dotted Eighth",
    description: "¾ beat • Usually paired with 16th",
    color: "bg-rose-100 border-rose-300 text-rose-600",
  },
  {
    id: "sixteenth",
    icon: <SixteenthNoteIcon />,
    label: "Sixteenth Note",
    description: "¼ beat • Four per beat, fast notes",
    color: "bg-fuchsia-100 border-fuchsia-300 text-fuchsia-600",
  },
];

// Markup tools (add content)
const MARKUP_TOOLS: Array<{
  id: NoteTool;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}> = [
  {
    id: "repeat",
    icon: <RepeatIcon />,
    label: "Repeat Sign",
    description: "Click bar lines to add repeat brackets",
    color: "bg-indigo-100 border-indigo-300 text-indigo-600",
  },
  {
    id: "lyrics",
    icon: <LyricsIcon />,
    label: "Lyrics",
    description: "Click notes to add syllables below",
    color: "bg-amber-100 border-amber-300 text-amber-600",
  },
  {
    id: "timesig",
    icon: <TimeSigIcon />,
    label: "Time Signature",
    description: "Click bar lines to change meter (3/4, 4/4...)",
    color: "bg-cyan-100 border-cyan-300 text-cyan-600",
  },
];

// Action tools (modify/manipulate)
const ACTION_TOOLS: Array<{
  id: NoteTool | "move";
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  activeColor: string;
}> = [
  {
    id: "delete",
    icon: <DeleteIcon />,
    label: "Delete",
    description: "Click anything to remove it",
    color: "bg-gray-100 border-gray-300 text-gray-500",
    activeColor: "bg-red-100 border-red-400 text-red-600",
  },
  {
    id: "move",
    icon: <MoveIcon />,
    label: "Move",
    description: "Drag notes or markers to reposition",
    color: "bg-gray-100 border-gray-300 text-gray-500",
    activeColor: "bg-amber-100 border-amber-400 text-amber-700",
  },
];

// Map tool IDs to tour element IDs
const TOOL_TOUR_IDS: Partial<Record<NonNullable<NoteTool> | "move", string>> = {
  whole: TOUR_ELEMENT_IDS.wholeNoteTool,
  "dotted-half": TOUR_ELEMENT_IDS.dottedHalfTool,
  half: TOUR_ELEMENT_IDS.halfNoteTool,
  "dotted-quarter": TOUR_ELEMENT_IDS.dottedQuarterTool,
  quarter: TOUR_ELEMENT_IDS.quarterNoteTool,
  "dotted-eighth": TOUR_ELEMENT_IDS.dottedEighthTool,
  eighth: TOUR_ELEMENT_IDS.eighthNoteTool,
  sixteenth: TOUR_ELEMENT_IDS.sixteenthNoteTool,
  delete: TOUR_ELEMENT_IDS.deleteTool,
  repeat: TOUR_ELEMENT_IDS.repeatTool,
  lyrics: TOUR_ELEMENT_IDS.lyricsTool,
  timesig: TOUR_ELEMENT_IDS.timesigTool,
  move: TOUR_ELEMENT_IDS.moveToggle,
};

export function ToolPalette({
  selectedTool,
  onToolSelect,
  allowMove,
  onAllowMoveChange,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  isPianoOpen = false,
}: ToolPaletteProps) {
  const { reportAction, isActive: tutorialActive } = useInteractiveTutorial();

  const handleToolClick = (toolId: NoteTool) => {
    const newTool = selectedTool === toolId ? null : toolId;
    onToolSelect(newTool);

    if (tutorialActive) {
      reportAction({
        type: "select-tool",
        tool: newTool || "",
      });
    }
  };

  // Render a tool button with tooltip
  const renderToolButton = (tool: (typeof NOTE_TOOLS)[0]) => {
    const isSelected = selectedTool === tool.id;
    const tourId = tool.id ? TOOL_TOUR_IDS[tool.id] : undefined;

    return (
      <Tooltip.Root key={tool.id} delayDuration={300}>
        <Tooltip.Trigger asChild>
          <button
            id={tourId}
            onClick={() => handleToolClick(tool.id)}
            className={`
              w-12 h-12 rounded-xl border-2 flex items-center justify-center
              transition-all duration-150 hover:scale-105 active:scale-95
              ${
                isSelected
                  ? `${tool.color} shadow-lg scale-105 ring-2 ring-offset-1`
                  : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
              }
            `}
          >
            {tool.icon}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl z-50"
            side="left"
            sideOffset={8}
          >
            <div className="font-semibold">{tool.label}</div>
            <div className="text-gray-300 text-xs">{tool.description}</div>
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  };

  return (
    <Tooltip.Provider>
      <div
        id={TOUR_ELEMENT_IDS.toolPalette}
        className={`w-[120px] bg-purple-50 border-l-2 border-purple-300 flex flex-col items-center py-3 shadow-sm overflow-y-auto ${
          isPianoOpen ? "pb-40" : ""
        }`}
      >
        {/* Undo/Redo buttons */}
        {(onUndo || onRedo) && (
          <div className="flex gap-2 mb-3 flex-shrink-0">
            <Tooltip.Root delayDuration={300}>
              <Tooltip.Trigger asChild>
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    canUndo
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-gray-50 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl z-50"
                  side="left"
                  sideOffset={8}
                >
                  <div className="font-semibold">Undo</div>
                  <div className="text-gray-300 text-xs">⌘Z</div>
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root delayDuration={300}>
              <Tooltip.Trigger asChild>
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    canRedo
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-gray-50 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                    />
                  </svg>
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl z-50"
                  side="left"
                  sideOffset={8}
                >
                  <div className="font-semibold">Redo</div>
                  <div className="text-gray-300 text-xs">⌘⇧Z</div>
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        )}

        {/* Note tools section */}
        <div className="text-xs font-semibold text-purple-600 mb-2 text-center flex-shrink-0">
          NOTES
        </div>
        <div className="grid grid-cols-2 gap-2 px-2 mb-3">
          {NOTE_TOOLS.map(renderToolButton)}
        </div>

        {/* Divider */}
        <div className="w-20 h-px bg-purple-300 my-2" />

        {/* Markup tools section */}
        <div className="text-xs font-semibold text-purple-600 mb-2 text-center flex-shrink-0">
          MARKUP
        </div>
        <div className="grid grid-cols-2 gap-2 px-2 mb-3">
          {MARKUP_TOOLS.map(renderToolButton)}
        </div>

        {/* Divider */}
        <div className="w-20 h-px bg-purple-300 my-2" />

        {/* Action tools section - Delete & Move */}
        <div className="text-xs font-semibold text-purple-600 mb-2 text-center flex-shrink-0">
          ACTIONS
        </div>
        <div className="flex gap-2 px-2">
          {ACTION_TOOLS.map((tool) => {
            const isMove = tool.id === "move";
            const isActive = isMove ? allowMove : selectedTool === tool.id;
            const tourId = TOOL_TOUR_IDS[tool.id];

            return (
              <Tooltip.Root key={tool.id} delayDuration={300}>
                <Tooltip.Trigger asChild>
                  <button
                    id={tourId}
                    onClick={() => {
                      if (isMove) {
                        onAllowMoveChange(!allowMove);
                      } else {
                        handleToolClick(tool.id as NoteTool);
                      }
                    }}
                    className={`
                      w-12 h-12 rounded-xl border-2 flex items-center justify-center
                      transition-all duration-150 hover:scale-105 active:scale-95
                      ${
                        isActive
                          ? `${tool.activeColor} shadow-lg scale-105 ring-2 ring-offset-1`
                          : `${tool.color} hover:bg-gray-200 hover:border-gray-400`
                      }
                    `}
                  >
                    {tool.icon}
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-xl z-50"
                    side="left"
                    sideOffset={8}
                  >
                    <div className="font-semibold">{tool.label}</div>
                    <div className="text-gray-300 text-xs">
                      {tool.description}
                    </div>
                    <Tooltip.Arrow className="fill-gray-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </div>
      </div>
    </Tooltip.Provider>
  );
}
