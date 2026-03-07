import React, { useState } from "react";
import { db } from "@/api/db";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatInputDialog from "@/components/stats/StatInputDialog";
import StatsChart from "@/components/stats/StatsChart";
import PRBadge from "@/components/propath/PRBadge";
import TrainingStreak from "@/components/propath/TrainingStreak";
import {
  BarChart2, Plus, Calendar, Trophy, TrendingUp,
  ChevronDown, Loader2, Flame, Activity, ShieldCheck,
} from "lucide-react";
import moment from "moment";

const SESSION_COLORS = {
  game:        "bg-red-900/50 text-red-300 border border-red-800",
  training:    "bg-blue-900/50 text-blue-300 border border-blue-700",
  practice:    "bg-green-900/50 text-green-300 border border-green-700",
  competition: "bg-purple-900/50 text-purple-300 border border-purple-700",
  other:       "bg-gray-700 text-gray-300",
};

const SPORT_EMOJIS = {
  Basketball: "🏀", Soccer: "⚽", Football: "🏈", Baseball: "⚾",
  Tennis: "🎾", Golf: "⛳", Swimming: "🏊", Hockey: "🏒",
  Track: "🏃", MMA: "🥋", CrossFit: "💪", Volleyball: "🏐", Cycling: "🚴",
};

