import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results, answers, ageGroup } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Calculate category scores
    const categoryScores = {
      social_communication: 0,
      restricted_repetitive: 0,
      sensory_processing: 0,
      communication_language: 0,
      adaptive_functioning: 0
    };

    let totalItems = 0;
    Object.entries(results).forEach(([category, score]) => {
      if (categoryScores.hasOwnProperty(category)) {
        categoryScores[category as keyof typeof categoryScores] = Number(score);
        totalItems++;
      }
    });

    const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / totalItems;

    // Determine risk level based on score
    let riskLevel = "낮음";
    let riskColor = "#22c55e";
    if (overallScore >= 2.5 && overallScore < 3.0) {
      riskLevel = "주의";
      riskColor = "#f59e0b";
    } else if (overallScore >= 3.0) {
      riskLevel = "높음";
      riskColor = "#ef4444";
    }

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
            content: `당신은 자폐 스펙트럼 장애(ASD) 전문가이며 발달신경학 박사입니다. AIH 신경발달 조기선별검사(ASES-AIH) 결과를 분석하여 전문적이고 상세한 해석을 제공해주세요.

검사 정보:
- 대상 연령: ${ageGroup || '미상'}
- 전체 점수: ${overallScore.toFixed(2)}/4.0
- 위험도: ${riskLevel}
- 카테고리별 점수:
  • 사회적 소통: ${categoryScores.social_communication.toFixed(2)}/4.0
  • 제한적/반복적 행동: ${categoryScores.restricted_repetitive.toFixed(2)}/4.0
  • 감각처리: ${categoryScores.sensory_processing.toFixed(2)}/4.0
  • 의사소통/언어: ${categoryScores.communication_language.toFixed(2)}/4.0
  • 적응기능: ${categoryScores.adaptive_functioning.toFixed(2)}/4.0

JSON 형식으로 응답해주세요:
{
  "overallInterpretation": "전체적인 해석 (300-400자)",
  "categoryAnalysis": {
    "social_communication": "사회적 소통 영역 분석 (150-200자)",
    "restricted_repetitive": "제한적 반복행동 영역 분석 (150-200자)",
    "sensory_processing": "감각처리 영역 분석 (150-200자)",
    "communication_language": "의사소통 언어 영역 분석 (150-200자)",
    "adaptive_functioning": "적응기능 영역 분석 (150-200자)"
  },
  "strengthsAndChallenges": {
    "strengths": ["강점 1", "강점 2", "강점 3"],
    "challenges": ["도전영역 1", "도전영역 2", "도전영역 3"]
  },
  "recommendations": {
    "immediate": ["즉시 권장사항 1", "즉시 권장사항 2", "즉시 권장사항 3"],
    "longterm": ["장기 권장사항 1", "장기 권장사항 2", "장기 권장사항 3"],
    "professional": ["전문가 상담", "추가 평가", "치료 서비스"]
  },
  "earlyIntervention": {
    "homeStrategies": ["가정에서 할 수 있는 전략 1", "가정에서 할 수 있는 전략 2", "가정에서 할 수 있는 전략 3"],
    "educationalSupport": ["교육적 지원 1", "교육적 지원 2"],
    "therapies": ["추천 치료 1", "추천 치료 2"]
  },
  "followUpGuidelines": {
    "timeline": "추후 평가 권장 시기",
    "redFlags": ["주의 신호 1", "주의 신호 2", "주의 신호 3"],
    "resources": ["활용 가능한 자원 1", "활용 가능한 자원 2"]
  },
  "disclaimer": "본 검사는 선별도구이며 진단을 대체하지 않습니다. 정확한 평가를 위해서는 전문의와 상담하시기 바랍니다."
}`
          },
          {
            role: 'user',
            content: `AIH 신경발달 조기선별검사 결과를 분석해주세요:
전체 점수: ${overallScore.toFixed(2)}/4.0
위험도: ${riskLevel}
카테고리별 점수: ${JSON.stringify(categoryScores, null, 2)}
연령대: ${ageGroup || '미상'}

각 영역별로 상세한 분석과 실용적인 개입 방안을 제시해주세요.`
          }
        ],
        max_completion_tokens: 3000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisContent = data.choices[0].message.content;

    // Parse JSON response from OpenAI
    let analysis;
    try {
      analysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // Fallback analysis if JSON parsing fails
      analysis = {
        overallInterpretation: `ASES-AIH 검사 결과, 전체 점수는 ${overallScore.toFixed(2)}/4.0으로 나타났습니다. 이는 ${riskLevel} 위험도에 해당하며, 각 영역별 특성을 종합적으로 검토할 필요가 있습니다.`,
        categoryAnalysis: {
          social_communication: `사회적 소통 영역에서 ${categoryScores.social_communication.toFixed(2)}점을 기록하였습니다.`,
          restricted_repetitive: `제한적/반복적 행동 영역에서 ${categoryScores.restricted_repetitive.toFixed(2)}점을 기록하였습니다.`,
          sensory_processing: `감각처리 영역에서 ${categoryScores.sensory_processing.toFixed(2)}점을 기록하였습니다.`,
          communication_language: `의사소통/언어 영역에서 ${categoryScores.communication_language.toFixed(2)}점을 기록하였습니다.`,
          adaptive_functioning: `적응기능 영역에서 ${categoryScores.adaptive_functioning.toFixed(2)}점을 기록하였습니다.`
        },
        strengthsAndChallenges: {
          strengths: ["개인의 고유한 특성", "집중력 및 관심사", "규칙적인 패턴 선호"],
          challenges: ["사회적 상호작용", "환경 변화 적응", "감각 민감성"]
        },
        recommendations: {
          immediate: ["구조화된 환경 제공", "명확한 일과 정립", "감각 친화적 환경 조성"],
          longterm: ["지속적인 사회성 훈련", "개별화교육계획 수립", "가족 지원 체계 구축"],
          professional: ["발달소아과 상담", "종합심리평가", "언어치료 평가"]
        },
        earlyIntervention: {
          homeStrategies: ["시각적 스케줄 활용", "예측 가능한 루틴 구성", "감각 조절 활동"],
          educationalSupport: ["개별화교육지원", "보조교사 배치"],
          therapies: ["언어치료", "작업치료", "행동치료"]
        },
        followUpGuidelines: {
          timeline: "3-6개월 후 재평가 권장",
          redFlags: ["언어발달 지연", "사회적 회피 증가", "문제행동 심화"],
          resources: ["지역 발달센터", "특수교육지원센터", "부모 교육 프로그램"]
        },
        disclaimer: "본 검사는 선별도구이며 진단을 대체하지 않습니다. 정확한 평가를 위해서는 전문의와 상담하시기 바랍니다."
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
        scores: {
          overall: overallScore,
          categories: categoryScores,
          riskLevel: riskLevel,
          riskColor: riskColor
        },
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in autism-spectrum-analyzer function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        analysis: {
          overallInterpretation: "현재 분석 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
          disclaimer: "본 검사는 선별도구이며 진단을 대체하지 않습니다."
        }
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});