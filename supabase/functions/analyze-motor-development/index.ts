import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results, answers, ageInMonths } = await req.json();
    
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const ageYears = Math.floor(ageInMonths / 12);
    const ageMonthsRemainder = ageInMonths % 12;

    const prompt = `
당신은 소아재활의학과 전문의 15년 경력과 아동운동발달 박사학위를 보유한 전문가입니다.
아래 아동의 운동발달 자가체크 결과를 바탕으로 임상심리사급 상세 분석 리포트를 작성해주세요.

## 아동 정보
- 연령: ${ageYears}세 ${ageMonthsRemainder}개월 (총 ${ageInMonths}개월)

## 검사 결과 요약
- 종합 발달점수: ${results.percentage}점 (100점 만점)
- 발달 판정: ${results.developmentLevel}
- 평가 문항 수: ${results.questionCount}개

## 영역별 세부 점수 (100점 만점)
- 이동운동(걷기, 뛰기, 점프 등): ${results.categoryScores.locomotor}점
- 물체조작(던지기, 받기, 차기 등): ${results.categoryScores.object_control}점
- 균형감각(한 발 서기, 평균대 등): ${results.categoryScores.balance}점
- 협응력(줄넘기, 리듬 움직임 등): ${results.categoryScores.coordination}점
- 소근육(그립, 가위질, 블록 조립 등): ${results.categoryScores.fine_motor || 0}점

## 분석된 강점: ${results.strengths.join(', ') || '해당없음'}
## 지원필요 영역: ${results.weaknesses.join(', ') || '해당없음'}

---

위 결과를 바탕으로 아래 6개 섹션으로 구성된 **1000-1500자**의 전문가 수준 분석 리포트를 작성해주세요:

### 1. 종합 발달 평가 (200자)
- 해당 연령 발달 기준(Denver II, PDMS-2 등 참고)과 비교한 종합 평가
- 전체적인 운동발달 수준과 특성 설명

### 2. 대근육 발달 분석 (200자)
- 이동운동, 균형감각, 협응력 영역의 통합 분석
- 연령 대비 발달 상태와 특징적인 패턴

### 3. 소근육 발달 분석 (150자)
- 손과 손가락의 정교한 움직임 발달 상태
- 학습 준비도 및 일상생활 기능과의 연관성

### 4. 물체조작 능력 분석 (150자)
- 공 던지기, 받기, 차기 등 도구 사용 능력
- 스포츠 활동 및 또래 놀이 참여 가능성

### 5. 구체적 가정 활동 프로그램 (200자)
- 약한 영역 강화를 위한 놀이 활동 5가지 (이름, 방법, 효과 포함)
- 연령에 적합한 실내/실외 활동 제안

### 6. 전문가 상담 가이드 (100자)
- 추가 평가가 필요한 경우 권고사항
- 소아재활의학과, 발달센터 등 전문기관 안내

⚠️ 주의: 따뜻하고 격려하는 톤으로 작성하되, 전문적 근거에 기반한 구체적인 정보를 제공해주세요.
각 섹션은 반드시 ### 헤더로 구분하고, 부모님이 바로 실천할 수 있는 실용적 조언을 포함해주세요.
`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
        messages: [
          {
            role: 'system',
            content: `당신은 소아재활의학과 전문의 15년 경력과 아동운동발달학 박사학위를 보유한 전문가입니다.
Denver II, PDMS-2, TGMD-3 등 표준화된 발달검사 도구에 대한 깊은 이해를 바탕으로 
부모님께 아이의 운동발달 상태를 전문적이면서도 이해하기 쉽게 설명합니다.
구체적인 가정 활동 프로그램을 제안하며, 필요시 전문기관 연계를 안내합니다.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable API Error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-motor-development:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        analysis: null 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
