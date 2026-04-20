import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers, totalScore, average, severity } = await req.json();

    if (!answers || totalScore === undefined) {
      throw new Error('Missing required parameters: answers and totalScore');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `스트레스 자가진단 결과에 대한 전문적인 분석을 제공해주세요.

테스트 결과:
- 총점: ${totalScore}점 (48점 만점)
- 평균: ${average.toFixed(1)}점
- 수준: ${severity}
- 개별 응답: [${answers.join(', ')}]

다음 구조로 2000자 이상의 상세한 분석을 제공해주세요:

**1. 현재 스트레스 상태 종합 평가**
- 전반적인 스트레스 수준과 의미
- 점수 해석 및 위험도 평가
- 동일 연령대 대비 비교 해석

**2. 영역별 스트레스 분석**
- 정서적 스트레스 (예민함, 짜증, 무력감)
- 인지적 스트레스 (문제해결 능력, 자신감)
- 신체적 스트레스 (피로, 신체 증상)
- 사회적 스트레스 (대인관계, 갈등)
- 각 영역의 점수를 구체적으로 해석

**3. 스트레스 요인 및 패턴 분석**
- 주요 스트레스 원인 추정
- 스트레스 대처 방식의 특징
- 회복탄력성 수준 평가
- 만성화 위험도 분석

**4. 맞춤형 스트레스 관리 전략**
- 즉시 실행 가능한 단기 전략 (3가지, 구체적으로)
- 장기적 스트레스 관리 방안 (3가지, 구체적으로)
- 생활습관 개선 권장사항 (수면, 운동, 식이 등)
- 이완 기법 추천 (호흡법, 명상, 근이완 등 구체적 방법)

**5. 전문가 권고사항**
- 전문적 도움이 필요한 경우의 기준
- 추천 치료법 또는 상담 유형
- 주의사항 및 경고 신호
- 자가 모니터링 방법

**6. 📋 요약 및 제언**
- 핵심 스트레스 상태 요약 (3-4줄)
- 즉시 실행 권장사항 3가지
- 전문가 상담 필요성 여부
- 희망적 전망과 격려 메시지

각 섹션을 최소 200자 이상으로 구체적이고 실용적으로 작성해주세요. 마크다운 형식을 사용하세요.`;

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
            content: '당신은 20년 경력의 임상심리학 박사이자 스트레스 관리 전문가입니다. 스트레스 자가진단 결과를 바탕으로 매우 전문적이고 상세한 분석을 제공합니다. 분석은 학술적 근거를 바탕으로 정확하고, 실용적이며, 희망적인 관점을 유지해야 합니다. 각 섹션을 최소 200자 이상으로 풍부하게 작성하세요.'
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    let riskLevel = 'low';
    if (totalScore > 32) riskLevel = 'high';
    else if (totalScore > 16) riskLevel = 'medium';

    return new Response(JSON.stringify({ 
      analysis, riskLevel, totalScore, average, severity,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in stress-analyzer function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
