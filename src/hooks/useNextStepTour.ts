"use client";

import { useCallback } from "react";
import { useNextStep } from "nextstepjs";
import { TutorialModule } from "./useTutorial";

interface UseNextStepTourOptions {
  onComplete?: (module: TutorialModule) => void;
  onSkip?: () => void;
}

interface UseNextStepTourReturn {
  startTour: (module: TutorialModule) => void;
  stopTour: () => void;
  isActive: boolean;
  currentStep: number;
}

export function useNextStepTour(
  options: UseNextStepTourOptions = {},
): UseNextStepTourReturn {
  const {
    startNextStep,
    closeNextStep,
    isNextStepVisible,
    currentStep,
    currentTour,
  } = useNextStep();

  const startTour = useCallback(
    (module: TutorialModule) => {
      // NextStepjs uses tour names - our module IDs match tour names
      startNextStep(module);
    },
    [startNextStep],
  );

  const stopTour = useCallback(() => {
    closeNextStep();
    if (currentTour) {
      options.onSkip?.();
    }
  }, [closeNextStep, currentTour, options]);

  return {
    startTour,
    stopTour,
    isActive: isNextStepVisible,
    currentStep: currentStep ?? 0,
  };
}

// Re-export for convenience
export { useNextStep } from "nextstepjs";
