import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { testResult } = await req.json();

    if (!testResult) {
      throw new Error('Test result is required');
    }

    // Input validation
    if (typeof testResult !== 'object') {
      throw new Error('Invalid test result format');
    }

    const { constitution, scores, answers } = testResult;

    // Validate constitution
    if (!constitution || typeof constitution !== 'string' || constitution.length > 100) {
      throw new Error('Invalid constitution data');
    }

    // Validate scores
    if (!scores || typeof scores !== 'object') {
      throw new Error('Invalid scores data');
    }

    // Validate each score value
    for (const [key, value] of Object.entries(scores)) {
      if (typeof value !== 'number' || value < 0 || value > 100) {
        throw new Error(`Invalid score value for ${key}`);
      }
      if (key.length > 50) {
        throw new Error('Score key too long');
      }
    }

    // Validate answers
    if (answers && !Array.isArray(answers)) {
      throw new Error('Invalid answers format');
    }

    if (answers && answers.length > 100) {
      throw new Error('Too many answers');
    }

    if (answers) {
      for (const answer of answers) {
        if (typeof answer !== 'string' && typeof answer !== 'number') {
          throw new Error('Invalid answer format');
        }
        if (typeof answer === 'string' && answer.length > 1000) {
          throw new Error('Answer too long');
        }
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // 여성건강 특화 분석 프롬프트
    const analysisPrompt = `
당신은 여성건강 전문 한의사 AI입니다. 다음 체질분석 결과를 바탕으로 여성건강에 특화된 종합 분석을 제공해주세요.

검사 결과:
- 체질: ${constitution}
- 장부 점수: ${JSON.stringify(scores)}
- 응답 패턴: ${JSON.stringify(answers)}

다음 항목에 대해 구체적이고 실용적인 분석을 제공해주세요:

1. **여성건강 종합 평가**
   - 현재 여성건강 상태 평가
   - 호르몬 균형 상태
   - 생리주기 관련 분석
   - 스트레스가 여성건강에 미치는 영향

2. **체질별 여성질환 취약성**
   - 이 체질이 주의해야 할 여성질환
   - 월경불순, 생리통 등의 위험도
   - 갱년기 증상 예상 패턴
   - 임신/출산 시 주의사항

3. **맞춤 여성건강 케어 방법**
   - 체질에 맞는 생리 관리법
   - 여성호르몬 균형을 위한 식이요법
   - 자궁/난소 건강을 위한 운동법
   - 스트레스 관리 방법

4. **한방 처방 및 생활 가이드**
   - 추천 한약재 및 효능
   - 여성건강 차 레시피
   - 계절별 관리법
   - 일상 생활 습관 개선안

5. **주의사항 및 권장사항**
   - 즉시 병원 방문이 필요한 증상
   - 정기 검진 권장사항
   - 장기적 건강 관리 계획

응답은 친근하고 이해하기 쉬운 톤으로, 실제 한의사가 상담하는 것처럼 작성해주세요.
각 섹션은 구체적인 실행 가능한 조언을 포함해야 합니다.
`;

    console.log('Generating women health analysis for constitution:', constitution);

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
            content: '당신은 여성건강 전문 한의사입니다. 사상체질 이론에 기반하여 여성의 건강 상태를 종합적으로 분석하고 실용적인 조언을 제공합니다.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Successfully generated women health analysis');

    return new Response(
      JSON.stringify({ analysis }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in women-health-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});