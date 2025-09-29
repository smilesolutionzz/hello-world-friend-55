import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { currentSteps, caloriesBurned, fitnessGoals, activityLevel, healthConditions } = await req.json()
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    // AI 기반 개인 맞춤형 운동 계획 생성
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `당신은 세계 최고의 AI 피트니스 코치입니다. 
            사용자의 현재 활동 데이터를 분석하여 개인 맞춤형 운동 계획을 제공하세요.
            
            현재 데이터:
            - 오늘 걸음 수: ${currentSteps}
            - 소모 칼로리: ${caloriesBurned} kcal
            - 활동 레벨: ${activityLevel}
            - 피트니스 목표: ${fitnessGoals}
            - 건강 상태: ${healthConditions || '없음'}
            
            다음 형식으로 응답하세요:
            1. 현재 활동 분석
            2. 맞춤형 운동 계획 (오늘/이번 주)
            3. 단계별 운동 가이드 (3가지 운동)
            4. 영양 조언
            5. 진척도 측정 방법
            6. 동기부여 메시지
            
            전문적이고 격려하는 톤으로 작성하세요.`
          }
        ],
        max_completion_tokens: 1500,
        stream: false
      }),
    })

    const data = await response.json()
    console.log('OpenAI fitness response:', data)

    if (!response.ok) {
      throw new Error(data.error?.message || 'AI 운동 분석 중 오류가 발생했습니다')
    }

    const workoutPlan = data.choices[0].message.content

    // Replicate API로 운동 동기부여 이미지 생성
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (REPLICATE_API_KEY) {
      try {
        const imagePrompt = `Motivational fitness scene, modern gym environment, energetic workout, healthy lifestyle, vibrant colors, inspiring atmosphere, ultra high quality, 4K`
        
        const imageResponse = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${REPLICATE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
            input: {
              prompt: imagePrompt,
              width: 1024,
              height: 768,
              num_outputs: 1
            }
          })
        })

        const imageData = await imageResponse.json()
        console.log('Fitness image response:', imageData)

        return new Response(JSON.stringify({
          workoutPlan,
          motivation_image: imageData.urls?.get || null,
          prediction_id: imageData.id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (imageError) {
        console.error('Fitness image error:', imageError)
        return new Response(JSON.stringify({
          workoutPlan,
          motivation_image: null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ workoutPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in ai-fitness-coach function:', error)
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})