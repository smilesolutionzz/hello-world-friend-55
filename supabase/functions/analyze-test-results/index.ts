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

    if (!LOVABLE_API_KEY) {
      console.warn('LOVABLE_API_KEY missing — returning score-based fallback');
      return new Response(JSON.stringify({
        analysis: buildScoreBasedFallback(testType, results, answers),
        testType,
        results,
        fallback: true,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const models = ['google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite'];
    let analysis: string | null = null;
    let lastErr = '';

    for (const model of models) {
      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });

        if (!response.ok) {
          const raw = await response.text();
          lastErr = `[${model}] HTTP ${response.status}: ${raw.slice(0, 300)}`;
          console.error(lastErr);
          if (response.status === 429 || response.status === 402) break; // no point retrying other models
          continue;
        }

        const data = await response.json();
        analysis = data?.choices?.[0]?.message?.content ?? null;
        if (analysis && analysis.trim().length > 50) break;
        lastErr = `[${model}] empty content`;
      } catch (e) {
        lastErr = `[${model}] ${(e as Error).message}`;
        console.error(lastErr);
      }
    }

    if (!analysis) {
      console.warn('AI failed, using fallback. Last error:', lastErr);
      analysis = buildScoreBasedFallback(testType, results, answers);
    }

    return new Response(JSON.stringify({
      analysis,
      testType,
      results,
      fallback: !analysis || analysis.startsWith('## 1.'),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('Error in analyze-test-results function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Even on hard failure, return a usable fallback so the UI never shows just "전문가 상담을 권장합니다"
    try {
      const body = await req.clone().json().catch(() => ({}));
      return new Response(JSON.stringify({
        analysis: buildScoreBasedFallback(body?.testType ?? 'general', body?.results ?? {}, body?.answers),
        error: message,
        fallback: true,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch {
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }
});

function buildScoreBasedFallback(testType: string, results: any, answers?: number[]): string {
  const total = Number(results?.total ?? 0);
  const average = Number(results?.average ?? 0);
  const severity = String(results?.severity ?? '보통');
  const ageGroup = String(results?.ageGroup ?? '미지정');

  // Domain extraction
  const domainKeys = ['developmentalDomains', 'sensoryDomains', 'learningDomains', 'socialDomains', 'domains'];
  let domains: any[] = [];
  for (const k of domainKeys) {
    if (Array.isArray(results?.[k]) && results[k].length) { domains = results[k]; break; }
  }

  const top = [...domains].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0)).slice(0, 3);
  const low = [...domains].sort((a, b) => (a.percentage ?? 0) - (b.percentage ?? 0)).slice(0, 3);

  const sevLabel = /high|위험|심각/i.test(severity) ? '높은 주의가 필요한 수준'
    : /mod|중간|보통/i.test(severity) ? '관리가 필요한 중간 수준'
    : '대체로 안정적인 수준';

  const focusList = top.map(d => `**${d.domain ?? d.label}** (${d.percentage ?? 0}%)`).join(', ') || '주요 관심 영역 데이터 없음';
  const strengthList = low.map(d => `**${d.domain ?? d.label}** (${d.percentage ?? 0}%)`).join(', ') || '데이터가 부족합니다';

  return `## 1. 종합 평가 및 점수 해석
이번 검사에서 총점 **${total}점**, 평균 **${average.toFixed(1)}점**으로 ${sevLabel}으로 분석됩니다. ${ageGroup} 연령대 기준으로 볼 때, 현재 상태는 즉각적인 개입이 필수적인 수준은 아니지만, 패턴을 면밀히 관찰하고 일상에서 작은 변화를 만들어 나갈 가치가 충분합니다. 점수 자체보다 중요한 것은 어떤 영역에서 균형이 무너져 있는가이며, 이번 결과는 그 단서를 명확히 보여주고 있습니다.

## 2. 영역별 상세 분석
${domains.length ? domains.map(d => `- **${d.domain ?? d.label}**: ${d.score ?? '-'}/${d.maxScore ?? '-'}점 (${d.percentage ?? 0}%, ${d.level ?? '-'})`).join('\n') : '- 영역 세부 데이터가 제공되지 않아 총점 기반으로만 해석합니다.'}

가장 높은 부담을 보인 영역은 ${focusList}이며, 이는 현재의 스트레스나 어려움이 집중되는 지점입니다. 반대로 ${strengthList} 영역은 상대적으로 안정적이어서, 회복 자원으로 활용할 수 있는 강점입니다.

## 3. 숨겨진 강점 및 잠재력
검사 결과는 어려움뿐 아니라 회복 가능성도 함께 보여줍니다. 위에서 안정적으로 나타난 영역은 단순히 '문제가 없는 곳'이 아니라, 어려운 영역을 끌어올리는 지렛대가 됩니다. 예를 들어 안정 영역에서 사용하던 대처 방식(루틴, 관계, 표현 방식 등)을 부담 영역에 의식적으로 적용해 보면 변화가 빠르게 나타납니다.

## 4. 위험 요인 및 주의사항
${sevLabel.includes('높은') ? '현재 수준이 일정 기간 지속될 경우 수면, 집중력, 대인관계에 누적 영향을 줄 수 있습니다. 2주 이상 동일한 패턴이 이어지면 전문가의 객관적 평가를 권합니다.' : '지금 수준에서는 일상 기능에 큰 지장은 없으나, 갑작스러운 환경 변화나 스트레스 사건이 겹치면 부담 영역이 빠르게 악화될 수 있습니다. 자가 모니터링을 권장합니다.'}

## 5. 맞춤형 실천 전략
**지금 바로 시작할 수 있는 5가지**
1. 부담 영역과 관련된 상황을 하루 1회 5분간 기록 (트리거-반응-결과)
2. 안정 영역의 활동을 의식적으로 주 3회 이상 유지
3. 수면-기상 시간 ±30분 이내로 고정
4. 하루 한 번 신체를 움직이는 시간 10분 확보 (산책·스트레칭)
5. 주 1회 신뢰할 수 있는 사람과 상태를 언어로 공유

**중장기 방향**
- 30일 단위로 같은 검사를 재측정해 변화 추이 확인
- 부담 영역에 특화된 워크북·코칭 프로그램 활용
- 안정 영역을 지속 가능한 일상 루틴으로 정착

## 6. 전문가 권고사항
${sevLabel.includes('높은') 
  ? '현재 점수대는 자가 관리만으로 호전이 더딜 수 있습니다. 임상심리·정신건강 전문가와의 1회 평가를 권장하며, 필요 시 단기 인지행동 프로그램이 효과적일 수 있습니다.'
  : '현재는 자가 관리와 데이터 추적으로 충분히 관리 가능한 수준입니다. 다만 한 달간 변화가 없거나 악화된다면 전문가 상담을 고려하시기 바랍니다.'}

## 7. 📋 요약 및 제언
- 핵심 상태: ${sevLabel}, 주요 부담 영역은 ${top[0]?.domain ?? top[0]?.label ?? '파악 필요'}
- 즉시 실행: ① 트리거 5분 기록 ② 안정 영역 루틴화 ③ 수면 시간 고정
- 30일 마음 챌린지를 통해 baseline → 14일 → 30일 변화량을 수치로 확인하실 수 있습니다.
- 점수는 '나'를 평가하는 도구가 아니라, 변화를 설계하기 위한 출발점입니다. 작은 한 걸음이 다음 검사에서 분명한 차이로 나타날 것입니다.`;
}

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