import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { db } from "@/api/db";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Home, User, MessageCircle, Search, Bell, Plus, Menu, X,
  Trophy, Flame, Globe, Sparkles, Radio, Activity, Bookmark,
  Crown, Video, Shield, ShieldAlert, Settings, ChevronDown,
  ChevronUp, Compass, Zap, Eye, BarChart2, Crosshair, ShieldCheck, Lock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useSubscriptionTier from "@/hooks/useSubscriptionTier";
import RecommendationNotification from "./components/notifications/RecommendationNotification";
import SupportChatWidget from "./components/messages/SupportChatWidget";
import PushNotificationBanner from "./components/notifications/PushNotificationBanner";
import AppTour from "./components/onboarding/AppTour";
import PoweredByTitanAI from "./components/branding/PoweredByTitanAI";

// Primary nav items shown in sidebar + mobile bottom nav
const PRIMARY_NAV = [
  { name: "Feed", page: "Feed", icon: Home },
  { name: "Explore", page: "Explore", icon: Compass },
  { name: "Reels", page: "Reels", icon: Flame },
  { name: "ProPath", page: "ProPathHub", icon: ShieldCheck },
  { name: "Live", page: "Live", icon: Radio },
  { name: "Messages", page: "Messages", icon: MessageCircle },
  { name: "Profile", page: "Profile", icon: User },
];

// Secondary nav shown only in sidebar "More" section
const SECONDARY_NAV = [
  { name: "For You", page: "ForYou", icon: Sparkles },
  { name: "Get Noticed", page: "GetNoticed", icon: Eye },
  { name: "The Vault", page: "TheVault", icon: Lock },
  { name: "Challenges", page: "Challenges", icon: Trophy },
  { name: "Performance", page: "PerformanceHub", icon: BarChart2 },
  { name: "Scouting Hub", page: "ScoutingHub", icon: Crosshair },
  { name: "Events", page: "Events", icon: Trophy },
  { name: "GameDay", page: "GameDay", icon: Radio },
  { name: "Forums", page: "Forums", icon: MessageCircle },
  { name: "Groups", page: "Groups", icon: Globe },
  { name: "Leaderboard", page: "Leaderboard", icon: Trophy },
  { name: "AI Coach", page: "Coach", icon: Sparkles },
  { name: "Creator Hub", page: "CreatorHub", icon: Crown },
  { name: "Analytics", page: "Analytics", icon: Activity },
  { name: "Saved", page: "SavedContent", icon: Bookmark },
  { name: "Live Coaching", page: "LiveCoaching", icon: Video },
  { name: "Notifications", page: "Notifications", icon: Bell },
  { name: "Moderation", page: "ModerationQueue", icon: ShieldAlert },
  { name: "Settings", page: "ProfileSettings", icon: Settings },
];

// Mobile bottom bar — 5 items only (center is Create button)
const MOBILE_BOTTOM = [
  { name: "Home", page: "Feed", icon: Home },
  { name: "Explore", page: "Explore", icon: Compass },
  null, // placeholder for center Create button
  { name: "Reels", page: "Reels", icon: Flame },
  { name: "Profile", page: "Profile", icon: User },
];

