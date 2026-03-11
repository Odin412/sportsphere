/**
 * useCommandCenter.js — Data fetching hook for Command Center
 *
 * Consolidates all admin data: users, posts, bot activity,
 * system health, maintenance logs, scheduled tasks.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/api/db';

export function useCommandCenter({ section = 'overview', enabled = true } = {}) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async () => {
    const [
      { count: userCount },
      { count: postCount },
      { data: recentBotActivity },
      { data: healthSnap },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('bot_activity_log').select('action_type,success,created_at').order('created_at', { ascending: false }).limit(10),
      supabase.from('system_health_snapshots').select('*').order('created_at', { ascending: false }).limit(1),
    ]);

    return {
      userCount: userCount || 0,
      postCount: postCount || 0,
      recentBotActivity: recentBotActivity || [],
      latestHealth: healthSnap?.[0] || null,
    };
  }, []);

  const fetchBotSquad = useCallback(async () => {
    const [
      { data: activity },
      { data: config },
      { data: maintenance },
    ] = await Promise.all([
      supabase.from('bot_activity_log').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('bot_config').select('*'),
      supabase.from('bot_maintenance_log').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    // Aggregate stats
    const activityByBot = {};
    const activityByType = {};
    let successCount = 0;
    let errorCount = 0;

    for (const a of (activity || [])) {
      activityByBot[a.bot_email] = (activityByBot[a.bot_email] || 0) + 1;
      activityByType[a.action_type] = (activityByType[a.action_type] || 0) + 1;
      if (a.success) successCount++;
      else errorCount++;
    }

    return {
      activity: activity || [],
      config: config || [],
      maintenance: maintenance || [],
      stats: { activityByBot, activityByType, successCount, errorCount, total: (activity || []).length },
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data: users } = await supabase.from('profiles')
      .select('id,email,full_name,role,sport,avatar_url,created_at')
      .order('created_at', { ascending: false })
      .limit(200);
    return { users: users || [] };
  }, []);

  const fetchAnalytics = useCallback(async () => {
    const [
      { data: posts },
      { data: comments },
      { count: followCount },
    ] = await Promise.all([
      supabase.from('posts').select('id,sport,category,created_date,likes,views').order('created_date', { ascending: false }).limit(200),
      supabase.from('comments').select('id,created_date').order('created_date', { ascending: false }).limit(100),
      supabase.from('follows').select('*', { count: 'exact', head: true }),
    ]);

    // Sport distribution
    const sportDist = {};
    for (const p of (posts || [])) {
      sportDist[p.sport || 'Other'] = (sportDist[p.sport || 'Other'] || 0) + 1;
    }

    return {
      posts: posts || [],
      comments: comments || [],
      followCount: followCount || 0,
      sportDistribution: sportDist,
    };
  }, []);

  const fetchMaintenance = useCallback(async () => {
    const [
      { data: maintenanceLog },
      { data: scheduledTasks },
      { data: errorLog },
    ] = await Promise.all([
      supabase.from('bot_maintenance_log').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('bot_scheduled_tasks').select('*').order('scheduled_at', { ascending: true }).limit(50),
      supabase.from('diagnostic_events').select('*').order('created_at', { ascending: false }).limit(100),
    ]);
    return {
      maintenanceLog: maintenanceLog || [],
      scheduledTasks: scheduledTasks || [],
      errorLog: errorLog || [],
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      let result = {};
      switch (section) {
        case 'overview': result = await fetchOverview(); break;
        case 'bots': result = await fetchBotSquad(); break;
        case 'users': result = await fetchUsers(); break;
        case 'analytics': result = await fetchAnalytics(); break;
        case 'maintenance': result = await fetchMaintenance(); break;
        case 'all':
          const [ov, bs, us, an, mt] = await Promise.all([
            fetchOverview(), fetchBotSquad(), fetchUsers(), fetchAnalytics(), fetchMaintenance(),
          ]);
          result = { ...ov, ...bs, ...us, ...an, ...mt };
          break;
        default: result = await fetchOverview();
      }
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [section, enabled, fetchOverview, fetchBotSquad, fetchUsers, fetchAnalytics, fetchMaintenance]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refresh: fetchData };
}
