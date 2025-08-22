import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results, ageGroup, age } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log('Processing assessment analysis:', { ageGroup, age, resultsCount: Object.keys(results).length });

    // Create detailed analysis prompt based on age group
    const getAnalysisPrompt = (ageGroup: string, age: number, results: any) => {
      const basePrompt = `당신은 경험이 풍부한 임상심리학자입니다. 다음 심리검사 결과를 전문적으로 분석해주세요.

**검사 대상 정보:**
- 연령군: ${ageGroup === 'infant' ? '유아' : ageGroup === 'child' ? '아동/청소년' : '성인'}
- 나이: ${age}세

**검사 결과:**
${Object.entries(results).map(([key, value]) => `${key}: ${value}점`).join('\n')}

**분석 요청사항:**
1. **현재 심리상태 종합 평가**
2. **주요 관심사항 및 위험요소**
3. **발달단계별 특성 고려**
4. **구체적인 개선 방향**
5. **전문가 상담 필요성 판단**

**분석 지침:**
- 연령대별 발달 특성을 반영한 해석
- 객관적이고 전문적인 관점 유지
- 구체적이고 실행 가능한 권고사항 제시
- 가족 및 환경적 요인 고려
- 긍정적 측면도 함께 언급

**출력 형식:**
전문적이면서도 이해하기 쉬운 한국어로 작성해주세요.`;

      if (ageGroup === 'infant') {
        return basePrompt + `

**유아기 특별 고려사항:**
- 애착 형성 및 기본 신뢰감
- 언어 및 인지 발달 수준
- 양육자와의 상호작용 패턴
- 기본 생활습관 형성
- 사회성 발달 초기 단계`;
      } else if (ageGroup === 'child') {
        return basePrompt + `

**아동/청소년기 특별 고려사항:**
- 학업 및 또래 관계
- 정체성 형성 과정
- 독립성 vs 의존성 갈등
- 호르몬 변화 및 신체 발달
- 미래에 대한 불안감
- 가족 관계 변화`;
      } else {
        return basePrompt + `

**성인기 특별 고려사항:**
- 직업 및 경력 스트레스
- 인간관계 및 가족 관계
- 경제적 부담감
- 건강 관리 문제
- 중년기 위기감
- 미래 계획 및 노후 준비`;
      }
    };

    const analysisPrompt = getAnalysisPrompt(ageGroup, age, results);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: '당신은 임상심리학 전문가입니다. 정확하고 전문적인 심리검사 분석을 제공합니다.' },
          { role: 'user', content: analysisPrompt }
        ],
        max_completion_tokens: 1500,
      }),
    });

    const data = await response.json();
    console.log('OpenAI analysis response received');

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const analysis = data.choices[0].message.content;

    // Calculate risk level based on scores
    const scores = Object.values(results) as number[];
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const maxScore = Math.max(...scores);

    let riskLevel = 'low';
    if (averageScore > 7 || maxScore > 8) {
      riskLevel = 'high';
    } else if (averageScore > 5 || maxScore > 6) {
      riskLevel = 'medium';
    }

    console.log('Analysis completed:', { averageScore, maxScore, riskLevel });

    return new Response(JSON.stringify({
      analysis: analysis,
      riskLevel: riskLevel,
      averageScore: Math.round(averageScore * 10) / 10,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in assessment analyzer function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      riskLevel: 'medium'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});