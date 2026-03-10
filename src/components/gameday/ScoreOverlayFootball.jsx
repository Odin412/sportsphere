import React from "react";

/**
 * Football-specific score overlay.
 * Shows quarter, game clock, team scores, down & distance.
 */
export default function ScoreOverlayFootball({ game, recentEvent }) {
  const config = game.game_config || {};
  const period = game.current_period || "";
  const clock = config.game_clock || "";
  const down = config.down || 0;
  const distance = config.distance || 0;
  const possession = config.possession || ""; // "home" or "away"

  const periodLabel = period === "OT" ? "OT" : period.replace("Q", "Q");

  const downSuffix = down === 1 ? "st" : down === 2 ? "nd" : down === 3 ? "rd" : "th";
  const downText = down > 0 ? `${down}${downSuffix} & ${distance}` : "";

  return (
    <div className="absolute top-3 left-3 z-20 pointer-events-none">
      <div className="bg-black/85 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden min-w-[220px]">
        {/* Period + Clock */}
        <div className="bg-white/10 px-3 py-1 flex items-center justify-between">
          <span className="text-yellow-400 text-xs font-black">{periodLabel}</span>
          {clock && <span className="text-white text-sm font-mono font-bold">{clock}</span>}
        </div>

        {/* Teams & Scores */}
        <div className="px-3 py-2 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {possession === "away" && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
              <span className="text-white text-xs font-bold truncate max-w-[100px]">{game.away_team_name}</span>
            </div>
            <span className="text-white text-xl font-black tabular-nums">{game.away_score}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {possession === "home" && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
              <span className="text-white text-xs font-bold truncate max-w-[100px]">{game.home_team_name}</span>
            </div>
            <span className="text-white text-xl font-black tabular-nums">{game.home_score}</span>
          </div>
        </div>

        {/* Down & Distance */}
        {downText && (
          <div className="bg-white/10 px-3 py-1 text-center">
            <span className="text-yellow-300 text-[11px] font-bold">{downText}</span>
          </div>
        )}
      </div>

      {recentEvent && (
        <div className="mt-2 bg-yellow-500/90 rounded-lg px-3 py-1.5 text-xs font-bold text-black text-center animate-pulse max-w-[220px]">
          {recentEvent.player_name && `${recentEvent.player_name}: `}
          {recentEvent.description || recentEvent.event_type}
        </div>
      )}
    </div>
  );
}
