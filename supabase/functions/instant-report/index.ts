import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// 환경변수 확인
console.log('🔍 환경변수 확인 중...');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
console.log('🔑 API 키 존재:', openAIApiKey ? '✅ 있음' : '❌ 없음');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    console.log('🚀 즉시 리포팅 시작');
    console.log('📝 받은 메시지:', message);
    console.log('🔑 API 키 확인:', openAIApiKey ? '설정됨' : '없음');

    if (!openAIApiKey) {
      console.error('❌ OpenAI API 키가 설정되지 않음');
      throw new Error('OpenAI API key not configured');
    }

    if (!message || message.trim().length < 10) {
      console.error('❌ 메시지가 너무 짧음');
      throw new Error('Message too short');
    }

    const systemPrompt = `당신은 육아 및 발달 전문 상담가입니다. 
부모의 고민을 듣고 따뜻하고 전문적인 조언을 제공하세요.
항상 "참고용"임을 명시하고, 필요시 전문가 상담을 권하세요.`;

    const userPrompt = `다음 육아 고민에 대해 전문적이고 따뜻한 조언을 해주세요:

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

⚠️ 이는 참고용 정보이며 의학적 진단이 아닙니다. 필요시 전문가 상담을 받으시기 바랍니다.`;

    console.log('🤖 OpenAI API 호출 시작');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.8
      }),
    });

    console.log('📡 OpenAI 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ OpenAI API 오류:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ OpenAI 응답 성공');

    const report = data.choices?.[0]?.message?.content;
    
    if (!report) {
      console.error('❌ 빈 응답');
      throw new Error('Empty response from OpenAI');
    }

    console.log('📄 생성된 리포트 길이:', report.length);

    // 위험 키워드 체크
    const riskKeywords = ['자살', '자해', '죽고싶다', '극심한', '심각한'];
    const hasRisk = riskKeywords.some(keyword => 
      message.toLowerCase().includes(keyword) || 
      report.toLowerCase().includes(keyword)
    );

    const result = {
      success: true,
      report: report,
      riskLevel: hasRisk ? 'high' : 'low',
      needsExpertConsultation: hasRisk || message.length > 200,
      timestamp: new Date().toISOString()
    };

    console.log('🎉 즉시 리포팅 완료');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 즉시 리포팅 오류:', error.message);

    const errorResult = {
      success: false,
      error: error.message,
      report: `🔍 **분석 중 오류 발생**

죄송합니다. 현재 일시적인 기술적 문제로 AI 분석을 완료할 수 없습니다.

💡 **임시 조치**
- 잠시 후 다시 시도해주세요
- 지속적인 문제 발생 시 고객센터로 문의해주세요

🎯 **긴급 상황 시**
- 응급상황: 119
- 정신건강 위기상담: 1577-0199

⚠️ 기술적 문제로 인한 일시적 서비스 제한입니다.`,
      riskLevel: 'medium',
      needsExpertConsultation: true,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 // 클라이언트가 에러를 처리할 수 있도록 200으로 반환
    });
  }
});