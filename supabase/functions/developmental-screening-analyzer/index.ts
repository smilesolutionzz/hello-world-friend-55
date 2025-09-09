import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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
      details: error.message
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

= 발달 영역별 세부 평가 기준 =
1. 사회적 의사소통 (문항 1,7,14): 공동주의, 비언어적 소통, 사회적 참조
2. 인지적 유연성 (문항 2,5,19): 변화 적응, 문제해결, 인지적 전환
3. 정서 조절 (문항 4,9,15): 감정 표현, 좌절 내성, 정서 안정성
4. 사회적 상호작용 (문항 6,16,20): 또래관계, 사회적 인지, 상호작용 개시
5. 감각 처리 (문항 11,12): 감각 과민/과소반응, 감각 통합
6. 반복행동 및 제한된 관심 (문항 12,13): 상동행동, 특별한 관심사
7. 실행기능 (문항 8,19): 주의집중, 계획수립, 인지적 억제

= 상세 분석 요구사항 =
다음 JSON 형식으로 **최소 4000자 이상**의 극도로 상세한 박사급 분석을 제공하세요:

{
  "overallRiskLevel": "minimal|mild|moderate|significant|high",
  "executiveSummary": "전체적인 발달 상태에 대한 200자 이상의 종합 요약",
  "clinicalInterpretation": "박사급 임상 해석 (최소 800자 이상의 매우 상세한 분석 - 발달 궤적, 신경생물학적 기반, 환경적 요인, 개별성 등 포함)",
  "comprehensiveAnalysis": {
    "neurodevelopmentalPerspective": "신경발달학적 관점에서의 500자 이상 심층 분석",
    "developmentalTrajectory": "발달 궤적 및 장기 예후에 대한 400자 이상 분석",
    "environmentalConsiderations": "환경적 요인 및 맥락적 이해 300자 이상",
    "strengthsBasedApproach": "강점 기반 접근법과 개별적 특성 300자 이상"
  },
  "domainAnalysis": [
    {
      "domain": "도메인명",
      "score": 점수,
      "percentile": "백분위 추정",
      "clinicalInterpretation": "해당 도메인에 대한 300자 이상의 매우 상세한 임상적 해석",
      "neurocognitiveProfile": "신경인지적 프로파일 200자 이상",
      "developmentalImplications": "발달적 의미와 장기적 영향 200자 이상",
      "specificRecommendations": ["도메인별 구체적이고 실행 가능한 지원 방법 5-7개"],
      "interventionStrategies": ["과학적 근거 기반 개입 전략 3-5개"],
      "monitoringPlan": "지속적 모니터링 계획 150자 이상"
    }
  ],
  "developmentalProfile": {
    "cognitiveStrengths": ["인지적 강점 영역 상세 설명 5-7개"],
    "socialEmotionalStrengths": ["사회정서적 강점 상세 설명 5-7개"],
    "adaptiveBehaviorStrengths": ["적응행동 강점 상세 설명 3-5개"],
    "areasOfConcern": ["관심 영역 매우 상세한 설명 5-7개"],
    "riskFactors": ["임상적 위험 요인 상세 분석 5-7개"],
    "protectiveFactors": ["보호 요인 및 회복력 지표 상세 설명 5-7개"],
    "uniqueCharacteristics": ["개별적 특성 및 독특함 상세 설명 3-5개"]
  },
  "comprehensiveDifferentialDiagnosis": {
    "primaryConsiderations": [
      {
        "condition": "진단명",
        "probability": "가능성 (높음/중간/낮음)",
        "rationale": "근거 및 임상적 추론 200자 이상",
        "additionalAssessment": "추가 평가 필요사항 150자 이상"
      }
    ],
    "secondaryConsiderations": ["보조 고려 사항들 상세 설명"],
    "ruleOutConditions": ["배제해야 할 조건들과 근거"],
    "comorbidityConsiderations": "동반질환 가능성 분석 200자 이상"
  },
  "evidenceBasedRecommendations": {
    "immediate": ["즉시 실행 권장사항 매우 구체적 7-10개"],
    "shortTerm": ["1-3개월 단기 목표 구체적 7-10개"],
    "mediumTerm": ["3-6개월 중기 계획 구체적 7-10개"],
    "longTerm": ["6개월+ 장기 발달 지원 구체적 7-10개"],
    "familySupport": [
      {
        "strategy": "가족 지원 전략",
        "implementation": "구체적 실행 방법 200자 이상",
        "expectedOutcome": "기대 효과 100자 이상"
      }
    ],
    "educationalSupport": [
      {
        "intervention": "교육적 개입",
        "methodology": "방법론 및 적용 200자 이상",
        "schoolCollaboration": "학교 연계 방안 150자 이상"
      }
    ],
    "therapeuticInterventions": [
      {
        "therapy": "치료적 개입명",
        "rationale": "적용 근거 150자 이상",
        "duration": "권장 기간",
        "expectedProgress": "예상 진전 100자 이상"
      }
    ],
    "specializedReferrals": [
      {
        "specialist": "전문가 유형",
        "purpose": "의뢰 목적 100자 이상",
        "urgency": "시급성",
        "preparationAdvice": "의뢰 준비사항 100자 이상"
      }
    ]
  },
  "progressMonitoring": {
    "shortTermIndicators": ["단기 진전 지표 5-7개"],
    "longTermOutcomes": ["장기 성과 지표 5-7개"],
    "assessmentSchedule": "재평가 일정 및 방법 200자 이상",
    "parentObservationGuidelines": "부모 관찰 가이드라인 300자 이상"
  },
  "riskMitigationStrategies": {
    "identifiedRisks": ["확인된 위험요인들과 대응방안"],
    "preventiveStrategies": ["예방적 전략들 상세 설명"],
    "crisisPreventionPlan": "위기 예방 계획 300자 이상",
    "supportNetworkDevelopment": "지원 네트워크 구축 방안 200자 이상"
  },
  "culturalAndContextualFactors": {
    "culturalConsiderations": "문화적 고려사항 200자 이상",
    "familyDynamics": "가족 역학 분석 200자 이상",
    "socioeconomicFactors": "사회경제적 요인 고려 150자 이상",
    "communityResources": "지역사회 자원 활용 방안 200자 이상"
  },
  "professionalCollaboration": {
    "multidisciplinaryApproach": "다학제적 접근 필요성 200자 이상",
    "teamComposition": "권장 전문가팀 구성",
    "communicationProtocol": "전문가 간 소통 체계 150자 이상",
    "careCoordination": "치료 조정 방안 150자 이상"
  },
  "qualityOfLifeConsiderations": {
    "currentFunctioning": "현재 기능 수준 분석 200자 이상",
    "adaptiveSkillsDevelopment": "적응기술 발달 방안 200자 이상",
    "socialParticipation": "사회적 참여 증진 방안 200자 이상",
    "independenceFostering": "독립성 함양 전략 200자 이상"
  },
  "clinicalNotes": "추가 임상적 고려사항 및 전문가 의견 (최소 400자 이상)",
  "confidenceLevel": 0.0-1.0,
  "recommendedFollowUp": "권장 추후 평가 일정 및 방법 (최소 300자 이상)",
  "emergencyGuidelines": "응급상황 대응 가이드라인 200자 이상",
  "resourceRecommendations": [
    {
      "resource": "추천 자료/서비스",
      "description": "상세 설명 100자 이상",
      "accessInfo": "접근 방법 50자 이상"
    }
  ]
}

