import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseServiceClient = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const requestBody = await req.json();
    const { observationData, domain, ageGroup, observerInfo } = requestBody;
    
    console.log('Observation data received:', JSON.stringify(observationData, null, 2));
    
    // Input validation
    if (!observationData || typeof observationData !== 'object') {
      return new Response(JSON.stringify({ error: '유효하지 않은 관찰 데이터입니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 토큰 차감 처리 (관찰일지 분석은 5토큰)
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

    console.log(`관찰일지 분석 - 토큰 차감: ${tokenCost}, 잔액: ${tokenData.current_tokens - tokenCost}`);

    console.log('Analyzing observation data:', { domain, ageGroup, dataKeys: Object.keys(observationData) });

    const analysisPrompt = getAnalysisPrompt(domain, ageGroup, observationData, observerInfo);

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
            content: getSystemPrompt(domain)
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_completion_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Calculate overall scores and risk levels
    const scores = calculateScores(observationData);
    const riskLevel = determineRiskLevel(scores, domain);

    // Generate recommendations
    const recommendations = generateRecommendations(scores, domain, analysis);

    console.log('Analysis completed:', { riskLevel, scoresCount: Object.keys(scores).length });

    return new Response(JSON.stringify({
      analysis,
      scores,
      riskLevel,
      recommendations,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in observation-analyzer function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      analysis: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      riskLevel: 'medium'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSystemPrompt(domain: string): string {
  const prompts = {
    child_development: `당신은 아동발달 전문가입니다. 
- 발달심리학적 관점에서 아동의 현재 발달 상태를 분석해주세요.
- 연령별 발달 규준과 비교하여 해석하고, 강점과 지원이 필요한 영역을 구분해주세요.
- 발달 지연이나 우려사항이 있다면 조기개입의 중요성을 강조하되, 진단적 표현은 피해주세요.`,

    psychology: `당신은 임상심리사입니다.
- 심리상담 과정에서 관찰된 내담자의 변화와 현재 상태를 전문적으로 분석해주세요.
- 치료적 관점에서 진전사항과 개선이 필요한 영역을 제시하고, 향후 치료 방향을 제안해주세요.
- 모든 분석은 관찰 기반 참고자료임을 명시하고, 의학적 진단은 피해주세요.`,

    elderly_care: `당신은 노인전문간호사입니다.
- 노인의 인지기능, 일상생활능력, 정서적 웰빙을 종합적으로 평가해주세요.
- 노화 과정의 정상 범위와 병리적 변화를 구분하여 설명하고, 케어플랜을 제시해주세요.
- 가족과 돌봄제공자를 위한 실용적 조언을 포함해주세요.`,

    workplace: `당신은 산업심리학자입니다.
- 직장 내 적응과 성과를 다차원적으로 분석해주세요.
- 개인의 역량과 조직환경의 상호작용을 고려하여 개선방안을 제시해주세요.
- 업무 효율성과 웰빙의 균형을 고려한 권고사항을 제공해주세요.`,

    learning: `당신은 학습심리 전문가입니다.
- 학습자의 인지적 특성과 학습 패턴을 분석해주세요.
- 학습 효과를 높일 수 있는 개별화된 전략을 제시해주세요.
- 동기 향상과 자기조절 능력 개발을 위한 구체적 방안을 포함해주세요.`,

    family: `당신은 가족상담 전문가입니다.
- 가족 체계적 관점에서 가족 역학과 상호작용 패턴을 분석해주세요.
- 가족의 강점과 자원을 활용한 개선방안을 제시해주세요.
- 각 가족원의 개별적 특성과 전체 가족의 조화를 고려해주세요.`,

    medical: `당신은 재활 전문가입니다.
- 기능적 회복과 적응 과정을 체계적으로 분석해주세요.
- 단계적 재활 목표와 실현 가능한 계획을 제시해주세요.
- 환자와 가족의 심리적 적응도 함께 고려해주세요.`
  };

  return prompts[domain as keyof typeof prompts] || prompts.psychology;
}

function getAnalysisPrompt(domain: string, ageGroup: string, data: any, observerInfo: any): string {
  const isAdult = ageGroup === 'adult' || ageGroup === '성인';
  
  return `
다음 관찰 데이터를 전문가적 관점에서 분석해주세요:

**관찰 영역**: ${domain}
**연령대**: ${ageGroup}
**관찰자**: ${observerInfo?.name || '익명'}
**관찰 기간**: ${observerInfo?.period || '미명시'}

**관찰 결과**:
${JSON.stringify(data, null, 2)}

**분석 요청사항**:

1. **${isAdult ? '현재 상태' : '발달 상태'} 종합 평가**
   - 전체적인 ${isAdult ? '심리적/기능적' : '발달/기능'} 수준
   - 주요 강점 영역
   - 지원이 필요한 영역

2. **세부 영역별 분석**
   - 각 평가 영역의 구체적 해석
   - ${isAdult ? '상황' : '연령/상황'} 적합성 평가
   - 특이사항 및 주의점

3. **${isAdult ? '기능적' : '발달적/기능적'} 고려사항**
   - 현재 수준의 적절성
   ${isAdult ? '- 적응 및 기능 상태' : '- 예상되는 발달 경로'}
   - 잠재적 위험 요인

4. **개입 및 지원 방향**
   - 우선순위별 개입 목표
   - 구체적 지원 전략
   - 환경 조성 방안

5. **모니터링 계획**
   - 재관찰 시기 제안
   - 주요 관찰 포인트
   - 진전도 측정 방법

**중요**: 
- 모든 분석은 관찰 기반 참고자료임을 명시
- 의학적 진단이나 확정적 판단은 피하고 '관찰됨', '시사됨' 등의 표현 사용
- 긍정적이고 희망적인 관점 유지
- 구체적이고 실행 가능한 제안 포함
${isAdult ? '- 성인의 경우 "발달" 용어 대신 "현재 상태", "기능", "적응" 등의 용어 사용' : ''}

한국어로 전문적이면서도 이해하기 쉽게 작성해주세요.
`;
}

function calculateScores(data: any): any {
  const scores: any = {};
  
  for (const [category, items] of Object.entries(data)) {
    if (typeof items === 'object' && items !== null) {
      const categoryScores = Object.values(items as any).filter(v => typeof v === 'number');
      if (categoryScores.length > 0) {
        const average = categoryScores.reduce((a: number, b: number) => a + b, 0) / categoryScores.length;
        scores[category] = {
          average: Math.round(average * 100) / 100,
          total: categoryScores.reduce((a: number, b: number) => a + b, 0),
          count: categoryScores.length,
          items: categoryScores
        };
      }
    }
  }

  return scores;
}

function determineRiskLevel(scores: any, domain: string): string {
  const averages = Object.values(scores).map((s: any) => s.average);
  if (averages.length === 0) return 'medium';
  
  const overallAverage = averages.reduce((a: number, b: number) => a + b, 0) / averages.length;
  
  // Domain-specific risk thresholds
  const thresholds = {
    child_development: { low: 4.0, medium: 3.0 },
    psychology: { low: 3.5, medium: 2.5 },
    elderly_care: { low: 3.5, medium: 2.5 },
    workplace: { low: 3.5, medium: 2.5 },
    learning: { low: 3.5, medium: 2.5 },
    family: { low: 3.5, medium: 2.5 },
    medical: { low: 3.5, medium: 2.5 }
  };

  const threshold = thresholds[domain as keyof typeof thresholds] || thresholds.psychology;
  
  if (overallAverage >= threshold.low) return 'low';
  if (overallAverage >= threshold.medium) return 'medium';
  return 'high';
}

function generateRecommendations(scores: any, domain: string, analysis: string): any[] {
  const recommendations = [];
  
  // Generate domain-specific recommendations based on scores
  for (const [category, data] of Object.entries(scores)) {
    const categoryData = data as any;
    if (categoryData.average < 3.0) {
      recommendations.push({
        category,
        priority: 'high',
        title: `${category} 영역 집중 지원`,
        description: `평균 점수 ${categoryData.average}점으로 집중적인 개입이 필요합니다.`,
        actions: [
          `${category} 관련 전문가 상담`,
          '개별화된 지원 계획 수립',
          '정기적 모니터링 실시'
        ]
      });
    } else if (categoryData.average < 4.0) {
      recommendations.push({
        category,
        priority: 'medium',
        title: `${category} 영역 보완 지원`,
        description: `평균 점수 ${categoryData.average}점으로 보완적 지원이 도움이 됩니다.`,
        actions: [
          `${category} 강화 활동 실시`,
          '환경적 지원 확대',
          '주기적 점검'
        ]
      });
    }
  }

  return recommendations;
}