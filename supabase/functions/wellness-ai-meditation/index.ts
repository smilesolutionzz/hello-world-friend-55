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
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
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
    
    // Generate voice narration with ElevenLabs if available
    if (ELEVENLABS_API_KEY && scriptText) {
      try {
        console.log('Generating voice narration...');
        
        // Use shorter text and cheaper model to stay within quota
        const limitedText = scriptText.substring(0, 700); // Much smaller text
        
        const voiceResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x', {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify({
            text: limitedText,
            model_id: 'eleven_turbo_v2_5', // More cost-efficient model
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.7
            }
          }),
        });

        if (voiceResponse.ok) {
          const audioBuffer = await voiceResponse.arrayBuffer();
          // Process audio in chunks to prevent stack overflow
          const uint8Array = new Uint8Array(audioBuffer);
          const chunkSize = 8192;
          let base64Audio = '';
          
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            const chunk = uint8Array.slice(i, i + chunkSize);
            const chunkArray = Array.from(chunk);
            base64Audio += btoa(String.fromCharCode.apply(null, chunkArray));
          }
          
          audioContent = base64Audio;
          console.log('Voice narration generated successfully');
        } else {
          const errorText = await voiceResponse.text();
          console.error('ElevenLabs API error:', errorText);
          
          // Check if it's a quota error
          try {
            const errorData = JSON.parse(errorText);
            if (errorData?.detail?.status === 'quota_exceeded') {
              console.log('ElevenLabs quota exceeded - audio will be null');
            }
          } catch (parseError) {
            console.error('Error parsing ElevenLabs response:', parseError);
          }
        }
      } catch (error) {
        console.error('Voice generation error:', error);
        // Continue without voice if it fails
      }
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