export default function Layout({ children, currentPageName }) {
  const { user, logout } = useAuth();
  const { tier, isPro, isElite } = useSubscriptionTier();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const queryClient = useQueryClient();

  // Unread notification count for bell badge
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-notifications", user?.email],
    queryFn: async () => {
      if (!user?.email) return 0;
      const notifs = await db.entities.Notification.filter({
        recipient_email: user.email,
        is_read: false,
      });
      return notifs.length;
    },
    enabled: !!user?.email,
    staleTime: 30000,
  });

  // Real-time subscription to invalidate count on new notifications
  useEffect(() => {
    if (!user?.email) return;
    const unsub = db.entities.Notification.subscribeToChanges(
      { recipient_email: user.email },
      () => queryClient.invalidateQueries({ queryKey: ["unread-notifications", user.email] })
    );
    return () => unsub?.unsubscribe?.();
  }, [user?.email]);

  const STANDALONE_PAGES = ["Login", "Admin", "AdminUsers", "AdminContent", "AdminAnalytics", "AdminSettings"];
  if (STANDALONE_PAGES.includes(currentPageName)) return <>{children}</>;

  const isActive = (page) => currentPageName === page;

  return (
    <div className="min-h-screen bg-stadium-950 text-white font-body">
      <RecommendationNotification user={user} />
      <SupportChatWidget user={user} />
      <PushNotificationBanner user={user} />

      {/* ── TOP HEADER ─────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-stadium-950/95 backdrop-blur-xl border-b border-white/10 lg:left-64">
        {/* Logo — visible on mobile only (desktop logo is in sidebar) */}
        <Link to={createPageUrl("Feed")} className="flex items-center gap-2 lg:hidden">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f6f4f4e61dd2806b88ed2/15137601c_392DC896-FFC0-4491-BCB6-20C0C160BF03.png"
            alt="Sportsphere"
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-display font-bold tracking-tight uppercase">Sportsphere</span>
        </Link>

        <div className="hidden lg:block" /> {/* spacer on desktop */}

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Notifications")} className="relative p-2.5 rounded-lg hover:bg-white/5 transition-colors" aria-label="Notifications">
            <Bell className="w-5 h-5 text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-monza rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          {user && (
            <Link to={createPageUrl("Profile")} className="relative">
              <Avatar className="w-8 h-8 ring-2 ring-stadium-700">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-monza text-white text-sm font-bold">
                  {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isElite && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center ring-2 ring-stadium-950">
                  <Zap className="w-2.5 h-2.5 text-white" />
                </span>
              )}
              {isPro && !isElite && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center ring-2 ring-stadium-950">
                  <Crown className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </Link>
          )}
        </div>
      </header>

      {/* ── DESKTOP LEFT SIDEBAR ────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-stadium-900 border-r border-white/10 z-40 overflow-y-auto">
        {/* Sidebar logo */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-white/10 flex-shrink-0">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f6f4f4e61dd2806b88ed2/15137601c_392DC896-FFC0-4491-BCB6-20C0C160BF03.png"
            alt="Sportsphere"
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-display font-bold tracking-tight uppercase text-white">Sportsphere</span>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {PRIMARY_NAV.map(({ name, page, icon: Icon }) => (
            <Link
              key={page}
              to={createPageUrl(page)}
              data-tour={`nav-${page.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive(page)
                  ? "bg-monza text-white"
                  : "text-stadium-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {name}
            </Link>
          ))}

          {/* Create Post button */}
          <Link
            to={createPageUrl("CreatePost")}
            data-tour="nav-create"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold bg-monza hover:bg-monza-600 text-white transition-colors mt-2"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            Create Post
          </Link>
        </nav>

        {/* More / secondary nav */}
        <div className="px-3 pb-4 border-t border-white/10 pt-3">
          <button
            onClick={() => setMoreOpen(o => !o)}
            data-tour="more-menu"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-stadium-400 hover:text-white hover:bg-white/5 transition-all w-full"
          >
            <Menu className="w-5 h-5" />
            More
            {moreOpen ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </button>

          {moreOpen && (
            <div className="mt-1 space-y-0.5">
              {SECONDARY_NAV.map(({ name, page, icon: Icon }) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  data-tour={`nav-${page.toLowerCase()}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(page)
                      ? "bg-monza text-white"
                      : "text-stadium-600 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {name}
                </Link>
              ))}

              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stadium-600 hover:text-monza hover:bg-white/5 transition-all w-full"
              >
                <X className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* TitanAI branding */}
        <div className="px-3 pb-3">
          <PoweredByTitanAI />
        </div>
      </aside>

      {/* ── PAGE CONTENT ────────────────────────────────────────────── */}
      <main className="pt-14 pb-20 lg:pl-64 lg:pb-8 min-h-screen">
        {children}
      </main>

      {/* ── APP TOUR ──────────────────────────────────────────────────── */}
      <AppTour userRole={user?.role || localStorage.getItem("user_role") || "athlete"} />

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center bg-stadium-950/95 backdrop-blur-xl border-t border-white/10">
        {MOBILE_BOTTOM.map((item, i) => {
          // Center create button
          if (item === null) {
            return (
              <div key="create" className="flex-1 flex items-center justify-center">
                <Link to={createPageUrl("CreatePost")} data-tour="mobile-create">
                  <div className="w-12 h-12 bg-monza hover:bg-monza-600 rounded-full flex items-center justify-center shadow-lg shadow-monza/30 transition-colors">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </Link>
              </div>
            );
          }

          const { name, page, icon: Icon } = item;
          const active = isActive(page);
          return (
            <Link
              key={page}
              to={createPageUrl(page)}
              data-tour={`mobile-${page.toLowerCase()}`}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
            >
              <Icon className={`w-6 h-6 ${active ? "text-monza" : "text-stadium-600"}`} />
              <span className={`text-[10px] font-semibold ${active ? "text-monza" : "text-stadium-600"}`}>
                {name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
