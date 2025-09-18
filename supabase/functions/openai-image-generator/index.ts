import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured')
    }

    // 컨텍스트에 따라 프롬프트 개선
    let enhancedPrompt = prompt
    
    if (type === 'test_result') {
      enhancedPrompt = `Create a beautiful, calming visualization for ${prompt}. Make it professional, therapeutic, and visually appealing with soft colors and clean design. High quality, detailed artwork.`
    } else if (type === 'observation') {
      enhancedPrompt = `Create an illustration representing ${prompt}. Make it warm, encouraging, and child-friendly with gentle colors. Focus on emotional and developmental themes. High quality, detailed artwork.`
    } else if (type === 'therapy') {
      enhancedPrompt = `Create a healing and therapeutic image for ${prompt}. Use calming colors, peaceful elements, and professional appearance suitable for mental health contexts. High quality, detailed artwork.`
    } else if (type === 'institution') {
      enhancedPrompt = `Create a professional logo or icon for ${prompt}. Make it clean, trustworthy, and suitable for a healthcare institution. Simple, modern design with professional colors. High quality, detailed artwork.`
    }

    console.log('Generating image with DALL-E prompt:', enhancedPrompt)

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        response_format: 'url'
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    
    if (!data.data || !data.data[0]) {
      throw new Error('No image data received from OpenAI')
    }

    // DALL-E 3는 URL로 반환됨
    const imageUrl = data.data[0].url

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
      JSON.stringify({ error: 'Image generation failed', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})