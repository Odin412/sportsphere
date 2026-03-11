import React from 'react';
import { useCommandCenter } from '@/hooks/useCommandCenter';

export default function AppAnalytics() {
  const { data, loading } = useCommandCenter({ section: 'analytics' });

  if (loading) return <div className="animate-pulse h-64 bg-gray-800/40 rounded-xl" />;

  const sportDist = data.sportDistribution || {};
  const totalPosts = Object.values(sportDist).reduce((a, b) => a + b, 0) || 1;

  // Sort sports by count
  const sortedSports = Object.entries(sportDist).sort((a, b) => b[1] - a[1]);

  const SPORT_BAR_COLORS = {
    Baseball: 'bg-red-500',
    Basketball: 'bg-orange-500',
    Football: 'bg-green-500',
    Soccer: 'bg-blue-500',
    Softball: 'bg-pink-500',
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/40">
          <p className="text-xs text-gray-500 uppercase">Total Posts</p>
          <p className="text-3xl font-bold text-white">{(data.posts || []).length}</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/40">
          <p className="text-xs text-gray-500 uppercase">Total Comments</p>
          <p className="text-3xl font-bold text-white">{(data.comments || []).length}</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/40">
          <p className="text-xs text-gray-500 uppercase">Total Follows</p>
          <p className="text-3xl font-bold text-white">{data.followCount || 0}</p>
        </div>
      </div>

      {/* Sport Distribution */}
      <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/40">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Content by Sport</h3>
        <div className="space-y-3">
          {sortedSports.map(([sport, count]) => {
            const pct = Math.round(count / totalPosts * 100);
            return (
              <div key={sport}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{sport}</span>
                  <span className="text-gray-500">{count} posts ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${SPORT_BAR_COLORS[sport] || 'bg-gray-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Engaged Posts */}
      <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/40">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Most Engaged Content</h3>
        <div className="space-y-2">
          {(data.posts || [])
            .sort((a, b) => ((b.likes?.length || 0) + (b.views || 0)) - ((a.likes?.length || 0) + (a.views || 0)))
            .slice(0, 5)
            .map((p, i) => (
              <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-700/30">
                <span className="text-gray-500 w-4">{i + 1}.</span>
                <span className="text-gray-300 flex-1 truncate mx-2">{p.sport} — {p.category}</span>
                <span className="text-gray-400">{p.likes?.length || 0} likes</span>
                <span className="text-gray-500 ml-3">{p.views || 0} views</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
