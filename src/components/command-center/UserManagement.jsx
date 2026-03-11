import React, { useState } from 'react';
import { useCommandCenter } from '@/hooks/useCommandCenter';

export default function UserManagement() {
  const { data, loading } = useCommandCenter({ section: 'users' });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const users = (data.users || []).filter(u => {
    const matchesSearch = !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const isBot = (email) => email?.endsWith('@sportsphere.app');

  if (loading) return <div className="animate-pulse h-64 bg-gray-800/40 rounded-xl" />;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 w-64"
        />
        <div className="flex gap-1">
          {['all', 'athlete', 'coach', 'parent', 'organization', 'fan'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-full text-xs ${roleFilter === r ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-gray-500">
        <span>{users.length} users shown</span>
        <span>{users.filter(u => isBot(u.email)).length} bots</span>
        <span>{users.filter(u => !isBot(u.email)).length} real users</span>
      </div>

      {/* User Table */}
      <div className="bg-gray-800/60 rounded-xl border border-gray-700/40 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/50 text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-2 text-left">User</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Sport</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 50).map(u => (
              <tr key={u.id} className="border-b border-gray-700/30 hover:bg-gray-700/20">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-700" />
                    )}
                    <div>
                      <p className="text-sm text-gray-200">{u.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2 text-xs text-gray-400 capitalize">{u.role || '—'}</td>
                <td className="px-4 py-2 text-xs text-gray-400">{u.sport || '—'}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isBot(u.email) ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'}`}>
                    {isBot(u.email) ? 'Bot' : 'Real'}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length > 50 && (
          <p className="text-xs text-gray-500 p-3 text-center">Showing 50 of {users.length} users</p>
        )}
      </div>
    </div>
  );
}
