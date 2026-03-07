import React, { useState, useEffect, useRef } from "react";
import { db } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import ReelCard from "@/components/reels/ReelCard";
import { Loader2, Sparkles, Settings, Plus, Play, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import FeedPreferencesDialog from "@/components/reels/FeedPreferencesDialog";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { SkeletonReelGrid } from "@/components/ui/SkeletonCard";

export default function Reels() {
  const [user, setUser] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeReelIndex, setActiveReelIndex] = useState(null); // null = grid, number = fullscreen
  const [showPreferences, setShowPreferences] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    db.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ["feed-preferences", user?.email],
    queryFn: async () => {
      const prefs = await db.entities.FeedPreferences.filter({ user_email: user.email });
      return prefs[0] || null;
    },
    enabled: !!user,
  });

  // Fetch user's engagement data for personalization
  const { data: follows = [] } = useQuery({
    queryKey: ["user-follows", user?.email],
    queryFn: () => db.entities.Follow.filter({ follower_email: user.email }),
    enabled: !!user,
  });

  const { data: likedPosts = [] } = useQuery({
    queryKey: ["user-likes", user?.email],
    queryFn: () => db.entities.Post.list("-created_date", 500).then(posts => 
      posts.filter(p => p.likes?.includes(user.email))
    ),
    enabled: !!user,
  });

  const { data: userProfiles = [] } = useQuery({
    queryKey: ["user-sport-profiles", user?.email],
    queryFn: () => db.entities.SportProfile.filter({ user_email: user.email }),
    enabled: !!user,
  });

  // Fetch all content
  const { data: allPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["all-posts"],
    queryFn: () => db.entities.Post.list("-created_date", 100),
  });

  const { data: liveStreams = [] } = useQuery({
    queryKey: ["live-streams-reels"],
    queryFn: () => db.entities.LiveStream.filter({ status: "live" }),
    refetchInterval: 10000,
  });

  // Personalization algorithm with preferences
  const recommendedContent = React.useMemo(() => {
    if (!user || allPosts.length === 0) return allPosts;

    // Get user's preferred sports
    const userSports = userProfiles.map(p => p.sport);
    const likedSports = likedPosts.map(p => p.sport).filter(Boolean);
    const preferredSports = [...new Set([...userSports, ...likedSports, ...(preferences?.preferred_sports || [])])];
    const excludedSports = preferences?.excluded_sports || [];

    // Get followed users
    const followedEmails = follows.map(f => f.following_email);

    // Filter and score posts
    const scoredPosts = allPosts
      .filter(post => {
        // Filter by excluded sports
        if (excludedSports.length > 0 && post.sport && excludedSports.includes(post.sport)) {
          return false;
        }
        // Filter by content types if set
        if (preferences?.content_types?.length > 0 && post.category && !preferences.content_types.includes(post.category)) {
          return false;
        }
        return true;
      })
      .map(post => {
        let score = 0;
        const reasons = [];

        // Following bonus (highest priority)
        if (followedEmails.includes(post.author_email)) {
          score += 100;
          reasons.push("You follow this creator");
        }

        // Sport preference bonus
        if (post.sport && preferredSports.includes(post.sport)) {
          score += 50;
          reasons.push(`You're interested in ${post.sport}`);
        }

        // Category preference (based on liked posts)
        const likedCategories = likedPosts.map(p => p.category).filter(Boolean);
        if (post.category && likedCategories.includes(post.category)) {
          score += 30;
          reasons.push(`You like ${post.category} content`);
        }

        // Engagement score (quality indicator)
        const engagementRate = ((post.likes?.length || 0) + (post.comments_count || 0)) / Math.max(post.views || 1, 1);
        if (engagementRate > 0.1) {
          score += engagementRate * 20;
          reasons.push("Popular content");
        }

        // Recency bonus (newer content)
        const daysSincePost = (Date.now() - new Date(post.created_date)) / (1000 * 60 * 60 * 24);
        if (daysSincePost < 2) {
          score += Math.max(0, 20 - daysSincePost);
          reasons.push("Recent post");
        }

        // Media bonus (posts with media are more engaging)
        if (post.media_urls?.length > 0) score += 15;

        // Don't show user's own posts
        if (post.author_email === user.email) score -= 1000;

        if (reasons.length === 0) reasons.push("Recommended for you");

        return { ...post, score, recommendationReasons: reasons };
      });

    // Sort by score and return
    return scoredPosts.sort((a, b) => b.score - a.score);
  }, [allPosts, user, userProfiles, likedPosts, follows, preferences]);

  // Combine posts and live streams
  const feedItems = React.useMemo(() => {
    const items = [...recommendedContent];
    
    // Only add live streams if user preference allows
    if (preferences?.show_live_streams !== false) {
      liveStreams.forEach((stream, idx) => {
        const position = idx * 5; // Insert every 5 posts
        if (position < items.length) {
          items.splice(position, 0, { ...stream, type: "stream", recommendationReasons: ["Live now"] });
        } else {
          items.push({ ...stream, type: "stream", recommendationReasons: ["Live now"] });
        }
      });
    }

    return items;
  }, [recommendedContent, liveStreams, preferences]);

  useEffect(() => {
    if (activeReelIndex === null) return; // only active in fullscreen mode
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (e.key === "ArrowDown" && currentIndex < feedItems.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === "Escape") {
        setActiveReelIndex(null);
      }
    };

    const handleSwipeNext = () => {
      if (currentIndex < feedItems.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    };

    const handleSwipePrev = () => {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("reelSwipeNext", handleSwipeNext);
    window.addEventListener("reelSwipePrev", handleSwipePrev);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("reelSwipeNext", handleSwipeNext);
      window.removeEventListener("reelSwipePrev", handleSwipePrev);
    };
  }, [currentIndex, feedItems.length, activeReelIndex]);

  if (postsLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <SkeletonReelGrid />
      </div>
    );
  }

  return (
    <>
      {/* ── GRID VIEW (default) ─────────────────────────────────────── */}
      {activeReelIndex === null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-2xl mx-auto px-4 py-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-white">Reels</h1>
              {user && (
                <button
                  onClick={() => setShowPreferences(true)}
                  className="p-1.5 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
                  title="Feed Preferences"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
            {user && (
              <Link to={createPageUrl("CreateReel")}>
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2 text-sm font-bold">
                  <Plus className="w-4 h-4" /> Create
                </Button>
              </Link>
            )}
          </div>

          {feedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="text-4xl mb-4">🎬</div>
              <p className="text-white font-bold text-lg">The court is quiet.</p>
              <p className="text-gray-400 text-sm mt-1 mb-5">Drop the first reel in your sport and set the tone.</p>
              <Link to={createPageUrl("CreateReel")} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors">
                Create a Reel
              </Link>
            </div>
          ) : (
            /* 2-column reel grid */
            <div className="grid grid-cols-2 gap-1.5">
              {feedItems.map((item, idx) => {
                const src = item.media_urls?.[0];
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveReelIndex(idx); setCurrentIndex(idx); }}
                    className="relative aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden group cursor-pointer text-left"
                  >
                    {src ? (
                      <video
                        src={src}
                        className="w-full h-full object-cover"
                        muted
                        autoPlay
                        loop
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-3">
                        <p className="text-white text-xs font-semibold text-center line-clamp-5 leading-snug">{item.content}</p>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    {/* Sport badge */}
                    {item.sport && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                          {item.sport}
                        </span>
                      </div>
                    )}
                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <p className="text-white text-xs font-semibold truncate">{item.author_name?.split(" ")[0]}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-white/80 text-[10px]">❤️ {item.likes?.length || 0}</span>
                        <span className="text-white/80 text-[10px]">💬 {item.comments_count || 0}</span>
                      </div>
                    </div>
                    {/* Play icon on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ── FULLSCREEN PLAYER (modal on click) ─────────────────────── */}
      {activeReelIndex !== null && (
        <div className="fixed inset-0 bg-black z-[200]">
          {/* Back button */}
          <button
            onClick={() => setActiveReelIndex(null)}
            className="absolute top-4 left-4 z-[210] bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Full-screen scroll player */}
          <div
            ref={scrollRef}
            className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          >
            {feedItems.map((item, index) => (
              <div key={item.id} className="snap-start h-screen">
                <ReelCard
                  item={item}
                  currentUser={user}
                  isActive={index === currentIndex}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferences Dialog */}
      {showPreferences && (
        <FeedPreferencesDialog
          user={user}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </>
  );
}