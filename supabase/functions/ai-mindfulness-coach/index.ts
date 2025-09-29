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
    const { stressLevel, focusLevel, userGoals, currentMood } = await req.json()
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    // AI 기반 개인 맞춤형 명상 가이드 생성
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
            content: `당신은 세계 최고의 마음챙김 및 명상 전문가입니다. 
            사용자의 현재 상태를 분석하여 개인 맞춤형 명상 가이드를 제공하세요.
            - 스트레스 레벨: ${stressLevel}%
            - 집중력 지수: ${focusLevel}%  
            - 현재 기분: ${currentMood}
            - 목표: ${userGoals}
            
            다음 형식으로 응답하세요:
            1. 현재 상태 분석
            2. 맞춤형 명상 기법 추천 (3가지)
            3. 단계별 가이드
            4. 예상 효과
            5. 다음 세션 추천 시간
            
            친근하고 전문적인 톤으로 작성하세요.`
          }
        ],
        max_completion_tokens: 1500,
        stream: false
      }),
    })

    const data = await response.json()
    console.log('OpenAI response:', data)

    if (!response.ok) {
      throw new Error(data.error?.message || 'AI 분석 중 오류가 발생했습니다')
    }

    const analysis = data.choices[0].message.content

    // Replicate API로 명상 이미지 생성
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (REPLICATE_API_KEY) {
      try {
        const imagePrompt = `Peaceful meditation scene, serene nature landscape, soft lighting, calming colors, zen garden, ultra high quality, 4K`
        
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
        console.log('Replicate response:', imageData)

        return new Response(JSON.stringify({
          analysis,
          meditation_image: imageData.urls?.get || null,
          prediction_id: imageData.id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (imageError) {
        console.error('Image generation error:', imageError)
        return new Response(JSON.stringify({
          analysis,
          meditation_image: null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in ai-mindfulness-coach function:', error)
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})