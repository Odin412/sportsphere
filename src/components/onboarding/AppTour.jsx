import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useTour, STORAGE_KEYS } from "@/hooks/useTour";
import TourBackdrop from "./TourBackdrop";
import TourTooltip from "./TourTooltip";

export default function AppTour({ userRole }) {
  const tour = useTour();
  const [targetRect, setTargetRect] = useState(null);
  const observerRef = useRef(null);
  const moreMenuOpenedRef = useRef(false);

  // Auto-start: check if tutorial_pending is set
  useEffect(() => {
    const pending = localStorage.getItem(STORAGE_KEYS.PENDING) === "1";
    const done = localStorage.getItem(STORAGE_KEYS.COMPLETE) === "1";
    if (pending && !done) {
      // Small delay to let Layout fully render
      const timer = setTimeout(() => {
        const role = userRole || localStorage.getItem(STORAGE_KEYS.ROLE) || "athlete";
        tour.start(role);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [userRole]);

  // Handle "More" menu opening for secondary nav steps
  const ensureMoreMenuOpen = useCallback(() => {
    const moreBtn = document.querySelector("[data-tour='more-menu']");
    if (!moreBtn) return;

    // Check if secondary nav is already visible by looking for a secondary nav link
    const secondaryLink = document.querySelector("[data-tour='nav-getnoticed']");
    if (secondaryLink && secondaryLink.offsetParent !== null) {
      // Already visible
      return;
    }

    // Click to open
    moreBtn.click();
    moreMenuOpenedRef.current = true;
  }, []);

  // Resolve target element position whenever step changes
  useEffect(() => {
    if (!tour.isActive || !tour.currentStep) {
      setTargetRect(null);
      return;
    }

    const step = tour.currentStep;

    // If step requires More menu, open it first
    if (step.requiresMoreMenu) {
      ensureMoreMenuOpen();
    }

    const resolveTarget = () => {
      if (!step.target) {
        setTargetRect(null);
        return;
      }

      const isMobile = window.innerWidth < 1024;
      const selector = isMobile && step.mobileTarget ? step.mobileTarget : step.target;
      const el = document.querySelector(selector);

      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setTargetRect(null);
      }
    };

    // Delay slightly for More menu animation
    const delay = step.requiresMoreMenu ? 300 : 50;
    const timer = setTimeout(resolveTarget, delay);

    // ResizeObserver to update position on layout changes
    const handleResize = () => {
      resolveTarget();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [tour.isActive, tour.currentStep, ensureMoreMenuOpen]);

  // Body scroll lock
  useEffect(() => {
    if (tour.isActive) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [tour.isActive]);

  // Keyboard controls
  useEffect(() => {
    if (!tour.isActive) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "Escape":
          tour.skip();
          break;
        case "ArrowRight":
          e.preventDefault();
          tour.next();
          break;
        case "ArrowLeft":
          e.preventDefault();
          tour.back();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tour.isActive, tour.next, tour.back, tour.skip]);

  if (!tour.isActive || !tour.currentStep) return null;

  return createPortal(
    <>
      <TourBackdrop targetRect={targetRect} />
      <TourTooltip
        step={tour.currentStep}
        targetRect={targetRect}
        progress={tour.progress}
        onNext={tour.next}
        onBack={tour.back}
        onSkip={tour.skip}
      />
    </>,
    document.body
  );
}
