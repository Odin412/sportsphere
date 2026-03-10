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
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
      <div className="broadcast-bar overflow-hidden">
        {/* Main scoreline */}
        <div className="px-4 py-2 flex items-center justify-center gap-4">
          <div className="text-right">
            <p className="text-white text-xs font-display uppercase tracking-wider font-bold truncate max-w-[80px]">{game.home_team_name}</p>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              {homeYellow > 0 && <span className="text-[10px] text-yellow-400">🟨{homeYellow}</span>}
              {homeRed > 0 && <span className="text-[10px] text-red-400">🟥{homeRed}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-2xl font-display font-black tabular-nums">{game.home_score}</span>
            <span className="text-stadium-600 text-sm">-</span>
            <span className="text-white text-2xl font-display font-black tabular-nums">{game.away_score}</span>
          </div>
          <div className="text-left">
            <p className="text-white text-xs font-display uppercase tracking-wider font-bold truncate max-w-[80px]">{game.away_team_name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {awayYellow > 0 && <span className="text-[10px] text-yellow-400">🟨{awayYellow}</span>}
              {awayRed > 0 && <span className="text-[10px] text-red-400">🟥{awayRed}</span>}
            </div>
          </div>
        </div>
        {/* Period + Clock */}
        <div className="bg-monza/20 px-3 py-1 flex items-center justify-center gap-2">
          <span className="text-monza text-[10px] font-display font-bold">{periodLabel}</span>
          {clock && <span className="text-white text-xs font-mono font-bold">{clock}'</span>}
        </div>
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
