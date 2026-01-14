"use client";

import { NoteTool } from "./NoteEditor";
import { TOUR_ELEMENT_IDS } from "@/lib/tourSteps/driverSteps";
import { useInteractiveTutorial } from "@/hooks/useInteractiveTutorial";

interface ToolPaletteProps {
  selectedTool: NoteTool;
  onToolSelect: (tool: NoteTool) => void;
  allowMove: boolean;
  onAllowMoveChange: (allow: boolean) => void;
  // Undo/redo
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

// SVG Note Icons (matching MusicRulesSidebar sizing)
const WholeNoteIcon = () => (
  <svg width="20" height="28" viewBox="0 0 20 28" className="inline-block">
    <ellipse
      cx="10"
      cy="20"
      rx="5"
      ry="3.5"
      fill="#fff"
      stroke="currentColor"
      strokeWidth="1.5"
      transform="rotate(-15 10 20)"
    />
  </svg>
);

const HalfNoteIcon = () => (
  <svg width="20" height="28" viewBox="0 0 20 28" className="inline-block">
    <ellipse
      cx="10"
      cy="20"
      rx="5"
      ry="3.5"
      fill="#fff"
      stroke="currentColor"
      strokeWidth="1.5"
      transform="rotate(-15 10 20)"
    />
    <line
      x1="14"
      y1="19"
      x2="14"
      y2="6"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const DottedQuarterIcon = () => (
  <svg width="26" height="28" viewBox="0 0 26 28" className="inline-block">
    <ellipse
      cx="10"
      cy="20"
      rx="5"
      ry="3.5"
      fill="currentColor"
      stroke="#000"
      strokeWidth="0.5"
      transform="rotate(-15 10 20)"
    />
    <line
      x1="14"
      y1="19"
      x2="14"
      y2="6"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="19" cy="20" r="2" fill="currentColor" />
  </svg>
);

const QuarterNoteIcon = () => (
  <svg width="20" height="28" viewBox="0 0 20 28" className="inline-block">
    <ellipse
      cx="10"
      cy="20"
      rx="5"
      ry="3.5"
      fill="currentColor"
      stroke="#000"
      strokeWidth="0.5"
      transform="rotate(-15 10 20)"
    />
    <line
      x1="14"
      y1="19"
      x2="14"
      y2="6"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  </svg>
);

const EighthNoteIcon = () => (
  <svg width="20" height="28" viewBox="0 0 20 28" className="inline-block">
    <ellipse
      cx="10"
      cy="20"
      rx="5"
      ry="3.5"
      fill="currentColor"
      stroke="#000"
      strokeWidth="0.5"
      transform="rotate(-15 10 20)"
    />
    <line
      x1="14"
      y1="19"
      x2="14"
      y2="6"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M 14 6 Q 18 9 17 14"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

const RepeatIcon = () => (
  <svg width="20" height="28" viewBox="0 0 20 28" className="inline-block">
    {/* Two vertical lines with dots - matching original editor */}
    <g transform="translate(4, 8)">
      <rect x="0" y="0" width="2" height="12" fill="currentColor" />
      <rect x="3" y="0" width="2" height="12" fill="currentColor" />
      <circle cx="7.5" cy="3" r="2" fill="currentColor" />
      <circle cx="7.5" cy="9" r="2" fill="currentColor" />
    </g>
  </svg>
);

const DeleteIcon = () => (
  <svg width="20" height="28" viewBox="0 0 20 28" className="inline-block">
    {/* Simple X mark for delete */}
    <line
      x1="6"
      y1="10"
      x2="14"
      y2="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="14"
      y1="10"
      x2="6"
      y2="18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const LyricsIcon = () => (
  <svg width="20" height="28" viewBox="0 0 20 28" className="inline-block">
    {/* Text/lyrics icon - "Aa" symbol */}
    <text
      x="10"
      y="18"
      textAnchor="middle"
      fontSize="12"
      fontWeight="bold"
      fill="currentColor"
      fontFamily="system-ui, sans-serif"
    >
      Aa
    </text>
  </svg>
);

const MoveIcon = () => (
  <svg width="20" height="28" viewBox="0 0 20 28" className="inline-block">
    {/* Four-way arrow for move/drag */}
    <g transform="translate(10, 14)">
      {/* Center */}
      <circle cx="0" cy="0" r="1.5" fill="currentColor" />
      {/* Up arrow */}
      <line
        x1="0"
        y1="-2"
        x2="0"
        y2="-6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <polyline
        points="-2,-4 0,-6 2,-4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Down arrow */}
      <line
        x1="0"
        y1="2"
        x2="0"
        y2="6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <polyline
        points="-2,4 0,6 2,4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left arrow */}
      <line
        x1="-2"
        y1="0"
        x2="-6"
        y2="0"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <polyline
        points="-4,-2 -6,0 -4,2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right arrow */}
      <line
        x1="2"
        y1="0"
        x2="6"
        y2="0"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <polyline
        points="4,-2 6,0 4,2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

const TOOLS: Array<{
  id: NoteTool;
  icon: React.ReactNode;
  label: string;
  color: string;
}> = [
  {
    id: "whole",
    icon: <WholeNoteIcon />,
    label: "Whole",
    color: "bg-blue-100 border-blue-300 text-blue-600 shadow-sm",
  },
  {
    id: "half",
    icon: <HalfNoteIcon />,
    label: "Half",
    color: "bg-green-100 border-green-300 text-green-600 shadow-sm",
  },
  {
    id: "dotted-quarter",
    icon: <DottedQuarterIcon />,
    label: "Dotted",
    color: "bg-orange-100 border-orange-300 text-orange-600 shadow-sm",
  },
  {
    id: "quarter",
    icon: <QuarterNoteIcon />,
    label: "Quarter",
    color: "bg-purple-100 border-purple-300 text-purple-600 shadow-sm",
  },
  {
    id: "eighth",
    icon: <EighthNoteIcon />,
    label: "Eighth",
    color: "bg-pink-100 border-pink-300 text-pink-600 shadow-sm",
  },
  {
    id: "delete",
    icon: <DeleteIcon />,
    label: "Delete",
    color: "bg-red-100 border-red-300 text-red-600 shadow-sm",
  },
  {
    id: "repeat",
    icon: <RepeatIcon />,
    label: "Repeat",
    color: "bg-indigo-100 border-indigo-300 text-indigo-600 shadow-sm",
  },
  {
    id: "lyrics",
    icon: <LyricsIcon />,
    label: "Lyrics",
    color: "bg-amber-100 border-amber-300 text-amber-600 shadow-sm",
  },
];

// Map tool IDs to tour element IDs
const TOOL_TOUR_IDS: Partial<Record<NonNullable<NoteTool>, string>> = {
  whole: TOUR_ELEMENT_IDS.wholeNoteTool,
  half: TOUR_ELEMENT_IDS.halfNoteTool,
  "dotted-quarter": TOUR_ELEMENT_IDS.dottedQuarterTool,
  quarter: TOUR_ELEMENT_IDS.quarterNoteTool,
  eighth: TOUR_ELEMENT_IDS.eighthNoteTool,
  delete: TOUR_ELEMENT_IDS.deleteTool,
  repeat: TOUR_ELEMENT_IDS.repeatTool,
  lyrics: TOUR_ELEMENT_IDS.lyricsTool,
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
}: ToolPaletteProps) {
  const { reportAction, isActive: tutorialActive } = useInteractiveTutorial();

  const handleToolClick = (toolId: NoteTool) => {
    // Toggle: if clicking the same tool, deselect it completely
    const newTool = selectedTool === toolId ? null : toolId;
    onToolSelect(newTool);

    // Report to interactive tutorial
    if (tutorialActive) {
      reportAction({
        type: "select-tool",
        tool: newTool || "", // Empty string means deselected
      });
    }
  };

  return (
    <div
      id={TOUR_ELEMENT_IDS.toolPalette}
      className="w-20 bg-purple-50 border-l-2 border-purple-300 flex flex-col items-center py-4 shadow-sm overflow-y-auto"
    >
      {/* Undo/Redo buttons */}
      {(onUndo || onRedo) && (
        <div className="flex gap-1 mb-3 flex-shrink-0">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              canUndo
                ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                : "bg-gray-50 text-gray-300 cursor-not-allowed"
            }`}
            title="Undo (Cmd+Z)"
          >
            <svg
              className="w-4 h-4"
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
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              canRedo
                ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                : "bg-gray-50 text-gray-300 cursor-not-allowed"
            }`}
            title="Redo (Cmd+Shift+Z)"
          >
            <svg
              className="w-4 h-4"
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
        </div>
      )}

      {/* Title */}
      <div className="text-xs font-semibold text-purple-600 mb-2 text-center flex-shrink-0">
        TOOLS
      </div>

      {/* Tool buttons - scrollable area */}
      <div className="flex flex-col items-center gap-2 flex-1 min-h-0">
        {TOOLS.map((tool) => {
          const isSelected = selectedTool === tool.id;
          const tourId = tool.id ? TOOL_TOUR_IDS[tool.id] : undefined;
          return (
            <button
              key={tool.id}
              id={tourId}
              onClick={() => handleToolClick(tool.id)}
              className={`
              w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center
              transition-all duration-200 hover:scale-105 active:scale-95
              ${
                isSelected
                  ? `${tool.color} shadow-lg scale-105 font-bold`
                  : "bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100"
              }
            `}
              title={tool.label}
            >
              <div className="mb-0.5">{tool.icon}</div>
              <span className="text-[9px] font-semibold">{tool.label}</span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-10 h-px bg-purple-300 my-1" />

        {/* Move mode toggle - separate from tools */}
        <button
          id={TOUR_ELEMENT_IDS.moveToggle}
          onClick={() => onAllowMoveChange(!allowMove)}
          className={`
            w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center
            transition-all duration-200 hover:scale-105 active:scale-95
            ${
              allowMove
                ? "bg-amber-100 border-amber-400 text-amber-700 shadow-lg ring-2 ring-amber-300"
                : "bg-gray-100 border-gray-300 text-gray-400 hover:bg-gray-200"
            }
          `}
          title={
            allowMove
              ? "Move mode ON - drag to reposition"
              : "Move mode OFF - click to enable dragging"
          }
        >
          <div className="mb-0.5">
            <MoveIcon />
          </div>
          <span className="text-[9px] font-semibold">Move</span>
        </button>
      </div>

      {/* Keyboard hint at bottom */}
      <div className="mt-auto pt-4 text-[8px] text-gray-400 text-center leading-tight">
        Click to
        <br />
        select
      </div>
    </div>
  );
}
