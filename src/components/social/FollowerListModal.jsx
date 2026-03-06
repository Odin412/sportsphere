import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * FollowerListModal
 * Props:
 *   profileEmail  — whose followers/following to show
 *   mode          — "followers" | "following"
 *   onClose()
 */
export default function FollowerListModal({ profileEmail, mode, onClose }) {
  const [search, setSearch] = useState("");

  const { data: follows = [], isLoading } = useQuery({
    queryKey: ["follow-list", profileEmail, mode],
    queryFn: () =>
      mode === "followers"
        ? base44.entities.Follow.filter({ following_email: profileEmail, status: "accepted" })
        : base44.entities.Follow.filter({ follower_email: profileEmail, status: "accepted" }),
    enabled: !!profileEmail,
  });

  // For each follow record, get the relevant user email + name
  const users = follows.map(f => ({
    email: mode === "followers" ? f.follower_email : f.following_email,
    name: mode === "followers" ? (f.follower_name || f.follower_email) : (f.following_name || f.following_email),
    avatar: mode === "followers" ? f.follower_avatar : f.following_avatar,
  }));

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="text-center font-black capitalize">{mode}</DialogTitle>
        </DialogHeader>
        <div className="px-3 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 rounded-xl text-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No {mode} yet.</p>
          ) : (
            filtered.map(u => (
              <Link
                key={u.email}
                to={createPageUrl("UserProfile") + `?email=${u.email}`}
                onClick={onClose}
                className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Avatar className="w-9 h-9">
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback className="text-sm bg-red-100 text-red-700 font-bold">{u.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
