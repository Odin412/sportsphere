import React from "react";

/**
 * Baseball box score — traditional 9-inning grid with R/H/E totals.
 */
export default function BoxScoreBaseball({ game, scores, events }) {
  const innings = 9;
  const inningHeaders = Array.from({ length: innings }, (_, i) => i + 1);

  // Calculate runs per inning from score_update events
  const getInningRuns = (team) => {
    const runs = {};
    const scoreUpdates = (scores || [])
      .filter(s => s.event_type === "score_update")
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    let prev = 0;
    for (const s of scoreUpdates) {
      const inning = s.period?.match(/[TB](\d+)/)?.[1];
      if (!inning) continue;
      const teamScore = team === "home" ? s.home_score : s.away_score;
      const diff = teamScore - prev;
      if (diff > 0 && s.period?.startsWith(team === "away" ? "T" : "B")) {
        runs[inning] = (runs[inning] || 0) + diff;
      }
      prev = teamScore;
    }
    return runs;
  };

  // Count events by type
  const countEvents = (team, type) => {
    return (events || []).filter(e => e.team === team && e.event_type === type).length;
  };

  const awayRuns = getInningRuns("away");
  const homeRuns = getInningRuns("home");

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 px-2 font-bold text-slate-500 w-24">Team</th>
            {inningHeaders.map(i => (
              <th key={i} className="py-2 px-1.5 font-bold text-slate-400 text-center w-7">{i}</th>
            ))}
            <th className="py-2 px-2 font-black text-slate-700 text-center bg-slate-50">R</th>
            <th className="py-2 px-2 font-black text-slate-700 text-center bg-slate-50">H</th>
            <th className="py-2 px-2 font-black text-slate-700 text-center bg-slate-50">E</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-100">
            <td className="py-2 px-2 font-bold text-slate-900 truncate max-w-[100px]">{game.away_team_name}</td>
            {inningHeaders.map(i => (
              <td key={i} className="py-2 px-1.5 text-center text-slate-600 tabular-nums">
                {awayRuns[i] ?? (i <= parseInt(game.current_period?.match(/\d+/)?.[0] || innings) ? "0" : "")}
              </td>
            ))}
            <td className="py-2 px-2 text-center font-black text-slate-900 bg-slate-50 tabular-nums">{game.away_score}</td>
            <td className="py-2 px-2 text-center font-bold text-slate-700 bg-slate-50 tabular-nums">{countEvents("away", "hit") + countEvents("away", "double") + countEvents("away", "triple") + countEvents("away", "home_run")}</td>
            <td className="py-2 px-2 text-center font-bold text-slate-700 bg-slate-50 tabular-nums">{countEvents("away", "error")}</td>
          </tr>
          <tr>
            <td className="py-2 px-2 font-bold text-slate-900 truncate max-w-[100px]">{game.home_team_name}</td>
            {inningHeaders.map(i => (
              <td key={i} className="py-2 px-1.5 text-center text-slate-600 tabular-nums">
                {homeRuns[i] ?? (i <= parseInt(game.current_period?.match(/\d+/)?.[0] || innings) ? "0" : "")}
              </td>
            ))}
            <td className="py-2 px-2 text-center font-black text-slate-900 bg-slate-50 tabular-nums">{game.home_score}</td>
            <td className="py-2 px-2 text-center font-bold text-slate-700 bg-slate-50 tabular-nums">{countEvents("home", "hit") + countEvents("home", "double") + countEvents("home", "triple") + countEvents("home", "home_run")}</td>
            <td className="py-2 px-2 text-center font-bold text-slate-700 bg-slate-50 tabular-nums">{countEvents("home", "error")}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
