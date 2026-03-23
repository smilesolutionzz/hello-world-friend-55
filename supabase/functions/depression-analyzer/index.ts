import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results, answers } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const analysisPrompt = `
당신은 20년 경력의 임상심리학 박사이자 우울증 전문가입니다. Beck 우울척도(BDI-II) 기반 검사 결과를 최고 수준의 전문가적 관점에서 매우 상세하고 심층적으로 분석해주세요.

체크 결과:
- 총점: ${results.total}점 (0-63점 범위)
- 평균: ${results.average}점
- 수준: ${results.severity}
- 개별 응답: ${answers.join(', ')}

=== 전문가 수준 심층 분석 요청 (최소 2500자) ===

1. **종합적 우울증상 평가 및 점수 해석** (400자 이상)
   - Beck 우울척도 규준에 따른 현재 점수의 임상적 의미
   - 연령대별, 성별 표준집단과의 비교 분석
   - 우울증상의 심각도 수준과 기능 손상 정도
   - 점수 분포의 특성과 우울 패턴의 개별성

2. **증상 영역별 정밀 분석** (600자 이상)
   - **인지적 증상**: 부정적 사고 패턴, 자기비하, 절망감, 죄책감
   - **정서적 증상**: 우울감, 불안감, 흥미 상실, 즐거움 감소
   - **신체적 증상**: 수면 장애, 식욕 변화, 피로감, 집중력 저하
   - **행동적 증상**: 활동 수준 저하, 사회적 위축, 의사결정 어려움
   - 각 영역별 상호작용과 악순환 구조 분석

3. **개별 문항 패턴 분석 및 임상적 함의** (400자 이상)
   - 특히 높은 점수를 보인 문항들의 구체적 의미
   - 자살 위험성 관련 문항의 세심한 평가
   - 증상의 지속성과 일관성 패턴
   - 개인의 고유한 우울 표현 방식 이해

4. **위험도 평가 및 주의사항** (350자 이상)
   - 자해나 자살 사고의 위험도 정밀 평가
   - 일상생활 기능 손상의 구체적 영역과 정도
   - 우울증 악화 요인 및 조기 경고 신호
   - 즉시 전문가 개입이 필요한 상황 판단

5. **개인 맞춤형 회복 전략 및 권장사항** (500자 이상)
   - **즉시 실행 가능한 조치**:
     * 안전 확보 및 위기 관리 방안
     * 일상 루틴 회복을 위한 구체적 계획
   - **단기적 관리 방안 (1-3개월)**:
     * 증상 완화를 위한 즉각적 개입
     * 기본적 생활 패턴 안정화 전략
   - **장기적 회복 계획 (3개월-1년)**:
     * 근본적 원인 해결을 위한 장기 전략
     * 재발 방지 및 회복력 강화 방안

6. **전문가 상담 및 치료 권고** (300자 이상)
   - 정신건강의학과 전문의 상담의 필요성과 시급성
   - 심리치료(인지행동치료, 대인관계치료 등) 적합성
   - 약물치료 고려 시점과 병행 치료의 중요성
   - 지역사회 정신건강 자원 활용 방안

7. **구체적이고 실천 가능한 생활 관리 가이드** (450자 이상)
   - **일상 습관 개선**:
     * 수면 위생 관리법과 수면 패턴 정상화
     * 규칙적 식사와 영양 관리
     * 적절한 운동과 신체 활동 계획
   - **정서 관리 기술**:
     * 스트레스 대처 기법과 이완 훈련
     * 부정적 사고 패턴 개선 방법
     * 마음챙김과 감정 조절 기술
   - **사회적 지지 활용**:
     * 가족, 친구와의 소통 방법
     * 사회적 고립 극복 전략
     * 지지 체계 구축 및 유지

## 🔥 매우 중요 - 반드시 마지막에 요약 및 제언 섹션 포함:
8. **📋 요약 및 제언** (400자 이상)
   - **핵심 우울상태 요약**: 현재 우울증상을 3-4줄로 명확하게 요약
   - **즉시 실행 권장사항**: 오늘부터 바로 시작할 수 있는 3가지 우울감 완화법
   - **전문가 치료 필요성**: 정신건강의학과 상담이나 심리치료 필요성 여부와 이유
   - **희망적 전망**: 회복 가능성과 격려의 한줄 메시지

**작성 지침:**
- 전문적 근거와 임상 경험을 바탕한 분석
- 개인의 고유한 상황과 특성 고려
- 희망적이고 회복 지향적인 관점 유지
- 구체적이고 즉시 실행 가능한 조언 제공
- 총 분석 내용 2500자 이상으로 상세하게 작성

⚠️ **중요한 면책사항**: 
이 분석은 참고용 의견이며 의학적 진단이 아닙니다. 지속적인 우울감이나 자살 사고가 있을 경우 즉시 전문기관에서 정확한 진단과 치료를 받으시기 바랍니다.
`;

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
            content: '당신은 임상심리학 박사이자 우울감 전문가입니다. 내담자에게 도움이 되는 참고용 분석을 제공합니다.'
          },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 4500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      analysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in depression-analyzer function:', error);
    
    // Fallback analysis
    const fallbackAnalysis = `체크 결과 참고 분석:
    
    현재 체크 결과에 대한 상세 분석을 생성하는 중 문제가 발생했습니다.
    
    주요 권장사항:
    1. 현재 상태에 대한 정확한 평가를 위해 전문가와의 상담을 권장합니다.
    2. 규칙적인 생활 패턴과 충분한 수면을 유지하세요.
    3. 가벼운 운동과 사회적 활동 참여를 늘려보세요.
    4. 스트레스 관리법을 익히고 실천하세요.
    
    주의사항:
    이 체크는 자가진단 도구로, 의학적 진단을 대체할 수 없습니다. 어려움이 지속되거나 악화될 경우 반드시 전문의와 상담하시기 바랍니다.
    
    지속적인 관심과 적절한 도움을 통해 충분히 개선될 수 있습니다.`;

    return new Response(JSON.stringify({ 
      analysis: fallbackAnalysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});