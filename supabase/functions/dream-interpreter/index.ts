import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { dreamText } = await req.json();

    if (!dreamText) {
      return new Response(JSON.stringify({ error: '꿈 내용을 입력해주세요.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `당신은 전문적인 꿈 해몽 상담사입니다. 

다음 지침을 따라 꿈을 해석해주세요:

1. **꿈의 주요 상징들을 분석**
   - 등장인물, 장소, 물건, 상황의 의미
   - 색깔, 숫자, 동물 등의 상징적 의미

2. **감정과 심리상태 해석**
   - 꿈에서 느낀 감정의 의미
   - 현재 심리상태와의 연관성

3. **일상생활과의 연관성**
   - 현실의 고민이나 상황과의 관계
   - 무의식적 욕구나 두려움의 표출

4. **긍정적 메시지와 조언**
   - 성장과 발전을 위한 통찰
   - 실생활에 적용할 수 있는 조언

**답변 형식:**
- 따뜻하고 공감적인 톤으로 작성
- 구체적이고 개인적인 해석 제공
- 3-4개 문단으로 구성 (약 300-400자)
- 꿈의 긍정적 의미에 초점을 맞춰 마무리

**주의사항:**
- 부정적이거나 불안을 조장하는 해석은 피하기
- 의학적 진단이나 예언은 하지 않기
- 개인의 성장과 자아 성찰에 도움이 되도록 해석`
          },
          {
            role: 'user',
            content: `다음 꿈을 해석해주세요:\n\n${dreamText}`
          }
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API 요청 실패');
    }

    const data = await response.json();
    const interpretation = data.choices[0].message.content;

    return new Response(JSON.stringify({ interpretation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in dream-interpreter function:', error);
    return new Response(JSON.stringify({ error: '꿈 해몽 분석 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});