**중요 지침:**
- 각 섹션마다 명시된 최소 글자 수를 반드시 충족하세요
- 모든 분석은 DSM-5 및 ICD-11 기준을 반영하세요
- 과학적 근거와 최신 연구 결과를 포함하세요
- 개별성과 강점을 강조하는 긍정적 관점을 유지하세요
- 실행 가능하고 구체적인 권고사항을 제시하세요
- 가족 중심적이고 문화적으로 민감한 접근을 유지하세요
- 전체 응답이 최소 4000자가 되도록 하세요
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: '당신은 임상심리학 박사이자 아동발달 전문가입니다. 20년 이상의 발달장애 진단 및 평가 경험을 바탕으로 극도로 상세하고 전문적인 분석을 제공합니다. 모든 분석은 DSM-5 및 최신 임상 가이드라인을 따르며, 가족 중심의 개별화된 접근을 중시합니다. 응답은 반드시 유효한 JSON 형식이어야 하며 최소 4000자 이상이어야 합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 6000,
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
      // JSON 응답 형식으로 요청했으므로 직접 파싱
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
      riskFactors: generateRiskFactors(totalScore, riskLevel),
      protectiveFactors: generateProtectiveFactors(domainScores, riskLevel)
    },
    neurodevelopmentalAssessment: {
      cognitiveProfile: generateCognitiveProfile(domainScores),
      socialCommunicationProfile: generateSocialProfile(domainScores),
      behavioralProfile: generateBehavioralProfile(domainScores),
      sensoryProfile: generateSensoryProfile(domainScores)
    },
    differentialDiagnosis: {
      primaryConsiderations: generatePrimaryDiagnosis(riskLevel, domainScores),
      secondaryConsiderations: generateSecondaryDiagnosis(domainScores),
      ruleOutConditions: generateRuleOutConditions(riskLevel)
    },
    recommendations: {
      immediate: generateImmediateRecommendations(riskLevel, domainScores),
      shortTerm: generateShortTermRecommendations(riskLevel, domainScores),
      mediumTerm: generateMediumTermRecommendations(riskLevel),
      longTerm: generateLongTermRecommendations(riskLevel),
      familySupport: generateFamilySupport(riskLevel),
      educationalSupport: generateEducationalSupport(riskLevel, ageGroup),
      referrals: generateReferrals(riskLevel, domainScores)
    },
    interventionPriorities: {
      level1: generateLevel1Priority(domainScores, riskLevel),
      level2: generateLevel2Priority(domainScores, riskLevel),
      level3: generateLevel3Priority(domainScores, riskLevel)
    },
    prognosticFactors: {
      favorable: generateFavorableFactors(domainScores, riskLevel),
      concerning: generateConcerningFactors(domainScores, riskLevel),
      monitoring: generateMonitoringAreas(domainScores)
    },
    diagnosticConsiderations: generateDiagnosticConsiderations(riskLevel, domainScores),
    clinicalNotes: generateClinicalNotes(totalScore, ageGroup, riskLevel),
    confidenceLevel: 0.85,
    recommendedFollowUp: generateFollowUpPlan(riskLevel, ageGroup)
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

