import React from 'react';

const STATUS_COLORS = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  pending: 'bg-gray-400 animate-pulse',
};

const STATUS_TEXT_COLORS = {
  ok: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
  pending: 'text-gray-400',
};

export default function HealthCheckCard({ label, check, compact = false }) {
  if (!check) return null;
  const dotColor = STATUS_COLORS[check.status] || STATUS_COLORS.pending;
  const textColor = STATUS_TEXT_COLORS[check.status] || STATUS_TEXT_COLORS.pending;

  if (compact) {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-xs text-gray-300 w-16">{label}</span>
        <span className={`text-xs ${textColor}`}>{check.detail}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700/50">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <span className="text-sm font-medium text-gray-200">{label}</span>
        </div>
        {check.latency != null && (
          <span className="text-xs text-gray-500">{check.latency}ms</span>
        )}
      </div>
      <p className={`text-xs ${textColor} ml-4.5`}>{check.detail}</p>
    </div>
  );
}
