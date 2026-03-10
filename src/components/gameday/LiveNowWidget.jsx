import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Radio, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Reusable "Live Now" card for displaying an active game stream.
 * Used on GameDay page and ParentView dashboard.
 */
export default function LiveNowWidget({ game }) {
  if (!game) return null;

  return (
    <Link
      to={createPageUrl("ViewLive") + `?id=${game.live_stream_id}`}
      className="block group"
    >
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-4 text-white hover:shadow-lg transition-all relative overflow-hidden">
        {/* Pulse animation */}
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-white rounded-full animate-ping opacity-50" />
          <div className="w-3 h-3 bg-white rounded-full absolute top-0" />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-white/20 text-white gap-1 text-[10px] font-black border-0">
            <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
          </Badge>
          {game.sport && (
            <Badge className="bg-white/20 text-white text-[10px] font-semibold border-0">
              {game.sport}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-bold truncate max-w-[80px]">{game.home_team_name}</p>
              </div>
              <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-1">
                <span className="text-2xl font-black tabular-nums">{game.home_score}</span>
                <span className="text-white/50">-</span>
                <span className="text-2xl font-black tabular-nums">{game.away_score}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold truncate max-w-[80px]">{game.away_team_name}</p>
              </div>
            </div>
          </div>
        </div>

        {game.current_period && (
          <p className="text-white/70 text-xs font-medium mt-2">
            {game.current_period} {game.venue && `— ${game.venue}`}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="text-white/70 text-xs font-medium group-hover:text-white transition-colors">
            Tap to watch →
          </span>
        </div>
      </div>
    </Link>
  );
}
