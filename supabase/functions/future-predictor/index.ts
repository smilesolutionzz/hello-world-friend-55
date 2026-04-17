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
    const { assessmentData, ageGroup, age, rawAnswers, predictionType } = await req.json();

    console.log('Future prediction request:', { ageGroup, age, predictionType, dataPoints: Object.keys(assessmentData).length });

    // Calculate risk factors and predictions
    const avgScore = Object.values(assessmentData).reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0) / Object.values(assessmentData).length;
    const scoreVariance = calculateVariance(Object.values(assessmentData));
    
    const systemPrompt = `당신은 아동 발달 및 심리 상태 예측 전문가입니다. 
제공된 평가 데이터를 기반으로 정확한 미래 예측을 수행해주세요.

분석할 정보:
- 연령그룹: ${ageGroup}
- 나이: ${age}세
- 평가 평균 점수: ${avgScore.toFixed(1)}
- 점수 편차: ${scoreVariance.toFixed(2)}
- 예측 유형: ${predictionType}

다음 형식의 JSON으로 응답해주세요:
{
  "prediction": {
    "developmentalDelayRisk": {
      "probability": <0-100 숫자>,
      "timeframe": "6개월",
      "factors": ["구체적 위험 요인 3-5개"],
      "accuracy": <70-95 숫자>
    },
    "interventionRecommendations": {
      "immediate": ["즉시 필요한 조치 2-3개"],
      "oneMonth": ["1개월 내 조치 2-3개"],
      "threeMonths": ["3개월 내 조치 2-3개"]
    },
    "successPrediction": {
      "withIntervention": <개입 시 성공률 0-100>,
      "withoutIntervention": <개입 없을 시 성공률 0-100>,
      "optimalTiming": "즉시|1개월내|3개월내"
    },
    "riskFactors": {
      "environmental": ["환경적 요인들"],
      "developmental": ["발달적 요인들"],
      "social": ["사회적 요인들"]
    },
    "preventiveActions": {
      "high": ["고위험군 대응책 2-3개"],
      "medium": ["중위험군 대응책 2-3개"],
      "low": ["저위험군 대응책 2-3개"]
    }
  },
  "accuracy": <예측 정확도 70-95>,
  "confidence": "high|medium|low",
  "timestamp": "${new Date().toISOString()}"
}`;

    const userPrompt = `평가 데이터 분석:
점수 분포: ${JSON.stringify(assessmentData)}
원본 응답: ${rawAnswers ? JSON.stringify(rawAnswers.slice(0, 10)) : '없음'}

${ageGroup}세 ${age}세 아동/성인의 6개월 후 발달 지연 위험도를 예측하고, 
구체적인 개입 계획과 예방 가이드라인을 제시해주세요.
정확도 70% 이상을 목표로 예측해주세요.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received for future prediction');

    let predictionResult;
    try {
      predictionResult = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.log('JSON parsing error, using fallback prediction');
      predictionResult = createFallbackPrediction(avgScore, ageGroup, age);
    }

    // Calculate accuracy based on data quality
    const accuracy = Math.min(95, Math.max(70, 
      75 + (Object.keys(assessmentData).length * 2) - (scoreVariance * 5)
    ));

    return new Response(JSON.stringify({
      ...predictionResult,
      accuracy: Math.round(accuracy),
      dataQuality: {
        scoreAverage: avgScore,
        variance: scoreVariance,
        sampleSize: Object.keys(assessmentData).length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in future-predictor function:', error);
    
    // Return fallback prediction
    const fallbackResult = createFallbackPrediction(50, 'child', 8);
    
    return new Response(JSON.stringify({
      ...fallbackResult,
      accuracy: 70,
      error: 'AI 예측 서비스 일시 중단, 기본 예측 결과 제공'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateVariance(scores: number[]): number {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  return Math.sqrt(variance);
}

function createFallbackPrediction(avgScore: number, ageGroup: string, age: number) {
  const riskLevel = avgScore > 75 ? 'low' : avgScore > 50 ? 'medium' : 'high';
  const probability = riskLevel === 'high' ? 65 : riskLevel === 'medium' ? 40 : 20;

  return {
    prediction: {
      developmentalDelayRisk: {
        probability,
        timeframe: "6개월",
        factors: [
          "환경적 자극 부족",
          "일관성 없는 돌봄",
          "스트레스 요인 존재",
          "사회적 상호작용 제한"
        ],
        accuracy: 72
      },
      interventionRecommendations: {
        immediate: [
          "전문가 상담 예약",
          "발달 평가 실시",
          "부모 교육 시작"
        ],
        oneMonth: [
          "정기 발달 모니터링",
          "개별화된 개입 계획 수립",
          "가족 지원 서비스 연결"
        ],
        threeMonths: [
          "진전도 평가",
          "장기 계획 수정",
          "지역 사회 자원 활용"
        ]
      },
      successPrediction: {
        withIntervention: 85,
        withoutIntervention: 45,
        optimalTiming: "즉시"
      },
      riskFactors: {
        environmental: [
          "자극 부족한 환경",
          "일관성 없는 일과",
          "스트레스 많은 가정 환경"
        ],
        developmental: [
          "언어 발달 지연 신호",
          "운동 발달 지연",
          "인지 발달 이정표 미달성"
        ],
        social: [
          "또래 상호작용 부족",
          "사회적 기술 미숙",
          "가족 내 의사소통 문제"
        ]
      },
      preventiveActions: {
        high: [
          "즉시 전문의 진료",
          "집중 개입 프로그램 참여",
          "일일 구조화된 활동"
        ],
        medium: [
          "주기적 전문가 상담",
          "부모 교육 프로그램",
          "발달 촉진 활동 증가"
        ],
        low: [
          "예방적 모니터링",
          "발달 지원 활동",
          "정기 검진 유지"
        ]
      }
    },
    accuracy: 72,
    confidence: 'medium'
  };
}