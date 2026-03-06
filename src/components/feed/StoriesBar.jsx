import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus } from "lucide-react";

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
      const posts = await base44.entities.Post.list("-created_date", 50);
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
    <div className="bg-gray-900 rounded-2xl p-3 border border-gray-800">
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {/* Add Story shortcut */}
        <Link
          to={createPageUrl("CreatePost")}
          className="flex-shrink-0 flex flex-col items-center gap-1 w-14"
        >
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-800 hover:border-red-500 transition-colors">
            <Plus className="w-5 h-5 text-gray-500" />
          </div>
          <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">
            Add Story
          </span>
        </Link>

        {/* Story bubbles */}
        {grouped.map((group) => {
          const hasUnseen = group.items.some((i) => !seen.has(i.id));
          return (
            <button
              key={group.author_email}
              className="flex-shrink-0 flex flex-col items-center gap-1 w-14 cursor-pointer"
              onClick={() => onStoryClick(group.items, group, markSeen)}
            >
              <div
                className={`p-0.5 rounded-full ${
                  hasUnseen
                    ? "bg-gradient-to-tr from-red-500 to-orange-400"
                    : "bg-gray-700"
                }`}
              >
                <div className="bg-gray-900 p-0.5 rounded-full">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={group.author_avatar} />
                    <AvatarFallback className="bg-gray-700 text-white text-xs font-bold">
                      {group.author_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-medium truncate w-full text-center">
                {group.author_name?.split(" ")[0]}
              </span>
            </button>
          );
        })}

        {/* Placeholder when no stories yet */}
        {grouped.length === 0 && (
          <div className="flex items-center gap-2 px-2">
            <p className="text-[11px] text-gray-600">
              Stories from the last 24h will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
