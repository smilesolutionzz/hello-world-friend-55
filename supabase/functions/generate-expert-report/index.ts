import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');

// Perplexity로 최신 연구/논문 검색
async function searchLatestResearch(concerns: string, userAge: number, gender: string): Promise<string> {
  if (!PERPLEXITY_API_KEY) {
    console.log('PERPLEXITY_API_KEY not configured, skipping web search');
    return '';
  }

  try {
    const searchQuery = `
      아동 발달 심리 ${concerns}
      최신 연구 논문 치료법 개입 방법
      ${userAge}세 ${gender} 발달 특성
      증거 기반 치료 EBP 연구
    `.trim();

    console.log('Perplexity 검색 시작:', searchQuery.substring(0, 100));

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: `당신은 아동 발달 및 심리 연구 전문가입니다. 사용자의 고민과 관련된 최신 연구, 논문, 전문가 조언을 검색하여 정리해주세요.
            
다음 형식으로 응답해주세요:
1. 관련 최신 연구 동향 (2-3개 핵심 연구 요약)
2. 증거 기반 개입 방법 (3-5가지)
3. 전문가 권고 사항
4. 참고 자료 및 기관`
          },
          {
            role: 'user',
            content: `다음 정보를 기반으로 관련 최신 연구와 전문가 조언을 검색해주세요:

대상: ${userAge}세 ${gender}
주요 고민: ${concerns}

실시간 웹 검색을 통해 최신 연구와 논문, 전문가 조언을 수집해주세요.`
          }
        ],
        search_recency_filter: 'month',
        return_citations: true,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error:', response.status);
      return '';
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    console.log('Perplexity 검색 완료, 길이:', content.length);
    
    return `
## 🔬 최신 연구 기반 인사이트 (실시간 웹 검색 결과)

${content}

${citations.length > 0 ? `
### 참고 출처
${citations.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}
` : ''}
    `.trim();
  } catch (error) {
    console.error('Perplexity search error:', error);
    return '';
  }
}

