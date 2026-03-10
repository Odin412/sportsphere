import React from "react";
import titanStamp from "./powered by TitanAI.png";

/**
 * Subtle "Powered by TitanAI" branding stamp.
 * Uses mix-blend-mode so the badge looks stamped onto the page,
 * not floating as a separate rectangular element.
 */
export default function PoweredByTitanAI({ variant = "inline", className = "" }) {
  if (variant === "minimal") {
    return (
      <div className={`flex items-center justify-center gap-1.5 opacity-40 hover:opacity-70 transition-opacity ${className}`}>
        <img
          src={titanStamp}
          alt="TitanAI"
          className="h-4 object-contain mix-blend-lighten drop-shadow-sm"
        />
        <span className="text-[10px] text-white/60 font-medium tracking-wide">
          Powered by TitanAI
        </span>
      </div>
    );
  }

  // Default: inline badge — blended into sidebar
  return (
    <div className={`flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity ${className}`}>
      <img
        src={titanStamp}
        alt="Powered by TitanAI"
        className="h-8 object-contain mix-blend-lighten drop-shadow-sm"
      />
    </div>
  );
}
