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

interface AdvancedScreeningResults {
  answers: number[];
  total: number;
  domainScores: Record<string, number>;
  ageGroup: 'child' | 'adult';
}

interface AdvancedDevelopmentalAnalysis {
  overallRiskLevel: 'minimal' | 'mild' | 'moderate' | 'significant' | 'high';
  executiveSummary: string;
  clinicalInterpretation: string;
  comprehensiveAnalysis: {
    neurodevelopmentalPerspective: string;
    developmentalTrajectory: string;
    environmentalConsiderations: string;
    strengthsBasedApproach: string;
  };
  domainAnalysis: {
    domain: string;
    score: number;
    percentile: string;
    clinicalInterpretation: string;
    neurocognitiveProfile: string;
    developmentalImplications: string;
    specificRecommendations: string[];
    interventionStrategies: string[];
    monitoringPlan: string;
  }[];
  developmentalProfile: {
    cognitiveStrengths: string[];
    socialEmotionalStrengths: string[];
    adaptiveBehaviorStrengths: string[];
    areasOfConcern: string[];
    riskFactors: string[];
    protectiveFactors: string[];
    uniqueCharacteristics: string[];
  };
  evidenceBasedRecommendations: {
    immediate: string[];
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
    familySupport: {
      strategy: string;
      implementation: string;
      expectedOutcome: string;
    }[];
    educationalSupport: {
      intervention: string;
      methodology: string;
      schoolCollaboration: string;
    }[];
    therapeuticInterventions: {
      therapy: string;
      rationale: string;
      duration: string;
      expectedProgress: string;
    }[];
    specializedReferrals: {
      specialist: string;
      purpose: string;
      urgency: string;
      preparationAdvice: string;
    }[];
  };
  progressMonitoring: {
    shortTermIndicators: string[];
    longTermOutcomes: string[];
    assessmentSchedule: string;
    parentObservationGuidelines: string;
  };
  clinicalNotes: string;
  confidenceLevel: number;
  recommendedFollowUp: string;
  emergencyGuidelines: string;
  resourceRecommendations: {
    resource: string;
    description: string;
    accessInfo: string;
  }[];
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
    const { results, ageGroup } = requestBody;
    
