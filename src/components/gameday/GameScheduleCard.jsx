import React from "react";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * Upcoming game schedule card.
 * Used on GameDay page and ParentView dashboard.
 */
export default function GameScheduleCard({ game, compact = false }) {
  if (!game) return null;

  const gameDate = new Date(game.scheduled_at);
  const isToday = new Date().toDateString() === gameDate.toDateString();
  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === gameDate.toDateString();

  const dateLabel = isToday ? "Today" : isTomorrow ? "Tomorrow" : gameDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const timeLabel = gameDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const setReminder = () => {
    // Use the browser Notification API if available
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    toast.success(`Reminder set for ${game.home_team_name} vs ${game.away_team_name}`);
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
        <div className="flex items-center gap-3">
          <div className="text-center min-w-[40px]">
            <p className="text-[10px] font-bold text-slate-500">{dateLabel}</p>
            <p className="text-xs font-black text-slate-900">{timeLabel}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              {game.home_team_name} vs {game.away_team_name}
            </p>
            {game.venue && (
              <p className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                <MapPin className="w-2.5 h-2.5" /> {game.venue}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={setReminder}
          className="text-[10px] text-red-600 hover:text-red-700 font-bold"
        >
          Remind
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isToday && <Badge className="bg-red-100 text-red-700 text-[10px] font-bold border-0">TODAY</Badge>}
          {game.sport && <Badge variant="secondary" className="text-[10px]">{game.sport}</Badge>}
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-xs">
          <Clock className="w-3 h-3" />
          <span className="font-medium">{timeLabel}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mb-3">
        <span className="text-sm font-bold text-slate-900 text-right truncate max-w-[100px]">{game.home_team_name}</span>
        <span className="text-xs text-slate-400 font-bold">vs</span>
        <span className="text-sm font-bold text-slate-900 text-left truncate max-w-[100px]">{game.away_team_name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-slate-500 text-xs">
          {game.venue ? (
            <>
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{game.venue}</span>
            </>
          ) : (
            <>
              <Calendar className="w-3 h-3" />
              <span>{dateLabel}</span>
            </>
          )}
        </div>
        <Button
          onClick={setReminder}
          size="sm"
          variant="outline"
          className="rounded-lg text-xs font-bold h-7 px-2.5"
        >
          Set Reminder
        </Button>
      </div>
    </div>
  );
}
