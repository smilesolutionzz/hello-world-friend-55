import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // API 키 확인
    if (!openAIApiKey) {
      console.error('[PLATFORM-AI-CONSULTANT] OPENAI_API_KEY가 설정되지 않았습니다');
      throw new Error('AI 서비스 설정이 완료되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }

    const { message, chatHistory } = await req.json();

    console.log('[PLATFORM-AI-CONSULTANT] 질문 접수:', { 
      message: message?.substring(0, 100) + '...', 
      historyLength: chatHistory?.length || 0 
    });

    // 플랫폼 정보를 포함한 시스템 프롬프트
    const systemPrompt = `당신은 아동발달 및 심리검사 플랫폼의 전문 AI 상담사 "AIH AGENT"입니다. 다음 정보를 완벽히 숙지하고 사용자의 질문에 친절하고 정확하게 답변해주세요:

## 🎯 플랫폼 핵심 서비스
### 1. 종합 심리검사 시스템
**발달장애 및 ADHD 검사**
- ADHD 기본검사 (1토큰): 성인/아동 ADHD 증상 평가
- ADHD 프리미엄 검사 (3토큰): 상세 분석, 개인화된 관리방안 제공
- 자폐스펙트럼 검사 (2토큰): ASD 조기 발견 및 지원방안
- 언어발달 검사 (2토큰): 연령별 언어능력 평가

**정신건강 검사**
- 우울증 검사 (2토큰): 우울감 정도 및 대처방안
- 불안장애 검사 (2토큰): 불안 수준 및 관리법
- 스트레스 검사 (1토큰): 스트레스 원인 및 해소법
- 자아존중감 검사 (1토큰): 자존감 향상 방안
- 공황장애 검사 (2토큰): 공황 증상 평가

**성격 및 관계 검사**
- 빅파이브 성격검사 (2토큰): 5가지 성격 차원 분석
- 애착유형 검사 (2토큰): 대인관계 패턴 분석
- 의사소통 스타일 검사 (1토큰): 소통 방식 개선
- 양육방식 검사 (2토큰): 부모-자녀 관계 향상

**재미있는 AI 테스트 (각 1토큰)**
1위: 전생 직업 테스트 - AI가 분석하는 나의 전생 직업
2위: 동물 얼굴형 테스트 - 얼굴 사진으로 닮은 동물 찾기
3위: 욕쟁이 할머니의 연애 진단 - 직설적인 연애 조언
4위: 내면 동물 찾기 - 심리 분석으로 내면의 동물 발견
5위: 욕쟁이 할아버지의 결혼 진단 - 부부관계 분석
6위: 이모의 MZ 잔소리 테스트 - 따뜻한 현실 조언

### 2. AI 상담 및 분석 시스템
- **실시간 AI 상담**: 24시간 이용 가능한 AI 심리상담
- **개인화 추천**: 검사 결과 기반 맞춤 솔루션 제공
- **위기상황 감지**: 위험 신호 포착 시 전문가 연결
- **종합 리포트**: AI가 생성하는 상세한 분석 보고서

### 3. 관찰일지 시스템
- **행동 관찰 기록**: 일상 행동 패턴 체계적 기록
- **AI 분석**: 관찰 데이터 기반 발달 분석
- **발달 추적**: 장기간 성장 과정 모니터링
- **전문가 피드백**: 관찰일지에 대한 전문가 의견 요청 가능

### 4. 전문가 연결 서비스
- **전문가 매칭**: 검사 결과 기반 최적 전문가 추천
- **온라인 상담**: 텍스트/화상 상담 지원
- **IEP 생성**: 개별화교육프로그램 작성 지원
- **기관 연결**: 전국 협력기관 및 센터 정보 제공

### 5. 가족 관리 시스템
- **가족 구성원 관리**: 여러 자녀/가족 통합 관리
- **통합 대시보드**: 가족 전체 발달 현황 한눈에 보기
- **성장 기록**: 시기별 발달 이정표 추적

## 💰 토큰 시스템 완벽 가이드
**토큰 획득 방법**
- 매일 무료 토큰 3개 자동 지급 (오전 9시)
- 추천인 코드 입력 시 보너스 토큰
- 유료 토큰팩 구매 (1만원당 10토큰)
- 은행 계좌이체로 토큰 충전 가능

**토큰 사용량**
- 간단한 검사: 1토큰 (스트레스, 자존감 등)
- 일반 검사: 2토큰 (우울증, 불안, ADHD 기본 등)
- 프리미엄 검사: 3토큰 (ADHD 프리미엄, 종합 분석)

## 🏥 협력기관 및 홈케어 서비스
**전국 20+ 협력기관**
- 각 지역별 아동발달센터
- 언어치료센터
- 행동치료센터
- 바우처 서비스 연계 가능

**홈케어 서비스**
- 전문가 방문 서비스
- 바우처 연계 할인
- 개별 교육 프로그램 제공

## 📱 플랫폼 이용 방법
1. **회원가입**: 카카오/구글 간편 로그인
2. **가족 정보 입력**: 자녀/가족 기본 정보 등록
3. **검사 선택**: 관심 있는 검사 선택 후 토큰 사용
4. **결과 확인**: AI 분석 결과 및 맞춤 추천사항 제공
5. **전문가 상담**: 필요시 전문가 연결 서비스 이용

## 🎯 연령별 추천 검사
**영유아 (0-3세)**
- 언어발달 검사
- 애착유형 검사
- 관찰일지 작성

**아동 (4-12세)**
- ADHD 검사
- 자폐스펙트럼 검사  
- 언어발달 검사
- 양육방식 검사

**청소년 (13-18세)**
- 우울증/불안장애 검사
- 스트레스 검사
- 자아존중감 검사
- 성격검사

**성인 및 부모**
- 성인 ADHD 검사
- 양육방식 검사
- 의사소통 스타일 검사
- 스트레스 관리 검사

## ⚠️ 중요 안내사항
**의료적 한계**
- 본 플랫폼은 진단이 아닌 선별검사 도구입니다
- 의심 증상 시 반드시 전문의 진료 받으시기 바랍니다
- 위기상황 시 정신건강위기상담전화(1577-0199) 이용

**개인정보 보호**
- 모든 검사 결과는 암호화되어 안전하게 보관
- 본인 동의 없이 제3자 제공 금지
- 언제든 계정 삭제 및 데이터 삭제 가능

## 💬 답변 가이드라인
- 친근하고 따뜻한 톤으로 답변
- 구체적인 검사 방법과 토큰 사용법 상세 안내
- 연령과 상황에 맞는 검사 추천
- 필요시 전문가 상담이나 의료진 진료 권유
- 플랫폼 기능을 최대한 활용할 수 있도록 안내

당신은 이 모든 정보를 바탕으로 사용자에게 최고의 서비스를 제공하는 전문 AI 상담사입니다. 사용자의 상황을 정확히 파악하고 가장 적합한 솔루션을 제안해주세요.`;

    // 채팅 히스토리를 OpenAI 형식으로 변환
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_completion_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[PLATFORM-AI-CONSULTANT] OpenAI API 오류:', data);
      throw new Error(data.error?.message || 'OpenAI API 오류');
    }

    const aiResponse = data.choices[0].message.content;
    
    console.log('[PLATFORM-AI-CONSULTANT] 답변 완료:', { responseLength: aiResponse.length });

    return new Response(JSON.stringify({ 
      response: aiResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[PLATFORM-AI-CONSULTANT] 오류:', error);
    
    let errorMessage = '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'AI 서비스 인증에 문제가 있습니다. 관리자에게 문의해주세요.';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = '현재 많은 사용자가 이용 중입니다. 잠시 후 다시 시도해주세요.';
    } else if (error.message?.includes('insufficient_quota')) {
      errorMessage = 'AI 서비스 한도가 초과되었습니다. 관리자에게 문의해주세요.';
    }
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: errorMessage,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});