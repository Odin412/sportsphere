import React, { useState } from 'react';
import { useCommandCenter } from '@/hooks/useCommandCenter';

export default function MaintenanceLogs() {
  const { data, loading, refresh } = useCommandCenter({ section: 'maintenance' });
  const [tab, setTab] = useState('maintenance');

  if (loading) return <div className="animate-pulse h-64 bg-gray-800/40 rounded-xl" />;

  const tabs = [
    { id: 'maintenance', label: 'Maintenance Log', count: (data.maintenanceLog || []).length },
    { id: 'errors', label: 'Error Log', count: (data.errorLog || []).length },
    { id: 'scheduled', label: 'Scheduled Tasks', count: (data.scheduledTasks || []).length },
  ];

  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sportsphere-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="text-xs text-blue-400 hover:text-blue-300">Refresh</button>
          <button onClick={exportLogs} className="text-xs text-gray-400 hover:text-gray-200">Export JSON</button>
        </div>
      </div>

      {/* Maintenance Log */}
      {tab === 'maintenance' && (
        <div className="bg-gray-800/60 rounded-xl border border-gray-700/40 overflow-hidden">
          {(data.maintenanceLog || []).length === 0 ? (
            <p className="text-sm text-gray-500 p-4 text-center">No maintenance entries yet.</p>
          ) : (
            <div className="divide-y divide-gray-700/30">
              {(data.maintenanceLog || []).map((entry, i) => (
                <div key={i} className="p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-200">{entry.action}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">By: {entry.actor}</p>
                  {entry.details && Object.keys(entry.details).length > 0 && (
                    <pre className="text-xs text-gray-500 mt-1 bg-gray-900/50 rounded p-2 overflow-x-auto">
                      {JSON.stringify(entry.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error Log */}
      {tab === 'errors' && (
        <div className="bg-gray-800/60 rounded-xl border border-gray-700/40 overflow-hidden">
          {(data.errorLog || []).length === 0 ? (
            <p className="text-sm text-gray-500 p-4 text-center">No diagnostic events logged.</p>
          ) : (
            <div className="divide-y divide-gray-700/30">
              {(data.errorLog || []).map((entry, i) => (
                <div key={i} className="p-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${entry.event_type === 'error' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <span className="text-sm text-gray-200">{entry.message}</span>
                    <span className="text-xs text-gray-500 ml-auto">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>
                  {entry.source && <p className="text-xs text-gray-500 mt-1">Source: {entry.source}</p>}
                  {entry.stack_trace && (
                    <pre className="text-xs text-gray-600 mt-1 bg-gray-900/50 rounded p-2 max-h-24 overflow-auto">
                      {entry.stack_trace}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scheduled Tasks */}
      {tab === 'scheduled' && (
        <div className="bg-gray-800/60 rounded-xl border border-gray-700/40 overflow-hidden">
          {(data.scheduledTasks || []).length === 0 ? (
            <p className="text-sm text-gray-500 p-4 text-center">No scheduled tasks.</p>
          ) : (
            <div className="divide-y divide-gray-700/30">
              {(data.scheduledTasks || []).map((task, i) => (
                <div key={i} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-200">{task.task_type}</p>
                    <p className="text-xs text-gray-500">
                      Scheduled: {new Date(task.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    task.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                    task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
