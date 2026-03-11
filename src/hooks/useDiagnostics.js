/**
 * useDiagnostics.js — Core health check hook
 *
 * Runs periodic health checks against Supabase.
 * Used by both DiagnosticPanel and Command Center SystemHealth.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/api/db';
import { getErrorCount, getRecentEvents } from '@/lib/diagnosticCollector';

const CHECK_INTERVAL = 30000; // 30s for auth/errors
const API_CHECK_INTERVAL = 60000; // 60s for API

export function useDiagnostics({ enabled = true } = {}) {
  const [checks, setChecks] = useState({
    auth: { status: 'pending', detail: '' },
    api: { status: 'pending', latency: null, detail: '' },
    env: { status: 'pending', detail: '' },
    realtime: { status: 'pending', detail: '' },
    errors: { status: 'pending', count: 0, detail: '' },
  });
  const [lastChecked, setLastChecked] = useState(null);
  const intervalRef = useRef(null);

  const runChecks = useCallback(async () => {
    if (!enabled) return;

    const results = {};

    // Auth check
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const expiresAt = new Date(session.expires_at * 1000);
        const isExpired = expiresAt < new Date();
        results.auth = {
          status: isExpired ? 'warning' : 'ok',
          detail: isExpired ? 'Session expired' : `${session.user.email}`,
          email: session.user.email,
        };
      } else {
        results.auth = { status: 'error', detail: 'No active session' };
      }
    } catch (e) {
      results.auth = { status: 'error', detail: e.message };
    }

    // API connectivity + latency
    try {
      const start = performance.now();
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      const latency = Math.round(performance.now() - start);

      if (error) {
        results.api = { status: 'error', latency, detail: error.message };
      } else if (latency > 1500) {
        results.api = { status: 'warning', latency, detail: `Slow: ${latency}ms` };
      } else {
        results.api = { status: 'ok', latency, detail: `${latency}ms` };
      }
    } catch (e) {
      results.api = { status: 'error', latency: null, detail: e.message };
    }

    // Env check
    const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    results.env = {
      status: hasUrl && hasKey ? 'ok' : 'error',
      detail: hasUrl && hasKey ? 'All vars set' : `Missing: ${!hasUrl ? 'URL ' : ''}${!hasKey ? 'KEY' : ''}`,
    };

    // Realtime check
    try {
      const channel = supabase.channel('diagnostic-ping');
      const status = channel.state;
      results.realtime = {
        status: status === 'joined' ? 'ok' : 'warning',
        detail: status || 'unknown',
      };
      supabase.removeChannel(channel);
    } catch {
      results.realtime = { status: 'warning', detail: 'Could not check' };
    }

    // Error rate
    const errorCount = getErrorCount(5);
    results.errors = {
      status: errorCount >= 20 ? 'error' : errorCount >= 5 ? 'warning' : 'ok',
      count: errorCount,
      detail: `${errorCount} errors in last 5min`,
      recent: getRecentEvents(5).slice(-5),
    };

    setChecks(results);
    setLastChecked(new Date().toISOString());
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    runChecks();
    intervalRef.current = setInterval(runChecks, CHECK_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, runChecks]);

  const overallStatus = Object.values(checks).some(c => c.status === 'error')
    ? 'error'
    : Object.values(checks).some(c => c.status === 'warning')
    ? 'warning'
    : Object.values(checks).some(c => c.status === 'pending')
    ? 'pending'
    : 'ok';

  return {
    checks,
    overallStatus,
    lastChecked,
    refresh: runChecks,
  };
}
