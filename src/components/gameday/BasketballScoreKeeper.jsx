import React, { useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * Basketball ScoreKeeper — quick score buttons, foul tracker, timeout counter, clock.
 */
export default function BasketballScoreKeeper({ game, recordEvent, updateConfig, advancePeriod }) {
  const [playerName, setPlayerName] = useState("");
  const [activeTeam, setActiveTeam] = useState("home");
  const config = game.game_config || {};
  const period = game.current_period || "Q1";

  const homeFouls = config.home_fouls || 0;
  const awayFouls = config.away_fouls || 0;
  const homeTimeouts = config.home_timeouts || 0;
  const awayTimeouts = config.away_timeouts || 0;

  const teamName = activeTeam === "home" ? game.home_team_name : game.away_team_name;

  const score = (points, eventType) => {
    recordEvent({
      event_type: eventType,
      team: activeTeam,
      player_name: playerName || null,
      points,
      is_highlight: points === 3,
      description: `${points}PT${playerName ? ` — ${playerName}` : ""} (${teamName})`,
    });
    setPlayerName("");
  };

  const logEvent = (eventType, description) => {
    recordEvent({
      event_type: eventType,
      team: activeTeam,
      player_name: playerName || null,
      points: 0,
      description: description || `${eventType} (${teamName})`,
    });
    setPlayerName("");
  };

  const nextPeriod = () => {
    const qNum = parseInt(period.replace("Q", "").replace("OT", "0"));
    const next = period === "OT" ? "OT2" : period.startsWith("OT") ? `OT${parseInt(period.replace("OT", "")) + 1}` : qNum >= 4 ? "OT" : `Q${qNum + 1}`;
    advancePeriod(next);
    // Reset period fouls
    updateConfig({ home_fouls: 0, away_fouls: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Period + Next */}
      <div className="flex items-center justify-between">
        <span className="text-yellow-400 font-black text-lg">{period}</span>
        <button
          onClick={nextPeriod}
          className="text-xs text-slate-400 hover:text-white font-bold px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700"
        >
          Next Period →
        </button>
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

      {/* Score buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => score(1, "ft")} className="py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-xl">+1</button>
        <button onClick={() => score(2, "2pt")} className="py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xl">+2</button>
        <button onClick={() => score(3, "3pt")} className="py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xl">+3</button>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => {
            const key = activeTeam === "home" ? "home_fouls" : "away_fouls";
            const current = activeTeam === "home" ? homeFouls : awayFouls;
            updateConfig({ [key]: current + 1 });
            logEvent("foul", `Foul on ${teamName} (${current + 1} total)`);
          }}
          className="py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold"
        >
          Foul ({activeTeam === "home" ? homeFouls : awayFouls})
        </button>
        <button onClick={() => logEvent("turnover")} className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Turnover</button>
        <button onClick={() => logEvent("steal")} className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Steal</button>
        <button onClick={() => logEvent("block")} className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Block</button>
        <button
          onClick={() => {
            const key = activeTeam === "home" ? "home_timeouts" : "away_timeouts";
            const current = activeTeam === "home" ? homeTimeouts : awayTimeouts;
            updateConfig({ [key]: current + 1 });
            logEvent("timeout", `Timeout ${teamName}`);
          }}
          className="py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold"
        >
          TO ({activeTeam === "home" ? homeTimeouts : awayTimeouts})
        </button>
        <button onClick={() => logEvent("rebound")} className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Rebound</button>
        <button onClick={() => logEvent("assist")} className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Assist</button>
        <button onClick={() => logEvent("substitution")} className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Sub</button>
      </div>
    </div>
  );
}
