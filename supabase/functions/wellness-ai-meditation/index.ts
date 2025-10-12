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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    
    if (!OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not configured - audio narration will be unavailable');
    }

    console.log('Generating AI meditation content...');

    // Generate meditation script with AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: '당신은 전문 명상 가이드입니다. 핵심만 간결하게 1000자 이내로 작성하세요.'
          },
          {
            role: 'user',
            content: `오늘 날짜: ${new Date().toLocaleDateString('ko-KR')}
            
명상 스크립트를 다음 형식으로 1000자 이내로 작성:

## 제목
[한 줄 제목]

## 준비 (3분)
[간단한 준비 동작 3-4가지]

## 명상 (5분)
[핵심 명상 가이드, 부드럽게]

## 마무리 (2분)
[마무리 동작]

## 효과
• [효과 1]
• [효과 2]
• [효과 3]`
          }
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const meditationContent = aiData.choices[0].message.content;
    console.log('AI meditation content generated');

    // Extract script portion for voice generation
    const scriptMatch = meditationContent.match(/2\. 스크립트:([\s\S]*?)(?=3\.|$)/);
    const scriptText = scriptMatch ? scriptMatch[1].trim() : meditationContent;

    let audioContent = null;
    
    // Generate voice narration with OpenAI TTS
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (OPENAI_API_KEY && scriptText) {
      try {
        console.log('Generating voice narration with OpenAI TTS...');
        const limitedText = scriptText.substring(0, 4000); // OpenAI TTS can handle more text

        const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: 'nova', // Changed to 'nova' for a more soothing voice
            input: limitedText,
            response_format: 'mp3',
          }),
        });

        if (!ttsResponse.ok) {
          const errText = await ttsResponse.text();
          console.error('OpenAI TTS error:', errText);
          throw new Error(`OpenAI TTS failed: ${errText}`);
        }

        const arrayBuffer = await ttsResponse.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        // Convert to base64 in chunks to avoid memory issues
        const chunkSize = 8192;
        let base64 = '';
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.slice(i, i + chunkSize);
          const chunkArray = Array.from(chunk);
          base64 += btoa(String.fromCharCode.apply(null, chunkArray));
        }
        
        audioContent = base64;
        console.log('OpenAI TTS audio generated successfully, size:', bytes.length);
      } catch (e) {
        console.error('OpenAI TTS exception:', e);
      }
    } else {
      console.log('OPENAI_API_KEY not configured or no script text; skipping audio generation');
    }

    // Generate meditation image
    let meditationImage = null;
    try {
      console.log('Generating meditation image...');
      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: '평화롭고 고요한 명상 장면을 생성해주세요. 자연, 조용한 공간, 부드러운 빛이 어우러진 명상하기 좋은 환경을 그려주세요.'
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      const imageData = await imageResponse.json();
      if (imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
        meditationImage = imageData.choices[0].message.images[0].image_url.url;
        console.log('Meditation image generated');
      }
    } catch (error) {
      console.error('Image generation error:', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        content: meditationContent,
        audioContent: audioContent,
        meditationImage: meditationImage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
