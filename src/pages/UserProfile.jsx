import React, { useState, useEffect } from "react";
import { useAuth } from '@/lib/AuthContext';
import { db } from "@/api/db";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageCircle, Trophy, MapPin, Clock, Send, Loader2, ArrowLeft, Lightbulb, Users, Heart, Crown, ShoppingBag, Star, CheckCircle, UserCheck, UserPlus, Hourglass, Instagram, Twitter, Youtube, Globe, Pin, Film, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PostCard from "@/components/feed/PostCard";
import ReelsStatsPanel from "@/components/profile/ReelsStatsPanel";
import SubscriptionTiers from "@/components/monetization/SubscriptionTiers";
import FollowerListModal from "@/components/social/FollowerListModal";
import TrainingStreak from "@/components/propath/TrainingStreak";
import WhosScouting from "@/components/propath/WhosScouting";

export default function UserProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const profileEmail = urlParams.get("email");
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [showAdviceDialog, setShowAdviceDialog] = useState(false);
  const [adviceTopic, setAdviceTopic] = useState("");
  const [adviceMessage, setAdviceMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [followStatus, setFollowStatus] = useState(null); // null | "pending" | "accepted"
  const [gridPost, setGridPost] = useState(null);
  const [showFollowerList, setShowFollowerList] = useState(null); // null | "followers" | "following"

  useEffect(() => {

  }, []);

  useEffect(() => {
    if (currentUser && profileEmail) {
      db.entities.Follow.filter({ 
        follower_email: currentUser.email, 
        following_email: profileEmail 
      }).then(follows => {
        if (follows.length > 0) setFollowStatus(follows[0].status || "accepted");
        else setFollowStatus(null);
      });
    }
  }, [currentUser, profileEmail]);

  const { data: profiles } = useQuery({
    queryKey: ["user-profiles", profileEmail],
    queryFn: () => db.entities.SportProfile.filter({ user_email: profileEmail }),
    enabled: !!profileEmail,
  });

  const { data: posts } = useQuery({
    queryKey: ["user-posts", profileEmail],
    queryFn: () => db.entities.Post.filter({ author_email: profileEmail }, "-created_date", 20),
    enabled: !!profileEmail,
  });

  const profile = profiles?.[0];

  const startConversation = async () => {
    const existing = await db.entities.Conversation.filter({ participants: currentUser.email });
    const found = existing.find(c => c.participants?.includes(profileEmail));
    
    if (found) {
      navigate(createPageUrl("Messages") + `?conv=${found.id}`);
    } else {
      const conv = await db.entities.Conversation.create({
        participants: [currentUser.email, profileEmail],
        participant_names: [currentUser.full_name, profile?.user_name || profileEmail],
      });
      navigate(createPageUrl("Messages") + `?conv=${conv.id}`);
    }
  };

  const sendAdviceRequest = async () => {
    setSending(true);
    await db.entities.AdviceRequest.create({
      from_email: currentUser.email,
      from_name: currentUser.full_name,
      to_email: profileEmail,
      to_name: profile?.user_name,
      sport: profile?.sport,
      topic: adviceTopic,
      message: adviceMessage,
      status: "pending",
    });
    setShowAdviceDialog(false);
    setAdviceTopic("");
    setAdviceMessage("");
    setSending(false);
  };

  const toggleFollow = async () => {
    if (followStatus) {
      const follows = await db.entities.Follow.filter({ 
        follower_email: currentUser.email, 
        following_email: profileEmail 
      });
      if (follows[0]) {
        await db.entities.Follow.delete(follows[0].id);
        setFollowStatus(null);
      }
    } else {
      await db.entities.Follow.create({
        follower_email: currentUser.email,
        following_email: profileEmail,
        status: "pending",
      });
      setFollowStatus("pending");

      await db.entities.Notification.create({
        recipient_email: profileEmail,
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        actor_avatar: currentUser.avatar_url,
        type: "follow_request",
        message: "wants to follow you",
        follow_requester_email: currentUser.email,
      });
    }
  };

  const { data: pinnedHighlight } = useQuery({
    queryKey: ["pinned-highlight", profileEmail],
    queryFn: async () => {
      const highlights = await db.entities.Highlight.filter({ user_email: profileEmail });
      return highlights.find(h => h.is_pinned && h.item_type === "post") || null;
    },
    enabled: !!profileEmail,
  });

  // Fetch the user record directly for name/avatar fallback
  const { data: userRecord } = useQuery({
    queryKey: ["user-record", profileEmail],
    queryFn: async () => {
      const users = await db.entities.User.filter({ email: profileEmail });
      return users[0] || null;
    },
    enabled: !!profileEmail,
  });

  const { data: followerCount } = useQuery({
    queryKey: ["follower-count", profileEmail],
    queryFn: () => db.entities.Follow.filter({ following_email: profileEmail, status: "accepted" }),
    enabled: !!profileEmail,
  });

  const { data: followingCount } = useQuery({
    queryKey: ["following-count", profileEmail],
    queryFn: () => db.entities.Follow.filter({ follower_email: profileEmail, status: "accepted" }),
    enabled: !!profileEmail,
  });

  const isOwnProfile = currentUser?.email === profileEmail;

  // Streak (own profile only)
  const { data: userPoints = null } = useQuery({
    queryKey: ["profile-points", profileEmail],
    queryFn: async () => {
      const pts = await db.entities.UserPoints.filter({ user_email: profileEmail });
      return pts[0] || null;
    },
    enabled: !!profileEmail && isOwnProfile,
  });

  // Stat count for ProPath badge
  const { data: statEntries = [] } = useQuery({
    queryKey: ["profile-stat-entries", profileEmail],
    queryFn: () => db.entities.StatEntry.filter({ user_email: profileEmail }, "-date", 10),
    enabled: !!profileEmail,
  });

  const displayName = profile?.user_name || userRecord?.full_name || profileEmail;
  const displayAvatar = profile?.avatar_url || userRecord?.avatar_url;

  if (!profileEmail) return (
    <div className="text-center py-20 text-slate-400">No user specified.</div>
  );

  const isLoading = !posts && !userRecord && !profiles;

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <Link to={createPageUrl("Explore")} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-28 bg-gradient-to-br from-slate-900 to-slate-800 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10" />
        </div>
        <div className="px-6 pb-6 -mt-10 relative">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Avatar className="w-20 h-20 ring-4 ring-white shadow-lg">
              <AvatarImage src={displayAvatar} />
              <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-xl font-bold">
                {displayName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
              {profile?.location && <p className="text-sm text-slate-500">{profile.location}</p>}
              <div className="flex gap-4 mt-2 text-sm text-slate-500">
                <button onClick={() => setShowFollowerList("followers")} className="text-center hover:opacity-75 transition-opacity">
                  <p className="font-black text-gray-900">{followerCount?.length ?? 0}</p>
                  <p className="text-xs text-gray-500">Followers</p>
                </button>
                <button onClick={() => setShowFollowerList("following")} className="text-center hover:opacity-75 transition-opacity">
                  <p className="font-black text-gray-900">{followingCount?.length ?? 0}</p>
                  <p className="text-xs text-gray-500">Following</p>
                </button>
                <span><strong className="text-slate-800">{posts?.length ?? 0}</strong> posts</span>
              </div>
            </div>
            {currentUser && currentUser.email !== profileEmail && (
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={toggleFollow}
                  size="sm"
                  className={`rounded-xl gap-2 font-bold transition-all ${
                    followStatus === "accepted"
                      ? "bg-green-50 text-green-700 border border-green-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      : followStatus === "pending"
                      ? "bg-amber-50 text-amber-700 border border-amber-300"
                      : "bg-gradient-to-r from-orange-500 to-amber-400 text-white hover:from-orange-600 hover:to-amber-500 shadow-md"
                  }`}
                >
                  {followStatus === "accepted" ? (
                    <><UserCheck className="w-4 h-4" /> Following</>
                  ) : followStatus === "pending" ? (
                    <><Hourglass className="w-4 h-4" /> Requested</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Follow</>
                  )}
                </Button>
                <Button onClick={startConversation} variant="outline" className="rounded-xl gap-2" size="sm">
                  <MessageCircle className="w-4 h-4" /> Message
                </Button>
                <Button onClick={() => setShowAdviceDialog(true)} variant="outline" className="rounded-xl gap-2" size="sm">
                  <Lightbulb className="w-4 h-4" /> Advice
                </Button>
                <Link to={createPageUrl("CreatorShop") + `?creator=${profileEmail}`}>
                  <Button variant="outline" className="rounded-xl gap-2" size="sm">
                    <ShoppingBag className="w-4 h-4" /> Shop
                  </Button>
                </Link>
                {statEntries.length > 0 && (
                  <Link to={`${createPageUrl("ScoutCard")}?email=${profileEmail}`}>
                    <Button variant="outline" size="sm" className="rounded-xl gap-2 border-red-200 text-red-700 hover:bg-red-50">
                      <ShieldCheck className="w-4 h-4" /> Scout Card
                    </Button>
                  </Link>
                )}
              </div>
            )}
            {isOwnProfile && (
              <div className="flex flex-wrap gap-2">
                <Link to={createPageUrl("ProPathHub")}>
                  <Button size="sm" className="rounded-xl gap-2 bg-gradient-to-r from-red-800 to-red-600 text-white">
                    <ShieldCheck className="w-4 h-4" /> ProPath Hub
                  </Button>
                </Link>
                {userPoints?.current_streak > 0 && (
                  <TrainingStreak streak={userPoints.current_streak} compact={true} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ProPath panel — own profile with stats */}
      {isOwnProfile && statEntries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <WhosScouting athleteEmail={profileEmail} />
          <Link
            to={`${createPageUrl("ScoutCard")}?email=${profileEmail}`}
            className="bg-gradient-to-br from-red-950/40 to-gray-900 border border-red-900/30 rounded-2xl p-4 flex items-center gap-3 hover:border-red-800/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-900/50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Your Scout Card</p>
              <p className="text-gray-400 text-xs mt-0.5">{statEntries.length} verified stats · Share with recruiters</p>
            </div>
          </Link>
        </div>
      )}

      {/* Bio + Social Links */}
      {(userRecord?.bio || userRecord?.social_links) && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          {userRecord?.bio && (
            <>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">About</h2>
              <p className="text-sm text-slate-700 leading-relaxed">{userRecord.bio}</p>
            </>
          )}
          {/* Preferred sports + skill level from user record */}
          {(userRecord?.preferred_sports?.length > 0 || userRecord?.skill_level) && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {userRecord.skill_level && <Badge className="bg-slate-900 text-white text-xs capitalize">{userRecord.skill_level}</Badge>}
              {userRecord.preferred_sports?.map(s => (
                <Badge key={s} className="bg-orange-50 text-orange-700 border border-orange-200 text-xs">{s}</Badge>
              ))}
            </div>
          )}
          {/* Social links */}
          {userRecord?.social_links && Object.keys(userRecord.social_links).some(k => userRecord.social_links[k]) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {userRecord.social_links.instagram && (
                <a href={`https://instagram.com/${userRecord.social_links.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full hover:bg-pink-100 transition-colors">
                  <Instagram className="w-3 h-3" /> Instagram
                </a>
              )}
              {userRecord.social_links.twitter && (
                <a href={`https://x.com/${userRecord.social_links.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full hover:bg-sky-100 transition-colors">
                  <Twitter className="w-3 h-3" /> X
                </a>
              )}
              {userRecord.social_links.youtube && (
                <a href={userRecord.social_links.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors">
                  <Youtube className="w-3 h-3" /> YouTube
                </a>
              )}
              {userRecord.social_links.website && (
                <a href={userRecord.social_links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition-colors">
                  <Globe className="w-3 h-3" /> Website
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* Featured Highlight (pinned post) */}
      {pinnedHighlight?.item_data && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
            <Pin className="w-4 h-4 text-orange-500" /> Featured Highlight
          </h2>
          <div className="ring-2 ring-orange-400/40 rounded-3xl overflow-hidden relative">
            <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <Star className="w-3 h-3 fill-white" /> Featured
            </div>
            <PostCard post={pinnedHighlight.item_data} currentUser={currentUser} />
          </div>
        </div>
      )}

      {/* Favorite Sports */}
      {profiles?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Favorite Sports
          </h2>
          <div className="flex flex-wrap gap-2">
            {profiles.map(sp => (
              <span key={sp.id} className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-3 py-1 text-sm font-semibold">
                🏅 {sp.sport}
                <span className="text-orange-400 text-xs capitalize">· {sp.level}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sport Profiles */}
      <div className="grid gap-3 sm:grid-cols-2">
        {profiles?.map(sp => (
          <div key={sp.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-orange-50 text-orange-700 border-orange-200 rounded-lg">{sp.sport}</Badge>
              <span className="text-xs text-slate-400 capitalize font-medium">{sp.role}</span>
            </div>
            <p className="text-sm font-semibold text-slate-700 capitalize">{sp.level} level</p>
            {sp.bio && <p className="text-xs text-slate-500 leading-relaxed">{sp.bio}</p>}
            <div className="flex flex-wrap gap-3">
              {sp.team && <span className="text-xs text-slate-500 flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-500" />{sp.team}</span>}
              {sp.years_experience > 0 && <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3 text-blue-400" />{sp.years_experience} yr exp</span>}
              {sp.location && <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3 text-red-400" />{sp.location}</span>}
            </div>

            {/* Achievements */}
            {sp.achievements?.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-500" /> Achievements
                </p>
                <ul className="space-y-1">
                  {sp.achievements.map((ach, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {ach}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sp.stats?.length > 0 && (
              <div className="flex gap-4 pt-3 border-t border-slate-100">
                {sp.stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="text-sm font-bold text-slate-900">{s.value}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Subscription Tiers */}
      {currentUser && currentUser.email !== profileEmail && (
        <SubscriptionTiers
          creator={{ email: profileEmail, name: profile?.user_name }}
          currentUser={currentUser}
        />
      )}

      {/* Reels Stats */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Film className="w-5 h-5 text-blue-600" /> Reels
        </h2>
        <ReelsStatsPanel posts={posts || []} isOwnProfile={false} />
      </div>

      {/* Posts — 3-col grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Film className="w-5 h-5 text-orange-500" />
          Posts
          <span className="text-sm font-normal text-slate-400 ml-1">({posts?.length || 0})</span>
        </h2>
        {!posts?.length ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center">
            <p className="text-slate-400 text-sm">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 rounded-2xl overflow-hidden">
            {posts?.map(post => {
              const media = post.media_urls?.[0];
              const isVideo = !!media?.match(/\.(mp4|webm|ogg|mov)/i);
              return (
                <button
                  key={post.id}
                  onClick={() => setGridPost(post)}
                  className="aspect-square bg-gray-800 overflow-hidden relative group"
                >
                  {media ? (
                    isVideo ? (
                      <video src={media} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={media} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2 bg-gray-900 hover:bg-gray-800 transition-colors">
                      <p className="text-[10px] text-gray-300 line-clamp-4 text-center leading-tight">{post.content}</p>
                    </div>
                  )}
                  {isVideo && (
                    <div className="absolute top-1.5 right-1.5">
                      <Film className="w-3 h-3 text-white drop-shadow" />
                    </div>
                  )}
                  {post.likes?.length > 0 && (
                    <div className="absolute bottom-1 left-1 text-[9px] text-white font-bold drop-shadow">
                      ❤️ {post.likes.length}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid post modal */}
      {gridPost && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setGridPost(null)}
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <PostCard post={gridPost} currentUser={currentUser} />
            <button
              onClick={() => setGridPost(null)}
              className="mt-2 w-full text-center text-gray-400 hover:text-white text-sm py-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showFollowerList && (
        <FollowerListModal
          profileEmail={profileEmail}
          mode={showFollowerList}
          onClose={() => setShowFollowerList(null)}
        />
      )}

      {/* Advice Dialog */}
      <Dialog open={showAdviceDialog} onOpenChange={setShowAdviceDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Ask for Advice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input
              value={adviceTopic}
              onChange={e => setAdviceTopic(e.target.value)}
              placeholder="Topic (e.g., shooting form, nutrition, etc.)"
              className="rounded-xl"
            />
            <Textarea
              value={adviceMessage}
              onChange={e => setAdviceMessage(e.target.value)}
              placeholder="Describe what you'd like advice on..."
              className="rounded-xl resize-none"
              rows={4}
            />
            <Button
              onClick={sendAdviceRequest}
              disabled={sending || !adviceTopic.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Send Request</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}