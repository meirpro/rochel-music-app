/**
 * useProgressiveTutorial Hook
 *
 * Manages the progressive tutorial state, tracking which stage the user
 * is at and handling advancement through stages based on user actions.
 *
 * Uses localStorage to persist progress across sessions (SSR-safe).
 */

"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import { NoteTool } from "@/components/NoteEditorRefactored";
import {
  TUTORIAL_STAGES,
  TutorialStage,
  PaletteSection,
  ContextMenuSection,
  isFinalStage,
} from "../config/tutorialStages";

// SSR-safe localStorage options
const SSR_SAFE = { initializeWithValue: false };

// Storage key for tutorial progress
const STORAGE_KEY = "rochel-editor-tutorial-progress-v2";

// Stored tutorial state
interface TutorialProgress {
  currentStageIndex: number;
  completed: boolean;
  actionCount: number; // Tracks actions for manual advancement stages
}

const DEFAULT_PROGRESS: TutorialProgress = {
  currentStageIndex: 0,
  completed: false,
  actionCount: 0,
};

// Visibility configuration returned by the hook
export interface TutorialVisibility {
  allowedTools: NoteTool[] | undefined;
  hidePaletteSections: PaletteSection[];
  showHeader: boolean;
  showMeasureControls: boolean;
  showPlayButton: boolean;
  showPiano: boolean;
  maxMeasures: number;
  /** Which context menu sections to show (undefined = show all) */
  visibleContextMenuSections: ContextMenuSection[] | undefined;
  /** Tool to highlight in the palette (draws attention to it) */
  highlightTool: NoteTool | undefined;
}

// Action types that can be reported to advance the tutorial
export interface TutorialAction {
  type:
    | "note-placed"
    | "tool-selected"
    | "context-menu-used"
    | "play-started"
    | "repeat-changed"
    | "lyrics-changed";
  tool?: NoteTool;
}

// Return type for the hook
export interface UseProgressiveTutorialReturn {
  // State
  isActive: boolean;
  currentStage: TutorialStage | null;
  currentStageIndex: number;
  totalStages: number;
  actionCount: number;

  // Actions
  reportAction: (action: TutorialAction) => void;
  advanceStage: () => void;
  goToStage: (index: number) => void;
  skipTutorial: () => void;
  resetTutorial: () => void;

  // Visibility helper
  getVisibility: () => TutorialVisibility;

  // Can advance manually (for stages with "manual" advancement)
  canAdvanceManually: boolean;
}

/**
 * Hook for managing progressive tutorial state
 */
