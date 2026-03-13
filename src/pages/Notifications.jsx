import React, { useState, useEffect } from "react";
import { useAuth } from '@/lib/AuthContext';
import { db } from "@/api/db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Loader2, Settings, Trophy, Radio, DollarSign, Filter, Check, X, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatDistanceToNow } from "date-fns";
import NotificationSettingsDialog from "@/components/notifications/NotificationSettingsDialog";
import { motion } from "framer-motion";

// ── Grouping helpers ──────────────────────────────────────────────────────────

function groupNotifications(notifs) {
  const groups = [];
  const seen = new Map();
  for (const notif of notifs) {
    const hourBucket = Math.floor(new Date(notif.created_date || notif.created_at || Date.now()).getTime() / 3600000);
    const key = `${notif.type}__${notif.link || ""}__${hourBucket}`;
    if (seen.has(key)) {
      seen.get(key).members.push(notif);
    } else {
      const group = { ...notif, members: [notif] };
      seen.set(key, group);
      groups.push(group);
    }
  }
  return groups;
}

function getGroupLabel(group) {
  const count = group.members.length;
  const first = group.members[0]?.actor_name || group.members[0]?.actor_email || "Someone";
  const second = group.members[1]?.actor_name || group.members[1]?.actor_email;
  const verb = {
    like: "liked your post",
    comment: "commented on your post",
    follow: "followed you",
    live_stream: "is live now 🔴",
  }[group.type] || "interacted with you";
  if (count === 1) return group.message || `${first} ${verb}`;
  if (count === 2) return `${first} and ${second} ${verb}`;
  return `${first}, ${second}, and ${count - 2} others ${verb}`;
}

// ── Time-ago helper ───────────────────────────────────────────────────────────

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─────────────────────────────────────────────────────────────────────────────

