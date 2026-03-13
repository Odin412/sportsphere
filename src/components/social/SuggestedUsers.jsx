import React from "react";
import { db } from "@/api/db";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SPORT_COLORS = {
  Basketball: "bg-orange-100 text-orange-700",
  Soccer: "bg-green-100 text-green-700",
  Football: "bg-amber-100 text-amber-700",
  Baseball: "bg-red-100 text-red-700",
  Tennis: "bg-yellow-100 text-yellow-700",
  Golf: "bg-lime-100 text-lime-700",
  MMA: "bg-purple-100 text-purple-700",
  Hockey: "bg-blue-100 text-blue-700",
  Track: "bg-cyan-100 text-cyan-700",
  Swimming: "bg-sky-100 text-sky-700",
  CrossFit: "bg-rose-100 text-rose-700",
};

export default function SuggestedUsers() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Current user's follows
  const { data: myFollows = [] } = useQuery({
    queryKey: ["my-follows", currentUser?.email],
    queryFn: () => db.entities.Follow.filter({ follower_email: currentUser.email }),
    enabled: !!currentUser?.email,
  });

  // All sport profiles
  const { data: allProfiles = [], isLoading } = useQuery({
    queryKey: ["all-sport-profiles-suggested"],
    queryFn: () => db.entities.SportProfile.list("-created_date", 100),
    enabled: !!currentUser?.email,
  });

  const followedEmails = new Set(myFollows.map(f => f.following_email));

  // Filter: not already followed, not current user, has a name, limit 5
  const suggestions = allProfiles
    .filter(p =>
      p.user_email !== currentUser?.email &&
      !followedEmails.has(p.user_email) &&
      p.user_name
    )
    .slice(0, 5);

  const followMutation = useMutation({
    mutationFn: (targetEmail) =>
      db.entities.Follow.create({
        follower_email: currentUser.email,
        following_email: targetEmail,
        status: "accepted",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-follows", currentUser?.email] });
    },
  });

  if (!currentUser || isLoading) return null;
  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <span className="text-sm font-bold text-white flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-red-400" />
          Who to Follow
        </span>
        <Link
          to={createPageUrl("Explore")}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          See all
        </Link>
      </div>

      {/* User list */}
      <div className="divide-y divide-gray-800">
        {suggestions.map(profile => (
          <div key={profile.user_email} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/40 transition-colors">
            <Link
              to={createPageUrl("UserProfile") + `?email=${profile.user_email}`}
              className="flex-1 flex items-center gap-3 min-w-0"
            >
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-sm bg-red-900 text-red-200 font-bold">
                  {profile.user_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  {profile.user_name}
                </p>
                {profile.sport && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${SPORT_COLORS[profile.sport] || "bg-gray-700 text-gray-300"}`}>
                    {profile.sport}
                  </span>
                )}
              </div>
            </Link>
            <Button
              size="sm"
              variant="outline"
              onClick={() => followMutation.mutate(profile.user_email)}
              disabled={followMutation.isPending && followMutation.variables === profile.user_email}
              className="h-7 px-3 text-xs border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-colors flex-shrink-0"
            >
              {followMutation.isPending && followMutation.variables === profile.user_email
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : "Follow"
              }
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
