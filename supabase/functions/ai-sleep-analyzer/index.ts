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
    const { sleepQuality, sleepDuration, bedtime, wakeupTime, sleepIssues, lifestyle } = await req.json()
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    // AI 기반 개인 맞춤형 수면 분석 및 개선 방안
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
            content: `당신은 세계 최고의 수면 전문의이자 AI 수면 컨설턴트입니다. 
            사용자의 수면 데이터를 분석하여 개인 맞춤형 수면 개선 방안을 제공하세요.
            
            현재 수면 데이터:
            - 수면 품질: ${sleepQuality}
            - 수면 시간: ${sleepDuration}
            - 취침 시간: ${bedtime}
            - 기상 시간: ${wakeupTime}
            - 수면 문제: ${sleepIssues || '없음'}
            - 생활 패턴: ${lifestyle}
            
            다음 형식으로 응답하세요:
            1. 현재 수면 패턴 분석
            2. 수면 품질 개선 방법 (5가지)
            3. 맞춤형 취침 루틴 제안
            4. 수면 환경 최적화 방법
            5. 스트레스 관리 및 이완 기법
            6. 라이프스타일 개선 권장사항
            7. 단계별 수면 개선 계획 (4주)
            
            과학적 근거와 함께 실용적인 조언을 제공하세요.`
          }
        ],
        max_completion_tokens: 2000,
        stream: false
      }),
    })

    const data = await response.json()
    console.log('OpenAI sleep response:', data)

    if (!response.ok) {
      throw new Error(data.error?.message || 'AI 수면 분석 중 오류가 발생했습니다')
    }

    const sleepAnalysis = data.choices[0].message.content

    // Replicate API로 편안한 수면 환경 이미지 생성
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (REPLICATE_API_KEY) {
      try {
        const imagePrompt = `Peaceful bedroom environment, cozy sleep sanctuary, soft ambient lighting, comfortable bedding, calming atmosphere, minimalist design, ultra high quality, 4K`
        
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
        console.log('Sleep image response:', imageData)

        return new Response(JSON.stringify({
          sleepAnalysis,
          sleep_environment_image: imageData.urls?.get || null,
          prediction_id: imageData.id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (imageError) {
        console.error('Sleep image error:', imageError)
        return new Response(JSON.stringify({
          sleepAnalysis,
          sleep_environment_image: null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ sleepAnalysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in ai-sleep-analyzer function:', error)
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})