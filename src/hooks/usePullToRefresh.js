import { useRef, useEffect, useState, useCallback } from "react";

/**
 * Pull-to-refresh hook for mobile touch devices.
 * Attaches to a scrollable container and calls `onRefresh` when the user
 * pulls down past the threshold while scrolled to the top.
 *
 * @param {Object} opts
 * @param {Function} opts.onRefresh - async callback to invoke on pull-to-refresh
 * @param {number}   [opts.threshold=80] - pixels to pull before triggering
 * @returns {{ containerRef, isRefreshing, pullDistance }}
 */
export default function usePullToRefresh({ onRefresh, threshold = 80 }) {
  const containerRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const pulling = useRef(false);

  const handleTouchStart = useCallback((e) => {
    const el = containerRef.current;
    if (!el || el.scrollTop > 0 || isRefreshing) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      // Apply resistance — diminishing returns after threshold
      const dampened = delta > threshold ? threshold + (delta - threshold) * 0.3 : delta;
      setPullDistance(dampened);
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (pullDistance >= threshold && onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { containerRef, isRefreshing, pullDistance };
}
