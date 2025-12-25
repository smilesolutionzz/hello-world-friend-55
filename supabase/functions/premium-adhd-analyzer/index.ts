import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ADHDAnalysisRequest {
  answers: number[];
  ageGroup: string;
  severity: string;
  total: number;
  average: number;
  userId?: string;
  scores?: {
    inattention: number;
    hyperactivity: number;
    impulsivity: number;
    executiveDysfunction: number;
    comorbidity: number;
    functionalImpairment: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    console.log('[PREMIUM-ADHD-ANALYZER] 요청 시작');

    const { answers, ageGroup, severity, total, average, userId, scores }: ADHDAnalysisRequest = await req.json();
    
    console.log('[PREMIUM-ADHD-ANALYZER] 분석 시작:', {
      answersCount: answers.length,
      ageGroup,
      severity,
      total,
      average,
      scores
    });

    // 토큰 확인 및 차감
    if (userId) {
      const { data: userTokens } = await supabase
        .from('user_tokens')
        .select('current_tokens, total_used')
        .eq('user_id', userId)
        .single();

      if (!userTokens || userTokens.current_tokens < 8) {
        console.log('[PREMIUM-ADHD-ANALYZER] 토큰 부족:', userTokens?.current_tokens || 0);
        return new Response(JSON.stringify({ 
          error: 'insufficient_tokens',
          required: 8,
          available: userTokens?.current_tokens || 0,
          message: '토큰이 부족합니다. ADHD 전문 분석에는 8토큰이 필요합니다.'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // 토큰 차감
      const { error: tokenError } = await supabase
        .from('user_tokens')
        .update({ 
          current_tokens: userTokens.current_tokens - 8,
          total_used: userTokens.total_used + 8
        })
        .eq('user_id', userId);

      if (tokenError) {
        console.error('[PREMIUM-ADHD-ANALYZER] 토큰 차감 실패:', tokenError);
        throw new Error('토큰 차감에 실패했습니다.');
      }

      console.log(`ADHD 전문 분석 - 토큰 차감: 8, 잔액: ${userTokens.current_tokens - 8}`);
    }

    // 프리미엄 ADHD 검사 영역별 점수 (실제 점수 사용)
    const domainScores = scores ? [
      {
        name: '부주의',
        score: scores.inattention,
        maxScore: 200,
        percentage: (scores.inattention / 200) * 100,
        severity: scores.inattention >= 150 ? '매우 높음' : 
                 scores.inattention >= 100 ? '높음' : 
                 scores.inattention >= 50 ? '보통' : '낮음'
      },
      {
        name: '과잉행동',
        score: scores.hyperactivity,
        maxScore: 200,
        percentage: (scores.hyperactivity / 200) * 100,
        severity: scores.hyperactivity >= 150 ? '매우 높음' : 
                 scores.hyperactivity >= 100 ? '높음' : 
                 scores.hyperactivity >= 50 ? '보통' : '낮음'
      },
      {
        name: '충동성',
        score: scores.impulsivity,
        maxScore: 200,
        percentage: (scores.impulsivity / 200) * 100,
        severity: scores.impulsivity >= 150 ? '매우 높음' : 
                 scores.impulsivity >= 100 ? '높음' : 
                 scores.impulsivity >= 50 ? '보통' : '낮음'
      },
      {
        name: '실행기능',
        score: scores.executiveDysfunction,
        maxScore: 200,
        percentage: (scores.executiveDysfunction / 200) * 100,
        severity: scores.executiveDysfunction >= 150 ? '매우 높음' : 
                 scores.executiveDysfunction >= 100 ? '높음' : 
                 scores.executiveDysfunction >= 50 ? '보통' : '낮음'
      },
      {
        name: '동반증상',
        score: scores.comorbidity,
        maxScore: 100,
        percentage: (scores.comorbidity / 100) * 100,
        severity: scores.comorbidity >= 75 ? '매우 높음' : 
                 scores.comorbidity >= 50 ? '높음' : 
                 scores.comorbidity >= 25 ? '보통' : '낮음'
      },
      {
        name: '기능수준',
        score: scores.functionalImpairment,
        maxScore: 100,
        percentage: (scores.functionalImpairment / 100) * 100,
        severity: scores.functionalImpairment >= 75 ? '매우 높음' : 
                 scores.functionalImpairment >= 50 ? '높음' : 
                 scores.functionalImpairment >= 25 ? '보통' : '낮음'
      }
    ] : [];

    // AI 프롬프트 구성 - 프리미엄 검사에 걸맞는 초정밀 분석
    const analysisPrompt = `
당신은 ADHD 전문 정신과 의사이자 신경심리학 박사입니다. 다음 ADHD 평가 결과를 바탕으로 3000자 이상의 매우 상세하고 심층적인 전문 분석을 작성해주세요.

⚠️ 중요: 이것은 프리미엄 유료 검사입니다. 반드시 3000자 이상의 상세한 전문가 분석을 제공해야 합니다!

## 평가 결과 데이터:
- 연령군: ${ageGroup}
- 전체 심각도: ${severity}
- 총점: ${total}/180점
- 평균: ${average}/4점
- 전체 백분율: ${((average / 4) * 100).toFixed(1)}%

## 도메인별 상세 점수:
${domainScores.map(domain => `
**${domain.name}**
- 점수: ${domain.score}/${domain.maxScore}점
- 백분율: ${domain.percentage.toFixed(1)}%
- 심각도: ${domain.severity}
`).join('\n')}

## 분석 요구사항 (각 섹션별 최소 글자 수 엄격 준수!):

### 1. 🧠 전문가 종합해석 (600자 이상 필수!):
- DSM-5 기준에 따른 ADHD 진단 관점에서의 종합적 해석
- 검사 결과가 시사하는 신경발달학적 의미
- 전체적인 ADHD 프로파일 분석과 임상적 함의
- 해당 연령대에서의 증상 특성과 일상생활 영향

### 2. 📊 도메인별 심층 분석 (각 도메인당 250자 이상): 
   - **부주의/주의력 결핍 영역**: 집중력, 작업기억, 지속적 주의력 분석
   - **과잉행동 영역**: 신체적 활동성, 안절부절못함, 억제 곤란
   - **충동성 영역**: 반응 억제, 지연 혐오, 의사결정 특성
   - **실행기능 영역**: 계획, 조직화, 시간관리, 작업기억 분석
   - **동반증상**: 정서조절, 불안, 우울 경향성 평가
   - **기능수준**: 학업/직업, 대인관계, 일상생활 기능 평가

### 3. 👤 연령별 맞춤 분석 (400자 이상): 
- ${ageGroup}에 따른 ADHD 증상의 발현 특성
- 해당 발달 단계에서의 핵심 과제와 도전
- 연령 특수적 강점과 취약점

### 4. 🏠 일상생활 영향 분석 (400자 이상): 
- 학습/업무 환경에서의 구체적 영향
- 대인관계와 사회적 상호작용 영향
- 가정생활과 일상 루틴 관리 측면

### 5. 💊 개입 방안 및 치료 권고 (500자 이상): 
   - 행동치료 및 인지행동치료 전략
   - 환경 조정 및 구조화 방안
   - 약물치료 고려사항과 전문가 상담 권고
   - 가족 개입 및 교육적 지원 방안

### 6. 📈 장기 예후 및 관리방안 (400자 이상): 
- 생애주기별 관리 전략
- 강점 기반 발달 전략
- 장기적 목표와 희망적 전망

### 7. ✨ 요약 및 제언 (500자 이상 필수!):
   - 핵심 발견사항 요약 (5-6줄)
   - 즉시 실행 가능한 구체적 권장사항 5가지
   - 전문가 상담 필요성 판단 및 권고
   - 따뜻하고 격려적인 메시지 (부모님/본인에게)

⚠️ 반드시 의학적 근거와 최신 ADHD 연구를 바탕으로 정확하고 전문적인 분석을 제공하세요.
⚠️ 총 3000자 이상으로 작성하되, 전문적이면서도 이해하기 쉽게 설명하세요.
⚠️ 각 섹션을 명확히 구분하고, 구체적인 예시와 실용적인 조언을 풍부하게 포함하세요.
`;

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '당신은 ADHD 전문 정신과 의사로서, 과학적 근거에 바탕한 정확하고 상세한 임상 분석을 제공합니다. DSM-5 기준과 최신 ADHD 연구를 바탕으로 전문적인 평가를 수행합니다.'
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
      console.error('[PREMIUM-ADHD-ANALYZER] OpenAI API 오류:', errorData);
      throw new Error(`OpenAI API 오류: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log(`[PREMIUM-ADHD-ANALYZER] 분석 완료, 텍스트 길이: ${analysis.length}`);

    // 분석 결과와 도메인 점수 반환
    const result = {
      analysis,
      domainScores,
      metadata: {
        analysisDate: new Date().toISOString(),
        tokensUsed: 8,
        analysisLength: analysis.length,
        ageGroup,
        severity,
        totalScore: total,
        averageScore: average
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[PREMIUM-ADHD-ANALYZER] 오류:', error);
    return new Response(JSON.stringify({ 
      error: 'analysis_failed',
      message: error instanceof Error ? error.message : 'ADHD 분석 중 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});