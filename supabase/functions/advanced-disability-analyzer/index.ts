import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DisabilityAnalysisRequest {
  type: 'benefit' | 'milestone' | 'emotional' | 'independence' | 'sibling' | 'education' | 'therapy';
  data: any;
  context?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, context }: DisabilityAnalysisRequest = await req.json();
    
    console.log(`Processing ${type} analysis:`, { dataKeys: Object.keys(data), hasContext: !!context });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'benefit':
        systemPrompt = `당신은 장애아동 복지 전문가입니다. 제공된 정보를 바탕으로 가장 정확하고 상세한 혜택 분석을 제공해주세요.
        
다음 원칙을 따라주세요:
- 2024년 최신 정부 정책 기준으로 분석
- 지역별 추가 혜택 포함
- 신청 방법과 필요 서류 안내
- 예상 수령 시기와 절차 설명
- 놓치기 쉬운 숨은 혜택까지 발굴`;

        userPrompt = `
아동 정보:
- 나이: ${data.childAge}세
- 장애 등급: ${data.disabilityGrade}급
- 가구 월소득: ${data.householdIncome}만원
- 거주지역: ${data.region}
- 주 돌봄자 있음: ${data.hasCaregiver ? '예' : '아니오'}
- 특수교육 필요: ${data.needsSpecialEducation ? '예' : '아니오'}
- 치료서비스 필요: ${data.needsTherapy ? '예' : '아니오'}
- 부모 직장인: ${data.isWorkingParent ? '예' : '아니오'}

다음 형식으로 JSON 응답해주세요:
{
  "totalMonthlyAmount": "총 예상 월 수령액",
  "benefits": [
    {
      "name": "혜택명",
      "amount": "지원금액",
      "description": "상세설명",
      "eligibility": "자격요건",
      "category": "money|service|discount",
      "applicationMethod": "신청방법",
      "requiredDocuments": ["필요서류1", "필요서류2"],
      "processingTime": "처리기간",
      "contactInfo": "문의처",
      "link": "관련 웹사이트"
    }
  ],
  "hiddenBenefits": [
    {
      "name": "숨은혜택명",
      "description": "혜택설명",
      "tip": "신청팁"
    }
  ],
  "nextSteps": ["실행할 다음 단계들"],
  "warnings": ["주의사항들"]
}`;
        break;

      case 'milestone':
        systemPrompt = `당신은 아동발달 전문가입니다. 발달 마일스톤 데이터를 종합적으로 분석하여 정확한 발달 평가와 개선 방안을 제시해주세요.`;
        
        userPrompt = `
아동 정보:
- 나이: ${data.ageInMonths}개월
- 체크된 마일스톤: ${JSON.stringify(data.checkedMilestones)}
- 전체 마일스톤: ${JSON.stringify(data.allMilestones)}

다음 형식으로 JSON 응답해주세요:
{
  "developmentScore": "발달점수 (0-100)",
  "overallAssessment": "전체적인 발달 평가",
  "strengthAreas": ["강점 영역들"],
  "concernAreas": ["우려 영역들"],
  "detailedAnalysis": {
    "motor": "운동발달 분석",
    "language": "언어발달 분석", 
    "cognitive": "인지발달 분석",
    "social": "사회성발달 분석",
    "selfcare": "자조발달 분석"
  },
  "recommendations": [
    {
      "area": "영역",
      "activities": ["추천활동1", "추천활동2"],
      "priority": "high|medium|low"
    }
  ],
  "redFlags": ["전문가 상담이 필요한 신호들"],
  "nextAssessmentDate": "다음 평가 권장 시기"
}`;
        break;

      case 'emotional':
        systemPrompt = `당신은 장애아동 가족 심리상담 전문가입니다. 감정 상태를 깊이 있게 분석하고 맞춤형 지원 방안을 제공해주세요.`;
        
        userPrompt = `
감정 정보:
- 현재 기분: ${data.mood}
- 기록 내용: ${data.content}
- 이전 기록들: ${JSON.stringify(data.previousEntries || [])}

다음 형식으로 JSON 응답해주세요:
{
  "emotionalAnalysis": "감정 상태 종합 분석",
  "stressLevel": "스트레스 수준 (1-10)",
  "riskFactors": ["위험요인들"],
  "strengths": ["강점들"],
  "immediateSupport": {
    "breathing": "호흡법 안내",
    "grounding": "그라운딩 기법",
    "selfCare": "즉시 가능한 자기돌봄"
  },
  "longTermStrategies": [
    {
      "strategy": "전략명",
      "description": "설명",
      "frequency": "권장 빈도"
    }
  ],
  "resources": [
    {
      "type": "자원유형",
      "name": "자원명",
      "contact": "연락처",
      "description": "설명"
    }
  ],
  "followUpDate": "다음 체크인 권장일"
}`;
        break;

      case 'independence':
        systemPrompt = `당신은 장애아동 자립준비 전문가입니다. 연령과 능력에 맞는 체계적인 자립 프로그램을 설계해주세요.`;
        
        userPrompt = `
자립 관련 정보:
- 아동 나이: ${data.age}
- 현재 능력 수준: ${data.currentSkills}
- 목표 영역: ${data.targetAreas}
- 가족 상황: ${data.familyContext}

자립준비 계획을 JSON 형식으로 응답해주세요:
{
  "currentLevel": "현재 자립 수준 평가",
  "goals": {
    "shortTerm": ["단기목표들 (3개월)"],
    "mediumTerm": ["중기목표들 (1년)"],
    "longTerm": ["장기목표들 (3년+)"]
  },
  "skillAreas": [
    {
      "area": "영역명",
      "currentLevel": "현재수준",
      "targetLevel": "목표수준",
      "activities": ["훈련활동들"],
      "timeline": "예상기간",
      "supports": ["필요한 지원들"]
    }
  ],
  "resources": ["활용 가능한 자원들"],
  "milestones": ["체크포인트들"],
  "parentGuidance": ["부모 가이드"]
}`;
        break;

      case 'sibling':
        systemPrompt = `당신은 장애아동 형제자매 지원 전문가입니다. 형제자매의 심리적 건강과 가족 조화를 위한 종합적인 지원 방안을 제시해주세요.`;
        
        userPrompt = `
형제자매 정보:
- 형제자매 구성: ${data.siblings}
- 주요 어려움: ${data.challenges}
- 가족 상황: ${data.familyDynamics}

다음 형식으로 JSON 응답해주세요:
{
  "siblingAnalysis": "형제자매 상황 분석",
  "emotionalNeeds": [
    {
      "age": "연령대",
      "needs": ["정서적 욕구들"],
      "interventions": ["개입방안들"]
    }
  ],
  "supportPrograms": [
    {
      "name": "프로그램명",
      "description": "설명",
      "ageGroup": "대상연령",
      "benefits": ["효과들"]
    }
  ],
  "familyStrategies": [
    {
      "strategy": "전략",
      "implementation": "실행방법",
      "frequency": "빈도"
    }
  ],
  "resources": ["지역 자원들"],
  "warningSignsToWatch": ["주의해야 할 신호들"]
}`;
        break;

      case 'education':
        systemPrompt = `당신은 특수교육 전문가입니다. 아동의 개별적 교육 욕구에 맞는 최적의 교육 계획을 수립해주세요.`;
        
        userPrompt = `
교육 관련 정보:
- 아동 프로필: ${JSON.stringify(data.childProfile)}
- 현재 교육 상황: ${data.currentEducation}
- 교육 목표: ${data.educationGoals}

다음 형식으로 JSON 응답해주세요:
{
  "educationAssessment": "교육 욕구 평가",
  "recommendedPrograms": [
    {
      "type": "프로그램 유형",
      "name": "프로그램명",
      "description": "설명",
      "benefits": ["장점들"],
      "requirements": ["필요조건들"]
    }
  ],
  "iepGoals": [
    {
      "domain": "영역",
      "goal": "목표",
      "objectives": ["세부목표들"],
      "timeline": "기간"
    }
  ],
  "accommodations": ["필요한 편의사항들"],
  "resources": ["교육자원들"],
  "transitionPlanning": "전환 계획"
}`;
        break;

      case 'therapy':
        systemPrompt = `당신은 재활치료 전문가입니다. 아동의 상태에 가장 적합한 치료 계획과 기관을 추천해주세요.`;
        
        userPrompt = `
치료 관련 정보:
- 아동 상태: ${JSON.stringify(data.condition)}
- 지역: ${data.location}
- 치료 경험: ${data.therapyHistory}

다음 형식으로 JSON 응답해주세요:
{
  "assessmentSummary": "치료 욕구 평가",
  "recommendedTherapies": [
    {
      "type": "치료유형",
      "priority": "우선순위",
      "description": "설명",
      "frequency": "권장빈도",
      "expectedOutcomes": ["예상효과들"]
    }
  ],
  "institutionRecommendations": [
    {
      "name": "기관명",
      "type": "기관유형",
      "specialties": ["전문분야들"],
      "location": "위치",
      "contact": "연락처",
      "notes": "특이사항"
    }
  ],
  "homePrograms": ["가정 프로그램들"],
  "progressMonitoring": "진도 모니터링 방법",
  "costConsiderations": "비용 관련 고려사항"
}`;
        break;

      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 3000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await response.json();
    console.log('OpenAI response received:', { 
      hasChoices: !!aiResponse.choices?.length,
      contentLength: aiResponse.choices?.[0]?.message?.content?.length 
    });

    const content = aiResponse.choices[0].message.content;
    
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      analysis = {
        error: 'Failed to parse AI response',
        rawContent: content
      };
    }

    return new Response(JSON.stringify({
      success: true,
      analysis,
      type,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error in advanced-disability-analyzer function (${req.url}):`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      fallback: getFallbackAnalysis(type)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getFallbackAnalysis(type: string) {
  const fallbacks = {
    benefit: {
      totalMonthlyAmount: "계산 중 오류가 발생했습니다",
      benefits: [],
      message: "잠시 후 다시 시도해주세요"
    },
    milestone: {
      developmentScore: "분석 불가",
      overallAssessment: "현재 분석 서비스에 문제가 있습니다",
      recommendations: []
    },
    emotional: {
      emotionalAnalysis: "감정 분석 중 오류가 발생했습니다",
      immediateSupport: {
        breathing: "깊게 숨을 들이마시고 천천히 내쉬세요"
      }
    },
    independence: {
      currentLevel: "평가 불가",
      goals: { shortTerm: [], mediumTerm: [], longTerm: [] }
    },
    sibling: {
      siblingAnalysis: "형제자매 분석 중 오류가 발생했습니다",
      supportPrograms: []
    },
    education: {
      educationAssessment: "교육 평가 중 오류가 발생했습니다",
      recommendedPrograms: []
    },
    therapy: {
      assessmentSummary: "치료 평가 중 오류가 발생했습니다",
      recommendedTherapies: []
    }
  };
  
  return fallbacks[type] || { error: "Unknown analysis type" };
}