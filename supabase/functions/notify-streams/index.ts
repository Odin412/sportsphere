/**
 * notify-streams — replaces functions/notifyUpcomingStreams.ts
 * Notifies users about upcoming streams matching their sports interests.
 * Call this on a schedule (e.g. every hour via a cron Edge Function).
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find streams starting in the next 24 hours that haven't been notified yet
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: upcomingStreams } = await supabase
      .from('scheduled_streams')
      .select('*')
      .eq('status', 'upcoming')
      .eq('notified_followers', false)
      .gte('scheduled_at', now.toISOString())
      .lte('scheduled_at', in24h.toISOString());

    if (!upcomingStreams?.length) {
      return new Response(JSON.stringify({ notified: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let notificationCount = 0;

    for (const stream of upcomingStreams) {
      // Get followers of this host
      const { data: followers } = await supabase
        .from('follows')
        .select('follower_email')
        .eq('following_email', stream.host_email)
        .eq('status', 'accepted');

      if (!followers?.length) continue;

      // Get users whose preferred sports match
      const { data: interestedUsers } = await supabase
        .from('profiles')
        .select('email')
        .overlaps('preferred_sports', [stream.sport]);

      const allTargets = new Set([
        ...followers.map((f: { follower_email: string }) => f.follower_email),
        ...(interestedUsers?.map((u: { email: string }) => u.email) || []),
      ]);

      // Don't notify the host themselves
      allTargets.delete(stream.host_email);

      const streamTime = new Date(stream.scheduled_at).toLocaleString();

      for (const email of allTargets) {
        await supabase.from('notifications').insert({
          recipient_email: email,
          type: 'stream_reminder',
          actor_name: stream.host_name,
          actor_email: stream.host_email,
          message: `"${stream.title}" starts at ${streamTime}`,
          related_item_id: stream.id,
          related_item_type: 'scheduled_stream',
          is_read: false,
        });
        notificationCount++;
      }

      // Mark stream as notified
      await supabase
        .from('scheduled_streams')
        .update({ notified_followers: true })
        .eq('id', stream.id);
    }

    return new Response(JSON.stringify({ notified: notificationCount, streams: upcomingStreams.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
