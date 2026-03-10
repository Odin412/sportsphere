import React from "react";

/**
 * Soccer box score — goals timeline with scorers, assists, and match stats.
 */
export default function BoxScoreSoccer({ game, scores, events }) {
  const goals = (events || [])
    .filter(e => e.event_type === "goal")
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const yellowCards = (events || []).filter(e => e.event_type === "yellow_card");
  const redCards = (events || []).filter(e => e.event_type === "red_card");
  const corners = (events || []).filter(e => e.event_type === "corner");
  const shotsOnTarget = (events || []).filter(e => e.event_type === "shot_on_target");

  const countByTeam = (arr, team) => arr.filter(e => e.team === team).length;

  return (
    <div className="space-y-4">
      {/* Goals timeline */}
      {goals.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Goals</p>
          {goals.map((g, i) => (
            <div
              key={g.id || i}
              className={`flex items-center gap-3 p-2 rounded-lg ${g.team === "home" ? "bg-red-50" : "bg-blue-50"}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white ${g.team === "home" ? "bg-red-500" : "bg-blue-500"}`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900">
                  {g.player_name || (g.team === "home" ? game.home_team_name : game.away_team_name)}
                </p>
                {g.details?.assist && (
                  <p className="text-[10px] text-slate-500">Assist: {g.details.assist}</p>
                )}
              </div>
              <span className="text-xs font-bold text-slate-400">{g.period}</span>
            </div>
          ))}
        </div>
      )}

      {/* Match stats */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase">Match Stats</p>
        <div className="space-y-1.5">
          {[
            { label: "Goals", home: game.home_score, away: game.away_score },
            { label: "Shots on Target", home: countByTeam(shotsOnTarget, "home"), away: countByTeam(shotsOnTarget, "away") },
            { label: "Corners", home: countByTeam(corners, "home"), away: countByTeam(corners, "away") },
            { label: "Yellow Cards", home: countByTeam(yellowCards, "home"), away: countByTeam(yellowCards, "away") },
            { label: "Red Cards", home: countByTeam(redCards, "home"), away: countByTeam(redCards, "away") },
          ].map((stat, i) => (
            <div key={i} className="flex items-center text-xs">
              <span className="w-8 text-right font-bold text-slate-900 tabular-nums">{stat.home}</span>
              <div className="flex-1 mx-3">
                <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                  <div
                    className="bg-red-400 rounded-l-full"
                    style={{ width: `${stat.home + stat.away > 0 ? (stat.home / (stat.home + stat.away)) * 100 : 50}%` }}
                  />
                  <div
                    className="bg-blue-400 rounded-r-full"
                    style={{ width: `${stat.home + stat.away > 0 ? (stat.away / (stat.home + stat.away)) * 100 : 50}%` }}
                  />
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-0.5">{stat.label}</p>
              </div>
              <span className="w-8 text-left font-bold text-slate-900 tabular-nums">{stat.away}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
