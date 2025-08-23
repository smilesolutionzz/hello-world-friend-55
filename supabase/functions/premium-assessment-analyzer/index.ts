import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);

interface AssessmentData {
  assessmentType: string;
  results: Record<string, number>;
  assessmentInfo: any;
  timestamp: string;
}

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

    const { assessmentType, results, assessmentInfo, timestamp }: AssessmentData = await req.json();

    // 토큰 차감 처리 (프리미엄 검사는 8토큰)
    const tokenCost = 8;
    
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
        error: `분석을 위해 ${tokenCost}개의 토큰이 필요합니다. 현재 토큰: ${tokenData.current_tokens}개` 
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

    console.log(`Premium assessment token deducted: ${tokenCost}, Remaining: ${tokenData.current_tokens - tokenCost}`);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    console.log('Processing premium assessment analysis:', {
      assessmentType,
      results,
      assessmentInfo: assessmentInfo.title
    });

    // 결과 점수를 텍스트로 변환
    const scoresText = Object.entries(results)
      .map(([category, score]) => `${category.replace(/_/g, ' ')}: ${score.toFixed(1)}/7.0`)
      .join('\n');

    const averageScore = Object.values(results).reduce((sum, score) => sum + score, 0) / Object.keys(results).length;

    // 검사 타입별 전문 프롬프트 설정
    const getAnalysisPrompt = (type: string) => {
      const basePrompt = `당신은 20년 경력의 임상심리학 박사이자 심리평가 전문가입니다. 다음 프리미엄 심리검사 결과를 최고 수준의 전문가적 관점에서 매우 상세하고 심층적으로 분석해주세요.

검사명: ${assessmentInfo.title}
검사 설명: ${assessmentInfo.description}
검사 일시: ${new Date(timestamp).toLocaleString('ko-KR')}

=== 검사 결과 ===
${scoresText}
평균 점수: ${averageScore.toFixed(1)}/7.0

=== 전문가 수준 심층 분석 요청 (최소 3000자) ===

1. **종합 소견 및 전체적 평가** (500자 이상)
   - 전체적인 심리적 기능 수준과 성향 종합 평가
   - 주요 강점과 독특한 특징의 구체적 분석
   - 개선이 필요한 영역의 상세한 식별
   - 개인의 전반적 적응 수준과 잠재력 평가

2. **영역별 정밀 분석** (각 영역당 200자 이상, 총 800자 이상)
   - 각 측정 영역별 점수의 구체적이고 전문적 해석
   - 점수의 임상적 의미와 심리학적 함의
   - 일상생활, 대인관계, 업무/학업에서의 구체적 영향
   - 영역별 개인차의 특성과 의미

3. **심리학적 통찰 및 역동성 분석** (400자 이상)
   - 영역 간 상호작용 패턴의 깊이 있는 분석
   - 개인의 심리적 역동성과 내적 갈등 구조 해석
   - 성격적 특성과 행동 패턴의 근본적 이해
   - 잠재적 위험 요소와 보호 요소의 균형 분석

4. **발달적 관점과 생애주기적 이해** (300자 이상)
   - 현재 발달 단계에서의 과제와 특성
   - 생애사적 맥락에서의 현재 위치 평가
   - 과거 경험이 현재에 미치는 영향 분석
   - 미래 발달 가능성과 방향성 예측

5. **맞춤형 성장 전략 및 구체적 실행 방안** (500자 이상)
   - 개인 특성에 맞는 구체적 성장 전략
   - 단기(1-3개월), 중기(3-6개월), 장기(1년 이상) 목표 설정
   - 일상에서 실천 가능한 구체적 방법들
   - 환경 조성 및 관계 개선 방안
   - 스트레스 관리 및 자기계발 방향

6. **전문적 권고사항 및 추가 평가 제안** (300자 이상)
   - 전문가 상담의 필요성과 적절한 치료적 접근법
   - 추가 심리검사나 평가의 필요성
   - 정신건강 관리 및 예방적 접근 방안
   - 가족이나 주변인의 역할과 지원 방법

7. **장기적 관점과 지속적 관리 계획** (200자 이상)
   - 장기적 심리적 건강 유지 방향
   - 정기적 재평가와 모니터링 계획
   - 변화 추적을 위한 핵심 지표들
   - 생활 패턴 개선 및 유지 전략

**작성 지침:**
- 전문적이면서도 이해하기 쉬운 언어 사용
- 구체적이고 실행 가능한 조언 제공
- 개인의 고유성과 복잡성 인정
- 희망적이고 건설적인 관점 유지
- 총 분석 내용 3000자 이상으로 상세하게 작성
- 검사의 한계를 인정하되, 최대한 깊이 있는 통찰 제공`;

      // 검사 유형별 특화 프롬프트 추가
      switch (type) {
        case 'personality_type':
          return basePrompt + `

**성격 유형 검사 특별 분석 요구사항:**
- 4가지 성격 차원(외향성, 감각/직관, 사고/감정, 판단/인식) 간의 균형과 불균형의 정밀 분석
- 각 차원별 강도와 일관성, 상황별 변화 가능성 평가
- 직업적 적합성과 경력 발달 방향의 구체적 제시
- 인간관계 스타일과 의사소통 패턴의 심층 분석
- 성격 유형별 스트레스 요인과 대처 방식의 개별화된 평가
- 개인 성장과 균형 발달을 위한 맞춤형 전략 제시`;

        case 'temperament':
          return basePrompt + `

**특별 고려사항:**
- 타고난 기질적 특성과 후천적 발달 가능성 분석
- 기질 조합에 따른 독특한 행동 패턴 해석
- 기질적 강점 활용과 약점 보완 전략 제시`;

        case 'cognitive':
          return basePrompt + `

**특별 고려사항:**
- 인지기능 영역별 상대적 강약점 분석
- 일상생활 및 사회활동에 미치는 영향 평가
- 인지 기능 유지 및 향상을 위한 구체적 방법 제시`;

        case 'work_stress':
          return basePrompt + `

**특별 고려사항:**
- 직장 내 스트레스 원인과 번아웃 위험도 분석
- 업무 효율성과 만족도 개선 방안
- 일-삶 균형 회복을 위한 실천적 전략 제시`;

        case 'relationship':
          return basePrompt + `

**특별 고려사항:**
- 애착 패턴이 관계에 미치는 영향 분석
- 건강한 관계 형성을 위한 구체적 방법
- 갈등 해결과 친밀감 증진 전략 제시`;

        default:
          return basePrompt;
      }
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: '당신은 20년 경력의 임상심리학 전문가입니다. 심리검사 결과를 전문적이면서도 이해하기 쉽게 해석하는 것이 전문 분야입니다. 깊이 있는 통찰과 실용적인 조언을 제공합니다.'
          },
          {
            role: 'user',
            content: getAnalysisPrompt(assessmentType)
          }
        ],
        max_completion_tokens: 5000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI API response received successfully');

    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      analysis,
      metadata: {
        assessmentType,
        averageScore: averageScore.toFixed(1),
        timestamp,
        generatedAt: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in premium-assessment-analyzer function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: `AI 분석 생성 중 오류가 발생했습니다. 

기본 해석:
검사 결과를 바탕으로 한 기본적인 피드백을 제공합니다. 각 영역의 점수를 참고하여 개인의 특성을 이해하고, 필요한 경우 전문가와 상담하시기 바랍니다.

전문가 상담을 통해 더 정확하고 개인화된 해석을 받으실 수 있습니다.`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});