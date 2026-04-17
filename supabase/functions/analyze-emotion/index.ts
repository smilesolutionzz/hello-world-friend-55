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
        model: 'google/gemini-3.1-flash-preview',
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

    // JSON 파싱 - 강화된 안전 처리
    let emotionData = { emotion: 'neutral', intensity: 0.5, reason: '분석 완료' };
    
    try {
      // 마크다운 코드블록 제거
      let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let jsonStr = jsonMatch[0];
        
        // reason 필드 내 줄바꿈/특수문자 정리
        // reason 값을 안전하게 추출하여 재조립
        try {
          emotionData = JSON.parse(jsonStr);
        } catch {
          // JSON 파싱 실패 시 각 필드를 regex로 개별 추출
          const emotionMatch = jsonStr.match(/"emotion"\s*:\s*"([^"]+)"/);
          const intensityMatch = jsonStr.match(/"intensity"\s*:\s*([\d.]+)/);
          const reasonMatch = jsonStr.match(/"reason"\s*:\s*"([\s\S]*?)"\s*\}$/);
          
          if (emotionMatch) emotionData.emotion = emotionMatch[1];
          if (intensityMatch) emotionData.intensity = parseFloat(intensityMatch[1]);
          if (reasonMatch) emotionData.reason = reasonMatch[1].replace(/"/g, "'").replace(/\n/g, ' ');
        }
      }
    } catch (parseErr) {
      console.error('JSON 파싱 폴백:', parseErr);
    }

    // 유효한 감정 값인지 검증
    const validEmotions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'fearful', 'thinking'];
    if (!validEmotions.includes(emotionData.emotion)) {
      emotionData.emotion = 'neutral';
    }
    emotionData.intensity = Math.max(0, Math.min(1, emotionData.intensity || 0.5));

    return new Response(JSON.stringify(emotionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('감정 분석 오류:', error);
    // 오류 시에도 200으로 반환하여 UI 크래시 방지
    return new Response(JSON.stringify({ 
      emotion: 'neutral',
      intensity: 0.5,
      reason: '분석 중 오류가 발생했습니다'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
