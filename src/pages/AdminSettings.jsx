import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/api/db";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Shield, Bell, Sliders, Database, CheckCircle,
  Loader2, Info, Send,
} from "lucide-react";

// ── Section card wrapper ───────────────────────────────────────────────────
function Section({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-5 pb-4 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {description && <p className="text-gray-500 text-xs mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Toast notification ─────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-green-900 border border-green-700 text-green-300 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 shadow-xl animate-in slide-in-from-bottom-4">
      <CheckCircle className="w-4 h-4" />
      {message}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState(null);

  // ── Announcement state ────────────────────────────────────────────────
  const [announcement, setAnnouncement] = useState("");
  const [announcementSending, setAnnouncementSending] = useState(false);

  // ── Moderation thresholds (localStorage) ─────────────────────────────
  const [autoRemoveThreshold, setAutoRemoveThreshold] = useState(() => {
    return parseInt(localStorage.getItem("admin_auto_remove_threshold") || "90", 10);
  });
  const [autoHideFlags, setAutoHideFlags] = useState(() => {
    return parseInt(localStorage.getItem("admin_auto_hide_flags") || "5", 10);
  });

  // ── Admin users list ──────────────────────────────────────────────────
  const { data: allProfiles = [] } = useQuery({
    queryKey: ["settings-profiles"],
    queryFn: () => db.entities.User.list("-created_at", 500),
  });

  const admins = useMemo(() => allProfiles.filter(u => u.role === "admin"), [allProfiles]);

  // ── Platform stats ────────────────────────────────────────────────────
  const { data: posts = [] } = useQuery({
    queryKey: ["settings-posts"],
    queryFn: () => db.entities.Post.list(null, 500),
  });
  const { data: streams = [] } = useQuery({
    queryKey: ["settings-streams"],
    queryFn: () => db.entities.LiveStream.list(null, 200),
  });

  const platformStats = useMemo(() => {
    const mediaPosts = posts.filter(p => p.media_urls?.length > 0);
    const estimatedStorageMB = mediaPosts.length * 8; // rough 8MB avg per media post
    return {
      users: allProfiles.length,
      posts: posts.length,
      streams: streams.length,
      estimatedStorage: estimatedStorageMB >= 1024
        ? `~${(estimatedStorageMB / 1024).toFixed(1)} GB`
        : `~${estimatedStorageMB} MB`,
    };
  }, [allProfiles, posts, streams]);

  // ── Publish announcement ───────────────────────────────────────────────
  const handleAnnouncement = async () => {
    if (!announcement.trim()) return;
    setAnnouncementSending(true);
    try {
      await db.entities.Post.create({
        content: announcement.trim(),
        category: "announcement",
        author_email: "system@sportsphere.app",
        author_name: "Sportsphere Team",
        created_date: new Date().toISOString(),
      });
      setAnnouncement("");
      setToast("Announcement published to feed");
      queryClient.invalidateQueries({ queryKey: ["all-posts"] });
    } catch (e) {
      console.error("Failed to post announcement:", e);
      setToast("Failed to publish — check console");
    } finally {
      setAnnouncementSending(false);
    }
  };

  // ── Save moderation thresholds ─────────────────────────────────────────
  const saveThresholds = () => {
    localStorage.setItem("admin_auto_remove_threshold", String(autoRemoveThreshold));
    localStorage.setItem("admin_auto_hide_flags", String(autoHideFlags));
    setToast("Moderation thresholds saved");
  };

  return (
    <AdminLayout currentPage="AdminSettings">
      <div className="p-6 max-w-3xl mx-auto space-y-5">

        <div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Platform configuration and administration</p>
        </div>

        {/* ── Admin Access ── */}
        <Section
          icon={Shield}
          title="Admin Access"
          description="Accounts with administrator privileges"
        >
          {admins.length === 0 ? (
            <p className="text-gray-600 text-sm">No admin accounts found.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {admins.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-2.5 bg-gray-800/50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-red-900/40 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{a.full_name || "—"}</p>
                    <p className="text-gray-500 text-[10px] truncate">{a.email}</p>
                  </div>
                  <span className="ml-auto text-[10px] bg-red-900/30 text-red-400 border border-red-800/30 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                    admin
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-start gap-2.5 bg-blue-950/30 border border-blue-900/30 rounded-lg p-3">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-300/80 text-xs leading-relaxed">
              To grant or revoke admin access, go to <strong className="text-blue-300">Supabase Dashboard → Table Editor → profiles</strong>,
              find the user's row, and set the <code className="bg-blue-900/30 px-1 py-0.5 rounded">role</code> field to <code className="bg-blue-900/30 px-1 py-0.5 rounded">admin</code> or <code className="bg-blue-900/30 px-1 py-0.5 rounded">user</code>.
            </p>
          </div>
        </Section>

        {/* ── Announcement ── */}
        <Section
          icon={Bell}
          title="Platform Announcement"
          description="Post a site-wide message visible to all users in their feed"
        >
          <textarea
            value={announcement}
            onChange={e => setAnnouncement(e.target.value)}
            placeholder="Write an announcement for all users…"
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-xl px-4 py-3 mb-3 focus:outline-none focus:border-gray-500 placeholder-gray-600 resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-xs">{announcement.length}/500 characters</p>
            <button
              onClick={handleAnnouncement}
              disabled={!announcement.trim() || announcementSending || announcement.length > 500}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40"
            >
              {announcementSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Publish Announcement
            </button>
          </div>
        </Section>

        {/* ── Moderation thresholds ── */}
        <Section
          icon={Sliders}
          title="Moderation Thresholds"
          description="Configure automatic content moderation behavior"
        >
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-300 text-xs font-medium">
                  Auto-remove AI confidence threshold
                </label>
                <span className="text-red-400 text-xs font-bold">{autoRemoveThreshold}%</span>
              </div>
              <input
                type="range"
                min={50} max={100} step={5}
                value={autoRemoveThreshold}
                onChange={e => setAutoRemoveThreshold(Number(e.target.value))}
                className="w-full accent-red-500"
              />
              <p className="text-gray-600 text-[10px] mt-1">
                Content with AI-assigned confidence above this threshold will be auto-removed. Default: 90%.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-300 text-xs font-medium">
                  Max flags before auto-hide
                </label>
                <span className="text-amber-400 text-xs font-bold">{autoHideFlags}</span>
              </div>
              <input
                type="range"
                min={1} max={20} step={1}
                value={autoHideFlags}
                onChange={e => setAutoHideFlags(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <p className="text-gray-600 text-[10px] mt-1">
                Posts receiving this many flags will be automatically hidden pending review. Default: 5.
              </p>
            </div>

            <button
              onClick={saveThresholds}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Save Thresholds
            </button>
          </div>
        </Section>

        {/* ── Platform stats ── */}
        <Section
          icon={Database}
          title="Platform Stats"
          description="Read-only overview of database contents"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Users",            val: platformStats.users.toLocaleString() },
              { label: "Posts",            val: platformStats.posts.toLocaleString() },
              { label: "Live Streams",     val: platformStats.streams.toLocaleString() },
              { label: "Est. Storage",     val: platformStats.estimatedStorage },
            ].map(s => (
              <div key={s.label} className="bg-gray-800/60 rounded-lg px-4 py-3 text-center">
                <p className="text-white text-lg font-bold">{s.val}</p>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </Section>

      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </AdminLayout>
  );
}
