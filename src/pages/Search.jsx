import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Users, Radio, FileText, Trophy, Heart, MessageCircle, Eye, X, Clock, SlidersHorizontal, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import moment from "moment";
import { debounce } from "lodash";

const STATUS_GRADIENTS = {
  Basketball: "from-orange-600 to-red-700",
  Soccer:     "from-green-600 to-teal-700",
  Football:   "from-amber-700 to-yellow-800",
  Baseball:   "from-blue-700 to-indigo-800",
  Tennis:     "from-yellow-500 to-orange-600",
  Swimming:   "from-cyan-600 to-blue-700",
  Golf:       "from-emerald-600 to-green-700",
  Track:      "from-red-600 to-pink-700",
  Hockey:     "from-slate-600 to-blue-800",
  MMA:        "from-red-800 to-rose-900",
  CrossFit:   "from-violet-600 to-purple-700",
  default:    "from-gray-700 to-gray-800",
};

const TABS = [
  { id: "all", label: "All", icon: Search },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "users", label: "Users", icon: Users },
  { id: "streams", label: "Streams", icon: Radio },
  { id: "challenges", label: "Challenges", icon: Trophy },
];

export default function SearchPage() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Per-type filters
  const [postSport, setPostSport] = useState("all");
  const [postCategory, setPostCategory] = useState("all");
  const [postSort, setPostSort] = useState("recent");
  const [userSport, setUserSport] = useState("all");
  const [userRole, setUserRole] = useState("all");
  const [streamSport, setStreamSport] = useState("all");
  const [streamStatus, setStreamStatus] = useState("all");
  const [challengeSport, setChallengeSport] = useState("all");
  const [challengeStatus, setChallengeStatus] = useState("all");

  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ss_search_history") || "[]"); }
    catch { return []; }
  });

  const saveToHistory = (q) => {
    if (!q.trim()) return;
    const updated = [q.trim(), ...searchHistory.filter(h => h !== q.trim())].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem("ss_search_history", JSON.stringify(updated));
  };

  const removeFromHistory = (item) => {
    const updated = searchHistory.filter(h => h !== item);
    setSearchHistory(updated);
    localStorage.setItem("ss_search_history", JSON.stringify(updated));
  };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const debouncedSetQuery = useCallback(
    debounce((val) => setDebouncedQuery(val), 300),
    []
  );

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    debouncedSetQuery(e.target.value);
  };

  useEffect(() => {
    if (debouncedQuery.trim()) {
      saveToHistory(debouncedQuery.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["search-posts", debouncedQuery],
    queryFn: () => base44.entities.Post.list("-created_date", 200),
    enabled: debouncedQuery.length >= 1,
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["search-users", debouncedQuery],
    queryFn: () => base44.entities.SportProfile.list("-created_date", 100),
    enabled: debouncedQuery.length >= 1,
  });

  const { data: streams = [], isLoading: loadingStreams } = useQuery({
    queryKey: ["search-streams", debouncedQuery],
    queryFn: () => base44.entities.LiveStream.list("-started_at", 100),
    enabled: debouncedQuery.length >= 1,
  });

  const { data: challenges = [], isLoading: loadingChallenges } = useQuery({
    queryKey: ["search-challenges", debouncedQuery],
    queryFn: () => base44.entities.Challenge.list("-created_date", 100),
    enabled: debouncedQuery.length >= 1,
  });

  // Explore grid — shown before typing (Instagram Explore-style)
  const { data: explorePosts = [] } = useQuery({
    queryKey: ["explore-grid"],
    queryFn: () => base44.entities.Post.list("-created_date", 48),
    staleTime: 5 * 60 * 1000,
    enabled: !debouncedQuery,
  });

  const isLoading = loadingPosts || loadingUsers || loadingStreams || loadingChallenges;

  const matchQuery = (text) =>
    !debouncedQuery || (text || "").toLowerCase().includes(debouncedQuery.toLowerCase());

  // Filtered results
  const filteredPosts = posts.filter((p) => {
    if (!matchQuery(p.content) && !matchQuery(p.author_name) && !matchQuery(p.sport)) return false;
    if (postSport !== "all" && p.sport !== postSport) return false;
    if (postCategory !== "all" && p.category !== postCategory) return false;
    return true;
  }).sort((a, b) => {
    if (postSort === "popular") return (b.likes?.length || 0) - (a.likes?.length || 0);
    if (postSort === "views") return (b.views || 0) - (a.views || 0);
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const filteredUsers = users.filter((u) => {
    if (!matchQuery(u.user_name) && !matchQuery(u.sport) && !matchQuery(u.bio)) return false;
    if (userSport !== "all" && u.sport !== userSport) return false;
    if (userRole !== "all" && u.role !== userRole) return false;
    return true;
  });

  // Deduplicate users by user_email
  const seenUserEmails = new Set();
  const uniqueUsers = filteredUsers.filter((u) => {
    if (seenUserEmails.has(u.user_email)) return false;
    seenUserEmails.add(u.user_email);
    return true;
  });

  const filteredStreams = streams.filter((s) => {
    if (!matchQuery(s.title) && !matchQuery(s.host_name) && !matchQuery(s.sport)) return false;
    if (streamSport !== "all" && s.sport !== streamSport) return false;
    if (streamStatus !== "all" && s.status !== streamStatus) return false;
    return true;
  });

  const filteredChallenges = challenges.filter((c) => {
    if (!matchQuery(c.title) && !matchQuery(c.description) && !matchQuery(c.sport)) return false;
    if (challengeSport !== "all" && c.sport !== challengeSport) return false;
    if (challengeStatus !== "all" && c.status !== challengeStatus) return false;
    return true;
  });

  // Unique sports from results
  const allSports = [...new Set([
    ...posts.map((p) => p.sport),
    ...users.map((u) => u.sport),
    ...streams.map((s) => s.sport),
    ...challenges.map((c) => c.sport),
  ].filter(Boolean))].sort();

  const totalResults = filteredPosts.length + uniqueUsers.length + filteredStreams.length + filteredChallenges.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
            Search
          </h1>
          <p className="text-slate-400">Find posts, users, streams & challenges</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
          <Input
            value={query}
            onChange={handleQueryChange}
            placeholder="Search for anything..."
            className="pl-12 pr-12 py-6 text-lg bg-slate-800/80 border-cyan-500/30 text-white placeholder:text-slate-500 rounded-2xl focus:border-cyan-400/60 focus:ring-cyan-400/20"
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setDebouncedQuery(""); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tabs */}
        {debouncedQuery && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const count =
                tab.id === "all" ? totalResults :
                tab.id === "posts" ? filteredPosts.length :
                tab.id === "users" ? uniqueUsers.length :
                tab.id === "streams" ? filteredStreams.length :
                filteredChallenges.length;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                      : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? "bg-white/20" : "bg-slate-700"
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Recent search history — shown before typing */}
        {!query && searchHistory.length > 0 && (
          <div className="space-y-1 mt-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide px-1">Recent</p>
            {searchHistory.map(item => (
              <div key={item}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-800 cursor-pointer group"
                onClick={() => { setQuery(item); debouncedSetQuery(item); }}>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); removeFromHistory(item); }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-all p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Instagram-style explore grid — shown before typing */}
        {!debouncedQuery && (
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-3 px-1">Explore</p>
            <div className="grid grid-cols-3 gap-0.5 rounded-xl overflow-hidden">
              {explorePosts.map((post) => {
                const hasMedia = post.media_urls?.length > 0;
                const isVideo = hasMedia && (post.media_urls[0]?.includes('.mp4') || post.media_urls[0]?.includes('.mov') || post.media_urls[0]?.includes('video'));
                const gradient = STATUS_GRADIENTS[post.sport] || STATUS_GRADIENTS.default;
                return (
                  <Link key={post.id} to={createPageUrl("UserProfile") + `?email=${post.author_email}`}>
                    <div className="relative aspect-square overflow-hidden bg-gray-900 group cursor-pointer">
                      {hasMedia && !isVideo && (
                        <img src={post.media_urls[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                      {hasMedia && isVideo && (
                        <div className="w-full h-full bg-black relative">
                          <video src={post.media_urls[0]} className="w-full h-full object-cover" muted playsInline />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="w-7 h-7 text-white/90 drop-shadow-lg fill-white" />
                          </div>
                        </div>
                      )}
                      {!hasMedia && (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center p-2`}>
                          <p className="text-white text-[10px] font-semibold text-center line-clamp-4 leading-snug">{post.content}</p>
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <span className="text-white text-xs font-bold">❤️ {post.likes?.length || 0}</span>
                        <span className="text-white text-xs font-bold">💬 {post.comments_count || 0}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading */}
        {debouncedQuery && isLoading && (
          <div className="text-center py-12 text-slate-400">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Searching...
          </div>
        )}

        {/* No results */}
        {debouncedQuery && !isLoading && totalResults === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-semibold text-slate-300">No results for "{debouncedQuery}"</p>
            <p className="text-sm mt-1">Try a different search term or remove filters</p>
          </div>
        )}

        {/* Result summary */}
        {debouncedQuery && !isLoading && totalResults > 0 && (
          <p className="text-slate-400 text-sm px-1">
            <span className="text-white font-semibold">{totalResults}</span> result{totalResults !== 1 ? "s" : ""} for &ldquo;<span className="text-cyan-400">{debouncedQuery}</span>&rdquo;
          </p>
        )}

        {/* Results */}
        {debouncedQuery && !isLoading && totalResults > 0 && (
          <div className="space-y-8">

            {/* POSTS */}
            {(activeTab === "all" || activeTab === "posts") && (
              <section>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    Posts
                    <span className="text-sm font-normal text-slate-400">({filteredPosts.length})</span>
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                    <Select value={postSport} onValueChange={setPostSport}>
                      <SelectTrigger className="h-8 w-32 bg-slate-800 border-slate-600 text-white text-xs">
                        <SelectValue placeholder="Sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sports</SelectItem>
                        {allSports.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={postCategory} onValueChange={setPostCategory}>
                      <SelectTrigger className="h-8 w-36 bg-slate-800 border-slate-600 text-white text-xs">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {["training","game","coaching","instruction","motivation","highlight","other"].map((c) => (
                          <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={postSort} onValueChange={setPostSort}>
                      <SelectTrigger className="h-8 w-32 bg-slate-800 border-slate-600 text-white text-xs">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="popular">Most Liked</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredPosts.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No posts match your search</p>
                    <p className="text-xs mt-1 opacity-60">Try a different term or remove filters</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {filteredPosts.slice(0, activeTab === "all" ? 4 : 20).map((post) => (
                      <Link key={post.id} to={createPageUrl("UserProfile") + `?email=${post.author_email}`}>
                        <Card className="bg-slate-900/60 border-cyan-500/20 hover:border-cyan-400/50 transition-all cursor-pointer">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={post.author_avatar} />
                                <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">{post.author_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm truncate">{post.author_name}</p>
                                <p className="text-xs text-slate-500">{moment(post.created_date).fromNow()}</p>
                              </div>
                              {post.sport && <Badge className="bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs">{post.sport}</Badge>}
                              {post.category && <Badge className="bg-slate-700/60 text-slate-300 text-xs capitalize">{post.category}</Badge>}
                            </div>
                            <p className="text-slate-300 text-sm line-clamp-2">{post.content}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes?.length || 0}</span>
                              <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.comments_count || 0}</span>
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views || 0}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
                {activeTab === "all" && filteredPosts.length > 4 && (
                  <Button variant="ghost" size="sm" className="mt-2 text-cyan-400 hover:text-cyan-300" onClick={() => setActiveTab("posts")}>
                    View all {filteredPosts.length} posts →
                  </Button>
                )}
              </section>
            )}

            {/* USERS */}
            {(activeTab === "all" || activeTab === "users") && (
              <section>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Users
                    <span className="text-sm font-normal text-slate-400">({uniqueUsers.length})</span>
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                    <Select value={userSport} onValueChange={setUserSport}>
                      <SelectTrigger className="h-8 w-32 bg-slate-800 border-slate-600 text-white text-xs">
                        <SelectValue placeholder="Sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sports</SelectItem>
                        {allSports.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={userRole} onValueChange={setUserRole}>
                      <SelectTrigger className="h-8 w-36 bg-slate-800 border-slate-600 text-white text-xs">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {["athlete","coach","trainer","instructor","fan"].map((r) => (
                          <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {uniqueUsers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No athletes or coaches match your search</p>
                    <p className="text-xs mt-1 opacity-60">Try searching by name, sport, or role</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {uniqueUsers.slice(0, activeTab === "all" ? 4 : 20).map((profile) => (
                      <Link key={profile.id} to={createPageUrl("UserProfile") + `?email=${profile.user_email}`}>
                        <Card className="bg-slate-900/60 border-cyan-500/20 hover:border-purple-400/50 transition-all cursor-pointer">
                          <CardContent className="p-4 flex items-center gap-3">
                            <Avatar className="w-12 h-12 ring-2 ring-purple-500/30">
                              <AvatarImage src={profile.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">
                                {profile.user_name?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white truncate">{profile.user_name}</p>
                              <p className="text-xs text-slate-400 truncate">{profile.bio || `${profile.role} · ${profile.sport}`}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {profile.sport && <Badge className="bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs">{profile.sport}</Badge>}
                              {profile.role && <span className="text-xs text-slate-500 capitalize">{profile.role}</span>}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
                {activeTab === "all" && uniqueUsers.length > 4 && (
                  <Button variant="ghost" size="sm" className="mt-2 text-cyan-400 hover:text-cyan-300" onClick={() => setActiveTab("users")}>
                    View all {uniqueUsers.length} users →
                  </Button>
                )}
              </section>
            )}

            {/* STREAMS */}
            {(activeTab === "all" || activeTab === "streams") && (
              <section>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Radio className="w-5 h-5 text-red-400" />
                    Streams
                    <span className="text-sm font-normal text-slate-400">({filteredStreams.length})</span>
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                    <Select value={streamSport} onValueChange={setStreamSport}>
                      <SelectTrigger className="h-8 w-32 bg-slate-800 border-slate-600 text-white text-xs">
                        <SelectValue placeholder="Sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sports</SelectItem>
                        {allSports.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={streamStatus} onValueChange={setStreamStatus}>
                      <SelectTrigger className="h-8 w-32 bg-slate-800 border-slate-600 text-white text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="live">Live Now</SelectItem>
                        <SelectItem value="ended">Ended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredStreams.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Radio className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No streams match your search</p>
                    <p className="text-xs mt-1 opacity-60">Try searching by title, host, or sport</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {filteredStreams.slice(0, activeTab === "all" ? 4 : 20).map((stream) => (
                      <Link key={stream.id} to={createPageUrl("ViewLive") + `?id=${stream.id}`}>
                        <Card className="bg-slate-900/60 border-cyan-500/20 hover:border-red-400/50 transition-all cursor-pointer">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              {stream.status === "live" ? (
                                <Badge className="bg-red-600 text-white text-xs">
                                  <Radio className="w-3 h-3 mr-1 animate-pulse" /> LIVE
                                </Badge>
                              ) : (
                                <Badge className="bg-slate-700 text-slate-300 text-xs">Ended</Badge>
                              )}
                              {stream.sport && <Badge className="bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs">{stream.sport}</Badge>}
                            </div>
                            <p className="font-bold text-white line-clamp-1">{stream.title}</p>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={stream.host_avatar} />
                                <AvatarFallback className="text-xs bg-slate-700">{stream.host_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-slate-400">{stream.host_name}</span>
                              <span className="ml-auto text-xs text-slate-500">{stream.viewers?.length || 0} viewers</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
                {activeTab === "all" && filteredStreams.length > 4 && (
                  <Button variant="ghost" size="sm" className="mt-2 text-cyan-400 hover:text-cyan-300" onClick={() => setActiveTab("streams")}>
                    View all {filteredStreams.length} streams →
                  </Button>
                )}
              </section>
            )}

            {/* CHALLENGES */}
            {(activeTab === "all" || activeTab === "challenges") && (
              <section>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    Challenges
                    <span className="text-sm font-normal text-slate-400">({filteredChallenges.length})</span>
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                    <Select value={challengeSport} onValueChange={setChallengeSport}>
                      <SelectTrigger className="h-8 w-32 bg-slate-800 border-slate-600 text-white text-xs">
                        <SelectValue placeholder="Sport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sports</SelectItem>
                        {allSports.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={challengeStatus} onValueChange={setChallengeStatus}>
                      <SelectTrigger className="h-8 w-32 bg-slate-800 border-slate-600 text-white text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredChallenges.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No challenges match your search</p>
                    <p className="text-xs mt-1 opacity-60">Try a different sport or status filter</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {filteredChallenges.slice(0, activeTab === "all" ? 4 : 20).map((challenge) => (
                      <Link key={challenge.id} to={createPageUrl("ChallengeDetail") + `?id=${challenge.id}`}>
                        <Card className="bg-slate-900/60 border-cyan-500/20 hover:border-amber-400/50 transition-all cursor-pointer">
                          <CardContent className="p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              {challenge.sport && <Badge className="bg-amber-900/60 text-amber-300 border border-amber-500/30 text-xs">{challenge.sport}</Badge>}
                              {challenge.status && (
                                <Badge className={`text-xs ${challenge.status === "active" ? "bg-green-700 text-white" : "bg-slate-700 text-slate-300"} capitalize`}>
                                  {challenge.status}
                                </Badge>
                              )}
                            </div>
                            <p className="font-bold text-white line-clamp-1">{challenge.title}</p>
                            <p className="text-sm text-slate-400 line-clamp-2">{challenge.description}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{challenge.participants?.length || 0} participants</span>
                              {challenge.end_date && <span>Ends {moment(challenge.end_date).fromNow()}</span>}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
                {activeTab === "all" && filteredChallenges.length > 4 && (
                  <Button variant="ghost" size="sm" className="mt-2 text-cyan-400 hover:text-cyan-300" onClick={() => setActiveTab("challenges")}>
                    View all {filteredChallenges.length} challenges →
                  </Button>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}