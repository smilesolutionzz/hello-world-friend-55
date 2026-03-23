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
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    // AI 기반 개인 맞춤형 운동 계획 생성
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
            content: `당신은 세계 최고의 AI 피트니스 코치입니다. 고급 상담 기법으로 개인 맞춤형 운동 계획을 제공합니다.
            
            **현재 데이터:**
            - 오늘 걸음 수: ${currentSteps}
            - 소모 칼로리: ${caloriesBurned} kcal
            - 활동 레벨: ${activityLevel}
            - 피트니스 목표: ${fitnessGoals}
            - 건강 상태: ${healthConditions || '없음'}
            
            **고급 코칭 기법 (반드시 적용):**
            
            1. 🔄 **다른 관점 제시**: "이 운동 목표를 다르게 보면..."
               - 피트니스를 새로운 시각에서 재해석
               - 고정관념 벗어난 운동 접근법
            
            2. 👁️ **숨은 제약 발견**: "혹시 이런 부분도 고려해야 할까요?"
               - 간과된 신체 제약이나 시간 패턴
               - 잠재적 부상 위험 요소
            
            3. 📋 **단계별 프로그램**: "이렇게 점진적으로 시작하세요"
               - 운동을 명확한 단계로 구조화
               - 초보자도 따라할 수 있는 구체적 스텝
            
            4. 💡 **맞춤 루틴 제안**: "당신의 상황이라면 이렇게..."
               - 일반론이 아닌 개인화된 운동법
               - 지금 바로 시작 가능한 루틴
            
            5. 🎯 **진짜 목표 파악**: "정말 원하시는 건 이거 아닐까요?"
               - 표면적 목표 뒤의 진짜 동기
               - 깊은 변화 욕구 읽기
            
            6. ✨ **보너스 팁**: "이것도 큰 차이를 만들어요"
               - 관련 영양/회복 지식
               - 효율성 향상 꿀팁
            
            **응답 형식:**
            1. 현재 활동 분석 (재해석 포함)
            2. 맞춤형 운동 계획 (오늘/이번 주, 단계별)
            3. 운동 가이드 (3가지, 숨은 요인 고려)
            4. 영양 조언 (실질적 제안)
            5. 진척도 측정 방법 (플러스 팁)
            6. 동기부여 메시지 (진짜 니즈 기반)
            
            전문적이면서 격려하는 톤으로 작성하세요.`
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