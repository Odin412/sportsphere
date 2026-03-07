import Anthropic from "npm:@anthropic-ai/sdk@0.27.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { prompt, response_json_schema, system } = await req.json();

    if (!prompt) {
      return Response.json({ error: "prompt is required" }, { status: 400, headers: CORS_HEADERS });
    }

    const client = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
    });

    const systemPrompt = system || "You are a helpful sports analytics and athlete development assistant. Be concise, specific, and data-driven.";

    // If a JSON schema is requested, instruct Claude to return valid JSON
    const userPrompt = response_json_schema
      ? `${prompt}\n\nRespond with ONLY valid JSON matching this schema: ${JSON.stringify(response_json_schema)}. No markdown, no explanation — just the JSON object.`
      : prompt;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    if (response_json_schema) {
      try {
        const parsed = JSON.parse(text.trim());
        return Response.json(parsed, { headers: CORS_HEADERS });
      } catch {
        // Claude didn't return pure JSON — try to extract it
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return Response.json(JSON.parse(jsonMatch[0]), { headers: CORS_HEADERS });
          } catch { /* fall through */ }
        }
        return Response.json({ text }, { headers: CORS_HEADERS });
      }
    }

    return Response.json({ text }, { headers: CORS_HEADERS });

  } catch (err) {
    console.error("Claude edge function error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
