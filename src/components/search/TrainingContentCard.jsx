import React from "react";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Eye, ThumbsUp } from "lucide-react";

const CATEGORY_COLORS = {
  drill: "bg-blue-900/50 text-blue-400 border-blue-800",
  workout: "bg-green-900/50 text-green-400 border-green-800",
  "form-correction": "bg-orange-900/50 text-orange-400 border-orange-800",
  highlight: "bg-purple-900/50 text-purple-400 border-purple-800",
  analysis: "bg-cyan-900/50 text-cyan-400 border-cyan-800",
  motivation: "bg-pink-900/50 text-pink-400 border-pink-800",
};

function formatDuration(seconds) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TrainingContentCard({ content, onClick }) {
  const thumbnail =
    content.thumbnail_url ||
    (content.youtube_id
      ? `https://img.youtube.com/vi/${content.youtube_id}/mqdefault.jpg`
      : null);

  const catClass = CATEGORY_COLORS[content.category] || "bg-gray-800 text-gray-400 border-gray-700";

  return (
    <button
      onClick={() => onClick?.(content)}
      className="text-left bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl overflow-hidden transition-all group w-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-800 overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={content.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-8 h-8 text-gray-600" />
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-10 h-10 rounded-full bg-red-600/90 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
        {/* Duration badge */}
        {content.duration_seconds > 0 && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {formatDuration(content.duration_seconds)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-white font-bold text-xs leading-tight line-clamp-2">{content.title}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge className={`text-[9px] px-1.5 border ${catClass}`}>
            {(content.category || "").replace("-", " ")}
          </Badge>
          {content.sport && (
            <Badge className="text-[9px] px-1.5 bg-gray-800 text-gray-500 border-gray-700">
              {content.sport}
            </Badge>
          )}
          {content.skill_level && content.skill_level !== "all" && (
            <Badge className="text-[9px] px-1.5 bg-gray-800 text-gray-500 border-gray-700">
              {content.skill_level}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-gray-600 text-[10px]">
          {content.views > 0 && (
            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {content.views}</span>
          )}
          {content.upvotes > 0 && (
            <span className="flex items-center gap-0.5"><ThumbsUp className="w-3 h-3" /> {content.upvotes}</span>
          )}
          {content.author_name && (
            <span className="truncate">{content.author_name}</span>
          )}
        </div>
      </div>
    </button>
  );
}
