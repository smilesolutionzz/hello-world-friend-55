import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voice = 'Aria', model = 'eleven_multilingual_v2' } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY') || Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    // Map voice name to voice ID
    const voiceMap: Record<string, string> = {
      'Aria': 'EXAVITQu4vr4xnSDxMaL',
      'Sarah': 'EXAVITQu4vr4xnSDxMaL',
      'Laura': 'FGY2WhTYpPnrIDTdsKH5',
      'Alice': 'Xb7hH8MSUJpSbSDYk0k2',
      'Lily': 'pFZP5JQG7iQjIQuC4Bku',
      'Jessica': 'cgSgspJ2msm6clMCkdW9',
      'Roger': 'CwhRBWXzGAHq8TQ4Fs17',
      'Brian': 'nPczCjzI2devNBz1zQrb',
      'Daniel': 'onwK4e9ZLuTAKqWW03F9',
      'Matilda': 'XrExE9yKIg1WjnnlVkGX',
      'kids_narrator': 'CrYsT2cBJU6Z4BFcOi8u',  // 루맘 - 따뜻한 커스텀 보이스
      'rumam': 'CrYsT2cBJU6Z4BFcOi8u',            // 루맘
      'isusuk': 'q9iIr3Yu7vDR0yAqz0Gu',            // 이수석
    };

    const voiceId = voiceMap[voice] || voice;

    // 아이 친화적 음성일 때 voice settings 조정
    const isKidsVoice = voice === 'kids_narrator' || voice === 'rumam';

    console.log(`Generating TTS: voice=${voice}(${voiceId}), text length=${text.length}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: isKidsVoice ? {
            stability: 0.7,          // 안정적이고 일관된 톤
            similarity_boost: 0.8,    // 원래 음성 특성 유지
            style: 0.3,              // 자연스럽고 과하지 않은 스타일
            use_speaker_boost: true,
            speed: 0.85,             // 아이가 이해하기 쉽게 느린 속도
          } : {
            stability: 0.6,
            similarity_boost: 0.75,
            style: 0.4,
            use_speaker_boost: true,
            speed: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();

    // Encode to base64 using Deno's standard library approach
    const uint8 = new Uint8Array(audioBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8.length; i += chunkSize) {
      const chunk = uint8.subarray(i, Math.min(i + chunkSize, uint8.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binary);

    console.log('TTS generated successfully, size:', audioBuffer.byteLength);

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in elevenlabs-tts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
