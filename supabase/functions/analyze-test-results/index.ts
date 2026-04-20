import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { testType, results, answers } = await req.json();

    if (!testType || !results) {
      throw new Error('Missing required parameters: testType and results');
    }

    const systemPrompt = getSystemPrompt(testType);
    const userPrompt = formatUserPrompt(testType, results, answers);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
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
  const basePrompt = `당신은 25년 경력의 임상심리학 박사이자 아동발달 전문가입니다. 최고 수준의 전문가적 관점에서 매우 상세하고 심층적인 분석을 제공합니다.

**핵심 원칙:**
1. 전문적이면서도 이해하기 쉬운 언어 사용
2. 긍정적이고 희망적인 관점 유지
3. 구체적이고 실용적인 조언 포함
4. 필요시 전문가 상담 권유
5. 반드시 2,500자 이상의 매우 상세한 전문가 수준 분석 제공
6. 각 섹션별 최소 300자 이상 작성

**고급 분석 기법 (반드시 적용):**

1. 🔄 **재해석 제공**: "이 결과를 다르게 보면..."
   - 부정적 결과도 성장 기회로 재해석
   - 통념에서 벗어난 발달 관점

2. 👁️ **숨은 강점 발견**: "혹시 이런 부분도 있지 않나요?"
   - 간과된 잠재력과 긍정적 요소
   - 숨겨진 발달 가능성

3. 📋 **단계별 로드맵**: "이렇게 차근차근 개선해보세요"
   - 개선을 실행 가능한 단계로
   - 작은 성공부터 쌓는 구체적 계획

4. 💡 **맞춤 전략 제안**: "이 경우라면 이렇게..."
   - 일반론이 아닌 개인화된 방법
   - 지금 바로 시작 가능한 활동

5. 🎯 **진짜 니즈 파악**: "정말 중요한 건 이 부분 같아요"
   - 표면적 증상 뒤의 근본 원인
   - 깊은 발달 욕구 읽기

6. ✨ **플러스 인사이트**: "이것도 알아두시면 좋아요"
   - 관련 발달/심리 지식
   - 부모/양육자를 위한 꿀팁

**응답 구조:**
## 1. 종합 평가 및 점수 해석 (400자 이상)
- 전반적 상태 종합 평가
- 점수의 임상적 의미와 연령 대비 해석
- 재해석 관점 포함

## 2. 영역별 상세 분석 (600자 이상)
- 각 하위 영역의 구체적 점수 해석
- 영역 간 상호관계 분석
- 강점 영역과 취약 영역의 패턴 파악

## 3. 숨겨진 강점 및 잠재력 발견 (300자 이상)
- 간과된 긍정적 요소
- 숨겨진 발달 가능성과 잠재력
- 현재 강점을 활용한 성장 전략

## 4. 위험 요인 및 주의사항 (300자 이상)
- 현재 수준에서의 주의 사항
- 악화 방지를 위한 경고 신호
- 조기 개입의 필요성과 시급성

## 5. 맞춤형 실천 전략 (500자 이상)
- 즉시 실행 가능한 단기 전략 (3-5가지, 매우 구체적으로)
- 장기적 발달 지원 방안 (3가지)
- 가정/학교에서의 구체적 활동 제안
- 생활 환경 조성 권장사항

## 6. 전문가 권고사항 (300자 이상)
- 전문적 도움이 필요한 기준
- 추천 치료/상담 유형
- 추가 검사 필요성

## 7. 📋 요약 및 제언 (300자 이상)
- 핵심 상태 요약 (3-4줄)
- 즉시 실행 권장사항 3가지
- 전문가 상담 필요성 여부
- 희망적 전망과 격려 메시지

마크다운 형식을 사용하고, 각 섹션을 반드시 300자 이상으로 풍부하게 작성하세요.`;

  const specificPrompts = {
    'developmental-delay': `${basePrompt}

발달지연 검사 전문가로서, 반드시 2,500자 이상으로 다음 7개 영역을 중점 분석해주세요:
- 언어발달, 운동발달, 인지발달, 사회성발달, 적응행동, 주의집중, 정서발달
- 각 영역별 발달 수준과 연령 적합성 평가
- 조기 개입의 중요성과 구체적 지원 방안
- 부모/양육자를 위한 실천 가능한 활동 제안
- 발달 지연의 원인 추정과 예후 분석
- 전문 치료 연계 필요성 평가`,

    'sensory-integration': `${basePrompt}

감각통합장애 검사 전문가로서, 반드시 2,500자 이상으로 다음 7개 감각 영역을 상세 분석해주세요:
- 촉각, 전정감각, 고유수용감각, 청각, 시각, 운동계획, 감각조절
- 각 영역의 점수와 위험도를 바탕으로 한 구체적 해석
- 일상생활에서의 구체적 영향과 증상 설명
- 가정과 학교에서 적용 가능한 감각 조절 전략
- 감각 식이(Sensory Diet) 프로그램 구체적 제안
- 작업치료 필요성 평가 및 전문가 연계 권고`,

    'learning-disability': `${basePrompt}

학습장애 검사 전문가로서, 반드시 2,500자 이상으로 다음 7개 학습 영역을 중점 분석해주세요:
- 읽기능력, 쓰기능력, 수학능력, 주의집중, 기억력, 정보처리, 실행기능
- 각 영역별 강약점과 학습 패턴 분석
- 학습 전략 및 교육적 지원 방안
- 학교와 가정에서의 구체적 지원 방법
- 학습장애와 관련 동반 조건(ADHD, 정서 문제) 가능성 탐색
- 개별화교육계획(IEP) 필요성 평가`,

    'social-development': `${basePrompt}

사회성 발달 검사 전문가로서, 반드시 2,500자 이상으로 다음 7개 사회성 영역을 분석해주세요:
- 의사소통, 협력능력, 공감능력, 갈등해결, 리더십, 사회적단서, 감정조절
- 각 영역별 사회적 기술 수준 평가
- 또래 관계 및 사회적 적응 능력 분석
- 사회성 향상을 위한 구체적 활동과 전략
- 사회적 기술 훈련 프로그램 제안
- 또래 관계 촉진을 위한 환경 조성법`,

    'mental-health-quick': `${basePrompt}

정신건강 간편 검사 전문가로서, 반드시 2,500자 이상으로 상세하게 분석해주세요:
- 현재 정신건강 상태의 종합적 평가
- 스트레스, 우울, 불안 등 주요 영역별 분석
- 개인의 강점과 대처 능력
- 위험 요인과 보호 요인
- 실천 가능한 자가 관리 전략 (구체적 5가지)
- 전문적 도움이 필요한 기준과 추천 치료 유형
- 생활 습관 개선 권장사항 (수면, 운동, 영양)`,

    'otrovert': `${basePrompt}

성격 검사 전문가로서, 반드시 2,500자 이상으로 상세하게 분석해주세요:
- 외향성과 내향성의 균형 분석
- 성격적 특징과 행동 패턴
- 대인관계 스타일과 소통 방식
- 직업 및 환경 적합성
- 성격 강화 및 발전 방향
- 에너지 관리 전략과 사회적 배터리 충전법
- 유명인/역사적 인물 유형 비교`,

    'communication-style': `${basePrompt}

관계 심리 전문가로서, 반드시 2,500자 이상으로 상세하게 분석해주세요:
- 소통 스타일과 애착 유형
- 관계에서의 강점과 취약점
- 갈등 해결 패턴
- 친밀감 형성 능력
- 관계 개선을 위한 구체적 전략
- 파트너 유형별 호환성 분석
- 의사소통 기술 향상을 위한 실천 가이드`
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

  prompt += `\n\n위 결과를 바탕으로 반드시 2,500자 이상의 매우 상세하고 전문적인 분석과 조언을 제공해주세요. 각 섹션별 최소 300자 이상으로 풍부하게 작성해주세요.`;
  
  return prompt;
}