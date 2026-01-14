"use client";

import { NoteTool } from "./NoteEditor";

interface ToolPaletteProps {
  selectedTool: NoteTool;
  onToolSelect: (tool: NoteTool) => void;
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

export function ToolPalette({ selectedTool, onToolSelect }: ToolPaletteProps) {
  const handleToolClick = (toolId: NoteTool) => {
    // Toggle: if clicking the same tool, deselect it completely
    if (selectedTool === toolId) {
      onToolSelect(null);
    } else {
      onToolSelect(toolId);
    }
  };

  return (
    <div className="w-20 bg-purple-50 border-l-2 border-purple-300 flex flex-col items-center gap-2 py-4 shadow-sm">
      {/* Title */}
      <div className="text-xs font-semibold text-purple-600 mb-2 text-center">
        TOOLS
      </div>

      {/* Tool buttons */}
      {TOOLS.map((tool) => {
        const isSelected = selectedTool === tool.id;
        return (
          <button
            key={tool.id}
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

      {/* Keyboard hint at bottom */}
      <div className="mt-auto pt-4 text-[8px] text-gray-400 text-center leading-tight">
        Click to
        <br />
        select
      </div>
    </div>
  );
}
