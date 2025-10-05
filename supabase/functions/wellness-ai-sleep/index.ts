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
            content: '당신은 수면 전문가입니다. 개인의 수면 패턴을 분석하고 최적의 수면 환경과 습관을 제안합니다.'
          },
          {
            role: 'user',
            content: `다음 정보를 바탕으로 수면 분석 및 개선 계획을 작성해주세요:
            
            - 취침 시간: ${bedtime}
            - 기상 시간: ${wakeupTime}
            - 예상 수면 시간: ${sleepDuration}시간
            - 수면 문제: ${sleepIssues}
            - 분석 날짜: ${new Date().toLocaleDateString('ko-KR')}
            
            다음 형식으로 작성해주세요:
            1. 수면 시간 분석
               - 현재 수면 시간 평가
               - 권장 수면 시간
               - 개선 필요 사항
            
            2. 수면 질 향상 방법 (5가지)
               - 구체적이고 실천 가능한 방법
            
            3. 최적의 수면 환경 조성법
               - 침실 환경
               - 온도, 조명, 소음 관리
            
            4. 수면 전 루틴 추천
               - 시간대별 활동
            
            5. 수면 보조 방법
               - 자연적인 방법
               - 필요시 전문가 상담 권유
            
            6. 수면 개선 예상 효과
            
            과학적 근거를 바탕으로 작성해주세요.`
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
          model: 'google/gemini-2.5-flash-image-preview',
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
