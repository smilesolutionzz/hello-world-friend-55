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
      padding: 20px;
    }
    .header {
      border-bottom: 3px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      color: #6366f1;
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
      color: #6366f1;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .header .logo .tagline {
      color: #999;
      font-size: 12px;
    }
    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section h2 {
      color: #6366f1;
      border-left: 4px solid #6366f1;
      padding-left: 12px;
      margin-bottom: 15px;
    }
    .summary {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .footer .copyright {
      margin-top: 10px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>종합 발달 리포트</h1>
      <div class="date">${new Date().toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</div>
    </div>
    <div class="logo">
      <div class="site">aihpro.com</div>
      <div class="tagline">AI 심리 분석 전문 플랫폼</div>
    </div>
  </div>

  <div class="summary">
    ${reportData.summary}
  </div>

  ${reportData.sections.map((section: any) => `
    <div class="section">
      <h2>${section.title}</h2>
      ${section.content}
    </div>
  `).join('')}

  <div class="footer">
    <div><strong>aihpro.com</strong> - AI 심리 분석 전문 플랫폼</div>
    <div class="copyright">본 리포트는 AI 기반 분석 결과이며, 전문가 상담을 대체하지 않습니다.</div>
  </div>
</body>
</html>
      `;
    };

    // AI에게 전달할 시스템 프롬프트
    const systemPrompt = `당신은 발달심리학 및 임상심리 전문가입니다. 
사용자의 검사 기록, 관찰 일지, AI 상담 기록을 종합 분석하여 9가지 섹션으로 구성된 전문 리포트를 생성해야 합니다.

각 섹션은 다음 구조를 따라야 합니다:
1. **발달 종합 평가** - 인지·언어·운동·사회성 발달 수준 분석
2. **심리 상태 분석** - 정서적 안정성, 스트레스, 심리 건강 평가
3. **강점/약점 분석** - 현재 강점과 개선이 필요한 영역 파악
4. **맞춤 활동 제안** - 발달 단계에 맞는 구체적 활동 추천
5. **발달 로드맵** - 단기/중기/장기 목표 설정
6. **또래 비교 분석** - 동일 연령대 대비 발달 수준
7. **전문가 소견서** - 전문적 개입 필요성 및 권장사항
8. **가족 지원 가이드** - 부모/보호자를 위한 실천 팁
9. **장기 발달 예측** - 향후 발달 경향 및 잠재력 평가

각 섹션은 HTML 형식으로 작성하되, 구조화되고 읽기 쉽게 작성하세요.
전문적이면서도 따뜻하고 격려하는 톤을 유지하세요.`;

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
      throw new Error(`AI 분석 실패: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI 응답:', JSON.stringify(aiData).substring(0, 500));

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
