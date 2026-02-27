/**
 * ai-agent — powers base44.agents.addMessage()
 * Handles AI coach, support bot, and other agent conversations.
 */
import Anthropic from 'npm:@anthropic-ai/sdk@0.27.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  ai_coach: `You are an expert sports performance coach and athletic development specialist.
You provide personalized training advice, technique tips, injury prevention guidance, and motivation.
Be specific, encouraging, and evidence-based. Ask follow-up questions to better understand the athlete's goals.`,

  support_bot: `You are a helpful customer support agent for Sportsphere, a sports community and training platform.
You help users with: account setup, training plans, scheduling, messaging, video features, subscriptions, and technical issues.
Be friendly, concise, and solution-focused. If you don't know something, say so honestly.`,

  default: `You are a helpful sports assistant. Provide accurate, encouraging, and practical sports advice.`,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { conversationId, message, agentName, messages = [] } = await req.json();

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

    const systemPrompt = AGENT_SYSTEM_PROMPTS[agentName] || AGENT_SYSTEM_PROMPTS.default;

    // Build message history (last 20 messages to stay within context)
    const history = messages.slice(-20).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    // Ensure the last message is the current user message
    if (!history.length || history[history.length - 1].content !== message) {
      history.push({ role: 'user', content: message });
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: history,
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : '';

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