// 박사급 fallback 분석을 위한 헬퍼 함수들
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
사회적 의사소통 영역에서 ${domainScores['사회적의사소통']}점은 거울뉴런 시스템과 사회적 뇌 네트워크의 발달 상태를 시사하며, 인지적 유연성에서의 ${domainScores['인지적유연성']}점은 실행 기능과 인지적 통제 능력의 현재 수준을 나타냅니다. 정서조절 영역의 ${domainScores['정서조절']}점은 편도체-전전두피질 연결의 성숙도와 관련이 있을 수 있습니다.

**환경적 맥락과 발달 궤적:**
가정환경, 교육환경, 사회문화적 배경이 이러한 발달 특성에 미치는 영향을 고려해야 합니다. 특히 양육 스타일, 사회적 지지 체계, 교육적 기회의 질과 양이 현재 기능 수준 형성에 중요한 역할을 했을 것으로 추정됩니다.

**임상적 의미와 예후:**
${riskLevel === 'minimal' ? 
  '현재 결과는 전반적으로 건강한 발달 패턴을 보여주며, 연령에 적절한 신경발달학적 성숙을 나타냅니다. 그러나 개별적 특성과 강점을 더욱 발전시키고, 잠재적 취약성을 예방적으로 관리하는 것이 중요합니다. 지속적인 발달 모니터링을 통해 최적의 성장 환경을 조성하고, 개별적 요구에 맞는 맞춤형 지원을 제공한다면 매우 긍정적인 발달 결과를 기대할 수 있습니다.' :
  riskLevel === 'mild' ? 
  '경미한 수준의 발달적 관심사가 확인되었으나, 이는 조기 개입과 적절한 지원을 통해 충분히 개선 가능한 범위입니다. 뇌의 가소성이 높은 시기임을 고려할 때, 표적화된 개입 프로그램과 환경적 지원을 제공한다면 상당한 발달적 향상을 기대할 수 있습니다. 특히 강점 영역을 활용한 보상적 전략과 취약 영역에 대한 체계적 지원이 결합될 때 최적의 결과를 얻을 수 있습니다.' :
  riskLevel === 'moderate' ?
  '중등도의 발달적 특성이 관찰되어 체계적이고 집중적인 평가와 개별화된 지원이 필요합니다. 다학제적 접근을 통한 종합적 개입 계획 수립이 매우 중요하며, 가족 중심의 포괄적 지원 체계가 구축되어야 합니다. 조기 개입의 효과성을 고려할 때, 즉시 전문가의 상세한 평가를 받고 개별화된 치료 계획을 수립하는 것이 장기적 예후 개선에 결정적입니다.' :
  '상당한 수준의 발달적 특성이 관찰되어 즉시 종합적이고 집중적인 전문가 평가와 개입이 필요합니다. 이러한 특성들이 일상 기능과 사회적 적응에 미치는 영향을 최소화하고, 개별적 강점과 잠재력을 최대한 발휘할 수 있도록 하는 포괄적 지원 체계가 시급히 구축되어야 합니다. 가족 전체를 위한 교육과 지원, 학교 및 지역사회와의 긴밀한 협력이 필수적입니다.'
}

