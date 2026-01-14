"use client";

import { TutorialProvider } from "@/hooks/useTutorial";
import { InteractiveTutorialProvider } from "@/hooks/useInteractiveTutorial";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TutorialProvider>
      <InteractiveTutorialProvider>{children}</InteractiveTutorialProvider>
    </TutorialProvider>
  );
}
