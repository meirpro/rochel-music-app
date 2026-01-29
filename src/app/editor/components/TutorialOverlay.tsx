/**
 * TutorialOverlay Component
 *
 * A floating instruction panel that displays the current tutorial stage
 * information with title, instruction, and optional hint.
 */

"use client";

import { TutorialStage, ContextMenuSection } from "../config/tutorialStages";

// Inline SVG note icons for rendering in hints (smaller size for inline text)
const InlineQuarterNote = () => (
  <svg
    width="12"
    height="18"
    viewBox="0 0 28 36"
    className="inline-block align-middle mx-0.5"
  >
    <ellipse
      cx="14"
      cy="26"
      rx="7"
      ry="5"
      fill="currentColor"
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

const InlineHalfNote = () => (
  <svg
    width="12"
    height="18"
    viewBox="0 0 28 36"
    className="inline-block align-middle mx-0.5"
  >
    <ellipse
      cx="14"
      cy="26"
      rx="7"
      ry="5"
      fill="none"
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

const InlineEighthNote = () => (
  <svg
    width="12"
    height="18"
    viewBox="0 0 28 36"
    className="inline-block align-middle mx-0.5"
  >
    <ellipse
      cx="14"
      cy="26"
      rx="7"
      ry="5"
      fill="currentColor"
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

const InlineWholeNote = () => (
  <svg
    width="14"
    height="18"
    viewBox="0 0 28 36"
    className="inline-block align-middle mx-0.5"
  >
    <ellipse
      cx="14"
      cy="24"
      rx="7"
      ry="5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      transform="rotate(-15 14 24)"
    />
  </svg>
);

const InlineRepeatSign = () => (
  <svg
    width="14"
    height="18"
    viewBox="0 0 28 36"
    className="inline-block align-middle mx-0.5"
  >
    <g transform="translate(6, 10)">
      <rect x="0" y="0" width="3" height="16" fill="currentColor" />
      <rect x="5" y="0" width="3" height="16" fill="currentColor" />
      <circle cx="12" cy="4" r="3" fill="currentColor" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </g>
  </svg>
);

const InlineDeleteIcon = () => (
  <svg
    width="12"
    height="14"
    viewBox="0 0 28 36"
    className="inline-block align-middle mx-0.5"
  >
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

// Mapping of tokens to icon components
const ICON_MAP: Record<string, React.FC> = {
  "[quarter]": InlineQuarterNote,
  "[half]": InlineHalfNote,
  "[eighth]": InlineEighthNote,
  "[whole]": InlineWholeNote,
  "[repeat]": InlineRepeatSign,
  "[delete]": InlineDeleteIcon,
};

/**
 * Parse hint text and replace icon tokens with actual SVG components
 */
function renderHintWithIcons(hint: string): React.ReactNode {
  // Split by icon tokens while keeping the tokens
  const tokenPattern =
    /(\[quarter\]|\[half\]|\[eighth\]|\[whole\]|\[repeat\]|\[delete\])/g;
  const parts = hint.split(tokenPattern);

  return parts.map((part, index) => {
    const IconComponent = ICON_MAP[part];
    if (IconComponent) {
      return <IconComponent key={index} />;
    }
    return part;
  });
}

interface TutorialOverlayProps {
  stage: TutorialStage;
  onSkip: () => void;
  onNext?: () => void;
  onGoToStage?: (index: number) => void;
  canAdvance: boolean;
  currentStageIndex: number;
  totalStages: number;
}

// Human-readable labels for context menu sections
const SECTION_LABELS: Record<ContextMenuSection, string> = {
  duration: "Duration",
  accidental: "Sharps/Flats",
  changeNote: "Change Note",
  octave: "Octave",
  delete: "Delete",
};

export function TutorialOverlay({
  stage,
  onSkip,
  onNext,
  onGoToStage,
  canAdvance,
  currentStageIndex,
  totalStages,
}: TutorialOverlayProps) {
  const isManualAdvance = stage.advanceOn.type === "manual";
  const isFinalStage = currentStageIndex === totalStages - 1;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-purple-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 flex items-center justify-between">
          <h3 className="font-bold text-purple-800 text-sm">{stage.title}</h3>
          <button
            onClick={onSkip}
            tabIndex={-1}
            className="text-xs text-purple-500 hover:text-purple-700 transition-colors"
          >
            Skip tutorial
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {stage.instruction}
          </p>

          {stage.hint && (
            <p className="mt-2 text-purple-500 text-xs italic">
              <span>Hint: </span>
              {renderHintWithIcons(stage.hint)}
            </p>
          )}

          {/* Show available context menu options for relevant stages */}
          {stage.visibleContextMenuSections &&
            stage.advanceOn.type === "context-menu-used" && (
              <div className="mt-3 pt-3 border-t border-purple-100">
                <p className="text-xs text-gray-500 mb-2">
                  Right-click menu options:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {stage.visibleContextMenuSections.map((section) => (
                    <span
                      key={section}
                      className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-200"
                    >
                      {SECTION_LABELS[section]}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Footer with progress and action */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          {/* Progress dots - clickable to go back to previous stages */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalStages }, (_, i) => {
              const isCompleted = i < currentStageIndex;
              const isCurrent = i === currentStageIndex;
              const canClick = isCompleted && onGoToStage;

              return (
                <button
                  key={i}
                  onClick={() => canClick && onGoToStage(i)}
                  disabled={!canClick}
                  tabIndex={-1}
                  title={canClick ? `Go back to step ${i + 1}` : undefined}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isCompleted
                      ? "bg-purple-500 hover:bg-purple-600 cursor-pointer"
                      : isCurrent
                        ? "bg-purple-400 ring-2 ring-purple-200 cursor-default"
                        : "bg-gray-200 cursor-default"
                  }`}
                />
              );
            })}
          </div>

          {/* Action button */}
          {isManualAdvance && !isFinalStage && onNext && (
            <button
              onClick={onNext}
              disabled={!canAdvance}
              tabIndex={-1}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                canAdvance
                  ? "bg-purple-500 text-white hover:bg-purple-600 shadow-sm"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next Step
            </button>
          )}

          {isFinalStage && (
            <button
              onClick={onSkip}
              tabIndex={-1}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 shadow-sm transition-all"
            >
              Start Creating!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
