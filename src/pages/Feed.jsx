import React, { useState } from "react";
import { db } from "@/api/db";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import PostCard from "@/components/feed/PostCard";
import FeedPreferencesDialog from "@/components/reels/FeedPreferencesDialog";
import UpcomingStreamsSection from "@/components/feed/UpcomingStreamsSection";
import LiveNowSection from "@/components/stream/LiveNowSection";
import SportNewsWidget from "@/components/feed/SportNewsWidget";
import SuggestedUsers from "@/components/social/SuggestedUsers";
import StoriesBar from "@/components/feed/StoriesBar";
import StoryViewer from "@/components/feed/StoryViewer";
import { Loader2, Settings2, Sparkles, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import FeedPagination, { PAGE_SIZE } from "@/components/feed/FeedPagination";
import { motion } from "framer-motion";
import { SkeletonPostCard } from "@/components/ui/SkeletonCard";

const SPORTS_LIST = [
  { name: "Basketball", emoji: "🏀" },
  { name: "Soccer", emoji: "⚽" },
  { name: "Football", emoji: "🏈" },
  { name: "Baseball", emoji: "⚾" },
  { name: "Tennis", emoji: "🎾" },
  { name: "Golf", emoji: "⛳" },
  { name: "Swimming", emoji: "🏊" },
  { name: "Boxing", emoji: "🥊" },
  { name: "MMA", emoji: "🥋" },
  { name: "Track", emoji: "🏃" },
  { name: "Volleyball", emoji: "🏐" },
  { name: "Hockey", emoji: "🏒" },
  { name: "Cycling", emoji: "🚴" },
  { name: "Yoga", emoji: "🧘" },
  { name: "CrossFit", emoji: "💪" },
  { name: "Softball", emoji: "🥎" },
];



export default function Feed() {
  const { user } = useAuth();
  const [sportFilter, setSportFilter] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [page, setPage] = useState(1);
  const [feedTab, setFeedTab] = useState("forYou");
  const [storySession, setStorySession] = useState(null);
  const resetPage = () => setPage(1);

  const { data: preferences } = useQuery({
    queryKey: ["feed-preferences", user?.email],
    queryFn: async () => {
      const prefs = await db.entities.FeedPreferences.filter({ user_email: user.email });
      return prefs[0] || null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: followedUsers } = useQuery({
    queryKey: ["follows", user?.email],
    queryFn: async () => {
      const follows = await db.entities.Follow.filter({ follower_email: user.email, status: "accepted" });
      return follows.map(f => f.following_email);
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const { data: allPosts, isLoading, refetch } = useQuery({
    queryKey: ["feed-posts", sportFilter],
    queryFn: () => sportFilter
      ? db.entities.Post.filter({ sport: sportFilter }, "-created_date", 50)
      : db.entities.Post.list("-created_date", 50),
    staleTime: 60000,
    refetchInterval: 120000,
    retry: 2,
    retryDelay: 1000,
  });


  const filteredPosts = allPosts?.filter(post => {
    if (preferences?.excluded_sports?.includes(post.sport)) return false;
    if (preferences?.preferred_sports?.length > 0 && !preferences.preferred_sports.includes(post.sport)) return false;
    if (preferences?.content_types?.length > 0 && !preferences.content_types.includes(post.category)) return false;
    return true;
  });

  const followingPosts = filteredPosts?.filter(p => followedUsers?.includes(p.author_email));
  const activePosts = feedTab === "following" ? followingPosts : filteredPosts;

  const totalPosts = activePosts?.length || 0;
  const posts = activePosts?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-[1140px] mx-auto px-4 py-4"
    >
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_296px] lg:gap-6 lg:items-start">

        {/* ── LEFT COLUMN — main feed ───────────────────────────────── */}
        <div className="space-y-3">

          {/* Stories bar — 24h posts with media (Instagram/FB Stories style) */}
          {user && (
            <StoriesBar
              user={user}
              onStoryClick={(items, group, markSeen) =>
                setStorySession({ items, group, markSeen })
              }
            />
          )}

          {/* Quick-post prompt bar */}
          {user && (
            <Link to={createPageUrl("CreatePost")}>
              <div className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-2xl p-3 hover:border-red-600 transition-all cursor-pointer group">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-red-900 text-white text-sm font-bold">{user.full_name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <span className="text-gray-500 text-sm group-hover:text-gray-300 transition-colors flex-1">
                  What's happening in sports? 🔥
                </span>
                <div className="flex items-center gap-3 text-gray-600 text-lg">
                  <span title="Photo">📸</span>
                  <span title="Video">🎬</span>
                  <span title="Status">💬</span>
                </div>
              </div>
            </Link>
          )}

          {/* Combined tab + sport filter row */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 items-center">
            <button
              onClick={() => { setFeedTab("forYou"); resetPage(); }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${feedTab === "forYou" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> For You
            </button>
            <button
              onClick={() => { setFeedTab("following"); resetPage(); }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${feedTab === "following" ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"}`}
            >
              <Users className="w-3.5 h-3.5" /> Following
            </button>
            {user && (
              <button
                onClick={() => setShowPreferences(true)}
                className="flex-shrink-0 p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
                title="Feed Preferences"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="w-px h-5 bg-gray-700 flex-shrink-0 mx-0.5" />
            <button
              onClick={() => { setSportFilter(null); resetPage(); }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${!sportFilter ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"}`}
            >
              🌟 All
            </button>
            {SPORTS_LIST.map(s => (
              <button
                key={s.name}
                onClick={() => { setSportFilter(s.name === sportFilter ? null : s.name); resetPage(); }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${sportFilter === s.name ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"}`}
              >
                {s.emoji} {s.name}
              </button>
            ))}
          </div>

          {/* Live Now */}
          {!sportFilter && (
            <LiveNowSection user={user} userPreferences={preferences} />
          )}

          {/* Upcoming Streams */}
          {!sportFilter && (
            <UpcomingStreamsSection user={user} />
          )}

      {/* Posts — with ESPN news cards injected every 5 posts */}
      <div>
        {isLoading ? (
          <div className="space-y-4 px-4">
            {[...Array(3)].map((_, i) => <SkeletonPostCard key={i} />)}
          </div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">{feedTab === "following" ? "👥" : "🏟️"}</p>
            <p className="text-gray-400 font-medium">
              {feedTab === "following" ? "No posts from people you follow yet" : "No posts yet"}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {feedTab === "following" ? "Follow athletes to see their content here!" : "Be the first to share something!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts?.map((post) => (
              <PostCard key={post.id} post={post} currentUser={user} onUpdate={refetch} />
            ))}
          </div>
        )}
        <FeedPagination
          total={totalPosts}
          page={page}
          onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      </div>

        </div>{/* end left column */}

        {/* ── RIGHT COLUMN — sticky news sidebar (desktop only) ────── */}
        <div className="hidden lg:block">
          <div className="sticky top-16 max-h-[calc(100vh-72px)] overflow-y-auto no-scrollbar space-y-3">
            <SportNewsWidget compact={true} />
            <SuggestedUsers />
          </div>
        </div>

      </div>{/* end grid */}

      {showPreferences && user && (
        <FeedPreferencesDialog user={user} onClose={() => setShowPreferences(false)} />
      )}

      {/* Story viewer — full-screen overlay */}
      {storySession && (
        <StoryViewer
          stories={storySession.items}
          authorGroup={storySession.group}
          onClose={() => setStorySession(null)}
          onMarkSeen={storySession.markSeen}
          user={user}
        />
      )}
    </motion.div>
  );
}
