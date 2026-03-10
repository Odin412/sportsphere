import React from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/db";
import { Eye, TrendingUp, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import useSubscriptionTier from "@/hooks/useSubscriptionTier";

export default function WhosScouting({ athleteEmail }) {
  const { canAccess } = useSubscriptionTier();
  const { data: views = [] } = useQuery({
    queryKey: ["profile-views", athleteEmail],
    queryFn: () => db.entities.ProfileView.filter({ athlete_email: athleteEmail }),
    enabled: !!athleteEmail,
    staleTime: 5 * 60 * 1000,
  });

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const recentViews = views.filter(v => new Date(v.created_date).getTime() > weekAgo);

  const byRole = recentViews.reduce((acc, v) => {
    const role = v.viewer_role || "fan";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  // High interest: same viewer 2+ times in the past week
  const viewerCounts = recentViews.reduce((acc, v) => {
    if (v.viewer_email) acc[v.viewer_email] = (acc[v.viewer_email] || 0) + 1;
    return acc;
  }, {});
  const highInterest = Object.values(viewerCounts).some(c => c >= 2);

  const total = recentViews.length;

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-bold text-white">Who's Scouting You</span>
        </div>
        <p className="text-gray-500 text-xs">
          No profile views this week. Share your Scout Card to get noticed.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-bold text-white">Who's Scouting You</span>
      </div>

      <div>
        <p className="text-lg font-black text-white">{total} <span className="text-gray-400 text-sm font-normal">profile views this week</span></p>

        {canAccess('detailed_who_scouting') ? (
          <>
            <div className="flex gap-3 mt-2 flex-wrap">
              {byRole.coach > 0 && (
                <span className="text-xs bg-blue-900/40 text-blue-300 px-2 py-1 rounded-lg border border-blue-800/40">
                  🎓 {byRole.coach} Coach{byRole.coach > 1 ? "es" : ""}
                </span>
              )}
              {byRole.scout > 0 && (
                <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-1 rounded-lg border border-purple-800/40">
                  🏆 {byRole.scout} Scout{byRole.scout > 1 ? "s" : ""}
                </span>
              )}
              {(byRole.fan || byRole.athlete) > 0 && (
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-lg">
                  👤 {(byRole.fan || 0) + (byRole.athlete || 0)} Others
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="mt-2 flex items-center gap-2 bg-amber-900/20 border border-amber-800/40 rounded-lg p-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-300">
              <Link to={createPageUrl("Premium")} className="underline font-semibold hover:text-amber-200">Upgrade to Pro Scout</Link> to see who's viewing your profile
            </p>
          </div>
        )}
      </div>

      {canAccess('detailed_who_scouting') && highInterest && (
        <div className="flex items-start gap-2 bg-red-900/20 border border-red-800/40 rounded-xl p-3">
          <TrendingUp className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300 font-medium">
            High Interest — a coach visited your profile multiple times this week.
          </p>
        </div>
      )}
    </div>
  );
}
