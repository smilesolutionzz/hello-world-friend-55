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

serve(async (req) => {
  // Handle CORS preflight requests
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

    const requestBody = await req.json();
    const { results, ageGroup, age } = requestBody;
    
    // Input validation
    if (!results || typeof results !== 'object' || !ageGroup) {
      return new Response(JSON.stringify({ error: '유효하지 않은 요청 데이터입니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // 토큰 차감 처리 (AIH 전문가 창작 검사는 5토큰)
    const tokenCost = 5;
    
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

    console.log(`Token deducted: ${tokenCost}, Remaining: ${tokenData.current_tokens - tokenCost}`);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log('Processing assessment analysis:', { ageGroup, age, resultsCount: Object.keys(results).length });

    // Create detailed analysis prompt based on age group
    const getAnalysisPrompt = (ageGroup: string, age: number, results: any) => {
      const basePrompt = `당신은 경험이 풍부한 임상심리학자이자 심리평가 전문가입니다. 다음 심리검사 결과를 종합적이고 상세하게 분석해주세요.

**검사 대상 정보:**
- 연령군: ${ageGroup === 'infant' ? '유아' : ageGroup === 'child' ? '아동/청소년' : '성인'}
- 나이: ${age}세

**검사 결과:**
${Object.entries(results).map(([key, value]) => `${key}: ${value}점`).join('\n')}

**상세 분석 요청사항:**

1. **현재 심리상태 종합 평가** (300자 이상)
   - 전반적인 정신건강 상태
   - 주요 강점과 취약점 분석
   - 현재 기능 수준 평가

2. **영역별 세부 분석** (400자 이상)
   - 각 영역별 점수 해석
   - 영역 간 상호작용 분석
   - 특이사항 및 주목할 점

3. **발달단계별 특성 및 맥락적 이해** (300자 이상)
   - 연령대별 발달 과제와의 연관성
   - 환경적, 사회적 맥락 고려
   - 문화적 요인 반영

4. **위험요소 및 보호요소 분석** (250자 이상)
   - 현재 및 잠재적 위험요인
   - 보호요인 및 회복력 평가
   - 조기 개입의 필요성

5. **구체적이고 실행 가능한 개선방향** (400자 이상)
   - 단기적 목표 (1-3개월)
   - 중기적 목표 (3-6개월)
   - 장기적 목표 (6개월 이상)
   - 구체적인 실천 방법

6. **가족 및 환경적 지원 방안** (200자 이상)
   - 가족 구성원의 역할
   - 환경 개선 방안
   - 사회적 지원 활용법

7. **전문가 상담 및 추가 평가 권고** (150자 이상)
   - 전문가 상담 필요성 및 시급성
   - 추가 검사 필요 여부
   - 관련 전문기관 연계 방안

**분석 지침:**
- 각 항목별로 충분히 상세하게 기술
- 연령대별 발달 특성을 반영한 전문적 해석
- 객관적이면서도 공감적인 관점 유지
- 구체적이고 실행 가능한 권고사항 제시
- 가족 및 환경적 요인을 종합적으로 고려
- 긍정적 측면과 개선 가능성 강조
- 전문 용어 사용 시 쉬운 설명 병행

**출력 형식:**
전문적이면서도 이해하기 쉬운 한국어로 작성하며, 각 영역을 명확히 구분하여 체계적으로 제시해주세요. 총 2000자 이상의 상세한 분석을 제공해주세요.`;

      if (ageGroup === 'infant') {
        return basePrompt + `

**유아기 특별 고려사항 (추가 분석 요구):**
- 애착 형성 및 기본 신뢰감 발달 상태
- 언어 및 인지 발달 수준과 또래 비교
- 양육자와의 상호작용 패턴 분석
- 기본 생활습관 형성 및 자율성 발달
- 사회성 발달 초기 단계 평가
- 정서 조절 능력 및 안정성
- 놀이 행동 및 창의성 발달
- 신체 발달과 정신 발달의 균형
- 환경 적응력 및 탐색 행동
- 양육 환경의 적절성 평가`;
      } else if (ageGroup === 'child') {
        return basePrompt + `

**아동/청소년기 특별 고려사항 (추가 분석 요구):**
- 학업 성취도 및 학습 동기 분석
- 또래 관계 및 사회적 기술 평가
- 정체성 형성 과정 및 자아개념 발달
- 독립성 vs 의존성 갈등과 해결 방식
- 호르몬 변화 및 신체 발달이 정서에 미치는 영향
- 미래에 대한 불안감 및 진로 고민
- 가족 관계 변화 및 세대 갈등
- 디지털 미디어 사용 패턴 및 영향
- 스트레스 대처 방식 및 회복력
- 도덕성 및 가치관 형성 과정
- 문제 해결 능력 및 판단력 발달`;
      } else {
        return basePrompt + `

**성인기 특별 고려사항 (추가 분석 요구):**
- 직업 및 경력 스트레스와 성취감
- 인간관계(배우자, 친구, 동료) 질과 만족도
- 가족 관계 역할 변화 및 양육 스트레스
- 경제적 부담감 및 재정 관리 능력
- 신체 건강 관리 및 노화에 대한 인식
- 중년기 위기감 및 인생 의미 탐색
- 미래 계획 및 노후 준비 상태
- 사회적 성취와 개인적 만족의 균형
- 라이프스타일 선택 및 가치관 변화
- 스트레스 관리 방식 및 적응 능력
- 자기 개발 및 성장 동기
- 사회적 책임감 및 기여 의식`;
      }
    };

    const analysisPrompt = getAnalysisPrompt(ageGroup, age, results);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o', // 검사 분석용 고품질 모델
        messages: [
          { role: 'system', content: '당신은 임상심리학 전문가입니다. 정확하고 전문적인 심리검사 분석을 제공합니다.' },
          { role: 'user', content: analysisPrompt }
        ],
        max_completion_tokens: 6000,
      }),
    });

    const data = await response.json();
    console.log('OpenAI analysis response received');

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const analysis = data.choices[0].message.content;

    // Calculate risk level based on scores
    const scores = Object.values(results) as number[];
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const maxScore = Math.max(...scores);

    let riskLevel = 'low';
    if (averageScore > 7 || maxScore > 8) {
      riskLevel = 'high';
    } else if (averageScore > 5 || maxScore > 6) {
      riskLevel = 'medium';
    }

    console.log('Analysis completed:', { averageScore, maxScore, riskLevel });

    return new Response(JSON.stringify({
      analysis: analysis,
      riskLevel: riskLevel,
      averageScore: Math.round(averageScore * 10) / 10,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in assessment analyzer function:', error);
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    return new Response(JSON.stringify({ 
      error: message,
      analysis: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      riskLevel: 'medium'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});