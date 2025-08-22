import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  results: {
    receptive: number;
    expressive: number;
    total: number;
    receptive_percentage: number;
    expressive_percentage: number;
    total_percentage: number;
  };
  answers: Record<string, string>;
  ageGroup?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results, answers, ageGroup }: AnalysisRequest = await req.json();

    console.log('언어발달 검사 분석 요청:', { results, ageGroup, answerCount: Object.keys(answers).length });

    // 상세한 프롬프트 구성
    const prompt = `당신은 영유아 언어발달 전문가입니다. 다음 언어발달 검사 결과를 종합적으로 분석하여 전문적인 해석을 제공해주세요.

**검사 결과 요약:**
- 수용언어: ${results.receptive}점 / 39점 (${results.receptive_percentage}%)
- 표현언어: ${results.expressive}점 / 38점 (${results.expressive_percentage}%)
- 전체 점수: ${results.total}점 / 77점 (${results.total_percentage}%)
${ageGroup ? `- 대상 연령: ${ageGroup}` : ''}

**개별 문항 응답 패턴:**
${Object.entries(answers).map(([questionId, answer]) => `문항 ${questionId}: ${answer}`).join('\n')}

다음 관점에서 **매우 상세하고 전문적인** 분석을 제공해주세요:

1. **전반적 언어발달 수준 평가**
   - 연령대 대비 발달 수준
   - 수용언어와 표현언어의 균형성
   - 전체적인 언어발달 패턴

2. **영역별 상세 분석**
   - 수용언어 강점과 약점 (어휘 이해, 문장 이해, 지시 따르기 등)
   - 표현언어 강점과 약점 (어휘 표현, 문장 구성, 의사소통 의도 등)
   - 각 영역의 세부 기능별 분석

3. **발달 패턴 해석**
   - 문항별 응답 패턴에서 나타나는 특징
   - 발달 순서상 나타나는 특이점
   - 언어발달 지연 또는 편차 가능성

4. **구체적 발달 지원 방안**
   - 일상생활에서 실천할 수 있는 구체적 방법
   - 놀이를 통한 언어자극 방법
   - 부모-아동 상호작용 개선 방안
   - 환경 조성 방법

5. **추가 관찰 및 평가 권고사항**
   - 지속적으로 관찰해야 할 영역
   - 전문가 상담이 필요한 경우
   - 추가 평가가 권장되는 영역

각 분석은 구체적인 근거와 함께 제시하고, 부모가 이해하기 쉽게 설명해주세요. 
응답은 반드시 한국어로 작성하고, 전문적이면서도 따뜻하고 격려적인 톤으로 작성해주세요.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: '당신은 영유아 언어발달 전문가입니다. 언어치료사, 언어병리학자의 관점에서 검사 결과를 상세히 분석하고 전문적인 해석과 구체적인 발달 지원 방안을 제공합니다.' 
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API 오류:', response.status, errorText);
      throw new Error(`OpenAI API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('AI 분석 생성 완료');

    return new Response(JSON.stringify({ 
      analysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('언어발달 분석 오류:', error);
    return new Response(JSON.stringify({ 
      error: 'AI 분석 생성 중 오류가 발생했습니다.',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});