    // Input validation
    if (!results || !Array.isArray(results.answers) || !ageGroup) {
      return new Response(JSON.stringify({ error: '유효하지 않은 검사 데이터입니다.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 토큰 차감 처리 (고도화 평가는 5토큰)
    const tokenCost = 5;
    
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

    console.log('Processing advanced developmental analysis:', {
      userId: user.id,
      ageGroup,
      totalScore: results.total,
      answersLength: results.answers.length,
      domainScores: results.domainScores
    });

    // AI 기반 고도화 발달특성 분석
    const analysis = await analyzeAdvancedDevelopmental(results, ageGroup);
    
    // 분석 결과 저장
    const savedResult = await saveAdvancedAnalysis(supabase, user.id, results, analysis, ageGroup);

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
    console.error('Error in advanced-developmental-analyzer:', error);
    return new Response(JSON.stringify({ 
      error: '분석 중 오류가 발생했습니다.',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeAdvancedDevelopmental(results: AdvancedScreeningResults, ageGroup: string): Promise<AdvancedDevelopmentalAnalysis> {
  const totalScore = results.total;
  const averageScore = totalScore / results.answers.length;
  
  const prompt = `
당신은 임상심리학 박사이자 발달신경심리학 최고 전문가로서 25년 이상의 풍부한 임상 경험을 보유하고 있습니다. 
AIH 고도화 발달특성 종합평가 결과를 최첨단 박사급 심층 분석을 제공해주세요.

= 고도화 평가 정보 =
연령군: ${ageGroup === 'child' ? '아동청소년' : '성인'}
총점: ${totalScore}/35점 (평균: ${averageScore.toFixed(2)}점)
개별 응답 패턴: ${results.answers.join(', ')}

= 8대 핵심 발달영역별 점수 =
${Object.entries(results.domainScores).map(([domain, score]) => `${domain}: ${score}점`).join('\n')}

= 발달영역별 상세 평가 기준 (35문항 고도화 체계) =
1. 사회적 의사소통 (8문항): 시선접촉, 비언어적 소통, 대화 상호성, 상황적 언어사용, 감정인식, 농담이해, 관심공유, 관점수용
2. 인지적 유연성 (6문항): 변화적응, 문제해결 다양성, 환경적응, 멀티태스킹, 오류수정, 규칙학습
3. 감각 처리 (5문항): 청각민감성, 촉각처리, 시각자극, 후각미각, 전정고유감각
4. 정서 조절 (5문항): 분노조절, 좌절내성, 감정표현, 정서안정성, 공감반응
5. 사회적 상호작용 (4문항): 관계형성, 집단참여, 사회규범, 갈등해결
6. 반복행동/제한된 관심 (4문항): 상동행동, 관심다양성, 루틴융통성, 집착방지
7. 실행 기능 (3문항): 계획수립, 주의집중, 충동억제

= 최첨단 임상 분석 요구사항 =
다음 JSON 형식으로 **최소 5000자 이상**의 극도로 상세한 박사급 분석을 제공하세요:

{
  "overallRiskLevel": "minimal|mild|moderate|significant|high",
  "executiveSummary": "전체적인 발달 상태에 대한 300자 이상의 종합 요약 - 핵심 특성과 지원 방향 포함",
  "clinicalInterpretation": "박사급 임상 해석 (최소 1000자 이상의 매우 상세한 분석 - 신경발달학적 기전, 개별적 특성, 환경적 맥락, 발달 궤적 등 포함)",
  "comprehensiveAnalysis": {
    "neurodevelopmentalPerspective": "신경발달학적 관점에서의 600자 이상 심층 분석 - 뇌 발달과 기능적 연결성 포함",
    "developmentalTrajectory": "발달 궤적 및 장기 예후에 대한 500자 이상 분석 - 생애주기별 변화 예측",
    "environmentalConsiderations": "환경적 요인 및 맥락적 이해 400자 이상 - 가족, 학교, 사회적 지원",
    "strengthsBasedApproach": "강점 기반 접근법과 개별적 특성 400자 이상 - 잠재력과 고유성 강조"
  },
  "domainAnalysis": [
    {
      "domain": "도메인명",
      "score": 점수,
      "percentile": "백분위 추정 (예: 상위 25%)",
      "clinicalInterpretation": "해당 도메인에 대한 400자 이상의 매우 상세한 임상적 해석",
      "neurocognitiveProfile": "신경인지적 프로파일 300자 이상 - 관련 뇌 영역과 기능",
      "developmentalImplications": "발달적 의미와 장기적 영향 300자 이상",
      "specificRecommendations": ["도메인별 구체적이고 실행 가능한 지원 방법 7-9개"],
      "interventionStrategies": ["과학적 근거 기반 개입 전략 5-7개"],
      "monitoringPlan": "지속적 모니터링 계획 200자 이상"
    }
  ],
  "developmentalProfile": {
    "cognitiveStrengths": ["인지적 강점 영역 상세 설명 7-9개"],
    "socialEmotionalStrengths": ["사회정서적 강점 상세 설명 7-9개"],
    "adaptiveBehaviorStrengths": ["적응행동 강점 상세 설명 5-7개"],
    "areasOfConcern": ["관심 영역 매우 상세한 설명 7-9개"],
    "riskFactors": ["임상적 위험 요인 상세 분석 5-7개"],
    "protectiveFactors": ["보호 요인 및 회복력 지표 상세 설명 7-9개"],
    "uniqueCharacteristics": ["개별적 특성 및 독특함 상세 설명 5-7개"]
  },
  "evidenceBasedRecommendations": {
    "immediate": ["즉시 실행 권장사항 매우 구체적 9-12개"],
    "shortTerm": ["1-3개월 단기 목표 구체적 9-12개"],
    "mediumTerm": ["3-6개월 중기 계획 구체적 9-12개"],
    "longTerm": ["6개월+ 장기 발달 지원 구체적 9-12개"],
    "familySupport": [
      {
        "strategy": "가족 지원 전략명",
        "implementation": "구체적 실행 방법 300자 이상",
        "expectedOutcome": "기대 효과 150자 이상"
      }
    ],
    "educationalSupport": [
      {
        "intervention": "교육적 개입명",
        "methodology": "방법론 및 적용 300자 이상",
        "schoolCollaboration": "학교 연계 방안 200자 이상"
      }
    ],
    "therapeuticInterventions": [
      {
        "therapy": "치료적 개입명",
        "rationale": "적용 근거 200자 이상",
        "duration": "권장 기간",
        "expectedProgress": "예상 진전 150자 이상"
      }
    ],
    "specializedReferrals": [
      {
        "specialist": "전문가 유형",
        "purpose": "의뢰 목적 150자 이상",
        "urgency": "시급성 (즉시/1개월내/3개월내)",
        "preparationAdvice": "의뢰 준비사항 150자 이상"
      }
    ]
  },
  "progressMonitoring": {
    "shortTermIndicators": ["단기 진전 지표 7-9개"],
    "longTermOutcomes": ["장기 성과 지표 7-9개"],
    "assessmentSchedule": "재평가 일정 및 방법 300자 이상",
    "parentObservationGuidelines": "부모 관찰 가이드라인 400자 이상"
  },
  "clinicalNotes": "추가 임상적 고려사항 및 전문가 의견 (최소 500자 이상)",
  "confidenceLevel": 0.85-0.95,
  "recommendedFollowUp": "권장 추후 평가 일정 및 방법 (최소 400자 이상)",
  "emergencyGuidelines": "응급상황 대응 가이드라인 300자 이상",
  "resourceRecommendations": [
    {
      "resource": "추천 자료/서비스명",
      "description": "상세 설명 150자 이상",
      "accessInfo": "접근 방법 100자 이상"
    }
  ]
}

**핵심 분석 지침:**
- 각 섹션마다 명시된 최소 글자 수를 반드시 충족하세요
- 모든 분석은 DSM-5-TR 및 ICD-11 최신 기준을 반영하세요
- 신경발달학적 관점과 최신 뇌과학 연구 결과를 포함하세요
- 개별성과 강점을 강조하는 긍정적이고 희망적인 관점을 유지하세요
- 실행 가능하고 구체적이며 과학적 근거가 있는 권고사항을 제시하세요
- 가족 중심적이고 문화적으로 민감한 접근을 유지하세요
- 전체 응답이 최소 5000자가 되도록 하되, 질적으로 우수한 내용을 담으세요
- 각 도메인별로 상세한 분석과 개별화된 권고사항을 제시하세요
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
            content: '당신은 임상심리학 박사이자 발달신경심리학 최고 전문가입니다. 25년 이상의 발달장애 진단 및 평가 경험을 바탕으로 극도로 상세하고 전문적인 분석을 제공합니다. 모든 분석은 DSM-5-TR 및 최신 임상 가이드라인을 따르며, 가족 중심의 개별화된 접근을 중시합니다. 응답은 반드시 유효한 JSON 형식이어야 하며 최소 5000자 이상이어야 합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 8000,
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
    console.log('Raw advanced analysis response length:', analysisText?.length);
    
    try {
      const analysis = JSON.parse(analysisText);
      
      // 필수 필드 검증 및 보완
      if (!analysis.overallRiskLevel) analysis.overallRiskLevel = 'moderate';
      if (!analysis.clinicalInterpretation) analysis.clinicalInterpretation = '전문가 추가 평가가 필요한 상태입니다.';
      if (!analysis.confidenceLevel) analysis.confidenceLevel = 0.87;
      
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse advanced AI analysis:', parseError);
      console.error('Raw response:', analysisText);
      return createAdvancedFallbackAnalysis(totalScore, averageScore, ageGroup, results.domainScores);
    }

  } catch (error) {
    console.error('Error calling OpenAI API for advanced analysis:', error);
    return createAdvancedFallbackAnalysis(totalScore, averageScore, ageGroup, results.domainScores);
  }
}

function createAdvancedFallbackAnalysis(
  totalScore: number, 
  averageScore: number, 
  ageGroup: string, 
  domainScores: Record<string, number>
): AdvancedDevelopmentalAnalysis {
  let riskLevel: 'minimal' | 'mild' | 'moderate' | 'significant' | 'high' = 'minimal';
  
  if (totalScore >= 25) riskLevel = 'high';
  else if (totalScore >= 20) riskLevel = 'significant';
  else if (totalScore >= 15) riskLevel = 'moderate';
  else if (totalScore >= 10) riskLevel = 'mild';
  
  return {
    overallRiskLevel: riskLevel,
    executiveSummary: `총 ${totalScore}점(35점 만점)으로 ${ageGroup === 'child' ? '아동청소년' : '성인'} 기준 ${riskLevel === 'minimal' ? '양호한' : riskLevel === 'mild' ? '경미한 특성을 보이는' : '관심이 필요한'} 발달 프로파일을 나타냅니다. 8개 핵심 영역에서 개별화된 지원 방안이 도움이 될 것으로 판단됩니다.`,
    clinicalInterpretation: `본 평가 결과는 체계적인 35문항 고도화 발달특성 종합평가를 통해 도출되었습니다. 개별 응답 패턴과 도메인별 점수 분포를 종합적으로 분석한 결과, 전반적인 위험도는 ${riskLevel} 수준으로 평가됩니다. 이는 개별적인 발달 특성과 환경적 요인을 반영한 결과이며, 강점 기반 접근과 함께 필요 영역에 대한 맞춤형 지원이 권장됩니다.`,
    comprehensiveAnalysis: {
      neurodevelopmentalPerspective: "신경발달학적 관점에서 볼 때, 개별 영역 간의 발달 패턴이 고유한 신경연결성을 반영하고 있습니다. 이는 개인의 신경다양성을 인정하고 강점을 활용한 지원 방안 수립이 중요함을 시사합니다.",
      developmentalTrajectory: "현재 발달 프로파일을 바탕으로 한 장기 예후는 적절한 지원과 개입이 제공될 경우 긍정적인 변화가 기대됩니다. 지속적인 모니터링과 맞춤형 지원이 핵심입니다.",
      environmentalConsiderations: "가족, 교육 환경, 사회적 지원 체계가 발달에 미치는 영향을 고려하여 포괄적인 접근이 필요합니다. 환경적 수정과 지원 강화가 도움될 것입니다.",
      strengthsBasedApproach: "개별적인 강점과 특성을 인정하고 이를 바탕으로 한 지원 방안을 수립하는 것이 중요합니다. 개인의 고유성과 잠재력을 존중하는 접근이 필요합니다."
    },
    domainAnalysis: Object.entries(domainScores).map(([domain, score]) => ({
      domain,
      score,
      percentile: score > 5 ? "상위 30%" : score > 3 ? "평균 범위" : "하위 30%",
      clinicalInterpretation: `${domain} 영역에서 ${score}점을 기록하여 ${score > 5 ? '양호한' : score > 3 ? '평균적인' : '지원이 필요한'} 수준을 보입니다.`,
      neurocognitiveProfile: `${domain}과 관련된 신경인지적 기능이 개별적인 특성을 나타내고 있습니다.`,
      developmentalImplications: "장기적 발달 관점에서 적절한 지원과 개입이 긍정적인 변화를 가져올 수 있습니다.",
      specificRecommendations: [
        `${domain} 영역의 구체적인 지원 방안 수립`,
        "개별화된 중재 전략 적용",
        "지속적인 모니터링 실시",
        "가족 참여 지원 프로그램",
        "전문가 협력 체계 구축"
      ],
      interventionStrategies: [
        "과학적 근거 기반 개입 방법",
        "개별화된 치료 계획",
        "다학제적 접근"
      ],
      monitoringPlan: "정기적인 평가와 지속적인 관찰을 통한 진전 모니터링이 필요합니다."
    })),
    developmentalProfile: {
      cognitiveStrengths: ["개별적인 인지적 특성", "독특한 사고 패턴", "창의적 문제해결"],
      socialEmotionalStrengths: ["고유한 정서적 특성", "개별적인 사회적 접근"],
      adaptiveBehaviorStrengths: ["일상생활 적응 능력", "환경 적응성"],
      areasOfConcern: ["관심이 필요한 영역", "추가 지원 영역"],
      riskFactors: ["고려해야 할 위험 요인"],
      protectiveFactors: ["보호 요인과 강점", "회복력 지표"],
      uniqueCharacteristics: ["개별적이고 독특한 특성"]
    },
    evidenceBasedRecommendations: {
      immediate: ["즉시 실행 가능한 지원 방안", "환경적 수정", "가족 교육"],
      shortTerm: ["단기 목표 설정", "구체적 개입 계획"],
      mediumTerm: ["중기 발달 지원 계획"],
      longTerm: ["장기적 성장 지원 방안"],
      familySupport: [{
        strategy: "가족 중심 지원",
        implementation: "체계적인 가족 교육과 지원 프로그램을 통해 가족의 역량 강화",
        expectedOutcome: "가족의 이해 증진과 지원 능력 향상"
      }],
      educationalSupport: [{
        intervention: "교육적 지원",
        methodology: "개별화된 교육 프로그램과 환경적 수정을 통한 학습 지원",
        schoolCollaboration: "학교와의 협력을 통한 통합적 지원 체계 구축"
      }],
      therapeuticInterventions: [{
        therapy: "전문적 치료 개입",
        rationale: "개별적 특성에 맞는 치료적 접근이 필요",
        duration: "3-6개월",
        expectedProgress: "점진적이고 지속적인 향상 기대"
      }],
      specializedReferrals: [{
        specialist: "발달 전문가",
        purpose: "보다 정밀한 평가와 개별화된 지원 방안 수립",
        urgency: "3개월내",
        preparationAdvice: "현재 평가 결과와 관찰 기록을 준비하여 상담에 임하시기 바랍니다"
      }]
    },
    progressMonitoring: {
      shortTermIndicators: ["일상생활 기능 향상", "사회적 참여 증가"],
      longTermOutcomes: ["전반적인 적응 능력 향상", "삶의 질 개선"],
      assessmentSchedule: "3개월마다 정기적인 평가를 통해 진전 상황을 모니터링하고 지원 계획을 조정합니다",
      parentObservationGuidelines: "일상생활에서의 변화와 향상을 관찰하고 기록하여 전문가와 공유하시기 바랍니다"
    },
    clinicalNotes: "본 평가는 개별적인 발달 특성을 이해하고 적절한 지원 방향을 제시하기 위한 도구입니다. 정확한 진단이나 치료 계획을 위해서는 전문가의 직접적인 평가가 필요합니다.",
    confidenceLevel: 0.87,
    recommendedFollowUp: "3개월 후 추후 평가를 권장하며, 그 동안의 변화와 개입 효과를 점검하여 지원 계획을 업데이트하는 것이 좋겠습니다",
    emergencyGuidelines: "급격한 행동 변화나 적응상의 심각한 어려움이 발생할 경우 즉시 전문가의 도움을 받으시기 바랍니다",
    resourceRecommendations: [{
      resource: "발달지원센터",
      description: "지역별 발달지원센터에서 제공하는 전문적인 상담과 지원 서비스",
      accessInfo: "거주지역 보건소나 교육청을 통해 문의 가능"
    }]
  };
}

async function saveAdvancedAnalysis(
  supabase: any, 
  userId: string, 
  results: AdvancedScreeningResults, 
  analysis: AdvancedDevelopmentalAnalysis, 
  ageGroup: string
) {
  const { data, error } = await supabase
    .from('developmental_screening_results')
    .insert({
      user_id: userId,
      test_type: 'advanced_developmental_assessment',
      age_group: ageGroup,
      raw_scores: results.answers,
      total_score: results.total,
      ai_analysis: analysis,
      confidence_score: analysis.confidenceLevel || 0.87,
      risk_level: analysis.overallRiskLevel
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error saving advanced analysis:', error);
    throw error;
  }

  return data;
}