import React, { useState } from "react";
import { Input } from "@/components/ui/input";

/**
 * Baseball ScoreKeeper — innings, count (B/S/O), runners, play events.
 */
export default function BaseballScoreKeeper({ game, recordEvent, updateConfig, advancePeriod }) {
  const [playerName, setPlayerName] = useState("");
  const config = game.game_config || {};
  const period = game.current_period || "T1";
  const match = period.match(/^(T|B)(\d+)$/);
  const isTop = match ? match[1] === "T" : true;
  const inningNum = match ? parseInt(match[2]) : 1;
  const battingTeam = isTop ? "away" : "home";

  const balls = config.balls || 0;
  const strikes = config.strikes || 0;
  const outs = config.outs || 0;
  const bases = config.bases || [false, false, false];

  const resetCount = () => updateConfig({ balls: 0, strikes: 0 });

  const addOut = async () => {
    const newOuts = outs + 1;
    if (newOuts >= 3) {
      // Side retired — advance half inning
      const nextPeriod = isTop ? `B${inningNum}` : `T${inningNum + 1}`;
      await updateConfig({ balls: 0, strikes: 0, outs: 0, bases: [false, false, false] });
      await advancePeriod(nextPeriod);
    } else {
      await updateConfig({ outs: newOuts, balls: 0, strikes: 0 });
    }
  };

  const handleEvent = (eventType, opts = {}) => {
    const isHighlight = ["home_run", "triple", "run"].includes(eventType);
    recordEvent({
      event_type: eventType,
      team: battingTeam,
      player_name: playerName || null,
      points: opts.points || 0,
      is_highlight: isHighlight,
      details: opts.details || {},
      description: opts.description || `${eventType}${playerName ? ` by ${playerName}` : ""}`,
    });
    if (opts.resetCount !== false) resetCount();
    setPlayerName("");
  };

  return (
    <div className="space-y-4">
      {/* Inning indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-black text-lg">{isTop ? "▲" : "▼"}</span>
          <span className="text-white font-black text-lg">Inning {inningNum}</span>
        </div>
        <span className="text-slate-400 text-sm font-bold">
          {battingTeam === "home" ? game.home_team_name : game.away_team_name} batting
        </span>
      </div>

      {/* Count display: B-S-O */}
      <div className="flex items-center justify-center gap-6 bg-slate-800 rounded-xl p-3">
        <div className="text-center">
          <p className="text-slate-400 text-[10px] font-bold">BALLS</p>
          <div className="flex gap-1 mt-1">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full ${i < balls ? "bg-green-400" : "bg-slate-600"}`} />
            ))}
          </div>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-[10px] font-bold">STRIKES</p>
          <div className="flex gap-1 mt-1">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full ${i < strikes ? "bg-yellow-400" : "bg-slate-600"}`} />
            ))}
          </div>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-[10px] font-bold">OUTS</p>
          <div className="flex gap-1 mt-1">
            {[0, 1, 2].map(i => (
              <div key={i} className={`w-4 h-4 rounded-full ${i < outs ? "bg-red-400" : "bg-slate-600"}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Bases diamond */}
      <div className="flex justify-center">
        <div className="relative w-20 h-20">
          <button
            onClick={() => updateConfig({ bases: [bases[0], !bases[1], bases[2]] })}
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 rounded-sm border-2 ${bases[1] ? "bg-yellow-400 border-yellow-400" : "bg-slate-700 border-slate-500"}`}
            title="2nd base"
          />
          <button
            onClick={() => updateConfig({ bases: [bases[0], bases[1], !bases[2]] })}
            className={`absolute top-1/2 left-0 -translate-y-1/2 w-6 h-6 rotate-45 rounded-sm border-2 ${bases[2] ? "bg-yellow-400 border-yellow-400" : "bg-slate-700 border-slate-500"}`}
            title="3rd base"
          />
          <button
            onClick={() => updateConfig({ bases: [!bases[0], bases[1], bases[2]] })}
            className={`absolute top-1/2 right-0 -translate-y-1/2 w-6 h-6 rotate-45 rounded-sm border-2 ${bases[0] ? "bg-yellow-400 border-yellow-400" : "bg-slate-700 border-slate-500"}`}
            title="1st base"
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-5 rotate-45 bg-white/20 border-2 border-white/30 rounded-sm" />
        </div>
      </div>

      {/* Player name quick input */}
      <Input
        value={playerName}
        onChange={e => setPlayerName(e.target.value)}
        placeholder="Player name (optional)"
        className="rounded-xl bg-slate-800 border-slate-600 text-white text-sm"
      />

      {/* Count buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            const newBalls = balls + 1;
            if (newBalls >= 4) {
              handleEvent("walk", { description: `Walk${playerName ? ` — ${playerName}` : ""}` });
              updateConfig({ balls: 0, strikes: 0 });
            } else {
              updateConfig({ balls: newBalls });
            }
          }}
          className="py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-sm"
        >
          Ball
        </button>
        <button
          onClick={() => {
            const newStrikes = strikes + 1;
            if (newStrikes >= 3) {
              handleEvent("strikeout", { description: `Strikeout${playerName ? ` — ${playerName}` : ""}` });
              addOut();
            } else {
              updateConfig({ strikes: newStrikes });
            }
          }}
          className="py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-sm"
        >
          Strike
        </button>
        <button
          onClick={() => addOut()}
          className="py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm"
        >
          Out
        </button>
      </div>

      {/* Play event buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => handleEvent("hit")} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Hit</button>
        <button onClick={() => handleEvent("double")} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Double</button>
        <button onClick={() => handleEvent("triple")} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Triple</button>
        <button onClick={() => handleEvent("home_run", { points: 1 })} className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold">Home Run</button>
        <button onClick={() => handleEvent("run", { points: 1 })} className="py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold">+ Run</button>
        <button onClick={() => handleEvent("error")} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Error</button>
        <button onClick={() => handleEvent("stolen_base")} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Stolen Base</button>
        <button onClick={() => handleEvent("rbi", { resetCount: false })} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">RBI</button>
        <button onClick={() => handleEvent("hit_by_pitch")} className="py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">HBP</button>
      </div>
    </div>
  );
}
