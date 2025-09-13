import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 사용자 인증 확인
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const requestBody = await req.json();
    const { assessmentType, ageGroup, scores, totalScore, severityLevel, adhdSubtype, answers } = requestBody;

    if (!assessmentType || !scores) {
      throw new Error('Assessment type and scores are required');
    }

    // 토큰 차감 (프리미엄 분석은 더 많은 토큰 소모)
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('current_tokens')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData || tokenData.current_tokens < 15) {
      throw new Error('Insufficient tokens for premium analysis');
    }

    await supabase
      .from('user_tokens')
      .update({ current_tokens: tokenData.current_tokens - 15 })
      .eq('user_id', user.id);

    // OpenAI API 호출을 위한 상세한 프롬프트 생성
    const analysisPrompt = `
당신은 ADHD 전문 임상심리학자로서, 다음 프리미엄 ADHD 정밀검사 결과를 종합적으로 분석해주세요.

## 검사 정보
- 검사 유형: ${assessmentType}
- 연령군: ${ageGroup}
- 총점: ${totalScore}점
- 심각도: ${severityLevel}
- ADHD 유형: ${adhdSubtype}

## 영역별 점수
- 부주의 증상: ${scores.inattention}점
- 과잉행동 증상: ${scores.hyperactivity}점  
- 충동성 증상: ${scores.impulsivity}점
- 실행기능 장애: ${scores.executiveDysfunction}점
- 동반증상 위험도: ${scores.comorbidity}점
- 기능적 손상 수준: ${scores.functionalImpairment}점

## 분석 요청사항
다음 형식으로 상세한 분석을 제공해주세요:

### 1. 종합 평가
- 전반적인 ADHD 증상 수준과 특성
- DSM-5 기준에 따른 진단적 고려사항
- 주요 강점과 취약점

### 2. 영역별 세부 분석
- 부주의 증상의 특징과 일상생활 영향
- 과잉행동/충동성 증상의 패턴
- 실행기능 장애의 구체적 양상
- 동반증상 위험도와 주의점

### 3. 연령별 특성 고려
- ${ageGroup}에서 나타나는 특징적 양상
- 발달 단계를 고려한 증상 해석
- 연령대별 주요 과제와 도전

### 4. 일상생활 영향 분석
- 학업/직업 기능에 미치는 영향
- 대인관계 및 사회적 기능
- 자존감과 정서적 측면

### 5. 맞춤형 관리 방향
- 우선적으로 개선이 필요한 영역
- 구체적인 일상생활 관리 전략
- 강점을 활용한 보상 체계

### 6. 전문적 치료 권고
- 약물치료 고려사항
- 행동치료/인지행동치료 적용
- 부모/가족 교육의 중요성
- 교육적 지원 방안

### 7. 장기적 예후와 관리
- 생애주기별 관리 포인트
- 동반질환 예방 전략
- 자기관리 능력 향상 방안

분석은 전문적이면서도 이해하기 쉽게 작성하고, 희망적이고 건설적인 관점을 유지해주세요.
`;

    console.log('Calling OpenAI API for premium ADHD analysis...');

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
            content: '당신은 ADHD 전문 임상심리학자입니다. 검사 결과를 바탕으로 종합적이고 심층적인 분석을 제공하며, 개인별 맞춤 관리 방향을 구체적으로 제시합니다.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_completion_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0]?.message?.content;

    if (!analysis) {
      throw new Error('No analysis generated');
    }

    console.log('Premium ADHD analysis generated successfully');

    return new Response(JSON.stringify({
      analysis,
      timestamp: new Date().toISOString(),
      assessmentType,
      totalScore,
      severityLevel,
      adhdSubtype
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in premium-adhd-analyzer function:', error);
    
    // fallback 분석 제공
    const fallbackAnalysis = `
프리미엄 ADHD 정밀검사 결과 분석

귀하의 검사 결과를 바탕으로 다음과 같이 분석됩니다:

## 종합 평가
검사 결과는 ADHD 증상의 다양한 측면을 평가한 결과입니다. 정확한 진단과 치료 계획 수립을 위해서는 전문의와의 상담이 필요합니다.

## 주요 권고사항
1. 전문의 진료를 통한 정확한 진단
2. 개별 특성에 맞는 치료 계획 수립
3. 일상생활 관리 전략 개발
4. 가족 및 주변 지원 체계 구축

이 결과는 참고용이며, 전문가와의 상담을 통해 정확한 평가와 치료 방향을 결정하시기 바랍니다.
`;

    return new Response(JSON.stringify({
      analysis: fallbackAnalysis,
      timestamp: new Date().toISOString(),
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});