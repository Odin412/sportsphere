import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import PostCard from "../components/feed/PostCard";
import FeedPreferencesDialog from "../components/reels/FeedPreferencesDialog";
import UpcomingStreamsSection from "../components/feed/UpcomingStreamsSection";
import LiveNowSection from "../components/stream/LiveNowSection";
import SportNewsWidget from "../components/feed/SportNewsWidget";
import { Loader2, Search, Settings2, Sparkles, Users, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FeedPagination, { PAGE_SIZE } from "@/components/feed/FeedPagination";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [showPreferences, setShowPreferences] = useState(false);
  const [page, setPage] = useState(1);
  const [feedTab, setFeedTab] = useState("forYou");
  const resetPage = () => setPage(1);

  const { data: preferences } = useQuery({
    queryKey: ["feed-preferences", user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.FeedPreferences.filter({ user_email: user.email });
      return prefs[0] || null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: followedUsers } = useQuery({
    queryKey: ["follows", user?.email],
    queryFn: async () => {
      const follows = await base44.entities.Follow.filter({ follower_email: user.email, status: "accepted" });
      return follows.map(f => f.following_email);
    },
    enabled: !!user,
    staleTime: 60000,
  });

  const { data: allPosts, isLoading, refetch } = useQuery({
    queryKey: ["feed-posts", sportFilter],
    queryFn: () => sportFilter
      ? base44.entities.Post.filter({ sport: sportFilter }, "-created_date", 50)
      : base44.entities.Post.list("-created_date", 50),
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

  const searchedPosts = activePosts
    ?.map(post => {
      if (!searchQuery) return { ...post, _score: 0 };
      const q = searchQuery.toLowerCase();
      let score = 0;
      if (post.author_name?.toLowerCase() === q) score += 100;
      if (post.sport?.toLowerCase() === q) score += 80;
      if (post.author_name?.toLowerCase().includes(q)) score += 40;
      if (post.sport?.toLowerCase().includes(q)) score += 30;
      if (post.content?.toLowerCase().includes(q)) score += 20;
      if (post.category?.toLowerCase().includes(q)) score += 10;
      if (post.ai_tags?.some(t => t.toLowerCase().includes(q))) score += 15;
      return { ...post, _score: score };
    })
    .filter(post => !searchQuery || post._score > 0)
    .sort((a, b) => searchQuery ? b._score - a._score : 0);

  const totalPosts = searchedPosts?.length || 0;
  const posts = searchedPosts?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); resetPage(); }}
          placeholder="Search posts, athletes, sports..."
          className="pl-10 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 h-10 focus:border-red-500 focus:ring-red-500/20"
        />
      </div>

      {/* Sport filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => { setSportFilter(null); resetPage(); }}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            !sportFilter ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
          }`}
        >
          🌟 All
        </button>
        {SPORTS_LIST.map(s => (
          <button
            key={s.name}
            onClick={() => { setSportFilter(s.name === sportFilter ? null : s.name); resetPage(); }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              sportFilter === s.name ? "bg-red-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>

      {/* Feed tabs */}
      {user && (
        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800">
          <button
            onClick={() => { setFeedTab("forYou"); resetPage(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
              feedTab === "forYou" ? "bg-red-600 text-white" : "text-gray-500 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" /> For You
          </button>
          <button
            onClick={() => { setFeedTab("following"); resetPage(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
              feedTab === "following" ? "bg-red-600 text-white" : "text-gray-500 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" /> Following
          </button>
          <button
            onClick={() => setShowPreferences(true)}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
            title="Feed Preferences"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sports News Widget */}
      {!searchQuery && !sportFilter && (
        <SportNewsWidget />
      )}

      {/* Live Now */}
      {!searchQuery && !sportFilter && (
        <LiveNowSection user={user} userPreferences={preferences} />
      )}

      {/* Upcoming Streams */}
      {!searchQuery && !sportFilter && (
        <UpcomingStreamsSection user={user} />
      )}

      {/* Posts */}
      <div>
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
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
            {posts?.map(post => (
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

      {showPreferences && user && (
        <FeedPreferencesDialog user={user} onClose={() => setShowPreferences(false)} />
      )}
    </div>
  );
}
