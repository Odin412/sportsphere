import React from "react";

export default function PRBadge({ metric }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900 animate-pulse">
      🏆 New PR! {metric && <span className="font-normal">{metric}</span>}
    </span>
  );
}
