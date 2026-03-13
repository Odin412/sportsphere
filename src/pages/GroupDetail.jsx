import React, { useState, useEffect } from "react";
import { useAuth } from '@/lib/AuthContext';
import { db } from "@/api/db";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Calendar, MessageSquare, Settings, ArrowLeft, UserPlus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import GroupPostCard from "@/components/groups/GroupPostCard";
import CreatePostDialog from "@/components/groups/CreatePostDialog";
import EventCard from "@/components/groups/EventCard";
import CreateEventDialog from "@/components/groups/CreateEventDialog";

export default function GroupDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const groupId = urlParams.get("id");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editGroupData, setEditGroupData] = useState({});
  const [savingGroup, setSavingGroup] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {

  }, []);

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      try {
        const g = await db.entities.Group.filter({ id: groupId });
        return g[0];
      } catch { return null; }
    },
    enabled: !!groupId,
  });

  const { data: posts, refetch: refetchPosts } = useQuery({
    queryKey: ["group-posts", groupId],
    queryFn: async () => {
      try {
        return await db.entities.GroupPost.filter({ group_id: groupId }, "-created_date", 50);
      } catch { return []; }
    },
    enabled: !!groupId,
  });

  const { data: events, refetch: refetchEvents } = useQuery({
    queryKey: ["group-events", groupId],
    queryFn: async () => {
      try {
        return await db.entities.Event.filter({ group_id: groupId }, "date", 50);
      } catch { return []; }
    },
    enabled: !!groupId,
  });

  const isMember = group?.members?.includes(user?.email);
  const isAdmin = group?.admins?.includes(user?.email);

  const joinGroup = async () => {
    setJoining(true);
    try {
      if (group.membership_fee > 0) {
        await db.entities.Transaction.create({
          from_email: user.email,
          to_email: group.creator_email,
          type: "group_membership",
          amount: group.membership_fee,
          status: "completed",
          group_id: groupId,
        });
        await db.entities.Notification.create({
          recipient_email: group.creator_email,
          actor_email: user.email,
          actor_name: user.full_name,
          actor_avatar: user.avatar_url,
          type: "follow",
          message: `joined ${group.name} (paid $${group.membership_fee})`,
        });
      }
      await db.entities.Group.update(groupId, {
        members: [...(group.members || []), user.email],
      });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      toast.success("Joined group!");
    } catch (error) {
      toast.error("Failed to join group. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const leaveGroup = async () => {
    try {
      await db.entities.Group.update(groupId, {
        members: group.members.filter(m => m !== user.email),
      });
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
    } catch (error) {
      toast.error("Failed to leave group. Please try again.");
    }
  };

  const openEditGroup = () => {
    setEditGroupData({
      name: group.name || "",
      description: group.description || "",
      sport: group.sport || "",
      location: group.location || "",
    });
    setShowEditGroup(true);
  };

  const handleSaveGroup = async () => {
    if (!editGroupData.name?.trim()) {
      toast.error("Group name is required.");
      return;
    }
    setSavingGroup(true);
    try {
      await db.entities.Group.update(groupId, editGroupData);
      queryClient.invalidateQueries({ queryKey: ["group", groupId] });
      setShowEditGroup(false);
      toast.success("Group updated!");
    } catch (error) {
      toast.error("Failed to update group. Please try again.");
    } finally {
      setSavingGroup(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Group not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="h-32 bg-gradient-to-br from-orange-500 to-amber-400" />
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Link to={createPageUrl("Groups")} className="text-slate-400 hover:text-slate-600">
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
                </div>
                <p className="text-slate-600 mb-3">{group.description}</p>
                <div className="flex flex-wrap gap-2">
                  {group.sport && (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                      {group.sport}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {group.category?.replace(/_/g, " ")}
                  </Badge>
                  {group.location && (
                    <Badge variant="outline" className="gap-1">
                      <span>📍</span> {group.location}
                    </Badge>
                  )}
                  <Badge variant="outline" className="gap-1">
                    <Users className="w-3 h-3" />
                    {group.members?.length || 0} members
                  </Badge>
                </div>
              </div>
              {user && (
                <div className="flex gap-2">
                  {isAdmin && (
                    <Button onClick={openEditGroup} variant="outline" size="sm" className="rounded-xl gap-2 border-slate-200 text-slate-600 hover:bg-slate-50">
                      <Settings className="w-4 h-4" />
                      Edit Group
                    </Button>
                  )}
                  {isMember ? (
                    <Button onClick={leaveGroup} variant="outline" className="rounded-xl">
                      Leave Group
                    </Button>
                  ) : (
                    <Button onClick={joinGroup} disabled={joining} className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white gap-2">
                      {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      {joining ? "Joining…" : "Join Group"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        {isMember && (
          <Tabs defaultValue="discussions" className="space-y-4">
            <TabsList className="bg-white border border-slate-100 p-1 rounded-xl">
              <TabsTrigger value="discussions" className="rounded-lg gap-2">
                <MessageSquare className="w-4 h-4" />
                Discussions
              </TabsTrigger>
              <TabsTrigger value="events" className="rounded-lg gap-2">
                <Calendar className="w-4 h-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="members" className="rounded-lg gap-2">
                <Users className="w-4 h-4" />
                Members
              </TabsTrigger>
            </TabsList>

            {/* Discussions */}
            <TabsContent value="discussions" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Discussions</h2>
                <Button onClick={() => setShowCreatePost(true)} className="rounded-xl bg-slate-900 gap-2">
                  <MessageSquare className="w-4 h-4" />
                  New Discussion
                </Button>
              </div>
              <div className="space-y-3">
                {posts?.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                    <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400">No discussions yet. Start one!</p>
                  </div>
                ) : (
                  posts?.map(post => (
                    <GroupPostCard key={post.id} post={post} currentUser={user} onUpdate={refetchPosts} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* Events */}
            <TabsContent value="events" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Upcoming Events</h2>
                <Button onClick={() => setShowCreateEvent(true)} className="rounded-xl bg-slate-900 gap-2">
                  <Calendar className="w-4 h-4" />
                  Create Event
                </Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {events?.length === 0 ? (
                  <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-slate-100">
                    <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400">No events scheduled</p>
                  </div>
                ) : (
                  events?.map(event => (
                    <EventCard key={event.id} event={event} currentUser={user} onUpdate={refetchEvents} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* Members */}
            <TabsContent value="members" className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Members ({group.members?.length || 0})</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.members?.map(email => (
                  <Link
                    key={email}
                    to={createPageUrl("UserProfile") + `?email=${email}`}
                    className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-slate-200 text-slate-600">
                          {email[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{email}</p>
                        {group.admins?.includes(email) && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {!isMember && user && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Join this group</h3>
            <p className="text-slate-500 mb-4">Become a member to view discussions and events</p>
            <Button onClick={joinGroup} className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white gap-2">
              <UserPlus className="w-4 h-4" />
              Join Group
            </Button>
          </div>
        )}
      </div>

      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        groupId={groupId}
        user={user}
        onSuccess={refetchPosts}
      />

      <CreateEventDialog
        open={showCreateEvent}
        onOpenChange={setShowCreateEvent}
        groupId={groupId}
        user={user}
        onSuccess={refetchEvents}
      />

      {/* Edit Group Dialog */}
      <Dialog open={showEditGroup} onOpenChange={setShowEditGroup}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-500" />
              Edit Group Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Group Name *</Label>
              <Input
                value={editGroupData.name || ""}
                onChange={e => setEditGroupData(d => ({ ...d, name: e.target.value }))}
                className="rounded-xl"
                placeholder="Group name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-500">Description</Label>
              <Textarea
                value={editGroupData.description || ""}
                onChange={e => setEditGroupData(d => ({ ...d, description: e.target.value }))}
                className="rounded-xl resize-none"
                rows={3}
                placeholder="What is this group about?"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Sport</Label>
                <Input
                  value={editGroupData.sport || ""}
                  onChange={e => setEditGroupData(d => ({ ...d, sport: e.target.value }))}
                  className="rounded-xl"
                  placeholder="e.g. Basketball"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Location</Label>
                <Input
                  value={editGroupData.location || ""}
                  onChange={e => setEditGroupData(d => ({ ...d, location: e.target.value }))}
                  className="rounded-xl"
                  placeholder="e.g. Los Angeles"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button onClick={() => setShowEditGroup(false)} variant="outline" className="flex-1 rounded-xl">Cancel</Button>
              <Button
                onClick={handleSaveGroup}
                disabled={savingGroup}
                className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white"
              >
                {savingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}