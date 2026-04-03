import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY is not configured');
    }

    const { query, language = 'ko', maxResults = 2 } = await req.json();

    if (!query || query.trim().length < 2) {
      throw new Error('Search query is required');
    }

    console.log(`[YOUTUBE-SEARCH] Searching: "${query}", lang: ${language}, max: ${maxResults}`);

    const searchQuery = encodeURIComponent(query);
    const regionCode = language === 'en' ? 'US' : 'KR';
    const relevanceLanguage = language === 'en' ? 'en' : 'ko';

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=${maxResults}&order=relevance&regionCode=${regionCode}&relevanceLanguage=${relevanceLanguage}&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[YOUTUBE-SEARCH] API error: ${response.status}`, errorText);
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    const videos = (data.items || []).map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      youtubeUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    console.log(`[YOUTUBE-SEARCH] Found ${videos.length} videos`);

    return new Response(JSON.stringify({ success: true, videos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[YOUTUBE-SEARCH] Error:', message);

    return new Response(JSON.stringify({ success: false, videos: [], error: message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
