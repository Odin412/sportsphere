import React from "react";
import { Flame, Zap } from "lucide-react";

export default function TrainingStreak({ streak = 0, compact = false }) {
  if (streak === 0) return null;

  const isHot = streak >= 7;
  const isOnFire = streak >= 30;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
        isOnFire ? "bg-red-500 text-white" :
        isHot ? "bg-orange-500 text-white" :
        "bg-orange-100 text-orange-700"
      }`}>
        <Flame className="w-3 h-3" />
        {streak}d
      </span>
    );
  }

  return (
    <div className={`rounded-2xl p-4 flex items-center gap-3 ${
      isOnFire ? "bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-700/40" :
      isHot ? "bg-gradient-to-r from-orange-900/40 to-yellow-900/40 border border-orange-700/40" :
      "bg-gray-800/60 border border-gray-700"
    }`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
        isOnFire ? "bg-red-500/20" : isHot ? "bg-orange-500/20" : "bg-gray-700"
      }`}>
        {isOnFire ? "🔥" : isHot ? "⚡" : <Flame className="w-6 h-6 text-orange-400" />}
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-black ${
            isOnFire ? "text-red-400" : isHot ? "text-orange-400" : "text-white"
          }`}>{streak}</span>
          <span className="text-gray-400 text-sm font-medium">day streak</span>
        </div>
        <p className="text-gray-500 text-xs mt-0.5">
          {isOnFire ? "You're unstoppable. Keep going." :
           isHot ? "One week strong. Keep the momentum." :
           "Log a workout or upload a clip to keep it alive."}
        </p>
      </div>
    </div>
  );
}
