import { useState, useCallback } from "react";
import { getTourSteps } from "@/components/onboarding/tourSteps";

const STORAGE_KEYS = {
  PENDING: "tutorial_pending",
  COMPLETE: "tutorial_complete",
  ROLE: "user_role",
};

export function useTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState([]);

  const start = useCallback((role) => {
    const tourSteps = getTourSteps(role || "athlete");
    if (tourSteps.length === 0) return;
    setSteps(tourSteps);
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const finish = useCallback(() => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setSteps([]);
    localStorage.setItem(STORAGE_KEYS.COMPLETE, "1");
    localStorage.removeItem(STORAGE_KEYS.PENDING);
  }, []);

  const skip = useCallback(() => {
    finish();
  }, [finish]);

  const next = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      finish();
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  }, [currentStepIndex, steps.length, finish]);

  const back = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    }
  }, [currentStepIndex]);

  const currentStep = steps[currentStepIndex] || null;
  const progress = {
    current: currentStepIndex + 1,
    total: steps.length,
  };

  return {
    isActive,
    currentStep,
    progress,
    start,
    next,
    back,
    skip,
    finish,
  };
}

export { STORAGE_KEYS };
