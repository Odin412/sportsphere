import React from "react";

/**
 * Basketball box score — quarter-by-quarter scoring with top performers.
 */
export default function BoxScoreBasketball({ game, scores, events }) {
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  // Check for overtime
  const hasOT = (scores || []).some(s => s.period?.startsWith("OT"));
  if (hasOT) quarters.push("OT");

  // Get score at end of each quarter from score logs
  const getQuarterScores = (team) => {
    const result = {};
    const sorted = (scores || [])
      .filter(s => s.event_type === "score_update" || s.event_type === "period_end")
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let prevScore = 0;
    let currentPeriod = "Q1";
    for (const s of sorted) {
      if (s.period !== currentPeriod) {
        // Period changed — record previous period final
        const teamScore = team === "home" ? s.home_score : s.away_score;
        result[currentPeriod] = teamScore - prevScore;
        prevScore = teamScore;
        currentPeriod = s.period;
      }
    }
    // Last period
    const totalScore = team === "home" ? game.home_score : game.away_score;
    result[currentPeriod] = totalScore - prevScore;
    return result;
  };

  const homeQ = getQuarterScores("home");
  const awayQ = getQuarterScores("away");

  // Top scorers from events
  const playerScores = {};
  (events || []).forEach(e => {
    if (["2pt", "3pt", "ft"].includes(e.event_type) && e.player_name) {
      const key = `${e.team}:${e.player_name}`;
      const pts = e.event_type === "3pt" ? 3 : e.event_type === "2pt" ? 2 : 1;
      playerScores[key] = (playerScores[key] || { name: e.player_name, team: e.team, pts: 0 });
      playerScores[key].pts += pts;
    }
  });
  const topScorers = Object.values(playerScores).sort((a, b) => b.pts - a.pts).slice(0, 4);

  return (
    <div className="space-y-4">
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

      {topScorers.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Top Scorers</p>
          <div className="grid grid-cols-2 gap-2">
            {topScorers.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-xs font-bold text-slate-700">{p.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold ${p.team === "home" ? "text-red-600" : "text-blue-600"}`}>
                    {p.team === "home" ? game.home_team_name : game.away_team_name}
                  </span>
                  <span className="text-sm font-black text-slate-900">{p.pts}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
