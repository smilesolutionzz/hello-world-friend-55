import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Received instant report request for message:', message);

    const analysisPrompt = `
당신은 발달·심리·노인인지·학습·직장적응 전반에 걸친 전문 상담가이자 리포팅 시스템입니다.
사용자의 고민이나 상황을 바탕으로 전문적인 참고용 리포트를 작성하세요.

사용자 고민: "${message}"

⚠️ 반드시 지켜야 할 조건:
- 의학적 "진단"은 하지 말고 "관찰·참고 분석"만 제공
- 리포트는 길이 4~6개 블록으로 나눠서 제공
- 따뜻한 격려 포함
- 불안·자살·응급위험 키워드가 있으면 "전문가 즉시 연결 및 긴급 연락 필요"라고 표시

다음 구조로 리포팅해주세요:

🔍 **상황 분석**
사용자가 입력한 내용을 바탕으로 현재 상황을 간단히 정리해 주세요.

💡 **전문가 관점**
심리상담사·발달심리학자·노인전문간호사 등 관점에서 상황 해석을 2~3줄 제시하세요.

🎯 **구체적 조언**
사용자가 바로 실천할 수 있는 3~4가지 조언을 항목으로 작성하세요.

📚 **추가 정보**
관련된 개념이나 도움이 될 수 있는 자료, 책, 활동을 1~2개 추천하세요.

💝 **격려의 말**
사용자의 노력을 인정하고 희망적인 메시지로 마무리하세요.

**중요사항:**
- 모든 분석은 "참고용"이며 의학적 진단이 아님을 명시
- 전문가 상담이 필요한 경우 권유
- 위기상황 시 즉시 119나 1577-0199 연락하도록 안내

참고용 리포트로 따뜻하고 전문적으로 작성해주세요.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: '당신은 발달·심리·노인인지·학습·직장적응 전반에 걸친 전문 상담가이자 리포팅 시스템입니다. 따뜻하고 전문적인 참고용 분석을 제공하며, 항상 "참고용"임을 명시합니다.'
          },
          { role: 'user', content: analysisPrompt }
        ],
        max_completion_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API Response:', JSON.stringify(data, null, 2));
    
    const report = data.choices?.[0]?.message?.content || '';
    console.log('Extracted report content:', report);
    
    if (!report || report.trim() === '') {
      console.error('Empty report content from OpenAI');
      throw new Error('Empty response from OpenAI API');
    }

    // 위험 키워드 감지
    const riskKeywords = ['자살', '자해', '죽고싶', '극심한', '심각한', '응급'];
    const hasRiskKeywords = riskKeywords.some(keyword => 
      message.toLowerCase().includes(keyword) || report.toLowerCase().includes(keyword)
    );

    console.log('Generated instant report successfully');

    return new Response(JSON.stringify({ 
      report,
      riskLevel: hasRiskKeywords ? 'high' : 'low',
      needsExpertConsultation: message.length > 200 || hasRiskKeywords,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in instant-report function:', error);
    
    // 기본 안전 응답
    const fallbackReport = `🔍 **상황 분석 (참고용)**
고민을 공유해주셔서 감사합니다. 현재 일시적인 분석 장애가 발생했습니다.

💡 **전문가 관점 (참고용)**
모든 육아 고민은 정상적인 과정의 일부입니다. 혼자 고민하지 마시고 전문가와 상담하시는 것을 권장합니다.

🎯 **구체적 조언**
1. 즉시 전문가 상담을 받아보세요
2. 관찰일지를 작성하여 더 정확한 분석을 받으세요
3. 응급상황 시 119 또는 1577-0199에 연락하세요

📚 **추가 정보**
더 상세한 전문가 리포팅을 원하시면 관찰일지 작성을 통해 정밀 분석을 받으실 수 있습니다.

💝 **격려의 말**
육아는 쉽지 않은 여정이지만, 도움을 구하는 것은 현명한 선택입니다. 언제든 전문가의 도움을 받으세요.

⚠️ 이 내용은 참고용이며 의학적 진단이 아닙니다.`;

    return new Response(JSON.stringify({ 
      report: fallbackReport,
      riskLevel: 'medium',
      needsExpertConsultation: true,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});