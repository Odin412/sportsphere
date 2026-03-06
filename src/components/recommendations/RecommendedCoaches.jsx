import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Video, Users, Radio } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function RecommendedCoaches({ sessions: propSessions, userSports: propSports }) {
  const { user } = useAuth();
  const userSports = propSports || user?.preferred_sports || [];

  const { data: liveStreams = [] } = useQuery({
    queryKey: ["coaching-live-streams"],
    queryFn: () => base44.entities.LiveStream.filter({ status: "live" }),
    enabled: !propSessions?.length && !!user,
    staleTime: 30000,
  });

  const { data: scheduledStreams = [] } = useQuery({
    queryKey: ["coaching-scheduled"],
    queryFn: () => base44.entities.ScheduledStream.list("scheduled_time", 10),
    enabled: !propSessions?.length && !!user,
    staleTime: 60000,
  });

  const sessions = propSessions?.length
    ? propSessions
    : [...liveStreams, ...scheduledStreams].sort((a, b) => {
        const aMatch = userSports.includes(a.sport) ? 1 : 0;
        const bMatch = userSports.includes(b.sport) ? 1 : 0;
        return bMatch - aMatch;
      });

  if (!sessions.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Video className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-bold text-white">Coaches for You</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sessions.slice(0, 4).map(session => {
          const isLive = session.status === "live";
          const link = isLive
            ? createPageUrl("ViewLive") + `?id=${session.id}`
            : createPageUrl("LiveCoaching");
          return (
            <Link
              key={session.id}
              to={link}
              className="block bg-slate-800/80 border border-slate-700 hover:border-blue-500/50 rounded-2xl p-4 transition-all hover:scale-[1.01]"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarImage src={session.host_avatar} />
                  <AvatarFallback className="bg-blue-700 text-white font-bold">
                    {session.host_name?.[0]?.toUpperCase() || "C"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{session.title}</p>
                  <p className="text-slate-400 text-xs">{session.host_name}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {isLive && (
                      <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
                        <Radio className="w-3 h-3 animate-pulse" /> LIVE
                      </span>
                    )}
                    {session.sport && (
                      <Badge className="bg-blue-500/20 text-blue-300 text-xs">{session.sport}</Badge>
                    )}
                    {session.is_premium ? (
                      <span className="text-xs text-yellow-400 font-semibold">Premium</span>
                    ) : (
                      <span className="text-xs text-green-400 font-semibold">Free</span>
                    )}
                    {(session.viewers?.length > 0 || session.participants?.length > 0) && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {session.viewers?.length || session.participants?.length || 0}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
