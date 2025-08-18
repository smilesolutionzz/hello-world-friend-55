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
    const { name, birthDate, birthTime, gender, birthCity } = await req.json();

    if (!name || !birthDate || !birthTime || !gender || !birthCity) {
      return new Response(JSON.stringify({ error: '모든 정보를 입력해주세요.' }), {
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 전문적인 사주명리학 상담사입니다. 

다음 지침을 따라 사주를 분석해주세요:

1. **기본 정보 분석**
   - 생년월일시를 바탕으로 천간지지 파악
   - 오행(목화토금수)의 균형 분석
   - 십신(정관, 편관, 정재, 편재 등)의 배치

2. **성격과 기질 분석**
   - 타고난 성향과 재능
   - 강점과 약점 파악
   - 대인관계의 특징

3. **운세 전망**
   - 현재 운기의 흐름
   - 향후 1년간의 전체적인 운세
   - 연애/결혼, 직업/사업, 건강, 재물운 분야별 분석

4. **조언과 개운법**
   - 부족한 오행을 보완하는 방법
   - 좋은 방향, 색깔, 숫자 등
   - 일상에서 실천할 수 있는 조언

**답변 형식:**
- 친근하고 희망적인 톤으로 작성
- 구체적이고 실용적인 조언 제공
- 4-5개 문단으로 구성 (약 400-500자)
- 긍정적인 메시지로 마무리

**주의사항:**
- 지나치게 부정적이거나 불안을 조장하는 내용은 피하기
- 의학적 진단이나 단정적인 예언은 하지 않기
- 개인의 노력과 의지의 중요성을 강조`
          },
          {
            role: 'user',
            content: `다음 정보로 사주를 분석해주세요:

이름: ${name}
성별: ${gender === 'male' ? '남성' : '여성'}
생년월일: ${birthDate}
태어난 시간: ${birthTime}
태어난 곳: ${birthCity}

위 정보를 바탕으로 종합적인 사주 분석을 해주세요.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API 요청 실패');
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in saju-analyzer function:', error);
    return new Response(JSON.stringify({ error: '사주 분석 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});