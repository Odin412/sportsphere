import React from 'react';
import { useCommandCenter } from '@/hooks/useCommandCenter';
import { useDiagnostics } from '@/hooks/useDiagnostics';

const STATUS_COLORS = { ok: 'text-emerald-400', warning: 'text-amber-400', error: 'text-red-400', pending: 'text-gray-400' };
const STATUS_BG = { ok: 'bg-emerald-500/10 border-emerald-500/20', warning: 'bg-amber-500/10 border-amber-500/20', error: 'bg-red-500/10 border-red-500/20', pending: 'bg-gray-500/10 border-gray-500/20' };

function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/40">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function OverviewDashboard() {
  const { data, loading } = useCommandCenter({ section: 'overview' });
  const { overallStatus, checks } = useDiagnostics({ enabled: true });

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-800/40 rounded-xl" />)}
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* System Health Banner */}
      <div className={`rounded-xl p-4 border ${STATUS_BG[overallStatus]}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${overallStatus === 'ok' ? 'bg-emerald-500' : overallStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
          <span className={`text-lg font-semibold ${STATUS_COLORS[overallStatus]}`}>
            System {overallStatus === 'ok' ? 'Healthy' : overallStatus === 'warning' ? 'Degraded' : 'Issues Detected'}
          </span>
        </div>
        <div className="flex gap-6 mt-2 text-xs text-gray-400">
          <span>Auth: {checks.auth?.detail || 'Checking...'}</span>
          <span>API: {checks.api?.detail || 'Checking...'}</span>
          <span>Errors: {checks.errors?.count ?? 0}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={data.userCount || 0} />
        <StatCard label="Total Posts" value={data.postCount || 0} />
        <StatCard
          label="Bot Activity (recent)"
          value={data.recentBotActivity?.length || 0}
          sub="Last 10 actions"
        />
        <StatCard
          label="System Status"
          value={overallStatus === 'ok' ? 'Healthy' : overallStatus}
          color={STATUS_COLORS[overallStatus]}
        />
      </div>

      {/* Recent Bot Activity */}
      <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/40">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Bot Activity</h3>
        {(!data.recentBotActivity || data.recentBotActivity.length === 0) ? (
          <p className="text-sm text-gray-500">No recent bot activity. Start the bot squad to see activity here.</p>
        ) : (
          <div className="space-y-2">
            {data.recentBotActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{a.action_type}</span>
                <span className={a.success ? 'text-emerald-400' : 'text-red-400'}>
                  {a.success ? 'OK' : 'ERR'}
                </span>
                <span className="text-gray-600">
                  {new Date(a.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
