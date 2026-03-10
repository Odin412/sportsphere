/**
 * Generate Game Recap Edge Function
 * Called when a game ends (status → "final").
 *
 * 1. Fetches all game events
 * 2. Identifies highlights
 * 3. Creates Mux clips for highlights (if stream had Mux)
 * 4. Generates AI narrative via Anthropic
 * 5. Updates the game record with recap + clips
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk@0.27.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MUX_API = "https://api.mux.com";

async function muxCreateClip(assetId: string, startTime: number, endTime: number) {
  const tokenId = Deno.env.get("MUX_TOKEN_ID");
  const tokenSecret = Deno.env.get("MUX_TOKEN_SECRET");
  if (!tokenId || !tokenSecret) return null;

  const auth = btoa(`${tokenId}:${tokenSecret}`);
  try {
    const res = await fetch(`${MUX_API}/video/v1/assets`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [{ url: `mux://assets/${assetId}`, start_time: startTime, end_time: endTime }],
        playback_policy: ["public"],
      }),
    });
    if (!res.ok) return null;
    const { data } = await res.json();
    return {
      clip_asset_id: data.id,
      playback_id: data.playback_ids?.[0]?.id,
    };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { game_id } = await req.json();
    if (!game_id) throw new Error("game_id required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch game
    const { data: game } = await supabase
      .from("games")
      .select("*")
      .eq("id", game_id)
      .single();

    if (!game) throw new Error("Game not found");

    // Fetch events
    const { data: events } = await supabase
      .from("game_events")
      .select("*")
      .eq("game_id", game_id)
      .order("created_at", { ascending: true });

    // Fetch scores
    const { data: scores } = await supabase
      .from("game_scores")
      .select("*")
      .eq("game_id", game_id)
      .order("created_at", { ascending: true });

    // 1. Identify highlights
    const highlights = (events || []).filter(e => e.is_highlight);

    // 2. Create Mux clips for highlights (if we have an asset ID)
    const clipResults = [];
    if (game.mux_asset_id && highlights.length > 0) {
      for (const h of highlights) {
        if (h.stream_timestamp_seconds != null) {
          const start = Math.max(0, h.stream_timestamp_seconds - 5);
          const end = h.stream_timestamp_seconds + 10;
          const clip = await muxCreateClip(game.mux_asset_id, start, end);
          if (clip) {
            clipResults.push({
              ...clip,
              event_type: h.event_type,
              player_name: h.player_name,
              team: h.team,
              period: h.period,
              description: `${h.event_type}${h.player_name ? ` — ${h.player_name}` : ""}`,
              time: h.period,
            });
          }
        }
      }
    }

    // 3. Generate AI narrative
    let aiRecap = "";
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (anthropicKey && events?.length) {
      try {
        const client = new Anthropic({ apiKey: anthropicKey });

        const eventSummary = (events || [])
          .map(e => `[${e.period}] ${e.team === "home" ? game.home_team_name : game.away_team_name}: ${e.event_type}${e.player_name ? ` (${e.player_name})` : ""}`)
          .join("\n");

        const prompt = `Write a concise 3-4 paragraph game recap for a ${game.sport} game.

Game: ${game.home_team_name} vs ${game.away_team_name}
Final Score: ${game.home_team_name} ${game.home_score}, ${game.away_team_name} ${game.away_score}
${game.venue ? `Venue: ${game.venue}` : ""}

Play-by-play events:
${eventSummary}

Write an engaging, journalistic game recap. Mention key plays, standout performers, and the flow of the game. Keep it factual based on the events provided.`;

        const message = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 512,
          messages: [{ role: "user", content: prompt }],
          system: "You are a sports journalist writing concise game recaps for a youth sports platform. Be enthusiastic but factual.",
        });

        aiRecap = message.content[0]?.type === "text" ? message.content[0].text : "";
      } catch {
        // AI recap is optional — continue without it
      }
    }

    // 4. Update game record
    const updates: Record<string, unknown> = {};
    if (aiRecap) updates.ai_recap = aiRecap;
    if (clipResults.length > 0) updates.highlight_clips = clipResults;

    if (Object.keys(updates).length > 0) {
      await supabase.from("games").update(updates).eq("id", game_id);
    }

    // 5. Auto-post highlight clips as Hype Reels to the social feed
    if (clipResults.length > 0) {
      try {
        const autoPostUrl = `${supabaseUrl}/functions/v1/auto-post-highlight`;
        await fetch(autoPostUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ game_id }),
        });
      } catch {
        // Auto-posting is best-effort — don't fail the recap
      }
    }

    // 6. Notify org members that recap is ready
    if (game.organization_id) {
      const { data: members } = await supabase
        .from("org_members")
        .select("user_email")
        .eq("organization_id", game.organization_id);

      if (members?.length) {
        const notifications = members.map(m => ({
          recipient_email: m.user_email,
          actor_name: game.home_team_name,
          type: "game_ended",
          message: `${game.home_team_name} ${game.home_score} - ${game.away_team_name} ${game.away_score} — Game recap is ready!`,
          is_read: false,
          created_date: new Date().toISOString(),
        }));
        await supabase.from("notifications").insert(notifications);
      }
    }

    return Response.json(
      {
        success: true,
        highlights_clipped: clipResults.length,
        ai_recap_generated: !!aiRecap,
      },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: message },
      { status: 400, headers: CORS_HEADERS }
    );
  }
});
