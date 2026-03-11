import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/api/db';

export default function PerformancePanel() {
  const [latencyHistory, setLatencyHistory] = useState([]);

  const runLatencyTest = useCallback(async () => {
    const start = performance.now();
    await supabase.from('profiles').select('id').limit(1);
    const latency = Math.round(performance.now() - start);

    setLatencyHistory(prev => {
      const next = [...prev, { time: new Date().toLocaleTimeString(), latency }];
      return next.slice(-30);
    });
    return latency;
  }, []);

  useEffect(() => {
    runLatencyTest();
    const timer = setInterval(runLatencyTest, 30000);
    return () => clearInterval(timer);
  }, [runLatencyTest]);

  const avgLatency = latencyHistory.length
    ? Math.round(latencyHistory.reduce((s, h) => s + h.latency, 0) / latencyHistory.length)
    : 0;
  const maxLatency = Math.max(0, ...latencyHistory.map(h => h.latency));
  const minLatency = latencyHistory.length ? Math.min(...latencyHistory.map(h => h.latency)) : 0;

  const maxBar = Math.max(maxLatency, 100);

  return (
    <div className="space-y-6">
      {/* Latency Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/40">
          <p className="text-xs text-gray-500 uppercase">Avg Latency</p>
          <p className={`text-3xl font-bold ${avgLatency < 500 ? 'text-emerald-400' : avgLatency < 1500 ? 'text-amber-400' : 'text-red-400'}`}>
            {avgLatency}ms
          </p>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/40">
          <p className="text-xs text-gray-500 uppercase">Min</p>
          <p className="text-3xl font-bold text-gray-300">{minLatency}ms</p>
        </div>
        <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/40">
          <p className="text-xs text-gray-500 uppercase">Max</p>
          <p className="text-3xl font-bold text-gray-300">{maxLatency}ms</p>
        </div>
      </div>

      {/* Latency Chart (simple bar chart) */}
      <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/40">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300">API Response Time</h3>
          <button
            onClick={runLatencyTest}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Test Now
          </button>
        </div>
        <div className="flex items-end gap-1 h-32">
          {latencyHistory.map((h, i) => {
            const height = Math.max(4, (h.latency / maxBar) * 100);
            const color = h.latency < 500 ? 'bg-emerald-500' : h.latency < 1500 ? 'bg-amber-500' : 'bg-red-500';
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end" title={`${h.time}: ${h.latency}ms`}>
                <div className={`w-full rounded-t ${color}`} style={{ height: `${height}%` }} />
              </div>
            );
          })}
          {latencyHistory.length === 0 && (
            <p className="text-xs text-gray-500 w-full text-center py-8">Collecting data...</p>
          )}
        </div>
        {latencyHistory.length > 0 && (
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>{latencyHistory[0]?.time}</span>
            <span>{latencyHistory[latencyHistory.length - 1]?.time}</span>
          </div>
        )}
      </div>

      {/* Thresholds */}
      <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/40">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Performance Thresholds</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-300">&lt; 500ms — Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-gray-300">500-1500ms — Degraded</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-300">&gt; 1500ms — Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}
