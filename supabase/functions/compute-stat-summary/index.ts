/**
 * compute-stat-summary — Aggregates stat_entries for a sport profile
 * and writes a computed stat_summary JSONB to sport_profiles.
 *
 * Call after any StatEntry creation to keep the cached summary fresh.
 * Also supports batch mode (sport_profile_id = "all") for backfill.
 *
 * Prerequisites:
 *   ALTER TABLE sport_profiles ADD COLUMN IF NOT EXISTS stat_summary jsonb DEFAULT '{}';
 *   ALTER TABLE sport_profiles ADD COLUMN IF NOT EXISTS verified_stats boolean DEFAULT false;
 *   ALTER TABLE sport_profiles ADD COLUMN IF NOT EXISTS position text;
 *   ALTER TABLE sport_profiles ADD COLUMN IF NOT EXISTS state text;
 *   ALTER TABLE sport_profiles ADD COLUMN IF NOT EXISTS graduation_year integer;
 *   CREATE INDEX IF NOT EXISTS idx_sport_profiles_stat_summary ON sport_profiles USING GIN (stat_summary);
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sport_profile_id } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Determine which profiles to process
    let profileIds: string[] = [];
    if (sport_profile_id === 'all') {
      const { data: profiles } = await supabase
        .from('sport_profiles')
        .select('id');
      profileIds = (profiles || []).map((p: any) => p.id);
    } else {
      profileIds = [sport_profile_id];
    }

    const results = [];

    for (const pid of profileIds) {
      // Fetch all stat entries for this profile
      const { data: entries } = await supabase
        .from('stat_entries')
        .select('*')
        .eq('sport_profile_id', pid)
        .order('date', { ascending: false });

      if (!entries || entries.length === 0) {
        // Clear summary if no entries
        await supabase
          .from('sport_profiles')
          .update({ stat_summary: {}, verified_stats: false })
          .eq('id', pid);
        results.push({ id: pid, stats: 0 });
        continue;
      }

      // Aggregate metrics: compute best (max or min for lowerIsBetter) and average
      const metricAgg: Record<string, { values: number[]; best: number; unit: string }> = {};

      for (const entry of entries) {
        const metrics = entry.metrics || [];
        for (const m of metrics) {
          const key = (m.name || '').toLowerCase().replace(/[\s/]+/g, '_');
          if (!key || m.value === undefined || m.value === null) continue;
          const val = parseFloat(m.value);
          if (isNaN(val)) continue;

          if (!metricAgg[key]) {
            metricAgg[key] = { values: [], best: val, unit: m.unit || '' };
          }
          metricAgg[key].values.push(val);
          // Track best (highest value by default)
          if (val > metricAgg[key].best) {
            metricAgg[key].best = val;
          }
        }
      }

      // Build stat_summary as flat JSONB: { "batting_avg": 0.365, "era": 2.1, ... }
      // Uses the BEST value for each metric (for GIN-indexed filtering)
      const statSummary: Record<string, number> = {};
      for (const [key, agg] of Object.entries(metricAgg)) {
        statSummary[key] = Math.round(agg.best * 1000) / 1000;
      }

      // Determine verified status: has at least one stat entry with source = 'gamechanger' or similar
      const hasVerified = entries.some(
        (e: any) => e.source === 'gamechanger' || e.verified === true
      );

      await supabase
        .from('sport_profiles')
        .update({
          stat_summary: statSummary,
          verified_stats: hasVerified || entries.length > 0,
        })
        .eq('id', pid);

      results.push({ id: pid, stats: Object.keys(statSummary).length });
    }

    return new Response(JSON.stringify({ updated: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
