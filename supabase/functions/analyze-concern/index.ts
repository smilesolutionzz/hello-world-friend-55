import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { concern } = await req.json();
    
    if (!concern || concern.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: '최소 10자 이상의 고민을 입력해주세요.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('고민 분석 요청:', concern.substring(0, 100) + '...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `당신은 아동 발달 및 심리 분석 전문가입니다. 
부모가 입력한 고민을 분석하여 다음 형식의 JSON으로 응답해주세요:

{
  "type": "고민 유형 (예: 언어발달, 사회성, 정서, 학습, 행동 등)",
  "severity": "심각도 (low, medium, high)",
  "confidence": 분석 신뢰도 (70-95 사이의 숫자),
  "advice": "200자 이내의 간단한 조언",
  "recommendedTests": [
    {"name": "추천 검사명", "path": "/assessment/검사경로"}
  ]
}

중요 지침:
- 공감적이고 따뜻한 톤으로 작성
- 불필요한 불안감을 주지 않도록 주의
- 전문적이지만 이해하기 쉽게 설명
- 반드시 유효한 JSON 형식으로만 응답`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `부모의 고민: ${concern}` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API 오류:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI 크레딧이 부족합니다.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('AI 응답이 비어있습니다');
    }

    console.log('AI 응답 수신 완료');

    // Parse JSON from response
    let analysisResult;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      // Fallback response
      analysisResult = {
        type: '일반 상담',
        severity: 'low',
        confidence: 75,
        advice: '입력하신 고민에 대해 더 자세한 상담이 필요합니다. 전문가와 상담을 권장드립니다.',
        recommendedTests: [
          { name: '종합 발달 검사', path: '/assessment/development' },
          { name: '심리 상태 검사', path: '/assessment/psychology' }
        ]
      };
    }

    console.log('분석 완료:', analysisResult.type, analysisResult.severity);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('분석 오류:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다',
        type: '분석 오류',
        severity: 'low',
        confidence: 0,
        advice: '일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        recommendedTests: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
