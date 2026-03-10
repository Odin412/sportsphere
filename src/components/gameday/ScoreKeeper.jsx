import React, { useState, useEffect } from "react";
import { db } from "@/api/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSportConfig } from "@/lib/sportScoringConfig";
import BaseballScoreKeeper from "./BaseballScoreKeeper";
import BasketballScoreKeeper from "./BasketballScoreKeeper";
import SoccerScoreKeeper from "./SoccerScoreKeeper";
import FootballScoreKeeper from "./FootballScoreKeeper";
import { Button } from "@/components/ui/button";
import { X, Trophy } from "lucide-react";
import { toast } from "sonner";

/**
 * ScoreKeeper — coach-facing scoring interface.
 * Routes to sport-specific variant based on game.sport.
 *
 * Props:
 *  - gameId: UUID of the game
 *  - user: authenticated user object
 *  - onClose: callback to close the scorekeeper panel
 */
export default function ScoreKeeper({ gameId, user, onClose }) {
  const queryClient = useQueryClient();
  const [endingGame, setEndingGame] = useState(false);

  const { data: game, isLoading } = useQuery({
    queryKey: ["scorekeeper-game", gameId],
    queryFn: async () => {
      const games = await db.entities.Game.filter({ id: gameId });
      return games[0] || null;
    },
    enabled: !!gameId,
    refetchInterval: 3000,
  });

  // Common handler: record a game event + update score
  const recordEvent = async ({ event_type, team, player_name, player_email, details, description, points = 0, is_highlight = false }) => {
    if (!game) return;

    // Create game event
    const streamTimestamp = game.started_at
      ? Math.floor((Date.now() - new Date(game.started_at).getTime()) / 1000)
      : null;

    await db.entities.GameEvent.create({
      game_id: game.id,
      event_type,
      period: game.current_period,
      game_clock: game.game_config?.game_clock || null,
      stream_timestamp_seconds: streamTimestamp,
      player_name: player_name || null,
      player_email: player_email || null,
      team,
      details: details || {},
      is_highlight,
      recorded_by_email: user.email,
    });

    // Update score if points scored
    if (points > 0 && team) {
      const updates = {};
      if (team === "home") updates.home_score = (game.home_score || 0) + points;
      if (team === "away") updates.away_score = (game.away_score || 0) + points;
      await db.entities.Game.update(game.id, updates);

      // Append score log
      await db.entities.GameScore.create({
        game_id: game.id,
        period: game.current_period,
        home_score: team === "home" ? (game.home_score || 0) + points : game.home_score || 0,
        away_score: team === "away" ? (game.away_score || 0) + points : game.away_score || 0,
        event_type: "score_update",
        description: description || `${event_type} by ${team}`,
        recorded_by_email: user.email,
      });
    }

    queryClient.invalidateQueries({ queryKey: ["scorekeeper-game", gameId] });
  };

  // Update game config (e.g., balls/strikes/outs, clock, downs)
  const updateConfig = async (configUpdates) => {
    if (!game) return;
    const newConfig = { ...(game.game_config || {}), ...configUpdates };
    await db.entities.Game.update(game.id, { game_config: newConfig });
    queryClient.invalidateQueries({ queryKey: ["scorekeeper-game", gameId] });
  };

  // Advance period
  const advancePeriod = async (newPeriod) => {
    if (!game) return;
    await db.entities.Game.update(game.id, { current_period: newPeriod });
    await db.entities.GameScore.create({
      game_id: game.id,
      period: newPeriod,
      home_score: game.home_score,
      away_score: game.away_score,
      event_type: "period_start",
      description: `Period started: ${newPeriod}`,
      recorded_by_email: user.email,
    });
    queryClient.invalidateQueries({ queryKey: ["scorekeeper-game", gameId] });
  };

  // End game
  const endGame = async () => {
    if (!game || endingGame) return;
    setEndingGame(true);
    try {
      await db.entities.Game.update(game.id, { status: "final" });
      await db.entities.GameScore.create({
        game_id: game.id,
        period: game.current_period,
        home_score: game.home_score,
        away_score: game.away_score,
        event_type: "game_end",
        description: `Final: ${game.home_team_name} ${game.home_score} - ${game.away_team_name} ${game.away_score}`,
        recorded_by_email: user.email,
      });
      toast.success("Game ended! Recap will be generated shortly.");
      onClose?.();
    } catch (err) {
      toast.error("Failed to end game");
    }
    setEndingGame(false);
  };

  if (isLoading || !game) {
    return (
      <div className="bg-slate-900 rounded-2xl p-6 text-center text-slate-400">
        Loading scorekeeper...
      </div>
    );
  }

  const sport = game.sport?.toLowerCase();
  const commonProps = {
    game,
    user,
    recordEvent,
    updateConfig,
    advancePeriod,
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800 flex items-center justify-between">
        <div>
          <p className="text-white text-sm font-black">
            {game.home_team_name} {game.home_score} — {game.away_score} {game.away_team_name}
          </p>
          <p className="text-slate-400 text-xs">Scorekeeper Mode</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={endGame}
            disabled={endingGame}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold gap-1"
          >
            <Trophy className="w-3 h-3" /> End Game
          </Button>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sport-specific scorer */}
      <div className="p-4">
        {(sport === "baseball" || sport === "softball") && <BaseballScoreKeeper {...commonProps} />}
        {sport === "basketball" && <BasketballScoreKeeper {...commonProps} />}
        {sport === "soccer" && <SoccerScoreKeeper {...commonProps} />}
        {sport === "football" && <FootballScoreKeeper {...commonProps} />}
        {!["baseball", "softball", "basketball", "soccer", "football"].includes(sport) && (
          <GenericScoreKeeper {...commonProps} />
        )}
      </div>
    </div>
  );
}

// Fallback for unsupported sports
function GenericScoreKeeper({ game, recordEvent }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-white text-xs font-bold mb-2">{game.home_team_name}</p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => recordEvent({ event_type: "score", team: "home", points: 1 })}
              className="w-12 h-12 rounded-xl bg-green-600 hover:bg-green-500 text-white font-black text-lg"
            >
              +1
            </button>
          </div>
        </div>
        <div className="text-center">
          <p className="text-white text-xs font-bold mb-2">{game.away_team_name}</p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => recordEvent({ event_type: "score", team: "away", points: 1 })}
              className="w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg"
            >
              +1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
