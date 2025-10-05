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
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { userLevel = 'intermediate', goals = '체력 증진', duration = 30 } = await req.json();

    console.log('Generating personalized workout plan...');

    // Generate workout plan with AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: '당신은 전문 트레이너입니다. 핵심만 간결하게 1000자 이내로 작성하세요.'
          },
          {
            role: 'user',
            content: `오늘 날짜: ${new Date().toLocaleDateString('ko-KR')}
레벨: ${userLevel}, 목표: ${goals}, 시간: ${duration}분

운동 플랜을 다음 형식으로 1000자 이내로 작성:

## 플랜 제목
[한 줄 제목]

## 준비운동 (5분)
[핵심 동작 3-4가지]

## 메인 운동 (${duration - 10}분)
**운동 1:** [이름] - [세트 x 횟수]
**운동 2:** [이름] - [세트 x 횟수]
**운동 3:** [이름] - [세트 x 횟수]

## 마무리 (5분)
[스트레칭 2-3가지]

## 효과
• [효과 1]
• [효과 2]
• [효과 3]`
          }
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const workoutPlan = aiData.choices[0].message.content;
    console.log('Workout plan generated');

    // Generate motivational image
    let motivationImage = null;
    try {
      console.log('Generating motivation image...');
      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: '활기차고 에너지 넘치는 운동 장면을 생성해주세요. 건강하고 강한 모습, 동기부여가 되는 분위기를 표현해주세요.'
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      const imageData = await imageResponse.json();
      if (imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
        motivationImage = imageData.choices[0].message.images[0].image_url.url;
        console.log('Motivation image generated');
      }
    } catch (error) {
      console.error('Image generation error:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        workoutPlan: workoutPlan,
        motivationImage: motivationImage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
