import React, { useEffect, useState } from "react";
import { db } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Sparkles, Radio, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function RecommendationNotification({ user }) {
  const [lastCheck, setLastCheck] = useState(() => {
    const stored = localStorage.getItem("last_recommendation_check");
    return stored ? new Date(stored) : new Date();
  });

  const { data: follows = [] } = useQuery({
    queryKey: ["follows", user?.email],
    queryFn: () => db.entities.Follow.filter({ follower_email: user.email }),
    enabled: !!user,
  });

  const { data: liveStreams } = useQuery({
    queryKey: ["new-live-streams"],
    queryFn: () => db.entities.LiveStream.filter({ status: "live" }),
    enabled: !!user,
    refetchInterval: 30000, // Check every 30s
  });

  const { data: events } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      // Fetch ascending by date so upcoming events come first
      const allEvents = await db.entities.Event.list("date", 20);
      return allEvents.filter(e => {
        const d = new Date(e.date);
        return d >= now && d <= tomorrow;
      });
    },
    enabled: !!user,
    refetchInterval: 60000, // Check every minute
  });

  useEffect(() => {
    if (!user || !follows || !liveStreams) return;

    const followedCreators = follows.map(f => f.following_email);
    const newStreamsFromFollowed = liveStreams.filter(s => 
      followedCreators.includes(s.host_email) && 
      new Date(s.started_at) > lastCheck
    );

    if (newStreamsFromFollowed.length > 0) {
      const stream = newStreamsFromFollowed[0];
      toast.custom(
        (t) => (
          <Link to={createPageUrl("ViewLive") + `?id=${stream.id}`}>
            <div className="bg-slate-900 border border-red-500/30 rounded-xl p-4 shadow-2xl cursor-pointer hover:border-red-500/50 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{stream.host_name} is live!</p>
                  <p className="text-slate-400 text-xs line-clamp-1">{stream.title}</p>
                </div>
              </div>
            </div>
          </Link>
        ),
        { duration: 5000 }
      );
      setLastCheck(new Date());
      localStorage.setItem("last_recommendation_check", new Date().toISOString());
    }
  }, [liveStreams, follows, user]);

  useEffect(() => {
    if (!user || !events) return;

    events.forEach(event => {
      const eventDate = new Date(event.date);
      const hoursUntil = (eventDate - new Date()) / (1000 * 60 * 60);

      if (hoursUntil > 0 && hoursUntil <= 24) {
        const notifKey = `event_notif_${event.id}`;
        const alreadyNotified = localStorage.getItem(notifKey);
        
        if (!alreadyNotified) {
          // Clean up old event notification keys to prevent localStorage bloat
          const allKeys = Object.keys(localStorage).filter(k => k.startsWith("event_notif_"));
          if (allKeys.length > 100) {
            allKeys.slice(0, allKeys.length - 100).forEach(k => localStorage.removeItem(k));
          }
          toast.custom(
            (t) => (
              <Link to={createPageUrl("Explore") + "?tab=events"}>
                <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-4 shadow-2xl cursor-pointer hover:border-blue-500/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">Event starting soon!</p>
                      <p className="text-slate-400 text-xs line-clamp-1">{event.title}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ),
            { duration: 5000 }
          );
          localStorage.setItem(notifKey, "true");
        }
      }
    });
  }, [events, user]);

  return null;
}