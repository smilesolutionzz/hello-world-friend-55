import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 사용자 인증 확인
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: '인증이 필요합니다' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 사용자 정보 가져오기
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      return new Response(JSON.stringify({ error: '유효하지 않은 사용자입니다' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { results, assessmentType, childAge, childGender } = await req.json();

    if (!results || !assessmentType) {
      return new Response(JSON.stringify({ error: '검사 결과 데이터가 없습니다' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 토큰 차감 (프리미엄 분석: 10토큰)
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('current_tokens')
      .eq('user_id', user.id)
      .single();

    if (tokenError) {
      console.error('토큰 조회 오류:', tokenError);
      return new Response(JSON.stringify({ error: '토큰 정보를 가져올 수 없습니다' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!tokenData || tokenData.current_tokens < 10) {
      return new Response(JSON.stringify({ error: '토큰이 부족합니다. 프리미엄 분석에는 10토큰이 필요합니다.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 토큰 차감
    const { error: deductError } = await supabase
      .from('user_tokens')
      .update({ current_tokens: tokenData.current_tokens - 10 })
      .eq('user_id', user.id);

    if (deductError) {
      console.error('토큰 차감 오류:', deductError);
      return new Response(JSON.stringify({ error: '토큰 차감에 실패했습니다' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 분석 프롬프트 구성
    const analysisPrompt = `
당신은 아동발달심리학과 부모교육 전문가입니다. 아래 부모양육태도 검사 결과를 바탕으로 과학적이고 실용적인 분석을 제공해주세요.

## 검사 정보
- 검사명: 프리미엄 부모양육태도 검사
- 자녀 연령: ${childAge || '미입력'}세
- 자녀 성별: ${childGender || '미입력'}
- 측정 영역: 온정수용, 행동통제, 심리통제, 자율성지지, 의사소통지지

## 검사 결과 점수
${Object.entries(results).map(([category, score]) => {
  const categoryNames: Record<string, string> = {
    warmth_acceptance: '온정수용',
    behavioral_control: '행동통제', 
    psychological_control: '심리통제',
    autonomy_support: '자율성지지',
    communication_support: '의사소통지지'
  };
  return `${categoryNames[category] || category}: ${score}점`;
}).join('\n')}

## 분석 요청사항
다음 형식으로 상세한 분석을 제공해주세요:

### 1. 양육태도 종합평가
- 전반적인 양육태도 패턴과 특징
- 5개 영역 점수의 균형성 평가
- 양육태도 유형 분류 (권위적, 허용적, 방임적, 민주적 등)

### 2. 영역별 세부분석
각 영역에 대해:
- 현재 수준 평가
- 강점과 개선점
- 자녀 발달에 미치는 영향

### 3. 자녀발달 영향 예측
- 현재 양육태도가 자녀에게 미칠 수 있는 긍정적/부정적 영향
- 연령별 특이사항 (해당 연령 고려)
- 정서, 인지, 사회성 발달에 대한 영향

### 4. 맞춤형 양육 가이드
- 즉시 실천 가능한 구체적 방법 5가지
- 장기적 양육 목표와 전략
- 상황별 대응 방법

### 5. 전문가 조언
- 양육 스트레스 관리 방법
- 부부간 양육태도 일치 방안
- 전문적 도움이 필요한 경우

분석은 따뜻하고 격려적인 톤으로, 부모의 노력을 인정하면서도 건설적인 개선 방향을 제시해주세요.
구체적이고 실용적인 조언을 포함하여 일상에서 바로 적용할 수 있는 내용으로 작성해주세요.
`;

    // OpenAI API 호출
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
            content: '당신은 아동발달심리학과 부모교육 분야의 최고 전문가입니다. 과학적 근거와 실용적 조언을 균형있게 제공하며, 부모들에게 희망과 방향을 제시하는 전문가입니다.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_completion_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API 오류:', errorData);
      throw new Error(`OpenAI API 오류: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      analysis,
      timestamp: new Date().toISOString(),
      assessmentType,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('부모양육태도 분석 오류:', error);
    
    // 에러 발생 시 기본 분석 제공
    const fallbackAnalysis = `
## 양육태도 검사 결과 분석

검사를 완료해주셔서 감사합니다. 현재 시스템 오류로 인해 상세 분석을 제공하지 못하고 있습니다.

### 일반적인 양육 가이드

**온정적 양육태도**
- 아이의 감정을 이해하고 공감해주세요
- 따뜻한 말과 행동으로 사랑을 표현하세요
- 실수에 대해서도 성장의 기회로 여겨주세요

**일관된 행동지도**
- 명확하고 일관된 규칙을 세워주세요
- 아이가 이해할 수 있는 수준으로 설명하세요
- 긍정적 강화를 통해 바람직한 행동을 격려하세요

**자율성 지원**
- 아이가 스스로 선택할 기회를 제공하세요
- 실패를 통해 배울 수 있도록 지켜봐 주세요
- 아이의 의견을 존중하고 함께 논의하세요

전문적인 분석이 필요하시다면 아동발달센터나 부모교육 전문가와 상담하시기 바랍니다.
`;

    return new Response(JSON.stringify({ 
      analysis: fallbackAnalysis,
      timestamp: new Date().toISOString(),
      error: '분석 중 오류가 발생했습니다. 기본 가이드를 제공합니다.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});