// Firecrawl로 관련 리소스 수집
async function crawlRelatedResources(concerns: string): Promise<string> {
  if (!FIRECRAWL_API_KEY) {
    console.log('FIRECRAWL_API_KEY not configured, skipping crawl');
    return '';
  }

  try {
    // 신뢰할 수 있는 기관 웹사이트에서 관련 정보 검색
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `${concerns} 치료 상담 지원 기관 site:*.go.kr OR site:*.or.kr`,
        limit: 5,
        lang: 'ko',
        country: 'KR',
      }),
    });

    if (!response.ok) {
      console.error('Firecrawl API error:', response.status);
      return '';
    }

    const data = await response.json();
    const results = data.data || [];

    if (results.length === 0) return '';

    console.log('Firecrawl 검색 완료, 결과 수:', results.length);

    return `
## 🏛️ 관련 기관 및 리소스

${results.map((r: any, i: number) => `
### ${i + 1}. ${r.title || '관련 리소스'}
${r.description || ''}
🔗 [바로가기](${r.url})
`).join('\n')}
    `.trim();
  } catch (error) {
    console.error('Firecrawl error:', error);
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user ID from JWT
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { assessments, observations, observationSessions, chatRooms, profile, externalTestImages, userInput, reportMode } = await req.json();

    const isWithData = reportMode !== 'without-data';

    console.log('전문가급 리포트 생성 요청:', {
      userId: user.id,
      reportMode: reportMode || 'with-data',
      assessmentsCount: assessments?.length || 0,
      observationsCount: observations?.length || 0,
      userName: userInput?.name,
      concerns: userInput?.recentConcerns?.substring(0, 50)
    });

    // 나이 계산
    const calculateAge = (birthDate: string): number => {
      if (!birthDate) return 0;
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    const userAge = calculateAge(userInput?.birthDate);

    // 데이터 정리 및 요약 (with-data 모드만)
    const assessmentSummary = isWithData ? (assessments?.map((a: any) => ({
      type: a.assessment_type || a.age_group,
      date: new Date(a.created_at).toLocaleDateString('ko-KR'),
      results: a.results,
      analysis: a.analysis,
      riskLevel: a.risk_level,
      recommendations: a.recommendations
    })) || []) : [];

    const observationSummary = isWithData ? (observations?.map((o: any) => ({
      title: o.title,
      description: o.description,
      date: new Date(o.created_at).toLocaleDateString('ko-KR'),
      behaviorType: o.behavior_type,
      severity: o.severity
    })) || []) : [];

    const sessionSummary = isWithData ? (observationSessions?.map((s: any) => ({
      activity: s.activity_type,
      behaviors: s.observed_behaviors,
      notes: s.notes,
      date: new Date(s.created_at).toLocaleDateString('ko-KR')
    })) || []) : [];

    const chatMessages = isWithData ? (chatRooms?.flatMap((room: any) => 
      room.chat_messages?.map((msg: any) => ({
        role: msg.role,
        content: msg.content?.substring(0, 300),
        date: new Date(msg.created_at).toLocaleDateString('ko-KR')
      })) || []
    ).slice(0, 30) || []) : [];

    // 병렬로 외부 검색 수행
    const concerns = userInput?.recentConcerns || userInput?.developmentalNotes || '';
    const [researchInsights, relatedResources] = await Promise.all([
      searchLatestResearch(concerns, userAge, userInput?.gender || ''),
      crawlRelatedResources(concerns)
    ]);

    console.log('외부 검색 완료:', {
      researchLength: researchInsights.length,
      resourcesLength: relatedResources.length
    });

    // 매우 상세한 시스템 프롬프트 - 논문·이론 기반 강화
    const systemPrompt = `당신은 대한민국 최고 수준의 발달심리학 및 임상심리 전문가입니다. 
박사 학위와 20년 이상의 임상 경험을 가진 전문가로서, 제공된 모든 데이터를 심층 분석하여 세계 최고 수준의 종합 리포트를 작성합니다.

⚠️ 중요 지침:
1. 모든 분석은 제공된 실제 데이터에 근거해야 합니다
2. 일반론이 아닌 이 개인만을 위한 맞춤 분석을 제공하세요
3. 구체적인 수치, 예시, 근거를 풍부하게 사용하세요
4. 각 섹션은 최소 500자 이상의 상세한 내용으로 작성하세요
5. 전문적이면서도 보호자가 이해하기 쉬운 언어를 사용하세요
6. HTML 태그(<div>, <p>, <ul>, <li>, <strong>, <h3>, <h4>)를 활용하여 가독성을 높이세요
7. 부정적 표현보다는 발전 가능성과 잠재력에 초점을 맞추세요
8. ⭐ 각 섹션에 반드시 관련 심리학 이론과 근거 논문을 인용하세요
9. ⭐ 논문 인용 시 저자명, 발표 연도, 학술지명을 포함하세요 (예: Smith et al., 2023, Journal of Child Psychology)
10. ⭐ 마크다운 형식(#, **, ## 등)은 절대 사용하지 마세요. 오직 HTML 태그만 사용하세요.

📖 반드시 참조해야 할 핵심 이론 프레임워크:
- Piaget 인지발달이론 (감각운동기~형식적 조작기)
- Vygotsky 근접발달영역(ZPD) 및 비계설정(Scaffolding)
- Bowlby 애착이론 (안전/불안정 애착 유형)
- Erikson 심리사회적 발달 8단계
- Beck 인지치료이론 (인지 삼제)
- Gardner 다중지능이론 (8가지 지능)
- Seligman 긍정심리학 (VIA 성격 강점)
- Bronfenbrenner 생태체계이론 (미시/중간/외/거시체계)
- Baumrind 양육유형이론 (권위적/허용적/권위주의적)
- Gottman 정서코칭 5단계
- ABA 응용행동분석
- CBT 인지행동치료
- DIR/Floortime 모델
- DSM-5-TR / ICD-11 진단 체계
- WHO 글로벌 발달 규준

📋 작성할 9가지 섹션 (⚠️ 반드시 아래 정확한 제목을 사용하세요):

1️⃣ "발달 종합 평가" (600자 이상)
- Piaget 인지발달이론과 Vygotsky ZPD 이론에 기반한 발달 수준 평가
- 인지, 언어, 운동, 사회성 각 영역별 상세 분석
- 관련 논문 2-3개 인용 (저자, 연도, 학술지명 포함)
- 연령 대비 발달 수준 해석

2️⃣ "심리 상태 분석" (500자 이상)
- Beck 인지치료이론과 Bowlby 애착이론 적용
- DSM-5-TR 기준 참조한 정서 상태 평가
- 관련 최신 메타분석 연구 인용
- 스트레스 요인 및 대처 능력 분석

3️⃣ "강점/약점 분석" (500자 이상)
- Gardner 다중지능이론 기반 강점 영역 분석
- Seligman VIA 성격 강점 분류 적용
- 구체적 강점 5가지와 개선 필요 영역 5가지
- Nature, JAMA 등 학술지 연구 근거 제시

4️⃣ "맞춤 활동 제안" (600자 이상)
- ABA, CBT, DIR/Floortime 등 EBP 기반 개입 전략
- Cochrane Review 및 WHO 가이드라인 참조
- 7-10가지 실천 활동 (목적, 방법, 예상 효과)
- 난이도별 구분과 주간 활동 계획

5️⃣ "발달 로드맵" (500자 이상)
- Bronfenbrenner 생태체계모델과 Erikson 발달 단계 통합 적용
- 단기(1-3개월), 중기(3-6개월), 장기(6-12개월) 목표
- Lancet Child & Adolescent Health 등 종단 연구 기반 예후
- 각 목표별 달성 기준

6️⃣ "또래 비교 분석" (400자 이상)
- WHO 다국적 성장 기준(MGRS)과 CDC 발달 이정표 기반
- 한국 아동 발달 규준(Korean Norms) 데이터 비교
- 백분위 및 표준점수 해석
- 개인차의 정상 범위 설명

7️⃣ "전문가 소견서" (600자 이상)
- ICD-11 및 DSM-5-TR 진단 체계 참조
- APA 소견서 작성 가이드라인 준수
- 전문적 개입 필요성 및 시급성 평가
- 추가 검사 및 전문가 상담 권고

8️⃣ "가족 지원 가이드" (600자 이상)
- Baumrind 양육유형 모델과 Gottman 정서코칭 적용
- PCIT(부모-자녀 상호작용치료) 프로토콜 기반
- Harvard Center on the Developing Child 최신 연구 반영
- 가정 내 실천 팁 10가지 이상

9️⃣ "종합 요약 및 제언" (500자 이상)
- WHO ICF 프레임워크 기반 통합 정리
- 핵심 분석 결과와 TOP 5 실천 사항
- 긍정적 예후 및 잠재력 평가
- 격려와 응원 메시지

${externalTestImages ? `
🔟 "외부 검사 결과 해석" (600자 이상)
- 첨부된 외부 기관 검사 결과지에 대한 전문적 해석
- 검사 종류, 주요 점수/수치의 임상적 의미 설명
- 정상 범위 대비 현재 수치 평가
- 다른 검사 결과와의 교차 분석 및 종합적 의미 해석
- 추가로 필요한 검사나 후속 조치 권고
- 관련 학술 논문 2-3개 인용
` : ''}

⚠️⚠️⚠️ 매우 중요: sections 배열의 각 title 값은 반드시 위의 큰따옴표 안의 제목과 정확히 일치해야 합니다!`;

    const userPrompt = `다음 ${isWithData ? '데이터를 기반으로' : '고민·상태 정보를 기반으로'} 세계 최고 수준의 전문가급 종합 리포트를 생성해주세요:

═══════════════════════════════════════
📌 대상자 정보
═══════════════════════════════════════
• 이름: ${userInput?.name || '미제공'}
• 생년월일: ${userInput?.birthDate || '미제공'} (만 ${userAge}세)
• 성별: ${userInput?.gender || '미제공'}

${isWithData ? `
═══════════════════════════════════════
📊 검사 기록 (총 ${assessmentSummary.length}건)
═══════════════════════════════════════
${JSON.stringify(assessmentSummary, null, 2)}

═══════════════════════════════════════
📝 관찰 일지 (총 ${observationSummary.length}건)
═══════════════════════════════════════
${JSON.stringify(observationSummary, null, 2)}

═══════════════════════════════════════
🎬 관찰 세션 기록 (총 ${sessionSummary.length}건)
═══════════════════════════════════════
${JSON.stringify(sessionSummary, null, 2)}

═══════════════════════════════════════
💬 AI 상담 기록 (총 ${chatMessages.length}건)
═══════════════════════════════════════
${JSON.stringify(chatMessages, null, 2)}

═══════════════════════════════════════
👤 프로필 정보
═══════════════════════════════════════
${JSON.stringify(profile, null, 2)}

${externalTestImages ? `
═══════════════════════════════════════
🖼️ 외부 기관 검사 결과 (AI 분석)
═══════════════════════════════════════
${externalTestImages}
` : ''}
` : `
═══════════════════════════════════════
⚠️ 리포트 모드: 고민·상태 기반 (데이터 미포함)
═══════════════════════════════════════
기존 검사/관찰 데이터 없이 아래 고민·상태 정보만으로 전문 분석을 수행합니다.
보호자가 제공한 고민과 관찰 소견을 최대한 활용하여 깊이 있는 분석을 제공하세요.

${externalTestImages ? `
═══════════════════════════════════════
🖼️ 외부 기관 검사 결과 (AI 분석)
═══════════════════════════════════════
${externalTestImages}
` : ''}
`}

${userInput?.recentConcerns ? `
═══════════════════════════════════════
❤️ 보호자의 주요 고민
═══════════════════════════════════════
${userInput.recentConcerns}
` : ''}

${userInput?.developmentalNotes ? `
═══════════════════════════════════════
👁️ 보호자 관찰 소견
═══════════════════════════════════════
${userInput.developmentalNotes}
` : ''}

${researchInsights ? `
═══════════════════════════════════════
🔬 최신 연구 기반 인사이트 (실시간 웹 검색)
═══════════════════════════════════════
${researchInsights}
` : ''}

${relatedResources ? `
═══════════════════════════════════════
🏛️ 관련 기관 및 리소스
═══════════════════════════════════════
${relatedResources}
` : ''}

═══════════════════════════════════════
📋 응답 형식 (반드시 준수)
═══════════════════════════════════════

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이 순수 JSON만 반환하세요:

{
  "sections": [
    {
      "title": "발달 종합 평가",
      "content": "<div>HTML 형식의 매우 상세한 내용 (최소 600자)...</div>"
    },
    {
      "title": "심리 상태 분석",
      "content": "<div>HTML 형식의 매우 상세한 내용 (최소 500자)...</div>"
    },
    {
      "title": "강점/약점 분석",
      "content": "<div>HTML 형식의 매우 상세한 내용 (최소 500자)...</div>"
    },
    {
      "title": "맞춤 활동 제안",
      "content": "<div>HTML 형식의 매우 상세한 내용 (최소 600자)...</div>"
    },
    {
      "title": "발달 로드맵",
      "content": "<div>HTML 형식의 매우 상세한 내용 (최소 500자)...</div>"
    },
    {
      "title": "또래 비교 분석",
      "content": "<div>HTML 형식의 매우 상세한 내용 (최소 400자)...</div>"
    },
    {
      "title": "전문가 소견서",
      "content": "<div>HTML 형식의 매우 상세한 내용 (최소 600자)...</div>"
    },
    {
      "title": "가족 지원 가이드",
      "content": "<div>HTML 형식의 매우 상세한 내용 (최소 600자)...</div>"
    },
    {
      "title": "종합 요약 및 제언",
      "content": "<div>HTML 형식의 매우 상세한 내용 (최소 500자)...</div>"
    }
  ],
  "summary": "<div>전체 분석의 핵심 요약 (300자 이상)</div>",
  "researchInsights": "${researchInsights ? 'true' : 'false'}",
  "relatedResources": "${relatedResources ? 'true' : 'false'}"
}`;

    // Lovable AI 호출 (최고급 모델 사용)
    const aiModel = 'google/gemini-3-flash-preview';
    console.log(`Lovable AI 호출 시작 (${aiModel})`);

    const requiredSections = [
      "발달 종합 평가",
      "심리 상태 분석",
      "강점/약점 분석",
      "맞춤 활동 제안",
      "발달 로드맵",
      "또래 비교 분석",
      "전문가 소견서",
      "가족 지원 가이드",
      "종합 요약 및 제언",
    ] as const;

    const jsonInstruction = `

⚠️ 절대 중요 규칙:
- 응답은 반드시 순수 JSON 객체여야 합니다.
- \`\`\`json 이나 \`\`\` 같은 마크다운 코드 블록을 절대 사용하지 마세요.
- 응답의 첫 번째 문자는 반드시 { 이고 마지막 문자는 반드시 } 여야 합니다.
- 그 외 어떤 텍스트, 설명, 주석도 포함하지 마세요.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: systemPrompt + jsonInstruction },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 32000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI 응답 오류:', aiResponse.status, errorText);

      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({
            error: 'LOVABLE_AI_CREDITS_INSUFFICIENT',
            message: 'Lovable AI 크레딧이 부족합니다.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: 'LOVABLE_AI_RATE_LIMITED',
            message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }

      throw new Error(`AI 분석 실패: ${aiResponse.status}`);
    }

    const rawText = await aiResponse.text();
    console.log('AI 응답 길이:', rawText?.length);

    const placeholderReport = (reason: string) => ({
      sections: requiredSections.map((title) => ({
        title,
        content: `<div>AI 리포트 생성 중 문제가 발생했습니다. (${reason}) 잠시 후 다시 시도해주세요.</div>`,
      })),
      summary: `<div>리포트 생성 중 일부 오류가 발생했습니다. (${reason})</div>`,
      parseError: true,
    });

    // Helper: robust JSON extraction from AI response (handles truncated JSON)
    const extractJSON = (text: string): any => {
      // 1) Strip markdown fences globally
      let cleaned = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      // 2) Try direct parse
      try {
        return JSON.parse(cleaned);
      } catch {}

      // 3) Extract from first { to last }
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = cleaned.substring(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(jsonStr);
        } catch {}

        // 4) Try fixing common JSON issues (trailing commas)
        const fixed = jsonStr
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']');
        try {
          return JSON.parse(fixed);
        } catch {}
      }

      // 5) Handle TRUNCATED JSON: close open brackets/braces
      if (firstBrace !== -1) {
        let truncated = cleaned.substring(firstBrace);
        // Remove any trailing incomplete string value
        truncated = truncated.replace(/,\s*\{[^}]*$/, '');
        truncated = truncated.replace(/,\s*"[^"]*$/, '');
        truncated = truncated.replace(/:\s*"[^"]*$/, ': ""');
        
        // Count open brackets and braces
        let openBraces = 0, openBrackets = 0;
        let inString = false, escape = false;
        for (const ch of truncated) {
          if (escape) { escape = false; continue; }
          if (ch === '\\') { escape = true; continue; }
          if (ch === '"') { inString = !inString; continue; }
          if (inString) continue;
          if (ch === '{') openBraces++;
          if (ch === '}') openBraces--;
          if (ch === '[') openBrackets++;
          if (ch === ']') openBrackets--;
        }
        
        // Close any unclosed strings, arrays, objects
        if (inString) truncated += '"';
        // Remove trailing comma before closing
        truncated = truncated.replace(/,\s*$/, '');
        for (let i = 0; i < openBrackets; i++) truncated += ']';
        for (let i = 0; i < openBraces; i++) truncated += '}';
        
        try {
          const result = JSON.parse(truncated);
          console.log('잘린 JSON 복구 성공');
          return result;
        } catch (e) {
          console.error('잘린 JSON 복구 실패:', (e as Error).message);
        }
      }

      return null;
    };

    // Helper: extract message content from various AI response formats
    const extractMessageContent = (rawJson: any): string => {
      const choice = rawJson?.choices?.[0];
      if (!choice) return '';
      
      const msg = choice.message;
      if (!msg) return '';
      
      // Standard string content
      if (typeof msg.content === 'string' && msg.content.trim()) {
        return msg.content.trim();
      }
      
      // Array of parts (Gemini style)
      if (Array.isArray(msg.content)) {
        const text = msg.content
          .map((p: any) => {
            if (typeof p === 'string') return p;
            if (p?.text) return p.text;
            if (p?.type === 'text' && p?.text) return p.text;
            return '';
          })
          .join('')
          .trim();
        if (text) return text;
      }
      
      // Tool calls fallback
      const toolArgs = msg.tool_calls?.[0]?.function?.arguments;
      if (toolArgs) {
        return typeof toolArgs === 'string' ? toolArgs : JSON.stringify(toolArgs);
      }
      
      // Last resort: check if the raw response itself contains JSON with sections
      const rawStr = JSON.stringify(rawJson);
      const sectionsMatch = rawStr.match(/"sections"\s*:\s*\[/);
      if (sectionsMatch) {
        console.log('Raw response에서 sections 발견, 전체 응답에서 추출 시도');
        return rawStr;
      }
      
      return '';
    };

    let reportData: any;
    try {
      const aiData = JSON.parse(rawText);
      let messageContent = extractMessageContent(aiData);

      console.log('AI content 길이:', messageContent.length);
      if (messageContent.length > 0) {
        console.log('AI content 처음 300자:', messageContent.substring(0, 300));
      }

      // 빈 content인 경우 재시도 (다른 모델 사용)
      if (!messageContent || messageContent.length < 50) {
        console.error('AI content 비어있음 또는 너무 짧음, finish_reason:', aiData?.choices?.[0]?.finish_reason);
        console.log('전체 응답 구조:', JSON.stringify(aiData).substring(0, 500));
        
        // 재시도: 다른 모델로 한 번 더 시도
        console.log('재시도: anthropic/claude-sonnet-4-20250514 모델로 재시도');
        const retryResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'anthropic/claude-sonnet-4-20250514',
            messages: [
              { role: 'system', content: systemPrompt + jsonInstruction },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 16000,
          }),
        });

        if (retryResponse.ok) {
          const retryRaw = await retryResponse.text();
          console.log('재시도 응답 길이:', retryRaw.length);
          const retryData = JSON.parse(retryRaw);
          messageContent = extractMessageContent(retryData);
          console.log('재시도 content 길이:', messageContent.length);
          if (messageContent.length > 0) {
            console.log('재시도 content 처음 300자:', messageContent.substring(0, 300));
          }
        } else {
          console.error('재시도도 실패:', retryResponse.status);
        }
        
        if (!messageContent || messageContent.length < 50) {
          reportData = placeholderReport('AI content가 비어있음 (재시도 포함)');
        }
      }
      
      if (!reportData) {
        reportData = extractJSON(messageContent);
        if (reportData) {
          console.log('JSON 파싱 성공, sections:', reportData.sections?.length);
          // Log each section title for debugging
          if (Array.isArray(reportData.sections)) {
            reportData.sections.forEach((s: any, i: number) => {
              console.log(`  섹션[${i}] title: "${s?.title}", content길이: ${s?.content?.length || 0}`);
            });
          }
        } else {
          console.error('JSON 파싱 실패, content 처음 500자:', messageContent.substring(0, 500));
          reportData = placeholderReport('JSON 파싱 실패');
        }
      }

      if (!reportData || typeof reportData !== 'object') {
        reportData = placeholderReport('응답 구조가 올바르지 않음');
      }

      if (!Array.isArray(reportData.sections)) {
        reportData.sections = [];
      }

      // Fuzzy title matching helper - very aggressive normalization
      const normTitle = (t: string) => t
        .replace(/[\d️⃣⃣0-9①②③④⑤⑥⑦⑧⑨⓪❶❷❸❹❺❻❼❽❾#️⃣.\s\/·\-_:：,，()（）「」【】《》<>⚠️📋📊🔬❤️💪🎯🗺️👥🏥👨‍👩‍👧📝✅☑️⭐🌟💡🧠🎯📈📉🏠🤝💬📖🔍✨]/g, '')
        .replace(/[^\p{L}]/gu, '')
        .toLowerCase();

      // Comprehensive alias map - covers all possible AI title variations
      const titleAliases: Record<string, string[]> = {
        '발달 종합 평가': ['종합발달프로파일', '발달종합평가', '종합발달평가', '발달프로파일', '발달평가', '종합평가', '인지발달분석', '발달수준평가'],
        '심리 상태 분석': ['심리정서심층분석', '심리상태분석', '정서심층분석', '심리분석', '정서분석', '심리정서분석', '정서상태분석'],
        '강점/약점 분석': ['강점약점매트릭스', '강점약점분석', '강점분석', '약점분석', '강약점분석', '강점약점', '강약점매트릭스'],
        '맞춤 활동 제안': ['맞춤형개입프로그램', '맞춤활동제안', '개입프로그램', '맞춤활동', '활동제안', '개입전략', '맞춤형개입', '맞춤프로그램'],
        '발달 로드맵': ['발달로드맵및예후', '발달로드맵예후', '발달로드맵', '로드맵예후', '발달예후', '로드맵'],
        '또래 비교 분석': ['또래비교분석', '또래비교', '비교분석'],
        '전문가 소견서': ['전문가소견서', '소견서', '전문가소견', '임상소견서', '전문소견'],
        '가족 지원 가이드': ['가족지원가이드', '가족지원', '양육가이드', '부모가이드', '가정지원'],
        '종합 요약 및 제언': ['종합요약및제언', '종합요약제언', '종합요약', '요약및제언', '요약제언', '총평'],
      };

      const findBestTitle = (aiTitle: string): string | null => {
        if (!aiTitle) return null;
        const norm = normTitle(aiTitle);
        if (!norm) return null;
        
        // 1) Exact match against requiredSections
        for (const req of requiredSections) {
          if (normTitle(req) === norm) return req;
        }
        // 2) Alias exact match
        for (const [target, aliases] of Object.entries(titleAliases)) {
          for (const alias of aliases) {
            if (norm === alias) return target;
          }
        }
        // 3) Substring containment (both directions)
        for (const req of requiredSections) {
          const nReq = normTitle(req);
          if (norm.includes(nReq) || nReq.includes(norm)) return req;
        }
        // 4) Alias substring containment
        for (const [target, aliases] of Object.entries(titleAliases)) {
          for (const alias of aliases) {
            if (norm.includes(alias) || alias.includes(norm)) return target;
          }
        }
        // 5) Check if the norm contains any key Korean words
        const keywordMap: Record<string, string> = {
          '발달': '발달 종합 평가',
          '심리': '심리 상태 분석',
          '정서': '심리 상태 분석',
          '강점': '강점/약점 분석',
          '약점': '강점/약점 분석',
          '활동': '맞춤 활동 제안',
          '개입': '맞춤 활동 제안',
          '로드맵': '발달 로드맵',
          '예후': '발달 로드맵',
          '또래': '또래 비교 분석',
          '소견': '전문가 소견서',
          '가족': '가족 지원 가이드',
          '양육': '가족 지원 가이드',
          '요약': '종합 요약 및 제언',
          '제언': '종합 요약 및 제언',
        };
        for (const [keyword, target] of Object.entries(keywordMap)) {
          if (norm.includes(keyword)) return target;
        }
        
        return null;
      };

      const byTitle = new Map<string, string>();
      for (const s of reportData.sections) {
        if (!s?.title || !s?.content) {
          console.log('빈 섹션 스킵:', JSON.stringify(s).substring(0, 100));
          continue;
        }
        if (typeof s.title !== 'string' || typeof s.content !== 'string') continue;
        const matched = findBestTitle(s.title);
        if (matched) {
          // Don't overwrite if already matched (keep first match)
          if (!byTitle.has(matched)) {
            byTitle.set(matched, s.content);
            console.log(`✅ 매칭: "${s.title}" → "${matched}"`);
          }
        } else {
          console.log(`❌ 매칭 실패: "${s.title}"`);
        }
      }

      console.log('매칭된 섹션 수:', byTitle.size, '/', requiredSections.length);
      
      // Fallback: if no titles matched but we have sections, map by index
      if (byTitle.size === 0 && reportData.sections?.length > 0) {
        console.log('제목 매칭 전부 실패, 순서대로 매핑');
        for (let i = 0; i < Math.min(reportData.sections.length, requiredSections.length); i++) {
          const s = reportData.sections[i];
          if (s?.content && typeof s.content === 'string' && s.content.length > 10) {
            byTitle.set(requiredSections[i], s.content);
            console.log(`  순서매핑[${i}]: "${requiredSections[i]}" ← content길이:${s.content.length}`);
          }
        }
        console.log('순서 매핑 후 섹션 수:', byTitle.size);
      }

      // Final assembly
      reportData.sections = requiredSections.map((title) => ({
        title,
        content: byTitle.get(title) ?? `<div><p>이 섹션의 분석 데이터가 생성되지 않았습니다. 다시 시도해주세요.</p></div>`,
      }));

      const filledCount = requiredSections.filter(t => byTitle.has(t)).length;
      console.log('리포트 파싱 성공, 채워진 섹션:', filledCount, '/', requiredSections.length);
    } catch (parseError) {
      console.error('AI 응답 파싱 최종 오류:', parseError);
      console.error('원본 응답 미리보기(앞 1200자):', rawText?.substring(0, 1200));
      reportData = placeholderReport('rawText JSON 파싱 실패');
    }

    // 메타데이터 추가
    reportData.metadata = {
      generatedAt: new Date().toISOString(),
      model: aiModel,
      dataCount: {
        assessments: assessmentSummary.length,
        observations: observationSummary.length,
        sessions: sessionSummary.length,
        chats: chatMessages.length
      },
      hasResearchInsights: !!researchInsights,
      hasRelatedResources: !!relatedResources,
      userInfo: {
        name: userInput?.name,
        age: userAge,
        gender: userInput?.gender
      }
    };

    // 외부 검색 결과 추가
    if (researchInsights) {
      reportData.researchInsightsContent = researchInsights;
    }
    if (relatedResources) {
      reportData.relatedResourcesContent = relatedResources;
    }

    return new Response(
      JSON.stringify({
        success: true,
        report: reportData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('전문가급 리포트 생성 오류:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : '리포트 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
