import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  results: {
    receptive: number;
    expressive: number;
    total: number;
    receptive_percentage: number;
    expressive_percentage: number;
    total_percentage: number;
  };
  answers: Record<string, string>;
  ageGroup?: string;
  age?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results, answers, ageGroup, age }: AnalysisRequest = await req.json();

    console.log('언어발달 검사 분석 요청:', { results, ageGroup, age, answerCount: Object.keys(answers).length });

    // 상세한 프롬프트 구성 - 프리미엄 검사에 걸맞는 초정밀 분석
    const prompt = `당신은 25년 경력의 언어치료학 박사이자 영유아 언어발달 전문가입니다. 다음 언어발달 검사 결과를 최고 수준의 전문가적 관점에서 매우 상세하고 심층적으로 분석해주세요.

⚠️ 중요: 이것은 프리미엄 유료 검사입니다. 반드시 3000자 이상의 매우 상세한 전문가 분석을 제공해야 합니다!

**검사 결과 요약:**
- 수용언어: ${results.receptive}점 / 39점 (${results.receptive_percentage}%)
- 표현언어: ${results.expressive}점 / 38점 (${results.expressive_percentage}%)
- 전체 점수: ${results.total}점 / 77점 (${results.total_percentage}%)
${ageGroup ? `- 대상 연령: ${ageGroup}` : ''}
${age ? `- 현재 개월수: ${age}개월` : ''}

**개별 문항 응답 패턴:**
${Object.entries(answers).map(([questionId, answer]) => `문항 ${questionId}: ${answer}`).join('\n')}

=== 전문가 수준 심층 분석 요청 (최소 3000자 필수!) ===

## 1. 🧠 전문가 종합해석 (600자 이상 필수!)
   - 검사 결과가 시사하는 전반적인 언어발달 상태
   ${age ? `- ${age}개월 아동의 표준 발달 이정표와의 상세 비교 분석` : '- 연령대별 표준 발달 이정표와의 상세 비교 분석'}
   - 수용언어와 표현언어 발달의 균형성과 상호작용 패턴
   - 언어발달 궤도에 대한 전문가적 견해와 예후 평가
   - 부모님께 드리는 종합적인 안내와 조언
   ${age ? `- ${age}개월 아동에게 기대되는 언어발달 수준과의 비교` : ''}

2. **수용언어 영역 정밀 분석** (400자 이상)
   - 어휘 이해 능력: 구체명사, 추상명사, 동사, 형용사별 이해도
   - 문장 이해 능력: 단순문, 복합문, 복문 이해 수준
   - 언어적 지시 수행 능력: 단계적 지시, 조건부 지시 이해
   - 화용적 이해: 맥락적 의미, 함축적 의미 파악 능력
   - 각 하위 영역별 강점과 약점의 구체적 분석
   ${age ? `- ${age}개월 아동의 수용언어 발달 수준 해석` : ''}

3. **표현언어 영역 정밀 분석** (400자 이상)
   - 어휘 표현 능력: 어휘량, 어휘 다양성, 정확성 평가
   - 문법적 표현: 형태소 사용, 문장 구조, 시제 표현 등
   - 구문 표현: 문장 길이, 복잡성, 연결어 사용 등
   - 의사소통 의도 표현: 요구, 거부, 정보 전달, 감정 표현
   - 담화 능력: 이야기 구성, 순서적 설명, 경험 나누기
   ${age ? `- ${age}개월 아동의 표현언어 발달 수준 해석` : ''}

4. **문항별 상세 패턴 분석** (350자 이상)
   - 개별 문항 응답에서 나타나는 특이한 패턴
   - 발달 순서상 예상과 다른 응답의 의미
   ${age ? `- ${age}개월 기대 수준과의 차이점 분석` : '- 연령대별 기대 수준과의 차이점 분석'}
   - 언어발달 지연 또는 편차의 구체적 근거
   - 개인적 강점과 관심 영역 식별

5. **발달적 맥락과 예후 평가** (300자 이상)
   - 현재 발달 단계에서의 과제와 도전
   ${age ? `- ${age}개월 아동의 향후 3-6개월 예상 발달 경로` : '- 향후 3-6개월 예상 발달 경로'}
   - 잠재적 위험 요인과 보호 요인 분석
   - 조기 개입의 필요성과 효과 예측

6. **구체적이고 실행 가능한 발달 지원 전략** (500자 이상)
   ${age ? `- **${age}개월 아동에게 맞춤형 일상생활 언어자극법**: ` : '- **일상생활 언어자극법**: '}
     * 식사, 목욕, 놀이 시간별 구체적 방법
     * 상황별 언어 입력 증진 기술
   ${age ? `- **${age}개월 발달 수준에 맞는 놀이를 통한 언어발달 촉진**:` : '- **놀이를 통한 언어발달 촉진**:'}
     * 발달 수준에 맞는 놀이 활동 제안
     * 교구와 교재 활용법
   - **부모-아동 상호작용 개선**:
     * 효과적인 언어적 반응 기법
     * 아동 주도적 상호작용 유도법
   - **환경 조성 및 일과 구조화**:
     * 언어 친화적 환경 만들기
     * 예측 가능한 일과와 루틴 구축

7. **전문적 권고사항 및 추후 계획** (350자 이상)
   - 언어치료 전문가 상담의 필요성과 시급성 평가
   - 추가 평가(청각, 인지, 사회성 등) 권고 여부
   - 정기적 재평가 일정과 관찰 포인트
   - 타 전문가(소아과, 이비인후과 등) 연계 필요성
   - 가족 교육 프로그램 참여 권장사항
   ${age ? `- ${age}개월 아동의 발달 특성을 고려한 후속 조치` : ''}

**작성 지침:**
- 전문적 근거와 이론적 배경을 포함한 분석
- 부모가 이해하기 쉬운 구체적이고 실용적인 조언
- 희망적이고 격려적인 톤으로 작성
- 개별 아동의 고유성과 가능성 강조
${age ? `- ${age}개월 아동의 발달 단계를 고려한 맞춤형 권고사항 제공` : ''}
- 총 분석 내용 2500자 이상으로 상세하게 작성
- 각 권고사항은 즉시 실행 가능한 수준으로 구체화

**중요 면책사항**: 이 검사는 선별 목적의 평가이며, 정확한 진단을 위해서는 전문기관에서의 종합적 평가가 필요함을 안내해주세요.`;

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
            content: '당신은 영유아 언어발달 전문가입니다. 언어치료사, 언어병리학자의 관점에서 검사 결과를 상세히 분석하고 전문적인 해석과 구체적인 발달 지원 방안을 제공합니다.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API 오류:', response.status, errorText);
      throw new Error(`OpenAI API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('AI 분석 생성 완료');

    return new Response(JSON.stringify({ 
      analysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('언어발달 분석 오류:', error);
  return new Response(JSON.stringify({ 
      error: 'AI 분석 생성 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});