import React, { useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * Football ScoreKeeper — TD/FG/XP/safety, downs tracker, possession indicator.
 */
export default function FootballScoreKeeper({ game, recordEvent, updateConfig, advancePeriod }) {
  const [playerName, setPlayerName] = useState("");
  const [activeTeam, setActiveTeam] = useState("home");
  const config = game.game_config || {};
  const period = game.current_period || "Q1";

  const down = config.down || 1;
  const distance = config.distance || 10;
  const possession = config.possession || "home";

  const teamName = activeTeam === "home" ? game.home_team_name : game.away_team_name;
  const downSuffix = down === 1 ? "st" : down === 2 ? "nd" : down === 3 ? "rd" : "th";

  const logScore = (eventType, points) => {
    recordEvent({
      event_type: eventType,
      team: activeTeam,
      player_name: playerName || null,
      points,
      is_highlight: ["touchdown", "field_goal", "safety", "interception"].includes(eventType),
      description: `${eventType.replace("_", " ").toUpperCase()}${playerName ? ` — ${playerName}` : ""} (${teamName})`,
    });
    setPlayerName("");
  };

  const logEvent = (eventType, opts = {}) => {
    recordEvent({
      event_type: eventType,
      team: activeTeam,
      player_name: playerName || null,
      points: 0,
      is_highlight: opts.highlight || false,
      description: opts.description || `${eventType} (${teamName})${playerName ? ` — ${playerName}` : ""}`,
    });
    setPlayerName("");
  };

  const nextDown = () => {
    if (down >= 4) {
      // Turnover on downs
      const newPossession = possession === "home" ? "away" : "home";
      updateConfig({ down: 1, distance: 10, possession: newPossession });
    } else {
      updateConfig({ down: down + 1 });
    }
  };

  const firstDown = () => {
    updateConfig({ down: 1, distance: 10 });
  };

  const changePossession = () => {
    const newPossession = possession === "home" ? "away" : "home";
    updateConfig({ down: 1, distance: 10, possession: newPossession });
    setActiveTeam(newPossession);
  };

  const nextPeriod = () => {
    const qNum = parseInt(period.replace("Q", "").replace("OT", "0"));
    const next = period === "OT" ? "OT2" : period.startsWith("OT") ? `OT${parseInt(period.replace("OT", "")) + 1}` : qNum >= 4 ? "OT" : `Q${qNum + 1}`;
    advancePeriod(next);
  };

  return (
    <div className="space-y-4">
      {/* Period */}
      <div className="flex items-center justify-between">
        <span className="text-yellow-400 font-black text-lg">{period}</span>
        <button
          onClick={nextPeriod}
          className="text-xs text-slate-400 hover:text-white font-bold px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700"
        >
          Next Quarter →
        </button>
      </div>

      {/* Down & Distance */}
      <div className="bg-slate-800 rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-yellow-300 text-sm font-black">{down}{downSuffix} & {distance}</p>
          <p className="text-slate-400 text-[10px] mt-0.5">
            Possession: {possession === "home" ? game.home_team_name : game.away_team_name}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={firstDown} className="px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white text-[10px] font-bold">1st Down</button>
          <button onClick={nextDown} className="px-2.5 py-1 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-[10px] font-bold">Next Down</button>
          <button onClick={changePossession} className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold">Turnover</button>
        </div>
      </div>

      {/* Team selector */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveTeam("home")}
          className={`py-3 rounded-xl text-sm font-black transition-all ${
            activeTeam === "home" ? "bg-red-600 text-white ring-2 ring-red-400" : "bg-slate-800 text-slate-300"
          }`}
        >
          {game.home_team_name}
          <span className="block text-2xl mt-0.5">{game.home_score}</span>
        </button>
        <button
          onClick={() => setActiveTeam("away")}
          className={`py-3 rounded-xl text-sm font-black transition-all ${
            activeTeam === "away" ? "bg-blue-600 text-white ring-2 ring-blue-400" : "bg-slate-800 text-slate-300"
          }`}
        >
          {game.away_team_name}
          <span className="block text-2xl mt-0.5">{game.away_score}</span>
        </button>
      </div>

      {/* Player name */}
      <Input
        value={playerName}
        onChange={e => setPlayerName(e.target.value)}
        placeholder="Player name (optional)"
        className="rounded-xl bg-slate-800 border-slate-600 text-white text-sm"
      />

      {/* Scoring buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => logScore("touchdown", 6)} className="py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-sm">TD +6</button>
        <button onClick={() => logScore("field_goal", 3)} className="py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm">FG +3</button>
        <button onClick={() => logScore("extra_point", 1)} className="py-3 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-black text-sm">XP +1</button>
        <button onClick={() => logScore("two_point", 2)} className="py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm">2PT +2</button>
        <button onClick={() => logScore("safety", 2)} className="py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-black text-sm">Safety +2</button>
        <button onClick={() => logEvent("penalty")} className="py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-xs">Penalty</button>
      </div>

      {/* Other events */}
      <div className="grid grid-cols-4 gap-2">
        <button onClick={() => logEvent("interception", { highlight: true })} className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">INT</button>
        <button onClick={() => logEvent("fumble", { highlight: true })} className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Fumble</button>
        <button onClick={() => logEvent("sack")} className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Sack</button>
        <button
          onClick={() => {
            const key = activeTeam === "home" ? "home_timeouts" : "away_timeouts";
            const current = config[key] || 0;
            updateConfig({ [key]: current + 1 });
            logEvent("timeout");
          }}
          className="py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold"
        >
          Timeout
        </button>
      </div>
    </div>
  );
}
