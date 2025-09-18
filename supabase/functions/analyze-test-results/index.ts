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
    const { testType, results, answers } = await req.json();

    if (!testType || !results) {
      throw new Error('Missing required parameters: testType and results');
    }

    const systemPrompt = getSystemPrompt(testType);
    const userPrompt = formatUserPrompt(testType, results, answers);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      analysis,
      testType,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-test-results function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSystemPrompt(testType: string): string {
  const basePrompt = `당신은 전문적인 심리 상담사이자 발달 전문가입니다. 검사 결과를 분석하여 따뜻하고 이해하기 쉬운 해석을 제공해주세요.

다음 지침을 따라주세요:
1. 전문적이면서도 이해하기 쉬운 언어 사용
2. 긍정적이고 희망적인 관점 유지
3. 구체적이고 실용적인 조언 포함
4. 필요시 전문가 상담 권유
5. 3-4개의 단락으로 구성된 200-400자 분석

결과는 다음 구조로 작성해주세요:
**현재 상태 분석**
**주요 특징 및 강점**
**개선 방향 및 권장사항**
**전문가 조언**`;

  const specificPrompts = {
    'developmental-delay': `${basePrompt}

발달지연 검사 전문가로서, 다음 영역을 중점적으로 분석해주세요:
- 연령별 발달 기준과의 비교
- 강점 영역과 지원이 필요한 영역
- 조기 개입의 중요성
- 부모/양육자를 위한 구체적 활동 제안`,

    'sensory-integration': `${basePrompt}

감각통합장애 검사 전문가로서, 다음 영역을 상세히 분석해주세요:
- 7가지 감각 영역별 상세 분석 (촉각, 전정감각, 고유수용감각, 청각, 시각, 운동계획, 감각조절)
- 각 영역의 점수와 위험도를 바탕으로 한 구체적 해석
- 일상생활에서의 구체적 영향과 증상 설명
- 가정과 학교에서 적용 가능한 감각 조절 전략
- 치료적 활동 및 환경 조성 방법
- 전문가 개입이 필요한 영역 식별

**분석 형식:**
1. 종합 소견 (2-3문장)
2. 주요 위험 영역 분석 (각 영역별 구체적 설명)
3. 강점 영역 활용 방안
4. 실생활 적용 전략 (가정/학교별)
5. 전문가 권장사항`,

    'learning-disability': `${basePrompt}

학습장애 검사 전문가로서, 다음을 중점 분석해주세요:
- 학습 능력별 강약점
- 인지 기능 평가
- 학습 전략 및 지원 방안
- 교육 환경 개선 제안`,

    'social-development': `${basePrompt}

사회성 발달 검사 전문가로서, 다음을 분석해주세요:
- 사회적 기술 수준
- 또래 관계 및 상호작용 능력
- 사회적 적응 전략
- 사회성 향상을 위한 활동 제안`
  };

  return specificPrompts[testType as keyof typeof specificPrompts] || basePrompt;
}

function formatUserPrompt(testType: string, results: any, answers?: number[]): string {
  const { total, average, severity, ageGroup } = results;
  
  let prompt = `검사 유형: ${testType}
총점: ${total}점
평균: ${average.toFixed(1)}점
수준: ${severity}
연령대: ${ageGroup}

${answers ? `개별 답변 점수: [${answers.join(', ')}]` : ''}`;

  // 감각통합검사의 경우 영역별 분석 추가
  if (testType === 'sensory-integration' && results.sensoryDomains) {
    prompt += `\n\n=== 감각 영역별 상세 분석 ===`;
    results.sensoryDomains.forEach((domain: any) => {
      prompt += `\n• ${domain.domain}: ${domain.score}/${domain.maxScore}점 (${domain.percentage}%, ${domain.level})`;
    });
    
    const riskAreas = results.sensoryDomains.filter((d: any) => d.percentage >= 50);
    const strengthAreas = results.sensoryDomains.filter((d: any) => d.percentage < 25);
    
    if (riskAreas.length > 0) {
      prompt += `\n\n주의 영역: ${riskAreas.map((area: any) => area.domain).join(', ')}`;
    }
    if (strengthAreas.length > 0) {
      prompt += `\n강점 영역: ${strengthAreas.map((area: any) => area.domain).join(', ')}`;
    }
  }

  prompt += `\n\n위 결과를 바탕으로 전문적인 분석과 조언을 제공해주세요.`;
  
  return prompt;
}