export default function PerformanceHub() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);
  const [newPRMetric, setNewPRMetric] = useState(null);

  // User's sport profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["my-sport-profiles-perf", user?.email],
    queryFn: () => db.entities.SportProfile.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  // Stat entries for selected profile
  const { data: statEntries = [], isLoading: statsLoading } = useQuery({
    queryKey: ["stat-entries-hub", selectedProfile?.id],
    queryFn: () =>
      db.entities.StatEntry.filter(
        { sport_profile_id: selectedProfile.id },
        "-date",
        50
      ),
    enabled: !!selectedProfile,
    staleTime: 30000,
  });

  // Compute personal bests from all stat entries
  const personalBests = {};
  statEntries.forEach((entry) => {
    (entry.metrics || []).forEach((m) => {
      if (!personalBests[m.name] || m.value > personalBests[m.name].value) {
        personalBests[m.name] = { value: m.value, unit: m.unit, date: entry.date };
      }
    });
  });

  const handleSaveStats = async (data) => {
    await db.entities.StatEntry.create({
      sport_profile_id: selectedProfile.id,
      user_email: user.email,
      sport: selectedProfile.sport,
      ...data,
    });

    // PR detection — check each new metric against existing bests
    const newMetrics = data.metrics || [];
    for (const newM of newMetrics) {
      const prevBest = personalBests[newM.name];
      if (newM.value > 0 && (!prevBest || newM.value > prevBest.value)) {
        setNewPRMetric(newM.name);
        setTimeout(() => setNewPRMetric(null), 5000);
        break;
      }
    }

    // Streak update
    try {
      const pts = await db.entities.UserPoints.filter({ user_email: user.email });
      const today = new Date().toDateString();
      if (pts.length > 0) {
        const p = pts[0];
        const last = p.last_activity_date ? new Date(p.last_activity_date).toDateString() : "";
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const newStreak = last === yesterday ? (p.current_streak || 0) + 1
          : last === today ? (p.current_streak || 0) : 1;
        await db.entities.UserPoints.update(p.id, {
          current_streak: newStreak,
          last_activity_date: new Date().toISOString(),
          workouts_completed: (p.workouts_completed || 0) + 1,
        });
      } else {
        await db.entities.UserPoints.create({
          user_email: user.email,
          current_streak: 1,
          last_activity_date: new Date().toISOString(),
          workouts_completed: 1,
          total_points: 10,
          level: 1,
        });
      }
    } catch {}

    setShowLogDialog(false);
    queryClient.invalidateQueries({ queryKey: ["stat-entries-hub"] });
  };

  // Loading / unauthenticated states
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-5xl mb-4">📊</p>
        <h2 className="text-white font-bold text-xl">Sign in to track your performance</h2>
        <Link to={createPageUrl("Login")}>
          <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (profilesLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  // No sport profiles yet
  if (profiles.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-5xl mb-4">📊</p>
        <h2 className="text-white font-bold text-xl">Set Up Your Sport Profile First</h2>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          Performance tracking is tied to your sport profile. Create one in Profile Settings to start logging stats.
        </p>
        <Link to={createPageUrl("ProfileSettings")}>
          <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6">
            Go to Profile Settings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">Performance Hub</h1>
              <Link to={createPageUrl("ProPathHub")}>
                <Badge className="bg-red-900/40 text-red-400 border border-red-800 text-xs gap-1 cursor-pointer hover:bg-red-900/60 transition-colors flex items-center">
                  <ShieldCheck className="w-3 h-3" /> ProPath
                </Badge>
              </Link>
            </div>
            <p className="text-gray-500 text-sm">Track every game, practice & training session</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {newPRMetric && <PRBadge metric={newPRMetric} />}
          <Button
            onClick={() => setShowLogDialog(true)}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" /> Log Session
          </Button>
        </div>
      </div>

      {/* Sport profile selector */}
      {profiles.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProfileId(p.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedProfile?.id === p.id
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
            >
              {SPORT_EMOJIS[p.sport] || "🏆"} {p.sport}
            </button>
          ))}
        </div>
      )}

      {/* Active sport profile */}
      {selectedProfile && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex items-center gap-4">
          <Avatar className="w-12 h-12 ring-2 ring-gray-700">
            <AvatarImage src={selectedProfile.avatar_url} />
            <AvatarFallback className="bg-red-600 text-white font-bold">
              {selectedProfile.user_name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold">{selectedProfile.user_name}</span>
              <Badge className="bg-gray-800 text-gray-200 text-xs">
                {SPORT_EMOJIS[selectedProfile.sport] || "🏆"} {selectedProfile.sport}
              </Badge>
              {selectedProfile.level && (
                <Badge className="bg-gray-700 text-gray-300 text-xs capitalize">
                  {selectedProfile.level}
                </Badge>
              )}
            </div>
            {selectedProfile.team && (
              <p className="text-gray-500 text-xs mt-0.5 truncate">🏟️ {selectedProfile.team}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-white font-bold text-xl">{statEntries.length}</p>
            <p className="text-gray-500 text-xs">sessions</p>
          </div>
        </div>
      )}

      {/* Personal Bests */}
      {Object.keys(personalBests).length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <h2 className="text-white font-bold">Personal Bests</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(personalBests).map(([metric, best]) => (
              <div key={metric} className="bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-gray-500 text-xs truncate">{metric}</p>
                <p className="text-white font-bold text-2xl mt-1">
                  {best.value}
                  <span className="text-gray-500 text-xs ml-1 font-normal">{best.unit}</span>
                </p>
                <p className="text-gray-600 text-xs mt-1">{moment(best.date).format("MMM D")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Charts */}
      {statEntries.length > 1 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-red-400" />
            <h2 className="text-white font-bold">Progress Charts</h2>
          </div>
          <StatsChart stats={statEntries} sport={selectedProfile?.sport} />
        </div>
      )}

      {/* Session History */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-gray-400" />
          <h2 className="text-white font-bold">
            Session History
            <span className="text-gray-600 text-sm font-normal ml-2">({statEntries.length})</span>
          </h2>
        </div>

        {statsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : statEntries.length === 0 ? (
          <div className="text-center py-12">
            <Flame className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No sessions logged yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Tap "Log Session" to record your first performance
            </p>
            <Button
              onClick={() => setShowLogDialog(true)}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Log First Session
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {statEntries.map((entry) => (
              <div key={entry.id} className="bg-gray-800 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() =>
                    setExpandedSession(expandedSession === entry.id ? null : entry.id)
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm">
                        {moment(entry.date).format("MMM D, YYYY")}
                      </p>
                      <Badge
                        className={`text-xs capitalize ${
                          SESSION_COLORS[entry.session_type] || SESSION_COLORS.other
                        }`}
                      >
                        {entry.session_type}
                      </Badge>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5 truncate">
                      {(entry.metrics || [])
                        .slice(0, 3)
                        .map((m) => `${m.name}: ${m.value}${m.unit}`)
                        .join(" · ")}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${
                      expandedSession === entry.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedSession === entry.id && (
                  <div className="px-4 pb-4 border-t border-gray-700 pt-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                      {(entry.metrics || []).map((m, i) => (
                        <div key={i} className="bg-gray-900 rounded-lg p-2.5 text-center">
                          <p className="text-gray-500 text-xs">{m.name}</p>
                          <p className="text-white font-bold text-lg">
                            {m.value}{" "}
                            <span className="text-gray-600 text-xs font-normal">{m.unit}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                    {entry.notes && (
                      <p className="text-gray-400 text-xs italic border-t border-gray-700 pt-2">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Session Dialog */}
      {showLogDialog && selectedProfile && (
        <StatInputDialog
          open={showLogDialog}
          onClose={() => setShowLogDialog(false)}
          sportProfile={selectedProfile}
          onSave={handleSaveStats}
        />
      )}
    </div>
  );
}
