import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Auth check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
  const token = authHeader.replace('Bearer ', '');
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    console.log('Processing voice emotion diary entry...');

    // Step 1: Convert audio to text
    const binaryAudio = processBase64Chunks(audio);
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription failed: ${await transcriptionResponse.text()}`);
    }

    const { text: transcription } = await transcriptionResponse.json();
    console.log('Transcription completed:', transcription.substring(0, 100));

    // Step 2: Analyze emotions using GPT
    const emotionAnalysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `당신은 감정 분석 전문가입니다. 주어진 텍스트에서 감정을 분석하고 JSON 형식으로 응답하세요.
응답 형식:
{
  "primary_emotion": "주요 감정 (기쁨/슬픔/분노/불안/평온/피곤/스트레스 중 하나)",
  "emotion_score": 감정 강도 (0.00-1.00 사이의 소수),
  "detected_emotions": {
    "joy": 0.0-1.0,
    "sadness": 0.0-1.0,
    "anger": 0.0-1.0,
    "anxiety": 0.0-1.0,
    "calm": 0.0-1.0
  },
  "mood_rating": 1-10 사이의 전반적인 기분 점수,
  "summary": "감정 상태에 대한 간단한 요약 (한 문장)",
  "suggested_tags": ["태그1", "태그2", "태그3"]
}`
          },
          {
            role: 'user',
            content: `다음 일기 내용의 감정을 분석해주세요:\n\n${transcription}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!emotionAnalysisResponse.ok) {
      throw new Error(`Emotion analysis failed: ${await emotionAnalysisResponse.text()}`);
    }

    const emotionData = await emotionAnalysisResponse.json();
    const analysis = JSON.parse(emotionData.choices[0].message.content);
    
    console.log('Emotion analysis completed:', analysis.primary_emotion);

    return new Response(
      JSON.stringify({
        transcription,
        primary_emotion: analysis.primary_emotion,
        emotion_score: analysis.emotion_score,
        detected_emotions: analysis.detected_emotions,
        mood_rating: analysis.mood_rating,
        summary: analysis.summary,
        suggested_tags: analysis.suggested_tags
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in voice-emotion-diary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
