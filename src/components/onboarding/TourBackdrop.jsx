import React from "react";
import { motion } from "framer-motion";

const PADDING = 8;
const BORDER_RADIUS = 12;

export default function TourBackdrop({ targetRect }) {
  // If no target, show full overlay without cutout
  if (!targetRect) {
    return (
      <div
        className="fixed inset-0"
        style={{ zIndex: 9998, pointerEvents: "auto" }}
      >
        <svg width="100%" height="100%" className="block">
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" />
        </svg>
      </div>
    );
  }

  const x = targetRect.left - PADDING;
  const y = targetRect.top - PADDING;
  const w = targetRect.width + PADDING * 2;
  const h = targetRect.height + PADDING * 2;

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 9998, pointerEvents: "auto" }}
    >
      <svg width="100%" height="100%" className="block">
        <defs>
          <mask id="tour-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <motion.rect
              initial={{ opacity: 0 }}
              animate={{ x, y, width: w, height: h, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              rx={BORDER_RADIUS}
              ry={BORDER_RADIUS}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.65)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>
    </div>
  );
}
