import React, { useState, useRef } from "react";
import { db } from "@/api/db";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Video, Upload, Lock, Play, Loader2, Plus, Film, Clock, X
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import VideoTelestration from "@/components/propath/VideoTelestration";

export default function TheVault() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");

  // Fetch vault videos for this user
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["vault-videos", user?.email],
    queryFn: async () => {
      const all = await db.entities.AthleteVideo.filter({ athlete_email: user.email }, "-created_date", 50);
      return all.filter((v) => {
        try {
          const meta = typeof v.notes === "string" ? JSON.parse(v.notes) : v.notes || {};
          return meta.vault === true;
        } catch {
          return false;
        }
      });
    },
    enabled: !!user,
  });

  const handleFileSelect = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    setUploading(true);
    try {
      const { file_url: url } = await db.storage.upload({ file });
      await db.entities.AthleteVideo.create({
        athlete_email: user.email,
        title: uploadTitle || file.name.replace(/\.[^.]+$/, ""),
        video_url: url,
        notes: JSON.stringify({ vault: true, annotations: [] }),
        created_date: new Date().toISOString(),
      });
      toast.success("Video added to The Vault");
      queryClient.invalidateQueries({ queryKey: ["vault-videos", user.email] });
      setShowUploadDialog(false);
      setUploadTitle("");
    } catch (err) {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAnnotations = async (annotations) => {
    if (!selectedVideo) return;
    try {
      const meta = (() => {
        try { return typeof selectedVideo.notes === "string" ? JSON.parse(selectedVideo.notes) : selectedVideo.notes || {}; }
        catch { return {}; }
      })();
      await db.entities.AthleteVideo.update(selectedVideo.id, {
        notes: JSON.stringify({ ...meta, annotations }),
      });
      toast.success("Annotations saved");
      queryClient.invalidateQueries({ queryKey: ["vault-videos", user.email] });
    } catch {
      toast.error("Failed to save annotations");
    }
  };

  const getAnnotations = (video) => {
    try {
      const meta = typeof video.notes === "string" ? JSON.parse(video.notes) : video.notes || {};
      return meta.annotations || [];
    } catch {
      return [];
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-700 flex items-center justify-center shadow-lg">
            <Lock className="w-5 h-5 text-gray-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">The Vault</h1>
              <Badge className="bg-gray-800 text-gray-400 border border-gray-700 text-xs">Private</Badge>
            </div>
            <p className="text-gray-500 text-sm">Raw footage + coach telestration markup</p>
          </div>
        </div>
        <Button
          onClick={() => setShowUploadDialog(true)}
          className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
        >
          <Plus className="w-4 h-4" /> Add Video
        </Button>
      </div>

      {/* Info banner */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 flex items-start gap-3">
        <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-gray-300 font-semibold text-sm">Private & Secure</p>
          <p className="text-gray-500 text-xs mt-0.5">
            Your Vault videos are only visible to you and coaches in your organization.
            Use the telestration tools to mark up footage and share with your coaching staff.
          </p>
        </div>
      </div>

      {/* Video telestration player */}
      {selectedVideo && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-red-400" />
              <span className="text-white font-semibold text-sm truncate max-w-[200px]">
                {selectedVideo.title}
              </span>
            </div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="p-1 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <VideoTelestration
              videoUrl={selectedVideo.video_url}
              annotations={getAnnotations(selectedVideo)}
              onSave={handleSaveAnnotations}
            />
          </div>
        </div>
      )}

      {/* Video grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800">
          <Video className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white font-bold text-xl mb-2">Your Vault is Empty</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Upload raw game footage or practice sessions. Coaches can annotate directly on the video
            to give you visual feedback.
          </p>
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2"
          >
            <Upload className="w-4 h-4" /> Upload First Video
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => {
            const annotationCount = getAnnotations(video).length;
            return (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="bg-gray-900 rounded-2xl border border-gray-800 hover:border-gray-700 overflow-hidden group text-left transition-all hover:shadow-lg hover:shadow-black/20"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-800 flex items-center justify-center">
                  <Video className="w-10 h-10 text-gray-600" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>
                  {annotationCount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {annotationCount} note{annotationCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-white font-semibold text-sm truncate">{video.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-500 text-xs">
                      {formatDistanceToNow(new Date(video.created_date), { addSuffix: true })}
                    </span>
                    <Lock className="w-3 h-3 text-gray-600 ml-auto" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-black flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-400" />
              Add to Vault
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Video title (optional)"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-red-500"
            />
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:border-red-500 hover:bg-red-50/5 transition-colors"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                  <p className="text-sm text-gray-400">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-400">Click to select video</p>
                  <p className="text-xs text-gray-600 mt-1">MP4, MOV, AVI supported</p>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
