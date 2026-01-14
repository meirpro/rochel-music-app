"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { driver, Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { TutorialModule } from "./useTutorial";
import {
  DRIVER_STEPS,
  DRIVER_POPOVER_CLASS,
} from "@/lib/tourSteps/driverSteps";

interface UseDriverTourOptions {
  onComplete?: (module: TutorialModule) => void;
  onSkip?: () => void;
}

interface UseDriverTourReturn {
  startTour: (module: TutorialModule) => void;
  stopTour: () => void;
  isActive: boolean;
}

export function useDriverTour(
  options: UseDriverTourOptions = {},
): UseDriverTourReturn {
  const driverRef = useRef<Driver | null>(null);
  const activeModuleRef = useRef<TutorialModule | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Initialize driver instance
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, []);

  const startTour = useCallback(
    (module: TutorialModule) => {
      const steps = DRIVER_STEPS[module];
      if (!steps || steps.length === 0) {
        console.warn(`No steps defined for module: ${module}`);
        return;
      }

      // Destroy existing driver if any
      if (driverRef.current) {
        driverRef.current.destroy();
      }

      activeModuleRef.current = module;
      setIsActive(true);

      // Create new driver instance
      driverRef.current = driver({
        showProgress: true,
        animate: true,
        smoothScroll: true,
        allowClose: true,
        stagePadding: 8,
        stageRadius: 8,
        popoverClass: DRIVER_POPOVER_CLASS,
        progressText: "{{current}} of {{total}}",
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Done!",
        onDestroyStarted: () => {
          // Called when user clicks outside or presses escape
          if (driverRef.current?.hasNextStep()) {
            // Still has steps - user is skipping
            options.onSkip?.();
          }
          driverRef.current?.destroy();
        },
        onDestroyed: () => {
          // Check if tour was completed (no more steps)
          if (activeModuleRef.current && !driverRef.current?.hasNextStep()) {
            options.onComplete?.(activeModuleRef.current);
          }
          activeModuleRef.current = null;
          setIsActive(false);
        },
        steps: steps,
      });

      // Start the tour
      driverRef.current.drive();
    },
    [options],
  );

  const stopTour = useCallback(() => {
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
    activeModuleRef.current = null;
    setIsActive(false);
  }, []);

  return {
    startTour,
    stopTour,
    isActive,
  };
}
