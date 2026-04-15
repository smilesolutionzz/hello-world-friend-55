import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

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

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not found');
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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            {
              role: 'system',
              content: `당신은 AI 기반 신경발달 전문 분석 시스템입니다. AIH 신경발달 조기선별검사(ASES-AIH) 결과를 깊이 있게 분석하여 전문가 수준의 종합해석을 제공합니다.

# 검사 결과 데이터
- 대상 연령: ${ageGroup || '미상'}
- 전체 점수: ${overallScore.toFixed(2)}/4.0 (4.0 만점 기준)
- 위험도 수준: ${riskLevel} (색상: ${riskColor})

## 영역별 상세 점수 및 심각도
${Object.entries(categoryScores).map(([category, score]) => {
  const percentage = (score / 4.0 * 100).toFixed(1);
  let severity = '정상 범위';
  if (score >= 3.5) severity = '고도 위험';
  else if (score >= 3.0) severity = '중등도 위험';
  else if (score >= 2.5) severity = '경도 위험';
  else if (score >= 2.0) severity = '경계선 수준';
  
  const categoryNames: Record<string, string> = {
    social_communication: '사회적 소통',
    restricted_repetitive: '제한적/반복적 행동',
    sensory_processing: '감각처리',
    communication_language: '의사소통/언어',
    adaptive_functioning: '적응기능'
  };
  
  return `  • ${categoryNames[category] || category}: ${score.toFixed(2)}/4.0 (${percentage}%, ${severity})`;
}).join('\n')}

# 분석 지침 (반드시 준수) - 프리미엄 검사에 걸맞는 심층 분석 필수!

## ⚠️ 중요: 전문가 종합해석은 반드시 500자 이상으로 작성하세요!

1. **전문가 종합해석 (overallInterpretation)**: 
   - ⚠️ 반드시 500-700자로 상세하게 작성 (300자 미만 절대 금지!)
   - 아동의 전체 발달 패턴과 특징을 통합적이고 심도 있게 분석
   - 각 영역 점수의 발달학적 의미와 임상적 함의를 구체적으로 설명
   - 연령 대비 발달 수준과 또래 비교를 명확히 제시
   - 검사 결과에서 나타난 강점과 취약점을 균형 있게 기술
   - 발달학적 관점에서의 현재 상태와 향후 발달 경로 예측
   - 조기개입의 필요성과 중요성, 기대되는 효과 설명
   - 부모님께 드리는 구체적이고 실용적인 조언 포함
   - 전문적이면서도 부모가 이해하기 쉬운 따뜻한 표현 사용
   - 위험도가 높은 경우, 즉각적인 전문가 상담의 필요성을 강조

2. **영역별 분석 (categoryAnalysis)**: 각 영역마다 180-220자로 상세하게 작성

3. **강점과 과제 (strengthsAndChallenges)**: 구체적 강점 4-6개, 도전 영역 3-5개

4. **권고사항 (recommendations)**: 즉시 실천 4-5개, 장기 전략 4-5개, 전문가 상담 3-4개

5. **조기개입 (earlyIntervention)**: 가정 전략 5-6개, 교육 지원 3-4개, 치료 3-4개

6. **추후 관리 (followUpGuidelines)**: 재평가 시기, 주의 신호 4-5개, 자원 3-4개

7. **요약 및 권고 (summaryAndRecommendations)**: 핵심 발견 5-6줄, 실행 방법 4-5개, 전문가 필요성, 희망 메시지

8. **위기 감지 (crisisIndicators)** - 위험도가 "높음"인 경우 필수:
   - needsImmediateAttention: 즉각적인 전문가 개입 필요 여부 (true/false)
   - urgencyLevel: 긴급도 수준 ("critical" | "high" | "moderate")
   - crisisMessage: 보호자에게 전달할 긴급 메시지 (100-150자)
   - emergencyContacts: 권장 연락처 배열

JSON 형식으로 응답해주세요:
{
  "overallInterpretation": "500-700자의 전문가 종합해석 (발달 패턴, 특징, 함의, 예측을 통합적으로)",
  "categoryAnalysis": {
    "social_communication": "사회적 소통 영역 상세 분석 (180-220자)",
    "restricted_repetitive": "제한적 반복행동 영역 상세 분석 (180-220자)",
    "sensory_processing": "감각처리 영역 상세 분석 (180-220자)",
    "communication_language": "의사소통 언어 영역 상세 분석 (180-220자)",
    "adaptive_functioning": "적응기능 영역 상세 분석 (180-220자)"
  },
  "strengthsAndChallenges": {
    "strengths": ["구체적 강점 1", "구체적 강점 2", "구체적 강점 3", "구체적 강점 4"],
    "challenges": ["관찰 필요 사항 1", "관찰 필요 사항 2", "관찰 필요 사항 3"]
  },
  "recommendations": {
    "immediate": ["즉시 실천 가능한 권고 1", "권고 2", "권고 3", "권고 4"],
    "longterm": ["장기 전략 1", "전략 2", "전략 3", "전략 4"],
    "professional": ["전문가 상담 안내 1", "안내 2", "안내 3"]
  },
  "earlyIntervention": {
    "homeStrategies": ["가정 전략 1", "전략 2", "전략 3", "전략 4", "전략 5"],
    "educationalSupport": ["교육 지원 1", "지원 2", "지원 3"],
    "therapies": ["권장 치료 1", "치료 2", "치료 3"]
  },
  "followUpGuidelines": {
    "timeline": "구체적인 재평가 시기와 이유",
    "redFlags": ["주의 신호 1", "신호 2", "신호 3", "신호 4"],
    "resources": ["지역사회 자원 1", "자원 2", "자원 3"]
  },
  "summaryAndRecommendations": {
    "coreFindings": "핵심 발견사항 5-6줄 요약",
    "immediateActions": ["실행 방법 1", "방법 2", "방법 3", "방법 4"],
    "professionalNeed": "전문가 개입 필요성 판단과 구체적 근거",
    "hopefulMessage": "격려와 긍정적 전망 메시지 (2-3줄)"
  },
  "crisisIndicators": {
    "needsImmediateAttention": ${riskLevel === '높음'},
    "urgencyLevel": "${riskLevel === '높음' ? 'critical' : (riskLevel === '주의' ? 'high' : 'moderate')}",
    "crisisMessage": "${riskLevel === '높음' ? '검사 결과 즉각적인 전문가 상담이 필요합니다. 발달 전문가와 빠른 시일 내 상담을 진행해주세요.' : ''}",
    "emergencyContacts": ${riskLevel === '높음' ? '["발달장애인지원센터 1644-8295", "정신건강위기상담전화 1577-0199", "보건복지콜센터 129"]' : '[]'}
  },
  "disclaimer": "본 검사는 선별도구이며 진단을 대체하지 않습니다. 정확한 평가를 위해서는 전문의와 상담하시기 바랍니다."
}

**중요**: 모든 내용은 한국어로 작성하고, AI 전문 분석 시스템의 깊이 있는 통찰을 담되 부모가 이해하고 실천할 수 있도록 구체적이고 실용적으로 작성해주세요. overallInterpretation은 반드시 500-700자로 작성하세요.`
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
        summaryAndRecommendations: {
          coreFindings: `전체 점수 ${overallScore.toFixed(2)}/4.0으로 ${riskLevel} 위험도에 해당합니다. 개별 영역별 특성을 종합적으로 고려하여 맞춤형 지원이 필요합니다.`,
          immediateActions: ["구조화된 일상 루틴 만들기", "시각적 도구 활용하기", "감각 친화적 환경 조성하기"],
          professionalNeed: "지속적인 관찰과 전문가 평가를 통해 조기 개입의 필요성을 검토하는 것이 중요합니다.",
          hopefulMessage: "적절한 지원과 환경에서 아이의 고유한 강점을 발휘할 수 있습니다."
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

  } catch (error: unknown) {
    console.error('Error in autism-spectrum-analyzer function:', error);
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: message,
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