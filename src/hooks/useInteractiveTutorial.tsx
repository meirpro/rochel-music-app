"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { driver, Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { TOUR_ELEMENT_IDS } from "@/lib/tourSteps/driverSteps";

// Types for interactive tutorial actions
export type TutorialAction =
  | { type: "select-tool"; tool: string }
  | { type: "place-note" }
  | { type: "delete-note" }
  | { type: "play-music" }
  | { type: "any" }; // For steps that just need acknowledgment

export interface InteractiveStep {
  id: string;
  element: string;
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  waitFor: TutorialAction;
  // Optional hint shown after a delay if user hasn't completed the action
  hint?: string;
}

// Interactive tutorial modules
export const INTERACTIVE_TUTORIALS = {
  "tools-basics": {
    id: "tools-basics",
    name: "Learn the Tools",
    description: "Master the basics by doing - select tools and place notes",
    steps: [
      {
        id: "select-quarter",
        element: `#${TOUR_ELEMENT_IDS.quarterNoteTool}`,
        title: "1. Select the Quarter Note",
        description:
          "Click the Quarter note tool to select it. This is the most common note duration.",
        side: "left" as const,
        waitFor: { type: "select-tool" as const, tool: "quarter" },
      },
      {
        id: "place-first-note",
        element: `#${TOUR_ELEMENT_IDS.staffCanvas}`,
        title: "2. Place Your First Note",
        description:
          "Great! Now click anywhere on the staff lines to place a quarter note. The note will snap to the nearest line or space.",
        side: "top" as const,
        waitFor: { type: "place-note" as const },
        hint: "Click on one of the horizontal lines on the staff",
      },
      {
        id: "select-half",
        element: `#${TOUR_ELEMENT_IDS.halfNoteTool}`,
        title: "3. Try the Half Note",
        description:
          "Excellent! Now select the Half note tool. Half notes last twice as long as quarter notes.",
        side: "left" as const,
        waitFor: { type: "select-tool" as const, tool: "half" },
      },
      {
        id: "place-half-note",
        element: `#${TOUR_ELEMENT_IDS.staffCanvas}`,
        title: "4. Place a Half Note",
        description:
          "Click on the staff to place a half note. Notice it looks hollow and takes up more space.",
        side: "top" as const,
        waitFor: { type: "place-note" as const },
      },
      {
        id: "select-delete",
        element: `#${TOUR_ELEMENT_IDS.deleteTool}`,
        title: "5. Select the Delete Tool",
        description:
          "Now let's learn to delete. Click the Delete tool (the X icon).",
        side: "left" as const,
        waitFor: { type: "select-tool" as const, tool: "delete" },
      },
      {
        id: "delete-a-note",
        element: `#${TOUR_ELEMENT_IDS.staffCanvas}`,
        title: "6. Delete a Note",
        description:
          "Click on any note you placed to delete it. With the delete tool selected, clicking a note removes it.",
        side: "top" as const,
        waitFor: { type: "delete-note" as const },
        hint: "Click directly on one of the notes you placed",
      },
      {
        id: "deselect-tool",
        element: `#${TOUR_ELEMENT_IDS.deleteTool}`,
        title: "7. Deselect the Tool",
        description:
          "Pro tip: Click the same tool again to deselect it. Try clicking the Delete tool again.",
        side: "left" as const,
        waitFor: { type: "select-tool" as const, tool: "" }, // Empty means deselected
      },
    ] as InteractiveStep[],
  },
} as const;

export type InteractiveTutorialId = keyof typeof INTERACTIVE_TUTORIALS;

interface InteractiveTutorialContextType {
  // Current state
  isActive: boolean;
  currentTutorial: InteractiveTutorialId | null;
  currentStepIndex: number;
  currentStep: InteractiveStep | null;

  // Actions
  startTutorial: (id: InteractiveTutorialId) => void;
  stopTutorial: () => void;
  reportAction: (action: TutorialAction) => void;

  // For components to check if they should highlight
  isWaitingFor: (action: TutorialAction) => boolean;
}

const InteractiveTutorialContext =
  createContext<InteractiveTutorialContextType | null>(null);

