import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  testType: string;
  score: number;
  maxScore: number;
  percentage: number;
  answers?: Record<string, string>;
  severity?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testType, score, maxScore, percentage, answers, severity }: AnalysisRequest = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // 검사 유형별 상세 프롬프트 생성
    const systemPrompt = generateSystemPrompt(testType);
    const userPrompt = generateUserPrompt(testType, score, maxScore, percentage, answers, severity);

    console.log('Calling OpenAI with prompts for test type:', testType);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 3000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const analysis = data.choices[0].message.content;

    // 연계 한의원 정보 생성
    const clinicInfo = generateClinicInfo(testType, severity);

    return new Response(JSON.stringify({
      success: true,
      analysis,
      clinicInfo,
      metadata: {
        testType,
        score: `${score}/${maxScore}`,
        percentage,
        severity,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in han-medicine-analyzer function:', error);
    
    // 에러 시 기본 분석 제공
    const fallbackAnalysis = generateFallbackAnalysis();
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      analysis: fallbackAnalysis,
      clinicInfo: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateSystemPrompt(testType: string): string {
  const basePrompt = `당신은 30년 경력의 전문 한의사입니다. 다음 조건에 따라 한의학적 분석을 제공해주세요:

1. 한의학 이론(음양오행, 장부변증, 경락이론)에 기반한 전문적 분석
2. 체질별 맞춤 치료법과 생활 관리법 제시  
3. 구체적이고 실용적인 조언
4. 따뜻하고 신뢰감 있는 어조
5. 2000자 이상의 매우 상세하고 전문적인 분석

분석 구조 (각 섹션을 상세히 작성):
🔍 **한의학적 병인 분석** (300자 이상)
- 오장육부별 기능 상태와 병리적 원인
- 음양 불균형과 기혈 순환 상태
- 체질적 취약점과 발병 메커니즘

⚖️ **장부별 상태 평가** (400자 이상)  
- 심(心): 정신기능과 혈액순환
- 간(肝): 소설기능과 혈액저장
- 비(脾): 운화기능과 수습대사
- 폐(肺): 호흡기능과 기의 선발
- 신(腎): 정기와 수액대사
- 각 장부의 허실 판정

🌿 **체질별 맞춤 치료법** (500자 이상)
- 태음인/소음인/소양인/태양인별 접근법
- 체질에 따른 치료 우선순위
- 개인별 맞춤 한약 처방 원리

📋 **단계별 치료 계획** (400자 이상)
- 1단계: 급성기 즉시 관리법 (1-2주)
- 2단계: 중기 체질 개선법 (1-3개월) 
- 3단계: 장기 건강 유지법 (3개월 이상)

💊 **구체적 한약재 추천** (400자 이상)
- 주요 처방명과 구성 약재
- 각 약재의 성미와 효능
- 복용법과 주의사항
- 체질별 가감 방법

🫴 **경혈 마사지 포인트** (300자 이상)
- 집에서 할 수 있는 경혈 자극법
- 각 경혈의 위치와 효능
- 마사지 시간과 방법
- 주의사항과 금기

🍽️ **식이요법 가이드** (400자 이상)
- 체질별 유익한 음식과 피해야 할 음식
- 구체적인 식단 예시
- 조리법과 섭취 시간
- 계절별 식이 조절법

🏃 **생활 관리법** (300자 이상)
- 운동법: 체질별 맞춤 운동
- 수면법: 숙면을 위한 구체적 방법
- 스트레스 관리: 명상과 호흡법
- 환경 관리: 주거와 작업 환경

🛡️ **예방 관리** (200자 이상)
- 재발 방지를 위한 생활 수칙
- 건강 증진을 위한 장기 계획
- 정기 검진과 모니터링 방법`;

  const typeSpecificPrompts = {
    adhd: `ADHD는 한의학에서 다음과 같이 접근합니다:
- 신(腎) 기능 저하로 인한 정신집중력 부족 - 선천적 정기 부족이 주원인
- 심(心)의 불안정으로 인한 과도한 활동성 - 심신불교로 인한 조급함과 산만함
- 비위(脾胃) 기능 약화로 인한 영양 흡수 장애 - 후천적 기혈 생성 부족
- 간(肝)의 소설기능 실조로 인한 감정 조절 어려움 - 기울증과 간양상항
- 뇌수 부족과 청규의 흐림으로 인한 인지기능 저하
- 담(膽)의 결단력 부족으로 인한 의지력 약화`,

    autism: `자폐 스펙트럼은 한의학에서 다음과 같이 분석됩니다:
- 신(腎) 정기 부족으로 인한 발달 지연 - 선천적 정수 부족이 핵심
- 심(心)의 신명 기능 장애로 인한 소통 어려움 - 심규폐색과 신명불청
- 비위(脾胃) 기능 저하로 인한 소화 문제 - 담탁 생성으로 인한 청규 몽폐
- 간(肝)의 조달 기능 실조로 인한 정서적 불안정 - 간기울결과 정신 불안
- 담허로 인한 용기와 결단력 부족
- 경락 불통으로 인한 감각 처리 장애`,

    atopy: `아토피는 한의학에서 다음과 같이 접근합니다:
- 폐(肺) 선발기능 저하로 인한 피부 방어력 약화 - 폐기허로 인한 위표불고
- 비위(脾胃) 운화기능 실조로 인한 습열 생성 - 습담내생으로 인한 피부 염증
- 간(肝) 소설기능 장애로 인한 스트레스 악화 - 간울화화로 인한 혈열
- 신(腎) 음허로 인한 피부 건조와 염증 - 신음부족으로 인한 허열상염
- 혈열과 풍습으로 인한 소양과 홍진
- 면역기능 실조로 인한 알레르기 반응`,

    intellectual: `인지능력 저하는 한의학에서 다음과 같이 분석됩니다:
- 신(腎) 정기 부족으로 인한 뇌 기능 저하 - 신정부족으로 인한 뇌수 공허
- 심(心)의 신명 기능 약화로 인한 기억력 감퇴 - 심혈부족과 심신불교
- 비위(脾胃) 기능 저하로 인한 청양불승 - 비허로 인한 기혈 생성 부족
- 간(肝) 울체로 인한 기혈 순환 장애 - 간기울결로 인한 청규 불청
- 담허로 인한 지혜와 판단력 저하
- 경락 불통으로 인한 뇌혈류 장애`,

    stress: `스트레스는 한의학에서 다음과 같이 접근합니다:
- 간(肝)의 소설기능 실조로 인한 기울증 - 정서적 억압으로 인한 간기울결
- 심(心)의 신명 불안으로 인한 정서적 동요 - 심신불교와 심화상염
- 비위(脾胃) 기능 저하로 인한 사려과도 - 비허로 인한 사려 과다
- 신(腎) 정기 부족으로 인한 정신력 약화 - 신정부족으로 인한 의지력 저하
- 담허로 인한 용기 부족과 불안감
- 기혈 운행 장애로 인한 전신 증상`
  };

  return basePrompt + '\n\n' + (typeSpecificPrompts[testType as keyof typeof typeSpecificPrompts] || '');
}

function generateUserPrompt(
  testType: string, 
  score: number, 
  maxScore: number, 
  percentage: number, 
  answers?: Record<string, string>, 
  severity?: string
): string {
  const testNames = {
    adhd: 'ADHD 검사',
    autism: '자폐 스펙트럼 검사', 
    atopy: '아토피 검사',
    intellectual: '인지능력 검사',
    stress: '스트레스 검사'
  };

  const testName = testNames[testType as keyof typeof testNames] || '한방 검사';

  return `다음 ${testName} 결과를 한의학적으로 분석해주세요:

📊 검사 결과:
- 총점: ${score}/${maxScore}점 (${percentage}%)
- 심각도: ${severity || '보통'}

🔍 상세 답변 분석:
${answers ? Object.entries(answers).map(([key, value], index) => 
  `질문 ${index + 1}: 점수 ${value}`
).join('\n') : '답변 데이터 없음'}

위 결과를 바탕으로 다음 내용을 포함하여 전문적인 한의학적 분석을 해주세요:

1. **한의학적 병인 분석**: 장부별 기능 상태와 병리적 원인
2. **체질별 접근법**: 사상체질에 따른 맞춤 치료법
3. **단계별 치료 계획**: 즉시 관리법, 중기 치료법, 장기 관리법
4. **구체적 한약재**: 주요 처방과 개별 약재의 효능
5. **경혈 마사지**: 집에서 할 수 있는 경혈 자극법
6. **생활 관리법**: 식이요법, 운동법, 수면법
7. **예방 관리**: 재발 방지와 건강 증진법

전문가로서 구체적이고 실용적인 조언을 부탁드립니다.`;
}

function generateClinicInfo(testType: string, severity?: string) {
  return {
    name: "가까이한의원",
    phone: "1588-1234", 
    address: "전국 네트워크",
    specialties: getTestSpecialties(testType),
    urgencyLevel: severity === '높음' ? 'urgent' : severity === '중간' ? 'moderate' : 'routine',
    consultationFee: "50,000원 (초회 30% 할인)",
    availableHours: "09:00-21:00 (연중무휴)",
    onlineBooking: "https://naver.me/xk1XPBhl",
    features: [
      "한의학 박사 전문의 진료",
      "개인 맞춤 한약 처방",
      "체질별 상담 프로그램", 
      "24시간 온라인 상담"
    ]
  };
}

function getTestSpecialties(testType: string): string[] {
  const specialties = {
    adhd: ["소아 신경발달", "집중력 장애", "과다활동 치료", "학습능력 향상"],
    autism: ["자폐 스펙트럼", "발달장애", "사회성 발달", "감각통합 치료"],
    atopy: ["아토피 피부염", "알레르기 체질", "면역력 강화", "피부 재생"],
    intellectual: ["인지기능 향상", "기억력 개선", "두뇌 발달", "학습장애"],
    stress: ["스트레스 관리", "불안장애", "우울감 개선", "정서적 안정"]
  };

  return specialties[testType as keyof typeof specialties] || ["종합 한방 진료"];
}

function generateFallbackAnalysis(): string {
  return `검사 결과 분석을 위해 잠시 시스템 점검 중입니다. 

🔍 **기본 한의학적 소견**:
검사 결과를 종합해보면, 전반적인 건강 상태와 체질적 특성을 파악할 수 있습니다. 한의학에서는 개인의 체질과 생활환경, 스트레스 수준 등을 종합적으로 고려하여 맞춤형 치료법을 제시합니다.

💊 **권장사항**:
- 정기적인 전문 한의사 상담을 통한 정확한 진단
- 개인 체질에 맞는 한약 처방과 생활 관리법
- 꾸준한 운동과 올바른 식습관 유지
- 충분한 휴식과 스트레스 관리

⚕️ **전문 상담**:
더 정확한 분석과 맞춤 치료를 위해 가까이한의원에서 전문 한의사와 상담받으시길 권합니다. 검사 결과를 바탕으로 한 정밀 진단과 개인별 맞춤 치료 계획을 제공받으실 수 있습니다.

📞 상담 예약: 1588-1234 또는 온라인 예약 시스템을 이용해주세요.`;
}