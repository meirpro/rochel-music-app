"use client";

import { LearnStage } from "../page";
import { Stage1Staff } from "../stages/Stage1Staff";
import { Stage2Durations } from "../stages/Stage2Durations";
import { Stage3Reading } from "../stages/Stage3Reading";
import { Stage4Rhythm } from "../stages/Stage4Rhythm";
import { Stage5Editor } from "../stages/Stage5Editor";

interface StageContentProps {
  stage: LearnStage;
  onComplete: () => void;
  onExit: () => void;
}

export function StageContent({ stage, onComplete, onExit }: StageContentProps) {
  switch (stage) {
    case 1:
      return <Stage1Staff onComplete={onComplete} />;
    case 2:
      return <Stage2Durations onComplete={onComplete} />;
    case 3:
      return <Stage3Reading onComplete={onComplete} />;
    case 4:
      return <Stage4Rhythm onComplete={onComplete} />;
    case 5:
      return <Stage5Editor onComplete={onComplete} onExit={onExit} />;
    default:
      return <Stage1Staff onComplete={onComplete} />;
  }
}
