import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown, Flame, Calendar, Clock } from "lucide-react";

const SPORTS_CHIPS = ["Basketball", "Soccer", "Football", "Baseball", "Tennis", "Hockey", "MMA", "Golf"];

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [period, setPeriod] = useState("all"); // "all" | "week" | "month"
  const [sportFilter, setSportFilter] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: topUsers = [] } = useQuery({
    queryKey: ["leaderboard-points"],
    queryFn: () => base44.entities.UserPoints.list("-total_points", 50),
    staleTime: 2 * 60 * 1000,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: recentPosts = [] } = useQuery({
    queryKey: ["leaderboard-recent-posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 300),
    enabled: period !== "all",
    staleTime: 5 * 60 * 1000,
  });

  const getUserInfo = (email) => allUsers.find(u => u.email === email);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return null;
  };

  // Compute leaderboard based on period + sport filter
  const leaderboard = useMemo(() => {
    if (period === "all") {
      let base = topUsers;
      if (sportFilter) {
        base = base.filter(u => {
          const info = getUserInfo(u.user_email);
          return info?.sport === sportFilter;
        });
      }
      return base.map((u, idx) => {
        const info = getUserInfo(u.user_email);
        return {
          id: u.id,
          user_email: u.user_email,
          display_name: info?.full_name || u.user_email,
          avatar_url: info?.avatar_url,
          score: u.total_points,
          level: u.level || Math.floor(u.total_points / 100) + 1,
          stat1: `🏋️ ${u.workouts_completed || 0} workouts`,
          stat2: `🎯 ${u.challenges_completed || 0} challenges`,
          stat3: `📝 ${u.posts_created || 0} posts`,
        };
      });
    }

    // Period-based scoring
    const cutoff = new Date(
      period === "week"
        ? Date.now() - 7 * 24 * 3600 * 1000
        : Date.now() - 30 * 24 * 3600 * 1000
    );

    const periodPosts = recentPosts.filter(p => {
      if (new Date(p.created_date) < cutoff) return false;
      if (sportFilter && p.sport !== sportFilter) return false;
      return true;
    });

    const scoreMap = {};
    for (const post of periodPosts) {
      if (!scoreMap[post.author_email]) {
        scoreMap[post.author_email] = {
          user_email: post.author_email,
          display_name: post.author_name,
          avatar_url: post.author_avatar_url,
          posts: 0,
          likes: 0,
        };
      }
      scoreMap[post.author_email].posts += 1;
      scoreMap[post.author_email].likes += (post.likes?.length || 0);
    }

    return Object.values(scoreMap)
      .map(entry => ({
        id: entry.user_email,
        ...entry,
        score: entry.posts * 10 + entry.likes * 2,
        level: Math.floor((entry.posts * 10 + entry.likes * 2) / 50) + 1,
        stat1: `📝 ${entry.posts} post${entry.posts !== 1 ? "s" : ""}`,
        stat2: `❤️ ${entry.likes} like${entry.likes !== 1 ? "s" : ""}`,
        stat3: `⚡ ${entry.posts * 10 + entry.likes * 2} pts`,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
  }, [period, sportFilter, topUsers, recentPosts, allUsers]);

  const myRank = leaderboard.findIndex(u => u.user_email === user?.email) + 1;
  const myEntry = leaderboard.find(u => u.user_email === user?.email);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-10 h-10" />
          <h1 className="text-4xl font-black">Leaderboard</h1>
        </div>
        <p className="text-white/90 text-lg">Top athletes in the Sportsphere community</p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[["all", "All Time", <Trophy className="w-3.5 h-3.5" />], ["week", "This Week", <Flame className="w-3.5 h-3.5" />], ["month", "This Month", <Calendar className="w-3.5 h-3.5" />]].map(([val, label, icon]) => (
          <button
            key={val}
            onClick={() => setPeriod(val)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              period === val ? "bg-red-600 text-white shadow" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Sport filter chips */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSportFilter(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
            !sportFilter ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All Sports
        </button>
        {SPORTS_CHIPS.map(s => (
          <button
            key={s}
            onClick={() => setSportFilter(s === sportFilter ? null : s)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
              sportFilter === s ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* My rank card */}
      {user && myEntry && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-red-900">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-red-900 text-white">{user.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-red-700 font-semibold">Your Rank</p>
                  <p className="text-2xl font-black text-red-900">#{myRank || "Unranked"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-red-700 font-semibold">{period === "all" ? "Total Points" : "Period Score"}</p>
                <p className="text-2xl font-black text-red-900">{myEntry.score}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 0, 2].map((idx) => {
            const entry = leaderboard[idx];
            if (!entry) return null;
            const rank = idx + 1;
            return (
              <Link key={rank} to={createPageUrl("UserProfile") + `?email=${entry.user_email}`}>
                <Card className={`border-2 transition-all hover:scale-105 ${
                  rank === 1 ? "border-yellow-500 bg-yellow-50" :
                  rank === 2 ? "border-gray-400 bg-gray-50" :
                  "border-orange-600 bg-orange-50"
                }`}>
                  <CardContent className="p-5 text-center">
                    <div className="flex justify-center mb-2">{getRankIcon(rank)}</div>
                    <Avatar className="w-14 h-14 mx-auto mb-2 border-2 border-gray-200">
                      <AvatarImage src={entry.avatar_url} />
                      <AvatarFallback className="bg-gray-200 text-gray-700">{entry.display_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-gray-900 text-sm truncate">{entry.display_name}</p>
                    <p className="text-2xl font-black text-red-900 my-1">{entry.score}</p>
                    <Badge className="bg-red-900 text-white text-xs">Lvl {entry.level}</Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Full rankings */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {period === "all" ? "All Rankings" : period === "week" ? "This Week's Rankings" : "This Month's Rankings"}
            {sportFilter && <span className="text-base font-normal text-gray-500 ml-2">— {sportFilter}</span>}
          </h2>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No activity yet for this period</p>
              <p className="text-sm mt-1">Post content to appear on the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, idx) => {
                const rank = idx + 1;
                return (
                  <Link
                    key={entry.id}
                    to={createPageUrl("UserProfile") + `?email=${entry.user_email}`}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-red-300 hover:bg-red-50 ${
                      entry.user_email === user?.email ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                  >
                    <div className="w-8 text-center flex-shrink-0">
                      {getRankIcon(rank) || <span className="text-base font-bold text-gray-500">#{rank}</span>}
                    </div>
                    <Avatar className="w-11 h-11 border-2 border-gray-200 flex-shrink-0">
                      <AvatarImage src={entry.avatar_url} />
                      <AvatarFallback className="bg-gray-200 text-gray-700">{entry.display_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{entry.display_name}</p>
                      <div className="flex gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                        <span>{entry.stat1}</span>
                        <span>{entry.stat2}</span>
                        <span>{entry.stat3}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-black text-red-900">{entry.score}</p>
                      <Badge className="bg-gray-100 text-gray-700 text-xs mt-1">Lvl {entry.level}</Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
