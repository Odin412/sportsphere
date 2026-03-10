import React from "react";
import titanBadge from "./Gemini_Generated_Image_52qz5s52qz5s52qz.png";

/**
 * Subtle "Powered by TitanAI" branding stamp.
 * Variants:
 *   - "inline"  → small horizontal badge (sidebar, footer)
 *   - "minimal" → text-only, ultra-subtle (login page, mobile)
 */
export default function PoweredByTitanAI({ variant = "inline", className = "" }) {
  if (variant === "minimal") {
    return (
      <div className={`flex items-center justify-center gap-1.5 opacity-40 hover:opacity-70 transition-opacity ${className}`}>
        <img src={titanBadge} alt="TitanAI" className="w-4 h-4 object-contain" />
        <span className="text-[10px] text-white/60 font-medium tracking-wide">
          Powered by TitanAI
        </span>
      </div>
    );
  }

  // Default: inline badge
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg opacity-50 hover:opacity-80 transition-opacity ${className}`}>
      <img src={titanBadge} alt="TitanAI" className="w-5 h-5 object-contain" />
      <span className="text-[11px] text-stadium-500 font-medium tracking-wide">
        Powered by <span className="text-stadium-400 font-semibold">TitanAI</span>
      </span>
    </div>
  );
}
