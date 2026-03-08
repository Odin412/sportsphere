import React, { useState, useEffect } from "react";
import { db } from "@/api/db";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatsChart from "@/components/stats/StatsChart";
import {
  Crosshair, Search, Filter, MapPin, Trophy, Medal, TrendingUp,
  MessageCircle, Bookmark, BookmarkCheck, X, ChevronRight,
  Users, Loader2, BarChart2, ExternalLink, Star,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const SPORTS = [
  "All", "Basketball", "Soccer", "Football", "Baseball", "Tennis", "Golf",
  "Swimming", "Hockey", "Track", "MMA", "CrossFit", "Volleyball", "Cycling",
];

const LEVELS = ["All", "beginner", "intermediate", "advanced", "professional", "elite"];

const SPORT_EMOJIS = {
  Basketball: "🏀", Soccer: "⚽", Football: "🏈", Baseball: "⚾",
  Tennis: "🎾", Golf: "⛳", Swimming: "🏊", Hockey: "🏒",
  Track: "🏃", MMA: "🥋", CrossFit: "💪", Volleyball: "🏐", Cycling: "🚴",
};

const LEVEL_COLORS = {
  beginner:     "bg-gray-700 text-gray-300",
  intermediate: "bg-blue-900/50 text-blue-300 border border-blue-700",
  advanced:     "bg-purple-900/50 text-purple-300 border border-purple-700",
  professional: "bg-orange-900/50 text-orange-300 border border-orange-700",
  elite:        "bg-red-900/50 text-red-400 border border-red-700",
};

const SESSION_TYPE_COLORS = {
  game:        "bg-red-900/50 text-red-300",
  training:    "bg-blue-900/50 text-blue-300",
  practice:    "bg-green-900/50 text-green-300",
  competition: "bg-purple-900/50 text-purple-300",
  other:       "bg-gray-700 text-gray-300",
};

const SHORTLIST_KEY = "scouting_shortlist_v1";

function getShortlist() {
  try {
    return JSON.parse(localStorage.getItem(SHORTLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

function setShortlist(ids) {
  localStorage.setItem(SHORTLIST_KEY, JSON.stringify(ids));
}

export default function ScoutingHub() {
  const { user } = useAuth();
  const [sportFilter, setSportFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("browse"); // "browse" | "shortlist"
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [shortlist, setShortlistState] = useState(getShortlist);

  // Sync shortlist from localStorage on mount
  useEffect(() => {
    setShortlistState(getShortlist());
  }, []);

  // All athlete sport profiles
  const { data: allProfiles = [], isLoading } = useQuery({
    queryKey: ["sport-profiles-scouts"],
    queryFn: () => db.entities.SportProfile.filter({ role: "athlete" }, null, 150),
    staleTime: 5 * 60 * 1000,
  });

  // Recent posts (for post count per athlete)
  const { data: recentPosts = [] } = useQuery({
    queryKey: ["recent-posts-scout"],
    queryFn: () => db.entities.Post.list("-created_date", 200),
    staleTime: 60000,
  });

  // Stat entries for selected athlete (loaded on demand)
  const { data: selectedStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ["selected-athlete-stats", selectedProfile?.id],
    queryFn: () =>
      db.entities.StatEntry.filter(
        { sport_profile_id: selectedProfile.id },
        "-date",
        20
      ),
    enabled: !!selectedProfile,
    staleTime: 60000,
  });

  const getPostCount = (email) => recentPosts.filter((p) => p.author_email === email).length;
  const getLastActive = (email) => {
    const posts = recentPosts.filter((p) => p.author_email === email);
    if (!posts.length) return null;
    return posts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0].created_date;
  };

  // Filter profiles
  const filtered = allProfiles.filter((p) => {
    if (sportFilter !== "All" && p.sport !== sportFilter) return false;
    if (levelFilter !== "All" && p.level !== levelFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !p.user_name?.toLowerCase().includes(q) &&
        !p.sport?.toLowerCase().includes(q) &&
        !p.location?.toLowerCase().includes(q) &&
        !p.team?.toLowerCase().includes(q) &&
        !p.bio?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const shortlistedProfiles = allProfiles.filter((p) => shortlist.includes(p.id));
  const activeProfiles = activeTab === "shortlist" ? shortlistedProfiles : filtered;

  const isShortlisted = (profileId) => shortlist.includes(profileId);

  const toggleShortlist = (profileId) => {
    if (!user) {
      toast.error("Sign in to save athletes to your shortlist");
      return;
    }
    const updated = isShortlisted(profileId)
      ? shortlist.filter((id) => id !== profileId)
      : [...shortlist, profileId];
    setShortlist(updated);
    setShortlistState(updated);
    toast.success(isShortlisted(profileId) ? "Removed from shortlist" : "Added to shortlist");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-2xl p-6 border border-gray-800 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-transparent" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className="w-6 h-6 text-red-400" />
              <h1 className="text-2xl font-bold text-white">Scouting Hub</h1>
              <Badge className="bg-red-600/20 text-red-400 border border-red-800 text-xs">Coach View</Badge>
            </div>
            <p className="text-gray-400 text-sm max-w-lg">
              Your recruiting workspace. Browse athletes, review performance stats, and build your shortlist.
            </p>
            <div className="flex gap-3 mt-4 flex-wrap">
              <div className="flex items-center gap-2 bg-black/40 rounded-full px-3 py-1.5">
                <Users className="w-3.5 h-3.5 text-red-400" />
                <span className="text-white text-xs font-semibold">{allProfiles.length} Athletes</span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 rounded-full px-3 py-1.5">
                <Star className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-white text-xs font-semibold">{shortlist.length} Shortlisted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800 mb-5">
        <button
          onClick={() => { setActiveTab("browse"); setSelectedProfile(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "browse" ? "bg-red-600 text-white" : "text-gray-500 hover:text-white"
          }`}
        >
          <Search className="w-4 h-4" /> Browse Athletes
        </button>
        <button
          onClick={() => { setActiveTab("shortlist"); setSelectedProfile(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "shortlist" ? "bg-red-600 text-white" : "text-gray-500 hover:text-white"
          }`}
        >
          <Bookmark className="w-4 h-4" /> Shortlist
          {shortlist.length > 0 && (
            <span className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {shortlist.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters (Browse tab only) */}
      {activeTab === "browse" && (
        <div className="space-y-3 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, sport, team, location..."
              className="pl-10 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder:text-gray-500 h-10 focus:border-red-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {SPORTS.map((s) => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
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
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-gray-500" />
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => setLevelFilter(l)}
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
          <p className="text-gray-500 text-sm">
            {filtered.length} athlete{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
      )}

      {/* Main content: split layout when athlete is selected */}
      <div className={`flex gap-5 ${selectedProfile ? "items-start" : ""}`}>

        {/* Athlete Grid */}
        <div className={`${selectedProfile ? "hidden lg:block lg:w-80 flex-shrink-0" : "w-full"}`}>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
            </div>
          ) : activeProfiles.length === 0 ? (
            <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
              <p className="text-4xl mb-3">{activeTab === "shortlist" ? "⭐" : "🔭"}</p>
              <p className="text-white font-semibold">
                {activeTab === "shortlist" ? "No athletes shortlisted yet" : "No athletes found"}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {activeTab === "shortlist"
                  ? "Browse athletes and tap the bookmark to shortlist them"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            <div className={`${selectedProfile ? "space-y-2" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}`}>
              {activeProfiles.map((profile) => {
                const lastActive = getLastActive(profile.user_email);
                const postCount = getPostCount(profile.user_email);
                const isSelected = selectedProfile?.id === profile.id;
                const shortlisted = isShortlisted(profile.id);

                if (selectedProfile) {
                  // Compact list mode when side panel is open
                  return (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedProfile(profile)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                        isSelected
                          ? "bg-red-600/10 border-red-800"
                          : "bg-gray-900 border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={profile.avatar_url} />
                        <AvatarFallback className="bg-red-600 text-white text-sm font-bold">
                          {profile.user_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{profile.user_name}</p>
                        <p className="text-gray-500 text-xs truncate">
                          {SPORT_EMOJIS[profile.sport]} {profile.sport}
                          {profile.level && ` · ${profile.level}`}
                        </p>
                      </div>
                      {shortlisted && <Bookmark className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />}
                    </button>
                  );
                }

                // Full card mode
                return (
                  <div
                    key={profile.id}
                    className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all group"
                  >
                    <div className="h-14 bg-gradient-to-r from-red-950 to-gray-900 relative">
                      <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-red-500 to-transparent" />
                    </div>
                    <div className="px-4 pb-4 -mt-7 relative">
                      <div className="flex items-end justify-between mb-2">
                        <Avatar className="w-14 h-14 ring-4 ring-gray-900 shadow-xl">
                          <AvatarImage src={profile.avatar_url} />
                          <AvatarFallback className="bg-red-600 text-white text-xl font-bold">
                            {profile.user_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleShortlist(profile.id); }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            shortlisted
                              ? "text-yellow-400 hover:text-yellow-300"
                              : "text-gray-600 hover:text-yellow-400"
                          }`}
                          title={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
                        >
                          {shortlisted ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>

                      <h3 className="text-white font-bold text-base leading-tight">{profile.user_name}</h3>

                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <Badge className="bg-gray-800 text-gray-200 text-xs">
                          {SPORT_EMOJIS[profile.sport] || "🏆"} {profile.sport}
                        </Badge>
                        {profile.level && (
                          <Badge className={`text-xs capitalize ${LEVEL_COLORS[profile.level] || "bg-gray-700 text-gray-300"}`}>
                            {profile.level}
                          </Badge>
                        )}
                      </div>

                      {profile.location && (
                        <div className="flex items-center gap-1 mt-1.5 text-gray-500 text-xs">
                          <MapPin className="w-3 h-3" />
                          {profile.location}
                        </div>
                      )}

                      {profile.team && (
                        <p className="text-gray-400 text-xs mt-1 truncate">🏟️ {profile.team}</p>
                      )}

                      {profile.bio && (
                        <p className="text-gray-500 text-xs mt-2 line-clamp-2 leading-relaxed">{profile.bio}</p>
                      )}

                      {profile.achievements?.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <Medal className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                          <p className="text-yellow-600 text-xs truncate font-medium">
                            {profile.achievements[0]}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-gray-800 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> {postCount} posts
                        </span>
                        {profile.years_experience && (
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> {profile.years_experience}yr exp
                          </span>
                        )}
                        {lastActive && (
                          <span className="ml-auto">{formatDistanceToNow(new Date(lastActive), { addSuffix: true })}</span>
                        )}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs"
                          onClick={() => setSelectedProfile(profile)}
                        >
                          <BarChart2 className="w-3 h-3 mr-1" /> View Stats
                        </Button>
                        <Link to={createPageUrl("UserProfile") + `?email=${profile.user_email}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white rounded-xl px-3"
                            title="Full profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Panel — athlete detail */}
        {selectedProfile && (
          <div className="flex-1 min-w-0 space-y-4">
            {/* Mobile back button */}
            <button
              onClick={() => setSelectedProfile(null)}
              className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to list
            </button>

            {/* Profile header */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 ring-2 ring-gray-700">
                    <AvatarImage src={selectedProfile.avatar_url} />
                    <AvatarFallback className="bg-red-600 text-white text-xl font-bold">
                      {selectedProfile.user_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-white font-bold text-xl">{selectedProfile.user_name}</h2>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge className="bg-gray-800 text-gray-200 text-xs">
                        {SPORT_EMOJIS[selectedProfile.sport] || "🏆"} {selectedProfile.sport}
                      </Badge>
                      {selectedProfile.level && (
                        <Badge className={`text-xs capitalize ${LEVEL_COLORS[selectedProfile.level] || "bg-gray-700 text-gray-300"}`}>
                          {selectedProfile.level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                {selectedProfile.location && (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <MapPin className="w-3.5 h-3.5 text-gray-600" />
                    {selectedProfile.location}
                  </div>
                )}
                {selectedProfile.team && (
                  <div className="text-gray-400">🏟️ {selectedProfile.team}</div>
                )}
                {selectedProfile.years_experience && (
                  <div className="text-gray-400">
                    <Trophy className="w-3.5 h-3.5 inline mr-1.5 text-gray-600" />
                    {selectedProfile.years_experience} years exp.
                  </div>
                )}
              </div>

              {selectedProfile.bio && (
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{selectedProfile.bio}</p>
              )}

              {selectedProfile.achievements?.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Achievements</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProfile.achievements.map((ach) => (
                      <span
                        key={ach}
                        className="text-xs bg-yellow-900/30 text-yellow-500 border border-yellow-800 px-2 py-0.5 rounded-full"
                      >
                        🏅 {ach}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => toggleShortlist(selectedProfile.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isShortlisted(selectedProfile.id)
                      ? "bg-yellow-900/30 text-yellow-400 border border-yellow-800 hover:bg-yellow-900/50"
                      : "bg-gray-800 text-gray-300 border border-gray-700 hover:border-yellow-700 hover:text-yellow-400"
                  }`}
                >
                  {isShortlisted(selectedProfile.id) ? (
                    <><BookmarkCheck className="w-4 h-4" /> Shortlisted</>
                  ) : (
                    <><Bookmark className="w-4 h-4" /> Add to Shortlist</>
                  )}
                </button>
                <Link to={createPageUrl("Messages")}>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 transition-all">
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                </Link>
                <Link to={createPageUrl("UserProfile") + `?email=${selectedProfile.user_email}`}>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition-all">
                    <ExternalLink className="w-4 h-4" /> Full Profile
                  </button>
                </Link>
              </div>
            </div>

            {/* Stat entries */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-orange-400" /> Performance Stats
              </h3>

              {statsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                </div>
              ) : selectedStats.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart2 className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No stats logged yet</p>
                  <p className="text-gray-600 text-xs mt-1">This athlete hasn't logged session data yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Last 5 sessions */}
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Recent Sessions</p>
                    <div className="space-y-2">
                      {selectedStats.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="bg-gray-800 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white text-xs font-semibold">
                              {format(new Date(entry.date), "MMM d, yyyy")}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                                SESSION_TYPE_COLORS[entry.session_type] || SESSION_TYPE_COLORS.other
                              }`}
                            >
                              {entry.session_type}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(entry.metrics || []).map((m, i) => (
                              <span key={i} className="text-xs text-gray-400 bg-gray-900 px-2 py-0.5 rounded-lg">
                                {m.name}: <span className="text-white font-semibold">{m.value}</span>
                                <span className="text-gray-600 ml-0.5">{m.unit}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart */}
                  {selectedStats.length > 1 && (
                    <div>
                      <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Trend Charts</p>
                      <StatsChart stats={selectedStats} sport={selectedProfile.sport} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
