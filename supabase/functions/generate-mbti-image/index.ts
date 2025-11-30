import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mbtiType, description } = await req.json();
    
    if (!mbtiType || !description) {
      throw new Error('MBTI type and description are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Generate two images representing the MBTI type
    const prompts = [
      `A realistic photo of someone displaying ${mbtiType} personality traits in everyday life. Show them ${description.strengths[0].toLowerCase()} in a natural setting. Modern Korean aesthetic, candid moment, natural lighting, high quality photography. Ultra high resolution.`,
      `A natural scene capturing the essence of ${mbtiType} personality. Focus on ${description.loveStyle.split('.')[0].toLowerCase()}. Real life situation, authentic moment, contemporary Korean style, professional photography. Ultra high resolution.`
    ];

    const imagePromises = prompts.map(async (prompt) => {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image generation error:', response.status, errorText);
        throw new Error(`Failed to generate image: ${response.status}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageUrl) {
        console.error('No image in response:', data);
        throw new Error('No image generated');
      }

      return imageUrl;
    });

    const images = await Promise.all(imagePromises);

    return new Response(
      JSON.stringify({ images }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in generate-mbti-image:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});