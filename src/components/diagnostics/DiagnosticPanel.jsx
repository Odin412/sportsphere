import React, { useState, useEffect } from 'react';
import { useDiagnostics } from '@/hooks/useDiagnostics';
import HealthCheckCard from './HealthCheckCard';

const STATUS_LABELS = {
  ok: 'Healthy',
  warning: 'Degraded',
  error: 'Issues',
  pending: 'Checking...',
};

const STATUS_BG = {
  ok: 'border-emerald-500/30',
  warning: 'border-amber-500/30',
  error: 'border-red-500/30',
  pending: 'border-gray-500/30',
};

export default function DiagnosticPanel({ onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 16 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const { checks, overallStatus, lastChecked, refresh } = useDiagnostics({ enabled: true });

  // Dragging logic
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON') return;
    setDragging(true);
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    };
    const handleUp = () => setDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, dragOffset]);

  return (
    <div
      className={`fixed z-[9999] bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border ${STATUS_BG[overallStatus]} transition-all`}
      style={{ left: position.x, bottom: position.y, width: collapsed ? 200 : 320 }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700/50 cursor-move select-none">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${
            overallStatus === 'ok' ? 'bg-emerald-500' :
            overallStatus === 'warning' ? 'bg-amber-500' :
            overallStatus === 'error' ? 'bg-red-500' : 'bg-gray-400 animate-pulse'
          }`} />
          <span className="text-xs font-semibold text-gray-200 tracking-wide uppercase">
            Diagnostics
          </span>
          <span className="text-xs text-gray-500">{STATUS_LABELS[overallStatus]}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-gray-300 text-xs px-1"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '+' : '−'}
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-xs px-1"
            title="Close (Ctrl+Shift+D)"
          >
            ×
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="p-3 space-y-1">
          <HealthCheckCard label="Auth" check={checks.auth} compact />
          <HealthCheckCard label="API" check={checks.api} compact />
          <HealthCheckCard label="Env" check={checks.env} compact />
          <HealthCheckCard label="Realtime" check={checks.realtime} compact />
          <HealthCheckCard label="Errors" check={checks.errors} compact />

          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50 mt-2">
            <button
              onClick={refresh}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Run Full Check
            </button>
            <a
              href="/CommandCenter"
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Command Center →
            </a>
          </div>

          {lastChecked && (
            <p className="text-[10px] text-gray-600 text-right">
              Last: {new Date(lastChecked).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
