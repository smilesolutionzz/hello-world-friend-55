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
    const { message, chatHistory } = await req.json();

    console.log('[PLATFORM-AI-CONSULTANT] 질문 접수:', { message });

    // 플랫폼 정보를 포함한 시스템 프롬프트
    const systemPrompt = `당신은 아동발달 및 심리검사 플랫폼의 전문 AI 상담사입니다. 다음 정보를 숙지하고 사용자의 질문에 친절하고 정확하게 답변해주세요:

## 플랫폼 주요 기능
1. **다양한 심리검사**
   - ADHD 검사 (아동/성인)
   - 우울증 검사  
   - 불안장애 검사
   - 스트레스 검사
   - 언어발달 검사
   - 애착유형 검사
   - 빅파이브 성격검사
   - 사상체질 검사
   - 자아존중감 검사
   - 동물 얼굴형 테스트 등

2. **AI 상담 시스템**
   - 실시간 AI 심리상담
   - 개인화된 분석 및 추천
   - 위기상황 감지 및 전문가 연결

3. **토큰 시스템**
   - 검사당 1-3토큰 소모
   - 일일 무료 토큰 3개 지급
   - 추가 토큰 구매 가능
   - 추천인 시스템으로 보너스 토큰

4. **전문가 서비스**
   - 전문가 매칭 및 상담
   - 종합 리포트 작성
   - IEP 생성 지원

5. **관찰일지 시스템**
   - 아동 행동 관찰 기록
   - AI 분석 및 피드백
   - 발달 추적 관리

6. **가족 관리**
   - 가족 구성원 추가
   - 통합 대시보드
   - 발달 현황 모니터링

## 답변 가이드라인
- 친근하고 전문적인 톤으로 답변
- 구체적인 검사 방법이나 토큰 사용법 안내
- 필요시 관련 전문가 상담 권유
- 개인정보는 수집하지 않음을 안내
- 의료적 진단은 전문의와 상담하도록 권유

## 주의사항
- 의료적 진단이나 처방은 절대 하지 않음
- 위기상황 시 즉시 전문기관 연락 권유
- 개인정보 보호 준수
- 연령에 맞는 적절한 검사 추천

사용자의 질문에 대해 이 정보를 바탕으로 도움이 되는 답변을 제공해주세요.`;

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
        model: 'gpt-4.1-2025-04-14',
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

  } catch (error) {
    console.error('[PLATFORM-AI-CONSULTANT] 오류:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});