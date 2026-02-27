/**
 * stream-summary — replaces functions/generateStreamSummary.ts
 * Generates AI summaries, tags, and highlight moments for ended streams.
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
    const { streamId, transcript, title, description, sport } = await req.json();

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const prompt = `Analyze this ${sport} live stream and generate structured metadata.

Title: ${title}
Description: ${description}
${transcript ? `Transcript/Chat highlights:\n${transcript}` : ''}

Return JSON:
{
  "summary": "2-3 sentence summary of the stream content and highlights",
  "key_moments": [{"timestamp": "MM:SS", "description": "what happened"}],
  "tags": ["tag1", "tag2", ...],
  "engagement_highlights": "1 sentence about peak moments"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    let summary: { summary: string; key_moments: unknown[]; tags: string[]; engagement_highlights: string };
    try {
      const match = text.match(/\{[\s\S]*\}/);
      summary = match ? JSON.parse(match[0]) : { summary: '', key_moments: [], tags: [], engagement_highlights: '' };
    } catch {
      summary = { summary: '', key_moments: [], tags: [], engagement_highlights: '' };
    }

    if (streamId) {
      await supabase.from('live_streams').update({
        ai_summary: summary.summary,
        ai_tags: summary.tags,
        ai_transcript: transcript || null,
      }).eq('id', streamId);
    }

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
