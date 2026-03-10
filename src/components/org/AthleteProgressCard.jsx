import React from "react";
import { db } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Award, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export default function AthleteProgressCard({ athleteEmail, orgId }) {
  const { data: profile } = useQuery({
    queryKey: ["athlete-profile-card", athleteEmail],
    queryFn: async () => {
      const profiles = await db.entities.SportProfile.filter({ user_email: athleteEmail });
      return profiles[0] || null;
    },
    enabled: !!athleteEmail,
  });

  const { data: stats = [] } = useQuery({
    queryKey: ["athlete-stats-card", profile?.id],
    queryFn: () => db.entities.StatEntry.filter({ sport_profile_id: profile.id }, "-date", 20),
    enabled: !!profile?.id,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["athlete-milestones-card", orgId, athleteEmail],
    queryFn: async () => {
      const all = await db.entities.Milestone.filter({ organization_id: orgId });
      return all.filter(m => m.athlete_email === athleteEmail);
    },
    enabled: !!orgId && !!athleteEmail,
  });

  // Compute before/after for top metrics (30 days ago vs now)
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 86400000);
  const recentStats = stats.filter(s => new Date(s.date) >= thirtyDaysAgo);
  const olderStats = stats.filter(s => new Date(s.date) < thirtyDaysAgo);

  const metricComparison = {};
  recentStats.forEach(entry => {
    (entry.metrics || []).forEach(m => {
      if (!metricComparison[m.name]) metricComparison[m.name] = { current: 0, previous: 0, unit: m.unit };
      metricComparison[m.name].current = Math.max(metricComparison[m.name].current, parseFloat(m.value) || 0);
    });
  });
  olderStats.forEach(entry => {
    (entry.metrics || []).forEach(m => {
      if (metricComparison[m.name]) {
        metricComparison[m.name].previous = Math.max(metricComparison[m.name].previous, parseFloat(m.value) || 0);
      }
    });
  });

  // Sparkline data from recent stats
  const sparklineData = stats
    .slice(0, 10)
    .reverse()
    .map(s => ({
      value: (s.metrics || [])[0]?.value || 0,
    }));

  const recentMilestones = milestones.slice(0, 3);

  return (
    <div className="bg-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-sm">{profile?.user_name || athleteEmail}</p>
          <p className="text-gray-500 text-xs">{profile?.sport} {profile?.position ? `· ${profile.position}` : ""}</p>
        </div>
        {sparklineData.length > 2 && (
          <div className="w-20 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Before/After comparison */}
      {Object.keys(metricComparison).length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(metricComparison).slice(0, 3).map(([name, data]) => {
            const diff = data.current - data.previous;
            const improved = diff > 0;
            return (
              <div key={name} className="bg-gray-900 rounded-lg p-2 text-center">
                <p className="text-gray-500 text-[10px] truncate">{name}</p>
                <p className="text-white font-bold text-sm">{data.current}{data.unit}</p>
                {data.previous > 0 && (
                  <p className={`text-[10px] font-semibold ${improved ? "text-green-400" : "text-red-400"}`}>
                    {improved ? "+" : ""}{diff.toFixed(1)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recent milestones */}
      {recentMilestones.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {recentMilestones.map(m => (
            <Badge key={m.id} className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] gap-1">
              <Award className="w-2.5 h-2.5" /> {m.title}
            </Badge>
          ))}
        </div>
      )}

      {stats.length === 0 && milestones.length === 0 && (
        <p className="text-gray-600 text-xs text-center py-2">No stats logged yet</p>
      )}
    </div>
  );
}
