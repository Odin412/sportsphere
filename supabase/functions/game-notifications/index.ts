/**
 * Game Notifications Edge Function
 * Called by Supabase pg_cron every minute to send game reminders.
 *
 * Checks for games starting in ~30 min or ~5 min and creates notifications
 * for all org members (parents + athletes).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const min5 = new Date(now.getTime() + 5 * 60000);
    const min6 = new Date(now.getTime() + 6 * 60000);
    const min30 = new Date(now.getTime() + 30 * 60000);
    const min31 = new Date(now.getTime() + 31 * 60000);

    // Find games starting in ~5 min or ~30 min
    const { data: games5, error: err5 } = await supabase
      .from("games")
      .select("*")
      .eq("status", "scheduled")
      .gte("scheduled_at", min5.toISOString())
      .lt("scheduled_at", min6.toISOString());

    const { data: games30, error: err30 } = await supabase
      .from("games")
      .select("*")
      .eq("status", "scheduled")
      .gte("scheduled_at", min30.toISOString())
      .lt("scheduled_at", min31.toISOString());

    const allGames = [
      ...(games5 || []).map(g => ({ ...g, _reminder: "5min" })),
      ...(games30 || []).map(g => ({ ...g, _reminder: "30min" })),
    ];

    let notificationCount = 0;

    for (const game of allGames) {
      // Get all org members to notify
      const { data: members } = await supabase
        .from("org_members")
        .select("user_email, user_name, role")
        .eq("organization_id", game.organization_id);

      if (!members?.length) continue;

      const timeLabel = game._reminder === "5min" ? "5 minutes" : "30 minutes";
      const message = `${game.home_team_name} vs ${game.away_team_name} starts in ${timeLabel}!`;

      const notifications = members.map(m => ({
        recipient_email: m.user_email,
        actor_email: game.created_by_email,
        actor_name: game.home_team_name,
        type: "game_starting_soon",
        message,
        is_read: false,
        created_date: now.toISOString(),
      }));

      const { error } = await supabase.from("notifications").insert(notifications);
      if (!error) notificationCount += notifications.length;
    }

    return Response.json(
      { processed: allGames.length, notifications_sent: notificationCount },
      { headers: CORS_HEADERS }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
