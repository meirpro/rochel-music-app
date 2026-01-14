import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { TutorialProvider } from "@/hooks/useTutorial";

// Custom render that wraps with providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  initialTutorialState?: {
    completedModules?: string[];
    hasSeenWelcome?: boolean;
    preferredLibrary?: "driver" | "nextstep";
  };
}

function AllProviders({ children }: { children: React.ReactNode }) {
  return <TutorialProvider>{children}</TutorialProvider>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  // Set up initial localStorage state if provided
  if (options?.initialTutorialState) {
    localStorage.setItem(
      "rochel-tutorial-state",
      JSON.stringify({
        completedModules: options.initialTutorialState.completedModules ?? [],
        hasSeenWelcome: options.initialTutorialState.hasSeenWelcome ?? false,
        preferredLibrary:
          options.initialTutorialState.preferredLibrary ?? "driver",
      }),
    );
  }

  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
