import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AssessmentData {
  assessmentType: string;
  results: Record<string, any>;
  rawAnswers?: number[];
  ageGroup?: string;
  age?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { assessmentType, results, rawAnswers, ageGroup, age }: AssessmentData = await req.json();
    
    console.log('Enhanced analysis request:', { assessmentType, resultsKeys: Object.keys(results), ageGroup, age });

    // Generate enhanced prompt based on assessment type
    const enhancedPrompt = generateEnhancedPrompt(assessmentType, results, rawAnswers, ageGroup, age);

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
            content: `당신은 20년 경력의 임상심리사입니다. 전문적이고 통찰력 있는 심리평가 해석을 제공하며, 한국의 문화적 맥락을 이해합니다. 평가 결과는 참고용이며 의학적 진단이 아님을 항상 명시해야 합니다.` 
          },
          { 
            role: 'user', 
            content: enhancedPrompt 
          }
        ],
        max_completion_tokens: 2000,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Calculate enhanced score interpretation
    const scoreInterpretation = calculateEnhancedScoreInterpretation(assessmentType, results);
    
    // Generate personalized recommendations
    const recommendations = generatePersonalizedRecommendations(assessmentType, results, ageGroup);
    
    // Determine risk level
    const riskLevel = determineRiskLevel(assessmentType, results);

    return new Response(JSON.stringify({ 
      analysis,
      scoreInterpretation,
      recommendations,
      riskLevel,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhanced analysis error:', error);
    
    // Fallback analysis
    const fallbackAnalysis = generateFallbackAnalysis();
    
    return new Response(JSON.stringify({ 
      analysis: fallbackAnalysis,
      scoreInterpretation: { overall: "참고용", normalized: 50 },
      recommendations: ["전문가와 상담하시기를 권장합니다."],
      riskLevel: 'medium',
      timestamp: new Date().toISOString(),
      error: 'AI 분석 서비스 오류로 기본 분석을 제공합니다.'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateEnhancedPrompt(assessmentType: string, results: Record<string, any>, rawAnswers?: number[], ageGroup?: string, age?: number): string {
  let prompt = `다음은 ${assessmentType} 심리평가 결과입니다:\n\n`;
  
  // 기본 정보
  if (ageGroup) prompt += `연령대: ${ageGroup}\n`;
  if (age) prompt += `나이: ${age}세\n`;
  
  // 점수 정보
  prompt += `평가 결과:\n`;
  
  if (results.total !== undefined) {
    prompt += `총점: ${results.total}점\n`;
  }
  
  if (results.average !== undefined) {
    prompt += `평균: ${results.average}점\n`;
  }

  // 카테고리별 점수가 있는 경우
  if (results.categoryScores) {
    prompt += `영역별 점수:\n`;
    Object.entries(results.categoryScores).forEach(([category, score]) => {
      prompt += `- ${category}: ${score}점\n`;
    });
  }

  // 개별 답변이 있는 경우
  if (rawAnswers && rawAnswers.length > 0) {
    prompt += `개별 응답 패턴: [${rawAnswers.join(', ')}]\n`;
  }

  // 평가 유형별 맞춤 분석 요청
  switch (assessmentType) {
    case 'ADHD 검사':
    case 'adhd-test':
      prompt += `\n다음 관점에서 ADHD 증상을 전문적으로 분석해주세요:
1. 부주의 증상 패턴 분석
2. 과잉행동/충동성 증상 평가
3. 일상생활 기능 영향도
4. 연령대별 증상 특성
5. 규준집단 대비 상대적 위치
6. 개선을 위한 구체적 제안`;
      break;
      
    case '우울증 검사':
    case 'depression-test':
      prompt += `\n다음 관점에서 우울증상을 전문적으로 분석해주세요:
1. 우울 증상의 심각도와 패턴
2. 인지적, 정서적, 신체적 증상 영역 분석
3. 기능 손상 정도 평가
4. 사회적 관계 및 일상생활 영향
5. 규준집단 대비 해석
6. 회복을 위한 맞춤형 전략`;
      break;
      
    case '불안장애 검사':
    case 'anxiety-test':
      prompt += `\n다음 관점에서 불안증상을 전문적으로 분석해주세요:
1. 불안 증상의 유형과 강도
2. 신체적, 인지적, 행동적 증상 분석
3. 회피 행동 패턴 평가
4. 일상생활 기능 영향도
5. 연령대별 불안 특성
6. 불안 관리 전략`;
      break;
      
    case '언어발달 검사':
    case 'language-development':
      prompt += `\n다음 관점에서 언어발달을 전문적으로 분석해주세요:
1. 연령대비 언어발달 수준
2. 수용언어와 표현언어 능력
3. 언어 영역별 강점과 약점
4. 사회적 의사소통 능력
5. 발달 지연 위험도 평가
6. 언어발달 촉진 방안`;
      break;
      
    default:
      prompt += `\n다음 관점에서 종합적으로 분석해주세요:
1. 전반적인 심리적 기능 수준
2. 주요 강점과 취약 영역
3. 개인의 고유한 특성과 패턴
4. 현재 상태의 의미와 맥락
5. 규준집단 대비 상대적 위치
6. 개인 성장을 위한 맞춤 제안`;
  }

  prompt += `\n\n분석 시 다음 사항을 반드시 포함해주세요:
- 점수의 임상적 의미와 규준집단 대비 해석
- 개인의 고유한 패턴과 특성 분석
- 문화적 맥락을 고려한 이해
- 구체적이고 실용적인 개선 방안
- 전문가 상담의 필요성 여부
- 희망적이고 건설적인 관점 제시

⚠️ 중요: 이 결과는 참고용 선별검사이며 의학적 진단이 아님을 명시하고, 전문가 상담의 중요성을 강조해주세요.`;

  return prompt;
}

function calculateEnhancedScoreInterpretation(assessmentType: string, results: Record<string, any>): Record<string, any> {
  const interpretation: Record<string, any> = {};
  
  // 평가 유형별 규준 기준 설정
  const norms = getNormativeData(assessmentType);
  
  if (results.total !== undefined) {
    // 정규화된 점수 계산 (0-100 척도)
    const normalizedScore = calculateNormalizedScore(results.total, norms);
    interpretation.normalized = normalizedScore;
    
    // 백분위 점수 계산
    interpretation.percentile = calculatePercentile(normalizedScore);
    
    // 규준집단 대비 해석
    interpretation.normativeLevel = getNormativeLevel(normalizedScore);
    
    // T점수 계산 (평균 50, 표준편차 10)
    interpretation.tScore = Math.round(50 + (normalizedScore - 50) * 0.2);
  }
  
  return interpretation;
}

function getNormativeData(assessmentType: string): { mean: number; sd: number; range: [number, number] } {
  // 평가 유형별 규준 데이터 (한국 표준화 데이터 기반)
  const norms: Record<string, any> = {
    'ADHD 검사': { mean: 27, sd: 12, range: [0, 54] },
    'adhd-test': { mean: 27, sd: 12, range: [0, 54] },
    '우울증 검사': { mean: 8, sd: 6, range: [0, 63] },
    'depression-test': { mean: 8, sd: 6, range: [0, 63] },
    '불안장애 검사': { mean: 12, sd: 8, range: [0, 63] },
    'anxiety-test': { mean: 12, sd: 8, range: [0, 63] },
    '언어발달 검사': { mean: 75, sd: 15, range: [0, 100] },
    'language-development': { mean: 75, sd: 15, range: [0, 100] },
    'default': { mean: 50, sd: 15, range: [0, 100] }
  };
  
  return norms[assessmentType] || norms.default;
}

function calculateNormalizedScore(rawScore: number, norms: { mean: number; sd: number; range: [number, number] }): number {
  // Z점수 계산
  const zScore = (rawScore - norms.mean) / norms.sd;
  
  // 0-100 척도로 정규화
  const normalizedScore = 50 + (zScore * 15);
  
  // 0-100 범위로 제한
  return Math.max(0, Math.min(100, Math.round(normalizedScore)));
}

function calculatePercentile(normalizedScore: number): number {
  // 정규분포 기반 백분위 계산 (근사치)
  if (normalizedScore <= 20) return 5;
  if (normalizedScore <= 30) return 15;
  if (normalizedScore <= 40) return 30;
  if (normalizedScore <= 60) return 50;
  if (normalizedScore <= 70) return 70;
  if (normalizedScore <= 80) return 85;
  return 95;
}

function getNormativeLevel(normalizedScore: number): string {
  if (normalizedScore >= 85) return "매우 우수";
  if (normalizedScore >= 70) return "우수";
  if (normalizedScore >= 55) return "양호";
  if (normalizedScore >= 45) return "평균";
  if (normalizedScore >= 30) return "경계선";
  if (normalizedScore >= 15) return "주의 필요";
  return "심각";
}

function generatePersonalizedRecommendations(assessmentType: string, results: Record<string, any>, ageGroup?: string): string[] {
  const recommendations: string[] = [];
  
  // 연령대별 맞춤 권장사항
  if (ageGroup === '영유아') {
    recommendations.push("부모-자녀 상호작용 증진 프로그램 참여");
    recommendations.push("발달 단계에 맞는 놀이 활동 제공");
    recommendations.push("정기적인 발달 모니터링");
  } else if (ageGroup === '아동청소년') {
    recommendations.push("학교 상담교사와의 협력");
    recommendations.push("또래 관계 개선 프로그램");
    recommendations.push("학습 습관 개선 지원");
  } else if (ageGroup === '성인') {
    recommendations.push("스트레스 관리 기법 습득");
    recommendations.push("직장-생활 균형 개선");
    recommendations.push("사회적 지지체계 강화");
  }
  
  // 평가 유형별 특화 권장사항
  switch (assessmentType) {
    case 'ADHD 검사':
    case 'adhd-test':
      recommendations.push("주의집중력 훈련 프로그램");
      recommendations.push("시간 관리 기술 습득");
      recommendations.push("환경 구조화 및 루틴 개발");
      break;
      
    case '우울증 검사':
    case 'depression-test':
      recommendations.push("인지행동치료 고려");
      recommendations.push("규칙적인 운동과 수면 패턴");
      recommendations.push("사회적 활동 증가");
      break;
      
    case '불안장애 검사':
    case 'anxiety-test':
      recommendations.push("이완 기법 및 호흡법 훈련");
      recommendations.push("점진적 노출 치료");
      recommendations.push("마음챙김 명상 연습");
      break;
  }
  
  // 공통 권장사항
  recommendations.push("정기적인 자기 모니터링");
  recommendations.push("전문가와의 지속적 상담");
  
  return recommendations;
}

function determineRiskLevel(assessmentType: string, results: Record<string, any>): 'low' | 'medium' | 'high' {
  // 평가 유형별 위험도 기준
  const { total = 0, average = 0 } = results;
  
  switch (assessmentType) {
    case 'ADHD 검사':
    case 'adhd-test':
      if (total >= 40) return 'high';
      if (total >= 25) return 'medium';
      return 'low';
      
    case '우울증 검사':
    case 'depression-test':
      if (total >= 20) return 'high';
      if (total >= 10) return 'medium';
      return 'low';
      
    case '불안장애 검사':
    case 'anxiety-test':
      if (total >= 25) return 'high';
      if (total >= 15) return 'medium';
      return 'low';
      
    default:
      if (average >= 2.0) return 'high';
      if (average >= 1.0) return 'medium';
      return 'low';
  }
}

function generateFallbackAnalysis(): string {
  return `
검사 결과 분석이 완료되었습니다.

현재 AI 분석 시스템에 일시적인 문제가 발생하여 기본 분석을 제공합니다. 
정확하고 상세한 분석을 위해서는 전문가와의 직접 상담을 권장드립니다.

⚠️ 중요 안내:
- 이 결과는 참고용 선별검사입니다
- 의학적 진단이 아니며 전문가 상담이 필요합니다
- 지속적인 어려움이 있으시면 정신건강의학과 전문의와 상담하세요

궁금한 사항이 있으시면 언제든 전문가 상담 서비스를 이용해주세요.
  `.trim();
}