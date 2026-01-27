"use client";

import React, { useState, useCallback, createContext, useContext } from "react";
import { useLocalStorage } from "usehooks-ts";

// Prevent SSR hydration mismatch
const SSR_SAFE = { initializeWithValue: false };

// Tutorial module IDs
export type TutorialModule =
  | "ui-overview"
  | "getting-started"
  | "note-editing"
  | "piano-playback"
  | "advanced-features";

// Available tour libraries (keeping type for future extensibility)
export type TourLibrary = "driver";

// Learn page progress
export interface LearnProgress {
  currentStage: 1 | 2 | 3 | 4 | 5;
  completedStages: number[];
  hasGraduated: boolean; // Completed all stages
}

// Tutorial completion state
interface TutorialState {
  completedModules: TutorialModule[];
  hasSeenWelcome: boolean;
  preferredLibrary: TourLibrary;
  learnProgress: LearnProgress;
}

// Tutorial context value
interface TutorialContextValue {
  // State
  completedModules: TutorialModule[];
  hasSeenWelcome: boolean;
  activeTour: TutorialModule | null;
  activeLibrary: TourLibrary;
  learnProgress: LearnProgress | null;

  // Actions
  startTour: (module: TutorialModule) => void;
  endTour: () => void;
  markComplete: (module: TutorialModule) => void;
  markWelcomeSeen: () => void;
  resetAllTutorials: () => void;
  setPreferredLibrary: (library: TourLibrary) => void;

  // Learn page actions
  setLearnStage: (stage: 1 | 2 | 3 | 4 | 5) => void;
  advanceLearnStage: (stage: 1 | 2 | 3 | 4 | 5) => void;
  completeLearn: () => void;

  // Computed
  isFirstVisit: boolean;
  hasGraduated: boolean;
  getModuleProgress: () => {
    total: number;
    completed: number;
    percentage: number;
  };
}

const DEFAULT_LEARN_PROGRESS: LearnProgress = {
  currentStage: 1,
  completedStages: [],
  hasGraduated: false,
};

const DEFAULT_STATE: TutorialState = {
  completedModules: [],
  hasSeenWelcome: false,
  preferredLibrary: "driver",
  learnProgress: DEFAULT_LEARN_PROGRESS,
};

const ALL_MODULES: TutorialModule[] = [
  "ui-overview",
  "getting-started",
  "note-editing",
  "piano-playback",
  "advanced-features",
];

// Create context
const TutorialContext = createContext<TutorialContextValue | null>(null);

// Hook to use tutorial context
export function useTutorial(): TutorialContextValue {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}

// Provider component props
interface TutorialProviderProps {
  children: React.ReactNode;
}

// Provider component
export function TutorialProvider({ children }: TutorialProviderProps) {
  const [state, setState] = useLocalStorage<TutorialState>(
    "rochel-tutorial-state",
    DEFAULT_STATE,
    SSR_SAFE,
  );

  const [activeTour, setActiveTour] = useState<TutorialModule | null>(null);

  // Check if this is user's first visit (no tutorials completed and welcome not seen)
  const isFirstVisit =
    !state.hasSeenWelcome && state.completedModules.length === 0;

  // Start a tour
  const startTour = useCallback((module: TutorialModule) => {
    setActiveTour(module);
  }, []);

  // End current tour
  const endTour = useCallback(() => {
    setActiveTour(null);
  }, []);

  // Mark a module as complete
  const markComplete = useCallback(
    (module: TutorialModule) => {
      if (!state.completedModules.includes(module)) {
        setState({
          ...state,
          completedModules: [...state.completedModules, module],
        });
      }
      setActiveTour(null);
    },
    [state, setState],
  );

  // Mark welcome as seen
  const markWelcomeSeen = useCallback(() => {
    setState({
      ...state,
      hasSeenWelcome: true,
    });
  }, [state, setState]);

  // Reset all tutorials
  const resetAllTutorials = useCallback(() => {
    setState(DEFAULT_STATE);
    setActiveTour(null);
  }, [setState]);

  // Set preferred tour library
  const setPreferredLibrary = useCallback(
    (library: TourLibrary) => {
      setState({
        ...state,
        preferredLibrary: library,
      });
    },
    [state, setState],
  );

  // Get progress across all modules
  const getModuleProgress = useCallback(() => {
    const total = ALL_MODULES.length;
    const completed = state.completedModules.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  }, [state.completedModules]);

  // Set current learn stage (for navigation, doesn't mark anything complete)
  const setLearnStage = useCallback(
    (stage: 1 | 2 | 3 | 4 | 5) => {
      const currentProgress = state.learnProgress || DEFAULT_LEARN_PROGRESS;
      setState({
        ...state,
        learnProgress: {
          ...currentProgress,
          currentStage: stage,
        },
      });
    },
    [state, setState],
  );

  // Advance to a new learn stage (and mark previous as complete)
  const advanceLearnStage = useCallback(
    (stage: 1 | 2 | 3 | 4 | 5) => {
      const currentProgress = state.learnProgress || DEFAULT_LEARN_PROGRESS;
      const previousStage = currentProgress.currentStage;

      // Mark the previous stage as completed if advancing
      const newCompletedStages = currentProgress.completedStages.includes(
        previousStage,
      )
        ? currentProgress.completedStages
        : [...currentProgress.completedStages, previousStage];

      setState({
        ...state,
        learnProgress: {
          ...currentProgress,
          currentStage: stage,
          completedStages: newCompletedStages,
        },
      });
    },
    [state, setState],
  );

  // Complete learning (graduated)
  const completeLearn = useCallback(() => {
    const currentProgress = state.learnProgress || DEFAULT_LEARN_PROGRESS;
    setState({
      ...state,
      learnProgress: {
        ...currentProgress,
        completedStages: [1, 2, 3, 4, 5],
        hasGraduated: true,
      },
    });
  }, [state, setState]);

  // Check if user has graduated from learn mode
  const hasGraduated = state.learnProgress?.hasGraduated ?? false;

  const value: TutorialContextValue = {
    completedModules: state.completedModules,
    hasSeenWelcome: state.hasSeenWelcome,
    activeTour,
    activeLibrary: state.preferredLibrary,
    learnProgress: state.learnProgress,
    startTour,
    endTour,
    markComplete,
    markWelcomeSeen,
    resetAllTutorials,
    setPreferredLibrary,
    setLearnStage,
    advanceLearnStage,
    completeLearn,
    isFirstVisit,
    hasGraduated,
    getModuleProgress,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

// Export module info for UI
export const TUTORIAL_MODULES: Array<{
  id: TutorialModule;
  title: string;
  description: string;
  stepCount: number;
}> = [
  {
    id: "ui-overview",
    title: "Quick Tour",
    description: "Overview of the main UI areas and what they do",
    stepCount: 9,
  },
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Learn the basics: select tools, place notes, and play",
    stepCount: 4,
  },
  {
    id: "note-editing",
    title: "Note Editing",
    description: "Edit notes: change duration, drag, delete, and undo",
    stepCount: 4,
  },
  {
    id: "piano-playback",
    title: "Piano & Playback",
    description: "Use the piano keyboard and control playback",
    stepCount: 4,
  },
  {
    id: "advanced-features",
    title: "Advanced Features",
    description: "Master repeats, lyrics, time signatures, and settings",
    stepCount: 4,
  },
];
