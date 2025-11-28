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
    const { prompt, context, type } = await req.json()

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured')
    }

    // 컨텍스트에 따라 프롬프트 개선
    let enhancedPrompt = prompt
    
    if (type === 'test_result') {
      enhancedPrompt = `Create a beautiful, calming visualization for ${prompt}. Make it professional, therapeutic, and visually appealing with soft colors and clean design. Ultra high resolution.`
    } else if (type === 'observation') {
      enhancedPrompt = `Create an illustration representing ${prompt}. Make it warm, encouraging, and child-friendly with gentle colors. Focus on emotional and developmental themes. Ultra high resolution.`
    } else if (type === 'therapy') {
      enhancedPrompt = `Create a healing and therapeutic image for ${prompt}. Use calming colors, peaceful elements, and professional appearance suitable for mental health contexts. Ultra high resolution.`
    } else if (type === 'institution') {
      enhancedPrompt = `Create a professional logo or icon for ${prompt}. Make it clean, trustworthy, and suitable for a healthcare institution. Simple, modern design with professional colors. Ultra high resolution.`
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

    return new Response(
      JSON.stringify({ 
        image: imageUrl,
        prompt: enhancedPrompt,
        original_prompt: prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error generating image:', error)
    return new Response(
      JSON.stringify({ error: 'Image generation failed', details: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})