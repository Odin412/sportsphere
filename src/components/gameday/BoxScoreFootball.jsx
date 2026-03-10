import React from "react";

/**
 * Football box score — quarter scoring summary + scoring drives.
 */
export default function BoxScoreFootball({ game, scores, events }) {
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const hasOT = (scores || []).some(s => s.period?.startsWith("OT"));
  if (hasOT) quarters.push("OT");

  // Quarter-by-quarter scoring (same logic as basketball)
  const getQuarterScores = (team) => {
    const result = {};
    const sorted = (scores || [])
      .filter(s => s.event_type === "score_update" || s.event_type === "period_end")
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let prevScore = 0;
    let currentPeriod = "Q1";
    for (const s of sorted) {
      if (s.period !== currentPeriod) {
        const teamScore = team === "home" ? s.home_score : s.away_score;
        result[currentPeriod] = teamScore - prevScore;
        prevScore = teamScore;
        currentPeriod = s.period;
      }
    }
    const totalScore = team === "home" ? game.home_score : game.away_score;
    result[currentPeriod] = totalScore - prevScore;
    return result;
  };

  const homeQ = getQuarterScores("home");
  const awayQ = getQuarterScores("away");

  // Scoring plays
  const scoringPlays = (events || [])
    .filter(e => ["touchdown", "field_goal", "extra_point", "two_point", "safety"].includes(e.event_type))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const countEvents = (team, type) => (events || []).filter(e => e.team === team && e.event_type === type).length;

  return (
    <div className="space-y-4">
      {/* Quarter grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-2 font-bold text-slate-500 w-28">Team</th>
              {quarters.map(q => (
                <th key={q} className="py-2 px-2 font-bold text-slate-400 text-center">{q}</th>
              ))}
              <th className="py-2 px-2 font-black text-slate-700 text-center bg-slate-50">T</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-2 px-2 font-bold text-slate-900 truncate max-w-[100px]">{game.away_team_name}</td>
              {quarters.map(q => (
                <td key={q} className="py-2 px-2 text-center text-slate-600 tabular-nums">{awayQ[q] || 0}</td>
              ))}
              <td className="py-2 px-2 text-center font-black text-slate-900 bg-slate-50 tabular-nums">{game.away_score}</td>
            </tr>
            <tr>
              <td className="py-2 px-2 font-bold text-slate-900 truncate max-w-[100px]">{game.home_team_name}</td>
              {quarters.map(q => (
                <td key={q} className="py-2 px-2 text-center text-slate-600 tabular-nums">{homeQ[q] || 0}</td>
              ))}
              <td className="py-2 px-2 text-center font-black text-slate-900 bg-slate-50 tabular-nums">{game.home_score}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Scoring plays */}
      {scoringPlays.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Scoring Plays</p>
          <div className="space-y-1.5">
            {scoringPlays.map((e, i) => {
              const pts = e.event_type === "touchdown" ? 6 : e.event_type === "field_goal" ? 3 : e.event_type === "safety" ? 2 : e.event_type === "two_point" ? 2 : 1;
              const label = e.event_type.replace("_", " ").toUpperCase();
              return (
                <div key={e.id || i} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${e.team === "home" ? "bg-red-50" : "bg-blue-50"}`}>
                  <span className="text-[10px] font-bold text-slate-400 w-6">{e.period}</span>
                  <span className={`text-xs font-bold ${e.team === "home" ? "text-red-700" : "text-blue-700"}`}>
                    {e.team === "home" ? game.home_team_name : game.away_team_name}
                  </span>
                  <span className="text-xs text-slate-600">
                    {label}{e.player_name ? ` — ${e.player_name}` : ""}
                  </span>
                  <span className="ml-auto text-xs font-black text-slate-900">+{pts}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "TDs", home: countEvents("home", "touchdown"), away: countEvents("away", "touchdown") },
          { label: "FGs", home: countEvents("home", "field_goal"), away: countEvents("away", "field_goal") },
          { label: "Penalties", home: countEvents("home", "penalty"), away: countEvents("away", "penalty") },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-50 rounded-lg py-2">
            <div className="flex items-center justify-center gap-3 text-sm font-black tabular-nums">
              <span className="text-red-700">{stat.home}</span>
              <span className="text-slate-300">|</span>
              <span className="text-blue-700">{stat.away}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
