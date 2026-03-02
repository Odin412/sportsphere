import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Heart, MessageCircle, Share2, Play, MoreHorizontal, Bookmark, Flag, AlertTriangle, Star, Eye, Crown, Sparkles, ZoomIn, Trash2, UserPlus, UserCheck } from "lucide-react";
import SharePostDialog from "../messages/SharePostDialog";
import MediaViewer from "./MediaViewer";
import ContentSummary from "../content/ContentSummary";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import moment from "moment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

export default function PostCard({ post, currentUser, onUpdate, onDelete }) {
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
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [commentsDisabled, setCommentsDisabled] = useState(post.comments_disabled || false);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    base44.entities.Highlight.filter({ user_email: currentUser.email, item_type: "post", item_id: post.id })
      .then(h => setIsHighlighted(h.length > 0))
      .catch(() => {});

    trackView();

    if (post.is_premium && post.author_email !== currentUser.email) {
      base44.entities.Subscription.filter({
        subscriber_email: currentUser.email,
        creator_email: post.author_email,
        status: "active"
      }).then(subs => setHasAccess(subs.length > 0)).catch(() => setHasAccess(false));
    } else {
      setHasAccess(true);
    }

    if (post.author_email !== currentUser.email) {
      base44.entities.Follow.filter({ follower_email: currentUser.email, following_email: post.author_email })
        .then(f => setFollowing(f.length > 0))
        .catch(() => {});
    }
  }, [currentUser, post.id]);

  const trackView = async () => {
    if (!currentUser) return;
    await base44.entities.Post.update(post.id, { views: (post.views || 0) + 1 }).catch(() => {});
  };

  const handleLike = async () => {
    const newLikes = liked
      ? (post.likes || []).filter(e => e !== currentUser.email)
      : [...(post.likes || []), currentUser.email];
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    await base44.entities.Post.update(post.id, { likes: newLikes });
    if (!liked && post.author_email !== currentUser.email) {
      await base44.entities.Notification.create({
        recipient_email: post.author_email,
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        actor_avatar: currentUser.avatar_url,
        type: "like",
        post_id: post.id,
        message: "liked your post",
      }).catch(() => {});
    }
  };

  const handleFollow = async () => {
    if (following) {
      const follows = await base44.entities.Follow.filter({ follower_email: currentUser.email, following_email: post.author_email });
      if (follows[0]) await base44.entities.Follow.delete(follows[0].id);
      setFollowing(false);
    } else {
      await base44.entities.Follow.create({
        follower_email: currentUser.email,
        following_email: post.author_email,
        status: "accepted",
      });
      setFollowing(true);
      await base44.entities.Notification.create({
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
      const cmts = await base44.entities.Comment.filter({ post_id: post.id }, '-created_at').catch(() => []);
      setComments(cmts);
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    try {
      const result = await base44.functions.invoke("moderateContent", {
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

    const comment = await base44.entities.Comment.create({
      post_id: post.id,
      author_id: currentUser.id,
      author_email: currentUser.email,
      author_name: currentUser.full_name,
      author_avatar: currentUser.avatar_url,
      content: newComment,
    });
    setComments(prev => [comment, ...prev]);
    setNewComment("");
    await base44.entities.Post.update(post.id, { comments_count: (post.comments_count || 0) + 1 }).catch(() => {});

    if (post.author_email !== currentUser.email) {
      await base44.entities.Notification.create({
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
      const allUsers = await base44.entities.User.list().catch(() => []);
      for (const mention of mentions) {
        const mentioned = allUsers.find(u => u.full_name?.toLowerCase() === mention.toLowerCase());
        if (mentioned && mentioned.email !== currentUser.email) {
          await base44.entities.Notification.create({
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

  const deleteComment = async (commentId) => {
    await base44.entities.Comment.delete(commentId).catch(() => {});
    setComments(prev => prev.filter(c => c.id !== commentId));
    await base44.entities.Post.update(post.id, {
      comments_count: Math.max(0, (post.comments_count || 1) - 1),
    }).catch(() => {});
  };

  const isVideo = (url) => url && (url.includes('.mp4') || url.includes('.mov') || url.includes('.webm') || url.includes('video'));

  const submitReport = async () => {
    if (!reportReason) return;
    setSubmittingReport(true);
    await base44.entities.Report.create({
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
      const highlights = await base44.entities.Highlight.filter({ user_email: currentUser.email, item_type: "post", item_id: post.id });
      if (highlights[0]) await base44.entities.Highlight.delete(highlights[0].id);
      setIsHighlighted(false);
    } else {
      await base44.entities.Highlight.create({ user_email: currentUser.email, item_type: "post", item_id: post.id, item_data: post });
      setIsHighlighted(true);
    }
  };

  const generateSummary = async () => {
    if (!hasVideoContent()) return;
    setGeneratingSummary(true);
    try {
      const summary = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this sports video post in 3-4 concise sentences.\nTitle: ${post.content}\nSport: ${post.sport || "General"}\nCategory: ${post.category || "Unknown"}`,
      });
      await base44.entities.Post.update(post.id, { ai_summary: summary });
      post.ai_summary = summary;
      if (onUpdate) onUpdate();
    } catch (_) {}
    setGeneratingSummary(false);
  };

  const hasVideoContent = () => post.media_urls?.some(isVideo);

  return (
    <article className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={createPageUrl("UserProfile") + `?email=${post.author_email}`} className="flex items-center gap-3 group">
          <Avatar className="w-10 h-10 ring-2 ring-gray-700">
            <AvatarImage src={post.author_avatar} />
            <AvatarFallback className="bg-red-600 text-white font-bold">
              {post.author_name?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm text-white group-hover:text-red-400 transition-colors">
              {post.author_name || "Anonymous"}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">{moment(post.created_date).fromNow()}</p>
              {post.sport && (
                <span className="text-xs bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium">
                  {post.sport}
                </span>
              )}
              {post.category && <span className="text-sm">{categoryIcons[post.category]}</span>}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Follow button */}
          {currentUser && post.author_email !== currentUser.email && (
            <button
              onClick={handleFollow}
              className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                following
                  ? "text-gray-400 bg-gray-800 hover:text-red-400"
                  : "text-red-500 border border-red-500/50 hover:bg-red-600 hover:text-white hover:border-red-600"
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
                <button className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4 text-gray-500 hover:text-white" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                {hasVideoContent() && !post.ai_summary && (
                  <DropdownMenuItem onClick={generateSummary} disabled={generatingSummary} className="gap-2 text-gray-300 hover:text-white">
                    <Sparkles className="w-4 h-4" /> Generate Summary
                  </DropdownMenuItem>
                )}
                {currentUser.email === post.author_email && (
                  <>
                    <DropdownMenuItem
                      onClick={async () => {
                        if (!confirm("Delete this post?")) return;
                        await base44.entities.Post.delete(post.id);
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
                      await base44.entities.Post.update(post.id, { comments_disabled: newVal });
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
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Premium badge */}
      {post.is_premium && !hasAccess && (
        <div className="px-4 pb-3">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Premium Content — Subscribe to view</span>
          </div>
        </div>
      )}

      {/* Post content text */}
      {post.content && (
        <div className={post.is_premium && !hasAccess ? "relative" : ""}>
          {post.is_premium && !hasAccess && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 z-10" />
          )}
          <p className={`px-4 pb-3 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap ${
            post.is_premium && !hasAccess ? "line-clamp-2 blur-sm" : ""
          }`}>
            {post.content.split(/(@\w+(?:\s+\w+)*)/g).map((part, i) =>
              part.startsWith('@') ? (
                <span key={i} className="text-red-400 font-medium">{part}</span>
              ) : part
            )}
          </p>
        </div>
      )}

      {/* AI Summary */}
      {hasVideoContent() && hasAccess && (
        <div className="px-4 pb-3">
          <ContentSummary content={post} type="post" showButton={!post.ai_summary} />
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
                  className="w-full max-h-[480px] object-contain bg-black"
                  onClick={e => e.stopPropagation()}
                  controls
                />
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <img
                  src={post.media_urls[currentMediaIndex]}
                  alt=""
                  className="w-full max-h-[480px] object-cover"
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
                    i === currentMediaIndex ? "border-red-500" : "border-transparent opacity-50 hover:opacity-100"
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
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
        <div className="flex items-center gap-5">
          {/* Like */}
          <button onClick={handleLike} className="flex items-center gap-1.5 group">
            <Heart className={`w-5 h-5 transition-all ${liked ? "fill-red-500 text-red-500 scale-110" : "text-gray-500 group-hover:text-white"}`} />
            <span className={`text-sm font-medium ${liked ? "text-red-500" : "text-gray-500"}`}>{likeCount}</span>
          </button>

          {/* Comment */}
          <button
            onClick={commentsDisabled ? undefined : loadComments}
            className={`flex items-center gap-1.5 group ${commentsDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
            title={commentsDisabled ? "Comments are turned off" : ""}
          >
            <MessageCircle className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            <span className="text-sm font-medium text-gray-500">{post.comments_count || 0}</span>
          </button>

          {/* Share */}
          {currentUser && (
            <button onClick={() => setShowShareDialog(true)} className="flex items-center gap-1.5 group">
              <Share2 className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-gray-500">{post.shares || 0}</span>
            </button>
          )}

          {/* Views */}
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-gray-600" />
            <span className="text-xs text-gray-600">{post.views || 0}</span>
          </div>
        </div>

        {/* Bookmark */}
        <button onClick={toggleHighlight} className="group">
          <Bookmark className={`w-5 h-5 transition-colors ${isHighlighted ? "fill-red-500 text-red-500" : "text-gray-500 group-hover:text-white"}`} />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-gray-800 p-4 space-y-3 bg-gray-900">
          <div className="flex gap-2">
            <MentionInput
              value={newComment}
              onChange={setNewComment}
              placeholder="Add a comment... (type @ to mention)"
              className="flex-1 text-sm bg-gray-800 text-white placeholder:text-gray-500 rounded-xl px-4 py-2.5 border border-gray-700 focus:ring-2 focus:ring-red-500/40 resize-none min-h-[42px] max-h-[120px]"
            />
            <Button
              onClick={addComment}
              size="sm"
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-none"
            >
              Post
            </Button>
          </div>
          {loadingComments ? (
            <div className="text-center py-4 text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2.5 group/comment">
                  <Avatar className="w-7 h-7 ring-1 ring-gray-700">
                    <AvatarImage src={c.author_avatar} />
                    <AvatarFallback className="text-xs bg-gray-800 text-gray-300">{c.author_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-800 rounded-xl px-3 py-2 flex-1 border border-gray-700">
                    <p className="text-xs font-semibold text-white">{c.author_name}</p>
                    <p className="text-sm text-gray-300 mt-0.5">
                      {c.content.split(/(@\w+(?:\s+\w+)*)/g).map((part, i) =>
                        part.startsWith('@') ? (
                          <span key={i} className="text-red-400 font-medium">{part}</span>
                        ) : part
                      )}
                    </p>
                  </div>
                  {c.author_email === currentUser?.email && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="opacity-0 group-hover/comment:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0 self-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showShareDialog && currentUser && (
        <SharePostDialog post={post} user={currentUser} onClose={() => setShowShareDialog(false)} />
      )}

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-gray-900 border-gray-700">
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
                <SelectTrigger className="rounded-xl bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
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
                className="rounded-xl resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                rows={3}
              />
            </div>
            <Button
              onClick={submitReport}
              disabled={!reportReason || submittingReport}
              className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {submittingReport ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </article>
  );
}
