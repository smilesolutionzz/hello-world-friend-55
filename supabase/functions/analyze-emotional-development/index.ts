import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { total, average, level, answers } = await req.json();

    console.log('분석 요청:', { total, average, level, answersCount: answers?.length });

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `당신은 영유아 정서발달 전문가입니다. 다음 검사 결과를 1000자 이상으로 상세하게 분석해주세요.

**검사 정보:**
- 총점: ${total}/75점
- 평균: ${average.toFixed(2)}/5.0점
- 발달수준: ${level}

**분석 포함 사항 (필수 1000자 이상):**

1. **현재 정서발달 상태 종합 평가** (200자)
   - 총점과 평균 점수가 의미하는 바
   - 해당 연령대에서의 정서발달 위치
   
2. **영역별 상세 분석** (400자)
   - 감정 인식 및 표현 능력
   - 애착 및 관계형성 능력
   - 감정 조절 능력
   - 공감 능력
   - 각 영역의 강점과 개선점
   
3. **발달 지원을 위한 구체적 방법** (300자)
   - 가정에서 실천할 수 있는 놀이 활동 5가지
   - 일상생활에서의 정서 지원 방법 3가지
   - 부모-자녀 상호작용 개선 팁 3가지
   
4. **주의 관찰 사항** (100자)
   - 특별히 관찰해야 할 행동 패턴
   - 전문가 상담이 필요한 신호

5. **향후 발달 전망** (100자)
   - 예상되는 발달 방향
   - 권장 재평가 시기

**분석 원칙:**
- 부모가 실천 가능한 구체적 조언
- 긍정적이고 희망적인 어조 유지
- 전문 용어는 쉽게 설명
- 발달의 개인차 존중`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: '당신은 20년 경력의 영유아 정서발달 전문가입니다. 부모들에게 따뜻하고 구체적인 조언을 제공합니다.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('분석 완료, 길이:', analysis.length);

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in analyze-emotional-development function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        analysis: '분석을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});