import React, { useState, useEffect } from "react";
import { db } from "@/api/db";
import { Heart, MessageCircle, Share2, Play, MoreHorizontal, Bookmark, Flag, AlertTriangle, Star, Eye, Crown, ZoomIn, Trash2, UserPlus, UserCheck, EyeOff, Ban } from "lucide-react";
import SharePostDialog from "../messages/SharePostDialog";
import MediaViewer from "./MediaViewer";
import ContentSummary from "../content/ContentSummary";
import { toast } from "sonner";
import { awardPoints } from "../gamification/PointsHelper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import MentionInput from "./MentionInput";

const categoryIcons = {
  training: "🏋️",
  game: "🏟️",
  coaching: "📋",
  instruction: "📚",
  motivation: "🔥",
  highlight: "⭐",
  other: "💬",
};

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

const POST_REACTIONS = [
  { emoji: "❤️", label: "Love" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "💪", label: "Respect" },
  { emoji: "😂", label: "LOL" },
  { emoji: "😮", label: "Wow" },
];

export default function PostCard({ post, currentUser, onUpdate, onDelete, initialHighlighted, initialFollowing, initialHasAccess }) {
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?.email));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(initialHighlighted ?? false);
  const [hasAccess, setHasAccess] = useState(initialHasAccess ?? false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [commentsDisabled, setCommentsDisabled] = useState(post.comments_disabled || false);
  const [following, setFollowing] = useState(initialFollowing ?? false);
  const reactionKey = `reaction-${post.id}-${currentUser?.email}`;
  const [myReaction, setMyReaction] = useState(() => (typeof window !== "undefined" ? localStorage.getItem(reactionKey) : null));
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});

  useEffect(() => {
    if (!currentUser) return;

    // Only fetch individually if batch data wasn't provided via props (e.g. PostCard used outside Feed)
    if (initialHighlighted === undefined) {
      db.entities.Highlight.filter({ user_email: currentUser.email, item_type: "post", item_id: post.id })
        .then(h => setIsHighlighted(h.length > 0))
        .catch(() => {});
    }

    trackView();

    if (initialHasAccess === undefined) {
      if (post.is_premium && post.author_email !== currentUser.email) {
        db.entities.Subscription.filter({
          subscriber_email: currentUser.email,
          creator_email: post.author_email,
          status: "active"
        }).then(subs => setHasAccess(subs.length > 0)).catch(() => setHasAccess(false));
      } else {
        setHasAccess(true);
      }
    }

    if (initialFollowing === undefined && post.author_email !== currentUser.email) {
      db.entities.Follow.filter({ follower_email: currentUser.email, following_email: post.author_email })
        .then(f => setFollowing(f.length > 0))
        .catch(() => {});
    }
  }, [currentUser, post.id]);

  const trackView = async () => {
    if (!currentUser) return;
    await db.entities.Post.update(post.id, { views: (post.views || 0) + 1 }).catch(() => {});
  };

  const handleLike = async () => {
    const newLikes = liked
      ? (post.likes || []).filter(e => e !== currentUser.email)
      : [...(post.likes || []), currentUser.email];
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    await db.entities.Post.update(post.id, { likes: newLikes });
    if (!liked) {
      if (post.author_email !== currentUser.email) {
        await db.entities.Notification.create({
          recipient_email: post.author_email,
          actor_email: currentUser.email,
          actor_name: currentUser.full_name,
          actor_avatar: currentUser.avatar_url,
          type: "like",
          post_id: post.id,
          message: "liked your post",
        }).catch(() => {});
      }
      // Award points to liker for engagement
      awardPoints(currentUser.email, "LIKE_GIVEN").catch(() => {});
    }
  };

  const handleReaction = async (emoji) => {
    if (!currentUser) return;
    if (myReaction === emoji) {
      setMyReaction(null);
      localStorage.removeItem(reactionKey);
      setLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
      await db.entities.Post.update(post.id, {
        likes: (post.likes || []).filter(e => e !== currentUser.email),
      }).catch(() => {});
    } else {
      const wasLiked = liked;
      setMyReaction(emoji);
      localStorage.setItem(reactionKey, emoji);
      if (!wasLiked) {
        setLiked(true);
        setLikeCount(prev => prev + 1);
        await db.entities.Post.update(post.id, {
          likes: [...(post.likes || []), currentUser.email],
        }).catch(() => {});
        if (post.author_email !== currentUser.email) {
          await db.entities.Notification.create({
            recipient_email: post.author_email,
            actor_email: currentUser.email,
            actor_name: currentUser.full_name,
            actor_avatar: currentUser.avatar_url,
            type: "like",
            post_id: post.id,
            message: "reacted to your post",
          }).catch(() => {});
        }
      }
    }
    setShowReactionPicker(false);
  };

  const handleFollow = async () => {
    if (following) {
      const follows = await db.entities.Follow.filter({ follower_email: currentUser.email, following_email: post.author_email });
      if (follows[0]) await db.entities.Follow.delete(follows[0].id);
      setFollowing(false);
    } else {
      await db.entities.Follow.create({
        follower_email: currentUser.email,
        following_email: post.author_email,
        status: "accepted",
      });
      setFollowing(true);
      await db.entities.Notification.create({
        recipient_email: post.author_email,
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        actor_avatar: currentUser.avatar_url,
        type: "follow",
        message: "started following you",
      }).catch(() => {});
    }
  };

  const loadComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      const cmts = await db.entities.Comment.filter({ post_id: post.id }, '-created_at').catch(() => []);
      setComments(cmts);
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const result = await db.functions.invoke("moderateContent", {
        content_type: "comment",
        content_id: `pending_${Date.now()}`,
        content_text: newComment,
        author_email: currentUser.email,
        author_name: currentUser.full_name,
      });
      if (result?.data?.action === "auto_remove" && result?.data?.severity === "critical") {
        toast.error("Your comment was blocked as it violates community guidelines.");
        return;
      }
    } catch (_) { /* moderation error shouldn't block commenting */ }

    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    const mentions = [...newComment.matchAll(mentionRegex)].map(m => m[1]);

    const comment = await db.entities.Comment.create({
      post_id: post.id,
      author_id: currentUser.id,
      author_email: currentUser.email,
      author_name: currentUser.full_name,
      author_avatar: currentUser.avatar_url,
      content: newComment,
    });
    setComments(prev => [comment, ...prev]);
    setNewComment("");
    await db.entities.Post.update(post.id, { comments_count: (post.comments_count || 0) + 1 }).catch(() => {});

    if (post.author_email !== currentUser.email) {
      await db.entities.Notification.create({
        recipient_email: post.author_email,
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        actor_avatar: currentUser.avatar_url,
        type: "comment",
        post_id: post.id,
        comment_id: comment.id,
        message: "commented on your post",
      }).catch(() => {});
    }

    if (mentions.length > 0) {
      const allUsers = await db.entities.User.list(null, 500).catch(() => []);
      for (const mention of mentions) {
        const mentioned = allUsers.find(u => u.full_name?.toLowerCase() === mention.toLowerCase());
        if (mentioned && mentioned.email !== currentUser.email) {
          await db.entities.Notification.create({
            recipient_email: mentioned.email,
            actor_email: currentUser.email,
            actor_name: currentUser.full_name,
            actor_avatar: currentUser.avatar_url,
            type: "mention",
            post_id: post.id,
            message: "mentioned you in a comment",
          }).catch(() => {});
        }
      }
    }
  };

  const addReply = async (parentCommentId) => {
    if (!replyText.trim()) return;
    try {
      const reply = await db.entities.Comment.create({
        post_id: post.id,
        parent_comment_id: parentCommentId,
        author_id: currentUser.id,
        author_email: currentUser.email,
        author_name: currentUser.full_name,
        author_avatar: currentUser.avatar_url,
        content: replyText,
      });
      setComments(prev => [...prev, reply]);
      setExpandedReplies(prev => ({ ...prev, [parentCommentId]: true }));
      setReplyText("");
      setReplyingTo(null);
    } catch (_) {}
  };

  const deleteComment = async (commentId) => {
    await db.entities.Comment.delete(commentId).catch(() => {});
    setComments(prev => prev.filter(c => c.id !== commentId));
    await db.entities.Post.update(post.id, {
      comments_count: Math.max(0, (post.comments_count || 1) - 1),
    }).catch(() => {});
  };

  const isVideo = (url) => url && (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('video'));

  const submitReport = async () => {
    if (!reportReason) return;
    setSubmittingReport(true);
    await db.entities.Report.create({
      reporter_id: currentUser.id,
      reporter_email: currentUser.email,
      reported_item_type: "post",
      reported_item_id: post.id,
      reason: reportReason,
      details: reportDetails,
      status: "pending",
    }).catch(() => {});
    setShowReportDialog(false);
    setReportReason("");
    setReportDetails("");
    setSubmittingReport(false);
    toast.success("Report submitted. Our team will review it shortly.");
  };

  const toggleHighlight = async () => {
    if (isHighlighted) {
      const highlights = await db.entities.Highlight.filter({ user_email: currentUser.email, item_type: "post", item_id: post.id });
      if (highlights[0]) await db.entities.Highlight.delete(highlights[0].id);
      setIsHighlighted(false);
    } else {
      await db.entities.Highlight.create({ user_email: currentUser.email, item_type: "post", item_id: post.id, item_data: post });
      setIsHighlighted(true);
    }
  };

  const hasVideoContent = () => post.media_urls?.some(isVideo);

  const renderContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, i) =>
      /^#\w+$/.test(part) ? (
        <Link key={i} to={`${createPageUrl("Search")}?q=${encodeURIComponent(part)}`}
          className="text-electric-400 hover:text-electric font-medium"
          onClick={e => e.stopPropagation()}>
          {part}
        </Link>
      ) : part
    );
  };

  return (
    <article className="glass-card rounded-lg overflow-hidden shadow-lg transition-all duration-150 hover:border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={createPageUrl("UserProfile") + `?email=${post.author_email}`} className="flex items-center gap-3 group">
          <Avatar className="w-10 h-10 ring-2 ring-stadium-700">
            <AvatarImage src={post.author_avatar} />
            <AvatarFallback className="bg-monza text-white font-bold">
              {post.author_name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-white group-hover:text-monza transition-colors">
              {post.author_name || "Anonymous"}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-stadium-600">{post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : 'recently'}</p>

              {post.category && <span className="text-sm">{categoryIcons[post.category]}</span>}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Follow button */}
          {currentUser && post.author_email !== currentUser.email && (
            <button
              onClick={handleFollow}
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
                following
                  ? "text-stadium-400 bg-stadium-800 hover:text-monza"
                  : "text-monza border border-monza/50 hover:bg-monza hover:text-white hover:border-monza"
              }`}
            >
              {following ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
              {following ? "Following" : "Follow"}
            </button>
          )}

          {/* More menu */}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2.5 hover:bg-white/5 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-stadium-600 hover:text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-stadium-850 border-stadium-700">
                {currentUser.email === post.author_email && (
                  <>
                    <DropdownMenuItem
                      onClick={async () => {
                        if (!confirm("Delete this post?")) return;
                        await db.entities.Post.delete(post.id);
                        if (onDelete) onDelete(post.id);
                      }}
                      className="gap-2 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleHighlight} className="gap-2 text-gray-300 hover:text-white">
                      <Star className={`w-4 h-4 ${isHighlighted ? "fill-amber-500 text-amber-500" : ""}`} />
                      {isHighlighted ? "Remove from" : "Add to"} Highlights
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      const newVal = !commentsDisabled;
                      setCommentsDisabled(newVal);
                      await db.entities.Post.update(post.id, { comments_disabled: newVal });
                      if (newVal) setShowComments(false);
                    }} className="gap-2 text-gray-300 hover:text-white">
                      <MessageCircle className="w-4 h-4" />
                      {commentsDisabled ? "Enable Comments" : "Turn Off Comments"}
                    </DropdownMenuItem>
                  </>
                )}
                {currentUser.email !== post.author_email && (
                  <DropdownMenuItem onClick={() => setShowReportDialog(true)} className="text-red-400 gap-2">
                    <Flag className="w-4 h-4" /> Report Post
                  </DropdownMenuItem>
                )}
                {currentUser?.email !== post.author_email && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        // Mute — stored locally since no DB table exists yet
                        const key = `ss_muted_${currentUser.email}`;
                        const muted = JSON.parse(localStorage.getItem(key) || "[]");
                        if (!muted.includes(post.author_email)) {
                          localStorage.setItem(key, JSON.stringify([...muted, post.author_email]));
                        }
                        toast.info(`Muted ${post.author_name}`);
                      }}
                      className="gap-2 text-gray-600"
                    >
                      <EyeOff className="w-4 h-4" /> Mute {post.author_name?.split(" ")[0]}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (!confirm(`Block ${post.author_name}? Their content will be hidden from you.`)) return;
                        // Block — stored locally since no DB table exists yet
                        const key = `ss_blocked_${currentUser.email}`;
                        const blocked = JSON.parse(localStorage.getItem(key) || "[]");
                        if (!blocked.includes(post.author_email)) {
                          localStorage.setItem(key, JSON.stringify([...blocked, post.author_email]));
                        }
                        toast.success(`Blocked ${post.author_name}`);
                      }}
                      className="gap-2 text-red-600 focus:text-red-600"
                    >
                      <Ban className="w-4 h-4" /> Block {post.author_name?.split(" ")[0]}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Premium badge */}
      {post.is_premium && !hasAccess && (
        <div className="px-4 pb-3">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Premium Content — Subscribe to view</span>
          </div>
        </div>
      )}

      {/* Post content text */}
      {post.content && (() => {
        const isStatusCard = !post.media_urls?.length && (post.content?.length || 0) < 220 && !(post.is_premium && !hasAccess);
        const gradient = STATUS_GRADIENTS[post.sport] || STATUS_GRADIENTS.default;
        if (isStatusCard) {
          return (
            <div className={`bg-gradient-to-br ${gradient} mx-4 mb-3 rounded-lg p-6 flex items-center justify-center min-h-[120px]`}>
              <p className="text-white text-lg font-semibold text-center leading-relaxed">
                {post.content.split(/(#\w+|@\w+(?:\s+\w+)*)/g).map((part, i) =>
                  /^#\w+$/.test(part) ? (
                    <Link key={i} to={`${createPageUrl("Search")}?q=${encodeURIComponent(part)}`}
                      className="text-electric-400 hover:text-electric font-medium underline underline-offset-2"
                      onClick={e => e.stopPropagation()}>
                      {part}
                    </Link>
                  ) : part.startsWith('@') ? (
                    <span key={i} className="underline underline-offset-2">{part}</span>
                  ) : part
                )}
              </p>
            </div>
          );
        }
        return (
          <div className={post.is_premium && !hasAccess ? "relative" : ""}>
            {post.is_premium && !hasAccess && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stadium-850 z-10" />
            )}
            <p className={`px-4 pb-3 text-sm text-white/85 leading-relaxed whitespace-pre-wrap ${
              post.is_premium && !hasAccess ? "line-clamp-2 blur-sm" : ""
            }`}>
              {post.content.split(/(#\w+|@\w+(?:\s+\w+)*)/g).map((part, i) =>
                /^#\w+$/.test(part) ? (
                  <Link key={i} to={`${createPageUrl("Search")}?q=${encodeURIComponent(part)}`}
                    className="text-electric-400 hover:text-electric font-medium"
                    onClick={e => e.stopPropagation()}>
                    {part}
                  </Link>
                ) : part.startsWith('@') ? (
                  <span key={i} className="text-monza font-medium">{part}</span>
                ) : part
              )}
            </p>
          </div>
        );
      })()}

      {/* AI Summary */}
      {hasVideoContent() && hasAccess && (
        <div className="px-4 pb-3">
          <ContentSummary content={post} />
        </div>
      )}

      {/* Media */}
      {post.media_urls?.length > 0 && hasAccess && (
        <div className="relative bg-black">
          <div
            className="cursor-pointer group relative"
            onClick={() => { setViewerStartIndex(currentMediaIndex); setViewerOpen(true); }}
          >
            {isVideo(post.media_urls[currentMediaIndex]) ? (
              <div className="relative">
                <video
                  src={post.media_urls[currentMediaIndex]}
                  className="w-full max-h-[280px] sm:max-h-[480px] object-contain bg-black"
                  onClick={e => e.stopPropagation()}
                  controls
                />
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <img
                  src={post.media_urls[currentMediaIndex]}
                  alt=""
                  loading="lazy"
                  className="w-full max-h-[280px] sm:max-h-[480px] object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded-full p-3">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Multi-image thumbnails */}
          {post.media_urls.length > 1 && (
            <div className="flex gap-1 p-1 bg-black">
              {post.media_urls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentMediaIndex(i); setViewerStartIndex(i); setViewerOpen(true); }}
                  className={`flex-1 h-12 rounded overflow-hidden border-2 transition-all ${
                    i === currentMediaIndex ? "border-monza" : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  {isVideo(url) ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white/60 text-xs">▶</div>
                  ) : (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {viewerOpen && post.media_urls?.length > 0 && (
        <MediaViewer mediaUrls={post.media_urls} startIndex={viewerStartIndex} onClose={() => setViewerOpen(false)} />
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-5">
          {/* Emoji Reaction */}
          <div
            className="relative"
            onMouseEnter={() => currentUser && setShowReactionPicker(true)}
            onMouseLeave={() => setShowReactionPicker(false)}
          >
            <button
              onClick={() => {
                if (!currentUser) return;
                setShowReactionPicker(prev => !prev);
              }}
              onDoubleClick={() => currentUser && handleReaction(myReaction || "❤️")}
              className="flex items-center gap-1.5 group touch-target"
            >
              <span className={`text-lg transition-all ${liked ? "scale-110" : "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"}`}>
                {myReaction || "❤️"}
              </span>
              <span className={`text-sm font-medium ${liked ? "text-monza" : "text-stadium-600"}`}>{likeCount}</span>
            </button>
            {showReactionPicker && currentUser && (
              <div className="absolute bottom-8 left-0 bg-stadium-800 border border-white/10 rounded-lg px-2 py-1.5 flex gap-1 z-20 shadow-xl">
                {POST_REACTIONS.map(r => (
                  <button
                    key={r.emoji}
                    onClick={() => handleReaction(r.emoji)}
                    title={r.label}
                    className={`text-xl hover:scale-125 transition-transform p-1 rounded-lg ${myReaction === r.emoji ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/10"}`}
                  >
                    {r.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comment */}
          <button
            onClick={commentsDisabled ? undefined : loadComments}
            className={`flex items-center gap-1.5 group touch-target ${commentsDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
            title={commentsDisabled ? "Comments are turned off" : ""}
          >
            <MessageCircle className="w-5 h-5 text-stadium-600 group-hover:text-white transition-colors" />
            <span className="text-sm font-medium text-stadium-600">{post.comments_count || 0}</span>
          </button>

          {/* Share */}
          {currentUser && (
            <button onClick={() => setShowShareDialog(true)} className="flex items-center gap-1.5 group touch-target">
              <Share2 className="w-5 h-5 text-stadium-600 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-stadium-600">{post.shares || 0}</span>
            </button>
          )}

          {/* Views */}
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-stadium-600" />
            <span className="text-xs text-stadium-600">{post.views || 0}</span>
          </div>
        </div>

        {/* Bookmark */}
        <button onClick={toggleHighlight} className="group touch-target">
          <Bookmark className={`w-5 h-5 transition-colors ${isHighlighted ? "fill-monza text-monza" : "text-stadium-600 group-hover:text-white"}`} />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-white/10 p-4 space-y-3 bg-stadium-850/50">
          <div className="flex gap-2">
            <MentionInput
              value={newComment}
              onChange={setNewComment}
              placeholder="Add a comment... (type @ to mention)"
              className="flex-1 text-sm bg-stadium-800 text-white placeholder:text-gray-500 rounded-lg px-4 py-2.5 border border-white/10 focus:ring-2 focus:ring-monza/40 resize-none min-h-[42px] max-h-[120px]"
            />
            <Button
              onClick={addComment}
              size="sm"
              className="rounded-lg bg-monza hover:bg-monza-600 text-white shadow-none"
            >
              Post
            </Button>
          </div>
          {loadingComments ? (
            <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
          ) : (() => {
            const topLevel = comments.filter(c => !c.parent_comment_id);
            const replyMap = comments.reduce((acc, c) => {
              if (c.parent_comment_id) {
                acc[c.parent_comment_id] = [...(acc[c.parent_comment_id] || []), c];
              }
              return acc;
            }, {});
            return (
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {topLevel.map(c => {
                  const replies = replyMap[c.id] || [];
                  const isExpanded = expandedReplies[c.id];
                  return (
                    <div key={c.id}>
                      <div className="flex gap-2.5 group/comment">
                        <Avatar className="w-7 h-7 ring-1 ring-stadium-700">
                          <AvatarImage src={c.author_avatar} />
                          <AvatarFallback className="text-xs bg-stadium-800 text-gray-300">{c.author_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="bg-stadium-800 rounded-lg px-3 py-2 border border-white/10">
                            <p className="text-xs font-semibold text-white">{c.author_name}</p>
                            <p className="text-sm text-gray-300 mt-0.5">
                              {c.content.split(/(@\w+(?:\s+\w+)*)/g).map((part, i) =>
                                part.startsWith('@') ? (
                                  <span key={i} className="text-monza font-medium">{part}</span>
                                ) : part
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 px-1">
                            {currentUser && (
                              <button
                                onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText(""); }}
                                className="text-xs text-stadium-600 hover:text-monza font-medium transition-colors"
                              >
                                Reply
                              </button>
                            )}
                            {replies.length > 0 && (
                              <button
                                onClick={() => setExpandedReplies(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                                className="text-xs text-monza hover:text-monza-50 font-medium transition-colors"
                              >
                                {isExpanded ? `▴ Hide replies` : `▾ ${replies.length} ${replies.length === 1 ? "reply" : "replies"}`}
                              </button>
                            )}
                            {c.author_email === currentUser?.email && (
                              <button
                                onClick={() => deleteComment(c.id)}
                                className="text-xs text-stadium-600 hover:text-monza transition-colors ml-auto"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Inline reply input */}
                          {replyingTo === c.id && (
                            <div className="flex gap-2 mt-2">
                              <input
                                autoFocus
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && !e.shiftKey && addReply(c.id)}
                                placeholder={`Reply to ${c.author_name}...`}
                                className="flex-1 text-xs bg-stadium-800 text-white placeholder:text-gray-500 rounded-lg px-3 py-2 border border-white/10 focus:ring-1 focus:ring-monza/40 outline-none"
                              />
                              <button
                                onClick={() => addReply(c.id)}
                                className="text-xs bg-monza hover:bg-monza-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors"
                              >
                                Post
                              </button>
                            </div>
                          )}

                          {/* Nested replies */}
                          {isExpanded && replies.map(reply => (
                            <div key={reply.id} className="flex gap-2 mt-2 ml-3 pl-3 border-l-2 border-stadium-700 group/reply">
                              <Avatar className="w-6 h-6 ring-1 ring-stadium-700 flex-shrink-0">
                                <AvatarImage src={reply.author_avatar} />
                                <AvatarFallback className="text-xs bg-stadium-800 text-stadium-400">{reply.author_name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="bg-stadium-800/70 rounded-lg px-3 py-1.5 border border-white/5">
                                  <p className="text-xs font-semibold text-white">{reply.author_name}</p>
                                  <p className="text-xs text-gray-300 mt-0.5">{reply.content}</p>
                                </div>
                              </div>
                              {reply.author_email === currentUser?.email && (
                                <button
                                  onClick={() => deleteComment(reply.id)}
                                  className="opacity-0 group-hover/reply:opacity-100 text-stadium-600 hover:text-monza transition-all flex-shrink-0 self-center"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {showShareDialog && currentUser && (
        <SharePostDialog post={post} user={currentUser} onClose={() => setShowShareDialog(false)} />
      )}

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md rounded-lg bg-stadium-850 border-stadium-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Report Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-gray-400">Help us keep Sportsphere safe and focused on sports.</p>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Reason</label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger className="rounded-lg bg-stadium-800 border-white/10 text-white">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent className="bg-stadium-850 border-stadium-700">
                  {["Politics", "Profanity / Offensive Language", "Cyberbullying", "Harassment", "Spam", "Inappropriate Content", "Other"].map(r => (
                    <SelectItem key={r} value={r.toLowerCase()} className="text-gray-300">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Additional Details (optional)</label>
              <Textarea
                value={reportDetails}
                onChange={e => setReportDetails(e.target.value)}
                placeholder="Provide more context..."
                className="rounded-lg resize-none bg-stadium-800 border-white/10 text-white placeholder:text-gray-500"
                rows={3}
              />
            </div>
            <Button
              onClick={submitReport}
              disabled={!reportReason || submittingReport}
              className="w-full rounded-lg bg-monza hover:bg-monza-600 text-white"
            >
              {submittingReport ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
