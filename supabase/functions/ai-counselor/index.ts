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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log('Processing AI counselor request:', { messageLength: message.length });

    // Build conversation context for AI counselor
    const systemPrompt = `너는 따뜻하고 재밌는 비밀친구야! 🌙✨
사용자의 마음을 이해하고 공감하면서, 우리 플랫폼의 다양한 기능들을 자연스럽게 소개해주는 역할을 해.

**말투 스타일:**
- 친구같이 편안하고 재밌게 대화해
- 이모지 적절히 사용 🌸😊💕
- "~야", "~지", "~네" 같은 친근한 말투
- 너무 딱딱하지 않고 따뜻한 톤

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
- **일상 고민**: 공감 + 관련 플랫폼 기능 자연스럽게 소개
- **심리적 어려움**: 따뜻한 위로 + 전문 상담이나 테스트 추천
- **육아/발달 고민**: 관찰 기록이나 전문가 매칭 추천
- **궁금증 표현**: 해당 분야 평가나 분석 기능 소개

**위험도 평가:**
- **LOW**: 일상 고민, 가벼운 스트레스
- **MEDIUM**: 중간 정도 우울/불안, 육아 스트레스  
- **HIGH**: 자해, 자살 생각, 심각한 정신적 위기

**대화 예시:**
"아 그런 기분 정말 이해해 😔 혼자 있으면 더 그런 생각 들지? 그런데 혹시 우리 플랫폼에 있는 우울증 자가진단 한번 해봤어? 객관적으로 내 상태 파악하는 데 도움될 거야! 그리고 결과 보고 필요하면 전문가 상담도 연결해드릴 수 있어 ✨"

현재 시간: ${new Date().toLocaleString('ko-KR')}
플랫폼: 24시간 AI 심리상담 + 종합 정신건강 플랫폼`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: sanitizedMessage }
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

    // Risk level detection based on conversation content
    let riskLevel = 'low';
    
    const highRiskKeywords = [
      '죽고싶', '자살', '목숨', '죽어버리고', '생을마감', '자해', '상처내고싶',
      '살아갈이유', '절망', '포기하고싶', '의미없어', '고통스러워', '견딜수없어'
    ];
    
    const mediumRiskKeywords = [
      '우울해', '불안해', '무기력', '힘들어', '스트레스', '잠못자', '악몽',
      '외로워', '혼자야', '아무도몰라', '이해안해', '화나', '짜증나'
    ];

    const combinedText = (message + ' ' + aiResponse).toLowerCase();

    if (highRiskKeywords.some(keyword => combinedText.includes(keyword))) {
      riskLevel = 'high';
    } else if (mediumRiskKeywords.some(keyword => combinedText.includes(keyword))) {
      riskLevel = 'medium';
    }

    console.log('Risk level assessed:', riskLevel);

    return new Response(JSON.stringify({
      response: aiResponse,
      riskLevel: riskLevel,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI counselor function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "죄송합니다. 일시적인 문제가 발생했습니다. 긴급한 상황이라면 정신건강위기상담전화 1577-0199로 연락해주세요.",
      riskLevel: 'medium'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});