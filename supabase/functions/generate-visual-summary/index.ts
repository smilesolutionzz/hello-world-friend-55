import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY is not configured')

    const { type, content, therapistType, testType, userName } = await req.json()

    if (!content) {
      return new Response(JSON.stringify({ error: '내용이 필요합니다' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Step 1: Summarize the conversation into structured key points
    const summarizePrompt = type === 'counseling'
      ? `당신은 심리상담 세션 요약 전문가입니다. 상담 대화 내용을 분석하여 인포그래픽에 넣을 구조화된 요약을 만들어주세요.
반드시 아래 JSON 형식만 반환하세요. 마크다운이나 설명 없이 순수 JSON만 반환하세요.`
      : `당신은 심리검사 결과 분석 전문가입니다. 검사 결과를 분석하여 인포그래픽에 넣을 구조화된 요약을 만들어주세요.
반드시 아래 JSON 형식만 반환하세요. 마크다운이나 설명 없이 순수 JSON만 반환하세요.`

    const toolDefinition = {
      type: "function",
      function: {
        name: "create_visual_summary",
        description: "상담/검사 내용을 인포그래픽 요약 구조로 변환",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "요약 제목 (예: '오늘의 상담 요약')" },
            subtitle: { type: "string", description: "부제목 (날짜 또는 검사명)" },
            centerTheme: { type: "string", description: "중심 테마 키워드 (1-3단어)" },
            sections: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string", description: "섹션 제목" },
                  icon: { type: "string", description: "이모지 아이콘" },
                  points: { 
                    type: "array", 
                    items: { type: "string" },
                    description: "핵심 포인트 (각 1-2문장)"
                  },
                  highlight: { type: "string", description: "강조할 핵심 문구 (선택)" }
                },
                required: ["title", "icon", "points"]
              },
              description: "3-5개 섹션"
            },
            keyInsight: { type: "string", description: "핵심 인사이트 한 줄" },
            actionItems: {
              type: "array",
              items: { type: "string" },
              description: "실천 항목 2-3개"
            },
            moodColor: { type: "string", enum: ["violet", "blue", "green", "amber", "rose"], description: "전체 분위기 색상" },
            illustrationPrompt: { type: "string", description: "상담 내용의 감정/주제를 반영한 영어 일러스트 프롬프트. 예: calm ocean with gentle waves, warm family gathering around table" }
          },
          required: ["title", "subtitle", "centerTheme", "sections", "keyInsight", "actionItems", "moodColor", "illustrationPrompt"]
        }
      }
    }

    const userPrompt = type === 'counseling'
      ? `다음은 ${therapistType || 'AI'} 상담 대화 내용입니다. 시각적 요약을 만들어주세요:\n\n${content}`
      : `다음은 ${testType || '심리'} 검사 결과입니다. 시각적 요약을 만들어주세요:\n\n${JSON.stringify(content)}`

    console.log('[generate-visual-summary] Generating summary for:', type)

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: summarizePrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [toolDefinition],
        tool_choice: { type: "function", function: { name: "create_visual_summary" } }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[generate-visual-summary] AI error:', response.status, errorText)
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        })
      }
      throw new Error(`AI error: ${response.status}`)
    }

    const data = await response.json()
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0]
    let summary
    
    if (toolCall?.function?.arguments) {
      summary = JSON.parse(toolCall.function.arguments)
    } else {
      const msgContent = data.choices?.[0]?.message?.content
      if (msgContent) {
        const jsonMatch = msgContent.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          summary = JSON.parse(jsonMatch[0])
        }
      }
    }

    if (!summary) {
      throw new Error('Failed to parse summary from AI response')
    }

    console.log('[generate-visual-summary] Summary parsed, generating illustration...')

    // Step 2: Generate illustration-only image (NO TEXT) for background
    let illustrationImage = null
    try {
      const illustPrompt = summary.illustrationPrompt || 'calm peaceful abstract shapes'
      const bgPrompt = `Create a soft watercolor illustration with NO TEXT at all. The scene: ${illustPrompt}. 
Style: gentle hand-drawn watercolor sketch, pastel colors, dreamy and warm atmosphere, cute doodle elements scattered around edges (hearts, stars, small flowers, butterflies). 
IMPORTANT: Do NOT include ANY text, words, letters, or characters in the image. Pure illustration only. White/light background with illustrations around the borders and corners, leaving the center relatively empty for text overlay. Ultra high resolution.`
      
      const imgResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview-image',
          messages: [{ role: 'user', content: bgPrompt }],
          modalities: ['image', 'text']
        })
      })

      if (imgResponse.ok) {
        const imgData = await imgResponse.json()
        illustrationImage = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url
        console.log('[generate-visual-summary] Illustration image generated successfully')
      } else {
        console.error('[generate-visual-summary] Image generation failed:', imgResponse.status)
      }
    } catch (imgErr) {
      console.error('[generate-visual-summary] Image generation error:', imgErr)
    }

    console.log('[generate-visual-summary] Complete')

    return new Response(JSON.stringify({
      summary,
      illustrationImage,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('[generate-visual-summary] Error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : '요약 생성에 실패했습니다.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})