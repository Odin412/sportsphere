import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { MessageSquare, Eye, Heart } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function RecommendedForums({ topics: propTopics }) {
  const { user } = useAuth();
  const userSports = user?.preferred_sports || [];

  const { data: fetchedTopics = [] } = useQuery({
    queryKey: ["recommended-forums", userSports.join(",")],
    queryFn: async () => {
      const all = await base44.entities.ForumTopic.list("-created_date", 30);
      return all.sort((a, b) => {
        // Prioritize sport matches, then by engagement (likes + replies)
        const aMatch = userSports.includes(a.sport) ? 100 : 0;
        const bMatch = userSports.includes(b.sport) ? 100 : 0;
        const aScore = aMatch + (a.likes?.length || 0) + (a.replies_count || 0) * 2;
        const bScore = bMatch + (b.likes?.length || 0) + (b.replies_count || 0) * 2;
        return bScore - aScore;
      });
    },
    enabled: !propTopics?.length && !!user,
    staleTime: 5 * 60 * 1000,
  });

  const topics = propTopics?.length ? propTopics : fetchedTopics;

  if (!topics.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-green-400" />
        <h2 className="text-lg font-bold text-white">Hot Forum Topics</h2>
      </div>
      <div className="space-y-2">
        {topics.slice(0, 5).map(topic => (
          <Link
            key={topic.id}
            to={createPageUrl("ForumTopic") + `?id=${topic.id}`}
            className="flex items-start gap-3 bg-slate-800/80 border border-slate-700 hover:border-green-500/50 rounded-2xl p-4 transition-all hover:scale-[1.01]"
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm truncate">{topic.title}</p>
              <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{topic.content}</p>
              <div className="flex items-center gap-3 mt-2">
                {topic.sport && <Badge className="bg-green-500/20 text-green-300 text-xs">{topic.sport}</Badge>}
                <span className="text-xs text-slate-500 flex items-center gap-1"><MessageSquare className="w-3 h-3" />{topic.replies_count || 0}</span>
                <span className="text-xs text-slate-500 flex items-center gap-1"><Eye className="w-3 h-3" />{topic.views || 0}</span>
                <span className="text-xs text-slate-500 flex items-center gap-1"><Heart className="w-3 h-3" />{topic.likes?.length || 0}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
