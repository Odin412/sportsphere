import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/api/db";
import { useAuth } from "@/lib/AuthContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { createPageUrl } from "@/utils";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, ChevronLeft, ChevronRight, MoreVertical,
  ExternalLink, Shield, Ban, Trash2, UserCheck, X,
  Loader2, AlertTriangle,
} from "lucide-react";

const PAGE_SIZE = 25;

// ── Role badge ────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  if (role === "admin") return (
    <span className="text-[10px] bg-red-900/40 text-red-400 border border-red-800/40 px-1.5 py-0.5 rounded font-bold">admin</span>
  );
  if (role === "coach") return (
    <span className="text-[10px] bg-blue-900/40 text-blue-400 border border-blue-800/40 px-1.5 py-0.5 rounded font-medium">coach</span>
  );
  return (
    <span className="text-[10px] bg-gray-800 text-gray-500 border border-gray-700 px-1.5 py-0.5 rounded font-medium">{role || "user"}</span>
  );
}

// ── Confirm modal ─────────────────────────────────────────────────────────
function ConfirmModal({ title, message, onConfirm, onCancel, danger }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${danger ? "text-red-400" : "text-amber-400"}`} />
          <div>
            <h3 className="text-white font-semibold text-sm">{title}</h3>
            <p className="text-gray-400 text-xs mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className={`px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors ${danger ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Action menu for a user row ─────────────────────────────────────────────
function UserActions({ user, postCount, onAction }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 bg-gray-800 border border-gray-700 rounded-xl shadow-xl w-44 py-1 overflow-hidden">
            <Link
              to={createPageUrl("UserProfile") + `?email=${encodeURIComponent(user.email)}`}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Profile
            </Link>
            <button
              onClick={() => { setOpen(false); onAction("changeRole"); }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-700 transition-colors w-full text-left"
            >
              <UserCheck className="w-3.5 h-3.5" /> Change Role
            </button>
            <button
              onClick={() => { setOpen(false); onAction("ban"); }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-amber-400 hover:text-amber-300 hover:bg-gray-700 transition-colors w-full text-left"
            >
              <Ban className="w-3.5 h-3.5" /> {user.banned ? "Unban Account" : "Ban Account"}
            </button>
            <button
              onClick={() => { setOpen(false); onAction("deletePosts"); }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors w-full text-left"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Posts ({postCount})
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Role change modal ──────────────────────────────────────────────────────
function RoleModal({ user, onSave, onClose }) {
  const [role, setRole] = useState(user.role || "user");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(user.id, role); onClose(); }
    catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-xs w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">Change Role</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-gray-400 text-xs mb-4 truncate">{user.email}</p>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 mb-4 focus:outline-none focus:border-red-500"
        >
          <option value="user">user</option>
          <option value="coach">coach</option>
          <option value="admin">admin</option>
        </select>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Role
        </button>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Guard: redirect non-admins before any data loads
  if (user && user.role !== 'admin') {
    navigate('/', { replace: true });
    return null;
  }

  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [modal, setModal] = useState(null); // { type, user }

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: () => db.entities.User.list("-created_at", 500),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["admin-all-posts-users"],
    queryFn: () => db.entities.Post.list(null, 500),
  });

  // Posts per author
  const postCounts = useMemo(() => {
    const map = {};
    for (const p of posts) {
      map[p.author_email] = (map[p.author_email] || 0) + 1;
    }
    return map;
  }, [posts]);

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return profiles;
    const q = search.toLowerCase();
    return profiles.filter(
      u => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [profiles, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const stats = useMemo(() => ({
    total: profiles.length,
    admins: profiles.filter(u => u.role === "admin").length,
    coaches: profiles.filter(u => u.role === "coach").length,
    banned: profiles.filter(u => u.banned).length,
  }), [profiles]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleChangeRole = async (id, role) => {
    await db.entities.User.update(id, { role });
    queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
  };

  const handleBan = async (user) => {
    await db.entities.User.update(user.id, { banned: !user.banned });
    queryClient.invalidateQueries({ queryKey: ["admin-all-users"] });
    setModal(null);
  };

  const handleDeletePosts = async (user) => {
    const userPosts = posts.filter(p => p.author_email === user.email);
    await Promise.all(userPosts.map(p => db.entities.Post.delete(p.id)));
    queryClient.invalidateQueries({ queryKey: ["admin-all-posts-users"] });
    setModal(null);
  };

  if (!user || user.role !== "admin") {
    return <div className="flex items-center justify-center h-screen text-white text-lg">Access denied.</div>;
  }

  return (
    <AdminLayout currentPage="AdminUsers">
      <div className="p-6 max-w-6xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Users</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage accounts and permissions</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Total Users",  val: stats.total,   color: "text-white" },
            { label: "Admins",       val: stats.admins,  color: "text-red-400" },
            { label: "Coaches",      val: stats.coaches, color: "text-blue-400" },
            { label: "Banned",       val: stats.banned,  color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-center min-w-[90px]">
              <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full bg-gray-900 border border-gray-800 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-gray-600 placeholder-gray-600"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider text-[10px]">
                    <th className="text-left px-4 py-3 font-medium">User</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Role</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Posts</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Status</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paginated.map(user => (
                    <tr key={user.id} className="hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-gray-400 text-xs font-bold">
                                {(user.full_name || user.email || "?")[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate max-w-[140px]">
                              {user.full_name || "—"}
                            </p>
                            <p className="text-gray-500 truncate max-w-[140px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-400">
                        {postCounts[user.email] || 0}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {user.banned ? (
                          <span className="text-[10px] bg-red-900/30 text-red-400 border border-red-800/30 px-1.5 py-0.5 rounded font-medium">banned</span>
                        ) : (
                          <span className="text-[10px] bg-green-900/30 text-green-400 border border-green-800/30 px-1.5 py-0.5 rounded font-medium">active</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <UserActions
                          user={user}
                          postCount={postCounts[user.email] || 0}
                          onAction={(type) => setModal({ type, user })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      {modal?.type === "changeRole" && (
        <RoleModal
          user={modal.user}
          onSave={handleChangeRole}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === "ban" && (
        <ConfirmModal
          title={modal.user.banned ? "Unban Account" : "Ban Account"}
          message={`${modal.user.banned ? "Restore access for" : "Ban"} ${modal.user.email}? ${modal.user.banned ? "" : "They will not be able to log in."}`}
          danger={!modal.user.banned}
          onConfirm={() => handleBan(modal.user)}
          onCancel={() => setModal(null)}
        />
      )}

      {modal?.type === "deletePosts" && (
        <ConfirmModal
          title="Delete All Posts"
          message={`Delete all ${postCounts[modal.user.email] || 0} posts by ${modal.user.email}? This cannot be undone.`}
          danger
          onConfirm={() => handleDeletePosts(modal.user)}
          onCancel={() => setModal(null)}
        />
      )}
    </AdminLayout>
  );
}
