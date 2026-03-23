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

    // 토큰 차감 처리 (한의학 테스트는 2토큰)
    const tokenCost = 2;
    
    // 현재 토큰 잔액 확인
    const { data: tokenData, error: tokenError } = await supabaseServiceClient
      .from('user_tokens')
      .select('current_tokens, total_used')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ 
        error: '토큰 정보를 확인할 수 없습니다.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (tokenData.current_tokens < tokenCost) {
      return new Response(JSON.stringify({ 
        error: `한의학 체질 분석을 위해 ${tokenCost}개의 토큰이 필요합니다. 현재 토큰: ${tokenData.current_tokens}개` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 토큰 차감
    const { error: updateError } = await supabaseServiceClient
      .from('user_tokens')
      .update({ 
        current_tokens: tokenData.current_tokens - tokenCost,
        total_used: tokenData.total_used + tokenCost 
      })
      .eq('user_id', user.id);

    if (updateError) {
      throw new Error('토큰 차감 중 오류가 발생했습니다.');
    }

    console.log(`Han medicine test token deducted: ${tokenCost}, Remaining: ${tokenData.current_tokens - tokenCost}`);

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
        model: 'google/gemini-3-flash-preview',
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
        max_tokens: 1000,
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