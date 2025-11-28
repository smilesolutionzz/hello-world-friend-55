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
    const { imageData } = await req.json();
    
    if (!imageData) {
      throw new Error('이미지 데이터가 필요합니다');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY가 설정되지 않았습니다');
    }

    console.log('2D 그림을 3D로 변환 시작...');

    // Lovable AI를 사용하여 2D 이미지를 3D 스타일로 변환
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Convert this 2D drawing into a stunning 3D rendered version. Add depth, realistic shading, lighting effects, and make it look like a professional 3D model. Maintain the original drawing\'s style and subject matter, but enhance it with three-dimensional qualities, shadows, highlights, and a sense of volume. Make it visually impressive and lifelike while keeping the essence of the original drawing.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI 오류:', response.status, errorText);
      throw new Error(`AI 변환 실패: ${response.status}`);
    }

    const data = await response.json();
    console.log('3D 변환 완료');

    // 생성된 이미지 추출
    const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!generatedImageUrl) {
      throw new Error('3D 이미지 생성에 실패했습니다');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        image3D: generatedImageUrl,
        message: '2D 그림이 3D로 성공적으로 변환되었습니다!'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('3D 변환 오류:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});