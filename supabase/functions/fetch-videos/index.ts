/**
 * fetch-videos — replaces functions/fetchExternalVideos.ts
 * Fetches YouTube videos via YouTube Data API v3.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sport, query, pageToken, maxResults = 12 } = await req.json();

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      return new Response(JSON.stringify({ videos: [], error: 'YouTube API key not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const searchQuery = query || `${sport} highlights 2024`;
    const params = new URLSearchParams({
      part: 'snippet',
      q: searchQuery,
      type: 'video',
      videoCategoryId: '17', // Sports category
      maxResults: String(maxResults),
      order: 'relevance',
      key: YOUTUBE_API_KEY,
      ...(pageToken ? { pageToken } : {}),
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'YouTube API error');
    }

    const videos = (data.items || []).map((item: {
      id: { videoId: string };
      snippet: { title: string; description: string; thumbnails: { medium: { url: string } }; publishedAt: string; channelTitle: string };
    }) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      published_at: item.snippet.publishedAt,
      channel: item.snippet.channelTitle,
      embed_url: `https://www.youtube.com/embed/${item.id.videoId}`,
      watch_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    return new Response(JSON.stringify({
      videos,
      nextPageToken: data.nextPageToken || null,
      totalResults: data.pageInfo?.totalResults || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, videos: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
