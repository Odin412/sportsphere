/**
 * create-live-clip — Called by SentimentTracker on chat spike.
 * Creates a 30-second Mux clip ending at the current stream timestamp.
 * Records a game_event with is_highlight: true.
 *
 * Prerequisites:
 *   MUX_TOKEN_ID + MUX_TOKEN_SECRET in Supabase secrets
 *   ALTER TABLE live_streams ADD COLUMN IF NOT EXISTS auto_highlight_enabled boolean DEFAULT false;
 *   ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'user';
 *   ALTER TABLE posts ADD COLUMN IF NOT EXISTS source_game_id uuid;
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
    const {
      stream_id,
      game_id,
      timestamp_seconds, // current stream time in seconds
      trigger_type = 'chat_spike', // 'chat_spike' | 'manual'
      description = 'Crowd hype moment',
    } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch stream to get Mux asset ID
    const { data: stream } = await supabase
      .from('live_streams')
      .select('mux_asset_id, host_email, title, sport')
      .eq('id', stream_id)
      .single();

    if (!stream?.mux_asset_id) {
      return new Response(JSON.stringify({ error: 'No Mux asset found for stream' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Mux clip: 30 seconds ending at timestamp
    const clipStart = Math.max(0, (timestamp_seconds || 0) - 30);
    const clipEnd = timestamp_seconds || 30;

    const muxTokenId = Deno.env.get('MUX_TOKEN_ID');
    const muxTokenSecret = Deno.env.get('MUX_TOKEN_SECRET');

    let clipPlaybackId = null;
    let clipAssetId = null;

    if (muxTokenId && muxTokenSecret) {
      const muxAuth = btoa(`${muxTokenId}:${muxTokenSecret}`);
      const clipRes = await fetch('https://api.mux.com/video/v1/assets', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${muxAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: [{
            url: `mux://assets/${stream.mux_asset_id}`,
            start_time: clipStart,
            end_time: clipEnd,
          }],
          playback_policy: ['public'],
        }),
      });

      if (clipRes.ok) {
        const clipData = await clipRes.json();
        clipAssetId = clipData.data?.id;
        clipPlaybackId = clipData.data?.playback_ids?.[0]?.id;
      }
    }

    // Record as game_event (highlight)
    if (game_id) {
      await supabase.from('game_events').insert({
        game_id,
        event_type: 'crowd_hype',
        description,
        stream_timestamp_seconds: timestamp_seconds,
        is_highlight: true,
        player_name: trigger_type,
        team: stream.sport || '',
      });
    }

    return new Response(JSON.stringify({
      success: true,
      clip_asset_id: clipAssetId,
      clip_playback_id: clipPlaybackId,
      clip_start: clipStart,
      clip_end: clipEnd,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
