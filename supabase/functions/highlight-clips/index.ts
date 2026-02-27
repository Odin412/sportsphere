/**
 * highlight-clips — replaces functions/generateHighlightClips.ts
 * Generates clip metadata (titles, timestamps, captions) for short-form content.
 */
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { streamTitle, sport, duration, highlights = [] } = await req.json();

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

    const prompt = `Generate short-form clip metadata for a ${sport} stream.

Stream: "${streamTitle}"
Duration: ${duration} minutes
Highlight moments: ${JSON.stringify(highlights)}

Create up to 5 clips optimized for social media. Return JSON:
{
  "clips": [
    {
      "title": "Catchy clip title",
      "start_time": "MM:SS",
      "end_time": "MM:SS",
      "caption": "Social media caption with relevant hashtags",
      "hashtags": ["#sport", "#highlight"],
      "recommended_platform": "Instagram Reels|TikTok|YouTube Shorts",
      "importance": "high|medium|low"
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    let result: unknown;
    try {
      const match = text.match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : { clips: [] };
    } catch {
      result = { clips: [] };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
