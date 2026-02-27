/**
 * analyze-behavior — replaces functions/analyzeUserBehavior.ts
 * Generates personalized stream recommendations based on user activity.
 */
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.3';
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
    const { userEmail } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

    // Fetch user data in parallel
    const [profileRes, sportsRes, followsRes, streamsRes, schedRes] = await Promise.all([
      supabase.from('profiles').select('preferred_sports, location').eq('email', userEmail).single(),
      supabase.from('sport_profiles').select('sport, role, level').eq('user_email', userEmail),
      supabase.from('follows').select('following_email').eq('follower_email', userEmail).limit(50),
      supabase.from('live_streams').select('sport, title, viewers').eq('status', 'live').limit(20),
      supabase.from('scheduled_streams').select('sport, title, scheduled_at, host_email').eq('status', 'upcoming').gte('scheduled_at', new Date().toISOString()).limit(10),
    ]);

    const profile = profileRes.data;
    const sports = sportsRes.data?.map((s: { sport: string }) => s.sport) || [];
    const allSports = [...new Set([...(profile?.preferred_sports || []), ...sports])];
    const followingEmails = followsRes.data?.map((f: { following_email: string }) => f.following_email) || [];
    const liveStreams = streamsRes.data || [];
    const upcoming = schedRes.data || [];

    const prompt = `User profile:
- Sports interests: ${allSports.join(', ') || 'general sports'}
- Location: ${profile?.location || 'unknown'}
- Following ${followingEmails.length} people

Available live streams: ${JSON.stringify(liveStreams.slice(0, 10))}
Upcoming streams: ${JSON.stringify(upcoming.slice(0, 5))}

Recommend the top 5 most relevant streams for this user. Return JSON:
{"recommendations": [{"stream_title": "...", "sport": "...", "reason": "...", "relevance_score": 0.0-1.0}]}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    let recs: unknown;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      recs = match ? JSON.parse(match[0]) : { recommendations: [] };
    } catch {
      recs = { recommendations: [] };
    }

    // Store recommendations
    await supabase.from('recommendations').upsert({
      user_email: userEmail,
      recommended_streams: (recs as { recommendations: unknown[] }).recommendations,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'user_email' });

    return new Response(JSON.stringify(recs), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
