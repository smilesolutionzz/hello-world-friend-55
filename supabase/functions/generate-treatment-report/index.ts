const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { institutionId, clientUserId, reportType, clientData } = await req.json();

    if (!institutionId || !clientUserId || !clientData) {
      return new Response(
        JSON.stringify({ error: '필수 파라미터가 누락되었습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context from client data
    const sections: string[] = [];

    if (clientData.assessments?.length > 0) {
      const assessmentSummary = clientData.assessments.map((a: any) => 
        `- ${a.test_type || '검사'}: 위험수준 ${a.risk_level || '미정'} (${new Date(a.created_at).toLocaleDateString('ko-KR')})`
      ).join('\n');
      sections.push(`## 심리검사 결과 (${clientData.assessments.length}건)\n${assessmentSummary}`);
    }

    if (clientData.observations?.length > 0) {
      const obsSummary = clientData.observations.slice(0, 5).map((o: any) => 
        `- ${o.session_name || '관찰'}: ${(o.content || o.notes || '').substring(0, 100)}`
      ).join('\n');
      sections.push(`## 관찰일지 (${clientData.observations.length}건)\n${obsSummary}`);
    }

    if (clientData.brain_training?.length > 0) {
      const avgScore = clientData.brain_training.reduce((s: number, b: any) => s + (b.score / b.max_score * 100), 0) / clientData.brain_training.length;
      sections.push(`## 두뇌 훈련 (${clientData.brain_training.length}건)\n평균 점수: ${avgScore.toFixed(1)}%`);
    }

    if (clientData.progress?.length > 0) {
      sections.push(`## 변화 추적 데이터: ${clientData.progress.length}건의 활동 기록`);
    }

    const dataContext = sections.join('\n\n');

    const prompt = `당신은 아동·청소년 발달 및 심리 전문가입니다. 아래 고객 데이터를 분석하여 기관 전문가가 활용할 수 있는 **치료방향 제시 리포트**를 작성하세요.

## 고객 데이터
${dataContext || '데이터 없음'}

## 리포트 요구사항
1. **현재 상태 종합 평가** (위험 영역, 강점 영역 식별)
2. **핵심 발견사항** (데이터 기반 인사이트 3~5개)
3. **추천 치료 방향** (구체적인 개입 전략)
4. **단기 목표** (1~3개월)
5. **장기 목표** (6~12개월)
6. **모니터링 포인트** (추적 관찰 항목)
7. **보호자 협력 가이드** (가정에서의 지원 방안)

리포트는 전문가가 실무에 바로 활용할 수 있도록 구체적이고 실행 가능한 내용으로 작성하세요.
HTML 형식으로 출력하되, 깔끔한 전문 리포트 스타일로 작성하세요.
Noto Sans KR 폰트를 사용하고, 절제된 컬러(#1a1a1a, #2563eb, #dc2626, #059669)만 사용하세요.
이모지는 사용하지 마세요.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aihpro.app',
        'X-Title': 'AIHPRO Treatment Report',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-preview',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    let htmlContent = aiData.choices?.[0]?.message?.content || '';

    // Clean markdown code fences
    htmlContent = htmlContent.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    // Wrap with professional styling
    const fullHtml = `
<div style="font-family: 'Noto Sans KR', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; line-height: 1.8;">
  <div style="border-bottom: 3px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="font-size: 22px; font-weight: 700; margin: 0;">치료방향 제시 리포트</h1>
    <p style="color: #666; font-size: 13px; margin-top: 8px;">
      생성일: ${new Date().toLocaleDateString('ko-KR')} | AIHPRO 기관용 분석 시스템
    </p>
    <p style="color: #999; font-size: 11px; margin-top: 4px;">
      본 리포트는 AI 분석 결과이며, 전문가의 임상 판단을 보조하기 위한 참고 자료입니다.
    </p>
  </div>
  ${htmlContent}
  <div style="border-top: 1px solid #e5e7eb; margin-top: 40px; padding-top: 20px; text-align: center;">
    <p style="color: #999; font-size: 11px;">AIHPRO | aihpro.app | 기관 전용 리포트</p>
  </div>
</div>`;

    return new Response(
      JSON.stringify({ htmlContent: fullHtml }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('치료방향 리포트 생성 오류:', error);
    return new Response(
      JSON.stringify({ error: error.message || '리포트 생성에 실패했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
