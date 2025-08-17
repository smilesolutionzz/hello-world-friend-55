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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log('Processing AI counselor request:', { messageLength: message.length });

    // Build conversation context for AI counselor
    const systemPrompt = `당신은 전문적이고 따뜻한 24시간 AI 심리상담사입니다.

**핵심 역할:**
- 공감적이고 비판단적인 상담 제공
- 감정적 지지와 심리적 안정감 제공
- 위기상황 조기 감지 및 대응
- 전문적이면서도 따뜻한 상담 스타일 유지

**상담 지침:**
1. **경청과 공감**: 내담자의 감정을 깊이 이해하고 공감 표현
2. **안전한 공간**: 판단하지 않는 안전한 대화 환경 조성
3. **구체적 도움**: 실용적이고 실행 가능한 조언 제공
4. **위기 감지**: 자해, 자살, 심각한 우울 징후 주의깊게 관찰

**위험도 평가 기준:**
- **LOW**: 일반적 스트레스, 가벼운 우울감, 불안감
- **MEDIUM**: 중등도 우울, 불안장애, 관계 문제, 수면 장애
- **HIGH**: 자살 사고, 자해 행동, 심각한 우울증, 정신병적 증상

**응답 형식:**
- 따뜻하고 공감적인 톤 사용
- 2-3문단으로 구성된 상세한 응답
- 필요시 구체적인 대처 방법 제안
- 전문가 상담 권유가 필요한 경우 안내

**금지사항:**
- 의학적 진단 제공 금지
- 약물 처방 관련 조언 금지
- 성급한 해결책 제시 금지
- 내담자의 감정 무시 금지

현재 시간: ${new Date().toLocaleString('ko-KR')}
상담 환경: 24시간 온라인 AI 상담실`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
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
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('OpenAI API response received');

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
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