**개별성과 강점 기반 접근:**
모든 개인은 고유한 신경다양성의 스펙트럼 안에서 독특한 강점과 특성을 가지고 있습니다. 이러한 개별적 차이는 병리적 관점보다는 다양성과 잠재력의 관점에서 이해되어야 하며, 강점을 활용한 보상적 전략과 개별적 요구에 맞는 맞춤형 지원이 제공되어야 합니다.

**장기적 발달 전망:**
적절한 지원과 개입이 제공될 경우, 뇌의 가소성과 발달적 잠재력을 고려할 때 상당한 기능적 향상과 적응적 성장을 기대할 수 있습니다. 지속적인 모니터링과 개별화된 지원을 통해 각 개인이 자신의 최대 잠재력을 실현할 수 있도록 도와야 합니다.

**결론:**
이러한 결과는 표준화된 선별 도구를 통한 1차 평가로서, 보다 정확한 이해와 개별화된 지원 계획 수립을 위해서는 전문기관에서의 포괄적 발달 평가가 필수적입니다. 무엇보다 중요한 것은 각 개인의 고유한 특성과 강점을 인정하고 존중하며, 이를 바탕으로 한 개별화된 지원을 제공하는 것입니다.`;
}

function generateDomainAnalysis(domainScores: Record<string, number>, riskLevel: string) {
  return Object.entries(domainScores).map(([domain, score]) => {
    const interpretations = {
      '사회적의사소통': `사회적 의사소통 능력은 ${score}점으로, ${score <= 1 ? '우수한' : score <= 3 ? '양호한' : score <= 5 ? '주의 관찰' : '집중 지원'} 수준입니다. 공동 주의, 비언어적 소통, 사회적 참조 능력을 종합적으로 평가한 결과입니다.`,
      '인지적유연성': `인지적 유연성은 ${score}점으로, ${score <= 1 ? '뛰어난' : score <= 3 ? '적절한' : score <= 5 ? '보완 필요' : '집중 개입'} 수준입니다. 변화에 대한 적응력과 문제해결 능력, 인지적 전환 능력이 반영되었습니다.`,
      '정서조절': `정서 조절 능력은 ${score}점으로, ${score <= 1 ? '안정적' : score <= 3 ? '양호한' : score <= 5 ? '지원 필요' : '집중 관리'} 상태입니다. 감정 표현, 좌절 내성, 정서적 안정성을 평가했습니다.`,
      '사회적상호작용': `사회적 상호작용은 ${score}점으로, ${score <= 1 ? '원활한' : score <= 3 ? '적절한' : score <= 5 ? '개선 필요' : '체계적 지원'} 수준입니다. 또래 관계 형성과 사회적 인지 능력이 포함되었습니다.`,
      '감각처리': `감각 처리 능력은 ${score}점으로, ${score <= 1 ? '정상 범위' : score <= 2 ? '경미한 특성' : '감각 처리 지원'} 필요 수준입니다. 감각 과민성과 과소반응 패턴을 평가했습니다.`,
      '반복행동': `반복행동 및 제한된 관심은 ${score}점으로, ${score <= 1 ? '최소한' : score <= 2 ? '경미한' : '현저한'} 특성을 보입니다. 상동행동과 특별한 관심사 패턴이 반영되었습니다.`,
      '실행기능': `실행기능은 ${score}점으로, ${score <= 1 ? '우수한' : score <= 2 ? '적절한' : '지원 필요'} 수준입니다. 주의집중력과 계획수립 능력을 평가했습니다.`
    };

    const recommendations = {
      '사회적의사소통': score > 3 ? ['사회기술훈련 프로그램 참여', '또래와의 구조화된 상호작용 기회 제공', '비언어적 소통 기술 연습', '사회적 이야기 활용', '사회적 상황 역할놀이'] : ['현재 수준 유지 활동', '다양한 사회적 경험 제공'],
      '인지적유연성': score > 3 ? ['인지 행동 치료 접근', '문제해결 기술 훈련', '유연성 증진 활동', '변화 적응 연습', '실행기능 훈련'] : ['창의적 사고 활동', '다양한 경험 제공'],
      '정서조절': score > 3 ? ['정서조절 기술 훈련', '마음챙김 및 이완 기법', '감정 표현 방법 학습', '스트레스 관리 전략', '정서 인식 훈련'] : ['긍정적 정서 경험 확대', '안정적 환경 유지'],
      '사회적상호작용': score > 3 ? ['사회기술 집중 훈련', '또래 멘토링 프로그램', '집단 활동 참여', '사회적 인지 훈련', '의사소통 기술 개발'] : ['또래 상호작용 기회 확대', '사회적 참여 격려'],
      '감각처리': score > 2 ? ['감각 통합 치료', '감각 다이어트 프로그램', '환경 조정', '감각 조절 전략 학습'] : ['감각 경험 다양화'],
      '반복행동': score > 2 ? ['행동 수정 프로그램', '대안 행동 학습', '환경 구조화', '관심사 확장 활동'] : ['긍정적 관심사 발전'],
      '실행기능': score > 2 ? ['실행기능 훈련', '조직화 기술 학습', '주의집중 향상 프로그램', '시간 관리 훈련'] : ['인지적 도전 과제 제공']
    };

    return {
      domain,
      score,
      interpretation: interpretations[domain as keyof typeof interpretations] || `${domain} 영역에서 ${score}점을 기록했습니다.`,
      developmentalImplications: `이 영역의 특성은 향후 ${domain === '사회적의사소통' ? '사회적 관계 형성과 학업 성취' : domain === '인지적유연성' ? '문제해결능력과 적응력' : domain === '정서조절' ? '정신건강과 사회적 적응' : '전반적 발달'} 에 중요한 영향을 미칠 것으로 예상됩니다.`,
      recommendations: recommendations[domain as keyof typeof recommendations] || ['전문가 상담', '개별화된 지원']
    };
   });
}