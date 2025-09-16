import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 즉시 리포팅 요청 수신');
    
    // 환경변수 직접 확인
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('🔑 API 키 상태:', apiKey ? `설정됨 (길이: ${apiKey.length})` : '설정되지 않음');
    
    // 요청 본문 파싱
    const { message } = await req.json();
    console.log('📝 메시지 길이:', message?.length || 0);

    // API 키 체크
    if (!apiKey) {
      console.error('❌ OpenAI API 키가 없습니다');
      return new Response(JSON.stringify({
        success: false,
        error: 'API key not found',
        report: '🔍 **설정 오류**\n\nOpenAI API 키가 설정되지 않았습니다.\n관리자에게 문의해주세요.',
        riskLevel: 'medium',
        needsExpertConsultation: true,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    // 메시지 검증
    if (!message || message.trim().length < 10) {
      console.error('❌ 메시지가 너무 짧습니다');
      return new Response(JSON.stringify({
        success: false,
        error: 'Message too short',
        report: '입력한 내용이 너무 짧습니다. 더 자세히 작성해주세요.',
        riskLevel: 'low',
        needsExpertConsultation: false,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    console.log('🤖 OpenAI API 호출 시작');

    // 공통 메시지 구성
    const messages = [
      {
        role: 'system',
        content: `당신은 육아 및 발달 전문 상담가입니다. 
부모의 고민을 듣고 따뜻하고 전문적인 조언을 제공하세요.
항상 "참고용"임을 명시하고, 필요시 전문가 상담을 권하세요.`
      },
      {
        role: 'user',
        content: `다음 육아 고민에 대해 전문적이고 따뜻한 조언을 해주세요:

"${message}"

다음 형식으로 답변해주세요:

🔍 **상황 분석**
현재 상황을 간단히 정리해주세요.

💡 **전문가 관점**
발달심리 전문가 관점에서 해석해주세요.

🎯 **실천 조언**
부모가 바로 실천할 수 있는 구체적인 방법들을 제시해주세요.

📚 **참고 자료**
도움이 될 만한 정보나 활동을 추천해주세요.

💝 **격려의 말**
따뜻한 격려와 지지의 메시지를 전해주세요.

⚠️ 이는 참고용 정보이며 의학적 진단이 아닙니다. 필요시 전문가 상담을 받으시기 바랍니다.`
      }
    ];

    const timeoutMs = 10_000;

    // OpenAI 호출 유틸 (신형 모델 vs 레거시 모델 파라미터 차이 처리)
    const callOpenAI = async (model: string, legacyParams = false) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);
      try {
        const body = legacyParams
          ? { model, messages, max_tokens: 800 } // gpt-4o(-mini) 등 레거시 파라미터
          : { model, messages, max_completion_tokens: 1000 }; // gpt-4.1+ 파라미터

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        console.log('📡 OpenAI 응답 상태:', res.status);

        if (!res.ok) {
          const errorText = await res.text().catch(() => '');
          console.error('❌ OpenAI API 오류:', errorText);
          return { ok: false as const, report: undefined };
        }

        const data = await res.json();
        const report = data?.choices?.[0]?.message?.content as string | undefined;
        return { ok: Boolean(report) as const, report };
      } catch (err) {
        console.error('⚠️ OpenAI 호출 예외:', err);
        return { ok: false as const, report: undefined };
      } finally {
        clearTimeout(timer);
      }
    };

    // 1차: 안정 모델(gpt-4.1)
    console.log('🧪 1차 시도: gpt-4.1-2025-04-14');
    let result = await callOpenAI('gpt-4.1-2025-04-14', false);

    // 2차: 같은 모델로 1회 재시도
    if (!result.ok) {
      console.log('🔁 재시도: gpt-4.1-2025-04-14');
      result = await callOpenAI('gpt-4.1-2025-04-14', false);
    }

    // 3차: 폴백(gpt-4o-mini, 레거시 파라미터 사용)
    if (!result.ok) {
      console.log('🛟 폴백 시도: gpt-4o-mini');
      result = await callOpenAI('gpt-4o-mini', true);
    }

    if (!result.ok || !result.report) {
      console.error('❌ 빈 응답 받음 또는 모든 시도 실패 - 템플릿 폴백 적용');

      // 템플릿 기반 폴백 리포트 생성 (OpenAI 실패 시에도 사용자 경험 보장)
      const fallbackReport = `🔍 **상황 분석**\n${message.slice(0, 200)}\n\n` +
        `💡 **전문가 관점**\n` +
        `- 스트레스 요인을 줄이는 환경 조정이 우선입니다.\n` +
        `- 최근 변화(수면, 식사, 학교/가정 사건)를 점검하세요.\n` +
        `- 반복되는 행동은 신호일 수 있으니 감정 라벨링으로 의미를 파악해 보세요.\n\n` +
        `🎯 **실천 조언**\n` +
        `1) 하루 1회 규칙적 루틴(수면/식사/화장실/놀이) 세우기\n` +
        `2) 공감 대화 스크립트: "+[감정 요약] 그래서 [행동 제안] 해보자"\n` +
        `3) 1주일 체크리스트(빈도/강도/지속시간)로 변화를 기록하기\n\n` +
        `📚 **참고 자료**\n` +
        `- 발달 단계별 감정 코칭 자료\n` +
        `- 학교/지역센터 상담 연계 가이드\n\n` +
        `💝 **격려의 말**\n` +
        `지금처럼 구체적으로 상황을 기록하고 도움을 요청하는 태도는 큰 힘입니다. 작은 변화부터 차근히 시작해도 충분합니다.`;

      // 위험 키워드 체크 (폴백에도 동일 적용)
      const riskKeywords = ['자살', '자해', '죽고싶다', '극심한', '심각한'];
      const hasRisk = riskKeywords.some(keyword => message.toLowerCase().includes(keyword));

      return new Response(JSON.stringify({
        success: true,
        report: fallbackReport,
        riskLevel: hasRisk ? 'high' : 'low',
        needsExpertConsultation: hasRisk || message.length > 200,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    const report = result.report;

    console.log('✅ AI 분석 성공');

    // 위험 키워드 체크
    const riskKeywords = ['자살', '자해', '죽고싶다', '극심한', '심각한'];
    const hasRisk = riskKeywords.some(keyword => 
      message.toLowerCase().includes(keyword) || 
      report.toLowerCase().includes(keyword)
    );

    return new Response(JSON.stringify({
      success: true,
      report: report,
      riskLevel: hasRisk ? 'high' : 'low',
      needsExpertConsultation: hasRisk || message.length > 200,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 예상치 못한 오류:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      report: '🔍 **기술적 오류**\n\n예상치 못한 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      riskLevel: 'medium',
      needsExpertConsultation: true,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
});