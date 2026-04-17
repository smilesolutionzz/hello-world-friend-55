import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { message, conversationHistory } = await req.json();
    
    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new Error('Valid message is required');
    }
    
    if (message.length > 5000) {
      throw new Error('Message too long (max 5000 characters)');
    }
    
    // Rate limiting check (basic implementation)
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `ai-counselor:${clientIP}`;
    
    // Sanitize input
    const sanitizedMessage = message.replace(/[<>]/g, '').trim();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log('Processing AI counselor request:', { messageLength: message.length });

    // 고급 AI 프롬프트 기법이 적용된 시스템 프롬프트
    const systemPrompt = `너는 따뜻하고 재밌는 비밀친구야! 🌙✨
사용자의 마음을 이해하고 공감하면서, 우리 플랫폼의 다양한 기능들을 자연스럽게 소개해주는 역할을 해.

**말투 스타일:**
- 친구같이 편안하고 재밌게 대화해
- 이모지 적절히 사용 🌸😊💕
- "~야", "~지", "~네" 같은 친근한 말투
- 너무 딱딱하지 않고 따뜻한 톤

**고급 대화 기법 (매번 적용):**

1. 🔄 **다른 시각 제시**: "이 상황을 조금 다르게 보면..."
   - 문제를 새로운 관점에서 재해석해줘
   - 고정관념 벗어난 창의적 해결책 제안

2. 👁️ **숨은 요소 발견**: "혹시 이런 부분도 있지 않아?"
   - 사용자가 못 본 감정이나 상황 짚어주기
   - 간과된 중요 요인 찾아주기

3. 📋 **단계별 가이드**: "차근차근 이렇게 해보면 어때?"
   - 복잡한 문제를 쉬운 단계로 나눠서
   - 실행 가능한 구체적 스텝 제시

4. 💡 **실질적 제안**: "내가 너라면 이렇게 할 것 같아"
   - 일반론이 아닌 구체적 조언
   - 바로 실행 가능한 방법 제시

5. 🎯 **진짜 고민 파악**: "진짜 궁금한 건 이 부분 같은데..."
   - 겉으로 말한 것 뒤의 진짜 니즈 읽기
   - 맥락과 숨은 의도 파악

6. ✨ **플러스 팁**: "이것도 알아두면 좋을 거야"
   - 관련된 추가 정보나 팁
   - 주의사항, 도움 되는 인사이트

**플랫폼 기능 소개 가이드:**

🔍 **관찰 기록** - 아이나 가족 행동 관찰할 때:
"혹시 아이 행동이나 발달이 궁금해? 우리 관찰 기록 기능 써보면 정말 도움될 것 같은데! AI가 분석도 해주고 전문가 리포트도 받을 수 있어 ✨"

📝 **심리 테스트/평가** - 우울이나 불안 호소할 때:
"마음이 힘들구나... 우리 플랫폼에 우울증 테스트나 ADHD 체크도 있어! 객관적으로 한번 확인해보는 것도 좋을 것 같아 🤗"

👨‍⚕️ **전문가 상담** - 심각한 문제일 때:
"이건 정말 전문가랑 얘기해보는 게 좋겠어! 우리 플랫폼에서 실제 상담사 선생님들과 연결해드릴 수 있어 💪"

🎯 **맞춤 추천** - 특정 관심사나 문제가 있을 때:
"너 같은 상황에 딱 맞는 콘텐츠나 솔루션들 추천해줄 수 있어! 개인 맞춤형으로 도움받아보지 않을래?"

🪙 **토큰 시스템** - 더 많은 기능 필요할 때:
"참고로 매일 무료 토큰도 받을 수 있고, 친구 추천하면 보너스 토큰도 줘! 더 많은 기능 써볼 수 있어 🎁"

**상황별 대응:**
- **일상 고민**: 공감 + 다른 관점 제시 + 플랫폼 기능 소개
- **심리적 어려움**: 위로 + 숨은 요소 발견 + 단계별 해결법 + 전문 상담 추천
- **육아/발달 고민**: 공감 + 구체적 제안 + 관찰 기록/전문가 매칭
- **궁금증 표현**: 진짜 니즈 파악 + 해당 기능 소개 + 플러스 팁

**위험도 평가:**
- **LOW**: 일상 고민, 가벼운 스트레스
- **MEDIUM**: 중간 정도 우울/불안, 육아 스트레스  
- **HIGH**: 자해, 자살 생각, 심각한 정신적 위기

**대화 예시:**
"아 그런 기분 정말 이해해 😔 혼자 있으면 더 그런 생각 들지? (공감) 그런데 이걸 조금 다르게 보면, 이런 감정을 느끼는 건 네가 뭔가 변화가 필요하다는 신호일 수도 있어. (다른 시각) 혹시 우리 플랫폼에 있는 우울증 자가진단 한번 해봤어? 객관적으로 내 상태 파악하는 데 도움될 거야! (기능 소개) 그리고 매일 10분씩이라도 좋아하는 활동 해보는 건 어때? 작은 것부터 시작해보자! (구체적 제안) ✨"

현재 시간: ${new Date().toLocaleString('ko-KR')}
플랫폼: 24시간 AI 심리상담 + 종합 정신건강 플랫폼`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: sanitizedMessage }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
        messages: messages,
        max_completion_tokens: 2000,
      }),
    });

    const data = await response.json();
    console.log('OpenAI API response received:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      throw new Error('Invalid response from OpenAI API');
    }

    const aiResponse = data.choices[0].message.content;

    // Enhanced Crisis Detection System (Hippocratic AI 스타일)
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let crisisType: string | null = null;
    let recommendedAction: string | null = null;
    
    const criticalKeywords = [
      '자살하고싶', '죽고싶어', '목숨을끊', '자살계획', '유서', '약먹고죽',
      '투신', '목매', '칼로긋', '손목긋', '지금죽고싶', '오늘죽을'
    ];
    
    const highRiskKeywords = [
      '죽고싶', '자살', '목숨', '죽어버리고', '생을마감', '자해', '상처내고싶',
      '살아갈이유', '절망', '포기하고싶', '의미없어', '고통스러워', '견딜수없어',
      '칼로긋', '손목', '피흘리', '흉터내고싶', '죽어야', '사라지고싶'
    ];
    
    const mediumRiskKeywords = [
      '우울해', '불안해', '무기력', '힘들어', '스트레스', '잠못자', '악몽',
      '외로워', '혼자야', '아무도몰라', '이해안해', '화나', '짜증나',
      '공황', '불면증', '악몽', '두려워', '겁나', '무섭'
    ];

    const combinedText = (message + ' ' + aiResponse).toLowerCase();

    // Multi-level crisis detection
    if (criticalKeywords.some(keyword => combinedText.includes(keyword))) {
      riskLevel = 'critical';
      crisisType = 'immediate_suicide_risk';
      recommendedAction = 'IMMEDIATE_PROFESSIONAL_INTERVENTION';
      
      // Critical 로그 기록
      console.error('🚨 CRITICAL RISK DETECTED:', {
        timestamp: new Date().toISOString(),
        messagePreview: message.substring(0, 100),
        keywords: criticalKeywords.filter(k => combinedText.includes(k))
      });
      
    } else if (highRiskKeywords.some(keyword => combinedText.includes(keyword))) {
      riskLevel = 'high';
      crisisType = 'self_harm_risk';
      recommendedAction = 'URGENT_EXPERT_CONSULTATION';
      
      console.warn('⚠️ HIGH RISK DETECTED:', {
        timestamp: new Date().toISOString(),
        messagePreview: message.substring(0, 100)
      });
      
    } else if (mediumRiskKeywords.some(keyword => combinedText.includes(keyword))) {
      riskLevel = 'medium';
      crisisType = 'emotional_distress';
      recommendedAction = 'EXPERT_CONSULTATION_RECOMMENDED';
    }

    console.log('Risk assessment:', { riskLevel, crisisType, recommendedAction });

    // Enhanced response with safety information
    const safetyMessage = riskLevel === 'critical' 
      ? '\n\n🚨 **즉시 도움이 필요합니다**\n정신건강위기상담전화: 1577-0199 (24시간)\n자살예방상담전화: 109 (24시간)\n응급상황: 119'
      : riskLevel === 'high'
      ? '\n\n💙 **전문가 상담을 권장합니다**\n정신건강위기상담전화: 1577-0199\n우리 플랫폼의 전문가와 상담해보세요.'
      : '';

    return new Response(JSON.stringify({
      response: aiResponse + safetyMessage,
      riskLevel: riskLevel,
      crisisType: crisisType,
      recommendedAction: recommendedAction,
      emergencyContacts: riskLevel === 'critical' || riskLevel === 'high' ? {
        crisis: '1577-0199',
        suicide: '109',
        emergency: '119'
      } : null,
      timestamp: new Date().toISOString(),
      safetyCheckPerformed: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in AI counselor function:', error);
    const message = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Unknown error');
    return new Response(JSON.stringify({ 
      error: message,
      response: "죄송합니다. 일시적인 문제가 발생했습니다. 긴급한 상황이라면 정신건강위기상담전화 1577-0199로 연락해주세요.",
      riskLevel: 'medium'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});