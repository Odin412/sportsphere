import React, { useState, useEffect } from "react";
import { db } from "@/api/db";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  ShieldCheck, Share2, FileText, Lock, ChevronRight,
  Loader2, Trophy, BarChart2, Flame,
} from "lucide-react";
import { toast } from "sonner";
import ScoutCardDisplay from "@/components/propath/ScoutCardDisplay";
import TrainingStreak from "@/components/propath/TrainingStreak";
import WhosScouting from "@/components/propath/WhosScouting";
import GameChangerPDFImport from "@/components/propath/GameChangerPDFImport";

export default function ProPathHub() {
  const { user } = useAuth();
  const [showGCImport, setShowGCImport] = useState(false);
  const [narrative, setNarrative] = useState(null);
  const [loadingNarrative, setLoadingNarrative] = useState(false);

  // Sport profiles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["propath-profiles", user?.email],
    queryFn: () => db.entities.SportProfile.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const profile = profiles[0];

  // Stat entries
  const { data: statEntries = [] } = useQuery({
    queryKey: ["propath-stats", user?.email],
    queryFn: () => db.entities.StatEntry.filter({ user_email: user.email }, "-date", 100),
    enabled: !!user,
  });

  // User points (for streak)
  const { data: points = null } = useQuery({
    queryKey: ["propath-points", user?.email],
    queryFn: async () => {
      const pts = await db.entities.UserPoints.filter({ user_email: user.email });
      return pts[0] || null;
    },
    enabled: !!user,
  });

  // Top 3 metrics
  const metricBests = {};
  statEntries.forEach((entry) => {
    (entry.metrics || []).forEach((m) => {
      if (!metricBests[m.name] || m.value > metricBests[m.name].value) {
        metricBests[m.name] = { value: m.value, unit: m.unit || "" };
      }
    });
  });
  const topMetrics = Object.entries(metricBests)
    .map(([name, { value, unit }]) => ({ name, value, unit }))
    .slice(0, 3);

  // Generate AI scout narrative
  useEffect(() => {
    if (!profile || loadingNarrative || narrative) return;
    if (!topMetrics.length && !profile.achievements?.length) return;

    setLoadingNarrative(true);
    db.ai.invoke({
      prompt: `Write a 2-sentence recruiting scout narrative for this athlete.
Name: ${profile.user_name || "Athlete"}
Sport: ${profile.sport || "Unknown"}
Position: ${profile.position || "N/A"}
Level: ${profile.level || "N/A"}
Years experience: ${profile.years_experience || "N/A"}
Top stats: ${JSON.stringify(topMetrics)}
Achievements: ${(profile.achievements || []).join(", ") || "None listed"}
Bio: ${profile.bio || ""}

Be specific, use active voice, highlight what makes this athlete stand out.`,
      schema: {
        type: "object",
        properties: {
          headline: { type: "string" },
          narrative: { type: "string" },
        },
      },
    })
      .then(setNarrative)
      .catch(() => {})
      .finally(() => setLoadingNarrative(false));
  }, [profile, statEntries.length]);

  const shareScoutCard = () => {
    if (!user?.email) return;
    const url = `${window.location.origin}${createPageUrl("ScoutCard")}?email=${user.email}`;
    navigator.clipboard.writeText(url).then(() =>
      toast.success("Scout Card link copied to clipboard!")
    );
  };

  if (!user) return null;

  if (profilesLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center shadow-lg shadow-red-900/30">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">ProPath</h1>
            <Badge className="bg-red-900/40 text-red-400 border border-red-800 text-xs font-bold">
              Your Athletic Profile
            </Badge>
          </div>
          <p className="text-gray-500 text-sm">Build your recruiting presence. Get discovered.</p>
        </div>
      </div>

      {/* No profile CTA */}
      {!profile && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-4">
          <p className="text-5xl">🏆</p>
          <h2 className="text-white font-bold text-xl">Set Up Your ProPath Profile</h2>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Create a sport profile to unlock Scout Cards, performance tracking, and recruiter visibility.
          </p>
          <Link to={createPageUrl("ProfileSettings")}>
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8">
              Create Sport Profile
            </Button>
          </Link>
        </div>
      )}

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column — Scout Card + actions */}
          <div className="lg:col-span-2 space-y-4">
            {/* Scout Card preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  Scout Card
                </h2>
                <div className="flex gap-2">
                  <Button
                    onClick={shareScoutCard}
                    size="sm"
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl gap-2 text-xs"
                  >
                    <Share2 className="w-3 h-3" /> Share Link
                  </Button>
                  <Link to={`${createPageUrl("ScoutCard")}?email=${user.email}`}>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-1 text-xs"
                    >
                      Full Card <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>

              {loadingNarrative ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating your scout narrative...
                </div>
              ) : (
                <ScoutCardDisplay
                  profile={profile}
                  topMetrics={topMetrics}
                  headline={narrative?.headline}
                  narrative={narrative?.narrative}
                  onShare={shareScoutCard}
                  onContact={() => {}}
                  compact={true}
                />
              )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setShowGCImport(true)}
                className="bg-gray-900 border border-gray-800 hover:border-red-800/50 rounded-2xl p-4 text-left group transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-red-950/50 border border-red-900/50 flex items-center justify-center group-hover:bg-red-900/50 transition-colors">
                    <FileText className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Import GC Stats</p>
                    <p className="text-gray-500 text-xs">GameChanger PDF export</p>
                  </div>
                </div>
                <Badge className="bg-green-900/30 text-green-500 border border-green-800 text-[10px]">
                  ProPath Verified
                </Badge>
              </button>

              <Link
                to={createPageUrl("PerformanceHub")}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 group transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-950/50 border border-blue-900/50 flex items-center justify-center">
                    <BarChart2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Log Performance</p>
                    <p className="text-gray-500 text-xs">Games, practices, training</p>
                  </div>
                </div>
                <p className="text-gray-600 text-xs">
                  {statEntries.length} session{statEntries.length !== 1 ? "s" : ""} logged
                </p>
              </Link>
            </div>

            {/* Verified stats summary */}
            {statEntries.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    ProPath Verified Stats
                  </h3>
                  <Link to={createPageUrl("PerformanceHub")}>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 text-xs gap-1 p-0">
                      View all <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(metricBests).slice(0, 6).map(([name, { value, unit }]) => (
                    <div key={name} className="bg-gray-800 rounded-xl p-3 text-center">
                      <p className="text-gray-400 text-xs truncate">{name}</p>
                      <p className="text-white font-bold text-xl mt-1">
                        {value}
                        <span className="text-gray-500 text-xs ml-1 font-normal">{unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — Streak + WhosScouting + Vault */}
          <div className="space-y-4">
            {/* Training streak */}
            <TrainingStreak streak={points?.current_streak || 0} compact={false} />

            {/* Who's Scouting */}
            <WhosScouting athleteEmail={user.email} />

            {/* The Vault */}
            <Link to={createPageUrl("TheVault")}>
              <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 group transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">The Vault</p>
                    <p className="text-gray-500 text-xs">Private video + coach markup</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 ml-auto group-hover:text-gray-400 transition-colors" />
                </div>
                <Badge className="bg-gray-800 text-gray-500 border border-gray-700 text-[10px]">
                  Coach Access Only
                </Badge>
              </div>
            </Link>

            {/* Flame motivator */}
            {statEntries.length > 0 && (
              <div className="bg-gradient-to-br from-orange-950/40 to-red-950/40 border border-orange-900/30 rounded-2xl p-4 text-center">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-white font-bold text-sm">
                  {statEntries.length} Sessions Verified
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Keep logging to build your recruiting resume
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GameChanger import dialog */}
      {showGCImport && (
        <GameChangerPDFImport
          onClose={() => setShowGCImport(false)}
          userEmail={user.email}
          sportProfileId={profile?.id}
        />
      )}
    </div>
  );
}
