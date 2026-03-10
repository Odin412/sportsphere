import React, { useState, useEffect } from "react";
import { db } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { Radio, Calendar, Trophy, Filter, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import LiveNowWidget from "@/components/gameday/LiveNowWidget";
import GameScheduleCard from "@/components/gameday/GameScheduleCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

const SPORTS_FILTER = ["All", "Baseball", "Basketball", "Soccer", "Football"];

export default function GameDay() {
  const [user, setUser] = useState(null);
  const [sportFilter, setSportFilter] = useState("All");
  const [myTeamsOnly, setMyTeamsOnly] = useState(false);

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => {});
  }, []);

  // Get user's org memberships for "My Teams Only" filter
  const { data: memberships } = useQuery({
    queryKey: ["user-memberships-gameday", user?.email],
    queryFn: () => db.entities.OrgMember.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const orgIds = memberships?.map(m => m.organization_id) || [];

  // Live games
  const { data: liveGames, isLoading: loadingLive } = useQuery({
    queryKey: ["gameday-live"],
    queryFn: () => db.entities.Game.filter({ status: "live" }),
    refetchInterval: 5000,
  });

  // Scheduled games (today + next 7 days)
  const { data: scheduledGames, isLoading: loadingScheduled } = useQuery({
    queryKey: ["gameday-scheduled"],
    queryFn: async () => {
      const games = await db.entities.Game.filter({ status: "scheduled" });
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 86400000);
      return games
        .filter(g => {
          const d = new Date(g.scheduled_at);
          return d >= now && d <= weekFromNow;
        })
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    },
    refetchInterval: 30000,
  });

  // Recent completed games
  const { data: recentGames, isLoading: loadingRecent } = useQuery({
    queryKey: ["gameday-recent"],
    queryFn: async () => {
      const games = await db.entities.Game.filter({ status: "final" });
      return games.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 12);
    },
  });

  // Apply filters
  const filterGames = (games) => {
    if (!games) return [];
    let result = [...games];
    if (sportFilter !== "All") result = result.filter(g => g.sport?.toLowerCase() === sportFilter.toLowerCase());
    if (myTeamsOnly && orgIds.length > 0) result = result.filter(g => orgIds.includes(g.organization_id));
    return result;
  };

  const filteredLive = filterGames(liveGames);
  const filteredScheduled = filterGames(scheduledGames);
  const filteredRecent = filterGames(recentGames);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-50"
    >
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-red-900 to-orange-900 p-6 md:p-8 text-white">
          <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-6 h-6 text-red-400 animate-pulse" />
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">GameDay</h1>
            </div>
            <p className="text-white/70 text-sm md:text-base">
              Watch live games, check schedules, and relive the action
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex gap-1.5">
            {SPORTS_FILTER.map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sportFilter === s
                    ? "bg-red-600 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          {user && (
            <button
              onClick={() => setMyTeamsOnly(!myTeamsOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                myTeamsOnly
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              My Teams Only
            </button>
          )}
        </div>

        {/* Live Now */}
        <section>
          <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Live Now
            {filteredLive.length > 0 && (
              <Badge className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0">{filteredLive.length}</Badge>
            )}
          </h2>
          {loadingLive ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(2)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredLive.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <Radio className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 font-medium text-sm">No live games right now</p>
              <p className="text-slate-300 text-xs mt-1">Check back during game time</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLive.map(g => <LiveNowWidget key={g.id} game={g} />)}
            </div>
          )}
        </section>

        {/* Today's Schedule */}
        <section>
          <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Upcoming Games
          </h2>
          {loadingScheduled ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredScheduled.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 font-medium text-sm">No upcoming games scheduled</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScheduled.map(g => <GameScheduleCard key={g.id} game={g} />)}
            </div>
          )}
        </section>

        {/* Recent Recaps */}
        <section>
          <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Recent Recaps
          </h2>
          {loadingRecent ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredRecent.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <Trophy className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 font-medium text-sm">No completed games yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecent.map(g => (
                <Link
                  key={g.id}
                  to={createPageUrl("GameRecap") + `?id=${g.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md hover:border-amber-200 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-[10px]">{g.sport}</Badge>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(g.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-sm font-bold text-slate-900 truncate max-w-[80px]">{g.home_team_name}</span>
                      <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1">
                        <span className="text-lg font-black text-slate-900 tabular-nums">{g.home_score}</span>
                        <span className="text-slate-400 text-xs">-</span>
                        <span className="text-lg font-black text-slate-900 tabular-nums">{g.away_score}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-900 truncate max-w-[80px]">{g.away_team_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-green-100 text-green-700 text-[10px] border-0 font-bold">FINAL</Badge>
                      {g.highlight_clips?.length > 0 && (
                        <span className="text-[10px] text-amber-600 font-bold">
                          {g.highlight_clips.length} highlights
                        </span>
                      )}
                      <span className="text-xs text-red-600 font-bold group-hover:underline">View Recap →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
