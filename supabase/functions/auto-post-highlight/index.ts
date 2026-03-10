/**
 * auto-post-highlight — Creates social feed posts from highlight clips.
 * Called after generate-game-recap creates clips, or directly from create-live-clip.
 *
 * Can handle:
 *   1. Single clip: { clip_playback_id, stream_title, sport, host_email, ... }
 *   2. Full game:   { game_id } — reads game.highlight_clips and posts each
 */
import { createClient } from 'npm:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@0.24.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') || '' });
    const postsCreated: string[] = [];

    if (body.game_id) {
      // Mode 2: Full game — post all highlight clips + game recap
      const { data: game } = await supabase
        .from('games')
        .select('*')
        .eq('id', body.game_id)
        .single();

      if (!game) {
        return new Response(JSON.stringify({ error: 'Game not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get stream info for author details
      const { data: stream } = await supabase
        .from('live_streams')
        .select('host_email, host_name, host_avatar')
        .eq('id', game.live_stream_id)
        .maybeSingle();

      const authorEmail = stream?.host_email || 'system@sportsphere.app';
      const authorName = stream?.host_name || 'Sportsphere';
      const authorAvatar = stream?.host_avatar || '';

      // Post highlight clips
      const clips = game.highlight_clips || [];
      for (const clip of clips) {
        const caption = await generateCaption(anthropic, {
          title: clip.title || 'Highlight',
          sport: game.sport,
          teams: `${game.home_team_name} vs ${game.away_team_name}`,
        });

        const playbackUrl = clip.playback_id
          ? `https://stream.mux.com/${clip.playback_id}.m3u8`
          : clip.url || '';

        const { data: post } = await supabase.from('posts').insert({
          author_email: authorEmail,
          author_name: authorName,
          author_avatar: authorAvatar,
          content: caption,
          media_urls: playbackUrl ? [playbackUrl] : [],
          sport: game.sport,
          category: 'highlight',
          post_type: 'hype_reel',
          source_game_id: game.id,
          created_date: new Date().toISOString(),
        }).select('id').single();

        if (post) postsCreated.push(post.id);
      }

      // Post game recap
      if (game.ai_recap) {
        const { data: recapPost } = await supabase.from('posts').insert({
          author_email: authorEmail,
          author_name: authorName,
          author_avatar: authorAvatar,
          content: `**Game Recap: ${game.home_team_name} vs ${game.away_team_name}**\n\n${game.ai_recap}`,
          sport: game.sport,
          category: 'recap',
          post_type: 'game_recap',
          source_game_id: game.id,
          created_date: new Date().toISOString(),
        }).select('id').single();

        if (recapPost) postsCreated.push(recapPost.id);
      }

    } else {
      // Mode 1: Single clip
      const {
        clip_playback_id,
        stream_title = 'Live Highlight',
        sport = '',
        host_email = 'system@sportsphere.app',
        host_name = 'Sportsphere',
        host_avatar = '',
        game_id: singleGameId,
      } = body;

      const caption = await generateCaption(anthropic, {
        title: stream_title,
        sport,
        teams: '',
      });

      const playbackUrl = clip_playback_id
        ? `https://stream.mux.com/${clip_playback_id}.m3u8`
        : '';

      const { data: post } = await supabase.from('posts').insert({
        author_email: host_email,
        author_name: host_name,
        author_avatar: host_avatar,
        content: caption,
        media_urls: playbackUrl ? [playbackUrl] : [],
        sport,
        category: 'highlight',
        post_type: 'hype_reel',
        source_game_id: singleGameId || null,
        created_date: new Date().toISOString(),
      }).select('id').single();

      if (post) postsCreated.push(post.id);
    }

    return new Response(JSON.stringify({ success: true, posts_created: postsCreated.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateCaption(
  anthropic: Anthropic,
  context: { title: string; sport: string; teams: string }
): Promise<string> {
  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{
        role: 'user',
        content: `Write a short, hype social media caption (2-3 lines max) for a sports highlight clip.
Context: ${context.title}${context.sport ? ` | Sport: ${context.sport}` : ''}${context.teams ? ` | ${context.teams}` : ''}
Style: Energetic, uses 1-2 relevant emojis, includes 2-3 hashtags. No markdown.`,
      }],
    });
    return (res.content[0] as any).text || `${context.title} #highlights #sports`;
  } catch {
    return `${context.title} #highlights #sports`;
  }
}
