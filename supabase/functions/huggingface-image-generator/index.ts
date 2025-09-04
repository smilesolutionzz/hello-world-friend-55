import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

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

    const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!hfToken) {
      throw new Error('HUGGING_FACE_ACCESS_TOKEN is not configured')
    }

    const hf = new HfInference(hfToken)

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

    const image = await hf.textToImage({
      inputs: enhancedPrompt,
      model: 'black-forest-labs/FLUX.1-schnell',
    })

    // Convert the blob to a base64 string
    const arrayBuffer = await image.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    return new Response(
      JSON.stringify({ 
        image: `data:image/png;base64,${base64}`,
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