import React from 'react';
import { useDiagnostics } from '@/hooks/useDiagnostics';
import HealthCheckCard from '@/components/diagnostics/HealthCheckCard';

export default function SystemHealth() {
  const { checks, overallStatus, lastChecked, refresh } = useDiagnostics({ enabled: true });

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <div className={`rounded-xl p-4 border ${
        overallStatus === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20' :
        overallStatus === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
        'bg-red-500/10 border-red-500/20'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${
              overallStatus === 'ok' ? 'bg-emerald-500' :
              overallStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            <span className="text-lg font-semibold text-gray-200">
              {overallStatus === 'ok' ? 'All Systems Operational' :
               overallStatus === 'warning' ? 'Degraded Performance' : 'Issues Detected'}
            </span>
          </div>
          <button onClick={refresh} className="text-sm text-blue-400 hover:text-blue-300">
            Run All Checks
          </button>
        </div>
        {lastChecked && (
          <p className="text-xs text-gray-500 mt-2">Last checked: {new Date(lastChecked).toLocaleString()}</p>
        )}
      </div>

      {/* Health Check Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <HealthCheckCard label="Authentication" check={checks.auth} />
        <HealthCheckCard label="API Connectivity" check={checks.api} />
        <HealthCheckCard label="Environment" check={checks.env} />
        <HealthCheckCard label="Realtime" check={checks.realtime} />
        <HealthCheckCard label="Error Rate" check={checks.errors} />
      </div>

      {/* Recent Errors */}
      {checks.errors?.recent?.length > 0 && (
        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/40">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Errors</h3>
          <div className="space-y-2">
            {checks.errors.recent.map((e, i) => (
              <div key={i} className="text-xs bg-gray-900/50 rounded p-2">
                <div className="flex justify-between">
                  <span className="text-red-400">[{e.source}]</span>
                  <span className="text-gray-600">{new Date(e.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-gray-400 mt-1 truncate">{e.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
