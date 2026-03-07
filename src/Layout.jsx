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
import RecommendationNotification from "./components/notifications/RecommendationNotification";
import SupportChatWidget from "./components/messages/SupportChatWidget";
import PushNotificationBanner from "./components/notifications/PushNotificationBanner";

// Primary nav items shown in sidebar + mobile bottom nav
const PRIMARY_NAV = [
  { name: "Feed", page: "Feed", icon: Home },
  { name: "Search", page: "Search", icon: Search },
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
  { name: "Discover", page: "Discover", icon: Compass },
  { name: "Challenges", page: "Challenges", icon: Trophy },
  { name: "Performance", page: "PerformanceHub", icon: BarChart2 },
  { name: "Scouting Hub", page: "ScoutingHub", icon: Crosshair },
  { name: "Events", page: "Events", icon: Trophy },
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
  { name: "Search", page: "Search", icon: Search },
  null, // placeholder for center Create button
  { name: "Reels", page: "Reels", icon: Flame },
  { name: "Profile", page: "Profile", icon: User },
];

export default function Layout({ children, currentPageName }) {
  const { user, logout } = useAuth();
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
    return () => unsub?.();
  }, [user?.email]);

  const STANDALONE_PAGES = ["Login", "Admin", "AdminUsers", "AdminContent", "AdminAnalytics", "AdminSettings"];
  if (STANDALONE_PAGES.includes(currentPageName)) return <>{children}</>;

  const isActive = (page) => currentPageName === page;

  return (
    <div className="min-h-screen bg-black text-white">
      <RecommendationNotification user={user} />
      <SupportChatWidget user={user} />
      <PushNotificationBanner user={user} />

      {/* ── TOP HEADER ─────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-black/95 backdrop-blur-xl border-b border-gray-800 lg:left-64">
        {/* Logo — visible on mobile only (desktop logo is in sidebar) */}
        <Link to={createPageUrl("Feed")} className="flex items-center gap-2 lg:hidden">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f6f4f4e61dd2806b88ed2/15137601c_392DC896-FFC0-4491-BCB6-20C0C160BF03.png"
            alt="Sportsphere"
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-black tracking-tight">Sportsphere</span>
        </Link>

        <div className="hidden lg:block" /> {/* spacer on desktop */}

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <Link to={createPageUrl("Notifications")} className="relative p-2 rounded-xl hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1 leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          {user && (
            <Link to={createPageUrl("Profile")}>
              <Avatar className="w-8 h-8 ring-2 ring-gray-700">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-red-600 text-white text-sm font-bold">
                  {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </header>

      {/* ── DESKTOP LEFT SIDEBAR ────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-gray-950 border-r border-gray-800 z-40 overflow-y-auto">
        {/* Sidebar logo */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-gray-800 flex-shrink-0">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698f6f4f4e61dd2806b88ed2/15137601c_392DC896-FFC0-4491-BCB6-20C0C160BF03.png"
            alt="Sportsphere"
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-black tracking-tight text-white">Sportsphere</span>
        </div>

        {/* Primary nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {PRIMARY_NAV.map(({ name, page, icon: Icon }) => (
            <Link
              key={page}
              to={createPageUrl(page)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive(page)
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {name}
            </Link>
          ))}

          {/* Create Post button */}
          <Link
            to={createPageUrl("CreatePost")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors mt-2"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            Create Post
          </Link>
        </nav>

        {/* More / secondary nav */}
        <div className="px-3 pb-4 border-t border-gray-800 pt-3">
          <button
            onClick={() => setMoreOpen(o => !o)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition-all w-full"
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive(page)
                      ? "bg-red-600 text-white"
                      : "text-gray-500 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {name}
                </Link>
              ))}

              <button
                onClick={() => logout()}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-all w-full"
              >
                <X className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── PAGE CONTENT ────────────────────────────────────────────── */}
      <main className="pt-14 pb-20 lg:pl-64 lg:pb-8 min-h-screen">
        {children}
      </main>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center bg-black/95 backdrop-blur-xl border-t border-gray-800">
        {MOBILE_BOTTOM.map((item, i) => {
          // Center create button
          if (item === null) {
            return (
              <div key="create" className="flex-1 flex items-center justify-center">
                <Link to={createPageUrl("CreatePost")}>
                  <div className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-600/30 transition-colors">
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
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
            >
              <Icon className={`w-6 h-6 ${active ? "text-red-500" : "text-gray-500"}`} />
              <span className={`text-[10px] font-semibold ${active ? "text-red-500" : "text-gray-500"}`}>
                {name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
