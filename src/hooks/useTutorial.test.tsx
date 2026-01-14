import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  TutorialProvider,
  useTutorial,
  TUTORIAL_MODULES,
  TutorialModule,
} from "./useTutorial";

// Wrapper component for the hook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TutorialProvider>{children}</TutorialProvider>
);

describe("useTutorial hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("initial state", () => {
    it("should start with empty completed modules", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      expect(result.current.completedModules).toEqual([]);
    });

    it("should indicate first visit when no tutorials completed", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      expect(result.current.isFirstVisit).toBe(true);
      expect(result.current.hasSeenWelcome).toBe(false);
    });

    it("should default to driver library", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      expect(result.current.activeLibrary).toBe("driver");
    });

    it("should have no active tour initially", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      expect(result.current.activeTour).toBeNull();
    });
  });

  describe("startTour", () => {
    it("should set active tour when started", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.startTour("getting-started");
      });

      expect(result.current.activeTour).toBe("getting-started");
    });

    it("should allow starting different tours", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.startTour("note-editing");
      });

      expect(result.current.activeTour).toBe("note-editing");
    });
  });

  describe("endTour", () => {
    it("should clear active tour", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.startTour("getting-started");
      });
      expect(result.current.activeTour).toBe("getting-started");

      act(() => {
        result.current.endTour();
      });
      expect(result.current.activeTour).toBeNull();
    });
  });

  describe("markComplete", () => {
    it("should add module to completed list", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.markComplete("getting-started");
      });

      expect(result.current.completedModules).toContain("getting-started");
    });

    it("should not duplicate completed modules", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.markComplete("getting-started");
        result.current.markComplete("getting-started");
      });

      expect(
        result.current.completedModules.filter((m) => m === "getting-started")
          .length,
      ).toBe(1);
    });

    it("should end active tour when marking complete", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.startTour("getting-started");
      });
      expect(result.current.activeTour).toBe("getting-started");

      act(() => {
        result.current.markComplete("getting-started");
      });
      expect(result.current.activeTour).toBeNull();
    });

    it("should track multiple completed modules", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.markComplete("getting-started");
      });
      act(() => {
        result.current.markComplete("note-editing");
      });

      expect(result.current.completedModules).toContain("getting-started");
      expect(result.current.completedModules).toContain("note-editing");
      expect(result.current.completedModules).toHaveLength(2);
    });
  });

  describe("markWelcomeSeen", () => {
    it("should mark welcome as seen", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      expect(result.current.hasSeenWelcome).toBe(false);

      act(() => {
        result.current.markWelcomeSeen();
      });

      expect(result.current.hasSeenWelcome).toBe(true);
    });

    it("should update isFirstVisit after welcome seen", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      expect(result.current.isFirstVisit).toBe(true);

      act(() => {
        result.current.markWelcomeSeen();
      });

      expect(result.current.isFirstVisit).toBe(false);
    });
  });

  describe("setPreferredLibrary", () => {
    it("should change preferred library to nextstep", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.setPreferredLibrary("nextstep");
      });

      expect(result.current.activeLibrary).toBe("nextstep");
    });

    it("should change preferred library back to driver", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.setPreferredLibrary("nextstep");
      });
      act(() => {
        result.current.setPreferredLibrary("driver");
      });

      expect(result.current.activeLibrary).toBe("driver");
    });
  });

  describe("resetAllTutorials", () => {
    it("should clear all completed modules", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.markComplete("getting-started");
      });
      act(() => {
        result.current.markComplete("note-editing");
      });
      expect(result.current.completedModules.length).toBe(2);

      act(() => {
        result.current.resetAllTutorials();
      });

      expect(result.current.completedModules).toEqual([]);
    });

    it("should reset welcome seen state", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.markWelcomeSeen();
      });
      expect(result.current.hasSeenWelcome).toBe(true);

      act(() => {
        result.current.resetAllTutorials();
      });

      expect(result.current.hasSeenWelcome).toBe(false);
    });

    it("should clear active tour", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.startTour("getting-started");
      });
      expect(result.current.activeTour).toBe("getting-started");

      act(() => {
        result.current.resetAllTutorials();
      });

      expect(result.current.activeTour).toBeNull();
    });
  });

  describe("getModuleProgress", () => {
    it("should return 0% when no modules completed", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      const progress = result.current.getModuleProgress();

      expect(progress.completed).toBe(0);
      expect(progress.total).toBe(TUTORIAL_MODULES.length);
      expect(progress.percentage).toBe(0);
    });

    it("should return correct progress after completing modules", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.markComplete("getting-started");
      });

      const progress = result.current.getModuleProgress();

      expect(progress.completed).toBe(1);
      expect(progress.total).toBe(TUTORIAL_MODULES.length);
      expect(progress.percentage).toBe(25); // 1/4 = 25%
    });

    it("should return 100% when all modules completed", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      // Each markComplete needs its own act() to properly flush state
      TUTORIAL_MODULES.forEach((module) => {
        act(() => {
          result.current.markComplete(module.id);
        });
      });

      const progress = result.current.getModuleProgress();

      expect(progress.completed).toBe(TUTORIAL_MODULES.length);
      expect(progress.percentage).toBe(100);
    });
  });

  describe("localStorage persistence", () => {
    it("should persist completed modules to localStorage", () => {
      const { result } = renderHook(() => useTutorial(), { wrapper });

      act(() => {
        result.current.markComplete("getting-started");
      });

      const stored = JSON.parse(
        localStorage.getItem("rochel-tutorial-state") || "{}",
      );
      expect(stored.completedModules).toContain("getting-started");
    });

    it("should load completed modules from localStorage", () => {
      // Pre-populate localStorage
      localStorage.setItem(
        "rochel-tutorial-state",
        JSON.stringify({
          completedModules: ["getting-started", "note-editing"],
          hasSeenWelcome: true,
          preferredLibrary: "driver",
        }),
      );

      const { result } = renderHook(() => useTutorial(), { wrapper });

      expect(result.current.completedModules).toContain("getting-started");
      expect(result.current.completedModules).toContain("note-editing");
      expect(result.current.hasSeenWelcome).toBe(true);
    });
  });
});

describe("TUTORIAL_MODULES", () => {
  it("should have 4 tutorial modules", () => {
    expect(TUTORIAL_MODULES).toHaveLength(4);
  });

  it("should have required properties for each module", () => {
    TUTORIAL_MODULES.forEach((module) => {
      expect(module).toHaveProperty("id");
      expect(module).toHaveProperty("title");
      expect(module).toHaveProperty("description");
      expect(module).toHaveProperty("stepCount");
    });
  });

  it("should have unique IDs", () => {
    const ids = TUTORIAL_MODULES.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should include getting-started module", () => {
    const gettingStarted = TUTORIAL_MODULES.find(
      (m) => m.id === "getting-started",
    );
    expect(gettingStarted).toBeDefined();
    expect(gettingStarted?.title).toBe("Getting Started");
  });
});
