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
        content: `다음 육아 고민에 대해 전문적이고 따뜻한 조언을 해주세요:\n\n"${message}"\n\n다음 형식으로 답변해주세요:\n\n🔍 **상황 분석**\n현재 상황을 간단히 정리해주세요.\n\n💡 **전문가 관점**\n발달심리 전문가 관점에서 해석해주세요.\n\n🎯 **실천 조언**\n부모가 바로 실천할 수 있는 구체적인 방법들을 제시해주세요.\n\n📚 **참고 자료**\n도움이 될 만한 정보나 활동을 추천해주세요.\n\n💝 **격려의 말**\n따뜻한 격려와 지지의 메시지를 전해주세요.\n\n⚠️ 이는 참고용 정보이며 의학적 진단이 아닙니다. 필요시 전문가 상담을 받으시기 바랍니다.`
      }
    ];

    // 1차: 최신 모델(gpt-5 계열) - max_completion_tokens 사용, temperature 제거
    let openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages,
        max_completion_tokens: 1000,
      }),
    });

    console.log('📡 OpenAI 1차 응답 상태:', openaiResponse.status);

    // 1차 실패 시: 레거시 안정 모델(gpt-4o-mini)로 폴백 - max_tokens, temperature 사용
    if (!openaiResponse.ok) {
      const firstError = await openaiResponse.text();
      console.error('❌ 1차 시도 오류:', firstError);

      openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });
      console.log('📡 OpenAI 2차(폴백) 응답 상태:', openaiResponse.status);
    }

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('❌ OpenAI API 오류:', errorText);
      
      return new Response(JSON.stringify({
        success: false,
        error: `OpenAI API error: ${openaiResponse.status}`,
        report: '🔍 **일시적 오류**\n\nAI 분석 서비스에 일시적인 문제가 발생했습니다.\n잠시 후 다시 시도해주세요.',
        riskLevel: 'medium',
        needsExpertConsultation: true,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    const data = await openaiResponse.json();

    // 견고한 응답 추출 로직 (여러 포맷 지원)
    let report: string | undefined = data?.choices?.[0]?.message?.content;
    if (!report) {
      const maybeContent = data?.choices?.[0]?.message?.content;
      if (Array.isArray(maybeContent)) {
        try {
          const textParts = maybeContent
            .map((p: any) => typeof p === 'string' ? p : (p?.text ?? p?.output_text ?? p?.content ?? ''))
            .filter(Boolean)
            .join('\n')
            .trim();
          if (textParts) report = textParts;
        } catch { /* noop */ }
      }
      if (!report && data?.choices?.[0]?.text) {
        report = data.choices[0].text;
      }
    }

    // 2차 재시도: gpt-4.1 (새 모델 계열, temperature 미사용)
    if (!report) {
      console.warn('⚠️ 빈 응답 - gpt-4.1로 재시도');
      const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages,
          max_completion_tokens: 900,
        }),
      });
      console.log('📡 OpenAI 2차(gpt-4.1) 응답 상태:', retryResponse.status);
      if (retryResponse.ok) {
        const retryData = await retryResponse.json();
        report = retryData?.choices?.[0]?.message?.content || retryData?.choices?.[0]?.text;
      }
    }

    // 3차 재시도: gpt-4o-mini (레거시 안정 모델)
    if (!report) {
      console.warn('⚠️ 빈 응답 - gpt-4o-mini로 최종 재시도');
      const legacyResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.7,
          max_tokens: 900,
        }),
      });
      console.log('📡 OpenAI 3차(gpt-4o-mini) 응답 상태:', legacyResponse.status);
      if (legacyResponse.ok) {
        const legacyData = await legacyResponse.json();
        report = legacyData?.choices?.[0]?.message?.content || legacyData?.choices?.[0]?.text;
      }
    }

    if (!report) {
      console.error('❌ 모든 모델에서 빈 응답');
      return new Response(JSON.stringify({
        success: false,
        error: 'Empty response from all models',
        report: 'AI 분석 결과가 생성되지 않았습니다. 잠시 후 다시 시도해주세요.',
        riskLevel: 'medium',
        needsExpertConsultation: true,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

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