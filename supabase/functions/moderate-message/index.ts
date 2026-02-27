/**
 * moderate-message — replaces functions/analyzeMessageForModeration.ts
 * Per-message moderation for chat (external links, harmful content).
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
    const { message, senderEmail, streamId, messageId } = await req.json();

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Analyze this chat message for: phishing, spam, harassment, hate speech, adult content, or external links that look suspicious.
Return JSON: {"safe": true|false, "severity": "none|low|medium|high", "types": ["spam",...], "explanation": "..."}

Message: "${message}"`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    let result: { safe: boolean; severity: string; types: string[]; explanation: string };
    try {
      result = JSON.parse(text);
    } catch {
      result = { safe: true, severity: 'none', types: [], explanation: '' };
    }

    if (!result.safe && result.severity !== 'none') {
      await supabase.from('moderation_flags').insert({
        content_type: 'message',
        content_id: messageId || streamId,
        content_text: message,
        author_email: senderEmail,
        violations: result.types,
        severity: result.severity,
        ai_confidence: 0.8,
        ai_explanation: result.explanation,
        status: 'pending',
      });
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
