import React, { useState, useEffect, useCallback } from "react";
import { db } from "@/api/db";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search as SearchIcon, X, Clock, ChevronRight, Plus, Video,
  Users, FileText, Radio, Flame, TrendingUp, Eye, Heart, MessageCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatDistanceToNow } from "date-fns";
import SportCategoryPills from "@/components/search/SportCategoryPills";
import TrendingAthletes from "@/components/search/TrendingAthletes";
import TrainingContentCard from "@/components/search/TrainingContentCard";
import TrainingVideoModal from "@/components/search/TrainingVideoModal";
import SubmitTrainingContent from "@/components/search/SubmitTrainingContent";

// ── Debounce ──
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Search History (localStorage) ──
function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem("ss_search_history") || "[]"); } catch { return []; }
}
function addSearchHistory(q) {
  if (!q?.trim()) return;
  const prev = getSearchHistory().filter((h) => h !== q);
  localStorage.setItem("ss_search_history", JSON.stringify([q, ...prev].slice(0, 8)));
}
function removeSearchHistory(q) {
  localStorage.setItem("ss_search_history", JSON.stringify(getSearchHistory().filter((h) => h !== q)));
}

// ── Tab Config ──
const TABS = [
  { key: "all", label: "All", icon: Flame },
  { key: "people", label: "People", icon: Users },
  { key: "posts", label: "Posts", icon: FileText },
  { key: "videos", label: "Videos", icon: Video },
  { key: "streams", label: "Streams", icon: Radio },
];

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sportFilter, setSportFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [history, setHistory] = useState(getSearchHistory);

  const debouncedQuery = useDebounce(query, 300);
  const isSearching = debouncedQuery.length >= 2;

  // Save to history on search
  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      addSearchHistory(debouncedQuery);
      setHistory(getSearchHistory());
    }
  }, [debouncedQuery]);

  // ── Server-Side Search Queries ──
  const sportClause = sportFilter !== "all" ? sportFilter : null;

  const { data: profileResults = [] } = useQuery({
    queryKey: ["search-profiles", debouncedQuery],
    queryFn: () => db.entities.User.search(debouncedQuery, ["full_name", "email"], null, 30),
    enabled: isSearching,
  });

  const { data: sportProfileResults = [] } = useQuery({
    queryKey: ["search-sport-profiles", debouncedQuery],
    queryFn: () => db.entities.SportProfile.search(debouncedQuery, ["user_name", "sport", "bio", "position"], "-created_date", 30),
    enabled: isSearching,
  });

  const { data: postResults = [] } = useQuery({
    queryKey: ["search-posts", debouncedQuery],
    queryFn: () => db.entities.Post.search(debouncedQuery, ["content", "author_name", "sport"], "-created_date", 30),
    enabled: isSearching,
  });

  const { data: videoResults = [] } = useQuery({
    queryKey: ["search-videos", debouncedQuery],
    queryFn: () => db.entities.TrainingContent.search(debouncedQuery, ["title", "description", "sport", "category"], "-created_date", 30),
    enabled: isSearching,
  });

  const { data: streamResults = [] } = useQuery({
    queryKey: ["search-streams", debouncedQuery],
    queryFn: () => db.entities.LiveStream.search(debouncedQuery, ["title", "host_name", "sport"], "-started_at", 30),
    enabled: isSearching,
  });

  // ── Discovery Queries (shown when not searching) ──
  const { data: trendingProfiles = [] } = useQuery({
    queryKey: ["discover-trending-profiles", sportFilter],
    queryFn: async () => {
      const profiles = sportClause
        ? await db.entities.SportProfile.filter({ sport: sportClause }, "-created_date", 20)
        : await db.entities.SportProfile.list("-created_date", 20);
      return profiles;
    },
    enabled: !isSearching,
  });

  const { data: trainingContent = [] } = useQuery({
    queryKey: ["discover-training", sportFilter],
    queryFn: async () => {
      if (sportClause) {
        return db.entities.TrainingContent.filter({ sport: sportClause }, "-created_date", 12);
      }
      return db.entities.TrainingContent.list("-created_date", 12);
    },
    enabled: !isSearching,
  });

  const { data: popularPosts = [] } = useQuery({
    queryKey: ["discover-popular-posts", sportFilter],
    queryFn: async () => {
      if (sportClause) {
        return db.entities.Post.filter({ sport: sportClause }, "-created_date", 6);
      }
      return db.entities.Post.list("-created_date", 6);
    },
    enabled: !isSearching,
  });

  // ── Merge people results (profiles + sport profiles, deduplicated) ──
  const mergedPeople = React.useMemo(() => {
    const seen = new Set();
    const people = [];
    // Sport profiles first (richer data)
    sportProfileResults.forEach((sp) => {
      const key = sp.user_email;
      if (!key || seen.has(key)) return;
      if (sportClause && sp.sport !== sportClause) return;
      seen.add(key);
      people.push({ ...sp, _type: "sport_profile" });
    });
    // Then regular profiles
    profileResults.forEach((p) => {
      const key = p.email;
      if (!key || seen.has(key)) return;
      seen.add(key);
      people.push({ ...p, user_name: p.full_name, user_email: p.email, _type: "profile" });
    });
    return people;
  }, [profileResults, sportProfileResults, sportClause]);

  // Apply sport filter to post/video/stream results
  const filteredPosts = sportClause ? postResults.filter((p) => p.sport === sportClause) : postResults;
  const filteredVideos = sportClause ? videoResults.filter((v) => v.sport === sportClause) : videoResults;
  const filteredStreams = sportClause ? streamResults.filter((s) => s.sport === sportClause) : streamResults;

  // Tab counts
  const counts = {
    all: mergedPeople.length + filteredPosts.length + filteredVideos.length + filteredStreams.length,
    people: mergedPeople.length,
    posts: filteredPosts.length,
    videos: filteredVideos.length,
    streams: filteredStreams.length,
  };

  const clearSearch = () => { setQuery(""); setActiveTab("all"); };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-5">
      {/* ═══ Search Bar ═══ */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search athletes, training videos, posts..."
          className="pl-12 pr-10 h-12 rounded-2xl bg-gray-900 border-gray-700 text-white text-sm font-medium placeholder:text-gray-500 focus:border-red-600 focus:ring-red-600/20"
          autoFocus
        />
        {query && (
          <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ═══ Sport Category Pills ═══ */}
      <SportCategoryPills selected={sportFilter} onSelect={setSportFilter} />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* DISCOVERY MODE (no active search query)                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {!isSearching && (
        <div className="space-y-6">
          {/* Recent Searches */}
          {history.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {history.map((h) => (
                  <button
                    key={h}
                    onClick={() => setQuery(h)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors group"
                  >
                    {h}
                    <span
                      onClick={(e) => { e.stopPropagation(); removeSearchHistory(h); setHistory(getSearchHistory()); }}
                      className="text-gray-600 hover:text-red-400 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Athletes */}
          <TrendingAthletes profiles={trendingProfiles} />

          {/* Training & Drills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-4 h-4 text-red-400" /> Training & Drills
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSubmit(true)}
                className="gap-1 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl text-[10px] h-7"
              >
                <Plus className="w-3 h-3" /> Submit Content
              </Button>
            </div>
            {trainingContent.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {trainingContent.slice(0, 6).map((tc) => (
                  <TrainingContentCard key={tc.id} content={tc} onClick={setSelectedVideo} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-900 border border-gray-800 rounded-2xl">
                <Video className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm font-medium">No training content yet</p>
                <p className="text-gray-600 text-xs mt-1">Be the first to submit a training video</p>
                <Button
                  size="sm"
                  onClick={() => setShowSubmit(true)}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" /> Submit Content
                </Button>
              </div>
            )}
          </div>

          {/* Popular Posts */}
          {popularPosts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-orange-400" /> Popular Posts
              </h3>
              <div className="space-y-2">
                {popularPosts.slice(0, 4).map((post) => (
                  <PostResultCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* SEARCH RESULTS MODE                                           */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {isSearching && (
        <div className="space-y-5">
          {/* Tab bar */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === key
                    ? "bg-white text-black"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {counts[key] > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeTab === key ? "bg-gray-200 text-gray-700" : "bg-gray-700 text-gray-400"
                  }`}>
                    {counts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Results summary */}
          <p className="text-gray-500 text-xs">
            {counts.all} result{counts.all !== 1 ? "s" : ""} for "{debouncedQuery}"
          </p>

          {/* ── People Results ── */}
          {(activeTab === "all" || activeTab === "people") && mergedPeople.length > 0 && (
            <ResultSection
              title="People"
              icon={<Users className="w-4 h-4 text-blue-400" />}
              count={mergedPeople.length}
              showAll={activeTab === "all" && mergedPeople.length > 4}
              onShowAll={() => setActiveTab("people")}
            >
              <div className="space-y-2">
                {(activeTab === "all" ? mergedPeople.slice(0, 4) : mergedPeople).map((p) => (
                  <PersonResultCard key={p.user_email || p.id} person={p} />
                ))}
              </div>
            </ResultSection>
          )}

          {/* ── Post Results ── */}
          {(activeTab === "all" || activeTab === "posts") && filteredPosts.length > 0 && (
            <ResultSection
              title="Posts"
              icon={<FileText className="w-4 h-4 text-green-400" />}
              count={filteredPosts.length}
              showAll={activeTab === "all" && filteredPosts.length > 3}
              onShowAll={() => setActiveTab("posts")}
            >
              <div className="space-y-2">
                {(activeTab === "all" ? filteredPosts.slice(0, 3) : filteredPosts).map((post) => (
                  <PostResultCard key={post.id} post={post} />
                ))}
              </div>
            </ResultSection>
          )}

          {/* ── Video Results ── */}
          {(activeTab === "all" || activeTab === "videos") && filteredVideos.length > 0 && (
            <ResultSection
              title="Training Videos"
              icon={<Video className="w-4 h-4 text-red-400" />}
              count={filteredVideos.length}
              showAll={activeTab === "all" && filteredVideos.length > 3}
              onShowAll={() => setActiveTab("videos")}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(activeTab === "all" ? filteredVideos.slice(0, 3) : filteredVideos).map((v) => (
                  <TrainingContentCard key={v.id} content={v} onClick={setSelectedVideo} />
                ))}
              </div>
            </ResultSection>
          )}

          {/* ── Stream Results ── */}
          {(activeTab === "all" || activeTab === "streams") && filteredStreams.length > 0 && (
            <ResultSection
              title="Streams"
              icon={<Radio className="w-4 h-4 text-purple-400" />}
              count={filteredStreams.length}
              showAll={activeTab === "all" && filteredStreams.length > 3}
              onShowAll={() => setActiveTab("streams")}
            >
              <div className="space-y-2">
                {(activeTab === "all" ? filteredStreams.slice(0, 3) : filteredStreams).map((s) => (
                  <StreamResultCard key={s.id} stream={s} />
                ))}
              </div>
            </ResultSection>
          )}

          {/* No results */}
          {counts.all === 0 && (
            <div className="text-center py-16">
              <SearchIcon className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-white font-bold text-lg">No results found</p>
              <p className="text-gray-500 text-sm mt-1">Try a different search term or sport filter</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Modals ═══ */}
      <TrainingVideoModal
        content={selectedVideo}
        open={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        userEmail={user?.email}
      />
      <SubmitTrainingContent
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        userEmail={user?.email}
        userName={user?.full_name}
      />
    </div>
  );
}

// ── Result Section Wrapper ──
function ResultSection({ title, icon, count, showAll, onShowAll, children }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-sm flex items-center gap-2">
          {icon} {title}
          <span className="text-gray-600 text-xs font-normal">({count})</span>
        </h3>
        {showAll && (
          <button onClick={onShowAll} className="text-red-400 hover:text-red-300 text-xs font-bold flex items-center gap-0.5">
            See all <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Person Result Card ──
function PersonResultCard({ person }) {
  return (
    <Link
      to={`${createPageUrl("UserProfile")}?email=${person.user_email || person.email}`}
      className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl transition-all group"
    >
      <Avatar className="w-11 h-11 ring-2 ring-gray-700 group-hover:ring-red-600/40 transition-all">
        <AvatarImage src={person.avatar_url || person.photo_url} />
        <AvatarFallback className="bg-gray-800 text-gray-400 font-bold text-sm">
          {(person.user_name || person.full_name || "?").slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm truncate">{person.user_name || person.full_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {person.sport && (
            <Badge className="bg-red-900/30 text-red-400 border-red-800 text-[9px] px-1.5">{person.sport}</Badge>
          )}
          {person.position && (
            <span className="text-gray-500 text-[10px]">{person.position}</span>
          )}
          {person.level && (
            <span className="text-gray-600 text-[10px]">{person.level}</span>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0" />
    </Link>
  );
}

// ── Post Result Card ──
function PostResultCard({ post }) {
  const hasMedia = post.media_urls?.length > 0;
  const isVideo = hasMedia && /\.(mp4|mov|webm)$/i.test(post.media_urls[0]);

  return (
    <div className="p-3 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl transition-all">
      <div className="flex items-start gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={post.author_avatar} />
          <AvatarFallback className="bg-gray-800 text-gray-500 text-xs font-bold">
            {(post.author_name || "?").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-xs truncate">{post.author_name}</span>
            {post.sport && (
              <Badge className="bg-gray-800 text-gray-500 border-gray-700 text-[9px] px-1">{post.sport}</Badge>
            )}
            {post.created_date && (
              <span className="text-gray-600 text-[9px] ml-auto flex-shrink-0">
                {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
              </span>
            )}
          </div>
          <p className="text-gray-300 text-xs mt-1 line-clamp-2 leading-relaxed">{post.content}</p>
          {/* Media thumbnail */}
          {hasMedia && (
            <div className="mt-2 rounded-lg overflow-hidden max-h-32">
              {isVideo ? (
                <div className="relative bg-gray-800 h-24 flex items-center justify-center rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-red-600/80 flex items-center justify-center">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                </div>
              ) : (
                <img src={post.media_urls[0]} alt="" className="w-full h-24 object-cover rounded-lg" />
              )}
            </div>
          )}
          {/* Engagement stats */}
          <div className="flex items-center gap-4 mt-2 text-gray-600 text-[10px]">
            {(post.likes?.length || 0) > 0 && (
              <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {post.likes.length}</span>
            )}
            {post.comments_count > 0 && (
              <span className="flex items-center gap-0.5"><MessageCircle className="w-3 h-3" /> {post.comments_count}</span>
            )}
            {post.views > 0 && (
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {post.views}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Stream Result Card ──
function StreamResultCard({ stream }) {
  const isLive = stream.status === "live";
  return (
    <Link
      to={`${createPageUrl("ViewLive")}?id=${stream.id}`}
      className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl transition-all group"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isLive ? "bg-red-900/50 border border-red-800" : "bg-gray-800 border border-gray-700"
      }`}>
        <Radio className={`w-4 h-4 ${isLive ? "text-red-400" : "text-gray-500"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-xs truncate">{stream.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-gray-500 text-[10px]">{stream.host_name}</span>
          {stream.sport && (
            <Badge className="bg-gray-800 text-gray-500 border-gray-700 text-[9px] px-1">{stream.sport}</Badge>
          )}
        </div>
      </div>
      {isLive && (
        <Badge className="bg-red-600 text-white text-[9px] px-2 animate-pulse flex-shrink-0">LIVE</Badge>
      )}
    </Link>
  );
}
