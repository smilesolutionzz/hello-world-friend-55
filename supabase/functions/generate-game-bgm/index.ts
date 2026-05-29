// supabase/functions/generate-game-bgm/index.ts
// 챕터 테마별 BGM을 ElevenLabs Music API로 생성하여 base64 mp3로 반환합니다.
// 클라이언트는 결과를 localStorage에 캐시 후 재사용합니다.

import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { encode as base64Encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey =
      Deno.env.get('ELEVENLABS_API_KEY') ||
      Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ELEVENLABS_API_KEY is not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { theme, prompt, durationSeconds } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const duration = Math.min(
      Math.max(Number(durationSeconds) || 45, 20),
      90
    );

    const resp = await fetch('https://api.elevenlabs.io/v1/music', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        music_length_ms: Math.round(duration * 1000),
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('[generate-game-bgm] ElevenLabs error', resp.status, errText);
      return new Response(
        JSON.stringify({
          error: `ElevenLabs music API failed [${resp.status}]`,
          detail: errText.slice(0, 500),
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const arrayBuffer = await resp.arrayBuffer();
    const base64 = base64Encode(new Uint8Array(arrayBuffer));

    return new Response(
      JSON.stringify({
        theme: theme || 'unknown',
        audioContent: base64,
        mimeType: 'audio/mpeg',
        bytes: arrayBuffer.byteLength,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[generate-game-bgm] fatal', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
