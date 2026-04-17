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

    console.log('🧘 Starting meditation generation...');

    // 1. Generate meditation script with AI
    console.log('📝 Generating meditation script...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-preview',
        messages: [
          {
            role: 'system',
            content: '당신은 전문 명상 가이드입니다. 간결하고 핵심적인 명상 스크립트를 작성하세요.'
          },
          {
            role: 'user',
            content: `오늘의 맞춤 명상 스크립트를 다음 형식으로 작성해주세요 (총 800자 이내):

## 제목
[한 줄 제목]

## 준비 (2분)
[간단한 준비 동작 2-3가지]

## 명상 (5분)
[핵심 명상 가이드, 부드럽고 차분한 톤으로]

## 마무리 (2분)
[마무리 동작 2-3가지]

## 효과
• [효과 1]
• [효과 2]
• [효과 3]`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI script generation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const meditationContent = aiData.choices[0].message.content;
    console.log('✅ Meditation script generated');

    // 2. Generate voice narration with OpenAI TTS
    let audioBase64 = null;
    
    if (OPENAI_API_KEY) {
      try {
        console.log('🎵 Generating voice narration with OpenAI TTS...');
        
        // Extract just the meditation section for narration
        const scriptForVoice = meditationContent.substring(0, 3000);

        const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: 'nova', // Soothing female voice
            input: scriptForVoice,
            response_format: 'mp3',
            speed: 0.9 // Slightly slower for meditation
          }),
        });

        if (!ttsResponse.ok) {
          const errText = await ttsResponse.text();
          console.error('❌ OpenAI TTS error:', errText);
        } else {
          // Convert audio to base64
          const audioArrayBuffer = await ttsResponse.arrayBuffer();
          const audioBytes = new Uint8Array(audioArrayBuffer);
          
          // Convert to base64 string safely
          let binary = '';
          const chunkSize = 0x8000; // 32KB chunks
          for (let i = 0; i < audioBytes.length; i += chunkSize) {
            const chunk = audioBytes.slice(i, Math.min(i + chunkSize, audioBytes.length));
            binary += String.fromCharCode.apply(null, Array.from(chunk));
          }
          audioBase64 = btoa(binary);
          
          console.log('✅ Voice narration generated, size:', audioBytes.length, 'bytes');
        }
      } catch (e) {
        console.error('❌ TTS generation error:', e);
      }
    } else {
      console.warn('⚠️ OPENAI_API_KEY not configured - skipping audio generation');
    }

    // 3. Generate meditation image
    let meditationImage = null;
    try {
      console.log('🎨 Generating meditation image...');
      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3.1-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: '평화롭고 고요한 명상 장면을 생성해주세요. 자연, 조용한 공간, 부드러운 빛이 어우러진 명상하기 좋은 환경을 그려주세요.'
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        if (imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url) {
          meditationImage = imageData.choices[0].message.images[0].image_url.url;
          console.log('✅ Meditation image generated');
        }
      }
    } catch (error) {
      console.error('❌ Image generation error:', error);
    }

    console.log('✨ Meditation generation complete!');
    
    return new Response(
      JSON.stringify({
        success: true,
        content: meditationContent,
        audioContent: audioBase64,
        meditationImage: meditationImage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error:', error);
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
