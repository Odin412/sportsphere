import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/api/db";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus } from "lucide-react";

// Rotating sport-themed gradient rings — each story author gets a unique color
const STORY_RING_GRADIENTS = [
  "from-monza via-orange-500 to-yellow-400",
  "from-purple-600 via-pink-500 to-rose-400",
  "from-cyan-500 via-blue-500 to-indigo-600",
  "from-amber-400 via-orange-500 to-red-600",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-violet-600 via-purple-600 to-pink-600",
  "from-monza via-red-700 to-orange-600",
  "from-blue-500 via-cyan-400 to-teal-500",
];

export default function StoriesBar({ user, onStoryClick }) {
  const seenKey = `ss_seen_${user?.email}`;
  const [seen, setSeen] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(seenKey) || "[]"));
    } catch {
      return new Set();
    }
  });

  const { data: stories = [] } = useQuery({
    queryKey: ["stories-24h"],
    queryFn: async () => {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const posts = await db.entities.Post.list("-created_date", 50);
      return posts.filter(
        (p) => p.media_urls?.length > 0 && p.created_date >= cutoff
      );
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    enabled: !!user,
  });

  const markSeen = (id) => {
    const next = new Set([...seen, id]);
    setSeen(next);
    try {
      localStorage.setItem(seenKey, JSON.stringify([...next]));
    } catch {}
  };

  // Group stories by author, unseen authors sorted first
  const grouped = Object.values(
    stories.reduce((acc, s) => {
      const key = s.author_email;
      if (!acc[key]) {
        acc[key] = {
          author_email: key,
          author_name: s.author_name,
          author_avatar: s.author_avatar,
          items: [],
        };
      }
      acc[key].items.push(s);
      return acc;
    }, {})
  ).sort((a, b) => {
    const au = a.items.some((i) => !seen.has(i.id)) ? 1 : 0;
    const bu = b.items.some((i) => !seen.has(i.id)) ? 1 : 0;
    return bu - au;
  });

  // Don't render if no stories and no user (edge case)
  if (!user) return null;

  return (
    <div className="glass-card rounded-lg px-3 pt-2 pb-3">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[10px] font-display font-bold uppercase tracking-widest text-stadium-600">Stories</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar">
        {/* Add Story shortcut */}
        <Link
          to={createPageUrl("CreatePost")}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-stadium-700 flex items-center justify-center bg-stadium-800/60 hover:border-monza hover:bg-monza/10 transition-all">
            <Plus className="w-6 h-6 text-stadium-500" />
          </div>
          <span className="text-[10px] text-stadium-600 font-medium truncate w-full text-center">
            Add
          </span>
        </Link>

        {/* Story bubbles */}
        {grouped.map((group, idx) => {
          const hasUnseen = group.items.some((i) => !seen.has(i.id));
          const gradient = STORY_RING_GRADIENTS[idx % STORY_RING_GRADIENTS.length];
          return (
            <button
              key={group.author_email}
              className="flex-shrink-0 flex flex-col items-center gap-1.5 w-16 cursor-pointer"
              onClick={() => onStoryClick(group.items, group, markSeen)}
            >
              <div
                className={`p-[2.5px] rounded-full ${
                  hasUnseen
                    ? `bg-gradient-to-tr ${gradient} shadow-lg shadow-monza/20`
                    : "bg-stadium-700"
                }`}
              >
                <div className="bg-stadium-900 p-[2px] rounded-full">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={group.author_avatar} />
                    <AvatarFallback className="bg-stadium-800 text-white text-sm font-bold">
                      {group.author_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className={`text-[10px] font-semibold truncate w-full text-center ${hasUnseen ? "text-white" : "text-stadium-500"}`}>
                {group.author_name?.split(" ")[0]}
              </span>
            </button>
          );
        })}

        {/* Placeholder when no stories yet */}
        {grouped.length === 0 && (
          <div className="flex items-center gap-2 px-2 py-3">
            <p className="text-[11px] text-stadium-600 italic">
              24h media posts appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
