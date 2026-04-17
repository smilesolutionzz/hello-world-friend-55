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

    const requestBody = await req.json();
    
    const { 
      dietaryRestrictions = '없음', 
      healthGoals = '건강한 체중 유지',
      allergies = '없음'
    } = requestBody;

    // Input validation
    if (typeof dietaryRestrictions !== 'string' || dietaryRestrictions.length > 500) {
      throw new Error('Invalid dietary restrictions (max 500 characters)');
    }

    if (typeof healthGoals !== 'string' || healthGoals.length > 500) {
      throw new Error('Invalid health goals (max 500 characters)');
    }

    if (typeof allergies !== 'string' || allergies.length > 500) {
      throw new Error('Invalid allergies (max 500 characters)');
    }

    // Sanitize inputs to prevent prompt injection
    const sanitize = (text: string) => text.replace(/[<>{}]/g, '').trim();
    
    const safeDietaryRestrictions = sanitize(dietaryRestrictions);
    const safeHealthGoals = sanitize(healthGoals);
    const safeAllergies = sanitize(allergies);

    console.log('Generating personalized nutrition plan...');

    // Generate nutrition plan with AI
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
            content: '당신은 전문 영양사입니다. 핵심만 간결하게 1000자 이내로 작성하세요.'
          },
          {
            role: 'user',
            content: `오늘 날짜: ${new Date().toLocaleDateString('ko-KR')}
식이제한: ${safeDietaryRestrictions}, 목표: ${safeHealthGoals}, 알레르기: ${safeAllergies}

영양 플랜을 다음 형식으로 1000자 이내로 작성:

## 오늘의 식단

**아침**
• [메뉴] - [칼로리]

**점심**
• [메뉴] - [칼로리]

**저녁**
• [메뉴] - [칼로리]

**간식**
• [간식] - [칼로리]

## 추천 영양제
• [영양제 1]: [이유]
• [영양제 2]: [이유]
• [영양제 3]: [이유]

## 식단 포인트
• [포인트 1]
• [포인트 2]
• [포인트 3]`
          }
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const nutritionPlan = aiData.choices[0].message.content;
    console.log('Nutrition plan generated');

    // Generate meal image
    let mealImage = null;
    try {
      console.log('Generating meal image...');
      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3.1-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: '건강하고 균형잡힌 식사 이미지를 생성해주세요. 다채로운 채소, 단백질, 곡물이 포함된 아름답고 맛있어 보이는 한 끼 식사를 표현해주세요.'
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      const imageData = await imageResponse.json();
      if (imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
        mealImage = imageData.choices[0].message.images[0].image_url.url;
        console.log('Meal image generated');
      }
    } catch (error) {
      console.error('Image generation error:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        nutritionPlan: nutritionPlan,
        mealImage: mealImage,
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
