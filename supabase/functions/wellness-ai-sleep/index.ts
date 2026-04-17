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

    const { 
      bedtime = '23:00',
      wakeupTime = '07:00',
      sleepIssues = '없음'
    } = await req.json();

    console.log('Generating personalized sleep analysis...');

    // Calculate sleep duration
    const bedHour = parseInt(bedtime.split(':')[0]);
    const wakeHour = parseInt(wakeupTime.split(':')[0]);
    let sleepDuration = wakeHour - bedHour;
    if (sleepDuration < 0) sleepDuration += 24;

    // Generate sleep analysis with AI
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
            content: '당신은 수면 전문가입니다. 핵심만 간결하게 1000자 이내로 작성하세요.'
          },
          {
            role: 'user',
            content: `오늘 날짜: ${new Date().toLocaleDateString('ko-KR')}
취침: ${bedtime}, 기상: ${wakeupTime}, 수면시간: ${sleepDuration}시간
수면 문제: ${sleepIssues}

수면 분석을 다음 형식으로 1000자 이내로 작성:

## 수면 분석
**총 수면시간:** ${sleepDuration}시간
**평가:** [적정/부족/과다]

## 수면 개선 루틴

**취침 2시간 전**
• [행동 1]
• [행동 2]

**취침 30분 전**
• [행동 1]
• [행동 2]

**아침 기상 후**
• [행동 1]
• [행동 2]

## 수면 환경
• [환경 개선 1]
• [환경 개선 2]
• [환경 개선 3]

## 기대 효과
• [효과 1]
• [효과 2]
• [효과 3]`
          }
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const sleepAnalysis = aiData.choices[0].message.content;
    console.log('Sleep analysis generated');

    // Generate sleep environment image
    let sleepEnvironmentImage = null;
    try {
      console.log('Generating sleep environment image...');
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
              content: '편안하고 평화로운 침실 환경을 생성해주세요. 부드러운 조명, 깔끔한 침구, 차분한 색상으로 완벽한 수면 환경을 표현해주세요.'
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      const imageData = await imageResponse.json();
      if (imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
        sleepEnvironmentImage = imageData.choices[0].message.images[0].image_url.url;
        console.log('Sleep environment image generated');
      }
    } catch (error) {
      console.error('Image generation error:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sleepAnalysis: sleepAnalysis,
        sleepDuration: `${sleepDuration}시간`,
        sleepEnvironmentImage: sleepEnvironmentImage,
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
