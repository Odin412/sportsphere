import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function TrendingAthletes({ profiles = [] }) {
  if (!profiles.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-sm uppercase tracking-wider">Trending Athletes</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {profiles.map((p) => (
          <Link
            key={p.id || p.user_email}
            to={`${createPageUrl("UserProfile")}?email=${p.user_email || p.email}`}
            className="flex-shrink-0 w-[130px] bg-gray-900 border border-gray-800 hover:border-red-800/50 rounded-2xl p-3 text-center transition-all group"
          >
            <Avatar className="w-14 h-14 mx-auto ring-2 ring-gray-700 group-hover:ring-red-600/50 transition-all">
              <AvatarImage src={p.avatar_url || p.photo_url} />
              <AvatarFallback className="bg-gray-800 text-gray-400 font-bold text-sm">
                {(p.user_name || p.full_name || "?").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-white font-bold text-xs mt-2 truncate">{p.user_name || p.full_name}</p>
            {p.sport && (
              <Badge className="mt-1 bg-gray-800 text-gray-400 border-gray-700 text-[9px] px-1.5">
                {p.sport}
              </Badge>
            )}
            {p.position && (
              <p className="text-gray-600 text-[9px] mt-0.5 truncate">{p.position}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
