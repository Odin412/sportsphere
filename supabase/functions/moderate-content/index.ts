/**
 * moderate-content — replaces functions/moderateContent.ts + analyzeMessageForModeration.ts
 * AI content moderation for posts, comments, and chat messages.
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
    const { contentType, contentId, contentText, authorEmail } = await req.json();

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Analyze this ${contentType} for policy violations. Check for: hate_speech, harassment, spam, nudity, violence, profanity, phishing.
Return JSON: {"violations": ["hate_speech","spam",...], "severity": "none|low|medium|high|critical", "confidence": 0.0-1.0, "explanation": "...", "action": "allow|flag|remove"}.

Content: "${contentText}"`,
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    let analysis: { violations: string[]; severity: string; confidence: number; explanation: string; action: string };
    try {
      analysis = JSON.parse(text);
    } catch {
      analysis = { violations: [], severity: 'none', confidence: 0, explanation: '', action: 'allow' };
    }

    // Store moderation flag if violations found
    if (analysis.violations.length > 0) {
      await supabase.from('moderation_flags').insert({
        content_type: contentType,
        content_id: contentId,
        content_text: contentText,
        author_email: authorEmail,
        violations: analysis.violations,
        severity: analysis.severity,
        ai_confidence: analysis.confidence,
        ai_explanation: analysis.explanation,
        status: 'pending',
      });

      // Auto-remove critical content
      if (analysis.action === 'remove' && contentId) {
        const tableMap: Record<string, string> = { post: 'posts', comment: 'comments', message: 'live_chats' };
        const table = tableMap[contentType];
        if (table) {
          await supabase.from(table).delete().eq('id', contentId);
        }
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
