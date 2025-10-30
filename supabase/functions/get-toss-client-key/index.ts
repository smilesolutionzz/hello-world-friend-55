import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 토스페이먼츠 클라이언트 키 반환 (공개 키 - 노출 가능)
    const clientKey = Deno.env.get('TOSS_CLIENT_KEY');

    if (!clientKey) {
      throw new Error('Toss client key not configured');
    }

    // 키 유형 파악 (디버깅용 메타)
    const mode = clientKey.includes('live_ck_') || clientKey.startsWith('live_')
      ? 'live'
      : clientKey.includes('test_ck_') || clientKey.startsWith('test_')
      ? 'test'
      : 'unknown';

    console.log('[get-toss-client-key] served', { mode, prefix: clientKey.slice(0, 8) });

    return new Response(
      JSON.stringify({ clientKey, mode }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error getting Toss client key:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to get client key' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
