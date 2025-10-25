import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

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

    const { assessments, observations, chatRooms, profile, externalTestImages, userInput } = await req.json();

    console.log('종합 리포트 생성 요청:', {
      userId: user.id,
      assessmentsCount: assessments?.length || 0,
      observationsCount: observations?.length || 0,
      chatRoomsCount: chatRooms?.length || 0
    });

    // 데이터 정리 및 요약
    const assessmentSummary = assessments?.map((a: any) => ({
      type: a.assessment_type,
      date: a.created_at,
      results: a.results,
      analysis: a.analysis
    })) || [];

    const observationSummary = observations?.map((o: any) => ({
      title: o.title,
      description: o.description,
      date: o.created_at,
      behaviorType: o.behavior_type,
      severity: o.severity
    })) || [];

    const chatSummary = chatRooms?.flatMap((room: any) => 
      room.chat_messages?.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        date: msg.created_at
      })) || []
    ) || [];

    // HTML 템플릿 생성 함수
    const generateReportHTML = (reportData: any, profile: any) => {
      return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>종합 발달 리포트</title>
  <style>
    @page {
      margin: 20mm;
    }
    body {
      font-family: 'Noto Sans KR', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 0;
    }
    .cover {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 60px 40px;
      color: white;
      page-break-after: always;
    }
    .cover h1 {
      font-size: 48px;
      margin: 0 0 20px 0;
      font-weight: 700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .cover .subtitle {
      font-size: 24px;
      margin-bottom: 40px;
      opacity: 0.9;
    }
    .cover .profile-info {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      padding: 30px 40px;
      border-radius: 15px;
      margin: 40px 0;
      font-size: 18px;
    }
    .cover .date {
      font-size: 16px;
      margin-top: 40px;
      opacity: 0.9;
    }
    .toc {
      padding: 60px 40px;
      page-break-after: always;
    }
    .toc h2 {
      color: #667eea;
      font-size: 32px;
      margin-bottom: 30px;
      border-bottom: 3px solid #667eea;
      padding-bottom: 15px;
    }
    .toc ol {
      list-style: none;
      counter-reset: toc-counter;
      padding: 0;
    }
    .toc li {
      counter-increment: toc-counter;
      padding: 15px 0;
      font-size: 18px;
      border-bottom: 1px solid #e5e7eb;
    }
    .toc li:before {
      content: counter(toc-counter) ". ";
      color: #667eea;
      font-weight: bold;
      margin-right: 10px;
    }
    .disclaimer {
      background: #fff3cd;
      border-left: 5px solid #ffc107;
      padding: 30px;
      margin: 40px;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .disclaimer h3 {
      color: #856404;
      margin-top: 0;
      font-size: 20px;
    }
    .disclaimer p {
      color: #856404;
      margin: 10px 0;
      line-height: 1.8;
    }
    .content {
      padding: 40px;
    }
    .header {
      border-bottom: 3px solid #667eea;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      color: #667eea;
      margin: 0;
      font-size: 24px;
    }
    .header .date {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    .header .logo {
      text-align: right;
    }
    .header .logo .site {
      color: #667eea;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .header .logo .tagline {
      color: #999;
      font-size: 12px;
    }
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .section h2 {
      color: #667eea;
      border-left: 4px solid #667eea;
      padding-left: 12px;
      margin-bottom: 20px;
      font-size: 24px;
    }
    .summary {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 40px;
    }
    .footer {
      margin-top: 60px;
      padding: 30px 40px;
      border-top: 3px solid #667eea;
      text-align: center;
      background: #f8f9fa;
    }
    .footer .site-info {
      font-size: 16px;
      color: #667eea;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .footer .copyright {
      margin-top: 10px;
      color: #666;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <!-- 커버 페이지 -->
  <div class="cover">
    <h1>종합 발달 리포트</h1>
    <div class="subtitle">Comprehensive Development Report</div>
    <div class="profile-info">
      <div style="font-size: 20px; margin-bottom: 10px;">
        <strong>${profile?.child_name || '아동'}</strong>
      </div>
      <div>
        생년월일: ${profile?.birth_date ? new Date(profile.birth_date).toLocaleDateString('ko-KR') : '-'}
      </div>
    </div>
    <div class="date">
      ${new Date().toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </div>
    <div style="margin-top: 60px; font-size: 18px; font-weight: 500;">
      aihpro.com
    </div>
  </div>

  <!-- 목차 -->
  <div class="toc">
    <h2>목차</h2>
    <ol>
      ${reportData.sections.map((section: any) => `
        <li>${section.title}</li>
      `).join('')}
    </ol>
  </div>

  <!-- 중요 안내사항 -->
  <div class="disclaimer">
    <h3>⚠️ 중요 안내사항</h3>
    <p>
      본 리포트는 <strong>AI 기반 자동 분석 결과</strong>이며, 의학적 진단이나 전문가의 정확한 평가를 대체할 수 없습니다.
    </p>
    <p>
      정확한 평가와 개입을 위해서는 <strong>반드시 전문가와의 상담을 권장</strong>드립니다.
    </p>
    <p>
      본 리포트는 참고 자료로만 활용하시기 바라며, 실제 진단이나 치료 결정은 자격을 갖춘 전문가의 판단을 따라주시기 바랍니다.
    </p>
  </div>

  <!-- 본문 내용 -->
  <div class="content">
    <div class="summary">
      <h2 style="color: #667eea; margin-top: 0;">전체 요약</h2>
      ${reportData.summary}
    </div>

    ${reportData.sections.map((section: any, index: number) => `
      <div class="section">
        <h2>${index + 1}. ${section.title}</h2>
        ${section.content}
      </div>
    `).join('')}
  </div>

  <!-- 푸터 -->
  <div class="footer">
    <div class="site-info">Generated by aihpro.com</div>
    <div class="copyright">© 2025 All Rights Reserved</div>
    <div style="margin-top: 15px; color: #999; font-size: 12px;">
      본 리포트는 AI 기반 분석 결과이며, 전문가 상담을 대체하지 않습니다.
    </div>
  </div>
</body>
</html>
      `;
    };

    // AI에게 전달할 시스템 프롬프트
    const systemPrompt = `당신은 발달심리학 및 임상심리 전문가입니다. 
제공된 모든 검사 기록, 관찰 일지, 외부 기관 검사 결과, AI 상담 기록을 매우 꼼꼼하게 분석하여 9가지 섹션으로 구성된 상세한 전문 리포트를 생성해야 합니다.

**중요: 각 섹션은 반드시 제공된 실제 데이터(검사 결과, 관찰 기록, 외부 검사 자료)를 구체적으로 인용하고 분석해야 합니다.**

각 섹션별 상세 작성 지침:

1. **발달 종합 평가** (최소 400자 이상)
   - 제공된 모든 검사 결과의 구체적 점수와 해석 포함
   - 인지, 언어, 운동, 사회성 발달을 각각 상세 분석
   - 외부 기관 검사 결과가 있다면 반드시 구체적으로 언급
   - 관찰 일지에서 발견된 발달 특성 구체적 인용

2. **심리 상태 분석** (최소 350자 이상)
   - 검사에서 나타난 정서적 특성을 점수와 함께 분석
   - 관찰된 행동 패턴과 심리 상태의 연관성 설명
   - 스트레스 요인, 불안 수준 등 구체적 데이터 기반 분석
   - 보호자가 기록한 고민사항과 연결하여 해석

3. **강점/약점 분석** (최소 400자 이상)
   - 검사와 관찰에서 드러난 구체적 강점 3-5가지 (예시 포함)
   - 개선이 필요한 영역 3-5가지 (구체적 상황 예시 포함)
   - 각 항목마다 실제 데이터 근거 명시
   - 강점을 활용한 약점 개선 방안 제시

4. **맞춤 활동 제안** (최소 450자 이상)
   - 현재 발달 수준과 필요에 맞는 구체적 활동 5-7가지
   - 각 활동의 목적, 방법, 예상 효과 상세 설명
   - 일상에서 즉시 실천 가능한 활동 중심
   - 난이도 조절 방법 포함

5. **발달 로드맵** (최소 400자 이상)
   - 단기(1-3개월), 중기(3-6개월), 장기(6-12개월) 목표 구체화
   - 각 목표의 달성 기준과 평가 방법 명시
   - 단계별 구체적 실천 계획
   - 예상되는 어려움과 대응 방안

6. **또래 비교 분석** (최소 350자 이상)
   - 동일 연령대 발달 기준과 비교한 구체적 수치
   - 검사 결과의 백분위 또는 표준점수 해석
   - 평균 대비 빠르거나 느린 영역 명확히 제시
   - 개인차의 정상 범위 설명으로 불안 완화

7. **전문가 소견서** (최소 400자 이상)
   - 검사와 관찰 결과에 대한 전문가 종합 의견
   - 전문적 개입(치료, 상담 등) 필요성과 시급성 평가
   - 구체적인 전문가 유형과 개입 방법 권장
   - 의료기관 방문이 필요한 경우 명확히 명시

8. **가족 지원 가이드** (최소 450자 이상)
   - 가정에서 실천할 구체적 양육 팁 7-10가지
   - 각 팁의 실행 방법을 단계별로 상세 설명
   - 부모의 정서적 지원 방법
   - 형제자매가 있는 경우 가족 역학 고려
   - 피해야 할 행동과 권장 행동 비교 제시

9. **종합 요약 및 제언** (최소 400자 이상)
   - 전체 분석의 핵심 내용 요약
   - 가장 중요한 3가지 실천 사항 강조
   - 긍정적 예후와 함께 격려 메시지
   - 추가 검사나 전문가 상담이 필요한 경우 안내
   - 장기적 발전 가능성과 잠재력 평가

**작성 원칙:**
- 모든 내용은 제공된 실제 데이터에 근거해야 함
- 일반론이 아닌 이 아동/성인만을 위한 맞춤 분석
- 구체적 예시, 수치, 인용을 풍부하게 사용
- 전문적이면서도 이해하기 쉬운 언어 사용
- 부정적 표현보다는 발전 가능성에 초점
- 각 섹션은 HTML 형식으로 <div>, <p>, <ul>, <li>, <strong> 태그를 활용하여 가독성 높게 구조화`;

    const userPrompt = `다음 데이터를 기반으로 종합 리포트를 생성해주세요:

=== 검사 기록 (${assessmentSummary.length}건) ===
${JSON.stringify(assessmentSummary, null, 2)}

=== 관찰 일지 (${observationSummary.length}건) ===
${JSON.stringify(observationSummary, null, 2)}

=== AI 상담 기록 (${chatSummary.length}건 메시지) ===
${JSON.stringify(chatSummary.slice(0, 20), null, 2)}

=== 사용자 프로필 ===
${JSON.stringify(profile, null, 2)}

${externalTestImages ? `
=== 외부 기관 검사 결과 분석 ===
${externalTestImages}
` : ''}

${userInput?.recentConcerns ? `
=== 보호자가 작성한 최근 주요 고민 ===
${userInput.recentConcerns}
` : ''}

${userInput?.developmentalNotes ? `
=== 보호자가 관찰한 발달/심리적 특징 ===
${userInput.developmentalNotes}
` : ''}

위 데이터를 종합 분석하여 9가지 섹션의 전문 리포트를 JSON 형식으로 작성해주세요.
응답 형식:
{
  "sections": [
    {
      "title": "발달 종합 평가",
      "content": "<div>상세 HTML 내용...</div>"
    },
    // ... 9개 섹션
  ],
  "summary": "<div>전체 종합 요약 HTML</div>"
}`;

    // Lovable AI 호출
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
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_comprehensive_report',
              description: '9가지 섹션으로 구성된 종합 리포트를 생성합니다.',
              parameters: {
                type: 'object',
                properties: {
                  sections: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        content: { type: 'string' }
                      },
                      required: ['title', 'content']
                    },
                    minItems: 9,
                    maxItems: 9
                  },
                  summary: {
                    type: 'string',
                    description: '전체 리포트의 종합 요약'
                  }
                },
                required: ['sections', 'summary'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'generate_comprehensive_report' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI 응답 오류:', aiResponse.status, errorText);
      
      // 크레딧 부족 에러 처리
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'LOVABLE_AI_CREDITS_INSUFFICIENT',
            message: 'Lovable AI 크레딧이 부족합니다. 워크스페이스 설정에서 크레딧을 충전해주세요.'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 402
          }
        );
      }

      // 레이트 리미트 에러 처리
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: 'LOVABLE_AI_RATE_LIMITED',
            message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429
          }
        );
      }
      
      throw new Error(`AI 분석 실패: ${aiResponse.status}`);
    }

    // 응답 파싱을 견고하게 처리 (빈 본문, 잘린 JSON, SSE 라인 등)
    let aiData: any = null;
    const rawText = await aiResponse.text();
    try {
      if (rawText && rawText.trim()) {
        // SSE 형태 가능성 대비: data: ... 라인에서 마지막 JSON 시도
        if (rawText.includes('\ndata: ')) {
          const lines = rawText.split('\n').filter(l => l.startsWith('data: '));
          const last = lines.reverse().find(l => l.trim() !== 'data: [DONE]');
          const jsonStr = last ? last.slice(6).trim() : rawText.trim();
          aiData = JSON.parse(jsonStr);
        } else {
          aiData = JSON.parse(rawText);
        }
      }
    } catch (e) {
      console.error('AI 응답 JSON 파싱 실패, 원문 사용 불가:', e);
      // aiData를 null로 두고 폴백 사용
    }

    if (!aiData) {
      console.warn('AI 응답 본문이 비어있거나 파싱 실패. 폴백 리포트를 사용합니다.');
    }

    console.log('AI 응답(요약 원문):', rawText?.slice(0, 500));

    let reportData;
    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.function?.arguments) {
        reportData = JSON.parse(toolCall.function.arguments);
      } else {
        throw new Error('Tool call not found in AI response');
      }
    } catch (parseError) {
      console.error('AI 응답 파싱 오류:', parseError);
      // 폴백: 기본 구조 생성
      reportData = {
        sections: [
          {
            title: '발달 종합 평가',
            content: '<div class="space-y-4"><p>검사 데이터를 기반으로 종합 분석 중입니다...</p></div>'
          },
          {
            title: '심리 상태 분석',
            content: '<div class="space-y-4"><p>심리 상태를 분석하고 있습니다...</p></div>'
          },
          {
            title: '강점/약점 분석',
            content: '<div class="space-y-4"><p>강점과 약점을 파악하고 있습니다...</p></div>'
          },
          {
            title: '맞춤 활동 제안',
            content: '<div class="space-y-4"><p>맞춤형 활동을 제안하고 있습니다...</p></div>'
          },
          {
            title: '발달 로드맵',
            content: '<div class="space-y-4"><p>발달 로드맵을 작성하고 있습니다...</p></div>'
          },
          {
            title: '또래 비교 분석',
            content: '<div class="space-y-4"><p>또래 비교 분석을 진행하고 있습니다...</p></div>'
          },
          {
            title: '전문가 소견서',
            content: '<div class="space-y-4"><p>전문가 소견을 작성하고 있습니다...</p></div>'
          },
          {
            title: '가족 지원 가이드',
            content: '<div class="space-y-4"><p>가족 지원 가이드를 준비하고 있습니다...</p></div>'
          },
          {
            title: '장기 발달 예측',
            content: '<div class="space-y-4"><p>장기 발달을 예측하고 있습니다...</p></div>'
          }
        ],
        summary: '<div><p>종합 리포트가 생성되었습니다. 각 섹션을 확인해주세요.</p></div>'
      };
    }

    // 리포트 저장 (선택사항)
    const { error: saveError } = await supabaseClient
      .from('expert_feedback_requests')
      .insert({
        user_id: user.id,
        request_type: 'comprehensive_report',
        status: 'completed',
        analysis_data: {
          assessmentsCount: assessmentSummary.length,
          observationsCount: observationSummary.length,
          chatMessagesCount: chatSummary.length,
          reportSections: reportData.sections.length
        }
      });

    if (saveError) {
      console.error('리포트 저장 오류:', saveError);
    }

    // HTML 리포트 생성
    const htmlReport = generateReportHTML(reportData, profile);

    return new Response(
      JSON.stringify({
        success: true,
        report: reportData,
        html: htmlReport
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('종합 리포트 생성 오류:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : '리포트 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
