import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 재시도 로직을 포함한 fetch 함수
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('All retry attempts failed');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { text } = await req.json();

    if (!text) {
      throw new Error('텍스트가 제공되지 않았습니다.');
    }

    console.log('감정 분석 요청:', text.substring(0, 100));

    const response = await fetchWithRetry('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `당신은 텍스트에서 감정을 정확하게 분석하는 전문가입니다.
주어진 텍스트를 분석하여 다음 감정 중 하나를 선택하고 강도(0-1)를 평가하세요:

감정 종류:
- neutral: 중립적, 평온한, 차분한 상태
- happy: 기쁨, 행복, 즐거움
- sad: 슬픔, 우울함, 낙담
- angry: 화남, 짜증, 분노
- surprised: 놀람, 경악, 당황
- fearful: 두려움, 불안, 걱정
- thinking: 깊은 생각, 고민, 성찰

JSON 형식으로만 답변하세요:
{
  "emotion": "감정_종류",
  "intensity": 0.0에서_1.0_사이의_숫자,
  "reason": "간단한_분석_이유"
}`
          },
          {
            role: 'user',
            content: `다음 텍스트의 감정을 분석해주세요:\n\n"${text}"`
          }
        ],
        // Gemini 모델은 temperature를 지원하지 않으므로 제거
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API 오류:', response.status, errorText);
      
      // 429 또는 402 에러 처리
      if (response.status === 429) {
        throw new Error('요청 한도 초과. 잠시 후 다시 시도해주세요.');
      }
      if (response.status === 402) {
        throw new Error('크레딧이 부족합니다. Lovable AI 크레딧을 충전해주세요.');
      }
      
      throw new Error(`AI API 오류: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('AI 응답:', content);

    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답에서 JSON을 찾을 수 없습니다.');
    }

    const emotionData = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(emotionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('감정 분석 오류:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      emotion: 'neutral',
      intensity: 0.5,
      reason: '분석 실패'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