export default function Notifications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {

  }, []);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user?.email) return;
    const sub = db.entities.Notification.subscribeToChanges(
      { recipient_email: user.email },
      () => queryClient.invalidateQueries({ queryKey: ["notifications"] })
    );
    return () => sub?.unsubscribe?.();
  }, [user?.email, queryClient]);

  const { data: allNotifications, isLoading } = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () => db.entities.Notification.filter({ recipient_email: user.email }, "-created_date", 100),
    enabled: !!user,
  });

  const notifications = allNotifications?.filter(n => {
    if (filter === "unread") return !n.is_read;
    if (filter === "all") return true;
    if (filter === "challenge_update") return ["challenge_update", "challenge_joined", "challenge_completed"].includes(n.type);
    return n.type === filter;
  });

  // ── Following Activity queries ──────────────────────────────────────────────

  const { data: followingList = [] } = useQuery({
    queryKey: ["my-following", user?.email],
    queryFn: () => db.entities.Follow.filter({ follower_email: user.email }),
    enabled: !!user?.email,
  });
  const followingEmails = followingList.map(f => f.following_email);

  const { data: recentActivity = [] } = useQuery({
    queryKey: ["following-activity", followingEmails.join(",")],
    queryFn: () => db.entities.Post.list("-created_date", 30),
    enabled: followingEmails.length > 0,
    select: posts => posts.filter(p => followingEmails.includes(p.author_email)),
  });

  // ── Mutations ───────────────────────────────────────────────────────────────

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => db.entities.Notification.update(notificationId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = async () => {
    const unreadNotifs = allNotifications?.filter(n => !n.is_read) || [];
    await Promise.all(unreadNotifs.map(n => db.entities.Notification.update(n.id, { is_read: true })));
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const deleteNotification = async (notifId) => {
    await db.entities.Notification.delete(notifId);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const getIcon = (type) => {
    switch (type) {
      case "like": return <Heart className="w-5 h-5 text-red-500" />;
      case "comment": return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "mention": return <AtSign className="w-5 h-5 text-orange-500" />;
      case "follow": return <UserPlus className="w-5 h-5 text-green-500" />;
      case "follow_request": return <UserPlus className="w-5 h-5 text-orange-500" />;
      case "challenge_joined": return <Trophy className="w-5 h-5 text-cyan-400" />;
      case "challenge_update": return <Trophy className="w-5 h-5 text-amber-500" />;
      case "challenge_completed": return <Trophy className="w-5 h-5 text-yellow-400" />;
      case "live_stream": return <Radio className="w-5 h-5 text-red-500" />;
      case "subscription": return <Zap className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-stadium-400" />;
    }
  };

  const getNotificationLink = (notif) => {
    if (notif.post_id) return createPageUrl("Feed");
    if (notif.challenge_id) return createPageUrl("ChallengeDetail") + `?id=${notif.challenge_id}`;
    if (notif.stream_id) return createPageUrl("ViewLive") + `?id=${notif.stream_id}`;
    if (notif.conversation_id) return createPageUrl("Messages") + `?conv=${notif.conversation_id}`;
    if (["follow", "follow_request"].includes(notif.type)) return createPageUrl("UserProfile") + `?email=${notif.actor_email}`;
    return createPageUrl("Profile");
  };

  const handleFollowResponse = async (notif, accept) => {
    // Find the pending follow record
    const follows = await db.entities.Follow.filter({
      follower_email: notif.follow_requester_email || notif.actor_email,
      following_email: user.email,
    });
    if (follows[0]) {
      if (accept) {
        await db.entities.Follow.update(follows[0].id, { status: "accepted" });
        // Notify requester they were accepted
        await db.entities.Notification.create({
          recipient_email: notif.actor_email,
          actor_email: user.email,
          actor_name: user.full_name,
          actor_avatar: user.avatar_url,
          type: "follow",
          message: "accepted your follow request",
        });
      } else {
        await db.entities.Follow.delete(follows[0].id);
      }
    }
    await db.entities.Notification.update(notif.id, { is_read: true, follow_resolved: true });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const filterOptions = [
    { value: "all", label: "All", icon: Bell },
    { value: "unread", label: "Unread", icon: Bell },
    { value: "like", label: "Likes", icon: Heart },
    { value: "comment", label: "Comments", icon: MessageCircle },
    { value: "follow", label: "Follows", icon: UserPlus },
    { value: "follow_request", label: "Requests", icon: UserPlus },
    { value: "mention", label: "Mentions", icon: AtSign },
    { value: "live_stream", label: "Streams", icon: Radio },
    { value: "challenge_update", label: "Challenges", icon: Trophy },
  ];

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="glass-card rounded-lg p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-stadium-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-stadium-700 rounded w-3/4" />
                <div className="h-2 bg-stadium-700 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-3xl mx-auto px-4 py-6 space-y-6"
    >
      {/* Header */}
      <div className="glass-card rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold uppercase tracking-wider flex items-center gap-3">
              <Bell className="w-8 h-8 text-monza" />
              Notifications
            </h1>
            <p className="text-stadium-400 mt-2">
              {allNotifications?.filter(n => !n.is_read).length || 0} unread notifications
            </p>
          </div>
          <div className="flex gap-2">
            {allNotifications?.some(n => !n.is_read) && (
              <Button onClick={markAllAsRead} variant="outline" className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10">
                Mark all read
              </Button>
            )}
            <Button onClick={() => setShowSettings(true)} variant="outline" className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="w-full bg-stadium-800 mb-4">
          <TabsTrigger value="notifications" className="flex-1">Notifications</TabsTrigger>
          <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
        </TabsList>

        {/* ── Notifications Tab ── */}
        <TabsContent value="notifications">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filterOptions.map(option => {
              const Icon = option.icon;
              const count = option.value === "all"
                ? allNotifications?.length
                : option.value === "unread"
                ? allNotifications?.filter(n => !n.is_read).length
                : option.value === "challenge_update"
                ? allNotifications?.filter(n => ["challenge_update", "challenge_joined", "challenge_completed"].includes(n.type)).length
                : allNotifications?.filter(n => n.type === option.value).length;

              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-2xl font-semibold text-sm transition-all flex items-center gap-2 ${
                    filter === option.value
                      ? "bg-monza text-white shadow-lg shadow-monza/20"
                      : "bg-stadium-800/80 text-stadium-400 hover:bg-stadium-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                  <Badge className="bg-stadium-700 text-stadium-400">{count || 0}</Badge>
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          {notifications?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-gray-400 font-bold text-base">You're all caught up. 🔥</p>
              <p className="text-gray-500 text-sm mt-1">Go post something worth noticing.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {groupNotifications(notifications || []).map(group => (
                <div
                  key={group.id}
                  className={`glass-card rounded-lg overflow-hidden transition-all hover:scale-[1.01] ${
                    !group.is_read ? "border-monza/40 shadow-lg shadow-monza/10" : "border-stadium-700"
                  }`}
                >
                  <Link
                    to={getNotificationLink(group)}
                    onClick={() => {
                      const unread = group.members.filter(m => !m.is_read);
                      unread.forEach(m => markAsReadMutation.mutate(m.id));
                    }}
                    className="block p-4"
                  >
                    <div className="flex gap-4">
                      {/* Avatar — stacked for groups, single otherwise */}
                      {group.members.length > 1 ? (
                        <div className="flex -space-x-2 flex-shrink-0">
                          {group.members.slice(0, 3).map((m, i) => (
                            <img
                              key={i}
                              src={m.actor_avatar || ""}
                              className="w-8 h-8 rounded-full border-2 border-stadium-900 object-cover bg-stadium-700"
                              onError={e => e.target.style.display = "none"}
                            />
                          ))}
                        </div>
                      ) : (
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarImage src={group.actor_avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold">
                            {group.actor_name?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm text-white">
                              {group.members.length > 1 ? (
                                getGroupLabel(group)
                              ) : (
                                <>
                                  <span className="font-bold text-monza">{group.actor_name}</span>{" "}
                                  {group.message}
                                </>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <p className="text-xs text-stadium-600">{formatDistanceToNow(new Date(group.created_date), { addSuffix: true })}</p>
                              {!group.is_read && (
                                <Badge className="bg-monza text-white text-xs">New</Badge>
                              )}
                              {group.members.length > 1 && (
                                <Badge className="bg-stadium-700 text-stadium-400 text-xs">{group.members.length} notifications</Badge>
                              )}
                            </div>
                            {group.type === "follow_request" && !group.follow_resolved && (
                              <div className="flex gap-2 mt-2" onClick={e => e.preventDefault()}>
                                <Button
                                  size="sm"
                                  className="rounded-xl h-7 px-3 bg-green-600 hover:bg-green-700 text-white gap-1 text-xs"
                                  onClick={() => handleFollowResponse(group, true)}
                                >
                                  <Check className="w-3 h-3" /> Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl h-7 px-3 border-red-400 text-red-400 hover:bg-red-50 gap-1 text-xs"
                                  onClick={() => handleFollowResponse(group, false)}
                                >
                                  <X className="w-3 h-3" /> Deny
                                </Button>
                              </div>
                            )}
                            {group.type === "follow_request" && group.follow_resolved && (
                              <p className="text-xs text-stadium-600 mt-1 italic">Request resolved</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {getIcon(group.type)}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                group.members.forEach(m => deleteNotification(m.id));
                              }}
                              className="p-1 hover:bg-stadium-800 rounded-lg transition-colors"
                            >
                              <span className="text-stadium-600 text-xs">✕</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Activity Tab ── */}
        <TabsContent value="activity">
          {recentActivity.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stadium-400 font-medium">No recent activity from people you follow.</p>
              <p className="text-stadium-600 text-sm mt-1">Follow more athletes to see their posts here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map(post => (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-stadium-800/50 hover:bg-stadium-800 transition-colors">
                  <img
                    src={post.author_avatar || ""}
                    className="w-9 h-9 rounded-full object-cover bg-stadium-700 flex-shrink-0"
                    onError={e => e.target.style.display = "none"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">
                      <span className="font-bold">{post.author_name || post.author_email}</span>
                      <span className="text-stadium-400"> posted</span>
                      {post.sport && <span className="text-monza"> • {post.sport}</span>}
                    </p>
                    {post.content && <p className="text-xs text-stadium-400 truncate mt-0.5">{post.content}</p>}
                    <p className="text-[11px] text-stadium-600 mt-1">{timeAgo(post.created_date)}</p>
                  </div>
                  {post.media_urls?.[0] && (
                    <img src={post.media_urls[0]} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      {showSettings && user && (
        <NotificationSettingsDialog
          user={user}
          onClose={() => setShowSettings(false)}
        />
      )}
    </motion.div>
  );
}
