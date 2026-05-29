// supabase/functions/generate-game-bgm/index.ts
// 챕터 테마별 BGM을 ElevenLabs Music API로 1회 생성하여
// `game-bgm` 퍼블릭 Storage 버킷에 영구 캐시합니다.
//
// 흐름:
//   1) `<theme>.mp3` 가 버킷에 있으면 곧바로 public URL 반환 (재생성 X)
//   2) 없으면 ElevenLabs 호출 → 업로드 → public URL 반환
//
// 클라이언트는 URL 만 받아 <audio src=URL>로 재생합니다. (base64 미사용)
// 레거시 호환을 위해 audioContent(base64) 필드도 옵션으로 제공할 수 있으나,
// 기본 응답은 { url, mimeType } 입니다.

import 'https://deno.land/x/xhr@0.1.0/mod.ts';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const BUCKET = 'game-bgm';

function safeThemeKey(theme: unknown): string {
  const s = String(theme || 'default').toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return s.slice(0, 64) || 'default';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey =
      Deno.env.get('ELEVENLABS_API_KEY') ||
      Deno.env.get('ELEVEN_LABS_API_KEY');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase service credentials missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    const { theme, prompt, durationSeconds, force } = await req.json();
    const themeKey = safeThemeKey(theme);
    const objectPath = `${themeKey}.mp3`;

    // 1) 캐시 우선: 존재 여부 확인
    if (!force) {
      const { data: list } = await admin.storage.from(BUCKET).list('', {
        search: objectPath,
        limit: 1,
      });
      const hit = list?.find((f) => f.name === objectPath);
      if (hit) {
        const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(objectPath);
        return new Response(
          JSON.stringify({
            theme: themeKey,
            url: pub.publicUrl,
            mimeType: 'audio/mpeg',
            cached: true,
            source: 'storage',
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2) 캐시 미스 — ElevenLabs 호출
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'ELEVENLABS_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'prompt is required for first-time generation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const duration = Math.min(Math.max(Number(durationSeconds) || 45, 20), 90);

    const resp = await fetch('https://api.elevenlabs.io/v1/music', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
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
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const arrayBuffer = await resp.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // 3) 영구 캐시 업로드 (덮어쓰기 허용)
    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(objectPath, bytes, {
        contentType: 'audio/mpeg',
        upsert: true,
        cacheControl: '604800', // 7d edge cache
      });
    if (upErr) {
      console.error('[generate-game-bgm] storage upload failed', upErr);
      // 업로드 실패해도 1회용 base64 폴백 반환
      return new Response(
        JSON.stringify({
          theme: themeKey,
          audioContent: btoaSafe(bytes),
          mimeType: 'audio/mpeg',
          cached: false,
          source: 'fallback-inline',
          warning: 'Upload to permanent cache failed; returning inline base64',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(objectPath);

    return new Response(
      JSON.stringify({
        theme: themeKey,
        url: pub.publicUrl,
        mimeType: 'audio/mpeg',
        cached: false,
        source: 'generated',
        bytes: arrayBuffer.byteLength,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

// Chunked base64 encoder (스택 오버플로우 방지)
function btoaSafe(bytes: Uint8Array): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}
