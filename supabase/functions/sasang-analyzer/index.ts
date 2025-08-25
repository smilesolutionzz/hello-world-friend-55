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
    const { constitution, scores, answers } = await req.json();

    console.log('[SASANG-ANALYZER] 사상체질 분석 시작:', { constitution, scores });

    const constitutionNames = {
      soyang: '소양인',
      soeum: '소음인', 
      taeyang: '태양인',
      taeeum: '태음인'
    };

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
            content: `당신은 한의학 전문가입니다. 사상체질 진단 결과를 바탕으로 개인화된 분석을 제공해주세요.

사상체질별 특성:
- 소양인: 열이 많고 활동적, 위열사냉(상열하냉), 신강비약
- 소음인: 차가운 성질, 소화기 허약, 비신양허
- 태양인: 머리가 크고 허리가 약함, 간대폐소, 하체 약함  
- 태음인: 체격이 크고 살이 잘 참, 간소폐대, 순환기 주의

한의원에서 활용할 수 있도록 실용적이고 구체적인 정보를 제공해주세요.`
          },
          {
            role: 'user',
            content: `진단 결과: ${constitutionNames[constitution as keyof typeof constitutionNames]}
체질별 점수: ${JSON.stringify(scores)}
응답 내용: ${JSON.stringify(answers)}

이 결과를 바탕으로 다음 내용을 포함한 종합 분석을 해주세요:

1. 진단된 체질의 특성과 현재 상태 해석
2. 체질에 맞는 구체적인 식이요법 (음식명 포함)
3. 생활습관 개선 방안
4. 주의해야 할 증상과 질병
5. 한의원 치료 시 고려사항
6. 계절별 건강관리법

전문적이면서도 이해하기 쉽게 500-800자로 작성해주세요.`
          }
        ],
        max_completion_tokens: 1000
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[SASANG-ANALYZER] OpenAI API 오류:', data);
      throw new Error(data.error?.message || 'OpenAI API 오류');
    }

    const analysis = data.choices[0].message.content;
    
    console.log('[SASANG-ANALYZER] 분석 완료:', { analysisLength: analysis.length });

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[SASANG-ANALYZER] 오류:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: '분석 중 오류가 발생했습니다. 기본 체질 정보를 참고해주세요.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});