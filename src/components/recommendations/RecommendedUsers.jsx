import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { Users, UserPlus } from "lucide-react";
import { db } from "@/api/db";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

export default function RecommendedUsers({ profiles: propProfiles, currentUser: propCurrentUser }) {
  const { user } = useAuth();
  const currentUser = propCurrentUser || user;
  const [requested, setRequested] = useState({});

  const { data: allProfiles = [] } = useQuery({
    queryKey: ["all-profiles-for-suggestions"],
    queryFn: () => db.entities.User.list(null, 500),
    enabled: !propProfiles?.length && !!currentUser,
    staleTime: 5 * 60 * 1000,
  });

  const { data: myFollows = [] } = useQuery({
    queryKey: ["my-follows", currentUser?.email],
    queryFn: () => db.entities.Follow.filter({ follower_email: currentUser.email }),
    enabled: !propProfiles?.length && !!currentUser?.email,
    staleTime: 60000,
  });

  const profiles = propProfiles?.length
    ? propProfiles
    : (() => {
        const followedEmails = new Set(myFollows.map(f => f.following_email));
        const userSports = currentUser?.preferred_sports || [];
        return allProfiles
          .filter(p => p.email !== currentUser?.email && !followedEmails.has(p.email))
          .map(p => ({
            id: p.id,
            user_email: p.email,
            user_name: p.full_name,
            avatar_url: p.avatar_url,
            location: p.location,
            sport: p.preferred_sports?.[0] || "",
            level: p.role || "athlete",
            _score: (p.preferred_sports || []).some(s => userSports.includes(s)) ? 1 : 0,
          }))
          .sort((a, b) => b._score - a._score)
          .slice(0, 6);
      })();

  const handleFollow = async (e, profile) => {
    e.preventDefault();
    if (requested[profile.user_email]) return;
    setRequested(prev => ({ ...prev, [profile.user_email]: true }));
    try {
      await db.entities.Follow.create({
        follower_email: currentUser.email,
        following_email: profile.user_email,
        status: "pending",
      });
      await db.entities.Notification.create({
        recipient_email: profile.user_email,
        actor_email: currentUser.email,
        actor_name: currentUser.full_name,
        actor_avatar: currentUser.avatar_url,
        type: "follow_request",
        message: "wants to follow you",
        follow_requester_email: currentUser.email,
      });
    } catch {
      toast.error("Failed to send follow request");
      setRequested(prev => ({ ...prev, [profile.user_email]: false }));
    }
  };

  if (!profiles.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-bold text-white">Athletes Like You</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {profiles.slice(0, 6).map(profile => (
          <Link
            key={profile.id}
            to={createPageUrl("UserProfile") + `?email=${profile.user_email}`}
            className="block bg-slate-800/80 border border-slate-700 hover:border-purple-500/50 rounded-2xl p-4 text-center transition-all hover:scale-[1.01]"
          >
            <Avatar className="w-14 h-14 mx-auto mb-2 ring-2 ring-purple-500/30">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-purple-700 text-white font-bold text-lg">
                {profile.user_name?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <p className="font-bold text-white text-sm truncate">{profile.user_name}</p>
            <p className="text-slate-400 text-xs truncate">{profile.location}</p>
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {profile.sport && <Badge className="bg-purple-500/20 text-purple-300 text-xs">{profile.sport}</Badge>}
              {profile.level && <Badge className="bg-slate-700 text-slate-300 text-xs">{profile.level}</Badge>}
            </div>
            {currentUser && profile.user_email !== currentUser.email && !requested[profile.user_email] && (
              <Button
                size="sm"
                className="mt-3 w-full rounded-xl h-7 text-xs bg-purple-600 hover:bg-purple-700"
                onClick={(e) => handleFollow(e, profile)}
              >
                <UserPlus className="w-3 h-3 mr-1" /> Follow
              </Button>
            )}
            {requested[profile.user_email] && (
              <p className="text-xs text-slate-400 mt-3">Requested</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
