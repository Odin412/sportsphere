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
import { Loader2, Settings2, Sparkles, Users, Zap, Trophy, Radio } from "lucide-react";

const TICKER_ITEMS = [
  "🏀 NBA Playoffs race tightens — 6 teams within 2 games",
  "⚽ Champions League draw announced — fixtures confirmed",
  "🏈 NFL Draft — top 10 prospects ranked by scouts",
  "🎾 Djokovic wins in straights, advances to semis",
  "🥊 Main event card announced for this Saturday",
  "🏃 World marathon record attempt at Berlin this weekend",
  "🏒 Stanley Cup Playoffs bracket officially set",
  "🤸 Olympic qualifiers underway — watch live on Sportsphere",
];
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

  // Batch-fetch user's highlights, follows, and subscriptions to avoid N+1 queries in PostCard
  const { data: userHighlights = [] } = useQuery({
    queryKey: ["user-highlights", user?.email],
    queryFn: () => db.entities.Highlight.filter({ user_email: user.email, item_type: "post" }),
    enabled: !!user?.email,
    staleTime: 60000,
  });

  const { data: userFollowsList = [] } = useQuery({
    queryKey: ["user-follows-list", user?.email],
    queryFn: () => db.entities.Follow.filter({ follower_email: user.email }),
    enabled: !!user?.email,
    staleTime: 60000,
  });

  const { data: userSubscriptions = [] } = useQuery({
    queryKey: ["user-subscriptions", user?.email],
    queryFn: () => db.entities.Subscription.filter({ subscriber_email: user.email, status: "active" }),
    enabled: !!user?.email,
    staleTime: 60000,
  });

  // Pre-compute lookup sets for O(1) checks in PostCard
  const highlightedPostIds = React.useMemo(
    () => new Set(userHighlights.map(h => h.item_id)),
    [userHighlights]
  );
  const followingEmails = React.useMemo(
    () => new Set(userFollowsList.map(f => f.following_email)),
    [userFollowsList]
  );
  const subscribedCreators = React.useMemo(
    () => new Set(userSubscriptions.map(s => s.creator_email)),
    [userSubscriptions]
  );


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
      transition={{ duration: 0.15, ease: "linear" }}
      className="max-w-[1140px] mx-auto px-4 py-4 pb-20 md:pb-4"
    >
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_296px] lg:gap-6 lg:items-start">

        {/* ── LEFT COLUMN — main feed ───────────────────────────────── */}
        <div className="space-y-3">

          {/* ── BROADCAST STRIP — ESPN-style scrolling ticker ───── */}
          <div className="broadcast-bar rounded-lg overflow-hidden flex items-stretch">
            {/* LIVE badge */}
            <div className="bg-monza flex items-center gap-1.5 px-3 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-[11px] font-display font-bold uppercase tracking-widest">Live</span>
            </div>
            {/* Scrolling ticker */}
            <div className="flex-1 overflow-hidden py-2">
              <div className="flex items-center animate-ticker-slide whitespace-nowrap" style={{ animationDuration: "28s" }}>
                {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                  <span key={i} className="text-[11px] text-stadium-300 font-medium px-5 border-r border-white/10 last:border-0 flex-shrink-0">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            {/* Date stamp */}
            <div className="flex-shrink-0 px-3 flex items-center">
              <span className="text-[10px] text-stadium-600 font-display uppercase tracking-wider hidden sm:block">
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>

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
              <div className="flex items-center gap-3 glass-card rounded-lg p-3 hover:border-monza/50 transition-all cursor-pointer group">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-monza-700 text-white text-sm font-bold">{user.full_name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <span className="text-stadium-400 text-sm group-hover:text-gray-300 transition-colors flex-1">
                  What's happening in sports? 🔥
                </span>
                <div className="flex items-center gap-3 text-stadium-600 text-lg">
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
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${feedTab === "forYou" ? "bg-monza text-white" : "bg-stadium-800 text-stadium-400 hover:text-white hover:bg-stadium-700"}`}
            >
              <Sparkles className="w-3.5 h-3.5" /> For You
            </button>
            <button
              onClick={() => { setFeedTab("following"); resetPage(); }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${feedTab === "following" ? "bg-monza text-white" : "bg-stadium-800 text-stadium-400 hover:text-white hover:bg-stadium-700"}`}
            >
              <Users className="w-3.5 h-3.5" /> Following
            </button>
            {user && (
              <button
                onClick={() => setShowPreferences(true)}
                className="flex-shrink-0 p-1.5 rounded-lg bg-stadium-800 text-stadium-400 hover:text-white hover:bg-stadium-700 transition-all"
                title="Feed Preferences"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="w-px h-5 bg-stadium-700 flex-shrink-0 mx-0.5" />
            <button
              onClick={() => { setSportFilter(null); resetPage(); }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${!sportFilter ? "bg-monza text-white" : "bg-stadium-800 text-stadium-400 hover:text-white hover:bg-stadium-700"}`}
            >
              🌟 All
            </button>
            {SPORTS_LIST.map(s => (
              <button
                key={s.name}
                onClick={() => { setSportFilter(s.name === sportFilter ? null : s.name); resetPage(); }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${sportFilter === s.name ? "bg-monza text-white" : "bg-stadium-800 text-stadium-400 hover:text-white hover:bg-stadium-700"}`}
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
            <p className="text-stadium-400 font-medium">
              {feedTab === "following" ? "No posts from people you follow yet" : "No posts yet"}
            </p>
            <p className="text-stadium-600 text-sm mt-1">
              {feedTab === "following" ? "Follow athletes to see their content here!" : "Be the first to share something!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts?.map((post) => (
              <div key={post.id} className="relative">
                {/* Hype Reel badge */}
                {post.post_type === "hype_reel" && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 mb-1 text-xs font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-t-xl">
                    <Zap className="w-3 h-3" /> VERIFIED HIGHLIGHT
                  </div>
                )}
                {/* Milestone badge */}
                {post.post_type === "milestone" && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 mb-1 text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-t-xl">
                    <Trophy className="w-3 h-3" /> MILESTONE
                  </div>
                )}
                <PostCard
                  post={post}
                  currentUser={user}
                  onUpdate={refetch}
                  initialHighlighted={highlightedPostIds.has(post.id)}
                  initialFollowing={followingEmails.has(post.author_email)}
                  initialHasAccess={!post.is_premium || post.author_email === user?.email || subscribedCreators.has(post.author_email)}
                />
              </div>
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
