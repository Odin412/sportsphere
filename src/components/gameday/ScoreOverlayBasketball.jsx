import React from "react";

/**
 * Basketball-specific score overlay.
 * Shows quarter, game clock, team scores, foul count.
 */
export default function ScoreOverlayBasketball({ game, recentEvent }) {
  const config = game.game_config || {};
  const period = game.current_period || "";
  const clock = config.game_clock || "";
  const homeFouls = config.home_fouls || 0;
  const awayFouls = config.away_fouls || 0;

  const periodLabel = period === "OT" ? "OT" : period.replace("Q", "Q");

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
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-bold truncate max-w-[90px]">{game.away_team_name}</span>
              <span className="text-slate-400 text-[10px]">F:{awayFouls}</span>
            </div>
            <span className="text-white text-xl font-black tabular-nums">{game.away_score}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-bold truncate max-w-[90px]">{game.home_team_name}</span>
              <span className="text-slate-400 text-[10px]">F:{homeFouls}</span>
            </div>
            <span className="text-white text-xl font-black tabular-nums">{game.home_score}</span>
          </div>
        </div>
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
