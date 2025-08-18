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
    
    console.log('=== INSTANT REPORT DEBUG ===');
    console.log('API Key exists:', !!openAIApiKey);
    console.log('API Key prefix:', openAIApiKey?.substring(0, 7));
    console.log('Message received:', message);

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const analysisPrompt = `다음 육아 고민에 대해 전문 상담가 관점에서 분석해주세요:

"${message}"

다음 형식으로 답변해주세요:

🔍 **상황 분석 (참고용)**
현재 상황을 간단히 정리해주세요.

💡 **전문가 관점 (참고용)**
발달심리학자 관점에서 2-3줄로 해석해주세요.

🎯 **구체적 조언**
실천 가능한 3-4가지 조언을 제시해주세요.

📚 **추가 정보**
도움이 될 수 있는 자료나 활동을 1-2개 추천해주세요.

💝 **격려의 말**
따뜻한 격려 메시지로 마무리해주세요.

⚠️ 이 내용은 참고용이며 의학적 진단이 아닙니다.`;

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: '당신은 발달심리 및 육아 전문 상담가입니다. 따뜻하고 전문적인 조언을 제공하되, 항상 "참고용"임을 명시하세요.'
          },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 800,
        temperature: 0.7
      }),
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI API success:', data.choices?.[0]?.message?.content ? 'Got content' : 'No content');
    
    const report = data.choices?.[0]?.message?.content;
    
    if (!report || report.trim() === '') {
      console.error('Empty report from OpenAI');
      throw new Error('Empty response from OpenAI');
    }

    // 위험 키워드 감지
    const riskKeywords = ['자살', '자해', '죽고싶', '극심한', '심각한', '응급'];
    const hasRiskKeywords = riskKeywords.some(keyword => 
      message.toLowerCase().includes(keyword) || report.toLowerCase().includes(keyword)
    );

    console.log('Successfully generated report');

    return new Response(JSON.stringify({ 
      report,
      riskLevel: hasRiskKeywords ? 'high' : 'low',
      needsExpertConsultation: message.length > 200 || hasRiskKeywords,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== ERROR IN INSTANT REPORT ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    // 에러 발생시 기본 응답
    const errorReport = `🔍 **상황 분석 (참고용)**
고민을 공유해주셔서 감사합니다. 현재 시스템 오류로 인해 일시적인 분석 제한이 있습니다.

💡 **전문가 관점 (참고용)**
언어 발달과 관련된 고민은 많은 부모들이 경험하는 자연스러운 과정입니다. 전문가와의 상담을 통해 정확한 평가를 받으시길 권합니다.

🎯 **구체적 조언**
1. 소아과 또는 언어치료 전문가에게 상담을 받아보세요
2. 아이와의 일상 대화를 늘려주세요
3. 책 읽기나 노래 부르기 등을 함께 해보세요
4. 아이의 말을 재촉하지 말고 기다려주세요

📚 **추가 정보**
언어발달지연에 대한 정확한 평가는 전문가를 통해 받으실 수 있습니다. 조기 발견과 적절한 지원이 중요합니다.

💝 **격려의 말**
아이의 발달을 세심하게 관찰하고 계시는 부모님의 마음이 느껴집니다. 전문가의 도움을 받아 아이에게 최선의 지원을 해주세요.

⚠️ 이 내용은 참고용이며 의학적 진단이 아닙니다.`;

    return new Response(JSON.stringify({ 
      report: errorReport,
      riskLevel: 'medium',
      needsExpertConsultation: true,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});