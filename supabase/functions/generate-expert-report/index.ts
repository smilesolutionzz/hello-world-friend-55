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

    const { assessments, observations, observationSessions, chatRooms, profile, externalTestImages, userInput } = await req.json();

    console.log('전문가급 리포트 생성 요청:', {
      userId: user.id,
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

    // 데이터 정리 및 요약
    const assessmentSummary = assessments?.map((a: any) => ({
      type: a.assessment_type || a.age_group,
      date: new Date(a.created_at).toLocaleDateString('ko-KR'),
      results: a.results,
      analysis: a.analysis,
      riskLevel: a.risk_level,
      recommendations: a.recommendations
    })) || [];

    const observationSummary = observations?.map((o: any) => ({
      title: o.title,
      description: o.description,
      date: new Date(o.created_at).toLocaleDateString('ko-KR'),
      behaviorType: o.behavior_type,
      severity: o.severity
    })) || [];

    const sessionSummary = observationSessions?.map((s: any) => ({
      activity: s.activity_type,
      behaviors: s.observed_behaviors,
      notes: s.notes,
      date: new Date(s.created_at).toLocaleDateString('ko-KR')
    })) || [];

    const chatMessages = chatRooms?.flatMap((room: any) => 
      room.chat_messages?.map((msg: any) => ({
        role: msg.role,
        content: msg.content?.substring(0, 300),
        date: new Date(msg.created_at).toLocaleDateString('ko-KR')
      })) || []
    ).slice(0, 30) || [];

    // 병렬로 외부 검색 수행
    const concerns = userInput?.recentConcerns || '';
    const [researchInsights, relatedResources] = await Promise.all([
      searchLatestResearch(concerns, userAge, userInput?.gender || ''),
      crawlRelatedResources(concerns)
    ]);

    console.log('외부 검색 완료:', {
      researchLength: researchInsights.length,
      resourcesLength: relatedResources.length
    });

    // 매우 상세한 시스템 프롬프트
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

📋 작성할 9가지 섹션:

1️⃣ 발달 종합 평가 (600자 이상)
- 모든 검사 결과의 구체적 점수와 해석
- 인지, 언어, 운동, 사회성 발달 각 영역별 상세 분석
- 검사별 강점 및 주의 영역 구분
- 연령 대비 발달 수준 평가

2️⃣ 심리 상태 분석 (500자 이상)
- 정서적 특성과 안정성 평가
- 관찰된 행동 패턴과 심리 상태의 연관성
- 스트레스 요인 및 대처 능력 분석
- 애착 유형 및 관계성 평가

3️⃣ 강점/약점 분석 (500자 이상)
- 구체적 강점 5가지 (실제 예시 포함)
- 개선 필요 영역 5가지 (구체적 상황 포함)
- 강점 활용 전략
- 약점 보완 방안

4️⃣ 맞춤 활동 제안 (600자 이상)
- 일상에서 즉시 실천 가능한 활동 7-10가지
- 각 활동의 목적, 방법, 예상 효과 상세 설명
- 난이도별 구분 (쉬움/보통/도전)
- 주간/월간 활동 계획표 제안

5️⃣ 발달 로드맵 (500자 이상)
- 단기 목표 (1-3개월): 3-5가지 구체적 목표
- 중기 목표 (3-6개월): 3-5가지 구체적 목표  
- 장기 목표 (6-12개월): 3-5가지 구체적 목표
- 각 목표별 달성 기준 및 평가 방법

6️⃣ 또래 비교 분석 (400자 이상)
- 동일 연령대 발달 기준과의 비교
- 백분위 또는 표준점수 해석
- 또래 대비 빠르거나 느린 영역
- 개인차의 정상 범위 설명

7️⃣ 전문가 소견서 (600자 이상)
- 종합적인 전문가 의견
- 전문적 개입 필요성 및 시급성 평가
- 권장 전문가 유형 및 개입 방법
- 추가 검사 또는 평가 권고

8️⃣ 가족 지원 가이드 (600자 이상)
- 가정 내 실천 양육 팁 10가지 이상
- 각 팁의 구체적 실행 방법
- 부모의 정서적 지원 방법
- 피해야 할 행동 vs 권장 행동
- 형제자매 관계 고려사항

9️⃣ 종합 요약 및 제언 (500자 이상)
- 핵심 분석 결과 요약
- 가장 중요한 실천 사항 TOP 5
- 긍정적 예후 및 잠재력 평가
- 장기적 발전 가능성
- 격려와 응원 메시지`;

    const userPrompt = `다음 데이터를 기반으로 세계 최고 수준의 전문가급 종합 리포트를 생성해주세요:

═══════════════════════════════════════
📌 대상자 정보
═══════════════════════════════════════
• 이름: ${userInput?.name || '미제공'}
• 생년월일: ${userInput?.birthDate || '미제공'} (만 ${userAge}세)
• 성별: ${userInput?.gender || '미제공'}

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

    // Lovable AI 호출 (빠른 모델 사용 - 리소스 최적화)
    console.log('Lovable AI 호출 시작 (google/gemini-2.5-flash)');

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

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        // Structured output: tool calling (more reliable than asking for raw JSON)
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_expert_report',
              description: 'Generate the expert report payload with 9 required sections and an overall HTML summary.',
              parameters: {
                type: 'object',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'Overall summary in HTML (at least ~300 Korean chars).',
                  },
                  sections: {
                    type: 'array',
                    minItems: 9,
                    maxItems: 9,
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', enum: [...requiredSections] },
                        content: {
                          type: 'string',
                          description: 'Section content in HTML (roughly 400-600 Korean chars).',
                        },
                      },
                      required: ['title', 'content'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['summary', 'sections'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'generate_expert_report' } },
        max_tokens: 8000,
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

    let reportData: any;
    try {
      const aiData = JSON.parse(rawText);

      // 1) Tool calling (preferred)
      const toolArgs = aiData?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (toolArgs && typeof toolArgs === 'string') {
        reportData = JSON.parse(toolArgs);
      } else {
        // 2) Fallback: message.content parsing (handles string or array-like content)
        const contentAny = aiData?.choices?.[0]?.message?.content;
        const messageContent =
          typeof contentAny === 'string'
            ? contentAny
            : Array.isArray(contentAny)
              ? contentAny
                  .map((p: any) => {
                    if (typeof p === 'string') return p;
                    return p?.text ?? '';
                  })
                  .join('')
              : '';

        if (!messageContent || messageContent.trim().length === 0) {
          console.error('AI content 미리보기(빈값):', String(messageContent));
          reportData = placeholderReport('AI content가 비어있음');
        } else {
          console.log('AI content 길이:', messageContent.length);
          try {
            reportData = JSON.parse(messageContent);
          } catch (firstParseError) {
            console.log('1차 파싱 실패, 정제 시도...');

            // JSON 블록 추출 시도
            const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                const cleanedJson = jsonMatch[0]
                  .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
                  .replace(/\n/g, ' ')
                  .replace(/\r/g, ' ')
                  .replace(/\t/g, ' ');
                reportData = JSON.parse(cleanedJson);
              } catch {
                reportData = placeholderReport('정제 후에도 JSON 파싱 실패');
              }
            } else {
              console.error('AI content 미리보기(앞 1200자):', messageContent.substring(0, 1200));
              reportData = placeholderReport('JSON 구조 없음');
            }
          }
        }
      }

      // 검증/보정: sections 항상 9개 & 제목 일치 보장
      if (!reportData || typeof reportData !== 'object') {
        reportData = placeholderReport('응답 구조가 올바르지 않음');
      }

      if (!Array.isArray(reportData.sections)) {
        reportData.sections = [];
      }

      // 중복/누락 정리: requiredSections 순서대로 재구성
      const byTitle = new Map<string, string>();
      for (const s of reportData.sections) {
        if (!s?.title || !s?.content) continue;
        if (typeof s.title !== 'string' || typeof s.content !== 'string') continue;
        byTitle.set(s.title, s.content);
      }

      reportData.sections = requiredSections.map((title) => ({
        title,
        content: byTitle.get(title) ?? '<div>이 섹션의 데이터를 생성하는 중 오류가 발생했습니다.</div>',
      }));

      if (typeof reportData.summary !== 'string' || reportData.summary.trim().length === 0) {
        reportData.summary = '<div>요약 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</div>';
      }

      console.log('리포트 파싱 성공, 섹션 수:', reportData.sections.length);
    } catch (parseError) {
      console.error('AI 응답 파싱 최종 오류:', parseError);
      console.error('원본 응답 미리보기(앞 1200자):', rawText?.substring(0, 1200));
      reportData = placeholderReport('rawText JSON 파싱 실패');
    }

    // 메타데이터 추가
    reportData.metadata = {
      generatedAt: new Date().toISOString(),
      model: 'google/gemini-2.5-flash',
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
