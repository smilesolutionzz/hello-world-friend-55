import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user info from Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseServiceClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: '유효하지 않은 토큰입니다.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { constitution, scores, answers } = await req.json();

    // 크레딧 소진은 프론트엔드에서 처리 완료
    console.log('[SASANG-ANALYZER] 크레딧 확인은 프론트엔드에서 처리됨');

    console.log('[SASANG-ANALYZER] 사상체질 분석 시작:', { constitution, scores });

    const constitutionNames = {
      soyang: '소양인',
      soeum: '소음인', 
      taeyang: '태양인',
      taeeum: '태음인'
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
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

이 결과를 바탕으로 다음 내용을 포함한 종합 분석을 반드시 2,500자 이상으로 상세하게 해주세요:

## 1. 체질 진단 종합 해석 (400자 이상)
- 진단된 체질의 핵심 특성과 현재 상태
- 각 체질 점수 비율 해석 (주체질, 부체질 가능성)
- 체질 확정도와 신뢰도 분석

## 2. 체질별 맞춤 식이요법 (400자 이상)
- 적극 권장 음식 (구체적 음식명 10가지 이상)
- 반드시 피해야 할 음식 (구체적 음식명 5가지 이상)
- 체질에 맞는 식사법과 식습관
- 계절별 추천 식단

## 3. 생활습관 및 운동 가이드 (400자 이상)
- 체질에 맞는 운동 유형과 강도
- 수면, 목욕, 스트레스 관리법
- 일상 루틴 개선 방안

## 4. 주의 질환 및 건강 위험 요인 (300자 이상)
- 체질별 취약 장기와 주의 질환
- 조기 경고 신호와 예방법
- 만성질환 예방 전략

## 5. 한방 치료 및 보양 가이드 (300자 이상)
- 추천 한약재와 차(茶)
- 침, 뜸, 부항 등 치료 방향
- 계절별 보양법

## 6. 📋 요약 및 생활 실천 체크리스트 (300자 이상)
- 핵심 체질 특성 3줄 요약
- 오늘부터 실천할 수 있는 건강 습관 5가지
- 정기 건강 검진 권장 항목

각 섹션을 반드시 300자 이상으로 풍부하게 작성하세요. 마크다운 형식 사용.`
          }
        ],
        max_tokens: 4000,
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
      error: error instanceof Error ? error.message : 'Unknown error',
      analysis: '분석 중 오류가 발생했습니다. 기본 체질 정보를 참고해주세요.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});