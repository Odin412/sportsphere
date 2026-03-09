import React from "react";

const SPORTS = [
  { key: "all", label: "All", icon: "🔥" },
  { key: "Baseball", label: "Baseball", icon: "⚾" },
  { key: "Basketball", label: "Basketball", icon: "🏀" },
  { key: "Football", label: "Football", icon: "🏈" },
  { key: "Soccer", label: "Soccer", icon: "⚽" },
  { key: "Tennis", label: "Tennis", icon: "🎾" },
  { key: "Softball", label: "Softball", icon: "🥎" },
  { key: "Volleyball", label: "Volleyball", icon: "🏐" },
  { key: "Swimming", label: "Swimming", icon: "🏊" },
  { key: "Track & Field", label: "Track", icon: "🏃" },
  { key: "Hockey", label: "Hockey", icon: "🏒" },
  { key: "Golf", label: "Golf", icon: "⛳" },
  { key: "MMA", label: "MMA", icon: "🥊" },
  { key: "Gymnastics", label: "Gymnastics", icon: "🤸" },
];

export default function SportCategoryPills({ selected = "all", onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {SPORTS.map((s) => (
        <button
          key={s.key}
          onClick={() => onSelect(s.key)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
            selected === s.key
              ? "bg-red-600 text-white shadow-lg shadow-red-900/30"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700"
          }`}
        >
          <span className="text-sm">{s.icon}</span>
          {s.label}
        </button>
      ))}
    </div>
  );
}

export { SPORTS };
