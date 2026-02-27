/**
 * process-video — replaces functions/processVideoWithEffects.ts (was a stub)
 * Integrates with Mux for real video processing.
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
    const { videoUrl, entityId, entityType = 'athlete_videos', effects = {} } = await req.json();

    const MUX_TOKEN_ID = Deno.env.get('MUX_TOKEN_ID');
    const MUX_TOKEN_SECRET = Deno.env.get('MUX_TOKEN_SECRET');

    if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
      // Mux not configured — return the original URL as-is
      return new Response(JSON.stringify({
        status: 'passthrough',
        playback_url: videoUrl,
        message: 'Mux not configured. Configure MUX_TOKEN_ID and MUX_TOKEN_SECRET to enable video processing.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create a Mux asset from the video URL
    const muxAuth = btoa(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`);
    const muxResponse = await fetch('https://api.mux.com/video/v1/assets', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${muxAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: [{ url: videoUrl }],
        playback_policy: ['public'],
        mp4_support: 'standard',
      }),
    });

    const muxData = await muxResponse.json();

    if (!muxResponse.ok) {
      throw new Error(muxData.error?.messages?.[0] || 'Mux API error');
    }

    const asset = muxData.data;
    const playbackId = asset.playback_ids?.[0]?.id;
    const playbackUrl = playbackId ? `https://stream.mux.com/${playbackId}.m3u8` : null;

    // Update the entity with Mux IDs
    if (entityId && playbackUrl) {
      await supabase.from(entityType).update({
        mux_asset_id: asset.id,
        mux_playback_id: playbackId,
        video_url: playbackUrl,
      }).eq('id', entityId);
    }

    return new Response(JSON.stringify({
      status: 'processing',
      mux_asset_id: asset.id,
      mux_playback_id: playbackId,
      playback_url: playbackUrl,
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
