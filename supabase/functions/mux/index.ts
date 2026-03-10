/**
 * Mux Video Edge Function
 * Handles live stream creation, playback URLs, clip generation, and webhooks.
 *
 * Required secrets (set in Supabase Dashboard → Edge Functions → Secrets):
 *   MUX_TOKEN_ID
 *   MUX_TOKEN_SECRET
 *   MUX_WEBHOOK_SECRET
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MUX_API = "https://api.mux.com";

async function muxRequest(path: string, method: string, body?: unknown) {
  const tokenId = Deno.env.get("MUX_TOKEN_ID");
  const tokenSecret = Deno.env.get("MUX_TOKEN_SECRET");
  if (!tokenId || !tokenSecret) {
    throw new Error("MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set");
  }
  const auth = btoa(`${tokenId}:${tokenSecret}`);
  const res = await fetch(`${MUX_API}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mux API error (${res.status}): ${err}`);
  }
  return res.json();
}

// ─── Action handlers ─────────────────────────────────────────────────────────

async function createStream() {
  const { data } = await muxRequest("/video/v1/live-streams", "POST", {
    playback_policy: ["public"],
    new_asset_settings: {
      playback_policy: ["public"],
    },
    reconnect_window: 60,
    max_continuous_duration: 43200, // 12 hours max
    reduced_latency: true,
  });
  return {
    stream_id: data.id,
    stream_key: data.stream_key,
    rtmp_url: "rtmp://global-live.mux.com:5222/app",
    playback_id: data.playback_ids?.[0]?.id,
    status: data.status,
  };
}

async function getPlaybackUrl(playback_id: string) {
  return {
    hls_url: `https://stream.mux.com/${playback_id}.m3u8`,
    thumbnail_url: `https://image.mux.com/${playback_id}/thumbnail.webp`,
    storyboard_url: `https://image.mux.com/${playback_id}/storyboard.vtt`,
  };
}

async function getStreamStatus(stream_id: string) {
  const { data } = await muxRequest(`/video/v1/live-streams/${stream_id}`, "GET");
  return {
    status: data.status,
    active_asset_id: data.active_asset_id,
    recent_asset_ids: data.recent_asset_ids,
    playback_ids: data.playback_ids,
  };
}

async function endStream(stream_id: string) {
  // Signal complete — Mux will finalize the asset
  await muxRequest(`/video/v1/live-streams/${stream_id}/complete`, "PUT");
  // Get the asset info
  const { data } = await muxRequest(`/video/v1/live-streams/${stream_id}`, "GET");
  return {
    status: "ended",
    asset_id: data.active_asset_id || data.recent_asset_ids?.[0],
    playback_id: data.playback_ids?.[0]?.id,
  };
}

async function createClip(asset_id: string, start_time: number, end_time: number) {
  const { data } = await muxRequest("/video/v1/assets", "POST", {
    input: [
      {
        url: `mux://assets/${asset_id}`,
        start_time,
        end_time,
      },
    ],
    playback_policy: ["public"],
  });
  return {
    clip_asset_id: data.id,
    clip_playback_id: data.playback_ids?.[0]?.id,
    status: data.status,
  };
}

async function getAsset(asset_id: string) {
  const { data } = await muxRequest(`/video/v1/assets/${asset_id}`, "GET");
  return {
    id: data.id,
    status: data.status,
    duration: data.duration,
    playback_id: data.playback_ids?.[0]?.id,
    created_at: data.created_at,
  };
}

async function disableStream(stream_id: string) {
  await muxRequest(`/video/v1/live-streams/${stream_id}/disable`, "PUT");
  return { disabled: true };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { action, ...params } = await req.json();

    let result: unknown;

    switch (action) {
      case "create-stream":
        result = await createStream();
        break;

      case "get-playback-url":
        if (!params.playback_id) throw new Error("playback_id required");
        result = await getPlaybackUrl(params.playback_id);
        break;

      case "get-stream-status":
        if (!params.stream_id) throw new Error("stream_id required");
        result = await getStreamStatus(params.stream_id);
        break;

      case "end-stream":
        if (!params.stream_id) throw new Error("stream_id required");
        result = await endStream(params.stream_id);
        break;

      case "create-clip":
        if (!params.asset_id || params.start_time == null || params.end_time == null) {
          throw new Error("asset_id, start_time, and end_time required");
        }
        result = await createClip(params.asset_id, params.start_time, params.end_time);
        break;

      case "get-asset":
        if (!params.asset_id) throw new Error("asset_id required");
        result = await getAsset(params.asset_id);
        break;

      case "disable-stream":
        if (!params.stream_id) throw new Error("stream_id required");
        result = await disableStream(params.stream_id);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return Response.json(result, { headers: CORS_HEADERS });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: message },
      { status: 400, headers: CORS_HEADERS }
    );
  }
});
