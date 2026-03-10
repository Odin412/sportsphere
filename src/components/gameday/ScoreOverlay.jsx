import React, { useState, useEffect } from "react";
import { db } from "@/api/db";
import { getSportConfig, formatPeriodLabel } from "@/lib/sportScoringConfig";
import ScoreOverlayBaseball from "./ScoreOverlayBaseball";
import ScoreOverlayBasketball from "./ScoreOverlayBasketball";
import ScoreOverlaySoccer from "./ScoreOverlaySoccer";
import ScoreOverlayFootball from "./ScoreOverlayFootball";

/**
 * ScoreOverlay — transparent overlay on top of the video player.
 * Subscribes to real-time game updates via Supabase.
 *
 * Props:
 *  - game: the initial game object (from query)
 */
export default function ScoreOverlay({ game: initialGame }) {
  const [game, setGame] = useState(initialGame);
  const [recentEvent, setRecentEvent] = useState(null);

  // Keep in sync with prop updates
  useEffect(() => {
    setGame(initialGame);
  }, [initialGame]);

  // Subscribe to real-time game updates
  useEffect(() => {
    if (!game?.id) return;
    const sub = db.entities.Game.subscribeToChanges(
      { id: game.id },
      (payload) => {
        if (payload?.new) setGame(payload.new);
      }
    );
    return () => sub?.unsubscribe?.();
  }, [game?.id]);

  // Subscribe to game events for ticker
  useEffect(() => {
    if (!game?.id) return;
    const sub = db.entities.GameEvent.subscribeToChanges(
      { game_id: game.id },
      (payload) => {
        if (payload?.new) {
          setRecentEvent(payload.new);
          // Clear after 5 seconds
          setTimeout(() => setRecentEvent(null), 5000);
        }
      }
    );
    return () => sub?.unsubscribe?.();
  }, [game?.id]);

  if (!game || game.status === "scheduled" || game.status === "cancelled") return null;

  const sportConfig = getSportConfig(game.sport);
  const sport = game.sport?.toLowerCase();

  // Sport-specific overlay
  const overlayProps = { game, recentEvent, sportConfig };

  if (sport === "baseball" || sport === "softball") return <ScoreOverlayBaseball {...overlayProps} />;
  if (sport === "basketball") return <ScoreOverlayBasketball {...overlayProps} />;
  if (sport === "soccer") return <ScoreOverlaySoccer {...overlayProps} />;
  if (sport === "football") return <ScoreOverlayFootball {...overlayProps} />;

  // Generic fallback overlay
  return (
    <div className="absolute top-3 right-3 z-20 pointer-events-none">
      <div className="bg-black/80 backdrop-blur-sm rounded-xl px-4 py-2 text-white shadow-lg">
        <div className="flex items-center gap-3 text-sm font-bold">
          <span className="truncate max-w-[100px]">{game.home_team_name}</span>
          <span className="text-xl tabular-nums">{game.home_score}</span>
          <span className="text-slate-400 text-xs">-</span>
          <span className="text-xl tabular-nums">{game.away_score}</span>
          <span className="truncate max-w-[100px]">{game.away_team_name}</span>
        </div>
        {game.current_period && (
          <p className="text-center text-xs text-slate-300 mt-1">
            {formatPeriodLabel(game.current_period, game.sport)}
          </p>
        )}
      </div>
      {recentEvent && (
        <div className="mt-2 bg-yellow-500/90 rounded-lg px-3 py-1.5 text-xs font-bold text-black text-center animate-pulse">
          {recentEvent.description || `${recentEvent.event_type} — ${recentEvent.team === "home" ? game.home_team_name : game.away_team_name}`}
        </div>
      )}
    </div>
  );
}
