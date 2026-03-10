import React, { useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * Soccer ScoreKeeper — goal entry with scorer/assist, card tracker, substitutions.
 */
export default function SoccerScoreKeeper({ game, recordEvent, updateConfig, advancePeriod }) {
  const [playerName, setPlayerName] = useState("");
  const [assistName, setAssistName] = useState("");
  const [activeTeam, setActiveTeam] = useState("home");
  const config = game.game_config || {};
  const period = game.current_period || "H1";

  const homeYellow = config.home_yellow_cards || 0;
  const awayYellow = config.away_yellow_cards || 0;
  const homeRed = config.home_red_cards || 0;
  const awayRed = config.away_red_cards || 0;

  const teamName = activeTeam === "home" ? game.home_team_name : game.away_team_name;

  const logGoal = () => {
    recordEvent({
      event_type: "goal",
      team: activeTeam,
      player_name: playerName || null,
      points: 1,
      is_highlight: true,
      details: { assist: assistName || null },
      description: `GOAL${playerName ? ` — ${playerName}` : ""}${assistName ? ` (assist: ${assistName})` : ""} (${teamName})`,
    });
    setPlayerName("");
    setAssistName("");
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

  const nextPeriod = () => {
    const next = period === "H1" ? "H2" : period === "H2" ? "OT" : period === "OT" ? "ET" : "PK";
    advancePeriod(next);
  };

  return (
    <div className="space-y-4">
      {/* Period */}
      <div className="flex items-center justify-between">
        <span className="text-yellow-400 font-black text-lg">
          {period === "H1" ? "1st Half" : period === "H2" ? "2nd Half" : period === "OT" ? "Overtime" : period === "ET" ? "Extra Time" : period}
        </span>
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
          <div className="flex items-center justify-center gap-2 mt-1 text-[10px]">
            {homeYellow > 0 && <span className="text-yellow-400">🟨{homeYellow}</span>}
            {homeRed > 0 && <span className="text-red-400">🟥{homeRed}</span>}
          </div>
        </button>
        <button
          onClick={() => setActiveTeam("away")}
          className={`py-3 rounded-xl text-sm font-black transition-all ${
            activeTeam === "away" ? "bg-blue-600 text-white ring-2 ring-blue-400" : "bg-slate-800 text-slate-300"
          }`}
        >
          {game.away_team_name}
          <span className="block text-2xl mt-0.5">{game.away_score}</span>
          <div className="flex items-center justify-center gap-2 mt-1 text-[10px]">
            {awayYellow > 0 && <span className="text-yellow-400">🟨{awayYellow}</span>}
            {awayRed > 0 && <span className="text-red-400">🟥{awayRed}</span>}
          </div>
        </button>
      </div>

      {/* Player + Assist inputs */}
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          placeholder="Player name"
          className="rounded-xl bg-slate-800 border-slate-600 text-white text-sm"
        />
        <Input
          value={assistName}
          onChange={e => setAssistName(e.target.value)}
          placeholder="Assist (optional)"
          className="rounded-xl bg-slate-800 border-slate-600 text-white text-sm"
        />
      </div>

      {/* Goal button */}
      <button
        onClick={logGoal}
        className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-xl"
      >
        GOAL +1
      </button>

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            const key = activeTeam === "home" ? "home_yellow_cards" : "away_yellow_cards";
            const current = activeTeam === "home" ? homeYellow : awayYellow;
            updateConfig({ [key]: current + 1 });
            logEvent("yellow_card", { description: `Yellow Card${playerName ? ` — ${playerName}` : ""} (${teamName})` });
          }}
          className="py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold"
        >
          Yellow Card
        </button>
        <button
          onClick={() => {
            const key = activeTeam === "home" ? "home_red_cards" : "away_red_cards";
            const current = activeTeam === "home" ? homeRed : awayRed;
            updateConfig({ [key]: current + 1 });
            logEvent("red_card", { highlight: true, description: `Red Card${playerName ? ` — ${playerName}` : ""} (${teamName})` });
          }}
          className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
        >
          Red Card
        </button>
        <button onClick={() => logEvent("penalty", { highlight: true })} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Penalty</button>
        <button onClick={() => logEvent("corner")} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Corner</button>
        <button onClick={() => logEvent("offside")} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Offside</button>
        <button onClick={() => logEvent("substitution")} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Sub</button>
        <button onClick={() => logEvent("save")} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Save</button>
        <button onClick={() => logEvent("free_kick")} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Free Kick</button>
        <button onClick={() => logEvent("shot_on_target")} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Shot on Target</button>
      </div>
    </div>
  );
}
