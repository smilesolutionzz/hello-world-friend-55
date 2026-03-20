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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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

    // Step 2: Use Lovable AI to structure the observation
    const structureResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `당신은 아동 발달 전문가입니다. 부모가 말한 관찰 내용을 구조화된 관찰일지로 변환하세요.

다음 JSON 형식으로 응답하세요 (반드시 유효한 JSON만 반환):
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
      }),
    });

    console.log('Structure response status:', structureResponse.status);
    
    if (!structureResponse.ok) {
      const errorText = await structureResponse.text();
      console.error('Structure API error:', structureResponse.status, errorText);
      
      if (structureResponse.status === 429) {
        throw new Error('AI 요청 한도 초과. 잠시 후 다시 시도해주세요.');
      }
      if (structureResponse.status === 402) {
        throw new Error('AI 크레딧 부족. 크레딧을 충전해주세요.');
      }
      
      throw new Error('Failed to structure observation');
    }

    const structureData = await structureResponse.json();
    console.log('Structure response data:', JSON.stringify(structureData));
    console.log('Message content type:', typeof structureData.choices?.[0]?.message?.content);
    console.log('Message content preview:', structureData.choices?.[0]?.message?.content?.substring(0, 200));
    
    const messageContent = structureData.choices[0].message.content;
    
    // Parse JSON from response (handle markdown code blocks if present)
    let structuredObservation;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = messageContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      structuredObservation = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content that failed to parse:', messageContent);
      throw new Error('Failed to parse AI response');
    }

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
