"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTutorial } from "@/hooks/useTutorial";
import { LearnLayout } from "./components/LearnLayout";
import { StageContent } from "./components/StageContent";

export type LearnStage = 1 | 2 | 3 | 4 | 5;

export const STAGE_INFO: Record<
  LearnStage,
  { title: string; subtitle: string }
> = {
  1: { title: "The Staff & Notes", subtitle: "Where notes live" },
  2: { title: "Note Durations", subtitle: "How long notes last" },
  3: { title: "Reading & Playing", subtitle: "Making music flow" },
  4: { title: "Rhythm & Shorter Notes", subtitle: "Adding complexity" },
  5: { title: "Full Editor Intro", subtitle: "You're ready!" },
};

export default function LearnPage() {
  const router = useRouter();
  const { learnProgress, advanceLearnStage, completeLearn } = useTutorial();

  // Current stage from progress, default to 1
  const [currentStage, setCurrentStage] = useState<LearnStage>(
    (learnProgress?.currentStage as LearnStage) || 1,
  );

  // Handle stage completion
  const handleStageComplete = useCallback(() => {
    if (currentStage < 5) {
      const nextStage = (currentStage + 1) as LearnStage;
      advanceLearnStage(nextStage);
      setCurrentStage(nextStage);
    } else {
      // Completed all stages!
      completeLearn();
      router.push("/");
    }
  }, [currentStage, advanceLearnStage, completeLearn, router]);

  // Handle stage navigation (for non-gated stages 3-5)
  const handleStageSelect = useCallback(
    (stage: LearnStage) => {
      // Stages 1-2 are gated
      if (stage <= 2) {
        if (
          learnProgress?.completedStages?.includes(stage - 1) ||
          stage === 1
        ) {
          setCurrentStage(stage);
        }
      } else {
        // Stages 3-5 are freely accessible after completing stage 2
        if (learnProgress?.completedStages?.includes(2)) {
          setCurrentStage(stage);
        }
      }
    },
    [learnProgress],
  );

  // Handle exit to editor
  const handleExit = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-teal-100">
      <LearnLayout
        currentStage={currentStage}
        completedStages={learnProgress?.completedStages || []}
        onStageSelect={handleStageSelect}
        onExit={handleExit}
      >
        <StageContent
          stage={currentStage}
          onComplete={handleStageComplete}
          onExit={handleExit}
        />
      </LearnLayout>
    </div>
  );
}
