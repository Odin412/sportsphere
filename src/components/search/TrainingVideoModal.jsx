import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, ExternalLink, X } from "lucide-react";
import { db } from "@/api/db";
import { toast } from "sonner";

export default function TrainingVideoModal({ content, open, onClose, userEmail }) {
  const [voting, setVoting] = useState(false);

  const isYouTube = !!content?.youtube_id;
  const embedUrl = isYouTube
    ? `https://www.youtube.com/embed/${content.youtube_id}?autoplay=1&rel=0`
    : null;

  const handleVote = async (direction) => {
    if (!userEmail) {
      toast.error("Sign in to vote");
      return;
    }
    setVoting(true);
    try {
      const field = direction === "up" ? "upvotes" : "downvotes";
      await db.entities.TrainingContent.update(content.id, {
        [field]: (content[field] || 0) + 1,
      });
      toast.success(direction === "up" ? "Upvoted!" : "Feedback recorded");
    } catch {
      toast.error("Vote failed");
    } finally {
      setVoting(false);
    }
  };

  // Increment view count silently
  useEffect(() => {
    if (open && content?.id) {
      db.entities.TrainingContent.update(content.id, {
        views: (content.views || 0) + 1,
      }).catch(() => {});
    }
  }, [open, content?.id]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || !content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl mx-4 rounded-2xl bg-gray-950 border border-gray-800 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Video */}
        <div className="relative aspect-video bg-black">
          {isYouTube ? (
            <iframe
              src={embedUrl}
              title={content.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : content.video_url ? (
            <video
              src={content.video_url}
              controls
              autoPlay
              className="absolute inset-0 w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
              No video available
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 rounded-full p-1.5 text-white transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="p-5 space-y-3">
          <h2 className="text-white font-black text-lg leading-tight">{content.title}</h2>

          <div className="flex items-center gap-2 flex-wrap">
            {content.sport && (
              <Badge className="bg-red-900/40 text-red-400 border-red-800 text-xs">{content.sport}</Badge>
            )}
            {content.category && (
              <Badge className="bg-gray-800 text-gray-400 border-gray-700 text-xs">
                {content.category.replace("-", " ")}
              </Badge>
            )}
            {content.skill_level && content.skill_level !== "all" && (
              <Badge className="bg-gray-800 text-gray-400 border-gray-700 text-xs">{content.skill_level}</Badge>
            )}
            {content.author_name && (
              <span className="text-gray-500 text-xs">by {content.author_name}</span>
            )}
          </div>

          {content.description && (
            <p className="text-gray-400 text-sm leading-relaxed">{content.description}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
            <Button
              size="sm"
              variant="outline"
              disabled={voting}
              onClick={() => handleVote("up")}
              className="gap-1.5 border-gray-700 text-gray-400 hover:text-green-400 hover:border-green-700 rounded-xl text-xs"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              {content.upvotes || 0}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={voting}
              onClick={() => handleVote("down")}
              className="gap-1.5 border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-700 rounded-xl text-xs"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </Button>
            {content.video_url && (
              <a
                href={content.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto"
              >
                <Button size="sm" variant="outline" className="gap-1.5 border-gray-700 text-gray-400 rounded-xl text-xs">
                  <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
