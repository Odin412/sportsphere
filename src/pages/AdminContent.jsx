import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Trash2, AlertTriangle, Image, Video, FileText,
  CheckSquare, Square, Loader2, X, Filter,
} from "lucide-react";

const TABS = ["All Posts", "Reported", "Flagged"];

const SPORTS = [
  "All Sports", "Basketball", "Soccer", "Football", "Baseball",
  "Tennis", "Golf", "MMA", "Hockey", "Track", "Swimming",
];

// ── Media thumbnail ────────────────────────────────────────────────────────
function MediaThumb({ urls }) {
  if (!urls?.length) return <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-gray-600" /></div>;
  const src = urls[0];
  const isVideo = src.includes(".mp4") || src.includes(".mov") || src.includes(".webm");
  return (
    <div className="w-8 h-8 rounded overflow-hidden bg-gray-800 flex-shrink-0">
      {isVideo ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-700">
          <Video className="w-3.5 h-3.5 text-gray-400" />
        </div>
      ) : (
        <img src={src} alt="" className="w-full h-full object-cover" />
      )}
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────
function DeleteModal({ count, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-semibold text-sm">Delete {count} Post{count !== 1 ? "s" : ""}</h3>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">
              This action cannot be undone. The content will be permanently removed.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function AdminContent() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("All Posts");
  const [selected, setSelected] = useState(new Set());
  const [sportFilter, setSportFilter] = useState("All Sports");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["admin-content-posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 200),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["admin-content-reports"],
    queryFn: () => base44.entities.Report.list("-created_date", 200),
  });

  const { data: flags = [] } = useQuery({
    queryKey: ["admin-content-flags"],
    queryFn: () => base44.entities.ModerationFlag.list("-created_date", 200),
  });

  // Sets of reported / flagged post IDs
  const reportedPostIds = useMemo(() => new Set(reports.map(r => r.post_id).filter(Boolean)), [reports]);
  const flaggedPostIds  = useMemo(() => new Set(flags.map(f => f.post_id).filter(Boolean)), [flags]);

  // Report counts per post
  const reportCounts = useMemo(() => {
    const map = {};
    for (const r of reports) {
      if (r.post_id) map[r.post_id] = (map[r.post_id] || 0) + 1;
    }
    return map;
  }, [reports]);

  // Filtered posts for current tab
  const displayPosts = useMemo(() => {
    let list = posts;
    if (tab === "Reported") list = posts.filter(p => reportedPostIds.has(p.id));
    else if (tab === "Flagged") list = posts.filter(p => flaggedPostIds.has(p.id));
    if (sportFilter !== "All Sports") list = list.filter(p => p.sport === sportFilter);
    return list;
  }, [posts, tab, sportFilter, reportedPostIds, flaggedPostIds]);

  const allIds = useMemo(() => new Set(displayPosts.map(p => p.id)), [displayPosts]);
  const allSelected = allIds.size > 0 && [...allIds].every(id => selected.has(id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(s => { const n = new Set(s); allIds.forEach(id => n.delete(id)); return n; });
    } else {
      setSelected(s => new Set([...s, ...allIds]));
    }
  };

  const toggleOne = (id) => {
    setSelected(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleDelete = async (ids) => {
    setDeleting(true);
    try {
      await Promise.all([...ids].map(id => base44.entities.Post.delete(id)));
      setSelected(s => { const n = new Set(s); ids.forEach(id => n.delete(id)); return n; });
      queryClient.invalidateQueries({ queryKey: ["admin-content-posts"] });
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selected.size === 0) return;
    setShowDeleteModal(true);
  };

  return (
    <AdminLayout currentPage="AdminContent">
      <div className="p-6 max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-white">Content</h1>
          <p className="text-gray-500 text-sm mt-0.5">Review and moderate platform content</p>
        </div>

        {/* Tabs + filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tab buttons */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setSelected(new Set()); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === t ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                {t}
                {t === "Reported" && reports.length > 0 && (
                  <span className="ml-1.5 bg-white/20 text-white text-[10px] px-1 rounded-full">{reportedPostIds.size}</span>
                )}
                {t === "Flagged" && flags.length > 0 && (
                  <span className="ml-1.5 bg-white/20 text-white text-[10px] px-1 rounded-full">{flaggedPostIds.size}</span>
                )}
              </button>
            ))}
          </div>

          {/* Sport filter */}
          <div className="flex items-center gap-2 ml-auto">
            <Filter className="w-3.5 h-3.5 text-gray-500" />
            <select
              value={sportFilter}
              onChange={e => setSportFilter(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-gray-600"
            >
              {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Bulk delete */}
          {selected.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete {selected.size}
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {postsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="text-center py-16 text-gray-600 text-sm">
              No content in this view
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3 w-8">
                      <button onClick={toggleAll} className="text-gray-500 hover:text-white transition-colors">
                        {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-red-400" /> : <Square className="w-3.5 h-3.5" />}
                      </button>
                    </th>
                    <th className="text-left px-3 py-3 font-medium w-8">Media</th>
                    <th className="text-left px-3 py-3 font-medium">Author</th>
                    <th className="text-left px-3 py-3 font-medium">Content</th>
                    <th className="text-left px-3 py-3 font-medium hidden md:table-cell">Sport</th>
                    <th className="text-left px-3 py-3 font-medium hidden md:table-cell">Likes</th>
                    <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Reports</th>
                    <th className="text-left px-3 py-3 font-medium hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3 font-medium">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {displayPosts.map(post => (
                    <tr
                      key={post.id}
                      className={`hover:bg-gray-800/40 transition-colors ${selected.has(post.id) ? "bg-red-950/20" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <button onClick={() => toggleOne(post.id)} className="text-gray-500 hover:text-white transition-colors">
                          {selected.has(post.id) ? <CheckSquare className="w-3.5 h-3.5 text-red-400" /> : <Square className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <MediaThumb urls={post.media_urls} />
                      </td>
                      <td className="px-3 py-3">
                        <div>
                          <p className="text-white font-medium truncate max-w-[120px]">{post.author_name || "—"}</p>
                          <p className="text-gray-500 truncate max-w-[120px]">{post.author_email}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 max-w-[200px]">
                        <p className="text-gray-300 truncate">
                          {post.content?.substring(0, 80) || <span className="text-gray-600 italic">No text</span>}
                        </p>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        {post.sport ? (
                          <span className="text-[10px] bg-gray-800 text-gray-400 border border-gray-700 px-1.5 py-0.5 rounded font-medium">
                            {post.sport}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell text-gray-400">
                        {post.likes?.length || 0}
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        {reportCounts[post.id] ? (
                          <span className="text-[10px] bg-amber-900/30 text-amber-400 border border-amber-800/30 px-1.5 py-0.5 rounded font-medium">
                            {reportCounts[post.id]}
                          </span>
                        ) : (
                          <span className="text-gray-600">0</span>
                        )}
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell text-gray-500">
                        {new Date(post.created_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelected(new Set([post.id]));
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Row count */}
        {!postsLoading && (
          <p className="text-gray-600 text-xs">
            {displayPosts.length} post{displayPosts.length !== 1 ? "s" : ""} shown
            {selected.size > 0 && <> · <span className="text-red-400">{selected.size} selected</span></>}
          </p>
        )}
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <DeleteModal
          count={selected.size}
          onConfirm={() => handleDelete(selected)}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </AdminLayout>
  );
}
