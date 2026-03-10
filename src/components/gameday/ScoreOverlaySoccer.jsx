import React from "react";

/**
 * Soccer-specific score overlay.
 * Shows half, match time, scores, card counts.
 */
export default function ScoreOverlaySoccer({ game, recentEvent }) {
  const config = game.game_config || {};
  const period = game.current_period || "";
  const clock = config.game_clock || "";
  const homeYellow = config.home_yellow_cards || 0;
  const awayYellow = config.away_yellow_cards || 0;
  const homeRed = config.home_red_cards || 0;
  const awayRed = config.away_red_cards || 0;

  const periodLabel = period === "OT" ? "OT" : period === "ET" ? "ET"
    : period === "H1" ? "1st Half" : period === "H2" ? "2nd Half" : period;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div className="bg-black/85 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        {/* Main scoreline */}
        <div className="px-4 py-2 flex items-center gap-4">
          <div className="text-right">
            <p className="text-white text-xs font-bold truncate max-w-[80px]">{game.home_team_name}</p>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              {homeYellow > 0 && <span className="text-[10px] text-yellow-400">🟨{homeYellow}</span>}
              {homeRed > 0 && <span className="text-[10px] text-red-400">🟥{homeRed}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-2xl font-black tabular-nums">{game.home_score}</span>
            <span className="text-slate-400 text-sm">-</span>
            <span className="text-white text-2xl font-black tabular-nums">{game.away_score}</span>
          </div>
          <div className="text-left">
            <p className="text-white text-xs font-bold truncate max-w-[80px]">{game.away_team_name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {awayYellow > 0 && <span className="text-[10px] text-yellow-400">🟨{awayYellow}</span>}
              {awayRed > 0 && <span className="text-[10px] text-red-400">🟥{awayRed}</span>}
            </div>
          </div>
        </div>
        {/* Period + Clock */}
        <div className="bg-white/10 px-3 py-1 flex items-center justify-center gap-2">
          <span className="text-yellow-400 text-[10px] font-bold">{periodLabel}</span>
          {clock && <span className="text-white text-xs font-mono font-bold">{clock}'</span>}
        </div>
      </div>

      {recentEvent && (
        <div className="mt-2 bg-yellow-500/90 rounded-lg px-3 py-1.5 text-xs font-bold text-black text-center animate-pulse">
          {recentEvent.player_name && `${recentEvent.player_name}: `}
          {recentEvent.description || recentEvent.event_type}
        </div>
      )}
    </div>
  );
}
