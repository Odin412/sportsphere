import React, { useState, useMemo } from "react";
import { db, supabase } from "@/api/db";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin, Search, Star, Trophy, Users, Eye, MessageCircle,
  ChevronRight, Loader2, Filter, Zap, Medal, TrendingUp, ShieldCheck, Crown,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import AdvancedStatFilters from "@/components/recruiting/AdvancedStatFilters";
import { SPORT_STAT_FILTERS } from "@/data/sportStatFilters";

const SPORTS = [
  "All", "Basketball", "Soccer", "Football", "Baseball", "Tennis", "Golf",
  "Swimming", "Hockey", "Track", "MMA", "CrossFit", "Volleyball", "Cycling",
];

const LEVELS = ["All", "beginner", "intermediate", "advanced", "professional", "elite"];

const LEVEL_COLORS = {
  beginner:     "bg-gray-700 text-gray-300",
  intermediate: "bg-blue-900/50 text-blue-300 border border-blue-700",
  advanced:     "bg-purple-900/50 text-purple-300 border border-purple-700",
  professional: "bg-orange-900/50 text-orange-300 border border-orange-700",
  elite:        "bg-red-900/50 text-red-400 border border-red-700",
};

const SPORT_EMOJIS = {
  Basketball: "\u{1F3C0}", Soccer: "\u26BD", Football: "\u{1F3C8}", Baseball: "\u26BE",
  Tennis: "\u{1F3BE}", Golf: "\u26F3", Swimming: "\u{1F3CA}", Hockey: "\u{1F3D2}",
  Track: "\u{1F3C3}", MMA: "\u{1F94B}", CrossFit: "\u{1F4AA}", Volleyball: "\u{1F3D0}", Cycling: "\u{1F6B4}",
};

const PAGE_SIZE = 20;

