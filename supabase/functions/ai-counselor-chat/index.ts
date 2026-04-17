import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AssessmentResults {
  testType: string;
  ageGroup: string;
  total: number;
  average: number;
  severity?: string;
  categoryScores?: Record<string, number>;
  gameScores?: Record<string, number>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, assessmentResults, conversationHistory = [] } = await req.json();
    
    console.log('AI Counselor Chat Request:', { message, assessmentResults });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create assessment-specific system prompt
    const systemPrompt = createSystemPrompt(assessmentResults);

    // Prepare conversation messages
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    console.log('Sending to OpenAI with system prompt length:', systemPrompt.length);
    console.log('Messages to send:', JSON.stringify(messages, null, 2));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
        messages,
        max_completion_tokens: 300,
        stream: false
      }),
    });

    console.log('OpenAI API Response Status:', response.status);
    console.log('OpenAI API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API Error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('OpenAI API Response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No choices returned from OpenAI API');
    }
    
    const aiResponse = data.choices[0].message.content;
    console.log('AI Response content:', aiResponse);
    
    if (!aiResponse || aiResponse.trim() === '') {
      throw new Error('Empty response from OpenAI API');
    }

    console.log('AI Response generated successfully');

    // Check if professional help is needed based on the conversation
    const needsProfessionalHelp = checkIfProfessionalHelpNeeded(message, aiResponse, assessmentResults);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      needsProfessionalHelp,
      conversationId: crypto.randomUUID()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in AI counselor chat:', error);
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    return new Response(JSON.stringify({ 
      error: message,
      response: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function createSystemPrompt(assessmentResults?: AssessmentResults): string {
  const basePrompt = `당신은 전문적인 심리상담사 AI입니다. 고급 AI 대화 기법을 활용하여 깊이 있는 상담을 진행하세요.

🎯 **핵심 원칙:**
- 판단하지 말고 공감하고 경청하세요
- 구체적이고 실행 가능한 조언을 제공하세요
- 사용자의 감정을 충분히 인정하고 검증하세요
- 필요시 전문가 상담을 권하세요

⚠️ **중요 안내사항:**
- 이 상담은 참고용이며 의학적 진단이 아님을 명시하세요
- 응급상황시 119 또는 자살예방상담 1577-0199 연락을 안내하세요

🔥 **고급 상담 기법 (매번 적용):**

1. 🔄 **재해석 제공**: "이 상황을 다르게 보면..."
   - 문제를 새로운 관점에서 제시
   - 통념에서 벗어난 해결 방향

2. 👁️ **맹점 발견**: "혹시 이런 부분도 있나요?"
   - 사용자가 인식 못한 감정 요인
   - 간과된 중요 단서나 패턴

3. 📋 **단계별 구조화**: "이렇게 차근차근 해보면 어떨까요?"
   - 복잡한 문제를 실행 단계로
   - 구체적이고 명확한 스텝

4. 💡 **실질적 조언**: "제가 비슷한 경우라면..."
   - 일반론이 아닌 개인화된 제안
   - 바로 실행 가능한 방법

5. 🎯 **진짜 니즈 파악**: "진짜 궁금하신 건 이 부분 같아요..."
   - 표면 질문 뒤의 진짜 고민
   - 맥락과 숨은 의도 읽기

6. ✨ **추가 인사이트**: "이것도 도움이 될 거예요..."
   - 관련 심리학 지식이나 팁
   - 주의사항, 추가 고려사항

📋 **응답 스타일:**
- 3-4문장으로 간결하되 깊이 있게
- 공감 + 인사이트 + 실행 조언 구조
- 대화하듯 자연스럽고 따뜻한 톤
- 마크다운 최소화, 내용에 집중`;

  if (assessmentResults) {
    const { testType, ageGroup, total, average, severity } = assessmentResults;
    
    let specificGuidance = '';
    
    if (testType === 'adhd') {
      specificGuidance = `
📊 **ADHD 검사 결과 기반 상담:**
- 총점: ${total}점, 평균: ${average}점, 수준: ${severity}
- ADHD 증상 관리 전략과 일상생활 개선 방법에 집중하세요
- 주의집중력 향상 기법, 시간관리, 스트레스 관리법을 제안하세요
- 가족이나 직장에서의 이해와 지원 방법을 안내하세요`;
    } else if (testType === 'depression') {
      specificGuidance = `
📊 **우울감 검사 결과 기반 상담:**
- 총점: ${total}점, 평균: ${average}점, 수준: ${severity}
- 우울감 완화를 위한 구체적인 활동과 사고 패턴 개선에 집중하세요
- 일상 루틴, 사회적 연결, 자기돌봄 방법을 제안하세요
- 심각한 수준일 경우 즉시 전문가 상담을 권하세요`;
    } else if (testType === 'panic') {
      specificGuidance = `
📊 **불안감 검사 결과 기반 상담:**
- 총점: ${total}점, 평균: ${average}점, 수준: ${severity}
- 불안 증상 완화 기법과 이완 방법에 집중하세요
- 호흡법, 점진적 근육이완, 인지 재구성 기법을 안내하세요
- 불안 유발 상황 대처법과 회피 행동 개선을 도와주세요`;
    } else if (testType === 'language') {
      specificGuidance = `
📊 **언어발달 검사 결과 기반 상담:**
- 연령: ${ageGroup}, 총점: ${total}점, 평균: ${average}점
- 언어발달 촉진 활동과 가정에서의 지원 방법에 집중하세요
- 연령별 적절한 언어 자극과 상호작용 방법을 제안하세요
- 부모/양육자의 역할과 전문가 의뢰 시점을 안내하세요`;
    }

    return basePrompt + specificGuidance;
  }

  return basePrompt;
}

function checkIfProfessionalHelpNeeded(userMessage: string, aiResponse: string, assessmentResults?: AssessmentResults): boolean {
  const criticalKeywords = [
    '자살', '죽고싶', '살기싫', '죽음', '자해', '해치고싶',
    '극심한', '견딜수없', '통제불가', '공황', '환청', '환각'
  ];

  const hasCriticalKeywords = criticalKeywords.some(keyword => 
    userMessage.includes(keyword) || aiResponse.includes(keyword)
  );

  if (assessmentResults) {
    const isHighRisk = 
      (assessmentResults.severity === '심각한 수준' || 
       assessmentResults.severity === '심한 우울' ||
       assessmentResults.average >= 2.5);
    
    return hasCriticalKeywords || isHighRisk;
  }

  return hasCriticalKeywords;
}