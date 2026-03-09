import React, { useState } from "react";
import { db } from "@/api/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Link as LinkIcon, Video } from "lucide-react";
import { toast } from "sonner";

const SPORTS = [
  "Baseball", "Basketball", "Football", "Soccer", "Softball",
  "Tennis", "Volleyball", "Swimming", "Track & Field", "Hockey",
  "Golf", "MMA", "Gymnastics", "Rugby", "Cricket",
];

const CATEGORIES = [
  { value: "drill", label: "Drill / Practice" },
  { value: "workout", label: "Workout / Training" },
  { value: "form-correction", label: "Form Correction" },
  { value: "highlight", label: "Highlight" },
  { value: "analysis", label: "Film Analysis" },
  { value: "motivation", label: "Motivation" },
];

const LEVELS = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function SubmitTrainingContent({ open, onClose, userEmail, userName }) {
  const [mode, setMode] = useState("youtube"); // youtube | upload
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sport, setSport] = useState("");
  const [category, setCategory] = useState("drill");
  const [skillLevel, setSkillLevel] = useState("all");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const youtubeId = extractYouTubeId(youtubeUrl);
  const thumbnail = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
    : null;

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await db.integrations.Core.UploadFile({ file });
      setUploadedUrl(file_url);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !sport || !category) {
      toast.error("Fill in title, sport, and category");
      return;
    }
    const videoUrl = mode === "youtube" ? youtubeUrl : uploadedUrl;
    if (!videoUrl) {
      toast.error(mode === "youtube" ? "Enter a YouTube URL" : "Upload a video file");
      return;
    }

    setSaving(true);
    try {
      await db.entities.TrainingContent.create({
        title,
        description: description || null,
        video_url: videoUrl,
        thumbnail_url: thumbnail || null,
        source: mode === "youtube" ? "youtube" : "upload",
        youtube_id: youtubeId || null,
        sport,
        category,
        skill_level: skillLevel,
        author_email: userEmail,
        author_name: userName || null,
        is_approved: false,
        quality_score: 0,
        upvotes: 0,
        downvotes: 0,
        views: 0,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        created_date: new Date().toISOString(),
      });
      toast.success("Content submitted! It will appear after review.");
      onClose();
      // Reset form
      setYoutubeUrl("");
      setTitle("");
      setDescription("");
      setSport("");
      setCategory("drill");
      setSkillLevel("all");
      setTags("");
      setUploadedUrl("");
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error("Failed to submit content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg rounded-2xl bg-gray-950 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white font-black flex items-center gap-2">
            <Video className="w-5 h-5 text-red-400" /> Submit Training Content
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Source toggle */}
          <div className="flex rounded-xl bg-gray-800 p-1">
            <button
              onClick={() => setMode("youtube")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === "youtube" ? "bg-red-600 text-white" : "text-gray-400"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" /> YouTube URL
            </button>
            <button
              onClick={() => setMode("upload")}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === "upload" ? "bg-red-600 text-white" : "text-gray-400"
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload Video
            </button>
          </div>

          {/* YouTube URL */}
          {mode === "youtube" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">YouTube URL</Label>
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-gray-800 border-gray-700 text-white rounded-xl"
              />
              {thumbnail && (
                <img src={thumbnail} alt="preview" className="rounded-lg w-full aspect-video object-cover mt-2" />
              )}
            </div>
          )}

          {/* Upload */}
          {mode === "upload" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Video File</Label>
              <label className="flex items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-gray-700 hover:border-gray-500 cursor-pointer transition-colors text-gray-400 text-sm">
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : uploadedUrl ? (
                  <span className="text-green-400 font-bold text-xs">Video uploaded</span>
                ) : (
                  <>
                    <Upload className="w-5 h-5" /> Drop or click to upload
                  </>
                )}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Power Hitting Drill for Youth Baseball"
              className="bg-gray-800 border-gray-700 text-white rounded-xl"
            />
          </div>

          {/* Sport + Category row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Sport *</Label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm"
              >
                <option value="">Select sport</option>
                {SPORTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Category *</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Skill Level */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Skill Level</Label>
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setSkillLevel(l.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    skillLevel === l.value
                      ? "bg-red-600 text-white"
                      : "bg-gray-800 text-gray-400 border border-gray-700"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this video teach?"
              className="bg-gray-800 border-gray-700 text-white rounded-xl min-h-[60px]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Tags (comma-separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="hitting, power, batting stance"
              className="bg-gray-800 border-gray-700 text-white rounded-xl"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={saving || !title || !sport}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-11"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit Content
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
