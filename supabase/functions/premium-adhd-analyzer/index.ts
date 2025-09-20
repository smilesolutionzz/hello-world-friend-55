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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseKey!);
    console.log('[PREMIUM-ADHD-ANALYZER] 요청 시작');

    const { answers, ageGroup, severity, total, average, userId }: ADHDAnalysisRequest = await req.json();
    
    console.log('[PREMIUM-ADHD-ANALYZER] 분석 시작:', {
      answersCount: answers.length,
      ageGroup,
      severity,
      total,
      average
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

    // ADHD 문항별 분석 준비
    const adhdDomains = [
      { name: '주의력 결핍', items: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      { name: '과잉행동', items: [10, 11, 12, 13, 14, 15, 16, 17, 18] },
      { name: '충동성', items: [19, 20, 21, 22, 23, 24, 25, 26, 27] },
      { name: '감정조절', items: [28, 29, 30, 31, 32, 33] },
      { name: '실행기능', items: [34, 35, 36, 37, 38, 39] },
      { name: '사회적 기능', items: [40, 41, 42, 43, 44, 45] }
    ];

    // 도메인별 점수 계산
    const domainScores = adhdDomains.map(domain => {
      const domainAnswers = domain.items.map(item => answers[item - 1] || 0);
      const domainTotal = domainAnswers.reduce((sum, score) => sum + score, 0);
      const domainAverage = domainTotal / domainAnswers.length;
      const domainPercentage = (domainAverage / 4) * 100; // 4점 만점 기준

      return {
        name: domain.name,
        score: domainTotal,
        average: domainAverage,
        percentage: domainPercentage,
        severity: domainPercentage >= 75 ? '높음' : 
                 domainPercentage >= 50 ? '중간' : 
                 domainPercentage >= 25 ? '낮음' : '매우낮음',
        items: domain.items,
        answers: domainAnswers
      };
    });

    // AI 프롬프트 구성
    const analysisPrompt = `
당신은 ADHD 전문 정신과 의사입니다. 다음 ADHD 평가 결과를 바탕으로 2000자 이상의 상세한 전문 분석을 작성해주세요.

## 평가 결과 데이터:
- 연령군: ${ageGroup}
- 전체 심각도: ${severity}
- 총점: ${total}/180점
- 평균: ${average}/4점
- 전체 백분율: ${((average / 4) * 100).toFixed(1)}%

## 도메인별 상세 점수:
${domainScores.map(domain => `
**${domain.name}**
- 점수: ${domain.score}/${domain.items.length * 4}점
- 평균: ${domain.average.toFixed(2)}/4점  
- 백분율: ${domain.percentage.toFixed(1)}%
- 심각도: ${domain.severity}
- 응답 패턴: [${domain.answers.join(', ')}]
`).join('\n')}

## 분석 요구사항:
1. **임상적 해석** (500자 이상): DSM-5 기준에 따른 ADHD 진단 관점에서의 종합적 해석
2. **도메인별 상세 분석** (각 도메인당 200자 이상): 
   - 주의력 결핍 영역 분석
   - 과잉행동 영역 분석  
   - 충동성 영역 분석
   - 감정조절 영역 분석
   - 실행기능 영역 분석
   - 사회적 기능 영역 분석
3. **연령별 특성 고려** (300자 이상): ${ageGroup}에 따른 ADHD 증상의 특징적 양상
4. **일상생활 영향 분석** (300자 이상): 학습, 업무, 대인관계 등에 미치는 구체적 영향
5. **개입 방안 및 치료 권고** (400자 이상): 
   - 행동치료 전략
   - 인지행동치료 접근
   - 약물치료 고려사항
   - 환경적 개선방안
6. **장기 예후 및 관리방안** (300자 이상): 생애주기별 관리 전략

반드시 의학적 근거를 바탕으로 정확하고 전문적인 분석을 제공하며, 각 도메인의 점수와 연결하여 구체적인 설명을 포함해주세요.
총 2000자 이상으로 작성하되, 전문적이면서도 이해하기 쉽게 설명해주세요.
`;

    // OpenAI API 호출
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
      message: error.message || 'ADHD 분석 중 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});