import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    // Create detailed analysis prompt
    const prompt = `스트레스 자가진단 결과에 대한 전문적인 분석을 제공해주세요.

테스트 결과:
- 총점: ${totalScore}점 (48점 만점)
- 평균: ${average.toFixed(1)}점
- 수준: ${severity}
- 개별 응답: [${answers.join(', ')}]

다음 구조로 1000자 이상의 상세한 분석을 제공해주세요:

**1. 현재 스트레스 상태 종합 평가**
- 전반적인 스트레스 수준과 의미
- 점수 해석 및 위험도 평가

**2. 영역별 스트레스 분석**
- 정서적 스트레스 (예민함, 짜증, 무력감)
- 인지적 스트레스 (문제해결 능력, 자신감)
- 신체적 스트레스 (피로, 신체 증상)
- 사회적 스트레스 (대인관계, 갈등)

**3. 스트레스 요인 및 패턴 분석**
- 주요 스트레스 원인 추정
- 스트레스 대처 방식의 특징
- 회복탄력성 수준 평가

**4. 맞춤형 스트레스 관리 전략**
- 즉시 실행 가능한 단기 전략 (3가지)
- 장기적 스트레스 관리 방안 (3가지)
- 생활습관 개선 권장사항

**5. 전문가 권고사항**
- 전문적 도움이 필요한 경우의 기준
- 추천 치료법 또는 상담 유형
- 주의사항 및 경고 신호

각 영역별로 구체적이고 실용적인 조언을 포함하여 작성해주세요.`;

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
            content: '당신은 스트레스 관리 및 정신건강 전문가입니다. 스트레스 자가진단 결과를 바탕으로 전문적이고 상세한 분석을 제공해주세요. 분석은 정확하고 실용적이며 희망적인 관점을 유지해야 합니다.' 
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Calculate risk level based on score
    let riskLevel = 'low';
    if (totalScore > 32) {
      riskLevel = 'high';
    } else if (totalScore > 16) {
      riskLevel = 'medium';
    }

    return new Response(JSON.stringify({ 
      analysis,
      riskLevel,
      totalScore,
      average,
      severity,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in stress-analyzer function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallbackAnalysis: `현재 분석 서비스에 일시적인 문제가 발생했습니다. 
      
      **기본 분석 결과**
      - 총점: ${req.body?.totalScore || 0}점
      - 스트레스 수준: ${req.body?.severity || '분석 불가'}
      
      **기본 권장사항:**
      1. 충분한 휴식과 수면을 취하세요
      2. 규칙적인 운동을 통해 스트레스를 해소하세요
      3. 깊은 호흡이나 명상을 시도해보세요
      4. 지속적인 고민이 있다면 전문가와 상담하세요
      
      잠시 후 다시 시도해주시거나, 지속적인 문제가 있으시면 전문가의 도움을 받으시기 바랍니다.`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});