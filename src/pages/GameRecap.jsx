import React, { useState, useEffect } from "react";
import { db } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trophy, Play, Clock, MapPin, Loader2, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import MuxPlayer from "@/components/live/MuxPlayer";
import BoxScoreBaseball from "@/components/gameday/BoxScoreBaseball";
import BoxScoreBasketball from "@/components/gameday/BoxScoreBasketball";
import BoxScoreSoccer from "@/components/gameday/BoxScoreSoccer";
import BoxScoreFootball from "@/components/gameday/BoxScoreFootball";

export default function GameRecap() {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get("id");

  const { data: game, isLoading } = useQuery({
    queryKey: ["game-recap", gameId],
    queryFn: async () => {
      const games = await db.entities.Game.filter({ id: gameId });
      return games[0] || null;
    },
    enabled: !!gameId,
  });

  const { data: events } = useQuery({
    queryKey: ["game-recap-events", gameId],
    queryFn: () => db.entities.GameEvent.filter({ game_id: gameId }),
    enabled: !!gameId,
  });

  const { data: scores } = useQuery({
    queryKey: ["game-recap-scores", gameId],
    queryFn: () => db.entities.GameScore.filter({ game_id: gameId }),
    enabled: !!gameId,
  });

  const [showFullReplay, setShowFullReplay] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 text-lg">Game not found</p>
        <Link to={createPageUrl("GameDay")} className="text-red-600 mt-3 inline-block font-semibold">
          ← Back to GameDay
        </Link>
      </div>
    );
  }

  const sport = game.sport?.toLowerCase();
  const highlights = events?.filter(e => e.is_highlight) || [];
  const highlightClips = game.highlight_clips || [];
  const winner = game.home_score > game.away_score ? "home" : game.away_score > game.home_score ? "away" : "tie";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50"
    >
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Back */}
        <Link to={createPageUrl("GameDay")} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to GameDay
        </Link>

        {/* Final Score Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 text-white text-center">
          <Badge className="bg-green-500/20 text-green-300 border-0 text-xs font-bold mb-4">FINAL</Badge>

          <div className="flex items-center justify-center gap-6 md:gap-10 mb-4">
            <div className={`text-center ${winner === "home" ? "opacity-100" : "opacity-70"}`}>
              <p className="text-lg md:text-xl font-black">{game.home_team_name}</p>
              {winner === "home" && <Trophy className="w-5 h-5 text-yellow-400 mx-auto mt-1" />}
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-5 py-3">
              <span className="text-4xl md:text-5xl font-black tabular-nums">{game.home_score}</span>
              <span className="text-slate-400 text-xl">-</span>
              <span className="text-4xl md:text-5xl font-black tabular-nums">{game.away_score}</span>
            </div>
            <div className={`text-center ${winner === "away" ? "opacity-100" : "opacity-70"}`}>
              <p className="text-lg md:text-xl font-black">{game.away_team_name}</p>
              {winner === "away" && <Trophy className="w-5 h-5 text-yellow-400 mx-auto mt-1" />}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-slate-400 text-xs">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(game.scheduled_at).toLocaleDateString()}</span>
            {game.sport && <Badge className="bg-white/10 text-white border-0 text-[10px]">{game.sport}</Badge>}
            {game.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {game.venue}</span>}
          </div>
        </div>

        {/* Box Score */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-black text-slate-900 text-sm">Box Score</h2>
          </div>
          <div className="p-4">
            {(sport === "baseball" || sport === "softball") && <BoxScoreBaseball game={game} scores={scores} events={events} />}
            {sport === "basketball" && <BoxScoreBasketball game={game} scores={scores} events={events} />}
            {sport === "soccer" && <BoxScoreSoccer game={game} scores={scores} events={events} />}
            {sport === "football" && <BoxScoreFootball game={game} scores={scores} events={events} />}
            {!["baseball", "softball", "basketball", "soccer", "football"].includes(sport) && (
              <div className="text-center py-4 text-slate-400 text-sm">Box score not available for this sport</div>
            )}
          </div>
        </div>

        {/* Highlight Clips */}
        {(highlightClips.length > 0 || highlights.length > 0) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-black text-slate-900 text-sm">Highlights</h2>
            </div>
            <div className="p-4">
              {highlightClips.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {highlightClips.map((clip, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl overflow-hidden">
                      {clip.playback_id ? (
                        <div className="aspect-video">
                          <MuxPlayer playbackId={clip.playback_id} streamType="on-demand" autoPlay={false} muted={false} />
                        </div>
                      ) : (
                        <div className="aspect-video bg-slate-200 flex items-center justify-center">
                          <Play className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      <div className="p-2 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{clip.description || `Highlight ${i + 1}`}</p>
                          {clip.time && <p className="text-[10px] text-slate-500">{clip.time}</p>}
                        </div>
                        {clip.playback_id && (
                          <button
                            onClick={async () => {
                              try {
                                await db.functions.invoke("auto-post-highlight", {
                                  clip_playback_id: clip.playback_id,
                                  stream_title: `${game.home_team_name} vs ${game.away_team_name}`,
                                  sport: game.sport || "",
                                  game_id: gameId,
                                });
                                toast.success("Highlight shared as Hype Reel!");
                              } catch {
                                toast.error("Failed to share highlight");
                              }
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            <Share2 className="w-3 h-3" /> Share as Reel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {highlights.map(e => (
                    <div key={e.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {e.event_type}{e.player_name ? ` — ${e.player_name}` : ""}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {e.period} {e.team === "home" ? game.home_team_name : game.away_team_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Game Recap */}
        {game.ai_recap && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-black text-slate-900 text-sm">Game Summary</h2>
            </div>
            <div className="p-6">
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{game.ai_recap}</p>
            </div>
          </div>
        )}

        {/* Full Replay */}
        {game.mux_playback_id && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="font-black text-slate-900 text-sm">Full Replay</h2>
              <Button
                onClick={() => setShowFullReplay(!showFullReplay)}
                size="sm"
                variant="outline"
                className="rounded-lg text-xs font-bold"
              >
                <Play className="w-3 h-3 mr-1" /> {showFullReplay ? "Hide" : "Watch"}
              </Button>
            </div>
            {showFullReplay && (
              <div className="aspect-video">
                <MuxPlayer
                  playbackId={game.mux_playback_id}
                  streamType="on-demand"
                  autoPlay={false}
                  muted={false}
                />
              </div>
            )}
          </div>
        )}

        {/* Key Events Timeline */}
        {events?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-black text-slate-900 text-sm">Play-by-Play</h2>
            </div>
            <div className="p-4 space-y-1 max-h-96 overflow-y-auto">
              {events
                .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .map(e => (
                  <div key={e.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-slate-50 text-xs">
                    <span className="text-slate-400 font-mono w-8 text-right flex-shrink-0">{e.period}</span>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${e.is_highlight ? "bg-amber-400" : "bg-slate-300"}`} />
                    <span className={`font-bold ${e.team === "home" ? "text-red-700" : "text-blue-700"}`}>
                      {e.team === "home" ? game.home_team_name : game.away_team_name}
                    </span>
                    <span className="text-slate-700">
                      {e.event_type}{e.player_name ? ` — ${e.player_name}` : ""}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
