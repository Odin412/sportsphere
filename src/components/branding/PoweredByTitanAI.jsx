import React from "react";
import titanStamp from "./powered by TitanAI.png";

/**
 * Subtle "Powered by TitanAI" branding stamp.
 * mix-blend-multiply eliminates any white/light background from the PNG
 * so the badge looks stamped directly onto whatever surface it sits on.
 */
export default function PoweredByTitanAI({ variant = "inline", className = "" }) {
  if (variant === "minimal") {
    return (
      <div className={`flex items-center justify-center gap-1.5 opacity-50 hover:opacity-80 transition-opacity pointer-events-none ${className}`}>
        <img
          src={titanStamp}
          alt="TitanAI"
          className="h-5 object-contain mix-blend-multiply"
        />
        <span className="text-[10px] text-white/50 font-medium tracking-wide uppercase">
          Powered by TitanAI
        </span>
      </div>
    );
  }

  // Default: inline stamp — bleeds into sidebar surface
  return (
    <div className={`flex items-center justify-center opacity-40 hover:opacity-70 transition-opacity pointer-events-none ${className}`}>
      <img
        src={titanStamp}
        alt="Powered by TitanAI"
        className="h-10 w-full object-contain mix-blend-multiply"
      />
    </div>
  );
}
