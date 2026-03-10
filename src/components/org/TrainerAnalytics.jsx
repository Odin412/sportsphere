import React from "react";
import { db } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Users, Calendar, Award, Loader2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";

export default function TrainerAnalytics({ orgId }) {
  const { data: members = [] } = useQuery({
    queryKey: ["org-athletes-analytics", orgId],
    queryFn: async () => {
      const all = await db.entities.OrgMember.filter({ organization_id: orgId });
      return all.filter(m => m.role === "athlete");
    },
    enabled: !!orgId,
  });

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["org-sessions-analytics", orgId],
    queryFn: () => db.entities.TrainingSession.filter({ organization_id: orgId }),
    enabled: !!orgId,
  });

  const { data: statEntries = [] } = useQuery({
    queryKey: ["org-stat-entries-analytics", orgId],
    queryFn: async () => {
      const athleteEmails = members.map(m => m.user_email);
      if (!athleteEmails.length) return [];
      const profiles = await db.entities.SportProfile.list(null, 500);
      const orgProfiles = profiles.filter(p => athleteEmails.includes(p.user_email));
      const profileIds = orgProfiles.map(p => p.id);
      const entries = await db.entities.StatEntry.list("-date", 500);
      return entries.filter(e => profileIds.includes(e.sport_profile_id));
    },
    enabled: members.length > 0,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["org-milestones-analytics", orgId],
    queryFn: () => db.entities.Milestone.filter({ organization_id: orgId }),
    enabled: !!orgId,
  });

  // Attendance rate from sessions with attendance data
  const sessionsWithAttendance = sessions.filter(s => s.attendance?.length > 0);
  const totalPresent = sessionsWithAttendance.reduce((sum, s) =>
    sum + s.attendance.filter(a => a.status === "present").length, 0
  );
  const totalExpected = sessionsWithAttendance.reduce((sum, s) => sum + s.attendance.length, 0);
  const attendanceRate = totalExpected > 0 ? Math.round((totalPresent / totalExpected) * 100) : 0;

  // Sessions over time (last 30 days, grouped by week)
  const now = new Date();
  const thirtyDaysAgo = new Date(now - 30 * 86400000);
  const recentSessions = sessions.filter(s => new Date(s.scheduled_date) >= thirtyDaysAgo);
  const weeklyData = [0, 1, 2, 3].map(weekOffset => {
    const weekStart = new Date(now - (3 - weekOffset) * 7 * 86400000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
    const count = recentSessions.filter(s => {
      const d = new Date(s.scheduled_date);
      return d >= weekStart && d < weekEnd;
    }).length;
    return { week: `Week ${weekOffset + 1}`, sessions: count };
  });

  // Stat trends: average metric values over last 3 periods (30-day chunks)
  const metricTrends = {};
  statEntries.forEach(entry => {
    (entry.metrics || []).forEach(m => {
      if (!metricTrends[m.name]) metricTrends[m.name] = [];
      metricTrends[m.name].push({ date: entry.date, value: parseFloat(m.value) || 0 });
    });
  });

  // Most improved athlete (biggest stat improvement)
  const athleteImprovements = {};
  members.forEach(m => {
    const myEntries = statEntries.filter(e => {
      return true; // simplified — would need profile-to-email mapping
    });
  });

  const completedSessions = sessions.filter(s => s.status === "completed").length;
  const prsThisWeek = milestones.filter(m => {
    const d = new Date(m.created_at);
    return d >= new Date(now - 7 * 86400000) && m.milestone_type === "pr";
  }).length;

  if (sessionsLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Athletes", value: members.length, icon: Users, color: "text-blue-400" },
          { label: "Avg Attendance", value: `${attendanceRate}%`, icon: Calendar, color: "text-green-400" },
          { label: "PRs This Week", value: prsThisWeek, icon: Award, color: "text-yellow-400" },
          { label: "Sessions Done", value: completedSessions, icon: TrendingUp, color: "text-red-400" },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-800 rounded-xl p-4 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <p className="text-white font-black text-2xl">{stat.value}</p>
            <p className="text-gray-500 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sessions over time chart */}
      {weeklyData.some(w => w.sessions > 0) && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="text-white font-bold text-sm mb-3">Sessions (Last 4 Weeks)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8, color: "#fff" }} />
              <Bar dataKey="sessions" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top metric trends */}
      {Object.keys(metricTrends).length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="text-white font-bold text-sm mb-3">Metric Trends (Team Averages)</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(metricTrends).slice(0, 4).map(([name, points]) => {
              const sorted = [...points].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);
              const chartData = sorted.map(p => ({ date: new Date(p.date).toLocaleDateString("en", { month: "short", day: "numeric" }), value: p.value }));
              return (
                <div key={name} className="bg-gray-900 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-2">{name}</p>
                  <ResponsiveContainer width="100%" height={80}>
                    <LineChart data={chartData}>
                      <Line type="monotone" dataKey="value" stroke="#EF4444" strokeWidth={2} dot={false} />
                      <Tooltip contentStyle={{ background: "#1F2937", border: "none", borderRadius: 6, fontSize: 11, color: "#fff" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
