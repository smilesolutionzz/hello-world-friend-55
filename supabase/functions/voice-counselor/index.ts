import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio } = await req.json();
    if (!audio) {
      return new Response(JSON.stringify({ error: 'No audio provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    // 1) Transcribe with Whisper
    const audioBytes = Uint8Array.from(atob(audio), (c) => c.charCodeAt(0));
    const audioBlob = new Blob([audioBytes], { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');
    
    const whisperResp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: formData,
    });

    if (!whisperResp.ok) {
      const errTxt = await whisperResp.text();
      console.error('Whisper error:', errTxt);
      return new Response(JSON.stringify({ error: 'Transcription failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const whisperJson = await whisperResp.json();
    const userText: string = whisperJson.text || '';

    // 2) Get assistant reply using Lovable AI Gateway
    const systemPrompt = '당신은 따뜻하고 전문적인 한국어 심리 상담사입니다. 사용자의 말에 공감하고 간결하게(2-3문장) 답변하세요. 필요시 전문가 상담을 권유하세요.';

    const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // model: 'google/gemini-3-flash-preview', // default model per workspace
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText }
        ],
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded. Please try again shortly.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add funds to Lovable AI workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errTxt = await aiResp.text();
      console.error('AI gateway error:', aiResp.status, errTxt);
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiResp.json();
    const assistantText: string = aiJson.choices?.[0]?.message?.content || '죄송합니다. 지금은 응답할 수 없습니다.';

    // 3) Convert reply text to speech (OpenAI TTS) - 아이들에게 친근한 목소리 사용
    const ttsResp = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: assistantText,
        voice: 'shimmer', // 가장 부드럽고 친근한 목소리
        response_format: 'mp3',
      }),
    });

    if (!ttsResp.ok) {
      const errTxt = await ttsResp.text();
      console.error('TTS error:', errTxt);
      return new Response(JSON.stringify({ error: 'Text-to-speech failed', text: assistantText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const audioArrayBuf = await ttsResp.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuf)));

    return new Response(
      JSON.stringify({ text: assistantText, audio: audioBase64, transcript: userText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('voice-counselor error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});