import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `당신은 양육과 심리학 분야의 명언 전문가입니다. 
부모, 양육자, 교육자에게 영감을 주는 명언을 제공합니다.
반드시 다음 형식으로만 응답하세요:
{"quote": "명언 내용", "author": "저자명"}

명언은 한국어로 작성하고, 다음 주제 중 하나를 다루세요:
- 아이의 성장과 발달
- 부모의 역할과 사랑
- 심리적 건강과 마음 돌봄
- 교육과 양육의 지혜
- 인내와 기다림의 가치`
          },
          {
            role: 'user',
            content: '양육이나 심리에 관한 영감을 주는 명언 하나를 알려주세요. 매번 다른 명언을 제공해주세요.'
          }
        ],
        temperature: 1.0,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      // Fallback quotes
      const fallbackQuotes = [
        { quote: "아이는 사랑받는 만큼 자랍니다.", author: "알프레드 아들러" },
        { quote: "교육의 목적은 마음을 채우는 것이 아니라 마음을 열어주는 것입니다.", author: "W.B. 예이츠" },
        { quote: "아이들은 우리가 가르치는 대로가 아니라 우리가 사는 대로 배웁니다.", author: "제임스 볼드윈" },
        { quote: "인내는 쓰지만 그 열매는 달다.", author: "아리스토텔레스" },
        { quote: "가장 좋은 선물은 함께하는 시간입니다.", author: "작자 미상" },
      ];
      const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      
      return new Response(JSON.stringify(randomQuote), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let quoteData;
    try {
      quoteData = JSON.parse(content);
    } catch {
      quoteData = { quote: content, author: "AI" };
    }

    return new Response(JSON.stringify(quoteData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        quote: "기다림은 인내의 씨앗을 심는 것입니다.", 
        author: "작자 미상" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  }
});
