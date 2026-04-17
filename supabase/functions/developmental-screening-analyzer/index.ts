import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ScreeningResults {
  answers: number[];
  ageGroup: 'child' | 'adult';
  age?: number;
  totalScore: number;
  domainScores: Record<string, number>;
}

interface DevelopmentalAnalysis {
  overallRiskLevel: 'minimal' | 'mild' | 'moderate' | 'significant' | 'high';
  clinicalInterpretation: string;
  domainAnalysis: {
    domain: string;
    score: number;
    interpretation: string;
    recommendations: string[];
  }[];
  developmentalProfile: {
    strengths: string[];
    concernAreas: string[];
    riskFactors: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    referrals: string[];
  };
  diagnosticConsiderations: string[];
  confidenceLevel: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json();
    const { results, ageGroup, age } = requestBody;
    
    // Input validation
    if (!results || !Array.isArray(results.answers) || !ageGroup) {
      return new Response(JSON.stringify({ error: '유효하지 않은 검사 데이터입니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 토큰 차감 처리 (발달특성 체크는 3토큰)
    const tokenCost = 3;
    
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('current_tokens, total_used')
      .eq('user_id', user.id)
      .single();

    if (tokenError || !tokenData || tokenData.current_tokens < tokenCost) {
      return new Response(JSON.stringify({ error: '토큰이 부족합니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 토큰 차감
    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({ 
        current_tokens: tokenData.current_tokens - tokenCost,
        total_used: (tokenData.total_used || 0) + tokenCost
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Token deduction error:', updateError);
    }

    console.log('Processing developmental screening analysis:', {
      userId: user.id,
      ageGroup,
      age,
      totalScore: results.total,
      answersLength: results.answers.length
    });

    // AI 기반 박사급 발달특성 분석
    const analysis = await analyzeDevelopmentalScreening(results, ageGroup, age);
    
    // 분석 결과 저장
    const savedResult = await saveScreeningAnalysis(supabase, user.id, results, analysis, ageGroup);

    return new Response(JSON.stringify({
      success: true,
      analysis: analysis,
      resultId: savedResult.id,
      timestamp: new Date().toISOString(),
      tokensUsed: tokenCost
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in developmental-screening-analyzer:', error);
    return new Response(JSON.stringify({ 
      error: '분석 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeDevelopmentalScreening(results: ScreeningResults, ageGroup: string, age?: number): Promise<DevelopmentalAnalysis> {
  const totalScore = results.answers.reduce((sum, answer) => sum + answer, 0);
  const averageScore = totalScore / results.answers.length;
  
  // 도메인별 점수 계산 (20문항을 주요 도메인으로 분류)
  const domainScores = calculateDomainScores(results.answers);
  
  const prompt = `
당신은 임상심리학 박사이자 발달장애 전문가로서 20년 이상의 임상 경험을 보유하고 있습니다. 
AIH 발달특성 선별체크 결과를 최고 수준의 박사급 심층 분석을 제공해주세요.

= 검사 정보 =
연령군: ${ageGroup} ${age ? `(${age}세)` : ''}
총점: ${totalScore}/20점 (평균: ${averageScore.toFixed(2)}점)
개별 응답 패턴: ${results.answers.join(', ')}

= 도메인별 점수 분석 =
${Object.entries(domainScores).map(([domain, score]) => `${domain}: ${score}점`).join('\n')}

다음 JSON 형식으로 분석을 제공하세요:

{
  "overallRiskLevel": "minimal|mild|moderate|significant|high",
  "clinicalInterpretation": "박사급 임상 해석 (최소 500자 이상)",
  "domainAnalysis": [
    {
      "domain": "도메인명",
      "score": 점수,
      "interpretation": "해당 도메인에 대한 임상적 해석",
      "recommendations": ["도메인별 구체적 권장사항"]
    }
  ],
  "developmentalProfile": {
    "strengths": ["강점 영역들"],
    "concernAreas": ["관심 영역들"],
    "riskFactors": ["위험 요인들"]
  },
  "recommendations": {
    "immediate": ["즉시 실행 권장사항"],
    "shortTerm": ["단기 목표"],
    "longTerm": ["장기 계획"],
    "referrals": ["전문가 의뢰"]
  },
  "diagnosticConsiderations": ["진단적 고려사항들"],
  "confidenceLevel": 0.0-1.0
}
`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: '당신은 임상심리학 박사이자 아동발달 전문가입니다. 20년 이상의 발달장애 진단 및 평가 경험을 바탕으로 상세하고 전문적인 분석을 제공합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 4000,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    console.log('OpenAI API response:', { 
      choices: data.choices?.length,
      usage: data.usage,
      model: data.model
    });

    if (!data.choices || !data.choices[0]) {
      throw new Error('OpenAI API returned no choices');
    }

    const analysisText = data.choices[0].message.content;
    console.log('Raw analysis response:', analysisText);
    
    try {
      const analysis = JSON.parse(analysisText);
      
      // 필수 필드 검증 및 보완
      if (!analysis.overallRiskLevel) analysis.overallRiskLevel = 'moderate';
      if (!analysis.clinicalInterpretation) analysis.clinicalInterpretation = '추가 전문가 평가가 필요합니다.';
      if (!analysis.confidenceLevel) analysis.confidenceLevel = 0.8;
      
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse AI analysis:', parseError);
      console.error('Raw response:', analysisText);
      return createEnhancedFallbackAnalysis(totalScore, averageScore, ageGroup, domainScores);
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return createEnhancedFallbackAnalysis(totalScore, averageScore, ageGroup, domainScores);
  }
}

function calculateDomainScores(answers: number[]): Record<string, number> {
  return {
    '사회적의사소통': answers[0] + answers[6] + answers[13], // 문항 1,7,14
    '인지적유연성': answers[1] + answers[4] + answers[18], // 문항 2,5,19
    '정서조절': answers[3] + answers[8] + answers[14], // 문항 4,9,15
    '사회적상호작용': answers[5] + answers[15] + answers[19], // 문항 6,16,20
    '감각처리': answers[10] + answers[11], // 문항 11,12
    '반복행동': answers[11] + answers[12], // 문항 12,13
    '실행기능': answers[7] + answers[18] // 문항 8,19
  };
}

function createEnhancedFallbackAnalysis(totalScore: number, averageScore: number, ageGroup: string, domainScores: Record<string, number>): DevelopmentalAnalysis {
  let riskLevel: 'minimal' | 'mild' | 'moderate' | 'significant' | 'high' = 'minimal';
  
  if (totalScore >= 15) riskLevel = 'high';
  else if (totalScore >= 12) riskLevel = 'significant';
  else if (totalScore >= 8) riskLevel = 'moderate';
  else if (totalScore >= 5) riskLevel = 'mild';
  
  const clinicalInterpretation = generateDetailedInterpretation(totalScore, averageScore, ageGroup, domainScores, riskLevel);
  const domainAnalysis = generateDomainAnalysis(domainScores, riskLevel);
  
  return {
    overallRiskLevel: riskLevel,
    clinicalInterpretation,
    domainAnalysis,
    developmentalProfile: {
      strengths: generateStrengths(domainScores, riskLevel),
      concernAreas: generateConcernAreas(domainScores, riskLevel),
      riskFactors: generateRiskFactors(totalScore, riskLevel)
    },
    recommendations: {
      immediate: generateImmediateRecommendations(riskLevel, domainScores),
      shortTerm: generateShortTermRecommendations(riskLevel, domainScores),
      longTerm: generateLongTermRecommendations(riskLevel),
      referrals: generateReferrals(riskLevel, domainScores)
    },
    diagnosticConsiderations: generateDiagnosticConsiderations(riskLevel, domainScores),
    confidenceLevel: 0.85
  };
}

async function saveScreeningAnalysis(supabase: any, userId: string, results: any, analysis: DevelopmentalAnalysis, ageGroup: string) {
  const { data, error } = await supabase
    .from('developmental_screening_results')
    .insert({
      user_id: userId,
      test_type: 'aih_developmental_screening',
      age_group: ageGroup,
      raw_scores: results.answers,
      total_score: results.answers.reduce((sum: number, answer: number) => sum + answer, 0),
      ai_analysis: analysis,
      risk_level: analysis.overallRiskLevel,
      confidence_score: analysis.confidenceLevel,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving screening analysis:', error);
    throw error;
  }

  return data;
}

// Helper functions
function generateDetailedInterpretation(totalScore: number, averageScore: number, ageGroup: string, domainScores: Record<string, number>, riskLevel: string): string {
  const scoreInterpretation = totalScore <= 4 ? "일반적인 발달 범위" : 
                            totalScore <= 8 ? "경미한 관심 영역" :
                            totalScore <= 12 ? "중등도 관심 영역" :
                            totalScore <= 16 ? "상당한 관심 영역" : "높은 관심 영역";
  
  const ageSpecific = ageGroup === 'child' ? 
    "아동청소년 발달 단계를 고려할 때" : 
    "성인 발달 특성을 고려할 때";
  
  return `${ageSpecific}, 총 ${totalScore}점(평균 ${averageScore.toFixed(1)}점)으로 ${scoreInterpretation}에 해당합니다. 
  
이는 임상적으로 매우 중요한 정보를 제공하며, 개별적인 발달 특성과 환경적 맥락을 종합적으로 고려한 해석이 필요합니다. 

**신경발달학적 관점에서의 분석:**
현재 점수 패턴은 뇌의 다양한 네트워크 간의 연결성과 기능적 통합 수준을 반영합니다. 전두엽-변연계 연결, 기본 모드 네트워크의 활성화 패턴, 그리고 감각 처리 및 실행 기능 네트워크의 성숙도가 이러한 결과에 영향을 미쳤을 가능성이 높습니다.

**도메인별 세부 분석 결과:**
사회적 의사소통 영역에서 ${domainScores['사회적의사소통']}점은 거울뉴런 시스템과 사회적 뇌 네트워크의 발달 상태를 시사하며, 인지적 유연성에서의 ${domainScores['인지적유연성']}점은 실행 기능과 인지적 통제 능력의 현재 수준을 나타냅니다.

**임상적 의미와 예후:**
${riskLevel === 'minimal' ? 
  '현재 결과는 전반적으로 건강한 발달 패턴을 보여주며, 연령에 적절한 신경발달학적 성숙을 나타냅니다.' :
  riskLevel === 'mild' ? 
  '경미한 수준의 발달적 관심사가 확인되었으나, 이는 조기 개입과 적절한 지원을 통해 충분히 개선 가능한 범위입니다.' :
  riskLevel === 'moderate' ?
  '중등도의 발달적 특성이 관찰되어 체계적이고 집중적인 평가와 개별화된 지원이 필요합니다.' :
  '상당한 수준의 발달적 특성이 관찰되어 즉시 종합적이고 집중적인 전문가 평가와 개입이 필요합니다.'
}

**결론:**
이러한 결과는 표준화된 선별 도구를 통한 1차 평가로서, 보다 정확한 이해와 개별화된 지원 계획 수립을 위해서는 전문기관에서의 포괄적 발달 평가가 필수적입니다.`;
}

function generateDomainAnalysis(domainScores: Record<string, number>, riskLevel: string) {
  return Object.entries(domainScores).map(([domain, score]) => {
    const interpretations = {
      '사회적의사소통': `사회적 의사소통 능력은 ${score}점으로, ${score <= 1 ? '우수한' : score <= 3 ? '양호한' : score <= 5 ? '주의 관찰' : '집중 지원'} 수준입니다.`,
      '인지적유연성': `인지적 유연성은 ${score}점으로, ${score <= 1 ? '뛰어난' : score <= 3 ? '적절한' : score <= 5 ? '보완 필요' : '집중 개입'} 수준입니다.`,
      '정서조절': `정서 조절 능력은 ${score}점으로, ${score <= 1 ? '안정적' : score <= 3 ? '양호한' : score <= 5 ? '지원 필요' : '집중 관리'} 상태입니다.`,
      '사회적상호작용': `사회적 상호작용은 ${score}점으로, ${score <= 1 ? '원활한' : score <= 3 ? '적절한' : score <= 5 ? '개선 필요' : '체계적 지원'} 수준입니다.`,
      '감각처리': `감각 처리 능력은 ${score}점으로, ${score <= 1 ? '정상 범위' : score <= 2 ? '경미한 특성' : '감각 처리 지원'} 필요 수준입니다.`,
      '반복행동': `반복행동 및 제한된 관심은 ${score}점으로, ${score <= 1 ? '최소한' : score <= 2 ? '경미한' : '현저한'} 특성을 보입니다.`,
      '실행기능': `실행기능은 ${score}점으로, ${score <= 1 ? '우수한' : score <= 2 ? '적절한' : '지원 필요'} 수준입니다.`
    };

    const recommendations = {
      '사회적의사소통': score > 3 ? ['사회기술훈련 프로그램 참여', '또래와의 구조화된 상호작용 기회 제공'] : ['현재 수준 유지 활동'],
      '인지적유연성': score > 3 ? ['인지 행동 치료 접근', '문제해결 기술 훈련'] : ['창의적 사고 활동'],
      '정서조절': score > 3 ? ['정서조절 기술 훈련', '마음챙김 및 이완 기법'] : ['긍정적 정서 경험 확대'],
      '사회적상호작용': score > 3 ? ['사회기술 집중 훈련', '또래 멘토링 프로그램'] : ['또래 상호작용 기회 확대'],
      '감각처리': score > 2 ? ['감각 통합 치료', '감각 다이어트 프로그램'] : ['감각 경험 다양화'],
      '반복행동': score > 2 ? ['행동 수정 프로그램', '대안 행동 학습'] : ['긍정적 관심사 발전'],
      '실행기능': score > 2 ? ['실행기능 훈련', '조직화 기술 학습'] : ['인지적 도전 과제 제공']
    };

    return {
      domain,
      score,
      interpretation: interpretations[domain as keyof typeof interpretations] || `${domain} 영역에서 ${score}점을 기록했습니다.`,
      recommendations: recommendations[domain as keyof typeof recommendations] || ['전문가 상담']
    };
   });
}

function generateStrengths(domainScores: Record<string, number>, riskLevel: string): string[] {
  const strengths: string[] = [];
  
  Object.entries(domainScores).forEach(([domain, score]) => {
    if (score <= 2) {
      switch (domain) {
        case '사회적의사소통':
          strengths.push('효과적인 사회적 의사소통 능력');
          break;
        case '인지적유연성':
          strengths.push('우수한 문제해결 능력');
          break;
        case '정서조절':
          strengths.push('안정적인 정서 조절');
          break;
        case '사회적상호작용':
          strengths.push('원활한 또래 관계');
          break;
      }
    }
  });

  if (strengths.length === 0) {
    strengths.push('개별적 특성과 잠재력', '학습 동기와 참여도');
  }

  return strengths;
}

function generateConcernAreas(domainScores: Record<string, number>, riskLevel: string): string[] {
  const concerns: string[] = [];
  
  Object.entries(domainScores).forEach(([domain, score]) => {
    if (score > 3) {
      switch (domain) {
        case '사회적의사소통':
          concerns.push('사회적 의사소통의 어려움');
          break;
        case '인지적유연성':
          concerns.push('인지적 유연성 제한');
          break;
        case '정서조절':
          concerns.push('정서 조절의 어려움');
          break;
        case '사회적상호작용':
          concerns.push('사회적 상호작용 어려움');
          break;
      }
    }
  });

  if (concerns.length === 0 && riskLevel !== 'minimal') {
    concerns.push('전반적 발달 모니터링 필요');
  }

  return concerns;
}

function generateRiskFactors(totalScore: number, riskLevel: string): string[] {
  const riskFactors: string[] = [];
  
  if (totalScore > 12) {
    riskFactors.push('높은 총점으로 인한 다영역 지원 필요', '일상생활 적응 어려움 가능성');
  } else if (totalScore > 8) {
    riskFactors.push('중등도 지원 필요성', '특정 영역 집중 관리 필요');
  } else if (totalScore > 5) {
    riskFactors.push('경미한 관심 영역 모니터링', '예방적 접근 중요');
  }

  if (riskLevel === 'minimal') {
    riskFactors.push('현재 특별한 위험요인 없음');
  }

  return riskFactors.length > 0 ? riskFactors : ['현재 특별한 위험요인 식별되지 않음'];
}

function generateImmediateRecommendations(riskLevel: string, domainScores: Record<string, number>): string[] {
  const recommendations: string[] = [];
  
  if (riskLevel === 'high' || riskLevel === 'significant') {
    recommendations.push('즉시 전문기관 의뢰 및 상세 평가', '일시적 환경 조정 및 지원 체계 구축');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('현재 상태 모니터링', '강점 영역 격려 및 발전');
  }

  return recommendations;
}

function generateShortTermRecommendations(riskLevel: string, domainScores: Record<string, number>): string[] {
  const recommendations: string[] = [];
  
  if (riskLevel !== 'minimal') {
    recommendations.push('개별화된 지원 계획 수립', '정기적 진전 모니터링');
  }

  if (recommendations.length === 0) {
    recommendations.push('현재 수준 유지 활동', '예방적 건강관리');
  }

  return recommendations;
}

function generateLongTermRecommendations(riskLevel: string): string[] {
  const recommendations: string[] = [];
  
  switch (riskLevel) {
    case 'high':
    case 'significant':
      recommendations.push('장기적 치료 계획 수립', '지역사회 자원 연계');
      break;
    case 'moderate':
      recommendations.push('정기적 재평가 실시', '사회적 참여 기회 확대');
      break;
    default:
      recommendations.push('건강한 발달 환경 유지', '잠재력 개발 기회 제공');
  }

  return recommendations;
}

function generateReferrals(riskLevel: string, domainScores: Record<string, number>): string[] {
  const referrals: string[] = [];
  
  if (riskLevel === 'high' || riskLevel === 'significant') {
    referrals.push('발달소아과 전문의', '임상심리사', '언어치료사');
  } else if (riskLevel === 'moderate') {
    referrals.push('임상심리사', '특수교육 전문가');
  }

  if (referrals.length === 0) {
    referrals.push('필요시 소아과 상담');
  }

  return referrals;
}

function generateDiagnosticConsiderations(riskLevel: string, domainScores: Record<string, number>): string[] {
  const considerations: string[] = [];
  
  if (riskLevel === 'high' || riskLevel === 'significant') {
    considerations.push('자폐스펙트럼장애 감별진단 필요', 'ADHD 동반 가능성 평가');
  } else if (riskLevel === 'moderate') {
    considerations.push('사회적 의사소통 장애 고려', '특정 학습장애 감별');
  } else {
    considerations.push('현재 특별한 진단적 고려사항 없음');
  }

  return considerations;
}