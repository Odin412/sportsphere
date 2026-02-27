/**
 * analyze-chat — replaces functions/analyzeChat.ts
 * Moderates live chat, generates FAQ responses, and sentiment summaries.
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
    const { action, streamId, messages = [], question } = await req.json();
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let result: unknown;

    if (action === 'moderate') {
      const chatText = messages.slice(-50).map((m: { sender_name: string; message: string }) => `${m.sender_name}: ${m.message}`).join('\n');
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `Review these live chat messages for violations (hate speech, spam, harassment, inappropriate content). Return JSON: {"violations": [{"message": "...", "type": "...", "severity": "low|medium|high"}]}.\n\nChat:\n${chatText}`,
        }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
      try { result = JSON.parse(text); } catch { result = { violations: [] }; }

    } else if (action === 'faq_response') {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `Answer this sports/streaming question concisely (2-3 sentences): "${question}"`,
        }],
      });
      result = { answer: response.content[0].type === 'text' ? response.content[0].text : '' };

    } else if (action === 'sentiment_summary') {
      const chatText = messages.slice(-100).map((m: { sender_name: string; message: string }) => `${m.sender_name}: ${m.message}`).join('\n');
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `Analyze the sentiment and engagement of this chat. Return JSON: {"sentiment": "positive|neutral|negative", "engagement_score": 1-10, "key_topics": [], "summary": "..."}.\n\nChat:\n${chatText}`,
        }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
      try { result = JSON.parse(text); } catch { result = { sentiment: 'neutral', engagement_score: 5, key_topics: [], summary: '' }; }
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
