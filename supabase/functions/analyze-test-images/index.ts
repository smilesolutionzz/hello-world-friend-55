import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new Error('이미지가 제공되지 않았습니다');
    }

    console.log(`이미지 분석 시작: ${images.length}개의 이미지`);

    // Lovable AI를 사용하여 이미지 분석
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
            content: '당신은 심리·발달 검사 결과를 분석하는 전문가입니다. 제공된 검사 결과 이미지를 분석하여 주요 점수, 영역별 결과, 특이사항을 추출하고 요약해주세요.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '다음 검사 결과 이미지들을 분석하여 다음 내용을 추출해주세요:\n\n1. 검사 종류 및 날짜\n2. 주요 점수 및 수치\n3. 영역별 결과 (예: 인지, 언어, 사회성 등)\n4. 특이사항 및 주의사항\n5. 전문가 코멘트 (있다면)\n\n각 검사 결과를 명확히 구분하여 정리해주세요.'
              },
              ...images.map((imageUrl: string) => ({
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }))
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limits exceeded');
      }
      if (response.status === 402) {
        throw new Error('payment_required: Lovable AI 크레딧이 부족합니다');
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI 분석 실패: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error('AI 분석 결과가 비어있습니다');
    }

    console.log('이미지 분석 완료');

    return new Response(
      JSON.stringify({
        success: true,
        analysis
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('이미지 분석 오류:', error);
    
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    const isPaymentError = errorMessage.includes('payment_required') || 
                          errorMessage.includes('Not enough credits');

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        isPaymentError
      }),
      {
        status: isPaymentError ? 402 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
