import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import moment from "moment";

export default function StoryViewer({ stories, authorGroup, onClose, onMarkSeen }) {
  const [index, setIndex] = useState(0);

  const current = stories[index];

  // Mark current story as seen whenever index changes
  useEffect(() => {
    if (current?.id) onMarkSeen(current.id);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const media = current?.media_urls?.[0];
  const isVideo = !!media?.match(/\.(mp4|webm|ogg|mov)/i);

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
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
          {stories.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-all ${
                i < index
                  ? "bg-white"
                  : i === index
                  ? "bg-white"
                  : "bg-white/30"
              }`}
            />
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
                key={media}
                src={media}
                autoPlay
                loop
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

        {/* Navigation arrows (visible on desktop) */}
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
