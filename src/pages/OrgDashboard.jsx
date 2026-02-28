import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users, Dumbbell, Video, Calendar, TrendingUp, MessageCircle,
  ChevronRight, Plus, Shield, Sparkles, Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OrgSetupDialog from "@/components/org/OrgSetupDialog";

export default function OrgDashboard() {
  const [user, setUser] = useState(null);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: org, refetch: refetchOrg } = useQuery({
    queryKey: ["my-org", user?.email],
    queryFn: async () => {
      const orgs = await base44.entities.Organization.filter({ owner_email: user.email });
      return orgs[0] || null;
    },
    enabled: !!user,
  });

  const { data: myMembership } = useQuery({
    queryKey: ["my-membership", user?.email],
    queryFn: async () => {
      const memberships = await base44.entities.OrgMember.filter({ user_email: user.email });
      return memberships[0] || null;
    },
    enabled: !!user,
  });

  const orgId = org?.id || myMembership?.organization_id;

  const { data: members } = useQuery({
    queryKey: ["org-members", orgId],
    queryFn: () => base44.entities.OrgMember.filter({ organization_id: orgId }),
    enabled: !!orgId,
  });

  const { data: plans } = useQuery({
    queryKey: ["org-plans", orgId],
    queryFn: () => base44.entities.TrainingPlan.filter({ organization_id: orgId }),
    enabled: !!orgId,
  });

  const { data: sessions } = useQuery({
    queryKey: ["org-sessions", orgId],
    queryFn: async () => {
      const all = await base44.entities.TrainingSession.filter({ organization_id: orgId });
      const upcoming = all.filter(
        (s) => new Date(s.scheduled_date) >= new Date() && s.status === "scheduled"
      );
      return upcoming.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
    },
    enabled: !!orgId,
  });

  const { data: videos } = useQuery({
    queryKey: ["org-videos", orgId],
    queryFn: () => base44.entities.AthleteVideo.filter({ organization_id: orgId }),
    enabled: !!orgId,
  });

  const role = org ? "admin" : myMembership?.role;
  const athletes = members?.filter((m) => m.role === "athlete") || [];
  const coaches = members?.filter((m) => m.role === "coach") || [];
  const pendingVideos = videos?.filter((v) => !v.coach_reviewed) || [];

  if (!user) return null;

  // No org / no membership — onboarding state
  if (!org && !myMembership) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center mx-auto shadow-2xl">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white">Welcome to SportHub Teams</h1>
        <p className="text-gray-500 text-lg">Create your organization or accept an invite to get started.</p>
        <Button
          onClick={() => setShowSetup(true)}
          className="bg-gradient-to-r from-red-900 to-red-700 text-white rounded-2xl px-8 py-3 text-base font-bold shadow-xl hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Organization
        </Button>
        {showSetup && (
          <OrgSetupDialog
            user={user}
            onClose={() => setShowSetup(false)}
            onCreated={() => { setShowSetup(false); refetchOrg(); }}
          />
        )}
      </div>
    );
  }

  const statCards = [
    { label: "Athletes", value: athletes.length, icon: Users, color: "from-blue-500 to-blue-600", link: "OrgRoster" },
    { label: "Coaches", value: coaches.length, icon: Users, color: "from-purple-500 to-purple-600", link: "OrgRoster" },
    { label: "Active Plans", value: plans?.filter((p) => p.status === "active").length || 0, icon: Dumbbell, color: "from-green-500 to-emerald-600", link: "TrainingPlans" },
    { label: "Pending Videos", value: pendingVideos.length, icon: Video, color: "from-orange-500 to-red-500", link: "VideoReview" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-700 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white mb-3">{role?.toUpperCase()}</Badge>
            <h1 className="text-2xl md:text-3xl font-black">{org?.name || "Team Dashboard"}</h1>
            {org?.sport && (
              <p className="text-white/80 mt-1">
                {org.sport} · {org.location || "No location set"}
              </p>
            )}
          </div>
          {org?.logo_url && (
            <img src={org.logo_url} className="w-16 h-16 rounded-2xl object-cover" alt="org logo" />
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={createPageUrl(s.link)}>
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors cursor-pointer">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-sm text-gray-400 font-medium">{s.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Upcoming Sessions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-800">
            <Calendar className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-bold text-white">Upcoming Sessions</h2>
          </div>
          <div className="space-y-2">
            {(!sessions || sessions.length === 0) && (
              <p className="text-gray-500 text-sm py-2">No upcoming sessions</p>
            )}
            {sessions?.slice(0, 4).map((s) => (
              <Link
                key={s.id}
                to={createPageUrl("OrgSessions")}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-800 transition-colors group"
              >
                <div>
                  <p className="font-semibold text-white text-sm">{s.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(s.scheduled_date).toLocaleDateString()} · {s.session_type}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
              </Link>
            ))}
          </div>
          <Link to={createPageUrl("OrgSessions")} className="block mt-3">
            <Button variant="outline" className="w-full rounded-xl text-sm border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
              View All Sessions
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-base font-bold text-white pb-3 mb-3 border-b border-gray-800">Quick Actions</h2>
          <div className="space-y-2">
            {(role === "admin" || role === "coach") && (
              <>
                <Link to={createPageUrl("TrainingPlans")}>
                  <Button className="w-full justify-start gap-3 rounded-xl bg-blue-900/40 text-blue-300 border border-blue-800 hover:bg-blue-900/60 shadow-none font-semibold">
                    <Dumbbell className="w-4 h-4" /> Training Plans
                  </Button>
                </Link>
                <Link to={createPageUrl("OrgSessions")}>
                  <Button className="w-full justify-start gap-3 rounded-xl bg-purple-900/40 text-purple-300 border border-purple-800 hover:bg-purple-900/60 shadow-none font-semibold">
                    <Calendar className="w-4 h-4" /> Schedule Session
                  </Button>
                </Link>
                <Link to={createPageUrl("VideoReview")}>
                  <Button className="w-full justify-start gap-3 rounded-xl bg-orange-900/40 text-orange-300 border border-orange-800 hover:bg-orange-900/60 shadow-none font-semibold">
                    <Video className="w-4 h-4" /> Review Videos
                    {pendingVideos.length > 0 && (
                      <Badge className="ml-auto bg-orange-500 text-white text-xs">
                        {pendingVideos.length}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link to={createPageUrl("ScoutingHub")}>
                  <Button className="w-full justify-start gap-3 rounded-xl bg-red-900/40 text-red-300 border border-red-800 hover:bg-red-900/60 shadow-none font-semibold">
                    <Crosshair className="w-4 h-4" /> Scout Athletes
                  </Button>
                </Link>
              </>
            )}
            {role === "athlete" && (
              <>
                <Link to={createPageUrl("MyTraining")}>
                  <Button className="w-full justify-start gap-3 rounded-xl bg-green-900/40 text-green-300 border border-green-800 hover:bg-green-900/60 shadow-none font-semibold">
                    <Dumbbell className="w-4 h-4" /> My Training Plan
                  </Button>
                </Link>
                <Link to={createPageUrl("UploadVideo")}>
                  <Button className="w-full justify-start gap-3 rounded-xl bg-orange-900/40 text-orange-300 border border-orange-800 hover:bg-orange-900/60 shadow-none font-semibold">
                    <Video className="w-4 h-4" /> Upload Training Video
                  </Button>
                </Link>
                <Link to={createPageUrl("PerformanceHub")}>
                  <Button className="w-full justify-start gap-3 rounded-xl bg-blue-900/40 text-blue-300 border border-blue-800 hover:bg-blue-900/60 shadow-none font-semibold">
                    <TrendingUp className="w-4 h-4" /> Log Performance Stats
                  </Button>
                </Link>
              </>
            )}
            {role === "parent" && (
              <Link to={createPageUrl("ParentView")}>
                <Button className="w-full justify-start gap-3 rounded-xl bg-pink-900/40 text-pink-300 border border-pink-800 hover:bg-pink-900/60 shadow-none font-semibold">
                  <TrendingUp className="w-4 h-4" /> View Child's Progress
                </Button>
              </Link>
            )}
            <Link to={createPageUrl("OrgMessages")}>
              <Button className="w-full justify-start gap-3 rounded-xl bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 shadow-none font-semibold">
                <MessageCircle className="w-4 h-4" /> Team Messages
              </Button>
            </Link>
            <Link to={createPageUrl("AthleteInsights")}>
              <Button className="w-full justify-start gap-3 rounded-xl bg-purple-900/40 text-purple-300 border border-purple-800 hover:bg-purple-900/60 shadow-none font-semibold">
                <Sparkles className="w-4 h-4" /> AI Insights
              </Button>
            </Link>
            {role === "admin" && (
              <Link to={createPageUrl("OrgRoster")}>
                <Button className="w-full justify-start gap-3 rounded-xl bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 shadow-none font-semibold">
                  <Users className="w-4 h-4" /> Manage Roster
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
