import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured')
    }

    const { prompt, context = "", type = "therapy", aspectRatio = "1:1", style = "professional" } = await req.json()

    if (!prompt?.trim()) {
      return new Response(
        JSON.stringify({ error: "프롬프트를 입력해주세요" }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Enhanced prompt based on context and type
    let enhancedPrompt = prompt.trim()
    
    switch (type) {
      case 'test_result':
        enhancedPrompt = `Professional medical infographic style: ${prompt}. Clean, minimalist design with soft colors, clear typography, suitable for psychological assessment results. High quality, medical illustration style.`
        break
      case 'observation':
        enhancedPrompt = `Child development observation illustration: ${prompt}. Warm, friendly style with soft pastel colors, showing realistic but gentle scenarios. Professional healthcare illustration quality.`
        break
      case 'therapy':
        enhancedPrompt = `Therapeutic social story card: ${prompt}. Calming, supportive illustration with gentle colors and clear visual storytelling. Child-friendly but professional quality.`
        break
      case 'institution':
        enhancedPrompt = `Professional healthcare facility image: ${prompt}. Modern, clean, welcoming medical environment. High-quality architectural photography style.`
        break
      case 'expert_profile':
        enhancedPrompt = `Professional healthcare expert portrait: ${prompt}. Clean, trustworthy, medical professional appearance. Studio photography quality with neutral background.`
        break
      case 'learning_material':
        enhancedPrompt = `Educational illustration for children: ${prompt}. Bright, engaging, child-friendly design with clear visual elements. Educational material quality.`
        break
      case 'emotion_card':
        enhancedPrompt = `Emotion recognition card: ${prompt}. Clear facial expression illustration, educational style, diverse representation, suitable for therapy and learning.`
        break
      default:
        enhancedPrompt = `High-quality illustration: ${prompt}. Professional, clean design suitable for healthcare and educational contexts.`
    }

    if (context) {
      enhancedPrompt += ` Context: ${context}`
    }

    console.log('Generating image with prompt:', enhancedPrompt)

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [{
          role: 'user',
          content: enhancedPrompt
        }],
        modalities: ['image', 'text']
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Lovable AI error:', response.status, errorText)
      throw new Error(`Image generation failed: ${response.status}`)
    }

    const data = await response.json()
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url

    if (!imageUrl) {
      throw new Error('No image generated')
    }

    console.log('Image generated successfully')

    return new Response(
      JSON.stringify({ 
        image: imageUrl,
        enhancedPrompt,
        originalPrompt: prompt,
        type,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in replicate image generation:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '이미지 생성에 실패했습니다. 다시 시도해주세요.',
        details: error instanceof Error ? error.toString() : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})