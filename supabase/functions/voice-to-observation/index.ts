import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { audioBase64 } = await req.json();
    
    if (!audioBase64) {
      throw new Error('Audio data is required');
    }

    console.log('Converting audio to text...');

    // Step 1: Convert audio to text using Whisper
    const audioBuffer = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ko');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const error = await transcriptionResponse.text();
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }

    const transcription = await transcriptionResponse.json();
    const spokenText = transcription.text;
    
    console.log('Transcribed text:', spokenText);

    // Step 2: Use AI to structure the observation
    const structureResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `당신은 아동 발달 전문가입니다. 부모가 말한 관찰 내용을 구조화된 관찰일지로 변환하세요.

다음 형식으로 응답하세요:
{
  "title": "관찰 제목 (간단히)",
  "content": "구조화된 관찰 내용",
  "behaviors": ["행동1", "행동2"],
  "emotions": ["감정1", "감정2"],
  "concerns": ["우려사항1", "우려사항2"],
  "severity": "low|medium|high",
  "suggestedQuestions": ["추가 질문1", "추가 질문2", "추가 질문3"],
  "recommendedTests": ["추천 검사1", "추천 검사2"]
}`
          },
          {
            role: 'user',
            content: spokenText
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!structureResponse.ok) {
      throw new Error('Failed to structure observation');
    }

    const structureData = await structureResponse.json();
    const structuredObservation = JSON.parse(structureData.choices[0].message.content);

    console.log('Structured observation:', structuredObservation);

    return new Response(
      JSON.stringify({
        transcription: spokenText,
        structured: structuredObservation,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in voice-to-observation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
