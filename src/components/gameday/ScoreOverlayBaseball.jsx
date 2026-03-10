import React from "react";

/**
 * Baseball-specific score overlay.
 * Shows inning, count (B/S/O), runners on base diamond, and score.
 */
export default function ScoreOverlayBaseball({ game, recentEvent }) {
  const config = game.game_config || {};
  const period = game.current_period || "";
  const match = period.match(/^(T|B)(\d+)$/);
  const halfLabel = match ? (match[1] === "T" ? "▲" : "▼") : "";
  const inningNum = match ? match[2] : period;

  // Count state from game_config
  const balls = config.balls || 0;
  const strikes = config.strikes || 0;
  const outs = config.outs || 0;
  const bases = config.bases || [false, false, false]; // 1st, 2nd, 3rd

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
      <div className="broadcast-bar overflow-hidden">
        {/* Teams & Score */}
        <div className="px-3 py-2 space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-white text-xs font-display uppercase tracking-wider font-bold truncate max-w-[100px]">{game.away_team_name}</span>
            <span className="text-white text-lg font-black tabular-nums">{game.away_score}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-white text-xs font-display uppercase tracking-wider font-bold truncate max-w-[100px]">{game.home_team_name}</span>
            <span className="text-white text-lg font-black tabular-nums">{game.home_score}</span>
          </div>
        </div>

        {/* Inning + Count */}
        <div className="bg-monza/20 px-3 py-1.5 flex items-center justify-between gap-3">
          {/* Inning */}
          <div className="text-white text-xs font-display font-bold">
            <span className="text-monza">{halfLabel}</span> {inningNum}
          </div>

          {/* Count: B-S-O */}
          <div className="flex items-center gap-2 text-[10px] text-stadium-400">
            <div className="flex items-center gap-0.5">
              <span>B</span>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < balls ? "bg-green-400" : "bg-stadium-700"}`} />
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              <span>S</span>
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < strikes ? "bg-yellow-400" : "bg-stadium-700"}`} />
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              <span>O</span>
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-2 h-2 rounded-full ${i < outs ? "bg-red-400" : "bg-stadium-700"}`} />
              ))}
            </div>
          </div>

          {/* Diamond */}
          <div className="relative w-6 h-6 flex-shrink-0">
            {/* 2nd base (top) */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${bases[1] ? "bg-yellow-400" : "bg-stadium-700"}`} />
            {/* 3rd base (left) */}
            <div className={`absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rotate-45 ${bases[2] ? "bg-yellow-400" : "bg-stadium-700"}`} />
            {/* 1st base (right) */}
            <div className={`absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rotate-45 ${bases[0] ? "bg-yellow-400" : "bg-stadium-700"}`} />
          </div>
        </div>
      </div>

      {/* Event ticker */}
      {recentEvent && (
        <div className="bg-monza px-3 py-1.5 text-xs font-bold font-display uppercase tracking-wide text-white text-center animate-score-flash">
          {recentEvent.player_name && `${recentEvent.player_name}: `}
          {recentEvent.description || recentEvent.event_type}
        </div>
      )}
    </div>
  );
}
