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
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
      <div className="broadcast-bar overflow-hidden">
        {/* Period + Clock */}
        <div className="bg-monza/20 px-3 py-1 flex items-center justify-between">
          <span className="text-monza text-xs font-display font-bold">{periodLabel}</span>
          {clock && <span className="text-white text-sm font-mono font-bold">{clock}</span>}
        </div>

        {/* Teams & Scores */}
        <div className="px-3 py-2 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {possession === "away" && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
              <span className="text-white text-xs font-display uppercase tracking-wider font-bold truncate max-w-[100px]">{game.away_team_name}</span>
            </div>
            <span className="text-white text-xl font-black tabular-nums">{game.away_score}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {possession === "home" && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
              <span className="text-white text-xs font-display uppercase tracking-wider font-bold truncate max-w-[100px]">{game.home_team_name}</span>
            </div>
            <span className="text-white text-xl font-black tabular-nums">{game.home_score}</span>
          </div>
        </div>

        {/* Down & Distance */}
        {downText && (
          <div className="bg-monza/20 px-3 py-1 text-center">
            <span className="text-monza text-[11px] font-display font-bold">{downText}</span>
          </div>
        )}
      </div>

      {recentEvent && (
        <div className="bg-monza px-3 py-1.5 text-xs font-bold font-display uppercase tracking-wide text-white text-center animate-score-flash">
          {recentEvent.player_name && `${recentEvent.player_name}: `}
          {recentEvent.description || recentEvent.event_type}
        </div>
      )}
    </div>
  );
}
