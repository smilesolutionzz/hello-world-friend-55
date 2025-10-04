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
        model: 'gpt-4o',
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
  } catch (error: unknown) {
    console.error('Error in analyze-test-results function:', error);
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    return new Response(JSON.stringify({ 
      error: message 
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
5. 약 1000자 분량의 상세한 분석 제공 (3분 검사의 경우)

결과는 다음 구조로 작성해주세요 (번호 포함):
1. 현재 상태 종합 평가 (200자 정도)
2. 주요 발견 사항 및 특징 (300자 정도)
3. 강점 및 긍정적 요소 (200자 정도)
4. 개선이 필요한 영역 (200자 정도)
5. 구체적 실천 방안 및 제언 (100자 정도)`;

  const specificPrompts = {
    'developmental-delay': `${basePrompt}

발달지연 검사 전문가로서, 다음 7개 영역을 중점 분석해주세요:
- 언어발달, 운동발달, 인지발달, 사회성발달, 적응행동, 주의집중, 정서발달
- 각 영역별 발달 수준과 연령 적합성 평가
- 조기 개입의 중요성과 구체적 지원 방안
- 부모/양육자를 위한 실천 가능한 활동 제안`,

    'sensory-integration': `${basePrompt}

감각통합장애 검사 전문가로서, 다음 7개 감각 영역을 상세 분석해주세요:
- 촉각, 전정감각, 고유수용감각, 청각, 시각, 운동계획, 감각조절
- 각 영역의 점수와 위험도를 바탕으로 한 구체적 해석
- 일상생활에서의 구체적 영향과 증상 설명
- 가정과 학교에서 적용 가능한 감각 조절 전략`,

    'learning-disability': `${basePrompt}

학습장애 검사 전문가로서, 다음 7개 학습 영역을 중점 분석해주세요:
- 읽기능력, 쓰기능력, 수학능력, 주의집중, 기억력, 정보처리, 실행기능
- 각 영역별 강약점과 학습 패턴 분석
- 학습 전략 및 교육적 지원 방안
- 학교와 가정에서의 구체적 지원 방법`,

    'social-development': `${basePrompt}

사회성 발달 검사 전문가로서, 다음 7개 사회성 영역을 분석해주세요:
- 의사소통, 협력능력, 공감능력, 갈등해결, 리더십, 사회적단서, 감정조절
- 각 영역별 사회적 기술 수준 평가
- 또래 관계 및 사회적 적응 능력 분석
- 사회성 향상을 위한 구체적 활동과 전략`,

    'mental-health-quick': `${basePrompt}

정신건강 3분 검사 전문가로서, 약 1000자 분량으로 상세하게 분석해주세요:
- 현재 정신건강 상태의 종합적 평가
- 스트레스, 우울, 불안 등 주요 영역별 분석
- 개인의 강점과 대처 능력
- 위험 요인과 보호 요인
- 실천 가능한 자가 관리 전략`,

    'otrovert': `${basePrompt}

성격 검사 전문가로서, 약 1000자 분량으로 상세하게 분석해주세요:
- 외향성과 내향성의 균형 분석
- 성격적 특징과 행동 패턴
- 대인관계 스타일과 소통 방식
- 직업 및 환경 적합성
- 성격 강화 및 발전 방향`,

    'communication-style': `${basePrompt}

관계 심리 전문가로서, 약 1000자 분량으로 상세하게 분석해주세요:
- 소통 스타일과 애착 유형
- 관계에서의 강점과 취약점
- 갈등 해결 패턴
- 친밀감 형성 능력
- 관계 개선을 위한 구체적 전략`
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

  // 각 검사별 영역 분석 추가
  const domainKey = {
    'developmental-delay': 'developmentalDomains',
    'sensory-integration': 'sensoryDomains', 
    'learning-disability': 'learningDomains',
    'social-development': 'socialDomains'
  }[testType];

  if (domainKey && results[domainKey]) {
    prompt += `\n\n=== 영역별 상세 분석 ===`;
    results[domainKey].forEach((domain: any) => {
      prompt += `\n• ${domain.domain}: ${domain.score}/${domain.maxScore}점 (${domain.percentage}%, ${domain.level})`;
    });
    
    const criticalAreas = results[domainKey].filter((d: any) => d.percentage >= 50 || d.percentage <= 25);
    if (criticalAreas.length > 0) {
      prompt += `\n\n주요 관심 영역: ${criticalAreas.map((area: any) => area.domain).join(', ')}`;
    }
  }

  prompt += `\n\n위 결과를 바탕으로 전문적인 분석과 조언을 제공해주세요.`;
  
  return prompt;
}