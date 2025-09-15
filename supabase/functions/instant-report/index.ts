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

    // OpenAI API 호출
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07', // AIH 즉시 리포팅용 고품질 모델
        messages: [
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
        ],
        max_completion_tokens: 1000
      }),
    });

    console.log('📡 OpenAI 응답 상태:', openaiResponse.status);

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
    const report = data.choices?.[0]?.message?.content;

    if (!report) {
      console.error('❌ 빈 응답 받음');
      return new Response(JSON.stringify({
        success: false,
        error: 'Empty response',
        report: 'AI 분석 결과가 생성되지 않았습니다. 다시 시도해주세요.',
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