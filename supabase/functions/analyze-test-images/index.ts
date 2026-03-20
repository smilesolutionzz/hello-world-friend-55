import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images } = await req.json();

    if (!images || images.length === 0) {
      throw new Error("이미지가 제공되지 않았습니다.");
    }

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Gemini Vision으로 이미지 분석
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `다음 이미지들은 심리검사, 발달검사, 또는 관련 평가 결과지입니다. 
이미지를 분석하여 다음 정보를 추출해주세요:
1. 검사 종류 (예: ADHD 검사, 우울증 검사, 발달평가 등)
2. 주요 점수 및 수치
3. 결과 해석
4. 특이사항
5. 권장사항

구체적이고 정확하게 추출해주세요.`
              },
              ...images.map((img: string) => ({
                type: 'image_url',
                image_url: {
                  url: img
                }
              }))
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI 분석 실패: ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "분석 결과를 가져올 수 없습니다.";

    return new Response(JSON.stringify({ 
      success: true,
      analysis: analysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("이미지 분석 오류:", errorMessage);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
