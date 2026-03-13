import React, { useState, useEffect } from "react";
import { useAuth } from '@/lib/AuthContext';
import { db } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Video, Calendar, Dumbbell, Loader2, Star, Radio, FileText, Award, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LiveNowWidget from "@/components/gameday/LiveNowWidget";
import GameScheduleCard from "@/components/gameday/GameScheduleCard";
import StatsChart from "@/components/stats/StatsChart";

export default function ParentView() {
  const { user } = useAuth();
  const [membership, setMembership] = useState(null);
  const [parentTab, setParentTab] = useState("overview"); // "overview" | "progress"

  useEffect(() => {
    if (!user) return;
    (async () => {
      const memberships = await db.entities.OrgMember.filter({ user_email: user.email });
      setMembership(memberships[0] || null);
    })();
  }, [user]);

  const athleteEmails = membership?.athlete_emails || [];
  const orgId = membership?.organization_id;

  const { data: athleteProfiles } = useQuery({
    queryKey: ["athlete-profiles", athleteEmails.join(",")],
    queryFn: async () => {
      const all = await db.entities.OrgMember.filter({ organization_id: orgId });
      return all.filter(m => athleteEmails.includes(m.user_email));
    },
    enabled: !!orgId && athleteEmails.length > 0,
  });

  const { data: videos } = useQuery({
    queryKey: ["athlete-videos-parent", athleteEmails.join(","), orgId],
    queryFn: async () => {
      const all = await db.entities.AthleteVideo.filter({ organization_id: orgId });
      return all.filter(v => athleteEmails.includes(v.athlete_email));
    },
    enabled: !!orgId && athleteEmails.length > 0,
  });

  const { data: plans } = useQuery({
    queryKey: ["athlete-plans-parent", athleteEmails.join(","), orgId],
    queryFn: async () => {
      const all = await db.entities.TrainingPlan.filter({ organization_id: orgId });
      return all.filter(p => athleteEmails.includes(p.athlete_email));
    },
    enabled: !!orgId && athleteEmails.length > 0,
  });

  const { data: sessions } = useQuery({
    queryKey: ["athlete-sessions-parent", orgId],
    queryFn: async () => {
      const all = await db.entities.TrainingSession.filter({ organization_id: orgId });
      return all.filter(s => new Date(s.scheduled_date) >= new Date());
    },
    enabled: !!orgId,
  });

  // Live games for this org
  const { data: liveGames } = useQuery({
    queryKey: ["parent-live-games", orgId],
    queryFn: async () => {
      const games = await db.entities.Game.filter({ status: "live" });
      return games.filter(g => g.organization_id === orgId);
    },
    enabled: !!orgId,
    refetchInterval: 5000,
  });

  // Upcoming games for this org (next 7 days)
  const { data: upcomingGames } = useQuery({
    queryKey: ["parent-upcoming-games", orgId],
    queryFn: async () => {
      const games = await db.entities.Game.filter({ status: "scheduled" });
      const now = new Date();
      const weekOut = new Date(now.getTime() + 7 * 86400000);
      return games
        .filter(g => g.organization_id === orgId && new Date(g.scheduled_at) >= now && new Date(g.scheduled_at) <= weekOut)
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    },
    enabled: !!orgId,
    refetchInterval: 30000,
  });

  // Progress tab queries
  const { data: progressReports = [] } = useQuery({
    queryKey: ["parent-progress-reports", orgId, athleteEmails.join(",")],
    queryFn: async () => {
      const all = await db.entities.ProgressReport.filter({ organization_id: orgId });
      return all.filter(r => athleteEmails.includes(r.athlete_email)).sort((a, b) =>
        new Date(b.created_at || b.period_end) - new Date(a.created_at || a.period_end)
      );
    },
    enabled: !!orgId && athleteEmails.length > 0,
  });

  const { data: athleteStats = [] } = useQuery({
    queryKey: ["parent-athlete-stats", athleteEmails.join(",")],
    queryFn: async () => {
      const profiles = await db.entities.SportProfile.list(null, 500);
      const myProfiles = profiles.filter(p => athleteEmails.includes(p.user_email));
      if (!myProfiles.length) return [];
      const entries = [];
      for (const p of myProfiles) {
        const stats = await db.entities.StatEntry.filter({ sport_profile_id: p.id }, "-date", 20);
        entries.push(...stats.map(s => ({ ...s, sport: p.sport })));
      }
      return entries;
    },
    enabled: athleteEmails.length > 0,
  });

  const { data: athleteMilestones = [] } = useQuery({
    queryKey: ["parent-milestones", orgId, athleteEmails.join(",")],
    queryFn: async () => {
      const all = await db.entities.Milestone.filter({ organization_id: orgId });
      return all.filter(m => athleteEmails.includes(m.athlete_email));
    },
    enabled: !!orgId && athleteEmails.length > 0,
  });

  // Attendance rate from sessions
  const attendanceRate = React.useMemo(() => {
    if (!sessions?.length) return null;
    let present = 0, total = 0;
    sessions.forEach(s => {
      (s.attendance || []).forEach(a => {
        if (athleteEmails.includes(a.email)) {
          total++;
          if (a.status === "present" || a.status === "late") present++;
        }
      });
    });
    return total > 0 ? Math.round((present / total) * 100) : null;
  }, [sessions, athleteEmails]);

  if (!user) return null;

  if (!membership || membership.role !== "parent") {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-900 to-pink-700 flex items-center justify-center mx-auto">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-black text-white">Parent View</h2>
        <p className="text-gray-500">This view is for parents linked to an organization. Join an organization as a parent to track your child's progress.</p>
      </div>
    );
  }

  if (athleteEmails.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-gray-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-semibold">No athlete linked to your account yet</p>
        <p className="text-sm mt-1">Ask your coach/admin to link your child's account</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-red-900" /> My Child's Progress
      </h1>

      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {[
          { key: "overview", label: "Overview", icon: Calendar },
          { key: "progress", label: "Progress", icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setParentTab(tab.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              parentTab === tab.key
                ? "bg-red-900 text-white"
                : "bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ── PROGRESS TAB ────────────────────────────────────────── */}
      {parentTab === "progress" && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            {attendanceRate !== null && (
              <Card className="border-0 shadow-md text-center">
                <CardContent className="p-4">
                  <CheckCircle className={`w-5 h-5 mx-auto mb-1 ${attendanceRate >= 80 ? "text-green-500" : "text-yellow-500"}`} />
                  <p className="text-2xl font-black text-gray-900">{attendanceRate}%</p>
                  <p className="text-[10px] text-gray-500">Attendance</p>
                </CardContent>
              </Card>
            )}
            <Card className="border-0 shadow-md text-center">
              <CardContent className="p-4">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-2xl font-black text-gray-900">{athleteStats.length}</p>
                <p className="text-[10px] text-gray-500">Stats Logged</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md text-center">
              <CardContent className="p-4">
                <Award className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-2xl font-black text-gray-900">{athleteMilestones.length}</p>
                <p className="text-[10px] text-gray-500">Milestones</p>
              </CardContent>
            </Card>
          </div>

          {/* Latest progress report */}
          {progressReports.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-900" /> Latest Progress Report
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(progressReports[0].period_start).toLocaleDateString()} — {new Date(progressReports[0].period_end).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {progressReports[0].ai_summary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Stat trends chart */}
          {athleteStats.length > 1 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-900" /> Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <StatsChart stats={athleteStats} sport={athleteStats[0]?.sport} />
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          {athleteMilestones.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" /> Recent Milestones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {athleteMilestones.slice(0, 5).map(m => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50">
                    <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{m.title}</p>
                      <p className="text-xs text-gray-500">{m.milestone_type} · {new Date(m.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── OVERVIEW TAB ────────────────────────────────────────── */}
      {parentTab === "overview" && <>

      {/* Live Games */}
      {liveGames?.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-black text-gray-700 flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" /> Live Now
          </h2>
          <div className="grid gap-3">
            {liveGames.map(g => <LiveNowWidget key={g.id} game={g} />)}
          </div>
        </div>
      )}

      {/* Upcoming Games */}
      {upcomingGames?.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-black text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" /> Upcoming Games
          </h2>
          <div className="space-y-2">
            {upcomingGames.slice(0, 5).map(g => (
              <GameScheduleCard key={g.id} game={g} compact />
            ))}
          </div>
        </div>
      )}

      {/* Athlete cards */}
      {athleteProfiles?.map(athlete => (
        <Card key={athlete.id} className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-5 flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarImage src={athlete.avatar_url} />
              <AvatarFallback className="bg-blue-200 text-blue-700 font-black text-lg">
                {athlete.user_name?.[0] || "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-black text-gray-900">{athlete.user_name || athlete.user_email}</h2>
              <p className="text-sm text-gray-500">{athlete.sport} • {athlete.position || "Athlete"}</p>
              <Badge className="mt-1 bg-blue-100 text-blue-700 border-0 text-xs">{athlete.status}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Training plan summary */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2"><Dumbbell className="w-4 h-4 text-red-900" /> Training Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {!plans?.length && <p className="text-sm text-gray-400">No plans assigned yet</p>}
            {plans?.map(p => (
              <div key={p.id} className="p-3 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-gray-900">{p.title}</p>
                  <Badge className="bg-green-100 text-green-700 border-0 text-xs">{p.status}</Badge>
                </div>
                {p.goal && <p className="text-xs text-gray-500 mt-1">🎯 {p.goal}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming sessions */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2"><Calendar className="w-4 h-4 text-red-900" /> Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {!sessions?.length && <p className="text-sm text-gray-400">No upcoming sessions</p>}
            {sessions?.slice(0, 4).map(s => (
              <div key={s.id} className="p-3 rounded-xl bg-gray-50">
                <p className="font-semibold text-sm text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(s.scheduled_date).toLocaleDateString()} • {s.duration_minutes}min</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Reviewed videos */}
      {videos?.filter(v => v.coach_reviewed).length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-gray-700 flex items-center gap-2"><Video className="w-4 h-4 text-red-900" /> Coach Feedback on Videos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {videos.filter(v => v.coach_reviewed).map(v => (
              <div key={v.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-gray-900">{v.title}</p>
                  {v.coach_rating > 0 && (
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= v.coach_rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />)}
                    </div>
                  )}
                </div>
                {v.coach_feedback && <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">{v.coach_feedback}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      </>}
    </div>
  );
}