import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { base44 } from "@/api/base44Client";
import moment from "moment";

const IMAGE_DURATION = 5000;
const VIDEO_DURATION = 10000;

export default function StoryViewer({ stories, authorGroup, onClose, onMarkSeen, user }) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [myReaction, setMyReaction] = useState(null);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);
  // Stable refs so effects can always call latest versions without stale closures
  const goNextRef = useRef(null);
  const goPrevRef = useRef(null);

  const current = stories[index];
  const isOwn = current?.author_email === user?.email;
  const media = current?.media_urls?.[0];
  const isVideo = !!media?.match(/\.(mp4|webm|ogg|mov)/i);
  const DURATION = isVideo ? VIDEO_DURATION : IMAGE_DURATION;

  const goNext = () => {
    if (index < stories.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  goNextRef.current = goNext;
  goPrevRef.current = goPrev;

  const handleReact = (emoji) => {
    setMyReaction((prev) => (prev === emoji ? null : emoji));
  };

  // Track story view and increment view count when active story changes
  useEffect(() => {
    if (!current?.id || !user?.email) return;
    base44.entities.Post.update(current.id, {
      views: (current.views || 0) + 1,
    }).catch(() => {});
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset reaction when story changes
  useEffect(() => {
    setMyReaction(null);
  }, [current?.id]);

  // Auto-advance timer + animated progress bar
  useEffect(() => {
    // Stop any video from the previous story
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    // Mark current story as seen
    if (current?.id) onMarkSeen(current.id);

    // Reset progress and clear old timers
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    const startTime = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(intervalRef.current);
    }, 50);

    timerRef.current = setTimeout(() => {
      goNextRef.current();
    }, DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation — uses refs so no stale closure on index
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNextRef.current?.();
      if (e.key === "ArrowLeft") goPrevRef.current?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm h-screen flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
          {stories.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width:
                    i < index
                      ? "100%"
                      : i === index
                      ? `${progress}%`
                      : "0%",
                  transition: i === index ? "none" : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* Author header */}
        <div className="absolute top-8 left-3 right-12 flex items-center gap-2 z-20">
          <Avatar className="w-9 h-9 ring-2 ring-white/60">
            <AvatarImage src={authorGroup.author_avatar} />
            <AvatarFallback className="bg-gray-700 text-white text-xs font-bold">
              {authorGroup.author_name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white text-sm font-bold leading-tight drop-shadow">
              {authorGroup.author_name}
            </p>
            <p className="text-white/60 text-[10px]">
              {moment(current?.created_date).fromNow()}
            </p>
          </div>
          {current.sport && (
            <span className="ml-auto text-xs bg-white/20 text-white rounded-full px-2 py-0.5 font-semibold backdrop-blur">
              {current.sport}
            </span>
          )}
          {/* Viewer count — only shown to story author */}
          {isOwn && (current.views || 0) > 0 && (
            <div className="flex items-center gap-1 text-white/70 text-xs ml-1">
              <Eye className="w-3 h-3" />
              <span>{current.views}</span>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-3 z-20 text-white/80 hover:text-white p-1 bg-black/20 rounded-full backdrop-blur"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media area */}
        <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
          {media ? (
            isVideo ? (
              <video
                ref={videoRef}
                key={media}
                src={media}
                autoPlay
                muted
                playsInline
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <img
                key={media}
                src={media}
                alt={current?.content || "Story"}
                className="max-w-full max-h-full object-contain"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8">
              <p className="text-white text-xl font-bold text-center leading-relaxed">
                {current?.content}
              </p>
            </div>
          )}
        </div>

        {/* Caption */}
        {media && current?.content && (
          <div className="absolute bottom-16 left-0 right-0 px-4 z-20">
            <p className="text-white text-sm text-center bg-black/50 rounded-xl px-3 py-2 backdrop-blur-sm leading-relaxed">
              {current.content.substring(0, 120)}
              {current.content.length > 120 ? "…" : ""}
            </p>
          </div>
        )}

        {/* Story emoji reactions — shown to viewers (not the story author) */}
        {user && !isOwn && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
            {["❤️", "🔥", "😮", "👏", "💪"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className={`text-xl transition-transform hover:scale-125 active:scale-150 ${
                  myReaction === emoji
                    ? "scale-110 opacity-100"
                    : "opacity-75 hover:opacity-100"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Navigation arrows (desktop) */}
        {index > 0 && (
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex w-8 h-8 items-center justify-center bg-black/40 rounded-full text-white hover:bg-black/60 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {index < stories.length - 1 && (
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden sm:flex w-8 h-8 items-center justify-center bg-black/40 rounded-full text-white hover:bg-black/60 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Invisible tap zones (mobile) */}
        <button
          className="absolute left-0 top-0 w-1/2 h-full z-10 opacity-0"
          onClick={goPrev}
          aria-label="Previous story"
        />
        <button
          className="absolute right-0 top-0 w-1/2 h-full z-10 opacity-0"
          onClick={goNext}
          aria-label="Next story"
        />
      </div>
    </div>
  );
}