export function InteractiveTutorialProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isActive, setIsActive] = useState(false);
  const [currentTutorial, setCurrentTutorial] =
    useState<InteractiveTutorialId | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const driverRef = useRef<Driver | null>(null);
  const initialNoteCountRef = useRef<number>(0);

  // Get current step
  const currentStep =
    currentTutorial && INTERACTIVE_TUTORIALS[currentTutorial]
      ? INTERACTIVE_TUTORIALS[currentTutorial].steps[currentStepIndex] || null
      : null;

  // Cleanup driver on unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  // Show current step with Driver.js
  const showStep = useCallback((step: InteractiveStep) => {
    // Destroy existing driver
    if (driverRef.current) {
      driverRef.current.destroy();
    }

    // Create new driver for this step
    driverRef.current = driver({
      showProgress: false,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: "rochel-interactive-tour",
      // No buttons - user must complete the action
      showButtons: [],
      onDestroyStarted: () => {
        // User clicked outside or pressed escape
        driverRef.current?.destroy();
      },
      steps: [
        {
          element: step.element,
          popover: {
            title: step.title,
            description: `<div class="interactive-step-content">
              <p>${step.description}</p>
              <div class="interactive-step-indicator">
                <span class="pulse-dot"></span>
                <span class="waiting-text">Waiting for you to complete this action...</span>
              </div>
            </div>`,
            side: step.side || "bottom",
            align: step.align || "center",
          },
        },
      ],
    });

    driverRef.current.drive();
  }, []);

  // Start a tutorial
  const startTutorial = useCallback(
    (id: InteractiveTutorialId) => {
      const tutorial = INTERACTIVE_TUTORIALS[id];
      if (!tutorial || tutorial.steps.length === 0) {
        console.warn(`No tutorial found: ${id}`);
        return;
      }

      // Store initial note count for detecting new notes
      const notesOnPage = document.querySelectorAll("[data-note-id]").length;
      initialNoteCountRef.current = notesOnPage;

      setCurrentTutorial(id);
      setCurrentStepIndex(0);
      setIsActive(true);

      // Show first step after a brief delay to let state settle
      setTimeout(() => {
        showStep(tutorial.steps[0]);
      }, 100);
    },
    [showStep],
  );

  // Stop the tutorial
  const stopTutorial = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
    setIsActive(false);
    setCurrentTutorial(null);
    setCurrentStepIndex(0);
  }, []);

  // Advance to next step
  const advanceStep = useCallback(() => {
    if (!currentTutorial) return;

    const tutorial = INTERACTIVE_TUTORIALS[currentTutorial];
    const nextIndex = currentStepIndex + 1;

    if (nextIndex >= tutorial.steps.length) {
      // Tutorial complete!
      if (driverRef.current) {
        driverRef.current.destroy();
      }

      // Show completion message
      driverRef.current = driver({
        showProgress: false,
        animate: true,
        allowClose: true,
        popoverClass: "rochel-interactive-tour completion",
        showButtons: ["close"],
        steps: [
          {
            popover: {
              title: "🎉 Tutorial Complete!",
              description:
                "You've mastered the basics! You now know how to select tools, place notes, and delete them. Keep experimenting!",
            },
          },
        ],
        onDestroyed: () => {
          stopTutorial();
        },
      });
      driverRef.current.drive();
    } else {
      // Move to next step
      setCurrentStepIndex(nextIndex);
      setTimeout(() => {
        showStep(tutorial.steps[nextIndex]);
      }, 300);
    }
  }, [currentTutorial, currentStepIndex, showStep, stopTutorial]);

  // Check if an action matches what we're waiting for
  const actionsMatch = useCallback(
    (expected: TutorialAction, reported: TutorialAction): boolean => {
      if (expected.type !== reported.type) return false;

      if (expected.type === "select-tool" && reported.type === "select-tool") {
        // Special case: empty string means "deselected" (null tool)
        if (expected.tool === "") {
          return reported.tool === "" || reported.tool === "null";
        }
        return expected.tool === reported.tool;
      }

      return true;
    },
    [],
  );

  // Report that an action was completed
  const reportAction = useCallback(
    (action: TutorialAction) => {
      if (!isActive || !currentStep) return;

      // Check if this action matches what we're waiting for
      if (actionsMatch(currentStep.waitFor, action)) {
        advanceStep();
      }
    },
    [isActive, currentStep, actionsMatch, advanceStep],
  );

  // Check if we're waiting for a specific action (for component highlighting)
  const isWaitingFor = useCallback(
    (action: TutorialAction): boolean => {
      if (!isActive || !currentStep) return false;
      return actionsMatch(currentStep.waitFor, action);
    },
    [isActive, currentStep, actionsMatch],
  );

  return (
    <InteractiveTutorialContext.Provider
      value={{
        isActive,
        currentTutorial,
        currentStepIndex,
        currentStep,
        startTutorial,
        stopTutorial,
        reportAction,
        isWaitingFor,
      }}
    >
      {children}
    </InteractiveTutorialContext.Provider>
  );
}

export function useInteractiveTutorial() {
  const context = useContext(InteractiveTutorialContext);
  if (!context) {
    throw new Error(
      "useInteractiveTutorial must be used within InteractiveTutorialProvider",
    );
  }
  return context;
}
