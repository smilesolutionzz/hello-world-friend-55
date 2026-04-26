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
    const { dailyCalories, targetCalories, nutritionBalance, dietaryRestrictions, healthGoals } = await req.json()
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    // AI 기반 개인 맞춤형 영양 분석 및 조언
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
            content: `당신은 세계적인 영양학 전문가이자 AI 영양 상담사입니다. 고급 상담 기법으로 개인 맞춤형 영양 조언을 제공합니다.
            
            **현재 데이터:**
            - 일일 섭취 칼로리: ${dailyCalories} kcal
            - 목표 칼로리: ${targetCalories} kcal
            - 영양 균형도: ${nutritionBalance}%
            - 식이 제한사항: ${dietaryRestrictions || '없음'}
            - 건강 목표: ${healthGoals}
            
            **고급 영양 상담 기법 (반드시 적용):**
            
            1. 🔄 **식습관 재해석**: "이 식단을 다르게 보면..."
               - 기존 식습관을 새로운 관점에서
               - 통념 벗어난 영양 접근법
            
            2. 👁️ **숨은 결핍 발견**: "혹시 이런 영양소가 부족하지 않나요?"
               - 간과된 미량 영양소
               - 잠재적 건강 위험 요소
            
            3. 📋 **단계별 식단 계획**: "이렇게 점진적으로 바꿔보세요"
               - 식단 개선을 실행 가능한 단계로
               - 작은 변화부터 시작하는 로드맵
            
            4. 💡 **맞춤 메뉴 제안**: "당신의 상황이라면..."
               - 일반 식단이 아닌 개인화된 메뉴
               - 취향과 제약 고려한 구체적 옵션
            
            5. 🎯 **진짜 목표 파악**: "정말 원하시는 건 이런 건강 아닐까요?"
               - 표면적 목표 뒤의 진짜 건강 욕구
               - 장기적 웰빙 비전
            
            6. ✨ **영양 꿀팁**: "이것도 큰 도움이 될 거예요"
               - 실용적인 조리/보관 팁
               - 영양 흡수 극대화 방법
            
            **응답 형식:**
            1. 현재 영양 상태 분석 (재해석 포함)
            2. 맞춤형 식단 추천 (오늘/이번 주, 단계별)
            3. 부족한 영양소 보충 방법 (숨은 요인)
            4. 다음 식사 메뉴 제안 (3가지 옵션, 실질적)
            5. 건강한 간식 추천 (진짜 니즈 기반)
            6. 수분 섭취 가이드
            7. 장기적 영양 계획 (플러스 팁)
            
            과학적 근거와 함께 친근하게 작성하세요.`
          }
        ],
        max_completion_tokens: 1800,
        stream: false
      }),
    })

    const data = await response.json()
    console.log('OpenAI nutrition response:', data)

    if (!response.ok) {
      throw new Error(data.error?.message || 'AI 영양 분석 중 오류가 발생했습니다')
    }

    const nutritionAdvice = data.choices[0].message.content

    // Replicate API로 건강한 음식 이미지 생성
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    if (REPLICATE_API_KEY) {
      try {
        const imagePrompt = `Healthy nutritious meal, colorful fresh vegetables, balanced diet, clean eating, professional food photography, appetizing presentation, ultra high quality, 4K`
        
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
        console.log('Nutrition image response:', imageData)

        return new Response(JSON.stringify({
          nutritionAdvice,
          meal_image: imageData.urls?.get || null,
          prediction_id: imageData.id
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (imageError) {
        console.error('Nutrition image error:', imageError)
        return new Response(JSON.stringify({
          nutritionAdvice,
          meal_image: null
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ nutritionAdvice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in ai-nutrition-advisor function:', error)
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})