import React, { useState, useEffect } from "react";
import { useAuth } from '@/lib/AuthContext';
import { db } from "@/api/db";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Video, X, Loader2, ArrowLeft, Crown, Sliders } from "lucide-react";
import { Link } from "react-router-dom";
import VideoEditor from "@/components/video/VideoEditor";
import { awardPoints } from "@/components/gamification/PointsHelper";
import { toast } from "sonner";

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [editingVideoIndex, setEditingVideoIndex] = useState(null);
  const [videoMeta, setVideoMeta] = useState({});

  useEffect(() => {

  }, []);

  const handleMediaAdd = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const newPreviews = [];
      const newUrls = [];

      for (const file of files) {
        const preview = URL.createObjectURL(file);
        newPreviews.push({ url: preview, type: file.type.startsWith("video") ? "video" : "image" });

        const { file_url } = await db.integrations.Core.UploadFile({ file });
        newUrls.push(file_url);
      }

      setMediaPreviews(prev => [...prev, ...newPreviews]);
      setMediaFiles(prev => [...prev, ...newUrls]);
    } catch (error) {
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index) => {
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;
    setPosting(true);

    // AI Content moderation check (non-blocking)
    if (content.trim()) {
      try {
        const modResult = await db.functions.invoke("moderateContent", {
          content_type: "post",
          content_id: `draft_${Date.now()}`,
          content_text: content,
          author_email: user.email,
          author_name: user.full_name,
        });
        const { action, severity } = modResult?.data || modResult || {};
        if (action === "auto_remove" && severity === "critical") {
          toast.error("Post blocked: content violates community guidelines.");
          setPosting(false);
          return;
        }
        if (action === "flag_for_review") {
          toast.warning("Your post has been flagged for admin review before appearing publicly.");
        }
      } catch (e) {
        // moderation errors shouldn't block posting
        console.warn("Moderation check skipped:", e.message);
      }
    }

    try {
      const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
      const mentions = [...content.matchAll(mentionRegex)].map(m => m[1]);

      const hasVideo = mediaPreviews.some(m => m.type === "video");
      const hasImage = mediaPreviews.some(m => m.type === "image");

      const finalMediaUrls = [...mediaFiles];
      let thumbnailUrl = undefined;
      for (const [idxStr, meta] of Object.entries(videoMeta)) {
        if (meta.thumbnailFile) {
          const { file_url } = await db.integrations.Core.UploadFile({ file: meta.thumbnailFile });
          thumbnailUrl = file_url;
        }
      }

      const allChapters = Object.values(videoMeta).flatMap(m => m.chapters || []);
      const allTrimInfo = Object.entries(videoMeta)
        .filter(([, m]) => m.trimStart !== undefined)
        .map(([i, m]) => ({ index: parseInt(i), startTime: m.trimStart, endTime: m.trimEnd }));

      const post = await db.entities.Post.create({
        author_email: user.email,
        author_name: user.full_name,
        author_avatar: user.avatar_url,
        content,
        created_date: new Date().toISOString(),
        media_urls: finalMediaUrls,
        media_type: hasVideo && hasImage ? "mixed" : hasVideo ? "video" : hasImage ? "image" : undefined,
        thumbnail_url: thumbnailUrl,
        video_chapters: allChapters.length > 0 ? allChapters : undefined,
        video_trim: allTrimInfo.length > 0 ? allTrimInfo : undefined,
        likes: [],
        comments_count: 0,
        views: 0,
        shares: 0,
        mentioned_users: mentions.length > 0 ? mentions : [],
        is_premium: isPremium,
        comments_disabled: user?.comments_disabled || false,
      });

      // Notify mentioned users (fire-and-forget)
      if (mentions.length > 0) {
        db.entities.User.list(null, 500).then(allUsers => {
          for (const mention of mentions) {
            const mentionedUser = allUsers.find(u => u.full_name?.toLowerCase() === mention.toLowerCase());
            if (mentionedUser && mentionedUser.email !== user.email) {
              db.entities.Notification.create({
                recipient_email: mentionedUser.email,
                actor_email: user.email,
                actor_name: user.full_name,
                actor_avatar: user.avatar_url,
                type: "mention",
                post_id: post.id,
                message: "mentioned you in a post",
              }).catch(() => {});
            }
          }
        }).catch(() => {});
      }

      awardPoints(user.email, "POST_CREATED").catch(() => {});
      navigate(createPageUrl("Feed"));
    } catch (error) {
      console.error("Post creation failed:", error);
      toast.error("Failed to publish post. Please try again.");
      setPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to={createPageUrl("Feed")} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Create Post</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Share your training, highlight, or motivation... (type @ to mention users)"
            className="min-h-[120px] border-0 bg-slate-50 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 resize-none focus:ring-2 focus:ring-orange-200"
          />
          <p className="text-xs text-slate-400">Tip: Type @ to mention other athletes</p>
        </div>

        {/* Media previews */}
        {mediaPreviews.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {mediaPreviews.map((m, i) => (
              <div key={i} className="space-y-1">
                <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-video">
                  {m.type === "video" ? (
                    videoMeta[i]?.thumbnailPreview
                      ? <img src={videoMeta[i].thumbnailPreview} alt="thumbnail" className="w-full h-full object-cover" />
                      : <video src={m.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  )}
                  <button onClick={() => removeMedia(i)} className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition">
                    <X className="w-4 h-4 text-white" />
                  </button>
                  {m.type === "video" && (
                    <button
                      onClick={() => setEditingVideoIndex(editingVideoIndex === i ? null : i)}
                      className="absolute bottom-2 right-2 flex items-center gap-1 text-xs bg-black/60 text-white px-2 py-1 rounded-lg hover:bg-black/80 transition"
                    >
                      <Sliders className="w-3 h-3" /> Edit
                    </button>
                  )}
                  {videoMeta[i]?.chapters?.length > 0 && (
                    <div className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded-lg">
                      {videoMeta[i].chapters.length} chapters
                    </div>
                  )}
                </div>
                {m.type === "video" && editingVideoIndex === i && (
                  <VideoEditor
                    videoUrl={m.url}
                    onClose={() => setEditingVideoIndex(null)}
                    onTrimReady={({ startTime, endTime }) =>
                      setVideoMeta(prev => ({ ...prev, [i]: { ...prev[i], trimStart: startTime, trimEnd: endTime } }))
                    }
                    onThumbnailReady={(file, preview) =>
                      setVideoMeta(prev => ({ ...prev, [i]: { ...prev[i], thumbnailFile: file, thumbnailPreview: preview } }))
                    }
                    onChaptersChange={(chapters) =>
                      setVideoMeta(prev => ({ ...prev, [i]: { ...prev[i], chapters } }))
                    }
                    onFiltersChange={(filter) =>
                      setVideoMeta(prev => ({ ...prev, [i]: { ...prev[i], filter } }))
                    }
                    onTextOverlaysChange={(textOverlays) =>
                      setVideoMeta(prev => ({ ...prev, [i]: { ...prev[i], textOverlays } }))
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Premium Toggle */}
        {user?.subscription_price > 0 && (
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <div>
                <Label className="text-sm font-medium text-amber-900">Premium Content</Label>
                <p className="text-xs text-amber-700">Only subscribers can view</p>
              </div>
            </div>
            <Switch checked={isPremium} onCheckedChange={setIsPremium} />
          </div>
        )}

        {/* Media buttons */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-sm font-medium text-slate-600">
            <ImagePlus className="w-4 h-4" />
            Photo
            <input type="file" accept="image/*" multiple onChange={handleMediaAdd} className="hidden" />
          </label>
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-sm font-medium text-slate-600">
            <Video className="w-4 h-4" />
            Video
            <input type="file" accept="video/*" multiple onChange={handleMediaAdd} className="hidden" />
          </label>
          {uploading && <Loader2 className="w-5 h-5 animate-spin text-orange-500" />}
        </div>

        <Button
          onClick={handlePost}
          disabled={posting || (!content.trim() && mediaFiles.length === 0)}
          className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-600 hover:to-amber-500 text-white font-semibold h-12 shadow-lg shadow-orange-500/25"
        >
          {posting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Post"}
        </Button>
      </div>
    </div>
  );
}
