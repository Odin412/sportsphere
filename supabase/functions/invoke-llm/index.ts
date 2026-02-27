/**
 * invoke-llm — replaces base44.integrations.Core.InvokeLLM
 * Calls Anthropic Claude and optionally forces a JSON schema response.
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
    const { prompt, response_json_schema, add_context_from_internet } = await req.json();

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

    let systemPrompt = 'You are a helpful sports assistant.';
    if (response_json_schema) {
      systemPrompt +=
        ' Respond ONLY with valid JSON matching the provided schema. No markdown, no explanation.';
    }

    const fullPrompt = response_json_schema
      ? `${prompt}\n\nRequired JSON schema:\n${JSON.stringify(response_json_schema, null, 2)}`
      : prompt;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: fullPrompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    let result = text;
    if (response_json_schema) {
      try {
        result = JSON.parse(text);
      } catch {
        // Try to extract JSON from response
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        result = match ? JSON.parse(match[0]) : text;
      }
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