export function useProgressiveTutorial(): UseProgressiveTutorialReturn {
  const [progress, setProgress] = useLocalStorage<TutorialProgress>(
    STORAGE_KEY,
    DEFAULT_PROGRESS,
    SSR_SAFE,
  );

  // Current stage (null if tutorial is completed)
  const currentStage = useMemo(() => {
    if (progress.completed) return null;
    return TUTORIAL_STAGES[progress.currentStageIndex] ?? null;
  }, [progress.completed, progress.currentStageIndex]);

  // Check if manual advancement is allowed
  const canAdvanceManually = useMemo(() => {
    if (!currentStage) return false;
    if (currentStage.advanceOn.type !== "manual") return false;
    const minRequired = currentStage.minActionsRequired ?? 0;
    return progress.actionCount >= minRequired;
  }, [currentStage, progress.actionCount]);

  // Advance to next stage
  const advanceStage = useCallback(() => {
    setProgress((prev) => {
      const nextIndex = prev.currentStageIndex + 1;

      // Check if we're at the final stage
      if (nextIndex >= TUTORIAL_STAGES.length) {
        return {
          ...prev,
          completed: true,
          actionCount: 0,
        };
      }

      // Check if current stage is the "complete" stage
      const currentStageId = TUTORIAL_STAGES[prev.currentStageIndex]?.id;
      if (currentStageId && isFinalStage(currentStageId)) {
        return {
          ...prev,
          completed: true,
          actionCount: 0,
        };
      }

      return {
        ...prev,
        currentStageIndex: nextIndex,
        actionCount: 0,
      };
    });
  }, [setProgress]);

  // Report an action to potentially advance the tutorial
  const reportAction = useCallback(
    (action: TutorialAction) => {
      if (!currentStage) return;

      const condition = currentStage.advanceOn;

      // Increment action count for manual stages
      setProgress((prev) => ({
        ...prev,
        actionCount: prev.actionCount + 1,
      }));

      // Check if this action triggers advancement
      let shouldAdvance = false;

      switch (condition.type) {
        case "note-placed":
          if (action.type === "note-placed") {
            shouldAdvance = true;
          }
          break;

        case "tool-selected":
          if (action.type === "tool-selected") {
            if (!condition.tool || action.tool === condition.tool) {
              shouldAdvance = true;
            }
          }
          break;

        case "context-menu-used":
          if (action.type === "context-menu-used") {
            shouldAdvance = true;
          }
          break;

        case "play-started":
          if (action.type === "play-started") {
            shouldAdvance = true;
          }
          break;

        case "repeat-changed":
          if (action.type === "repeat-changed") {
            shouldAdvance = true;
          }
          break;

        case "lyrics-changed":
          if (action.type === "lyrics-changed") {
            shouldAdvance = true;
          }
          break;

        case "manual":
          // Manual stages don't auto-advance on actions
          break;
      }

      if (shouldAdvance) {
        advanceStage();
      }
    },
    [currentStage, advanceStage, setProgress],
  );

  // Skip the tutorial entirely
  const skipTutorial = useCallback(() => {
    setProgress({
      currentStageIndex: TUTORIAL_STAGES.length - 1,
      completed: true,
      actionCount: 0,
    });
  }, [setProgress]);

  // Reset the tutorial to the beginning
  const resetTutorial = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
  }, [setProgress]);

  // Go to a specific stage (for going back to previous stages)
  const goToStage = useCallback(
    (index: number) => {
      if (index < 0 || index >= TUTORIAL_STAGES.length) return;
      setProgress({
        currentStageIndex: index,
        completed: false,
        actionCount: 0,
      });
    },
    [setProgress],
  );

  // Get visibility configuration based on current stage
  const getVisibility = useCallback((): TutorialVisibility => {
    // If tutorial is completed, show full UI
    if (progress.completed) {
      return {
        allowedTools: undefined, // Show all tools
        hidePaletteSections: [],
        showHeader: true,
        showMeasureControls: true,
        showPlayButton: true,
        showPiano: true,
        maxMeasures: 99,
        visibleContextMenuSections: undefined, // Show all sections
        highlightTool: undefined,
      };
    }

    const stage = TUTORIAL_STAGES[progress.currentStageIndex];
    if (!stage) {
      // Fallback to full UI if stage not found
      return {
        allowedTools: undefined,
        hidePaletteSections: [],
        showHeader: true,
        showMeasureControls: true,
        showPlayButton: true,
        showPiano: true,
        maxMeasures: 99,
        visibleContextMenuSections: undefined,
        highlightTool: undefined,
      };
    }

    return {
      allowedTools: stage.allowedTools,
      hidePaletteSections: stage.hidePaletteSections,
      showHeader: stage.showHeader,
      showMeasureControls: stage.showMeasureControls,
      showPlayButton: stage.showPlayButton,
      showPiano: stage.showPiano,
      maxMeasures: stage.maxMeasures,
      visibleContextMenuSections: stage.visibleContextMenuSections,
      highlightTool: stage.highlightTool,
    };
  }, [progress.completed, progress.currentStageIndex]);

  return {
    // State
    isActive: !progress.completed,
    currentStage,
    currentStageIndex: progress.currentStageIndex,
    totalStages: TUTORIAL_STAGES.length,
    actionCount: progress.actionCount,

    // Actions
    reportAction,
    advanceStage,
    goToStage,
    skipTutorial,
    resetTutorial,

    // Visibility
    getVisibility,

    // Manual advancement
    canAdvanceManually,
  };
}
