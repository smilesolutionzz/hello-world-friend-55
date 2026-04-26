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
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not set')
    }

    // AI 기반 개인 맞춤형 명상 가이드 생성
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `당신은 세계 최고의 마음챙김 및 명상 전문가입니다. 고급 AI 상담 기법으로 개인 맞춤형 명상 가이드를 제공합니다.
            
            **현재 사용자 상태:**
            - 스트레스 레벨: ${stressLevel}%
            - 집중력 지수: ${focusLevel}%  
            - 현재 기분: ${currentMood}
            - 목표: ${userGoals}
            
            **고급 상담 기법 (반드시 적용):**
            
            1. 🔄 **재해석 제공**: "이 스트레스를 다르게 보면..."
               - 부정적 감정을 새로운 관점에서 재해석
               - 통념에서 벗어난 마음챙김 접근
            
            2. 👁️ **숨은 요인 발견**: "혹시 이런 감정도 있지 않으세요?"
               - 표면 아래 숨겨진 감정 요인
               - 간과된 신체 감각이나 생각 패턴
            
            3. 📋 **단계별 가이드**: "이렇게 차근차근 해보세요"
               - 명상을 구체적 단계로 나눔
               - 초보자도 따라할 수 있는 명확한 스텝
            
            4. 💡 **실질적 제안**: "제가 이 상황이라면..."
               - 일반론이 아닌 개인화된 명상법
               - 지금 당장 실천 가능한 기법
            
            5. 🎯 **진짜 니즈 파악**: "진짜 원하시는 건 이 부분 같아요"
               - 표면적 목표 뒤의 진짜 바람
               - 깊은 내면의 욕구 읽기
            
            6. ✨ **플러스 팁**: "이것도 도움될 거예요"
               - 관련 마음챙김 지식
               - 일상 적용 팁
            
            **응답 형식:**
            1. 현재 상태 분석 (재해석 포함)
            2. 맞춤형 명상 기법 추천 (3가지, 단계별)
            3. 실천 가이드 (숨은 요인 고려)
            4. 예상 효과 (실질적 관점)
            5. 다음 세션 추천 시간 (플러스 팁)
            
            친근하면서도 깊이 있게 작성하세요.`
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