export default function GetNoticed() {
  const { user } = useAuth();
  const [sportFilter, setSportFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const [page, setPage] = useState(0);
  const [advFilters, setAdvFilters] = useState({
    position: "",
    state: "",
    gradYear: "",
    verifiedOnly: false,
    sortBy: "relevance",
    statThresholds: {},
  });

  // All sport profiles (athlete role)
  const { data: allProfiles = [], isLoading } = useQuery({
    queryKey: ["sport-profiles-all"],
    queryFn: () => db.entities.SportProfile.filter({ role: "athlete" }, "-created_at", 500),
    staleTime: 5 * 60 * 1000,
  });

  // My own sport profiles
  const { data: myProfiles = [], refetch: refetchMyProfiles } = useQuery({
    queryKey: ["my-sport-profiles", user?.email],
    queryFn: () => db.entities.SportProfile.filter({ user_email: user.email }),
    enabled: !!user,
  });

  // Recent posts for athletes (to show activity)
  const { data: recentPosts = [] } = useQuery({
    queryKey: ["recent-athlete-posts"],
    queryFn: () => db.entities.Post.list("-created_date", 200),
    staleTime: 60000,
  });

  // Filter + sort profiles
  const filtered = useMemo(() => {
    let results = allProfiles.filter((p) => {
      if (sportFilter !== "All" && p.sport !== sportFilter) return false;
      if (levelFilter !== "All" && p.level !== levelFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !p.user_name?.toLowerCase().includes(q) &&
          !p.sport?.toLowerCase().includes(q) &&
          !p.location?.toLowerCase().includes(q) &&
          !p.team?.toLowerCase().includes(q) &&
          !p.bio?.toLowerCase().includes(q) &&
          !p.position?.toLowerCase().includes(q) &&
          !p.state?.toLowerCase().includes(q)
        ) return false;
      }
      // Advanced filters
      if (advFilters.position && p.position !== advFilters.position) return false;
      if (advFilters.state && p.state !== advFilters.state) return false;
      if (advFilters.gradYear && p.graduation_year !== parseInt(advFilters.gradYear)) return false;
      if (advFilters.verifiedOnly && !p.verified_stats) return false;

      // Stat threshold filters (using cached stat_summary JSONB)
      const thresholds = advFilters.statThresholds || {};
      const summary = p.stat_summary || {};
      for (const [key, minVal] of Object.entries(thresholds)) {
        if (minVal === undefined || minVal === null) continue;
        const statDef = (SPORT_STAT_FILTERS[p.sport] || []).find((s) => s.key === key);
        if (statDef?.lowerIsBetter) {
          // For "lower is better" stats, filter for values <= threshold
          if (summary[key] === undefined || summary[key] > minVal) return false;
        } else {
          // Standard: filter for values >= threshold
          if (summary[key] === undefined || summary[key] < minVal) return false;
        }
      }
      return true;
    });

    // Sort
    const sortBy = advFilters.sortBy || "relevance";
    if (sortBy === "most_active") {
      results.sort((a, b) => {
        const aCount = recentPosts.filter((p) => p.author_email === a.user_email).length;
        const bCount = recentPosts.filter((p) => p.author_email === b.user_email).length;
        return bCount - aCount;
      });
    } else if (sortBy.startsWith("stat_")) {
      const statKey = sortBy.replace("stat_", "");
      const statDef = (SPORT_STAT_FILTERS[sportFilter] || []).find((s) => s.key === statKey);
      results.sort((a, b) => {
        const aVal = a.stat_summary?.[statKey] ?? (statDef?.lowerIsBetter ? Infinity : -Infinity);
        const bVal = b.stat_summary?.[statKey] ?? (statDef?.lowerIsBetter ? Infinity : -Infinity);
        return statDef?.lowerIsBetter ? aVal - bVal : bVal - aVal;
      });
    } else {
      // Default: verified first, then by tier (pro_scout > free), then recency
      results.sort((a, b) => {
        const aVerified = a.verified_stats ? 1 : 0;
        const bVerified = b.verified_stats ? 1 : 0;
        if (bVerified !== aVerified) return bVerified - aVerified;
        const aTier = a.subscription_tier === "elite" ? 2 : a.subscription_tier === "pro_scout" ? 1 : 0;
        const bTier = b.subscription_tier === "elite" ? 2 : b.subscription_tier === "pro_scout" ? 1 : 0;
        if (bTier !== aTier) return bTier - aTier;
        return 0;
      });
    }

    return results;
  }, [allProfiles, sportFilter, levelFilter, searchQuery, advFilters, recentPosts]);

  // Pagination
  const pageStart = page * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const paged = filtered.slice(0, pageEnd);
  const hasMore = pageEnd < filtered.length;

  const getPostCount = (email) => recentPosts.filter((p) => p.author_email === email).length;
  const getLastActive = (email) => {
    const posts = recentPosts.filter((p) => p.author_email === email);
    if (!posts.length) return null;
    return posts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0].created_date;
  };

  const handleMessage = (profile) => {
    if (!user) {
      toast.error("Sign in to message athletes");
      return;
    }
    window.location.href = createPageUrl("Messages");
  };

  // Reset page when filters change
  const handleSportFilter = (s) => { setSportFilter(s); setPage(0); };
  const handleLevelFilter = (l) => { setLevelFilter(l); setPage(0); };
  const handleSearch = (e) => { setSearchQuery(e.target.value); setPage(0); };
  const handleAdvFilters = (f) => { setAdvFilters(f); setPage(0); };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

      {/* Hero */}
      <div className="bg-gradient-to-br from-red-950 via-gray-900 to-black rounded-2xl p-6 border border-red-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-6 h-6 text-red-400" />
            <h1 className="text-2xl font-bold text-white">Get Noticed</h1>
          </div>
          <p className="text-gray-400 text-sm max-w-lg">
            The talent showcase for serious athletes. Coaches, scouts, and schools browse here.
            Filter by verified performance data to find exactly who you're looking for.
          </p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-2">
              <Users className="w-4 h-4 text-red-400" />
              <span className="text-white text-sm font-semibold">{allProfiles.length} Athletes</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-2">
              <Trophy className="w-4 h-4 text-red-400" />
              <span className="text-white text-sm font-semibold">{SPORTS.length - 1} Sports</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-2">
              <ShieldCheck className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm font-semibold">Verified Stats</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800">
        <button
          onClick={() => setActiveTab("browse")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "browse" ? "bg-red-600 text-white" : "text-gray-500 hover:text-white"
          }`}
        >
          <Search className="w-4 h-4" /> Browse Athletes
        </button>
        {user && (
          <button
            onClick={() => setActiveTab("my-showcase")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "my-showcase" ? "bg-red-600 text-white" : "text-gray-500 hover:text-white"
            }`}
          >
            <Star className="w-4 h-4" /> My Showcase
          </button>
        )}
      </div>

      {/* BROWSE TAB */}
      {activeTab === "browse" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by name, sport, location, position, state..."
              className="pl-10 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 h-10 focus:border-red-500"
            />
          </div>

          {/* Sport filter chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {SPORTS.map((s) => (
              <button
                key={s}
                onClick={() => handleSportFilter(s)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  sportFilter === s
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                }`}
              >
                {s !== "All" && SPORT_EMOJIS[s] && <span>{SPORT_EMOJIS[s]}</span>}
                {s}
              </button>
            ))}
          </div>

          {/* Level filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => handleLevelFilter(l)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all capitalize ${
                  levelFilter === l
                    ? "bg-gray-600 text-white"
                    : "bg-gray-800/50 text-gray-500 hover:text-gray-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Advanced stat filters */}
          <AdvancedStatFilters
            sport={sportFilter}
            filters={advFilters}
            onFiltersChange={handleAdvFilters}
          />

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-sm">
              {filtered.length} athlete{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Athlete grid */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
              <p className="text-4xl mb-3">{"\u{1F52D}"}</p>
              <p className="text-white font-semibold">No athletes found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paged.map((profile) => {
                  const lastActive = getLastActive(profile.user_email);
                  const postCount = getPostCount(profile.user_email);
                  const isPriority = profile.subscription_tier === "pro_scout" || profile.subscription_tier === "elite";
                  const topStats = profile.stat_summary || {};
                  const statKeys = Object.keys(topStats).slice(0, 3);

                  return (
                    <div
                      key={profile.id}
                      className={`bg-gray-900 rounded-2xl border overflow-hidden hover:border-gray-700 transition-all group ${
                        isPriority ? "border-amber-800/40 ring-1 ring-amber-500/20" : "border-gray-800"
                      }`}
                    >
                      {/* Card header */}
                      <div className={`h-16 relative ${isPriority ? "bg-gradient-to-r from-amber-950 to-gray-900" : "bg-gradient-to-r from-red-950 to-gray-900"}`}>
                        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-red-500 to-transparent" />
                        {isPriority && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 rounded-full px-2 py-0.5">
                            <Crown className="w-3 h-3 text-amber-400" />
                            <span className="text-[10px] text-amber-300 font-bold">PRIORITY</span>
                          </div>
                        )}
                        {profile.verified_stats && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500/20 border border-green-500/30 rounded-full px-2 py-0.5">
                            <ShieldCheck className="w-3 h-3 text-green-400" />
                            <span className="text-[10px] text-green-300 font-bold">VERIFIED</span>
                          </div>
                        )}
                      </div>

                      <div className="px-4 pb-4 -mt-8 relative">
                        <div className="flex items-end justify-between mb-3">
                          <Avatar className="w-16 h-16 ring-4 ring-gray-900 shadow-xl">
                            <AvatarImage src={profile.avatar_url} />
                            <AvatarFallback className="bg-red-600 text-white text-xl font-bold">
                              {profile.user_name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {lastActive && (
                            <span className="text-xs text-gray-600">
                              Active {formatDistanceToNow(new Date(lastActive), { addSuffix: true })}
                            </span>
                          )}
                        </div>

                        <h3 className="text-white font-bold text-lg leading-tight">
                          {profile.user_name}
                        </h3>

                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <Badge className="bg-gray-800 text-gray-200 text-xs">
                            {SPORT_EMOJIS[profile.sport] || "\u{1F3C6}"} {profile.sport}
                          </Badge>
                          {profile.level && (
                            <Badge className={`text-xs capitalize ${LEVEL_COLORS[profile.level] || "bg-gray-700 text-gray-300"}`}>
                              {profile.level}
                            </Badge>
                          )}
                          {profile.position && (
                            <Badge className="bg-cyan-900/40 text-cyan-300 text-xs border border-cyan-800/40">
                              {profile.position}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                          {profile.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {profile.location}
                            </span>
                          )}
                          {profile.state && (
                            <span className="flex items-center gap-1">{profile.state}</span>
                          )}
                          {profile.graduation_year && (
                            <span className="text-cyan-400 font-medium">'{String(profile.graduation_year).slice(-2)}</span>
                          )}
                        </div>

                        {profile.team && (
                          <p className="text-gray-400 text-xs mt-1 truncate">
                            {"\u{1F3DF}\uFE0F"} {profile.team}
                          </p>
                        )}

                        {/* Top stats from stat_summary */}
                        {statKeys.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {statKeys.map((key) => (
                              <span key={key} className="text-[11px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-lg border border-gray-700">
                                {key.replace(/_/g, " ")}: <span className="font-bold text-white">{topStats[key]}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {profile.bio && (
                          <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                            {profile.bio}
                          </p>
                        )}

                        {/* Top achievement */}
                        {profile.achievements?.length > 0 && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <Medal className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                            <p className="text-yellow-600 text-xs truncate font-medium">
                              {profile.achievements[0]}
                            </p>
                          </div>
                        )}

                        {/* Stats row */}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-800">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <TrendingUp className="w-3 h-3" />
                            {postCount} posts
                          </div>
                          {profile.years_experience && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Trophy className="w-3 h-3" />
                              {profile.years_experience}yr exp
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <Link
                            to={createPageUrl("UserProfile") + `?email=${profile.user_email}`}
                            className="flex-1"
                          >
                            <Button
                              size="sm"
                              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs"
                            >
                              View Profile <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                          <Link to={`${createPageUrl("ScoutCard")}?email=${profile.user_email}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-800 text-red-400 hover:bg-red-950/50 hover:text-red-300 rounded-xl px-3"
                              title="View Scout Card"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl px-3"
                            onClick={() => handleMessage(profile)}
                            title="Message athlete"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl"
                  >
                    Load more ({filtered.length - pageEnd} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* MY SHOWCASE TAB */}
      {activeTab === "my-showcase" && user && (
        <div className="space-y-4">
          {myProfiles.length === 0 ? (
            <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
              <p className="text-5xl mb-4">{"\u{1F3C6}"}</p>
              <h3 className="text-white font-bold text-xl mb-2">Put Yourself on the Map</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                Create a sport profile to appear in the athlete directory. Coaches and scouts
                from schools, clubs, and pro teams browse here.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto mb-8 text-left">
                {[
                  { icon: "\u{1F4CB}", title: "Your Stats", desc: "Log match stats and training milestones" },
                  { icon: "\u{1F3AC}", title: "Your Highlights", desc: "Upload reels of your best moments" },
                  { icon: "\u{1F4E9}", title: "Get Messages", desc: "Coaches can contact you directly" },
                ].map((item) => (
                  <div key={item.title} className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                    <p className="text-2xl mb-1">{item.icon}</p>
                    <p className="text-white text-xs font-bold">{item.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
              <Link to={createPageUrl("ProfileSettings")}>
                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8">
                  Set Up My Showcase
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">Your Sport Profiles</h2>
                <Link to={createPageUrl("ProfileSettings")}>
                  <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl text-xs">
                    Edit Profile
                  </Button>
                </Link>
              </div>
              {myProfiles.map((profile) => (
                <div key={profile.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14 ring-2 ring-gray-700">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback className="bg-red-600 text-white font-bold">
                        {profile.user_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-bold">{profile.user_name}</h3>
                        <Badge className="bg-gray-800 text-gray-300 text-xs">
                          {SPORT_EMOJIS[profile.sport]} {profile.sport}
                        </Badge>
                        {profile.level && (
                          <Badge className={`text-xs capitalize ${LEVEL_COLORS[profile.level]}`}>
                            {profile.level}
                          </Badge>
                        )}
                      </div>
                      {profile.bio && <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>}
                      {profile.achievements?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {profile.achievements.map((ach) => (
                            <span key={ach} className="text-xs bg-yellow-900/30 text-yellow-500 border border-yellow-800 px-2 py-0.5 rounded-full">
                              {"\u{1F3C5}"} {ach}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Visibility notice */}
              <div className="bg-green-950/30 border border-green-900/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-green-400" />
                  <p className="text-green-400 font-semibold text-sm">You're Visible to Scouts</p>
                </div>
                <p className="text-gray-500 text-xs">
                  Coaches and recruiters can find you in the Browse Athletes directory. Keep your profile updated with fresh stats and highlight reels.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Not logged in: prompt to sign in for My Showcase */}
      {activeTab === "my-showcase" && !user && (
        <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
          <p className="text-4xl mb-3">{"\u{1F3C6}"}</p>
          <p className="text-white font-semibold">Sign in to create your showcase</p>
          <p className="text-gray-500 text-sm mt-1 mb-6">Get discovered by coaches and scouts</p>
          <Link to={createPageUrl("Login")}>
            <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-8">
              Sign In
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
